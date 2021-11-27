import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class KerusakansController {
  public async index ({ view }: HttpContextContract) {
    return view.render('barang/kerusakan/list-kerusakan')
  }

  public async create ({ view }: HttpContextContract) {
    return view.render('barang/kerusakan/form-kerusakan')
  }

  public async store ({}: HttpContextContract) {
  }

  public async show ({ view }: HttpContextContract) {
    return view.render('barang/kerusakan/view-kerusakan')
  }

  public async edit ({ view }: HttpContextContract) {
    return view.render('barang/kerusakan/form-kerusakan')
  }

  public async update ({}: HttpContextContract) {
  }

  public async destroy ({}: HttpContextContract) {
  }
}
