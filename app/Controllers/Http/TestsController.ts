import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class TestsController {
  public async index({ }: HttpContextContract) {

    // datanya ntar aslinya dari request, mungkin pake pos, tp bisa juga get
    let iniData = 'gelang'

    // trus disini, data tadi dipake buat ngambil data dari database tabel kerusakan, dicocokin sama bentuknya

    // kalau ada, bakal ngereturn list kerusakan jadi json

    // kalo gaada, return object kosongan, trus kasi checker di js nya

    return [
      {
        id: 1,
        title: 'Hello world',
      },
      {
        id: 2,
        title: 'Hello universe',
      },
    ]
  }


  // ini dah bagus, siap pakai
  public async transaksi({ request, view, response}: HttpContextContract) {
    const body = request.body()

    if(!body.prepareAsal || !body.prepareNota || !body.prepareRusak){
      response.redirect().back()
    }

    if(body.prepareAsal == 1 || body.prepareNota == 1 || body.prepareRusak == 2){
      return view.render('transaksi/pembelian/base-khusus')
    }
    return view.render('transaksi/pembelian/base-umum')
  }
}
