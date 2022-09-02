import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import Pengguna from 'App/Models/akun/Pengguna'
import Pengaturan from 'App/Models/sistem/Pengaturan'
import { DateTime } from 'luxon'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import User from 'App/Models/User'
import Drive from '@ioc:Adonis/Core/Drive'
import Hash from '@ioc:Adonis/Core/Hash'
var isBase64 = require('is-base64')


export default class PegawaisController {

  public async index ({ view, request, auth, response }: HttpContextContract) {
    if(!auth.user){
      return response.redirect().toPath('/app')
    }
    const userPengakses = await User.findOrFail(auth.user.id)
    await userPengakses.load('pengguna', (query) =>{
      query.preload('jabatan')
    })

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
      .select('penggunas.id as id', 'penggunas.nama as nama', 'penggunas.gender as gender', 'jabatans.nama as jabatan', 'penggunas.apakah_pegawai_aktif as apakahAktif', 'penggunas.gaji_bulanan as gajiBulanan', 'penggunas.foto as foto', 'penggunas.tanggal_gajian_selanjutnya as gajiSelanjutnya')
      .if(cari !== '', (query) => {
        query.where('penggunas.nama', 'like', `%${cari}%`)
      })
      .if(sanitizedOrder != 5, (query) => {
        query.orderBy('penggunas.apakah_pegawai_aktif', 'desc')
      })
      .if(userPengakses.pengguna.jabatan.nama !== 'Pemilik', (query) => {
        query.whereNot('jabatans.nama', 'Pemilik') // selain pemilik gabisa liat pemilik
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
      // lifehackUrlSementara: '/uploads/profilePict/'
    }

    return await view.render('pegawai/list-pegawai', { pegawais, tambahan })
  }

  public async create ({ view }: HttpContextContract) {
    const pengaturan = await Pengaturan.findOrFail(1)
    return await view.render('pegawai/form-pegawai', { gaji: pengaturan.defaultGajiKaryawan })
  }

  public async store ({ request, response, session }: HttpContextContract) {
    const newPegawaiSchema = schema.create({
      jabatan: schema.enum([
        'karyawan',
        'kepalatoko',
        'pemiliktoko'
      ] as const),
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
      catatan: schema.string.optional({ trim: true }, [
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
        rules.maxLength(100),
        rules.requiredWhen('jabatan', '=', 'pemiliktoko')
      ]),
      status: schema.enum([
        'aktif',
        'keluar'
      ] as const),
      tanggalMulaiAktif: schema.date.optional({}, [
        rules.requiredWhen('status', '=', 'aktif')
      ]),
      gajiBulanan: schema.number([
        rules.unsigned()
      ]),
      fotoPegawaiBase64: schema.string.optional()
    })

    const validrequest = await request.validate({ schema: newPegawaiSchema })

    let namaFileFoto = ''
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
      namaFileFoto = ''
    }

    try {
      let idJabatan = 0

      const userbaru = await User.create({
        username: validrequest.username,
        email: validrequest.email,
        password: validrequest.password
      })

      if(validrequest.jabatan == 'karyawan'){
        idJabatan = 1
      } else if(validrequest.jabatan == 'kepalatoko'){
        idJabatan = 2
      } else if(validrequest.jabatan == 'pemiliktoko'){
        idJabatan = 3
      } else{
        throw 'error'
      }


      const penggunabaru = await userbaru.related('pengguna').create({
        nama: validrequest.nama,
        gender: validrequest.gender,
        tempatLahir: validrequest.tempatLahir,
        tanggalLahir: validrequest.tanggalLahir,
        alamat: validrequest.alamat,
        catatan: validrequest.catatan,
        nohpAktif: validrequest.nohpAktif,
        apakahPegawaiAktif: validrequest.status === 'aktif',
        foto: (namaFileFoto)? namaFileFoto : null,
        gajiBulanan: validrequest.gajiBulanan,
        tanggalMulaiAktif: (validrequest.status === 'aktif' && validrequest.tanggalMulaiAktif)? DateTime.now() : null,
        tanggalGajianSelanjutnya: (validrequest.status === 'aktif')? DateTime.now().plus({ months: 1 }) : null,
        jabatanId: idJabatan
      })
  
      session.flash('alertSukses', 'Pegawai baru berhasil disimpan!')
      return response.redirect().toPath('/app/pegawai/' + penggunabaru.id)
    } catch (error) {
      session.flash('alertError', 'Ada masalah saat membuat pegawai baru. Silahkan coba lagi setelah beberapa saat.')
      return response.redirect().back()
    }
    
  }

