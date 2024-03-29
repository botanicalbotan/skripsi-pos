import Route from '@ioc:Adonis/Core/Route'

/** RUTE TRANSAKSI
 *
 *  Waktu mecah rute jangan lupa tetep masukin kedalem prefix app
 *  Trus kasi middleware yang sama ama yang di main
 */

Route.group(() => {
  Route.group(() => {

    Route.get('/', async ({ }) => {
      return 'ewe'
    })

    Route.get('/sekali', 'EmailTestsController.kirimSekali')
    Route.get('/banyak', 'EmailTestsController.kirimBanyak')
    Route.get('/banyak-pake-pool', 'EmailTestsController.kirimBanyakPakePool')
    

  }).prefix('kirim-email')

}).prefix('app')
