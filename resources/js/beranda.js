import {
  Chart,
  registerables
} from 'chart.js';
Chart.register(...registerables);

// ===================================== STATISTIK ============================================
const chartStatistik = document.getElementById('chartPjPb')
$.get("/app/cuma-data/pjpb-seminggu-ini", {},
  function (data, textStatus, jqXHR) {
    let labels = []
    let pjs = []
    let pbs = []

    data.forEach(element => {
      labels.push(element.label)
      pjs.push(element.jumlahPJ)
      pbs.push(element.jumlahPB)
    });

    const dataChart = {
      labels: labels,
      datasets: [
        {
          label: 'Penjualan',
          data: pjs,
          borderColor: 'rgb(255, 99, 132)',
        },
        {
          label: 'Pembelian',
          data: pbs,
          borderColor: 'rgb(54, 162, 235)',
        }
      ]
    };

    const configChart = {
      type: 'line',
      data: dataChart,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
          },
          title: {
            display: false,
            text: 'Penjualan dan Pembelian seminggu terakhir'
          }
        }
      },
    };

    var wadahChart = new Chart(chartStatistik, configChart)
  },
  "json"
)


// ================================== Sebaran Data Pb ========================================
// const chartSebar = document.getElementById('chartSebarPb')
// const errorSebar = document.getElementById('errorSebar')
// $.get("/app/cuma-data/sebaran-pb", {},
//   function (data, textStatus, jqXHR) {
//     if (data.adaData && typeof data.dariLuar == 'number' && typeof data.dariToko == 'number' && typeof data.tanpaSurat == 'number') {
//       const dataChart = {
//         labels: [
//           'Pembelian Barang Toko Leo',
//           'Pembelian Barang Toko Luar',
//           'Pembelian Barang Tanpa Surat'
//         ],
//         datasets: [{
//           label: 'My First Dataset',
//           data: [data.dariToko, data.dariLuar, data.tanpaSurat],
//           backgroundColor: [
//             'rgb(54, 162, 235)',
//             'rgb(255, 99, 132)',
//             'rgb(255, 205, 86)'
//           ],
//           hoverOffset: 4
//         }]
//       };

//       const configChart = {
//         type: 'doughnut',
//         data: dataChart,
//         options: {
//           responsive: true,
//           maintainAspectRatio: false,
//           plugins: {
//             legend: {
//               position: 'bottom',
//             },
//           }
//         },
//       };

//       var wadahChart = new Chart(chartSebar, configChart)
//     } else {
//       chartSebar.classList.add('hidden')

//       errorSebar.classList.add('flex')
//       errorSebar.classList.remove('hidden')
//     }

//   },
//   "json"
// );


// =================================== PALING LAKU ===========================================
const loadingLaku = document.getElementById('loadingLaku')
const wadahLaku = document.getElementById('wadahLaku')
const wadahLakuKelompok = document.getElementById('wadahLakuKelompok')
const wadahLakuModel = document.getElementById('wadahLakuModel')
const wadahLakuKode = document.getElementById('wadahLakuKode')
const errorLaku = document.getElementById('errorLaku')
const tipeLaku = document.getElementById('tipeLaku')

let mode = 0
tipeLaku.addEventListener('change', () => {
  mode = tipeLaku.value
  tipeLaku.disabled = true

  loadingLaku.classList.remove('hidden')
  wadahLaku.classList.add('hidden')
  errorLaku.classList.add('hidden')

  setTimeout(() => {
    prepareDaftarLaku()
  }, 1000);
})

// ngambil data pertama, selanjutnya dari event trigger
prepareDaftarLaku()

