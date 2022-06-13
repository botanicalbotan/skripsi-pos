import Route from '@ioc:Adonis/Core/Route'

/** RUTE TRANSAKSI
 *
 *  Waktu mecah rute jangan lupa tetep masukin kedalem prefix app
 *  Trus kasi middleware yang sama ama yang di main
 */

Route.group(() => {
  Route.group(() => {
    Route.get('/', 'sistem/PengaturansController.pageGeneral').middleware('isPemilikWeb')
    Route.get('/general', 'sistem/PengaturansController.pageGeneral').middleware('isPemilikWeb')
    Route.get('/kadar', 'sistem/PengaturansController.pageKadar').middleware('isPemilikWeb')
    Route.get('/transaksi', 'sistem/PengaturansController.pageTransaksi').middleware('isPemilikWeb')
    Route.get('/barang', 'sistem/PengaturansController.pageBarang').middleware('isPemilikWeb')
    Route.get('/pegawai', 'sistem/PengaturansController.pagePegawai').middleware('isPemilikWeb')
    

    Route.group(() => {
      Route.get('/:id', 'barang/KadarsController.show')
      Route.get('/:id/edit', 'barang/KadarsController.edit')
      Route.put('/:id', 'barang/KadarsController.update')
    }).prefix('kadar').middleware('isPemilikWeb')
    

    Route.group(() => {
      Route.post('/gantiLogo', 'sistem/PengaturansController.gantiLogo')
      Route.delete('/hapusLogo', 'sistem/PengaturansController.hapusLogo')


    }).prefix('api').middleware('isPemilikApi')

  }).prefix('pengaturan')

}).prefix('app')
