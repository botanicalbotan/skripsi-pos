import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'

// gayakin kepake, kalo ntar nganggur hapus ae

export default class PasaransController {

  public async getAllData ({}: HttpContextContract) {
    let data = await Database
      .from('pasarans')
      .select('hari as pasaran', 'referensi_tanggal as tanggal')

    return data
  }
}
