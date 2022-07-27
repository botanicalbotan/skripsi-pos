import {
  HttpContextContract
} from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import {
  schema,
  rules
} from '@ioc:Adonis/Core/Validator'
import {
  DateTime
} from 'luxon'
import Kerusakan from 'App/Models/barang/Kerusakan'
import KodeProduksi from 'App/Models/barang/KodeProduksi'
import Pengaturan from 'App/Models/sistem/Pengaturan'
import User from 'App/Models/User'
import Pembelian from 'App/Models/transaksi/Pembelian'
import Model from 'App/Models/barang/Model'
import Terbilang from 'App/CustomClasses/Terbilang'
import Drive from '@ioc:Adonis/Core/Drive'

export default class PembeliansController {

  // ============================= fungsi rute ==========================================

  public async index({
    view
  }: HttpContextContract) {
    const kadars = await Database
      .from('kadars')
      .select('id', 'nama')

    return await view.render('transaksi/pembelian/form-beli', {
      kadars
    })
  }

  public async show({ params, view, session, response, auth }: HttpContextContract) {
    try {
      if(!auth.user) throw 'auth ngga valid'

      const userPengakses = await User.findOrFail(auth.user.id)
      await userPengakses.load('pengguna', (query) => {
        query.preload('jabatan')
      })

      let isAdmin = (['Pemilik', 'Kepala Toko'].includes(userPengakses.pengguna.jabatan.nama))

      const PB = await Pembelian.findOrFail(params.id)

      await PB.load('pengguna', (query) => {
        query.preload('jabatan')
      })

      await PB.load('pembelianNotaLeo')
     
      await PB.load('model', (query) => {
        query.preload('bentuk')
      })
      await PB.load('kodeProduksi', (query) =>{
        query.preload('kadar')
      })
      
      const fungsi = {
        rupiahParser: rupiahParser,
        kapitalHurufPertama: kapitalHurufPertama
      }

      let apakahTelat = false

      if(PB.pembelianNotaLeo){
        let target = PB.pembelianNotaLeo.tanggalJualPadaNota.plus({ days:1 }).startOf('day')
        let kebeli = PB.createdAt.startOf('day')

        if(target < kebeli && PB.pembelianNotaLeo.apakahJanjiTukarTambah) apakahTelat = true
      }
      

      const tambahan = {
        adaFotoPencatat: (await Drive.exists('profilePict/' + PB.pengguna.foto)),
        isAdmin,
        apakahTelat
      }

      return await view.render('transaksi/pembelian/view-beli', { PB, fungsi, tambahan })

    } catch (error) {
      console.error(error)
      session.flash('alertError', 'Pembelian yang anda pilih tidak valid!')
      return response.redirect().toPath('/app/riwayat/pembelian')
    }
  }

