import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Kelompok from 'App/Models/barang/Kelompok'
import Database from '@ioc:Adonis/Lucid/Database'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Drive from '@ioc:Adonis/Core/Drive'
import { DateTime } from 'luxon'
import KodeProduksi from 'App/Models/barang/KodeProduksi'
import Penjualan from 'App/Models/transaksi/Penjualan'
import Terbilang from 'App/CustomClasses/Terbilang'
import Model from 'App/Models/barang/Model'
import Pengaturan from 'App/Models/sistem/Pengaturan'
import { prepareRekap } from 'App/CustomClasses/CustomRekapHarian'
import { butuhUpdate } from 'App/CustomClasses/CustomPenyesuaian'
import User from 'App/Models/User'
var isBase64 = require('is-base64')
var QRCode = require('qrcode')
let PDFDocument = require('pdfkit')
// let sharp = require('sharp')

export default class PenjualansController {
  // ========================================== Fungsi Routing ==================================================

  public async index({ view, request }: HttpContextContract) {
    const kadar = request.input('k', 0)
    const sanitizedKadar = kadar < 4 && kadar >= 0 && kadar ? kadar : 0
    const bentuk = request.input('b', 0)
    const sanitizedBentuk = bentuk < 8 && bentuk >= 0 && bentuk ? bentuk : 0
    const sembunyiStok = request.input('ss', 0)
    const sanitizedSembunyiStok = sembunyiStok < 2 && sembunyiStok >= 0 && sembunyiStok ? sembunyiStok : 0
    const cari = request.input('cari', '')

    const kelompoks = await Kelompok.query()
      .preload('bentuk')
      .preload('kadar')
      .whereNull('kelompoks.deleted_at')
      .if(cari !== '', (query) => {
        query.where('nama', 'like', `%${cari}%`)
      })
      .if(sanitizedBentuk > 0 && sanitizedBentuk < 8, (query) => {
        query.where('bentuk_id', sanitizedBentuk)
      })
      .if(sanitizedKadar > 0 && sanitizedKadar < 4, (query) => {
        query.where('kadar_id', sanitizedKadar)
      })
      .if(sanitizedSembunyiStok == 0, (query)=>{
        query.where('stok', '>', 0)
      })

    let tambahan = {
      pencarian: cari,
      kadar: sanitizedKadar,
      bentuk: sanitizedBentuk,
      apakahSembunyi: sanitizedSembunyiStok == 0
    }

    let roti = [
      {
        laman: 'Persiapan Penjualan'
      }
    ]

    return await view.render('transaksi/penjualan/prepare-jual', { kelompoks, tambahan, roti })
  }

  public async form({ view, request, response, session }: HttpContextContract) {
    // kelompokTerpilih
    const kunci = request.input('kt')

    // kemungkinan kalau dah kompleks bakal pake transaction

    try {
      const kelompok = await Kelompok.query()
        .withScopes((scopes) => {
          scopes.adaStokTidakDihapus()
        })
        .where('id', kunci)
        .preload('kadar', (kadarQuery) => {
          kadarQuery.preload('kodeProduksis', (kodeproQuery)=>{
            kodeproQuery
            .select('id', 'kode')
            .whereNull('deleted_at')
          })
        })
        .preload('bentuk', (bentukQuery) => {
          bentukQuery
          .preload('models', (modelQuery) => {
            modelQuery
            .select('id', 'nama')
            .whereNull('deleted_at')
          })
        })
        .firstOrFail()

      let roti = [
        {
          laman: 'Persiapan Penjualan',
          alamat: '/app/transaksi/penjualan',
        },
        {
          laman: 'Formulir Penjualan',
        },
      ]

      return await view.render('transaksi/penjualan/form-jual', { kelompok, roti })
    } catch (error) {
      session.flash('alertError', 'Kelompok yang ada pilih tidak valid!')
      return response.redirect().toPath('/app/transaksi/penjualan')
    }
  }

