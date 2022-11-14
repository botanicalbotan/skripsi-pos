import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { DateTime } from 'luxon'
import User from 'App/Models/User'
var isBase64 = require('is-base64')
import Drive from '@ioc:Adonis/Core/Drive'
import StatusGadai from 'App/Models/transaksi/StatusGadai'
import Gadai from 'App/Models/transaksi/Gadai'
import TipeNotif from 'App/Models/sistem/TipeNotif'
import Pengaturan from 'App/Models/sistem/Pengaturan'
import KodeProduksi from 'App/Models/barang/KodeProduksi'
import Kerusakan from 'App/Models/barang/Kerusakan'
import { prepareRekap } from 'App/CustomClasses/CustomRekapHarian'

export default class GadaisController {
  public async index({ view, request }: HttpContextContract) {
    const opsiOrder = [
      'gadais.tanggal_tenggat',
      'gadais.nama_penggadai',
      'status_gadais.status',
      'gadais.nominal_gadai',
      'gagais.dilunasi_at',
    ]
    const page = request.input('page', 1)
    const order = request.input('ob', 0)
    const cari = request.input('cari', '')
    const sanitizedOrder = order < opsiOrder.length && order >= 0 && order ? order : 0
    const arahOrder = request.input('aob', 0)
    const sanitizedArahOrder = arahOrder == 1 ? 1 : 0
    const filterShow = request.input('fs', 0)
    const sanitizedFilterShow = filterShow == 1 ? 1 : 0
    const limit = 10

    const gadais = await Database.from('gadais')
      .join('status_gadais', 'gadais.status_gadai_id', 'status_gadais.id')
      .whereNull('gadais.deleted_at')
      .select(
        'gadais.id as id',
        'gadais.tanggal_tenggat as tanggalTenggat',
        'gadais.nama_penggadai as namaPenggadai',
        'gadais.alamat_penggadai as alamatPenggadai',
        'gadais.nominal_gadai as nominalGadai',
        'status_gadais.status as status'
      )
      .if(cari !== '', (query) => {
        query.where('gadais.nama_penggadai', 'like', `%${cari}%`)
      })
      .if(sanitizedFilterShow == 0, (query) => {
        // kalau ngga ada fs, defaultnya cuma nampilin yang belom tuntas (berjalan ama terlambat)
        query
          .where((query) => {
            // harus diginiin ternyata kalau mau bikin OR logic didalem AND
            query
              .where('status_gadais.status', 'berjalan')
              .orWhere('status_gadais.status', 'terlambat')
          })
          .andWhereNull('gadais.dilunasi_at')
      })
      .orderBy(opsiOrder[sanitizedOrder], sanitizedArahOrder == 1 ? 'desc' : 'asc')
      .orderBy('gadais.tanggal_tenggat')
      .paginate(page, limit)

    gadais.baseUrl('/app/transaksi/gadai')

    let qsParam = {
      ob: sanitizedOrder,
      aob: sanitizedArahOrder,
    }

    if (cari !== '') qsParam['cari'] = cari
    if (sanitizedFilterShow !== 0) qsParam['fs'] = sanitizedFilterShow

    gadais.queryString(qsParam)

    let firstPage =
      gadais.currentPage - 2 > 0
        ? gadais.currentPage - 2
        : gadais.currentPage - 1 > 0
        ? gadais.currentPage - 1
        : gadais.currentPage
    let lastPage =
      gadais.currentPage + 2 <= gadais.lastPage
        ? gadais.currentPage + 2
        : gadais.currentPage + 1 <= gadais.lastPage
        ? gadais.currentPage + 1
        : gadais.currentPage

    if (lastPage - firstPage < 4 && gadais.lastPage > 4) {
      if (gadais.currentPage < gadais.firstPage + 2) {
        lastPage += 4 - (lastPage - firstPage)
      }

      if (lastPage == gadais.lastPage) {
        firstPage -= 4 - (lastPage - firstPage)
      }
    }
    // sampe sini
    const tempLastData = 10 + (gadais.currentPage - 1) * limit

    const tanggalRefresh = await Database.from('refresh_gadais')
      .select('direfresh_at as direfreshAt')
      .orderBy('id', 'desc')
      .first()

    const tambahan = {
      pengurutan: sanitizedOrder,
      pencarian: cari,
      filterShow: sanitizedFilterShow,
      firstPage: firstPage,
      lastPage: lastPage,
      firstDataInPage: 1 + (gadais.currentPage - 1) * limit,
      lastDataInPage: tempLastData >= gadais.total ? gadais.total : tempLastData,
      direfreshAt: tanggalRefresh && tanggalRefresh.direfreshAt ? tanggalRefresh.direfreshAt : null,
    }

    const fungsi = {
      rupiahParser: rupiahParser,
      potongTeks: potongTeks,
    }

    let roti = [
      {
        laman: 'Gadai',
      },
    ]

    return await view.render('transaksi/gadai/list-gadai', {
      gadais,
      tambahan,
      fungsi,
      roti
    })
  }

  // baru
  public async form({ view }: HttpContextContract) {
    const kadars = await Database.from('kadars').select('id', 'nama')

    const pengaturan = await Pengaturan.findOrFail(1)

    let roti = [
      {
        laman: 'Gadai',
        alamat: '/app/transaksi/gadai',
      },
      {
        laman: `Formulir Gadai`
      }
    ]

    return await view.render('transaksi/gadai/baru-form-gadai', {
      kadars,
      toko: {
        nama: pengaturan.namaToko,
        alamat: pengaturan.alamatTokoLengkap,
      },
      roti
    })
  }

