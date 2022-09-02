import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import { DateTime } from 'luxon'

import { apakahHariIniPasaran, hariKePasaranSelanjutnya } from 'App/CustomClasses/CPasaran'

export default class DashboardController {
  public async index({ view }: HttpContextContract) {
    const now = DateTime.now().startOf('day')
    const start = now.startOf('week')
    const end = now.endOf('week')

    // ----------------------- PJ -----------------------
    const pjSekarang = await Database.from('penjualans')
      .sum('harga_jual_akhir', 'jumlah')
      .whereNull('deleted_at')
      .andWhereRaw('DATE(created_at) = DATE(?)', [now.toSQL()])
      .first()

    const pjSeminggu = await Database.from('penjualans')
      .sum('harga_jual_akhir', 'jumlah')
      .whereNull('deleted_at')
      .andWhereRaw('DATE(created_at) >= DATE(?)', [start.toSQL()])
      .andWhereRaw('DATE(created_at) <= DATE(?)', [end.toSQL()])
      .first()

    let meanPj = 0
    let bandingPj = 0

    if (pjSeminggu.jumlah) {
      meanPj = pembulatanRupiah(pjSeminggu.jumlah / now.weekday)
      bandingPj = ((pembulatanRupiah(pjSekarang.jumlah | 0) - meanPj) / meanPj) * 100
    }

    // -------------------- PB -----------------------
    const pbSekarang = await Database.from('pembelians')
      .sum('harga_beli_akhir', 'jumlah')
      .whereNull('deleted_at')
      .andWhereRaw('DATE(created_at) = DATE(?)', [now.toSQL()])
      .first()

    const pbSeminggu = await Database.from('pembelians')
      .sum('harga_beli_akhir', 'jumlah')
      .whereNull('deleted_at')
      .andWhereRaw('DATE(created_at) >= DATE(?)', [start.toSQL()])
      .andWhereRaw('DATE(created_at) <= DATE(?)', [end.toSQL()])
      .first()

    let meanPb = 0
    let bandingPb = 0

    if (pbSeminggu.jumlah) {
      meanPb = pembulatanRupiah(pbSeminggu.jumlah / now.weekday)
      bandingPb = ((pembulatanRupiah(pbSekarang.jumlah | 0) - meanPb) / meanPb) * 100
    }

    // --------------- Next pasaran ------------------
    const next = await hariKePasaranSelanjutnya()

    // ----------------- Response --------------------
    const data = {
      pjSekarang: pjSekarang.jumlah | 0,
      meanPj: meanPj,
      persenBandingPj: bandingPj,
      pbSekarang: pbSekarang.jumlah | 0,
      meanPb: meanPb,
      persenBandingPb: bandingPb,
      tanggalStart: start,
      tanggalEnd: end,
      apakahPasaran: await apakahHariIniPasaran(),
      nextPasaran: {
        apakahSet: next.selisihHari ? true : false,
        tanggal: DateTime.now().startOf('day').plus({ day: next.selisihHari }).toFormat('D'),
        pasaran: next.pasaran,
      },
    }

    const fungsi = {
      rupiahParser: rupiahParser,
    }

    return await view.render('beranda', {
      data,
      fungsi,
    })
  }

