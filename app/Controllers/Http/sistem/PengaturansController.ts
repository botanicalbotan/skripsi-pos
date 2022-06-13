import {
  HttpContextContract
} from '@ioc:Adonis/Core/HttpContext'
import Pengguna from 'App/Models/akun/Pengguna'
import Drive from '@ioc:Adonis/Core/Drive'
import { DateTime } from 'luxon'
import Pengaturan from 'App/Models/sistem/Pengaturan'
import Kadar from 'App/Models/barang/Kadar'
import Database from '@ioc:Adonis/Lucid/Database'
var isBase64 = require('is-base64')

export default class PengaturansController {
  public async pageGeneral({ view }: HttpContextContract) {
    // Ini udah make middleware
    const pengaturan  = await Pengaturan.findOrFail(1)
    let tambahan = {
      adaLogo : await Drive.exists('logoToko/' + pengaturan.logoToko)
    }
    return view.render('pengaturan/atur-general', { pengaturan, tambahan })
  }

  public async gantiLogo({ request, response }: HttpContextContract) {
    let input = request.input('fileFoto')
    let fileFoto :string = input || ''
    let namaFileFoto = ''

    try {
      if (!isBase64(fileFoto, { mimeRequired: true, allowEmpty: false }) || fileFoto === '') {
        throw 'Ngga valid'
      }

      const pengaturan = await Pengaturan.findOrFail(1)

      var block = fileFoto.split(';')
      var realData = block[1].split(',')[1] // In this case "iVBORw0KGg...."
      namaFileFoto = `LT-I${pengaturan.id}-${DateTime.now().toMillis()}.jpg` // bisa diganti yang lebih propper

      // ntar di resize buffernya pake sharp dulu jadi 300x300
      const buffer = Buffer.from(realData, 'base64')
      await Drive.put('logoToko/' + namaFileFoto, buffer)

      pengaturan.logoToko = namaFileFoto
      await pengaturan.save()

      return response.ok({message: 'Ok'})
    } catch (error) {
      console.log(error)
      return response.badRequest({error: 'File foto tidak valid!'})
    }
  }

  public async hapusLogo({ response }: HttpContextContract) {
    try {
      const pengaturan = await Pengaturan.findOrFail(1)
      await Drive.delete('logoToko/' + pengaturan.logoToko)
      pengaturan.logoToko = null
      await pengaturan.save()

      return response.ok({message: 'Ok'})
    } catch (error) {
      return response.badRequest({error: 'Permintaan tidak valid!'})
    }
  }

  public async pageKadar({ view }: HttpContextContract) {
    // Ini udah make middleware
    
    const kadars = await Kadar
      .query()
      .orderBy('id', 'asc')

    return view.render('pengaturan/atur-kadar', { kadars })
  }


  public async pageTransaksi({ view }: HttpContextContract) {
    // Ini udah make middleware
    const pengaturan  = await Pengaturan.findOrFail(1)

    const fungsi = {
      rupiahParser: rupiahParser
    }

    return view.render('pengaturan/atur-transaksi', { pengaturan, fungsi })
  }

  public async pageBarang({ view }: HttpContextContract) {
    // Ini udah make middleware
    const pengaturan  = await Pengaturan.findOrFail(1)

    return view.render('pengaturan/atur-barang', { pengaturan })
  }

  public async pagePegawai({ view }: HttpContextContract) {
    // Ini udah make middleware
    const pengaturan  = await Pengaturan.findOrFail(1)

    const fungsi = {
      rupiahParser: rupiahParser
    }

    return view.render('pengaturan/atur-pegawai', { pengaturan, fungsi })
  }

  public async getMyToko({ response }: HttpContextContract) {
    try {
      const toko = await Database
        .from('pengaturans')
        .select('nama_toko as namaToko')
        .select('alamat_toko_lengkap as alamatTokoLengkap')
        .where('id', 1)
        .first()

      return { toko }
    } catch (error) {
      return response.badRequest({error: 'Ada error di toko'})
    }
  }

  public async ambilFoto({
    params,
    response
  }: HttpContextContract) {
    try {
      if (params.tipe === 'pegawai') {
        const pegawai = await Pengguna.findOrFail(params.id)
        if (await Drive.exists('profilePict/' + pegawai.foto)) { // kalo ngga di giniin, ntar bakal infinite await kalo file gaada
          const fotoBarang = await Drive.getStream('profilePict/' + pegawai.foto) // ntar diganti jadi dinamis dari db, sama diresize dulu kali hmmm
          response.stream(fotoBarang)
          response.header('content-type', 'image/png')
        } else {
          throw 'kosong 1'
        }
      } else if(params.tipe === 'penjualan'){
        throw 'sementara kosong 2'
      } else if(params.tipe === 'logo-toko'){
        const pengaturan = await Pengaturan.findOrFail(1)
        if (await Drive.exists('logoToko/' + pengaturan.logoToko)) { // kalo ngga di giniin, ntar bakal infinite await kalo file gaada
          const fotoLogo = await Drive.getStream('logoToko/' + pengaturan.logoToko) // ntar diganti jadi dinamis dari db, sama diresize dulu kali hmmm
          response.stream(fotoLogo)
          response.header('content-type', 'image/png')
        } else {
          throw 'kosong 1'
        }
      } else{
        throw 'kosong 2'
      }
      
    } catch (error) {
      return response.notFound('File not found.')
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
