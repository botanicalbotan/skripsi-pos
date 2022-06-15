import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'

export default class IsPemilikWeb {
  public async handle({ response, session, auth }: HttpContextContract, next: () => Promise<void>) {
    // beberapa url udah ready dikasi ginian, cek yang ada komen PAKEMIDDLEWARE

    try {
      if(!auth.user) throw 'auth ngga valid'

      const userPengakses = await User.findOrFail(auth.user.id)
      await userPengakses.load('pengguna', (query) => {
        query.preload('jabatan')
      })

      if(userPengakses.pengguna.jabatan.nama !== 'Pemilik'){
        throw 'gaada izin'
      }
    } catch (error) {
      session.flash('alertError', 'Anda tidak memiliki izin untuk mengakses laman tersebut!')
      return response.redirect().toPath('/app/')
    }

    // code for middleware goes here. ABOVE THE NEXT CALL
    await next()
  }
}
