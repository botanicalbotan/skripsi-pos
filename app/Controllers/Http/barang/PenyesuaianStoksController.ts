import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import { DateTime } from 'luxon'
import Drive from '@ioc:Adonis/Core/Drive'
import User from 'App/Models/User'
import PenyesuaianStok from 'App/Models/barang/PenyesuaianStok'
import Kelompok from 'App/Models/barang/Kelompok'

export default class PenyesuaianStoksController {
  // Cuma bisa buat hari ini doang
  public async form({ view, request }: HttpContextContract) {
    const opsiOrder = [
      'kelompoks.nama',
      'penyesuaian_stoks.stok_tercatat',
      'penyesuaian_stoks.stok_sebenarnya',
      'bentuks.bentuk',
    ]
    const page = request.input('page', 1)
    const order = request.input('ob', 0)
    const arahOrder = request.input('aob', 0)
    const sanitizedOrder = order < opsiOrder.length && order >= 0 && order ? order : 0
    const sanitizedArahOrder = arahOrder == 1 ? 1 : 0
    const cari = request.input('cari', '')
    const filter = request.input('filter', 0)
    const sanitizedFilter = filter < 5 && filter >= 0 && filter ? filter : 0
    const limit = 10

    const kelompoks = await Database.from('kelompoks')
      .join('kadars', 'kelompoks.kadar_id', '=', 'kadars.id')
      .join('bentuks', 'kelompoks.bentuk_id', '=', 'bentuks.id')
      // .leftJoin('penyesuaian_stoks', 'kelompoks.id', 'penyesuaian_stoks.kelompok_id')
      .leftJoin('penyesuaian_stoks', (query) => {
        query.on('penyesuaian_stoks.kelompok_id', 'kelompoks.id').onExists((subQuery) => {
          subQuery
            .select('*')
            .from('penyesuaian_stoks as sub')
            .whereRaw('penyesuaian_stoks.id = sub.id')
            .whereRaw('DATE(sub.created_at) = DATE(?)', [DateTime.now().toSQLDate()])
        })
      })
      .whereNull('kelompoks.deleted_at')
      .select(
        'kelompoks.id as idKel',
        'kelompoks.nama as nama',
        'kelompoks.berat_kelompok as beratKelompok',
        'kadars.nama as kadar',
        'bentuks.bentuk as bentuk',
        'kelompoks.stok as stok',
        'kelompoks.stok_minimal as stokMinimal',
        'kelompoks.apakah_dimonitor as apakahDimonitor',
        'kadars.warna_nota as warnaNota',
        'penyesuaian_stoks.id as idCek',
        'penyesuaian_stoks.stok_tercatat as stokTercatat',
        'penyesuaian_stoks.stok_sebenarnya as stokSebenarnya',
        'penyesuaian_stoks.butuh_cek_ulang as butuhCekUlang'
      )
      .select(
        Database.raw(
          '(SELECT(maman.stok_sebenarnya - maman.stok_tercatat) FROM penyesuaian_stoks as maman WHERE maman.id = penyesuaian_stoks.id) as selisih'
        )
      )
      .if(cari !== '', (query) => {
        query.where('kelompoks.nama', 'like', `%${cari}%`)
      })
      .if(sanitizedFilter == 0, (query) => {
        query.where('apakah_dimonitor', '=', 1).andWhereNull('penyesuaian_stoks.id')
      })
      .if(sanitizedFilter == 1, (query) => {
        query
          .where('apakah_dimonitor', '=', 1)
          .andWhereNotNull('penyesuaian_stoks.stok_tercatat')
          .andWhereColumn('penyesuaian_stoks.stok_tercatat', 'penyesuaian_stoks.stok_sebenarnya')
          .andWhere('butuh_cek_ulang', false)
      })
      .if(sanitizedFilter == 2, (query) => {
        query
          .where('apakah_dimonitor', '=', 1)
          .andWhereNotNull('penyesuaian_stoks.id')
          .andWhereNotColumn('penyesuaian_stoks.stok_tercatat', 'penyesuaian_stoks.stok_sebenarnya')
          .andWhere('butuh_cek_ulang', false)
      })
      .if(sanitizedFilter == 3, (query) => {
        query.where('apakah_dimonitor', '=', 1).andWhere('butuh_cek_ulang', true)
      })
      .if(sanitizedFilter == 4, (query) => {
        query.where('apakah_dimonitor', '=', 0)
      })
      .orderBy(opsiOrder[sanitizedOrder], sanitizedArahOrder == 1 ? 'desc' : 'asc')
      .orderBy('kelompoks.nama')
      .paginate(page, limit)

    kelompoks.baseUrl('/app/barang/penyesuaian')

    //----------------- total kelompok, jangan ngikut pagination ---------------
    const kelompokTotal = await Database.from('kelompoks')
      .count('id', 'jumlah')
      .whereNull('deleted_at')
      .first()

    //----------------- ngeliat jumlah kelompok diabaikan ----------------------
    const kelompokAbai = await Database.from('kelompoks')
      .count('id', 'jumlah')
      .where('apakah_dimonitor', '=', 0)
      .andWhereNull('deleted_at')
      .first()

    //---------------- sudah, belum, bermasalah -------------------------------
    const belumCek = await Database.from('kelompoks')
      .leftJoin('penyesuaian_stoks', (query) => {
        query.on('penyesuaian_stoks.kelompok_id', 'kelompoks.id').onExists((subQuery) => {
          subQuery
            .select('*')
            .from('penyesuaian_stoks as sub')
            .whereRaw('penyesuaian_stoks.id = sub.id')
            .whereRaw('DATE(sub.created_at) = DATE(?)', [DateTime.now().toSQLDate()])
        })
      })
      .count('kelompoks.id', 'jumlah')
      .where('apakah_dimonitor', '=', 1)
      .andWhereNull('penyesuaian_stoks.id')
      .andWhereNull('kelompoks.deleted_at')
      .first()

    const sesuai = await Database.from('kelompoks')
      .leftJoin('penyesuaian_stoks', (query) => {
        query.on('penyesuaian_stoks.kelompok_id', 'kelompoks.id').onExists((subQuery) => {
          subQuery
            .select('*')
            .from('penyesuaian_stoks as sub')
            .whereRaw('penyesuaian_stoks.id = sub.id')
            .whereRaw('DATE(sub.created_at) = DATE(?)', [DateTime.now().toSQLDate()])
        })
      })
      .count('kelompoks.id', 'jumlah')
      .where('apakah_dimonitor', '=', 1)
      .andWhere('butuh_cek_ulang', false)
      .andWhereNull('kelompoks.deleted_at')
      .andWhereNotNull('penyesuaian_stoks.stok_tercatat')
      .andWhereColumn('penyesuaian_stoks.stok_tercatat', 'penyesuaian_stoks.stok_sebenarnya')
      .first()

    const bermasalah = await Database.from('kelompoks')
      .leftJoin('penyesuaian_stoks', (query) => {
        query.on('penyesuaian_stoks.kelompok_id', 'kelompoks.id').onExists((subQuery) => {
          subQuery
            .select('*')
            .from('penyesuaian_stoks as sub')
            .whereRaw('penyesuaian_stoks.id = sub.id')
            .whereRaw('DATE(sub.created_at) = DATE(?)', [DateTime.now().toSQLDate()])
        })
      })
      .count('kelompoks.id', 'jumlah')
      .where('apakah_dimonitor', '=', 1)
      .andWhere('butuh_cek_ulang', false)
      .andWhereNull('kelompoks.deleted_at')
      .andWhereNotNull('penyesuaian_stoks.id')
      .andWhereNotColumn('penyesuaian_stoks.stok_tercatat', 'penyesuaian_stoks.stok_sebenarnya')
      .first()

    const cekUlang = await Database.from('kelompoks')
      .leftJoin('penyesuaian_stoks', (query) => {
        query.on('penyesuaian_stoks.kelompok_id', 'kelompoks.id').onExists((subQuery) => {
          subQuery
            .select('*')
            .from('penyesuaian_stoks as sub')
            .whereRaw('penyesuaian_stoks.id = sub.id')
            .whereRaw('DATE(sub.created_at) = DATE(?)', [DateTime.now().toSQLDate()])
        })
      })
      .count('kelompoks.id', 'jumlah')
      .where('apakah_dimonitor', '=', 1)
      .andWhere('butuh_cek_ulang', true)
      .andWhereNull('kelompoks.deleted_at')
      .first()

    let qsParam = {
      ob: sanitizedOrder,
      aob: sanitizedArahOrder,
    }

    if (cari !== '') qsParam['cari'] = cari
    if (sanitizedFilter !== 0) qsParam['filter'] = sanitizedFilter
    kelompoks.queryString(qsParam)

    let firstPage =
      kelompoks.currentPage - 2 > 0
        ? kelompoks.currentPage - 2
        : kelompoks.currentPage - 1 > 0
        ? kelompoks.currentPage - 1
        : kelompoks.currentPage
    let lastPage =
      kelompoks.currentPage + 2 <= kelompoks.lastPage
        ? kelompoks.currentPage + 2
        : kelompoks.currentPage + 1 <= kelompoks.lastPage
        ? kelompoks.currentPage + 1
        : kelompoks.currentPage

    if (lastPage - firstPage < 4 && kelompoks.lastPage > 4) {
      if (kelompoks.currentPage < kelompoks.firstPage + 2) {
        lastPage += 4 - (lastPage - firstPage)
      }

      if (lastPage == kelompoks.lastPage) {
        firstPage -= 4 - (lastPage - firstPage)
      }
    }
    // sampe sini
    const tempLastData = 10 + (kelompoks.currentPage - 1) * limit

    let teksFilter = 'Belum dicek'
    if (sanitizedFilter == 1) teksFilter = 'Sesuai'
    else if (sanitizedFilter == 2) teksFilter = 'Bermasalah'
    else if (sanitizedFilter == 3) teksFilter = 'Perlu cek ulang'
    else if (sanitizedFilter == 4) teksFilter = 'Diabaikan'

    const tambahan = {
      pengurutan: sanitizedOrder,
      pencarian: cari,
      filter: sanitizedFilter,
      teksFilter: teksFilter,
      firstPage: firstPage,
      lastPage: lastPage,
      firstDataInPage: 1 + (kelompoks.currentPage - 1) * limit,
      lastDataInPage: tempLastData >= kelompoks.total ? kelompoks.total : tempLastData,
      kelompokTotal: kelompokTotal.jumlah,
      kelompokAbai: kelompokAbai.jumlah,
      kelompokBelumCek: belumCek.jumlah,
      kelompokSesuai: sesuai.jumlah,
      kelompokBermasalah: bermasalah.jumlah,
      kelompokCekUlang: cekUlang.jumlah,
    }

    let roti = [
      {
        laman: 'Kelola Barang',
        alamat: '/app/barang',
      },
      {
        laman: 'Penyesuaian Hari Ini',
      },
    ]

    return view.render('barang/penyesuaian-stok/form-penyesuaian', {
      kelompoks,
      tambahan,
      roti,
    })
  }

