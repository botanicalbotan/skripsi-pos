import Route from '@ioc:Adonis/Core/Route'

/** RUTE TRANSAKSI
 *
 *  Waktu mecah rute jangan lupa tetep masukin kedalem prefix app
 *  Trus kasi middleware yang sama ama yang di main
 */

Route.group(() => {
  Route.group(() => {
    // ======================================================== PENJUALAN ===========================================================
    // sementara gini dulu, ttar dipisah lagi soalnya masih butuh
    /**
     * - phase 1, 2, 3
     * - screen selesai
     * - kemungkinan ga perlu edit
     */

    Route.group(() => {
      Route.get('/form', 'transaksi/PenjualansController.form') // perlu kelompokId terpilih -> kt
      Route.post('/hitung', 'transaksi/PenjualansController.simpanTransaksi')
      Route.get('/pasca', 'transaksi/PenjualansController.pascaTransaksi')  // perlu transaksiId -> tid


      // Route.get('/riwayat', 'transaksi/PenjualansController.listRiwayat')
      // Route.get('/riwayat/:penjualanId', 'transaksi/PenjualansController.viewRiwayat')

      // ini ntar dihapus
      Route.get('/formLama', 'transaksi/PenjualansController.formLama')


    }).prefix('penjualan')
    Route.resource('penjualan', 'transaksi/PenjualansController').only(['index', 'destroy', 'show'])

    // ======================================================== PEMBELIAN ===========================================================
    Route.group(() => {

      // ini ntar dihapus kalo dah kelar
      Route.get('/lama', async ({ view }) => {
        return view.render('transaksi/pembelian/prepare')
      })

      Route.post('/QR', 'transaksi/PembeliansController.indexQR')
      // dilempar balik kalo bukan post
      Route.get('/QR', async ({ response }) => {
        return response.redirect().toPath('/app/transaksi/pembelian/')
      })


      Route.post('/hitungHargaBelakang', 'transaksi/PembeliansController.hitungHargaBelakang') // dari ajax
      Route.get('/hitungHargaBelakang', 'transaksi/PembeliansController.hitungHargaBelakang') // dari ajax, ini ntar dihapus, buat test doang
  
      // MULAI DARI SINI NTAR DIHAPUS
      Route.post('/tesBuang', 'transaksi/PembeliansController.tesBuang')

      Route.get('/transaksi', async ({
        view
      }) => {
        // ini cuma simpel, sekedar buat bener2in UI
        // return view.render('transaksi/pembelian/base-umum')
        return view.render('transaksi/pembelian/base-khusus')
      })

      Route.get('/transaksiumum', async ({
        view
      }) => {
        // ntar apus coy
        return view.render('transaksi/pembelian/base-umum')
      })

      Route.get('/transaksiumumQR', async ({
        view
      }) => {
        // ntar apus coy
        return view.render('transaksi/pembelian/base-umumQRmode')
      })

      // SAMPE SINI DIHAPUS OK

      // Route.get('/riwayat', 'transaksi/PembeliansController.listRiwayat')
      // Route.get('/riwayat/:penjualanId', 'transaksi/PembeliansController.viewRiwayat')
    }).prefix('pembelian')
    Route.resource('pembelian', 'transaksi/PembeliansController').only(['index', 'destroy', 'show'])


    Route.post('/cariPembelianByQR', 'transaksi/PembeliansController.cariQR')


    Route.post('/pembelian/hitungHargaNormal', 'transaksi/PembeliansController.hitungHargaNormal')

  }).prefix('transaksi')

}).prefix('app').middleware(['auth'])
