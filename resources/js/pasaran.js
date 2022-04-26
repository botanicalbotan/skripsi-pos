const { DateTime, Settings } = require("luxon");
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

let dataPasaranPosition = function (pasaran) {
    return baseData.map(function(e) { return e.pasaran; }).indexOf(pasaran);
}

export function pasaranHarIni(){
  const today = DateTime.local().set({hour: 0, minute: 0, second: 0, millisecond: 0 })
  const diffrerence = Math.round(today.diff(baseData[0].tanggal, 'days').toObject().days)
  const urutanHari = diffrerence % 5

  return baseData[urutanHari].pasaran
}

export function hariKePasaranSelanjutnya(pasaran) {
  let urutanHariIni = dataPasaranPosition(this.pasaranHariIni().toLowerCase())
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

// module.exports = {
//   pasaranHariIni: function () {
//     const today = DateTime.local()
//     const diffrerence = today.diff(baseData[0].tanggal, 'days')
//     const urutanHari = diffrerence % 5

//     return baseData[urutanHari].pasaran
//   },
//   hariKePasaranSelanjutnya: function (pasaran) {
//     let urutanHariIni = dataPasaranPosition(this.pasaranHariIni().toLowerCase())
//     let urutanTarget = dataPasaranPosition('wage') // default di set ke wage

//     let find = baseData.find(o => o.pasaran === pasaran)
//     if (typeof find !== 'undefined') {
//       urutanTarget = dataPasaranPosition(pasaran.toLocaleLowerCase())
//     }

//     if (urutanTarget < urutanHariIni) {
//       return (baseData.length - 1 - urutanHariIni) + (urutanTarget + 1)
//     } else if (urutanTarget === urutanHariIni) {
//       return 5
//     }

//     return urutanTarget - urutanHariIni
//   }
// }
