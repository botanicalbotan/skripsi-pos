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
            position: 'top',
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
const chartSebar = document.getElementById('chartSebarPb')
const errorSebar = document.getElementById('errorSebar')
$.get("/app/cuma-data/sebaran-pb", {},
  function (data, textStatus, jqXHR) {
    if (data.adaData && typeof data.dariLuar == 'number' && typeof data.dariToko == 'number' && typeof data.tanpaSurat == 'number') {
      const dataChart = {
        labels: [
          'Pembelian Barang Toko Leo',
          'Pembelian Barang Toko Luar',
          'Pembelian Barang Tanpa Surat'
        ],
        datasets: [{
          label: 'My First Dataset',
          data: [data.dariToko, data.dariLuar, data.tanpaSurat],
          backgroundColor: [
            'rgb(54, 162, 235)',
            'rgb(255, 99, 132)',
            'rgb(255, 205, 86)'
          ],
          hoverOffset: 4
        }]
      };

      const configChart = {
        type: 'doughnut',
        data: dataChart,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
            },
          }
        },
      };

      var wadahChart = new Chart(chartSebar, configChart)
    } else {
      chartSebar.classList.add('hidden')

      errorSebar.classList.add('flex')
      errorSebar.classList.remove('hidden')
    }

  },
  "json"
);


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
          const input = (data.mode == 1) ? `${data.kelompok[i].totalBerat} Gr` : data.kelompok[i].totalPenjualan
          const list = generateList(i, data.kelompok[i].namaKelompok, `${data.kelompok[i].bentuk} ${data.kelompok[i].kadar}`, input, `/app/barang/kelompok/${data.kelompok[i].id}`)
          wadahLakuKelompok.append(list)
        }
      }

      if (data.model) {
        for (let i = 0; i < data.model.length; i++) {
          const input = (data.mode == 1) ? `${data.model[i].totalBerat} Gr` : data.model[i].totalPenjualan
          const list = generateList(i, data.model[i].namaModel, data.model[i].bentuk, input, `/app/barang/model/${data.model[i].id}`)
          wadahLakuModel.append(list)
        }
      }

      if (data.kodepro) {
        for (let i = 0; i < data.kodepro.length; i++) {
          const input = (data.mode == 1) ? `${data.kodepro[i].totalBerat} Gr` : data.kodepro[i].totalPenjualan
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
const loadingCatat = document.getElementById('loadingCatat')
const wadahCatat = document.getElementById('wadahCatat')
const wadahCatatPj = document.getElementById('wadahCatatPj')
const wadahCatatPb = document.getElementById('wadahCatatPb')
const errorCatat = document.getElementById('errorCatat')

$.get("/app/cuma-data/pencatat-pjpb", {},
  function (data, textStatus, jqXHR) {
    // clear
    wadahCatatPj.textContent = ''
    wadahCatatPb.textContent = ''

    if (data.pegawaiJual) {
      for (let i = 0; i < data.pegawaiJual.length; i++) {
        const list = generateListPencatat(i, data.pegawaiJual[i].id, data.pegawaiJual[i].nama, data.pegawaiJual[i].jabatan, data.pegawaiJual[i].totalPenjualan)
        wadahCatatPj.append(list)
      }
    }

    if (data.pegawaiBeli) {
      for (let i = 0; i < data.pegawaiBeli.length; i++) {
        const list = generateListPencatat(i, data.pegawaiBeli[i].id, data.pegawaiBeli[i].nama, data.pegawaiBeli[i].jabatan, data.pegawaiBeli[i].totalPembelian)
        wadahCatatPb.append(list)
      }
    }

    loadingCatat.classList.add('hidden')

    if (data.pegawaiJual.length > 0 || data.pegawaiBeli.length > 0) {
      // tampilin daftar
      wadahCatat.classList.remove('hidden')
    } else {
      // tampilin teks kosong
      errorCatat.classList.add('flex')
      errorCatat.classList.remove('hidden')
    }
  },
  "json"
);











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