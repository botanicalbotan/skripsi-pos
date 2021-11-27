import Swal from "sweetalert2"

$(function () {
  // code here

  $('a#pembukuan-baru').on('click', function () {
    Swal.fire({
      title: 'Pembukuan Baru',
      confirmButtonText: 'Simpan',
      showCancelButton: true,
      cancelButtonText: 'Batal',
      confirmButtonColor: '#4b6bfb',
      html: printTambahPembukuanHTML(),
      willOpen: () => {
        // Kalo jadi make tanggal sama nama pencatat, load disini
      },
      preConfirm: () => {
        let tipe = Swal.getHtmlContainer().querySelector('input[name=swal-arahsort]:checked')
        let nominal = Swal.getHtmlContainer().querySelector('input#swal-nominal')
        let perihal = Swal.getHtmlContainer().querySelector('textarea#swal-perihal')

        if (!['masuk', 'keluar'].includes(tipe.value)) {
          return Swal.showValidationMessage('Input tipe pembukuan tidak valid.')
        }

        if (!nominal.value || nominal.value == 0) {
          return Swal.showValidationMessage('Nominal tidak boleh 0')
        }

        if (!perihal.value || perihal.value === '') {
          return Swal.showValidationMessage('Perihal tidak boleh kosong')
        }

        let nominalRiil = numberOnlyParser(nominal.value)
        if (tipe.value === 'keluar') {
          nominalRiil *= -1
        }

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
          
          $.post("/app/test/dump", {
              tipe: tipe.value,
              nominal: nominalRiil,
              perihal: perihal.value
            },
            function (data, textStatus, jqXHR) {
              resolve(data)
            },
            "json"
          ).fail(function (xhr) {
            Swal.hideLoading()
            reject(xhr.responseJSON.error)
          });
        }).catch(function (error) {
          Swal.showValidationMessage('Error dari server: ' + error)
        })
      }
    }).then(function (hasilSwal) {
      if (hasilSwal.isConfirmed) {
        Swal.fire({
          title: 'Data Tersimpan',
          icon: 'success',
          confirmButtonText: 'Tutup',
          confirmButtonColor: '#4b6bfb'
        })
      }
    })
  });

  $('button#aturTabel').on('click', function () {
    //   Kemungkinan ini bakal jadi standar
    Swal.fire({
      title: 'Atur Tabel Pembukuan',
      confirmButtonText: 'Terapkan',
      showCancelButton: true,
      cancelButtonText: 'Batal',
      confirmButtonColor: '#4b6bfb',
      html: printAturTabelHTML(),
      willOpen: () => {
        // Ambil data sort yang ada di query string URL. kalo gaada berarti default 
      },
      preConfirm: () => {
        // sanitize input dulu sebelum kirim data ke server via GET
        // make GET biar ada query stringnya
      }
    })
  });

})

// bikin domnya dulu, trus di willLoad, load pake promise biar nongol loading
let printTambahPembukuanHTML = function () {

  const htmlAddStock = `
            <div class="w-full px-6 space-y-6 flex flex-col text-left" x-data="{ radio: 1 }">  

                <div class="form-control">
                    <label for="">Tipe Pembukuan</label>
                    <div class="flex space-x-4 mt-2">
                    <label class="cursor-pointer items-center py-2 flex-1 rounded-box px-4 border"
                        :class="(radio == 1)? 'bg-success bg-opacity-10 border-success': 'bg-white border-secondary'">
                        <input type="radio" name="swal-arahsort" checked="checked" class="radio radio-success hidden"
                        value="masuk" @click="radio = 1; $refs.nominal.value = 0">
                        <span class="label-text text-base"
                        :class="(radio == 1)? 'text-success': 'text-secondary'">Kas Masuk</span>
                    </label>
                    <label class="cursor-pointer items-center py-2 flex-1 rounded-box px-4 border"
                        :class="(radio == 2)? 'bg-error bg-opacity-10 border-error': 'bg-white border-secondary'">
                        <input type="radio" name="swal-arahsort" class="radio radio-error hidden" value="keluar"
                        @click="radio = 2; $refs.nominal.value = 0">
                        <span class="label-text text-base"
                        :class="(radio == 2)? 'text-error': 'text-secondary'">Kas Keluar</span>
                    </label>
                    </div>
                </div>  

                <div class="form-control">
                    <label for="swal-nominal">Nominal</label>
                    <div class="relative flex w-full flex-wrap items-stretch">
                        <span
                        class="z-10 h-full leading-snug absolute text-center text-secondary items-center justify-center w-10 pl-3 py-3">
                        Rp.
                        </span>
                        <input type="number" x-ref="nominal" @focus="$el.value=($el.value == 0)? '':$el.value" @focusout="$el.value = ($el.value =='')? 0:$el.value" value="0"
                        name="swal-nominal" id="swal-nominal" class="px-3 py-3 relative input input-bordered w-full pl-12" required>
                    </div>
                </div>

                <div class="form-control">
                    <label for="swal-perihal">Perihal</label>
                    <textarea name="swal-perihal" id="swal-perihal" class="textarea textarea-bordered h-24" placeholder="Contoh: Belanja Pasar" required></textarea>
                </div>
                
            </div>
        `
  return htmlAddStock
}

let printAturTabelHTML = function () {

  const htmlAddStock = `
              <div class="w-full px-6 space-y-6 flex flex-col text-left" >
                
                <div class="form-control">
                    <label for="swal-sort">Urutkan Tabel Berdasarkan</label>
                    <select id="swal-sort" class="select select-bordered w-full max-w-md swal mt-2">
                        <option value="tanggalwaktu">Tanggal dan Waktu</option> 
                        <option value="tipe">Tipe</option> 
                        <option value="perihal">Perihal (alfabet)</option>
                        <option value="nominal">Nominal</option> 
                    </select>
                    <div class="flex space-x-4 mt-2" x-data="{ radio: 1 }">
                        <label class="cursor-pointer items-center py-2 flex-1 rounded-box px-4 border"
                            :class="(radio == 1)? 'bg-primary bg-opacity-10 border-primary': 'bg-white border-secondary'">
                            <input type="radio" name="swal-arahsort" checked="checked" class="radio radio-primary hidden"
                            value="asc" @click="radio = 1">
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
                            <input type="radio" name="swal-arahsort" class="radio radio-primary hidden" value="desc"
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
                
                <div class="form-control" x-data="{ radio: 1 }">
                    <label for="">Data Kas yang Ditampilkan</label>
                    <div class="flex space-x-4 mt-2">
                    <label class="cursor-pointer items-center py-2 flex-1 rounded-box px-4 border"
                        :class="(radio == 1)? 'bg-primary bg-opacity-10 border-primary': 'bg-white border-secondary'">
                        <input type="radio" name="swal-datatampil" checked="checked" class="radio radio-primary hidden"
                        value="masuk" @click="radio = 1">
                        <span class="label-text text-base"
                        :class="(radio == 1)? 'text-primary': 'text-secondary'">Hari Ini</span>
                    </label>
                    <label class="cursor-pointer items-center py-2 flex-1 rounded-box px-4 border"
                        :class="(radio == 2)? 'bg-primary bg-opacity-10 border-primary': 'bg-white border-secondary'">
                        <input type="radio" name="swal-datatampil" class="radio radio-primary hidden" value="keluar"
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
