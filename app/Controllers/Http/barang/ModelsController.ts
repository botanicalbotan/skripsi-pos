import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Bentuk from 'App/Models/barang/Bentuk'
import Database from '@ioc:Adonis/Lucid/Database'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Model from 'App/Models/barang/Model'
import { DateTime, Settings } from 'luxon'
import Drive from '@ioc:Adonis/Core/Drive'
import User from 'App/Models/User'

export default class ModelsController {
  public async index({ view, request }: HttpContextContract) {
    const opsiOrder = ['models.nama', 'bentuks.bentuk', 'models.deskripsi']
    const page = request.input('page', 1)
    const order = request.input('ob', 0)
    const arahOrder = request.input('aob', 0)
    const sanitizedOrder = order < opsiOrder.length && order >= 0 && order ? order : 0
    const sanitizedArahOrder = arahOrder == 1 ? 1 : 0
    const cari = request.input('cari', '')
    const limit = 10

    const models = await Database.from('models')
      .join('bentuks', 'models.bentuk_id', '=', 'bentuks.id')
      .whereNull('models.deleted_at')
      .select(
        'models.id as id',
        'models.nama as nama',
        'bentuks.bentuk as bentukPerhiasan',
        'models.deskripsi as deskripsi'
      )
      .if(cari !== '', (query) => {
        query.where('models.nama', 'like', `%${cari}%`)
      })
      .orderBy(opsiOrder[sanitizedOrder], sanitizedArahOrder == 1 ? 'desc' : 'asc')
      .orderBy('models.nama')
      .paginate(page, limit)

    models.baseUrl('/app/barang/model')

    let qsParam = {
      ob: sanitizedOrder,
      aob: sanitizedArahOrder,
    }

    if (cari !== '') qsParam['cari'] = cari
    models.queryString(qsParam)

    let firstPage =
      models.currentPage - 2 > 0
        ? models.currentPage - 2
        : models.currentPage - 1 > 0
        ? models.currentPage - 1
        : models.currentPage
    let lastPage =
      models.currentPage + 2 <= models.lastPage
        ? models.currentPage + 2
        : models.currentPage + 1 <= models.lastPage
        ? models.currentPage + 1
        : models.currentPage

    if (lastPage - firstPage < 4 && models.lastPage > 4) {
      if (models.currentPage < models.firstPage + 2) {
        lastPage += 4 - (lastPage - firstPage)
      }

      if (lastPage == models.lastPage) {
        firstPage -= 4 - (lastPage - firstPage)
      }
    }

    const tempLastData = 10 + (models.currentPage - 1) * limit

    const tambahan = {
      pengurutan: sanitizedOrder,
      pencarian: cari,
      firstPage: firstPage,
      lastPage: lastPage,
      firstDataInPage: 1 + (models.currentPage - 1) * limit,
      lastDataInPage: tempLastData >= models.total ? models.total : tempLastData,
    }

    return await view.render('barang/model/list-model', { models, tambahan })
  }

  public async create({ view }: HttpContextContract) {
    return await view.render('barang/model/form-model')
  }

  public async store({ request, response, session, auth }: HttpContextContract) {
    const newModelsSchema = schema.create({
      nama: schema.string({ trim: true }, [rules.maxLength(40)]),
      bentuk: schema.enum([
        'Kalung',
        'Cincin',
        'Anting',
        'Gelang',
        'Liontin',
        'Tindik',
        'Lainnya',
      ] as const),
      deskripsi: schema.string({ trim: true }, [rules.maxLength(100)]),
    })

    const validrequest = await request.validate({ schema: newModelsSchema })

    try {
      const bentuk = await Bentuk.findByOrFail('bentuk', validrequest.bentuk)
      const prepareNama = !validrequest.nama.includes(bentuk.bentuk)
        ? bentuk.bentuk + ' ' + validrequest.nama
        : validrequest.nama

      if (!auth.user) throw 'auth ngga valid'
      const userPengakses = await User.findOrFail(auth.user.id)
      await userPengakses.load('pengguna')

      await bentuk.related('models').create({
        nama: kapitalKalimat(prepareNama),
        deskripsi: kapitalHurufPertama(validrequest.deskripsi),
        penggunaId: userPengakses.pengguna.id,
      })

      session.flash('alertSukses', 'Model baru berhasil disimpan!')
      return response.redirect().toPath('/app/barang/model/')
    } catch (error) {
      console.error(error)
      session.flash(
        'alertError',
        'Ada masalah saat membuat model baru. Silahkan coba lagi setelah beberapa saat.'
      )
      return response.redirect().back()
    }
  }

