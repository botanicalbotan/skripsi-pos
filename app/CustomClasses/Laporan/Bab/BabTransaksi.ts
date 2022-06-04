import Database from '@ioc:Adonis/Lucid/Database';
import CPasaran from 'App/CustomClasses/CPasaran';
import {
  DateTime
} from 'luxon';

export default class BabTransaksi {
  // ========================================= SUB REKAP TRANSAKSI =====================================================

  async generateSubRekapTransaksi(tanggalLaporan: string, tanggalMulai: DateTime, tanggalAkhir: DateTime) {
    let tanggalString = ''
    let tanggalTunggal = false

    if (tanggalLaporan === 'pilih' || tanggalLaporan === 'mingguini') {
      tanggalTunggal = false
      tanggalString = tanggalMulai.toFormat('D') + ' - ' + tanggalAkhir.toFormat('D')
    } else {
      tanggalTunggal = true
      tanggalString = tanggalMulai.toFormat('D')
    }

    const pasar = new CPasaran()

    // ------------------------ Persiapan Data --------------------------------
    const rekapPJ = await Database
      .from('penjualans')
      .select(
        Database.raw('IFNULL(COUNT(id), 0) as jumlahPJ')
      )
      .select(
        Database.raw('IFNULL(SUM(berat_barang), 0) as totalBerat')
      )
      .select(
        Database.raw('IFNULL(SUM(harga_jual_akhir), 0) as totalHarga')
      )
      .whereNull('penjualans.deleted_at')
      .if(tanggalTunggal, (query) => {
        query.whereRaw('DATE(created_at) = DATE(?)', [tanggalMulai.toSQL()])
      })
      .if(!tanggalTunggal, (query) => {
        query
          .whereRaw('DATE(created_at) >= DATE(?)', [tanggalMulai.toSQL()]) // start
          .whereRaw('DATE(created_at) <= DATE(?)', [tanggalAkhir.toSQL()]) // end
      })
      .first()

    const rekapbeli = await Database
      .from('pembelians')
      .select(
        Database.raw('IFNULL(COUNT(id), 0) as jumlahpb')
      )
      .select(
        Database.raw('IFNULL(SUM(berat_barang), 0) as totalBerat')
      )
      .select(
        Database.raw('IFNULL(SUM(harga_beli_akhir), 0) as totalHarga')
      )
      .whereNull('pembelians.deleted_at')
      .if(tanggalTunggal, (query) => {
        query.whereRaw('DATE(created_at) = DATE(?)', [tanggalMulai.toSQL()])
      })
      .if(!tanggalTunggal, (query) => {
        query
          .whereRaw('DATE(created_at) >= DATE(?)', [tanggalMulai.toSQL()]) // start
          .whereRaw('DATE(created_at) <= DATE(?)', [tanggalAkhir.toSQL()]) // end
      })
      .first()

    const beliUripan = await Database
      .from('pembelians')
      .select(
        Database.raw('IFNULL(COUNT(id), 0) as jumlahpb')
      )
      .whereNull('deleted_at')
      .andWhere('kondisi_fisik', 'uripan')
      .if(tanggalTunggal, (query) => {
        query.whereRaw('DATE(created_at) = DATE(?)', [tanggalMulai.toSQL()])
      })
      .if(!tanggalTunggal, (query) => {
        query
          .whereRaw('DATE(created_at) >= DATE(?)', [tanggalMulai.toSQL()]) // start
          .whereRaw('DATE(created_at) <= DATE(?)', [tanggalAkhir.toSQL()]) // end
      })
      .first()

    const beliRusak = await Database
      .from('pembelians')
      .select(
        Database.raw('IFNULL(COUNT(id), 0) as jumlahpb')
      )
      .whereNull('deleted_at')
      .andWhere('kondisi_fisik', 'rusak')
      .if(tanggalTunggal, (query) => {
        query.whereRaw('DATE(created_at) = DATE(?)', [tanggalMulai.toSQL()])
      })
      .if(!tanggalTunggal, (query) => {
        query
          .whereRaw('DATE(created_at) >= DATE(?)', [tanggalMulai.toSQL()]) // start
          .whereRaw('DATE(created_at) <= DATE(?)', [tanggalAkhir.toSQL()]) // end
      })
      .first()

    const beliRosok = await Database
      .from('pembelians')
      .select(
        Database.raw('IFNULL(COUNT(id), 0) as jumlahpb')
      )
      .whereNull('deleted_at')
      .andWhere('kondisi_fisik', 'rosok')
      .if(tanggalTunggal, (query) => {
        query.whereRaw('DATE(created_at) = DATE(?)', [tanggalMulai.toSQL()])
      })
      .if(!tanggalTunggal, (query) => {
        query
          .whereRaw('DATE(created_at) >= DATE(?)', [tanggalMulai.toSQL()]) // start
          .whereRaw('DATE(created_at) <= DATE(?)', [tanggalAkhir.toSQL()]) // end
      })
      .first()


    // const gadaiAktif = await Database
    //   .from('gadais')
    //   .join('status_gadais', 'gadais.status_gadai_id', 'status_gadais.id')
    //   .select(
    //     Database.raw('IFNULL(COUNT(gadais.id), 0) as total')
    //   )
    //   .whereNull('gadais.deleted_at')
    //   .andWhere('status_gadais.status', 'berjalan')
    //   .if(tanggalTunggal, (query) => {
    //     query.whereRaw('DATE(gadais.created_at) = DATE(?)', [tanggalMulai.toSQL()])
    //   })
    //   .if(!tanggalTunggal, (query) => {
    //     query
    //       .whereRaw('DATE(gadais.created_at) >= DATE(?)', [tanggalMulai.toSQL()]) // start
    //       .whereRaw('DATE(gadais.created_at) <= DATE(?)', [tanggalAkhir.toSQL()]) // end
    //   })
    //   .first()

    // const gadaiTerlambat = await Database
    //   .from('gadais')
    //   .join('status_gadais', 'gadais.status_gadai_id', 'status_gadais.id')
    //   .select(
    //     Database.raw('IFNULL(COUNT(gadais.id), 0) as total')
    //   )
    //   .whereNull('gadais.deleted_at')
    //   .andWhere('status_gadais.status', 'terlambat')
    //   .if(tanggalTunggal, (query) => {
    //     query.whereRaw('DATE(gadais.created_at) = DATE(?)', [tanggalMulai.toSQL()])
    //   })
    //   .if(!tanggalTunggal, (query) => {
    //     query
    //       .whereRaw('DATE(gadais.created_at) >= DATE(?)', [tanggalMulai.toSQL()]) // start
    //       .whereRaw('DATE(gadais.created_at) <= DATE(?)', [tanggalAkhir.toSQL()]) // end
    //   })
    //   .first()

    // ---------------------------- Mulai Print PDF --------------------------------
    let isiTabel = [
      bikinPemisahRekap('Data Umum'),
      bikinRowRekap('Tanggal', tanggalString),
      bikinRowRekap('Pasaran', (tanggalTunggal) ? kapitalHurufPertama(pasar.pasaranDariTanggal(tanggalMulai)) : 'Variatif'),

      bikinPemisahRekap('Transaksi Penjualan'),
      bikinRowRekap('Total pemasukan', rupiahParser(rekapPJ.totalHarga)),
      bikinRowRekap('Jumlah penjualan', rekapPJ.jumlahPJ),
      bikinRowRekap('Total gram terjual', `${rekapPJ.totalBerat} gram`),

      bikinPemisahRekap('Transaksi Pembelian'),
      bikinRowRekap('Total pengeluaran', rupiahParser(rekapbeli.totalHarga)),
      bikinRowRekap('Jumlah pembelian', rekapbeli.jumlahpb),
      bikinRowRekap('Total gram terbeli', `${rekapbeli.totalBerat} gram`),
      bikinRowRekap('Jumlah pembelian perhiasan uripan', beliUripan.jumlahpb),
      bikinRowRekap('Jumlah pembelian perhiasan rusak', beliRusak.jumlahpb),
      bikinRowRekap('Jumlah pembelian perhiasan rosok', beliRosok.jumlahpb),

      // bikinPemisahRekap('Transaksi Gadai'),
      // bikinRowRekap('Total gadai aktif', gadaiAktif.total),
      // bikinRowRekap('Total gadai terlambat', gadaiTerlambat.total),
    ]

    return [{
        text: 'Rekap Pembukuan Transaksi',
        style: 'subBab'
      },
      `Pada subbab ini, akan dilampirkan rekap olahan data dari seluruh transaksi penjualan, pembelian dan gadai yang tercatat pada sistem pada tanggal ${tanggalString}. Berikut selengkapnya:`,
      {
        table: {
          widths: [120, 'auto', 200],
          headerRows: 1,
          body: isiTabel
        },
        style: 'tabelBasic'
      }
    ]

  }

