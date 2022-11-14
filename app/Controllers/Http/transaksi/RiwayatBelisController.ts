import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import { pasaranDariTanggalPlus } from 'App/CustomClasses/CPasaran'
import { DateTime } from 'luxon'

export default class RiwayatBelisController {
  public async listTanggal({ view, request }: HttpContextContract) {
    const opsiOrder = ['tanggal', 'jumlahPB', 'totalBerat', 'totalHarga']
    const page = request.input('page', 1)
    const order = request.input('ob', 0)
    const arahOrder = request.input('aob', 0)
    const sanitizedOrder = order < opsiOrder.length && order >= 0 && order ? order : 0
    const sanitizedArahOrder = arahOrder == 1 ? 1 : 0
    const limit = 10

    const tanggals = await Database.from('pembelians')
      .select(Database.raw('DATE(created_at) as tanggal'))
      .count('id', 'jumlahPB')
      .sum('berat_barang', 'totalBerat')
      .sum('harga_beli_akhir', 'totalHarga')
      .whereNull('deleted_at')
      .groupByRaw('DATE(created_at)')
      .if(sanitizedOrder !== 0, (query) => {
        query.orderBy(opsiOrder[sanitizedOrder], sanitizedArahOrder == 1 ? 'desc' : 'asc')
      })
      .orderBy('tanggal', 'desc')
      .paginate(page, limit)

    tanggals.baseUrl('/app/riwayat/pembelian')

    tanggals.queryString({
      ob: sanitizedOrder,
      aob: sanitizedArahOrder,
    })

    let firstPage =
      tanggals.currentPage - 2 > 0
        ? tanggals.currentPage - 2
        : tanggals.currentPage - 1 > 0
        ? tanggals.currentPage - 1
        : tanggals.currentPage
    let lastPage =
      tanggals.currentPage + 2 <= tanggals.lastPage
        ? tanggals.currentPage + 2
        : tanggals.currentPage + 1 <= tanggals.lastPage
        ? tanggals.currentPage + 1
        : tanggals.currentPage

    if (lastPage - firstPage < 4 && tanggals.lastPage > 4) {
      if (tanggals.currentPage < tanggals.firstPage + 2) {
        lastPage += 4 - (lastPage - firstPage)
      }

      if (lastPage == tanggals.lastPage) {
        firstPage -= 4 - (lastPage - firstPage)
      }
    }
    // sampe sini
    const tempLastData = 10 + (tanggals.currentPage - 1) * limit

    const tambahan = {
      pengurutan: sanitizedOrder,
      firstPage: firstPage,
      lastPage: lastPage,
      firstDataInPage: 1 + (tanggals.currentPage - 1) * limit,
      lastDataInPage: tempLastData >= tanggals.total ? tanggals.total : tempLastData,
    }

    const fungsi = {
      rupiahParser: rupiahParser,
      kapitalHurufPertama: kapitalHurufPertama,
      formatDate: formatDate,
      pasaranFromTanggal: pasaranFromTanggal,
    }

    let roti = [
      {
        laman: 'Riwayat Pembelian',
      },
    ]

    return await view.render('riwayat/pembelian/list-tanggal-beli', {
      tanggals,
      tambahan,
      fungsi,
      roti
    })
  }

