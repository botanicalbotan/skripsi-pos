import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import Pengguna from 'App/Models/akun/Pengguna'
import Pengaturan from 'App/Models/sistem/Pengaturan'
import { DateTime, Settings } from 'luxon'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import User from 'App/Models/User'
import Jabatan from 'App/Models/akun/Jabatan'
import Drive from '@ioc:Adonis/Core/Drive'
import Hash from '@ioc:Adonis/Core/Hash'
var isBase64 = require('is-base64')


export default class PegawaisController {

  public async index ({ view, request }: HttpContextContract) {
    const opsiOrder = [
      'penggunas.nama',
      'jabatans.nama',
      'penggunas.gender',
      'penggunas.tanggal_gajian_selanjutnya',
      'penggunas.gaji_bulanan',
      'penggunas.apakah_pegawai_aktif',
    ]
    const page = request.input('page', 1)
    const order = request.input('ob', 0)
    const cari = request.input('cari', '')
    const sanitizedOrder = order < opsiOrder.length && order >= 0 && order? order : 0
    const arahOrder = request.input('aob', 0)
    const sanitizedArahOrder = arahOrder == 1? 1:0
    const filterShow = request.input('fs', 0)
    const sanitizedFilterShow = filterShow == 1? 1:0
    const limit = 10

    const pegawais = await Database.from('penggunas')
      .join('jabatans','penggunas.jabatan_id', '=', 'jabatans.id')
      .whereNull('penggunas.deleted_at')
      .whereNot('jabatans.nama', 'Pemilik')
      .select('penggunas.id as id', 'penggunas.nama as nama', 'penggunas.gender as gender', 'jabatans.nama as jabatan', 'penggunas.apakah_pegawai_aktif as apakahAktif', 'penggunas.gaji_bulanan as gajiBulanan', 'penggunas.foto as foto', 'penggunas.tanggal_gajian_selanjutnya as gajiSelanjutnya')
      .if(cari !== '', (query) => {
        query.where('penggunas.nama', 'like', `%${cari}%`)
      })
      .if(sanitizedOrder != 5, (query) => {
        query.orderBy('penggunas.apakah_pegawai_aktif', 'desc')
      })
      .if(sanitizedFilterShow == 0, (query) => {
        query
          .where('penggunas.apakah_pegawai_aktif', true)
          .andWhereNotNull('penggunas.tanggal_gajian_selanjutnya')
      })
      .orderBy(opsiOrder[sanitizedOrder], ((sanitizedArahOrder == 1)? 'desc': 'asc'))
      .orderBy('penggunas.nama')
      .paginate(page, limit)

    pegawais.baseUrl('/app/pegawai')

    let qsParam = {
      ob: sanitizedOrder,
      aob: sanitizedArahOrder
    }

    if (cari !== '') qsParam['cari'] = cari
    if (sanitizedFilterShow !== 0) qsParam['fs'] = sanitizedFilterShow

    pegawais.queryString(qsParam)

    let firstPage =
      pegawais.currentPage - 2 > 0
        ? pegawais.currentPage - 2
        : pegawais.currentPage - 1 > 0
        ? pegawais.currentPage - 1
        : pegawais.currentPage
    let lastPage =
      pegawais.currentPage + 2 <= pegawais.lastPage
        ? pegawais.currentPage + 2
        : pegawais.currentPage + 1 <= pegawais.lastPage
        ? pegawais.currentPage + 1
        : pegawais.currentPage

    if (lastPage - firstPage < 4 && pegawais.lastPage > 4) {
      if (pegawais.currentPage < pegawais.firstPage + 2) {
        lastPage += 4 - (lastPage - firstPage)
      }

      if (lastPage == pegawais.lastPage) {
        firstPage -= 4 - (lastPage - firstPage)
      }
    }
    // sampe sini
    const tempLastData = 10 + ((pegawais.currentPage - 1) * limit)

    const tambahan = {
      pengurutan: sanitizedOrder,
      pencarian: cari,
      filterShow: sanitizedFilterShow,
      firstPage: firstPage,
      lastPage: lastPage,
      firstDataInPage: 1 + ((pegawais.currentPage - 1) * limit),
      lastDataInPage: (tempLastData >= pegawais.total)? pegawais.total: tempLastData,
      lifehackUrlSementara: '/uploads/profilePict/'
    }

    return view.render('pegawai/base', { pegawais, tambahan })
  }

