import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import PenambahanStok from 'App/Models/barang/PenambahanStok'
import Kelompok from 'App/Models/barang/Kelompok'
import Database from '@ioc:Adonis/Lucid/Database'
import Drive from '@ioc:Adonis/Core/Drive'

export default class PenambahanStoksController {

  public async index ({ view, request }: HttpContextContract) {

    const opsiOrder = [
      'penambahan_stoks.created_at',
      'penambahan_stoks.apakah_kulakan',
      'penambahan_stoks.asal_stok',
      'jumlahKelompok',
      'penambahan_stoks.pengguna_id'
    ]
    const page = request.input('page', 1)
    const order = request.input('ob', 0)
    const cari = request.input('cari', '')
    const sanitizedOrder = order < opsiOrder.length && order >= 0 && order? order : 0
    const arahOrder = request.input('aob', 0)
    const sanitizedArahOrder = arahOrder == 1? 1:0
    const limit = 10

    const penambahans = await Database.from('penambahan_stoks')
      .join('penggunas', 'penambahan_stoks.pengguna_id', '=', 'penggunas.id')
      .join('kelompok_penambahans', 'penambahan_stoks.id', '=', 'kelompok_penambahans.penambahan_stok_id')
      .select(
        'penambahan_stoks.id as id',
        'penambahan_stoks.created_at as createdAt',
        'penambahan_stoks.apakah_kulakan as apakahKulakan',
        'penambahan_stoks.asal_stok as asalStok',
        'penambahan_stoks.pengguna_id as penggunaId',
        'penggunas.nama as pencatat'
      )
      .count('penambahan_stoks.id', 'jumlahKelompok')
      .if(cari !== '', (query) => {
        query.where('penambahan_stoks.asal_stok', 'like', `%${cari}%`)
      })
      .groupBy('penambahan_stoks.id')
      .orderBy(opsiOrder[sanitizedOrder], ((sanitizedArahOrder == 1)? 'desc': 'asc'))
      .orderBy('penambahan_stoks.created_at', 'desc')
      .paginate(page, limit)

    penambahans.baseUrl('/app/barang/penambahan')

    penambahans.queryString({ ob: sanitizedOrder, aob: sanitizedArahOrder })
    if (cari !== '') {
      penambahans.queryString({ ob: sanitizedOrder, aob: sanitizedArahOrder, cari: cari })
    }

    // kalau mau mulai dari sini bisa dibikin fungsi sendiri
    // input bisa pagination object + panjang page yang mau di display
    let firstPage =
      penambahans.currentPage - 2 > 0
        ? penambahans.currentPage - 2
        : penambahans.currentPage - 1 > 0
        ? penambahans.currentPage - 1
        : penambahans.currentPage
    let lastPage =
      penambahans.currentPage + 2 <= penambahans.lastPage
        ? penambahans.currentPage + 2
        : penambahans.currentPage + 1 <= penambahans.lastPage
        ? penambahans.currentPage + 1
        : penambahans.currentPage

    if (lastPage - firstPage < 4 && penambahans.lastPage > 4) {
      if (penambahans.currentPage < penambahans.firstPage + 2) {
        lastPage += 4 - (lastPage - firstPage)
      }

      if (lastPage == penambahans.lastPage) {
        firstPage -= 4 - (lastPage - firstPage)
      }
    }
    // sampe sini
    const tempLastData = 10 + (penambahans.currentPage - 1) * limit

    const tambahan = {
      pengurutan: sanitizedOrder,
      pencarian: cari,
      firstPage: firstPage,
      lastPage: lastPage,
      firstDataInPage: 1 + (penambahans.currentPage - 1) * limit,
      lastDataInPage: tempLastData >= penambahans.total ? penambahans.total : tempLastData,
    }

    const fungsi = {
      tanggalLokal: function(datetime){
        let tanggal = new Date(datetime)
        return tanggal.toLocaleDateString('id-ID', {day:'numeric', month:'long', year:'numeric'})
      },
      waktuLokal: function(datetime){
        let tanggal = new Date(datetime)
        return tanggal.toLocaleTimeString('id-ID')
      }
    }

    return await view.render('barang/penambahan-stok/list-penambahan', { penambahans, tambahan, fungsi })
  }

  public async create ({ view }: HttpContextContract) {
    return await view.render('barang/penambahan-stok/form-penambahan')
  }

