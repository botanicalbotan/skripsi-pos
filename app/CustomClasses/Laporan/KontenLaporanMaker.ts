// Ini cuma bikin ISI KONTEN yang bakal dipake buat bikin PDF di core controllernya

import Pengaturan from "App/Models/sistem/Pengaturan"
import {
  DateTime
} from 'luxon';
import CPasaran from 'App/CustomClasses/CPasaran';
import Database from '@ioc:Adonis/Lucid/Database';
import User from "App/Models/User";
import BabKas from "./Bab/BabKas";
import BabBarang from "./Bab/BabBarang";
import BabTransaksi from "./Bab/BabTransaksi";

export default class KontenLaporanMaker {
  async generateStyle() {
    return {
      header: {
        fontSize: 18,
        bold: true,
        margin: [0, 0, 0, 10]
      },
      tableHeader: {
        // bold: true,
        // fontSize: 11,
        color: 'black',
        fillColor: '#eeeeee'
      },
      tabelBasic: {
        margin: [0, 10, 0, 15]
      },
      tabelKopBab: {
        margin: [0, 0, 0, 25]
      },
      judul: {
        bold: true,
        fontSize: 16,
        color: 'black',
        margin: [0, 0, 0, 30]
      },
      paragrafNormal: {
        lineHeight: 1.5,
        fontSize: 11
      },
      subBab: {
        fontSize: 12,
        margin: [0, 5, 0, 10]
      },
      kasMasuk: {
        color: 'green'
      },
      kasKeluar: {
        color: 'red'
      },
      olJudul: {
        fontSize: 11,
        margin: [0, 5, 0, 10]
      },
      olKonten: {
        fontSize: 11,
        margin: [0, 0, 0, 10]
      },
      olWadah: {
        fontSize: 11,
        margin: [0, 10, 0, 15]
      },
      olTabel: {
        margin: [0, 0, 0, 15]
      }
    }
  }

  // ================================================ GENERATE BAB KAS ==========================================================

  async generateBabKas(checklistKas: {
    semua: boolean,
    rekap: boolean,
    daftar: boolean
  }, tanggalLaporan: string, tanggalMulai: DateTime, tanggalAkhir: DateTime, adaNext: boolean = false) {

    let placeholderUser = 1 // ini harusnya ngambil dari current active session
    const userPengkases = await User.findOrFail(placeholderUser)
    await userPengkases.load('pengguna', (query) => {
      query.preload('jabatan')
    })

    const pengaturan = await Pengaturan.findOrFail(1)

    let cabang = kapitalKalimat(pengaturan.namaToko)
    let alamat = kapitalKalimat(pengaturan.alamatTokoLengkap)
    let pencetak = kapitalKalimat(userPengkases.pengguna.nama) + ` <${userPengkases.pengguna.jabatan.nama}>`
    let tanggalCetak = DateTime.now().toFormat('fff')

    let tanggalString = ''

    if (tanggalLaporan === 'pilih' || tanggalLaporan === 'mingguini') {
      tanggalString = tanggalMulai.toFormat('D') + ' - ' + tanggalAkhir.toFormat('D')
    } else {
      tanggalString = tanggalMulai.toFormat('D')
    }


    // 1. ------------------------ Persiapan Subbab (konten asli) ----------------------
    let subbab: Array < any > = []
    const babKas = new BabKas()

    if (checklistKas.semua) {
      subbab.push(await babKas.generateSubRekapKas(tanggalLaporan, tanggalMulai, tanggalAkhir))
      subbab.push(await babKas.generateSubDaftarKas(tanggalLaporan, tanggalMulai, tanggalAkhir))
    } else {
      if (checklistKas.rekap) {
        subbab.push(await babKas.generateSubRekapKas(tanggalLaporan, tanggalMulai, tanggalAkhir))
      }

      if (checklistKas.daftar) {
        subbab.push(await babKas.generateSubDaftarKas(tanggalLaporan, tanggalMulai, tanggalAkhir))
      }
    }

    // ini terakhir buat ngasi pagebreak
    if (adaNext) {
      subbab.push({
        pageBreak: 'after',
        text: ''
      })
    }

    // 2. ------------------------ Wadah Bab ------------------------------------
    let bab = [{
        stack: [
          'LAPORAN PEMBUKUAN KAS HARIAN',
          'TOKO MAS LEO',
          'TANGGAL ' + tanggalString
        ],
        style: 'judul',
        alignment: 'center',
        // pageBreak: 'after'
      },
      {
        style: 'tabelKopBab',
        table: {
          widths: [80, 'auto', '*', 10, 80, 'auto', '*'],
          body: [
            ['Cabang Toko', ':', cabang, null, 'Tanggal Cetak', ':', tanggalCetak],
            ['Alamat Toko', ':', alamat, null, 'Pencetak', ':', pencetak],
          ],
        },

        layout: 'noBorders'
      },
      {
        type: 'upper-alpha',
        ol: subbab,
      }
    ]

    // 3. ------------------------ Return Selesai ----------------------------
    return bab
  }

