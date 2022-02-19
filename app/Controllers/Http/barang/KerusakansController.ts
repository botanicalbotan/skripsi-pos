import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Bentuk from 'App/Models/barang/Bentuk'
import Kerusakan from 'App/Models/barang/Kerusakan'
import { DateTime } from 'luxon'

export default class KerusakansController {
  public async index({ view, request }: HttpContextContract) {
    const opsiOrder = [
      'kerusakans.nama',
      'bentuks.bentuk',
      'kerusakans.apakah_bisa_diperbaiki',
      'kerusakans.ongkos_nominal',
    ]
    const page = request.input('page', 1)
    const order = request.input('ob', 0)
    const cari = request.input('cari', '')
    const sanitizedOrder = order < opsiOrder.length && order >= 0 && order? order : 0
    const limit = 10

    const kerusakans = await Database.from('kerusakans')
      .join('bentuks', 'kerusakans.bentuk_id', '=', 'bentuks.id')
      .whereNull('kerusakans.deleted_at')
      .select(
        'kerusakans.id as id',
        'kerusakans.nama as nama',
        'bentuks.bentuk as bentukPerhiasan',
        'kerusakans.apakah_bisa_diperbaiki as apakahBisaDiperbaiki',
        'kerusakans.ongkos_nominal as ongkos',
        'kerusakans.ongkos_deskripsi as ongkosDeskripsi'
      )
      .if(cari !== '', (query) => {
        query.where('kerusakans.nama', 'like', `%${cari}%`)
      })
      .orderBy(opsiOrder[sanitizedOrder], 'asc')
      .orderBy('kerusakans.nama')
      .paginate(page, limit)

    kerusakans.baseUrl('/app/barang/kerusakan')

    kerusakans.queryString({ ob: sanitizedOrder })
    if (cari !== '') {
      kerusakans.queryString({ ob: sanitizedOrder, cari: cari })
    }

    // kalau mau mulai dari sini bisa dibikin fungsi sendiri
    // input bisa pagination object + panjang page yang mau di display
    let firstPage =
      kerusakans.currentPage - 2 > 0
        ? kerusakans.currentPage - 2
        : kerusakans.currentPage - 1 > 0
        ? kerusakans.currentPage - 1
        : kerusakans.currentPage
    let lastPage =
      kerusakans.currentPage + 2 <= kerusakans.lastPage
        ? kerusakans.currentPage + 2
        : kerusakans.currentPage + 1 <= kerusakans.lastPage
        ? kerusakans.currentPage + 1
        : kerusakans.currentPage

    if (lastPage - firstPage < 4 && kerusakans.lastPage > 4) {
      if (kerusakans.currentPage < kerusakans.firstPage + 2) {
        lastPage += 4 - (lastPage - firstPage)
      }

      if (lastPage == kerusakans.lastPage) {
        firstPage -= 4 - (lastPage - firstPage)
      }
    }
    // sampe sini
    const tempLastData = 10 + (kerusakans.currentPage - 1) * limit

    const tambahan = {
      pengurutan: sanitizedOrder,
      pencarian: cari,
      firstPage: firstPage,
      lastPage: lastPage,
      firstDataInPage: 1 + (kerusakans.currentPage - 1) * limit,
      lastDataInPage: tempLastData >= kerusakans.total ? kerusakans.total : tempLastData,
    }

    return view.render('barang/kerusakan/list-kerusakan', { kerusakans, tambahan })
    // return view.render('barang/kerusakan/back-up-list-kerusakan')
  }

  public async create({ view }: HttpContextContract) {
    return view.render('barang/kerusakan/form-kerusakan')
  }

