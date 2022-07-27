import '../css/app.css'

const {
  DateTime,
  Settings
} = require("luxon");
Settings.defaultZone = 'Asia/Jakarta'
Settings.defaultLocale = 'id'


const Pasaran = require('./sistem/pasaran/pasaran')
const Notifikasi = require('./sistem/notifikasi/generateNotif')


global.$ = require('jquery');

$.ajaxSetup({
  headers: {
    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
  }
});

const capsFirstWord = function (text) {
  if (!isNaN(text.charAt(0))) {
    return text
  }
  return text.slice(0, 1).toUpperCase() + text.slice(1)
}

const capsSentence = function (text) {
  const pure = text.split(' ')
  let newText = ''
  for (let i = 0; i < pure.length; i++) {
    newText += capsFirstWord(pure[i])
    if (i !== pure.length - 1) {
      newText += ' '
    }
  }
  return newText
}

const pasaranBerformat = function () {
  return capsFirstWord(Pasaran.pasaranHarIni())
}

let tanggal = document.getElementById('tanggalSekarang')
tanggal.textContent = DateTime.local().toFormat("cccc '" + pasaranBerformat() + "', dd LLLL y")

$('div.drawer-side ul li.drawable').on('click', function () {
  const svg = $(this).find('svg.doorknob');
  if (svg.hasClass('rotate-180')) {
    svg.removeClass('rotate-180').addClass('rotate-0')
  } else {
    svg.removeClass('rotate-0').addClass('rotate-180')
  }
});

global.settingInputNumber = function (e) {
  if(e.min){
    if(e.value < e.min) e.value = e.min
  }

  if(e.max){
    if(e.value > e.max) e.value = e.max
  }
}

// ini gatau diapain, bisa taro di session ngga dah?
global.indikatorGaji = 0

$.get("/app/cuma-data/jumlah-belum-digaji", {},
  function (data, textStatus, jqXHR) {
    if (data.jumlah && data.jumlah > 0) {
      let indikator = document.getElementById('indikatorGajiPegawai')
      indikatorGaji = data.jumlah

      if (data.jumlah > 99) indikatorGaji = '99+'
      indikator.textContent = indikatorGaji

      indikator.classList.remove('hidden')
    }
  },
  "json"
);

const indikatorNotif = document.getElementById('indikatorNotif')
const indikatorGaadaNotif = document.getElementById('indikatorGaadaNotif')
const btBukaNotif = document.getElementById('btBukaNotif')
const badanNotif = document.getElementById('badanNotif')
const wadahNotif = document.getElementById('wadahNotif')
const penutupFullScreen = document.getElementById('penutupFullScreen')

$.get("/app/notifikasi/jumlah-notif-baru", {},
  function (data) {
    if (data.adaBaru) {
      indikatorNotif.classList.add('flex')
      indikatorNotif.classList.remove('hidden')
    }
  },
  "json"
);

btBukaNotif.addEventListener('click', () => {
  // ini dipake kalo ngilangin tab-index di dropdown sama dropdown-content
  wadahNotif.textContent = ''
  let idTerakhir = 0

  $.get("/app/notifikasi/notif-terbaru", {},
    function (data, textStatus, jqXHR) {
      let i = 0
      if(data.notifikasi && data.notifikasi.length > 0){
        for (const iterator of data.notifikasi) {
          if (i === 0) {
            idTerakhir = iterator.id
          }
          let waktuNotif = DateTime.fromISO(iterator.created_at)
          let bedaMenit = Math.round(waktuNotif.diffNow('minutes').toObject().minutes)
          wadahNotif.append(Notifikasi.buatNotif(iterator.kode, iterator.nama, iterator.isi_notif, iterator.penjelas, Math.abs(bedaMenit), data.url + iterator.id))
          i++
        }

        indikatorGaadaNotif.classList.remove('flex')
        indikatorGaadaNotif.classList.add('hidden')

      } else {
        indikatorGaadaNotif.classList.add('flex')
        indikatorGaadaNotif.classList.remove('hidden')
      }     


      $.post("/app/notifikasi/set-lihat-notif", {
        idTerakhir: idTerakhir
      });
    },
    "json"
  )

  badanNotif.style.opacity = 1
  badanNotif.style.visibility = 'visible'
  indikatorNotif.classList.add('hidden')
  indikatorNotif.classList.remove('flex')
  penutupFullScreen.classList.remove('hidden')
})

penutupFullScreen.addEventListener('click', () => {
  badanNotif.style.opacity = 0
  badanNotif.style.visibility = 'hidden'
  penutupFullScreen.classList.add('hidden')
})

const navNamaToko = document.getElementById('navNamaToko')
const dalemNamaToko = document.getElementById('dalemNamaToko')
const dalemAlamatToko = document.getElementById('dalemAlamatToko')

$.get("/app/cuma-data/my-toko", {},
  function (data, textStatus, jqXHR) {
    navNamaToko.classList.remove('hidden')
    navNamaToko.textContent = data.toko.namaToko
    dalemNamaToko.textContent = data.toko.namaToko
    dalemAlamatToko.textContent = data.toko.alamatTokoLengkap
  },
  "json"
).fail(() => {
  navNamaToko.classList.add('hidden')
  navNamaToko.textContent = 'TOKO_ERROR'
  dalemNamaToko.textContent = 'Data Toko Error'
  dalemAlamatToko.textContent = 'Alamat Toko Error'
})


// global.SwalCustomColor = {
//   icon: {
//     error: '#f27474'
//   },
//   button: {
//     confirm: '#4b6bfb',
//     deny: '#Dc3741',
//     cancel: '#6E7881'
//   }
// }

const masterWadahProfil = document.getElementById('masterWadahProfil')
const masterNamaPengguna = document.getElementById('masterNamaPengguna')
const masterJabatanPengguna = document.getElementById('masterJabatanPengguna')
const masterFotoPengguna = document.getElementById('masterFotoPengguna')
const masterLihatProfil = document.getElementById('masterLihatProfil')
const masterKeluar = document.getElementById('masterKeluar')
const masterFormKeluar = document.getElementById('masterFormKeluar')

$.get("/app/cuma-data/my-profile", {},
  function (data, textStatus, jqXHR) {
    masterNamaPengguna.textContent = data.nama
    masterJabatanPengguna.textContent = data.jabatan
    masterFotoPengguna.src = (data.adaFoto) ? '/app/cuma-data/foto/pegawai/' + data.id : ''
    masterLihatProfil.href = '/app/pegawai/' + data.id

  },
  "json"
).fail(() => {
  masterNamaPengguna.textContent = 'Data Error'
  masterJabatanPengguna.textContent = 'Error'
  masterFotoPengguna.src = ''
  masterLihatProfil.href = ''

}).always(() => {
  masterWadahProfil.classList.remove('hidden')
})

masterKeluar.addEventListener('click', () => {
  masterFormKeluar.action = '/logout'
  masterFormKeluar.method = 'POST'
  masterFormKeluar.submit()
})
