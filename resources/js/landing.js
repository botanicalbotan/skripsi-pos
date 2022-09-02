import '../css/app.css'

// const $ = require('jquery')

const dataToko = [
  {
    nama: 'Toko Mas Leo 1',
    alamat: 'Timur Pasar Karanggede, Dusun 2, Kebonan, Kec. Karanggede, Kabupaten Boyolali, Jawa Tengah 57381',
    jamBuka: 'Buka setiap hari dari pukul 08:00 - 15:00 kecuali hari Minggu Pon. '
  },
  {
    nama: 'Toko Mas Leo 2',
    alamat: 'JL Prawirodigdoyo, Rt. 07/08, Kebonan, Karanggede, Dusun 2, Kebonan, Boyolali, Kabupaten Boyolali, Jawa Tengah 57381',
    jamBuka: 'Buka setiap hari dari pukul 08:00 - 15:00 kecuali hari Minggu Pon. '
  },
  {
    nama: 'Toko Mas Leo Klego',
    alamat: 'Jl. Karanggede-gemolong, RT.02/RW.01, Ngembat, Klego, Kec. Klego, Kabupaten Boyolali, Jawa Tengah 57385',
    jamBuka: 'Buka setiap hari dari pukul 08:00 - 15:00 kecuali hari Minggu pekan terakhir. '
  },
]

// smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
      e.preventDefault();

      document.querySelector(this.getAttribute('href')).scrollIntoView({
          behavior: 'smooth'
      });
  });
});

const namaToko = document.getElementById('namaToko')
const alamatToko = document.getElementById('alamatToko')
const jamBukaToko = document.getElementById('jamBukaToko')

const toko1 = document.getElementById('toko1')
const toko2 = document.getElementById('toko2')
const toko3 = document.getElementById('toko3')

toko1.addEventListener('click', () =>{
  namaToko.textContent = dataToko[0].nama
  alamatToko.textContent = dataToko[0].alamat
  jamBukaToko.textContent = dataToko[0].jamBuka
})

toko2.addEventListener('click', () =>{
  namaToko.textContent = dataToko[1].nama
  alamatToko.textContent = dataToko[1].alamat
  jamBukaToko.textContent = dataToko[1].jamBuka
})

toko3.addEventListener('click', () =>{
  namaToko.textContent = dataToko[2].nama
  alamatToko.textContent = dataToko[2].alamat
  jamBukaToko.textContent = dataToko[2].jamBuka
})


window.onscroll = function () {
  scrollFunction()
};

function scrollFunction() {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    $('#scrollTopBtn').removeClass('invisible translate-y-8').addClass('visible translate-y-0')
  } else {
    $('#scrollTopBtn').removeClass('visible translate-y-0').addClass('invisible translate-y-8');
  }
}