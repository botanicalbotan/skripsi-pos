import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import Notifikasi from 'App/Models/sistem/Notifikasi'
import { DateTime } from 'luxon'

export default class NotifikasisController {
  bandingWaktu(ISODateTIme: string) {
    let waktuNotif = DateTime.fromISO(ISODateTIme)
    let selisih = waktuNotif.diffNow('minutes').toObject().minutes
    let menitDiff = (selisih)? Math.abs(Math.round(selisih)): 0
    let teksDiff = ''

    if (menitDiff > 60) {
      let jamDiff = Math.floor(menitDiff / 60)

      if (jamDiff > 24) {
        let hariDiff = Math.floor(jamDiff / 24)

        if (hariDiff > 30) {
          let bulanDiff = Math.floor(hariDiff / 30)

          teksDiff = bulanDiff + ' bulan'
        } else {
          teksDiff = hariDiff + ' hari'
        }
      } else {
        teksDiff = jamDiff + ' jam'
      }
    } else {
      teksDiff = menitDiff + ' menit'
    }

    return teksDiff + ' yang lalu'
  }

  public async index ({ view, request }: HttpContextContract) {
    let idUserAktif = 1 // ntar diganti jadi sesi aktif
    const page = request.input('page', 1)
    const filterShow = request.input('fs', 0)
    const sanitizedFilterShow = filterShow == 1? 1:0
    const limit = 10

    const notifikasis = await Database
      .from('notifikasis')
      .select(
        'isi_notif as isiNotif',
        'id',
        'diklik_at as diklikAt',
        'created_at as createdAt'
      )
      .where('pengguna_id', idUserAktif)
      .if(sanitizedFilterShow == 1, (query) => {
        query
          .whereNull('diklik_at')
      })
      .orderBy('created_at', 'desc')
      .paginate(page, limit)


      notifikasis.baseUrl('/app/notifikasi')

      let qsParam = {}
      if (sanitizedFilterShow !== 0) qsParam['fs'] = sanitizedFilterShow

      notifikasis.queryString(qsParam)

      let firstPage =
        notifikasis.currentPage - 2 > 0
          ? notifikasis.currentPage - 2
          : notifikasis.currentPage - 1 > 0
          ? notifikasis.currentPage - 1
          : notifikasis.currentPage
      let lastPage =
        notifikasis.currentPage + 2 <= notifikasis.lastPage
          ? notifikasis.currentPage + 2
          : notifikasis.currentPage + 1 <= notifikasis.lastPage
          ? notifikasis.currentPage + 1
          : notifikasis.currentPage

      if (lastPage - firstPage < 4 && notifikasis.lastPage > 4) {
        if (notifikasis.currentPage < notifikasis.firstPage + 2) {
          lastPage += 4 - (lastPage - firstPage)
        }

        if (lastPage == notifikasis.lastPage) {
          firstPage -= 4 - (lastPage - firstPage)
        }
      }
      // sampe sini
      const tempLastData = 10 + ((notifikasis.currentPage - 1) * limit)

      const tambahan = {
        filterShow: sanitizedFilterShow,
        firstPage: firstPage,
        lastPage: lastPage,
        firstDataInPage: 1 + ((notifikasis.currentPage - 1) * limit),
        lastDataInPage: (tempLastData >= notifikasis.total)? notifikasis.total: tempLastData,
      }

      const fungsi = {
        waktuDiff: this.bandingWaktu
      }

    /** simpen kali aja ntar kepake */

    // let wadah :{ tanggal: DateTime , notifs: {}[] }[] = []
    // let iterasi = 0
    // let tanggalTok = await Database
    //   .rawQuery('select DATE(created_at) as tanggal from notifikasis WHERE pengguna_id = ?', [
    //     idUserAktif
    //   ])

    // for (const iterator of tanggalTok[0]) {
    //   wadah.push({
    //     tanggal: iterator.tanggal,
    //     notifs: await puterNotifPerTanggal(iterator.tanggal)
    //   })
    //   iterasi++
    // }

    // async function puterNotifPerTanggal(tanggal: string) {
    //   let notifs = await Database
    //     .from('notifikasis')
    //     .where('pengguna_id', idUserAktif)
    //     .andWhereRaw('DATE(created_at) = DATE(?)', [tanggal])
    //   return notifs
    // }
    // return { listNotif: wadah }

    return view.render('notifikasi/semua-notifikasi', { notifikasis, tambahan, fungsi })

  }

  public async create ({}: HttpContextContract) {
  }

  public async store ({}: HttpContextContract) {
  }

  public async show ({ params, response, session }: HttpContextContract) {
    let idUserAktif = 1 // ntar diganti jadi sesi aktif

    // ngecek constrain
    await Database
      .from('notifikasis')
      .where('id', params.id)
      .andWhere('pengguna_id', idUserAktif)
      .firstOrFail()
      .catch(() => {
        session.flash('errorServerThingy', 'Notifikasi yang anda pilih tidak valid!')
        return response.redirect().back()
      })

    try {
      let notif = await Notifikasi.findOrFail(params.id)
      notif.diklikAt = DateTime.now()
      await notif.save()

      return response.redirect().toPath(notif.urlTujuan)

    } catch (error) {
      session.flash('errorServerThingy', 'Ada kesalahan pada server!')
      return response.redirect().back()
    }
  }

  public async edit ({}: HttpContextContract) {
  }

  public async update ({}: HttpContextContract) {
  }

  public async destroy ({}: HttpContextContract) {
  }

  public async notifTerbaru ({}: HttpContextContract) {
    let idUserAktif = 1 // ini ntar diganti sesi aktif
    let jumlahNotif = 5 // bisa dibuat parameter

    let notif = await Database
      .from('notifikasis')
      .join('tipe_notifs', 'notifikasis.tipe_notif_id', 'tipe_notifs.id')
      .select('notifikasis.isi_notif', 'notifikasis.created_at', 'notifikasis.id', 'tipe_notifs.nama', 'tipe_notifs.kode', 'tipe_notifs.sintaks_subjudul as penjelas')
      .where('notifikasis.pengguna_id', idUserAktif)
      .limit(jumlahNotif)
      .orderBy('notifikasis.created_at', 'desc')

    return { notifikasi:notif, url: '/app/notifikasi/' }
  }

  public async jumlahNotifBaru ({}: HttpContextContract) {
    let idUserAktif = 1 // ini ntar diganti sesi aktif
    let jumlahBaru = await Database
      .from('notifikasis')
      .where('pengguna_id', idUserAktif)
      .andWhereNull('dilihat_at')
      .andWhereNull('diklik_at')
      .count('*', 'jumlah')

    return { adaBaru: (jumlahBaru[0].jumlah > 0), jumlah: jumlahBaru[0].jumlah }
  }

  public async setLihatNotif ({ response, request }: HttpContextContract) {
    let latestIdRead = request.input('idTerakhir', 'kosong')
    let idUserAktif = 1 // ini ntar diganti sesi aktif

    await Notifikasi
      .findOrFail(latestIdRead)
      .catch(() => {
        return response.notFound('ID notifikasi terakhir tidak valid')
      })

    await Database
      .from('notifikasis')
      .where('pengguna_id', idUserAktif)
      .andWhere('id', '<=', latestIdRead)
      .andWhereNull('dilihat_at')
      .update({
        dilihat_at: DateTime.now().toISO()
      })
      .catch(() => {
        return response.internalServerError('Ada kesalahan di database notifikasi')
      })

      return response.ok({message: 'Mantap'})
  }

}