  // baru
  public async simpanGadai({ request, session, auth, response }: HttpContextContract) {
    const newHitungGadaiSchema = schema.create({
      // mulai form 1
      f1NamaPenggadai: schema.string({ trim: true }, [rules.maxLength(50)]),
      f1NikPenggadai: schema.string({ trim: true }, [rules.maxLength(16)]),
      f1AlamatPenggadai: schema.string({ trim: true }, [rules.maxLength(100)]),
      f1NoHpAktif: schema.string({ trim: true }, [rules.maxLength(15)]),
      f1TanggalTenggat: schema.date({}, [rules.afterOrEqual('today')]),
      f1Keterangan: schema.string.optional({ trim: true }, [rules.maxLength(100)]),

      // mulai form 2
      f2KelengkapanNota: schema.enum(['tanpa', 'dengan'] as const),
      f2AsalPerhiasan: schema.enum(['luar', 'leo'] as const),
      f2NamaToko: schema.string.optional(
        {
          trim: true,
        },
        [rules.maxLength(50)]
      ), // masih belom yakin dipake apa ngga
      f2AlamatToko: schema.string.optional(
        {
          trim: true,
        },
        [rules.maxLength(100), rules.requiredWhen('kelengkapanNota', '=', 'dengan')]
      ), // boleh null
      f2Kodepro: schema.number([
        rules.unsigned(),
        rules.exists({
          table: 'kode_produksis',
          column: 'id',
          where: {
            deleted_at: null,
          },
        }),
      ]),
      f2Model: schema.number([
        rules.unsigned(),
        rules.exists({
          table: 'models',
          column: 'id',
          where: {
            deleted_at: null,
          },
        }),
      ]),
      f2JenisStok: schema.enum(['lama', 'baru'] as const),
      f2KeteranganCatatan: schema.string.optional(
        {
          trim: true,
        },
        [rules.maxLength(100)]
      ),
      f2BeratNota: schema.number.optional([
        rules.unsigned(),
        rules.requiredWhen('kelengkapanNota', '=', 'dengan'),
      ]),
      f2BeratBarang: schema.number([rules.unsigned()]),
      f2HargaJualNota: schema.number.optional([
        rules.unsigned(),
        rules.requiredWhen('kelengkapanNota', '=', 'dengan'),
      ]),
      f2PotonganNota: schema.number.optional([
        rules.unsigned(),
        rules.requiredWhen('asalPerhiasan', '=', 'leo'),
      ]),
      f2TanggalBeli: schema.date.optional({}, [
        rules.beforeOrEqual('today'),
        rules.requiredWhen('asalPerhiasan', '=', 'leo'),
      ]),
      idKerusakan: schema.array.optional([rules.minLength(1)]).members(
        schema.number([
          rules.unsigned(),
          rules.exists({
            table: 'kerusakans',
            column: 'id',
            where: {
              deleted_at: null,
            },
          }),
        ])
      ),
      jumlahKerusakan: schema.array
        .optional([rules.minLength(1)])
        .members(schema.number([rules.unsigned()])),

      // mulai form 3
      fotoKTPBase64: schema.string(),
      fotoPerhiasanBase64: schema.string(),

      // ini baru buat ngecek ditawar apa ngga
      apakahDitawar: schema.string.optional(), //cukup dicek undefined apa ngga, isinya ngga penting
      dealTawaran: schema.number([rules.unsigned()]),
    })

    const validrequest = await request.validate({
      schema: newHitungGadaiSchema,
    })

    let idTransaksi = await buatId()
    let namaFileFotoKtp = ''
    let fileFotoKtp = validrequest.fotoKTPBase64 || ''
    let namaFileFotoPerhiasan = ''
    let fileFotoPerhiasan = validrequest.fotoPerhiasanBase64 || ''

    try {
      // ------------- cek auth user --------------------
      if (!auth.user) throw 'auth ngga valid'

      const userPengakses = await User.findOrFail(auth.user.id)
      await userPengakses.load('pengguna')

      // --------------- Foto KTP -------------------
      try {
        if (
          !isBase64(fileFotoKtp, { mimeRequired: true, allowEmpty: false }) ||
          fileFotoKtp === ''
        ) {
          throw new Error('Input foto ktp tidak valid!')
        }

        var block = fileFotoKtp.split(';')
        var realData = block[1].split(',')[1] // In this case "iVBORw0KGg...."
        namaFileFotoKtp = 'GD001' + DateTime.now().toMillis() + idTransaksi + '.jpg' // bisa diganti yang lebih propper

        const buffer = Buffer.from(realData, 'base64')
        await Drive.put('transaksi/gadai/katepe/' + namaFileFotoKtp, buffer)
      } catch (error) {
        throw {
          custom: true,
          foto: true,
          perhiasan: false,
          error: 'Input foto ktp tidak valid!',
        }
      }

      // --------------- Foto Barang -------------------
      try {
        if (
          !isBase64(fileFotoPerhiasan, { mimeRequired: true, allowEmpty: false }) ||
          fileFotoPerhiasan === ''
        ) {
          throw new Error('Input foto barang tidak valid!')
        }

        var block = fileFotoPerhiasan.split(';')
        var realData = block[1].split(',')[1] // In this case "iVBORw0KGg...."
        namaFileFotoPerhiasan = 'GD002' + DateTime.now().toMillis() + idTransaksi + '.jpg' // bisa diganti yang lebih propper

        const buffer = Buffer.from(realData, 'base64')
        await Drive.put('transaksi/gadai/barang/' + namaFileFotoPerhiasan, buffer)
      } catch (error) {
        throw {
          custom: true,
          foto: true,
          perhiasan: true,
          error: 'Input foto barang tidak valid!',
        }
      }

      // ============================== PERSIAPAN HITUNG HARGA ======================================
      const kodepro = await KodeProduksi.findOrFail(validrequest.f2Kodepro)
      await kodepro.load('kadar')

      const pengaturan = await Pengaturan.findOrFail(1)

      // ------------ DILUAR --------------------
      let keteranganTransaksi = ''
      let rumusDipake = 'kosong' // ini buat testing

      // ------------ data nota -----------------
      let hargaJualNota = validrequest.f2HargaJualNota ? validrequest.f2HargaJualNota : 0
      let potonganDariNota = validrequest.f2PotonganNota ? validrequest.f2PotonganNota : 0

      // -------- potongan & penalti ------------
      let potongan = 0 // ini buat ngitung rumus

      // ----------- hitungan transaksi -------------
      let BERATVALID = 0
      const hargaMal = pengaturan.hargaMal
      let hargaPerGram = 0
      let apakahBisaDitawar = false
      let hargaBeliTarget = 0 // ini yang bakal dipake
      let hargaBeliMaksDitawar = 0 // ini mentok kalo ditawar

      // -------------- kerusakan ------------------
      let wadahRusak: Array<any> = []
      let ongkosRusak = 0
      let kondisiBarang = '' // uripan, rusak, rosok

      // ----------- DATA BARU TAWARAN --------------
      let apakahDitawar = validrequest.apakahDitawar ? true : false
      let hargaFinal = validrequest.dealTawaran
      let hargaPerGramFinal = hargaFinal / validrequest.f2BeratBarang

      // ==================================== SELEKSI DATA =======================================
      let apakahRusak = false // kalah ama rosok
      let apakahRosok = false
      let adaNotaLeo = false

      // --------------- cek & hitung rosok --------------------- OK
      if (
        validrequest.idKerusakan &&
        validrequest.idKerusakan.length > 0 &&
        validrequest.jumlahKerusakan &&
        validrequest.jumlahKerusakan.length > 0
      ) {
        if (validrequest.idKerusakan.length !== validrequest.jumlahKerusakan.length)
          throw 'Kerusakan tidak valid'

        let i = 0
        let cariRosok = true // kalau udah false, berarti ngga nyari lagi

        for (const item of validrequest.idKerusakan) {
          try {
            const rusak = await Kerusakan.findOrFail(item)
            if (!rusak.apakahBisaDiperbaiki && cariRosok) {
              apakahRosok = true
              cariRosok = false
            }

            apakahRusak = true

            let hitung = rusak.ongkosNominal * validrequest.jumlahKerusakan[i]
            ongkosRusak += hitung
            wadahRusak.push({
              teks: `${rusak.nama} (${validrequest.jumlahKerusakan[i]})`,
              ongkos: rupiahParser(-hitung),
            })
          } catch (error) {
            // gatau, yang penting ngejaga biar ngga error
          }

          i++
        }

        if (apakahRosok) ongkosRusak = 0
      } else {
        apakahRosok = false
      }

      // --------------- cek nota leo --------------------- OK
      if (
        validrequest.f2KelengkapanNota == 'dengan' &&
        validrequest.f2AsalPerhiasan == 'leo' &&
        validrequest.f2HargaJualNota &&
        validrequest.f2PotonganNota &&
        validrequest.f2TanggalBeli
      )
        adaNotaLeo = true

      // ==================================== ALUR HITUNGAN RUMUS MULAI DARI SINI =======================================
      // urutannya bakal sama kayak catatan rumus lu, dari A ke H

      if (!adaNotaLeo && apakahRusak) {
        // kalau dari luar, tapi ada rusak auto dianggep rosok
        apakahRosok = true
      }

      // =================================== RUMUS BARU =======================================
      // isinya cuma 3, rosok (B), nota leo (D), toko luar uripan (C2)
      if (apakahRosok) {
        BERATVALID = validrequest.f2BeratBarang
        kondisiBarang = 'rosok'
        keteranganTransaksi = 'Dihitung harga rosok, kerusakan & potongan dianulir'
        apakahBisaDitawar = true
        ongkosRusak = 0

        // --------------- Rumus B, Jual Rosok ---------------------
        rumusDipake = 'B'

        hargaPerGram =
          (hargaMal *
            (kodepro.kadar.persentaseMalRosok - kodepro.kadar.marginPersenUntungRosokMax)) /
          100
        hargaBeliTarget = hargaPerGram * validrequest.f2BeratBarang

        hargaBeliMaksDitawar =
          ((hargaMal *
            (kodepro.kadar.persentaseMalRosok - kodepro.kadar.marginPersenUntungRosokMin)) /
            100) *
          validrequest.f2BeratBarang
      } else {
        if (wadahRusak.length > 0) {
          kondisiBarang = 'rusak'
        } else {
          kondisiBarang = 'uripan'
        }

        if (adaNotaLeo) {
          // khusus kalau ada nota LEO, ngitung apa2 pake berat NOTA, bukan berat BARANG
          BERATVALID = validrequest.f2BeratNota
            ? validrequest.f2BeratNota
            : validrequest.f2BeratBarang
          // BANDINGINNYA JANGAN KE BERAT BARANG, TP BERAT NOTA
          hargaPerGram = hargaJualNota / BERATVALID

          // --------------- Rumus D, Normal --------------------- OK
          rumusDipake = 'D'
          apakahBisaDitawar = false
          // INGET! datanya sesuai perjanjian / nota, bukan DATABASE

          // hitung potongan
          potongan = kodepro.kadar.apakahPotonganPersen
            ? (potonganDariNota / 100) * hargaJualNota
            : hitungPotonganNormal(potonganDariNota, BERATVALID)
          keteranganTransaksi += kodepro.kadar.apakahPotonganPersen
            ? ''
            : penjelasPotonganNormal(BERATVALID)

          hargaBeliTarget = hargaJualNota - potongan - ongkosRusak
        } else {
          // --------------- Rumus C2, Jual Tanpa Nota ---------------------
          rumusDipake = 'C2'
          apakahBisaDitawar = true
          BERATVALID = validrequest.f2BeratBarang

          // ini kalau ngga ada tuker tambah, MASIH RAWAN ERROR
          hargaPerGram =
            (hargaMal *
              (kodepro.kadar.persentaseMalUripan - kodepro.kadar.marginPersenUntungUripanMax)) /
            100
          hargaBeliTarget = hargaPerGram * validrequest.f2BeratBarang

          hargaBeliMaksDitawar =
            ((hargaMal *
              (kodepro.kadar.persentaseMalUripan - kodepro.kadar.marginPersenUntungUripanMin)) /
              100) *
            validrequest.f2BeratBarang
        }
      }

      // ==================================== SELESAI RUMUS, BANDING SAMA INPUT =======================================
      // dua poin dibawah ini udah sekalian ngecek buat ngehindarin yang nawar tp transaksinya gaboleh ditawar
      if (!apakahBisaDitawar) {
        hargaBeliMaksDitawar = hargaBeliTarget
      }

      // harus ngecek tawaran, diatas TARGET dibawah MAKS. Selain itu ngga bener
      if (
        validrequest.dealTawaran < pembulatanRupiah(hargaBeliTarget, 500) ||
        validrequest.dealTawaran > pembulatanRupiah(hargaBeliMaksDitawar, 500)
      ) {
        throw 'Input tawaran tidak valid.'
      }

      let kodeTransaksi = 'PB' + (apakahDitawar ? 1 : 0) + validrequest.f2Model.toString() + idTransaksi
      kodeTransaksi += kodepro.id.toString() + DateTime.now().toFormat('SSS') + rumusDipake

      // final check buat data toko
      let namaToko: string | null = null
      let alamatToko: string | null = null

      if (adaNotaLeo) {
        namaToko = pengaturan.namaToko
        alamatToko = pengaturan.alamatTokoLengkap
      } else if (
        validrequest.f2KelengkapanNota === 'dengan' &&
        validrequest.f2NamaToko &&
        validrequest.f2AlamatToko
      ) {
        namaToko = validrequest.f2NamaToko
        alamatToko = validrequest.f2AlamatToko
      }

      const status = await StatusGadai.findByOrFail('status', 'berjalan')

      const gadaiBaru = await status.related('gadais').create({
        'kodeProduksiId': kodepro.id,
        'modelId': validrequest.f2Model,
        'penggunaId': userPengakses.pengguna.id,
        'tanggalTenggat': validrequest.f1TanggalTenggat,
        'namaPenggadai': validrequest.f1NamaPenggadai,
        'nikPenggadai': validrequest.f1NikPenggadai,
        'alamatPenggadai': validrequest.f1AlamatPenggadai,
        'nohpPenggadai': validrequest.f1NoHpAktif,
        'keterangan': validrequest.f1Keterangan,
        'kodeTransaksi': kodeTransaksi,
        'kondisiFisik': kondisiBarang,
        'keteranganTransaksi': keteranganTransaksi,
        'beratBarang': BERATVALID,
        'asalToko': namaToko,
        'alamatAsalToko': alamatToko,
        'keteranganBarang': validrequest.f2KeteranganCatatan,
        'apakahDitawar': apakahDitawar,
        'hargaBarangPerGramSeharusnya': hargaPerGram,
        'hargaBarangPerGramAkhir': hargaPerGramFinal,
        'hargaBarangSeharusnya': hargaBeliTarget,
        'nominalGadai': hargaFinal,
        'ongkosKerusakanTotal': ongkosRusak,
        'fotoKtpPenggadai': namaFileFotoKtp,
        'fotoBarang': namaFileFotoPerhiasan,
      })

      // n-to-n ke kerusakan
      if (validrequest.idKerusakan && validrequest.jumlahKerusakan) {
        let i = 0

        for (const item of validrequest.idKerusakan) {
          try {
            let rusak = await Kerusakan.findOrFail(item)
            let cekRosok = kondisiBarang === 'rosok'

            await gadaiBaru.related('kerusakans').attach({
              [rusak.id]: {
                // ini id_kerusakan
                apakah_diabaikan: cekRosok,
                banyak_kerusakan: validrequest.jumlahKerusakan[i],
                total_ongkos: !cekRosok ? validrequest.jumlahKerusakan[i] * rusak.ongkosNominal : 0,
              },
            })
          } catch (error) {
            // buat nangkep error doang
          }
          
          i++
        }
      }

      // sambungin ke nota kalau ada juga
      if (adaNotaLeo) {
        await gadaiBaru.related('gadaiNotaLeo').create({
          'tanggalJualPadaNota': validrequest.f2TanggalBeli,
          'beratBarangPadaNota': validrequest.f2BeratNota,
          'hargaJualPadaNota': validrequest.f2HargaJualNota,
          'apakahPotonganPersen': kodepro.kadar.apakahPotonganPersen,
          'potonganPadaNota': validrequest.f2PotonganNota,
          'ongkosPotonganTotal': potongan
        })
      }

      

      // ---------- ngabarin kas --------------
      const rekapHarian = await prepareRekap()
      await rekapHarian.related('kas').create({
        nominal: -Math.abs(hargaFinal),
        apakahDariSistem: true,
        apakahKasKeluar: true,
        perihal: `Pengajuan gadai An. ${ validrequest.f1NamaPenggadai } dengan tenggat ${ validrequest.f1TanggalTenggat.toFormat('D') }`,
        penggunaId: userPengakses.pengguna.id
      })

      // --------- ngubah saldo ------------------
      pengaturan.saldoToko -= hargaFinal
      await pengaturan.save()

      session.flash('alertSukses', 'Gadai baru berhasil disimpan!')
      return response.redirect().toPath('/app/transaksi/gadai/' + gadaiBaru.id)
    } catch (error) {
      await Drive.delete('transaksi/gadai/katepe/' + namaFileFotoKtp)
      await Drive.delete('transaksi/gadai/barang/' + namaFileFotoPerhiasan)

      if (error.custom) {
        if (error.foto) {
          if (error.perhiasan) {
            session.flash('errors', {
              fotoPerhiasanBase64: error.error,
            })
          } else {
            session.flash('errors', {
              fotoKTPBase64: error.error,
            })
          }
        }
      } else {
        session.flash(
          'alertError',
          'Ada masalah saat menyimpan data gadai. Silahkan coba lagi setelah beberapa saat.'
        )
      }

      return response.redirect().withQs().back()
    }
  }

