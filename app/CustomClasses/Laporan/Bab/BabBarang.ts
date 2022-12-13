import Database from "@ioc:Adonis/Lucid/Database";
import {
  DateTime
} from "luxon";

export default class BabBarang {
  async generateSubDaftarPenambahan(tanggalLaporan: string, tanggalMulai: DateTime, tanggalAkhir: DateTime) {
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
    var olDalem: Array < any > = [];

    const listPenambahan = await Database
      .from('penambahan_stoks')
      .join('penggunas', 'penambahan_stoks.pengguna_id', 'penggunas.id')
      .join('jabatans', 'penggunas.jabatan_id', 'jabatans.id')
      .select(
        'penambahan_stoks.id as id',
        'penambahan_stoks.apakah_kulakan as apakahKulakan',
        'penambahan_stoks.asal_stok as asalStok',
        'penambahan_stoks.catatan as catatan',
        'penggunas.nama as pencatat',
        'jabatans.nama as jabatan',
        'penambahan_stoks.created_at as createdAt'
      )
      .select(
        Database
        .from('kelompok_penambahans')
        .count('id')
        .whereColumn('kelompok_penambahans.penambahan_stok_id', 'penambahan_stoks.id')
        .as('jumlahKelompok')
      )
      .if(tanggalTunggal, (query) => {
        query.whereRaw('DATE(penambahan_stoks.created_at) = DATE(?)', [tanggalMulai.toSQL()])
      })
      .if(!tanggalTunggal, (query) => {
        query
          .whereRaw('DATE(penambahan_stoks.created_at) >= DATE(?)', [tanggalMulai.toSQL()]) // start
          .whereRaw('DATE(penambahan_stoks.created_at) <= DATE(?)', [tanggalAkhir.toSQL()]) // end
      })
      .orderBy('penambahan_stoks.created_at', 'asc')

    if (listPenambahan && listPenambahan.length > 0) {

      for (const item of listPenambahan) {
        let subBabBab: Array < any > = []
        let tanggalJudul = DateTime.fromJSDate(item.createdAt).toFormat('fff')

        subBabBab.push({
          text: `Penambahan Stok ${tanggalJudul}`,
          style: 'olJudul'
        })

        subBabBab.push({
          text: `Berikut merupakan rekap dari penambahan stok ini:`,
          style: 'olKonten'
        })

        subBabBab.push({
          table: {
            widths: [120, 'auto', 200],
            // headerRows: 1,
            body: [
              bikinRowRekap('Tanggal & waktu', tanggalJudul),
              bikinRowRekap('Tipe penambahan', (item.apakahKulakan) ? 'Kulakan' : 'Cucian'),
              bikinRowRekap('Asal stok', item.asalStok),
              bikinRowRekap('Kelompok termutasi', item.jumlahKelompok),
              bikinRowRekap('Catatan', item.catatan),
              bikinRowRekap('Pencatat', `${item.pencatat} <${item.jabatan}>`),
            ]
          },
          style: 'olTabel',
          unbreakable: true
        })

        subBabBab.push({
          text: `Berikut merupakan daftar kelompok yang stoknya bertambah pada penambahan stok ini:`,
          style: 'olKonten'
        })

        let subTabel: Array < any > = []

        subTabel.push([{
            text: 'Tanggal',
            style: 'tableHeader'
          },
          {
            text: 'Kelompok',
            style: 'tableHeader'
          },
          {
            text: 'Perubahan Stok',
            style: 'tableHeader'
          },
          {
            text: 'Stok Akhir',
            style: 'tableHeader'
          }
        ]);

        const items = await Database
          .from('kelompok_penambahans')
          .join('kelompoks', 'kelompok_penambahans.kelompok_id', 'kelompoks.id')
          .join('bentuks', 'kelompoks.bentuk_id', 'bentuks.id')
          .join('kadars', 'kelompoks.kadar_id', 'kadars.id')
          .select(
            'kelompok_penambahans.perubahan_stok as perubahanStok',
            'kelompok_penambahans.stok_akhir as stokAkhir',
            'kelompok_penambahans.created_at as createdAt',
            'kelompoks.nama as namaKelompok',
            'bentuks.bentuk as bentuk',
            'kadars.nama as kadar',
            'kadars.warna_nota as warnaNota',
          )
          .where('kelompok_penambahans.penambahan_stok_id', item.id)

        if (items && items.length > 0) {
          for (const row of items) {
            var dataRow: any[] = [];
            dataRow.push(DateTime.fromJSDate(row.createdAt).toFormat('f'))

            dataRow.push({
              stack: [
                row.namaKelompok,
                {
                  text: `${row.bentuk} ${row.kadar}`,
                  color: row.warnaNota
                }
              ]
            })

            dataRow.push({
              text: `+ ${row.perubahanStok}`,
              color: 'green'
            })

            dataRow.push(row.stokAkhir)

            subTabel.push(dataRow)
          }

        } else {
          subTabel.push([{
            text: 'Tidak ada data!',
            colSpan: 4,
            alignment: 'center'
          }])
        }

        subBabBab.push({
          table: {
            widths: [80, 200, 80, 80],
            headerRows: 1,
            body: subTabel,
            dontBreakRows: true
          },
          style: 'olTabel',
          // unbreakable: true
        })

        olDalem.push(subBabBab)
      }
    }

    let wadah: any
    if(listPenambahan.length > 0){
      wadah = {
        ol: olDalem,
        style: 'olWadah'
      }
    } else {
      wadah = {
        text: 'Tidak ada penambahan stok',
        style: 'olWadahKosong'
      }
    }

    return [{
        text: 'Daftar Penambahan Stok (Restok) Kelompok',
        style: 'subBab'
      },
      {
        text: `Pada subbab ini, dilampirkan daftar seluruh penambahan stok yang tercatat pada sistem pada tanggal ${tanggalString}. Kolom nama barang dilengkapi dengan informasi kadar dan bentuk perhiasan, serta penanda warna sesuai dengan warna nota yang diatur pada sistem. Penambahan dicetak per kelompok berdasarkan waktu dan kelompok pencatatannya. Berikut selengkapnya:`,
        lineHeight: 1.5
      },
      wadah
    ]
  }

