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
import './routes/test-doang'
import './routes/email-test'
import './routes/pengaturan'

Route.get('/', async ({
  view
}) => {
  return view.render('welcome')
})

Route.get('/login', async ({}) => {
  return 'Ini ntar jadi rute buat login'
})

Route.group(() => {
  // ================================ START APPS ROUTE ===============================================

  Route.get('/', async ({
    view
  }) => {
    return view.render('index')
  })

  // ================================ PEMBUKUAN KAS ===============================================
  Route.group(() => {
    Route.resource('rekapHarian', 'kas/RekapHariansController').only(['index', 'show'])

    Route.get('/testing/bikinBanyak', 'kas/KasController.buatBanyak') // WARNING: INI BUAT TEST DOANG, NTAR DIHAPUSSS
  }).prefix('/kas')
  Route.resource('/kas', 'kas/KasController')

  // Rute buat ngatur barang
  Route.group(() => {
    // ================================ KELOMPOK ===============================================
    Route.get('/', 'barang/KelompoksController.index')
    Route.put('/kelompok/:id/ubahStok', 'barang/KelompoksController.ubahStok')

    Route.post('/kelompok/cekKelompokDuplikat', 'barang/KelompoksController.cekKelompokDuplikat')
    Route.post('/kelompok/cekKelompokDuplikatEdit', 'barang/KelompoksController.cekKelompokDuplikatEdit')
    Route.resource('kelompok', 'barang/KelompoksController').except(['index'])

    // ================================ MODEL ===============================================
    Route.resource('model', 'barang/ModelsController')

    // ================================ KERUSAKAN ===============================================
    Route.resource('kerusakan', 'barang/KerusakansController')

    // ================================ KODE PRODUKSI ===============================================
    Route.post('/kodepro/cekKodeDuplikat', 'barang/KodeProduksisController.cekKode')
    Route.post('/kodepro/cekKodeDuplikatEdit', 'barang/KodeProduksisController.cekKodeEdit')
    Route.resource('kodepro', 'barang/KodeProduksisController')

    // ================================ PENAMBAHAN STOK ===============================================
    Route.resource('penambahan', 'barang/PenambahanStoksController').except(['edit', 'update', 'destroy'])
    Route.group(() => {}).prefix('penambahan')


  }).prefix('/barang')

  // ================================ Laporan ===============================================
  Route.group(() => {
    Route.get('/', 'laporan/LaporansController.index')
    Route.get('/generate', 'laporan/LaporansController.generateLaporan')
    
  }).prefix('laporan')

  // ================================ PEGAWAI ===============================================
  Route.group(() => {
    Route.group(() => {
      Route.get('/refresh', 'akun/PenggajianPegawaisController.refreshPenggajian')
      Route.post('/:id/pembayaran', 'akun/PenggajianPegawaisController.pembayaranTagihan')
      Route.post('/:id/batal', 'akun/PenggajianPegawaisController.pembatalanPembayaran')
    }).prefix('penggajian')

    Route.resource('/penggajian', 'akun/PenggajianPegawaisController').only(['index', 'show', 'destroy'])

    Route.put('/:id/status', 'akun/PegawaisController.ubahStatus')
    Route.get('/:id/akun', 'akun/PegawaisController.showDataAkun')
    Route.post('/:id/akun/check', 'akun/PegawaisController.checkCredit')
    Route.put('/:id/akun/ubahUsername', 'akun/PegawaisController.ubahUsername')
    Route.put('/:id/akun/ubahPassword', 'akun/PegawaisController.ubahPassword')
    Route.put('/:id/akun/ubahEmail', 'akun/PegawaisController.ubahEmail')
    Route.post('/:id/akun/verivyEmail', 'akun/PegawaisController.verivyEmail')
    // Route.get('/:id/akun', 'akun/PegawaisController.dataAkun')
  }).prefix('/pegawai')
  Route.resource('/pegawai', 'akun/PegawaisController')

  // ================================ NOTIFIKASI ===============================================
  Route.group(() => {
    Route.post('setLihatNotif', 'sistem/NotifikasisController.setLihatNotif')
    Route.get('notifTerbaru', 'sistem/NotifikasisController.notifTerbaru')
    Route.get('jumlahNotifBaru', 'sistem/NotifikasisController.jumlahNotifBaru')
  }).prefix('/notifikasi')
  Route.resource('/notifikasi', 'sistem/NotifikasisController').only(['index', 'show'])


  // ================================ CUMA DATA / API ===============================================
  // isinya data2 api, tp yang secondary. yang krusial tetep ada di masing2 grup
  Route.group(() => {
    // testing, ini ntar dihapus
    Route.get('/tesAngkaTerbilang', 'transaksi/PenjualansController.testAngkaTerbilang')

    // ini udah bisa
    Route.get('/foto/:tipe/:id', 'sistem/PengaturansController.ambilFoto')


    // general
    Route.get('/myProfile', 'akun/PegawaisController.getMyProfile')
    Route.get('/myToko', 'sistem/PengaturansController.getMyToko')
    Route.get('/kadarBentuk', 'barang/KelompoksController.getKadarBentuk')
    Route.get('/kadarSimpel', 'transaksi/RiwayatJualsController.getKadarMinimal')
    Route.get('/getKadarById', 'barang/KadarsController.getKadarById')
    Route.get('/kodeproById', 'barang/KodeProduksisController.getKodeproById')
    Route.get('/kodeprosByKadarId', 'barang/KodeProduksisController.getKodeprosByKadarId')

    // pegawai - pegawai
    Route.get('/myProfiles', 'akun/PegawaisController.getMyProfile')

    // view kelompok
    Route.get('/peringkatKelompok', 'barang/KelompoksController.peringkatKelompokAll')
    Route.get('/peringkatKelompok/:id', 'barang/KelompoksController.peringkatKelompok')
    Route.get('/sebaranData/:id', 'barang/KelompoksController.sebaranData')

    // restok
    Route.get('/kelompokDenganInput', 'barang/PenambahanStoksController.getKelompokDenganInput')

    // transaksi
    Route.get('/modelByBentuk', 'barang/ModelsController.getModelByBentuk')
    Route.get('/kerusakanByBentuk', 'barang/KerusakansController.getKerusakanByBentuk')
    Route.get('/cetakNota', 'transaksi/PenjualansController.cetakNota')


    // transaksi - penjualan
    Route.get('/maxCetakPenjualan', 'transaksi/PenjualansController.maxCetakPenjualan')

    // penggajian pegawai
    Route.get('/jumlahBelumDigaji', 'akun/PenggajianPegawaisController.getJumlahBelumDigaji')

    // pasaran
    Route.get('/semuaPasaran', 'sistem/PasaransController.getAllData')

  }).prefix('/cumaData')

  Route.post('/buang', async ({
    request
  }) => {
    return request.all()
  })
}).prefix('/app')


Route.get('/landing', async ({
  view
}) => {
  return view.render('landing_page')
})
