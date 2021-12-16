// jangan lupa import app.js dulu

import Swal from "sweetalert2"

$(function () {

  if ($('.base-page').data('pagename') == "restok") {

    // ======================================= Fungsi Append ==============================================

    let tambahItem = function (stok) {
      if (!stok) {
        return
      }
      let stokBaru = JSON.parse(stok)
      let kelompokRaw = JSON.parse(stokBaru.kelompokTerpilih)

      let adaDuplikat = false
      const listItem = document.getElementsByName('stokIdPerhiasan[]')

      for (let [index, input] of listItem.entries()) {
        if (input.value == kelompokRaw.id && document.getElementsByName('stokAsal[]')[index].value == stokBaru.asal) {
          adaDuplikat = true
          let jumlahBaru = numberOnlyParser(document.getElementsByName('stokTambahan[]')[index].value) + numberOnlyParser(stokBaru.stokTambahan)
          document.getElementsByClassName('teksStokTambahan')[index].innerHTML = jumlahBaru
          document.getElementsByName('stokTambahan[]')[index].value = jumlahBaru
          break;
        }
      }
  
      if (adaDuplikat) {
        return
      }

      const htmlAppend = `
          <tr>
              <td>
              <div class="font-semibold">
                ` + kelompokRaw.nama + `
                </div>
                <div class="text-sm opacity-50">
                    `+ kelompokRaw.beratKelompok + ` / ganti kode
                 </div>
                <input type="hidden" name="stokIdPerhiasan[]" value="` + kelompokRaw.id + `"> 
              </td>
              <td>` + kelompokRaw.stok + ` buah
              </td>
              <td><span class='teksStokTambahan'>` + stokBaru.stokTambahan + `</span> buah
              <input type="hidden" name="stokTambahan[]" value="` + stokBaru.stokTambahan + `">
              </td>
              <td>` + stokBaru.asal + `
              <input type="hidden" name="stokAsal[]" value="` + stokBaru.asal + `">
              </td>
              <td class="w-16">
              <button tabindex="0" type="button" class="btn btn-ghost btn-square text-error btn-delete">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
              </button>
              </td>
          </tr>
          `
      $('#wadah-data').append(htmlAppend);

      $('#wadah-data button.btn-delete').on('click', function (e) {
        e.preventDefault()
        $(this).parentsUntil('tbody#wadah-data').remove()
      });
    }

    // ================================================ Swal Tambah Item ======================================

    $('button#pilih-item').on('click', function () {
      Swal.fire({
        title: 'Tambah Item Restok',
        confirmButtonText: 'Tambahkan',
        showCancelButton: true,
        cancelButtonText: 'Batal',
        confirmButtonColor: '#4b6bfb',
        html: printAddStockHTML(),
        willOpen: () => {
          let kadar = document.getElementById('swal-kadar')
          let bentuk = document.getElementById('swal-bentuk')
          let kelompok = document.getElementById('swal-kelompok')

          $.get("/app/barang/cumaData/kadarBentuk", {},
            function (data, textStatus, jqXHR) {
              data.kadar.forEach(element => {
                let opt = document.createElement('option')
                opt.value = element.id
                opt.innerText = element.nama

                kadar.append(opt)
              });

              data.bentuk.forEach(element => {
                let opt = document.createElement('option')
                opt.value = element.id
                opt.innerText = element.bentuk

                bentuk.append(opt)
              });
            },
            "json"
          ).catch((error) => {
            Swal.showValidationMessage('Error dari server: ' + error)
          });

          $('select.swal').on('change', function () {
            Swal.resetValidationMessage()
          });

          kadar.addEventListener('change', getData)
          bentuk.addEventListener('change', getData)

          function getData(event) {
            if (event.type == 'change') {
              if (bentuk.value && bentuk.value != 'kosong' && kadar.value && kadar.value != 'kosong') {

                $.get("/app/barang/cumaData/modelDenganInput", { bentuk: bentuk.value, kadar: kadar.value },
                  function (data, textStatus, jqXHR) {
                    global.removeElementsByClass('opt-kelompok')

                    if (data.length > 0) {
                      data.forEach(element => {
                        let opt = document.createElement('option')
                        opt.classList.add('opt-kelompok')
                        opt.value = JSON.stringify(element)
                        opt.innerText = element.nama

                        kelompok.append(opt)
                      });
                    } else {
                      let opt = document.createElement('option')
                      opt.classList.add('opt-kelompok')
                      opt.value = 'kosong'
                      opt.innerText = 'Kelompok tidak ditemukan'
                      opt.disabled = true
                      opt.selected = true

                      kelompok.append(opt)
                    }
                  },
                  "json"
                ).fail((xhr) => {
                  console.error(xhr.responseJSON)
                  Swal.showValidationMessage('Error dari server: ' + xhr.responseJSON)
                })

              }
            }
          }
        },
        preConfirm: () => {
          let asal = document.querySelector('input[name="swal-asal"]:checked')
          let kadar = document.getElementById('swal-kadar')
          let bentuk = document.getElementById('swal-bentuk')
          let kelompok = document.getElementById('swal-kelompok')
          let stok = document.getElementById('swal-stok')

          if (kadar.value && kadar.value != 'kosong' && bentuk.value && bentuk.value != 'kosong' && kelompok.value && kelompok.value != 'kosong' && stok.value > 0 && stok.value < 100) {
            return {
              asal: asal.value,
              kadar: kadar.value,
              bentuk: bentuk.value,
              stokTambahan: stok.value,
              kelompokTerpilih: kelompok.value
            }
          } else {
            Swal.showValidationMessage(
              'Pilihan anda tidak valid!'
            )
          }

        }
      }).then((hasil) => {
        if (hasil.isConfirmed && hasil.value) {
          tambahItem(JSON.stringify(hasil.value))
        }
      })
    });


    // ================================================= ini observer ============================================
    // Select the node that will be observed for mutations
    const targetNode = document.getElementById('wadah-data');
    const targetChange = document.getElementById('teks-tabel-kosong');
    const btnTambahStok = document.getElementById('btnTambahStok');

    let formTambahStok = document.getElementById('formTambahStok')
    let bisaTambah = false

    // Options for the observer (which mutations to observe)
    const config = {
      attributes: true,
      childList: true,
      subtree: true
    };

    // Callback function to execute when mutations are observed
    const callback = function (mutationsList, observer) {
      // Use traditional 'for loops' for IE 11
      for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
          if (targetNode.childElementCount < 1) {
            targetChange.classList.remove('hidden')
            targetChange.classList.add('block')
            btnTambahStok.disabled = true
            bisaTambah = false
          } else {
            targetChange.classList.remove('block')
            targetChange.classList.add('hidden')
            btnTambahStok.disabled = false
            bisaTambah = true
          }
        }
      }
    };

    // Create an observer instance linked to the callback function
    const observer = new MutationObserver(callback);

    // Start observing the target node for configured mutations
    observer.observe(targetNode, config);


    // ============================================ Ini submit form ===========================================

    formTambahStok.addEventListener('submit', (e) => {
      if (!bisaTambah) e.preventDefault()
    })

    btnTambahStok.addEventListener('click', (e) => {
      Swal.fire({
        title: 'Yakin untuk menambah stok?',
        text: 'Anda akan menambah stok untuk '+ document.getElementsByName('stokIdPerhiasan[]').length +' kelompok perhiasan.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Ya, tambahkan!',
        cancelButtonText: 'Batal',
        didOpen: () => {
          Swal.getCancelButton().focus()
        },
      }).then((result) => {
        if (result.isConfirmed) {
          if (bisaTambah) formTambahStok.submit()
        }
      })
    })

  }


  let printAddStockHTML = function () {

    const htmlAddStock = `
            <div class="w-full px-6 space-y-6 flex flex-col text-left">
                <div class="form-control" x-data="{ radio: 1 }">
                    <label for="">Asal Perhiasan</label>
                    <div class="flex space-x-4 mt-2">
                    <label class="cursor-pointer items-center py-2 flex-1 rounded-box px-4 border"
                        :class="(radio == 1)? 'bg-primary bg-opacity-10 border-primary': 'bg-white border-secondary'">
                        <input type="radio" name="swal-asal" checked="checked" class="radio radio-primary hidden"
                        value="Cucian" @click="radio = 1">
                        <span class="label-text text-base"
                        :class="(radio == 1)? 'text-primary': 'text-secondary'">Cucian</span>
                    </label>
                    <label class="cursor-pointer items-center py-2 flex-1 rounded-box px-4 border"
                        :class="(radio == 2)? 'bg-primary bg-opacity-10 border-primary': 'bg-white border-secondary'">
                        <input type="radio" name="swal-asal" class="radio radio-primary hidden" value="Kulakan"
                        @click="radio = 2">
                        <span class="label-text text-base"
                        :class="(radio == 2)? 'text-primary': 'text-secondary'">Kulakan</span>
                    </label>
                    </div>
                </div>  

                <div class="form-control">
                    <label for="swal-kadar">Kadar Perhiasan</label>
                    <select id="swal-kadar" class="select select-bordered w-full max-w-md swal">
                    <option disabled selected value= "kosong">Pilih kadar perhiasan</option> 
                    </select>
                </div>

                <div class="form-control">
                    <label for="swal-bentuk">Bentuk Perhiasan</label>
                    <select id="swal-bentuk" class="select select-bordered w-full max-w-md swal">
                    <option disabled selected value= "kosong">Pilih bentuk perhiasan</option> 
                    </select>
                </div>

                <div class="form-control">
                    <label for="swal-kelompok">Kelompok Perhiasan</label>
                    <select id="swal-kelompok" class="select select-bordered w-full max-w-md swal">
                    </select>
                </div>

                <div class="flex pt-4 justify-center" x-data="{ counter: 1 }">
                    <div class="bg-base-300 rounded-box px-4 flex">
                    <button class="btn btn-ghost text-error" @click="(counter-1 < $refs.angka.min)? $refs.angka.min : counter--">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
                        </svg>
                    </button>
                    <input type="number" id="swal-stok" class="input input-ghost rounded-none text-2xl text-center w-16 focus:ring-0" x-model="counter" x-ref="angka" readonly min="1" max="99" value="1">
                    <button class="btn btn-ghost text-success" @click="(counter+1 > $refs.angka.max)? $refs.angka.min : counter++">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                        </svg>
                    </button>
                    </div>
                </div>
                
            </div>
        `
    return htmlAddStock
  }
})
