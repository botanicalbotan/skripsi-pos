/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer''
|
*/

import Route from '@ioc:Adonis/Core/Route'
import './routes/transaksi'
import './routes/riwayat'
import './routes/email-test'
import './routes/pengaturan'
import './routes/guest'


 // ================================ START APPS ROUTE ===============================================

 // landing page ngga kena middleware apa2, bisa diakses siapa aja
Route.get('/', async ({
  view
}) => {
  return view.render('landing')
})

// ini buat testing, ntar dihapus
Route.post('/buang', async ({
  request
}) => {
  return request.all()
})

Route.group(() => {
  Route.get('/', 'DashboardController.index')

  // ================================ PEMBUKUAN KAS ===============================================
  Route.group(() => {
    Route.group(() => {
      // Route.resource('rekap-harian', 'kas/RekapHariansController').only(['index', 'show'])
      Route.get('/rekap-harian/:tanggal', 'kas/RekapHariansController.show')
      Route.get('/rekap-harian', 'kas/RekapHariansController.index')
      
  
      Route.get('/testing/bikin-banyak', 'kas/KasController.buatBanyak') // WARNING: INI BUAT TEST DOANG, NTAR DIHAPUSSS
    }).prefix('/kas')

    Route.resource('/kas', 'kas/KasController')
  }).middleware(['isKepalaWeb'])

  // Rute buat ngatur barang
  Route.group(() => {
    // ================================ KELOMPOK ===============================================
    Route.get('/', 'barang/KelompoksController.index')
    Route.put('/kelompok/:id/ubah-stok', 'barang/KelompoksController.ubahStok').middleware(['isKepalaWeb'])

    Route.post('/kelompok/cek-kelompok-duplikat', 'barang/KelompoksController.cekKelompokDuplikat').middleware(['isPemilikWeb'])
    Route.post('/kelompok/cek-kelompok-duplikat-edit', 'barang/KelompoksController.cekKelompokDuplikatEdit').middleware(['isPemilikWeb'])
    Route.resource('kelompok', 'barang/KelompoksController').except(['index']).middleware({
      'create': ['isPemilikWeb'],
      'store': ['isPemilikWeb'],
      'edit': ['isPemilikWeb'],
      'update': ['isPemilikWeb'],
      'destroy': ['isPemilikWeb'],
    })

    // ================================ MODEL ===============================================
    Route.resource('model', 'barang/ModelsController').middleware({
      'create': ['isPemilikWeb'],
      'store': ['isPemilikWeb'],
      'edit': ['isPemilikWeb'],
      'update': ['isPemilikWeb'],
      'destroy': ['isPemilikWeb'],
    })

    // ================================ KERUSAKAN ===============================================
    Route.resource('kerusakan', 'barang/KerusakansController').middleware({
      'create': ['isPemilikWeb'],
      'store': ['isPemilikWeb'],
      'edit': ['isPemilikWeb'],
      'update': ['isPemilikWeb'],
      'destroy': ['isPemilikWeb'],
    })

    // ================================ KODE PRODUKSI ===============================================
    Route.post('/kodepro/cek-kode-duplikat', 'barang/KodeProduksisController.cekKode').middleware(['isKepalaWeb'])
    Route.post('/kodepro/cek-kode-duplikat-edit', 'barang/KodeProduksisController.cekKodeEdit').middleware(['isKepalaWeb'])
    Route.resource('kodepro', 'barang/KodeProduksisController').middleware({
      'create': ['isPemilikWeb'],
      'store': ['isPemilikWeb'],
      'edit': ['isPemilikWeb'],
      'update': ['isPemilikWeb'],
      'destroy': ['isPemilikWeb'],
    })

    // ================================ PENAMBAHAN STOK ===============================================
    Route.resource('penambahan', 'barang/PenambahanStoksController').except(['edit', 'update', 'destroy']).middleware({
      'index': ['isKepalaWeb'],
      'show': ['isKepalaWeb'],
      'create': ['isKepalaWeb'],
      'store': ['isKepalaWeb']
    })

  }).prefix('/barang')

  // ================================ Laporan ===============================================
  Route.group(() => {
    Route.get('/', 'laporan/LaporansController.index').middleware(['isKepalaWeb'])
    Route.get('/generate', 'laporan/LaporansController.generateLaporan').middleware(['isKepalaApi'])

  }).prefix('laporan')

  // ================================ PEGAWAI ===============================================
  Route.group(() => {
    Route.group(() => {
      Route.get('/refresh', 'akun/PenggajianPegawaisController.refreshPenggajian').middleware(['isKepalaApi'])
      Route.post('/:id/pembayaran', 'akun/PenggajianPegawaisController.pembayaranTagihan').middleware(['isKepalaApi'])
      Route.post('/:id/batal', 'akun/PenggajianPegawaisController.pembatalanPembayaran').middleware(['isPemilikApi'])
    }).prefix('penggajian')

    Route.resource('/penggajian', 'akun/PenggajianPegawaisController').only(['index', 'show', 'destroy'])
    .middleware({
      'index': ['isKepalaWeb'],
      'show': ['isKepalaWeb'],
      'destroy': ['isPemilikWeb']
    })

    Route.get('/:id/akun', 'akun/PegawaisController.showDataAkun').middleware(['izinEditPegawaiWeb'])
    Route.post('/:id/akun/check', 'akun/PegawaisController.checkCreditUbahAkun') // ada built in middleware
    Route.put('/:id/akun/ubah-username', 'akun/PegawaisController.ubahUsername') // ada built in middleware
    Route.put('/:id/akun/ubah-password', 'akun/PegawaisController.ubahPassword') // ada built in middleware
    Route.put('/:id/akun/ubah-email', 'akun/PegawaisController.ubahEmail')
    Route.post('/:id/akun/verivy-email', 'akun/PegawaisController.verivyEmail')
  }).prefix('/pegawai')

  Route.resource('/pegawai', 'akun/PegawaisController').middleware({
    'create': ['isPemilikWeb'],
    'store': ['isPemilikWeb'],
    'edit': ['isPemilikWeb'],
    'update': ['isPemilikWeb'],
    'destroy': ['isPemilikWeb']
  })

  // ================================ NOTIFIKASI ===============================================
  Route.group(() => {
    Route.post('set-lihat-notif', 'sistem/NotifikasisController.setLihatNotif')
    Route.get('notif-terbaru', 'sistem/NotifikasisController.notifTerbaru')
    Route.get('jumlah-notif-baru', 'sistem/NotifikasisController.jumlahNotifBaru')
  }).prefix('/notifikasi')
  Route.resource('/notifikasi', 'sistem/NotifikasisController').only(['index', 'show'])


  // ================================ CUMA DATA / API ===============================================
  // isinya data2 api, tp yang secondary. yang krusial tetep ada di masing2 grup
  Route.group(() => {
    // ini udah bisa
    Route.get('/foto/:tipe/:id', 'sistem/PengaturansController.ambilFoto')

    // ini udah bisa, tp versi sus
    Route.get('/foto-secret/:tipe/:id', 'sistem/PengaturansController.ambilFotoSecret').middleware(['isKepalaApi'])

    // dashboard
    Route.get('/pjpb-seminggu-ini', 'DashboardController.getDataPjPbSeminggu')
    Route.get('/kelmodkod-laku', 'DashboardController.getDataKelompokModelKodeproLaku')
    Route.get('/pencatat-pjpb', 'DashboardController.getDataPencatatTerbanyak')
    Route.get('/sebaran-pb', 'DashboardController.getSebaranPb')

    // general
    Route.get('/my-profile', 'akun/PegawaisController.getMyProfile')
    Route.get('/my-toko', 'sistem/PengaturansController.getMyToko')
    Route.get('/kadar-bentuk', 'barang/KelompoksController.getKadarBentuk')
    Route.get('/kadar-simpel', 'barang/KadarsController.getKadarMinimal')
    Route.get('/get-kadar-by-id', 'barang/KadarsController.getKadarById')
    Route.get('/kodepro-by-id', 'barang/KodeProduksisController.getKodeproById')
    Route.get('/kodepros-by-id', 'barang/KodeProduksisController.getKodeprosByKadarId')

    // view kelompok
    Route.get('/peringkat-kelompok', 'barang/KelompoksController.peringkatKelompokAll')
    Route.get('/peringkat-kelompok/:id', 'barang/KelompoksController.peringkatKelompok')
    Route.get('/sebaran-data/:id', 'barang/KelompoksController.sebaranData')

    // restok
    Route.get('/kelompok-dengan-input', 'barang/PenambahanStoksController.getKelompokDenganInput')

    // transaksi
    Route.get('/model-by-bentuk', 'barang/ModelsController.getModelByBentuk')
    Route.get('/kerusakan-by-bentuk', 'barang/KerusakansController.getKerusakanByBentuk')
    Route.get('/cetak-nota', 'transaksi/PenjualansController.cetakNota')


    // transaksi - penjualan
    Route.get('/max-cetak-penjualan', 'transaksi/PenjualansController.maxCetakPenjualan')

    // transaksi - pembelian
    Route.get('/max-pengajuan-gadai', 'transaksi/PembeliansController.maxPengajuanGadai')

    // penggajian pegawai
    Route.get('/jumlah-belum-digaji', 'akun/PenggajianPegawaisController.getJumlahBelumDigaji')

    // pasaran
    Route.get('/semua-pasaran', 'sistem/PasaransController.getAllData')

  }).prefix('/cuma-data')
  
}).prefix('/app').middleware(['auth'])
