import type {
  HttpContextContract
} from '@ioc:Adonis/Core/HttpContext'
import {
  DateTime
} from 'luxon'
import Database from '@ioc:Adonis/Lucid/Database'
import CPasaran from 'App/CustomClasses/CPasaran'

export default class RiwayatJualsController {
  public async listTanggal({
    view,
    request
  }: HttpContextContract) {
    const opsiOrder = [
      'tanggal',
      'jumlahPJ',
      'totalBerat',
      'totalHarga',
    ]
    const page = request.input('page', 1)
    const order = request.input('ob', 0)
    const arahOrder = request.input('aob', 0)
    const sanitizedOrder = order < opsiOrder.length && order >= 0 && order ? order : 0
    const sanitizedArahOrder = arahOrder == 1 ? 1 : 0
    const limit = 10

    const tanggals = await Database
      .from('penjualans')
      .select(
        Database.raw('DATE(created_at) as tanggal')
      )
      .count('id', 'jumlahPJ')
      .sum('berat_barang', 'totalBerat')
      .sum('harga_jual_akhir', 'totalHarga')
      .whereNull('deleted_at')
      .groupByRaw('DATE(created_at)')
      .if(sanitizedOrder !== 0, (query) => {
        query.orderBy(opsiOrder[sanitizedOrder], ((sanitizedArahOrder == 1) ? 'desc' : 'asc'))
      })
      .orderBy('tanggal', 'desc')
      .paginate(page, limit)

    tanggals.baseUrl('/app/riwatat/penjualan')

    tanggals.queryString({
      ob: sanitizedOrder,
      aob: sanitizedArahOrder
    })

    let firstPage =
      tanggals.currentPage - 2 > 0 ?
      tanggals.currentPage - 2 :
      tanggals.currentPage - 1 > 0 ?
      tanggals.currentPage - 1 :
      tanggals.currentPage
    let lastPage =
      tanggals.currentPage + 2 <= tanggals.lastPage ?
      tanggals.currentPage + 2 :
      tanggals.currentPage + 1 <= tanggals.lastPage ?
      tanggals.currentPage + 1 :
      tanggals.currentPage

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
      formatDate:formatDate,
      pasaranFromTanggal: pasaranFromTanggal
    }

