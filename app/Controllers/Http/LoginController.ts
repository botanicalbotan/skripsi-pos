import type {
  HttpContextContract
} from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import Hash from '@ioc:Adonis/Core/Hash'

export default class LoginController {
  // ============================== Render view ==================================
  public async pageLogin({
    view
  }: HttpContextContract) {

    return view.render('login')
  }

  public async pageTanpaAkun({
    view
  }: HttpContextContract) {

    return view.render('tanpa-akun')
  }

  public async pageLupaPassword({
    view
  }: HttpContextContract) {

    return view.render('lupa-password')
  }

  // =============================== Logic ===============================================
  public async login({
    request,
    auth,
    response,
    session
  }: HttpContextContract) {
    const username = request.input('username')
    const password = request.input('password')

    try {
      if (!username || !password) throw 'ngga valid 1'

      const user = await User
        .query()
        .where('username', username)
        .andWhereNull('deleted_at')
        .firstOrFail()

      // Verify password
      if (!(await Hash.verify(user.password, password))) {
        throw 'ngga valid 2'
      }

      // buat session
      await auth.use('web').login(user)
      return response.redirect().toPath('/app')

    } catch (error) {
      session.flash('alertError', 'Username atau password tidak valid. Silahkan coba lagi.')
      return response.redirect().toPath('/login')
    }
  }

  public async logout({
    auth,
    response,
    session
  }: HttpContextContract) {

    // logout dari auth
    await auth.use('web').logout()
    session.flash('alertSukses', 'Anda berhasil logout. Silahkan login untuk mengakses sistem kembali.')
    return response.redirect('/login')
  }
}
