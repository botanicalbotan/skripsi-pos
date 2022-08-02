import type {
  HttpContextContract
} from '@ioc:Adonis/Core/HttpContext'
import {
  schema,
  rules
} from '@ioc:Adonis/Core/Validator'
import {
  DateTime
} from 'luxon';
import Pengaturan from 'App/Models/sistem/Pengaturan';
import KontenLaporanMaker from 'App/CustomClasses/Laporan/KontenLaporanMaker';
import Drive from '@ioc:Adonis/Core/Drive'
let PdfPrinter = require('pdfmake');

export default class LaporansController {

  public async index({
    view
  }: HttpContextContract) {
    return await view.render('laporan/form-laporan')
  }

  public async generateLaporan({
    response,
    request
  }: HttpContextContract) {

    const laporanSchema = schema.create({
      tanggalLaporan: schema.enum([
          'hariini',
          'kemarin',
          'mingguini',
          'pilih'
        ] as
        const),
      tanggalAwal: schema.date.optional({}, [
        rules.requiredWhen('tanggalLaporan', '=', 'pilih')
      ]),
      tanggalAkhir: schema.date.optional({}, [
        rules.requiredWhen('tanggalLaporan', '=', 'pilih')
      ]),

      semuaKas: schema.string.optional(),
      rekapKas: schema.string.optional(),
      daftarKas: schema.string.optional(),
      semuaTransaksi: schema.string.optional(),
      rekapTransaksi: schema.string.optional(),
      daftarPenjualan: schema.string.optional(),
      daftarPembelian: schema.string.optional(),
      daftarGadai: schema.string.optional(),
      semuaBarang: schema.string.optional(),
      daftarPenambahan: schema.string.optional(),
      daftarKoreksi: schema.string.optional(),
      daftarKelompokLaku: schema.string.optional(),
      daftarKodeproLaku: schema.string.optional(),
      daftarKelompokMenipis: schema.string.optional(),
      daftarModalLaku: schema.string.optional(),
    })

    try {
      // ============================================== CEK DATA DULU =====================================================
      const validrequest = await request.validate({
        schema: laporanSchema
      })

      let adaKas = false
      let adaTransaksi = false
      let adaBarang = false

      if (validrequest.tanggalLaporan === 'pilih' && (!validrequest.tanggalAwal || !validrequest.tanggalAkhir)) {
        throw 'Gabener'
      }

      if (validrequest.semuaKas || validrequest.rekapKas || validrequest.daftarKas) {
        adaKas = true
      }

      if (validrequest.semuaTransaksi || validrequest.rekapTransaksi || validrequest.daftarPenjualan || validrequest.daftarPembelian || validrequest.daftarGadai) {
        adaTransaksi = true
      }

      if (validrequest.semuaBarang || validrequest.daftarPenambahan || validrequest.daftarKoreksi || validrequest.daftarKelompokLaku || validrequest.daftarKodeproLaku || validrequest.daftarKelompokMenipis || validrequest.daftarModalLaku) {
        adaBarang = true
      }

      if (!adaKas && !adaTransaksi && !adaBarang) {
        throw 'setidaknya pilih salah satu'
      }

      let checklistKas = {
        semua: (validrequest.semuaKas) ? true : false,
        rekap: (validrequest.rekapKas) ? true : false,
        daftar: (validrequest.daftarKas) ? true : false
      }

      // ntar pas manggil methodnya, tetep cek satu2 dulu, jangan cek disana
      let checklistTransaksi = {
        semua: (validrequest.semuaTransaksi) ? true : false,
        rekap: (validrequest.rekapTransaksi) ? true : false,
        daftarJual: (validrequest.daftarPenjualan) ? true : false,
        daftarBeli: (validrequest.daftarPembelian) ? true : false,
        daftarGadai: (validrequest.daftarGadai) ? true : false
      }

      // ntar pas manggil methodnya, tetep cek satu2 dulu, jangan cek disana
      let checklistBarang = {
        semua: (validrequest.semuaBarang) ? true : false,
        daftarPenambahan: (validrequest.daftarPenambahan) ? true : false,
        daftarKoreksi: (validrequest.daftarKoreksi) ? true : false,
        daftarKelompokLaku: (validrequest.daftarKelompokLaku) ? true : false,
        daftarKodeproLaku: (validrequest.daftarKodeproLaku) ? true : false,
        daftarKelompokMenipis: (validrequest.daftarKelompokMenipis) ? true : false,
        daftarModelLaku: (validrequest.daftarModalLaku) ? true : false
      }

      // ================================= NYIAPIN DATA DISINI =============================================================
      const pengaturan = await Pengaturan.findOrFail(1)

      let isiKonten: Array < any > = []
      const Konten = new KontenLaporanMaker()

      var fonts = {
        Times: {
          normal: 'Times-Roman',
          bold: 'Times-Bold',
          italics: 'Times-Italic',
          bolditalics: 'Times-BoldItalic'
        },
        Helvetica: {
          normal: 'Helvetica',
          bold: 'Helvetica-Bold',
          italics: 'Helvetica-Oblique',
          bolditalics: 'Helvetica-BoldOblique'
        }
      };

      let tanggal1: DateTime
      let tanggal2: DateTime
      let tanggalString = ''

      if (validrequest.tanggalLaporan === 'pilih') {
        if (validrequest.tanggalAwal && validrequest.tanggalAkhir) {
          tanggal1 = validrequest.tanggalAwal
          tanggal2 = validrequest.tanggalAkhir
          tanggalString = tanggal1.toFormat('D') + ' - ' + tanggal2.toFormat('D')
        } else {
          throw 'tanggal ngga valid'
        }
      } else if (validrequest.tanggalLaporan === 'mingguini') {
        tanggal1 = DateTime.now().startOf('week')
        tanggal2 = DateTime.now().endOf('week')
        tanggalString = tanggal1.toFormat('D') + ' - ' + tanggal2.toFormat('D')
      } else if (validrequest.tanggalLaporan === 'kemarin') {
        tanggal1 = DateTime.now().minus({
          day: 1
        })
        tanggal2 = tanggal1
        tanggalString = tanggal1.toFormat('D')
      } else {
        tanggal1 = DateTime.now()
        tanggal2 = tanggal1
        tanggalString = tanggal1.toFormat('D')
      }

      let bgGambar
      const placeholderLogo = 'logos/logo-leo.png'
      let urlFoto = (pengaturan.logoToko)? 'logoToko/' + pengaturan.logoToko : placeholderLogo

      if (await Drive.exists(urlFoto)) { // kalo ngga di giniin, ntar bakal infinite await kalo file gaada
        const logoToko = await Drive.get(urlFoto) // ntar diganti jadi dinamis dari db, sama diresize dulu kali hmmm
        bgGambar = logoToko
      }

      // ================================ MULAI NGODING DOKUMEN DISINI ===================================================== 
      if (adaKas) {
        isiKonten.push(await Konten.generateBabKas(checklistKas, validrequest.tanggalLaporan, tanggal1, tanggal2, adaTransaksi))
      }

      if (adaTransaksi) {
        isiKonten.push(await Konten.generateBabTransaksi(checklistTransaksi, validrequest.tanggalLaporan, tanggal1, tanggal2, adaBarang))
      }

      if (adaBarang) {
        isiKonten.push(await Konten.generateBabBarang(checklistBarang, validrequest.tanggalLaporan, tanggal1, tanggal2, false))
      }


      const printer = new PdfPrinter(fonts);

      var dd = {
        content: isiKonten,
        styles: await Konten.generateStyle(),
        defaultStyle: {
          columnGap: 20,
          font: 'Helvetica', // Times / Helvetica
          fontSize: 11
        },
        pageSize: 'A4',
        footer: function footer_definition(currentPage, pageCount) {
          return [{
            margin: [31, 10, 31],
            layout: {
              hLineColor: (i) => (i === 0) ? 'lightgray' : '',
              vLineWidth: () => 0,
              hLineWidth: (i) => (i === 0) ? 1 : 0
            },
            table: {
              widths: ['*', 50],
              body: [
                [{
                    text: `Kompilasi Laporan Harian Toko Leo (${tanggalString})`,
                    fontSize: 10
                  },
                  {
                    text: `${currentPage} / ${pageCount}`,
                    alignment: 'right',
                    fillColor: 'lightgray'
                  }
                ]
              ]
            }
          }];
        },
        background: function (_currentPage, pageSize) {
          // kalau mau ngasi watermark, kalau ngga hapus aja
          if (bgGambar) {
            return [{
              image: bgGambar,
              width: 300,
              margin: [(pageSize.width - 300) / 2, (pageSize.height - 200) / 2, 0, 0],
              opacity: 0.1
            }]
          }

        },

      }

      // ================================ SELESAI NGODING DOKUMEN DISINI ===================================================
      const options = {}

      var pdfDoc = printer.createPdfKitDocument(dd, options);
      response.stream(pdfDoc)
      response.header('content-type', 'application/pdf')
      pdfDoc.end()
    } catch (error) {
      console.error(error)

      return response.badRequest({
        error: error
      })
    }

  }

}
