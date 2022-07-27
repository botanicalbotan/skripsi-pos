import Route from '@ioc:Adonis/Core/Route'

/** RUTE GUEST
 *
 *  Waktu mecah rute jangan lupa tetep masukin kedalem prefix app
 *  Trus kasi middleware yang sama ama yang di main
 */


// ================================ LOGIN ROUTE ===============================================
Route.group(() => {
  // loginnya disini, logoutnya di auth
  Route.get('/login', 'LoginController.pageLogin')
  Route.post('/login', 'LoginController.login')

  Route.get('/tanpa-akun', 'LoginController.pageTanpaAkun')
  Route.get('/tanpa-akun-plus', 'LoginController.pageTanpaAkunPlus') // ada navbar buat tes, ntar dihapus

  Route.group(() => {
    Route.get('/', 'akun/PasswordResetTokensController.index')
    Route.post('/cari', 'akun/PasswordResetTokensController.cariKirim') // butuh username user

    Route.get('/next', 'akun/PasswordResetTokensController.indexNext') // butuh token
    Route.post('/next', 'akun/PasswordResetTokensController.simpanUbahPass') // butuh token ama password baru


  }).prefix('lupa-password')

}).middleware(['guestOnly'])

// ini buat logout khusus harus udah login dulu walopun di 'GUEST'
Route.post('/logout', 'LoginController.logout').middleware(['auth'])
