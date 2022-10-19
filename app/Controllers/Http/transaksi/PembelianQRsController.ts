import type {
  HttpContextContract
} from '@ioc:Adonis/Core/HttpContext'
import Penjualan from 'App/Models/transaksi/Penjualan'
import {
  DateTime
} from 'luxon'
import {
  schema,
  rules
} from '@ioc:Adonis/Core/Validator'
import Drive from '@ioc:Adonis/Core/Drive'
import Pengaturan from 'App/Models/sistem/Pengaturan'
import Kerusakan from 'App/Models/barang/Kerusakan'
import Database from '@ioc:Adonis/Lucid/Database'
import User from 'App/Models/User'

export default class PembelianQRsController {

  public async cariQR({
    request,
    response
  }: HttpContextContract) {
    let scan = request.input('scan', 'kosong')

    try {
      let penjualan = await Penjualan
        .query()
        .where('kode_transaksi', scan)
        .andWhereNull('dibeli_at')
        .andWhereNull('deleted_at')
        .preload('kelompok', (kelompokQuery) => {
          kelompokQuery
            .preload('bentuk')
            .preload('kadar')
            .whereNull('deleted_at')
        })
        .firstOrFail()

      let tanggal = penjualan.createdAt.setLocale('id-ID').toLocaleString({
        ...DateTime.DATETIME_MED,
        weekday: 'long'
      })

      return {
        namaQR: penjualan.kelompok.bentuk.bentuk + ' ' + penjualan.kelompok.kadar.nama + ' ' + penjualan.beratBarang + 'g, terjual pada ' + tanggal + ' seharga ' + rupiahParser(penjualan.hargaJualAkhir),
        kodePenjualan: penjualan.kodeTransaksi,
        idPJ: penjualan.id, // buat foto
      }

    } catch (error) {
      return response.notFound({
        error: 'Kode mungkin salah, typo, atau transaksi terkait telah dijual sebelumnya.'
      })
    }
  }

  public async index({
    view,
    response,
    request,
    session
  }: HttpContextContract) {
    let kode = request.input('kode', '')

    try {
      const penjualan = await Penjualan.findByOrFail('kode_transaksi', kode)

      if(penjualan.deletedAt || penjualan.dibeliAt){
        throw 'ga valid'
      }

      await penjualan.load('kodeProduksi', (query) => {
        query.preload('kadar')
      })
      await penjualan.load('model', (query) => {
        query.preload('bentuk')
      })
      await penjualan.load('itemJuals')

      let lamaTerlambat = 0

      // -------- ngecek tag ------------
      let tags: Array<string> = []

      if(penjualan.apakahStokBaru){
        tags.push('stok baru')
      } else {
        tags.push('stok lama')
      }

      if(penjualan.apakahJanjiTukarTambah){
        tags.push('janji tukar tambah')

        const target = penjualan.createdAt.plus({day: 1}).startOf('day') // di cek lebih dari sehari
        const sekarang = DateTime.now().startOf('day')
        if(target < sekarang){
          tags.push('terlambat')
        }

        let diff = sekarang.diff(target, ['days']).toObject()
        lamaTerlambat = diff.days || 0
      }
      
      // ------- fungsi ---------------
      const fungsi = {
        rupiahParser: rupiahParser,
        kapitalHurufPertama: kapitalHurufPertama
      }

      // -------- tambahan --------------
      const tambahan = {
        adaFotoPJ: (await Drive.exists('transaksi/penjualan/' + penjualan.fotoBarang)),
        lamaTerlambat: lamaTerlambat
      }

      return await view.render('transaksi/pembelian/form-QR-beli', { penjualan, tambahan, tags, fungsi })

    } catch (error) {
      session.flash('alertError', 'Kode mungkin salah, typo, atau transaksi terkait telah dijual sebelumnya.')
      return response.redirect().toPath('/app/transaksi/pembelian/')
    }
  }

