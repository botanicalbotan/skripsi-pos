import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'

export default class IsPemilikApi {
  public async handle({ response }: HttpContextContract, next: () => Promise<void>) {

    // beberapa url udah ready dikasi ginian, cek yang ada komen PAKEMIDDLEWARE
    let placeholderUser = 1  // ini harusnya ngambil dari AUTH, ID_USER bukan ID_Pengguna

    try {
      const userPengakses = await User.findOrFail(placeholderUser)
      await userPengakses.load('pengguna', (query) => {
        query.preload('jabatan')
      })

      if(userPengakses.pengguna.jabatan.nama !== 'Pemilik'){
        throw 'gaada izin'
      }
    } catch (error) {
      return response.unauthorized({error: 'Anda tidak memiliki hak untuk melakukan perubahan!'})
    }

    // code for middleware goes here. ABOVE THE NEXT CALL
    await next()
  }
}
