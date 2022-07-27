import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Bentuk from 'App/Models/barang/Bentuk'
import Database from '@ioc:Adonis/Lucid/Database'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Model from 'App/Models/barang/Model'
import { DateTime } from 'luxon'
import Drive from '@ioc:Adonis/Core/Drive'
import User from 'App/Models/User'

export default class ModelsController {

  

  // Fungsi Routing

  public async index ({ view, request }: HttpContextContract) {
    const opsiOrder = [
      'models.nama',
      'bentuks.bentuk',
      'models.deskripsi'
    ]
    const page = request.input('page', 1)
    const order = request.input('ob', 0)
    const arahOrder = request.input('aob', 0)
    const sanitizedOrder = order < opsiOrder.length && order >= 0 && order? order : 0
    const sanitizedArahOrder = arahOrder == 1? 1:0
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
      .orderBy(opsiOrder[sanitizedOrder], ((sanitizedArahOrder == 1)? 'desc': 'asc'))
      .orderBy('models.nama')
      .paginate(page, limit)

    models.baseUrl('/app/barang/model')

    let qsParam = {
      ob: sanitizedOrder,
      aob: sanitizedArahOrder
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

  public async create ({ view }: HttpContextContract) {
    return await view.render('barang/model/form-model')
  }

  public async store ({ request, response, session, auth }: HttpContextContract) {
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
      const prepareNama = (!validrequest.nama.includes(bentuk.bentuk))? bentuk.bentuk + ' ' + validrequest.nama : validrequest.nama

      if(!auth.user) throw 'auth ngga valid'
      const userPengakses = await User.findOrFail(auth.user.id)
      await userPengakses.load('pengguna')

      await bentuk.related('models').create({
        nama: kapitalKalimat(prepareNama),
        deskripsi: kapitalHurufPertama(validrequest.deskripsi),
        penggunaId: userPengakses.pengguna.id
      })

      session.flash('alertSukses', 'Model baru berhasil disimpan!')
      return response.redirect().toPath('/app/barang/model/')

    } catch (error) {
      console.error(error)
      session.flash('alertError', 'Ada masalah saat membuat model baru. Silahkan coba lagi setelah beberapa saat.')
      return response.redirect().back()
    }
  }

  public async show ({ view, params, response, session }: HttpContextContract) {
    try {
      const model = await Model.findOrFail(params.id)
      await model.load('bentuk')
      await model.load('pengguna', (query)=>{
        query.preload('jabatan')
      })

      const urlPencatat = (await Drive.exists('profilePict/' + model.pengguna.foto))? (await Drive.getUrl('profilePict/' + model.pengguna.foto)) : ''


      const tambahan = {
        urlFotoPencatat: urlPencatat
      }

      return await view.render('barang/model/view-model', { model, tambahan })
    } catch (error) {
      session.flash('alertError', 'Model yang anda akses tidak valid atau terhapus.')
      return response.redirect().toPath('/app/barang/model/')
    }
  }

  public async edit ({ view, params, response }: HttpContextContract) {
    try {
      const model = await Model.findOrFail(params.id)
      if(model.apakahPlaceholder) throw 'Gaboleh diedit'

      await model.load('bentuk')

      return await view.render('barang/model/form-edit-model', { model })
    } catch (error) {
      return response.redirect().toPath('/app/barang/model/')
    }
  }

  public async update ({ request, response, params, session }: HttpContextContract) {
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
      const prepareNama = (!validrequest.nama.includes(bentuk.bentuk))? bentuk.bentuk + ' ' + validrequest.nama : validrequest.nama

      const model = await Model.findOrFail(params.id)
      if(model.apakahPlaceholder) throw 'Gaboleh diedit'

      model.nama = kapitalKalimat(prepareNama)
      model.deskripsi = kapitalHurufPertama(validrequest.deskripsi)
      model.bentukId = bentuk.id
      model.save()

      session.flash('alertSukses', 'Data model berhasil diubah!')

      return response.redirect().toPath('/app/barang/model/' + model.id)
    } catch (error) {
      session.flash('alertError', 'Ada masalah saat mengubah data model. Silahkan coba lagi setelah beberapa saat.')
      return response.redirect().back()
    }
  }

  public async destroy ({params, response, session}: HttpContextContract) {
    try {
      const model = await Model.findOrFail(params.id)
      if(model.apakahPlaceholder) throw 'Gaboleh diedit'

      model.deletedAt = DateTime.now()
      model.save()

      session.flash('alertSukses', 'Model "'+ model.nama +'" berhasil dihapus!')

      return response.redirect().toPath('/app/barang/model/')
    } catch (error) {
      session.flash('alertError', 'Ada masalah saat menghapus data model. Silahkan coba lagi setelah beberapa saat.')
      return response.redirect().back()
    }
  }

  // ======================================= selain CRUD =================================================
  public async getModelByBentuk({ request }: HttpContextContract) {
    // ini buat isian doang, gaperlu ambil semua data

    let bentukId = request.input('bentukId', '')
    let model = await Database
      .from('models')
      .select('id', 'nama')
      .where('bentuk_id', bentukId)
      .andWhereNull('deleted_at')
      .orderBy('nama', 'asc')

    return {
      model
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