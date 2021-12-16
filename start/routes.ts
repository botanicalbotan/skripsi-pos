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

Route.get('/', async ({ view }) => {
  return view.render('welcome')
})

Route.get('/login', async ({ }) => {
  return 'Ini ntar jadi rute buat login'
})

Route.group(() => {
  Route.get('/', async ({ view }) => {
    return view.render('index')
  })

  Route.get('/pengaturan', async ({ view }) => {
    return view.render('pengaturan/base')
  })

  Route.group(() => {
    // sementara buat transaksi

    Route.get('/transaksi', async ({ view }) => {
      return view.render('transaksi/penjualan/phase2')
    })

    // aslinya ntar post
    Route.get('/selesai', async ({ view }) => {
      return view.render('transaksi/penjualan/phase3')
    })
  }).prefix('penjualan')

  Route.group(() => {
    Route.get('/', async ({ view }) => {
      return view.render('transaksi/pembelian/prepare')
    })

    Route.get('/transaksi', async ({ view }) => {
      // ini cuma simpel, sekedar buat bener2in UI
      // return view.render('transaksi/pembelian/base-umum')
      return view.render('transaksi/pembelian/base-khusus')
    })

    Route.get('/transaksiumum', async ({ view }) => {
      // ntar apus coy
      return view.render('transaksi/pembelian/base-umum')
    })

    Route.get('/transaksiumumQR', async ({ view }) => {
      // ntar apus coy
      return view.render('transaksi/pembelian/base-umumQRmode')
    })



    // ini yang propper, sementara ditaro di test dulu
    Route.post('/transaksiv2', 'TestsController.transaksi')
    
  }).prefix('pembelian')

  Route.group(() => {
    // ntar pindah ke constructor
    Route.get('/penjualan', async ({ view }) => {
      return view.render('riwayat/penjualan/list-riwayat-penjualan')
    })
  }).prefix('riwayat')


  Route.group(() => {
    // sementara gini dulu, ttar dipisah lagi soalnya masih butuh
    /**
     * - phase 1, 2, 3
     * - screen selesai
     * - kemungkinan ga perlu edit
     */
    Route.get('/penjualan/next', 'transaksi/PenjualansController.phase2')
    Route.post('/penjualan/final', 'transaksi/PenjualansController.phase3')

    // Route.get('/penjualan/next', async ({ response }) => {
    //   return response.redirect().toPath('/app/transaksi/penjualan')
    // })
    Route.get('/penjualan/final', async ({ response }) => {
      return response.redirect().toPath('/app/transaksi/penjualan')
    })

    Route.resource('penjualan', 'transaksi/PenjualansController').only(['index', 'destroy'])
  }).prefix('transaksi')
  
  Route.get('/gadai', async ({ view }) => {
    return view.render('transaksi/gadai')
  })

  Route.group(() => {
    Route.get('/', async ({ view }) => {
      return view.render('kas/base')
    })

    Route.get('/rekap', async ({ view }) => {
      return view.render('kas/rekap')
    })
 
  }).prefix('/kas')

  // Rute buat ngatur barang
  Route.group(() => {
    Route.get('/', 'barang/KelompoksController.index')

    // kelompok indexnya jadi di base barang
    Route.resource('kelompok', 'barang/KelompoksController').except(['index'])
    Route.resource('model', 'barang/ModelsController')
    Route.resource('kerusakan', 'barang/KerusakansController')


    // ntar kudu pake id
    // Route.get('/detail', async ({ view }) => {
    //   return view.render('barang/detail')
    // })

    Route.get('/restok', async ({ view }) => {
      return view.render('barang/restok')
    })
    Route.post('/restok', 'barang/KelompoksController.restokPerhiasan')

    // Route.get('/bukuRekap', async ({ view }) => {
    //   return view.render('barang/bukurekap')
    // })

    // Route.get('/listKerusakan', async ({ view }) => {
    //   return view.render('barang/list-rusak')
    // })

    Route.group(()=>{
      // general
      Route.get('/kadarBentuk', 'barang/KelompoksController.getKadarBentuk')

      // view kelompok
      Route.get('/peringkatKelompok', 'barang/KelompoksController.peringkatKelompokAll')
      Route.get('/peringkatKelompok/:id', 'barang/KelompoksController.peringkatKelompok')
      Route.get('/sebaranData/:id', 'barang/KelompoksController.sebaranData')


      // restok
      Route.get('/modelDenganInput', 'barang/KelompoksController.getModelDenganInput')

    }).prefix('/cumaData')

  }).prefix('/barang')

  // Rute buat ngatur pegawai
  // Route.group(() => {
  //   Route.get('/', async ({ view }) => {
  //     return view.render('pegawai/base')
  //   })
  //   // ntar kudu dikasi id
  //   Route.get('/detail', async ({ view }) => {
  //     return view.render('pegawai/detail')
  //   })
  //   Route.get('/baru', async ({ view }) => {
  //     return view.render('pegawai/form-pegawai')
  //   })
  // }).prefix('/pegawai')

  // resource gabisa pake prefix!
  // kalau mau pisah yang resource sama specific (kek dibawah ini)
  Route.put('/pegawai/:id/status', 'akun/PegawaisController.ubahStatus')
  Route.resource('/pegawai', 'akun/PegawaisController')



  Route.group(() => {
    Route.get('/1', async ({ view }) => {
      return view.render('test/test1')
    })
    Route.get('/2', async ({ view }) => {
      return view.render('test/test2')
    })
    Route.get('/3', async ({ view }) => {
      return view.render('test/test3')
    })

    Route.get('/paginationv1', 'TestsController.paginationv1')
    Route.get('/paginationv2', 'TestsController.paginationv2')
    Route.get('/paginationv3', 'TestsController.paginationv3')

    Route.get('/qs', 'TestsController.queryString')
    
    Route.get('/data/kerusakan', 'TestsController.dataKerusakan')

    Route.post('/dump', 'TestsController.dump')

    // terpaksa pake GET soalnya CSRF dah nyala
    Route.get('/hash', 'TestsController.hashArgon')

    Route.get('/alltest', 'TestsController.allTest')
    Route.get('/paginated', 'TestsController.paginated')

    Route.get('/base64Decode', 'TestsController.base64de')
    Route.post('/base64Decode', 'TestsController.base64dePOST')

    Route.group(()=>{
      Route.post('/encrypt', 'TestsController.encrypt')
      Route.post('/decrypt', 'TestsController.decrypt')
    }).prefix('/security')

    Route.get('/akunTest', 'akun/PenggunasController.testSeputarAkun')

  }).prefix('/test')

}).prefix('/app')

Route.get('/test/index', async ({ view }) => {
  return view.render('index-test')
})

Route.get('/landing', async ({ view }) => {
  return view.render('landing_page')
})

Route.post('/dump', async ({ request }) => {
  return request.body()
})