  public async getDataPjPbSeminggu({}: HttpContextContract) {
    const now = DateTime.now().startOf('day')
    const start = now.startOf('week')
    const end = now.endOf('week')

    let penjualanSeminggu = await Database.rawQuery(
      'SELECT created_at as tanggal, WEEKDAY(created_at) as hariMingguan, SUM(harga_jual_akhir) as jumlah FROM penjualans WHERE deleted_at IS NULL && DATE(created_at) >= :tanggalAwal && DATE(created_at) <= :tanggalAkhir GROUP BY hariMingguan',
      {
        tanggalAwal: start.toSQL(),
        tanggalAkhir: end.toSQL(),
      }
    )

    let pembelianSeminggu = await Database.rawQuery(
      'SELECT created_at as tanggal, WEEKDAY(created_at) as hariMingguan, SUM(harga_beli_akhir) as jumlah FROM pembelians WHERE deleted_at IS NULL && DATE(created_at) >= :tanggalAwal && DATE(created_at) <= :tanggalAkhir GROUP BY hariMingguan',
      {
        tanggalAwal: start.toSQL(),
        tanggalAkhir: end.toSQL(),
      }
    )

    // deklarasi
    let wadahMingguan: {
      label: string
      jumlahPJ: number
      jumlahPB: number
    }[] = []

    // inisialisasi data
    for (let i = 0; i < 7; i++) {
      let tanggalRotasi = DateTime.local().startOf('week').plus({
        days: i,
      })

      wadahMingguan[i] = {
        label: tanggalRotasi.toFormat('D'),
        jumlahPJ: 0,
        jumlahPB: 0,
      }
    }

    // input data pj
    penjualanSeminggu[0].forEach((element: { hariMingguan: string | number; jumlah: number }) => {
      wadahMingguan[element.hariMingguan].jumlahPJ = element.jumlah
    })

    // input data pb
    pembelianSeminggu[0].forEach((element: { hariMingguan: string | number; jumlah: number }) => {
      wadahMingguan[element.hariMingguan].jumlahPB = element.jumlah
    })

    return wadahMingguan
  }

  public async getSebaranPb({}: HttpContextContract) {
    const now = DateTime.now().startOf('day')

    let dariToko = 0
    let dariLuar = 0
    let tanpaSurat = 0

    const data = await Database.from('pembelians')
      .leftJoin('pembelian_nota_leos', 'pembelians.id', 'pembelian_nota_leos.pembelian_id')
      .select(
        'pembelians.asal_toko as asalToko',
        'pembelians.berat_barang as beratBarang', // barangkali ntar jadi kepake,
        'pembelian_nota_leos.id as cek' // kalau ada berarti valid
      )
      .whereNull('pembelians.deleted_at')
      .andWhereRaw('DATE(pembelians.created_at) = DATE(?)', [now.toSQLDate()])

    data.forEach((element) => {
      if (element.cek && element.asalToko) dariToko++
      else if (element.asalToko) dariLuar++
      else tanpaSurat++
    })

    return {
      adaData: (data.length > 0),
      dariToko,
      dariLuar,
      tanpaSurat,
    }
  }