  // sesuai tanggal di rekapHarian
  public async penyesuaianRekapHarian({ view, request, params, session, response }: HttpContextContract) {
    const tanggal = DateTime.fromISO(params.tanggal)
    if(!tanggal.isValid){
      session.flash('alertError', 'Tanggal yang anda pilih tidak valid!')
      return response.redirect().toPath('/app/kas/rekap-harian')
    }

    const opsiOrder = [
      'kelompoks.nama',
      'penyesuaian_stoks.stok_tercatat',
      'penyesuaian_stoks.stok_sebenarnya',
      'bentuks.bentuk',
    ]
    const page = request.input('page', 1)
    const order = request.input('ob', 0)
    const arahOrder = request.input('aob', 0)
    const sanitizedOrder = order < opsiOrder.length && order >= 0 && order ? order : 0
    const sanitizedArahOrder = arahOrder == 1 ? 1 : 0
    const cari = request.input('cari', '')
    const filter = request.input('filter', 0)
    const sanitizedFilter = filter < 5 && filter >= 0 && filter ? filter : 0
    const limit = 10

    const kelompoks = await Database.from('kelompoks')
      .join('kadars', 'kelompoks.kadar_id', '=', 'kadars.id')
      .join('bentuks', 'kelompoks.bentuk_id', '=', 'bentuks.id')
      // .leftJoin('penyesuaian_stoks', 'kelompoks.id', 'penyesuaian_stoks.kelompok_id')
      .leftJoin('penyesuaian_stoks', (query) => {
        query.on('penyesuaian_stoks.kelompok_id', 'kelompoks.id').onExists((subQuery) => {
          subQuery
            .select('*')
            .from('penyesuaian_stoks as sub')
            .whereRaw('penyesuaian_stoks.id = sub.id')
            .whereRaw('DATE(sub.created_at) = DATE(?)', [tanggal.toSQLDate()])
        })
      })
      .whereNull('kelompoks.deleted_at')
      .andWhereRaw('DATE(kelompoks.created_at) <= DATE(?)', [tanggal.toSQLDate()]) // WAJIB BUAT REKAP HARIAN
      .select(
        'kelompoks.id as idKel',
        'kelompoks.nama as nama',
        'kelompoks.berat_kelompok as beratKelompok',
        'kadars.nama as kadar',
        'bentuks.bentuk as bentuk',
        'kelompoks.stok as stok',
        'kelompoks.stok_minimal as stokMinimal',
        'kelompoks.apakah_dimonitor as apakahDimonitor',
        'kadars.warna_nota as warnaNota',
        'penyesuaian_stoks.id as idCek',
        'penyesuaian_stoks.stok_tercatat as stokTercatat',
        'penyesuaian_stoks.stok_sebenarnya as stokSebenarnya',
        'penyesuaian_stoks.butuh_cek_ulang as butuhCekUlang'
      )
      .select(
        Database.raw(
          '(SELECT(maman.stok_sebenarnya - maman.stok_tercatat) FROM penyesuaian_stoks as maman WHERE maman.id = penyesuaian_stoks.id) as selisih'
        )
      )
      .if(cari !== '', (query) => {
        query.where('kelompoks.nama', 'like', `%${cari}%`)
      })
      .if(sanitizedFilter == 0, (query) => {
        query.where('apakah_dimonitor', '=', 1).andWhereNull('penyesuaian_stoks.id')
      })
      .if(sanitizedFilter == 1, (query) => {
        query
          .where('apakah_dimonitor', '=', 1)
          .andWhereNotNull('penyesuaian_stoks.stok_tercatat')
          .andWhereColumn('penyesuaian_stoks.stok_tercatat', 'penyesuaian_stoks.stok_sebenarnya')
          .andWhere('butuh_cek_ulang', false)
      })
      .if(sanitizedFilter == 2, (query) => {
        query
          .where('apakah_dimonitor', '=', 1)
          .andWhereNotNull('penyesuaian_stoks.id')
          .andWhereNotColumn('penyesuaian_stoks.stok_tercatat', 'penyesuaian_stoks.stok_sebenarnya')
          .andWhere('butuh_cek_ulang', false)
      })
      .if(sanitizedFilter == 3, (query) => {
        query.where('apakah_dimonitor', '=', 1).andWhere('butuh_cek_ulang', true)
      })
      .if(sanitizedFilter == 4, (query) => {
        query.where('apakah_dimonitor', '=', 0)
      })
      .orderBy(opsiOrder[sanitizedOrder], sanitizedArahOrder == 1 ? 'desc' : 'asc')
      .orderBy('kelompoks.nama')
      .paginate(page, limit)

    kelompoks.baseUrl(`/app/kas/rekap-harian/${params.tanggal}/penyesuaian`)

    //----------------- total kelompok, jangan ngikut pagination ---------------
    const kelompokTotal = await Database.from('kelompoks')
      .count('id', 'jumlah')
      .andWhereRaw('DATE(kelompoks.created_at) <= DATE(?)', [tanggal.toSQLDate()]) // WAJIB BUAT REKAP HARIAN
      .whereNull('deleted_at')
      .first()

    //----------------- ngeliat jumlah kelompok diabaikan ----------------------
    const kelompokAbai = await Database.from('kelompoks')
      .count('id', 'jumlah')
      .where('apakah_dimonitor', '=', 0)
      .andWhereRaw('DATE(kelompoks.created_at) <= DATE(?)', [tanggal.toSQLDate()]) // WAJIB BUAT REKAP HARIAN
      .andWhereNull('deleted_at')
      .first()

    //---------------- sudah, belum, bermasalah -------------------------------
    const belumCek = await Database.from('kelompoks')
      .leftJoin('penyesuaian_stoks', (query) => {
        query.on('penyesuaian_stoks.kelompok_id', 'kelompoks.id').onExists((subQuery) => {
          subQuery
            .select('*')
            .from('penyesuaian_stoks as sub')
            .whereRaw('penyesuaian_stoks.id = sub.id')
            .whereRaw('DATE(sub.created_at) = DATE(?)', [tanggal.toSQLDate()])
        })
      })
      .count('kelompoks.id', 'jumlah')
      .where('apakah_dimonitor', '=', 1)
      .andWhereRaw('DATE(kelompoks.created_at) <= DATE(?)', [tanggal.toSQLDate()]) // WAJIB BUAT REKAP HARIAN
      .andWhereNull('penyesuaian_stoks.id')
      .andWhereNull('kelompoks.deleted_at')
      .first()

    const sesuai = await Database.from('kelompoks')
      .leftJoin('penyesuaian_stoks', (query) => {
        query.on('penyesuaian_stoks.kelompok_id', 'kelompoks.id').onExists((subQuery) => {
          subQuery
            .select('*')
            .from('penyesuaian_stoks as sub')
            .whereRaw('penyesuaian_stoks.id = sub.id')
            .whereRaw('DATE(sub.created_at) = DATE(?)', [tanggal.toSQLDate()])
        })
      })
      .count('kelompoks.id', 'jumlah')
      .where('apakah_dimonitor', '=', 1)
      .andWhere('butuh_cek_ulang', false)
      .andWhereRaw('DATE(kelompoks.created_at) <= DATE(?)', [tanggal.toSQLDate()]) // WAJIB BUAT REKAP HARIAN
      .andWhereNull('kelompoks.deleted_at')
      .andWhereNotNull('penyesuaian_stoks.stok_tercatat')
      .andWhereColumn('penyesuaian_stoks.stok_tercatat', 'penyesuaian_stoks.stok_sebenarnya')
      .first()

    const bermasalah = await Database.from('kelompoks')
      .leftJoin('penyesuaian_stoks', (query) => {
        query.on('penyesuaian_stoks.kelompok_id', 'kelompoks.id').onExists((subQuery) => {
          subQuery
            .select('*')
            .from('penyesuaian_stoks as sub')
            .whereRaw('penyesuaian_stoks.id = sub.id')
            .whereRaw('DATE(sub.created_at) = DATE(?)', [tanggal.toSQLDate()])
        })
      })
      .count('kelompoks.id', 'jumlah')
      .where('apakah_dimonitor', '=', 1)
      .andWhere('butuh_cek_ulang', false)
      .andWhereNull('kelompoks.deleted_at')
      .andWhereRaw('DATE(kelompoks.created_at) <= DATE(?)', [tanggal.toSQLDate()]) // WAJIB BUAT REKAP HARIAN
      .andWhereNotNull('penyesuaian_stoks.id')
      .andWhereNotColumn('penyesuaian_stoks.stok_tercatat', 'penyesuaian_stoks.stok_sebenarnya')
      .first()

    const cekUlang = await Database.from('kelompoks')
      .leftJoin('penyesuaian_stoks', (query) => {
        query.on('penyesuaian_stoks.kelompok_id', 'kelompoks.id').onExists((subQuery) => {
          subQuery
            .select('*')
            .from('penyesuaian_stoks as sub')
            .whereRaw('penyesuaian_stoks.id = sub.id')
            .whereRaw('DATE(sub.created_at) = DATE(?)', [tanggal.toSQLDate()])
        })
      })
      .count('kelompoks.id', 'jumlah')
      .where('apakah_dimonitor', '=', 1)
      .andWhere('butuh_cek_ulang', true)
      .andWhereRaw('DATE(kelompoks.created_at) <= DATE(?)', [tanggal.toSQLDate()]) // WAJIB BUAT REKAP HARIAN
      .andWhereNull('kelompoks.deleted_at')
      .first()

    let qsParam = {
      ob: sanitizedOrder,
      aob: sanitizedArahOrder,
    }

    if (cari !== '') qsParam['cari'] = cari
    if (sanitizedFilter !== 0) qsParam['filter'] = sanitizedFilter

    kelompoks.queryString(qsParam)

    let firstPage =
      kelompoks.currentPage - 2 > 0
        ? kelompoks.currentPage - 2
        : kelompoks.currentPage - 1 > 0
        ? kelompoks.currentPage - 1
        : kelompoks.currentPage
    let lastPage =
      kelompoks.currentPage + 2 <= kelompoks.lastPage
        ? kelompoks.currentPage + 2
        : kelompoks.currentPage + 1 <= kelompoks.lastPage
        ? kelompoks.currentPage + 1
        : kelompoks.currentPage

    if (lastPage - firstPage < 4 && kelompoks.lastPage > 4) {
      if (kelompoks.currentPage < kelompoks.firstPage + 2) {
        lastPage += 4 - (lastPage - firstPage)
      }

      if (lastPage == kelompoks.lastPage) {
        firstPage -= 4 - (lastPage - firstPage)
      }
    }
    // sampe sini
    const tempLastData = 10 + (kelompoks.currentPage - 1) * limit

    let teksFilter = 'Belum dicek'
    if (sanitizedFilter == 1) teksFilter = 'Sesuai'
    else if (sanitizedFilter == 2) teksFilter = 'Bermasalah'
    else if (sanitizedFilter == 3) teksFilter = 'Perlu cek ulang'
    else if (sanitizedFilter == 4) teksFilter = 'Diabaikan'

    const tambahan = {
      pengurutan: sanitizedOrder,
      pencarian: cari,
      filter: sanitizedFilter,
      teksFilter: teksFilter,
      firstPage: firstPage,
      lastPage: lastPage,
      firstDataInPage: 1 + (kelompoks.currentPage - 1) * limit,
      lastDataInPage: tempLastData >= kelompoks.total ? kelompoks.total : tempLastData,
      kelompokTotal: kelompokTotal.jumlah,
      kelompokAbai: kelompokAbai.jumlah,
      kelompokBelumCek: belumCek.jumlah,
      kelompokSesuai: sesuai.jumlah,
      kelompokBermasalah: bermasalah.jumlah,
      kelompokCekUlang: cekUlang.jumlah,
      tanggal
    }

    let roti = [
      {
        laman: 'Pembukuan Kas',
        alamat: '/app/kas',
      },
      {
        laman: 'Rekap Harian',
        alamat: '/app/kas/rekap-harian',
      },
      {
        laman: tanggal.toFormat('D'),
        alamat: `/app/kas/rekap-harian/${params.tanggal}`,
      },
      {
        laman: 'Penyesuaian Stok',
      },
    ]

    return view.render('kas/rekap-harian/penyesuaian-view-rekap-harian', {
      kelompoks,
      tambahan,
      roti,
    })
  }

