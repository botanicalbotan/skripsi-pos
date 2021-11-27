import Swal from "sweetalert2";

$(function () {
  // code here

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

let printAturTabelHTML = function () {

  const htmlAddStock = `
                <div class="w-full px-6 space-y-6 flex flex-col text-left" >
                  
                  <div class="form-control">
                      <label for="swal-sort">Urutkan Tabel Berdasarkan</label>
                      <select id="swal-sort" class="select select-bordered w-full max-w-md swal mt-2">
                          <option value="nama">Nama Kerusakan</option> 
                          <option value="bentuk">Bentuk</option> 
                          <option value="perbaiki">Bisa Diperbaiki?</option>
                          <option value="ongkos">Ongkos Perbaikan</option>
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
                    
              </div>
            `
  return htmlAddStock
}