  public async simpanPenjualan({ request, session, response, auth }: HttpContextContract) {
    const newPenjualanSchema = schema.create({
      id: schema.number([
        rules.unsigned(),
        rules.exists({
          table: 'kelompoks',
          column: 'id',
          where: {
            deleted_at: null,
          },
          whereNot: {
            stok: 0,
          },
        }),
      ]),
      kodepro: schema.number([
        rules.unsigned(),
        rules.exists({
          table: 'kode_produksis',
          column: 'id',
          where: {
            deleted_at: null,
          },
        }),
      ]),
      model: schema.number([
        rules.unsigned(),
        rules.exists({
          table: 'models',
          column: 'id',
          where: {
            deleted_at: null,
          },
        }),
      ]),
      jenisStok: schema.enum(['lama', 'baru'] as const),
      beratDesimal: schema.number([rules.unsigned()]),
      kondisi: schema.string.optional({ trim: true }, [rules.maxLength(100)]),
      jenisItem: schema.array
        .optional([
          rules.minLength(1)
        ])
        .members(
          schema.enum(['mainan', 'batu'] as const)
        ),
      keteranganItem: schema.array
        .optional([
          rules.minLength(1)
        ])
        .members(
          schema.string({ trim: true }, [rules.maxLength(30)])
        ),
      jumlahItem: schema.array
        .optional([
          rules.minLength(1)
        ])
        .members(
          schema.number([
            rules.unsigned()
          ])
        ),
      fotoBarangBase64: schema.string(),
      ajukanTT: schema.string.optional(),

      namaPemilik: schema.string.optional({ trim: true }, [rules.maxLength(50)]),
      alamatPemilik: schema.string.optional({ trim: true }, [rules.maxLength(50)])
    })

    const validrequest = await request.validate({ schema: newPenjualanSchema })

    let idTransaksi = await buatId()
    let kodeTransaksi = 'PJ' + validrequest.id.toString() + validrequest.model.toString() + idTransaksi
    let namaFileFoto = ''
    let fileFoto = validrequest.fotoBarangBase64 || ''

    try {
      if(!auth.user) throw 'auth ngga valid'
      const userPengakses = await User.findOrFail(auth.user.id)
      await userPengakses.load('pengguna')
      const pengaturan = await Pengaturan.findOrFail(1)

      // ========== Cek Item, ada tambahan ntar dibawah ==========
      if(validrequest.jenisItem?.length != validrequest.keteranganItem?.length || validrequest.jenisItem?.length != validrequest.jumlahItem?.length){
        throw new Error('Item yang anda input tidak valid!')
      }

      // ========== Foto ==========
      try {
        if (!isBase64(fileFoto, { mimeRequired: true, allowEmpty: false }) || fileFoto === '') {
          throw new Error('Input foto barang tidak valid!')
        }
  
        var block = fileFoto.split(';')
        var realData = block[1].split(',')[1] // In this case "iVBORw0KGg...."
        namaFileFoto = 'PJ' + DateTime.now().toMillis() + idTransaksi + '.jpg' // bisa diganti yang lebih propper

        const buffer = Buffer.from(realData, 'base64')
        await Drive.put('transaksi/penjualan/' + namaFileFoto, buffer)
      } catch (error) {
        throw {
          custom: true,
          foto: true,
        }
      }

      // ========== Hitungan Rumus ==========
      const kodepro = await KodeProduksi.findOrFail(validrequest.kodepro)
      await kodepro.load('kadar')
      kodeTransaksi += kodepro.id.toString() + DateTime.now().toFormat('SSS')
      const kelompok = await Kelompok.findOrFail(validrequest.id)
      await kelompok.load('bentuk')

      const potongan = (validrequest.jenisStok == 'baru')? kodepro.potonganBaru : kodepro.potonganLama

      const hargaPerGram = (validrequest.jenisStok == 'baru')? kodepro.hargaPerGramBaru : kodepro.hargaPerGramLama
      const beratBarang = belakangKoma(validrequest.beratDesimal) + kelompok.beratKelompok
      const hargaJual = pembulatanRupiah(hargaPerGram * beratBarang)

      const model = await Model.findOrFail(validrequest.model)
      let namaBarang = kelompok.bentuk.kode + ' ' + beratBarang + ' gr ' + model.nama

      const pjBaru = await kelompok.related('penjualans').create({
        kodeTransaksi: kodeTransaksi,
        namaBarang: namaBarang,
        kodeProduksiId: kodepro.id,
        penggunaId: userPengakses.pengguna.id,
        modelId: validrequest.model,
        beratBarang: beratBarang,
        kondisi: validrequest.kondisi,
        fotoBarang: namaFileFoto,
        apakahStokBaru: validrequest.jenisStok === 'baru',
        apakahJanjiTukarTambah: (validrequest.ajukanTT)? true: false,
        potongan: potongan,
        apakahPotonganPersen: kodepro.kadar.apakahPotonganPersen,
        hargaJualPerGram: hargaPerGram,
        hargaJualAkhir: hargaJual,
        maxPrintAt: DateTime.now().plus({ minutes: pengaturan.defaultWaktuMaksimalPrintNota }), // dikasi waktu 30 menit buat ngeprint, bisa diganti ntar,
        namaPemilik: (validrequest.namaPemilik)? validrequest.namaPemilik : null,
        alamatPemilik: (validrequest.alamatPemilik)? validrequest.alamatPemilik : null
      })

      kelompok.stok -= 1
      await kelompok.save()

      // ========== tambah item jual ==========

        if(validrequest.jenisItem && validrequest.jenisItem.length > 0 && validrequest.keteranganItem && validrequest.jumlahItem){
          let i = 0

          let adaBatu = false
          let adaMainan = false
          let teksBatu = 'AD'
          let teksMainan = 'PM'

          for (const item of validrequest.jenisItem) {
            try {
              if(item === 'batu'){
                adaBatu = true
                teksBatu += ' ' + validrequest.jumlahItem[i] + ' ' + validrequest.keteranganItem[i]
              } else {
                adaMainan = true
                teksMainan += ' ' + validrequest.jumlahItem[i] + ' ' + validrequest.keteranganItem[i]
              }

              await pjBaru.related('itemJuals').create({
                jenis: item,
                keterangan: validrequest.keteranganItem[i],
                jumlah: validrequest.jumlahItem[i]
              })

              i++
            } catch (error) {
              // console.error('Penjualan: ada input item error!')
            }
          }

          let namaBarangBaru = kelompok.bentuk.kode + ' ' + beratBarang + ' gr ' + model.nama + (adaBatu? ' ' + teksBatu: '') + (adaMainan? ' ' + teksMainan: '')
          pjBaru.namaBarang = namaBarangBaru
          await pjBaru.save()
        }
      
      pengaturan.saldoToko += hargaJual
      await pengaturan.save()

      // perbarui penyesuaian stok
      await butuhUpdate(kelompok.id)

      return response.redirect().withQs({ tid: pjBaru.id }).toPath('/app/transaksi/penjualan/pasca')
      // udah kelar, tinggal redirect ke page finish

    } catch (error) {
      // console.error(error)
      await Drive.delete('transaksi/penjualan/' + namaFileFoto)
      if(error.foto && error.custom){
        session.flash('errors', {
          fotoBarangBase64: 'Input foto barang tidak valid!'
        })
      } else {
        session.flash('alertError', 'Ada masalah saat menyimpan transaksi. Mohon ulangi beberapa saat lagi.')
      }
      return response.redirect().withQs().back()
    }
  }