  // baru, dari ajax
  public async hitungHargaBelakang({ request, response }: HttpContextContract) {
    const newHitungGadaiSchema = schema.create({
      f2KelengkapanNota: schema.enum(['tanpa', 'dengan'] as const),
      f2AsalPerhiasan: schema.enum(['luar', 'leo'] as const),
      f2NamaToko: schema.string.optional(
        {
          trim: true,
        },
        [rules.maxLength(50)]
      ), // masih belom yakin dipake apa ngga
      f2Kodepro: schema.number([
        rules.unsigned(),
        rules.exists({
          table: 'kode_produksis',
          column: 'id',
          where: {
            deleted_at: null,
          },
        }),
      ]),
      f2Model: schema.number([
        rules.unsigned(),
        rules.exists({
          table: 'models',
          column: 'id',
          where: {
            deleted_at: null,
          },
        }),
      ]),
      f2JenisStok: schema.enum(['lama', 'baru'] as const),
      keteranganCatatan: schema.string.optional(
        {
          trim: true,
        },
        [rules.maxLength(100)]
      ),
      f2BeratNota: schema.number.optional([
        rules.unsigned(),
        rules.requiredWhen('kelengkapanNota', '=', 'dengan'),
      ]),
      f2BeratBarang: schema.number([rules.unsigned()]),
      f2HargaJualNota: schema.number.optional([
        rules.unsigned(),
        rules.requiredWhen('kelengkapanNota', '=', 'dengan'),
      ]),
      f2PotonganNota: schema.number.optional([
        rules.unsigned(),
        rules.requiredWhen('asalPerhiasan', '=', 'leo'),
      ]),
      f2TanggalBeli: schema.date.optional({}, [
        rules.beforeOrEqual('today'),
        rules.requiredWhen('asalPerhiasan', '=', 'leo'),
      ]),
      idKerusakan: schema.array.optional([rules.minLength(1)]).members(
        schema.number([
          rules.unsigned(),
          rules.exists({
            table: 'kerusakans',
            column: 'id',
            where: {
              deleted_at: null,
            },
          }),
        ])
      ),
      jumlahKerusakan: schema.array
        .optional([rules.minLength(1)])
        .members(schema.number([rules.unsigned()])),
    })

    try {
      const validrequest = await request.validate({
        schema: newHitungGadaiSchema,
      })
      const kodepro = await KodeProduksi.findOrFail(validrequest.f2Kodepro)
      await kodepro.load('kadar')

      const pengaturan = await Pengaturan.findOrFail(1)

      // ------------ DILUAR --------------------
      let keteranganTransaksi = ''
      let rumusDipake = 'kosong' // ini buat testing

      // ------------ data nota -----------------
      let hargaJualNota = validrequest.f2HargaJualNota ? validrequest.f2HargaJualNota : 0
      let potonganDariNota = validrequest.f2PotonganNota ? validrequest.f2PotonganNota : 0

      // -------- potongan & penalti ------------
      let potongan = 0 // ini buat ngitung rumus
      let potonganDeskripsi: string | null = null // ini buat keterangan, dikirm balik ke client
      let penaltiDeskripsi: string | null = null // ini buat keterangan, dikirm balik ke client
      let totalPotonganDeskripsi: string | null = null // ini buat keterangan, dikirm balik ke client

      // ----------- hitungan transaksi -------------
      const hargaMal = pengaturan.hargaMal
      let hargaPerGram = 0
      let apakahBisaDitawar = false
      let hargaBeliTarget = 0 // ini yang bakal dipake
      let hargaBeliMaksDitawar = 0 // ini mentok kalo ditawar

      // -------------- kerusakan ------------------
      let wadahRusak: Array<any> = []
      let ongkosRusak = 0
      let kondisiBarang = '' // uripan, rusak, rosok

      // ==================================== SELEKSI DATA =======================================
      let apakahRusak = false // kalah ama rosok
      let apakahRosok = false
      let adaNotaLeo = false

      // --------------- cek & hitung rosok --------------------- OK
      if (
        validrequest.idKerusakan &&
        validrequest.idKerusakan.length > 0 &&
        validrequest.jumlahKerusakan &&
        validrequest.jumlahKerusakan.length > 0
      ) {
        if (validrequest.idKerusakan.length !== validrequest.jumlahKerusakan.length)
          throw 'Kerusakan tidak valid'

        let i = 0
        let cariRosok = true // kalau udah false, berarti ngga nyari lagi

        for (const item of validrequest.idKerusakan) {
          try {
            const rusak = await Kerusakan.findOrFail(item)
            if (!rusak.apakahBisaDiperbaiki && cariRosok) {
              apakahRosok = true
              cariRosok = false
            }

            apakahRusak = true

            let hitung = rusak.ongkosNominal * validrequest.jumlahKerusakan[i]
            ongkosRusak += hitung
            wadahRusak.push({
              teks: `${rusak.nama} (${validrequest.jumlahKerusakan[i]})`,
              ongkos: rupiahParser(-hitung),
            })
          } catch (error) {
            // gatau, yang penting ngejaga biar ngga error
          }

          i++
        }

        if (apakahRosok) ongkosRusak = 0
      } else {
        apakahRosok = false
      }

      // --------------- cek nota leo --------------------- OK
      if (
        validrequest.f2KelengkapanNota == 'dengan' &&
        validrequest.f2AsalPerhiasan == 'leo' &&
        validrequest.f2HargaJualNota &&
        validrequest.f2PotonganNota &&
        validrequest.f2TanggalBeli
      )
        adaNotaLeo = true

      // ==================================== ALUR HITUNGAN RUMUS MULAI DARI SINI =======================================
      // urutannya bakal sama kayak catatan rumus lu, dari A ke H

      if (!adaNotaLeo && apakahRusak) {
        // kalau dari luar, tapi ada rusak auto dianggep rosok
        apakahRosok = true
      }

      // =================================== RUMUS BARU =======================================
      // isinya cuma 3, rosok (B), nota leo (D), toko luar uripan (C2)
      if (apakahRosok) {
        kondisiBarang = 'rosok'
        keteranganTransaksi = 'Dihitung harga rosok, kerusakan & potongan dianulir'
        apakahBisaDitawar = true
        ongkosRusak = 0

        // --------------- Rumus B, Jual Rosok ---------------------
        rumusDipake = 'B'

        hargaPerGram =
          (hargaMal *
            (kodepro.kadar.persentaseMalRosok - kodepro.kadar.marginPersenUntungRosokMax)) /
          100
        hargaBeliTarget = hargaPerGram * validrequest.f2BeratBarang

        hargaBeliMaksDitawar =
          ((hargaMal *
            (kodepro.kadar.persentaseMalRosok - kodepro.kadar.marginPersenUntungRosokMin)) /
            100) *
          validrequest.f2BeratBarang
      } else {
        if (wadahRusak.length > 0) {
          kondisiBarang = 'rusak'
        } else {
          kondisiBarang = 'uripan'
        }

        if (adaNotaLeo) {
          // khusus kalau ada nota LEO, ngitung apa2 pake berat NOTA, bukan berat BARANG
          let BERATVALID = validrequest.f2BeratNota
            ? validrequest.f2BeratNota
            : validrequest.f2BeratBarang
          // BANDINGINNYA JANGAN KE BERAT BARANG, TP BERAT NOTA
          hargaPerGram = hargaJualNota / BERATVALID

          // --------------- Rumus D, Normal --------------------- OK
          rumusDipake = 'D'
          apakahBisaDitawar = false
          // INGET! datanya sesuai perjanjian / nota, bukan DATABASE

          // hitung potongan
          potonganDeskripsi = kodepro.kadar.apakahPotonganPersen
            ? `${potonganDariNota}% harga jual`
            : `${rupiahParser(potonganDariNota)}/g`
          potongan = kodepro.kadar.apakahPotonganPersen
            ? (potonganDariNota / 100) * hargaJualNota
            : hitungPotonganNormal(potonganDariNota, BERATVALID)
          totalPotonganDeskripsi = rupiahParser(potongan)
          keteranganTransaksi += kodepro.kadar.apakahPotonganPersen
            ? ''
            : penjelasPotonganNormal(BERATVALID)

          hargaBeliTarget = hargaJualNota - potongan - ongkosRusak
        } else {
          // --------------- Rumus C2, Jual Tanpa Nota ---------------------
          rumusDipake = 'C2'
          apakahBisaDitawar = true

          // ini kalau ngga ada tuker tambah, MASIH RAWAN ERROR
          hargaPerGram =
            (hargaMal *
              (kodepro.kadar.persentaseMalUripan - kodepro.kadar.marginPersenUntungUripanMax)) /
            100
          hargaBeliTarget = hargaPerGram * validrequest.f2BeratBarang

          hargaBeliMaksDitawar =
            ((hargaMal *
              (kodepro.kadar.persentaseMalUripan - kodepro.kadar.marginPersenUntungUripanMin)) /
              100) *
            validrequest.f2BeratBarang
        }
      }

      // ==================================== SELESAI HITUNGAN RUMUS =======================================

      let potonganDeskripsiNota: string | null = null
      if (adaNotaLeo && validrequest.f2PotonganNota) {
        potonganDeskripsiNota = kodepro.kadar.apakahPotonganPersen
          ? `${validrequest.f2PotonganNota}% harga jual`
          : `${rupiahParser(validrequest.f2PotonganNota)}/g`
      }

      return {
        aaRumus: rumusDipake, // buat testing
        adaNotaLeo, // OK
        beratBarang: validrequest.f2BeratBarang, // OK
        keteranganTransaksi,
        dataNota: {
          jenisStok: adaNotaLeo ? kapitalHurufPertama(validrequest.f2JenisStok) : null, // OK
          hargaJualNota:
            adaNotaLeo && validrequest.f2HargaJualNota
              ? rupiahParser(validrequest.f2HargaJualNota)
              : null, // OK
          potonganDeskripsiNota, // OK,
          beratNota:
            adaNotaLeo && validrequest.f2BeratNota ? validrequest.f2BeratNota + ' gram' : null,
        },

        kerusakan: {
          kondisiBarang: kapitalHurufPertama(kondisiBarang), // OK
          totalKerusakan: rupiahParser(ongkosRusak), // OK
          wadahRusak, // udah ngerangkap ama ngecek ada kerusakan ngga, OK
        },

        potonganNPenalti: {
          potonganDeskripsi, // OK
          penaltiDeskripsi, // OK
          totalPotonganDeskripsi, // OK
        },

        hitunganTransaksi: {
          hargaMal, // buat testing
          hargaPerGram: `${rupiahParser(hargaPerGram)}/g`, // OK
          apakahBisaDitawar, // OK
          hargaBeliTarget: pembulatanRupiah(hargaBeliTarget, 500), // jangan lupa pembulatan
          hargaBeliMaksDitawar: pembulatanRupiah(hargaBeliMaksDitawar, 500), // jangan lupa pembulatan
        },
      }
    } catch (error) {
      return response.badRequest({
        error: error,
      })
    }
  }