  public async show({ view, params, session, response }) {
    try {
      const tanggal = DateTime.fromISO(params.tanggal)
      if (!tanggal.isValid) throw 'Tanggal tidak valid'
      console.log(tanggal.toFormat('D'))

      const cek = await Database.from('kelompoks')
        .join('bentuks', 'bentuks.id', 'kelompoks.bentuk_id')
        .join('kadars', 'kadars.id', 'kelompoks.kadar_id')
        .leftJoin('penyesuaian_stoks', (query) => {
          query.on('penyesuaian_stoks.kelompok_id', 'kelompoks.id').onExists((subQuery) => {
            subQuery
              .select('*')
              .from('penyesuaian_stoks as sub')
              .whereRaw('penyesuaian_stoks.id = sub.id')
              .whereRaw('DATE(sub.created_at) = DATE(?)', [tanggal.toSQLDate()])
          })
        })
        .leftJoin('penggunas', 'penggunas.id', 'penyesuaian_stoks.pengguna_id')
        .leftJoin('jabatans', 'jabatans.id', 'penggunas.jabatan_id')
        .where('penyesuaian_stoks.id', params.idPen)
        .whereNull('kelompoks.deleted_at')
        .select(
          'kelompoks.nama as namaKel',
          'bentuks.bentuk as bentukKel',
          'kadars.nama as kadarKel',
          'kadars.warna_nota as warnaNota',
          'penyesuaian_stoks.keterangan as keterangan',
          'penyesuaian_stoks.stok_tercatat as stokTercatat',
          'penyesuaian_stoks.stok_sebenarnya as stokSebenarnya',
          'penyesuaian_stoks.created_at as createdAt',
          'penyesuaian_stoks.butuh_cek_ulang as butuhCekUlang',
          'penggunas.nama as namaPencatat',
          'penggunas.id as idPencatat',
          'penggunas.foto as fotoPencatat',
          'jabatans.nama as jabatanPencatat'
        )
        .select(
          Database.raw(
            '(SELECT(maman.stok_sebenarnya - maman.stok_tercatat) FROM penyesuaian_stoks as maman WHERE maman.id = penyesuaian_stoks.id) as selisih'
          )
        )
        .firstOrFail()

      const tambahan = {
        adaFotoPencatat: await Drive.exists('profilePict/' + cek.fotoPencatat),
      }

      let roti: Array<{ laman: string; alamat: string | undefined }> = [
        {
          laman: 'Kelola Barang',
          alamat: '/app/barang/penyesuaian/',
        },
        {
          laman: 'Penyesuaian Hari Ini',
          alamat: '/app/barang/penyesuaian/',
        },
        {
          laman: cek.namaKel,
          alamat: undefined,
        },
      ]

      // kalau bukan hari ini, rotinya diganti ke rekap harian
      if (tanggal.startOf('day').toMillis() !== DateTime.now().startOf('day').toMillis()) {
        roti = [
          {
            laman: 'Pembukuan Kas',
            alamat: '/app/kas',
          },
          {
            laman: 'Rekap Harian',
            alamat: '/app/kas/rekap-harian',
          },
          {
            laman: tanggal.toFormat('D'),
            alamat: '/app/kas/rekap-harian/' + tanggal.toISODate(),
          },
          {
            laman: 'Penyesuaian',
            alamat: '/app/kas/rekap-harian/' + tanggal.toISODate() + '/penyesuaian',
          },
          {
            laman: cek.namaKel,
            alamat: undefined,
          },
        ]
      }

      return await view.render('barang/penyesuaian-stok/view-penyesuaian', {
        cek,
        roti,
        tambahan,
      })
    } catch (error) {
      session.flash('alertError', 'Penyesuaian stok kelompok yang anda pilih tidak valid!')
      console.log(error)
      return response.redirect().toPath('/app/barang/penyesuaian')
    }
  }

