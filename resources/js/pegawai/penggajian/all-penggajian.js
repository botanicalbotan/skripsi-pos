// import Swal from "sweetalert2"
import Swal from "sweetalert2/dist/sweetalert2"

import {
  SwalCustomColor
} from '../../fungsi.js'


$(function () {
  const basePage = document.getElementById('base-page').dataset.pagename
  // ========================================= list ==========================================================
  if (basePage == "list") {

    const BASEURL = window.location.pathname
    const qsParam = new URLSearchParams(window.location.search)
    const pencarian = document.querySelector('input#pencarian')
    const hapuscari = document.getElementById('hapusPencarian')
    const btAturTabel = document.getElementById('btAturTabel')

    let ob = 0,
      aob = 0,
      fs = 0
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
      if (qsParam.get('cari') === null || pencarian.value === '') {
        qsParam.delete('cari')
      }

      updateKeyQs('ob', ob)
      updateKeyQs('aob', aob)
      updateKeyQs('fs', fs)

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
                            <option value="0">Jatuh Tempo Penggajian</option>
                            <option value="1">Nama Pegawai</option>
                            <option value="2">Jabatan Pegawai</option>
                            <option value="3">Nominal Gaji</option>
                            <option value="4">Status</option>
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
                      <label for="">Status Penggajian</label>
                      <div class="flex space-x-4 mt-2">
                      <label class="cursor-pointer items-center py-2 flex-1 rounded-box px-4 border"
                          :class="(radio == 1)? 'bg-primary bg-opacity-10 border-primary': 'bg-white border-secondary'">
                          <input type="radio" name="swal-filterShow" ` + ((fs == 0) ? 'checked=checked' : '') + ` class="radio radio-primary hidden"
                          value="0" @click="radio = 1">
                          <span class="label-text text-base"
                          :class="(radio == 1)? 'text-primary': 'text-secondary'">Belum Dibayar</span>
                      </label>
                      <label class="cursor-pointer items-center py-2 flex-1 rounded-box px-4 border"
                          :class="(radio == 2)? 'bg-primary bg-opacity-10 border-primary': 'bg-white border-secondary'">
                          <input type="radio" name="swal-filterShow" ` + ((fs == 1) ? 'checked=checked' : '') + ` class="radio radio-primary hidden" value="1"
                          @click="radio = 2">
                          <span class="label-text text-base"
                          :class="(radio == 2)? 'text-primary': 'text-secondary'">Semua</span>
                      </label>
                      </div>
                  </div>

                </div>
              `
      return htmlAddStock
    }

    // ------------------- refresh -----------------------
    const btPerbaruiData = document.getElementById('btPerbaruiData')

    btPerbaruiData.addEventListener('click', (e) => {
      Swal.fire({
        title: 'Memindai Jadwal Gajian...',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        scrollbarPadding: false,
        didOpen: () => {
          Swal.showLoading()

          setTimeout(() => {
            $.get("/app/pegawai/penggajian/refresh", {},
              function (data, textStatus, jqXH54R) {

                triggerSwalPenggajianSukses(data.jumlah)
                Swal.hideLoading()

              },
              "json"
            ).catch((xhr) => {
              Swal.fire({
                icon: 'error',
                title: 'Terdapat error dari server!',
                scrollbarPadding: false,
                text: xhr.statusText,
                confirmButtonText: 'Tutup'
              })
            })
          }, 1000)


        }
      })
    })


    let triggerSwalPenggajianSukses = function (param) {
      Swal.fire({
          icon: 'info',
          title: param + ' tagihan baru ditambahkan',
          text: 'Tutup pop-up ini untuk memperbarui daftar pegawai',
          timer: 5000,
          scrollbarPadding: false,
          confirmButtonText: 'Tutup'
        })
        .then(() => {
          window.location = BASEURL
        })
    }
  }


  // ========================================= detail ==========================================================
  if (basePage == "detail") {
    let btBayar = document.getElementById('btBayar')
    let judul = document.getElementById('judulTagihan')
    let nominal = document.getElementById('nominalGaji')

    // harus di cek dulu, kadang ngga ada
    if (btBayar) {
      btBayar.addEventListener('click', () => {
        Swal.fire({
          title: 'Bayar Tagihan?',
          html: "Anda akan membayar tagihan <b>'" + judul.textContent + "'</b> sejumlah <b>" + nominal.textContent + ".</b> Lanjutkan proses pembayaran?",
          icon: 'info',
          showCancelButton: true,
          allowOutsideClick: false,
          allowEscapeKey: false,
          scrollbarPadding: false,
          confirmButtonColor: SwalCustomColor.button.confirm,
          confirmButtonText: 'Ya, bayar!',
          cancelButtonText: 'Batal',
          focusCancel: true,
          preConfirm: () => {

            Swal.showLoading(Swal.getConfirmButton())
            return new Promise(function (resolve, reject) {
              setTimeout(function () {
                Swal.hideLoading()
                reject('Tidak ada respon dari server')
              }, 10000)

              $.ajaxSetup({
                headers: {
                  'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                }
              });

              $.post(location.pathname + '/pembayaran', {},
                function (data) {
                  resolve()
                },
                "json"
              ).fail((xhr) => {
                reject(xhr.responseText)
              })


            }).catch((error) => {
              Swal.hideLoading()
              Swal.showValidationMessage('Error: ' + error)
            })
          }
        }).then((result) => {
          if (result.isConfirmed) {
            Swal.fire(
              'Pembayaran Berhasil!',
              'Pastikan anda mengambil uang dari toko sesuai dengan nominal yang tertera pada tagihan.',
              'success'
            ).then(() => {
              location.href = location.pathname
            })
          }
        })
      })
    }

    const btBatalBayar = document.getElementById('btBatalBayar')

    if (btBatalBayar) {
      btBatalBayar.addEventListener('click', () => {
        Swal.fire({
          title: 'Yakin untuk membatalkan pembayaran?',
          html: 'Anda akan membatalkan pembayaran tagihan <b>"' + judul.textContent + '"</b>. Pembatalan akan dicatat sebagai kas masuk, dan status tagihan kembali berubah menjadi <b>"menunggu pembayaran"</b>',
          icon: 'question',
          iconColor: SwalCustomColor.icon.error,
          showCancelButton: true,
          confirmButtonText: 'Ya, batalkan pembayaran!',
          cancelButtonText: 'Batal',
          scrollbarPadding: false,
          focusCancel: true,
          confirmButtonColor: SwalCustomColor.button.deny,
          preConfirm: () => {

            Swal.showLoading(Swal.getConfirmButton())
            return new Promise(function (resolve, reject) {
              setTimeout(function () {
                Swal.hideLoading()
                reject('Tidak ada respon dari server')
              }, 10000)

              $.ajaxSetup({
                headers: {
                  'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                }
              });

              $.post(location.pathname + '/batal', {},
                function (data) {
                  resolve()
                },
                "json"
              ).fail((xhr) => {
                reject(xhr.responseText)
              })


            }).catch((error) => {
              Swal.hideLoading()
              Swal.showValidationMessage('Error: ' + error)
            })
          }
        }).then((result) => {
          if (result.isConfirmed) {
            Swal.fire(
              'Pembatalan Berhasil!',
              'Pastikan anda mengembalikan uang ke toko sesuai dengan nominal yang tertera pada tagihan.',
              'success'
            ).then(() => {
              location.href = location.pathname
            })
          }
        })
      })
    }


    const btHapusTagihan = document.getElementById('btHapusTagihan')
    const formHapusTagihan = document.getElementById('formHapusTagihan')

    if (btHapusTagihan) {
      btHapusTagihan.addEventListener('click', () => {
        formHapusTagihan.action = window.location.pathname + '?_method=DELETE'

        Swal.fire({
          title: 'Yakin untuk menghapus?',
          text: 'Anda akan menghapus tagihan "' + judul.textContent + '", dan tagihan yang dihapus tidak dapat dibayar kembali.',
          icon: 'info',
          iconColor: SwalCustomColor.icon.error,
          showCancelButton: true,
          confirmButtonText: 'Ya, hapus!',
          scrollbarPadding: false,
          cancelButtonText: 'Batal',
          confirmButtonColor: SwalCustomColor.button.deny,
          focusCancel: true
        }).then((result) => {
          if (result.isConfirmed) formHapusTagihan.submit()
        })
      })
    }


  }
})
