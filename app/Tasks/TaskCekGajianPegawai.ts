import { BaseTask } from 'adonis5-scheduler/build'
import Pengguna from 'App/Models/akun/Pengguna'
import Database from '@ioc:Adonis/Lucid/Database'
import TipeNotif from 'App/Models/sistem/TipeNotif'
import { DateTime } from 'luxon'
import Logger from '@ioc:Adonis/Core/Logger'

export default class TaskCekGajianPegawai extends BaseTask {
  public static get schedule() {
    // tiap jam
    // return '0 0 * ? * *'

    // tiap menit
    // return '* * * * *'

    // tiap 12 jam, pake yang ini ntar
    return '0 */12 * * *'
  }
  /**
   * Set enable use .lock file for block run retry task
   * Lock file save to `build/tmpTaskLock`
   */
  public static get useLock() {
    return false
  }

  public async handle() {
    // kalau udah fix bisa dihapus, buat ngeconsole log doang
    Logger.info('Ngecek gajian pegawai di datetime: ' + DateTime.local().toISO())

    let penggunaGajian = await Database.from('penggunas')
      .select('id')
      .whereNull('deleted_at')
      .whereNotNull('tanggal_mulai_aktif')
      .whereNotNull('tanggal_gajian_selanjutnya')
      .where('super', false)
      .whereRaw('DATE(tanggal_gajian_selanjutnya) <= DATE(NOW())')
      .orderBy('tanggal_gajian_selanjutnya', 'asc')

    let counter = 0

    async function puter() {
      for (const element of penggunaGajian) {
        try {
          let pengguna = await Pengguna.findOrFail(element.id)

          await pengguna.related('penerimaGajis').create({
            status: 'menunggu',
            nominalGaji: pengguna.gajiBulanan,
            tanggalSeharusnyaDibayar: pengguna.tanggalGajianSelanjutnya
              ? pengguna.tanggalGajianSelanjutnya
              : DateTime.now(),
          })

          pengguna.tanggalGajianSelanjutnya = DateTime.now().plus({
            months: 1,
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

    if (counter > 0) {
      let notifGaji = await TipeNotif.findByOrFail('nama', 'Penggajian')
      let sintaksJudul = notifGaji.sintaksJudul.replace('{jumlah}', counter.toString())

      let penggunaPenting = await Database.from('penggunas')
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
            urlTujuan: '/app/pegawai/penggajian',
          })
        }
      }

      // ngga dikasi await karna ga perlu ditunggu
      puterNotif()
    }

    await Database.insertQuery()
      .table('refresh_penggajians')
      .insert({ direfresh_at: DateTime.now().toSQL() })

    // counter ini nanti buat bikin notifikasi
    Logger.info(counter + ' penggajian pegawai telah ditambahkan')
  }
}