  public async show({ view, params, response, session }: HttpContextContract) {
    try {
      const model = await Model.findOrFail(params.id)
      await model.load('bentuk')
      await model.load('pengguna', (query) => {
        query.preload('jabatan')
      })

      const tambahan = {
        adaFotoPencatat: await Drive.exists('profilePict/' + model.pengguna.foto),
      }

      return await view.render('barang/model/view-model', { model, tambahan })
    } catch (error) {
      session.flash('alertError', 'Model yang anda akses tidak valid atau terhapus.')
      return response.redirect().toPath('/app/barang/model/')
    }
  }

  public async edit({ view, params, response }: HttpContextContract) {
    try {
      const model = await Model.findOrFail(params.id)
      if (model.apakahPlaceholder) throw 'Gaboleh diedit'

      await model.load('bentuk')

      return await view.render('barang/model/form-edit-model', { model })
    } catch (error) {
      return response.redirect().toPath('/app/barang/model/')
    }
  }

  public async update({ request, response, params, session }: HttpContextContract) {
    const updateModelsSchema = schema.create({
      nama: schema.string({ trim: true }, [rules.maxLength(40)]),
      bentuk: schema.enum([
        'Kalung',
        'Cincin',
        'Anting',
        'Gelang',
        'Liontin',
        'Tindik',
        'Lainnya',
      ] as const),
      deskripsi: schema.string({ trim: true }, [rules.maxLength(100)]),
    })

    const validrequest = await request.validate({ schema: updateModelsSchema })

    try {
      const bentuk = await Bentuk.findByOrFail('bentuk', validrequest.bentuk)
      const prepareNama = !validrequest.nama.includes(bentuk.bentuk)
        ? bentuk.bentuk + ' ' + validrequest.nama
        : validrequest.nama

      const model = await Model.findOrFail(params.id)
      if (model.apakahPlaceholder) throw 'Gaboleh diedit'

      model.nama = kapitalKalimat(prepareNama)
      model.deskripsi = kapitalHurufPertama(validrequest.deskripsi)
      model.bentukId = bentuk.id
      model.save()

      session.flash('alertSukses', 'Data model berhasil diubah!')

      return response.redirect().toPath('/app/barang/model/' + model.id)
    } catch (error) {
      session.flash(
        'alertError',
        'Ada masalah saat mengubah data model. Silahkan coba lagi setelah beberapa saat.'
      )
      return response.redirect().back()
    }
  }

  public async destroy({ params, response, session }: HttpContextContract) {
    try {
      const model = await Model.findOrFail(params.id)
      if (model.apakahPlaceholder) throw 'Gaboleh diedit'

      model.deletedAt = DateTime.now()
      model.save()

      session.flash('alertSukses', 'Model "' + model.nama + '" berhasil dihapus!')

      return response.redirect().toPath('/app/barang/model/')
    } catch (error) {
      session.flash(
        'alertError',
        'Ada masalah saat menghapus data model. Silahkan coba lagi setelah beberapa saat.'
      )
      return response.redirect().back()
    }
  }

  // ======================================= selain CRUD =================================================
  public async getModelByBentuk({ request }: HttpContextContract) {
    // ini buat isian doang, gaperlu ambil semua data

    let bentukId = request.input('bentukId', '')
    let model = await Database.from('models')
      .select('id', 'nama')
      .where('bentuk_id', bentukId)
      .andWhereNull('deleted_at')
      .orderBy('nama', 'asc')

    return {
      model,
    }
  }

