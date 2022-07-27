import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import Pembelian from 'App/Models/transaksi/Pembelian'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { DateTime } from 'luxon'
import User from 'App/Models/User'
var isBase64 = require('is-base64')
import Drive from '@ioc:Adonis/Core/Drive'
import StatusGadai from 'App/Models/transaksi/StatusGadai'
import Gadai from 'App/Models/transaksi/Gadai'
import TipeNotif from 'App/Models/sistem/TipeNotif'

export default class GadaisController {
  public async index ({ view, request }: HttpContextContract) {
    const opsiOrder = [
      'gadais.tanggal_tenggat',
      'gadais.nama_penggadai',
      'status_gadais.status',
      'gadais.nominal_gadai',
      'gagais.dilunasi_at',
    ]
    const page = request.input('page', 1)
    const order = request.input('ob', 0)
    const cari = request.input('cari', '')
    const sanitizedOrder = order < opsiOrder.length && order >= 0 && order ? order : 0
    const arahOrder = request.input('aob', 0)
    const sanitizedArahOrder = arahOrder == 1 ? 1 : 0
    const filterShow = request.input('fs', 0)
    const sanitizedFilterShow = filterShow == 1 ? 1 : 0
    const limit = 10

    const gadais = await Database.from('gadais')
      .join('status_gadais', 'gadais.status_gadai_id', 'status_gadais.id')
      .whereNull('gadais.deleted_at')
      .select(
        'gadais.id as id',
        'gadais.tanggal_tenggat as tanggalTenggat',
        'gadais.nama_penggadai as namaPenggadai',
        'gadais.alamat_penggadai as alamatPenggadai',
        'gadais.nominal_gadai as nominalGadai',
        'status_gadais.status as status',
        )
      .if(cari !== '', (query) => {
        query.where('gadais.nama_penggadai', 'like', `%${cari}%`)
      })
      .if(sanitizedFilterShow == 0, (query) => {
        // kalau ngga ada fs, defaultnya cuma nampilin yang belom tuntas (berjalan ama terlambat)
        query
          .where((query) => {
            // harus diginiin ternyata kalau mau bikin OR logic didalem AND
            query.where('status_gadais.status', 'berjalan').orWhere('status_gadais.status', 'terlambat')
          })
          .andWhereNull('gadais.dilunasi_at')
      })
      .orderBy(opsiOrder[sanitizedOrder], ((sanitizedArahOrder == 1) ? 'desc' : 'asc'))
      .orderBy('gadais.tanggal_tenggat')
      .paginate(page, limit)

    gadais.baseUrl('/app/transaksi/gadai')

    let qsParam = {
      ob: sanitizedOrder,
      aob: sanitizedArahOrder
    }

    if (cari !== '') qsParam['cari'] = cari
    if (sanitizedFilterShow !== 0) qsParam['fs'] = sanitizedFilterShow

    gadais.queryString(qsParam)

    let firstPage =
      gadais.currentPage - 2 > 0 ?
      gadais.currentPage - 2 :
      gadais.currentPage - 1 > 0 ?
      gadais.currentPage - 1 :
      gadais.currentPage
    let lastPage =
      gadais.currentPage + 2 <= gadais.lastPage ?
      gadais.currentPage + 2 :
      gadais.currentPage + 1 <= gadais.lastPage ?
      gadais.currentPage + 1 :
      gadais.currentPage

    if (lastPage - firstPage < 4 && gadais.lastPage > 4) {
      if (gadais.currentPage < gadais.firstPage + 2) {
        lastPage += 4 - (lastPage - firstPage)
      }

      if (lastPage == gadais.lastPage) {
        firstPage -= 4 - (lastPage - firstPage)
      }
    }
    // sampe sini
    const tempLastData = 10 + ((gadais.currentPage - 1) * limit)

    const tanggalRefresh = await Database
      .from('refresh_gadais')
      .select('direfresh_at as direfreshAt')
      .orderBy('id', 'desc')
      .first()

    const tambahan = {
      pengurutan: sanitizedOrder,
      pencarian: cari,
      filterShow: sanitizedFilterShow,
      firstPage: firstPage,
      lastPage: lastPage,
      firstDataInPage: 1 + ((gadais.currentPage - 1) * limit),
      lastDataInPage: (tempLastData >= gadais.total) ? gadais.total : tempLastData,
      direfreshAt: (tanggalRefresh && tanggalRefresh.direfreshAt)? tanggalRefresh.direfreshAt : null
    }

    const fungsi = {
      rupiahParser: rupiahParser,
      potongTeks: potongTeks
    }

    return await view.render('transaksi/gadai/list-gadai', {
      gadais,
      tambahan,
      fungsi
    })
  }