  public async getDataKelompokModelKodeproLaku({ request }: HttpContextContract) {
    const now = DateTime.now().startOf('day')
    const limit = 10 // limit data, bisa diganti
    const mode = request.input('mode', 0)
    const sanitizedMode = mode == 1 ? 1 : 0

    const kelompokLaku = await Database.from('kelompoks')
      .join('bentuks', 'kelompoks.bentuk_id', 'bentuks.id')
      .join('kadars', 'kelompoks.kadar_id', 'kadars.id')
      .select(
        'kelompoks.id as id',
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
          .whereRaw('DATE(penjualans.created_at) = DATE(?)', [now.toSQL()])
          .as('totalPenjualan')
      )
      .select(
        Database.from('penjualans')
          .sum('penjualans.berat_barang')
          .whereColumn('penjualans.kelompok_id', 'kelompoks.id')
          .andWhereNull('penjualans.deleted_at')
          .whereRaw('DATE(penjualans.created_at) = DATE(?)', [now.toSQL()])
          .as('totalBerat')
      )
      .whereNull('kelompoks.deleted_at')
      .andHaving('totalPenjualan', '>', 0)
      .if(
        sanitizedMode == 1,
        (query) => {
          query.orderBy('totalBerat', 'desc')
        },
        (query) => {
          query.orderBy('totalPenjualan', 'desc')
        }
      )
      .limit(limit)

    const modelLaku = await Database.from('models')
      .join('bentuks', 'models.bentuk_id', 'bentuks.id')
      .select('models.id as id', 'models.nama as namaModel', 'bentuks.bentuk as bentuk')
      .select(
        Database.from('penjualans')
          .count('penjualans.berat_barang')
          .whereColumn('penjualans.model_id', 'models.id')
          .andWhereNull('penjualans.deleted_at')
          .whereRaw('DATE(penjualans.created_at) = DATE(?)', [now.toSQL()])
          .as('totalPenjualan')
      )
      .select(
        Database.from('penjualans')
          .sum('penjualans.berat_barang')
          .whereColumn('penjualans.model_id', 'models.id')
          .andWhereNull('penjualans.deleted_at')
          .whereRaw('DATE(penjualans.created_at) = DATE(?)', [now.toSQL()])
          .as('totalBerat')
      )
      .whereNull('models.deleted_at')
      .andHaving('totalPenjualan', '>', 0)
      .if(
        sanitizedMode == 1,
        (query) => {
          query.orderBy('totalBerat', 'desc')
        },
        (query) => {
          query.orderBy('totalPenjualan', 'desc')
        }
      )
      .limit(limit)

    const kodeproLaku = await Database.from('kode_produksis')
      .join('kadars', 'kode_produksis.kadar_id', 'kadars.id')
      .select(
        'kadars.id as id',
        'kode_produksis.kode as kodepro',
        'kadars.nama as kadar',
        'kadars.warna_nota as warnaNota'
      )
      .select(
        Database.from('penjualans')
          .count('penjualans.berat_barang')
          .whereColumn('penjualans.kode_produksi_id', 'kode_produksis.id')
          .andWhereNull('penjualans.deleted_at')
          .whereRaw('DATE(penjualans.created_at) = DATE(?)', [now.toSQL()])
          .as('totalPenjualan')
      )
      .select(
        Database.from('penjualans')
          .sum('penjualans.berat_barang')
          .whereColumn('penjualans.kode_produksi_id', 'kode_produksis.id')
          .andWhereNull('penjualans.deleted_at')
          .whereRaw('DATE(penjualans.created_at) = DATE(?)', [now.toSQL()])
          .as('totalBerat')
      )
      .whereNull('kode_produksis.deleted_at')
      .andHaving('totalPenjualan', '>', 0)
      .if(
        sanitizedMode == 1,
        (query) => {
          query.orderBy('totalBerat', 'desc')
        },
        (query) => {
          query.orderBy('totalPenjualan', 'desc')
        }
      )
      .limit(limit)

    return { kelompok: kelompokLaku, model: modelLaku, kodepro: kodeproLaku, mode: sanitizedMode }
  }

  public async getDataPencatatTerbanyak({}: HttpContextContract) {
    const now = DateTime.now().startOf('day')

    const pegawaiJual = await Database.from('penggunas')
      .join('jabatans', 'jabatans.id', 'penggunas.jabatan_id')
      .select(
        'penggunas.id as id',
        'penggunas.nama as nama',
        'jabatans.nama as jabatan'
      )
      .select(
        Database.from('penjualans')
          .count('penjualans.id')
          .whereColumn('penjualans.pengguna_id', 'penggunas.id')
          .andWhereNull('penjualans.deleted_at')
          .whereRaw('DATE(penjualans.created_at) = DATE(?)', [now.toSQLDate()])
          .as('totalPenjualan')
      )
      .whereNull('penggunas.deleted_at')
      .andHaving('totalPenjualan', '>', 0)
      .orderBy('totalPenjualan', 'desc')

    const pegawaiBeli = await Database.from('penggunas')
      .join('jabatans', 'jabatans.id', 'penggunas.jabatan_id')
      .select(
        'penggunas.id as id',
        'penggunas.nama as nama',
        'jabatans.nama as jabatan'
      )
      .select(
        Database.from('pembelians')
          .count('pembelians.id')
          .whereColumn('pembelians.pengguna_id', 'penggunas.id')
          .andWhereNull('pembelians.deleted_at')
          .whereRaw('DATE(pembelians.created_at) = DATE(?)', [now.toSQLDate()])
          .as('totalPembelian')
      )
      .whereNull('penggunas.deleted_at')
      .andHaving('totalPembelian', '>', 0)
      .orderBy('totalPembelian', 'desc')

    return {
      pegawaiJual,
      pegawaiBeli
    }
  }
}

function pembulatanRupiah(angka: number, bulat: number = 1000) {
  return Math.ceil(angka / bulat) * bulat
}

function rupiahParser(angka: number) {
  if (typeof angka == 'number') {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(angka)
  } else return 'error'
}
