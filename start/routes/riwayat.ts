import Route from '@ioc:Adonis/Core/Route'

/** RUTE TRANSAKSI
 *
 *  Waktu mecah rute jangan lupa tetep masukin kedalem prefix app
 *  Trus kasi middleware yang sama ama yang di main
 */

Route.group(() => {
  Route.group(() => {
    // ======================================================== PENJUALAN ===========================================================
    Route.group(() => {

      Route.get('/', 'transaksi/RiwayatJualsController.listTanggal')
      Route.get('/sekarang', 'transaksi/RiwayatJualsController.listRiwayatSekarang')
      Route.get('/:tanggal', 'transaksi/RiwayatJualsController.listRiwayatByTanggal')

    }).prefix('penjualan')

    // ======================================================== PEMBELIAN ===========================================================
    Route.group(() => {

      Route.get('/', 'transaksi/RiwayatBelisController.listTanggal')
      Route.get('/sekarang', 'transaksi/RiwayatBelisController.listRiwayatSekarang')
      Route.get('/:tanggal', 'transaksi/RiwayatBelisController.listRiwayatByTanggal')

    }).prefix('pembelian')


    // ======================================================== GADAI ===========================================================
    // riwayat gadai jadi satu ama transaksi di /app/transaksi/gadai

  }).prefix('riwayat')

}).prefix('app').middleware(['auth'])