  public async show({ params, response, view, session }: HttpContextContract) {
    try {
      const PJ = await Penjualan.findOrFail(params.id)
      await PJ.load('pengguna', (query) => {
        query.preload('jabatan')
      })
      await PJ.load('itemJuals')
      await PJ.load('model', (query) => {
        query.preload('bentuk')
      })
      await PJ.load('kodeProduksi', (query) =>{
        query.preload('kadar')
      })

      const fungsi = {
        rupiahParser: rupiahParser,
        kapitalHurufPertama: kapitalHurufPertama
      }

      const tambahan = {
        adaFotoBarang: (await Drive.exists('transaksi/penjualan/' + PJ.fotoBarang)),
        adaFotoPencatat: (await Drive.exists('profilePict/' + PJ.pengguna.foto))
      }

      let roti = [
        {
          laman: 'Riwayat Penjualan',
          alamat: '/app/riwayat/penjualan',
        },
        {
          laman: PJ.namaBarang,
        },
      ]

      return await view.render('transaksi/penjualan/view-jual', { PJ, fungsi, tambahan, roti })

    } catch (error) {
      session.flash('alertError', 'Penjualan yang anda pilih tidak valid!')
      return response.redirect().toPath('/app/riwayat/penjualan')
    }
  }

  public async destroy({ params, response, session, auth }: HttpContextContract) {
    try {
      const PJ = await Penjualan.findOrFail(params.id)

      let pengaturan = await Pengaturan.findOrFail(1) // ntar diganti jadi ngecek toko aktif di session

      // buat ngecek rekap harian udah gw taro di custom class ini
      let cariRH = await prepareRekap()


      if(!auth.user) throw 'auth ngga valid'
      const userPengakses = await User.findOrFail(auth.user.id)
      await userPengakses.load('pengguna')


      await cariRH.related('kas').create({
        apakahKasKeluar: true,
        apakahDariSistem: true,
        perihal: 'Pembatalan penjualan "' + PJ.namaBarang + '" yang tercatat pada tanggal ' + PJ.createdAt.toFormat('dd LLL yyyy'),
        nominal: -Math.abs(PJ.hargaJualAkhir),
        penggunaId: userPengakses.pengguna.id
      })

      pengaturan.saldoToko -= Math.abs(PJ.hargaJualAkhir)
      await pengaturan.save()

      PJ.deletedAt = DateTime.now()
      await PJ.save()

      session.flash('alertSukses', 'Transaksi penjualan "'+ PJ.namaBarang +'" berhasil dihapus!')
      return response.redirect().toPath('/app/riwayat/penjualan')
    } catch (error) {
      session.flash('alertError', 'Ada masalah saat menghapus data penjualan. Silahkan coba lagi setelah beberapa saat.')
      return response.redirect().back()
    }
  }

