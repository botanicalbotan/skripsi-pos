import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Kadar from 'App/Models/barang/Kadar'
import Database from '@ioc:Adonis/Lucid/Database'
import { schema, rules } from '@ioc:Adonis/Core/Validator'

export default class KadarsController {

  public async show ({params, view, response}: HttpContextContract) {
    // Ini udah make middleware
    try {
      const kadar = await Kadar.findOrFail(params.id)

      const fungsi = {
        rupiahParser: rupiahParser
      }

      return view.render('pengaturan/kadar/view-kadar', { kadar, fungsi })
    } catch (error) {
      return response.redirect().toPath('/app/')
    }
  }

  public async edit ({params, view, response}: HttpContextContract) {
    // Ini udah make middleware

    try {
      const kadar = await Kadar.findOrFail(params.id)

      return view.render('pengaturan/kadar/form-edit-kadar', { kadar })
    } catch (error) {
      return response.redirect().toPath('/app/')
    }
  }

  public async update ({ params, request, response, session }: HttpContextContract) {
    // Ini udah make middleware
    const editKadarSchema = schema.create({
      nama: schema.string({ trim: true }, [
        rules.maxLength(10),
        rules.unique({
          table: 'kadars',
          column: 'nama',
          whereNot:{
            id: params.id
          }
        })
      ]),
      warna: schema.string(),
      deskripsi: schema.string({ trim: true }, [rules.maxLength(100)]),

      jenisPotongan: schema.enum(['nominal', 'persen'] as const),
      penguranganPotonganMin: schema.number([rules.unsigned()]),
      penguranganPotonganMax: schema.number([rules.unsigned()]),

      persentaseKadarUripan: schema.number([
        rules.unsigned(),
        rules.range(0, 100)
      ]),
      persentaseKadarRosok: schema.number([
        rules.unsigned(),
        rules.range(0, 100)
      ]),
      marginPersenUntungUripanMin: schema.number([
        rules.unsigned(),
        rules.range(0, 100)
      ]),
      marginPersenUntungUripanMax: schema.number([
        rules.unsigned(),
        rules.range(0, 100)
      ]),
      marginPersenUntungRosokMin: schema.number([
        rules.unsigned(),
        rules.range(0, 100)
      ]),
      marginPersenUntungRosokMax: schema.number([
        rules.unsigned(),
        rules.range(0, 100)
      ]),
      marginPersenUntungRosokTTMin: schema.number([
        rules.unsigned(),
        rules.range(0, 100)
      ]),
      marginPersenUntungRosokTTMax: schema.number([
        rules.unsigned(),
        rules.range(0, 100),
      ]),
    })

    const validrequest = await request.validate({ schema: editKadarSchema })

    try {
      if(validrequest.jenisPotongan == 'persen'){
        if(validrequest.penguranganPotonganMin < 0 || validrequest.penguranganPotonganMin > 100){
          session.flash('errors', {
            penguranganPotonganMin: 'Input pengurangan potongan tidak valid!'
          })
          throw 'error'
        }

        if(validrequest.penguranganPotonganMax < 0 || validrequest.penguranganPotonganMax > 100){
          session.flash('errors', {
            penguranganPotonganMin: 'Input pengurangan potongan tidak valid!'
          })
          throw 'error'
        }
      }


      const kadar = await Kadar.findOrFail(params.id)
      kadar.nama = validrequest.nama
      kadar.warnaNota = validrequest.warna
      kadar.deskripsi = validrequest.deskripsi
      
      kadar.apakahPotonganPersen = (validrequest.jenisPotongan === 'persen')
      kadar.toleransiPenguranganPotonganMin = validrequest.penguranganPotonganMin
      kadar.toleransiPenguranganPotonganMax = validrequest.penguranganPotonganMax

      kadar.persentaseMalUripan = validrequest.persentaseKadarUripan
      kadar.persentaseMalRosok = validrequest.persentaseKadarRosok
      kadar.marginPersenUntungUripanMin = validrequest.marginPersenUntungUripanMin
      kadar.marginPersenUntungUripanMax = validrequest.marginPersenUntungUripanMax
      kadar.marginPersenUntungRosokMin = validrequest.marginPersenUntungRosokMin
      kadar.marginPersenUntungRosokMax = validrequest.marginPersenUntungRosokMax
      kadar.marginPersenUntungRosokTtMin = validrequest.marginPersenUntungRosokTTMin
      kadar.marginPersenUntungRosokTtMax = validrequest.marginPersenUntungRosokTTMax
      await kadar.save()

      session.flash('alertSukses', 'Data kadar berhasil diubah!')
      return response.redirect().toPath('/app/pengaturan/kadar/' + params.id)

    } catch (error) {
      session.flash('alertError', 'Ada masalah saat mengubah data kadar. Silahkan coba lagi setelah beberapa saat.')
      return response.redirect().back()
    }
  }

  // =============================================================================================

  public async getKadarById ({ request, response }: HttpContextContract) {
    let kadarId = request.input('id')

    if (kadarId === null || typeof kadarId === 'undefined') {
      throw 'error'
    }

    try {
      let cekKadar = await Database
      .from('kadars')
      .select('*')
      .where('id', kadarId)
      .firstOrFail()

      return cekKadar
    } catch (error) {
      return response.badRequest('ID kadar tidak valid')
    }
    
  }

}


function rupiahParser(angka: number) {
  if (typeof angka == 'number') {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(angka)
  } else {
    return 'error'
  }
}