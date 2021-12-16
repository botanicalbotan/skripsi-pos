import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import Test from 'App/Models/Test'
import Hash from '@ioc:Adonis/Core/Hash'

// cuma buat nyoba doang
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Encryption from '@ioc:Adonis/Core/Encryption'
import Drive from '@ioc:Adonis/Core/Drive'
var isBase64 = require('is-base64');

export default class TestsController {
  public async index({}: HttpContextContract) {
    // datanya ntar aslinya dari request, mungkin pake pos, tp bisa juga get
    // let iniData = 'gelang'

    // trus disini, data tadi dipake buat ngambil data dari database tabel kerusakan, dicocokin sama bentuknya

    // kalau ada, bakal ngereturn list kerusakan jadi json

    // kalo gaada, return object kosongan, trus kasi checker di js nya

    return [
      {
        id: 1,
        title: 'Hello world',
      },
      {
        id: 2,
        title: 'Hello universe',
      },
    ]
  }

  // ini dah bagus, siap pakai
  public async transaksi({ request, view, response }: HttpContextContract) {
    const body = request.body()

    if (!body.prepareAsal || !body.prepareNota || !body.prepareRusak) {
      response.redirect().back()
    }

    if (body.prepareAsal == 1 || body.prepareNota == 1 || body.prepareRusak == 2) {
      return view.render('transaksi/pembelian/base-khusus')
    }
    return view.render('transaksi/pembelian/base-umum')
  }

  public async queryString({ request }: HttpContextContract) {
    const qs = request.qs()

    if (!qs.nama) return 'gaada query string nama'

    return qs
  }

  public async dump({ request, response }: HttpContextContract) {
    const body = request.body()
    if (body.perintah && body.perintah == 'error') {
      response.badRequest({ error: 'Nih tanda kalo request ga lengkap' })
    }

    if (body.perintah && body.perintah == 'forbidden') {
      response.forbidden({ error: 'Hayoloh mau ngapain. Ini tanda kalo gapunya akses' })
    }

    if (body.perintah && body.perintah == 404) {
      response.notFound({ error: 'Nih tanda kalo ga ketemu' })
    }

    return {
      ...{
        // kalo mau nambahin object sesuatu
        pesan: 'ini dari server loh',
      },
      ...body,
    }
  }

  // contoh kalo datanya gaada di array, fixnya ntar ngecek dari DB. Bakal lebih gampang soalnya bisa SELECT. tp kurang lebih bakal gini
  public async dataKerusakan({ request, response }: HttpContextContract) {
    const misal = [
      {
        id: 1,
        level: 1,
        levelDeskripsi: 'Bisa diperbaiki',
        nama: 'Patah',
        bentuk: 'cincin',
        ongkos: 10000,
        ongkosTeks: 'Rp. 10.000',
      },
      {
        id: 2,
        level: 2,
        levelDeskripsi: 'Tidak bisa diperbaiki',
        nama: 'Dekok',
        bentuk: 'cincin',
        ongkos: 0,
        ongkosTeks: 'Harga rosok',
      },
      {
        id: 3,
        level: 1,
        levelDeskripsi: 'Bisa diperbaiki',
        nama: 'Ilang',
        bentuk: 'cincin',
        ongkos: 20000,
        ongkosTeks: 'Rp. 20.000',
      },
      {
        id: 4,
        level: 2,
        levelDeskripsi: 'Tidak bisa diperbaiki',
        nama: 'Kayang',
        bentuk: 'kalung',
        ongkos: 0,
        ongkosTeks: 'Harga rosok',
      },
      {
        id: 5,
        level: 2,
        levelDeskripsi: 'tidak bisa diperbaiki',
        nama: 'Hilang Sebelah',
        bentuk: 'kalung',
        ongkos: 5000,
        ongkosTeks: 'Rp. 5.000',
      },
    ]

    const level = request.input('level', 0)
    const bentuk = request.input('bentuk', 'semua')

    if (level == 0 && bentuk === 'semua') {
      return misal
    }

    // cek query string
    const qs = request.qs()

    if (!qs.level || !qs.bentuk) {
      // kalo gaada bad request
      return response.badRequest({ error: 'Gaboleh gitu' })
    }

    function filterLevel(item) {
      // item ini maksudnya per 1 object yang ada di array misal
      if (
        item.level &&
        item.bentuk &&
        item.level === qs.level.toLowerCase() &&
        item.bentuk === qs.bentuk.toLowerCase()
      ) {
        // kalau mau ngasi 1 parameter yang bisa null, ngecek parameternya disini
        return true
      }
      return false
    }

    let hasil = misal.filter(filterLevel)

    if (!hasil || hasil.length == 0) {
      // kalo ga ketemu hasil search, not found
      return response.notFound({ error: 'Ga ketemu' })
    }

    return hasil
  }