function prepareDaftarLaku() {
  $.get("/app/cuma-data/kelmodkod-laku", { mode: mode },
    function (data, textStatus, jqXHR) {
      // clear
      wadahLakuKelompok.textContent = ''
      wadahLakuModel.textContent = ''
      wadahLakuKode.textContent = ''

      if (data.kelompok) {
        for (let i = 0; i < data.kelompok.length; i++) {
          const input = (data.mode == 1) ? `${data.kelompok[i].totalBerat} gr` : data.kelompok[i].totalPenjualan
          const list = generateList(i, data.kelompok[i].namaKelompok, `${data.kelompok[i].bentuk} ${data.kelompok[i].kadar}`, input, `/app/barang/kelompok/${data.kelompok[i].id}`)
          wadahLakuKelompok.append(list)
        }
      }

      if (data.model) {
        for (let i = 0; i < data.model.length; i++) {
          const input = (data.mode == 1) ? `${data.model[i].totalBerat} gr` : data.model[i].totalPenjualan
          const list = generateList(i, data.model[i].namaModel, data.model[i].bentuk, input, `/app/barang/model/${data.model[i].id}`)
          wadahLakuModel.append(list)
        }
      }

      if (data.kodepro) {
        for (let i = 0; i < data.kodepro.length; i++) {
          const input = (data.mode == 1) ? `${data.kodepro[i].totalBerat} gr` : data.kodepro[i].totalPenjualan
          const list = generateList(i, data.kodepro[i].kodepro, data.kodepro[i].kadar, input, `/app/barang/kodepro/${data.kodepro[i].id}`)
          wadahLakuKode.append(list)
        }
      }

      loadingLaku.classList.add('hidden')

      if (data.kelompok.length > 0) {
        // tampilin daftar
        wadahLaku.classList.remove('hidden')
      } else {
        // tampilin teks kosong
        errorLaku.classList.add('flex')
        errorLaku.classList.remove('hidden')
      }
    },
    "json"
  );

  tipeLaku.disabled = false
}


// ==================================== PENCATAT TERBANYAK ===================================
// const loadingCatat = document.getElementById('loadingCatat')
// const wadahCatat = document.getElementById('wadahCatat')
// const wadahCatatPj = document.getElementById('wadahCatatPj')
// const wadahCatatPb = document.getElementById('wadahCatatPb')
// const errorCatat = document.getElementById('errorCatat')

// $.get("/app/cuma-data/pencatat-pjpb", {},
//   function (data, textStatus, jqXHR) {
//     // clear
//     wadahCatatPj.textContent = ''
//     wadahCatatPb.textContent = ''

//     if (data.pegawaiJual) {
//       for (let i = 0; i < data.pegawaiJual.length; i++) {
//         const list = generateListPencatat(i, data.pegawaiJual[i].id, data.pegawaiJual[i].nama, data.pegawaiJual[i].jabatan, data.pegawaiJual[i].totalPenjualan)
//         wadahCatatPj.append(list)
//       }
//     }

//     if (data.pegawaiBeli) {
//       for (let i = 0; i < data.pegawaiBeli.length; i++) {
//         const list = generateListPencatat(i, data.pegawaiBeli[i].id, data.pegawaiBeli[i].nama, data.pegawaiBeli[i].jabatan, data.pegawaiBeli[i].totalPembelian)
//         wadahCatatPb.append(list)
//       }
//     }

//     loadingCatat.classList.add('hidden')

//     if (data.pegawaiJual.length > 0 || data.pegawaiBeli.length > 0) {
//       // tampilin daftar
//       wadahCatat.classList.remove('hidden')
//     } else {
//       // tampilin teks kosong
//       errorCatat.classList.add('flex')
//       errorCatat.classList.remove('hidden')
//     }
//   },
//   "json"
// );



// ==================================== REKAP BALEN ===================================
const loadingBalen = document.getElementById('loadingBalen')
const wadahBalen = document.getElementById('wadahBalen')
const errorBalen = document.getElementById('errorBalen')

// keknya beda lagi
const wadahTggUripan = document.getElementById('wadahTggUripan')
const wadahTggRusak = document.getElementById('wadahTggRusak')
const wadahTggRosok = document.getElementById('wadahTggRosok')
const wadahMdUripan = document.getElementById('wadahMdUripan')
const wadahMdRusak = document.getElementById('wadahMdRusak')
const wadahMdRosok = document.getElementById('wadahMdRosok')
const wadahTuUripan = document.getElementById('wadahTuUripan')
const wadahTuRusak = document.getElementById('wadahTuRusak')
const wadahTuRosok = document.getElementById('wadahTuRosok')

