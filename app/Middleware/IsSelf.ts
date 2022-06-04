import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class IsSelf {
  public async handle({}: HttpContextContract, next: () => Promise<void>) {
    // code for middleware goes here. ABOVE THE NEXT CALL

    // middleware buat ngecek yang login skarang yang bikin input / current user ato bukan
    // ntar kudu udah bisa make auth, kalo belum pake itu kek nanggung
    // cek dari param urlnya

    // beberapa url udah ready dikasi ginian, cek yang ada komen PAKEMIDDLEWARE


    await next()
  }
}
