import {
  HttpContextContract
} from '@ioc:Adonis/Core/HttpContext'
import Ka from 'App/Models/kas/Ka'
import Database from '@ioc:Adonis/Lucid/Database'
import {
  DateTime
} from 'luxon'
import Pengaturan from 'App/Models/sistem/Pengaturan'
import {
  schema,
  rules
} from '@ioc:Adonis/Core/Validator'
import RekapHarian from 'App/Models/kas/RekapHarian'
import CPasaran from 'App/CustomClasses/CPasaran'
import Drive from '@ioc:Adonis/Core/Drive'

export default class KasController {
  rupiahParser(angka: number) {
    if (typeof angka == 'number') {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
      }).format(angka)
    }
  }


  public async index({
    view,
    request
  }: HttpContextContract) {
    const tanggalSekarang = DateTime.now()
    const opsiOrder = [
      'kas.created_at',
      'kas.nominal',
      'kas.perihal',
      'kas.apakah_kas_keluar',
    ]
    const page = request.input('page', 1)
    const order = request.input('ob', 0)
    const arahOrder = request.input('aob', 0)
    const sanitizedOrder = order < opsiOrder.length && order >= 0 && order ? order : 0
    const sanitizedArahOrder = arahOrder == 1 ? 1 : 0
    const cari = request.input('cari', '')
    const limit = 10

    let kass = await Database
      .from('kas')
      .select(
        'kas.id',
        'kas.apakah_kas_keluar as apakahKasKeluar',
        'kas.nominal',
        'kas.perihal',
        'kas.created_at as createdAt',
      )
      .whereNull('kas.deleted_at')
      .whereRaw('DATE(kas.created_at) = DATE(?)', [tanggalSekarang.toISO()])
      .if(cari !== '', (query) => {
        query.where('kas.perihal', 'like', `%${cari}%`)
      })
      .orderBy(opsiOrder[sanitizedOrder], ((sanitizedArahOrder == 1) ? 'desc' : 'asc'))
      .orderBy('kas.created_at', 'asc')
      .paginate(page, limit)

    kass.baseUrl('/app/kas/')

    const qsParam = {
      ob: sanitizedOrder,
      aob: sanitizedArahOrder
    }

    kass.queryString(qsParam)

    let firstPage =
      kass.currentPage - 2 > 0 ?
      kass.currentPage - 2 :
      kass.currentPage - 1 > 0 ?
      kass.currentPage - 1 :
      kass.currentPage
    let lastPage =
      kass.currentPage + 2 <= kass.lastPage ?
      kass.currentPage + 2 :
      kass.currentPage + 1 <= kass.lastPage ?
      kass.currentPage + 1 :
      kass.currentPage

    if (lastPage - firstPage < 4 && kass.lastPage > 4) {
      if (kass.currentPage < kass.firstPage + 2) {
        lastPage += 4 - (lastPage - firstPage)
      }

      if (lastPage == kass.lastPage) {
        firstPage -= 4 - (lastPage - firstPage)
      }
    }

    const tempLastData = 10 + (kass.currentPage - 1) * limit

    const totalKasMasuk = await Database
      .from('kas')
      .sum('nominal', 'nominal')
      .whereNull('deleted_at')
      .andWhere('apakah_kas_keluar', 0)
      .andWhereRaw('DATE(created_at) = DATE(?)', [tanggalSekarang.toISO()])

    const totalKasKeluar = await Database
      .from('kas')
      .sum('nominal', 'nominal')
      .whereNull('deleted_at')
      .andWhere('apakah_kas_keluar', 1)
      .andWhereRaw('DATE(created_at) = DATE(?)', [tanggalSekarang.toISO()])

    const totalJual = await Database
      .from('penjualans')
      .sum('harga_jual_akhir', 'nominal')
      .whereNull('deleted_at')
      .whereRaw('DATE(created_at) = DATE(?)', [tanggalSekarang.toISO()])

    const totalBeli = await Database
      .from('pembelians')
      .sum('harga_beli_akhir', 'nominal')
      .whereNull('deleted_at')
      .whereRaw('DATE(created_at) = DATE(?)', [tanggalSekarang.toISO()])

    const rekapPenjualan = {
      apakahKasKeluar: 0,
      nominal: totalJual[0].nominal | 0,
      perihal: 'Penjualan Barang',
      namaPencatat: 'Sistem',
      createdAt: tanggalSekarang
    }

    const rekapPembelian = {
      apakahKasKeluar: 1,
      nominal: -totalBeli[0].nominal | 0,
      perihal: 'Pembelian Barang',
      namaPencatat: 'Sistem',
      createdAt: tanggalSekarang
    }

    const pengaturan = await Pengaturan.findOrFail(1)

    const fungsi = {
      rupiahParser: this.rupiahParser
    }

    const tambahan = {
      totalKasMasuk: totalKasMasuk[0].nominal + rekapPenjualan.nominal,
      totalKasKeluar: totalKasKeluar[0].nominal + rekapPembelian.nominal,
      totalSaldoToko: pengaturan.saldoToko,
      pengurutan: sanitizedOrder,
      pencarian: cari,
      firstPage: firstPage,
      lastPage: lastPage,
      firstDataInPage: 1 + (kass.currentPage - 1) * limit,
      lastDataInPage: tempLastData >= kass.total ? kass.total : tempLastData,
    }

    // return { tambahan, kass, tes: this.rupiahParser(tambahan.totalKasKeluar) }

    return view.render('kas/list-kas', {
      tambahan,
      kass,
      fungsi,
      rekapPenjualan,
      rekapPembelian
    })
  }

  public async create({
    view
  }: HttpContextContract) {
    return view.render('kas/form-kas')
  }

  public async store({
    request,
    response,
    session
  }: HttpContextContract) {
    const newKasSchema = schema.create({
      tipeKas: schema.enum([
          'keluar',
          'masuk',
        ] as
        const),
      nominal: schema.number([rules.unsigned()]),
      perihal: schema.string({
        trim: true
      }, [rules.maxLength(100)]),
    })

    const validrequest = await request.validate({
      schema: newKasSchema
    })

    /** Mulai dari sini wajib banget */
    const CP = new CPasaran()
    const pasaranSekarang = CP.pasaranHarIni()

    let pengaturan = await Pengaturan.findOrFail(1) // ntar diganti jadi ngecek toko aktif di session
    await pengaturan.load('pasarans')

    let apakahPasaran = false
    for (const element of pengaturan.pasarans) {
      if (element.hari === pasaranSekarang) {
        apakahPasaran = true
        break
      }
    }

    let cariRH = await RekapHarian.findBy('tanggal_rekap', DateTime.local().set({
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0
    }).toSQL())

    if (!cariRH) {
      cariRH = await RekapHarian.create({
        pasaran: pasaranSekarang,
        apakahHariPasaran: apakahPasaran,
        tanggalRekap: DateTime.local().set({
          hour: 0,
          minute: 0,
          second: 0,
          millisecond: 0
        })
      })
    }
    /** Sampe sini. Kepake buat ngecek udah ada rekap harian apa blom */

    let placeholderPengguna = 1 // ini harusnya ngambil dari current active session
    let cek = (validrequest.tipeKas === 'keluar')

    try {
      if (cek) {
        pengaturan.saldoToko -= validrequest.nominal
      } else {
        pengaturan.saldoToko += validrequest.nominal
      }
      await pengaturan.save()


      await cariRH.related('kas').create({
        apakahKasKeluar: cek,
        nominal: (cek) ? -Math.abs(validrequest.nominal) : Math.abs(validrequest.nominal),
        perihal: kapitalHurufPertama(validrequest.perihal),
        penggunaId: placeholderPengguna
      })

      session.flash('alertSukses', 'Pembukuan kas baru berhasil disimpan!')

      return response.redirect().toPath('/app/kas')
    } catch (error) {
      console.error(error)
      session.flash('alertError', 'Kas yang anda pilih tidak valid!')
      return response.redirect().back()
    }
  }

  public async show({
    view,
    response,
    params,
    session
  }: HttpContextContract) {
    try {
      const kas = await Ka.findOrFail(params.id)
      await kas.load('pengguna', (query) => {
        query.preload('jabatan')
      })
      await kas.load('rekapHarian')

      const urlPencatat = (await Drive.exists('profilePict/' + kas.pengguna.foto)) ? (await Drive.getUrl('profilePict/' + kas.pengguna.foto)) : ''


      const fungsi = {
        rupiahParser: this.rupiahParser,
      }

      const tambahan = {
        urlFotoPencatat: urlPencatat
      }

      return view.render('kas/view-kas', {
        kas,
        fungsi,
        tambahan
      })

    } catch (error) {
      session.flash('alertError', 'Kas yang anda pilih tidak valid!')
      return response.redirect().toPath('/app/kas/')
    }
  }

  public async edit({
    params,
    view,
    session,
    response
  }: HttpContextContract) {
    try {
      const kas = await Ka.findOrFail(params.id)

      if (kas.apakahDariSistem) {
        session.flash('alertError', 'Kas yang anda pilih tidak boleh diubah!')
        return response.redirect().back()
      }

      return view.render('kas/form-edit-kas', {
        kas
      })

    } catch (error) {
      session.flash('alertError', 'Kas yang akan anda edit tidak valid!')

      return response.redirect().toPath('/app/kas/')
    }
  }

  public async update({
    request,
    session,
    params,
    response
  }: HttpContextContract) {
    const newKasSchema = schema.create({
      tipeKas: schema.enum([
          'keluar',
          'masuk',
        ] as
        const),
      nominal: schema.number([rules.unsigned()]),
      perihal: schema.string({
        trim: true
      }, [rules.maxLength(100)]),
    })

    const validrequest = await request.validate({
      schema: newKasSchema
    })

    const pengaturan = await Pengaturan.findOrFail(1) // ntar diganti jadi ngecek toko aktif di session

    let placeholderPengguna = 1 // ini harusnya ngambil dari current active session
    const cek = (validrequest.tipeKas === 'keluar')

    try {
      const kas = await Ka.findOrFail(params.id)
      if (kas.apakahDariSistem) {
        session.flash('alertError', 'Kas yang anda pilih tidak boleh diubah!')
        return response.redirect().back()
      }

      const nominalLama = kas.nominal
      const nominalBaru = (cek) ? -Math.abs(validrequest.nominal) : Math.abs(validrequest.nominal)

      kas.apakahKasKeluar = cek
      kas.perihal = kapitalHurufPertama(validrequest.perihal),
        kas.nominal = nominalBaru
      kas.penggunaId = placeholderPengguna
      await kas.save()

      const selisih = nominalBaru - nominalLama
      pengaturan.saldoToko += selisih
      await pengaturan.save()

      session.flash('alertSukses', 'Kas berhasil diubah!')

      return response.redirect().toPath('/app/kas/' + params.id)
    } catch (error) {
      console.error(error)
      session.flash('alertError', 'Ada masalah saat mengubah data kas. Silahkan coba lagi setelah beberapa saat.')
      return response.redirect().back()
    }
  }

  public async destroy({
    params,
    session,
    response
  }: HttpContextContract) {
    try {
      const kas = await Ka.findOrFail(params.id)
      if (kas.apakahDariSistem) {
        session.flash('alertError', 'Kas yang anda pilih tidak boleh dihapus!')
        return response.redirect().back()
      }

      kas.deletedAt = DateTime.now()
      await kas.save()

      let nominalPembatalan = (kas.apakahKasKeluar) ? Math.abs(kas.nominal) : -Math.abs(kas.nominal)
      const pengaturan = await Pengaturan.findOrFail(1)
      pengaturan.saldoToko += nominalPembatalan
      await pengaturan.save()


      // Kalau mau bisa input report kas kalo ada duit masuk dari pembatalan kas
      // disini ntar, jangan lupa cek ada rekapHarian apa ngga dulu

      session.flash('alertSukses', 'Kas ' + ((kas.apakahKasKeluar) ? 'keluar ' : 'masuk ') + this.rupiahParser(kas.nominal) + ' berhasil dihapus!')
      return response.redirect().toPath('/app/kas/')
    } catch (error) {
      session.flash('alertError', 'Ada masalah saat menghapus data kas. Silahkan coba lagi setelah beberapa saat.')
      return response.redirect().back()
    }
  }


  // =========================================== TESTING ONLY ==============================================================
  // NTAR DIHAPUS 

  public async buatBanyak({}: HttpContextContract) {
    /** Mulai dari sini wajib banget */
    const CP = new CPasaran()
    const pasaranSekarang = CP.pasaranHarIni()

    let pengaturan = await Pengaturan.findOrFail(1) // ntar diganti jadi ngecek toko aktif di session
    await pengaturan.load('pasarans')

    let apakahPasaran = false
    for (const element of pengaturan.pasarans) {
      if (element.hari === pasaranSekarang) {
        apakahPasaran = true
        break
      }
    }

    let cariRH = await RekapHarian.findBy('tanggal_rekap', DateTime.local().set({
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0
    }).toSQL())

    let berhasil= 0
    let error= 0

   async function puter() {
    let placeholderPengguna = 1 // ini harusnya ngambil dari current active session

    for (let i = 0; i < 10; i++) {
      let gacha = getRandomInt(2)
      let gachaNominal = getRandomInt(10) * 1000

      try {
        if (gacha == 0) {
          pengaturan.saldoToko -= gachaNominal
        } else {
          pengaturan.saldoToko += gachaNominal
        }
        await pengaturan.save()

        if (!cariRH) {
          cariRH = await RekapHarian.create({
            pasaran: pasaranSekarang,
            apakahHariPasaran: apakahPasaran,
            tanggalRekap: DateTime.local().set({
              hour: 0,
              minute: 0,
              second: 0,
              millisecond: 0
            })
          })
        }

        await cariRH.related('kas').create({
          apakahKasKeluar: (gacha == 0),
          nominal: (gacha == 0) ? -Math.abs(gachaNominal) : Math.abs(gachaNominal),
          perihal: kapitalHurufPertama('Ini kas dummy auto generated'),
          penggunaId: placeholderPengguna
        })

        berhasil++
      } catch (error) {
        error++
      }
    }
   }

   await puter()

   return{
     berhasil,
     error
   }

  }
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max)
}

function kapitalHurufPertama(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

function kapitalKalimat(text: string) {
  let pure = text.split(' ')
  let newText = ''
  for (let i = 0; i < pure.length; i++) {
    newText += this.kapitalHurufPertama(pure[i])
    if (i !== pure.length - 1) {
      newText += ' '
    }
  }
  return newText
}