  public async formulirGadai ({ view, request, response, session }: HttpContextContract) {
    let tid = request.input('tid', '')

    try {
      const pembelian = await Pembelian
        .query()
        .where('id', tid)
        .where('apakah_digadaikan', true)
        .whereNull('deleted_at')
        .preload('model', (query) => {
          query.preload('bentuk')
        })
        .preload('kodeProduksi', (query) => {
          query.preload('kadar')
        })
        .preload('pembelianNotaLeo')
        .firstOrFail()


      if(!pembelian.apakahDigadaikan) throw 'gaboleh'
      if(pembelian.digadaiAt || pembelian.maxGadaiAt < DateTime.now()) throw 'gaboleh'


      let potongan = 0
      let teksPotongan = ''
      if(pembelian.pembelianNotaLeo){
        potongan = pembelian.pembelianNotaLeo.ongkosPotonganTotal
        teksPotongan = (pembelian.pembelianNotaLeo.apakahPotonganPersen)? `${pembelian.pembelianNotaLeo.potonganPadaNota}% harga jual` : `${rupiahParser(pembelian.pembelianNotaLeo.potonganPadaNota)} per gram`
      }
      
      const fungsi = {
        rupiahParser: rupiahParser,
        kapitalHurufPertama: kapitalHurufPertama
      }

      const tambahan = {
        totalKerusakan: -Math.abs(pembelian.ongkosKerusakanTotal),
        totalPotongan: -Math.abs(potongan),
        teksPotongan: teksPotongan
      }
      
      return await view.render('transaksi/gadai/form-gadai', { pembelian, fungsi, tambahan })

    } catch (error) {
      session.flash('alertError', 'Pembelian yang akan anda gadaikan tidak valid, tidak memenuhi syarat gadai, atau telah digadaikan sebelumnya!')
      return response.redirect().toPath('/app/transaksi/gadai')
    }
  }

