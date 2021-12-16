import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Kadar from 'App/Models/barang/Kadar'
import Bentuk from 'App/Models/barang/Bentuk'
import Kelompok from 'App/Models/barang/Kelompok'
import Database from '@ioc:Adonis/Lucid/Database'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Model from 'App/Models/barang/Model'
import Drive from '@ioc:Adonis/Core/Drive'
import { DateTime } from 'luxon'
var isBase64 = require('is-base64')

export default class PenjualansController {
  // Fungsi Tambahan

  kapitalHurufPertama(text: string) {
    return text.charAt(0).toUpperCase() + text.slice(1)
  }

  kapitalKalimat(text: string) {
    let pure = text.split(' ')
    let newText = ''
    for (let i = 0; i < pure.length; i++) {
      newText += this.kapitalHurufPertama(pure[i])
      if (i !== pure.length - 1) {
        newText += ' '
      }
    }
    return newText
  }

  belakangKoma(angka: number) {
    return angka / Math.pow(10, angka.toString().replace(/\D/gi, '').length)
  }

  rupiahParser(angka: number) {
    if (typeof angka == 'number') {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
      }).format(angka)
    }
  }

  // Fungsi Routing

  public async index({ view, request }: HttpContextContract) {
    const kadar = request.input('kadar', 0)
    const sanitizedKadar = kadar < 4 && kadar >= 0 && kadar ? kadar : 0
    const bentuk = request.input('bentuk', 0)
    const sanitizedBentuk = bentuk < 8 && bentuk >= 0 && bentuk ? bentuk : 0
    const cari = request.input('cari', '')

    const kelompoks = await Kelompok.query()
      .preload('bentuk')
      .preload('kadar')
      .if(cari !== '', (query) => {
        query.where('nama', 'like', `%${cari}%`)
      })
      .if(sanitizedBentuk > 0 && sanitizedBentuk < 8, (query) => {
        query.where('bentuk_id', sanitizedBentuk)
      })
      .if(sanitizedKadar > 0 && sanitizedKadar < 4, (query) => {
        query.where('kadar_id', sanitizedKadar)
      })

    let tambahan = {
      pencarian: cari,
      kadar: sanitizedKadar,
      bentuk: sanitizedBentuk,
    }

    return view.render('transaksi/penjualan/base', { kelompoks, tambahan })
  }

  public async phase2({ view, request, response, session }: HttpContextContract) {
    // kelompokTerpilih
    const kunci = request.input('kt')

    // kemungkinan kalau dah kompleks bakal pake transaction

    try {
      const kelompok = await Kelompok.query()
        .withScopes((scopes) => {
          scopes.adaStokTidakDihapus()
        })
        .where('id', kunci)
        .preload('kadar')
        .preload('bentuk', (bentukQuery) => {
          bentukQuery.preload('models', (modelQuery) => {
            modelQuery.whereNull('deleted_at')
          })
        })
        .firstOrFail()

      return view.render('transaksi/penjualan/phase2', { kelompok })
    } catch (error) {
      session.flash('errorServerThingy', 'Kelompok yang ada pilih tidak valid!')
      return response.redirect().toPath('/app/transaksi/penjualan')
    }
  }

  public async phase3({ request, response, session }: HttpContextContract) {
    const newPenjualanSchema = schema.create({
      id: schema.number([
        rules.unsigned(),
        rules.exists({
          table: 'kelompoks',
          column: 'id',
          where: {
            deleted_at: null,
          },
          whereNot: {
            stok: 0,
          },
        }),
      ]),
      jualKode: schema.string({ trim: true }, [rules.maxLength(30)]),
      jualModel: schema.number([
        rules.unsigned(),
        rules.exists({
          table: 'models',
          column: 'id',
          where: {
            deleted_at: null,
          },
        }),
      ]),
      jualStatusPerhiasan: schema.enum(['Normal', 'Baru']),
      jualKeterangan: schema.string.optional({ trim: true }, [rules.maxLength(100)]),
      jualBeratDesimal: schema.number([rules.unsigned()]),
      jualKondisi: schema.string.optional({ trim: true }, [rules.maxLength(100)]),
      jualFotoBarangBase64: schema.string(),
      jualNamaPembeli: schema.string.optional({ trim: true }, [rules.maxLength(50)]),
      jualGenderPembeli: schema.enum.optional(['L', 'P']),
      jualUsiaPembeli: schema.number.optional([
        rules.range(1, 3),
        rules.exists({ table: 'rentang_usias', column: 'id' }),
      ]),
    })

    const validrequest = await request.validate({ schema: newPenjualanSchema })

    let namaFileFoto = ''
    // typescript ngga mau kalau ambigu, buat ngeyakinin mereka kalo ini string, kudu eksplisit
    let fileFoto = validrequest.jualFotoBarangBase64 || ''

    try {
      if (!isBase64(fileFoto, { mimeRequired: true, allowEmpty: false }) || fileFoto === '') {
        throw new Error('gambar tidak valid')
      }

      var block = fileFoto.split(';')
      var realData = block[1].split(',')[1] // In this case "iVBORw0KGg...."
      namaFileFoto = 'PJ' + DateTime.now().toMillis() + '.jpg'

      // ntar di resize buffernya pake sharp dulu jadi 300x300
      const buffer = Buffer.from(realData, 'base64')
      await Drive.put('transaksi/penjualan/' + namaFileFoto, buffer)
    } catch (error) {
      console.log(error)
      namaFileFoto = ''
    }

    try {
      const kelompok = await Kelompok.findOrFail(validrequest.id)
      const kadar = await Kadar.findOrFail(kelompok.kadarId)

      // udah difilter di validasi, jd gaperlu lagi kayaknya, tinggal pake
      // const model = await Model.findOrFail(validrequest.jualModel)

      let perhisanBaru = validrequest.jualStatusPerhiasan === 'Baru'
      let berat = kelompok.beratKelompok + validrequest.jualBeratDesimal
      // diatas 0.5, potongan dihitung penuh
      let beratKhususPotongan = (validrequest.jualBeratDesimal >= 0.5)? kelompok.beratKelompok + 1 : berat
      let harga = perhisanBaru
        ? berat * kadar.hargaPerGramBaru
        : berat * kadar.hargaPerGramNormal

      let preNominalPotongan = perhisanBaru ? kadar.potonganBaru : kadar.potonganNormal
      let deskrpsiPotongan = kadar.apakahPotonganPersen
        ? preNominalPotongan + '% dari harga jual'
        : this.rupiahParser(preNominalPotongan) + ' per gram'
      let hitungPotongan = kadar.apakahPotonganPersen
        ? (harga * preNominalPotongan) / 100
        : beratKhususPotongan * preNominalPotongan

      const penjualanBaru = await kelompok.related('penjualans').create({
        kodeTransaksi: 'PJ-' + DateTime.now().toMillis() + '-TEST', // ntar ganti, jelek bat wakkaka
        kodePerhiasan: validrequest.jualKode,
        modelId: validrequest.jualModel,
        apakahPerhiasanBaru: perhisanBaru,
        keterangan: validrequest.jualKeterangan,
        beratSebenarnya: berat,
        kondisi: validrequest.jualKondisi,
        fotoBarang: namaFileFoto == '' ? null : namaFileFoto,
        potonganDeskripsi: deskrpsiPotongan,
        potonganNominal: hitungPotongan, // bentar
        hargaJualAkhir: harga,
        namaPemilik: validrequest.jualNamaPembeli || null,
        genderPemilik: validrequest.jualGenderPembeli || null,
        rentangUsiaId: validrequest.jualUsiaPembeli || null,
        penggunaId: 1, // ini harusnya diganti yang lagi aktif sekarang
      })

      // return response.redirect().toPath('/app/penjualan/selesai')
      return 'berhasil'
    } catch (error) {
      console.error(error)
      await Drive.delete(namaFileFoto)
      session.flash('errorServerThingy', 'Kelompok yang ada pilih tidak valid!')
      return response.redirect().withQs().back()
    }
  }

  public async create({}: HttpContextContract) {}

  public async store({}: HttpContextContract) {}

  public async show({}: HttpContextContract) {}

  public async edit({}: HttpContextContract) {}

  public async update({}: HttpContextContract) {}

  public async destroy({}: HttpContextContract) {}
}
