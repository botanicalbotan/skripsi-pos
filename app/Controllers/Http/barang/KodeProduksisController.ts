import {
  HttpContextContract
} from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import {
  schema,
  rules
} from '@ioc:Adonis/Core/Validator'
import Kadar from 'App/Models/barang/Kadar'
import KodeProduksi from 'App/Models/barang/KodeProduksi'
import Pengaturan from 'App/Models/sistem/Pengaturan'
import Drive from '@ioc:Adonis/Core/Drive'
import { DateTime } from 'luxon'
import User from 'App/Models/User'

export default class KodeProduksisController {
  public async index({
    view,
    request
  }: HttpContextContract) {

    const opsiOrder = [
      'kode_produksis.kode',
      'kadars.nama',
      'kode_produksis.asal_produksi',
      'kode_produksis.apakah_buatan_tangan'
    ]
    const page = request.input('page', 1)
    const order = request.input('ob', 0)
    const sanitizedOrder = order < opsiOrder.length && order >= 0 && order ? order : 0
    const arahOrder = request.input('aob', 0)
    const sanitizedArahOrder = arahOrder == 1? 1:0
    const cari = request.input('cari', '')
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
      .orderBy(opsiOrder[sanitizedOrder], ((sanitizedArahOrder == 1)? 'desc': 'asc'))
      .orderBy('kode_produksis.kode')
      .paginate(page, limit)

    kodepros.baseUrl('/app/barang/kodepro')

    kodepros.queryString({
      ob: sanitizedOrder
    })
    if (cari !== '') {
      kodepros.queryString({
        ob: sanitizedOrder,
        cari: cari
      })
    }

    let firstPage =
      kodepros.currentPage - 2 > 0 ?
      kodepros.currentPage - 2 :
      kodepros.currentPage - 1 > 0 ?
      kodepros.currentPage - 1 :
      kodepros.currentPage
    let lastPage =
      kodepros.currentPage + 2 <= kodepros.lastPage ?
      kodepros.currentPage + 2 :
      kodepros.currentPage + 1 <= kodepros.lastPage ?
      kodepros.currentPage + 1 :
      kodepros.currentPage

    if (lastPage - firstPage < 4 && kodepros.lastPage > 4) {
      if (kodepros.currentPage < kodepros.firstPage + 2) {
        lastPage += 4 - (lastPage - firstPage)
      }

      if (lastPage == kodepros.lastPage) {
        firstPage -= 4 - (lastPage - firstPage)
      }
    }

    const tempLastData = 10 + (kodepros.currentPage - 1) * limit

    const tambahan = {
      pengurutan: sanitizedOrder,
      pencarian: cari,
      firstPage: firstPage,
      lastPage: lastPage,
      firstDataInPage: 1 + (kodepros.currentPage - 1) * limit,
      lastDataInPage: tempLastData >= kodepros.total ? kodepros.total : tempLastData,
    }

    return view.render('barang/kodepro/list-kodepro', {
      kodepros,
      tambahan
    })
  }

  public async create({
    view
  }: HttpContextContract) {
    let kadars = await Database
      .from('kadars')
      .select('id',
        'apakah_potongan_persen as apakahPotonganPersen',
        'nama')

    let pengaturan = await Pengaturan.findOrFail(1)

    return view.render('barang/kodepro/form-kodepro', {
      kadars,
      hargaMal: pengaturan.hargaMal
    })
  }

