// import Swal from "sweetalert2"
import Swal from "sweetalert2/dist/sweetalert2"

import {
  SwalCustomColor,
} from '../../fungsi.js'

import {
  swalPrepareUbah,
  swalCekAkun,
  swalKonfirmasiUbah,
  swalSelesai
} from './base-pengaturan'

// cek boleh ngedit ato ngga
const eleBolehEdit = document.getElementById('eleBolehEdit')
let BOLEHEDIT = (eleBolehEdit && eleBolehEdit.value && eleBolehEdit.value == 1)
// BOLEHEDIT wajib dipake di function buat event pengaturan

// ngambil data yang bakal dipake buat ubah data
let DATA = {}
let radio = 0

if (BOLEHEDIT) {
  $.getJSON("/app/pengaturan/api/barang", {},
    function (data, textStatus, jqXHR) {
      DATA = data.toko

      if(data.toko.peringatanStokMenipis){
        radio = 1
      }
    }
  );


  const ubahStokMinimumKelompok = document.getElementById('ubahStokMinimumKelompok')
  const ubahPeringatanStokMenipis = document.getElementById('ubahPeringatanStokMenipis')

  ubahStokMinimumKelompok.addEventListener('click', () => {
    swalPrepareUbah.fire({
      title: 'Ubah Stok Minimum Kelompok',
      text: 'Pengubahan data ini akan mengubah jumlah stok minimum kelompok perhiasan sebelum dilaporkan sebagai kelompok "stok hampir habis". Lanjutkan?',
    }).then((prepare) => {
      if (prepare.isConfirmed) {
        swalCekAkun().then((cek) => {
          if (cek.isConfirmed) {

            Swal.fire({
              title: 'Ubah Stok Minimum Kelompok',
              input: 'number',
              inputLabel: 'Masukkan nominal stok minimum baru',
              inputPlaceholder: 'Nominal stok minimum baru',
              inputValue: (DATA.stokMinimumKelompok) ? DATA.stokMinimumKelompok : 0,
              inputAttributes: {
                min: 0,
                step: 1
              },
              showCancelButton: true,
              scrollbarPadding: false,
              allowOutsideClick: false,
              confirmButtonColor: SwalCustomColor.button.confirm,
              confirmButtonText: 'Selanjutnya',
              inputValidator: (value) => {
                if (!value) {
                  return 'Input tidak boleh kosong!'
                }
              },
            }).then((gantiStokMin) => {
              if (gantiStokMin.isConfirmed) {

                swalKonfirmasiUbah.fire({
                  title: 'Konfirmasi Pengubahan',
                  html: `Anda akan secara sengaja mengubah stok minimum kelompok perhiasan di toko anda menjadi <span class="font-semibold">${gantiStokMin.value}</span>. Lanjutkan?`,
                  preConfirm: () => {
                    Swal.showLoading()

                    return new Promise(function (resolve, reject) {
                      setTimeout(function () {
                        reject({
                          tipe: 'lokal',
                          msg: 'Tidak ada respon dari server'
                        })
                      }, 5000)

                      $.ajax({
                        type: "PUT",
                        url: '/app/pengaturan/api/barang/ubah-minimal-stok-kelompok',
                        data: {
                          newStokMin: gantiStokMin.value,
                        },
                        dataType: 'json',
                        success: function () {
                          resolve({
                            apakahSukses: true,
                            msg: 'Stok minimum kelompok perhiasan diubah!'
                          })
                        },
                        error: function (xhr) {
                          reject({
                            tipe: 'lokal',
                            msg: (typeof xhr.responseJSON.error === 'string') ? xhr.responseJSON.error : 'Ada error pada server!'
                          })
                        }
                      });
                    }).catch(function (error) {
                      if (error.tipe && error.tipe === 'lokal') {
                        return error
                      } else {
                        return {
                          apakahSukses: false,
                          msg: 'Ada kesalahan pada sistem. Silahkan coba lagi.'
                        }
                      }
                    })

                  }
                }).then((hasilUbah) => {
                  if (hasilUbah.isConfirmed) {
                    swalSelesai(hasilUbah).then(() => {
                      location.href = location.pathname
                    })
                  }
                })

              }
            })
          }
        })

      }

    })
  })

  ubahPeringatanStokMenipis.addEventListener('click', () => {
    swalPrepareUbah.fire({
      title: 'Ubah Peringatan Stok Menipis',
      text: 'Pengubahan data ini akan mengubah default dilaporkan atau tidaknya kelompok perhiasan baru saat stoknya kurang dari stok minimal yang ditentukan. Lanjutkan?',
    }).then((prepare) => {
      if (prepare.isConfirmed) {
        swalCekAkun().then((cek) => {
          if (cek.isConfirmed) {

            Swal.fire({
              title: 'Ubah Peringatan Stok Menipis',
              html: printPeringatanStokHTML(),
              showCancelButton: true,
              scrollbarPadding: false,
              allowOutsideClick: false,
              confirmButtonColor: SwalCustomColor.button.confirm,
              confirmButtonText: 'Selanjutnya',
              preConfirm: () => {
                const opsi = document.querySelector('input[name="swal-peringatanStok"]:checked').value

                if(opsi){
                  return (opsi == 1)? { peri: true } : { peri:false }
                } else {
                  Swal.showValidationMessage('Ada kesalahan, silahkan coba lagi nanti')
                }
              }
            }).then((gantiPeringatan) => {
              if (gantiPeringatan.isConfirmed) {
                swalKonfirmasiUbah.fire({
                  title: 'Konfirmasi Pengubahan',
                  html: `Anda akan secara sengaja mengubah default peringatan stok kelompok menipis menjadi <span class="font-semibold">${ ((gantiPeringatan.value.peri)? 'Aktif': 'Mati') }</span>. Lanjutkan?`,
                  preConfirm: () => {
                    Swal.showLoading()

                    return new Promise(function (resolve, reject) {
                      setTimeout(function () {
                        reject({
                          tipe: 'lokal',
                          msg: 'Tidak ada respon dari server'
                        })
                      }, 5000)

                      $.ajax({
                        type: "PUT",
                        url: '/app/pengaturan/api/barang/ubah-peringatan-stok-menipis',
                        data: {
                          newPeri: gantiPeringatan.value.peri,
                        },
                        dataType: 'json',
                        success: function () {
                          resolve({
                            apakahSukses: true,
                            msg: 'Peringatan stok kelompok menipis berhasil diubah!'
                          })
                        },
                        error: function (xhr) {
                          reject({
                            tipe: 'lokal',
                            msg: (typeof xhr.responseJSON.error === 'string') ? xhr.responseJSON.error : 'Ada error pada server!'
                          })
                        }
                      });
                    }).catch(function (error) {
                      if (error.tipe && error.tipe === 'lokal') {
                        return error
                      } else {
                        return {
                          apakahSukses: false,
                          msg: 'Ada kesalahan pada sistem. Silahkan coba lagi.'
                        }
                      }
                    })

                  }
                }).then((hasilUbah) => {
                  if (hasilUbah.isConfirmed) {
                    swalSelesai(hasilUbah).then(() => {
                      location.href = location.pathname
                    })
                  }
                })

              }
            })
          }
        })

      }

    })
  })

  let printPeringatanStokHTML = function () {
    const htmlAddStock = `
                  <div class="w-full px-6 space-y-6 flex flex-col text-left" >
                    <div class="text-center">Perubahan opsi ini hanya berpengaruh pada kelompok yang baru ditambahkan</div>

                    <div class="form-control" x-data="{ radio: ` + ((radio == 1) ? 2 : 1) + ` }">    
                      <div class="flex space-x-4 mt-2">
                      <label class="cursor-pointer items-center py-2 flex-1 rounded-box px-4 border"
                          :class="(radio == 1)? 'bg-primary bg-opacity-10 border-primary': 'bg-white border-secondary'">
                          <input type="radio" name="swal-peringatanStok" ` + ((radio == 0) ? 'checked=checked' : '') + ` class="radio radio-primary hidden"
                          value="0" @click="radio = 1">
                          <span class="label-text text-base"
                          :class="(radio == 1)? 'text-primary': 'text-secondary'">Mati</span>
                      </label>
                      <label class="cursor-pointer items-center py-2 flex-1 rounded-box px-4 border"
                          :class="(radio == 2)? 'bg-primary bg-opacity-10 border-primary': 'bg-white border-secondary'">
                          <input type="radio" name="swal-peringatanStok" ` + ((radio == 1) ? 'checked=checked' : '') + ` class="radio radio-primary hidden" value="1"
                          @click="radio = 2">
                          <span class="label-text text-base"
                          :class="(radio == 2)? 'text-primary': 'text-secondary'">Aktif</span>
                      </label>
                      </div>
                  </div>

                </div>
              `
    return htmlAddStock
  }

}

