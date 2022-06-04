import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class IsKaryaKhus {
  public async handle({}: HttpContextContract, next: () => Promise<void>) {
    // code for middleware goes here. ABOVE THE NEXT CALL

    // middleware buat ngecek yang login skarang kepala toko ato bukan
    // ntar kudu udah bisa make auth, kalo belum pake itu kek nanggung

    // beberapa url udah ready dikasi ginian, cek yang ada komen PAKEMIDDLEWARE


    await next()
  }
}
