// import Swal from "sweetalert2"
import Swal from "sweetalert2/dist/sweetalert2";

import {
  Chart,
  registerables
} from 'chart.js';
Chart.register(...registerables);

import { SwalCustomColor, removeElementsByClass } from '../../fungsi.js'

const basePage = document.getElementById('base-page').dataset.pagename
// ========================================= list ==========================================================
if (basePage == "list") {
  const BASEURL = window.location.pathname
  const qsParam = new URLSearchParams(window.location.search)
  const pencarian = document.querySelector('input#pencarian')
  const hapuscari = document.getElementById('hapusPencarian')
  const btAturTabel = document.getElementById('btAturTabel')

  let ob = 0,
    aob = 0
  if (qsParam.has('ob')) {
    if (['0', '1', '2'].includes(qsParam.get('ob'))) {
      ob = qsParam.get('ob')
    }
  }

  if (qsParam.has('aob')) {
    if (['0', '1'].includes(qsParam.get('aob'))) {
      aob = qsParam.get('aob')
    }
  }

  function persiapanKirim() {
    if (qsParam.get('cari') === null || pencarian.value === '') {
      qsParam.delete('cari')
    }

    updateKeyQs('ob', ob)
    updateKeyQs('aob', aob)

    qsParam.delete('page')
    window.location = BASEURL + '?' + qsParam.toString()
  }

  pencarian.addEventListener("keyup", function (event) {
    if (event.key === "Enter") {
      if (pencarian.value !== '' && pencarian.value) {
        updateKeyQs('cari', pencarian.value)
        persiapanKirim()
      }
    }
  });

  hapuscari.addEventListener("click", function () {
    pencarian.value = ''
    persiapanKirim()
  });


  btAturTabel.addEventListener('click', (e) => {
    Swal.fire({
      title: 'Atur Tabel',
      confirmButtonText: 'Terapkan',
      showCancelButton: true,
      cancelButtonText: 'Batal',
      scrollbarPadding: false,
      confirmButtonColor: SwalCustomColor.button.confirm,
      html: printAturTabelHTML(),
      willOpen: () => {
        Swal.getHtmlContainer().querySelector('#swal-ob').value = ob
      },
      preConfirm: () => {
        return {
          ob: Swal.getHtmlContainer().querySelector('#swal-ob').value,
          aob: Swal.getHtmlContainer().querySelector('input[name="swal-arahOb"]:checked').value,
        }
      }
    })
      .then((resolve) => {
        if (resolve.isConfirmed) {
          ob = resolve.value.ob
          aob = resolve.value.aob
          persiapanKirim()
        }
      })
  })


  let updateKeyQs = function (key, value) {
    if (qsParam.has(key)) {
      qsParam.set(key, value)
    } else {
      qsParam.append(key, value)
    }
  }

  let printAturTabelHTML = function () {

    const htmlAddStock = `
                  <div class="w-full px-6 space-y-6 flex flex-col text-left" >

                    <div class="form-control">
                        <label for="swal-ob">Urutkan Tabel Berdasarkan</label>
                        <select id="swal-ob" class="select select-bordered w-full max-w-md swal mt-2">
                            <option value="0">Nama Model</option>
                            <option value="1">Bentuk Perhiasan</option>
                            <option value="2">Deskripsi</option>
                        </select>
                        <div class="flex space-x-4 mt-2" x-data="{ radio: ` + ((aob == 1) ? 2 : 1) + ` }">
                            <label class="cursor-pointer items-center py-2 flex-1 rounded-box px-4 border"
                                :class="(radio == 1)? 'bg-primary bg-opacity-10 border-primary': 'bg-white border-secondary'">
                                <input type="radio" name="swal-arahOb" ` + ((aob == 0) ? 'checked=checked' : '') + ` class="radio radio-primary hidden"
                                value="0" @click="radio = 1">
                                <span class="label-text text-base flex items-center"
                                :class="(radio == 1)? 'text-primary': 'text-secondary'">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h5a1 1 0 000-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3zM13 16a1 1 0 102 0v-5.586l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 101.414 1.414L13 10.414V16z" />
                                    </svg>
                                    A - Z
                                </span>
                            </label>
                            <label class="cursor-pointer items-center py-2 flex-1 rounded-box px-4 border"
                                :class="(radio == 2)? 'bg-primary bg-opacity-10 border-primary': 'bg-white border-secondary'">
                                <input type="radio" name="swal-arahOb" ` + ((aob == 1) ? 'checked=checked' : '') + ` class="radio radio-primary hidden" value="1"
                                @click="radio = 2">
                                <span class="label-text text-base flex items-center"
                                :class="(radio == 2)? 'text-primary': 'text-secondary'">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h7a1 1 0 100-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3zM15 8a1 1 0 10-2 0v5.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L15 13.586V8z" />
                                    </svg>
                                    Z - A
                                </span>
                            </label>
                        </div>
                    </div>

                </div>
              `
    return htmlAddStock
  }
}

