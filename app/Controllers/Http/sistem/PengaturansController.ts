import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Pengguna from 'App/Models/akun/Pengguna'
import Drive from '@ioc:Adonis/Core/Drive'


export default class PengaturansController {
  public async index ({}: HttpContextContract) {
  }

  public async create ({}: HttpContextContract) {
  }

  public async store ({}: HttpContextContract) {
  }

  public async show ({}: HttpContextContract) {
  }

  public async edit ({}: HttpContextContract) {
  }

  public async update ({}: HttpContextContract) {
  }

  public async destroy ({}: HttpContextContract) {
  }

  public async ambilFoto ({ params, response }: HttpContextContract) {
    try {
      if(params.tipe === 'pegawai'){
        const pegawai = await Pengguna.findOrFail(params.id)

        if(await Drive.exists('profilePict/' + pegawai.foto)){ // kalo ngga di giniin, ntar bakal infinite await kalo file gaada
          const fotoBarang = await Drive.get('profilePict/' + pegawai.foto) // ntar diganti jadi dinamis dari db, sama diresize dulu kali hmmm

          const logoToko = await Drive.get('logos/logo-leo.png')

          return fotoBarang.toString('base64')
          // return {foto: 'data:image/png;base64,' + fotoBarang.toString('base64')}
        } else{
          throw 'kosong'
        }
      }

      throw 'kosong'
    } catch (error) {
      return response.notFound('File not found.')
    }
  }
}