  // ========================================= SUB DAFTAR JUAL =====================================================

  async generateSubDaftarPenjualan(tanggalLaporan: string, tanggalMulai: DateTime, tanggalAkhir: DateTime) {
    let tanggalTunggal = false
    let tanggalString = ''

    if (tanggalLaporan === 'pilih' || tanggalLaporan === 'mingguini') {
      tanggalString = tanggalMulai.toFormat('D') + ' - ' + tanggalAkhir.toFormat('D')
      tanggalTunggal = false
    } else {
      tanggalString = tanggalMulai.toFormat('D')
      tanggalTunggal = true
    }

    // -------------------------- PERSIAPAN DATA ---------------------------------------------------
    const penjualans = await Database
      .from('penggunas')
      .join('penjualans', 'penggunas.id', 'penjualans.pengguna_id')
      .join('jabatans', 'penggunas.jabatan_id', 'jabatans.id')
      .join('kode_produksis', 'penjualans.kode_produksi_id', 'kode_produksis.id') // gatau bisa gini apa ngga, kalau error ganti
      .join('kadars', 'kode_produksis.kadar_id', 'kadars.id')
      .join('kelompoks', 'penjualans.kelompok_id', 'kelompoks.id')
      .join('bentuks', 'kelompoks.bentuk_id', 'bentuks.id')
      .select(
        'penjualans.id as id',
        'penjualans.nama_barang as namaBarang',
        'penjualans.created_at as createdAt',
        'penjualans.harga_jual_akhir as hargaJualAkhir',
        'penjualans.berat_barang as beratBarang',
        'penggunas.nama as pencatat',
        'jabatans.nama as jabatan',
        'kode_produksis.kode as kodepro',
        'kadars.nama as kadar',
        'kadars.warna_nota as warnaNota',
        'bentuks.bentuk as bentuk'
      )
      .whereNull('penjualans.deleted_at')
      .if(tanggalTunggal, (query) => {
        query.whereRaw('DATE(penjualans.created_at) = DATE(?)', [tanggalMulai.toSQL()])
      })
      .if(!tanggalTunggal, (query) => {
        query
          .whereRaw('DATE(penjualans.created_at) >= DATE(?)', [tanggalMulai.toSQL()]) // start
          .whereRaw('DATE(penjualans.created_at) <= DATE(?)', [tanggalAkhir.toSQL()]) // end
      })
      .orderBy('createdAt', 'asc')

    // ----------------------------- PRINT TABEL DAFTAR JUAL ---------------------------------------

    var isiTabel: Array < any > [] = [];
    isiTabel.push([{
        text: 'Tanggal',
        style: 'tableHeader'
      },
      {
        text: 'Harga Jual',
        style: 'tableHeader'
      },
      {
        text: 'Nama Barang',
        style: 'tableHeader'
      },
      {
        text: 'Pencatat',
        style: 'tableHeader'
      }
    ]);

    penjualans.forEach(function (row) {
      var dataRow: any[] = [];

      dataRow.push({
        stack: [
          DateTime.fromJSDate(row.createdAt).toFormat('f'),
          // DateTime.fromJSDate(row.createdAt).toFormat('T')
        ]
      })
      dataRow.push({
        text: rupiahParser(row['hargaJualAkhir'])
      })
      dataRow.push({
        stack: [
          row.namaBarang,
          {
            text: `${row.bentuk} ${row.kadar} <${row.kodepro}>`,
            color: row.warnaNota
          },
          // `Kode: ${row.kodepro}`
        ]
      })
      dataRow.push({
        stack: [
          row.pencatat,
          `<${row.jabatan}>`
        ]
      })


      isiTabel.push(dataRow);
    });

    if (!penjualans || penjualans.length == 0) {
      isiTabel.push([{
        text: 'Tidak ada data!',
        colSpan: 4,
        alignment: 'center'
      }])
    }


    return [{
        text: 'Daftar Transaksi Penjualan',
        style: 'subBab'
      },
      `Pada subbab ini, akan dilampirkan daftar seluruh penjualan yang tercatat pada sistem pada tanggal ${tanggalString}. Kolom nama barang akan dilengkapi dengan informasi kadar dan bentuk perhiasan, serta penanda warna sesuai dengan warna nota yang diatur pada sistem. Berikut selengkapnya:`,
      {
        table: {
          widths: [80, '*', 200, '*'],
          headerRows: 1,
          body: isiTabel
        },
        style: 'tabelBasic'
      }
    ]
  }