  public async peringkatModel({ params }: HttpContextContract) {
    Settings.defaultZone = 'Asia/Jakarta'
    Settings.defaultLocale = 'id-ID'

    // yang di select ntar bisa diganti sesuai kebutuhan
    let rankTotal = await Database.rawQuery(
      "SELECT models.id, tabelRanking.jumlah, tabelRanking.ranking FROM models, (SELECT row_number() OVER (ORDER BY jumlah desc) AS 'ranking', model_id, COUNT(*) as 'jumlah' FROM penjualans WHERE penjualans.deleted_at IS NULL GROUP BY model_id ORDER BY `jumlah` DESC) as tabelRanking WHERE models.id = tabelRanking.model_id && models.id = :modelId LIMIT 1",
      {
        modelId: params.id,
      }
    )

    let rankTahunIni = await Database.rawQuery(
      "SELECT models.id, tabelRanking.jumlah, tabelRanking.ranking FROM models, (SELECT row_number() OVER (ORDER BY jumlah desc) AS 'ranking', model_id, COUNT(*) as 'jumlah' FROM penjualans WHERE penjualans.deleted_at IS NULL && DATE(created_at)>= :tanggalAwal && DATE(created_at)<= :tanggalAkhir GROUP BY model_id ORDER BY `jumlah` DESC) as tabelRanking WHERE models.id = tabelRanking.model_id && models.id = :modelId LIMIT 1",
      {
        modelId: params.id,
        tanggalAwal: DateTime.now().startOf('year').toISODate(),
        tanggalAkhir: DateTime.now().endOf('year').toISODate(),
      }
    )

    let rankBulanIni = await Database.rawQuery(
      "SELECT models.id, tabelRanking.jumlah, tabelRanking.ranking FROM models, (SELECT row_number() OVER (ORDER BY jumlah desc) AS 'ranking', model_id, COUNT(*) as 'jumlah' FROM penjualans WHERE penjualans.deleted_at IS NULL && DATE(created_at)>= :tanggalAwal && DATE(created_at)<= :tanggalAkhir GROUP BY model_id ORDER BY `jumlah` DESC) as tabelRanking WHERE models.id = tabelRanking.model_id && models.id = :modelId LIMIT 1",
      {
        modelId: params.id,
        tanggalAwal: DateTime.now().startOf('month').toISODate(),
        tanggalAkhir: DateTime.now().endOf('month').toISODate(),
      }
    )

    let terakhirTransaksi = await Database.from('models')
      .join('penjualans', 'models.id', 'penjualans.model_id')
      .select('penjualans.created_at as tanggal')
      .where('models.id', params.id)
      .orderBy('penjualans.created_at', 'desc')
      .limit(1)

    let totalModel = await Database.from('models').whereNull('deleted_at').count('*', 'total')

    // Kenapa ngejoin kelompok sama penjualan? gegara ntar lu bakal ngesortir ngebuang kelompok yang kena softdelete

    let wadah = {
      peringkatTotal: rankTotal[0][0],
      peringkatTahunIni: rankTahunIni[0][0],
      peringkatBulanIni: rankBulanIni[0][0],
      totalModel: totalModel[0].total,
      transaksiTerakhir: terakhirTransaksi[0],
    }

    return wadah
  }

  public async sebaranDataModel({ params, request, response }: HttpContextContract) {
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
          'SELECT model_id, created_at as tanggal, WEEKDAY(created_at) as hariMingguan, COUNT(*) as jumlah FROM penjualans WHERE deleted_at IS NULL && DATE(created_at) >= :tanggalAwal && DATE(created_at) <= :tanggalAkhir && model_id = :modelId GROUP BY hariMingguan',
          {
            modelId: params.id,
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
          'SELECT CONCAT(YEAR(created_at), "/", WEEK(created_at, 2)) as grouping, WEEK(created_at,2) as mingguKe, COUNT(*) as jumlah FROM penjualans WHERE deleted_at IS NULL && WEEK(created_at,2) >= WEEK(:tanggalAwal,2) && WEEK(created_at,2) <= WEEK(:tanggalAkhir,2) && model_id = :modelId GROUP BY CONCAT(YEAR(created_at), "/", WEEK(created_at,2))',
          {
            modelId: params.id,
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
          'SELECT model_id, MONTH(created_at) as bulan, COUNT(*) as jumlah FROM penjualans WHERE deleted_at IS NULL && DATE(created_at) >= :tanggalAwal && DATE(created_at) <= :tanggalAkhir && model_id = :modelId GROUP BY bulan',
          {
            modelId: params.id,
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
}

// Fungsi Tambahan

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