  public async store ({ request, auth, session, response }: HttpContextContract) {
    const newGadaiSchema = schema.create({
      // ini id pembelian
      id: schema.number([
        rules.unsigned(),
        rules.exists({
          table: 'pembelians',
          column: 'id',
          where: {
            deleted_at: null,
            // karena agak ribet, syarat laen gw taro dibawah
          },
        }),
      ]),
      namaPenggadai: schema.string({ trim: true }, [rules.maxLength(50)]),
      nikPenggadai: schema.string({ trim: true }, [rules.maxLength(16)]),
      alamatPenggadai: schema.string({ trim: true }, [rules.maxLength(100)]),
      noHpAktif: schema.string({ trim: true }, [rules.maxLength(15)]),

      fotoKTPBase64: schema.string(),
      tanggalTenggat: schema.date({}, [
        rules.afterOrEqual('today')
      ]),
      keterangan: schema.string.optional({ trim: true }, [rules.maxLength(100)]),
    })

    const validrequest = await request.validate({ schema: newGadaiSchema })

    const lastPenjualan = await Database
      .from('penjualans')
      .select('id')
      .orderBy('id', 'desc')
      .limit(1)

    let latestId = '001'

    if(lastPenjualan[0]){
      latestId = tigaDigit(lastPenjualan[0].id + 1)
    }

    try {
      // -------- cek auth user ----------
      if(!auth.user) throw 'auth ngga valid'
      
      const userPengakses = await User.findOrFail(auth.user.id)
      await userPengakses.load('pengguna')

      // -------- cek ke validan id pembelian ----------
      const pembelian = await Pembelian.findOrFail(validrequest.id)

      if(!pembelian.apakahDigadaikan) throw {
        custom: true,
      }

      if(pembelian.digadaiAt || pembelian.maxGadaiAt < DateTime.now()) throw {
        custom: true
      }

      // --------------- Foto -------------------
      let namaFileFoto = ''
      let fileFoto = validrequest.fotoKTPBase64 || ''

      try {
        if (!isBase64(fileFoto, { mimeRequired: true, allowEmpty: false }) || fileFoto === '') {
          throw new Error('Input foto barang tidak valid!')
        }

        var block = fileFoto.split(';')
        var realData = block[1].split(',')[1] // In this case "iVBORw0KGg...."
        namaFileFoto = 'GD' + DateTime.now().toMillis() + latestId + '.jpg' // bisa diganti yang lebih propper

        // ntar di resize buffernya pake sharp dulu jadi 300x300
        const buffer = Buffer.from(realData, 'base64')
        await Drive.put('transaksi/gadai/katepe/' + namaFileFoto, buffer)
      } catch (error) {

        throw {
          custom: true,
          foto: true,
          error: 'Input foto barang tidak valid!'
        }
      }

      const status = await StatusGadai.findByOrFail('status', 'berjalan')

      const gadai = await pembelian.related('gadai').create({
        tanggalTenggat: validrequest.tanggalTenggat,
        namaPenggadai: validrequest.namaPenggadai,
        nikPenggadai: validrequest.nikPenggadai,
        fotoKtpPenggadai: namaFileFoto,
        alamatPenggadai: validrequest.alamatPenggadai,
        nohpPenggadai: validrequest.noHpAktif,
        nominalGadai: pembelian.hargaBeliAkhir, // keknya buat sekarang nominalnya harus sama ama penjualan
        keterangan: validrequest.keterangan,
        statusGadaiId: status.id,
        penggunaId: userPengakses.pengguna.id,
      })

      pembelian.digadaiAt = DateTime.now()
      await pembelian.save()

      return response.redirect().toPath('/app/transaksi/gadai/' + gadai.id)
      
    } catch (error) {

      if(error.custom){
        if(error.foto){
          session.flash('errors', {
            fotoKTPBase64: error.error
          })
        } else {
          session.flash('alertError', 'Pembelian yang akan anda gadaikan tidak valid, tidak memenuhi syarat gadai, atau telah digadaikan sebelumnya!')
          return response.redirect().toPath('/app/transaksi/gadai')
        }
      } else {
        session.flash('alertError', 'Ada masalah saat menyimpan data gadai. Silahkan coba lagi setelah beberapa saat.')
      }

      return response.redirect().withQs().back()
    }
  }

  public async show ({ view, response, session, params }: HttpContextContract) {
    try {
      let gadai = await Gadai.findOrFail(params.id)
      await gadai.load('pembelian', (query) => {
        query.preload('model', (moQuery)=>{
          moQuery.preload('bentuk')
        })

        query.preload('kodeProduksi', (koQuery)=>{
          koQuery.preload('kadar')
        })
      })
      await gadai.load('pengguna', (query) => {
        query.preload('jabatan')
      })
      await gadai.load('statusGadai')
      await gadai.load('pembayaranGadais')
      

      // Get today's date and time
      var countDownDate = gadai.tanggalTenggat.startOf('day')
      var now = DateTime.now().startOf('day')
      var jarakHari = countDownDate.diff(now, ['days']).toObject().days
      
      let terbayar = 0
      for (const bayar of gadai.pembayaranGadais) {
        terbayar += bayar.nominal
      }

      let fungsi = {
        rupiahParser: rupiahParser,
        kapitalHurufPertama: kapitalHurufPertama
      }
      let tambahan = {
        jarakHari: jarakHari,
        terbayar
      }

      return await view.render('transaksi/gadai/view-gadai', { gadai, fungsi, tambahan })

    } catch (error) {
      console.error('error show')
      console.error(error)
      session.flash('alertError', 'Gadai yang anda akses tidak valid atau terhapus.')
      return response.redirect().toPath('/app/transaksi/gadai/')
    }
  }