  public async create ({ view }: HttpContextContract) {
    const pengaturan = await Pengaturan.findOrFail(1)
    return view.render('pegawai/form-pegawai', { gaji: pengaturan.defaultGajiKaryawan })
  }

  public async store ({ request, response }: HttpContextContract) {
    const newPegawaiSchema = schema.create({
      nama: schema.string({ trim: true }, [
        rules.maxLength(50)
      ]),
      gender: schema.enum([
        'L',
        'P'
      ] as const),
      tempatLahir: schema.string({ trim: true }, [
        rules.maxLength(100)
      ]),
      tanggalLahir: schema.date(),
      alamat: schema.string({ trim: true }, [
        rules.maxLength(100)
      ]),
      nohpAktif: schema.string({ trim: true }, [
        rules.maxLength(15)
      ]),
      username: schema.string({ trim: true }, [
        rules.unique({ table: 'users', column: 'username' }),
        rules.maxLength(30)
      ]),
      password: schema.string({ trim: true }),
      email: schema.string.optional({ trim: true }, [
        rules.email(),
        rules.maxLength(100)
      ]),
      status: schema.enum([
        'aktif',
        'keluar'
      ] as const),
      // tanggalAwalMasuk: schema.date(),
      lamaKerja: schema.number([
        rules.unsigned()
      ]),
      gajiBulanan: schema.number([
        rules.unsigned()
      ]),
      fotoPegawaiBase64: schema.string.optional()
    })

    const validrequest = await request.validate({ schema: newPegawaiSchema })

    // ntar rillnya di cek pake tekstual, find by nama ato bebas lah
    const jabatan = await Jabatan.findOrFail(1)

    const userbaru = await User.create({
      username: validrequest.username,
      email: validrequest.email,
      password: validrequest.password
    })

    let namaFileFoto = ''
    // typescript ngga mau kalau ambigu, buat ngeyakinin mereka kalo ini string, kudu eksplisit
    let fileFoto = validrequest.fotoPegawaiBase64 || ''

    try {
      if(!isBase64(fileFoto, {mimeRequired: true, allowEmpty: false}) || fileFoto === ''){
        throw new Error('gambar tidak valid')
      }

      var block = fileFoto.split(';')
      var realData = block[1].split(',')[1] // In this case "iVBORw0KGg...."
      namaFileFoto = (validrequest.nama || '').replace(/\s/gm, '') + DateTime.now().toMillis() + '.jpg'

      // ntar di resize buffernya pake sharp dulu jadi 300x300
      const buffer = Buffer.from(realData, 'base64')
      await Drive.put('profilePict/' + namaFileFoto, buffer)

    } catch (error) {
      console.error(error)
      namaFileFoto = ''
    }

    const penggunabaru = await userbaru.related('pengguna').create({
      nama: validrequest.nama,
      gender: validrequest.gender,
      tempatLahir: validrequest.tempatLahir,
      tanggalLahir: validrequest.tanggalLahir,
      lamaKerja: validrequest.lamaKerja,
      alamat: validrequest.alamat,
      nohpAktif: validrequest.nohpAktif,
      apakahPegawaiAktif: validrequest.status === 'aktif',
      foto: (namaFileFoto)? namaFileFoto : null,
      gajiBulanan: validrequest.gajiBulanan,
      tanggalMulaiAktif: DateTime.now(),
      tanggalGajianSelanjutnya: DateTime.now().plus({ months: 1 }),
      jabatanId: jabatan.id
    })

    return response.redirect().toPath('/app/pegawai/' + penggunabaru.id)
  }

