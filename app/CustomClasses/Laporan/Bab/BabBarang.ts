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
          // unbreakable: true
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

        if(items && items.length > 0){
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
            body: subTabel
          },
          style: 'olTabel',
          // unbreakable: true
        })

        olDalem.push(subBabBab)
      }
    }

    return [{
        text: 'Daftar Penambahan Stok (Restok)',
        style: 'subBab'
      },
      `Pada subbab ini, akan dilampirkan daftar seluruh penjualan yang tercatat pada sistem pada tanggal ${tanggalString}. Kolom nama barang akan dilengkapi dengan informasi kadar dan bentuk perhiasan, serta penanda warna sesuai dengan warna nota yang diatur pada sistem. Berikut selengkapnya:`,
      {
        ol: olDalem,
        style: 'olWadah'
      }
    ]
  }

  async generateSubDaftarKoreksi() {

  }

  async generateSubDaftarKelompokLaku() {

  }

  async generateSubDaftarKelompokMenipis() {

  }

  async generateSubDaftarModelLaku() {

  }
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
