import { DateTime, Settings } from "luxon";
Settings.defaultZone = 'Asia/Jakarta'
Settings.defaultLocale = 'id'

const baseData = [{
  tanggal: DateTime.fromISO('2021-07-01T00:00:00'),
  pasaran: "pon"
},
{
  tanggal: DateTime.fromISO('2021-07-02T00:00:00'),
  pasaran: "wage"
},
{
  tanggal: DateTime.fromISO('2021-07-03T00:00:00'),
  pasaran: "kliwon"
},
{
  tanggal: DateTime.fromISO('2021-07-04T00:00:00'),
  pasaran: "legi"
},
{
  tanggal: DateTime.fromISO('2021-07-05T00:00:00'),
  pasaran: "pahing"
},
]

let dataPasaranPosition = function (pasaran: string) {
  return baseData.map(function(e) { return e.pasaran; }).indexOf(pasaran);
}

export default class CPasaran{
  pasaranHarIni(){
    const today = DateTime.local().set({hour: 0, minute: 0, second: 0, millisecond: 0 })
    const diff = today.diff(baseData[0].tanggal, 'days').toObject()
    const difference = Math.round((diff.days)? diff.days:0)
    const urutanHari = difference % 5

    return baseData[urutanHari].pasaran
  }

  pasaranDariTanggal(tanggal: DateTime){
    const target = tanggal.set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
    const diff = target.diff(baseData[0].tanggal, 'days').toObject()
    const difference = Math.round((diff.days)? diff.days:0)
    let urutanHari = difference % 5

    if(difference < 0){
      urutanHari = 4 - Math.abs(difference % 5)
    }

    return baseData[urutanHari].pasaran
  }

  pasaranDariTanggalPlus(tanggal: DateTime){
    const target = tanggal.set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
    const diff = target.diff(baseData[0].tanggal, 'days').toObject()
    const difference = Math.round((diff.days)? diff.days:0)
    let urutanHari = difference % 5

    if(difference < 0){
      urutanHari = 4 - Math.abs(difference % 5)
    }

    return baseData[urutanHari].pasaran
  }

  hariKePasaranSelanjutnya(pasaran: string) {
    let urutanHariIni = dataPasaranPosition(this.pasaranHarIni().toLowerCase())
    let urutanTarget = dataPasaranPosition('wage') // default di set ke wage

    let find = baseData.find(o => o.pasaran === pasaran)
    if (typeof find !== 'undefined') {
      urutanTarget = dataPasaranPosition(pasaran.toLocaleLowerCase())
    }

    if (urutanTarget < urutanHariIni) {
      return (baseData.length - 1 - urutanHariIni) + (urutanTarget + 1)
    } else if (urutanTarget === urutanHariIni) {
      return 5
    }

    return urutanTarget - urutanHariIni
  }

}
