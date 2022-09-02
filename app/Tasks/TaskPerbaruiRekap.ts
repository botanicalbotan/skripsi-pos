import { BaseTask } from 'adonis5-scheduler/build'
import Logger from '@ioc:Adonis/Core/Logger'
import Pengaturan from 'App/Models/sistem/Pengaturan'
import { prepareRekap } from 'App/CustomClasses/CustomRekapHarian'

export default class TaskPerbaruiRekap extends BaseTask {
  public static get schedule() {
    // tiap 6 jam malem
    return '0 0/6 * * *'
  }
  /**
   * Set enable use .lock file for block run retry task
   * Lock file save to `build/tmpTaskLock`
   */
  public static get useLock() {
    return false
  }

  public async handle() {
    Logger.info('Rekap harian diperbarui.')

    const pengaturan = await Pengaturan.findOrFail(1)

    const cariRH = await prepareRekap()
    cariRH.saldoTokoTerakhir = pengaturan.saldoToko
    if (!cariRH.apakahSudahBandingSaldo) {
      cariRH.saldoTokoReal = pengaturan.saldoToko
    }
    await cariRH.save()
  }
}