const tipeBalen = document.getElementById('tipeBalen')


tipeBalen.addEventListener('change', () => {
  tipeBalen.disabled = true

  loadingBalen.classList.remove('hidden')
  wadahBalen.classList.add('hidden')
  errorBalen.classList.add('hidden')

  setTimeout(() => {
    tataTempat(tipeBalen.value) // ganti prepareDaftarBalen
  }, 1000);
})


let DATA
function tataTempat(mode = 0){
  // clear
  wadahTggUripan.textContent = ''
  wadahTggRusak.textContent = ''
  wadahTggRosok.textContent = ''
  wadahMdUripan.textContent = ''
  wadahMdRusak.textContent = ''
  wadahMdRosok.textContent = ''
  wadahTuUripan.textContent = ''
  wadahTuRusak.textContent = ''
  wadahTuRosok.textContent = ''

  let isGram = (mode == 1)

  // ------------ Tanggung --------------
  if(DATA.tgg){
    if(DATA.tgg.uripan){
      let total = 0
      for (let i = 0; i < DATA.tgg.uripan.length; i++) {
        const angka = isGram? DATA.tgg.uripan[i].berat : DATA.tgg.uripan[i].jumlah
        total+= angka
        wadahTggUripan.append(generateListBalen(DATA.tgg.uripan[i].bentuk, angka, isGram))          
      }

      wadahTggUripan.append(generateTotalBalen('Total', total, isGram))
    }

    if(DATA.tgg.rusak){
      let total = 0
      for (let i = 0; i < DATA.tgg.rusak.length; i++) {
        const angka = isGram? DATA.tgg.rusak[i].berat : DATA.tgg.rusak[i].jumlah
        total+= angka
        wadahTggRusak.append(generateListBalen(DATA.tgg.rusak[i].bentuk, angka, isGram))          
      }

      wadahTggRusak.append(generateTotalBalen('Total', total, isGram))
    }

    if(DATA.tgg.rosok){
      let total = 0
      for (let i = 0; i < DATA.tgg.rosok.length; i++) {
        const angka = isGram? DATA.tgg.rosok[i].berat : DATA.tgg.rosok[i].jumlah
        total+= angka
        wadahTggRosok.append(generateListBalen(DATA.tgg.rosok[i].bentuk, angka, isGram))          
      }

      wadahTggRosok.append(generateTotalBalen('Total', total, isGram))
    }
  }

  // ----------------- Muda -----------------
  if(DATA.md){
    if(DATA.md.uripan){
      let total = 0
      for (let i = 0; i < DATA.md.uripan.length; i++) {
        const angka = isGram? DATA.md.uripan[i].berat : DATA.md.uripan[i].jumlah
        total+= angka
        wadahMdUripan.append(generateListBalen(DATA.md.uripan[i].bentuk, angka, isGram))          
      }

      wadahMdUripan.append(generateTotalBalen('Total', total, isGram))
    }

    if(DATA.md.rusak){
      let total = 0
      for (let i = 0; i < DATA.md.rusak.length; i++) {
        const angka = isGram? DATA.md.rusak[i].berat : DATA.md.rusak[i].jumlah
        total+= angka
        wadahMdRusak.append(generateListBalen(DATA.md.rusak[i].bentuk, angka, isGram))          
      }

      wadahMdRusak.append(generateTotalBalen('Total', total, isGram))
    }

    if(DATA.md.rosok){
      let total = 0
      for (let i = 0; i < DATA.md.rosok.length; i++) {
        const angka = isGram? DATA.md.rosok[i].berat : DATA.md.rosok[i].jumlah
        total+= angka
        wadahMdRosok.append(generateListBalen(DATA.md.rosok[i].bentuk, angka, isGram))
      }

      wadahMdRosok.append(generateTotalBalen('Total', total, isGram))
    }
  }

  // -------------------- Tua ---------------

  if(DATA.tu){
    if(DATA.tu.uripan){
      let total = 0
      for (let i = 0; i < DATA.tu.uripan.length; i++) {
        const angka = isGram? DATA.tu.uripan[i].berat : DATA.tu.uripan[i].jumlah
        total+= angka
        wadahTuUripan.append(generateListBalen(DATA.tu.uripan[i].bentuk, angka, isGram))          
      }

      wadahTuUripan.append(generateTotalBalen('Total', total, isGram))
    }

    if(DATA.tu.rusak){
      let total = 0
      for (let i = 0; i < DATA.tu.rusak.length; i++) {
        const angka = isGram? DATA.tu.rusak[i].berat : DATA.tu.rusak[i].jumlah
        total+= angka
        wadahTuRusak.append(generateListBalen(DATA.tu.rusak[i].bentuk, angka, isGram))          
      }

      wadahTuRusak.append(generateTotalBalen('Total', total, isGram))
    }

    if(DATA.tu.rosok){
      let total = 0
      for (let i = 0; i < DATA.tu.rosok.length; i++) {
        const angka = isGram? DATA.tu.rosok[i].berat : DATA.tu.rosok[i].jumlah
        total+= angka
        wadahTuRosok.append(generateListBalen(DATA.tu.rosok[i].bentuk, angka, isGram))          
      }

      wadahTuRosok.append(generateTotalBalen('Total', total, isGram))
    }
  }

  loadingBalen.classList.add('hidden')
  wadahBalen.classList.remove('hidden')

  tipeBalen.disabled = false
}


