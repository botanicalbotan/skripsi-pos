import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Pengguna from 'App/Models/akun/Pengguna'
import Drive from '@ioc:Adonis/Core/Drive'
import { DateTime } from 'luxon'
import Pengaturan from 'App/Models/sistem/Pengaturan'
import Kadar from 'App/Models/barang/Kadar'
import Database from '@ioc:Adonis/Lucid/Database'
import Penjualan from 'App/Models/transaksi/Penjualan'
import Gadai from 'App/Models/transaksi/Gadai'
import User from 'App/Models/User'
import Hash from '@ioc:Adonis/Core/Hash'
var isBase64 = require('is-base64')
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { prepareRekap } from 'App/CustomClasses/CustomRekapHarian'
import Pasaran from 'App/Models/sistem/Pasaran'

export default class PengaturansController {
  public async checkCreditPengubah({ request, response, auth }: HttpContextContract) {
    const pass = request.input('pass')

    try {
      if (!auth.user) throw 'ngga valid'

      if (!pass) throw 'Password tidak boleh kosong!'

      const userPengakses = await User.findOrFail(auth.user.id) // USER bukan PENGGUNA
      await userPengakses.load('pengguna', (query) => {
        query.preload('jabatan')
      })

      if (userPengakses.pengguna.jabatan.nama !== 'Pemilik') {
        throw 'Anda tidak memiliki hak untuk melakukan perubahan!'
      }

      if (await Hash.verify(userPengakses.password, pass)) {
        return response.ok({ message: 'Ok' })
      } else {
        throw 'Password yang anda isikan tidak tepat!'
      }
    } catch (error) {
      console.error(error)
      if (typeof error === 'string') {
        return response.badRequest({ error: error })
      } else {
        return response.badRequest({ error: 'Ada masalah pada server!' })
      }
    }
  }

  public async checkCreditPengubahKhusus({ request, response, auth }: HttpContextContract) {
    const pass = request.input('pass')

    try {
      if (!auth.user) throw 'ngga valid'

      if (!pass) throw 'Password tidak boleh kosong!'

      const userPengakses = await User.findOrFail(auth.user.id) // USER bukan PENGGUNA
      await userPengakses.load('pengguna', (query) => {
        query.preload('jabatan')
      })

      if (
        userPengakses.pengguna.jabatan.nama !== 'Pemilik' &&
        userPengakses.pengguna.jabatan.nama !== 'Kepala Toko'
      ) {
        throw 'Anda tidak memiliki hak untuk melakukan perubahan!'
      }

      if (await Hash.verify(userPengakses.password, pass)) {
        return response.ok({ message: 'Ok' })
      } else {
        throw 'Password yang anda isikan tidak tepat!'
      }
    } catch (error) {
      console.error(error)
      if (typeof error === 'string') {
        return response.badRequest({ error: error })
      } else {
        return response.badRequest({ error: 'Ada masalah pada server!' })
      }
    }
  }

  // ========================================= TOKO ================================================
  public async pageToko({ view }: HttpContextContract) {
    // Ini udah make middleware
    const pengaturan = await Pengaturan.findOrFail(1)
    await pengaturan.load('pasarans')

    let teksPasaran = ''

    for (let i = 0; i < pengaturan.pasarans.length; i++) {
      teksPasaran += kapitalHurufPertama(pengaturan.pasarans[i].hari)
      if (i < pengaturan.pasarans.length - 1) {
        teksPasaran += ', '
      }
    }

    let tambahan = {
      adaLogo: await Drive.exists('logoToko/' + pengaturan.logoToko),
      teksPasaran,
    }
    return await view.render('pengaturan/atur-toko', { pengaturan, tambahan })
  }

  public async gantiLogo({ request, response }: HttpContextContract) {
    let input = request.input('fileFoto')
    let fileFoto: string = input || ''
    let namaFileFoto = ''

    try {
      if (!isBase64(fileFoto, { mimeRequired: true, allowEmpty: false }) || fileFoto === '') {
        throw 'Ngga valid'
      }

      const pengaturan = await Pengaturan.findOrFail(1)

      var block = fileFoto.split(';')
      var realData = block[1].split(',')[1] // In this case "iVBORw0KGg...."
      namaFileFoto = `LT-I${pengaturan.id}-${DateTime.now().toMillis()}.jpg` // bisa diganti yang lebih propper

      // ntar di resize buffernya pake sharp dulu jadi 300x300
      const buffer = Buffer.from(realData, 'base64')
      await Drive.put('logoToko/' + namaFileFoto, buffer)

      pengaturan.logoToko = namaFileFoto
      await pengaturan.save()

      return response.ok({ message: 'Ok' })
    } catch (error) {
      console.log(error)
      return response.badRequest({ error: 'File foto tidak valid!' })
    }
  }