  async generateSubDaftarPembelian(tanggalLaporan: string, tanggalMulai: DateTime, tanggalAkhir: DateTime) {
    let tanggalTunggal = false
    let tanggalString = ''

    if (tanggalLaporan === 'pilih' || tanggalLaporan === 'mingguini') {
      tanggalString = tanggalMulai.toFormat('D') + ' - ' + tanggalAkhir.toFormat('D')
      tanggalTunggal = false
    } else {
      tanggalString = tanggalMulai.toFormat('D')
      tanggalTunggal = true
    }

    // -------------------------- PERSIAPAN DATA ---------------------------------------------------

    // DATANYA BELOM FIX, MASIH BINGUNGG AWYEEAHHHH
    const pembelians = await Database
      .from('pembelians')
      .join('kode_produksis', 'pembelians.kode_produksi_id', 'kode_produksis.id')
      .join('kadars', 'kode_produksis.kadar_id', 'kadars.id')
      .join('models', 'pembelians.model_id', 'models.id')
      .join('bentuks', 'models.bentuk_id', 'bentuks.id')
      .join('penggunas', 'pembelians.pengguna_id', 'penggunas.id')
      .join('jabatans', 'penggunas.jabatan_id', 'jabatans.id')
      .select(
        'pembelians.nama_barang as namaBarang',
        'pembelians.kondisi_fisik as kondisiFisik',
        'pembelians.harga_beli_akhir as hargaBeliAkhir',
        'pembelians.created_at as createdAt',
        'kode_produksis.kode as kodepro',
        'kadars.warna_nota as warnaNota',
        'kadars.nama as kadar',
        'bentuks.bentuk as bentuk',
        'penggunas.nama as pencatat',
        'jabatans.nama as jabatan'
      )
      .whereNull('pembelians.deleted_at')
      .if(tanggalTunggal, (query) => {
        query.whereRaw('DATE(pembelians.created_at) = DATE(?)', [tanggalMulai.toSQL()])
      })
      .if(!tanggalTunggal, (query) => {
        query
          .whereRaw('DATE(pembelians.created_at) >= DATE(?)', [tanggalMulai.toSQL()]) // start
          .whereRaw('DATE(pembelians.created_at) <= DATE(?)', [tanggalAkhir.toSQL()]) // end
      })
      .orderBy('pembelians.created_at', 'asc')


    // ----------------------------- PRINT TABEL DAFTAR BELI ---------------------------------------

    var isiTabel: Array < any > [] = [];
    isiTabel.push([{
        text: 'Tanggal',
        style: 'tableHeader'
      },
      {
        text: 'Harga Beli',
        style: 'tableHeader'
      },
      {
        text: 'Nama Barang',
        style: 'tableHeader'
      },
      {
        text: 'Pencatat',
        style: 'tableHeader'
      }
    ]);

    // DISINI HARUNYSA BUAT NGEAPPEND ISI TABEL, TP DATATNYA LOM FIX, MASI BINGUNG
    pembelians.forEach(function (row) {
      var dataRow: any[] = [];

      dataRow.push({
        stack: [
          DateTime.fromJSDate(row.createdAt).toFormat('f'),
          // DateTime.fromJSDate(row.createdAt).toFormat('T')
        ]
      })
      dataRow.push({
        text: rupiahParser(row['hargaBeliAkhir'])
      })
      dataRow.push({
        stack: [
          row.namaBarang,
          {
            text: `${row.bentuk} ${row.kadar} <${row.kodepro}>`,
            color: row.warnaNota
          }
        ]
      })
      dataRow.push({
        stack: [
          row.pencatat,
          `<${row.jabatan}>`
        ]
      })


      isiTabel.push(dataRow);
    });

    if (!pembelians || pembelians.length == 0) {
      isiTabel.push([{
        text: 'Tidak ada data!',
        colSpan: 4,
        alignment: 'center'
      }])
    }

    return [{
        text: 'Daftar Transaksi Pembelian',
        style: 'subBab'
      },
      `Pada subbab ini, akan dilampirkan daftar seluruh penjualan yang tercatat pada sistem pada tanggal ${tanggalString}. Kolom nama barang akan dilengkapi dengan informasi kadar dan bentuk perhiasan, serta penanda warna sesuai dengan warna nota yang diatur pada sistem. Berikut selengkapnya:`,
      {
        table: {
          widths: [80, '*', 200, '*'],
          headerRows: 1,
          body: isiTabel
        },
        style: 'tabelBasic'
      }
    ]
  }