  public async show ({ view, params, response, session, auth }: HttpContextContract) {
    try {
      if(!auth.user) throw 'ngga valid'

      const pegawai = await Pengguna.findOrFail(params.id)
      await pegawai.load('user')
      await pegawai.load('jabatan')

      const userPengakses = await User.findOrFail(auth.user.id)
      await userPengakses.load('pengguna', (query) => {
        query.preload('jabatan')
      })

      // hitung umur
      const diffTahun = DateTime.now().diff(pegawai.tanggalLahir, 'years').toObject()

      let tambahan = {
        adaFoto: (await Drive.exists('profilePict/' + pegawai.foto)),
        bisaEdit: (userPengakses.pengguna.id === pegawai.id || userPengakses.pengguna.jabatan.nama === 'Pemilik'),
        isAdmin: (userPengakses.pengguna.jabatan.nama === 'Pemilik'),
        isSaya: (userPengakses.pengguna.id === pegawai.id),
        umur: (diffTahun.years)? Math.floor(diffTahun.years) : 0
      }

      let fungsi = {
        rupiahParser: rupiahParser
      }

      return await view.render('pegawai/view-pegawai', {
        pegawai,
        tambahan,
        fungsi
      })
    } catch (error) {
      // sebener e kalo bisa raise error flag dulu
      session.flash('alertError', 'Pegawai yang anda akses tidak valid atau terhapus.')

      return response.redirect().toPath('/app/pegawai')
    }

  }