  // legacy, kali aja butuh referensi, tp ga dipake sekarang
  async generateSubDaftarKoreksi(tanggalLaporan: string, tanggalMulai: DateTime, tanggalAkhir: DateTime) {
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
    var olDalem: Array < any > = [];

    const listKoreksis = await Database
      .from('koreksi_stoks')
      .join('kelompoks', 'koreksi_stoks.kelompok_id', 'kelompoks.id')
      .join('bentuks', 'kelompoks.bentuk_id', 'bentuks.id')
      .join('kadars', 'kelompoks.kadar_id', 'kadars.id')
      .join('penggunas', 'koreksi_stoks.pengguna_id', 'penggunas.id')
      .join('jabatans', 'penggunas.jabatan_id', 'jabatans.id')
      .select(
        'koreksi_stoks.created_at as createdAt',
        'koreksi_stoks.perubahan_stok as perubahanStok',
        'koreksi_stoks.stok_akhir as stokAkhir',
        'koreksi_stoks.alasan as alasan',
        'penggunas.nama as pencatat',
        'jabatans.nama as jabatan',
        'kelompoks.nama as namaKelompok',
        'kadars.nama as kadar',
        'kadars.warna_nota as warnaNota',
        'bentuks.bentuk as bentuk'
      )
      .if(tanggalTunggal, (query) => {
        query.whereRaw('DATE(koreksi_stoks.created_at) = DATE(?)', [tanggalMulai.toSQL()])
      })
      .if(!tanggalTunggal, (query) => {
        query
          .whereRaw('DATE(koreksi_stoks.created_at) >= DATE(?)', [tanggalMulai.toSQL()]) // start
          .whereRaw('DATE(koreksi_stoks.created_at) <= DATE(?)', [tanggalAkhir.toSQL()]) // end
      })
      .orderBy('koreksi_stoks.created_at', 'asc')

    // ----------------------------- PRINT TABEL DAFTAR KOREKSI ---------------------------------------

    if (listKoreksis && listKoreksis.length > 0) {
      for (const item of listKoreksis) {
        let subBabBab: Array < any > = []
        let tanggalJudul = DateTime.fromJSDate(item.createdAt).toFormat('fff')

        subBabBab.push({
          text: `Koreksi Stok ${item.namaKelompok} [${tanggalJudul}]`,
          style: 'olJudul'
        })

        subBabBab.push({
          text: `Berikut merupakan rekap dari koreksi stok kelompok ini:`,
          style: 'olKonten'
        })

        subBabBab.push({
          table: {
            widths: [120, 'auto', 200],
            // headerRows: 1,
            body: [
              bikinRowRekap('Tanggal & waktu', tanggalJudul),
              bikinRowRekap('Nama kelompok', item.namaKelompok),
              bikinRowRekap('Bentuk & kadar', `${item.bentuk} ${item.kadar}`, {
                color: item.warnaNota
              }),
              bikinRowRekap('Perubahan stok', item.perubahanStok, (item.perubahanStok >= 0) ? 'kasMasuk' : 'kasKeluar'),
              bikinRowRekap('Stok akhir', item.stokAkhir),
              bikinRowRekap('Alasan', item.alasan),
              bikinRowRekap('Pencatat', `${item.pencatat} <${item.jabatan}>`),
            ]
          },
          style: 'olTabel',
          unbreakable: true
        })

        olDalem.push(subBabBab)
      }
    }

    return [{
        text: 'Daftar Koreksi Stok Kelompok',
        style: 'subBab'
      },
      {
        text: `Pada subbab ini, dilampirkan daftar seluruh koreksi stok kelompok yang tercatat pada sistem pada tanggal ${tanggalString}. Karena koreksi stok memiliki data yang banyak, maka tiap datanya dicetak 1 kelompok per 1 kali koreksi. Berikut selengkapnya:`,
        style: 'paragrafNormal'
      },
      {
        ol: olDalem,
        style: 'olWadah'
      }
    ]
  }

