import '../css/app.css'

const { DateTime, Settings } = require("luxon");
Settings.defaultZone = 'Asia/Jakarta'
Settings.defaultLocale = 'id'


const Pasaran = require('./pasaran')
const Notifikasi = require('./notifikasi')


global.$ = require('jquery');

$.ajaxSetup({
  headers: {
    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
  }
});

global.capsFirstWord = function (text){
  if(!isNaN(text.charAt(0))){
      return text
  }
  return text.slice(0, 1).toUpperCase() + text.slice(1)
}

global.capsSentence = function (text) {
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

global.pasaranBerformat = function(){
    return capsFirstWord(Pasaran.pasaranHarIni())
}

let tanggal = document.getElementById('tanggalSekarang')
tanggal.textContent = DateTime.local().toFormat("cccc '"+ pasaranBerformat() +"', dd LLLL y")

$('div.drawer-side ul li.drawable').on('click', function () {
    const svg = $(this).find('svg.doorknob');
    if(svg.hasClass('rotate-180')){
        svg.removeClass('rotate-180').addClass('rotate-0')
    } else{
        svg.removeClass('rotate-0').addClass('rotate-180')
    }
});



global.rupiahParser = function(number){
    if(typeof number == 'number'){
      return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0}).format(number)
    }
  }

global.numberOnlyParser = function(stringnumber){
    let final = stringnumber.replace(/\D/gi, '')
    return parseInt(final)
}

global.removeElementsByClass = function (className){
    const elements = document.getElementsByClassName(className);
    while(elements.length > 0){
        elements[0].parentNode.removeChild(elements[0]);
    }
}

global.belakangKoma = function(number){
    return number / Math.pow(10, number.toString().replace(/\D/gi, '').length)
}

global.isEmptyObject = function (obj) {
    return (obj && Object.keys(obj).length === 0 && Object.getPrototypeOf(obj) === Object.prototype)
}

global.indikatorGaji = 0

$.get("/app/cumaData/jumlahBelumDigaji", {},
  function (data, textStatus, jqXHR) {
    if(data.jumlah && data.jumlah > 0){
      let indikator = document.getElementById('indikatorGajiPegawai')
      indikatorGaji = data.jumlah

      if(data.jumlah > 99) indikatorGaji = '99+'
      indikator.textContent = indikatorGaji

      indikator.classList.remove('hidden')
    }
  },
  "json"
);

const indikatorNotif = document.getElementById('indikatorNotif')
const btBukaNotif = document.getElementById('btBukaNotif')
const badanNotif = document.getElementById('badanNotif')
const wadahNotif = document.getElementById('wadahNotif')
const penutupFullScreen = document.getElementById('penutupFullScreen')

$.get("/app/notifikasi/jumlahNotifBaru", {},
  function (data) {
    if(data.adaBaru){
      indikatorNotif.classList.remove('hidden')
    }
  },
  "json"
);

btBukaNotif.addEventListener('click', ()=>{
  // ini dipake kalo ngilangin tab-index di dropdown sama dropdown-content
  wadahNotif.textContent = ''
  let idTerakhir = 0

  $.get("/app/notifikasi/notifTerbaru", {},
    function (data, textStatus, jqXHR) {
      let i = 0
      for (const iterator of data.notifikasi) {
        console.log(iterator)

        if(i === 0){
          idTerakhir = iterator.id
        }

        let waktuNotif = DateTime.fromISO(iterator.created_at)
        let bedaMenit = Math.round(waktuNotif.diffNow('minutes').toObject().minutes)
        wadahNotif.append(Notifikasi.buatNotif(iterator.kode, iterator.nama, iterator.isi_notif, iterator.penjelas, Math.abs(bedaMenit), data.url + iterator.id))
        i++
      }

      $.post( "/app/notifikasi/setLihatNotif", { idTerakhir: idTerakhir } );
    },
    "json"
  )

  badanNotif.style.opacity = 1
  badanNotif.style.visibility = 'visible'
  indikatorNotif.classList.add('hidden')
  penutupFullScreen.classList.remove('hidden')
})

penutupFullScreen.addEventListener('click', () => {
  badanNotif.style.opacity = 0
  badanNotif.style.visibility = 'hidden'
  penutupFullScreen.classList.add('hidden')
})


global.SwalCustomColor = {
  icon: {
    error: '#f27474'
  },
  button: {
    confirm: '#4b6bfb',
    deny: '#Dc3741',
    cancel: '#6E7881'
  }
}


// import { pasaranHarIni, hariKePasaranSelanjutnya } from './pasaran.js'
// const { default: Swal } = require("sweetalert2")

// // ntar kalo bisa ini dikasi global, biar bisa dipanggil semua
// const Toast = Swal.mixin({
//   toast: true,
//   position: 'top-end',
//   showConfirmButton: false,
//   timer: 3000,
//   timerProgressBar: true,
//   didOpen: (toast) => {
//     toast.addEventListener('mouseenter', Swal.stopTimer)
//     toast.addEventListener('mouseleave', Swal.resumeTimer)
//   }
// })

/** Gini cara makenya */
// Toast.fire({
//   icon: 'error',
//   title: 'Anda harus memilih salah satu kelompok!'
// })
