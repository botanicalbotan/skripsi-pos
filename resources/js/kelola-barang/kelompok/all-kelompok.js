import Swal from "sweetalert2"

$(function () {
  // ============================================= list =====================================================
  if ($('.base-page').data('pagename') == "list") {
    const BASEURL = window.location.pathname
    const qsParam = new URLSearchParams(window.location.search)
    const pencarian = document.querySelector('input#pencariana')
    const hapuscari = document.getElementById('hapusPencarian')
    const btAturTabel = document.getElementById('btAturTabel')

    let ob = 0, aob = 0
    if (qsParam.has('ob')) {
      if(['0', '1', '2', '3', '4'].includes(qsParam.get('ob'))){
        ob = qsParam.get('ob')
      }
    }

    if (qsParam.has('aob')) {
      if(['0', '1'].includes(qsParam.get('aob'))){
        aob = qsParam.get('aob')
      }
    }

    const filterTersedia = document.getElementById('filterTersedia')
    const filterHampir = document.getElementById('filterHampir')
    const filterHabis = document.getElementById('filterHabis')

    function persiapanKirim() {
      if (qsParam.get('cari') === null || pencarian.value === '') {
        qsParam.delete('cari')
      }

      if (qsParam.get('filter') === null) {
        qsParam.delete('filter')
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


    filterTersedia.addEventListener('click', function () {
      updateKeyQs('filter', 1)
      persiapanKirim()
    })

    filterHampir.addEventListener('click', function () {
      updateKeyQs('filter', 2)
      persiapanKirim()
    })

    filterHabis.addEventListener('click', function () {
      updateKeyQs('filter', 3)
      persiapanKirim()
    })

    btAturTabel.addEventListener('click', (e) => {
      Swal.fire({
        title: 'Atur Tabel',
        confirmButtonText: 'Terapkan',
        showCancelButton: true,
        cancelButtonText: 'Batal',
        confirmButtonColor: '#4b6bfb',
        html: printAturTabelHTML(),
        willOpen: () => {
          Swal.getHtmlContainer().querySelector('#swal-ob').value = ob
        },
        preConfirm: () => {
          return {
            ob: Swal.getHtmlContainer().querySelector('#swal-ob').value,
            aob: Swal.getHtmlContainer().querySelector('input[name="swal-arahOb"]:checked').value
          }
        }
      })
      .then((resolve)=>{
        if(resolve.isConfirmed){
          ob = resolve.value.ob
          aob = resolve.value.aob
          persiapanKirim()
        }
      })
    })

    let updateKeyQs = function(key, value){
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
                            <option value="0">Kelompok Perhiasan</option> 
                            <option value="1">Berat Kelompok</option> 
                            <option value="2">Kadar Perhiasan</option>
                            <option value="3">Bentuk Perhiasan</option>W
                            <option value="4">Stok</option>
                        </select>
                        <div class="flex space-x-4 mt-2" x-data="{ radio: `+ ((aob == 1)? 2:1) +` }">
                            <label class="cursor-pointer items-center py-2 flex-1 rounded-box px-4 border"
                                :class="(radio == 1)? 'bg-primary bg-opacity-10 border-primary': 'bg-white border-secondary'">
                                <input type="radio" name="swal-arahOb" `+ ((aob == 0)? 'checked=checked':'') +` class="radio radio-primary hidden"
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
                                <input type="radio" name="swal-arahOb" `+ ((aob == 1)? 'checked=checked':'') +` class="radio radio-primary hidden" value="1"
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

  // ============================================= form =====================================================
  if ($('.base-page').data('pagename') == "form") {
    const formKelompok = document.querySelector('form#formKelompok')
    const kadar = document.querySelector('select[name="kadar"]')
    let eventKadar = false
    const bentuk = document.querySelector('select[name="bentuk"]')
    let eventBentuk = false
    const berat = document.querySelector('input[name="beratKelompok"]')
    let eventBerat = false

    formKelompok.addEventListener('submit', function (e) {
      let errorMsg = document.createElement('p')
      errorMsg.classList.add('text-error', 'pesanerror')

      if (kadar.value === 'kosong') {
        e.preventDefault()
        kadar.classList.add('ring', 'ring-error')
        errorMsg.innerText = 'Pilih salah satu kadar!'
        if (document.getElementsByClassName('pesanerror').length == 0) kadar.after(errorMsg)
        kadar.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "nearest"
        });

        if (!eventKadar) {
          kadar.addEventListener('change', function () {
            if (kadar.value && kadar.value !== 'kosong') {
              kadar.classList.remove('ring', 'ring-error')
              global.removeElementsByClass('pesanerror')
            }
          })
          eventKadar = true
        }

      } else if (bentuk.value === 'kosong') {
        e.preventDefault()
        bentuk.classList.add('ring', 'ring-error')
        errorMsg.innerText = 'Pilih salah satu bentuk perhiasan!'
        if (document.getElementsByClassName('pesanerror').length == 0) bentuk.after(errorMsg)
        bentuk.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "nearest"
        });

        if (!eventBentuk) {
          bentuk.addEventListener('change', function () {
            if (bentuk.value && bentuk.value !== 'kosong') {
              bentuk.classList.remove('ring', 'ring-error')
              global.removeElementsByClass('pesanerror')
            }
          })
          eventBentuk = true
        }
      } else if (berat.value == 0) {
        e.preventDefault()
        berat.classList.add('ring', 'ring-error')
        errorMsg.innerText = 'Berat kelompok tidak boleh 0!'
        if (document.getElementsByClassName('pesanerror').length == 0) berat.after(errorMsg)
        berat.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "nearest"
        });

        if (!eventBerat) {
          berat.addEventListener('change', function () {
            if (berat.value != 0) {
              berat.classList.remove('ring', 'ring-error')
              global.removeElementsByClass('pesanerror')
            }
          })
          eventBerat = true
        }
      }

    })
  }


})