  public async allTest({}: HttpContextContract) {
    return Test.all()
  }

  public async paginated({ request }: HttpContextContract) {
    // const page = request.input('page', 1)
    // const limit = 10

    // return await Database.from('tests').paginate(page, limit)

    const opsiOrder = [
      'nama',
      'gender',
      'tanggallahir',
      'phone',
      'pekerjaan',
      'lamakerja',
      'menikah',
    ]
    const page = request.input('page', 1)
    const order = request.input('ob', 0)
    const cari = request.input('cari', '')
    const sanitizedOrder = order >= opsiOrder.length || order < 0 ? 0 : order
    const limit = 10

    const datatest = await Database.from('tests')
      .if(cari !== '', (query) => {
        query.where('nama', 'like', `%${cari}%`)
      })
      .orderBy(opsiOrder[sanitizedOrder], 'asc')
      .paginate(page, limit)

    datatest.baseUrl('/app/test/paginationv1')

    return datatest
  }

  public async paginationv1({ request, view }: HttpContextContract) {
    const opsiOrder = [
      'nama',
      'gender',
      'tanggallahir',
      'phone',
      'pekerjaan',
      'lamakerja',
      'menikah',
    ]
    const page = request.input('page', 1)
    const order = request.input('ob', 0)
    const cari = request.input('cari', '')
    const sanitizedOrder = order < opsiOrder.length && order >= 0 && order? order : 0
    const limit = 10

    const datatest = await Database.from('tests')
      .if(cari !== '', (query) => {
        query.where('nama', 'like', `%${cari}%`)
      })
      .orderBy(opsiOrder[sanitizedOrder], 'asc')
      .orderBy('nama')
      .paginate(page, limit)

    datatest.baseUrl('/app/test/paginationv1')

    let qs = {
      ob: sanitizedOrder
    }

    if(cari !== ''){
      qs['cari'] = cari
    }

    datatest.queryString(qs)


    // datatest.queryString({ ob: sanitizedOrder })
    // if (cari !== '') {
    //   datatest.queryString({ ob: sanitizedOrder, cari: cari })
    // }

    // kalau mau mulai dari sini bisa dibikin fungsi sendiri
    // input bisa pagination object + panjang page yang mau di display
    let firstPage =
      datatest.currentPage - 2 > 0
        ? datatest.currentPage - 2
        : datatest.currentPage - 1 > 0
        ? datatest.currentPage - 1
        : datatest.currentPage
    let lastPage =
      datatest.currentPage + 2 <= datatest.lastPage
        ? datatest.currentPage + 2
        : datatest.currentPage + 1 <= datatest.lastPage
        ? datatest.currentPage + 1
        : datatest.currentPage

    if (lastPage - firstPage < 4 && datatest.lastPage > 4) {
      if (datatest.currentPage < datatest.firstPage + 2) {
        lastPage += 4 - (lastPage - firstPage)
      }

      if (lastPage == datatest.lastPage) {
        firstPage -= 4 - (lastPage - firstPage)
      }
    }
    // sampe sini

    const tambahan = {
      pengurutan: sanitizedOrder,
      pencarian: cari,
      firstPage: firstPage,
      lastPage: lastPage,
    }

    return view.render('test/paginationv1', { datatest, tambahan })
  }

  public async paginationv2({ view }: HttpContextContract) {
    return view.render('test/paginationv2')
  }