  public async hapusLogo({ response }: HttpContextContract) {
    try {
      const pengaturan = await Pengaturan.findOrFail(1)
      await Drive.delete('logoToko/' + pengaturan.logoToko)
      pengaturan.logoToko = null
      await pengaturan.save()

      return response.ok({ message: 'Ok' })
    } catch (error) {
      return response.badRequest({ error: 'Permintaan tidak valid!' })
    }
  }

  public async ubahNamaToko({ request, response }: HttpContextContract) {
    const newNamaSchema = schema.create({
      newNama: schema.string({ trim: true }, [rules.maxLength(50)]),
    })

    try {
      // udah kesambung middleware, ngga perlu ngecek auth lagi
      const validrequest = await request.validate({ schema: newNamaSchema })

      const pengaturan = await Pengaturan.findOrFail(1)
      pengaturan.namaToko = validrequest.newNama
      await pengaturan.save()

      return response.ok({ message: 'Nama toko berhasil diubah' })
    } catch (error) {
      if (typeof error === 'string') {
        return response.badRequest({ error: error })
      } else {
        return response.badRequest({ error: 'Ada masalah pada server!' })
      }
    }
  }

  public async ubahAlamatToko({ request, response }: HttpContextContract) {
    const newAlamatSchema = schema.create({
      newAlamat: schema.string({ trim: true }, [rules.maxLength(100)]),
    })

    try {
      // udah kesambung middleware, ngga perlu ngecek auth lagi
      const validrequest = await request.validate({ schema: newAlamatSchema })

      const pengaturan = await Pengaturan.findOrFail(1)
      pengaturan.alamatTokoLengkap = validrequest.newAlamat
      await pengaturan.save()

      return response.ok({ message: 'Alamat toko berhasil diubah' })
    } catch (error) {
      if (typeof error === 'string') {
        return response.badRequest({ error: error })
      } else {
        return response.badRequest({ error: 'Ada masalah pada server!' })
      }
    }
  }

  public async ubahAlamatSingkatToko({ request, response }: HttpContextContract) {
    const newAlamatSingkatSchema = schema.create({
      newAlamatSingkat: schema.string({ trim: true }, [rules.maxLength(50)]),
    })

    try {
      // udah kesambung middleware, ngga perlu ngecek auth lagi
      const validrequest = await request.validate({ schema: newAlamatSingkatSchema })

      const pengaturan = await Pengaturan.findOrFail(1)
      pengaturan.alamatTokoSingkat = validrequest.newAlamatSingkat
      await pengaturan.save()

      return response.ok({ message: 'Alamat singkat toko berhasil diubah' })
    } catch (error) {
      if (typeof error === 'string') {
        return response.badRequest({ error: error })
      } else {
        return response.badRequest({ error: 'Ada masalah pada server!' })
      }
    }
  }

  public async ubahHariPasaran({ request, response }: HttpContextContract) {
    const newPasaranSchema = schema.create({
      pasarPon: schema.boolean(),
      pasarWage: schema.boolean(),
      pasarKliwon: schema.boolean(),
      pasarLegi: schema.boolean(),
      pasarPahing: schema.boolean(),
    })

    try {
      // udah kesambung middleware, ngga perlu ngecek auth lagi
      const validrequest = await request.validate({ schema: newPasaranSchema })
      const pengaturan = await Pengaturan.findOrFail(1)

      // tbh ini prakteknya beneran juelek banget, ntar PERLU BANGET DIGANTI

      // reset semua record di pengaturan_pasarans
      await Database.from('pengaturan_pasarans').where('pengaturan_id', pengaturan.id).delete()

      // mulai cek satu-satu
      if (validrequest.pasarPon) {
        const pasar = await Pasaran.findByOrFail('hari', 'pon')

        await pengaturan.related('pasarans').attach({
          [pasar.id]: {},
        })
      }

      if (validrequest.pasarWage) {
        const pasar = await Pasaran.findByOrFail('hari', 'wage')

        await pengaturan.related('pasarans').attach({
          [pasar.id]: {},
        })
      }

      if (validrequest.pasarKliwon) {
        const pasar = await Pasaran.findByOrFail('hari', 'kliwon')

        await pengaturan.related('pasarans').attach({
          [pasar.id]: {},
        })
      }

      if (validrequest.pasarLegi) {
        const pasar = await Pasaran.findByOrFail('hari', 'legi')

        await pengaturan.related('pasarans').attach({
          [pasar.id]: {},
        })
      }

      if (validrequest.pasarPahing) {
        const pasar = await Pasaran.findByOrFail('hari', 'pahing')

        await pengaturan.related('pasarans').attach({
          [pasar.id]: {},
        })
      }

      return response.ok({ message: 'Hari pasaran toko berhasil diubah' })
    } catch (error) {
      console.log(error)
      if (typeof error === 'string') {
        return response.badRequest({ error: error })
      } else {
        return response.badRequest({ error: 'Ada masalah pada server!' })
      }
    }
  }