  public async show({ view, response, session, params }: HttpContextContract) {
    try {
      let gadai = await Gadai.findOrFail(params.id)
      await gadai.load('pengguna', (query) => {
        query.preload('jabatan')
      })
      await gadai.load('statusGadai')
      await gadai.load('pembayaranGadais')
      await gadai.load('kodeProduksi', (query)=>{
        query.preload('kadar')
      })
      await gadai.load('model', (query)=>{
        query.preload('bentuk')
      })
      await gadai.load('kerusakans')
      await gadai.load('gadaiNotaLeo')

      // Get today's date and time
      var countDownDate = gadai.tanggalTenggat.startOf('day')
      var now = DateTime.now().startOf('day')
      var jarakHari = countDownDate.diff(now, ['days']).toObject().days

      let terbayar = 0
      for (const bayar of gadai.pembayaranGadais) {
        terbayar += bayar.nominal
      }

      let fungsi = {
        rupiahParser: rupiahParser,
        kapitalHurufPertama: kapitalHurufPertama,
      }
      let tambahan = {
        jarakHari: jarakHari,
        adaFotoBarang: await Drive.exists('transaksi/gadai/barang/' + gadai.fotoBarang),
        terbayar,
      }
      let roti = [
        {
          laman: 'Gadai',
          alamat: '/app/transaksi/gadai',
        },
        {
          laman: `Gadai ${rupiahParser(gadai.nominalGadai)} An. ${gadai.namaPenggadai}`
        }
      ]

      return await view.render('transaksi/gadai/view-gadai', { gadai, fungsi, tambahan, roti })
    } catch (error) {
      console.log(error)
      session.flash('alertError', 'Gadai yang anda akses tidak valid atau terhapus.')
      return response.redirect().toPath('/app/transaksi/gadai/')
    }
  }

