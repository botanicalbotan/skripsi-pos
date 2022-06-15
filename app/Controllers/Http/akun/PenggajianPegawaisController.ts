import {
  HttpContextContract
} from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import { DateTime } from 'luxon'
import Pengguna from 'App/Models/akun/Pengguna'
import PenggajianPegawai from 'App/Models/akun/PenggajianPegawai'
import Drive from '@ioc:Adonis/Core/Drive'
import RekapHarian from 'App/Models/kas/RekapHarian'
import CPasaran from 'App/CustomClasses/CPasaran'
import Pengaturan from 'App/Models/sistem/Pengaturan'
import TipeNotif from 'App/Models/sistem/TipeNotif'
import User from 'App/Models/User'

export default class PenggajianPegawaisController {
  rupiahParser(angka: number) {
    if (typeof angka == 'number') {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
      }).format(angka)
    }
  }

  public async index({
    view,
    request
  }: HttpContextContract) {
    const opsiOrder = [
      'penggajian_pegawais.tanggal_seharusnya_dibayar',
      'penggunas.nama',
      'jabatans.nama',
      'penggunas.nominal_gaji',
      'penggajian_pegawais.status',
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

    const penggajians = await Database.from('penggajian_pegawais')
      .join('penggunas', 'penggajian_pegawais.penerima_gaji_id', 'penggunas.id')
      .join('jabatans', 'penggunas.jabatan_id', 'jabatans.id')
      .whereNull('penggunas.deleted_at')
      .select(
        'penggajian_pegawais.id as gajiId', 
        'penggajian_pegawais.tanggal_seharusnya_dibayar as tanggalSeharusnyaDibayar',
        'penggunas.id as idPegawai',
        'penggunas.nama as namaPegawai', 
        'penggunas.foto as fotoPegawai', 
        'penggajian_pegawais.nominal_gaji as nominalGaji', 
        'jabatans.nama as jabatanPegawai', 
        'penggajian_pegawais.status as status'
        )
      .if(cari !== '', (query) => {
        query.where('penggunas.nama', 'like', `%${cari}%`)
      })
      .if(sanitizedFilterShow == 0, (query) => {
        query
          .where('penggajian_pegawais.status', 'menunggu')
          .andWhereNull('penggajian_pegawais.dibayar_at')
          .andWhereNull('penggajian_pegawais.pencatat_gajian_id')
      })
      .orderBy(opsiOrder[sanitizedOrder], ((sanitizedArahOrder == 1) ? 'desc' : 'asc'))
      .orderBy('penggajian_pegawais.created_at')
      .paginate(page, limit)

    penggajians.baseUrl('/app/pegawai/penggajian')

    let qsParam = {
      ob: sanitizedOrder,
      aob: sanitizedArahOrder
    }

    if (cari !== '') qsParam['cari'] = cari
    if (sanitizedFilterShow !== 0) qsParam['fs'] = sanitizedFilterShow

    penggajians.queryString(qsParam)

    let firstPage =
      penggajians.currentPage - 2 > 0 ?
      penggajians.currentPage - 2 :
      penggajians.currentPage - 1 > 0 ?
      penggajians.currentPage - 1 :
      penggajians.currentPage
    let lastPage =
      penggajians.currentPage + 2 <= penggajians.lastPage ?
      penggajians.currentPage + 2 :
      penggajians.currentPage + 1 <= penggajians.lastPage ?
      penggajians.currentPage + 1 :
      penggajians.currentPage

    if (lastPage - firstPage < 4 && penggajians.lastPage > 4) {
      if (penggajians.currentPage < penggajians.firstPage + 2) {
        lastPage += 4 - (lastPage - firstPage)
      }

      if (lastPage == penggajians.lastPage) {
        firstPage -= 4 - (lastPage - firstPage)
      }
    }
    // sampe sini
    const tempLastData = 10 + ((penggajians.currentPage - 1) * limit)

    const tanggalRefresh = await Database
      .from('refresh_penggajians')
      .select('direfresh_at as direfreshAt')
      .orderBy('id', 'desc')
      .first()

    const tambahan = {
      pengurutan: sanitizedOrder,
      pencarian: cari,
      filterShow: sanitizedFilterShow,
      firstPage: firstPage,
      lastPage: lastPage,
      firstDataInPage: 1 + ((penggajians.currentPage - 1) * limit),
      lastDataInPage: (tempLastData >= penggajians.total) ? penggajians.total : tempLastData,
      direfreshAt: tanggalRefresh.direfreshAt
      // lifehackUrlSementara: '/uploads/profilePict/',
    }

    return view.render('pegawai/penggajian-pegawai/list-penggajian-pegawai', {
      penggajians,
      tambahan
    })
  }

  public async create({}: HttpContextContract) {}

  public async store({}: HttpContextContract) {}

  public async show({ view, params, response, session }: HttpContextContract) {
    try {
      let penggajian = await PenggajianPegawai.findOrFail(params.id)
      await penggajian.load('pencatatGajian', (query) => {
        query.preload('jabatan')
      })
      await penggajian.load('penerimaGaji', (query) => {
        query.preload('jabatan')
      })

      let tanggalTerakhir = await Database
        .from('penggajian_pegawais')
        .select('dibayar_at as terakhirGajian')
        .where('penerima_gaji_id', penggajian.penerimaGajiId)
        .andWhere('status', 'dibayar')
        .orderBy('updated_at', 'desc')


      // Get today's date and time
      var countDownDate = new Date(penggajian.tanggalSeharusnyaDibayar.toJSDate()).getTime();
      var now = new Date().getTime();

      // Find the distance between now and the count down date
      var distance = countDownDate - now;

      // Time calculations for days, hours, minutes and seconds
      var jarakHari = Math.floor(distance / (1000 * 60 * 60 * 24));

      let fungsi = {
        rupiahParser: this.rupiahParser
      }
      let tambahan = {
        terakhirGajian: (tanggalTerakhir.length > 0)? tanggalTerakhir[0].terakhirGajian : null,
        adaFotoPenerima: (await Drive.exists('profilePict/' + penggajian.penerimaGaji.foto)),
        adaFotoPencatat: (await Drive.exists('profilePict/' + penggajian.pencatatGajian?.foto)),
        jarakHari: jarakHari
      }
      // return penggajian
      return view.render('pegawai/penggajian-pegawai/view-penggajian-pegawai', { penggajian, fungsi, tambahan })
      // return view.render('index-test', { penggajian })

    } catch (error) {
      // ntar tambahin flag flashmessage biar bisa diakses di listnya
      console.error(error)
      session.flash('alertError', 'Ada masalah saat mengakses data penggajian pegawai. Silahkan coba lagi setelah beberapa saat.')
      return response.redirect().toPath('/app/pegawai/penggajian')
    }
  }

  public async edit({}: HttpContextContract) {}

  public async update({}: HttpContextContract) {}

  public async destroy({ params, response, session }: HttpContextContract) {
    try {
      const penggajian = await PenggajianPegawai.findOrFail(params.id)
      penggajian.status = 'dihapus'
      penggajian.pencatatGajianId = null
      penggajian.dibayarAt = null
      await penggajian.save()

      return response.redirect().toPath('/app/pegawai/penggajian')
    } catch (error) {
      session.flash('errorServerThingy', 'Tagihan yang anda pilih tidak valid!')
      return response.redirect().back()
    }
  }

  public async getJumlahBelumDigaji({}: HttpContextContract) {
    let hitung = await Database
      .from('penggajian_pegawais')
      .whereNull('pencatat_gajian_id')
      .where('status', 'menunggu')
      .count('* as jumlah')

    return hitung[0]
  }

  public async refreshPenggajian({ response }: HttpContextContract) {
    let penggunaGajian = await Database
      .from('penggunas')
      .select('id')
      .whereNull('deleted_at')
      .whereNotNull('tanggal_mulai_aktif')
      .whereNotNull('tanggal_gajian_selanjutnya')
      .andWhere('tanggal_gajian_selanjutnya', '<=', DateTime.now().toISO())
      .orderBy('tanggal_gajian_selanjutnya', 'asc')

    let counter = 0

    async function puter() {
      for (const element of penggunaGajian) {
        try {
          let pengguna = await Pengguna.findOrFail(element.id)

          await pengguna.related('penerimaGajis').create({
            status: 'menunggu',
            nominalGaji: pengguna.gajiBulanan,
            tanggalSeharusnyaDibayar: (pengguna.tanggalGajianSelanjutnya) ? pengguna.tanggalGajianSelanjutnya : DateTime.now()
          })

          pengguna.tanggalGajianSelanjutnya = DateTime.now().plus({
            months: 1
          })
          pengguna.tanggalGajianTerakhir = DateTime.now()
          pengguna.kaliGajian += 1

          await pengguna.save()
          counter++

        } catch (error) {
          console.error(error)
        }
      }
    }

    await puter()

    if(counter > 0){
      let notifGaji = await TipeNotif.findByOrFail('nama', 'Penggajian')
      let sintaksJudul = notifGaji.sintaksJudul.replace('{jumlah}', counter.toString())

      let penggunaPenting = await Database
        .from('penggunas')
        .join('jabatans', 'penggunas.jabatan_id', 'jabatans.id')
        .where('jabatans.nama', 'Kepala Toko')
        .orWhere('jabatans.nama', 'Pemilik')
        .select('penggunas.id')
        .whereNull('deleted_at')

      async function puterNotif() {
        for (const element of penggunaPenting) {
          await notifGaji.related('notifikasis').create({
            isiNotif: sintaksJudul,
            penggunaId: element.id,
            urlTujuan: '/app/pegawai/penggajian'
          })
        }
      }

      // ngga dikasi await karna ga perlu ditunggu
      puterNotif()
    }

    await Database
      .insertQuery()
      .table('refresh_penggajians')
      .insert({ direfresh_at: DateTime.now().toSQL() })

    return response.ok({message: 'Refresh berhasil, ' + counter + ' data ditambahkan', jumlah: counter})
  }

  public async pembayaranTagihan({ response, params, auth }: HttpContextContract) {

    // ini buat ngecek constrain doang
    try {
      await PenggajianPegawai
      .query()
      .where('id', params.id)
      .andWhereNull('dibayar_at')
      .andWhereNull('pencatat_gajian_id')
      .andWhere('status', 'menunggu')
      .firstOrFail()
    } catch (error) {
      return response.badRequest('Penggajian yang anda pilih tidak valid.')
    }    

    const CP = new CPasaran()
    const pasaranSekarang = CP.pasaranHarIni()

    let pengaturan = await Pengaturan.findOrFail(1) // ntar diganti jadi ngecek toko aktif di session
    await pengaturan.load('pasarans')

    let apakahPasaran = false
    for (const element of pengaturan.pasarans) {
      if(element.hari === pasaranSekarang){
        apakahPasaran = true
        break
      }
    }

    let cariRH = await RekapHarian.findBy('tanggal_rekap', DateTime.local().set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).toSQL())

    if(!cariRH){
      cariRH = await RekapHarian.create({
        pasaran: pasaranSekarang,
        apakahHariPasaran: apakahPasaran,
        tanggalRekap: DateTime.local().set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
      })
    }

    try {
      if(!auth.user) throw 'auth error'

      const userPengakses = await User.findOrFail(auth.user.id)
      await userPengakses.load('pengguna')

      let penggajian = await PenggajianPegawai.findOrFail(params.id)
      await penggajian.load('penerimaGaji')
      penggajian.status = 'dibayar'
      penggajian.dibayarAt = DateTime.now()
      penggajian.pencatatGajianId = userPengakses.pengguna.id
      await penggajian.save()

      pengaturan.saldoToko -= penggajian.nominalGaji
      await pengaturan.save()

      await cariRH.related('kas').create({
        apakahKasKeluar: true,
        apakahDariSistem: true,
        nominal: -Math.abs(penggajian.nominalGaji),
        perihal: 'Pembayaran Gaji Periode ' + penggajian.tanggalSeharusnyaDibayar.toLocaleString({ month:'long', year:'numeric' }) + ' An. ' + penggajian.penerimaGaji.nama,
        penggunaId: userPengakses.pengguna.id
      })

      return response.ok({message: 'Tersimpan'})
    } catch (error) {
      console.error(error)
      return response.badRequest('Terjadi error pada pencatatan, mohon ulangi kembali')
    }

  }


  public async pembatalanPembayaran({ params, response, auth }: HttpContextContract) {

    // ntar tambahin constrain lagi yang boleh akses cuma pemilik

    try {
      await PenggajianPegawai
      .query()
      .where('id', params.id)
      .whereNotNull('dibayar_at')
      .andWhereNotNull('pencatat_gajian_id')
      .andWhere('status', 'dibayar')
      .firstOrFail()
  
    } catch (error) {
      return response.badRequest('Penggajian yang anda pilih tidak valid.')
    }    

    const CP = new CPasaran()
    const pasaranSekarang = CP.pasaranHarIni()

    let pengaturan = await Pengaturan.findOrFail(1) // ntar diganti jadi ngecek toko aktif di session
    await pengaturan.load('pasarans')

    let apakahPasaran = false
    for (const element of pengaturan.pasarans) {
      if(element.hari === pasaranSekarang){
        apakahPasaran = true
        break
      }
    }

    let cariRH = await RekapHarian.findBy('tanggal_rekap', DateTime.local().set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).toSQL())

    if(!cariRH){
      cariRH = await RekapHarian.create({
        pasaran: pasaranSekarang,
        apakahHariPasaran: apakahPasaran,
        tanggalRekap: DateTime.local().set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
      })
    }


    try {
      if(!auth.user) throw 'auth ngga valid'
      const userPengakses = await User.findOrFail(auth.user.id)
      await userPengakses.load('pengguna', (query) => {
        query.preload('jabatan')
      })

      if(userPengakses.pengguna.jabatan.nama !== 'Pemilik'){
        return response.unauthorized('Anda tidak mempunyai hak untuk mengakses fitur ini!')
      }

      const penggajian = await PenggajianPegawai.findOrFail(params.id)
      await penggajian.load('penerimaGaji')
      penggajian.status = 'menunggu'
      penggajian.dibayarAt = null
      penggajian.pencatatGajianId = null
      await penggajian.save()

      pengaturan.saldoToko += penggajian.nominalGaji
      await pengaturan.save()

      await cariRH.related('kas').create({
        apakahKasKeluar: false,
        apakahDariSistem: true,
        nominal: penggajian.nominalGaji,
        perihal: 'Pembatalan dan pengembalian pembayaran gaji periode ' + penggajian.tanggalSeharusnyaDibayar.toLocaleString({ month:'long', year:'numeric' }) + ' An. ' + penggajian.penerimaGaji.nama,
        penggunaId: userPengakses.pengguna.id
      })

      return response.ok({message: 'Tersimpan'})
    } catch (error) {
      console.error(error)
      return response.badRequest('Terjadi error pada pencatatan, mohon ulangi kembali')
    }

  }
}