  public async store({
    request,
    response,
    session,
    auth
  }: HttpContextContract) {
    const createKodeProduksiSchema = schema.create({
      kode: schema.string({
        trim: true
      }, [
        rules.maxLength(10),
        rules.unique({
          table: 'kode_produksis',
          column: 'kode'
        })
      ]),
      kadar: schema.number([
        rules.unsigned(),
        rules.exists({
          table: 'kadars',
          column: 'id'
        })
      ]),
      asal: schema.string({
        trim: true
      }, [
        rules.maxLength(50)
      ]),
      metode: schema.enum([
          'pabrikan',
          'buatanTangan'
        ] as
        const),
      deskripsi: schema.string({
        trim: true
      }, [
        rules.maxLength(100)
      ]),
      hargaLama: schema.number([
        rules.unsigned()
      ]),
      hargaBaru: schema.number([
        rules.unsigned()
      ]),
      potonganLama: schema.number([
        rules.unsigned()
      ]),
      potonganBaru: schema.number([
        rules.unsigned()
      ]),
      // persentaseMalUripan: schema.number([
      //   rules.unsigned(),
      //   rules.range(0, 99)
      // ]),
      // persentaseMalRosok: schema.number([
      //   rules.unsigned(),
      //   rules.range(0, 99)
      // ]),
      // ongkosBeliTanpaNota: schema.number([
      //   rules.unsigned()
      // ])
    })

    const validrequest = await request.validate({
      schema: createKodeProduksiSchema
    })

    try {
      let kadar = await Kadar.findOrFail(validrequest.kadar)

      if(!auth.user) throw 'auth ngga valid'

      const userPengakses = await User.findOrFail(auth.user.id)
      await userPengakses.load('pengguna')

      if(kadar.apakahPotonganPersen){
        if(validrequest.potonganLama > 100){
          session.flash('errors', {
            potonganLama: 'Nominal potongan tidak valid'
          })
          return response.redirect().back()
        }

        if(validrequest.potonganBaru > 100){
          session.flash('errors', {
            potonganBaru: 'Nominal potongan tidak valid'
          })
          return response.redirect().back()
        }
      }

      await kadar.related('kodeProduksis').create({
        kode: validrequest.kode,
        deskripsi: validrequest.deskripsi,
        apakahBuatanTangan: validrequest.metode === 'buatanTangan',
        asalProduksi: validrequest.asal,
        hargaPerGramBaru: validrequest.hargaBaru,
        hargaPerGramLama: validrequest.hargaLama,
        potonganBaru: validrequest.potonganBaru,
        potonganLama: validrequest.potonganLama,
        // persentaseMalUripan: validrequest.persentaseMalUripan,
        // persentaseMalRosok: validrequest.persentaseMalRosok,
        // ongkosBeliTanpaNota: validrequest.ongkosBeliTanpaNota,
        // ongkosMalRosokPerGram: 0, // persiapan dihapus
        penggunaId: userPengakses.pengguna.id
      })

      session.flash('alertSukses', 'Kode produksi baru berhasil disimpan!')
      return response.redirect().toPath('/app/barang/kodepro/')
    } catch (error) {
      console.error(error)
      session.flash('alertError', 'Ada masalah saat membuat kode produks baru. Silahkan coba lagi setelah beberapa saat.')
      return response.redirect().back()
    }
  }

  public async show({
    view,
    params,
    response,
    session
  }: HttpContextContract) {
    try {
      let kodepro = await KodeProduksi.findOrFail(params.id)
      await kodepro.load('kadar')
      await kodepro.load('pengguna', (query) => {
        query.preload('jabatan')
      })

      const urlPencatat = (await Drive.exists('profilePict/' + kodepro.pengguna.foto))? (await Drive.getUrl('profilePict/' + kodepro.pengguna.foto)) : ''


      let pengaturan = await Pengaturan.findOrFail(1)

      const tambahan = {
        urlFotoPencatat: urlPencatat
      }

      let fungsi = {
        rupiahParser: rupiahParser
      }

      return view.render('barang/kodepro/view-kodepro', {
        kodepro,
        tambahan,
        fungsi,
        hargaMal: pengaturan.hargaMal
      })
    } catch (error) {
      session.flash('alertError', 'Kode produksi yang anda akses tidak valid atau terhapus.')
      return response.redirect().toPath('/app/barang/kodepro/')
    }
  }

