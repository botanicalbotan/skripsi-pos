import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class GuestOnly {
  public async handle({ auth, response }: HttpContextContract, next: () => Promise<void>) {

    // ini buat page2 yang gaboleh diakses ama yang udah login
    try {
      await auth.use('web').authenticate()
      return response.redirect().toPath('/app')
    } catch (error) {
      // kalo error berarti bener, soalnya harusnya ngga ada
    }

    // code for middleware goes here. ABOVE THE NEXT CALL
    await next()
  }
}
