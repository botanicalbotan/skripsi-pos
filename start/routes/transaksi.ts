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

      // ini ntar dihapus
      Route.get('/formLama', 'transaksi/PenjualansController.formLama')
      Route.get('/final', async ({
        response
      }) => {
        return response.redirect().toPath('/app/transaksi/penjualan')
      })

    }).prefix('penjualan')
    Route.resource('penjualan', 'transaksi/PenjualansController').only(['index', 'destroy'])


    Route.get('/riwayat', 'transaksi/PenjualansController.listRiwayat')
    Route.get('/riwayat/:penjualanId', 'transaksi/PenjualansController.viewRiwayat')

    // ======================================================== PEMBELIAN ===========================================================
    Route.group(() => {
      Route.get('/', async ({
        view
      }) => {
        return view.render('transaksi/pembelian/prepare')
      })

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

      // ini yang propper, sementara ditaro di test dulu
      Route.post('/transaksiv2', 'TestsController.transaksi')


      Route.get('/riwayat', 'transaksi/PenjualansController.listRiwayat')
      Route.get('/riwayat/:penjualanId', 'transaksi/PenjualansController.viewRiwayat')
    }).prefix('pembelian')

    // ini buat sementara, tp yang paling gampang buat sekarang
    Route.post('/pembelian/QR', 'transaksi/PembeliansController.indexQR')
    Route.get('/pembelian/QR', async ({
      response
    }) => {
      return response.redirect().toPath('/app/pembelian/transaksiumum')
    })
    // ini buat nata dulu
    // Route.get('/pembelian/QR', async ({ view })=>{
    //   return view.render('transaksi/pembelian/base-umum-QR')
    // })

    // ini buat sementara, tp yang paling gampang buat sekarang
    // Route.get('/pembelianQR', 'transaksi/PembeliansController.indexQR')
    // Route.post('/pembelianQR', 'transaksi/PembeliansController.pembelianQR')


    Route.post('/cariPembelianByQR', 'transaksi/PembeliansController.cariQR')


    Route.post('/pembelian/hitungHargaNormal', 'transaksi/PembeliansController.hitungHargaNormal')


    // ======================================================== GADAI ===========================================================
    Route.get('/gadai', async ({
      view
    }) => {
      return view.render('transaksi/gadai')
    })
  }).prefix('transaksi')

}).prefix('app')