  public async simpanTransaksi({ request, response, session, auth }: HttpContextContract) {
    const newPembelianSchema = schema.create({
      kelengkapanNota: schema.enum(['tanpa', 'dengan'] as
        const),
      asalPerhiasan: schema.enum(['luar', 'leo'] as
        const),
      namaToko: schema.string.optional({
        trim: true
      }, [rules.maxLength(50)]), // masih belom yakin dipake apa ngga
      kodepro: schema.number([
        rules.unsigned(),
        rules.exists({
          table: 'kode_produksis',
          column: 'id',
          where: {
            deleted_at: null,
          },
        }),
      ]),
      model: schema.number([
        rules.unsigned(),
        rules.exists({
          table: 'models',
          column: 'id',
          where: {
            deleted_at: null,
          },
        }),
      ]),
      jenisStok: schema.enum(['lama', 'baru'] as
        const),
      keteranganCatatan: schema.string.optional({
        trim: true
      }, [rules.maxLength(100)]),
      beratNota: schema.number.optional([
        rules.unsigned(),
        rules.requiredWhen('kelengkapanNota', '=', 'dengan')
      ]),
      beratBarang: schema.number([rules.unsigned()]),
      hargaJualNota: schema.number.optional([
        rules.unsigned(),
        rules.requiredWhen('kelengkapanNota', '=', 'dengan')
      ]),
      potonganNota: schema.number.optional([
        rules.unsigned(),
        rules.requiredWhen('asalPerhiasan', '=', 'leo')
      ]),
      tanggalBeli: schema.date.optional({}, [
        rules.beforeOrEqual('today'),
        rules.requiredWhen('asalPerhiasan', '=', 'leo')
      ]),
      ajukanTT: schema.string.optional(), //cukup dicek undefined apa ngga, isinya ngga penting
      adaJanjiTT: schema.string.optional(), //cukup dicek undefined apa ngga, isinya ngga penting
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
        schema: newPembelianSchema
      })
      const kodepro = await KodeProduksi.findOrFail(validrequest.kodepro)
      await kodepro.load('kadar')

      const pengaturan = await Pengaturan.findOrFail(1)

      // ------------ PENGAKSES ------------------
      if(!auth.user) throw 'auth ngga valid'
      const userPengakses = await User.findOrFail(auth.user.id)
      await userPengakses.load('pengguna')

      // ------------ DILUAR --------------------
      let keteranganTransaksi = ''
      let rumusDipake = 'kosong' // ini buat testing

      // ------------ data nota -----------------
      let hargaJualNota = (validrequest.hargaJualNota)? validrequest.hargaJualNota : 0
      let potonganDariNota = (validrequest.potonganNota)? validrequest.potonganNota : 0

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
      let apakahRusak = false // kalah ama rosok
      let apakahRosok = false
      let apakahBisaDitawar = false
      
      let adaNotaLeo = false
      let apakahGadai = (validrequest.ajukanGadai)? true : false
      let apakahTT = (validrequest.ajukanTT && !apakahGadai) ? true : false // ga dicek lagi, INI GADAI TAMBAHAN DARI DOSEN GABISA TT
      let apakahJanjiTT = (validrequest.adaJanjiTT) ? true : false // ga dicek lagi
      let apakahTerlambatTT = false
      let apakahBarangDipakai = (validrequest.barangDipakai) ? true : false // ga dicek lagi
      let apakahPelangganTetap = (validrequest.pelangganTetap)? true: false // ga dicek lagi

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

            apakahRusak = true

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
      if (validrequest.kelengkapanNota == 'dengan' && validrequest.asalPerhiasan == 'leo' && validrequest.hargaJualNota && validrequest.potonganNota && validrequest.tanggalBeli) adaNotaLeo = true


      // --------------- cek terlambat TT ---------------- OK
      if (validrequest.tanggalBeli && apakahJanjiTT) {
        let target = validrequest.tanggalBeli.plus({
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
      // urutannya bakal sama kayak catatan rumus lu, dari A ke H

      if(!adaNotaLeo && apakahRusak){
        // kalau dari luar, tapi ada rusak auto dianggep rosok
        apakahRosok = true
      }

      if (apakahRosok) {
        kondisiBarang = 'rosok'
        keteranganTransaksi = 'Dihitung harga rosok, kerusakan & potongan dianulir'
        apakahBisaDitawar = true
        BERATVALID = validrequest.beratBarang

        if (apakahTT) {
          // --------------- Rumus A, TT Rosok ---------------------
          rumusDipake = 'A'

          hargaPerGram = hargaMal * ( kodepro.kadar.persentaseMalRosok - kodepro.kadar.marginPersenUntungRosokTtMax ) / 100
          hargaBeliTarget = hargaPerGram * validrequest.beratBarang

          hargaBeliMaksDitawar = hargaMal * ( kodepro.kadar.persentaseMalRosok - kodepro.kadar.marginPersenUntungRosokTtMin ) / 100 * validrequest.beratBarang
        
        } else {
          // --------------- Rumus B, Jual Rosok ---------------------
          rumusDipake = 'B'

          hargaPerGram = hargaMal * ( kodepro.kadar.persentaseMalRosok - kodepro.kadar.marginPersenUntungRosokMax ) / 100
          hargaBeliTarget = hargaPerGram * validrequest.beratBarang

          hargaBeliMaksDitawar = hargaMal * ( kodepro.kadar.persentaseMalRosok - kodepro.kadar.marginPersenUntungRosokMin ) / 100 * validrequest.beratBarang

        }
      } else {
        if(wadahRusak.length > 0){
          kondisiBarang = 'rusak'
        } else {
          kondisiBarang = 'uripan'
        }        

        if (adaNotaLeo) {
          // yang make % MAL, pake berat barang. yang make potongan, pake berat penjualan!

          // khusus kalau ada nota LEO, ngitung apa2 pake berat NOTA, bukan berat BARANG
          BERATVALID = ((validrequest.beratNota)? validrequest.beratNota : validrequest.beratBarang)

          hargaPerGram = hargaJualNota / BERATVALID

          if (apakahTT) {
            if (apakahJanjiTT) {
              if (apakahTerlambatTT) {
                if (apakahBarangDipakai) {
                  // --------------- Rumus E, Normal TT Tanpa Janji --------------------- // dobel OK
                  apakahBisaDitawar = (apakahPelangganTetap)? false : true // kalo pelanggan tetap udah harga PAS
                  rumusDipake = 'E' 

                  // INGET! datanya sesuai perjanjian / nota, bukan DATABASE
                  let penguranganPotongan = (apakahPelangganTetap)? kodepro.kadar.toleransiPenguranganPotonganMax : kodepro.kadar.toleransiPenguranganPotonganMin
                  let penguranganPotonganMaxTawar = kodepro.kadar.toleransiPenguranganPotonganMax
                  let penguranganPotonganDeskripsi = (kodepro.kadar.apakahPotonganPersen)? `${penguranganPotongan}%` : `${rupiahParser(penguranganPotongan)} per gram`
                  keteranganTransaksi = `Potongan dikurangi ${penguranganPotonganDeskripsi}. `

                  // hitung potongan
                  potonganBaru = potonganDariNota - penguranganPotongan
                  let potonganBaruTawar = potonganDariNota - penguranganPotonganMaxTawar
                  potongan = (kodepro.kadar.apakahPotonganPersen)? potonganBaru / 100 * hargaJualNota : hitungPotonganNormal(potonganBaru, BERATVALID)
                  let potonganTawar = (kodepro.kadar.apakahPotonganPersen)? potonganBaruTawar / 100 * hargaJualNota : hitungPotonganNormal(potonganBaruTawar, BERATVALID)
                  keteranganTransaksi += (kodepro.kadar.apakahPotonganPersen)? '' : penjelasPotonganNormal(BERATVALID)

                  hargaBeliTarget = hargaJualNota - potongan - ongkosRusak
                  hargaBeliMaksDitawar = hargaJualNota - potonganTawar - ongkosRusak

                } else {
                  // --------------- Rumus F ---------------------
                  apakahBisaDitawar = false
                  rumusDipake = 'F'
                  // disini ada penalti keterlambatan dari DATABASE, dibawah 5 gram MIN, diatas 5 MAX

                  penalti = (BERATVALID >= 5)? pengaturan.penaltiTelatJanjiMax : pengaturan.penaltiTelatJanjiMin
                  keteranganTransaksi = `Potongan diganti penalti keterlambatan ${rupiahParser(penalti)} `
                  potongan = 0

                  hargaBeliTarget = hargaJualNota - ongkosRusak - penalti
                }

              } else {
                // --------------- Rumus G, Normal Potongan Anulir ---------------------
                apakahBisaDitawar = false
                rumusDipake = 'G'

                // INGET! datanya sesuai perjanjian / nota, bukan DATABASE
                keteranganTransaksi = `Sesuai perjanjian, potongan dianulir. `
                potongan = 0

                hargaBeliTarget = hargaJualNota - ongkosRusak
              }


            } else {
              // --------------- Rumus E, Normal TT Tanpa Janji --------------------- OK
              apakahBisaDitawar = (apakahPelangganTetap)? false : true // kalo pelanggan tetap udah harga PAS
              rumusDipake = 'E' 

              // INGET! datanya sesuai perjanjian / nota, bukan DATABASE
              let penguranganPotongan = (apakahPelangganTetap)? kodepro.kadar.toleransiPenguranganPotonganMax : kodepro.kadar.toleransiPenguranganPotonganMin
              let penguranganPotonganMaxTawar = kodepro.kadar.toleransiPenguranganPotonganMax
              let penguranganPotonganDeskripsi = (kodepro.kadar.apakahPotonganPersen)? `${penguranganPotongan}%` : `${rupiahParser(penguranganPotongan)} per gram`
              keteranganTransaksi = `Potongan dikurangi ${penguranganPotonganDeskripsi}. `

              // hitung potongan
              potonganBaru = potonganDariNota - penguranganPotongan
              let potonganBaruTawar = potonganDariNota - penguranganPotonganMaxTawar
              potongan = (kodepro.kadar.apakahPotonganPersen)? potonganBaru / 100 * hargaJualNota : hitungPotonganNormal(potonganBaru, BERATVALID)
              let potonganTawar = (kodepro.kadar.apakahPotonganPersen)? potonganBaruTawar / 100 * hargaJualNota : hitungPotonganNormal(potonganBaruTawar, BERATVALID)
              keteranganTransaksi += (kodepro.kadar.apakahPotonganPersen)? '' : penjelasPotonganNormal(BERATVALID)


              hargaBeliTarget = hargaJualNota - potongan - ongkosRusak
              hargaBeliMaksDitawar = hargaJualNota - potonganTawar - ongkosRusak
            }

          } else {
            // --------------- Rumus D, Normal --------------------- OK
            rumusDipake = 'D'
            apakahBisaDitawar = false

            // INGET! datanya sesuai perjanjian / nota, bukan DATABASE
            potongan = (kodepro.kadar.apakahPotonganPersen)? potonganDariNota / 100 * hargaJualNota : hitungPotonganNormal(potonganDariNota, BERATVALID)
            keteranganTransaksi = (kodepro.kadar.apakahPotonganPersen)? '' : penjelasPotonganNormal(BERATVALID)

            hargaBeliTarget = hargaJualNota - potongan - ongkosRusak
          }

        } else { 
          kondisiBarang = 'uripan'
          BERATVALID = validrequest.beratBarang

          if(apakahTT){
            // --------------- Rumus C1, TT Tanpa Nota --------------------- 
            rumusDipake = 'C1'
            apakahBisaDitawar = true

            hargaPerGram = hargaMal * ( kodepro.kadar.persentaseMalUripan - kodepro.kadar.marginPersenUntungUripanTtMax ) / 100
            
            hargaBeliTarget = hargaPerGram * validrequest.beratBarang
            hargaBeliMaksDitawar = hargaMal * ( kodepro.kadar.persentaseMalUripan - kodepro.kadar.marginPersenUntungUripanTtMin ) / 100 * validrequest.beratBarang

          } else {
            // --------------- Rumus C2, Jual Tanpa Nota --------------------- 
            rumusDipake = 'C2'
            apakahBisaDitawar = true

            hargaPerGram = hargaMal * ( kodepro.kadar.persentaseMalUripan - kodepro.kadar.marginPersenUntungUripanMax ) / 100
            
            hargaBeliTarget = hargaPerGram * validrequest.beratBarang
            hargaBeliMaksDitawar = hargaMal * ( kodepro.kadar.persentaseMalUripan - kodepro.kadar.marginPersenUntungUripanMin ) / 100 * validrequest.beratBarang

          }
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

      const model = await Model.findOrFail(validrequest.model)
      await model.load('bentuk')

      // ini juga perlu diganti BERATVALID kah? kalau iya kudu dikeluarin
      let namaBarang = `${(apakahTT)? 'TT' : 'JU'} 1 ${model.bentuk.kode} ${kodepro.kadar.nama} model ${model.nama} ${BERATVALID} gr ${kondisiBarang.toUpperCase()} ${(adaNotaLeo)? 'Toko LEO ': 'toko luar'}`
      let kodeTransaksi = 'PB' + ((apakahDitawar)? 1:0) + validrequest.model.toString() + latestId
      kodeTransaksi += kodepro.id.toString() + DateTime.now().toFormat('SSS') + rumusDipake

      let pembelianBaru = await kodepro.related('pembelians').create({
        namaBarang: namaBarang,
        kodeTransaksi: kodeTransaksi,
        kondisiFisik: kondisiBarang,
        keteranganTransaksi: keteranganTransaksi,
        modelId: validrequest.model,
        penggunaId: userPengakses.pengguna.id,
        beratBarang: BERATVALID,
        asalToko: validrequest.namaToko,
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

      // sambungin ke nota kalau ada juga
      if(adaNotaLeo){
        await pembelianBaru.related('pembelianNotaLeo').create({
          apakahJanjiTukarTambah: apakahJanjiTT,
          apakahSudahDipakai: apakahBarangDipakai,
          tanggalJualPadaNota: validrequest.tanggalBeli,
          beratBarangPadaNota: validrequest.beratNota,
          hargaJualPadaNota: validrequest.hargaJualNota,
          apakahPotonganPersen: kodepro.kadar.apakahPotonganPersen,
          potonganPadaNota: potonganDariNota,
          potonganAkhir: (potonganBaru)? potonganBaru : potonganDariNota,
          penaltiTelat : penalti,
          ongkosPotonganTotal: potongan,
          namaPemilik: null,
          alamatPemilik: null
        })
      }

      return response.redirect().withQs({ tid: pembelianBaru.id }).toPath('/app/transaksi/pembelian/pasca')

    } catch (error) {
      session.flash('alertError', 'Ada kesalahan saat menghitung rumus, silahkan coba lagi setelah beberapa saat!')
      return response.redirect().back()
    }
  }

  public async pascaTransaksi({ view, request }: HttpContextContract) {
    const tid = request.input('tid')

    try {
      const pembelian = await Pembelian.findOrFail(tid)
      await pembelian.load('kodeProduksi', (query) => {
        query.preload('kadar')
      })
      await pembelian.load('model', (query) => {
        query.preload('bentuk')
      })
      await pembelian.load('kerusakans')
      await pembelian.load('pembelianNotaLeo')

      const terparser = new Terbilang()

      let now = new Date().getTime()
      let max = new Date(pembelian.maxGadaiAt.toJSDate()).getTime()
      let distance = max - now;

      // Time calculations for days, hours, minutes and seconds
      let minutes = (distance > 0 )? Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)) : 0
      let seconds = (distance > 0 )? Math.floor((distance % (1000 * 60)) / 1000) : 0

      const fungsi = {
        rupiahParser: rupiahParser,
        kapitalHurufPertama: kapitalHurufPertama
      }

      let penalti = 0
      let potongan = 0

      if(pembelian.pembelianNotaLeo){
        penalti = pembelian.pembelianNotaLeo.penaltiTelat
        potongan = pembelian.pembelianNotaLeo.ongkosPotonganTotal
      }



      const tambahan = {
        hargaBeliTerbilang: kapitalHurufPertama(terparser.ubahKeTeks(pembelian.hargaBeliAkhir || 0)) + ' rupiah',
        apakahExpired: (distance <= 0),
        menit: minutes,
        detik: seconds,
        totalPenalti: -Math.abs(penalti),
        totalPotongan: -Math.abs(potongan),
        totalKerusakan: -Math.abs(pembelian.ongkosKerusakanTotal)
      }

      return await view.render('transaksi/pembelian/pasca-beli', {
        pembelian,
        fungsi,
        tambahan
      })

    } catch (error) {
      return { error: 'ewe babyyyy' }
    }
  }


  public async destroy({}: HttpContextContract) {}

  // dari ajax
  public async hitungHargaBelakang({
    request,
    response
  }: HttpContextContract) {
    const newPembelianSchema = schema.create({
      kelengkapanNota: schema.enum(['tanpa', 'dengan'] as
        const),
      asalPerhiasan: schema.enum(['luar', 'leo'] as
        const),
      namaToko: schema.string.optional({
        trim: true
      }, [rules.maxLength(50)]), // masih belom yakin dipake apa ngga
      kodepro: schema.number([
        rules.unsigned(),
        rules.exists({
          table: 'kode_produksis',
          column: 'id',
          where: {
            deleted_at: null,
          },
        }),
      ]),
      model: schema.number([
        rules.unsigned(),
        rules.exists({
          table: 'models',
          column: 'id',
          where: {
            deleted_at: null,
          },
        }),
      ]),
      jenisStok: schema.enum(['lama', 'baru'] as
        const),
      keteranganCatatan: schema.string.optional({
        trim: true
      }, [rules.maxLength(100)]),
      beratNota: schema.number.optional([
        rules.unsigned(),
        rules.requiredWhen('kelengkapanNota', '=', 'dengan')
      ]),
      beratBarang: schema.number([rules.unsigned()]),
      hargaJualNota: schema.number.optional([
        rules.unsigned(),
        rules.requiredWhen('kelengkapanNota', '=', 'dengan')
      ]),
      potonganNota: schema.number.optional([
        rules.unsigned(),
        rules.requiredWhen('asalPerhiasan', '=', 'leo')
      ]),
      tanggalBeli: schema.date.optional({}, [
        rules.beforeOrEqual('today'),
        rules.requiredWhen('asalPerhiasan', '=', 'leo')
      ]),
      ajukanTT: schema.string.optional(), //cukup dicek undefined apa ngga, isinya ngga penting
      adaJanjiTT: schema.string.optional(), //cukup dicek undefined apa ngga, isinya ngga penting
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
        schema: newPembelianSchema
      })
      const kodepro = await KodeProduksi.findOrFail(validrequest.kodepro)
      await kodepro.load('kadar')

      const pengaturan = await Pengaturan.findOrFail(1)

      // ------------ DILUAR --------------------
      let keteranganTransaksi = ''
      let rumusDipake = 'kosong' // ini buat testing

      // ------------ data nota -----------------
      let hargaJualNota = (validrequest.hargaJualNota)? validrequest.hargaJualNota : 0
      let potonganDariNota = (validrequest.potonganNota)? validrequest.potonganNota : 0

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
      let apakahRusak = false // kalah ama rosok
      let apakahRosok = false
      
      let adaNotaLeo = false
      let apakahTT = (validrequest.ajukanTT && !validrequest.ajukanGadai) ? true : false // ga dicek lagi, INI GADAI TAMBAHAN DARI DOSEN GABISA TT
      let apakahJanjiTT = (validrequest.adaJanjiTT) ? true : false // ga dicek lagi
      let apakahTerlambatTT = false
      let apakahBarangDipakai = (validrequest.barangDipakai) ? true : false // ga dicek lagi
      let apakahPelangganTetap = (validrequest.pelangganTetap)? true: false // ga dicek lagi

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

            apakahRusak = true

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
      if (validrequest.kelengkapanNota == 'dengan' && validrequest.asalPerhiasan == 'leo' && validrequest.hargaJualNota && validrequest.potonganNota && validrequest.tanggalBeli) adaNotaLeo = true


      // --------------- cek terlambat TT ---------------- OK
      if (validrequest.tanggalBeli && apakahJanjiTT) {
        let target = validrequest.tanggalBeli.plus({
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
      // urutannya bakal sama kayak catatan rumus lu, dari A ke H

      if(!adaNotaLeo && apakahRusak){
        // kalau dari luar, tapi ada rusak auto dianggep rosok
        apakahRosok = true
      }

      if (apakahRosok) {
        kondisiBarang = 'rosok'
        keteranganTransaksi = 'Dihitung harga rosok, kerusakan & potongan dianulir'
        apakahBisaDitawar = true
        ongkosRusak = 0

        if (apakahTT) {
          // --------------- Rumus A, TT Rosok ---------------------
          rumusDipake = 'A'

          hargaPerGram = hargaMal * ( kodepro.kadar.persentaseMalRosok - kodepro.kadar.marginPersenUntungRosokTtMax ) / 100
          hargaBeliTarget = hargaPerGram * validrequest.beratBarang

          hargaBeliMaksDitawar = hargaMal * ( kodepro.kadar.persentaseMalRosok - kodepro.kadar.marginPersenUntungRosokTtMin ) / 100 * validrequest.beratBarang
        
        } else {
          // --------------- Rumus B, Jual Rosok ---------------------
          rumusDipake = 'B'

          hargaPerGram = hargaMal * ( kodepro.kadar.persentaseMalRosok - kodepro.kadar.marginPersenUntungRosokMax ) / 100
          hargaBeliTarget = hargaPerGram * validrequest.beratBarang

          hargaBeliMaksDitawar = hargaMal * ( kodepro.kadar.persentaseMalRosok - kodepro.kadar.marginPersenUntungRosokMin ) / 100 * validrequest.beratBarang

        }
      } else {
        if(wadahRusak.length > 0){
          kondisiBarang = 'rusak'
        } else {
          kondisiBarang = 'uripan'
        }        

        if (adaNotaLeo) {
          // yang make % MAL, pake berat barang. yang make potongan, pake berat penjualan!


          // khusus kalau ada nota LEO, ngitung apa2 pake berat NOTA, bukan berat BARANG
          let BERATVALID = ((validrequest.beratNota)? validrequest.beratNota : validrequest.beratBarang)
            
          // BANDINGINNYA JANGAN KE BERAT BARANG, TP BERAT NOTA
          hargaPerGram = hargaJualNota / BERATVALID

          if (apakahTT) {
            if (apakahJanjiTT) {
              if (apakahTerlambatTT) {
                if (apakahBarangDipakai) {
                  // --------------- Rumus E, Normal TT Tanpa Janji --------------------- // dobel OK
                  apakahBisaDitawar = (apakahPelangganTetap)? false : true // kalo pelanggan tetap udah harga PAS
                  rumusDipake = 'E' 
                  // disini ada ngecek pelanggan tetap / ngga

                  // INGET! datanya sesuai perjanjian / nota, bukan DATABASE
                  let penguranganPotongan = (apakahPelangganTetap)? kodepro.kadar.toleransiPenguranganPotonganMax : kodepro.kadar.toleransiPenguranganPotonganMin
                  let penguranganPotonganMaxTawar = kodepro.kadar.toleransiPenguranganPotonganMax
                  let penguranganPotonganDeskripsi = (kodepro.kadar.apakahPotonganPersen)? `${penguranganPotongan}%` : `${rupiahParser(penguranganPotongan)} per gram`
                  keteranganTransaksi = `Potongan dikurangi ${penguranganPotonganDeskripsi}. `

                  // hitung potongan
                  let potonganBaru = potonganDariNota - penguranganPotongan
                  let potonganBaruTawar = potonganDariNota - penguranganPotonganMaxTawar
                  potonganDeskripsi = (kodepro.kadar.apakahPotonganPersen)? `${potonganBaru}% harga jual` : `${rupiahParser(potonganBaru)}/g`
                  potongan = (kodepro.kadar.apakahPotonganPersen)? potonganBaru / 100 * hargaJualNota : hitungPotonganNormal(potonganBaru, BERATVALID)
                  totalPotonganDeskripsi = rupiahParser(potongan)
                  keteranganTransaksi += (kodepro.kadar.apakahPotonganPersen)? '' : penjelasPotonganNormal(BERATVALID)
                  let potonganTawar = (kodepro.kadar.apakahPotonganPersen)? potonganBaruTawar / 100 * hargaJualNota : hitungPotonganNormal(potonganBaruTawar, BERATVALID)

                  hargaBeliTarget = hargaJualNota - potongan - ongkosRusak
                  hargaBeliMaksDitawar = hargaJualNota - potonganTawar - ongkosRusak

                } else {
                  // --------------- Rumus F ---------------------
                  apakahBisaDitawar = false
                  rumusDipake = 'F'
                  // disini ada penalti keterlambatan dari DATABASE, dibawah 5 gram MIN, diatas 5 MAX
                  let penalti = (BERATVALID >= 5)? pengaturan.penaltiTelatJanjiMax : pengaturan.penaltiTelatJanjiMin
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

                // INGET! datanya sesuai perjanjian / nota, bukan DATABASE
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

              // INGET! datanya sesuai perjanjian / nota, bukan DATABASE
              let penguranganPotongan = (apakahPelangganTetap)? kodepro.kadar.toleransiPenguranganPotonganMax : kodepro.kadar.toleransiPenguranganPotonganMin
              let penguranganPotonganMaxTawar = kodepro.kadar.toleransiPenguranganPotonganMax
              let penguranganPotonganDeskripsi = (kodepro.kadar.apakahPotonganPersen)? `${penguranganPotongan}%` : `${rupiahParser(penguranganPotongan)} per gram`
              keteranganTransaksi = `Potongan dikurangi ${penguranganPotonganDeskripsi}. `

              // hitung potongan
              let potonganBaru = potonganDariNota - penguranganPotongan
              let potonganBaruTawar = potonganDariNota - penguranganPotonganMaxTawar
              potonganDeskripsi = (kodepro.kadar.apakahPotonganPersen)? `${potonganBaru}% harga jual` : `${rupiahParser(potonganBaru)}/g`
              potongan = (kodepro.kadar.apakahPotonganPersen)? potonganBaru / 100 * hargaJualNota : hitungPotonganNormal(potonganBaru, BERATVALID)
              totalPotonganDeskripsi = rupiahParser(potongan)
              keteranganTransaksi += (kodepro.kadar.apakahPotonganPersen)? '' : penjelasPotonganNormal(BERATVALID)
              let potonganTawar = (kodepro.kadar.apakahPotonganPersen)? potonganBaruTawar / 100 * hargaJualNota : hitungPotonganNormal(potonganBaruTawar, BERATVALID)

              hargaBeliTarget = hargaJualNota - potongan - ongkosRusak
              hargaBeliMaksDitawar = hargaJualNota - potonganTawar - ongkosRusak
            }

          } else {
            // --------------- Rumus D, Normal --------------------- OK
            rumusDipake = 'D'
            apakahBisaDitawar = false

            // INGET! datanya sesuai perjanjian / nota, bukan DATABASE

            // hitung potongan
            potonganDeskripsi = (kodepro.kadar.apakahPotonganPersen)? `${potonganDariNota}% harga jual` : `${rupiahParser(potonganDariNota)}/g`
            potongan = (kodepro.kadar.apakahPotonganPersen)? potonganDariNota / 100 * hargaJualNota : hitungPotonganNormal(potonganDariNota, BERATVALID)
            totalPotonganDeskripsi = rupiahParser(potongan)
            keteranganTransaksi += (kodepro.kadar.apakahPotonganPersen)? '' : penjelasPotonganNormal(BERATVALID)

            hargaBeliTarget = hargaJualNota - potongan - ongkosRusak
          }

        } else { 
          kondisiBarang = 'uripan'

          if(apakahTT){
            // --------------- Rumus C1, TT Tanpa Nota --------------------- 
            rumusDipake = 'C1'
            apakahBisaDitawar = true

            // ini kalau ngga ada tuker tambah, MASIH RAWAN ERROR
            hargaPerGram = hargaMal * ( kodepro.kadar.persentaseMalUripan - kodepro.kadar.marginPersenUntungUripanTtMax ) / 100
            hargaBeliTarget = hargaPerGram * validrequest.beratBarang

            hargaBeliMaksDitawar = hargaMal * ( kodepro.kadar.persentaseMalUripan - kodepro.kadar.marginPersenUntungUripanTtMin ) / 100 * validrequest.beratBarang


          } else {
            // --------------- Rumus C2, Jual Tanpa Nota --------------------- 
            rumusDipake = 'C2'
            apakahBisaDitawar = true

            // ini kalau ngga ada tuker tambah, MASIH RAWAN ERROR
            hargaPerGram = hargaMal * ( kodepro.kadar.persentaseMalUripan - kodepro.kadar.marginPersenUntungUripanMax ) / 100
            hargaBeliTarget = hargaPerGram * validrequest.beratBarang

            hargaBeliMaksDitawar = hargaMal * ( kodepro.kadar.persentaseMalUripan - kodepro.kadar.marginPersenUntungUripanMin ) / 100 * validrequest.beratBarang

          }
        }
      }

      // ==================================== SELESAI HITUNGAN RUMUS =======================================

      let potonganDeskripsiNota: string | null = null
      if(adaNotaLeo && validrequest.potonganNota){
        potonganDeskripsiNota = (kodepro.kadar.apakahPotonganPersen)? `${validrequest.potonganNota}% harga jual` : `${rupiahParser(validrequest.potonganNota)}/g`
      }

      return {
        aaRumus: rumusDipake, // buat testing
        adaNotaLeo, // OK
        beratBarang: validrequest.beratBarang, // OK
        keteranganTransaksi,
        dataNota: {
          jenisStok: (adaNotaLeo)? kapitalHurufPertama(validrequest.jenisStok) : null, // OK
          hargaJualNota: (adaNotaLeo && validrequest.hargaJualNota)? rupiahParser(validrequest.hargaJualNota) : null, // OK
          potonganDeskripsiNota, // OK,
          beratNota: (adaNotaLeo && validrequest.beratNota)? validrequest.beratNota + ' gram' : null
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

  public async maxPengajuanGadai({ request, response }: HttpContextContract) {
    let tid = request.input('tid', '')

    try {
      const PB = await Database
        .from('pembelians')
        .select('max_gadai_at as maxGadaiAt')
        .where('id', tid)
        .where('apakah_digadaikan', true)
        .whereNull('deleted_at')
        .firstOrFail()

      return { max: PB.maxGadaiAt }
    } catch (error) {
      return response.badRequest('Id penjualan tidak valid.')
    }

  }

}



// ================================================= INI BANTUIN HITUNGAN RUMUS ===========================================================
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