// import Swal from "sweetalert2"
import Swal from "sweetalert2/dist/sweetalert2"

import { SwalCustomColor } from '../fungsi.js'

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
      aob = 0
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
                            <option value="0">Tanggal & Waktu</option>
                            <option value="1">Nominal</option>
                            <option value="2">Perihal</option>
                            <option value="3">Tipe Kas</option>
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

  // ========================================== form ===========================================
  if (basePage == "form") {
    const formKas = document.getElementById('formKas')
    const submitKas = document.getElementById('submitKas')

    submitKas.addEventListener('click', (e) => {

      if (!formKas.reportValidity()) return

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
      }).then((result)=>{
        if(result.isConfirmed){
          formKas.action = '/app/kas'
          formKas.submit()
        }
      })

    })

    formKas.addEventListener('submit', (e) => {
      if(!formKas.reportValidity()) e.preventDefault()
    })

  }


  // ========================================== detail ===========================================
  if (basePage == "detail") {
    const BASEURL = window.location.pathname
    const namaKas = document.getElementById('namaKas')

    const formKas = document.getElementById('formKas')
    const hapusKas = document.getElementById('hapusKas')

    if(formKas && hapusKas){
      hapusKas.addEventListener('click', (e) => {
        Swal.fire({
          title: 'Yakin untuk menghapus?',
          text: 'Anda akan menghapus kas "'+ namaKas.innerText +'", dan kas yang dihapus tidak dapat dikembalikan.',
          icon: 'question',
          iconColor: SwalCustomColor.icon.error,
          showCancelButton: true,
          confirmButtonText: 'Ya, hapus!',
          cancelButtonText: 'Batal',
          scrollbarPadding: false,
          focusCancel: true,
          confirmButtonColor: SwalCustomColor.button.deny,
        }).then((result)=>{
          if(result.isConfirmed){
            formKas.action = BASEURL + '?_method=DELETE'
            formKas.submit()
          }
        })

      })
    }

  }


  // ========================================== edit ===========================================
  if (basePage == "edit") {
    const BASEURL = window.location.pathname

    const formKas = document.getElementById('formKas')
    const editKas = document.getElementById('editKas')

    editKas.addEventListener('click', (e) => {

      if (!formKas.reportValidity()) return

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
      }).then((result)=>{
        if(result.isConfirmed){
          formKas.action = BASEURL.slice(0, -5) + '?_method=PUT'
          formKas.submit()
        }
      })
    })

    formKas.addEventListener('submit', (e) => {
      if(!formKas.reportValidity()) e.preventDefault()
    })

  }

})