  public async showDataAkun ({ view, params, response, session }: HttpContextContract) {
    try {
      // Udah pake Middleware
      const pegawai = await Pengguna.findOrFail(params.id) // ID_PENGGUNA bukan ID_USER
      await pegawai.load('user')
      await pegawai.load('jabatan')

      return await view.render('pegawai/akun/view-akun-pegawai', {
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
      session.flash('alertError', 'Permintaan anda tidak dapat diproses.')
      return response.redirect().toPath('/app/pegawai')
    }
  }

  public async edit ({ view, params, response, session, auth }: HttpContextContract) {
    // udah pake middleware
    try {
      if(!auth.user) throw 'auth ngga valid'

      const pegawai = await Pengguna.findOrFail(params.id) // ID_PENGGUNA bukan ID_USER
      await pegawai.load('user')
      await pegawai.load('jabatan')

      const userPengakses = await User.findOrFail(auth.user.id)
      await userPengakses.load('pengguna', (query) => {
        query.preload('jabatan')
      })

      let isAdmin = false
      if(userPengakses.pengguna.jabatan.nama === 'Pemilik'){
        isAdmin = true
      }

      const tambahan = {
        adaFoto: await Drive.exists('profilePict/' + pegawai.foto),
        isAdmin
      }

      // lanjut disini
      return await view.render('pegawai/form-edit-pegawai', { pegawai, tambahan })

    } catch (error) {
      console.error(error)
      session.flash('alertError', 'Anda tidak memiliki hak untuk mengakses laman tersebut!')
      return response.redirect().toPath('/app/pegawai')
    }
  }

  public async update ({request, response, session, params, auth}: HttpContextContract) {
    const editPegawaiSchema = schema.create({
      jabatan: schema.enum.optional([
        'karyawan',
        'kepalatoko',
        'pemiliktoko'
      ] as const),
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
      catatan: schema.string.optional({ trim: true }, [
        rules.maxLength(100)
      ]),
      nohpAktif: schema.string({ trim: true }, [
        rules.maxLength(15)
      ]),

      status: schema.enum([
        'aktif',
        'keluar'
      ] as const),
      tanggalMulaiAktif: schema.date.optional({}, [
        rules.requiredWhen('status', '=', 'aktif')
      ]),
      tanggalGajianSelanjutnya: schema.date.optional({}, [
        rules.requiredWhen('status', '=', 'aktif')
      ]),
      gajiBulanan: schema.number([
        rules.unsigned()
      ]),
      fotoPegawaiBase64: schema.string.optional(),
      indiGambarBerubah: schema.string({ trim: true })
    })

    const validrequest = await request.validate({ schema: editPegawaiSchema })

    const gantiFoto = validrequest.indiGambarBerubah === 'ganti'
    let namaFileFoto = ''
    let fileFoto = validrequest.fotoPegawaiBase64 || ''

    if(gantiFoto){
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
        namaFileFoto = ''
      }
    }

    try {
      if(!auth.user) throw 'auth ngga valid'

      const userPengakses = await User.findOrFail(auth.user.id)
      await userPengakses.load('pengguna', (query) => {
        query.preload('jabatan')
      })

      let bolehGantiJabatan = (userPengakses.pengguna.jabatan.nama === 'Pemilik')

      const pengguna = await Pengguna.findOrFail(params.id)
      pengguna.nama = validrequest.nama
      pengguna.gender = validrequest.gender
      pengguna.tanggalLahir = validrequest.tanggalLahir
      pengguna.tempatLahir = validrequest.tempatLahir
      pengguna.alamat = validrequest.alamat
      pengguna.catatan = validrequest.catatan || null
      pengguna.nohpAktif = validrequest.nohpAktif
      pengguna.apakahPegawaiAktif = validrequest.status === 'aktif'

      if(gantiFoto){
        pengguna.foto = (namaFileFoto)? namaFileFoto : null
      }
      
      pengguna.tanggalMulaiAktif = (validrequest.status === 'aktif' && validrequest.tanggalMulaiAktif)? validrequest.tanggalMulaiAktif : null
      pengguna.tanggalGajianSelanjutnya = (validrequest.status === 'aktif' && validrequest.tanggalGajianSelanjutnya)? validrequest.tanggalGajianSelanjutnya : null
      pengguna.gajiBulanan = validrequest.gajiBulanan

      if(bolehGantiJabatan && validrequest.jabatan){
        let idJabatan = 0

        if(validrequest.jabatan == 'karyawan'){
          idJabatan = 1
        } else if(validrequest.jabatan == 'kepalatoko'){
          idJabatan = 2
        } else if(validrequest.jabatan == 'pemiliktoko'){
          idJabatan = 3
        } else{
          throw 'error'
        }

        pengguna.jabatanId = idJabatan
      }
      

      await pengguna.save()
  
      session.flash('alertSukses', 'Data pegawai berhasil diubah!')
      return response.redirect().toPath('/app/pegawai/' + params.id)
    } catch (error) {
      session.flash('alertError', 'Ada masalah saat mengubah data pegawai. Silahkan coba lagi setelah beberapa saat.')
      return response.redirect().back()
    }

  }

  public async destroy ({params, response, session}: HttpContextContract) {
    try {
      // udah pake middleware
      const pengguna = await Pengguna.findOrFail(params.id)
      await pengguna.load('user')

      pengguna.deletedAt = DateTime.now()
      await pengguna.save()

      pengguna.user.deletedAt = DateTime.now()
      await pengguna.user.save()

      session.flash('alertSukses', 'Pegawai "'+ pengguna.nama +'" berhasil dihapus!')
      return response.redirect().toPath('/app/pegawai/')
    } catch (error) {
      session.flash('alertError', 'Ada masalah saat menghapus data pegawai. Silahkan coba lagi setelah beberapa saat.')
      return response.redirect().back()
    }
  }

  public async checkCreditUbahAkun ({ params, request, response, auth }: HttpContextContract) {
    const pass = request.input('pass')

    try {
      if(!auth.user) throw 'ngga valid'

      if(!pass) throw 'Password tidak boleh kosong!'

      // Built in middleware
      const pegawai = await Pengguna.findOrFail(params.id) // PENGGUNA bukan USER
      await pegawai.load('user')
      await pegawai.load('jabatan')

      const userPengakses = await User.findOrFail(auth.user.id) // USER bukan PENGUNA
      await userPengakses.load('pengguna', (query) => {
        query.preload('jabatan')
      })

      if(userPengakses.pengguna.id !== pegawai.id && userPengakses.pengguna.jabatan.nama !== 'Pemilik'){ // bisa dijadiin middleware
        throw 'Anda tidak memiliki hak untuk melakukan perubahan!'
      }
   
      if(await Hash.verify(userPengakses.password, pass)){
        return response.ok({message: 'Ok', yangPunya: (userPengakses.pengguna.id === pegawai.id)})
      } else {
        throw 'Password yang anda isikan tidak tepat!'
      }

    } catch (error) {
      if(typeof error === 'string'){
        return response.badRequest({error: error})
      } else{
        return response.badRequest({error: 'Ada masalah pada server!'})
      }
    }
  }

  public async ubahUsername ({ response, request, params, auth }: HttpContextContract) {    
    const newUN = request.input('newUN')

    try {
      if(!auth.user) throw 'ngga valid'

      if(!newUN) throw 'Username tidak boleh kosong!'

      // Udah built in middleware
      const pegawai = await Pengguna.findOrFail(params.id) // PENGGUNA bukan USER
      await pegawai.load('user')
      await pegawai.load('jabatan')

      const userPengakses = await User.findOrFail(auth.user.id) // USER bukan PENGUNA
      await userPengakses.load('pengguna', (query) => {
        query.preload('jabatan')
      })

      if(userPengakses.pengguna.id !== pegawai.id && userPengakses.pengguna.jabatan.nama !== 'Pemilik'){
        throw 'Anda tidak memiliki hak untuk melakukan perubahan!'
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

  public async ubahPassword ({request, response, params, auth}: HttpContextContract) {
    const passbaru = request.input('passbaru')
    const passlama = request.input('passlama')

    try {
      if(!auth.user) throw 'ngga valid'

      if(!passbaru || !passlama) throw 'Password tidak boleh kosong!'

      // Udah built in middleware
      const pegawai = await Pengguna.findOrFail(params.id) // PENGGUNA bukan USER
      await pegawai.load('user')
      await pegawai.load('jabatan')

      const userPengakses = await User.findOrFail(auth.user.id) // USER bukan PENGUNA
      await userPengakses.load('pengguna', (query) => {
        query.preload('jabatan')
      })

      if(userPengakses.pengguna.id !== pegawai.id && userPengakses.pengguna.jabatan.nama !== 'Pemilik'){
        throw 'Anda tidak memiliki hak untuk melakukan perubahan!'
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

  public async getMyProfile ({ response, auth }: HttpContextContract) {
    try {
      if(!auth.user) throw 'Error'

      const userPengakses = await User.findOrFail(auth.user.id)
      await userPengakses.load('pengguna', (query) => {
        query.preload('jabatan')
      })

      return {
        nama: userPengakses.pengguna.nama,
        jabatan: userPengakses.pengguna.jabatan.nama,
        id: userPengakses.pengguna.id,
        adaFoto: (await Drive.exists('profilePict/' + userPengakses.pengguna.foto))
      }
    } catch (error) {
      return response.notFound({error: 'Profil tidak ditemukan!'})
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
  } else {
    return 'error'
  }
}