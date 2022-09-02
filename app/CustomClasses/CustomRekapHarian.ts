import RekapHarian from 'App/Models/kas/RekapHarian'
import Pengaturan from 'App/Models/sistem/Pengaturan'
import { DateTime } from 'luxon'
import { pasaranHarIni, apakahHariIniPasaran } from './CPasaran'

export async function prepareRekap() {
  let pengaturan = await Pengaturan.findOrFail(1) // ntar diganti jadi ngecek toko aktif di session

  let cariRH = await RekapHarian.findBy(
    'tanggal_rekap',
    DateTime.local()
      .set({
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0,
      })
      .toSQL()
  )

  if (!cariRH) {
    cariRH = await RekapHarian.create({
      pasaran: pasaranHarIni(),
      apakahHariPasaran: await apakahHariIniPasaran(),
      tanggalRekap: DateTime.local().set({
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0,
      }),
      saldoTokoReal: pengaturan.saldoToko,
      saldoTokoTerakhir: pengaturan.saldoToko,
    })
  }

  return cariRH
}
