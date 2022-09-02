import Database from '@ioc:Adonis/Lucid/Database';
import { pasaranDariTanggal } from 'App/CustomClasses/CPasaran';
import Pengaturan from 'App/Models/sistem/Pengaturan';
import {
  DateTime
} from 'luxon';

export default class BabKas {
  // ========================================= SUB REKAP KAS =====================================================
  async generateSubRekapKas(tanggalLaporan: string, tanggalMulai: DateTime, tanggalAkhir: DateTime) {
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
      bikinRowRekap('Tanggal', tanggalString),
      bikinRowRekap('Pasaran', (tanggalTunggal) ? kapitalHurufPertama(pasaranDariTanggal(tanggalMulai)) : 'Variatif'),
      bikinRowRekap('Total pemasukan', rupiahParser((totalJual[0].nominal | 0) + (totalKasMasuk[0].nominal | 0)), 'kasMasuk'),
      bikinRowRekap('Jumlah kas masuk', ((totalKasMasuk[0].count | 0) + 1).toString()),
      bikinRowRekap('Total pengeluaran', rupiahParser((totalBeli[0].nominal | 0) + (totalKasKeluar[0].nominal | 0)), 'kasKeluar'),
      bikinRowRekap('Jumlah kas keluar', ((totalKasKeluar[0].count | 0) + 1).toString()),
    ]

    if (tanggalLaporan === 'hariini') {
      const pengaturan = await Pengaturan.findOrFail(1)

      isiTabel.push(bikinRowRekap('Saldo terakhir', rupiahParser(pengaturan.saldoToko)))
    }

    return [{
        text: 'Rekap Pembukuan Kas',
        style: 'subBab'
      },
      {
        text: `Pada subbab ini, akan dilampirkan rekap olahan data dari seluruh kas yang tercatat pada sistem pada tanggal ${tanggalString}. Berikut selengkapnya:`,
        style: 'paragrafNormal'
      },
      {
        table: {
          widths: [120, 'auto', 200],
          headerRows: 1,
          body: isiTabel,
          dontBreakRows: true
        },
        style: 'tabelBasic'
      }
    ]
  }

  // ========================================= SUB DAFTAR KAS =====================================================
  async generateSubDaftarKas(tanggalLaporan: string, tanggalMulai: DateTime, tanggalAkhir: DateTime) {
    let tanggalTunggal = false
    let tanggalString = ''

    if (tanggalLaporan === 'pilih' || tanggalLaporan === 'mingguini') {
      tanggalString = tanggalMulai.toFormat('D') + ' - ' + tanggalAkhir.toFormat('D')
      tanggalTunggal = false
    } else {
      tanggalString = tanggalMulai.toFormat('D')
      tanggalTunggal = true
    }

    // -------------------------- PERSIAPAN DATA -----------------------------------
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
          DateTime.fromJSDate(row.tanggal).toFormat('f'),
          // DateTime.fromJSDate(row.tanggal).toFormat('T')
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
          `<${row.jabatan}>`
        ]
      })


      isiTabel.push(dataRow);
    });

    return [{
        text: 'Daftar Kas Tercatat',
        style: 'subBab'
      },
      {
        text: `Pada subbab ini, akan dilampirkan daftar seluruh kas tercatat pada sistem pada tanggal ${tanggalString}. Isi kolom nominal dari tabel akan diberi warna sesuai dengan jenis pembukuan kas, yakni warna hijau untuk kas masuk (kredit) dan warna merah untuk kas keluar (debit). Berikut selengkapnya:`,
        style: 'paragrafNormal'
      },
      {
        table: {
          widths: [80, '*', 200, '*'],
          headerRows: 1,
          body: isiTabel,
          dontBreakRows: true
        },
        style: 'tabelBasic'
      }
    ]
  }
}

// ========================================= METHOD UMUM =====================================================
function bikinRowRekap(soal: string, jawab: string, style: string = '') {
  return [{
    text: soal,
    border: [true, true, false, true]
  }, {
    text: ':',
    border: [false, true, false, true]
  }, {
    text: jawab,
    border: [false, true, true, true],
    style: style
  }]
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
