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
    Route.get('/saldo', 'sistem/PengaturansController.pageSaldo').middleware('isPemilikWeb')
    Route.get('/barang', 'sistem/PengaturansController.pageBarang').middleware('isPemilikWeb')
    Route.get('/pegawai', 'sistem/PengaturansController.pagePegawai').middleware('isPemilikWeb')
    

    Route.group(() => {
      Route.get('/:id', 'barang/KadarsController.show')
      Route.get('/:id/edit', 'barang/KadarsController.edit')
      Route.put('/:id', 'barang/KadarsController.update')
    }).prefix('kadar').middleware('isPemilikWeb')
    

    Route.group(() => {
      Route.post('/check-akun', 'sistem/PengaturansController.checkCreditPengubah') // ada built in middleware
      
      Route.group(() => {
        // ngambil data 'general' udah jadi satu ama rute 'my-toko' di cuma-data
        Route.post('/ganti-logo', 'sistem/PengaturansController.gantiLogo')
        Route.delete('/hapus-logo', 'sistem/PengaturansController.hapusLogo')

        Route.put('/ubah-nama-toko', 'sistem/PengaturansController.ubahNamaToko')
        Route.put('/ubah-alamat-toko', 'sistem/PengaturansController.ubahAlamatToko')
        Route.put('/ubah-alamat-singkat-toko', 'sistem/PengaturansController.ubahAlamatSingkatToko')
      }).prefix('general')
      

      Route.group(() => {
        Route.get('/', 'sistem/PengaturansController.getDataTransaksi')
        Route.put('/ubah-izin-cetak-nota', 'sistem/PengaturansController.ubahIzinCetakNota')
        Route.put('/ubah-waktu-max-cetak-nota', 'sistem/PengaturansController.ubahWaktuMaksimalCetakNota')

        Route.put('/ubah-penalti-telat-tt-min', 'sistem/PengaturansController.ubahPenaltiTelatTTMin')
        Route.put('/ubah-penalti-telat-tt-max', 'sistem/PengaturansController.ubahPenaltiTelatTTMax')

        Route.put('/ubah-waktu-max-pengajuan-gadai', 'sistem/PengaturansController.ubahWaktuMaksimalPengajuanGadai')

        Route.put('/ubah-harga-mal', 'sistem/PengaturansController.ubahHargaMal')
      }).prefix('transaksi')
      
      Route.group(() => {
        Route.get('/', 'sistem/PengaturansController.getDataBarang')
        Route.put('/ubah-minimal-stok-kelompok', 'sistem/PengaturansController.ubahMinimalStokKelompok')
        Route.put('/ubah-peringatan-stok-menipis', 'sistem/PengaturansController.ubahPeringatanStokMenipis')
      }).prefix('barang')
      

      Route.group(() => {
        Route.get('/', 'sistem/PengaturansController.getDataPegawai')
        Route.put('/ubah-minimal-gaji-pegawai', 'sistem/PengaturansController.ubahMinimalGajiPegawai')
      }).prefix('pegawai')

    }).prefix('api').middleware('isPemilikApi')

  }).prefix('pengaturan')

}).prefix('app').middleware(['auth'])