  // =======================================- KADAR ===================================================
  public async pageKadar({ view }: HttpContextContract) {
    // Ini udah make middleware

    const kadars = await Kadar.query().orderBy('id', 'asc')

    return await view.render('pengaturan/atur-kadar', { kadars })
  }

  // ======================================= TRANSAKSI ================================================
  public async pageTransaksi({ view }: HttpContextContract) {
    // Ini udah make middleware
    const pengaturan = await Pengaturan.findOrFail(1)

    const fungsi = {
      rupiahParser: rupiahParser,
    }

    return await view.render('pengaturan/atur-transaksi', { pengaturan, fungsi })
  }

  public async getDataTransaksi({ response }: HttpContextContract) {
    try {
      const toko = await Database.from('pengaturans')
        .select(
          'default_boleh_print_nota as izinCetakNota',
          'default_waktu_maksimal_print_nota as waktuMaksimalCetakNota',
          'penalti_telat_janji_min as penaltiTelatJanjiTTMin',
          'penalti_telat_janji_max as penaltiTelatJanjiTTMax',
          'default_waktu_maksimal_pengajuan_gadai as waktuMaksimalPengajuanGadai',
          'harga_mal as hargaMal'
        )
        .where('id', 1)
        .first()

      return { toko }
    } catch (error) {
      return response.badRequest({ error: 'Ada error di toko' })
    }
  }

  public async ubahIzinCetakNota({ request, response }: HttpContextContract) {
    const newIzinCetakSchema = schema.create({
      newIzin: schema.boolean(),
    })

    try {
      // udah kesambung middleware, ngga perlu ngecek auth lagi
      const validrequest = await request.validate({ schema: newIzinCetakSchema })

      const pengaturan = await Pengaturan.findOrFail(1)
      pengaturan.defaultBolehPrintNota = validrequest.newIzin
      await pengaturan.save()

      return response.ok({ message: 'Default izin cetak nota transaksi penjualan berhasil diubah' })
    } catch (error) {
      if (typeof error === 'string') {
        return response.badRequest({ error: error })
      } else {
        return response.badRequest({ error: 'Ada masalah pada server!' })
      }
    }
  }

  public async ubahWaktuMaksimalCetakNota({ request, response }: HttpContextContract) {
    const newWaktuCetakSchema = schema.create({
      newWaktuCetak: schema.number([
        rules.unsigned(),
        rules.range(0, 60), // kalau ngubah ini, jangan lupa ngubah yang di js pengaturan transaksi
      ]),
    })

    try {
      // udah kesambung middleware, ngga perlu ngecek auth lagi
      const validrequest = await request.validate({ schema: newWaktuCetakSchema })

      const pengaturan = await Pengaturan.findOrFail(1)
      pengaturan.defaultWaktuMaksimalPrintNota = validrequest.newWaktuCetak
      await pengaturan.save()

      return response.ok({ message: 'Waktu maksimum cetak nota penjualan berhasil diubah' })
    } catch (error) {
      if (typeof error === 'string') {
        return response.badRequest({ error: error })
      } else {
        return response.badRequest({ error: 'Ada masalah pada server!' })
      }
    }
  }

