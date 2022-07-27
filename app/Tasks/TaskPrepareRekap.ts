import { BaseTask } from 'adonis5-scheduler/build'
import { prepareRekap } from 'App/CustomClasses/CustomRekapHarian'
import Logger from '@ioc:Adonis/Core/Logger'

export default class TaskPrepareRekap extends BaseTask {
	public static get schedule() {
		// tiap hari tiap jam 12 malem, pake yang ini
		return '0 0 * * *'

		// tiap 12 jam
    	// return '0 */12 * * *'
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
		// cukup panggil ini buat ngecek sekaligus ngebikin rekap harian
		await prepareRekap()

		// ini buat testing, ntar dihapus
		Logger.info('Task prepare rekap jalan')
  	}
}