// ========================================== detail ===========================================
if (basePage == "detail") {
  const BASEURL = window.location.pathname
  const formModel = document.getElementById('formModel')
  const hapusModel = document.getElementById('hapusModel')
  const namaModel = document.getElementById('namaModel')


  // ----------------------------- statistik ---------------------------------
  // langsung ambil biar ngga kecolong
  const idModel = document.getElementById('base-page').dataset.idm

  const totalTerjual = document.getElementById('totalTerjual')
  const peringkatPenjualanTotal = document.getElementById('peringkatPenjualanTotal')
  const penjualanBulanIni = document.getElementById('penjualanBulanIni')
  const peringkatPenjualanBulanIni = document.getElementById('peringkatPenjualanBulanIni')
  const penjualanTahunIni = document.getElementById('penjualanTahunIni')
  const peringkatPenjualanTahunIni = document.getElementById('peringkatPenjualanTahunIni')
  const wadahAnalisis = document.getElementById('wadahAnalisis')
  const wadahLoadingAnalisis = document.getElementById('wadahLoadingAnalisis')
  const penjualanTerakhir = document.getElementById('penjualanTerakhir')

  // DOM Statistik
  const subjudulStatistik = document.getElementById('subjudulStatistik')
  const wadahStatistik = document.getElementById('wadahStatistik')
  const wadahLoadingStatistik = document.getElementById('wadahLoadingStatistik')
  const wadahSebaranData = document.getElementById('sebaranData');


  $.get("/app/cuma-data/peringkat-model/" + (idModel || 'kosong'), {},
    function (data, textStatus, jqXHR) {
      // kalau mau ini bisa dibikin promise, mulai dari getnya. trus bisa dikasi preventif kalau error ngapain
      if (data.peringkatTotal) {
        totalTerjual.innerText = data.peringkatTotal.jumlah + ' buah'
        peringkatPenjualanTotal.innerText = 'Urutan ke-' + data.peringkatTotal.ranking + ' dari ' + data.totalModel + ' model'
      } else {
        totalTerjual.innerText = '0 buah'
        peringkatPenjualanTotal.innerText = 'Tidak ada penjualan'
      }

      if (data.peringkatTahunIni) {
        penjualanTahunIni.innerText = data.peringkatTahunIni.jumlah + ' buah'
        peringkatPenjualanTahunIni.innerText = 'Urutan ke-' + data.peringkatTahunIni.ranking + ' dari ' + data.totalModel + ' model'
      } else {
        penjualanTahunIni.innerText = '0 buah'
        peringkatPenjualanTahunIni.innerText = 'Tidak ada penjualan'
      }

      if (data.peringkatBulanIni) {
        penjualanBulanIni.innerText = data.peringkatBulanIni.jumlah + ' buah'
        peringkatPenjualanBulanIni.innerText = 'Urutan ke-' + data.peringkatBulanIni.ranking + ' dari ' + data.totalModel + ' model'
      } else {
        penjualanBulanIni.innerText = '0 buah'
        peringkatPenjualanBulanIni.innerText = 'Tidak ada penjualan'
      }

      if (data.transaksiTerakhir) {
        penjualanTerakhir.innerText = new Date(data.transaksiTerakhir.tanggal).toLocaleDateString('id-ID')
      } else {
        penjualanTerakhir.innerText = 'Tidak ada penjualan'
      }

      wadahLoadingAnalisis.classList.add('hidden')
      wadahAnalisis.classList.remove('hidden')
      
    },
    "json"
  ).fail(() => {
    wadahLoadingAnalisis.classList.remove('hidden')
    wadahAnalisis.classList.add('hidden')
  })

  loadStatistik()

  // wadabChart jangan dipake macem2, khusus buat nampung chart
  let wadahChart = undefined
  let pointer = 0

  function loadStatistik(mode = 0) {
    $.get("/app/cuma-data/sebaran-data-model/" + (idModel || 'kosong'), {
      mode: mode
    },
      function (data, textStatus, jqXHR) {
        pointer = mode

        let labels = []
        let datas = []

        data.forEach(element => {
          labels.push(element.label)
          datas.push(element.jumlah)
        });

        const input = {
          labels: labels,
          datasets: [{
            label: 'Penjualan',
            data: datas,
            borderColor: 'rgb(255, 99, 132)',
          },]
        };

        const chartConfig = {
          type: 'line',
          data: input,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: 'Penjualan ' + ((mode == 1) ? 'Bulan Ini' : (mode == 2) ? 'Tahun Ini' : 'Minggu Ini')
              }
            },
            scale: {
              ticks: {
                precision: 0,
              }
            }
          },
        };

        if (wadahChart) wadahChart.destroy()

        wadahChart = new Chart(wadahSebaranData, chartConfig)
        subjudulStatistik.innerText = 'Statistik Transaksi ' + ((mode == 1) ? ' Bulan Ini' : (mode == 2) ? ' Tahun Ini' : ' Minggu Ini')

        wadahStatistik.classList.remove('hidden')
        wadahLoadingStatistik.classList.add('hidden')
      },
      "json"
    ).fail(() => {
      if (wadahChart) wadahChart.destroy()

      wadahStatistik.classList.add('hidden')
      wadahLoadingStatistik.classList.remove('hidden')
    })
  }


  document.getElementById('aturStatistik').addEventListener('click', (e) => {
    Swal.fire({
      title: 'Atur jangkauan statistik',
      html: printAturStatistikHTML(pointer),
      confirmButtonText: 'Terapkan',
      showCancelButton: true,
      cancelButtonText: 'Batal',
      scrollbarPadding: false,
      preConfirm: () => {
        return document.getElementById('swal-range').value
      }
    }).then(hasil => {
      if (hasil.isConfirmed) {
        loadStatistik(hasil.value)
      }
    })
  })

  let printAturStatistikHTML = function (pointer = 0) {
    const html = `
            <div class="w-full px-6 space-y-6 flex flex-col text-left">

                <div class="form-control">
                    <select id="swal-range" class="select select-bordered w-full max-w-md swal">
                    <option value="0" ${(pointer == 0) ? 'selected' : ''}>Penjualan minggu ini</option>
                    <option value="1" ${(pointer == 1) ? 'selected' : ''}>Penjualan bulan ini</option>
                    <option value="2" ${(pointer == 2) ? 'selected' : ''}>Penjualan tahun ini</option>
                    </select>
                </div>

            </div>
        `
    return html
  }

  // ---------------------- hapus model ---------------------------------
  if (hapusModel && formModel) {
    hapusModel.addEventListener('click', () => {
      Swal.fire({
        title: 'Yakin untuk menghapus?',
        text: 'Anda akan menghapus model "' + namaModel.innerText + '", dan model yang dihapus tidak dapat dikembalikan.',
        icon: 'info',
        iconColor: SwalCustomColor.icon.error,
        showCancelButton: true,
        confirmButtonText: 'Ya, hapus!',
        cancelButtonText: 'Batal',
        scrollbarPadding: false,
        confirmButtonColor: SwalCustomColor.button.deny,
        focusCancel: true,
      }).then((result) => {
        if (result.isConfirmed) {
          formModel.action = window.location.pathname + '?_method=DELETE'
          formModel.submit()
        }
      })
    })
  }

}

