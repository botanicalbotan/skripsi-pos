import Database from '@ioc:Adonis/Lucid/Database'
import PenyesuaianStok from 'App/Models/barang/PenyesuaianStok'
import { DateTime } from 'luxon'

/**
  * Ngeupdate penyesuaian stok yang tercatat buat kelompok yang catatan stoknya berubah sehabis disesuaikan.
  * Khusus buat catatan stok hari ini.
  * @param idKel
  * @returns string
  */
export async function butuhUpdate(idKel: number) {
  try {
    const kelompok = await Database.from('kelompoks')
      .leftJoin('penyesuaian_stoks', (query) => {
        query.on('penyesuaian_stoks.kelompok_id', 'kelompoks.id').onExists((subQuery) => {
          subQuery
            .select('*')
            .from('penyesuaian_stoks as sub')
            .whereRaw('penyesuaian_stoks.id = sub.id')
            .whereRaw('DATE(sub.created_at) = DATE(?)', [DateTime.now().toSQLDate()])
        })
      })
      .where('kelompoks.id', idKel)
      .andWhereNull('kelompoks.deleted_at')
      .andWhere('kelompoks.apakah_dimonitor', true)
      .select('kelompoks.stok as stok', 'kelompoks.id as idKel', 'penyesuaian_stoks.id as penyeId')
      .firstOrFail()

    if(kelompok.penyeId){
        // kalo ternyata kelompok ini punya penyesuaian ID buat tangal ini, maka
        const penye = await PenyesuaianStok.findOrFail(kelompok.penyeId)
        penye.butuhCekUlang = true
        await penye.save()
    }

    return 'Ok'

  } catch (error) {
    console.log('Ada yang perlu diperbaikin di CustomPenyesuaian')

    return 'Sad'
  }
}