  public async ubahPenaltiTelatTTMin({ request, response }: HttpContextContract) {
    const newPenaltiMinSchema = schema.create({
      newPenaltiMin: schema.number([rules.unsigned()]),
    })

    try {
      // udah kesambung middleware, ngga perlu ngecek auth lagi
      const validrequest = await request.validate({ schema: newPenaltiMinSchema })

      const pengaturan = await Pengaturan.findOrFail(1)
      pengaturan.penaltiTelatJanjiMin = validrequest.newPenaltiMin
      await pengaturan.save()

      return response.ok({
        message: 'Penalti minimum keterlambatan tukar tambah dengan janji berhasil diubah',
      })
    } catch (error) {
      if (typeof error === 'string') {
        return response.badRequest({ error: error })
      } else {
        return response.badRequest({ error: 'Ada masalah pada server!' })
      }
    }
  }

  public async ubahPenaltiTelatTTMax({ request, response }: HttpContextContract) {
    const newPenaltiMaxSchema = schema.create({
      newPenaltiMax: schema.number([rules.unsigned()]),
    })

    try {
      // udah kesambung middleware, ngga perlu ngecek auth lagi
      const validrequest = await request.validate({ schema: newPenaltiMaxSchema })

      const pengaturan = await Pengaturan.findOrFail(1)
      pengaturan.penaltiTelatJanjiMax = validrequest.newPenaltiMax
      await pengaturan.save()

      return response.ok({
        message: 'Penalti maksimum keterlambatan tukar tambah dengan janji berhasil diubah',
      })
    } catch (error) {
      if (typeof error === 'string') {
        return response.badRequest({ error: error })
      } else {
        return response.badRequest({ error: 'Ada masalah pada server!' })
      }
    }
  }

  // public async ubahWaktuMaksimalPengajuanGadai({ request, response }: HttpContextContract) {
  //   const newWaktuGadaiSchema = schema.create({
  //     newWaktuAju: schema.number([
  //       rules.unsigned(),
  //       rules.range(0, 60), // kalau ngubah ini, jangan lupa ngubah yang di js pengaturan transaksi
  //     ]),
  //   })

  //   try {
  //     // udah kesambung middleware, ngga perlu ngecek auth lagi
  //     const validrequest = await request.validate({ schema: newWaktuGadaiSchema })

  //     const pengaturan = await Pengaturan.findOrFail(1)
  //     pengaturan.defaultWaktuMaksimalPengajuanGadai = validrequest.newWaktuAju
  //     await pengaturan.save()

  //     return response.ok({ message: 'Waktu maksimum cetak nota penjualan berhasil diubah' })
  //   } catch (error) {
  //     if (typeof error === 'string') {
  //       return response.badRequest({ error: error })
  //     } else {
  //       return response.badRequest({ error: 'Ada masalah pada server!' })
  //     }
  //   }
  // }

  public async ubahHargaMal({ request, response }: HttpContextContract) {
    const newHargaMalSchema = schema.create({
      newHargaMal: schema.number([rules.unsigned()]),
    })

    try {
      // udah kesambung middleware, ngga perlu ngecek auth lagi
      const validrequest = await request.validate({ schema: newHargaMalSchema })

      const pengaturan = await Pengaturan.findOrFail(1)
      pengaturan.hargaMal = validrequest.newHargaMal
      await pengaturan.save()

      return response.ok({ message: 'Harga mal berhasil diubah' })
    } catch (error) {
      if (typeof error === 'string') {
        return response.badRequest({ error: error })
      } else {
        return response.badRequest({ error: 'Ada masalah pada server!' })
      }
    }
  }

  // ======================================== SALDO ===================================================
  public async pageSaldo({ view }: HttpContextContract) {
    // Ini udah make middleware
    const pengaturan = await Pengaturan.findOrFail(1)
    const rekap = await prepareRekap()
    if(rekap.apakahSudahBandingSaldo){
      await rekap.load('pencatatBanding', (query) => {
        query.preload('jabatan')
      })
    }

    const fungsi = {
      rupiahParser: rupiahParser,
    }

    return await view.render('pengaturan/atur-saldo', { pengaturan, rekap, fungsi })
  }

