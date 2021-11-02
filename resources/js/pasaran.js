// tanggal statik
// PENTING! Import abis moment.js

// Kalau mau fungsional lainnya, cek project pasaranapp

const baseData = [{
    tanggal: moment("20210701", "YYYYMMDD"),
    pasaran: "pon"
  },
  {
    tanggal: moment("20210702", "YYYYMMDD"),
    pasaran: "wage"
  },
  {
    tanggal: moment("20210703", "YYYYMMDD"),
    pasaran: "kliwon"
  },
  {
    tanggal: moment("20210704", "YYYYMMDD"),
    pasaran: "legi"
  },
  {
    tanggal: moment("20210705", "YYYYMMDD"),
    pasaran: "pahing"
  },
]

let dataPasaranPosition = function (pasaran) {
    return baseData.map(function(e) { return e.pasaran; }).indexOf(pasaran);
}

module.exports = {
  pasaranHariIni: function () {
    const today = moment()
    const diffrerence = today.diff(baseData[0].tanggal, 'days')
    const urutanHari = diffrerence % 5

    return baseData[urutanHari].pasaran
  },
  hariKePasaranSelanjutnya: function (pasaran) {
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
}
