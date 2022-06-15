import type {
  HttpContextContract
} from '@ioc:Adonis/Core/HttpContext'
import Pengguna from 'App/Models/akun/Pengguna'
import User from 'App/Models/User'

export default class IzinEditPegawaiWeb {
  public async handle({
    params,
    session,
    response,
    auth
  }: HttpContextContract, next: () => Promise < void > ) {
    // beberapa url udah ready dikasi ginian, cek yang ada komen PAKEMIDDLEWARE

    try {
      if(!auth.user) throw 'ga valid'

      const pegawai = await Pengguna.findOrFail(params.id) // ID_PENGGUNA bukan ID_USER
      await pegawai.load('jabatan')

      const userPengakses = await User.findOrFail(auth.user.id)
      await userPengakses.load('pengguna', (query) => {
        query.preload('jabatan')
      })

      if (userPengakses.pengguna.id !== pegawai.id && userPengakses.pengguna.jabatan.nama !== 'Pemilik') { // bisa dijadiin middleware
        session.flash('alertError', 'Anda tidak memiliki hak untuk mengakses laman tersebut!')
        return response.redirect().toPath('/app/pegawai/')
      }

    } catch (error) {
      session.flash('alertError', 'Permintaan anda tidak valid!')
      return response.redirect().toPath('/app/pegawai/')
    }

    // code for middleware goes here. ABOVE THE NEXT CALL
    await next()
  }
}