  // jadi satu store ama update, soale perhari cuma butuh 1
  public async store({ params, response, request, auth }: HttpContextContract) {
    try {
      if (!auth.user) throw 'auth ngga valid'
      const userPengakses = await User.findOrFail(auth.user.id)
      await userPengakses.load('pengguna')

      // perlu id kelompok
      const kelompok = await Database.from('kelompoks')
        .leftJoin('penyesuaian_stoks', (query) => {
          query.on('penyesuaian_stoks.kelompok_id', 'kelompoks.id').onExists((subQuery) => {
            subQuery
              .select('*')
              .from('penyesuaian_stoks as sub')
              .whereRaw('penyesuaian_stoks.id = sub.id')
              .whereRaw('DATE(sub.created_at) = DATE(?)', [DateTime.now().toSQLDate()])
          })
        })
        .where('kelompoks.id', params.idKel)
        .andWhereNull('kelompoks.deleted_at')
        .andWhere('kelompoks.apakah_dimonitor', true)
        .select(
          'kelompoks.stok as stok',
          'kelompoks.id as idKel',
          'penyesuaian_stoks.id as penyeId'
        )
        .firstOrFail()

      const isiKeterangan = request.input('keterangan')
      const isiStok = parseInt(request.input('stokSebenarnya'))

      if ((!isiStok && isiStok !== 0) || isNaN(isiStok) || isiStok < 0)
        throw { custom: true, msg: 'Jumlah stok sebenarnya tidak valid!' }
      if (isiStok !== kelompok.stok && (!isiKeterangan || isiKeterangan === '-'))
        throw { custom: true, msg: 'Keterangan harus terisi' }

      if (kelompok.penyeId) {
        const penye = await PenyesuaianStok.findOrFail(kelompok.penyeId)
        penye.stokTercatat = kelompok.stok
        penye.stokSebenarnya = isiStok
        penye.penggunaId = userPengakses.pengguna.id
        penye.keterangan = isiStok !== kelompok.stok && isiKeterangan ? isiKeterangan : '-'
        penye.butuhCekUlang = false
        await penye.save()
      } else {
        await PenyesuaianStok.create({
          keterangan: isiStok !== kelompok.stok && isiKeterangan ? isiKeterangan : '-',
          stokTercatat: kelompok.stok,
          stokSebenarnya: isiStok,
          penggunaId: userPengakses.pengguna.id,
          kelompokId: kelompok.idKel,
          butuhCekUlang: false,
        })
      }

      // ubah stok kelompok sesuai penyesuaian_stok
      const kel = await Kelompok.findOrFail(kelompok.idKel)
      kel.stok = isiStok
      await kel.save()

      return response.accepted({ msg: 'ok' })
    } catch (error) {
      console.log(error)
      if (error.custom && error.msg) {
        return response.badRequest({ error: error.msg })
      } else {
        return response.badRequest({ error: 'Ada masalah pada server!' })
      }
    }
  }

