// Selalu panggil file satuan gini abis manggil app.js biar ngga redundant

// import Cropper from "cropperjs";
import Swal from "sweetalert2";

global.banding = function (tanggal) {
  return capsFirstWord(moment(tanggal, 'YYYY-MM-DD').fromNow())
}

// doc ready
$(function () {
  // ========================================= list ==========================================================

  if ($('.base-page').data('pagename') == "list") {
    const BASEURL = window.location.pathname
    const qsParam = new URLSearchParams(window.location.search)
    const pencarian = document.querySelector('input#pencarian')
    const hapuscari = document.getElementById('hapusPencarian')
    const btAturTabel = document.getElementById('btAturTabel')

    let ob = 0, aob = 0, fs = 0
    if (qsParam.has('ob')) {
      if(['0', '1', '2', '3', '4', '5'].includes(qsParam.get('ob'))){
        ob = qsParam.get('ob')
      }
    }

    if (qsParam.has('aob')) {
      if(['0', '1'].includes(qsParam.get('aob'))){
        aob = qsParam.get('aob')
      }
    }

    if (qsParam.has('fs')) {
      if(['0', '1'].includes(qsParam.get('fs'))){
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
        confirmButtonColor: '#4b6bfb',
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
      .then((resolve)=>{
        if(resolve.isConfirmed){
          ob = resolve.value.ob
          aob = resolve.value.aob
          fs = resolve.value.fs
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
                            <option value="0">Nama</option>
                            <option value="1">Jabatan</option> 
                            <option value="2">Gender</option> 
                            <option value="3">Tanggal Gajian</option>
                            <option value="4">Gaji Bulanan</option>W
                            <option value="5">Status</option>
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

                    <div class="form-control" x-data="{ radio: `+ ((fs == 1)? 2:1) +` }">
                      <label for="">Data Karyawan yang Ditampilkan</label>
                      <div class="flex space-x-4 mt-2">
                      <label class="cursor-pointer items-center py-2 flex-1 rounded-box px-4 border"
                          :class="(radio == 1)? 'bg-primary bg-opacity-10 border-primary': 'bg-white border-secondary'">
                          <input type="radio" name="swal-filterShow" `+ ((fs == 0)? 'checked=checked':'') +` class="radio radio-primary hidden"
                          value="0" @click="radio = 1">
                          <span class="label-text text-base"
                          :class="(radio == 1)? 'text-primary': 'text-secondary'">Karyawan Aktif</span>
                      </label>
                      <label class="cursor-pointer items-center py-2 flex-1 rounded-box px-4 border"
                          :class="(radio == 2)? 'bg-primary bg-opacity-10 border-primary': 'bg-white border-secondary'">
                          <input type="radio" name="swal-filterShow" `+ ((fs == 1)? 'checked=checked':'') +` class="radio radio-primary hidden" value="1"
                          @click="radio = 2">
                          <span class="label-text text-base"
                          :class="(radio == 2)? 'text-primary': 'text-secondary'">Semua Karyawan</span>
                      </label>
                      </div>
                  </div>
                      
                </div>
              `
      return htmlAddStock
    }

  }


  // ========================================= detail ==========================================================
  if ($('.base-page').data('pagename') == "detail") {
    $('a#ubahStatus').on('click', function () {
      console.log(location.pathname.replace('/app/pegawai/', ''))
      console.log($(this).attr('data-statussekarang'))

      const status = ($(this).attr('data-statussekarang') == 0) ? 0 : 1
      const defineModal = [
        {
          title: 'Aktifkan pegawai?',
          text: "Dengan mengaktifkan pegawai, pegawai tersebut akan kembali mendapat akses ke sistem ini",
          targetStatus: 1,
          confirmButton: 'Ya, aktifkan!',
          confirmButtonColor: '#41BE88'
        },
        {
          title: 'Nonaktifkan pegawai?',
          text: "Dengan menonaktifkan pegawai, pegawai tersebut akan kehilangan akses ke sistem ini",
          targetStatus: 0,
          confirmButton: 'Ya, nonaktifkan!',
          confirmButtonColor: '#Dc3741'
        },
      ]

      Swal.fire({
        title: defineModal[status].title,
        text: defineModal[status].text,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: defineModal[status].confirmButtonColor,
        confirmButtonText: defineModal[status].confirmButton,
        cancelButtonText: 'Batal',
        didOpen: ()=>{
          Swal.getCancelButton().focus()
        },
        preConfirm: () => {

          Swal.showLoading(Swal.getConfirmButton())
          return new Promise(function (resolve, reject) {
            setTimeout(function () {
              Swal.hideLoading()
              reject('Tidak ada respon dari server')
            }, 5000)

            $.ajaxSetup({
              headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
              }
            });
  
            $.ajax({
              type: "PUT",
              url: location.pathname + '/status',
              data: { target: defineModal[status].targetStatus },
              dataType: "json",
              success: function () {
                resolve()
              },
              error: function (xhr) {
                reject(xhr.responseJSON.error)
              }
            });
          }).catch(function (error) {
            Swal.hideLoading()
            Swal.showValidationMessage('Error: ' + error)
          })
        }
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire(
            'Sukses!',
            'Pegawai berhasil ' + ((status == 0)? 'diaktifkan.': 'dinonaktifkan.'),
            'success'
          ).then(() => {
            location.href = location.pathname
          })
        }
      })
    });
  }

});