  public async paginationv3({ request, view }: HttpContextContract) {
    const opsiOrder = [
      'nama',
      'gender',
      'tanggallahir',
      'phone',
      'pekerjaan',
      'lamakerja',
      'menikah',
    ]
    const page = request.input('page', 1)
    const order = request.input('ob', 0)
    const cari = request.input('cari', '')
    const sanitizedOrder = order >= opsiOrder.length || order < 0 ? 0 : order
    const limit = 10

    const datatest = await Database.from('tests')
      .if(cari !== '', (query) => {
        query.where('nama', 'like', `%${cari}%`)
      })
      .orderBy(opsiOrder[sanitizedOrder], 'asc')
      .paginate(page, limit)

    datatest.baseUrl('/app/test/paginationv1')

    datatest.queryString({ ob: sanitizedOrder })
    if (cari !== '') {
      datatest.queryString({ ob: sanitizedOrder, cari: cari })
    }

    // kalau mau mulai dari sini bisa dibikin fungsi sendiri
    // input bisa pagination object + panjang page yang mau di display
    let firstPage =
      datatest.currentPage - 2 > 0
        ? datatest.currentPage - 2
        : datatest.currentPage - 1 > 0
        ? datatest.currentPage - 1
        : datatest.currentPage
    let lastPage =
      datatest.currentPage + 2 <= datatest.lastPage
        ? datatest.currentPage + 2
        : datatest.currentPage + 1 <= datatest.lastPage
        ? datatest.currentPage + 1
        : datatest.currentPage

    if (lastPage - firstPage < 4 && datatest.lastPage > 4) {
      if (datatest.currentPage < datatest.firstPage + 2) {
        lastPage += 4 - (lastPage - firstPage)
      }

      if (lastPage == datatest.lastPage) {
        firstPage -= 4 - (lastPage - firstPage)
      }
    }
    // sampe sini

    const tambahan = {
      pengurutan: sanitizedOrder,
      pencarian: cari,
      firstPage: firstPage,
      lastPage: lastPage,
    }

    return view.render('test/paginationv3', { datatest, tambahan })
  }







  public async hashArgon({ request }: HttpContextContract) {
    // terpaksa pake GET soalnya CSRF dah nyala

    const pureText = request.input('text', '')

    if (pureText == '') {
      return {
        error: 'Gaada input, gabisa di hash lah ege',
      }
    }

    const hashedText = await Hash.make(pureText)
    return {
      status: 'Berhasil',
      hasher: 'argon2',
      hasil: hashedText,
    }
  }

  public async base64de({ request, response }: HttpContextContract) {
    const base = request.input('input', null)
    if (base == null) {
      return response.forbidden('input perlu input cuy')
    }

    var block = base.split(';')
    // Get the content type
    var contentType = block[0].split(':')[1] // In this case "image/gif"
    // get the real base64 content of the file
    var realData = block[1].split(',')[1] // In this case "iVBORw0KGg...."

    const buffer = Buffer.from(realData, 'base64')

    await Drive.put('test2.jpg', buffer)

    return {
      pesan: 'Sukses',
      realData: realData,
    }
  }

  public async base64dePOST({ request, response, session }: HttpContextContract) {
    /**
     * Schema definition
     */

    const base64Schema = schema.create({
      input: schema.string({}, [rules.required()]),
    })

    const based = await request.validate({
      schema: base64Schema,
    })

    try {
      // rada redundan, gamake aslinya juga bisa, tp gamasalah
      if(!isBase64(based.input, {mimeRequired: true, allowEmpty: false})){
        throw new Error('input tidak valid')
      }

      var block = based.input.split(';')
      // Get the content type
      var contentType = block[0].split(':')[1] // In this case "image/gif"
      // get the real base64 content of the file
      var realData = block[1].split(',')[1] // In this case "iVBORw0KGg...."

      const buffer = Buffer.from(realData, 'base64')
      await Drive.put('ewe/test2.jpg', buffer)

      session.flash('successMsg', 'Konversi file berhasil, silahkan cek laman berikut: ' + await Drive.getUrl('test2.jpg'))
      response.redirect().back()

    } catch (error) {
      session.flash('unnaturalErrMsg', 'Konversi file gagal karena input yang anda masukkan tidak valid!')
      response.redirect().back()
    }
  }

  public async encrypt({ request, response }: HttpContextContract) {
    const enc = schema.create({
      input: schema.string({}, [rules.required()]),
    })

    const base = await request.validate({
      schema: enc,
    })

    if(base.input === ''){
      return response.badRequest({error: 'gaboleh kosong atuh'})
    }

    const en = Encryption.encrypt(base.input)

    return {
      enkripsi: en,
      length: en.length
    }
  }

  public async decrypt({ request, response }: HttpContextContract) {
    const dec = schema.create({
      input: schema.string({}, [rules.required()]),
    })

    const base = await request.validate({
      schema: dec,
    })

    if(base.input === ''){
      return response.badRequest({error: 'gaboleh kosong atuh'})
    }

    const de = Encryption.decrypt(base.input)

    return {
      enkripsi: de,
    }
  }
}