  public async edit({
    view,
    params,
    response,
    session
  }: HttpContextContract) {
    try {
      let kodepro = await KodeProduksi.findOrFail(params.id)
      await kodepro.load('kadar')

      let kadars = await Database
      .from('kadars')
      .select('id',
        'apakah_potongan_persen as apakahPotonganPersen',
        'nama')

      let pengaturan = await Pengaturan.findOrFail(1)

      return view.render('barang/kodepro/form-edit-kodepro', {
        kodepro,
        kadars,
        hargaMal: pengaturan.hargaMal
      })
    } catch (error) {
      session.flash('errorServerThingy', 'Ada masalah di server!')
      console.error(error)
      return response.redirect().toPath('/app/barang/kodepro/')
    }
  }

  public async update({
    response,
    request,
    session,
    params,
    auth
  }: HttpContextContract) {
    const editKodeProduksiSchema = schema.create({
      kode: schema.string({
        trim: true
      }, [
        rules.maxLength(10),
        rules.unique({
          table: 'kode_produksis',
          column: 'kode',
          whereNot: {
            id: params.id
          }
        }),
      ]),
      kadar: schema.number([
        rules.unsigned(),
        rules.exists({
          table: 'kadars',
          column: 'id',
        })
      ]),
      asal: schema.string({
        trim: true
      }, [
        rules.maxLength(50)
      ]),
      metode: schema.enum([
          'pabrikan',
          'buatanTangan'
        ] as
        const),
      deskripsi: schema.string({
        trim: true
      }, [
        rules.maxLength(100)
      ]),
      hargaLama: schema.number([
        rules.unsigned()
      ]),
      hargaBaru: schema.number([
        rules.unsigned()
      ]),
      potonganLama: schema.number([
        rules.unsigned()
      ]),
      potonganBaru: schema.number([
        rules.unsigned()
      ]),
      // persentaseMalUripan: schema.number([
      //   rules.unsigned(),
      //   rules.range(0, 99)
      // ]),
      // persentaseMalRosok: schema.number([
      //   rules.unsigned(),
      //   rules.range(0, 99)
      // ]),
      // ongkosBeliTanpaNota: schema.number([
      //   rules.unsigned()
      // ])
    })

    const validrequest = await request.validate({
      schema: editKodeProduksiSchema
    })

    try {
      let kadar = await Kadar.findOrFail(validrequest.kadar)

      if(!auth.user) throw 'auth ngga valid'
      const userPengakses = await User.findOrFail(auth.user.id)
      await userPengakses.load('pengguna')

      if(kadar.apakahPotonganPersen){
        if(validrequest.potonganLama > 100){
          session.flash('errors', {
            potonganLama: 'Nominal potongan tidak valid'
          })
          return response.redirect().back()
        }

        if(validrequest.potonganBaru > 100){
          session.flash('errors', {
            potonganBaru: 'Nominal potongan tidak valid'
          })
          return response.redirect().back()
        }
      }

      let kodepro = await KodeProduksi.findOrFail(params.id)
      kodepro.kode = validrequest.kode
      kodepro.kadarId = kadar.id
      kodepro.asalProduksi = validrequest.asal
      kodepro.apakahBuatanTangan = validrequest.metode === 'buatanTangan',
      kodepro.deskripsi = validrequest.deskripsi
      kodepro.hargaPerGramBaru = validrequest.hargaBaru
      kodepro.hargaPerGramLama = validrequest.hargaLama
      kodepro.potonganBaru = validrequest.potonganBaru
      kodepro.potonganLama = validrequest.potonganLama
      // kodepro.persentaseMalUripan = validrequest.persentaseMalUripan
      // kodepro.persentaseMalRosok = validrequest.persentaseMalRosok
      // kodepro.ongkosBeliTanpaNota = validrequest.ongkosBeliTanpaNota
      // kodepro.ongkosMalRosokPerGram = 0 // persiapan dihapus
      kodepro.penggunaId = userPengakses.pengguna.id
      await kodepro.save()

      session.flash('alertSukses', 'Data kode produksi berhasil diubah!')
      return response.redirect().toPath('/app/barang/kodepro/' + kodepro.id)
    } catch (error) {
      session.flash('alertError', 'Ada masalah saat mengubah data kode produksi. Silahkan coba lagi setelah beberapa saat.')
      console.error(error)
      return response.redirect().back()
    }
  }

