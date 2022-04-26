import Route from '@ioc:Adonis/Core/Route'



Route.group(() => {
  Route.get('/1', async ({
    view
  }) => {
    return view.render('test/test1')
  })
  Route.get('/2', async ({
    view
  }) => {
    return view.render('test/test2')
  })
  Route.get('/3', async ({
    view
  }) => {
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

  Route.group(() => {
    Route.post('/encrypt', 'TestsController.encrypt')
    Route.post('/decrypt', 'TestsController.decrypt')
  }).prefix('/security')

  Route.get('/akunTest', 'akun/PenggunasController.testSeputarAkun')



}).prefix('/test')


Route.post('/dump', async ({ request }) => {
  return request.body()
})

Route.get('app/test/testQuery', 'TestsController.testQuery')


Route.get('app/test/testPasaran', 'TestsController.testPasaran')

Route.get('/test/index', async ({ view }) => {
  return view.render('index-test')
})
