import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class ModelsController {
  public async index ({ view }: HttpContextContract) {
    return view.render('barang/model/list-model')
  }

  public async create ({ view }: HttpContextContract) {
    return view.render('barang/model/form-model')
  }

  public async store ({}: HttpContextContract) {
  }

  public async show ({ view }: HttpContextContract) {
    return view.render('barang/model/view-model')
  }

  public async edit ({ view }: HttpContextContract) {
    // ambil data dari server, trus kirim ke view, parameter bukan body
    return view.render('barang/model/form-model')
  }

  public async update ({}: HttpContextContract) {
  }

  public async destroy ({}: HttpContextContract) {
  }
}