$.get("/app/cuma-data/rekap-balen", {},
  function (data, textStatus, jqXHR) {
    if(data.tgg && data.md && data.tu){
      DATA = data
      console.log(DATA)
      tataTempat()
    } else {
      wadahBalen.classList.add('hidden')
      errorBalen.classList.remove('hidden')
    }
  },
  "json"
);


function generateListBalen(nama, value, apakahGram){
  const div = document.createElement('div')
  div.classList.add('flex')

  const span1 = document.createElement('span')
  span1.classList.add('flex-1')
  span1.textContent = nama

  const span2 = document.createElement('span')
  span2.textContent = ((value)? value:0) + ((apakahGram)? 'gr':'')

  div.append(span1, span2)
  return div
}

function generateTotalBalen(nama, value, apakahGram){
  const div = document.createElement('div')
  div.classList.add('flex', 'border-t', 'mt-1', 'border-neutral', 'font-semibold')

  const span1 = document.createElement('span')
  span1.classList.add('flex-1')
  span1.textContent = nama

  const span2 = document.createElement('span')
  span2.textContent = ((value)? value:0) + ((apakahGram)? 'gr':'')

  div.append(span1, span2)
  return div
}



function generateList(i, judul, sub, data, url) {
  const li = document.createElement('li')
  li.classList.add('flex', 'space-x-4', 'w-full')

  const div1 = document.createElement('div')
  div1.classList.add('flex', 'items-center')

  const div2 = document.createElement('div')
  div2.classList.add('flex-1')

  const div2Judul = document.createElement('a')
  div2Judul.classList.add('font-semibold', 'link', 'link-hover')
  div2Judul.textContent = judul
  div2Judul.href = url

  const div2Sub = document.createElement('div')
  div2Sub.classList.add('text-sm')
  div2Sub.textContent = sub
  div2.append(div2Judul, div2Sub)

  const div3 = document.createElement('div')
  div3.classList.add('flex', 'items-center')
  div3.textContent = data

  if (i === 0) {
    const div1Bullet = document.createElement('div')
    div1Bullet.classList.add('h-5', 'w-5', 'text-sm', 'bg-primary', 'flex', 'items-center', 'justify-center', 'rounded-full', 'text-white')
    div1Bullet.textContent = i + 1
    div1.append(div1Bullet)
  }
  else if (i === 1) {
    const div1Bullet = document.createElement('div')
    div1Bullet.classList.add('h-5', 'w-5', 'text-sm', 'bg-info', 'flex', 'items-center', 'justify-center', 'rounded-full', 'text-white')
    div1Bullet.textContent = i + 1
    div1.append(div1Bullet)
  }
  else if (i === 2) {
    const div1Bullet = document.createElement('div')
    div1Bullet.classList.add('h-5', 'w-5', 'text-sm', 'bg-secondary', 'flex', 'items-center', 'justify-center', 'rounded-full', 'text-white')
    div1Bullet.textContent = i + 1
    div1.append(div1Bullet)
  }
  else {
    const div1Bullet = document.createElement('div')
    div1Bullet.classList.add('h-5', 'w-5', 'text-sm', 'border', 'border-secondary', 'flex', 'items-center', 'justify-center', 'rounded-full', 'text-secondary')
    div1Bullet.textContent = i + 1
    div1.append(div1Bullet)
  }

  li.append(div1, div2, div3)

  return li
}

