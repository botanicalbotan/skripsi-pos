import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Kadar from 'App/Models/barang/Kadar'
import Database from '@ioc:Adonis/Lucid/Database'

export default class KadarsController {
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

  // =============================================================================================

  public async getKadarById ({ request, response }: HttpContextContract) {
    let kadarId = request.input('id')

    if (kadarId === null || typeof kadarId === 'undefined') {
      return response.badRequest('ID Kadar tidak boleh kosong')
    }

    let cekKadar = await Database
      .from('kadars')
      .select('*')
      .where('id', kadarId)
      .firstOrFail()
      .catch(() => {
        return response.notFound('Kadar tidak ditemukan')
      })

    return cekKadar
  }




}
