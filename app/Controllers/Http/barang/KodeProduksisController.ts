import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Kadar from 'App/Models/barang/Kadar'
import KodeProduksi from 'App/Models/barang/KodeProduksi'


export default class KodeProduksisController {
  public async index ({ view, request }: HttpContextContract) {

    const opsiOrder = [
      'kode_produksis.kode',
      'kadars.nama',
      'kode_produksis.asal_produksi',
      'kode_produksis.apakah_buatan_tangan'
    ]
    const page = request.input('page', 1)
    const order = request.input('ob', 0)
    const cari = request.input('cari', '')
    const sanitizedOrder = order < opsiOrder.length && order >= 0 && order? order : 0
    const limit = 10

    const kodepros = await Database.from('kode_produksis')
      .join('kadars', 'kode_produksis.kadar_id', '=', 'kadars.id')
      .whereNull('kode_produksis.deleted_at')
      .select(
        'kode_produksis.id as id',
        'kode_produksis.kode as kode',
        'kadars.nama as kadarPerhiasan',
        'kode_produksis.apakah_buatan_tangan as apakahBuatanTangan',
        'kode_produksis.asal_produksi as asalProduksi'
      )
      .if(cari !== '', (query) => {
        query.where('kode_produksis.kode', 'like', `%${cari}%`)
      })
      .orderBy(opsiOrder[sanitizedOrder], 'asc')
      .orderBy('kode_produksis.kode')
      .paginate(page, limit)

    kodepros.baseUrl('/app/barang/kodepro')

    kodepros.queryString({ ob: sanitizedOrder })
    if (cari !== '') {
      kodepros.queryString({ ob: sanitizedOrder, cari: cari })
    }

    // kalau mau mulai dari sini bisa dibikin fungsi sendiri
    // input bisa pagination object + panjang page yang mau di display
    let firstPage =
      kodepros.currentPage - 2 > 0
        ? kodepros.currentPage - 2
        : kodepros.currentPage - 1 > 0
        ? kodepros.currentPage - 1
        : kodepros.currentPage
    let lastPage =
      kodepros.currentPage + 2 <= kodepros.lastPage
        ? kodepros.currentPage + 2
        : kodepros.currentPage + 1 <= kodepros.lastPage
        ? kodepros.currentPage + 1
        : kodepros.currentPage

    if (lastPage - firstPage < 4 && kodepros.lastPage > 4) {
      if (kodepros.currentPage < kodepros.firstPage + 2) {
        lastPage += 4 - (lastPage - firstPage)
      }

      if (lastPage == kodepros.lastPage) {
        firstPage -= 4 - (lastPage - firstPage)
      }
    }
    // sampe sini
    const tempLastData = 10 + (kodepros.currentPage - 1) * limit

    const tambahan = {
      pengurutan: sanitizedOrder,
      pencarian: cari,
      firstPage: firstPage,
      lastPage: lastPage,
      firstDataInPage: 1 + (kodepros.currentPage - 1) * limit,
      lastDataInPage: tempLastData >= kodepros.total ? kodepros.total : tempLastData,
    }

    return view.render('barang/kodepro/list-kodepro', { kodepros, tambahan })
  }

  public async create ({ view }: HttpContextContract) {
    return view.render('barang/kodepro/form-kodepro')
  }

  public async store ({ request, response, session }: HttpContextContract) {
    const createKodeProduksiSchema = schema.create({
      kode: schema.string({ trim:true }, [
        rules.maxLength(10),
        rules.unique({
          table: 'kode_produksis',
          column: 'kode'
        })
      ]),
      kadar: schema.enum([
        'Muda',
        'Tanggung',
        'Tua',
      ] as const),
      asal: schema.string({ trim:true }, [
        rules.maxLength(50)
      ]),
      metode: schema.enum([
        'pabrikan',
        'buatantangan'
      ] as const),
      deskripsi: schema.string({ trim:true }, [
        rules.maxLength(100)
      ]),
    })

    const validrequest = await request.validate({ schema: createKodeProduksiSchema })

    try {
      let kadar = await Kadar.findByOrFail('nama', validrequest.kadar)
      await kadar.related('kodeProduksi').create({
        kode: validrequest.kode,
        deskripsi: validrequest.deskripsi,
        apakahBuatanTangan: validrequest.metode === 'buatantangan',
        asalProduksi: validrequest.asal
      })

      return response.redirect().toPath('/app/barang/kodepro/')
    } catch (error) {
      console.error(error)
      session.flash('errorServerThingy', 'Ada masalah di server!')
      return response.redirect().back()
    }
  }

  public async show ({ view, params, response }: HttpContextContract) {
    try {
      let kodepro = await KodeProduksi.findOrFail(params.id)
      await kodepro.load('kadar')

      return view.render('barang/kodepro/view-kodepro', { kodepro })
    } catch (error) {
      return response.redirect().toPath('/app/barang/kodepro/')
    }
  }

  public async edit ({ view, params, response, session }: HttpContextContract) {
    try {
      let kodepro = await KodeProduksi.findOrFail(params.id)
      await kodepro.load('kadar')

      return view.render('barang/kodepro/form-edit-kodepro', { kodepro })
    } catch (error) {
      session.flash('errorServerThingy', 'Ada masalah di server!')
      console.error(error)
      return response.redirect().toPath('/app/barang/kodepro/')
    }
  }

  public async update ({ response, request, session, params }: HttpContextContract) {
    const editKodeProduksiSchema = schema.create({
      kode: schema.string({ trim:true }, [
        rules.maxLength(10),
        rules.unique({
          table: 'kode_produksis',
          column: 'kode',
          whereNot: {
            id: params.id
          }
        }),
      ]),
      kadar: schema.enum([
        'Muda',
        'Tanggung',
        'Tua',
      ] as const),
      asal: schema.string({ trim:true }, [
        rules.maxLength(50)
      ]),
      metode: schema.enum([
        'pabrikan',
        'buatantangan'
      ] as const),
      deskripsi: schema.string({ trim:true }, [
        rules.maxLength(100)
      ]),
    })

    const validrequest = await request.validate({ schema: editKodeProduksiSchema })

    try {
      let kadar = await Kadar.findByOrFail('nama', validrequest.kadar)

      let kodepro = await KodeProduksi.findOrFail(params.id)
      kodepro.kode = validrequest.kode
      kodepro.kadarId = kadar.id
      kodepro.asalProduksi = validrequest.asal
      kodepro.apakahBuatanTangan = validrequest.metode === 'buatantangan',
      kodepro.deskripsi = validrequest.deskripsi
      await kodepro.save()

      return response.redirect().toPath('/app/barang/kodepro/' + kodepro.id)
    } catch (error) {
      session.flash('errorServerThingy', 'Ada masalah di server!')
      console.error(error)
      return response.redirect().back()
    }
  }

  public async destroy ({}: HttpContextContract) {
  }
}