  public async show ({ view, params, response }: HttpContextContract) {
    let placeholderPengguna = 1  // ini harusnya ngambil dari current active session

    try {
      const pegawai = await Pengguna.findOrFail(params.id)
      await pegawai.load('user')
      await pegawai.load('jabatan')

      const url = (await Drive.exists('profilePict/' + pegawai.foto))? (await Drive.getUrl('profilePict/' + pegawai.foto)) : ''

      // cek constrain, kalo lulus bisa ngedit2
      let bisaEdit = false
      let isAdmin = false
      const pengakses = await Pengguna.findOrFail(placeholderPengguna)
      await pengakses.load('jabatan')

      if(pengakses.id === pegawai.id || pengakses.jabatan.nama === 'Pemilik'){ // ntar bisa dijadiin yang lebih propper
        bisaEdit = true
      }

      if(pengakses.jabatan.nama === 'Pemilik'){
        isAdmin = true
      }

      let tambahan = {
        urlFoto: url,
        bisaEdit,
        isAdmin
      }

      return view.render('pegawai/view-pegawai', {
        pegawai,
        tambahan
      })
    } catch (error) {
      // sebener e kalo bisa raise error flag dulu
      response.redirect().toPath('/app/pegawai')
    }

  }

  public async showDataAkun ({ view, params, response, session }: HttpContextContract) {
    let placeholderUser = 1  // ini harusnya ngambil dari current active session, ID_USER bukan ID_Pengguna

    try {
      // ntar cek constrainnya ganti
      // PAKEMIDDLEWARE
      const pegawai = await Pengguna.findOrFail(params.id) // ID_PENGGUNA bukan ID_USER
      await pegawai.load('user')
      await pegawai.load('jabatan')

      const userPengakses = await User.findOrFail(placeholderUser)
      await userPengakses.load('pengguna', (query) => {
        query.preload('jabatan')
      })

      if(userPengakses.pengguna.id !== pegawai.id && userPengakses.pengguna.jabatan.nama !== 'Pemilik'){ // bisa dijadiin middleware
        session.flash('alertError', 'Anda tidak memiliki izin untuk mengakses laman tersebut!')
        return response.redirect().toPath('/app/pegawai/' + params.id)
      }


      return view.render('pegawai/akun/view-akun-pegawai', {
        pegawai: {
          nama: pegawai.nama,
          jabatan: pegawai.jabatan.nama,
          id: pegawai.id,
          email: pegawai.user.email,
          username: pegawai.user.username,
          apakahPegawaiAktif: pegawai.apakahPegawaiAktif
        },
      })
    } catch (error) {
      session.flash('alertError', 'Anda tidak memiliki izin untuk mengakses laman tersebut!')
      return response.redirect().toPath('/app/pegawai')
    }
  }

  public async edit ({}: HttpContextContract) {
  }

  public async update ({}: HttpContextContract) {
  }

  public async destroy ({}: HttpContextContract) {
  }

  public async ubahStatus ({ request, response, params }: HttpContextContract) {

    // ntar cek constrainnya ganti
    // PAKEMIDDLEWARE

    try {
      const pegawai = await Pengguna.findOrFail(params.id)
      const statusBaru = request.input('target')

      if(statusBaru != 0 && statusBaru!= 1){
        throw 'Input tidak valid'
      }

      pegawai.apakahPegawaiAktif = statusBaru
      await pegawai.save()

      return response.ok({message: 'Status pegawai berhasil diubah'})
    } catch (error) {
      // return response.badRequest({error: error})
      if(typeof error === 'string'){
        return response.badRequest({error: error})
      } else{
        return response.badRequest({error: 'Ada masalah pada server!'})
      }
    }

  }

  public async checkCredit ({ params, request, response }: HttpContextContract) {
    const pass = request.input('pass')
    let placeholderUser = 1  // ini harusnya ngambil dari current active session, ID_USER bukan ID_PENGGUNA

    try {
      if(!pass) throw 'Password tidak boleh kosong!'

      // ntar cek constrainnya ganti
      // PAKEMIDDLEWARE
      const pegawai = await Pengguna.findOrFail(params.id) // PENGGUNA bukan USER
      await pegawai.load('user')
      await pegawai.load('jabatan')

      const userPengakses = await User.findOrFail(placeholderUser) // USER bukan PENGUNA
      await userPengakses.load('pengguna', (query) => {
        query.preload('jabatan')
      })

      if(userPengakses.pengguna.id !== pegawai.id && userPengakses.pengguna.jabatan.nama !== 'Pemilik'){ // bisa dijadiin middleware
        throw 'Anda tidak memiliki izin untuk melakukan perubahan!'
      }
   
      if(await Hash.verify(userPengakses.password, pass)){
        return response.ok({message: 'Ok', yangPunya: (userPengakses.id === pegawai.id)})
      } else {
        throw 'Password yang anda isikan tidak tepat!'
      }

    } catch (error) {
      // return response.badRequest({error: error})
      if(typeof error === 'string'){
        return response.badRequest({error: error})
      } else{
        return response.badRequest({error: 'Ada masalah pada server!'})
      }
    }
  }

