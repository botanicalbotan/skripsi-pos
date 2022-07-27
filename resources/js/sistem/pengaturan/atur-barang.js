import Swal from "sweetalert2"

import {
  SwalCustomColor,
  rupiahParser
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

$.getJSON("/app/pengaturan/api/barang", {},
  function (data, textStatus, jqXHR) {
    console.log(data)
    DATA = data.toko
  }
);

const ubahStokMinimumKelompok = document.getElementById('ubahStokMinimumKelompok')
const ubahPeringatanStokMenipis = document.getElementById('ubahPeringatanStokMenipis')


ubahStokMinimumKelompok.addEventListener('click', () => {
    if (BOLEHEDIT) {
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
                      text: 'Anda akan secara sengaja mengubah stok minimum kelompok perhiasan di toko anda menjadi "' + gantiStokMin.value + '". Lanjutkan?',
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
    
      }
})