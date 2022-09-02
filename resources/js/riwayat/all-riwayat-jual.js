// import Swal from "sweetalert2"
import Swal from "sweetalert2/dist/sweetalert2"

const BASEURL = window.location.pathname
const qsParam = new URLSearchParams(window.location.search)
const pencarian = document.querySelector('input#pencarian')
const hapuscari = document.getElementById('hapusPencarian')
const btAturTabel = document.getElementById('btAturTabel')

let ob = 0,
  aob = 1,
  fk = ''
if (qsParam.has('ob')) {
  if (['0', '1', '2', '3', '4', '5'].includes(qsParam.get('ob'))) {
    ob = qsParam.get('ob')
  }
}

if (qsParam.has('aob')) {
  if (['0', '1'].includes(qsParam.get('aob'))) {
    aob = qsParam.get('aob')
  }
}

if (qsParam.has('fk')) {
  fk = qsParam.get('fk')
}

function persiapanKirim() {
  if (qsParam.get('cari') === null || pencarian.value === '') {
    qsParam.delete('cari')
  }

  if (qsParam.get('fk') === null) {
    qsParam.delete('fk')
  }

  updateKeyQs('ob', ob)
  updateKeyQs('aob', aob)
  updateKeyQs('fk', fk)

  qsParam.delete('page')
  window.location = BASEURL + '?' + qsParam.toString()
}

let updateKeyQs = function (key, value) {
  if (qsParam.has(key)) {
    qsParam.set(key, value)
  } else {
    qsParam.append(key, value)
  }
}

const basePage = document.getElementById('base-page').dataset.pagename

// buat list sekarang, sama list pas ngeklik tanggal
if (basePage === 'list') {
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
        confirmButtonColor: '#4b6bfb',
        scrollbarPadding: false,
        html: printAturTabelHTML(),
        willOpen: () => {
          Swal.getHtmlContainer().querySelector('#swal-ob').value = ob

          const fkSel = Swal.getHtmlContainer().querySelector('#swal-fk')
          $.get("/app/cuma-data/kadar-simpel", {},
            function (data, textStatus, jqXHR) {
              data.forEach(element => {
                let opt = document.createElement('option')
                opt.value = element.nama.toLowerCase()
                opt.innerText = element.nama

                if (fk === element.nama.toLowerCase()) opt.selected = true

                fkSel.append(opt)
              })
            },
            "json"
          );

        },
        preConfirm: () => {
          return {
            ob: Swal.getHtmlContainer().querySelector('#swal-ob').value,
            aob: Swal.getHtmlContainer().querySelector('input[name="swal-arahOb"]:checked').value,
            fk: Swal.getHtmlContainer().querySelector('#swal-fk').value,
          }
        }
      })
      .then((resolve) => {
        if (resolve.isConfirmed) {
          ob = resolve.value.ob
          aob = resolve.value.aob
          fk = resolve.value.fk
          persiapanKirim()
        }
      })
  })

  let printAturTabelHTML = function () {
    const htmlAddStock = `
                  <div class="w-full px-6 space-y-6 flex flex-col text-left" >

                    <div class="form-control">
                        <label for="swal-ob">Urutkan Tabel Berdasarkan</label>
                        <select id="swal-ob" class="select select-bordered w-full max-w-md swal mt-2">
                            <option value="0">Tanggal & Waktu</option>
                            <option value="1">Nama Barang</option>
                            <option value="2">Bentuk Perhiasan</option>
                            <option value="3">Kadar perhiasan</option>
                            <option value="4">Berat Barang</option>
                            <option value="5">Harga Jual</option>
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

                    <div class="form-control">
                        <label for="swal-fk">Kadar Perhiasan</label>
                        <select id="swal-fk" class="select select-bordered w-full max-w-md swal mt-2">
                            <option value="semua">Semua</option>
                        </select>
                    </div>

                </div>
              `
    return htmlAddStock
  }

}

if (basePage === 'list-tanggal') {
  btAturTabel.addEventListener('click', (e) => {
    Swal.fire({
        title: 'Atur Tabel',
        confirmButtonText: 'Terapkan',
        showCancelButton: true,
        cancelButtonText: 'Batal',
        confirmButtonColor: '#4b6bfb',
        scrollbarPadding: false,
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

  let printAturTabelHTML = function () {

    const htmlAddStock = `
                  <div class="w-full px-6 space-y-6 flex flex-col text-left" >

                    <div class="form-control">
                        <label for="swal-ob">Urutkan Tabel Berdasarkan</label>
                        <select id="swal-ob" class="select select-bordered w-full max-w-md swal mt-2">
                            <option value="0">Tanggal & Pasaran</option>
                            <option value="1">Jumlah Transaksi</option>
                            <option value="2">Total Berat Terjual</option>
                            <option value="3">Total Nominal Penjualan</option>
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