  public async rusakGadai({ view, params, response, session }: HttpContextContract) {
    try {
      const GD = await Gadai.findOrFail(params.id)
      await GD.load('kodeProduksi', (query) => {
        query.preload('kadar')
      })
      await GD.load('model', (query) => {
        query.preload('bentuk')
      })
      await GD.load('kerusakans')
      await GD.load('gadaiNotaLeo')

      const fungsi = {
        rupiahParser: rupiahParser
      }

      let roti = [
        {
          laman: 'Gadai',
          alamat: '/app/transaksi/gadai',
        },
        {
          laman: `Gadai ${rupiahParser(GD.nominalGadai)} An. ${GD.namaPenggadai}`,
          alamat: '/app/transaksi/gadai/' + GD.id,
        },
        {
          laman: `Kerusakan`
        }
      ]

      return view.render('transaksi/gadai/rusak-gadai', { GD, fungsi, roti })
    } catch (error) {
      session.flash('alertError', 'Kerusakan gadai yang anda pilih tidak valid!')
      return response.redirect().toPath('/app/transaksi/gadai/' + params.id)
    }
  }

  public async edit({ view, response, session, params }: HttpContextContract) {
    try {
      const gadai = await Gadai.findOrFail(params.id)
      await gadai.load('gadaiNotaLeo')
      await gadai.load('kodeProduksi', (query) => {
        query.preload('kadar')
      })
      await gadai.load('model', (query)=>{
        query.preload('bentuk')
      })
      await gadai.load('statusGadai')

      let potongan = 0
      let teksPotongan = ''
      if (gadai.gadaiNotaLeo) {
        potongan = gadai.gadaiNotaLeo.ongkosPotonganTotal
        teksPotongan = gadai.gadaiNotaLeo.apakahPotonganPersen
          ? `${gadai.gadaiNotaLeo.potonganPadaNota}% harga jual`
          : `${rupiahParser(gadai.gadaiNotaLeo.potonganPadaNota)} per gram`
      }

      const tambahan = {
        adaFotoKTP: await Drive.exists('transaksi/gadai/katepe/' + gadai.fotoKtpPenggadai),
        adaFotoBarang: await Drive.exists('transaksi/gadai/barang/' + gadai.fotoBarang),
        totalKerusakan: -Math.abs(gadai.ongkosKerusakanTotal),
        totalPotongan: -Math.abs(potongan),
        teksPotongan: teksPotongan,
      }

      const fungsi = {
        kapitalHurufPertama: kapitalHurufPertama,
        rupiahParser: rupiahParser,
      }

      let roti = [
        {
          laman: 'Gadai',
          alamat: '/app/transaksi/gadai',
        },
        {
          laman: `Gadai ${rupiahParser(gadai.nominalGadai)} An. ${gadai.namaPenggadai}`,
          alamat: '/app/transaksi/gadai/' + gadai.id,
        },
        {
          laman: `Ubah Data`
        }
      ]

      return view.render('transaksi/gadai/form-edit-gadai', { gadai, tambahan, fungsi, roti })
    } catch (error) {
      session.flash(
        'alertError',
        'Ada masalah pada server, silahkan coba lagi setelah beberapa saat.'
      )
      return response.redirect().toPath('/app/transaksi/gadai/' + params.id)
    }
  }

