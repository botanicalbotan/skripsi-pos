// Ini cuma bikin ISI KONTEN yang bakal dipake buat bikin PDF di core controllernya

import Pengaturan from "App/Models/sistem/Pengaturan"
import {
  DateTime
} from 'luxon';
import { pasaranDariTanggal } from 'App/CustomClasses/CPasaran';
import Database from '@ioc:Adonis/Lucid/Database';
import User from "App/Models/User";


export default class KontenLaporan {
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
        margin: [0, 5, 0, 10]
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
      subBab: {
        fontSize: 12,
        margin: [0, 10, 0, 10]
      },
      kasMasuk: {
        color: 'green'
      },
      kasKeluar: {
        color: 'red'
      },
    }
  }

  async generateBabKas(checklistKas: {
    semua: boolean,
    rekap: boolean,
    daftar: boolean
  }, tanggalLaporan: string, tanggalMulai: DateTime, tanggalAkhir: DateTime) {
    // ================================================ Persiapan Data ==========================================================
    let placeholderUser = 1 // ini harusnya ngambil dari current active session
    const userPengkases = await User.findOrFail(placeholderUser)
    await userPengkases.load('pengguna', (query) => {
      query.preload('jabatan')
    })

    const pengaturan = await Pengaturan.findOrFail(1)

    let cabang = kapitalKalimat(pengaturan.namaToko)
    let totalHalaman = '6 halaman'
    let pencetak = kapitalKalimat(userPengkases.pengguna.nama) + ` (${userPengkases.pengguna.jabatan.nama})`
    let tanggalCetak = DateTime.now().toFormat('fff')

    let tanggalString = ''

    if (tanggalLaporan === 'pilih' || tanggalLaporan === 'mingguini') {
      tanggalString = tanggalMulai.toFormat('D') + ' - ' + tanggalAkhir.toFormat('D')
    } else {
      tanggalString = tanggalMulai.toFormat('D')
    }

    // ================================================ MULAI PRINT PDF ==========================================================

    // 1. ------------------------ Persiapan Subbab (konten asli) ----------------------
    let subbab: Array < any > = []

    if (checklistKas.semua) {
      subbab.push(await generateSubRekapKas(tanggalLaporan, tanggalMulai, tanggalAkhir))
      subbab.push(await generateSubDaftarKas(tanggalLaporan, tanggalMulai, tanggalAkhir))
    } else {
      if (checklistKas.rekap) {
        subbab.push(await generateSubRekapKas(tanggalLaporan, tanggalMulai, tanggalAkhir))
      }
 
      if (checklistKas.daftar) {
        subbab.push(await generateSubDaftarKas(tanggalLaporan, tanggalMulai, tanggalAkhir))
      }
    }


    // 2. ------------------------ Wadah Bab ------------------------------------
    let bab = [{
        stack: [
          'LAPORAN PEMBUKUAN KAS HARIAN',
          'TOKO MAS LEO',
          'TANGGAL ' + tanggalString
        ],
        style: 'judul',
        alignment: 'center'
      },
      {
        style: 'tabelKopBab',
        table: {
          widths: [80, 'auto', '*', 10, 80, 'auto', '*'],
          body: [
            ['Cabang', ':', cabang, null, 'Total Halaman', ':', totalHalaman],
            ['Pencetak', ':', pencetak, null, 'Tanggal Cetak', ':', tanggalCetak],
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

// ========================================= METHOD PENDUKUNG UTAMA ==========================================

async function generateSubRekapKas(tanggalLaporan: string, tanggalMulai: DateTime, tanggalAkhir: DateTime) {
  let tanggalString = ''
  let tanggalTunggal = false

  if (tanggalLaporan === 'pilih' || tanggalLaporan === 'mingguini') {
    tanggalTunggal = false
    tanggalString = tanggalMulai.toFormat('D') + ' - ' + tanggalAkhir.toFormat('D')
  } else {
    tanggalTunggal = true
    tanggalString = tanggalMulai.toFormat('D')
  }

  // ------------------------ Persiapan Data --------------------------------
  const totalKasMasuk = await Database
    .from('kas')
    .sum('nominal', 'nominal')
    .count('nominal', 'count')
    .whereNull('deleted_at')
    .andWhere('apakah_kas_keluar', 0)
    .if(tanggalTunggal, (query) => {
      query.whereRaw('DATE(kas.created_at) = DATE(?)', [tanggalMulai.toSQL()])
    })
    .if(!tanggalTunggal, (query) => {
      query
        .whereRaw('DATE(created_at) >= DATE(?)', [tanggalMulai.toSQL()]) // start
        .whereRaw('DATE(created_at) <= DATE(?)', [tanggalAkhir.toSQL()]) // end
    })

  const totalKasKeluar = await Database
    .from('kas')
    .sum('nominal', 'nominal')
    .count('nominal', 'count')
    .whereNull('deleted_at')
    .andWhere('apakah_kas_keluar', 1)
    .if(tanggalTunggal, (query) => {
      query.whereRaw('DATE(created_at) = DATE(?)', [tanggalMulai.toSQL()])
    })
    .if(!tanggalTunggal, (query) => {
      query
        .whereRaw('DATE(created_at) >= DATE(?)', [tanggalMulai.toSQL()]) // start
        .whereRaw('DATE(created_at) <= DATE(?)', [tanggalAkhir.toSQL()]) // end
    })

  const totalJual = await Database
    .from('penjualans')
    .sum('harga_jual_akhir', 'nominal')
    .whereNull('deleted_at')
    .if(tanggalTunggal, (query) => {
      query.whereRaw('DATE(created_at) = DATE(?)', [tanggalMulai.toSQL()])
    })
    .if(!tanggalTunggal, (query) => {
      query
        .whereRaw('DATE(created_at) >= DATE(?)', [tanggalMulai.toSQL()]) // start
        .whereRaw('DATE(created_at) <= DATE(?)', [tanggalAkhir.toSQL()]) // end
    })

  const totalBeli = await Database
    .from('pembelians')
    .sum('harga_beli_akhir', 'nominal')
    .whereNull('deleted_at')
    .if(tanggalTunggal, (query) => {
      query.whereRaw('DATE(created_at) = DATE(?)', [tanggalMulai.toSQL()])
    })
    .if(!tanggalTunggal, (query) => {
      query
        .whereRaw('DATE(created_at) >= DATE(?)', [tanggalMulai.toSQL()]) // start
        .whereRaw('DATE(created_at) <= DATE(?)', [tanggalAkhir.toSQL()]) // end
    })


  // ---------------------------- Mulai Print PDF --------------------------------
  let isiTabel = [
    ['Tanggal', ':', tanggalString],
    ['Pasaran', ':', (tanggalTunggal) ? kapitalHurufPertama(pasaranDariTanggal(tanggalMulai)) : 'Variatif'],
    ['Total pemasukan', ':', rupiahParser((totalJual[0].nominal | 0) + (totalKasMasuk[0].nominal | 0))],
    ['Jumlah kas masuk', ':', (totalKasMasuk[0].count | 0) + 1],
    ['Total pengeluaran', ':', rupiahParser((totalBeli[0].nominal | 0) + (totalKasKeluar[0].nominal | 0))],
    ['Jumlah kas keluar', ':', (totalKasKeluar[0].count | 0) + 1],
  ]

  if (tanggalLaporan === 'hariini') {
    const pengaturan = await Pengaturan.findOrFail(1)

    isiTabel.push([
      'Saldo terakhir',
      ':',
      rupiahParser(pengaturan.saldoToko)
    ])
  }

  return [{
    text: 'Rekap Pembukuan Kas',
    style: 'subBab'
  },
  {
    table: {
      widths: [100, 'auto', 200],
      headerRows: 1,
      body: isiTabel
    },
    style: 'tabelBasic'
  }
]
}

async function generateSubDaftarKas(tanggalLaporan: string, tanggalMulai: DateTime, tanggalAkhir: DateTime) {
  // -------------------------- PERSIAPAN DATA -----------------------------------
  let tanggalTunggal = false

  if (tanggalLaporan === 'pilih' || tanggalLaporan === 'mingguini') {
    tanggalTunggal = false
  } else {
    tanggalTunggal = true
  }

  // data total penjualan
  const totalJual = await Database
    .from('penjualans')
    .sum('harga_jual_akhir', 'nominal')
    .whereNull('deleted_at')
    .if(tanggalTunggal, (query) => {
      query.whereRaw('DATE(penjualans.created_at) = DATE(?)', [tanggalMulai.toSQL()])
    })
    .if(!tanggalTunggal, (query) => {
      query
        .whereRaw('DATE(penjualans.created_at) >= DATE(?)', [tanggalMulai.toSQL()]) // start
        .whereRaw('DATE(penjualans.created_at) <= DATE(?)', [tanggalAkhir.toSQL()]) // end
    })

  // data total pembelian
  const totalBeli = await Database
    .from('pembelians')
    .sum('harga_beli_akhir', 'nominal')
    .whereNull('deleted_at')
    .if(tanggalTunggal, (query) => {
      query.whereRaw('DATE(pembelians.created_at) = DATE(?)', [tanggalMulai.toSQL()])
    })
    .if(!tanggalTunggal, (query) => {
      query
        .whereRaw('DATE(pembelians.created_at) >= DATE(?)', [tanggalMulai.toSQL()]) // start
        .whereRaw('DATE(pembelians.created_at) <= DATE(?)', [tanggalAkhir.toSQL()]) // end
    })

  // data list kass
  const kass = await Database
    .from('penggunas')
    .join('kas', 'penggunas.id', 'kas.pengguna_id')
    .join('jabatans', 'penggunas.jabatan_id', 'jabatans.id')
    .select(
      'kas.apakah_kas_keluar as apakahKasKeluar',
      'kas.nominal as nominal',
      'kas.perihal as perihal',
      'penggunas.nama as pencatat',
      'jabatans.nama as jabatan',
      'kas.created_at as tanggal'
    )
    .whereNull('kas.deleted_at')
    .if(tanggalTunggal, (query) => {
      query.whereRaw('DATE(kas.created_at) = DATE(?)', [tanggalMulai.toSQL()])
    })
    .if(!tanggalTunggal, (query) => {
      query
        .whereRaw('DATE(kas.created_at) >= DATE(?)', [tanggalMulai.toSQL()]) // start
        .whereRaw('DATE(kas.created_at) <= DATE(?)', [tanggalAkhir.toSQL()]) // end
    })
    .orderBy('tanggal', 'asc')

  // ----------------------------- PRINT TABEL DAFTAR KAS ---------------------------------------

  var isiTabel: Array < any > [] = [];

  isiTabel.push([{
      text: 'Tanggal',
      style: 'tableHeader'
    },
    {
      text: 'Nominal',
      style: 'tableHeader'
    },
    {
      text: 'Perihal',
      style: 'tableHeader'
    },
    {
      text: 'Pencatat',
      style: 'tableHeader'
    }
  ]);

  // Buat data jual
  isiTabel.push([{
      text: 'Tanggal terkait'
    },
    {
      text: rupiahParser(totalJual[0].nominal | 0),
      style: 'kasMasuk'
    },
    'Total seluruh penjualan yang tercatat pada tanggal terkait',
    'Sistem'
  ])

  // Buat data beli
  isiTabel.push([{
      text: 'Tanggal terkait'
    },
    {
      text: rupiahParser(totalBeli[0].nominal | 0),
      style: 'kasKeluar'
    },
    'Total seluruh pembelian yang tercatat pada tanggal terkait',
    'Sistem'
  ])

  // Buat data selain jual sama beli
  kass.forEach(function (row) {
    var dataRow: any[] = [];

    dataRow.push({
      stack: [
        DateTime.fromJSDate(row.tanggal).toFormat('DDD'),
        DateTime.fromJSDate(row.tanggal).toFormat('T')
      ]
    })
    dataRow.push({
      text: rupiahParser(row['nominal']),
      style: (row.apakahKasKeluar) ? 'kasKeluar' : 'kasMasuk'
    })
    dataRow.push(row['perihal'].toString())
    dataRow.push({
      stack: [
        row.pencatat,
        `(${row.jabatan})`
      ]
    })


    isiTabel.push(dataRow);
  });

  return [{
      text: 'Daftar Kas Tercatat',
      style: 'subBab'
    },
    'Testing kalau misal mau ngasi data agak banyakan',
    {
      table: {
        widths: [75, '*', 200, '*'],
        headerRows: 1,
        body: isiTabel
      },
      style: 'tabelBasic'
    }
  ]
}

// ========================================= METHOD UMUM =====================================================

function rupiahParser(angka: number) {
  if (typeof angka == 'number') {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(angka)
  }
}

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