  public async listRiwayatSekarang({ request, view }: HttpContextContract) {
    const tanggalSekarang = DateTime.now()

    const opsiOrder = [
      'pembelians.created_at',
      'pembelians.nama_barang',
      'bentuk',
      'kadar',
      'pembelians.berat_barang',
      'pembelians.harga_beli_akhir',
    ]

    const page = request.input('page', 1)
    const order = request.input('ob', 0)
    const arahOrder = request.input('aob', 0)
    const sanitizedOrder = order < opsiOrder.length && order >= 0 && order ? order : 0
    const sanitizedArahOrder = arahOrder == 1 ? 1 : 0
    const cari = request.input('cari', '')
    const filterKadar = request.input('fk', 'semua')
    const preparedKadar = kapitalHurufPertama(filterKadar)
    const limit = 10

    let pembelians = await Database.from('pembelians')
      .join('kode_produksis', 'pembelians.kode_produksi_id', 'kode_produksis.id')
      .join('kadars', 'kode_produksis.kadar_id', 'kadars.id')
      .join('models', 'pembelians.model_id', 'models.id')
      .join('bentuks', 'models.bentuk_id', 'bentuks.id')
      .select(
        'pembelians.id as id',
        'pembelians.nama_barang as namaBarang',
        'pembelians.created_at as createdAt',
        'pembelians.harga_beli_akhir as hargaBeliAkhir',
        'pembelians.berat_barang as beratBarang',
        'kadars.nama as kadar',
        'kadars.warna_nota as warnaNota',
        'bentuks.bentuk as bentuk'
      )
      .whereNull('pembelians.deleted_at')
      .whereRaw('DATE(pembelians.created_at) = DATE(?)', [tanggalSekarang.toISO()])
      .if(cari !== '', (query) => {
        query.where('pembelians.nama_barang', 'like', `%${cari}%`)
      })
      .if(preparedKadar !== 'Semua' && preparedKadar !== '', (query) => {
        query.where('kadars.nama', '=', preparedKadar)
      })
      .if(sanitizedOrder !== 0, (query) => {
        query.orderBy(opsiOrder[sanitizedOrder], sanitizedArahOrder == 1 ? 'desc' : 'asc')
      })
      .orderBy('pembelians.created_at', 'desc')
      .paginate(page, limit)

    pembelians.baseUrl('/app/riwayat/pembelian/sekarang')

    const qsParam = {
      ob: sanitizedOrder,
      aob: sanitizedArahOrder,
    }

    if (cari !== '') qsParam['cari'] = cari
    if (filterKadar !== 0) qsParam['fk'] = filterKadar

    pembelians.queryString(qsParam)

    let firstPage =
      pembelians.currentPage - 2 > 0
        ? pembelians.currentPage - 2
        : pembelians.currentPage - 1 > 0
        ? pembelians.currentPage - 1
        : pembelians.currentPage
    let lastPage =
      pembelians.currentPage + 2 <= pembelians.lastPage
        ? pembelians.currentPage + 2
        : pembelians.currentPage + 1 <= pembelians.lastPage
        ? pembelians.currentPage + 1
        : pembelians.currentPage

    if (lastPage - firstPage < 4 && pembelians.lastPage > 4) {
      if (pembelians.currentPage < pembelians.firstPage + 2) {
        lastPage += 4 - (lastPage - firstPage)
      }

      if (lastPage == pembelians.lastPage) {
        firstPage -= 4 - (lastPage - firstPage)
      }
    }

    const tempLastData = 10 + (pembelians.currentPage - 1) * limit

    const rekap = await Database.from('pembelians')
      .select(Database.raw('IFNULL(COUNT(id), 0) as jumlahPB'))
      .select(Database.raw('IFNULL(SUM(berat_barang), 0) as totalBerat'))
      .select(Database.raw('IFNULL(SUM(harga_beli_akhir), 0) as totalHarga'))
      .whereRaw('DATE(created_at) = DATE(?)', [tanggalSekarang.toISO()])
      .whereNull('deleted_at')
      .first()

    const fungsi = {
      rupiahParser: rupiahParser,
    }

    const tambahan = {
      pengurutan: sanitizedOrder,
      pencarian: cari,
      firstPage: firstPage,
      lastPage: lastPage,
      firstDataInPage: 1 + (pembelians.currentPage - 1) * limit,
      lastDataInPage: tempLastData >= pembelians.total ? pembelians.total : tempLastData,
    }

    let roti = [
      {
        laman: 'Riwayat Pembelian'
      }
    ]

    return await view.render('riwayat/pembelian/list-riwayat-beli-sekarang', {
      tambahan,
      pembelians,
      fungsi,
      rekap,
      roti
    })
  }