  public async update({ request, auth, session, response, params }: HttpContextContract) {
    const updateGadaiSchema = schema.create({
      namaPenggadai: schema.string({ trim: true }, [rules.maxLength(50)]),
      nikPenggadai: schema.string({ trim: true }, [rules.maxLength(16)]),
      alamatPenggadai: schema.string({ trim: true }, [rules.maxLength(100)]),
      noHpAktif: schema.string({ trim: true }, [rules.maxLength(15)]),
      indiGambarKTPBerubah: schema.string({ trim: true }),
      fotoKTPBase64: schema.string(),
      indiGambarPerhiasanBerubah: schema.string({ trim: true }),
      fotoPerhiasanBase64: schema.string(),
      tanggalTenggat: schema.date(),
      keterangan: schema.string.optional({ trim: true }, [rules.maxLength(100)]),
    })

    const validrequest = await request.validate({ schema: updateGadaiSchema })
    const gantiFotoKTP = validrequest.indiGambarKTPBerubah === 'ganti'
    const gantiFotoPerhiasan = validrequest.indiGambarPerhiasanBerubah === 'ganti'

    try {
      // udah diiket dari middleware, cuma tambahan aja
      if (!auth.user) throw 'auth ngga valid'

      const gadai = await Gadai.findOrFail(params.id)
      await gadai.load('statusGadai')

      // --------------- Foto KTP -------------------
      let namaFileFotoKtp = ''
      let fileFotoKtp = validrequest.fotoKTPBase64 || ''

      if (gantiFotoKTP) {
        try {
          if (
            !isBase64(fileFotoKtp, { mimeRequired: true, allowEmpty: false }) ||
            fileFotoKtp === ''
          ) {
            throw new Error('Input foto ktp tidak valid!')
          }

          var block = fileFotoKtp.split(';')
          var realData = block[1].split(',')[1] // In this case "iVBORw0KGg...."
          namaFileFotoKtp = gadai.fotoKtpPenggadai
            ? gadai.fotoKtpPenggadai
            : 'GD001' + DateTime.now().toMillis() + tigaDigit(params.id) + '.jpg' // bisa diganti yang lebih propper

          const buffer = Buffer.from(realData, 'base64')
          await Drive.put('transaksi/gadai/katepe/' + namaFileFotoKtp, buffer)
        } catch (error) {
          throw {
            custom: true,
            foto: true,
            perhiasan: false,
            error: 'Input foto ktp tidak valid!',
          }
        }
      }

      // --------------- Foto Barang -------------------
      let namaFileFotoPerhiasan = ''
      let fileFotoPerhiasan = validrequest.fotoPerhiasanBase64 || ''

      if (gantiFotoPerhiasan) {
        try {
          if (
            !isBase64(fileFotoPerhiasan, { mimeRequired: true, allowEmpty: false }) ||
            fileFotoPerhiasan === ''
          ) {
            throw new Error('Input foto barang tidak valid!')
          }

          var block = fileFotoPerhiasan.split(';')
          var realData = block[1].split(',')[1] // In this case "iVBORw0KGg...."
          namaFileFotoPerhiasan = gadai.fotoBarang
            ? gadai.fotoBarang
            : 'GD002' + DateTime.now().toMillis() + tigaDigit(params.id) + '.jpg' // bisa diganti yang lebih propper

          const buffer = Buffer.from(realData, 'base64')
          await Drive.put('transaksi/gadai/barang/' + namaFileFotoPerhiasan, buffer)
        } catch (error) {
          throw {
            custom: true,
            foto: true,
            perhiasan: true,
            error: 'Input foto barang tidak valid!',
          }
        }
      }

      // mulai isi data
      gadai.namaPenggadai = validrequest.namaPenggadai
      gadai.alamatPenggadai = validrequest.alamatPenggadai
      gadai.nikPenggadai = validrequest.nikPenggadai
      gadai.nohpPenggadai = validrequest.noHpAktif
      gadai.tanggalTenggat = validrequest.tanggalTenggat
      gadai.keterangan = validrequest.keterangan ? validrequest.keterangan : null

      if (gantiFotoKTP) {
        gadai.fotoKtpPenggadai = namaFileFotoKtp
      }

      if (gantiFotoPerhiasan) {
        gadai.fotoBarang = namaFileFotoPerhiasan
      }

      // ganti status disini
      if (
        validrequest.tanggalTenggat > DateTime.now().startOf('day') &&
        gadai.statusGadai.status === 'terlambat'
      ) {
        const statusBaru = await StatusGadai.findByOrFail('status', 'berjalan')
        gadai.statusGadaiId = statusBaru.id
      }

      // save disini
      await gadai.save()

      // redirect disini
      session.flash('alertSukses', 'Data gadai berhasil diperbarui!')
      return response.redirect().toPath('/app/transaksi/gadai/' + params.id)
    } catch (error) {
      if (error.custom) {
        if (error.foto) {
          if (error.perhiasan) {
            session.flash('errors', {
              fotoPerhiasanBase64: error.error,
            })
          } else {
            session.flash('errors', {
              fotoKTPBase64: error.error,
            })
          }
        } else {
          session.flash(
            'alertError',
            'Ada masalah saat memperbarui data gadai. Silahkan coba lagi setelah beberapa saat. q'
          )
        }
      } else {
        console.log(error)
        session.flash(
          'alertError',
          'Ada masalah saat memperbarui data gadai. Silahkan coba lagi setelah beberapa saat.'
        )
      }
      return response.redirect().back()
    }
  }