  // ================================================ GENERATE BAB TRANSAKSI ==========================================================
  async generateBabTransaksi(checklistTransaksi: {
    semua: boolean,
    rekap: boolean,
    daftarJual: boolean,
    daftarBeli: boolean,
    daftarGadai: boolean,
  }, tanggalLaporan: string, tanggalMulai: DateTime, tanggalAkhir: DateTime, adaNext: boolean = false) {

    let placeholderUser = 1 // ini harusnya ngambil dari current active session
    const userPengkases = await User.findOrFail(placeholderUser)
    await userPengkases.load('pengguna', (query) => {
      query.preload('jabatan')
    })

    const pengaturan = await Pengaturan.findOrFail(1)

    let cabang = kapitalKalimat(pengaturan.namaToko)
    let alamat = kapitalKalimat(pengaturan.alamatTokoLengkap)
    let pencetak = kapitalKalimat(userPengkases.pengguna.nama) + ` <${userPengkases.pengguna.jabatan.nama}>`
    let tanggalCetak = DateTime.now().toFormat('fff')

    let tanggalString = ''

    if (tanggalLaporan === 'pilih' || tanggalLaporan === 'mingguini') {
      tanggalString = tanggalMulai.toFormat('D') + ' - ' + tanggalAkhir.toFormat('D')
    } else {
      tanggalString = tanggalMulai.toFormat('D')
    }


    // 1. ------------------------ Persiapan Subbab (konten asli) ----------------------
    let subbab: Array < any > = []
    const babTransaksi = new BabTransaksi()

    if (checklistTransaksi.semua) {
      subbab.push(await babTransaksi.generateSubRekapTransaksi(tanggalLaporan, tanggalMulai, tanggalAkhir))
      subbab.push(await babTransaksi.generateSubDaftarPenjualan(tanggalLaporan, tanggalMulai, tanggalAkhir))
      subbab.push(await babTransaksi.generateSubDaftarPembelian(tanggalLaporan, tanggalMulai, tanggalAkhir))
      // subbab.push(await babTransaksi.generateSubDaftarGadai(tanggalLaporan, tanggalMulai, tanggalAkhir))
    } else {
      if (checklistTransaksi.rekap) {
        subbab.push(await babTransaksi.generateSubRekapTransaksi(tanggalLaporan, tanggalMulai, tanggalAkhir))
      }

      if (checklistTransaksi.daftarJual) {
        subbab.push(await babTransaksi.generateSubDaftarPenjualan(tanggalLaporan, tanggalMulai, tanggalAkhir))
      }

      if (checklistTransaksi.daftarBeli) {
        subbab.push(await babTransaksi.generateSubDaftarPembelian(tanggalLaporan, tanggalMulai, tanggalAkhir))
      }

      // if (checklistTransaksi.daftarGadai) {
      //   subbab.push(await babTransaksi.generateSubDaftarGadai(tanggalLaporan, tanggalMulai, tanggalAkhir))
      // }
    }

    // ini terakhir buat ngasi pagebreak
    if (adaNext) {
      subbab.push({
        pageBreak: 'after',
        text: ''
      })
    }

    // 2. ------------------------ Wadah Bab ------------------------------------
    let bab = [{
        stack: [
          'LAPORAN PEMBUKUAN TRANSAKSI HARIAN',
          'TOKO MAS LEO',
          'TANGGAL ' + tanggalString
        ],
        style: 'judul',
        alignment: 'center',
        // pageBreak: 'after',
      },
      {
        style: 'tabelKopBab',
        table: {
          widths: [80, 'auto', '*', 10, 80, 'auto', '*'],
          body: [
            ['Cabang Toko', ':', cabang, null, 'Tanggal Cetak', ':', tanggalCetak],
            ['Alamat Toko', ':', alamat, null, 'Pencetak', ':', pencetak],
          ],
        },
        layout: 'noBorders'
      },
      {
        type: 'upper-alpha',
        ol: subbab,
      }
    ]

    // 3. ------------------------ Return Selesai ----------------------------
    return bab
  }