  public async store({ request, response }: HttpContextContract) {
    const newKerusakanSchema = schema.create({
      nama: schema.string({ trim: true }, [rules.maxLength(50)]),
      bentuk: schema.enum([
        'Kalung',
        'Cincin',
        'Anting',
        'Gelang',
        'Liontin',
        'Tindik',
        'Lainnya',
      ] as const),
      perbaikan: schema.enum(['bisa', 'tidak'] as const),
      ongkos: schema.number([rules.unsigned()]),
    })

    const validrequest = await request.validate({ schema: newKerusakanSchema })
    const ongkosteks =
      new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
      })
        .format(validrequest.ongkos)
        .toString() + ' per kerusakan'

    try {
      const bentuk = await Bentuk.findByOrFail('bentuk', validrequest.bentuk)
      await bentuk.related('kerusakans').create({
        nama: validrequest.nama,
        apakahBisaDiperbaiki: validrequest.perbaikan === 'bisa',
        ongkosNominal: validrequest.perbaikan === 'bisa' ? validrequest.ongkos : 0,
        ongkosDeskripsi: validrequest.perbaikan === 'bisa' ? ongkosteks : 'Dihitung harga rosok',
      })

      return response.redirect().toPath('/app/barang/kerusakan/')
    } catch (error) {
      return response.redirect().back()
    }
  }

  public async show({ view, params, response }: HttpContextContract) {
    try {
      const kerusakan = await Kerusakan.findOrFail(params.id)
      await kerusakan.load('bentuk')

      return view.render('barang/kerusakan/view-kerusakan', { kerusakan })
    } catch (error) {
      return response.redirect().toPath('/app/barang/kerusakan/')
    }
  }

  public async edit({ view, params, response }: HttpContextContract) {
    try {
      const kerusakan = await Kerusakan.findOrFail(params.id)
      await kerusakan.load('bentuk')

      return view.render('barang/kerusakan/form-edit-kerusakan', { kerusakan })
    } catch (error) {
      return response.redirect().toPath('/app/barang/kerusakan/')
    }
  }

  public async update({ params, request, response }: HttpContextContract) {
    const updateKerusakanSchema = schema.create({
      nama: schema.string({ trim: true }, [rules.maxLength(50)]),
      bentuk: schema.enum([
        'Kalung',
        'Cincin',
        'Anting',
        'Gelang',
        'Liontin',
        'Tindik',
        'Lainnya',
      ] as const),
      perbaikan: schema.enum(['bisa', 'tidak'] as const),
      ongkos: schema.number([rules.unsigned()]),
    })

    const validrequest = await request.validate({ schema: updateKerusakanSchema })
    const ongkosteks =
      new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
      })
        .format(validrequest.ongkos)
        .toString() + ' per kerusakan'

    try {
      const bentuk = await Bentuk.findByOrFail('bentuk', validrequest.bentuk)

      const kerusakan = await Kerusakan.findOrFail(params.id)
      kerusakan.nama = validrequest.nama
      kerusakan.apakahBisaDiperbaiki = validrequest.perbaikan === 'bisa'
      kerusakan.ongkosNominal = validrequest.perbaikan === 'bisa' ? validrequest.ongkos : 0
      kerusakan.ongkosDeskripsi =
        validrequest.perbaikan === 'bisa' ? ongkosteks : 'Dihitung harga rosok'
      kerusakan.bentukId = bentuk.id
      await kerusakan.save()

      return response.redirect().toPath('/app/barang/kerusakan/' + kerusakan.id)
    } catch (error) {
      return response.redirect().back()
    }
  }

  public async destroy({ params, response }: HttpContextContract) {
    try {
      const kerusakan = await Kerusakan.findOrFail(params.id)
      kerusakan.deletedAt = DateTime.now()
      kerusakan.save()

      return response.redirect().toPath('/app/barang/kerusakan/')
    } catch (error) {
      return response.redirect().back()
    }
  }



  // ================================== Non CRUD =============================================================
  public async getKerusakanByBentuk({ request }: HttpContextContract) {
    let bentukId = request.input('bentuk', '')
    let tingkat = request.input('tingkat', '0')
    let sanitizedTingkat = (['0', '1'].includes(tingkat))? tingkat : '0'

    let kerusakan = await Database
      .from('kerusakans')
      .if(sanitizedTingkat == 0, (query) =>{
        query.where('apakah_bisa_diperbaiki', true)
      })
      .where('bentuk_id', bentukId)
      .whereNull('deleted_at')
      .orderBy('nama', 'asc')
    
    return kerusakan
  }
}