  public async destroy({ response, params, session }: HttpContextContract) {
    try {
      const kodepro = await KodeProduksi.findOrFail(params.id)
      kodepro.deletedAt = DateTime.now()
      await kodepro.save()

      session.flash('alertSukses', 'Kode produksi "'+ kodepro.kode +'" berhasil dihapus!')
      return response.redirect().toPath('/app/barang/kodepro/')
    } catch (error) {
      session.flash('alertError', 'Ada masalah saat menghapus data kode produksi. Silahkan coba lagi setelah beberapa saat.')
      return response.redirect().back()
    }
  }


  // ============================== Tambahan buat API =================================
  public async cekKode({
    request,
    response
  }: HttpContextContract) {
    let kode = request.input('kode')

    if (kode === null || typeof kode === 'undefined') {
      return response.badRequest('Kode tidak boleh kosong')
    }

    let cekKode = await Database
      .from('kode_produksis')
      .select('kode')
      .where('kode', kode)

    if (cekKode.length > 0) {
      return response.notFound('Kode sudah terpakai, tolong gunakan kode lain')
    } else {
      // return response.ok('Kode bisa digunakan')
      // return 'Kode bisa digunakan'
      return { status: 'berhasil' }
    }

  }


  public async cekKodeEdit({
    request,
    response
  }: HttpContextContract) {
    let kode = request.input('kode')
    let currentId = request.input('currentId')

    if (kode === null || typeof kode === 'undefined' || currentId === null || typeof currentId === 'undefined') {
      return response.badRequest('Kode dan id tidak boleh kosong')
    }

    let cekKode = await Database
      .from('kode_produksis')
      .select('kode')
      .where('kode', kode)
      .whereNot('id', currentId)

    if (cekKode.length > 0) {
      return response.notFound('Kode sudah terpakai, tolong gunakan kode lain')
    } else {
      // return response.ok('Kode bisa digunakan')
      // return 'Kode bisa digunakan'
      return { status: 'berhasil' }
    }

  }


  public async getKodeproById({
    request,
    response
  }: HttpContextContract) {
    let kodeId = request.input('id')

    if (kodeId === null || typeof kodeId === 'undefined') {
      return response.badRequest({error: 'ID kode produksi tidak boleh kosong'})
    }

    try {
      // const kodepro = await KodeProduksi.findOrFail(kodeId)
      // await kodepro.load('kadar', (query) =>{
      //   query.select('nama', 'apakah_potongan_persen')
      // })

      const kodepro = await Database
        .from('kode_produksis')
        .join('kadars', 'kode_produksis.kadar_id', 'kadars.id')
        .select(
          'kode_produksis.harga_per_gram_lama as hargaPerGramLama',
          'kode_produksis.harga_per_gram_baru as hargaPerGramBaru',
          'kode_produksis.potongan_lama as potonganLama',
          'kode_produksis.potongan_baru as potonganBaru',
          'kadars.apakah_potongan_persen as apakahPotonganPersen'
        )
        .whereNull('kode_produksis.deleted_at')
        .andWhere('kode_produksis.id', kodeId)
        .firstOrFail()

      return kodepro

    } catch (error) {
      return response.notFound({error: 'Kode produksi tidak ditemukan'})
    }


  }

  public async getKodeprosByKadarId({
    request,
    response
  }: HttpContextContract) {
    let kadarId = request.input('id')



    try {
      if (kadarId === null || typeof kadarId === 'undefined') {
        throw 'waduh'
      }

      const kodepros = await Database
      .from('kode_produksis')
      .select('id', 'kode', 'deskripsi')
      .where('kadar_id', kadarId)
      .andWhereNull('deleted_at')
      .orderBy('kode')

      const kadar = await Database
        .from('kadars')
        .where('id', kadarId)
        .select('nama', 'apakah_potongan_persen as apakahPotonganPersen')
        .firstOrFail()

      return { kodepros, kadar }
    } catch (error) {
      return response.badRequest('Id kadar tidak valid.')
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
  }
}