  // ================================================ GENERATE BAB BARANG ==========================================================
  async generateBabBarang(checklistBarang: {
    semua: boolean,
    daftarPenambahan: boolean,
    daftarKoreksi: boolean,
    daftarKelompokLaku: boolean,
    daftarKodeproLaku: boolean,
    daftarKelompokMenipis: boolean,
    daftarModelLaku: boolean,
  }, tanggalLaporan: string, tanggalMulai: DateTime, tanggalAkhir: DateTime, adaNext: boolean = false) {

    let placeholderUser = 1 // ini harusnya ngambil dari current active session
    const userPengkases = await User.findOrFail(placeholderUser)
    await userPengkases.load('pengguna', (query) => {
      query.preload('jabatan')
    })

    const pengaturan = await Pengaturan.findOrFail(1)

    let cabang = kapitalKalimat(pengaturan.namaToko)
    let alamat = kapitalKalimat(pengaturan.alamatTokoLengkap)
    let pencetak = kapitalKalimat(userPengkases.pengguna.nama) + ` (${userPengkases.pengguna.jabatan.nama})`
    let tanggalCetak = DateTime.now().toFormat('fff')

    let tanggalString = ''

    if (tanggalLaporan === 'pilih' || tanggalLaporan === 'mingguini') {
      tanggalString = tanggalMulai.toFormat('D') + ' - ' + tanggalAkhir.toFormat('D')
    } else {
      tanggalString = tanggalMulai.toFormat('D')
    }


    // 1. ------------------------ Persiapan Subbab (konten asli) ----------------------
    let subbab: Array < any > = []
    const babBarang = new BabBarang()

    if (checklistBarang.semua) {
      subbab.push(await babBarang.generateSubDaftarPenambahan(tanggalLaporan, tanggalMulai, tanggalAkhir))
      subbab.push(await babBarang.generateSubDaftarKoreksi(tanggalLaporan, tanggalMulai, tanggalAkhir))
      subbab.push(await babBarang.generateSubDaftarKelompokLaku(tanggalLaporan, tanggalMulai, tanggalAkhir))
      subbab.push(await babBarang.generateSubDaftarKodeproLaku(tanggalLaporan, tanggalMulai, tanggalAkhir))
      subbab.push(await babBarang.generateSubDaftarKelompokMenipis())
      subbab.push(await babBarang.generateSubDaftarModelLaku(tanggalLaporan, tanggalMulai, tanggalAkhir))
    } else{
      if(checklistBarang.daftarPenambahan){
        subbab.push(await babBarang.generateSubDaftarPenambahan(tanggalLaporan, tanggalMulai, tanggalAkhir))
      }

      if(checklistBarang.daftarKoreksi){
        subbab.push(await babBarang.generateSubDaftarKoreksi(tanggalLaporan, tanggalMulai, tanggalAkhir))
      }


      if(checklistBarang.daftarKelompokLaku){
        subbab.push(await babBarang.generateSubDaftarKelompokLaku(tanggalLaporan, tanggalMulai, tanggalAkhir))
      }

      if(checklistBarang.daftarKodeproLaku){
        subbab.push(await babBarang.generateSubDaftarKodeproLaku(tanggalLaporan, tanggalMulai, tanggalAkhir))
      }

      if(checklistBarang.daftarKelompokMenipis){
        subbab.push(await babBarang.generateSubDaftarKelompokMenipis())
      }

      if(checklistBarang.daftarModelLaku){
        subbab.push(await babBarang.generateSubDaftarModelLaku(tanggalLaporan, tanggalMulai, tanggalAkhir))
      }
    }

    
    if (adaNext) {
      subbab.push({
        pageBreak: 'after',
        text: ''
      })
    }

    // 2. ------------------------ Wadah Bab ------------------------------------
    let bab = [{
        stack: [
          'LAPORAN PEMBUKUAN BARANG HARIAN',
          'TOKO MAS LEO',
          'TANGGAL ' + tanggalString
        ],
        style: 'judul',
        alignment: 'center',
      },
      {
        style: 'tabelKopBab',
        table: {
          widths: [80, 'auto', '*', 10, 80, 'auto', '*'],
          body: [
            ['Cabang Toko', ':', cabang, null, 'Tanggal Cetak', ':', tanggalCetak],
            ['Alamat Toko', ':', alamat, null, 'Pencetak', ':', pencetak],
          ],
        },
        layout: 'noBorders'
      },
      {
        type: 'upper-alpha',
        ol: subbab,
      }
    ]

    // 3. ------------------------ Return Selesai ----------------------------
    return bab
  }
}


// ========================================= METHOD UMUM =====================================================

function kapitalHurufPertama(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

function kapitalKalimat(text: string) {
  let pure = text.split(' ')
  let newText = ''
  for (let i = 0; i < pure.length; i++) {
    newText += kapitalHurufPertama(pure[i])
    if (i !== pure.length - 1) {
      newText += ' '
    }
  }
  return newText
}