  // async generateSubDaftarGadai(tanggalLaporan: string, tanggalMulai: DateTime, tanggalAkhir: DateTime) {
  //   // let tanggalTunggal = false
  //   let tanggalString = ''

  //   if (tanggalLaporan === 'pilih' || tanggalLaporan === 'mingguini') {
  //     tanggalString = tanggalMulai.toFormat('D') + ' - ' + tanggalAkhir.toFormat('D')
  //     //   tanggalTunggal = false
  //   } else {
  //     tanggalString = tanggalMulai.toFormat('D')
  //     //   tanggalTunggal = true
  //   }

  //   // -------------------------- PERSIAPAN DATA ---------------------------------------------------
  //   let gadais = await Database
  //     .from('gadais')
  //     .join('status_gadais', 'gadais.status_gadai_id', 'status_gadais.id')
  //     .join('penggunas', 'gadais.pengguna_id', 'penggunas.id')
  //     .select(
  //       "status_gadais.status as status",
  //       "gadais.tanggal_tenggat as tanggalTenggat",
  //       "gadais.nama_penggadai as namaPenggadai",
  //       "gadais.alamat_penggadai as alamatPenggadai",
  //       "gadais.nominal_gadai as nominalGadai",
  //       "penggunas.nama as pencatat"
  //     )
  //     .whereNull('gadais.deleted_at')
  //     .andWhere('status_gadais.status', 'berjalan')
  //     .orWhere('status_gadais.status', 'terlambat')