  public async listRiwayatByTanggal({
    view,
    params,
    request,
    response,
    session,
  }: HttpContextContract) {
    let tanggal = DateTime.fromISO(params.tanggal)

    if (tanggal.isValid) {
      const opsiOrder = [
        'pembelians.created_at',
        'pembelians.nama_barang',
        'bentuk',
        'kadar',
        'pembelians.berat_barang',
        'pembelians.harga_jual_akhir',
      ]

      const page = request.input('page', 1)
      const order = request.input('ob', 0)
      const arahOrder = request.input('aob', 0)
      const sanitizedOrder = order < opsiOrder.length && order >= 0 && order ? order : 0
      const sanitizedArahOrder = arahOrder == 1 ? 1 : 0
      const cari = request.input('cari', '')
      const filterKadar = request.input('fk', 'semua')
      const preparedKadar = kapitalHurufPertama(filterKadar)
      const limit = 10

      let pembelians = await Database.from('pembelians')
        .join('kode_produksis', 'pembelians.kode_produksi_id', 'kode_produksis.id')
        .join('kadars', 'kode_produksis.kadar_id', 'kadars.id')
        .join('models', 'pembelians.model_id', 'models.id')
        .join('bentuks', 'models.bentuk_id', 'bentuks.id')
        .select(
          'pembelians.id as id',
          'pembelians.nama_barang as namaBarang',
          'pembelians.created_at as createdAt',
          'pembelians.harga_beli_akhir as hargaBeliAkhir',
          'pembelians.berat_barang as beratBarang',
          'kadars.nama as kadar',
          'kadars.warna_nota as warnaNota',
          'bentuks.bentuk as bentuk'
        )
        .whereNull('pembelians.deleted_at')
        .whereRaw('DATE(pembelians.created_at) = DATE(?)', [tanggal.toISO()])
        .if(cari !== '', (query) => {
          query.where('pembelians.nama_barang', 'like', `%${cari}%`)
        })
        .if(preparedKadar !== 'Semua' && preparedKadar !== '', (query) => {
          query.where('kadars.nama', '=', preparedKadar)
        })
        .if(sanitizedOrder !== 0, (query) => {
          query.orderBy(opsiOrder[sanitizedOrder], sanitizedArahOrder == 1 ? 'desc' : 'asc')
        })
        .orderBy('pembelians.created_at', 'desc')
        .paginate(page, limit)

      pembelians.baseUrl('/app/riwayat/penjualan/' + params.tanggal)

      const qsParam = {
        ob: sanitizedOrder,
        aob: sanitizedArahOrder,
      }

      if (cari !== '') qsParam['cari'] = cari
      if (filterKadar !== 0) qsParam['fk'] = filterKadar

      pembelians.queryString(qsParam)

      let firstPage =
        pembelians.currentPage - 2 > 0
          ? pembelians.currentPage - 2
          : pembelians.currentPage - 1 > 0
          ? pembelians.currentPage - 1
          : pembelians.currentPage
      let lastPage =
        pembelians.currentPage + 2 <= pembelians.lastPage
          ? pembelians.currentPage + 2
          : pembelians.currentPage + 1 <= pembelians.lastPage
          ? pembelians.currentPage + 1
          : pembelians.currentPage

      if (lastPage - firstPage < 4 && pembelians.lastPage > 4) {
        if (pembelians.currentPage < pembelians.firstPage + 2) {
          lastPage += 4 - (lastPage - firstPage)
        }

        if (lastPage == pembelians.lastPage) {
          firstPage -= 4 - (lastPage - firstPage)
        }
      }

      const tempLastData = 10 + (pembelians.currentPage - 1) * limit

      const rekap = await Database.from('pembelians')
        .select(Database.raw('IFNULL(COUNT(id), 0) as jumlahPB'))
        .select(Database.raw('IFNULL(SUM(berat_barang), 0) as totalBerat'))
        .select(Database.raw('IFNULL(SUM(harga_beli_akhir), 0) as totalHarga'))
        .whereRaw('DATE(created_at) = DATE(?)', [tanggal.toISO()])
        .whereNull('deleted_at')

        .first()

      const fungsi = {
        rupiahParser: rupiahParser,
      }

      const tambahan = {
        pengurutan: sanitizedOrder,
        pencarian: cari,
        firstPage: firstPage,
        lastPage: lastPage,
        firstDataInPage: 1 + (pembelians.currentPage - 1) * limit,
        lastDataInPage: tempLastData >= pembelians.total ? pembelians.total : tempLastData,
      }

      let roti = [
        {
          laman: 'Riwayat Pembelian '
        }
      ]

      return await view.render('riwayat/pembelian/list-riwayat-beli-pertanggal', {
        tambahan,
        pembelians,
        fungsi,
        rekap,
        tanggal,
        roti
      })
    } else {
      session.flash('alertError', 'Tanggal pembelian yang anda isikan tidak valid!')
      return response.redirect().toPath('/app/riwayat/pembelian/')
    }
  }
  
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

function formatDate(ISODate: string) {
  const tanggal = DateTime.fromISO(ISODate)

  if (tanggal.isValid) {
    return tanggal.toISODate()
  } else {
    return 'error'
  }
}

function pasaranFromTanggal(ISODate: string) {
  const tanggal = DateTime.fromISO(ISODate)

  if (tanggal.isValid) {
    return this.kapitalHurufPertama(pasaranDariTanggalPlus(tanggal))
  } else {
    return 'tidak valid'
  }
}
