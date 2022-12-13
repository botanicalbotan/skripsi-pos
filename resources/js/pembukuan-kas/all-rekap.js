// import Swal from "sweetalert2"
import Swal from "sweetalert2/dist/sweetalert2"

import { SwalCustomColor } from '../fungsi.js'

$(function () {
  const basePage = document.getElementById('base-page').dataset.pagename
  // ========================================= list ==========================================================
  if (basePage == "list") {
    const BASEURL = window.location.pathname
    const qsParam = new URLSearchParams(window.location.search)
    const btAturTabel = document.getElementById('btAturTabel')

    let ob = 0, aob = 1, fs = 0
    if (qsParam.has('ob')) {
      if (['0', '1', '2', '3', '4'].includes(qsParam.get('ob'))) {
        ob = qsParam.get('ob')
      }
    }

    if (qsParam.has('aob')) {
      if (['0', '1'].includes(qsParam.get('aob'))) {
        aob = qsParam.get('aob')
      }
    }

    if (qsParam.has('fs')) {
      if (['0', '1'].includes(qsParam.get('fs'))) {
        fs = qsParam.get('fs')
      }
    }

    function persiapanKirim() {

      updateKeyQs('ob', ob)
      updateKeyQs('aob', aob)
      updateKeyQs('fs', fs)

      qsParam.delete('page')
      window.location = BASEURL + '?' + qsParam.toString()
    }


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
            fs: Swal.getHtmlContainer().querySelector('input[name="swal-filterShow"]:checked').value,
          }
        }
      })
        .then((resolve) => {
          if (resolve.isConfirmed) {
            ob = resolve.value.ob
            aob = resolve.value.aob
            fs = resolve.value.fs
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
                            <option value="0">Tanggal</option>
                            <option value="1">Pasaran</option>
                            <option value="2">Total ${((fs == 0) ? 'Pemasukan' : 'Penjualan')}</option>
                            <option value="3">Total ${((fs == 0) ? 'Pengeluaran' : 'Pembelian')}</option>
                            <option value="4">Saldo Akhir Toko</option>
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

                    <div class="form-control" x-data="{ radio: ` + ((fs == 1) ? 2 : 1) + ` }">
                      <label for="">Data Yang Ditampilkan</label>
                      <div class="flex space-x-4 mt-2">
                      <label class="cursor-pointer items-center py-2 flex-1 rounded-box px-4 border"
                          :class="(radio == 1)? 'bg-primary bg-opacity-10 border-primary': 'bg-white border-secondary'">
                          <input type="radio" name="swal-filterShow" ` + ((fs == 0) ? 'checked=checked' : '') + ` class="radio radio-primary hidden"
                          value="0" @click="radio = 1">
                          <span class="label-text text-base"
                          :class="(radio == 1)? 'text-primary': 'text-secondary'">Jual-Beli</span>
                      </label>
                      <label class="cursor-pointer items-center py-2 flex-1 rounded-box px-4 border"
                          :class="(radio == 2)? 'bg-primary bg-opacity-10 border-primary': 'bg-white border-secondary'">
                          <input type="radio" name="swal-filterShow" ` + ((fs == 1) ? 'checked=checked' : '') + ` class="radio radio-primary hidden" value="1"
                          @click="radio = 2">
                          <span class="label-text text-base"
                          :class="(radio == 2)? 'text-primary': 'text-secondary'">Kredit-Debit</span>
                      </label>
                      </div>
                  </div>

                </div>
              `
      return htmlAddStock
    }
  }

  if (basePage == 'detail') {
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


    let DATA
    function tataTempat() {
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

      // ------------ Tanggung --------------
      if (DATA.tgg) {
        if (DATA.tgg.uripan) {
          let total = 0, totalBerat = 0
          for (let i = 0; i < DATA.tgg.uripan.length; i++) {
            total += DATA.tgg.uripan[i].jumlah
            totalBerat += DATA.tgg.uripan[i].berat
            wadahTggUripan.append(generateListBalen(DATA.tgg.uripan[i].bentuk, DATA.tgg.uripan[i].jumlah, DATA.tgg.uripan[i].berat))
          }

          wadahTggUripan.append(generateTotalBalen('Total', total, totalBerat))
        }

        if (DATA.tgg.rusak) {
          let total = 0, totalBerat = 0
          for (let i = 0; i < DATA.tgg.rusak.length; i++) {
            total += DATA.tgg.rusak[i].jumlah
            totalBerat += DATA.tgg.rusak[i].berat
            wadahTggRusak.append(generateListBalen(DATA.tgg.rusak[i].bentuk, DATA.tgg.rusak[i].jumlah, DATA.tgg.rusak[i].berat))
          }

          wadahTggRusak.append(generateTotalBalen('Total', total, totalBerat))
        }

        if (DATA.tgg.rosok) {
          let total = 0, totalBerat = 0
          for (let i = 0; i < DATA.tgg.rosok.length; i++) {
            total += DATA.tgg.rosok[i].jumlah
            totalBerat += DATA.tgg.rosok[i].berat
            wadahTggRosok.append(generateListBalen(DATA.tgg.rosok[i].bentuk, DATA.tgg.rosok[i].jumlah, DATA.tgg.rosok[i].berat))
          }

          wadahTggRosok.append(generateTotalBalen('Total', total, totalBerat))
        }
      }

      // ----------------- Muda -----------------
      if (DATA.md) {
        if (DATA.md.uripan) {
          let total = 0, totalBerat = 0
          for (let i = 0; i < DATA.md.uripan.length; i++) {
            total += DATA.md.uripan[i].jumlah
            totalBerat += DATA.md.uripan[i].berat
            wadahMdUripan.append(generateListBalen(DATA.md.uripan[i].bentuk, DATA.md.uripan[i].jumlah, DATA.md.uripan[i].berat))
          }

          wadahMdUripan.append(generateTotalBalen('Total', total, totalBerat))
        }

        if (DATA.md.rusak) {
          let total = 0, totalBerat = 0
          for (let i = 0; i < DATA.md.rusak.length; i++) {
            total += DATA.md.rusak[i].jumlah
            totalBerat += DATA.md.rusak[i].berat
            wadahMdRusak.append(generateListBalen(DATA.md.rusak[i].bentuk, DATA.md.rusak[i].jumlah, DATA.md.rusak[i].berat))
          }

          wadahMdRusak.append(generateTotalBalen('Total', total, totalBerat))
        }

        if (DATA.md.rosok) {
          let total = 0, totalBerat = 0
          for (let i = 0; i < DATA.md.rosok.length; i++) {
            total += DATA.md.rosok[i].jumlah
            totalBerat += DATA.md.rosok[i].berat
            wadahMdRosok.append(generateListBalen(DATA.md.rosok[i].bentuk, DATA.md.rosok[i].jumlah, DATA.md.rosok[i].berat))
          }

          wadahMdRosok.append(generateTotalBalen('Total', total, totalBerat))
        }
      }

      // -------------------- Tua ---------------

      if (DATA.tu) {
        if (DATA.tu.uripan) {
          let total = 0, totalBerat = 0
          for (let i = 0; i < DATA.tu.uripan.length; i++) {
            total += DATA.tu.uripan[i].jumlah
            totalBerat += DATA.tu.uripan[i].berat
            wadahTuUripan.append(generateListBalen(DATA.tu.uripan[i].bentuk, DATA.tu.uripan[i].jumlah, DATA.tu.uripan[i].berat))
          }

          wadahTuUripan.append(generateTotalBalen('Total', total, totalBerat))
        }

        if (DATA.tu.rusak) {
          let total = 0, totalBerat = 0
          for (let i = 0; i < DATA.tu.rusak.length; i++) {
            total += DATA.tu.rusak[i].jumlah
            totalBerat += DATA.tu.rusak[i].berat
            wadahTuRusak.append(generateListBalen(DATA.tu.rusak[i].bentuk, DATA.tu.rusak[i].jumlah, DATA.tu.rusak[i].berat))
          }

          wadahTuRusak.append(generateTotalBalen('Total', total, totalBerat))
        }

        if (DATA.tu.rosok) {
          let total = 0, totalBerat = 0
          for (let i = 0; i < DATA.tu.rosok.length; i++) {
            total += DATA.tu.rosok[i].jumlah
            totalBerat += DATA.tu.rosok[i].berat
            wadahTuRosok.append(generateListBalen(DATA.tu.rosok[i].bentuk, DATA.tu.rosok[i].jumlah, DATA.tu.rosok[i].berat))
          }

          wadahTuRosok.append(generateTotalBalen('Total', total, totalBerat))
        }
      }

      loadingBalen.classList.add('hidden')
      wadahBalen.classList.remove('hidden')
    }


    // nyari tanggal iso, penting
    let tanggal = document.getElementById('base-page').dataset.tanggaliso

    $.get("/app/cuma-data/rekap-balen-by-tanggal", { tanggal: tanggal },
      function (data, textStatus, jqXHR) {
        if (data.tgg && data.md && data.tu) {
          DATA = data
          console.log(data)
          tataTempat()
        } else {
          wadahBalen.classList.add('hidden')
          errorBalen.classList.remove('hidden')
        }
      },
      "json"
    ).fail(()=>{
      wadahBalen.classList.add('hidden')
      errorBalen.classList.remove('hidden')
    })
    .always(()=>{
      loadingBalen.classList.add('hidden')
    })


    function generateListBalen(nama, jumlah, berat) {
      const div = document.createElement('div')
      div.classList.add('flex')

      const span1 = document.createElement('span')
      span1.classList.add('flex-1')
      span1.textContent = nama

      const span2 = document.createElement('span')
      span2.classList.add('flex-1', 'flex')

      const sub1 = document.createElement('span')
      sub1.classList.add('flex-1')
      sub1.textContent = jumlah

      const sub2 = document.createElement('span')
      sub2.textContent = `${((berat) ? berat : 0)} gr`

      span2.append(sub1, sub2)

      div.append(span1, span2)
      return div
    }

    function generateTotalBalen(nama, jumlah, berat) {
      const div = document.createElement('div')
      div.classList.add('flex', 'border-t', 'mt-1', 'border-neutral', 'font-semibold')

      const span1 = document.createElement('span')
      span1.classList.add('flex-1')
      span1.textContent = nama

      const span2 = document.createElement('span')
      span2.classList.add('flex-1', 'flex')

      const sub1 = document.createElement('span')
      sub1.classList.add('flex-1')
      sub1.textContent = jumlah

      const sub2 = document.createElement('span')
      let angka = ((berat)? berat:0)
      sub2.textContent = `${angka.toFixed(2)} gr`
      

      span2.append(sub1, sub2)

      div.append(span1, span2)
      return div
    }
  }
})