  public async simpanTransaksi({ request, session, response, auth }: HttpContextContract) {
    const newPembelianQRSchema = schema.create({
      kode: schema.string({ trim: true }, [
        rules.exists({
          table: 'penjualans',
          column: 'kode_transaksi',
          where: {
            deleted_at: null,
            dibeli_at: null
          },
        }),
      ]), 

      beratBarang: schema.number([rules.unsigned()]),

      keteranganCatatan: schema.string.optional({
        trim: true
      }, [rules.maxLength(100)]),

      ajukanTT: schema.string.optional(), //cukup dicek undefined apa ngga, isinya ngga penting
      adaJanjiTT: schema.string.optional(), //khusus ini, cuma formalitas doang. datanya tetep ngambil dari penjualan
      barangDipakai: schema.string.optional(), //cukup dicek undefined apa ngga, isinya ngga penting
      pelangganTetap: schema.string.optional(), //cukup dicek undefined apa ngga, isinya ngga penting

      ajukanGadai: schema.string.optional(), //cukup dicek undefined apa ngga, isinya ngga penting. INI GADAI TAMBAHAN DARI DOSEN

      idKerusakan: schema.array
        .optional([
          rules.minLength(1)
        ])
        .members(
          schema.number([
            rules.unsigned(),
            rules.exists({
              table: 'kerusakans',
              column: 'id',
              where: {
                deleted_at: null,
              },
            })
          ])
        ),

      jumlahKerusakan: schema.array
        .optional([
          rules.minLength(1)
        ])
        .members(
          schema.number([
            rules.unsigned()
          ])
        ),

      // ini baru buat ngecek ditawar apa ngga
      apakahDitawar: schema.string.optional(), //cukup dicek undefined apa ngga, isinya ngga penting
      dealTawaran: schema.number([
        rules.unsigned(),
      ]),
    })

    try {
      const validrequest = await request.validate({
        schema: newPembelianQRSchema
      })

      // udah di cek diatas soal deleted_at ama dibeli_at
      const penjualan = await Penjualan.findByOrFail('kode_transaksi', validrequest.kode)
      await penjualan.load('kodeProduksi', (query) => {
        query.preload('kadar')
      })
      await penjualan.load('model', (query) => {
        query.preload('bentuk')
      })
      await penjualan.load('itemJuals')


      const pengaturan = await Pengaturan.findOrFail(1)

      // ------------ PENGAKSES -----------------
      if(!auth.user) throw 'auth ngga valid'
      const userPengakses = await User.findOrFail(auth.user.id)
      await userPengakses.load('pengguna')


      // ------------ DILUAR --------------------
      let keteranganTransaksi = ''
      let rumusDipake = 'kosong' // ini buat testing

      // ------------ data nota -----------------
      let apakahPotonganPersen = penjualan.apakahPotonganPersen
      let hargaJualNota = penjualan.hargaJualAkhir
      let potonganDariNota = penjualan.potongan
      let apakahJanjiTT = penjualan.apakahJanjiTukarTambah

      // -------- potongan & penalti ------------
      let potongan = 0 // ini buat ngitung rumus
      let potonganBaru = 0 // kalau ada perubahan potongan, taro sini
      let penalti = 0

      // ----------- hitungan transaksi -------------
      let BERATVALID = 0
      const hargaMal = pengaturan.hargaMal
      let hargaPerGram = 0
      let hargaBeliTarget = 0 // ini yang bakal dipake
      let hargaBeliMaksDitawar = 0 // ini mentok kalo ditawar
      
      // -------------- kerusakan ------------------
      let wadahRusak: Array < any > = []
      let ongkosRusak = 0    
      let kondisiBarang = '' // uripan, rusak, rosok

      // ----------- DATA BARU TAWARAN --------------
      let apakahDitawar = (validrequest.apakahDitawar)? true : false
      let hargaFinal = validrequest.dealTawaran
      let hargaPerGramFinal = hargaFinal / validrequest.beratBarang

      // ==================================== SELEKSI DATA =======================================
      let apakahRosok = false
      let apakahBisaDitawar = false
      
      // INGET, SELALU ADA NOTA LEO
      let apakahGadai = (validrequest.ajukanGadai)? true : false
      let apakahTT = (validrequest.ajukanTT && !validrequest.ajukanGadai) ? true : false // ga dicek lagi, INI GADAI TAMBAHAN DARI DOSEN GABISA TT
      // janjiTT diatas
      let apakahTerlambatTT = false // OK
      let apakahBarangDipakai = (validrequest.barangDipakai) ? true : false // ga dicek lagi, OK
      let apakahPelangganTetap = (validrequest.pelangganTetap)? true: false // ga dicek lagi, OK

      // --------------- cek & hitung rosok --------------------- OK
      if (validrequest.idKerusakan && validrequest.idKerusakan.length > 0 && validrequest.jumlahKerusakan && validrequest.jumlahKerusakan.length > 0) {
        if (validrequest.idKerusakan.length !== validrequest.jumlahKerusakan.length) throw 'Kerusakan tidak valid'

        let i = 0
        let cariRosok = true // kalau udah false, berarti ngga nyari lagi

        for (const item of validrequest.idKerusakan) {
          try {
            const rusak = await Kerusakan.findOrFail(item)
            if (!rusak.apakahBisaDiperbaiki && cariRosok) {
              apakahRosok = true
              cariRosok = false
            }

            let hitung  = (rusak.ongkosNominal * validrequest.jumlahKerusakan[i])
            ongkosRusak += hitung
            wadahRusak.push({
              teks: `${rusak.nama} (${validrequest.jumlahKerusakan[i]})`,
              ongkos: rupiahParser(-hitung)
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
      // QR selalu ada Nota LEO

      // --------------- cek terlambat TT ---------------- OK
      if (apakahJanjiTT) {
        let target = penjualan.createdAt.plus({
          day: 1
        }).set({
          hour: 0,
          minute: 0,
          second: 0,
          millisecond: 0
        })
        let sekarang = DateTime.now().set({
          hour: 0,
          minute: 0,
          second: 0,
          millisecond: 0
        })

        if (target < sekarang) apakahTerlambatTT = true
      }

      // ==================================== ALUR HITUNGAN RUMUS MULAI DARI SINI =======================================
      // Perhatian: Kalo pake QR, berarti ngga bakal masuk ke rumus C1 ama C2! Apus aja

      // yang make % MAL, pake berat barang. yang make potongan, pake berat penjualan!

      if (apakahRosok) {
        kondisiBarang = 'rosok'
        keteranganTransaksi = 'Dihitung harga rosok, kerusakan & potongan dianulir'
        apakahBisaDitawar = true
        ongkosRusak = 0
        BERATVALID = validrequest.beratBarang

        if (apakahTT) {
          // --------------- Rumus A, TT Rosok ---------------------
          rumusDipake = 'A'

          hargaPerGram = hargaMal * ( penjualan.kodeProduksi.kadar.persentaseMalRosok - penjualan.kodeProduksi.kadar.marginPersenUntungRosokTtMax ) / 100
          hargaBeliTarget = hargaPerGram * validrequest.beratBarang

          hargaBeliMaksDitawar = hargaMal * ( penjualan.kodeProduksi.kadar.persentaseMalRosok - penjualan.kodeProduksi.kadar.marginPersenUntungRosokTtMin ) / 100 * validrequest.beratBarang
        
        } else {
          // --------------- Rumus B, Jual Rosok ---------------------
          rumusDipake = 'B'

          hargaPerGram = hargaMal * ( penjualan.kodeProduksi.kadar.persentaseMalRosok - penjualan.kodeProduksi.kadar.marginPersenUntungRosokMax ) / 100
          hargaBeliTarget = hargaPerGram * validrequest.beratBarang

          hargaBeliMaksDitawar = hargaMal * ( penjualan.kodeProduksi.kadar.persentaseMalRosok - penjualan.kodeProduksi.kadar.marginPersenUntungRosokMin ) / 100 * validrequest.beratBarang

        }
      } else {
        if(wadahRusak.length > 0){
          kondisiBarang = 'rusak'
        } else {
          kondisiBarang = 'uripan'
        }
        
        hargaPerGram = penjualan.hargaJualPerGram
        BERATVALID = penjualan.beratBarang

          if (apakahTT) {
            if (apakahJanjiTT) {
              if (apakahTerlambatTT) {
                if (apakahBarangDipakai) {
                  // --------------- Rumus E, Normal TT Tanpa Janji --------------------- // dobel OK
                  apakahBisaDitawar = (apakahPelangganTetap)? false : true // kalo pelanggan tetap udah harga PAS
                  rumusDipake = 'E' 
                  // disini ada ngecek pelanggan tetap / ngga

                  // INGET! datanya sesuai penjualan!
                  let penguranganPotongan = (apakahPelangganTetap)? penjualan.kodeProduksi.kadar.toleransiPenguranganPotonganMax : penjualan.kodeProduksi.kadar.toleransiPenguranganPotonganMin
                  let penguranganPotonganMaxTawar = penjualan.kodeProduksi.kadar.toleransiPenguranganPotonganMax

                  let penguranganPotonganDeskripsi = (apakahPotonganPersen)? `${penguranganPotongan}%` : `${rupiahParser(penguranganPotongan)} per gram`
                  keteranganTransaksi = `Potongan dikurangi ${penguranganPotonganDeskripsi}. `

                  // hitung potongan
                  potonganBaru = potonganDariNota - penguranganPotongan
                  let potonganBaruTawar = potonganDariNota - penguranganPotonganMaxTawar

                  potongan = (apakahPotonganPersen)? potonganBaru / 100 * hargaJualNota : hitungPotonganNormal(potonganBaru, penjualan.beratBarang)
                  let potonganTawar = (apakahPotonganPersen)? potonganBaruTawar / 100 * hargaJualNota : hitungPotonganNormal(potonganBaruTawar, penjualan.beratBarang)

                  keteranganTransaksi += (apakahPotonganPersen)? '' : penjelasPotonganNormal(penjualan.beratBarang)

                  hargaBeliTarget = hargaJualNota - potongan - ongkosRusak
                  hargaBeliMaksDitawar = hargaJualNota - potonganTawar - ongkosRusak

                } else {
                  // --------------- Rumus F ---------------------
                  apakahBisaDitawar = false
                  rumusDipake = 'F'
                  // disini ada penalti keterlambatan dari DATABASE, dibawah 5 gram MIN, diatas 5 MAX

                  penalti = (penjualan.beratBarang >= 5)? pengaturan.penaltiTelatJanjiMax : pengaturan.penaltiTelatJanjiMin
                  keteranganTransaksi = `Potongan diganti penalti keterlambatan ${rupiahParser(penalti)} `

                  potongan = 0

                  hargaBeliTarget = hargaJualNota - ongkosRusak - penalti
                }

              } else {
                // --------------- Rumus G, Normal Potongan Anulir ---------------------
                apakahBisaDitawar = false
                rumusDipake = 'G'

                // INGET! datanya sesuai perjanjian penjualan!
                keteranganTransaksi = `Sesuai perjanjian, potongan dianulir. `

                potongan = 0


                hargaBeliTarget = hargaJualNota - ongkosRusak
              }


            } else {
              // --------------- Rumus E, Normal TT Tanpa Janji --------------------- OK
              apakahBisaDitawar = (apakahPelangganTetap)? false : true // kalo pelanggan tetap udah harga PAS
              rumusDipake = 'E' 
              // disini ada ngecek pelanggan tetap / ngga

              // INGET! datanya sesuai perjanjian penjualan!
              let penguranganPotongan = (apakahPelangganTetap)? penjualan.kodeProduksi.kadar.toleransiPenguranganPotonganMax : penjualan.kodeProduksi.kadar.toleransiPenguranganPotonganMin
              let penguranganPotonganMaxTawar = penjualan.kodeProduksi.kadar.toleransiPenguranganPotonganMax

              let penguranganPotonganDeskripsi = (apakahPotonganPersen)? `${penguranganPotongan}%` : `${rupiahParser(penguranganPotongan)} per gram`
              keteranganTransaksi = `Potongan dikurangi ${penguranganPotonganDeskripsi}. `

              // hitung potongan
              potonganBaru = potonganDariNota - penguranganPotongan
              let potonganBaruTawar = potonganDariNota - penguranganPotonganMaxTawar

              potongan = (apakahPotonganPersen)? potonganBaru / 100 * hargaJualNota : hitungPotonganNormal(potonganBaru, penjualan.beratBarang)
              let potonganTawar = (apakahPotonganPersen)? potonganBaruTawar / 100 * hargaJualNota : hitungPotonganNormal(potonganBaruTawar, penjualan.beratBarang)

              keteranganTransaksi += (apakahPotonganPersen)? '' : penjelasPotonganNormal(penjualan.beratBarang)

              hargaBeliTarget = hargaJualNota - potongan - ongkosRusak
              hargaBeliMaksDitawar = hargaJualNota - potonganTawar - ongkosRusak
            }

          } else {
            // --------------- Rumus D, Normal --------------------- OK
            rumusDipake = 'D'
            apakahBisaDitawar = false

            // INGET! datanya sesuai perjanjian penjualan!
            potongan = (apakahPotonganPersen)? potonganDariNota / 100 * hargaJualNota : hitungPotonganNormal(potonganDariNota, penjualan.beratBarang)

            keteranganTransaksi += (apakahPotonganPersen)? '' : penjelasPotonganNormal(penjualan.beratBarang)

            hargaBeliTarget = hargaJualNota - potongan - ongkosRusak
          }

      }


      // ==================================== SELESAI RUMUS, BANDING SAMA INPUT =======================================
      // dua poin dibawah ini udah sekalian ngecek buat ngehindarin yang nawar tp transaksinya gaboleh ditawar
      if(!apakahBisaDitawar){
        hargaBeliMaksDitawar = hargaBeliTarget
      }

      // harus ngecek tawaran, diatas TARGET dibawah MAKS. Selain itu ngga bener
      if(validrequest.dealTawaran < pembulatanRupiah(hargaBeliTarget, 500) || validrequest.dealTawaran > pembulatanRupiah(hargaBeliMaksDitawar, 500)){
        throw 'Input tawaran tidak valid.'
      }

      const lastPenjualan = await Database
      .from('pembelians')
      .select('id')
      .orderBy('id', 'desc')
      .limit(1)

      let latestId = '001'

      if(lastPenjualan[0]){
        latestId = tigaDigit(lastPenjualan[0].id + 1)
      }
      
      let namaBarang = `${(apakahTT)? 'TT' : 'JU'} 1 ${penjualan.model.bentuk.kode} ${penjualan.kodeProduksi.kadar.nama} model ${penjualan.model.nama} ${BERATVALID} gr ${kondisiBarang.toUpperCase()} Toko LEO QR`
      let kodeTransaksi = 'PB' + ((apakahDitawar)? 1:0) + penjualan.model.id.toString() + latestId
      kodeTransaksi += penjualan.kodeProduksi.id.toString() + DateTime.now().toFormat('SSS') + rumusDipake


      let pembelianBaru = await penjualan.kodeProduksi.related('pembelians').create({
        namaBarang: namaBarang,
        kodeTransaksi: kodeTransaksi,
        kondisiFisik: kondisiBarang,
        keteranganTransaksi: keteranganTransaksi,
        modelId: penjualan.model.id,
        penggunaId: userPengakses.pengguna.id,
        beratBarang: BERATVALID,
        asalToko: pengaturan.namaToko,
        alamatAsalToko: pengaturan.alamatTokoLengkap,
        keterangan: validrequest.keteranganCatatan,
        apakahTukarTambah: apakahTT,
        apakahDitawar: apakahDitawar,
        hargaBeliPerGramSeharusnya: hargaPerGram, // diitung dulu
        hargaBeliPerGramAkhir: hargaPerGramFinal, // diitung dulu
        hargaBeliSeharusnya: hargaBeliTarget, // diitung dulu
        hargaBeliAkhir: hargaFinal, // diitung dulu
        ongkosKerusakanTotal: ongkosRusak,
        apakahDigadaikan: apakahGadai,
        maxGadaiAt: (apakahGadai)? DateTime.now().plus({ minute: 30 }) : DateTime.now() // konsepnya sama kek print nota di penjualan
      })

      // n-to-n ke kerusakan
      if(validrequest.idKerusakan && validrequest.jumlahKerusakan){
        let i = 0

        for (const item of validrequest.idKerusakan) {
          try {
            let rusak = await Kerusakan.findOrFail(item)
            let cekRosok = (kondisiBarang === 'rosok')

            await pembelianBaru.related('kerusakans').attach({
              [rusak.id]: { // ini id_kerusakan
                apakah_diabaikan: cekRosok,
                banyak_kerusakan: validrequest.jumlahKerusakan[i],
                total_ongkos: (!cekRosok)? validrequest.jumlahKerusakan[i] * rusak.ongkosNominal : 0
              }
            })

          } catch (error) {
            // buat nangkep error doang
          } 
        }
      }

      await pembelianBaru.related('pembelianNotaLeo').create({
        apakahJanjiTukarTambah: apakahJanjiTT,
        apakahSudahDipakai: apakahBarangDipakai,
        tanggalJualPadaNota: penjualan.createdAt,
        beratBarangPadaNota: penjualan.beratBarang,
        hargaJualPadaNota: penjualan.hargaJualAkhir,
        apakahPotonganPersen: penjualan.apakahPotonganPersen,
        potonganPadaNota: penjualan.potongan,
        potonganAkhir: (potonganBaru)? potonganBaru : potonganDariNota,
        penaltiTelat : penalti,
        ongkosPotonganTotal: potongan,
        namaPemilik: penjualan.namaPemilik,
        alamatPemilik: penjualan.alamatPemilik
      })

      penjualan.dibeliAt = DateTime.now()
      await penjualan.save()

      pengaturan.saldoToko -= hargaFinal
      await pengaturan.save()

      return response.redirect().withQs({ tid: pembelianBaru.id }).toPath('/app/transaksi/pembelian/pasca')

    } catch (error) {
      session.flash('alertError', 'Ada kesalahan saat menghitung rumus, silahkan coba lagi setelah beberapa saat!')
      return response.redirect().back()
    }
  }

  public async hitungHargaBelakang({ request, response }: HttpContextContract) {
    const newPembelianQRSchema = schema.create({
      kode: schema.string({ trim: true }, [
        rules.exists({
          table: 'penjualans',
          column: 'kode_transaksi',
          where: {
            deleted_at: null,
            dibeli_at: null
          },
        }),
      ]), 

      keteranganCatatan: schema.string.optional({
        trim: true
      }, [rules.maxLength(100)]),
      beratBarang: schema.number([rules.unsigned()]),

      ajukanTT: schema.string.optional(), //cukup dicek undefined apa ngga, isinya ngga penting
      adaJanjiTT: schema.string.optional(), //khusus ini, cuma formalitas doang. datanya tetep ngambil dari penjualan
      barangDipakai: schema.string.optional(), //cukup dicek undefined apa ngga, isinya ngga penting
      pelangganTetap: schema.string.optional(), //cukup dicek undefined apa ngga, isinya ngga penting

      ajukanGadai: schema.string.optional(), //cukup dicek undefined apa ngga, isinya ngga penting. INI GADAI TAMBAHAN DARI DOSEN

      idKerusakan: schema.array
        .optional([
          rules.minLength(1)
        ])
        .members(
          schema.number([
            rules.unsigned(),
            rules.exists({
              table: 'kerusakans',
              column: 'id',
              where: {
                deleted_at: null,
              },
            })
          ])
        ),

      jumlahKerusakan: schema.array
        .optional([
          rules.minLength(1)
        ])
        .members(
          schema.number([
            rules.unsigned()
          ])
        ),
    })

    try {
      const validrequest = await request.validate({
        schema: newPembelianQRSchema
      })

      // udah di cek diatas soal deleted_at ama dibeli_at
      const penjualan = await Penjualan.findByOrFail('kode_transaksi', validrequest.kode)
      await penjualan.load('kodeProduksi', (query) => {
        query.preload('kadar')
      })
      await penjualan.load('model', (query) => {
        query.preload('bentuk')
      })
      await penjualan.load('itemJuals')


      const pengaturan = await Pengaturan.findOrFail(1)

      // ------------ DILUAR --------------------
      let keteranganTransaksi = ''
      let rumusDipake = 'kosong' // ini buat testing

      // ------------ data nota -----------------
      let apakahPotonganPersen = penjualan.apakahPotonganPersen
      let hargaJualNota = penjualan.hargaJualAkhir
      let potonganDariNota = penjualan.potongan
      let apakahJanjiTT = penjualan.apakahJanjiTukarTambah

      // -------- potongan & penalti ------------
      let potongan = 0 // ini buat ngitung rumus
      let potonganDeskripsi :string | null = null // ini buat keterangan, dikirm balik ke client
      let penaltiDeskripsi :string | null = null // ini buat keterangan, dikirm balik ke client
      let totalPotonganDeskripsi :string | null = null // ini buat keterangan, dikirm balik ke client

      // ----------- hitungan transaksi -------------
      const hargaMal = pengaturan.hargaMal
      let hargaPerGram = 0
      let apakahBisaDitawar = false
      let hargaBeliTarget = 0 // ini yang bakal dipake
      let hargaBeliMaksDitawar = 0 // ini mentok kalo ditawar
      
      // -------------- kerusakan ------------------
      let wadahRusak: Array < any > = []
      let ongkosRusak = 0    
      let kondisiBarang = '' // uripan, rusak, rosok

      // ==================================== SELEKSI DATA =======================================
      let apakahRosok = false
      
      // INGET, SELALU ADA NOTA LEO
      let apakahTT = (validrequest.ajukanTT && !validrequest.ajukanGadai) ? true : false // ga dicek lagi, INI GADAI TAMBAHAN DARI DOSEN GABISA TT
      let apakahTerlambatTT = false // OK
      let apakahBarangDipakai = (validrequest.barangDipakai) ? true : false // ga dicek lagi, OK
      let apakahPelangganTetap = (validrequest.pelangganTetap)? true: false // ga dicek lagi, OK

      // --------------- cek & hitung rosok --------------------- OK
      if (validrequest.idKerusakan && validrequest.idKerusakan.length > 0 && validrequest.jumlahKerusakan && validrequest.jumlahKerusakan.length > 0) {
        if (validrequest.idKerusakan.length !== validrequest.jumlahKerusakan.length) throw 'Kerusakan tidak valid'

        let i = 0
        let cariRosok = true // kalau udah false, berarti ngga nyari lagi

        for (const item of validrequest.idKerusakan) {
          try {
            const rusak = await Kerusakan.findOrFail(item)
            if (!rusak.apakahBisaDiperbaiki && cariRosok) {
              apakahRosok = true
              cariRosok = false
            }

            let hitung  = (rusak.ongkosNominal * validrequest.jumlahKerusakan[i])
            ongkosRusak += hitung
            wadahRusak.push({
              teks: `${rusak.nama} (${validrequest.jumlahKerusakan[i]})`,
              ongkos: rupiahParser(-hitung)
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
      // QR selalu ada Nota LEO

      // --------------- cek terlambat TT ---------------- OK
      if (apakahJanjiTT) {
        let target = penjualan.createdAt.plus({
          day: 1
        }).set({
          hour: 0,
          minute: 0,
          second: 0,
          millisecond: 0
        })
        let sekarang = DateTime.now().set({
          hour: 0,
          minute: 0,
          second: 0,
          millisecond: 0
        })

        if (target < sekarang) apakahTerlambatTT = true
      }

      // ==================================== ALUR HITUNGAN RUMUS MULAI DARI SINI =======================================
      // Perhatian: Kalo pake QR, berarti ngga bakal masuk ke rumus C1 ama C2! Apus aja

      // yang make % MAL, pake berat barang. yang make potongan, pake berat penjualan!

      if (apakahRosok) {
        kondisiBarang = 'rosok'
        keteranganTransaksi = 'Dihitung harga rosok, kerusakan & potongan dianulir'
        apakahBisaDitawar = true
        ongkosRusak = 0

        if (apakahTT) {
          // --------------- Rumus A, TT Rosok ---------------------
          rumusDipake = 'A'

          hargaPerGram = hargaMal * ( penjualan.kodeProduksi.kadar.persentaseMalRosok - penjualan.kodeProduksi.kadar.marginPersenUntungRosokTtMax ) / 100
          hargaBeliTarget = hargaPerGram * validrequest.beratBarang

          hargaBeliMaksDitawar = hargaMal * ( penjualan.kodeProduksi.kadar.persentaseMalRosok - penjualan.kodeProduksi.kadar.marginPersenUntungRosokTtMin ) / 100 * validrequest.beratBarang
        
        } else {
          // --------------- Rumus B, Jual Rosok ---------------------
          rumusDipake = 'B'

          hargaPerGram = hargaMal * ( penjualan.kodeProduksi.kadar.persentaseMalRosok - penjualan.kodeProduksi.kadar.marginPersenUntungRosokMax ) / 100
          hargaBeliTarget = hargaPerGram * validrequest.beratBarang

          hargaBeliMaksDitawar = hargaMal * ( penjualan.kodeProduksi.kadar.persentaseMalRosok - penjualan.kodeProduksi.kadar.marginPersenUntungRosokMin ) / 100 * validrequest.beratBarang

        }
      } else {
        if(wadahRusak.length > 0){
          kondisiBarang = 'rusak'
        } else {
          kondisiBarang = 'uripan'
        }
        
        hargaPerGram = penjualan.hargaJualPerGram

          if (apakahTT) {
            if (apakahJanjiTT) {
              if (apakahTerlambatTT) {
                if (apakahBarangDipakai) {
                  // --------------- Rumus E, Normal TT Tanpa Janji --------------------- // dobel OK
                  apakahBisaDitawar = (apakahPelangganTetap)? false : true // kalo pelanggan tetap udah harga PAS
                  rumusDipake = 'E' 
                  // disini ada ngecek pelanggan tetap / ngga

                  // INGET! datanya sesuai penjualan!
                  let penguranganPotongan = (apakahPelangganTetap)? penjualan.kodeProduksi.kadar.toleransiPenguranganPotonganMax : penjualan.kodeProduksi.kadar.toleransiPenguranganPotonganMin
                  let penguranganPotonganMaxTawar = penjualan.kodeProduksi.kadar.toleransiPenguranganPotonganMax

                  let penguranganPotonganDeskripsi = (apakahPotonganPersen)? `${penguranganPotongan}%` : `${rupiahParser(penguranganPotongan)} per gram`
                  keteranganTransaksi = `Potongan dikurangi ${penguranganPotonganDeskripsi}. `

                  // hitung potongan
                  let potonganBaru = potonganDariNota - penguranganPotongan
                  let potonganBaruTawar = potonganDariNota - penguranganPotonganMaxTawar

                  potongan = (apakahPotonganPersen)? potonganBaru / 100 * hargaJualNota : hitungPotonganNormal(potonganBaru, penjualan.beratBarang)
                  let potonganTawar = (apakahPotonganPersen)? potonganBaruTawar / 100 * hargaJualNota : hitungPotonganNormal(potonganBaruTawar, penjualan.beratBarang)

                  potonganDeskripsi = (apakahPotonganPersen)? `${potonganBaru}% harga jual` : `${rupiahParser(potonganBaru)}/g`
                  totalPotonganDeskripsi = rupiahParser(potongan)
                  keteranganTransaksi += (apakahPotonganPersen)? '' : penjelasPotonganNormal(penjualan.beratBarang)

                  hargaBeliTarget = hargaJualNota - potongan - ongkosRusak
                  hargaBeliMaksDitawar = hargaJualNota - potonganTawar - ongkosRusak

                } else {
                  // --------------- Rumus F ---------------------
                  apakahBisaDitawar = false
                  rumusDipake = 'F'
                  // disini ada penalti keterlambatan dari DATABASE, dibawah 5 gram MIN, diatas 5 MAX

                  let penalti = (penjualan.beratBarang >= 5)? pengaturan.penaltiTelatJanjiMax : pengaturan.penaltiTelatJanjiMin
                  penaltiDeskripsi = rupiahParser(penalti)
                  keteranganTransaksi = `Potongan diganti penalti keterlambatan ${rupiahParser(penalti)} `

                  potongan = 0
                  potonganDeskripsi = rupiahParser(0)

                  hargaBeliTarget = hargaJualNota - ongkosRusak - penalti
                }

              } else {
                // --------------- Rumus G, Normal Potongan Anulir ---------------------
                apakahBisaDitawar = false
                rumusDipake = 'G'

                // INGET! datanya sesuai perjanjian penjualan!
                keteranganTransaksi = `Sesuai perjanjian, potongan dianulir. `

                potongan = 0
                potonganDeskripsi = rupiahParser(0)
                totalPotonganDeskripsi = rupiahParser(0)   

                hargaBeliTarget = hargaJualNota - ongkosRusak
              }


            } else {
              // --------------- Rumus E, Normal TT Tanpa Janji --------------------- OK
              apakahBisaDitawar = (apakahPelangganTetap)? false : true // kalo pelanggan tetap udah harga PAS
              rumusDipake = 'E' 
              // disini ada ngecek pelanggan tetap / ngga

              // INGET! datanya sesuai perjanjian penjualan!
              let penguranganPotongan = (apakahPelangganTetap)? penjualan.kodeProduksi.kadar.toleransiPenguranganPotonganMax : penjualan.kodeProduksi.kadar.toleransiPenguranganPotonganMin
              let penguranganPotonganMaxTawar = penjualan.kodeProduksi.kadar.toleransiPenguranganPotonganMax

              let penguranganPotonganDeskripsi = (apakahPotonganPersen)? `${penguranganPotongan}%` : `${rupiahParser(penguranganPotongan)} per gram`
              keteranganTransaksi = `Potongan dikurangi ${penguranganPotonganDeskripsi}. `

              // hitung potongan
              let potonganBaru = potonganDariNota - penguranganPotongan
              let potonganBaruTawar = potonganDariNota - penguranganPotonganMaxTawar

              potongan = (apakahPotonganPersen)? potonganBaru / 100 * hargaJualNota : hitungPotonganNormal(potonganBaru, penjualan.beratBarang)
              let potonganTawar = (apakahPotonganPersen)? potonganBaruTawar / 100 * hargaJualNota : hitungPotonganNormal(potonganBaruTawar, penjualan.beratBarang)

              potonganDeskripsi = (apakahPotonganPersen)? `${potonganBaru}% harga jual` : `${rupiahParser(potonganBaru)}/g`
              totalPotonganDeskripsi = rupiahParser(potongan)
              keteranganTransaksi += (apakahPotonganPersen)? '' : penjelasPotonganNormal(penjualan.beratBarang)

              hargaBeliTarget = hargaJualNota - potongan - ongkosRusak
              hargaBeliMaksDitawar = hargaJualNota - potonganTawar - ongkosRusak
            }

          } else {
            // --------------- Rumus D, Normal --------------------- OK
            rumusDipake = 'D'
            apakahBisaDitawar = false

            // INGET! datanya sesuai perjanjian penjualan!
            potongan = (apakahPotonganPersen)? potonganDariNota / 100 * hargaJualNota : hitungPotonganNormal(potonganDariNota, penjualan.beratBarang)
            
            potonganDeskripsi = (apakahPotonganPersen)? `${potonganDariNota}% harga jual` : `${rupiahParser(potonganDariNota)}/g`
            totalPotonganDeskripsi = rupiahParser(potongan)
            keteranganTransaksi += (apakahPotonganPersen)? '' : penjelasPotonganNormal(penjualan.beratBarang)

            hargaBeliTarget = hargaJualNota - potongan - ongkosRusak
          }

      }

      // ==================================== SELESAI HITUNGAN RUMUS =======================================

      let potonganDeskripsiNota = (apakahPotonganPersen)? `${potonganDariNota}% harga jual` : `${rupiahParser(potonganDariNota)}/g`

      return {
        aaRumus: rumusDipake, // buat testing
        beratBarang: validrequest.beratBarang, // OK
        keteranganTransaksi,
        dataNota: {
          jenisStok: (penjualan.apakahStokBaru)? 'Baru' : 'Lama', // OK
          hargaJualNota: rupiahParser(hargaJualNota), // OK
          potonganDeskripsiNota, // OK
          beratNota: penjualan.beratBarang + ' gram'
        },

        kerusakan: {
          kondisiBarang: kapitalHurufPertama(kondisiBarang), // OK
          totalKerusakan: rupiahParser(ongkosRusak), // OK
          wadahRusak // udah ngerangkap ama ngecek ada kerusakan ngga, OK
        },

        potonganNPenalti: {
          potonganDeskripsi, // OK
          penaltiDeskripsi, // OK
          totalPotonganDeskripsi // OK
        },

        hitunganTransaksi: {
          hargaMal, // buat testing
          hargaPerGram: `${rupiahParser(hargaPerGram)}/g`, // OK
          apakahBisaDitawar, // OK
          hargaBeliTarget: pembulatanRupiah(hargaBeliTarget, 500), // jangan lupa pembulatan
          hargaBeliMaksDitawar: pembulatanRupiah(hargaBeliMaksDitawar, 500), // jangan lupa pembulatan         
        }
      }

    } catch (error) {
      return response.badRequest({
        error: error
      })
    }
  }
}


function hitungPotonganNormal(potongan: number, beratBarang: number){
  let beratBulat = Math.floor(beratBarang)
  let beratDesimal = beratBarang - beratBulat
  let bonusBerat = 0

  if(beratBarang < 1 && beratBarang > 0){
    bonusBerat = 1

  } else{
    if(beratDesimal >= 0.5){
      bonusBerat = 1
  
    } else if(beratDesimal >= 0.15){ // tanyain ntar 0.1 atau 0.15
      bonusBerat = beratDesimal
    }
    // selain 2 syarat tadi ngga dapet ekstra (0.5 > beratBarang >= 0.15)
  }

  return (beratBulat + bonusBerat) * potongan
}

function penjelasPotonganNormal(beratBarang: number){
  let beratBulat = Math.floor(beratBarang)
  let beratDesimal = beratBarang - beratBulat
  let penjelas :string = ''

  if(beratBarang < 1 && beratBarang > 0){
    penjelas = 'Berat barang dibawah 1 gram dikenai 1 potongan penuh.'

  } else{
    if(beratDesimal >= 0.5){
      penjelas = 'Berat desimal mulai 0.5 gram keatas dikenai 1 potongan penuh'
  
    } else if(beratDesimal > 0 && beratDesimal < 0.15){ // tanyain ntar 0.1 atau 0.15
      penjelas = 'Berat desimal dibawah 0.15 gram tidak dikenai potongan'
    }
  }

  return penjelas
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

function tigaDigit(angka: number){
  let teks = angka.toString()
  let finalTeks = teks
  if(teks.length == 2) finalTeks = '0' + teks
  if(teks.length <= 1) finalTeks = '00' + teks

  return finalTeks
}

function pembulatanRupiah(angka: number, kelipatan: number = 1000){
  let sisa = angka % kelipatan

  if(sisa > 0) return angka + (kelipatan - sisa)
  else return angka
}