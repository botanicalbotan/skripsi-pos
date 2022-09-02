import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'

export default class IsKepalaApi {
  public async handle({ response, auth }: HttpContextContract, next: () => Promise<void>) {
    // beberapa url udah ready dikasi ginian, cek yang ada komen PAKEMIDDLEWARE

    try {
      if(!auth.user) throw 'auth ngga valid'

      const userPengakses = await User.findOrFail(auth.user.id)
      await userPengakses.load('pengguna', (query) => {
        query.preload('jabatan')
      })

      if(userPengakses.pengguna.jabatan.nama !== 'Pemilik' && userPengakses.pengguna.jabatan.nama !== 'Kepala Toko'){
        throw 'gaada izin'
      }
    } catch (error) {
      return response.unauthorized({error: 'Anda tidak memiliki hak untuk melakukan perubahan!'})
    }

    // code for middleware goes here. ABOVE THE NEXT CALL
    await next()
  }
}
