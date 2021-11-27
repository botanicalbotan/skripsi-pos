// jangan lupa import app.js dulu

import Swal from "sweetalert2"

$(function () {

  // ini nanti masih diisi data loh ya, gacuma append doang
  // disambungin ke swalnya

  // perlu di sanitize lagi pake ngecek ke variabel?
  let tambahItem = function (stok) {
    if (typeof stok == undefined) {
      return
    }
    let stokBaru = JSON.parse(stok)

    // ntar perhiasanStok isinya json string dari server
    const htmlAppend = `
          <tr>
              <td>
              <div class="font-semibold">
                ` + stokBaru.perhiasan + `
                </div>
                <div class="text-sm opacity-50">
                    #kodemungkin
                 </div>
                <input type="hidden" name="perhiasanStok[]" value="` + stokBaru.perhiasan + `"> 
              </td>
              <td>` + stokBaru.stokAsli + ` buah
              <input type="hidden" name="awalStok[]" value="` + stokBaru.stokAsli + `">
              </td>
              <td>` + stokBaru.stokTambahan + ` buah
              <input type="hidden" name="tambahanStok[]" value="` + stokBaru.stokTambahan + `">
              </td>
              <td>` + capsFirstWord(stokBaru.asal) + `
              <input type="hidden" name="awalStok[]" value="` + stokBaru.asal + `">
              </td>
              <td class="w-16">
              <button tabindex="0" class="btn btn-ghost text-error btn-delete">
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

  $('button#pilih-item').on('click', function () {
    Swal.fire({
      title: 'Tambah Item Restok',
      confirmButtonText: 'Tambahkan',
      showCancelButton: true,
      cancelButtonText: 'Batal',
      confirmButtonColor: '#4b6bfb',
      html: printAddStockHTML(),
      willOpen: () => {
        $('select.swal').on('change', function () {
          Swal.resetValidationMessage()
        });
      },
      preConfirm: () => {
        let asal = document.querySelector('input[name="swal-asal"]:checked')
        let kadar = document.getElementById('swal-kadar')
        let bentuk = document.getElementById('swal-bentuk')
        let tersedia = document.getElementById('swal-tersedia')
        let stok = document.getElementById('swal-stok')

        // kalo dirasa kurang aman, ntar diganti jadi teks panjangnya
        // ntar ini pake promise ngambil data stok dulu lewat ajax, kalo ga ketemu, lempar error + tersedia perhiasan jadi default lagi
        if (kadar.value == kadar[0].value || bentuk.value == bentuk[0].value || tersedia.value == tersedia[0].value || stok.value < 1 || stok.value > 99) {
          Swal.showValidationMessage(
            'Pilihan tidak valid!'
          )
        } else {
          return {
            'asal': asal.value,
            'kadar': kadar.value,
            'bentuk': bentuk.value,
            'perhiasan': tersedia.value,
            'stokTambahan': stok.value,
            'stokAsli': 20
          }
        }
      }
    }).then((hasil) => {
      if (hasil.isConfirmed && hasil.value) {
        tambahItem(JSON.stringify(hasil.value))
      }
    })
  });

  $('#wadah-data').on('empty', function () {
    alert('kosong')
  });

  if ($('.base-page').data('pagename') == "restok") {
    // ================================================= ini observer ============================================
    // Select the node that will be observed for mutations
    const targetNode = document.getElementById('wadah-data');
    const targetChange = $('#teks-tabel-kosong');
    const btnTambahStok = $('button#tambah-stok');

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
            targetChange.removeClass('hidden').addClass('block')
            btnTambahStok.prop('disabled', true)
          } else {
            targetChange.removeClass('block').addClass('hidden')
            btnTambahStok.prop('disabled', false)
          }
        }
      }
    };

    // Create an observer instance linked to the callback function
    const observer = new MutationObserver(callback);

    // Start observing the target node for configured mutations
    observer.observe(targetNode, config);

  }

  // opsi 1, ntar select2nya diambil dari database ga statis kek gini
  // datanya ntar di stringify masukin ke yang terakhir

  // bikin domnya dulu, trus di willLoad, load pake promise biar nongol loading
  let printAddStockHTML = function () {

    const htmlAddStock = `
            <div class="w-full px-6 space-y-6 flex flex-col text-left">
                <div class="form-control" x-data="{ radio: 1 }">
                    <label for="">Asal Perhiasan</label>
                    <div class="flex space-x-4 mt-2">
                    <label class="cursor-pointer items-center py-2 flex-1 rounded-box px-4 border"
                        :class="(radio == 1)? 'bg-primary bg-opacity-10 border-primary': 'bg-white border-secondary'">
                        <input type="radio" x-ref="kulakan" name="swal-asal" checked="checked" class="radio radio-primary hidden"
                        value="cucian" @click="radio = 1">
                        <span class="label-text text-base"
                        :class="(radio == 1)? 'text-primary': 'text-secondary'">Cucian</span>
                    </label>
                    <label class="cursor-pointer items-center py-2 flex-1 rounded-box px-4 border"
                        :class="(radio == 2)? 'bg-primary bg-opacity-10 border-primary': 'bg-white border-secondary'">
                        <input type="radio" x-ref="cucian" name="swal-asal" class="radio radio-primary hidden" value="kulakan"
                        @click="radio = 2">
                        <span class="label-text text-base"
                        :class="(radio == 2)? 'text-primary': 'text-secondary'">Kulakan</span>
                    </label>
                    </div>
                </div>  

                <div class="form-control">
                    <label for="swal-kadar">Kadar Perhiasan</label>
                    <select id="swal-kadar" class="select select-bordered w-full max-w-md swal">
                    <option disabled="" selected="">Pilih kadar perhiasan</option> 
                    <option value="tanggung">Tanggung</option> 
                    <option value="muda">Muda</option> 
                    <option value="tua">Tua</option>
                    </select>
                </div>

                <div class="form-control">
                    <label for="swal-bentuk">Bentuk Perhiasan</label>
                    <select id="swal-bentuk" class="select select-bordered w-full max-w-md swal">
                    <option disabled="" selected="">Pilih bentuk perhiasan</option> 
                    <option value="kalung">Kalung</option> 
                    <option value="gelang">Gelang</option> 
                    <option value="cincin">Cincin</option>
                    <option value="anting">Anting</option> 
                    <option value="tindik">Tindik</option> 
                    <option value="liontin">Liontin</option>
                    </select>
                </div>

                <div class="form-control">
                    <label for="swal-tersedia">Perhiasan Tersedia</label>
                    <select id="swal-tersedia" class="select select-bordered w-full max-w-md swal">
                    <option disabled="" selected="">Pilih perhiasan yang tersedia pada sistem</option> 
                    <option value="Anting Tanggung 3 Gram">Anting Tanggung 3 Gram</option> 
                    <option value="Anting Tanggung 4 Gram">Anting Tanggung 4 Gram</option> 
                    <option value="Anting Tanggung 6 Gram">Anting Tanggung 6 Gram</option>
                    <option value="Anting Tanggung 8 Gram">Anting Tanggung 8 Gram</option> 
                    <option value="Anting Tanggung 10 Gram">Anting Tanggung 10 Gram</option> 
                    <option value="Anting Tanggung 16 Gram">Anting Tanggung 16 Gram</option>
                    <option value="Anting Tanggung 17 Gram">Anting Tanggung 17 Gram</option> 
                    <option value="Anting Tanggung 18 Gram">Anting Tanggung 18 Gram</option> 
                    <option value="Anting Tanggung 20 Gram">Anting Tanggung 20 Gram</option>
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


  // opsi 2 pake ngeappend di rownya

})