// ========================================== form ===========================================
if (basePage == "form") {
  const formModel = document.getElementById('formModel')
  const submitModel = document.getElementById('submitModel')
  const bentuk = document.getElementById('bentuk')
  let eventModel = false

  submitModel.addEventListener('click', (e) => {
    let errorMsg = document.createElement('p')
    errorMsg.classList.add('text-error', 'pesanerror')

    if (bentuk.value === 'kosong') {
      bentuk.classList.add('select-error', 'bg-error')
      bentuk.classList.remove('bg-primary', 'select-primary')
      errorMsg.innerText = 'Pilih salah satu bentuk!'
      if (document.getElementsByClassName('pesanerror').length == 0) bentuk.after(errorMsg)
      bentuk.scrollIntoView({
        // behavior: "smooth",
        block: "center",
        inline: "nearest"
      });

      if (!eventModel) {
        bentuk.addEventListener('change', function () {
          if (bentuk.value && bentuk.value !== 'kosong') {
            bentuk.classList.remove('select-error', 'bg-error')
            bentuk.classList.add('bg-primary', 'select-primary')
            removeElementsByClass('pesanerror')
          }
        })
        eventModel = true
      }

      return
    }

    if (!formModel.reportValidity()) return

    Swal.fire({
      title: 'Yakin untuk menyimpan?',
      text: 'Pastikan data yang anda isikan sudah benar!',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: SwalCustomColor.button.confirm,
      confirmButtonText: 'Ya, simpan!',
      cancelButtonText: 'Batal',
      scrollbarPadding: false,
      focusCancel: true,
    }).then((result) => {
      if (result.isConfirmed) {
        formModel.action = '/app/barang/model'
        formModel.submit()
      }
    })

  })

  formModel.addEventListener('submit', (e) => {
    if (!formModel.reportValidity()) e.preventDefault()
  })

}

