import RekapHarian from 'App/Models/kas/RekapHarian'
import Pengaturan from 'App/Models/sistem/Pengaturan'
import { DateTime } from 'luxon'
import CPasaran from './CPasaran'

export async function prepareRekap() {
  /** Mulai dari sini wajib banget */
  const CP = new CPasaran()
  const pasaranSekarang = CP.pasaranHarIni()

  let pengaturan = await Pengaturan.findOrFail(1) // ntar diganti jadi ngecek toko aktif di session
  await pengaturan.load('pasarans')

  let apakahPasaran = false
  for (const element of pengaturan.pasarans) {
    if (element.hari === pasaranSekarang) {
      apakahPasaran = true
      break
    }
  }

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
      pasaran: pasaranSekarang,
      apakahHariPasaran: apakahPasaran,
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