  // spesifik buat ngambil data buat penyesuaian
  public async getKelompokByIdCekHariIni({ request, response }: HttpContextContract) {
    const id = request.input('id')
    try {
      const kelompok = await Database.from('kelompoks')
        .select(
          'kelompoks.nama as nama',
          'kelompoks.stok as stokTercatat',
          'penyesuaian_stoks.stok_sebenarnya as stokSebenarnya',
          'penyesuaian_stoks.keterangan as keterangan',
          'penggunas.nama as namaPencatat',
          'penyesuaian_stoks.created_at as createdAt'
        )
        // .leftJoin('penyesuaian_stoks', 'kelompoks.id', 'penyesuaian_stoks.kelompok_id')
        .leftJoin('penyesuaian_stoks', (query) => {
          query.on('penyesuaian_stoks.kelompok_id', 'kelompoks.id').onExists((subQuery) => {
            subQuery
              .select('*')
              .from('penyesuaian_stoks as sub')
              .whereRaw('penyesuaian_stoks.id = sub.id')
              .whereRaw('DATE(sub.created_at) = DATE(?)', [DateTime.now().toSQLDate()])
          })
        })
        .leftJoin('penggunas', 'penggunas.id', 'penyesuaian_stoks.pengguna_id')
        .where('kelompoks.id', id)
        .andWhereNull('kelompoks.deleted_at')
        .firstOrFail()

      return {
        ...kelompok,
        status:
          kelompok.createdAt && kelompok.namaPencatat
            ? `Sudah disesuaikan pada ${kelompok.createdAt.toLocaleTimeString('id-ID', {
                timeStyle: 'short',
              })}`
            : 'Belum disesuaikan',
        isUpdate:
          kelompok.createdAt &&
          kelompok.namaPencatat &&
          (kelompok.stokSebenarnya || kelompok.stokSebenarnya === 0)
            ? true
            : false,
      }
    } catch (error) {
      return response.notFound('ID tidak valid')
    }
  }
}