  public async ubahUsername ({ response, request, params }: HttpContextContract) {    
    const newUN = request.input('newUN')
    let placeholderUser = 1  // ini harusnya ngambil dari current active session, ID_USER bukan ID_PENGGUNA

    try {
      if(!newUN) throw 'Username tidak boleh kosong!'

      // ntar cek constrainnya ganti
      // PAKEMIDDLEWARE
      const pegawai = await Pengguna.findOrFail(params.id) // PENGGUNA bukan USER
      await pegawai.load('user')
      await pegawai.load('jabatan')

      const userPengakses = await User.findOrFail(placeholderUser) // USER bukan PENGUNA
      await userPengakses.load('pengguna', (query) => {
        query.preload('jabatan')
      })

      if(userPengakses.pengguna.id !== pegawai.id && userPengakses.pengguna.jabatan.nama !== 'Pemilik'){ // bisa dijadiin middleware
        throw 'Anda tidak memiliki izin untuk melakukan perubahan!'
      }
      
      const cekPegawai = await User.findBy('username', newUN)
      if(cekPegawai && cekPegawai.id !== pegawai.user.id) throw 'Username sudah digunakan. Silahkan gunakan username yang lain!'

      pegawai.user.username = newUN
      await pegawai.user.save()

      return response.ok({message: 'Username berhasil diubah'})
    } catch (error) {
      // return response.badRequest({error: error})
      if(typeof error === 'string'){
        return response.badRequest({error: error})
      } else{
        return response.badRequest({error: 'Ada masalah pada server!'})
      }
    }
  }

  public async ubahPassword ({request, response, params}: HttpContextContract) {
    const passbaru = request.input('passbaru')
    const passlama = request.input('passlama')
    let placeholderUser = 1  // ini harusnya ngambil dari current active session, ID_USER bukan ID_PENGGUNA

    try {
      if(!passbaru || !passlama) throw 'Password tidak boleh kosong!'

      // ntar cek constrainnya ganti
      // PAKEMIDDLEWARE
      const pegawai = await Pengguna.findOrFail(params.id) // PENGGUNA bukan USER
      await pegawai.load('user')
      await pegawai.load('jabatan')

      const userPengakses = await User.findOrFail(placeholderUser) // USER bukan PENGUNA
      await userPengakses.load('pengguna', (query) => {
        query.preload('jabatan')
      })

      if(userPengakses.pengguna.id !== pegawai.id && userPengakses.pengguna.jabatan.nama !== 'Pemilik'){ // bisa dijadiin middleware
        throw 'Anda tidak memiliki izin untuk melakukan perubahan!'
      }

   
      if(await Hash.verify(userPengakses.password, passlama)){
        pegawai.user.password = passbaru
        await pegawai.user.save()

        return response.ok({message: 'Ok'})
      } else {
        throw 'Password yang anda isikan tidak tepat!'
      }

    } catch (error) {
      // return response.badRequest({error: error})
      if(typeof error === 'string'){
        return response.badRequest({error: error})
      } else{
        return response.badRequest({error: 'Ada masalah pada server!'})
      }
    }
  }

  public async ubahEmail ({}: HttpContextContract) {
  }

  public async verivyEmail ({}: HttpContextContract) {
  }

  public async getMyProfile ({ response }: HttpContextContract) {
    let placeholderPengguna = 1 // ini ntar diganti jadi current active session

    try {
      const pengguna = await Pengguna.findOrFail(placeholderPengguna)
      await pengguna.load('jabatan')

      const url = (await Drive.exists('profilePict/' + pengguna.foto))? (await Drive.getUrl('profilePict/' + pengguna.foto)) : ''

      return {
        nama: pengguna.nama,
        jabatan: pengguna.jabatan.nama,
        id: pengguna.id,
        urlFoto: url
      }
    } catch (error) {
      return response.notFound('Profil tidak ditemukan!')
    }
    
  }
}
