import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Jabatan from 'App/Models/akun/Jabatan'
import Pengguna from 'App/Models/akun/Pengguna'
import User from 'App/Models/User'

// ini ntar ga dipake, pindah ke pegawai

export default class PenggunasController {
  public async index ({}: HttpContextContract) {
    return 'ada keluar'
  }

  public async create ({}: HttpContextContract) {
  }

  public async store ({}: HttpContextContract) {
  }

  public async show ({}: HttpContextContract) {
  }

  public async edit ({}: HttpContextContract) {
  }

  public async update ({}: HttpContextContract) {
  }

  public async destroy ({}: HttpContextContract) {
  }

  public async testSeputarAkun ({}: HttpContextContract) {
    // Basic join relationship pake preload
    // const pengguna = await Pengguna.query().preload('user').preload('jabatan')
    // return pengguna

    // cuma nampilin user aktif aja
    const penggunaAktif = await Pengguna
      .query()
      .where('apakah_karyawan_aktif', true)
      .preload('user')
      .preload('jabatan')

    return penggunaAktif
  }
}
