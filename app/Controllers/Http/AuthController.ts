import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import Hash from '@ioc:Adonis/Core/Hash'

export default class AuthController {
  // ============================== Render view ==================================
  public async pageLogin({ view }: HttpContextContract) {
    return await view.render('zguest/login')
  }

  public async pageTanpaAkun({ view }: HttpContextContract) {
    return await view.render('zguest/tanpa-akun')
  }

  public async pageTanpaAkunPlus({ view }: HttpContextContract) {
    return view.render('zguest/tanpa-akun-plus')
  }

  // =============================== LOGIN & LOGOUT ===============================
  public async login({ request, auth, response, session }: HttpContextContract) {
    const username = request.input('username')
    const password = request.input('password')

    try {
      if (!username || !password) throw 'ngga valid 1'

      const user = await User.query()
        .join('penggunas', 'penggunas.user_id', 'users.id')
        .where('users.username', username)
        .andWhere('penggunas.apakah_pegawai_aktif', true)
        .andWhereNull('users.deleted_at')
        .andWhereNull('penggunas.deleted_at')
        .firstOrFail()

      // Verify password
      if (!(await Hash.verify(user.password, password))) {
        throw 'ngga valid 2'
      }

      // buat session
      await auth.use('web').login(user)

      await user.load('pengguna', (query) => {
        query.preload('jabatan')
      })
      session.put('isPemilik', user.pengguna.jabatan.nama === 'Pemilik')
      session.put(
        'isKepala',
        user.pengguna.jabatan.nama === 'Pemilik' || user.pengguna.jabatan.nama === 'Kepala Toko'
      )

      return response.redirect().toPath('/app')
    } catch (error) {
      session.flash('alertError', 'Username atau password tidak valid. Silahkan coba lagi.')
      return response.redirect().toPath('/login')
    }
  }

  public async logout({ auth, response, session }: HttpContextContract) {
    // logout dari auth
    await auth.use('web').logout()
    session.clear()
    session.flash(
      'alertSukses',
      'Anda berhasil logout. Silahkan login untuk mengakses sistem kembali.'
    )
    return response.redirect('/login')
  }
}