  public async pascaTransaksi({ request, response, session, view }: HttpContextContract) {
    let tid = request.input('tid')

    try {
      const PJ = await Penjualan.findOrFail(tid)
      await PJ.load('kelompok', (query) => {
        query.preload('bentuk').preload('kadar')
      })

      await PJ.load('model')

    const fungsi = {
      rupiahParser: rupiahParser
    }

    const terparser = new Terbilang()

    let now = new Date().getTime()
    let max = new Date(PJ.maxPrintAt.toJSDate()).getTime()
    let distance = max - now;

    // Time calculations for days, hours, minutes and seconds
    let minutes = (distance > 0 )? Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)) : 0
    let seconds = (distance > 0 )? Math.floor((distance % (1000 * 60)) / 1000) : 0

    const tambahan = {
      hargaJualTerbilang: kapitalHurufPertama(terparser.ubahKeTeks(PJ.hargaJualAkhir || 0)) + ' rupiah',
      apakahExpired: distance <= 0 ,
      menit: minutes,
      detik: seconds
    }

    let roti = [
      {
        laman: 'Riwayat Penjualan',
        alamat: '/app/riwayat/penjualan',
      },
      {
        laman: PJ.namaBarang,
        alamat: '/app/transaksi/penjualan/' + PJ.id,
      },
      {
        laman: 'Pasca'
      }
    ]

