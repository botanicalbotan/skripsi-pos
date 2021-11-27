import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import Pengguna from 'App/Models/akun/Pengguna'
import { DateTime, Settings } from 'luxon'

export default class PegawaisController {
  public async index ({ view, request }: HttpContextContract) {
    const opsiOrder = [
      'penggunas.nama',
      'penggunas.gender',
      'jabatans.nama',
      'penggunas.apakah_pegawai_aktif',
      'penggunas.tanggal_gajian',
      'penggunas.gaji_bulanan',
    ]
    const page = request.input('page', 1)
    const order = request.input('ob', 0)
    const cari = request.input('cari', '')
    const sanitizedOrder = order >= opsiOrder.length || order < 0 ? 0 : order
    const limit = 10

    const pegawais = await Database.from('penggunas')
      .join('jabatans','penggunas.jabatan_id', '=', 'jabatans.id')
      .select('penggunas.id as id', 'penggunas.nama as nama', 'penggunas.gender as gender', 'jabatans.nama as jabatan', 'penggunas.apakah_pegawai_aktif as apakahAktif', 'penggunas.tanggal_gajian as tanggalGajian', 'penggunas.gaji_bulanan as gajiBulanan', 'penggunas.foto as foto')
      .if(cari !== '', (query) => {
        query.where('penggunas.nama', 'like', `%${cari}%`)
      })
      .orderBy(opsiOrder[sanitizedOrder], 'asc')
      .paginate(page, limit)

    pegawais.baseUrl('/app/pegawai')

    pegawais.queryString({ ob: sanitizedOrder })
    if (cari !== '') {
      pegawais.queryString({ ob: sanitizedOrder, cari: cari })
    }

    // kalau mau mulai dari sini bisa dibikin fungsi sendiri
    // input bisa pagination object + panjang page yang mau di display
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
      firstPage: firstPage,
      lastPage: lastPage,
      firstDataInPage: 1 + ((pegawais.currentPage - 1) * limit),
      lastDataInPage: (tempLastData >= pegawais.total)? pegawais.total: tempLastData
    }

    return view.render('pegawai/base', { pegawais, tambahan })
  }

  public async create ({ view }: HttpContextContract) {
    return view.render('pegawai/form-pegawai')
  }

  public async store ({}: HttpContextContract) {
  }

  public async show ({ view, params, response }: HttpContextContract) {
    try {
      const pegawai = await Pengguna.findOrFail(params.id)
      await pegawai.load('user')
      await pegawai.load('jabatan')

      Settings.defaultZone = 'Asia/Jakarta'
      let tambahan = {
        tanggalTerakhirDirubah: pegawai.createdAt.setLocale('id-ID').toLocaleString()
      }

      // return pengguna
      return view.render('pegawai/detail', {
        pegawai,
        tambahan
      })
    } catch (error) {
      // sebener e kalo bisa raise error flag dulu
      response.redirect().toPath('/app/pegawai')
    }
    
  }

  public async edit ({}: HttpContextContract) {
  }

  public async update ({}: HttpContextContract) {
  }

  public async destroy ({}: HttpContextContract) {
  }
}
