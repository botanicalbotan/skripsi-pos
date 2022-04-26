import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import Penjualan from 'App/Models/transaksi/Penjualan'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Drive from '@ioc:Adonis/Core/Drive'
import { DateTime } from 'luxon'
import Kerusakan from 'App/Models/barang/Kerusakan'

export default class PembeliansController {
  rupiahParser(angka: number) {
    if (typeof angka == 'number') {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
      }).format(angka)
    }
  }

  // ============================= fungsi rute ==========================================

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


  // =================================== non CRUD =============================================================

  // public async pembelianQR ({ view }: HttpContextContract) {
  //   return view.render('transaksi/pembelian/phase2-QR')
  // }

  public async cariQR ({ request, response }: HttpContextContract) {
    let scan = request.input('scan', 'kosong')

    try {
      let penjualan = await Penjualan
        .query()
        .where('kode_transaksi', scan)
        .andWhereNull('dibeli_at')
        .andWhereNull('deleted_at')
        .preload('kelompok', (kelompokQuery)=>{
          kelompokQuery
            .preload('bentuk')
            .preload('kadar')
            .whereNull('deleted_at')
        })
        .firstOrFail()

      let tanggal = penjualan.createdAt.setLocale('id-ID').toLocaleString({ ...DateTime.DATETIME_MED, weekday:'long' })
      // let file = await Drive.get('transaksi/penjualan/' + penjualan.fotoBarang)

      return {
          namaQR: penjualan.kelompok.bentuk.bentuk + ' ' + penjualan.kelompok.kadar.nama + ' seberat ' + penjualan.beratSebenarnya + 'g, terjual pada ' + tanggal,
          kodePenjualan: penjualan.kodeTransaksi,
          foto: await Drive.getUrl('transaksi/penjualan/' + penjualan.fotoBarang),
          // foto2: 'data:image/jpeg;base64,' + file.toString('base64')
      }

    } catch (error) {
      return response.notFound({errorMsg: 'Kode penjualan tidak valid!'})
    }
  }


  public async indexQR ({ view, response, request, session }: HttpContextContract) {
    let scan = request.input('hKt', 'kosong')

    try {
      let penjualan = await Penjualan
        .query()
        .where('kode_transaksi', scan)
        .andWhereNull('dibeli_at')
        .andWhereNull('deleted_at')
        .preload('kelompok', (kelompokQuery)=>{
          kelompokQuery
            .preload('bentuk')
            .preload('kadar')
            .whereNull('deleted_at')
        })
        .preload('model', (modelQuery)=>{
          modelQuery.whereNull('deleted_at')
        })
        .preload('rentangUsia')
        .firstOrFail()

      let tanggal = penjualan.createdAt.setLocale('id-ID').toLocaleString({ ...DateTime.DATETIME_MED, weekday:'long' })
      return view.render('transaksi/pembelian/base-umum-QR', {
        penjualan,
        tambahan: {
          namaQR: penjualan.kelompok.bentuk.bentuk + ' ' + penjualan.kelompok.kadar.nama + ' seberat ' + penjualan.beratSebenarnya + 'g, terjual pada ' + tanggal,
          foto: await Drive.getUrl('transaksi/penjualan/' + penjualan.fotoBarang),
          maxSelisih: 0.2 // ntar ngambil dari pengaturan
        },
        fungsi:{
          rupiahParser: this.rupiahParser
        }
      })

    } catch (error) {

      session.flash('errors', {invalid: 'Kode penjualan tidak valid!'})
      return response.redirect().back()
    }

    return view.render('transaksi/pembelian/base-umum-QR2')
  }

  public async hitungHargaNormal ({ request }: HttpContextContract) {
    // return request.all()
    const newHitungHargaNormalSchema = schema.create({
      idpj: schema.string({ trim:true }, [
        rules.exists({
          table: 'penjualans',
          column: 'kode_transaksi',
          where: {
            deleted_at: null,
            dibeli_at: null
          }
        })
      ]),
      beliBeratNota: schema.number(),
      beliBeratSebenarnya: schema.number(),
      idKerusakan: schema.array.optional().members(
        schema.number([
          rules.exists({
            table: 'kerusakans',
            column: 'id',
            where: {
              deleted_at: null
              // kalau mau nambahin harus bisa diperbaiki disini
            }
          })
        ])
      ),
      jumlahKerusakan: schema.array.optional().members(
        schema.number([
          rules.unsigned()
        ])
      ),
    })

    const validrequest = await request.validate({ schema: newHitungHargaNormalSchema })

    try {
      let penjualan = await Penjualan
        .query()
        .where('kode_transaksi', validrequest.idpj)
        .andWhereNull('dibeli_at')
        .andWhereNull('deleted_at')
        .preload('kelompok', (kelompokQuery)=>{
          kelompokQuery
            .preload('bentuk')
            .preload('kadar')
            .whereNull('deleted_at')
        })
        .preload('model', (modelQuery)=>{
          modelQuery.whereNull('deleted_at')
        })
        .firstOrFail()

      let hargaPerGram = Math.round(penjualan.hargaJualAkhir / penjualan.beratSebenarnya)
      let listKerusakan: {detail: string, ongkos: number}[] = []
      let kerusakan = 0

      let i = 0
      if(validrequest.idKerusakan && validrequest.jumlahKerusakan){
        for (const element of validrequest.idKerusakan) {
          try {
            let rusak = await Kerusakan
              .query()
              .where('id', element)
              .andWhere('bentuk_id', penjualan.kelompok.bentuk.id)
              .andWhereNull('deleted_at')
              .firstOrFail()

            kerusakan += rusak.ongkosNominal * validrequest.jumlahKerusakan[i]
            listKerusakan.push({
              detail: rusak.nama + ' (' + validrequest.jumlahKerusakan[i] + ')',
              ongkos: rusak.ongkosNominal * validrequest.jumlahKerusakan[i]
            })

          } catch (error) {
            console.error(error)
          }

          i++
        }
      }

      if(validrequest.beliBeratNota > validrequest.beliBeratSebenarnya){
        let selisih = validrequest.beliBeratNota - validrequest.beliBeratSebenarnya
        listKerusakan.push({
          detail: 'Susut berat (' + selisih.toFixed(3) + 'g)',
          ongkos: Math.round(selisih * hargaPerGram)
        })

        kerusakan += selisih * hargaPerGram
      }

      let wedahBalik = {
        beratSebenarnya: validrequest.beliBeratSebenarnya,
        hargaPerGram:  hargaPerGram,
        listKerusakan: listKerusakan,
        totalPotongan: 0,// tolong angka 0 disamping sama dibawah ntar diganti rumus hitung potongan yang baru
        totalKerusakan: Math.round(kerusakan),
        hargaBeli: Math.round(penjualan.hargaJualAkhir - 0 - kerusakan),
        penjualan
      }

      return wedahBalik
    } catch (error) {
      return {e: 'ngaco lu'}
    }
  }


  //================================================== RIWAYAT ====================================================
  public async listRiwayat({ view }: HttpContextContract) {

  }

  public async viewRiwayat({ view }: HttpContextContract) {

  }
}