  public async destroy({ response, session, params }: HttpContextContract) {
    try {
      const gadai = await Gadai.findOrFail(params.id)
      const statusBaru = await StatusGadai.findByOrFail('status', 'dibatalkan')

      // ------------ set kalo dibatalin -------------------
      // di delete ngga ya?
      gadai.dilunasiAt = null
      gadai.statusGadaiId = statusBaru.id
      gadai.keterangan += ' Gadai dibatalkan.'

      // ------------ hapus nik sama foto ktp, ama foto barang --------------
      gadai.nikPenggadai = '0' // ngga bisa null, yaudah dibikin 0
      await Drive.delete('transaksi/gadai/katepe/' + gadai.fotoKtpPenggadai) // gaperlu try-catch
      gadai.fotoKtpPenggadai = null
      await Drive.delete('transaksi/gadai/barang/' + gadai.fotoBarang) // gaperlu try-catch

      await gadai.save()

      session.flash(
        'alertSukses',
        `Data gadai ${rupiahParser(gadai.nominalGadai)} An. ${
          gadai.namaPenggadai
        } berhasil dibatalkan!`
      )
      return response.redirect().toPath('/app/transaksi/gadai/')
    } catch (error) {
      session.flash(
        'alertError',
        'Ada masalah saat membatalkan gadai. Silahkan coba lagi setelah beberapa saat.'
      )
      return response.redirect().back()
    }
  }