    return await view.render('riwayat/penjualan/list-tanggal-jual', {
      tanggals,
      tambahan,
      fungsi
    })
  }

  public async listRiwayatSekarang({
    view,
    request
  }: HttpContextContract) {
    const tanggalSekarang = DateTime.now()

    const opsiOrder = [
      'penjualans.created_at',
      'penjualans.nama_barang',
      'bentuk',
      'kadar',
      'penjualans.berat_barang',
      'penjualans.harga_jual_akhir',
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

    let penjualans = await Database
      .from('penjualans')
      .join('kode_produksis', 'penjualans.kode_produksi_id', 'kode_produksis.id')
      .join('kadars', 'kode_produksis.kadar_id', 'kadars.id')
      .join('models', 'penjualans.model_id', 'models.id')
      .join('bentuks', 'models.bentuk_id', 'bentuks.id')
      .select(
        'penjualans.id as id',
        'penjualans.nama_barang as namaBarang',
        'penjualans.created_at as createdAt',
        'penjualans.harga_jual_akhir as hargaJualAkhir',
        'penjualans.berat_barang as beratBarang',
        'kadars.nama as kadar',
        'kadars.warna_nota as warnaNota',
        'bentuks.bentuk as bentuk'
      )
      .select(
        Database
        .from('kode_produksis')
        .join('kadars', 'kode_produksis.kadar_id', 'kadars.id')
        .whereColumn('kode_produksis.id', 'penjualans.kode_produksi_id')
        .limit(1)
        .select('kadars.nama')
        .as('kadar')
      )
      .select(
        Database
        .from('kode_produksis')
        .join('kadars', 'kode_produksis.kadar_id', 'kadars.id')
        .whereColumn('kode_produksis.id', 'penjualans.kode_produksi_id')
        .limit(1)
        .select('kadars.warna_nota')
        .as('warnaNota')
      )
      .select(
        Database
        .from('kelompoks')
        .join('bentuks', 'kelompoks.bentuk_id', 'bentuks.id')
        .whereColumn('kelompoks.id', 'penjualans.kelompok_id')
        .limit(1)
        .select('bentuks.bentuk')
        .as('bentuk')
      )

      .whereNull('penjualans.deleted_at')
      .whereRaw('DATE(penjualans.created_at) = DATE(?)', [tanggalSekarang.toISO()])
      .if(cari !== '', (query) => {
        query.where('penjualans.nama_barang', 'like', `%${cari}%`)
      })
      .if(preparedKadar !== 'Semua' && preparedKadar !== '', (query) => {
        query.where('kadars.nama', '=', preparedKadar)
      })    
      .if(sanitizedOrder !== 0, (query) => {
        query.orderBy(opsiOrder[sanitizedOrder], ((sanitizedArahOrder == 1) ? 'desc' : 'asc'))
      })
      .orderBy('penjualans.created_at', 'desc')
      .paginate(page, limit)

    penjualans.baseUrl('/app/riwayat/penjualan/sekarang')

    const qsParam = {
      ob: sanitizedOrder,
      aob: sanitizedArahOrder
    }

    if (cari !== '') qsParam['cari'] = cari
    if (filterKadar !== 0) qsParam['fk'] = filterKadar

    penjualans.queryString(qsParam)

    let firstPage =
      penjualans.currentPage - 2 > 0 ?
      penjualans.currentPage - 2 :
      penjualans.currentPage - 1 > 0 ?
      penjualans.currentPage - 1 :
      penjualans.currentPage
    let lastPage =
      penjualans.currentPage + 2 <= penjualans.lastPage ?
      penjualans.currentPage + 2 :
      penjualans.currentPage + 1 <= penjualans.lastPage ?
      penjualans.currentPage + 1 :
      penjualans.currentPage

    if (lastPage - firstPage < 4 && penjualans.lastPage > 4) {
      if (penjualans.currentPage < penjualans.firstPage + 2) {
        lastPage += 4 - (lastPage - firstPage)
      }

      if (lastPage == penjualans.lastPage) {
        firstPage -= 4 - (lastPage - firstPage)
      }
    }

    const tempLastData = 10 + (penjualans.currentPage - 1) * limit

    const rekap = await Database
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
      .whereRaw('DATE(created_at) = DATE(?)', [tanggalSekarang.toISO()])
      .whereNull('deleted_at')
      .first()

    const fungsi = {
      rupiahParser: rupiahParser
    }

    const tambahan = {
      pengurutan: sanitizedOrder,
      pencarian: cari,
      firstPage: firstPage,
      lastPage: lastPage,
      firstDataInPage: 1 + (penjualans.currentPage - 1) * limit,
      lastDataInPage: tempLastData >= penjualans.total ? penjualans.total : tempLastData,
    }

    return await view.render('riwayat/penjualan/list-riwayat-jual-sekarang', {
      tambahan,
      penjualans,
      fungsi,
      rekap
    })
  }

  public async listRiwayatByTanggal({
    view,
    params,
    request,
    response,
    session
  }: HttpContextContract) {
    let tanggal = DateTime.fromISO(params.tanggal)

    if (tanggal.isValid) {

      const opsiOrder = [
        'penjualans.created_at',
        'penjualans.nama_barang',
        'bentuk',
        'kadar',
        'penjualans.berat_barang',
        'penjualans.harga_jual_akhir',
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

      let penjualans = await Database
        .from('penjualans')
        .join('kode_produksis', 'penjualans.kode_produksi_id', 'kode_produksis.id')
        .join('kadars', 'kode_produksis.kadar_id', 'kadars.id')
        .join('models', 'penjualans.model_id', 'models.id')
        .join('bentuks', 'models.bentuk_id', 'bentuks.id')
        .select(
          'penjualans.id as id',
          'penjualans.nama_barang as namaBarang',
          'penjualans.created_at as createdAt',
          'penjualans.harga_jual_akhir as hargaJualAkhir',
          'penjualans.berat_barang as beratBarang',
          'kadars.nama as kadar',
          'kadars.warna_nota as warnaNota',
          'bentuks.bentuk as bentuk'
        )
        .whereNull('penjualans.deleted_at')
        .whereRaw('DATE(penjualans.created_at) = DATE(?)', [tanggal.toISO()])
        .if(cari !== '', (query) => {
          query.where('penjualans.nama_barang', 'like', `%${cari}%`)
        })
        .if(preparedKadar !== 'Semua' && preparedKadar !== '', (query) => {
          query.where('kadars.nama', '=', preparedKadar)
        })    
        .if(sanitizedOrder !== 0, (query) => {
          query.orderBy(opsiOrder[sanitizedOrder], ((sanitizedArahOrder == 1) ? 'desc' : 'asc'))
        })
        .orderBy('penjualans.created_at', 'desc')
        .paginate(page, limit)

      penjualans.baseUrl('/app/riwayat/penjualan/' + params.tanggal)

      const qsParam = {
        ob: sanitizedOrder,
        aob: sanitizedArahOrder
      }

      if (cari !== '') qsParam['cari'] = cari
      if (filterKadar !== 0) qsParam['fk'] = filterKadar

      penjualans.queryString(qsParam)

      let firstPage =
        penjualans.currentPage - 2 > 0 ?
        penjualans.currentPage - 2 :
        penjualans.currentPage - 1 > 0 ?
        penjualans.currentPage - 1 :
        penjualans.currentPage
      let lastPage =
        penjualans.currentPage + 2 <= penjualans.lastPage ?
        penjualans.currentPage + 2 :
        penjualans.currentPage + 1 <= penjualans.lastPage ?
        penjualans.currentPage + 1 :
        penjualans.currentPage

      if (lastPage - firstPage < 4 && penjualans.lastPage > 4) {
        if (penjualans.currentPage < penjualans.firstPage + 2) {
          lastPage += 4 - (lastPage - firstPage)
        }

        if (lastPage == penjualans.lastPage) {
          firstPage -= 4 - (lastPage - firstPage)
        }
      }

      const tempLastData = 10 + (penjualans.currentPage - 1) * limit

      const rekap = await Database
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
        firstDataInPage: 1 + (penjualans.currentPage - 1) * limit,
        lastDataInPage: tempLastData >= penjualans.total ? penjualans.total : tempLastData,
      }

      return await view.render('riwayat/penjualan/list-riwayat-jual-pertanggal', {
        tambahan,
        penjualans,
        fungsi,
        rekap,
        tanggal
      })


    } else {
      session.flash('alertError', 'Tanggal penjualan yang anda isikan tidak valid!')
      return response.redirect().toPath('/app/riwayat/penjualan/')
    }
    // return await view.render('riwayat/penjualan/list-riwayat-jual-pertanggal')
  }

  public async getKadarMinimal({}: HttpContextContract) {
    const kadars = await Database
      .from('kadars')
      .select('id', 'nama')

    return kadars
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
    const pasaran = new CPasaran()

    return this.kapitalHurufPertama(pasaran.pasaranDariTanggalPlus(tanggal))
  } else {
    return 'tidak valid'
  }
}