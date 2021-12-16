import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Bentuk from 'App/Models/barang/Bentuk'
import Database from '@ioc:Adonis/Lucid/Database'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Model from 'App/Models/barang/Model'
import { DateTime } from 'luxon'

export default class ModelsController {

  // Fungsi Tambahan

  kapitalHurufPertama(text: string) {
    return text.charAt(0).toUpperCase() + text.slice(1)
  }

  kapitalKalimat(text: string) {
    let pure = text.split(' ')
    let newText = ''
    for (let i = 0; i < pure.length; i++) {
      newText += this.kapitalHurufPertama(pure[i])
      if (i !== pure.length - 1) {
        newText += ' '
      }
    }
    return newText
  }

  // Fungsi Routing

  public async index ({ view, request }: HttpContextContract) {
    const opsiOrder = [
      'models.nama',
      'bentuks.bentuk',
    ]
    const page = request.input('page', 1)
    const order = request.input('ob', 0)
    const cari = request.input('cari', '')
    const sanitizedOrder = order < opsiOrder.length && order >= 0 && order? order : 0
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
      .orderBy(opsiOrder[sanitizedOrder], 'asc')
      .orderBy('models.nama')
      .paginate(page, limit)

    models.baseUrl('/app/barang/model')

    models.queryString({ ob: sanitizedOrder })
    if (cari !== '') {
      models.queryString({ ob: sanitizedOrder, cari: cari })
    }

    // kalau mau mulai dari sini bisa dibikin fungsi sendiri
    // input bisa pagination object + panjang page yang mau di display
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
    // sampe sini
    const tempLastData = 10 + (models.currentPage - 1) * limit

    const tambahan = {
      pengurutan: sanitizedOrder,
      pencarian: cari,
      firstPage: firstPage,
      lastPage: lastPage,
      firstDataInPage: 1 + (models.currentPage - 1) * limit,
      lastDataInPage: tempLastData >= models.total ? models.total : tempLastData,
    }

    return view.render('barang/model/list-model', { models, tambahan })
  }

  public async create ({ view }: HttpContextContract) {
    return view.render('barang/model/form-model')
  }

  public async store ({ request, response }: HttpContextContract) {
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

      const modelbaru = await bentuk.related('models').create({
        nama: await this.kapitalKalimat(prepareNama),
        deskripsi: await this.kapitalHurufPertama(validrequest.deskripsi),
      })

      return response.redirect().toPath('/app/barang/model/')
    } catch (error) {
      return response.redirect().back()
    }
  }

  public async show ({ view, params, response }: HttpContextContract) {
    try {
      const model = await Model.findOrFail(params.id)
      await model.load('bentuk')

      return view.render('barang/model/view-model', { model })
    } catch (error) {
      return response.redirect().toPath('/app/barang/model/')
    }
  }

  public async edit ({ view, params, response }: HttpContextContract) {
    try {
      const model = await Model.findOrFail(params.id)
      if(model.apakahPlaceholder) throw 'Gaboleh diedit'

      await model.load('bentuk')

      return view.render('barang/model/form-edit-model', { model })
    } catch (error) {
      return response.redirect().toPath('/app/barang/model/')
    }
  }

  public async update ({ request, response, params }: HttpContextContract) {
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

      model.nama = await this.kapitalKalimat(prepareNama)
      model.deskripsi = await this.kapitalHurufPertama(validrequest.deskripsi)
      model.bentukId = bentuk.id
      model.save()

      return response.redirect().toPath('/app/barang/model/' + model.id)
    } catch (error) {
      return response.redirect().back()
    }
  }

  public async destroy ({params, response}: HttpContextContract) {
    try {
      const model = await Model.findOrFail(params.id)
      if(model.apakahPlaceholder) throw 'Gaboleh diedit'

      model.deletedAt = DateTime.now()
      model.save()

      return response.redirect().toPath('/app/barang/model/')
    } catch (error) {
      return response.redirect().back()
    }
  }
}