  public async bandingSaldoToko({ response, request, auth }: HttpContextContract) {
    const newBandingSaldoSchema = schema.create({
      saldoRiil: schema.number([rules.unsigned()]),
    })

    try {
      if (!auth.user) throw 'Tidak ada izin'

      const validrequest = await request.validate({ schema: newBandingSaldoSchema })
      const pengaturan = await Pengaturan.findOrFail(1)

      const userPengakses = await User.findOrFail(auth.user.id)
      await userPengakses.load('pengguna')

      const rekap = await prepareRekap()
      rekap.pencatatBandingId = userPengakses.pengguna.id
      rekap.dibandingAt = DateTime.now()
      rekap.saldoTokoReal = validrequest.saldoRiil
      rekap.saldoTokoTerakhir = pengaturan.saldoToko
      rekap.apakahSudahBandingSaldo = true
      await rekap.save()

      const selisih = validrequest.saldoRiil - pengaturan.saldoToko

      return response.ok({
        message:
          'Selisih antara saldo toko pada sistem dengan saldo toko sebenarnya adalah: ' +
          rupiahParser(selisih),
        selisih: rupiahParser(selisih),
      })
    } catch (error) {
      if (typeof error === 'string') {
        return response.badRequest({ error: error })
      } else {
        return response.badRequest({ error: 'Ada masalah pada server!' })
      }
    }
  }

  // =========================================== BARANG ================================================
  public async pageBarang({ view }: HttpContextContract) {
    // Ini udah make middleware
    const pengaturan = await Pengaturan.findOrFail(1)

    return await view.render('pengaturan/atur-barang', { pengaturan })
  }

  public async getDataBarang({ response }: HttpContextContract) {
    try {
      const toko = await Database.from('pengaturans')
        .select(
          'default_stok_minimal_kelompok as stokMinimumKelompok',
          'default_ingatkan_stok_menipis as peringatanStokMenipis'
        )
        .where('id', 1)
        .first()

      return { toko }
    } catch (error) {
      return response.badRequest({ error: 'Ada error di toko' })
    }
  }

  public async ubahMinimalStokKelompok({ request, response }: HttpContextContract) {
    const newMinimalStokSchema = schema.create({
      newStokMin: schema.number([rules.unsigned()]),
    })

    try {
      // udah kesambung middleware, ngga perlu ngecek auth lagi
      const validrequest = await request.validate({ schema: newMinimalStokSchema })

      const pengaturan = await Pengaturan.findOrFail(1)
      pengaturan.defaultStokMinimalKelompok = validrequest.newStokMin
      await pengaturan.save()

      return response.ok({ message: 'Stok minimum kelompok perhiasan berhasil diubah' })
    } catch (error) {
      if (typeof error === 'string') {
        return response.badRequest({ error: error })
      } else {
        return response.badRequest({ error: 'Ada masalah pada server!' })
      }
    }
  }

  public async ubahPeringatanStokMenipis({ request, response }: HttpContextContract) {
    const newPeringatanStokSchema = schema.create({
      newPeri: schema.boolean(),
    })

    try {
      // udah kesambung middleware, ngga perlu ngecek auth lagi
      const validrequest = await request.validate({ schema: newPeringatanStokSchema })

      const pengaturan = await Pengaturan.findOrFail(1)
      pengaturan.defaultIngatkanStokMenipis = validrequest.newPeri
      await pengaturan.save()

      return response.ok({ message: 'Default peringatan stok kelompok menipis berhasil diubah' })
    } catch (error) {
      if (typeof error === 'string') {
        return response.badRequest({ error: error })
      } else {
        return response.badRequest({ error: 'Ada masalah pada server!' })
      }
    }
  }

  // ========================================== PEGAWAI ================================================
  public async pagePegawai({ view }: HttpContextContract) {
    // Ini udah make middleware
    const pengaturan = await Pengaturan.findOrFail(1)

    const fungsi = {
      rupiahParser: rupiahParser,
    }

    return await view.render('pengaturan/atur-pegawai', { pengaturan, fungsi })
  }

  public async getDataPegawai({ response }: HttpContextContract) {
    try {
      const toko = await Database.from('pengaturans')
        .select('default_gaji_karyawan as gajiMinimumPegawai')
        .where('id', 1)
        .first()

      return { toko }
    } catch (error) {
      return response.badRequest({ error: 'Ada error di toko' })
    }
  }