  async generateSubDaftarPenyesuaian(tanggalLaporan: string, tanggalMulai: DateTime, tanggalAkhir: DateTime) {
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
    const listPenyesuaian = await Database
      .from('penyesuaian_stoks')
      .join('kelompoks', 'kelompoks.id', 'penyesuaian_stoks.kelompok_id')
      .join('kadars', 'kelompoks.kadar_id', 'kadars.id')
      .join('bentuks', 'kelompoks.bentuk_id', 'bentuks.id')
      .join('penggunas', 'penggunas.id', 'penyesuaian_stoks.pengguna_id')
      .join('jabatans', 'penggunas.jabatan_id', 'jabatans.id')
      .select(
        'kelompoks.nama as namaKel',
        'kadars.nama as kadar',
        'kadars.warna_nota as warnaNota',
        'bentuks.bentuk as bentuk',
        'penyesuaian_stoks.created_at as createdAt',
        'penyesuaian_stoks.stok_tercatat as stokTercatat',
        'penyesuaian_stoks.stok_sebenarnya as stokSebenarnya',
        'penyesuaian_stoks.butuh_cek_ulang as butuhCekUlang',
        'penggunas.nama as pencatat',
        'jabatans.nama as jabatan',        
      )
      .whereNull('kelompoks.deleted_at')
      .if(tanggalTunggal, (query) => {
        query.whereRaw('DATE(penyesuaian_stoks.created_at) = DATE(?)', [tanggalMulai.toSQL()])
      })
      .if(!tanggalTunggal, (query) => {
        query
          .whereRaw('DATE(penyesuaian_stoks.created_at) >= DATE(?)', [tanggalMulai.toSQL()]) // start
          .whereRaw('DATE(penyesuaian_stoks.created_at) <= DATE(?)', [tanggalAkhir.toSQL()]) // end
      })
      .orderBy('createdAt', 'asc')

    // ----------------------------- PRINT TABEL DAFTAR JUAL ---------------------------------------

    var isiTabel: Array < any > [] = [];
    isiTabel.push([{
        text: 'Tanggal',
        style: 'tableHeader'
      },
      {
        text: 'Kelompok',
        style: 'tableHeader'
      },
      {
        text: 'Status',
        style: 'tableHeader'
      },
      {
        text: 'Pencatat',
        style: 'tableHeader'
      }
    ]);

    listPenyesuaian.forEach(function (row) {
      var dataRow: any[] = [];
      let status = 'Sesuai'
      let selisih = row.stokSebenarnya - row.stokTercatat
      if(row.butuhCekUlang) status = 'Butuh Cek Ulang'
      else if(selisih != 0) status = 'Bermasalah'

      dataRow.push({
        stack: [
          DateTime.fromJSDate(row.createdAt).toFormat('f'),
          // DateTime.fromJSDate(row.createdAt).toFormat('T')
        ]
      })
      dataRow.push({
        stack: [
          row.namaKel,
          {
            text: `${row.bentuk} ${row.kadar}`,
            color: row.warnaNota
          },
          // `Kode: ${row.kodepro}`
        ]
      })
      dataRow.push({
        stack: [
          {
            text: status,
            color: (status === 'Sesuai')? 'green':'red'
          },
          `selisih: ${ selisih }`
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

    if (!listPenyesuaian || listPenyesuaian.length == 0) {
      isiTabel.push([{
        text: 'Tidak ada penyesuaian stok',
        colSpan: 4,
        alignment: 'center'
      }])
    }


    return [{
        text: 'Daftar Penyesuaian Stok',
        style: 'subBab'
      },
      {
        text: `Pada subbab ini, dilampirkan daftar seluruh penyesuaian stok kelompok perhiasan yang tercatat pada sistem pada tanggal ${tanggalString}. Kolom kelompok ditulis dengan informasi kadar dan bentuk perhiasan, serta penanda warna sesuai dengan warna nota yang diatur pada sistem. Kolom status ditulis dengan melampirkan status penyesuaian stok beserta selisih stok kelompok yang tercatat pada sistem dengan stok sebenarnya. Berikut selengkapnya:`,
        style: 'paragrafNormal'
      },
      {
        table: {
          widths: [80, 200, '*', '*'],
          headerRows: 1,
          body: isiTabel,
          dontBreakRows: true
        },
        style: 'tabelBasic'
      }
    ]
  }

  // ntar dihapus
  async generateSubDaftarPenyesuaian2s(tanggalLaporan: string, tanggalMulai: DateTime, tanggalAkhir: DateTime) {
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
    var olDalem: Array < any > = [];

    const listPenyesuaian = await Database
      .from('koreksi_stoks')
      .join('kelompoks', 'koreksi_stoks.kelompok_id', 'kelompoks.id')
      .join('bentuks', 'kelompoks.bentuk_id', 'bentuks.id')
      .join('kadars', 'kelompoks.kadar_id', 'kadars.id')
      .join('penggunas', 'koreksi_stoks.pengguna_id', 'penggunas.id')
      .join('jabatans', 'penggunas.jabatan_id', 'jabatans.id')
      .select(
        'koreksi_stoks.created_at as createdAt',
        'koreksi_stoks.perubahan_stok as perubahanStok',
        'koreksi_stoks.stok_akhir as stokAkhir',
        'koreksi_stoks.alasan as alasan',
        'penggunas.nama as pencatat',
        'jabatans.nama as jabatan',
        'kelompoks.nama as namaKelompok',
        'kadars.nama as kadar',
        'kadars.warna_nota as warnaNota',
        'bentuks.bentuk as bentuk'
      )
      .if(tanggalTunggal, (query) => {
        query.whereRaw('DATE(koreksi_stoks.created_at) = DATE(?)', [tanggalMulai.toSQL()])
      })
      .if(!tanggalTunggal, (query) => {
        query
          .whereRaw('DATE(koreksi_stoks.created_at) >= DATE(?)', [tanggalMulai.toSQL()]) // start
          .whereRaw('DATE(koreksi_stoks.created_at) <= DATE(?)', [tanggalAkhir.toSQL()]) // end
      })
      .orderBy('koreksi_stoks.created_at', 'asc')

    // ----------------------------- PRINT TABEL DAFTAR KOREKSI ---------------------------------------

    if (listPenyesuaian && listPenyesuaian.length > 0) {
      for (const item of listPenyesuaian) {
        let subBabBab: Array < any > = []
        let tanggalJudul = DateTime.fromJSDate(item.createdAt).toFormat('fff')

        subBabBab.push({
          text: `Koreksi Stok ${item.namaKelompok} [${tanggalJudul}]`,
          style: 'olJudul'
        })

        subBabBab.push({
          text: `Berikut merupakan rekap dari koreksi stok kelompok ini:`,
          style: 'olKonten'
        })

        subBabBab.push({
          table: {
            widths: [120, 'auto', 200],
            // headerRows: 1,
            body: [
              bikinRowRekap('Tanggal & waktu', tanggalJudul),
              bikinRowRekap('Nama kelompok', item.namaKelompok),
              bikinRowRekap('Bentuk & kadar', `${item.bentuk} ${item.kadar}`, {
                color: item.warnaNota
              }),
              bikinRowRekap('Perubahan stok', item.perubahanStok, (item.perubahanStok >= 0) ? 'kasMasuk' : 'kasKeluar'),
              bikinRowRekap('Stok akhir', item.stokAkhir),
              bikinRowRekap('Alasan', item.alasan),
              bikinRowRekap('Pencatat', `${item.pencatat} <${item.jabatan}>`),
            ]
          },
          style: 'olTabel',
          unbreakable: true
        })

        olDalem.push(subBabBab)
      }
    }

    return [{
        text: 'Daftar Koreksi Stok Kelompok',
        style: 'subBab'
      },
      {
        text: `Pada subbab ini, dilampirkan daftar seluruh koreksi stok kelompok yang tercatat pada sistem pada tanggal ${tanggalString}. Karena koreksi stok memiliki data yang banyak, maka tiap datanya dicetak 1 kelompok per 1 kali koreksi. Berikut selengkapnya:`,
        style: 'paragrafNormal'
      },
      {
        ol: olDalem,
        style: 'olWadah'
      }
    ]
  }

  async generateSubDaftarKelompokLaku(tanggalLaporan: string, tanggalMulai: DateTime, tanggalAkhir: DateTime) {
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
    const kelompokLaku = await Database
      .from('kelompoks')
      .join('bentuks', 'kelompoks.bentuk_id', 'bentuks.id')
      .join('kadars', 'kelompoks.kadar_id', 'kadars.id')
      .select(
        'kelompoks.nama as namaKelompok',
        'kadars.nama as kadar',
        'kadars.warna_nota as warnaNota',
        'bentuks.bentuk as bentuk'
      )
      .select(
        Database.from('penjualans')
        .count('penjualans.berat_barang')
        .whereColumn('penjualans.kelompok_id', 'kelompoks.id')
        .andWhereNull('penjualans.deleted_at')
        .if(tanggalTunggal, (query) => {
          query.whereRaw('DATE(penjualans.created_at) = DATE(?)', [tanggalMulai.toSQL()])
        })
        .if(!tanggalTunggal, (query) => {
          query
            .whereRaw('DATE(penjualans.created_at) >= DATE(?)', [tanggalMulai.toSQL()]) // start
            .whereRaw('DATE(penjualans.created_at) <= DATE(?)', [tanggalAkhir.toSQL()]) // end
        })
        .as('totalPenjualan')
      )
      .select(
        Database.from('penjualans')
        .sum('penjualans.berat_barang')
        .whereColumn('penjualans.kelompok_id', 'kelompoks.id')
        .andWhereNull('penjualans.deleted_at')
        .if(tanggalTunggal, (query) => {
          query.whereRaw('DATE(penjualans.created_at) = DATE(?)', [tanggalMulai.toSQL()])
        })
        .if(!tanggalTunggal, (query) => {
          query
            .whereRaw('DATE(penjualans.created_at) >= DATE(?)', [tanggalMulai.toSQL()]) // start
            .whereRaw('DATE(penjualans.created_at) <= DATE(?)', [tanggalAkhir.toSQL()]) // end
        })
        .as('totalBerat')
      )
      .whereNull('kelompoks.deleted_at')
      .andHaving('totalPenjualan', '>', 0)
      .orderBy('totalPenjualan', 'desc')

    // ----------------------------- PRINT TABEL DAFTAR JUAL ---------------------------------------

    var isiTabel: Array < any > [] = [];
    isiTabel.push([{
        text: 'Peringkat',
        style: 'tableHeader'
      },
      {
        text: 'Kelompok',
        style: 'tableHeader'
      },
      {
        text: 'Total Penjualan',
        style: 'tableHeader'
      },
      {
        text: 'Total Gram Terjual',
        style: 'tableHeader'
      },
    ]);

    let rank = 1
    kelompokLaku.forEach(function (row) {
      var dataRow: any[] = [];

      dataRow.push({
        text: rank++ + ' #'
      })

      dataRow.push({
        stack: [
          row.namaKelompok,
          {
            text: `${row.bentuk} ${row.kadar}`,
            color: row.warnaNota
          }
        ]
      })

      dataRow.push({
        text: row.totalPenjualan
      })

      dataRow.push({
        text: row.totalBerat + ' gr'
      })

      isiTabel.push(dataRow);
    });

    if (!kelompokLaku || kelompokLaku.length == 0) {
      isiTabel.push([{
        text: 'Tidak ada penjualan!',
        colSpan: 4,
        alignment: 'center'
      }])
    }

    return [{
        text: 'Daftar Kelompok Dengan Penjualan Paling Laku',
        style: 'subBab'
      },
      {
        text: `Pada subbab ini, dilampirkan daftar urutan kelompok dengan penjualan terbanyak yang tercatat pada sistem pada tanggal ${tanggalString}. Pada daftar tersebut, juga dilampirkan seberapa banyak gram perhiasan terjual, namun yang dijadikan sebagai parameter urutan peringkat hanyalah total penjualannya saja. Berikut selengkapnya:`,
        style: 'paragrafNormal'
      },
      {
        table: {
          widths: [50, 200, '*', '*'],
          headerRows: 1,
          body: isiTabel,
          dontBreakRows: true
        },
        style: 'tabelBasic'
      }
    ]
  }

  async generateSubDaftarKelompokMenipis() {

    // -------------------------- PERSIAPAN DATA ---------------------------------------------------
    const kelompoks = await Database
      .from('kelompoks')
      .join('kadars', 'kelompoks.kadar_id', 'kadars.id')
      .join('bentuks', 'kelompoks.bentuk_id', 'bentuks.id')
      .select(
        'kelompoks.nama as namaKelompok',
        'kelompoks.stok as stokKelompok',
        'kelompoks.stok_minimal as stokMinimalKelompok',
        'kadars.nama as kadar',
        'kadars.warna_nota as warnaNota',
        'bentuks.bentuk as bentuk'
      )
      .whereNull('kelompoks.deleted_at')
      .andWhere('kelompoks.ingatkan_stok_menipis', true)
      .andWhereColumn('kelompoks.stok', '<=', 'kelompoks.stok_minimal')
      .orderBy('kadars.nama', 'asc')
      .orderBy('bentuks.bentuk', 'asc')
      .orderBy('kelompoks.nama', 'asc')

    // ----------------------------- PRINT TABEL DAFTAR JUAL ---------------------------------------

    var isiTabel: Array < any > [] = [];
    isiTabel.push([
      {
        text: 'Kelompok',
        style: 'tableHeader'
      },
      {
        text: 'Stok Minimal',
        style: 'tableHeader'
      },
      {
        text: 'Stok Saat Ini',
        style: 'tableHeader'
      },
    ]);

    kelompoks.forEach(function (row) {
      var dataRow: any[] = [];

      dataRow.push({
        stack: [
          row.namaKelompok,
          {
            text: `${row.bentuk} ${row.kadar}`,
            color: row.warnaNota
          },
        ]
      })

      dataRow.push({
        text: row.stokMinimalKelompok
      })

      dataRow.push({
        text: row.stokKelompok
      })
      

      isiTabel.push(dataRow);
    });

    return [{
        text: 'Daftar Kelompok Dengan Stok Menipis',
        style: 'subBab'
      },
      {
        text: `Pada subbab ini, dilampirkan daftar kelompok dengan stok hampir habis dan stok kosong yang tercatat pada sistem hari ini. Kelompok yang ditampilkan pada tabel hanyalah kelompok yang memiliki pengaturan "ingkatkan stok menipis" dan memiliki stok dibawah stok minimal kelompok tersebut. Berikut selengkapnya:`,
        style: 'paragrafNormal'
      },
      {
        table: {
          widths: ['*', 80, 80],
          headerRows: 1,
          body: isiTabel,
          dontBreakRows: true
        },
        style: 'tabelBasic'
      }
    ]

  }

  async generateSubDaftarKodeproLaku(tanggalLaporan: string, tanggalMulai: DateTime, tanggalAkhir: DateTime) {
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
    const kodeproLaku = await Database
      .from('kode_produksis')
      .join('kadars', 'kode_produksis.kadar_id', 'kadars.id')
      .select(
        'kode_produksis.kode as kodepro',
        'kadars.nama as kadar',
        'kadars.warna_nota as warnaNota',
      )
      .select(
        Database.from('penjualans')
        .count('penjualans.berat_barang')
        .whereColumn('penjualans.kode_produksi_id', 'kode_produksis.id')
        .andWhereNull('penjualans.deleted_at')
        .if(tanggalTunggal, (query) => {
          query.whereRaw('DATE(penjualans.created_at) = DATE(?)', [tanggalMulai.toSQL()])
        })
        .if(!tanggalTunggal, (query) => {
          query
            .whereRaw('DATE(penjualans.created_at) >= DATE(?)', [tanggalMulai.toSQL()]) // start
            .whereRaw('DATE(penjualans.created_at) <= DATE(?)', [tanggalAkhir.toSQL()]) // end
        })
        .as('totalPenjualan')
      )
      .select(
        Database.from('penjualans')
        .sum('penjualans.berat_barang')
        .whereColumn('penjualans.kode_produksi_id', 'kode_produksis.id')
        .andWhereNull('penjualans.deleted_at')
        .if(tanggalTunggal, (query) => {
          query.whereRaw('DATE(penjualans.created_at) = DATE(?)', [tanggalMulai.toSQL()])
        })
        .if(!tanggalTunggal, (query) => {
          query
            .whereRaw('DATE(penjualans.created_at) >= DATE(?)', [tanggalMulai.toSQL()]) // start
            .whereRaw('DATE(penjualans.created_at) <= DATE(?)', [tanggalAkhir.toSQL()]) // end
        })
        .as('totalBerat')
      )
      .whereNull('kode_produksis.deleted_at')
      .andHaving('totalPenjualan', '>', 0)
      .orderBy('totalPenjualan', 'desc')

    // ----------------------------- PRINT TABEL DAFTAR JUAL ---------------------------------------

    var isiTabel: Array < any > [] = [];
    isiTabel.push([{
        text: 'Peringkat',
        style: 'tableHeader'
      },
      {
        text: 'Kode Produksi',
        style: 'tableHeader'
      },
      {
        text: 'Total Penjualan',
        style: 'tableHeader'
      },
      {
        text: 'Total Gram Terjual',
        style: 'tableHeader'
      },
    ]);

    let rank = 1
    kodeproLaku.forEach(function (row) {
      var dataRow: any[] = [];

      dataRow.push({
        text: rank++ + ' #'
      })

      dataRow.push({
        stack: [
          row.kodepro,
          {
            text: row.kadar,
            color: row.warnaNota
          }
        ]
      })

      dataRow.push({
        text: row.totalPenjualan
      })

      dataRow.push({
        text: row.totalBerat + ' gr'
      })

      isiTabel.push(dataRow);
    });

    if (!kodeproLaku || kodeproLaku.length == 0) {
      isiTabel.push([{
        text: 'Tidak ada penjualan!',
        colSpan: 4,
        alignment: 'center'
      }])
    }

    return [{
        text: 'Daftar Kode Produksi Dengan Penjualan Paling Laku',
        style: 'subBab'
      },
      {
        text: `Pada subbab ini, dilampirkan daftar urutan kode produksi dengan penjualan terbanyak yang tercatat pada sistem pada tanggal ${tanggalString}. Pada daftar tersebut, juga dilampirkan seberapa banyak gram perhiasan terjual, namun yang dijadikan sebagai parameter urutan peringkat hanyalah total penjualannya saja. Berikut selengkapnya:`,
        style: 'paragrafNormal'
      },
      {
        table: {
          widths: [50, 200, '*', '*'],
          headerRows: 1,
          body: isiTabel,
          dontBreakRows: true
        },
        style: 'tabelBasic'
      }
    ]
  }

  async generateSubDaftarModelLaku(tanggalLaporan: string, tanggalMulai: DateTime, tanggalAkhir: DateTime) {
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
    const modelLaku = await Database
      .from('models')
      .join('bentuks', 'models.bentuk_id', 'bentuks.id')
      .select(
        'models.nama as namaModel',
        'bentuks.bentuk as bentuk'
      )
      .select(
        Database.from('penjualans')
        .count('penjualans.berat_barang')
        .whereColumn('penjualans.model_id', 'models.id')
        .andWhereNull('penjualans.deleted_at')
        .if(tanggalTunggal, (query) => {
          query.whereRaw('DATE(penjualans.created_at) = DATE(?)', [tanggalMulai.toSQL()])
        })
        .if(!tanggalTunggal, (query) => {
          query
            .whereRaw('DATE(penjualans.created_at) >= DATE(?)', [tanggalMulai.toSQL()]) // start
            .whereRaw('DATE(penjualans.created_at) <= DATE(?)', [tanggalAkhir.toSQL()]) // end
        })
        .as('totalPenjualan')
      )
      .select(
        Database.from('penjualans')
        .sum('penjualans.berat_barang')
        .whereColumn('penjualans.model_id', 'models.id')
        .andWhereNull('penjualans.deleted_at')
        .if(tanggalTunggal, (query) => {
          query.whereRaw('DATE(penjualans.created_at) = DATE(?)', [tanggalMulai.toSQL()])
        })
        .if(!tanggalTunggal, (query) => {
          query
            .whereRaw('DATE(penjualans.created_at) >= DATE(?)', [tanggalMulai.toSQL()]) // start
            .whereRaw('DATE(penjualans.created_at) <= DATE(?)', [tanggalAkhir.toSQL()]) // end
        })
        .as('totalBerat')
      )
      .whereNull('models.deleted_at')
      .andHaving('totalPenjualan', '>', 0)
      .orderBy('totalPenjualan', 'desc')

    // ----------------------------- PRINT TABEL DAFTAR JUAL ---------------------------------------

    var isiTabel: Array < any > [] = [];
    isiTabel.push([{
        text: 'Peringkat',
        style: 'tableHeader'
      },
      {
        text: 'Model',
        style: 'tableHeader'
      },
      {
        text: 'Total Penjualan',
        style: 'tableHeader'
      },
      {
        text: 'Total Gram Terjual',
        style: 'tableHeader'
      },
    ]);

    let rank = 1
    modelLaku.forEach(function (row) {
      var dataRow: any[] = [];

      dataRow.push({
        text: rank++ + ' #'
      })

      dataRow.push({
        stack: [
          row.namaModel,
          row.bentuk
        ]
      })

      dataRow.push({
        text: row.totalPenjualan
      })

      dataRow.push({
        text: row.totalBerat + ' gr'
      })

      isiTabel.push(dataRow);
    });

    if (!modelLaku || modelLaku.length == 0) {
      isiTabel.push([{
        text: 'Tidak ada penjualan!',
        colSpan: 4,
        alignment: 'center'
      }])
    }

    return [{
        text: 'Daftar Model Dengan Penjualan Paling Laku',
        style: 'subBab'
      },
      {
        text: `Pada subbab ini, dilampirkan daftar urutan model dengan penjualan terbanyak yang tercatat pada sistem pada tanggal ${tanggalString}. Pada daftar tersebut, juga dilampirkan seberapa banyak gram perhiasan terjual, namun yang dijadikan sebagai parameter urutan peringkat hanyalah total penjualannya saja. Berikut selengkapnya:`,
        style: 'paragrafNormal'
      },
      {
        table: {
          widths: [50, 200, '*', '*'],
          headerRows: 1,
          body: isiTabel,
          dontBreakRows: true
        },
        style: 'tabelBasic'
      }
    ]
  }
}

function bikinRowRekap(soal: string, jawab: string, style: string | object = '') {
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

