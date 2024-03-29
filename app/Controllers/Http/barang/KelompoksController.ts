import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Pengaturan from 'App/Models/sistem/Pengaturan'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Kelompok from 'App/Models/barang/Kelompok'
import Database from '@ioc:Adonis/Lucid/Database'
import Bentuk from 'App/Models/barang/Bentuk'
import Kadar from 'App/Models/barang/Kadar'
import { DateTime, Settings } from 'luxon'
import Drive from '@ioc:Adonis/Core/Drive'
import User from 'App/Models/User'

export default class KelompoksController {
  public async index({ view, request }: HttpContextContract) {
    const opsiOrder = [
      'kelompoks.nama',
      'kelompoks.berat_kelompok',
      'kadars.nama',
      'bentuks.bentuk',
      'kelompoks.stok',
    ]
    const page = request.input('page', 1)
    const order = request.input('ob', 0)
    const arahOrder = request.input('aob', 0)
    const sanitizedOrder = order < opsiOrder.length && order >= 0 && order ? order : 0
    const sanitizedArahOrder = arahOrder == 1 ? 1 : 0
    const cari = request.input('cari', '')
    const filter = request.input('filter', 0)
    const sanitizedFilter = filter < 4 && filter >= 0 && filter ? filter : 0
    const limit = 10

    const kelompoks = await Database.from('kelompoks')
      .join('kadars', 'kelompoks.kadar_id', '=', 'kadars.id')
      .join('bentuks', 'kelompoks.bentuk_id', '=', 'bentuks.id')
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
        'kelompoks.id as id',
        'kelompoks.nama as nama',
        'kelompoks.berat_kelompok as beratKelompok',
        'kadars.nama as kadar',
        'bentuks.bentuk as bentuk',
        'kelompoks.stok as stok',
        'kelompoks.stok_minimal as stokMinimal',
        'kadars.warna_nota as warnaNota',
        'penyesuaian_stoks.id as idCek',
        'penyesuaian_stoks.stok_tercatat as stokTercatat',
        'penyesuaian_stoks.stok_sebenarnya as stokSebenarnya',
        'penyesuaian_stoks.butuh_cek_ulang as butuhCekUlang'
      )
      .select(
        Database.from('penjualans')
          .count('*')
          .whereColumn('penjualans.kelompok_id', 'kelompoks.id')
          .whereRaw('DATE(penjualans.created_at) = DATE(NOW())')
          .as('totalPenjualan')
      )
      .select(
        Database.from('kelompok_penambahans')
          .count('*')
          .whereColumn('kelompok_penambahans.kelompok_id', 'kelompoks.id')
          .whereRaw('DATE(kelompok_penambahans.created_at) = DATE(NOW())')
          .as('totalKaliPenambahan')
      )
      .select(
        Database.from('koreksi_stoks')
          .count('*')
          .whereColumn('koreksi_stoks.kelompok_id', 'kelompoks.id')
          .whereRaw('DATE(koreksi_stoks.created_at) = DATE(NOW())')
          .as('totalKaliKoreksi')
      )
      .if(cari !== '', (query) => {
        query.where('kelompoks.nama', 'like', `%${cari}%`)
      })
      .if(sanitizedFilter == 1, (query) => {
        query.whereColumn('kelompoks.stok', '>', 'kelompoks.stok_minimal')
      })
      .if(sanitizedFilter == 2, (query) => {
        query
          .whereColumn('kelompoks.stok', '<=', 'kelompoks.stok_minimal')
          .andWhere('kelompoks.stok', '>', 0)
      })
      .if(sanitizedFilter == 3, (query) => {
        query.where('kelompoks.stok', '=', 0)
      })
      .orderBy(opsiOrder[sanitizedOrder], sanitizedArahOrder == 1 ? 'desc' : 'asc')
      .orderBy('kelompoks.nama')
      .paginate(page, limit)

    kelompoks.baseUrl('/app/barang/')

    let qsParam = {
      ob: sanitizedOrder,
      aob: sanitizedArahOrder,
    }

    if (cari !== '') qsParam['cari'] = cari
    if (sanitizedFilter !== 0) qsParam['filter'] = sanitizedFilter

    kelompoks.queryString(qsParam)

    const stokCukup = await Database.from('kelompoks')
      .whereColumn('stok', '>', 'stok_minimal')
      .count('*', 'jumlah')
    const stokKurang = await Database.from('kelompoks')
      .whereColumn('stok', '<=', 'stok_minimal')
      .andWhere('stok', '>', 0)
      .count('*', 'jumlah')
    const stokHabis = await Database.from('kelompoks').where('stok', '=', 0).count('*', 'jumlah')

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

    const tambahan = {
      pengurutan: sanitizedOrder,
      pencarian: cari,
      filter: sanitizedFilter,
      firstPage: firstPage,
      lastPage: lastPage,
      firstDataInPage: 1 + (kelompoks.currentPage - 1) * limit,
      lastDataInPage: tempLastData >= kelompoks.total ? kelompoks.total : tempLastData,
    }