  public async refreshGadai({ response }: HttpContextContract) {
    const gadais = await Database.from('gadais')
      .join('status_gadais', 'gadais.status_gadai_id', 'status_gadais.id')
      .select('gadais.id')
      .whereNull('gadais.deleted_at')
      // .andWhere('gadais.tanggal_tenggat', '<=', DateTime.now().toISO())
      .whereRaw('DATE(gadais.tanggal_tenggat) < DATE(NOW())')
      .andWhere('status_gadais.status', 'berjalan')

    let counter = 0

    for (const elemen of gadais) {
      try {
        const gadai = await Gadai.findOrFail(elemen.id)
        const statusTarget = await StatusGadai.findByOrFail('status', 'terlambat')

        gadai.statusGadaiId = statusTarget.id
        await gadai.save()

        counter++
      } catch (error) {
        // kalo ada error, dikacangin
      }
    }

    if (counter > 0) {
      let notifGadai = await TipeNotif.findByOrFail('nama', 'Gadai')
      let sintaksJudul = notifGadai.sintaksJudul.replace('{jumlah}', counter.toString())

      let penggunaPenting = await Database.from('penggunas')
        .join('jabatans', 'penggunas.jabatan_id', 'jabatans.id')
        .where('jabatans.nama', 'Kepala Toko')
        .orWhere('jabatans.nama', 'Pemilik')
        .select('penggunas.id')
        .whereNull('deleted_at')

      for (const element of penggunaPenting) {
        await notifGadai.related('notifikasis').create({
          isiNotif: sintaksJudul,
          penggunaId: element.id,
          urlTujuan: '/app/transaksi/gadai',
        })
      }
    }

    // ini query buat ngasi tau kapan terakhir dicek
    await Database.insertQuery()
      .table('refresh_gadais')
      .insert({ direfresh_at: DateTime.now().toSQL() })

    return response.ok({
      message: 'Refresh berhasil, ' + counter + ' data diperbarui',
      jumlah: counter,
    })
  }

  public async getNIK({ params, response }: HttpContextContract) {
    try {
      const gadai = await Gadai.findOrFail(params.id)
      return { nik: gadai.nikPenggadai }
    } catch (error) {
      return response.badRequest({ error: 'Gadai tidak ditemukan.' })
    }
  }
}

async function buatId() {
  const lastGadai = await Database.from('gadais').select('id').orderBy('id', 'desc').limit(1)

  if (lastGadai[0]) {
    return tigaDigit(lastGadai[0].id + 1)
  } else return '001'
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

function tigaDigit(angka: number) {
  let teks = angka.toString()
  let finalTeks = teks
  if (teks.length == 2) finalTeks = '0' + teks
  if (teks.length <= 1) finalTeks = '00' + teks

  return finalTeks
}

function potongTeks(teks: string, max: number = 30) {
  return teks.slice(0, max) + (teks.length > max ? '...' : '')
}

function hitungPotonganNormal(potongan: number, beratBarang: number) {
  let beratBulat = Math.floor(beratBarang)
  let beratDesimal = beratBarang - beratBulat
  let bonusBerat = 0

  if (beratBarang < 1 && beratBarang > 0) {
    bonusBerat = 1
  } else {
    if (beratDesimal >= 0.5) {
      bonusBerat = 1
    } else if (beratDesimal >= 0.15) {
      // tanyain ntar 0.1 atau 0.15
      bonusBerat = beratDesimal
    }
    // selain 2 syarat tadi ngga dapet ekstra (0.5 > beratBarang >= 0.15)
  }

  return (beratBulat + bonusBerat) * potongan
}

function penjelasPotonganNormal(beratBarang: number) {
  let beratBulat = Math.floor(beratBarang)
  let beratDesimal = beratBarang - beratBulat
  let penjelas: string = ''

  if (beratBarang < 1 && beratBarang > 0) {
    penjelas = 'Berat barang dibawah 1 gram dikenai 1 potongan penuh.'
  } else {
    if (beratDesimal >= 0.5) {
      penjelas = 'Berat desimal mulai 0.5 gram keatas dikenai 1 potongan penuh'
    } else if (beratDesimal > 0 && beratDesimal < 0.15) {
      // tanyain ntar 0.1 atau 0.15
      penjelas = 'Berat desimal dibawah 0.15 gram tidak dikenai potongan'
    }
  }

  return penjelas
}

function pembulatanRupiah(angka: number, kelipatan: number = 1000) {
  let sisa = angka % kelipatan

  if (sisa > 0) return angka + (kelipatan - sisa)
  else return angka
}