  //   // ----------------------------- PRINT TABEL DAFTAR GADAI ---------------------------------------

  //   var isiTabel: Array < any > [] = [];
  //   isiTabel.push([{
  //       text: 'Tenggat',
  //       style: 'tableHeader'
  //     },
  //     {
  //       text: 'Nominal Gadai',
  //       style: 'tableHeader'
  //     },
  //     {
  //       text: 'Identitas Peminjam',
  //       style: 'tableHeader'
  //     },
  //     {
  //       text: 'Pencatat',
  //       style: 'tableHeader'
  //     }
  //   ]);


  //   gadais.forEach(function (row) {
  //     var dataRow: any[] = [];

  //     dataRow.push({
  //       stack: [
  //         DateTime.fromJSDate(row.tanggalTenggat).toFormat('DDD'),
  //         {
  //           text: row.status,
  //           color: (row.status === 'terlambat') ? 'red' : 'green'
  //         }
  //       ]
  //     })
  //     dataRow.push({
  //       text: rupiahParser(row['nominalGadai'])
  //     })
  //     dataRow.push({
  //       stack: [
  //         row.namaPenggadai,
  //         `(${row.alamatPenggadai})`
  //       ]
  //     })
  //     // dataRow.push({
  //     //   stack: [
  //     //     row.pencatat,
  //     //     `(${row.jabatan})`
  //     //   ]
  //     // })

  //     dataRow.push(row.pencatat)


  //     isiTabel.push(dataRow);
  //   });

  //   if (!gadais || gadais.length == 0) {
  //     isiTabel.push([{
  //       text: 'Tidak ada data!',
  //       colSpan: 4,
  //       alignment: 'center'
  //     }])
  //   }


  //   return [{
  //       text: 'Daftar Transaksi Gadai Berjalan & Terlambat',
  //       style: 'subBab'
  //     },
  //     `Pada subbab ini, akan dilampirkan daftar seluruh gadai dengan status "berjalan" dan "terlambat" yang tercatat pada sistem pada tanggal ${tanggalString}. Kolom nama barang akan dilengkapi dengan informasi kadar dan bentuk perhiasan, serta penanda warna sesuai dengan warna nota yang diatur pada sistem. Berikut selengkapnya:`,
  //     {
  //       table: {
  //         widths: [85, '*', 200, '*'],
  //         headerRows: 1,
  //         body: isiTabel
  //       },
  //       style: 'tabelBasic'
  //     }
  //   ]
  // }

}

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

function bikinPemisahRekap(teks: string) {
  return [{
    ul: [teks],
    // border: [true, true, false, true],
    fillColor: '#eeeeee',
    colSpan: 3
  }, {}, {}]
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