    const statistik = {
      stokCukup: stokCukup[0].jumlah,
      stokKurang: stokKurang[0].jumlah,
      stokHabis: stokHabis[0].jumlah,
    }

    let roti = [
      {
        laman: 'Kelompok Perhiasan',
      },
    ]

    return await view.render('barang/list-kelompok', {
      kelompoks,
      tambahan,
      statistik,
      roti,
    })
  }

  public async create({ view }: HttpContextContract) {
    const pengaturan = await Pengaturan.findOrFail(1)
    let defaultPengaturan = {
      stokMinimal: pengaturan.defaultStokMinimalKelompok,
      ingatkanStokMenipis: pengaturan.defaultIngatkanStokMenipis,
    }

    const kadars = await Database.from('kadars').select('id', 'nama')

    const bentuks = await Database.from('bentuks').select('id', 'bentuk')

    let roti = [
      {
        laman: 'Kelompok Perhiasan',
        alamat: '/app/barang',
      },
      {
        laman: 'Baru',
      },
    ]

    return await view.render('barang/kelompok/form-kelompok', {
      defaultPengaturan,
      kadars,
      bentuks,
      roti,
    })
  }

  public async store({ request, response, session, auth }: HttpContextContract) {
    const newKelompokSchema = schema.create({
      nama: schema.string(
        {
          trim: true,
        },
        [
          rules.maxLength(50),
          rules.unique({
            table: 'kelompoks',
            column: 'nama',
            caseInsensitive: true,
          }),
        ]
      ),
      kadar: schema.number([
        rules.unsigned(),
        rules.exists({
          table: 'kadars',
          column: 'id',
        }),
      ]),
      bentuk: schema.number([
        rules.unsigned(),
        rules.exists({
          table: 'bentuks',
          column: 'id',
        }),
      ]),
      beratKelompok: schema.number(),
      stokMinimal: schema.number(),
      stok: schema.number(),
      ingatkanStokMenipis: schema.string.optional(),
      monitorStok: schema.string.optional(),
    })

    const validrequest = await request.validate({
      schema: newKelompokSchema,
    })

    try {
      if (!auth.user) throw 'auth ngga valid'

      const kadar = await Kadar.findOrFail(validrequest.kadar)
      const bentuk = await Bentuk.findOrFail(validrequest.bentuk)

      const userPengakses = await User.findOrFail(auth.user.id)
      await userPengakses.load('pengguna', (query) => {
        query.preload('jabatan')
      })

      await kadar.related('kelompoks').create({
        nama: kapitalKalimat(validrequest.nama),
        kodeKelompok: await generateKodeKelompok(kadar.nama, bentuk.bentuk),
        bentukId: bentuk.id,
        beratKelompok: validrequest.beratKelompok,
        stok: validrequest.stok,
        stokMinimal: validrequest.stokMinimal,
        ingatkanStokMenipis: validrequest.ingatkanStokMenipis ? true : false,
        apakahDimonitor: validrequest.monitorStok ? true : false,
        penggunaId: userPengakses.pengguna.id,
      })

      session.flash('alertSukses', 'Kelompok baru berhasil disimpan!')
      return response.redirect().toPath('/app/barang/')
    } catch (error) {
      session.flash(
        'alertError',
        'Ada masalah saat membuat kelompok baru. Silahkan coba lagi setelah beberapa saat.'
      )
      return response.redirect().back()
    }
  }

  public async show({ view, response, params, session }: HttpContextContract) {
    try {
      const kelompok = await Kelompok.findOrFail(params.id)
      await kelompok.load('bentuk')
      await kelompok.load('kadar', (query) => {
        query.preload('kodeProduksis', (kodeproQuery) => {
          kodeproQuery.select('id', 'kode')
        })
      })
      await kelompok.load('pengguna', (query) => {
        query.preload('jabatan')
      })

      const jualTerakhir = await Database.from('kelompoks')
        .join('penjualans', 'kelompoks.id', 'penjualans.kelompok_id')
        .join('penggunas', 'penggunas.id', 'penjualans.pengguna_id')
        .join('jabatans', 'jabatans.id', 'penggunas.jabatan_id')
        .where('kelompoks.id', kelompok.id)
        .whereNull('penjualans.deleted_at')
        .select(
          'penggunas.nama as namaPencatat',
          'penggunas.id as idPencatat',
          'jabatans.nama as jabatanPencatat',
          'penjualans.created_at as createdAt',
          'penjualans.nama_barang as namaBarang',
          'penjualans.harga_jual_akhir as hargaJual',
          'penjualans.potongan as potongan',
          'penjualans.apakah_potongan_persen as apakahPotonganPersen'
        )
        .orderBy('penjualans.created_at', 'desc')
        .first()

      const tambahTerakhir = await Database.from('kelompok_penambahans')
        .join('penambahan_stoks', 'penambahan_stoks.id', 'kelompok_penambahans.penambahan_stok_id')
        .join('penggunas', 'penggunas.id', 'penambahan_stoks.pengguna_id')
        .join('jabatans', 'jabatans.id', 'penggunas.jabatan_id')
        .where('kelompok_penambahans.kelompok_id', kelompok.id)
        .select(
          'penggunas.nama as namaPencatat',
          'penggunas.id as idPencatat',
          'jabatans.nama as jabatanPencatat',
          'kelompok_penambahans.created_at as createdAt',
          'kelompok_penambahans.perubahan_stok as perubahanStok',
          'kelompok_penambahans.stok_akhir as stokAkhir'
        )
        .orderBy('kelompok_penambahans.created_at', 'desc')
        .first()

      const sesuaiTerakhir = await Database.from('penyesuaian_stoks')
        .join('kelompoks', 'kelompoks.id', 'penyesuaian_stoks.kelompok_id')
        .join('penggunas', 'penggunas.id', 'penyesuaian_stoks.pengguna_id')
        .where('penyesuaian_stoks.kelompok_id', kelompok.id)
        .select(
          'penggunas.nama as namaPencatat',
          'penggunas.id as idPencatat',
          'penyesuaian_stoks.created_at as createdAt',
          'penyesuaian_stoks.butuh_cek_ulang as butuhCekUlang',
          'penyesuaian_stoks.stok_tercatat as stokTercatat',
          'penyesuaian_stoks.stok_sebenarnya as stokSebenarnya'
        )
        .orderBy('penyesuaian_stoks.created_at', 'desc')
        .first()

      const fungsi = {
        rupiahParser: rupiahParser,
      }

      const tambahan = {
        adaFotoPencatat: await Drive.exists('profilePict/' + kelompok.pengguna.foto),
      }

      let roti = [
        {
          laman: 'Kelompok Perhiasan',
          alamat: '/app/barang',
        },
        {
          laman: kelompok.nama,
        },
      ]

      return await view.render('barang/kelompok/view-kelompok', {
        kelompok,
        fungsi,
        tambahan,
        roti,
        tambahTerakhir,
        sesuaiTerakhir,
        jualTerakhir,
      })
    } catch (error) {
      session.flash('alertError', 'Kelompok yang anda akses tidak valid atau terhapus.')
      console.log(error)
      return response.redirect().toPath('/app/barang/')
    }
  }

  public async showMutasiTambah({ view, request, params, response, session }: HttpContextContract) {
    const page = request.input('page', 1)
    const limit = 10

    try {
      const kelompok = await Kelompok.findOrFail(params.id)
      await kelompok.load('bentuk')

      const tambahs = await Database.from('kelompok_penambahans')
        .join('penambahan_stoks', 'penambahan_stoks.id', 'kelompok_penambahans.penambahan_stok_id')
        .select(
          'penambahan_stoks.id as idPenambahan',
          'penambahan_stoks.created_at as createdAt',
          'penambahan_stoks.asal_stok as asalStok',
          'penambahan_stoks.catatan as catatan',
          'kelompok_penambahans.perubahan_stok as perubahanStok',
          'kelompok_penambahans.stok_akhir as stokAkhir'
        )
        .where('kelompok_penambahans.kelompok_id', params.id)
        .orderBy('createdAt', 'desc')
        .paginate(page, limit)

      tambahs.baseUrl(`app/barang/kelompok/${params.id}/penambahan`)

      let firstPage =
        tambahs.currentPage - 2 > 0
          ? tambahs.currentPage - 2
          : tambahs.currentPage - 1 > 0
          ? tambahs.currentPage - 1
          : tambahs.currentPage
      let lastPage =
        tambahs.currentPage + 2 <= tambahs.lastPage
          ? tambahs.currentPage + 2
          : tambahs.currentPage + 1 <= tambahs.lastPage
          ? tambahs.currentPage + 1
          : tambahs.currentPage

      if (lastPage - firstPage < 4 && tambahs.lastPage > 4) {
        if (tambahs.currentPage < tambahs.firstPage + 2) {
          lastPage += 4 - (lastPage - firstPage)
        }

        if (lastPage == tambahs.lastPage) {
          firstPage -= 4 - (lastPage - firstPage)
        }
      }
      // sampe sini
      const tempLastData = 10 + (tambahs.currentPage - 1) * limit

      const tambahan = {
        firstPage: firstPage,
        lastPage: lastPage,
        firstDataInPage: 1 + (tambahs.currentPage - 1) * limit,
        lastDataInPage: tempLastData >= tambahs.total ? tambahs.total : tempLastData,
      }

      let roti = [
        {
          laman: 'Kelompok Perhiasan',
          alamat: '/app/barang',
        },
        {
          laman: kelompok.nama,
          alamat: '/app/barang/kelompok/' + kelompok.id,
        },
        {
          laman: 'Penambahan Stok',
        },
      ]

      return await view.render('barang/kelompok/mutasi-penambahan-kelompok', {
        tambahs,
        tambahan,
        kelompok,
        roti,
      })
    } catch (error) {
      session.flash('alertError', 'Kelompok yang anda akses tidak valid atau terhapus.')
      return response.redirect().toPath('/app/barang/')
    }
  }

  public async showPenjualan({ view, request, params, response, session }: HttpContextContract) {
    const page = request.input('page', 1)
    const limit = 10

    try {
      const kelompok = await Kelompok.findOrFail(params.id)
      await kelompok.load('bentuk')

      const juals = await Database.from('penjualans')
        .select(
          'id as idJual',
          'created_at as createdAt',
          'nama_barang as namaBarang',
          'harga_jual_akhir as hargaJual',
          'berat_barang as beratBarang',
        )
        .where('kelompok_id', params.id)
        .andWhereNull('deleted_at')
        .orderBy('createdAt', 'desc')
        .paginate(page, limit)

      juals.baseUrl(`app/barang/kelompok/${params.id}/penjualan`)

      let firstPage =
        juals.currentPage - 2 > 0
          ? juals.currentPage - 2
          : juals.currentPage - 1 > 0
          ? juals.currentPage - 1
          : juals.currentPage
      let lastPage =
        juals.currentPage + 2 <= juals.lastPage
          ? juals.currentPage + 2
          : juals.currentPage + 1 <= juals.lastPage
          ? juals.currentPage + 1
          : juals.currentPage

      if (lastPage - firstPage < 4 && juals.lastPage > 4) {
        if (juals.currentPage < juals.firstPage + 2) {
          lastPage += 4 - (lastPage - firstPage)
        }

        if (lastPage == juals.lastPage) {
          firstPage -= 4 - (lastPage - firstPage)
        }
      }
      // sampe sini
      const tempLastData = 10 + (juals.currentPage - 1) * limit

      const tambahan = {
        firstPage: firstPage,
        lastPage: lastPage,
        firstDataInPage: 1 + (juals.currentPage - 1) * limit,
        lastDataInPage: tempLastData >= juals.total ? juals.total : tempLastData,
      }

      let roti = [
        {
          laman: 'Kelompok Perhiasan',
          alamat: '/app/barang',
        },
        {
          laman: kelompok.nama,
          alamat: '/app/barang/kelompok/' + kelompok.id,
        },
        {
          laman: 'Daftar Penjualan',
        },
      ]

      const fungsi = {
        rupiahParser
      }

      return await view.render('barang/kelompok/penjualan-kelompok', {
        juals,
        tambahan,
        kelompok,
        roti,
        fungsi
      })
    } catch (error) {
      session.flash('alertError', 'Kelompok yang anda akses tidak valid atau terhapus.')
      return response.redirect().toPath('/app/barang/')
    }
  }

  // legacy, taro sini buat referensi doang
  // public async showMutasiKoreksi({
  //   view,
  //   request,
  //   params,
  //   response,
  //   session,
  // }: HttpContextContract) {
  //   const page = request.input('page', 1)
  //   const limit = 10

  //   try {
  //     const kelompok = await Kelompok.findOrFail(params.id)
  //     await kelompok.load('bentuk')

  //     const koreksis = await Database.from('koreksi_stoks')
  //       .join('penggunas', 'penggunas.id', 'koreksi_stoks.pengguna_id')
  //       .select(
  //         'koreksi_stoks.created_at as createdAt',
  //         'koreksi_stoks.alasan as alasan',
  //         'koreksi_stoks.perubahan_stok as perubahanStok',
  //         'koreksi_stoks.stok_akhir as stokAkhir',
  //         'penggunas.nama as namaPencatat',
  //         'penggunas.id as idPencatat'
  //       )
  //       .where('koreksi_stoks.kelompok_id', params.id)
  //       .orderBy('createdAt', 'desc')
  //       .paginate(page, limit)

  //     koreksis.baseUrl(`app/barang/kelompok/${params.id}/mutasi-koreksi`)

  //     let firstPage =
  //       koreksis.currentPage - 2 > 0
  //         ? koreksis.currentPage - 2
  //         : koreksis.currentPage - 1 > 0
  //         ? koreksis.currentPage - 1
  //         : koreksis.currentPage
  //     let lastPage =
  //       koreksis.currentPage + 2 <= koreksis.lastPage
  //         ? koreksis.currentPage + 2
  //         : koreksis.currentPage + 1 <= koreksis.lastPage
  //         ? koreksis.currentPage + 1
  //         : koreksis.currentPage

  //     if (lastPage - firstPage < 4 && koreksis.lastPage > 4) {
  //       if (koreksis.currentPage < koreksis.firstPage + 2) {
  //         lastPage += 4 - (lastPage - firstPage)
  //       }

  //       if (lastPage == koreksis.lastPage) {
  //         firstPage -= 4 - (lastPage - firstPage)
  //       }
  //     }
  //     // sampe sini
  //     const tempLastData = 10 + (koreksis.currentPage - 1) * limit

  //     const tambahan = {
  //       firstPage: firstPage,
  //       lastPage: lastPage,
  //       firstDataInPage: 1 + (koreksis.currentPage - 1) * limit,
  //       lastDataInPage: tempLastData >= koreksis.total ? koreksis.total : tempLastData,
  //     }

  //     let roti = [
  //       {
  //         laman: 'Kelompok Perhiasan',
  //         alamat: '/app/barang',
  //       },
  //       {
  //         laman: kelompok.nama,
  //         alamat: '/app/barang/kelompok/' + kelompok.id
  //       },
  //       {
  //         laman: 'Koreksi'
  //       }
  //     ]

  //     return await view.render('barang/kelompok/mutasi-koreksi-kelompok', {
  //       koreksis,
  //       tambahan,
  //       kelompok,
  //       roti
  //     })
  //   } catch (error) {
  //     session.flash('alertError', 'Kelompok yang anda akses tidak valid atau terhapus.')
  //     return response.redirect().toPath('/app/barang/')
  //   }
  // }

  public async showMutasiPenyesuaian({
    view,
    request,
    params,
    response,
    session,
  }: HttpContextContract) {
    const page = request.input('page', 1)
    const limit = 10

    try {
      const kelompok = await Kelompok.findOrFail(params.id)
      await kelompok.load('bentuk')

      const sesuais = await Database.from('penyesuaian_stoks')
        .join('penggunas', 'penggunas.id', 'penyesuaian_stoks.pengguna_id')
        .select(
          'penyesuaian_stoks.id as idCek',
          'penyesuaian_stoks.created_at as createdAt',
          'penyesuaian_stoks.keterangan as keterangan',
          'penyesuaian_stoks.stok_tercatat as stokTercatat',
          'penyesuaian_stoks.stok_sebenarnya as stokSebenarnya',
          'penyesuaian_stoks.butuh_cek_ulang as butuhCekUlang',
          'penggunas.nama as namaPencatat',
          'penggunas.id as idPencatat'
        )
        .where('penyesuaian_stoks.kelompok_id', params.id)
        .orderBy('createdAt', 'desc')
        .paginate(page, limit)

      sesuais.baseUrl(`app/barang/kelompok/${params.id}/penyesuaian`)

      let firstPage =
        sesuais.currentPage - 2 > 0
          ? sesuais.currentPage - 2
          : sesuais.currentPage - 1 > 0
          ? sesuais.currentPage - 1
          : sesuais.currentPage
      let lastPage =
        sesuais.currentPage + 2 <= sesuais.lastPage
          ? sesuais.currentPage + 2
          : sesuais.currentPage + 1 <= sesuais.lastPage
          ? sesuais.currentPage + 1
          : sesuais.currentPage

      if (lastPage - firstPage < 4 && sesuais.lastPage > 4) {
        if (sesuais.currentPage < sesuais.firstPage + 2) {
          lastPage += 4 - (lastPage - firstPage)
        }

        if (lastPage == sesuais.lastPage) {
          firstPage -= 4 - (lastPage - firstPage)
        }
      }
      // sampe sini
      const tempLastData = 10 + (sesuais.currentPage - 1) * limit

      const tambahan = {
        firstPage: firstPage,
        lastPage: lastPage,
        firstDataInPage: 1 + (sesuais.currentPage - 1) * limit,
        lastDataInPage: tempLastData >= sesuais.total ? sesuais.total : tempLastData,
      }

      let roti = [
        {
          laman: 'Kelompok Perhiasan',
          alamat: '/app/barang',
        },
        {
          laman: kelompok.nama,
          alamat: '/app/barang/kelompok/' + kelompok.id,
        },
        {
          laman: 'Penyesuaian Stok',
        },
      ]

      let fungsi = {
        formatDate,
      }

      return await view.render('barang/kelompok/mutasi-penyesuaian', {
        sesuais,
        tambahan,
        kelompok,
        roti,
        fungsi,
      })
    } catch (error) {
      session.flash('alertError', 'Kelompok yang anda akses tidak valid atau terhapus.')
      return response.redirect().toPath('/app/barang/')
    }
  }

  public async edit({ params, view, response, session }: HttpContextContract) {
    try {
      const kelompok = await Kelompok.findOrFail(params.id)

      const kadars = await Database.from('kadars').select('id', 'nama')

      const bentuks = await Database.from('bentuks').select('id', 'bentuk')

      let roti = [
        {
          laman: 'Kelompok Perhiasan',
          alamat: '/app/barang',
        },
        {
          laman: kelompok.nama,
          alamat: '/app/barang/kelompok/' + kelompok.id,
        },
        {
          laman: 'Ubah Data',
        },
      ]

      return await view.render('barang/kelompok/form-edit-kelompok', {
        kelompok,
        kadars,
        bentuks,
        roti,
      })
    } catch (error) {
      session.flash('alertError', 'Kelompok yang anda cari tidak valid!')
      return response.redirect().toPath('/app/barang/')
    }
  }

  public async update({ params, response, request, session }: HttpContextContract) {
    const editKelompokSchema = schema.create({
      nama: schema.string(
        {
          trim: true,
        },
        [
          rules.maxLength(50),
          rules.unique({
            table: 'kelompoks',
            column: 'nama',
            caseInsensitive: true,
            whereNot: {
              id: params.id,
            },
          }),
        ]
      ),
      kadar: schema.number([
        rules.unsigned(),
        rules.exists({
          table: 'kadars',
          column: 'id',
        }),
      ]),
      bentuk: schema.number([
        rules.unsigned(),
        rules.exists({
          table: 'bentuks',
          column: 'id',
        }),
      ]),
      beratKelompok: schema.number(),
      stokMinimal: schema.number(),
      // stok: schema.number(),
      ingatkanStokMenipis: schema.string.optional(),
      monitorStok: schema.string.optional(),
    })

    const validrequest = await request.validate({
      schema: editKelompokSchema,
    })

    try {
      const kelompok = await Kelompok.findOrFail(params.id)
      kelompok.nama = validrequest.nama
      kelompok.kadarId = validrequest.kadar
      kelompok.bentukId = validrequest.bentuk
      kelompok.beratKelompok = validrequest.beratKelompok
      kelompok.stokMinimal = validrequest.stokMinimal
      kelompok.ingatkanStokMenipis = validrequest.ingatkanStokMenipis ? true : false
      kelompok.apakahDimonitor = validrequest.monitorStok ? true : false
      // KHUSUS STOK GABISA DIUBAH DARI SINI, LEWAT PERUBAHAN STOK
      await kelompok.save()

      session.flash('alertSukses', 'Data kelompok berhasil diubah!')
      return response.redirect().toPath('/app/barang/kelompok/' + params.id)
    } catch (error) {
      session.flash(
        'alertError',
        'Ada masalah saat mengubah kelompok. Silahkan coba lagi setelah beberapa saat.'
      )
      return response.redirect().back()
    }
  }

  public async destroy({ params, response, session, auth }: HttpContextContract) {
    try {
      if (!auth.user) throw 'auth ngga valid'

      const userPengakses = await User.findOrFail(auth.user.id)
      await userPengakses.load('pengguna', (query) => {
        query.preload('jabatan')
      })

      if (userPengakses.pengguna.jabatan.nama == 'Pemilik') {
        const kelompok = await Kelompok.findOrFail(params.id)
        kelompok.deletedAt = DateTime.now()
        await kelompok.save()

        session.flash('alertSukses', 'Kelompok "' + kelompok.nama + '" berhasil dihapus!')
        return response.redirect().toPath('/app/barang/')
      } else {
        throw 'Anda tidak memiliki akses untuk menghapus data ini!'
      }
    } catch (error) {
      if (typeof error === 'string') {
        session.flash('alertError', error)
      } else {
        session.flash(
          'alertError',
          'Ada masalah saat menghapus data kelompok. Silahkan coba lagi setelah beberapa saat.'
        )
      }
      return response.redirect().back()
    }
  }

  // ================================= Analisis & Statistik ===========================================

  public async peringkatKelompok({ params }: HttpContextContract) {
    Settings.defaultZone = 'Asia/Jakarta'
    Settings.defaultLocale = 'id-ID'

    // yang di select ntar bisa diganti sesuai kebutuhan
    let rankTotal = await Database.rawQuery(
      "SELECT kelompoks.id, tabelRanking.jumlah, tabelRanking.ranking FROM kelompoks, (SELECT row_number() OVER (ORDER BY jumlah desc) AS 'ranking', kelompok_id, COUNT(*) as 'jumlah' FROM penjualans WHERE penjualans.deleted_at IS NULL GROUP BY kelompok_id ORDER BY `jumlah` DESC) as tabelRanking WHERE kelompoks.id = tabelRanking.kelompok_id && kelompoks.id = :kelompokId LIMIT 1",
      {
        kelompokId: params.id,
      }
    )

    let rankTahunIni = await Database.rawQuery(
      "SELECT kelompoks.id, tabelRanking.jumlah, tabelRanking.ranking FROM kelompoks, (SELECT row_number() OVER (ORDER BY jumlah desc) AS 'ranking', kelompok_id, COUNT(*) as 'jumlah' FROM penjualans WHERE penjualans.deleted_at IS NULL && DATE(created_at)>= :tanggalAwal && DATE(created_at)<= :tanggalAkhir GROUP BY kelompok_id ORDER BY `jumlah` DESC) as tabelRanking WHERE kelompoks.id = tabelRanking.kelompok_id && kelompoks.id = :kelompokId LIMIT 1",
      {
        kelompokId: params.id,
        tanggalAwal: DateTime.now().startOf('year').toISODate(),
        tanggalAkhir: DateTime.now().endOf('year').toISODate(),
      }
    )

    let rankBulanIni = await Database.rawQuery(
      "SELECT kelompoks.id, tabelRanking.jumlah, tabelRanking.ranking FROM kelompoks, (SELECT row_number() OVER (ORDER BY jumlah desc) AS 'ranking', kelompok_id, COUNT(*) as 'jumlah' FROM penjualans WHERE penjualans.deleted_at IS NULL && DATE(created_at)>= :tanggalAwal && DATE(created_at)<= :tanggalAkhir GROUP BY kelompok_id ORDER BY `jumlah` DESC) as tabelRanking WHERE kelompoks.id = tabelRanking.kelompok_id && kelompoks.id = :kelompokId LIMIT 1",
      {
        kelompokId: params.id,
        tanggalAwal: DateTime.now().startOf('month').toISODate(),
        tanggalAkhir: DateTime.now().endOf('month').toISODate(),
      }
    )

    let terakhirTransaksi = await Database.from('kelompoks')
      .join('penjualans', 'kelompoks.id', 'penjualans.kelompok_id')
      .select('penjualans.created_at as tanggal')
      .where('kelompoks.id', params.id)
      .orderBy('penjualans.created_at', 'desc')
      .limit(1)

    let totalKelompok = await Database.from('kelompoks').whereNull('deleted_at').count('*', 'total')

    // Kenapa ngejoin kelompok sama penjualan? gegara ntar lu bakal ngesortir ngebuang kelompok yang kena softdelete

    let wadah = {
      peringkatTotal: rankTotal[0][0],
      peringkatTahunIni: rankTahunIni[0][0],
      peringkatBulanIni: rankBulanIni[0][0],
      totalKelompok: totalKelompok[0].total,
      transaksiTerakhir: terakhirTransaksi[0],
    }

    return wadah
  }

  public async sebaranData({ params, request, response }: HttpContextContract) {
    Settings.defaultZone = 'Asia/Jakarta'
    Settings.defaultLocale = 'id-ID'

    let mode = request.input('mode', 0)
    if (!['0', '1', '2'].includes(mode)) mode = 0
    // 0 mingguan by hari
    // 1 bulanan by minggu
    // 2 tahunan by bulan

    try {
      if (mode == 0) {
        let penjualanMingguIni = await Database.rawQuery(
          'SELECT kelompok_id, created_at as tanggal, WEEKDAY(created_at) as hariMingguan, COUNT(*) as jumlah FROM penjualans WHERE deleted_at IS NULL && DATE(created_at) >= :tanggalAwal && DATE(created_at) <= :tanggalAkhir && kelompok_id = :kelompokId GROUP BY hariMingguan',
          {
            kelompokId: params.id,
            tanggalAwal: DateTime.local().startOf('week').toISODate(),
            tanggalAkhir: DateTime.local().endOf('week').toISODate(),
          }
        )

        let wadahMingguan: {
          label: string
          jumlah: number
        }[] = []

        for (let i = 0; i < 7; i++) {
          wadahMingguan[i] = {
            label: DateTime.local()
              .startOf('week')
              .plus({
                days: i,
              })
              .toISODate(),
            jumlah: 0,
          }
        }

        penjualanMingguIni[0].forEach((element) => {
          wadahMingguan[element.hariMingguan].jumlah = element.jumlah
        })

        return wadahMingguan
      }

      if (mode == 1) {
        let start = DateTime.local().startOf('month')
        let end = DateTime.local().endOf('month')

        let penjualanPerMinggu = await Database.rawQuery(
          'SELECT CONCAT(YEAR(created_at), "/", WEEK(created_at, 2)) as grouping, WEEK(created_at,2) as mingguKe, COUNT(*) as jumlah FROM penjualans WHERE deleted_at IS NULL && WEEK(created_at,2) >= WEEK(:tanggalAwal,2) && WEEK(created_at,2) <= WEEK(:tanggalAkhir,2) && kelompok_id = :kelompokId GROUP BY CONCAT(YEAR(created_at), "/", WEEK(created_at,2))',
          {
            kelompokId: params.id,
            tanggalAwal: start.toISODate(),
            tanggalAkhir: end.toISODate(),
          }
        )

        let wadahPerMinggu: {
          minggu: number
          label: string
          jumlah: number
        }[] = []

        for (let i = 0, j = start.weekNumber; j <= end.weekNumber; i++, j++) {
          wadahPerMinggu[i] = {
            label: 'Minggu ke-' + j,
            minggu: j,
            jumlah: 0,
          }
        }

        penjualanPerMinggu[0].forEach((elePJ) => {
          let skip = false
          wadahPerMinggu.forEach((eleWadah) => {
            if (skip) return

            if (eleWadah.minggu == elePJ.mingguKe) {
              eleWadah.jumlah = elePJ.jumlah
              skip = true
            }
          })
        })

        return wadahPerMinggu
      }

      if (mode == 2) {
        let penjualanTahunIni = await Database.rawQuery(
          'SELECT kelompok_id, MONTH(created_at) as bulan, COUNT(*) as jumlah FROM penjualans WHERE deleted_at IS NULL && DATE(created_at) >= :tanggalAwal && DATE(created_at) <= :tanggalAkhir && kelompok_id = :kelompokId GROUP BY bulan',
          {
            kelompokId: params.id,
            tanggalAwal: DateTime.local().startOf('year').toISODate(),
            tanggalAkhir: DateTime.local().endOf('year').toISODate(),
          }
        )

        let wadahTahunan: {
          label: string
          jumlah: number
        }[] = []

        for (let i = 0; i < 12; i++) {
          wadahTahunan[i] = {
            label: DateTime.local().startOf('year').plus({
              months: i,
            }).monthLong,
            jumlah: 0,
          }
        }

        penjualanTahunIni[0].forEach((element) => {
          wadahTahunan[element.bulan - 1].jumlah = element.jumlah
        })

        return wadahTahunan
      }
    } catch (error) {
      return response.badRequest({
        error: 'Ada error',
      })
    }
  }

  // =============================================== General ===============================================

  public async getKadarBentuk({}: HttpContextContract) {
    // ini buat isian doang, gaperlu ambil semua data
    let kadar = await Database.from('kadars').select('id', 'nama').orderBy('nama', 'asc')

    let bentuk = await Database.from('bentuks').select('id', 'bentuk').orderBy('bentuk', 'asc')

    return {
      kadar,
      bentuk,
    }
  }

  public async cekKelompokDuplikat({ response, request }: HttpContextContract) {
    let namakel = request.input('namakel')

    if (namakel === null || typeof namakel === 'undefined') {
      return response.badRequest('Kode tidak boleh kosong')
    }

    let cekNamakel = await Database.from('kelompoks').select('nama').where('nama', namakel)

    if (cekNamakel.length > 0) {
      return response.notFound('Kode sudah terpakai, tolong gunakan kode lain')
    } else {
      // return response.ok('Kode bisa digunakan')
      // return 'Kode bisa digunakan'
      return {
        status: 'berhasil',
      }
    }
  }

  public async cekKelompokDuplikatEdit({ request, response }: HttpContextContract) {
    let namakel = request.input('namakel')
    let id = request.input('id')

    if (
      namakel === null ||
      typeof namakel === 'undefined' ||
      id === null ||
      typeof id === 'undefined'
    ) {
      return response.badRequest('Nama kelompok dan id tidak boleh kosong')
    }

    let cekNamakel = await Database.from('kelompoks')
      .select('nama')
      .where('nama', namakel)
      .andWhereNot('id', id)

    if (cekNamakel.length > 0) {
      return response.notFound('Kode sudah terpakai, tolong gunakan kode lain')
    } else {
      // return response.ok('Kode bisa digunakan')
      // return 'Kode bisa digunakan'
      return {
        status: 'berhasil',
      }
    }
  }

  // ada kemungkinan dihapus, udah jadi satu di penyesuaian
  public async ubahStok({ response, params, request, auth }: HttpContextContract) {
    const stokbaru = request.input('stokBaru')
    const alasan = request.input('alasan')

    try {
      if (!stokbaru || !alasan || isNaN(stokbaru) || stokbaru < 0) throw 'Permintaan tidak valid!'

      if (!auth.user) throw 'auth ngga valid'

      const userPengakses = await User.findOrFail(auth.user.id)
      await userPengakses.load('pengguna', (query) => {
        query.preload('jabatan')
      })

      if (
        userPengakses.pengguna.jabatan.nama == 'Pemilik' ||
        userPengakses.pengguna.jabatan.nama == 'Kepala Toko'
      ) {
        const kelompok = await Kelompok.findOrFail(params.id)
        await kelompok.related('koreksiStoks').create({
          alasan: alasan,
          stokAkhir: stokbaru,
          perubahanStok: stokbaru - kelompok.stok,
          penggunaId: userPengakses.pengguna.id,
        })

        kelompok.stok = stokbaru
        await kelompok.save()

        return response.ok({
          message: 'Stok berhasil diubah',
        })
      } else {
        throw 'Anda tidak memiliki akses untuk mengubah data ini!'
      }
    } catch (error) {
      if (typeof error === 'string') {
        return response.badRequest({
          error: error,
        })
      } else {
        return response.badRequest({
          error: 'Ada masalah pada server!',
        })
      }
    }
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

function rupiahParser(angka: number) {
  if (typeof angka == 'number') {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(angka)
  } else return 'error'
}

function generateKodeKelompok(kadar: string, bentuk: string) {
  let kodebentuk = {
    Cincin: 'CC',
    Kalung: 'KL',
    Anting: 'AT',
    Liontin: 'LT',
    Tindik: 'TD',
    Gelang: 'GL',
  }

  let kodekadar = {
    Muda: {
      nomer: 1,
      huruf: 'MD',
    },
    Tanggung: {
      nomer: 2,
      huruf: 'TG',
    },
    Tua: {
      nomer: 3,
      huruf: 'TU',
    },
  }

  return (
    kodebentuk[bentuk] +
    kodekadar[kadar].nomer +
    kodekadar[kadar].huruf +
    DateTime.local().toMillis()
  )
}

function formatDate(ISODate: string) {
  const tanggal = DateTime.fromISO(ISODate)

  if (tanggal.isValid) {
    return tanggal.toISODate()
  } else {
    return 'error'
  }
}