  public async edit ({}: HttpContextContract) {
  }

  public async update ({}: HttpContextContract) {
  }

  public async destroy ({ response, session, params }: HttpContextContract) {
    try {
      const gadai = await Gadai.findOrFail(params.id)
      const statusBaru = await StatusGadai.findByOrFail('status', 'dibatalkan')

      // ------------ set kalo dibatalin -------------------
      // di delete ngga ya?
      gadai.dilunasiAt = null
      gadai.statusGadaiId = statusBaru.id
      gadai.keterangan += ' Gadai dibatalkan.'

      // ------------ hapus nik sama foto ktp --------------
      gadai.nikPenggadai = '0' // ngga bisa null, yaudah dibikin 0
      await Drive.delete('transaksi/gadai/katepe/' + gadai.fotoKtpPenggadai) // gaperlu try-catch
      gadai.fotoKtpPenggadai = null

      await gadai.save()

      return response.redirect().toPath('/app/transaksi/gadai/')
    } catch (error) {
      session.flash('alertError', 'Ada masalah saat membatalkan gadai. Silahkan coba lagi setelah beberapa saat.')
      return response.redirect().back()
    }
  }

  public async refreshGadai ({ response }: HttpContextContract) {

    const gadais = await Database
      .from('gadais')
      .join('status_gadais', 'gadais.status_gadai_id', 'status_gadais.id')
      .select('gadais.id')
      .whereNull('gadais.deleted_at')
      // .andWhere('gadais.tanggal_tenggat', '<=', DateTime.now().toISO())
      .whereRaw('DATE(gadais.tanggal_tenggat) < DATE(NOW())')
      .andWhere('status_gadais.status', 'berjalan')

    let counter = 0

    for (const elemen of gadais) {
      try {
        const gadai = await Gadai.findOrFail(elemen.id)
        const statusTarget = await StatusGadai.findByOrFail('status', 'terlambat')

        gadai.statusGadaiId = statusTarget.id
        await gadai.save()

        counter++
      } catch (error) {
        // kalo ada error, dikacangin
      }
    }

    if(counter > 0){
      let notifGadai = await TipeNotif.findByOrFail('nama', 'Gadai')
      let sintaksJudul = notifGadai.sintaksJudul.replace('{jumlah}', counter.toString())

      let penggunaPenting = await Database
        .from('penggunas')
        .join('jabatans', 'penggunas.jabatan_id', 'jabatans.id')
        .where('jabatans.nama', 'Kepala Toko')
        .orWhere('jabatans.nama', 'Pemilik')
        .select('penggunas.id')
        .whereNull('deleted_at')


      for (const element of penggunaPenting) {
        await notifGadai.related('notifikasis').create({
          isiNotif: sintaksJudul,
          penggunaId: element.id,
          urlTujuan: '/app/transaksi/gadai'
        })
      }
    }

    // ini query buat ngasi tau kapan terakhir dicek
    await Database
      .insertQuery()
      .table('refresh_gadais')
      .insert({ direfresh_at: DateTime.now().toSQL() })

  
    return response.ok({message: 'Refresh berhasil, ' + counter + ' data diperbarui', jumlah: counter})
  }

  public async getNIK ({ params, response }: HttpContextContract) {
    try {
      const gadai = await Gadai.findOrFail(params.id)
      return {nik: gadai.nikPenggadai}

    } catch (error) {
      return response.badRequest({error: 'Gadai tidak ditemukan.'})
    }
  }



}


function rupiahParser(angka: number) {
  if (typeof angka == 'number') {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(angka)
  } else {
    return 'error'
  }
}

function kapitalHurufPertama(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

function tigaDigit(angka: number){
  let teks = angka.toString()
  let finalTeks = teks
  if(teks.length == 2) finalTeks = '0' + teks
  if(teks.length <= 1) finalTeks = '00' + teks

  return finalTeks
}

function potongTeks(teks: string, max: number = 30){
  return teks.slice(0, max) + ((teks.length > max)? '...' : '')
}