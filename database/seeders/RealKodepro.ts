import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Kadar from 'App/Models/barang/Kadar'

export default class RealKodeproSeeder extends BaseSeeder {
  public async run () {
    // nyiapin yang dibutuhin dulu
    const kadarTua = await Kadar.findByOrFail('nama', 'Tua')
    const kadarTanggung = await Kadar.findByOrFail('nama', 'Tanggung')
    const kadarMuda = await Kadar.findByOrFail('nama', 'Muda')

    // ------------- kadar muda -----------------
    await kadarMuda.related('kodeProduksis').create({
      'kode': '300 HWT',
      'asalProduksi': 'PT Hartono Wira Tanik',
      'apakahBuatanTangan': false,
      'deskripsi': 'Kode biasa untuk emas muda',
      'hargaPerGramLama': 325000,
      'hargaPerGramBaru': 350000,
      'potonganLama': 12000,
      'potonganBaru': 13000,
      'penggunaId': 1
    })
    await kadarMuda.related('kodeProduksis').create({
      'kode': '300 UBS',
      'asalProduksi': 'PT Untung Bersama Sejahtera',
      'apakahBuatanTangan': false,
      'deskripsi': 'Kode biasa untuk emas muda',
      'hargaPerGramLama': 325000,
      'hargaPerGramBaru': 350000,
      'potonganLama': 12000,
      'potonganBaru': 13000,
      'penggunaId': 1
    })
    await kadarMuda.related('kodeProduksis').create({
      'kode': 'DP',
      'asalProduksi': 'Universal',
      'apakahBuatanTangan': false,
      'deskripsi': 'Kode biasa untuk emas muda',
      'hargaPerGramLama': 270000,
      'hargaPerGramBaru': 300000,
      'potonganLama': 10000,
      'potonganBaru': 11000,
      'penggunaId': 1
    })
    await kadarMuda.related('kodeProduksis').create({
      'kode': 'LM',
      'asalProduksi': 'Universal',
      'apakahBuatanTangan': false,
      'deskripsi': 'Kode biasa untuk emas muda',
      'hargaPerGramLama': 270000,
      'hargaPerGramBaru': 300000,
      'potonganLama': 10000,
      'potonganBaru': 11000,
      'penggunaId': 1
    })
    await kadarMuda.related('kodeProduksis').create({
      'kode': 'MGY',
      'asalProduksi': 'Universal',
      'apakahBuatanTangan': false,
      'deskripsi': 'Kode biasa untuk emas muda',
      'hargaPerGramLama': 270000,
      'hargaPerGramBaru': 300000,
      'potonganLama': 10000,
      'potonganBaru': 11000,
      'penggunaId': 1
    })
    await kadarMuda.related('kodeProduksis').create({
      'kode': 'OA',
      'asalProduksi': 'Universal',
      'apakahBuatanTangan': false,
      'deskripsi': 'Kode biasa untuk emas muda',
      'hargaPerGramLama': 270000,
      'hargaPerGramBaru': 300000,
      'potonganLama': 10000,
      'potonganBaru': 11000,
      'penggunaId': 1
    })
    await kadarMuda.related('kodeProduksis').create({
      'kode': 'SK',
      'asalProduksi': 'Universal',
      'apakahBuatanTangan': false,
      'deskripsi': 'Kode biasa untuk emas muda',
      'hargaPerGramLama': 270000,
      'hargaPerGramBaru': 300000,
      'potonganLama': 10000,
      'potonganBaru': 11000,
      'penggunaId': 1
    })
    await kadarMuda.related('kodeProduksis').create({
      'kode': 'ZZ',
      'asalProduksi': 'Universal',
      'apakahBuatanTangan': false,
      'deskripsi': 'Kode biasa untuk emas muda',
      'hargaPerGramLama': 270000,
      'hargaPerGramBaru': 300000,
      'potonganLama': 10000,
      'potonganBaru': 11000,
      'penggunaId': 1
    })

    // ------------- kadar tanggung --------------
    await kadarTanggung.related('kodeProduksis').create({
      'kode': '375 HWT',
      'asalProduksi': 'PT Hartono Wira Tanik',
      'apakahBuatanTangan': false,
      'deskripsi': 'Kode biasa untuk emas tanggung',
      'hargaPerGramLama': 400000,
      'hargaPerGramBaru': 430000,
      'potonganLama': 12000,
      'potonganBaru': 13000,
      'penggunaId': 1
    })
    await kadarTanggung.related('kodeProduksis').create({
      'kode': '375 UBS',
      'asalProduksi': 'PT Untung Bersama Sejahtera',
      'apakahBuatanTangan': false,
      'deskripsi': 'Kode biasa untuk emas tanggung',
      'hargaPerGramLama': 400000,
      'hargaPerGramBaru': 430000,
      'potonganLama': 12000,
      'potonganBaru': 13000,
      'penggunaId': 1
    })
    await kadarTanggung.related('kodeProduksis').create({
      'kode': '420 HWT',
      'asalProduksi': 'PT Hartono Wira Tanik',
      'apakahBuatanTangan': false,
      'deskripsi': 'Kode biasa untuk emas tanggung',
      'hargaPerGramLama': 400000,
      'hargaPerGramBaru': 450000,
      'potonganLama': 13000,
      'potonganBaru': 15000,
      'penggunaId': 1
    })
    await kadarTanggung.related('kodeProduksis').create({
      'kode': '420 UBS',
      'asalProduksi': 'PT Untung Bersama Sejahtera',
      'apakahBuatanTangan': false,
      'deskripsi': 'Kode biasa untuk emas tanggung',
      'hargaPerGramLama': 400000,
      'hargaPerGramBaru': 450000,
      'potonganLama': 13000,
      'potonganBaru': 15000,
      'penggunaId': 1
    })
    await kadarTanggung.related('kodeProduksis').create({
      'kode': 'D40',
      'asalProduksi': 'Universal',
      'apakahBuatanTangan': false,
      'deskripsi': 'Kode biasa untuk emas tanggung',
      'hargaPerGramLama': 400000,
      'hargaPerGramBaru': 430000,
      'potonganLama': 12000,
      'potonganBaru': 13000,
      'penggunaId': 1
    })
    await kadarTanggung.related('kodeProduksis').create({
      'kode': 'LA',
      'asalProduksi': 'Universal',
      'apakahBuatanTangan': false,
      'deskripsi': 'Kode biasa untuk emas tanggung',
      'hargaPerGramLama': 400000,
      'hargaPerGramBaru': 430000,
      'potonganLama': 12000,
      'potonganBaru': 13000,
      'penggunaId': 1
    })
    await kadarTanggung.related('kodeProduksis').create({
      'kode': 'M40',
      'asalProduksi': 'Universal',
      'apakahBuatanTangan': false,
      'deskripsi': 'Kode biasa untuk emas tanggung',
      'hargaPerGramLama': 400000,
      'hargaPerGramBaru': 430000,
      'potonganLama': 12000,
      'potonganBaru': 13000,
      'penggunaId': 1
    })

    // ------------- kadar tua --------------
    await kadarTua.related('kodeProduksis').create({
      'kode': '18K HWT',
      'asalProduksi': 'PT Hartono Wira Tanik',
      'apakahBuatanTangan': false,
      'deskripsi': 'Kode biasa untuk emas tua',
      'hargaPerGramLama': 750000,
      'hargaPerGramBaru': 800000,
      'potonganLama': 7,
      'potonganBaru': 8,
      'penggunaId': 1
    })
    await kadarTua.related('kodeProduksis').create({
      'kode': '18K UBS',
      'asalProduksi': 'PT Untung Bersama Sejahtera',
      'apakahBuatanTangan': false,
      'deskripsi': 'Kode biasa untuk emas tua',
      'hargaPerGramLama': 750000,
      'hargaPerGramBaru': 800000,
      'potonganLama': 7,
      'potonganBaru': 8,
      'penggunaId': 1
    })
    await kadarTua.related('kodeProduksis').create({
      'kode': '700 HWT',
      'asalProduksi': 'PT Hartono Wira Tanik',
      'apakahBuatanTangan': false,
      'deskripsi': 'Kode biasa untuk emas tua',
      'hargaPerGramLama': 700000,
      'hargaPerGramBaru': 750000,
      'potonganLama': 7,
      'potonganBaru': 8,
      'penggunaId': 1
    })
    await kadarTua.related('kodeProduksis').create({
      'kode': '700 UBS',
      'asalProduksi': 'PT Untung Bersama Sejahtera',
      'apakahBuatanTangan': false,
      'deskripsi': 'Kode biasa untuk emas tua',
      'hargaPerGramLama': 700000,
      'hargaPerGramBaru': 750000,
      'potonganLama': 7,
      'potonganBaru': 8,
      'penggunaId': 1
    })
    await kadarTua.related('kodeProduksis').create({
      'kode': '750 HWT',
      'asalProduksi': 'PT Hartono Wira Tanik',
      'apakahBuatanTangan': false,
      'deskripsi': 'Kode biasa untuk emas tua',
      'hargaPerGramLama': 750000,
      'hargaPerGramBaru': 800000,
      'potonganLama': 7,
      'potonganBaru': 8,
      'penggunaId': 1
    })
    await kadarTua.related('kodeProduksis').create({
      'kode': '750 UBS',
      'asalProduksi': 'PT Untung Bersama Sejahtera',
      'apakahBuatanTangan': false,
      'deskripsi': 'Kode biasa untuk emas tua',
      'hargaPerGramLama': 750000,
      'hargaPerGramBaru': 800000,
      'potonganLama': 7,
      'potonganBaru': 8,
      'penggunaId': 1
    })
  }
}