  public async ubahMinimalGajiPegawai({ request, response }: HttpContextContract) {
    const newMinimalGajiSchema = schema.create({
      newGajiMin: schema.number([rules.unsigned()]),
    })

    try {
      // udah kesambung middleware, ngga perlu ngecek auth lagi
      const validrequest = await request.validate({ schema: newMinimalGajiSchema })

      const pengaturan = await Pengaturan.findOrFail(1)
      pengaturan.defaultGajiKaryawan = validrequest.newGajiMin
      await pengaturan.save()

      return response.ok({ message: 'Harga mal berhasil diubah' })
    } catch (error) {
      if (typeof error === 'string') {
        return response.badRequest({ error: error })
      } else {
        return response.badRequest({ error: 'Ada masalah pada server!' })
      }
    }
  }

  // ========================================= SELAINNYA ================================================
  public async getMyToko({ response }: HttpContextContract) {
    try {
      const toko = await Database.from('pengaturans')
        .select('nama_toko as namaToko')
        .select('alamat_toko_singkat as alamatTokoSingkat')
        .select('alamat_toko_lengkap as alamatTokoLengkap')
        .where('id', 1)
        .first()

      return { toko }
    } catch (error) {
      return response.badRequest({ error: 'Ada error di toko' })
    }
  }

  public async ambilFoto({ params, response }: HttpContextContract) {
    try {
      if (params.tipe === 'pegawai') {
        const pegawai = await Pengguna.findOrFail(params.id)
        if (await Drive.exists('profilePict/' + pegawai.foto)) {
          // kalo ngga di giniin, ntar bakal infinite await kalo file gaada
          const foto = await Drive.getStream('profilePict/' + pegawai.foto) // ntar diganti jadi dinamis dari db, sama diresize dulu kali hmmm
          response.stream(foto)
          response.header('content-type', 'image/png')
        } else {
          throw 'kosong pegawai'
        }
      } else if (params.tipe === 'penjualan') {
        const penjualan = await Penjualan.findOrFail(params.id)
        if (await Drive.exists('transaksi/penjualan/' + penjualan.fotoBarang)) {
          // kalo ngga di giniin, ntar bakal infinite await kalo file gaada
          const foto = await Drive.getStream('transaksi/penjualan/' + penjualan.fotoBarang) // ntar diganti jadi dinamis dari db, sama diresize dulu kali hmmm
          response.stream(foto)
          response.header('content-type', 'image/png')
        } else {
          throw 'kosong penjualan'
        }
      } else if (params.tipe === 'gadai') {
        const gadai = await Gadai.findOrFail(params.id)
        if (
          (await Drive.exists('transaksi/gadai/barang/' + gadai.fotoBarang)) &&
          gadai.fotoBarang
        ) {
          // kalo ngga di giniin, ntar bakal infinite await kalo file gaada
          const foto = await Drive.getStream('transaksi/gadai/barang/' + gadai.fotoBarang) // ntar diganti jadi dinamis dari db, sama diresize dulu kali hmmm
          response.stream(foto)
          response.header('content-type', 'image/png')
        } else {
          throw 'kosong gadai'
        }
      } else if (params.tipe === 'logo-toko') {
        const pengaturan = await Pengaturan.findOrFail(1)
        if (await Drive.exists('logoToko/' + pengaturan.logoToko)) {
          // kalo ngga di giniin, ntar bakal infinite await kalo file gaada
          const foto = await Drive.getStream('logoToko/' + pengaturan.logoToko) // ntar diganti jadi dinamis dari db, sama diresize dulu kali hmmm
          response.stream(foto)
          response.header('content-type', 'image/png')
        } else {
          throw 'kosong logo'
        }
      } else {
        throw 'kosong gabener'
      }
    } catch (error) {
      // return response.notFound('File not found.')
      // console.log(error)
      return {} // biar ngga ngasi error di image
    }
  }

  public async ambilFotoSecret({ params, response }: HttpContextContract) {
    try {
      if (params.tipe === 'gadai') {
        const gadai = await Gadai.findOrFail(params.id)
        if (await Drive.exists('transaksi/gadai/katepe/' + gadai.fotoKtpPenggadai)) {
          // kalo ngga di giniin, ntar bakal infinite await kalo file gaada
          const fotoBarang = await Drive.getStream(
            'transaksi/gadai/katepe/' + gadai.fotoKtpPenggadai
          ) // ntar diganti jadi dinamis dari db, sama diresize dulu kali hmmm
          response.stream(fotoBarang)
          response.header('content-type', 'image/png')
        } else {
          throw 'kosong pegawai'
        }
      } else {
        throw 'kosong gabener'
      }
    } catch (error) {
      return {} // biar ngga ngasi error di image
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

function kapitalHurufPertama(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1)
}
