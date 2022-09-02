import Pengaturan from 'App/Models/sistem/Pengaturan'
import { DateTime, Settings } from 'luxon'
Settings.defaultZone = 'Asia/Jakarta'
Settings.defaultLocale = 'id'

const baseData = [
  {
    tanggal: DateTime.fromISO('2021-07-01T00:00:00'),
    pasaran: 'pon',
  },
  {
    tanggal: DateTime.fromISO('2021-07-02T00:00:00'),
    pasaran: 'wage',
  },
  {
    tanggal: DateTime.fromISO('2021-07-03T00:00:00'),
    pasaran: 'kliwon',
  },
  {
    tanggal: DateTime.fromISO('2021-07-04T00:00:00'),
    pasaran: 'legi',
  },
  {
    tanggal: DateTime.fromISO('2021-07-05T00:00:00'),
    pasaran: 'pahing',
  },
]

let dataPasaranPosition = function (pasaran: string) {
  return baseData
    .map(function (e) {
      return e.pasaran
    })
    .indexOf(pasaran)
}

export function pasaranHarIni() {
  const today = DateTime.local().set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
  const diff = today.diff(baseData[0].tanggal, 'days').toObject()
  const difference = Math.round(diff.days ? diff.days : 0)
  const urutanHari = difference % 5

  return baseData[urutanHari].pasaran
}

export function pasaranDariTanggal(tanggal: DateTime) {
  const target = tanggal.set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
  const diff = target.diff(baseData[0].tanggal, 'days').toObject()
  const difference = Math.round(diff.days ? diff.days : 0)
  let urutanHari = difference % 5

  if (difference < 0) {
    urutanHari = 4 - Math.abs(difference % 5)
  }

  return baseData[urutanHari].pasaran
}

export function pasaranDariTanggalPlus(tanggal: DateTime) {
  const target = tanggal.set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
  const diff = target.diff(baseData[0].tanggal, 'days').toObject()
  const difference = Math.round(diff.days ? diff.days : 0)
  let urutanHari = difference % 5

  if (difference < 0) {
    urutanHari = 4 - Math.abs(difference % 5)
  }

  return baseData[urutanHari].pasaran
}

export function hariKePasaran(pasaran: string) {
  let urutanHariIni = dataPasaranPosition(pasaranHarIni().toLowerCase())
  let urutanTarget = dataPasaranPosition('wage') // default di set ke wage

  let find = baseData.find((o) => o.pasaran === pasaran)
  if (typeof find !== 'undefined') {
    urutanTarget = dataPasaranPosition(pasaran.toLocaleLowerCase())
  }

  if (urutanTarget < urutanHariIni) {
    return baseData.length - 1 - urutanHariIni + (urutanTarget + 1)
  } else if (urutanTarget === urutanHariIni) {
    return 5
  }

  return urutanTarget - urutanHariIni
}

export async function hariKePasaranSelanjutnya() {
  let pengaturan = await Pengaturan.findOrFail(1) // ntar diganti jadi ngecek toko aktif di session
  await pengaturan.load('pasarans')

  let next: Array<{
    pasaran: string
    selisihHari: number
  }> = []

  for (const element of pengaturan.pasarans) {
    next.push({
      pasaran: element.hari,
      selisihHari: hariKePasaran(element.hari),
    })
  }

  if (next.length > 0) {
    // diurutin yang paling deket
    next.sort((a, b) => a.selisihHari - b.selisihHari)
    return next[0]
  } else
    return {
      pasaran: 'kosong',
      selisihHari: 0,
    }
}

export async function apakahHariIniPasaran() {
  let pengaturan = await Pengaturan.findOrFail(1) // ntar diganti jadi ngecek toko aktif di session
  await pengaturan.load('pasarans')

  let apakahPasaran = false
  for (const element of pengaturan.pasarans) {
    if (element.hari === pasaranHarIni()) {
      apakahPasaran = true
      break
    }
  }

  return apakahPasaran
}