// ========================================== edit ===========================================
if (basePage == "edit") {
  const BASEURL = window.location.pathname

  const formModel = document.getElementById('formModel')
  const editModel = document.getElementById('editModel')
  const bentuk = document.getElementById('bentuk')
  let eventModel = false

  editModel.addEventListener('click', (e) => {
    let errorMsg = document.createElement('p')
    errorMsg.classList.add('text-error', 'pesanerror')

    if (bentuk.value === 'kosong') {
      bentuk.classList.add('select-error', 'bg-error')
      bentuk.classList.remove('bg-primary', 'select-primary')
      errorMsg.innerText = 'Pilih salah satu bentuk!'
      if (document.getElementsByClassName('pesanerror').length == 0) bentuk.after(errorMsg)
      bentuk.scrollIntoView({
        // behavior: "smooth",
        block: "center",
        inline: "nearest"
      });

      if (!eventModel) {
        bentuk.addEventListener('change', function () {
          if (bentuk.value && bentuk.value !== 'kosong') {
            bentuk.classList.remove('select-error', 'bg-error')
            bentuk.classList.add('bg-primary', 'select-primary')
            removeElementsByClass('pesanerror')
          }
        })
        eventModel = true
      }

      return
    }

    if (!formModel.reportValidity()) return

    Swal.fire({
      title: 'Yakin untuk mengubah?',
      text: 'Pastikan data yang anda isikan sudah benar!',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: SwalCustomColor.button.confirm,
      confirmButtonText: 'Ya, ubah!',
      cancelButtonText: 'Batal',
      scrollbarPadding: false,
      focusCancel: true,
    }).then((result) => {
      if (result.isConfirmed) {
        formModel.action = BASEURL.slice(0, -5) + '?_method=PUT'
        formModel.submit()
      }
    })
  })

  formModel.addEventListener('submit', (e) => {
    if (!formModel.reportValidity()) e.preventDefault()
  })

}

