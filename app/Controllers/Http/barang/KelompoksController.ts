import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Pengaturan from 'App/Models/sistem/Pengaturan'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Kelompok from 'App/Models/barang/Kelompok'
import Database from '@ioc:Adonis/Lucid/Database'
import Bentuk from 'App/Models/barang/Bentuk'
import Kadar from 'App/Models/barang/Kadar'
import { DateTime, Settings } from 'luxon'
import RekapRestok from 'App/Models/barang/RekapRestok'

export default class KelompoksController {
  // Fungsi Tambahan

  getRandomInt(max: number) {
    return Math.floor(Math.random() * max);
  }

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

  rupiahParser(angka: number) {
    if (typeof angka == 'number') {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
      }).format(angka)
    }
  }

  generateKodeKelompok(kadar: string, bentuk: string){
    let kodebentuk = {
      Cincin: 'CC',
      Kalung: 'KL',
      Anting: 'AT',
      Liontin: 'LT',
      Tindik: 'TD',
      Gelang: 'GL'
    }

    // varian ini bisa dipake buat yang butuh random2
    // let kodekadar = {
    //   Muda: {nomer: 1, huruf: ['M', 'MU', 'YO', 'NO']},
    //   Tanggung: {nomer: 2, huruf: ['TA', 'TG', 'MI', 'CE']},
    //   Tua: {nomer:3, huruf: ['TU', 'NE', 'GR', 'OL']}
    // }

    let kodekadar = {
      Muda: {nomer: 1, huruf: 'MD'},
      Tanggung: {nomer: 2, huruf: 'TG'},
      Tua: {nomer:3, huruf: 'TU'}
    }

    return kodebentuk[bentuk] + kodekadar[kadar].nomer + kodekadar[kadar].huruf + DateTime.local().toMillis()    
  }

  // Fungsi Routing

  public async index({ view, request }: HttpContextContract) {
    const opsiOrder = [
      'kelompoks.nama',
      'kelompoks.berat_kelompok',
      'kadars.nama',
      'bentuks.bentuk',
      'kelompoks.stok',
    ]
    const page = request.input('page', 1)
    const order = request.input('ob', 0)
    const arahOrder = request.input('aob', 0)
    const sanitizedOrder = order < opsiOrder.length && order >= 0 && order ? order : 0
    const sanitizedArahOrder = arahOrder == 1? 1:0
    const cari = request.input('cari', '')
    const filter = request.input('filter', 0)
    const sanitizedFilter = filter < 4 && filter >= 0 && filter ? filter : 0
    const limit = 10

    const kelompoks = await Database.from('kelompoks')
      .join('kadars', 'kelompoks.kadar_id', '=', 'kadars.id')
      .join('bentuks', 'kelompoks.bentuk_id', '=', 'bentuks.id')
      .whereNull('kelompoks.deleted_at')
      .select(
        'kelompoks.id as id',
        'kelompoks.nama as nama',
        'kelompoks.berat_kelompok as beratKelompok',
        'kadars.nama as kadar',
        'bentuks.bentuk as bentuk',
        'kelompoks.stok as stok',
        'kelompoks.stok_minimal as stokMinimal'
      )
      .select(
        Database.from('penjualans')
          .count('*')
          .whereColumn('penjualans.kelompok_id', 'kelompoks.id')
          .whereRaw('DATE(penjualans.created_at) = DATE(NOW())')
          .as('totalPenjualanHariIni')
      )
      .select(
        Database.from('kelompok_penambahans')
          .count('*')
          .whereColumn('kelompok_penambahans.kelompok_id', 'kelompoks.id')
          .whereRaw('DATE(kelompok_penambahans.created_at) = DATE(NOW())')
          .as('totalKaliPenambahanHariIni')
      )
      .if(cari !== '', (query) => {
        query.where('kelompoks.nama', 'like', `%${cari}%`)
      })
      .if(sanitizedFilter == 1, (query) => {
        query.whereColumn('kelompoks.stok', '>', 'kelompoks.stok_minimal')
      })
      .if(sanitizedFilter == 2, (query) => {
        query
          .whereColumn('kelompoks.stok', '<=', 'kelompoks.stok_minimal')
          .andWhere('kelompoks.stok', '>', 0)
      })
      .if(sanitizedFilter == 3, (query) => {
        query.where('kelompoks.stok', '=', 0)
      })
      .orderBy(opsiOrder[sanitizedOrder], ((sanitizedArahOrder == 1)? 'desc': 'asc'))
      .orderBy('kelompoks.nama')
      .paginate(page, limit)

    kelompoks.baseUrl('/app/barang/')

    let qsParam = {
      ob: sanitizedOrder,
      aob: sanitizedArahOrder
    }

    if (cari !== '') qsParam['cari'] = cari
    if (sanitizedFilter !== 0) qsParam['filter'] = sanitizedFilter

    kelompoks.queryString(qsParam)


    const stokCukup = await Database.from('kelompoks')
      .whereColumn('stok', '>', 'stok_minimal')
      .count('*', 'jumlah')
    const stokKurang = await Database.from('kelompoks')
      .whereColumn('stok', '<=', 'stok_minimal')
      .andWhere('stok', '>', 0)
      .count('*', 'jumlah')
    const stokHabis = await Database.from('kelompoks').where('stok', '=', 0).count('*', 'jumlah')

    let firstPage =
      kelompoks.currentPage - 2 > 0
        ? kelompoks.currentPage - 2
        : kelompoks.currentPage - 1 > 0
        ? kelompoks.currentPage - 1
        : kelompoks.currentPage
    let lastPage =
      kelompoks.currentPage + 2 <= kelompoks.lastPage
        ? kelompoks.currentPage + 2
        : kelompoks.currentPage + 1 <= kelompoks.lastPage
        ? kelompoks.currentPage + 1
        : kelompoks.currentPage

    if (lastPage - firstPage < 4 && kelompoks.lastPage > 4) {
      if (kelompoks.currentPage < kelompoks.firstPage + 2) {
        lastPage += 4 - (lastPage - firstPage)
      }

      if (lastPage == kelompoks.lastPage) {
        firstPage -= 4 - (lastPage - firstPage)
      }
    }
    // sampe sini
    const tempLastData = 10 + (kelompoks.currentPage - 1) * limit

    const tambahan = {
      pengurutan: sanitizedOrder,
      pencarian: cari,
      filter: sanitizedFilter,
      firstPage: firstPage,
      lastPage: lastPage,
      firstDataInPage: 1 + (kelompoks.currentPage - 1) * limit,
      lastDataInPage: tempLastData >= kelompoks.total ? kelompoks.total : tempLastData,
    }

    const statistik = {
      stokCukup: stokCukup[0].jumlah,
      stokKurang: stokKurang[0].jumlah,
      stokHabis: stokHabis[0].jumlah,
    }

    return view.render('barang/base', { kelompoks, tambahan, statistik })
  }

  public async create({ view }: HttpContextContract) {
    const pengaturan = await Pengaturan.findOrFail(1)
    let defaultPengaturan = {
      stokMinimal: pengaturan.defaultStokMinimalPerhiasan,
      ingatkanStokMenipis: pengaturan.defaultIngatkanStokMenipis,
    }
    return view.render('barang/kelompok/form-kelompok', { defaultPengaturan })
  }

  public async store({ request, response }: HttpContextContract) {
    const newKelompokSchema = schema.create({
      nama: schema.string({ trim: true }, [
        rules.maxLength(50),
        rules.unique({
          table: 'kelompoks',
          column: 'nama',
          caseInsensitive: true,
        }),
      ]),
      kadar: schema.enum(['Tanggung', 'Muda', 'Tua']),
      bentuk: schema.enum(['Anting', 'Cincin', 'Gelang', 'Kalung', 'Liontin', 'Tindik', 'Lainnya']),

      beratKelompok: schema.number(),
      stokMinimal: schema.number(),
      stok: schema.number(),
      ingatkanStokMenipis: schema.boolean(),
    })

    const validrequest = await request.validate({ schema: newKelompokSchema })

    try {
      const kadar = await Kadar.findByOrFail('nama', validrequest.kadar)
      const bentuk = await Bentuk.findByOrFail('bentuk', validrequest.bentuk)

      await kadar.related('kelompoks').create({
        nama: await this.kapitalKalimat(validrequest.nama),
        kodeKelompok: await this.generateKodeKelompok(kadar.nama, bentuk.bentuk),
        bentukId: bentuk.id,
        beratKelompok: validrequest.beratKelompok,
        stok: validrequest.stok,
        stokMinimal: validrequest.stokMinimal,
        ingatkanStokMenipis: validrequest.ingatkanStokMenipis,
      })

      return response.redirect().toPath('/app/barang/')
    } catch (error) {
      return response.redirect().back()
    }
  }

  public async show({ view, response, params }: HttpContextContract) {
    try {
      const kelompok = await Kelompok.findOrFail(params.id)
      await kelompok.load('bentuk')
      await kelompok.load('kadar')

      const fungsi = {
        rupiahParser: this.rupiahParser,
      }

      return view.render('barang/kelompok/view-kelompok', { kelompok, fungsi })
    } catch (error) {
      return response.redirect().toPath('/app/barang/')
    }
  }

  public async edit({}: HttpContextContract) {}

  public async update({}: HttpContextContract) {}

  public async destroy({}: HttpContextContract) {}

  // ================================= Fungsi tambahan yang bukan CRUD ===========================================
  public async peringkatKelompokAll({}: HttpContextContract) {
    // yang di select ntar bisa diganti sesuai kebutuhan
    let testraw = await Database.rawQuery(
      "SELECT kelompoks.id, tabelRanking.jumlah, tabelRanking.ranking FROM kelompoks, (SELECT row_number() OVER (ORDER BY jumlah desc) AS 'ranking', kelompok_id, COUNT(*) as 'jumlah' FROM penjualans GROUP BY kelompok_id ORDER BY `jumlah` DESC) as tabelRanking WHERE kelompoks.id = tabelRanking.kelompok_id"
    )

    return testraw[0]
  }

  public async peringkatKelompok({ params }: HttpContextContract) {
    Settings.defaultZone = 'Asia/Jakarta'
    Settings.defaultLocale = 'id-ID'

    // yang di select ntar bisa diganti sesuai kebutuhan
    let rankTotal = await Database.rawQuery(
      "SELECT kelompoks.id, tabelRanking.jumlah, tabelRanking.ranking FROM kelompoks, (SELECT row_number() OVER (ORDER BY jumlah desc) AS 'ranking', kelompok_id, COUNT(*) as 'jumlah' FROM penjualans GROUP BY kelompok_id ORDER BY `jumlah` DESC) as tabelRanking WHERE kelompoks.id = tabelRanking.kelompok_id && kelompoks.id = :kelompokId LIMIT 1",
      {
        kelompokId: params.id,
      }
    )

    let rankTahunIni = await Database.rawQuery(
      "SELECT kelompoks.id, tabelRanking.jumlah, tabelRanking.ranking FROM kelompoks, (SELECT row_number() OVER (ORDER BY jumlah desc) AS 'ranking', kelompok_id, COUNT(*) as 'jumlah' FROM penjualans WHERE DATE(created_at)>= :tanggalAwal && DATE(created_at)<= :tanggalAkhir GROUP BY kelompok_id ORDER BY `jumlah` DESC) as tabelRanking WHERE kelompoks.id = tabelRanking.kelompok_id && kelompoks.id = :kelompokId LIMIT 1",
      {
        kelompokId: params.id,
        tanggalAwal: DateTime.now().startOf('year').toISODate(),
        tanggalAkhir: DateTime.now().endOf('year').toISODate(),
      }
    )

    let rankBulanIni = await Database.rawQuery(
      "SELECT kelompoks.id, tabelRanking.jumlah, tabelRanking.ranking FROM kelompoks, (SELECT row_number() OVER (ORDER BY jumlah desc) AS 'ranking', kelompok_id, COUNT(*) as 'jumlah' FROM penjualans WHERE DATE(created_at)>= :tanggalAwal && DATE(created_at)<= :tanggalAkhir GROUP BY kelompok_id ORDER BY `jumlah` DESC) as tabelRanking WHERE kelompoks.id = tabelRanking.kelompok_id && kelompoks.id = :kelompokId LIMIT 1",
      {
        kelompokId: params.id,
        tanggalAwal: DateTime.now().startOf('month').toISODate(),
        tanggalAkhir: DateTime.now().endOf('month').toISODate(),
      }
    )

    let terakhirTransaksi = await Database.from('kelompoks')
      .select('penjualans.created_at as tanggal')
      .join('penjualans', 'kelompoks.id', 'penjualans.kelompok_id')
      .where('kelompoks.id', params.id)
      .orderBy('penjualans.created_at', 'desc')
      .limit(1)

    let totalKelompok = await Database.from('kelompoks').whereNull('deleted_at').count('*', 'total')

    // Kenapa ngejoin kelompok sama penjualan? gegara ntar lu bakal ngesortir ngebuang kelompok yang kena softdelete

    let wadah = {
      peringkatTotal: rankTotal[0][0],
      peringkatTahunIni: rankTahunIni[0][0],
      peringkatBulanIni: rankBulanIni[0][0],
      totalKelompok: totalKelompok[0].total,
      transaksiTerakhir: terakhirTransaksi[0],
    }

    return wadah
  }

  public async sebaranData({ params, request }: HttpContextContract) {
    Settings.defaultZone = 'Asia/Jakarta'
    Settings.defaultLocale = 'id-ID'

    let mode = request.input('mode', 0)
    if (!['0', '1', '2'].includes(mode)) mode = 0
    // 0 mingguan perhari
    // 1 bulanan perminggu
    // 2 tahunan perbulan

    if (mode == 0) {
      let penjualanMingguIni = await Database.rawQuery(
        'SELECT kelompok_id, created_at as tanggal, WEEKDAY(created_at) as hariMingguan, COUNT(*) as jumlah FROM penjualans WHERE DATE(created_at) >= :tanggalAwal && DATE(created_at) <= :tanggalAkhir && kelompok_id = :kelompokId GROUP BY hariMingguan',
        {
          kelompokId: params.id,
          tanggalAwal: DateTime.local().startOf('week').toISODate(),
          tanggalAkhir: DateTime.local().endOf('week').toISODate(),
        }
      )

      let wadahMingguan: object = []

      for (let i = 0; i < 7; i++) {
        wadahMingguan[i] = {
          label: DateTime.local().startOf('week').plus({ days: i }).toISODate(),
        }
      }

      penjualanMingguIni[0].forEach((element) => {
        wadahMingguan[element.hariMingguan]['data'] = element
      })

      return wadahMingguan
    }

    if (mode == 2) {
      let penjualanTahunIni = await Database.rawQuery(
        'SELECT kelompok_id, MONTH(created_at) as bulan, COUNT(*) as jumlah FROM penjualans WHERE DATE(created_at) >= :tanggalAwal && DATE(created_at) <= :tanggalAkhir && kelompok_id = :kelompokId GROUP BY bulan',
        {
          kelompokId: params.id,
          tanggalAwal: DateTime.local().startOf('year').toISODate(),
          tanggalAkhir: DateTime.local().endOf('year').toISODate(),
        }
      )

      let wadahTahunan: object = []

      for (let i = 0; i < 12; i++) {
        wadahTahunan[i] = {
          label: DateTime.local().startOf('year').plus({ months: i }).monthLong,
        }
      }

      penjualanTahunIni[0].forEach((element) => {
        wadahTahunan[element.bulan - 1]['data'] = element
      })

      return wadahTahunan
    }
  }

  // ================================================ Restok ====================================================
  public async getKelompokDenganInput({ request }: HttpContextContract) {
    let bentuk = request.input('bentuk')
    let kadar = request.input('kadar')

    let kelompokCari = await Database.from('kelompoks')
      .select('id', 'berat_kelompok as beratKelompok', 'stok', 'nama')
      .where('bentuk_id', bentuk)
      .andWhere('kadar_id', kadar)
      .andWhereNull('deleted_at')
      .orderBy('nama', 'asc')

    return kelompokCari
  }

  public async restokPerhiasan({ request, session, response }: HttpContextContract) {
    const restokSchema = schema.create({
      restokCatatan: schema.string({ trim: true }, [rules.maxLength(255)]),
      stokIdPerhiasan: schema
        .array([rules.minLength(1)])
        .members(
          schema.number([
            rules.exists({ table: 'kelompoks', column: 'id', where: { deleted_at: null } }),
          ])
        ),
      stokTambahan: schema.array([rules.minLength(1)]).members(schema.number([rules.unsigned()])),
      stokAsal: schema.array([rules.minLength(1)]).members(schema.enum(['Cucian', 'Kulakan'])),
    })

    const validrequest = await request.validate({ schema: restokSchema })

    // custom error message
    let errCount = 0
    let itemCount = 0

    async function addStok() {
      let rekapBaru = new RekapRestok()
      rekapBaru.penggunaId = 1
      rekapBaru.catatan = validrequest.restokCatatan
      await rekapBaru.save()

      let i = 0
      for (const element of validrequest.stokIdPerhiasan) {
        console.log('no ' + i + ', value; ' + element + ', stok: ' + validrequest.stokTambahan[i])

        try {
          let kelompok = await Kelompok.findOrFail(element)
          kelompok.stok += validrequest.stokTambahan[i]
          console.log(
            'harusnya ketambahan ' + validrequest.stokTambahan[i] + ' jadi ' + kelompok.stok
          )

          rekapBaru.related('kelompoks').attach({
            [kelompok.id]: {
              apakah_kulakan: validrequest.stokAsal[i] === 'Kulakan',
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
        'errorRestok',
        'Stok ' +
          (itemCount - errCount) +
          ' kelompok berhasil diperbarui, ' +
          errCount +
          ' kelompok dilewati karena terdapat masalah'
      )

    if (itemCount > 0 && errCount == 0)
      session.flash('konfirmasiRestok', 'Stok ' + itemCount + ' kelompok berhasil diperbarui!')

    return response.redirect().back()
  }

  // =============================================== General ===============================================

  public async getKadarBentuk({}: HttpContextContract) {
    // ini buat isian doang, gaperlu ambil semua data
    let kadar = await Database.from('kadars').select('id', 'nama').orderBy('nama', 'asc')

    let bentuk = await Database.from('bentuks').select('id', 'bentuk').orderBy('bentuk', 'asc')

    return {
      kadar,
      bentuk,
    }
  }

  
}