function generateListPencatat(i, id, nama, jabatan, data) {
  const li = document.createElement('li')
  li.classList.add('flex', 'space-x-4', 'w-full')

  const div1 = document.createElement('div')
  div1.classList.add('flex', 'items-center')

  const divAvatar = document.createElement('div')
  divAvatar.classList.add('avatar', 'flex', 'items-center', 'justify-center')

  const divFrame = document.createElement('div')
  divFrame.classList.add('w-10', 'h-10', 'mask', 'mask-squircle', 'bg-placeholder-user-100', 'bg-contain')

  const imgFoto = document.createElement('img')
  imgFoto.src = '/app/cuma-data/foto/pegawai/' + id
  imgFoto.addEventListener('error', (e) => {
    e.target.style.display = 'none'
  })
  divFrame.append(imgFoto)
  divAvatar.append(divFrame)

  const div2 = document.createElement('div')
  div2.classList.add('flex-1')

  const div2Judul = document.createElement('a')
  div2Judul.classList.add('font-semibold', 'link', 'link-hover')
  div2Judul.textContent = nama
  div2Judul.href = '/app/pegawai/' + id

  const div2Sub = document.createElement('div')
  div2Sub.classList.add('text-sm')
  div2Sub.textContent = jabatan
  div2.append(div2Judul, div2Sub)

  const div3 = document.createElement('div')
  div3.classList.add('flex', 'items-center')
  div3.textContent = data

  if (i === 0) {
    const div1Bullet = document.createElement('div')
    div1Bullet.classList.add('h-5', 'w-5', 'text-sm', 'bg-primary', 'flex', 'items-center', 'justify-center', 'rounded-full', 'text-white')
    div1Bullet.textContent = i + 1
    div1.append(div1Bullet)
  }
  else if (i === 1) {
    const div1Bullet = document.createElement('div')
    div1Bullet.classList.add('h-5', 'w-5', 'text-sm', 'bg-info', 'flex', 'items-center', 'justify-center', 'rounded-full', 'text-white')
    div1Bullet.textContent = i + 1
    div1.append(div1Bullet)
  }
  else if (i === 2) {
    const div1Bullet = document.createElement('div')
    div1Bullet.classList.add('h-5', 'w-5', 'text-sm', 'bg-secondary', 'flex', 'items-center', 'justify-center', 'rounded-full', 'text-white')
    div1Bullet.textContent = i + 1
    div1.append(div1Bullet)
  }
  else {
    const div1Bullet = document.createElement('div')
    div1Bullet.classList.add('h-5', 'w-5', 'text-sm', 'border', 'border-secondary', 'flex', 'items-center', 'justify-center', 'rounded-full', 'text-secondary')
    div1Bullet.textContent = i + 1
    div1.append(div1Bullet)
  }

  li.append(div1, divAvatar, div2, div3)

  return li
}