import Route from '@ioc:Adonis/Core/Route'

/** RUTE TRANSAKSI
 *
 *  Waktu mecah rute jangan lupa tetep masukin kedalem prefix app
 *  Trus kasi middleware yang sama ama yang di main
 */

Route.group(() => {
  Route.group(() => {
    Route.group(() => {
      Route.get('/', 'sistem/PengaturansController.pageGeneral')
      Route.get('/general', 'sistem/PengaturansController.pageGeneral')
      Route.get('/kadar', 'sistem/PengaturansController.pageKadar')
      Route.get('/transaksi', 'sistem/PengaturansController.pageTransaksi')
      Route.get('/saldo', 'sistem/PengaturansController.pageSaldo')
      Route.get('/barang', 'sistem/PengaturansController.pageBarang')
      Route.get('/pegawai', 'sistem/PengaturansController.pagePegawai')

      Route.group(() => {
        Route.get('/:id', 'barang/KadarsController.show')
  
        Route.group(() => {
          Route.get('/:id/edit', 'barang/KadarsController.edit')
          Route.put('/:id', 'barang/KadarsController.update')
        }).middleware(['isPemilikWeb'])
        
      }).prefix('kadar')

      Route.group(() => {
        Route.get('pengubahan/:id', 'sistem/PengaturansController.pageViewUbahSaldo')
        Route.get('pengubahan/', 'sistem/PengaturansController.pageListUbahSaldo')
      }).prefix('saldo')

    }).middleware('isKepalaWeb')
    

    // ================================= API Khusus Pemilik ===========================================
    Route.group(() => {
      Route.post('/check-akun', 'sistem/PengaturansController.checkCreditPengubah').middleware('isPemilikApi') // ada built in middleware
      Route.post('/check-akun-khusus', 'sistem/PengaturansController.checkCreditPengubahKhusus').middleware('isKepalaApi')
      

      Route.group(() => {
        // ngambil data 'general' udah jadi satu ama rute 'my-toko' di cuma-data
        Route.post('/ganti-logo', 'sistem/PengaturansController.gantiLogo')
        Route.delete('/hapus-logo', 'sistem/PengaturansController.hapusLogo')

        Route.put('/ubah-nama-toko', 'sistem/PengaturansController.ubahNamaToko')
        Route.put('/ubah-alamat-toko', 'sistem/PengaturansController.ubahAlamatToko')
        Route.put('/ubah-alamat-singkat-toko', 'sistem/PengaturansController.ubahAlamatSingkatToko')

        Route.put('/ubah-hari-pasaran', 'sistem/PengaturansController.ubahHariPasaran')
      }).prefix('general').middleware('isPemilikApi')

      Route.group(() => {
        Route.get('/', 'sistem/PengaturansController.getDataTransaksi')
        Route.put('/ubah-izin-cetak-nota', 'sistem/PengaturansController.ubahIzinCetakNota')
        Route.put('/ubah-waktu-max-cetak-nota', 'sistem/PengaturansController.ubahWaktuMaksimalCetakNota')

        Route.put('/ubah-penalti-telat-tt-min', 'sistem/PengaturansController.ubahPenaltiTelatTTMin')
        Route.put('/ubah-penalti-telat-tt-max', 'sistem/PengaturansController.ubahPenaltiTelatTTMax')

        Route.put('/ubah-waktu-max-pengajuan-gadai', 'sistem/PengaturansController.ubahWaktuMaksimalPengajuanGadai')

        Route.put('/ubah-harga-mal', 'sistem/PengaturansController.ubahHargaMal')
      }).prefix('transaksi').middleware('isPemilikApi')

      Route.group(() => {
        Route.put('/banding-saldo', 'sistem/PengaturansController.bandingSaldoToko').middleware('isKepalaApi')
        Route.put('/ubah-saldo', 'sistem/PengaturansController.ubahSaldoToko').middleware('isPemilikApi')
      }).prefix('saldo')
      
      Route.group(() => {
        Route.get('/', 'sistem/PengaturansController.getDataBarang')
        Route.put('/ubah-minimal-stok-kelompok', 'sistem/PengaturansController.ubahMinimalStokKelompok')
        Route.put('/ubah-peringatan-stok-menipis', 'sistem/PengaturansController.ubahPeringatanStokMenipis')
      }).prefix('barang').middleware('isPemilikApi')
      

      Route.group(() => {
        Route.get('/', 'sistem/PengaturansController.getDataPegawai')
        Route.put('/ubah-minimal-gaji-pegawai', 'sistem/PengaturansController.ubahMinimalGajiPegawai')
      }).prefix('pegawai')

    }).prefix('api')

  }).prefix('pengaturan')

}).prefix('app').middleware(['auth'])