  public async store ({ request, session, response }: HttpContextContract) {
    const restokSchema = schema.create({
      stokCatatan: schema.string({ trim: true }, [rules.maxLength(255)]),
      stokIdPerhiasan: schema
        .array([rules.minLength(1)])
        .members(
          schema.number([
            rules.exists({ table: 'kelompoks', column: 'id', where: { deleted_at: null } }),
          ])
        ),
      stokTambahan: schema.array([rules.minLength(1)]).members(schema.number([rules.unsigned()])),
      stokTipe: schema.enum(['Cucian', 'Kulakan']),
      stokAsal: schema.string({ trim:true }, [rules.maxLength(100)])
    })

    const validrequest = await request.validate({ schema: restokSchema })

    // custom error message
    let errCount = 0
    let itemCount = 0

    async function addStok() {
      let penambahanBaru = new PenambahanStok()
      penambahanBaru.penggunaId = 1
      penambahanBaru.apakahKulakan = validrequest.stokTipe === 'Kulakan'
      penambahanBaru.asalStok = (validrequest.stokTipe === 'Kulakan')? validrequest.stokAsal: 'Garapan'
      penambahanBaru.catatan = validrequest.stokCatatan
      await penambahanBaru.save()

      let i = 0
      for (const element of validrequest.stokIdPerhiasan) {
        // console.log('no ' + i + ', value; ' + element + ', stok: ' + validrequest.stokTambahan[i])

        try {
          let kelompok = await Kelompok.findOrFail(element)
          kelompok.stok += validrequest.stokTambahan[i]

          await penambahanBaru.related('kelompoks').attach({
            [kelompok.id]: {
              perubahan_stok: validrequest.stokTambahan[i],
              stok_akhir: kelompok.stok,
            },
          })

          await kelompok.save()
        } catch (error) {
          errCount++
          console.error(error)
        }

        i++
        itemCount++
      }
    }

    await addStok()

    if (errCount > 0)
      session.flash(
        'alertError',
        'Stok ' +
          (itemCount - errCount) +
          ' kelompok berhasil diperbarui, ' +
          errCount +
          ' kelompok dilewati karena terdapat masalah'
      )

    if (itemCount > 0 && errCount == 0)
      session.flash('alertSukses', 'Stok ' + itemCount + ' kelompok berhasil diperbarui!')

    return response.redirect().back()
  }

  public async show ({ view, params, response }: HttpContextContract) {
    try {
      let penambahan = await PenambahanStok.findOrFail(params.id)
      await penambahan.load('kelompoks', (query)=>{
        query.preload('bentuk').preload('kadar')
      })
      await penambahan.load('pengguna', (query)=>{
        query.preload('jabatan')
      })

      const urlPencatat = (await Drive.exists('profilePict/' + penambahan.pengguna.foto))? (await Drive.getUrl('profilePict/' + penambahan.pengguna.foto)) : ''


      const hitungKelompok = await Database.from('penambahan_stoks')
        .join('kelompok_penambahans', 'penambahan_stoks.id', '=', 'kelompok_penambahans.penambahan_stok_id')
        .select(
          'penambahan_stoks.id as id',
        )
        .count('penambahan_stoks.id', 'jumlahKelompok')
        .where('penambahan_stoks.id', params.id)
        .groupBy('penambahan_stoks.id')

      let tambahan = {
        jumlahKelompok: hitungKelompok[0].jumlahKelompok,
        urlFotoPencatat: urlPencatat
      }


      return await view.render('barang/penambahan-stok/view-penambahan', { penambahan, tambahan })
    } catch (error) {
      return response.redirect().toPath('/app/barang/kodepro/')
    }
  }

  public async edit ({}: HttpContextContract) {
  }

  public async update ({}: HttpContextContract) {
  }

  public async destroy ({}: HttpContextContract) {
  }

  public async getKelompokDenganInput({ request }: HttpContextContract) {
    let bentuk = request.input('bentuk')
    let kadar = request.input('kadar')

    let kelompokCari = await Database.from('kelompoks')
      .select('id', 'berat_kelompok as beratKelompok', 'stok', 'nama', 'kode_kelompok as kodeKelompok')
      .where('bentuk_id', bentuk)
      .andWhere('kadar_id', kadar)
      .andWhereNull('deleted_at')
      .orderBy('nama', 'asc')

    return kelompokCari
  }
}
