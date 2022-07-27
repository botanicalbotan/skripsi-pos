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
      Route.get('/form', 'transaksi/PenjualansController.form') // perlu kelompokId terpilih -> kt
      Route.post('/hitung', 'transaksi/PenjualansController.simpanTransaksi') // aslinya ini STORE, tp biar seragam ama PB
      Route.get('/pasca', 'transaksi/PenjualansController.pascaTransaksi')  // perlu transaksiId -> tid
    }).prefix('penjualan')
    Route.resource('penjualan', 'transaksi/PenjualansController').only(['index', 'destroy', 'show']) // index ini prepare

    // ======================================================== PEMBELIAN ===========================================================
    Route.group(() => {

      Route.group(() => {
        Route.get('/', 'transaksi/PembelianQRsController.index') // ini formnya QR, perlu 'kode' -> kode, sementara gw matiin dulu
        Route.post('/', 'transaksi/PembelianQRsController.simpanTransaksi') // ini simpen QR, perlu 'kode' -> kode
        Route.post('/cari', 'transaksi/PembelianQRsController.cariQR')
        Route.post('/hitung-harga-belakang', 'transaksi/PembelianQRsController.hitungHargaBelakang') // dari ajax
      }).prefix('qr')

      // Oh, request bikin pembelian jadi Gadai urlnya ngikut gadai!

      // controller pembelian ada 2, biasa ama QR
      // biasa isinya hampir semuanya, kecuali nyari QR sama store QR (termasuk delete juga)
      // QR isinya cuma nyari QR dari ajax, hitung rumus QR, sama store transaksi QR

      // index di pembelian bawah itu form beli biasa

      Route.post('/', 'transaksi/PembeliansController.simpanTransaksi') // aslinya ini STORE, tp biar seragam ama PJ
      Route.get('/pasca', 'transaksi/PembeliansController.pascaTransaksi') // perlu transaksiId -> tid
      Route.post('/hitung-harga-belakang', 'transaksi/PembeliansController.hitungHargaBelakang') // dari ajax
      Route.get('/pengajuan-gadai', 'transaksi/GadaisController.formulirGadai').middleware(['isPemilikWeb']) // perlu transaksiId -> tid

    }).prefix('pembelian')

    Route.resource('pembelian', 'transaksi/PembeliansController').only(['index', 'destroy', 'show']) // index ini form, beda ama PJ


    // ======================================================== GADAI ===========================================================
    
    Route.group(() => {
      // gadai ngga bisa dihapus via delete row ato softdelete, tp tetep ada kolom deleted_at buat jaga2 kalo butuh
      // DESTROY nya gadai ini ngeset status ke dibatalkan

      Route.group(() => {
        Route.get('/refresh', 'transaksi/GadaisController.refreshGadai')
        Route.post('/', 'transaksi/GadaisController.store') // perlu transaksiId -> tid

        Route.resource('/:idGadai/pembayaran', 'transaksi/PembayaranGadaisController').except(['edit', 'update'])
        
      }).middleware(['isPemilikWeb'])

      Route.get('/:id/nik', 'transaksi/GadaisController.getNIK').middleware(['isPemilikApi'])
    }).prefix('gadai')

    Route.resource('gadai', 'transaksi/GadaisController')
      .except(['create', 'store']) // formnya ada di pembelian 'ajukan gadai'
      .middleware({
        index: ['isPemilikWeb'],
        show: ['isPemilikWeb'],
        update: ['isPemilikWeb'],
        edit: ['isPemilikWeb'],
        destroy: ['isPemilikWeb']
      })

     


  }).prefix('transaksi')

}).prefix('app').middleware(['auth'])
