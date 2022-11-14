import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import Notifikasi from 'App/Models/sistem/Notifikasi'
import User from 'App/Models/User'
import { DateTime } from 'luxon'

export default class NotifikasisController {
  public async index({ view, request, auth, response, session }: HttpContextContract) {
    try {
      if (!auth.user) throw 'auth ngga valid'

      const userPengakses = await User.findOrFail(auth.user.id)
      await userPengakses.load('pengguna')

      const page = request.input('page', 1)
      const filterShow = request.input('fs', 0)
      const sanitizedFilterShow = filterShow == 1 ? 1 : 0
      const limit = 10

      const notifikasis = await Database.from('notifikasis')
        .select('isi_notif as isiNotif', 'id', 'diklik_at as diklikAt', 'created_at as createdAt')
        .where('pengguna_id', userPengakses.pengguna.id)
        .if(sanitizedFilterShow == 1, (query) => {
          query.whereNull('diklik_at')
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
      const tempLastData = 10 + (notifikasis.currentPage - 1) * limit

      const tambahan = {
        filterShow: sanitizedFilterShow,
        firstPage: firstPage,
        lastPage: lastPage,
        firstDataInPage: 1 + (notifikasis.currentPage - 1) * limit,
        lastDataInPage: tempLastData >= notifikasis.total ? notifikasis.total : tempLastData,
      }

      const fungsi = {
        waktuDiff: bandingWaktu,
      }

      let roti = [
        {
          laman: 'Notifikasi',
        },
      ]

      return await view.render('notifikasi/semua-notifikasi', { notifikasis, tambahan, fungsi, roti })
    } catch (error) {
      session.flash('alertError', 'Ada kesalahan pada notifikasi sistem!')
      return response.redirect().toPath('/app')
    }
  }

  public async show({ params, response, session, auth }: HttpContextContract) {
    try {
      if (!auth.user) throw new Error('auth ngga valid')

      const userPengakses = await User.findOrFail(auth.user.id)
      await userPengakses.load('pengguna')

      // ngecek constrain
      await Database.from('notifikasis')
        .where('id', params.id)
        .andWhere('pengguna_id', userPengakses.pengguna.id)
        .firstOrFail()

      let notif = await Notifikasi.findOrFail(params.id)
      notif.diklikAt = DateTime.now()
      await notif.save()

      return response.redirect().toPath(notif.urlTujuan)
    } catch (error) {
      session.flash('alertError', 'Ada kesalahan pada notifikasi sistem!')
      return response.redirect().toPath('/app')
    }
  }

  public async notifTerbaru({ auth }: HttpContextContract) {
    let jumlahNotif = 5 // bisa dibuat parameter

    try {
      if (!auth.user) throw 'auth ngga valid'

      const userPengakses = await User.findOrFail(auth.user.id)
      await userPengakses.load('pengguna')

      let notif = await Database.from('notifikasis')
        .join('tipe_notifs', 'notifikasis.tipe_notif_id', 'tipe_notifs.id')
        .select(
          'notifikasis.isi_notif',
          'notifikasis.created_at',
          'notifikasis.id',
          'tipe_notifs.nama',
          'tipe_notifs.kode',
          'tipe_notifs.sintaks_subjudul as penjelas'
        )
        .where('notifikasis.pengguna_id', userPengakses.pengguna.id)
        .limit(jumlahNotif)
        .orderBy('notifikasis.created_at', 'desc')

      return { notifikasi: notif, url: '/app/notifikasi/' }
    } catch (error) {
      return { notifikasi: [], url: '/app/notifikasi/' }
    }
  }

  public async jumlahNotifBaru({ auth }: HttpContextContract) {
    try {
      if (!auth.user) throw 'auth ngga valid'

      const userPengakses = await User.findOrFail(auth.user.id)
      await userPengakses.load('pengguna')

      let jumlahBaru = await Database.from('notifikasis')
        .where('pengguna_id', userPengakses.pengguna.id)
        .andWhereNull('dilihat_at')
        .andWhereNull('diklik_at')
        .count('*', 'jumlah')

      return { adaBaru: jumlahBaru[0].jumlah > 0, jumlah: jumlahBaru[0].jumlah }
    } catch (error) {
      return { adaBaru: false, jumlah: 0 }
    }
  }

  public async setLihatNotif({ response, request, auth }: HttpContextContract) {
    let latestIdRead = request.input('idTerakhir', 'kosong')

    try {
      if (!auth.user) throw 'auth ngga valid'

      const userPengakses = await User.findOrFail(auth.user.id)
      await userPengakses.load('pengguna')

      // check constrain
      await Notifikasi.findOrFail(latestIdRead)

      await Database.from('notifikasis')
        .where('pengguna_id', userPengakses.pengguna.id)
        .andWhere('id', '<=', latestIdRead)
        .andWhereNull('dilihat_at')
        .update({
          dilihat_at: DateTime.now().toISO(),
        })

      return response.ok({ message: 'Mantap' })
    } catch (error) {
      return response.ok({ message: 'Error tp ga penting' })
    }
  }
}

function bandingWaktu(ISODateTIme: string) {
  let waktuNotif = DateTime.fromISO(ISODateTIme)
  let selisih = waktuNotif.diffNow('minutes').toObject().minutes
  let menitDiff = selisih ? Math.abs(Math.round(selisih)) : 0
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
