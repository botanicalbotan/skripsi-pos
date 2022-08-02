import { BaseTask } from 'adonis5-scheduler/build'
import Logger from '@ioc:Adonis/Core/Logger'
import Pengaturan from 'App/Models/sistem/Pengaturan'
import { prepareRekap } from 'App/CustomClasses/CustomRekapHarian'

export default class TaskFinalCheckSaldo extends BaseTask {
  public static get schedule() {
    // tiap jam 10 malem
    return '0 21 * * *'
  }
  /**
   * Set enable use .lock file for block run retry task
   * Lock file save to `build/tmpTaskLock`
   */
  public static get useLock() {
    return false
  }

  public async handle() {
    Logger.info('Saldo final sudah di cek')

    const pengaturan = await Pengaturan.findOrFail(1)

    const cariRH = await prepareRekap()
    cariRH.saldoTokoTerakhir = pengaturan.saldoToko
    if (!cariRH.apakahSudahBandingSaldo) {
      cariRH.saldoTokoReal = pengaturan.saldoToko
    }
    await cariRH.save()
  }
}
