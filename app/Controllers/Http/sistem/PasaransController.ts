import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'

// gayakin kepake, kalo ntar nganggur hapus ae

export default class PasaransController {
  public async index ({}: HttpContextContract) {
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

  public async getAllData ({}: HttpContextContract) {
    let data = await Database
      .from('pasarans')
      .select('hari as pasaran', 'referensi_tanggal as tanggal')

    return data
  }
}
