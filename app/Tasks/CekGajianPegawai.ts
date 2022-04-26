import {
  BaseTask
} from 'adonis5-scheduler/build'
import Pengguna from 'App/Models/akun/Pengguna'
import Database from '@ioc:Adonis/Lucid/Database'
import TipeNotif from 'App/Models/sistem/TipeNotif'
import {
  DateTime
} from 'luxon'
import Logger from '@ioc:Adonis/Core/Logger'

export default class CekGajianPegawai extends BaseTask {
  public static get schedule() {
    // tiap jam
    // return '0 0 * ? * *'

    // tiap menit
    return '* * * * *'

    // ntar diganti jadi tiap jam 6 pagi / waktu laen
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
          pengguna.lamaKerja += 1

          await pengguna.save()
          counter++

        } catch (error) {
          console.log(error)
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
        .where('jabatans.nama', 'Karyawan Khusus')
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

      await puterNotif()
    }

    // counter ini nanti buat bikin notifikasi
    Logger.info(counter + ' data telah ditambahkan')
  }
}