    return await view.render('transaksi/penjualan/pasca-jual', { PJ, fungsi, tambahan, roti })

    } catch (error) {
      session.flash('alertError', 'Penjualan yang anda pilih tidak valid!')
      return response.redirect().toPath('/app/transaksi/penjualan')
    }

  }

  public async maxCetakPenjualan({ request, response }: HttpContextContract) {
    let tid = request.input('tid', '')

    try {
      const PJ = await Database
      .from('penjualans')
      .select('max_print_at as maxPrintAt')
      .where('id', tid)
      .whereNull('deleted_at')
      .firstOrFail()


      return { max: PJ.maxPrintAt }
    } catch (error) {
      return response.badRequest('Id penjualan tidak valid.')
    }

  }

  public async cetakNota({ request, response }: HttpContextContract) {
    const idpj = request.input('idpj', '')

    try {
      const pengaturan = await Pengaturan.findOrFail(1)

      const penjualan = await Penjualan.findOrFail(idpj)
      await penjualan.load('kelompok', (query) => {
        query.preload('kadar')
      })
      await penjualan.load('pengguna') // ini manggil karyawan

      const warnaPrimer = penjualan.kelompok.kadar.warnaNota
      const warnaNetral = 'black'

      // cek udah expired belom
      if(penjualan.maxPrintAt <= DateTime.now()){
        return response.forbidden({error: 'Waktu cetak nota sudah habis.'})
      }

      const pWidth = 595.2  // point
      const pHeight = 311.8 // point

      // Warning!! Margin cuma jalan kalo lokasi x ama y suatu elemen ngga di isi, ato lu isi undefined
      const pMargins = 19.8 // point

      const doc = new PDFDocument({
        size: [ pWidth, pHeight ],
        margin: pMargins
      })

      response.stream(doc) // di bind ke response

      // ================================ MULAI NGODING DOKUMEN DISINI =====================================================

      // Ini frame paling luar dari dokumen
      doc.rect(0, 0, pWidth, pHeight)
        .strokeOpacity(0.5)
        .stroke(warnaNetral)

      // ================= HEADER / ROW 1 =======================

      doc.fontSize(24)
        .strokeOpacity(1)
        .fillOpacity(1)
        .font('Times-Bold')
        .fill(warnaPrimer)
        .text('TOKO MAS LEO', pMargins + 130, pMargins + 5)
        .fill(warnaNetral)

      doc.fontSize(12)
        .text('Timur Pasar Karanggede - BOYOLALI', pMargins + 130,  pMargins + 30)
        .font('Times-Roman')
        .moveDown(0.01)
        .text('Sedia perhiasan mas muda dan mas tua. Menerima penjualan mas dari luar toko (Arab, Kalimantan, Jakarta, dll)', {
          width: 350
        })

      const placeholderLogo = 'logos/logo-leo.png' // ini bisa dipake buat testing / maen aman
      // const urlFoto = placeholderLogo
      const urlFoto =  (pengaturan.logoToko)? 'logoToko/' + pengaturan.logoToko : placeholderLogo

      if(await Drive.exists(urlFoto)){ // kalo ngga di giniin, ntar bakal infinite await kalo file gaada
        const logoToko = await Drive.get(urlFoto) // ntar diganti jadi dinamis dari db, sama diresize dulu kali hmmm
        doc.image(logoToko, pMargins, pMargins, {
          height: 60
        })
      }

      await QRCode.toDataURL(penjualan.kodeTransaksi)
        .then(url => {
          var block = url.split(';')
          var realData = block[1].split(',')[1]

          // ini contoh kalo ngga di resize, tp langsung taruh
          // let bukaGambar = doc.openImage(Buffer.from(realData, 'base64'))
          // doc.image(bukaGambar, pWidth - bukaGambar.width, 0, {})

          // ini contoh kalo di resize, baru taruh
          const qrWidth = 60 // pixel
          doc.image(Buffer.from(realData, 'base64'), pWidth - qrWidth - pMargins, pMargins, {
            height: qrWidth
          })
        })
        .catch(err => {
          console.error(err)
        })


      // ================= ROW 2 =========================

      let hRow2 = pMargins + 80

      const namaPemilik = (penjualan.namaPemilik)? penjualan.namaPemilik : '-'
      const alamatPemilik = (penjualan.alamatPemilik)? penjualan.alamatPemilik : '-'
      let potongan = (penjualan.apakahPotonganPersen)? penjualan.potongan + '%' : rupiahParser(penjualan.potongan) + '/ Gr'
      let potonganFinal = (penjualan.apakahStokBaru)? potongan + ' (NEW)' : potongan

      doc.fontSize(13)
        .text('Nama: ', pMargins + 5, hRow2,  { continued:true }) // mau dikasi max width sama max character?
        .font('Times-Bold')
        .text(namaPemilik)

      doc.fontSize(13)
        .font('Times-Roman')
        .text('Alamat: ', (pWidth / 2) - 35, hRow2,  { continued:true }) // mau dikasi max width sama max character?
        .font('Times-Bold')
        .text(alamatPemilik)


      doc.moveTo(pMargins, hRow2 + 15)
        .lineTo(pWidth - pMargins, hRow2 + 15)
        .stroke()

      doc.moveTo(pMargins, hRow2 + 18)
        .lineTo(pWidth - pMargins, hRow2 + 18)
        .stroke()

      // =============== Konten / ROW 3 =======================

      let hRow3 = hRow2 + 25
      let hContentRow3 = 22
      let maxWRow3 = pWidth - 150 - pMargins

      // fotonya kasi scale 4:3
      if(await Drive.exists('transaksi/penjualan/' + penjualan.fotoBarang)){ // kalo ngga di giniin, ntar bakal infinite await kalo file gaada
        const fotoBarang = await Drive.get('transaksi/penjualan/' + penjualan.fotoBarang) // ntar diganti jadi dinamis dari db, sama diresize dulu kali hmmm
        doc.image(fotoBarang, maxWRow3 + 17, hRow3 + 1, {
          height: 98
        })
      } else{
        doc.rect(maxWRow3 + 15, hRow3, 135, 100)
        .stroke()
      }

      doc.rect(pMargins, hRow3, maxWRow3 - pMargins, 100)
        .fillOpacity(0.1)
        .fill(warnaPrimer)
        .fillOpacity(1)

      // === start tabel ===
      doc.moveTo(pMargins, hRow3)
        .lineTo(maxWRow3, hRow3)
        .stroke(warnaPrimer)

      doc.moveTo(pMargins, hRow3 + hContentRow3)
        .lineTo(maxWRow3, hRow3 + hContentRow3)
        .stroke()

      doc.moveTo(pMargins, hRow3)
        .lineTo(pMargins, hRow3 + 100)
        .stroke()

      let wCol1 = (maxWRow3 - pMargins) / 2

      doc.fontSize(13)
        .fill(warnaPrimer)
        .font('Times-Roman')
        .text('Nama Barang', pMargins + 10, hRow3 + (hContentRow3 / 4))

      doc.fontSize(13)
        .fill(warnaNetral)
        .font('Times-Roman')
        .text(penjualan.namaBarang, pMargins + 10, hRow3 + hContentRow3 + (hContentRow3 / 2), {
          width: wCol1 - 20
        })


      let wCol2 = 80

      doc.moveTo(wCol1 + pMargins, hRow3)
        .lineTo(wCol1 + pMargins, hRow3 + 100)
        .stroke()

      doc.fontSize(13)
        .fill(warnaPrimer)
        .font('Times-Roman')
        .text('Berat', wCol1 + pMargins + 10, hRow3 + (hContentRow3 / 4))


      doc.fontSize(13)
        .fill(warnaNetral)
        .font('Times-Roman')
        .text(penjualan.beratBarang.toFixed(3) + ' gr', wCol1 + pMargins + 10, hRow3 + hContentRow3 + (hContentRow3 / 2), {
          width: wCol2 - 20
        })

      let wCol3 = maxWRow3 - wCol1 - wCol2 - pMargins

      doc.moveTo(wCol1 + wCol2 + pMargins, hRow3)
        .lineTo(wCol1 + wCol2 + pMargins, hRow3 + 100)
        .stroke()

      doc.moveTo(maxWRow3, hRow3)
        .lineTo(maxWRow3, hRow3 + 100)
        .stroke()

      doc.fontSize(13)
        .font('Times-Roman')
        .fill(warnaPrimer)
        .text('Harga', wCol1 + wCol2 + pMargins + 10, hRow3 + (hContentRow3 / 4))

      doc.fontSize(13)
        .fill(warnaNetral)
        .font('Times-Roman')
        .text(rupiahParser(penjualan.hargaJualAkhir), wCol1 + wCol2 + pMargins + 10, hRow3 + hContentRow3 + (hContentRow3 / 2), {
          width: wCol3 - 20
        })


      doc.moveTo(pMargins, hRow3 + 100)
        .lineTo(maxWRow3 - wCol3, hRow3 + 100)
        .stroke()

      doc.rect(wCol1 + wCol2 + pMargins, hRow3 + 100, wCol3, hContentRow3 )
        .fillOpacity(0.1)
        .fillAndStroke(warnaPrimer, warnaPrimer)

      doc.fill(warnaNetral)
        .fillOpacity(1)
        .fontSize(13)
        .font('Times-Roman')
        .text('Total Nett', wCol1 + pMargins + 20, hRow3 + 100 + (hContentRow3 / 4))

      doc.fontSize(13)
        .font('Times-Bold')
        .text(rupiahParser(penjualan.hargaJualAkhir), maxWRow3 - wCol3 + 10, hRow3 + 100 + (hContentRow3 / 4))

      doc.fontSize(13)
        .font('Times-Roman')
        .text('Potongan: ', pMargins + 5, hRow3 + 100 + (hContentRow3 / 4),  { continued:true }) // mau dikasi max width sama max character?
        .font('Times-Bold')
        .text(potonganFinal)

      // =============== Footer / ROW 4 =======================

      let hRow4 = hRow3 + 100 + hContentRow3 + 10
      doc.fontSize(10)
        .font('Times-Roman')
        .list([
          'Barang yang sudah dibeli beratnya ditimbang dan sudah diperiksa betul oleh si pembeli',
          'Barang dapat diterima kembali dengan membawa surat keterangan pembeli',
          // 'Minggu pon libur',
          'Dalam keadaan rusak diterima dengan harga lain'
        ], pMargins, hRow4)


      doc.fontSize(13)
        .font('Times-Roman')
        .fill(warnaNetral)
        .text(`${ penjualan.createdAt.toFormat('ff') },`,maxWRow3 + 15, hRow4 - 20)
        .moveDown(1.5)
        // .font('Times-Bold')
        .text(penjualan.pengguna.nama.substring(0, 15))

      
      doc.end()
      response.header('content-type', 'application/pdf')

    } catch (error) {
      return response.badRequest({error: 'Ada masalah dengan pencetakan nota.'})
    }
  }

  public async gantiDurasi({ request, response, params }: HttpContextContract) {
    const newDurasiSchema = schema.create({
      durasiBaru: schema.date()
    })

    try {
      // udah kesambung middleware, ngga perlu ngecek auth lagi
      const validrequest = await request.validate({ schema: newDurasiSchema })

      const penjualan = await Penjualan.findOrFail(params.id)
      if(validrequest.durasiBaru < penjualan.maxPrintAt) throw `Waktu maksimal cetak nota baru harus lebih dari ${penjualan.maxPrintAt.toFormat('f')}`

      penjualan.maxPrintAt = validrequest.durasiBaru
      await penjualan.save()

      return response.ok({ message: 'Durasi cetak nota transaksi berhasil diperbarui!'})
    } catch (error) {
      if (typeof error === 'string') {
        return response.badRequest({ error: error })
      } else {
        return response.badRequest({ error: 'Ada masalah pada server!' })
      }
    }
  }


}


  // ============================ Fungsi Tambahan =====================================

  async function buatId() {
    const lastPenjualan = await Database
      .from('penjualans')
      .select('id')
      .orderBy('id', 'desc')
      .limit(1)

    if(lastPenjualan[0]){
      return tigaDigit(lastPenjualan[0].id + 1)
    } else return '001'
  }

  function kapitalHurufPertama(text: string) {
    return text.charAt(0).toUpperCase() + text.slice(1)
  }

  function belakangKoma(angka: number) {
    return angka / Math.pow(10, angka.toString().replace(/\D/gi, '').length)
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

  function pembulatanRupiah(angka: number, bulat:number = 1000){
    return Math.ceil(angka / bulat) * bulat
  }

  function tigaDigit(angka: number){
    let teks = angka.toString()
    let finalTeks = teks
    if(teks.length == 2) finalTeks = '0' + teks
    if(teks.length <= 1) finalTeks = '00' + teks

    return finalTeks
  }