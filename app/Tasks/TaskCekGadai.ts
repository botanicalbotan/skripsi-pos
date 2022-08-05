import { BaseTask } from 'adonis5-scheduler/build'
import Logger from '@ioc:Adonis/Core/Logger'
import Database from '@ioc:Adonis/Lucid/Database'
import { DateTime } from 'luxon'
import TipeNotif from 'App/Models/sistem/TipeNotif'
import StatusGadai from 'App/Models/transaksi/StatusGadai'
import Gadai from 'App/Models/transaksi/Gadai'

export default class TaskCekGadai extends BaseTask {
  public static get schedule() {
    // return '* * * * * *'

    // tiap 12 jam
    return '0 */12 * * *'
  }
  /**
   * Set enable use .lock file for block run retry task
   * Lock file save to `build/tmpTaskLock`
   */
  public static get useLock() {
    return false
  }

  // KALAU INI GABISA, PAKE node-cron

  public async handle() {
    const gadais = await Database.from('gadais')
      .join('status_gadais', 'gadais.status_gadai_id', 'status_gadais.id')
      .select('gadais.id')
      .whereNull('gadais.deleted_at')
      // .andWhere('gadais.tanggal_tenggat', '<', DateTime.now().toISO())
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

    // counter ini nanti buat bikin notifikasi
    Logger.info(counter + ' gadai telah diganti')
  }
}
