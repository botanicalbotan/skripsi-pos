// import Swal from "sweetalert2"
import Swal from "sweetalert2/dist/sweetalert2"

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
let radio = 0

if (BOLEHEDIT) {
  $.getJSON("/app/pengaturan/api/transaksi", {},
    function (data, textStatus, jqXHR) {
      DATA = data.toko
      
      if(data.toko.izinCetakNota){
        radio = 1
      }
    }
  );

  // const ubahIzinCetakNota = document.getElementById('ubahIzinCetakNota')
  const ubahWaktuMaksimalCetakNota = document.getElementById('ubahWaktuMaksimalCetakNota')
  const ubahPenaltiKeterlambatanMin = document.getElementById('ubahPenaltiKeterlambatanMin')
  const ubahPenaltiKeterlambatanMax = document.getElementById('ubahPenaltiKeterlambatanMax')
  // const ubahWaktuMaksimalPengajuanGadai = document.getElementById('ubahWaktuMaksimalPengajuanGadai')
  const ubahHargaMal = document.getElementById('ubahHargaMal')

  // ubahIzinCetakNota.addEventListener('click', () => {
  //   swalPrepareUbah.fire({
  //     title: 'Ubah Izin Cetak Nota',
  //     text: 'Pengubahan data ini akan mengubah boleh atau tidaknya nota transaksi penjualan dicetak. Lanjutkan?',
  //   }).then((prepare) => {
  //     if (prepare.isConfirmed) {
  //       swalCekAkun().then((cek) => {
  //         if (cek.isConfirmed) {

  //           Swal.fire({
  //             title: 'Ubah Izin Cetak Nota',
  //             html: printIzinCetakHTML(),
  //             showCancelButton: true,
  //             scrollbarPadding: false,
  //             allowOutsideClick: false,
  //             confirmButtonColor: SwalCustomColor.button.confirm,
  //             confirmButtonText: 'Selanjutnya',
  //             preConfirm: () => {
  //               const opsi = document.querySelector('input[name="swal-izinCetak"]:checked').value

  //               if(opsi){
  //                 return (opsi == 1)? { izin: true } : { izin:false }
  //               } else {
  //                 Swal.showValidationMessage('Ada kesalahan, silahkan coba lagi nanti')
  //               }
  //             }
  //           }).then((gantiIzin) => {
  //             if (gantiIzin.isConfirmed) {
  //               swalKonfirmasiUbah.fire({
  //                 title: 'Konfirmasi Pengubahan',
  //                 html: `Anda akan secara sengaja mengubah izin cetak nota transaksi penjualan menjadi <span class="font-semibold">${ ((gantiIzin.value.izin)? 'Aktif': 'Mati') }</span>. Lanjutkan?`,
  //                 preConfirm: () => {
  //                   Swal.showLoading()

  //                   return new Promise(function (resolve, reject) {
  //                     setTimeout(function () {
  //                       reject({
  //                         tipe: 'lokal',
  //                         msg: 'Tidak ada respon dari server'
  //                       })
  //                     }, 5000)

  //                     $.ajax({
  //                       type: "PUT",
  //                       url: '/app/pengaturan/api/transaksi/ubah-izin-cetak-nota',
  //                       data: {
  //                         newIzin: gantiIzin.value.izin,
  //                       },
  //                       dataType: 'json',
  //                       success: function () {
  //                         resolve({
  //                           apakahSukses: true,
  //                           msg: 'Izin cetak nota berhasil diubah!'
  //                         })
  //                       },
  //                       error: function (xhr) {
  //                         reject({
  //                           tipe: 'lokal',
  //                           msg: (typeof xhr.responseJSON.error === 'string') ? xhr.responseJSON.error : 'Ada error pada server!'
  //                         })
  //                       }
  //                     });
  //                   }).catch(function (error) {
  //                     if (error.tipe && error.tipe === 'lokal') {
  //                       return error
  //                     } else {
  //                       return {
  //                         apakahSukses: false,
  //                         msg: 'Ada kesalahan pada sistem. Silahkan coba lagi.'
  //                       }
  //                     }
  //                   })

  //                 }
  //               }).then((hasilUbah) => {
  //                 if (hasilUbah.isConfirmed) {
  //                   swalSelesai(hasilUbah).then(() => {
  //                     location.href = location.pathname
  //                   })
  //                 }
  //               })

  //             }
  //           })
  //         }
  //       })

  //     }

  //   })
  // })

  // let printIzinCetakHTML = function () {
  //   const htmlAddStock = `
  //                 <div class="w-full px-6 space-y-6 flex flex-col text-left" >
  //                   <div class="text-center">Perubahan opsi ini hanya berpengaruh pada kelompok yang baru ditambahkan</div>

  //                   <div class="form-control" x-data="{ radio: ` + ((radio == 1) ? 2 : 1) + ` }">    
  //                     <div class="flex space-x-4 mt-2">
  //                     <label class="cursor-pointer items-center py-2 flex-1 rounded-box px-4 border"
  //                         :class="(radio == 1)? 'bg-primary bg-opacity-10 border-primary': 'bg-white border-secondary'">
  //                         <input type="radio" name="swal-izinCetak" ` + ((radio == 0) ? 'checked=checked' : '') + ` class="radio radio-primary hidden"
  //                         value="0" @click="radio = 1">
  //                         <span class="label-text text-base"
  //                         :class="(radio == 1)? 'text-primary': 'text-secondary'">Mati</span>
  //                     </label>
  //                     <label class="cursor-pointer items-center py-2 flex-1 rounded-box px-4 border"
  //                         :class="(radio == 2)? 'bg-primary bg-opacity-10 border-primary': 'bg-white border-secondary'">
  //                         <input type="radio" name="swal-izinCetak" ` + ((radio == 1) ? 'checked=checked' : '') + ` class="radio radio-primary hidden" value="1"
  //                         @click="radio = 2">
  //                         <span class="label-text text-base"
  //                         :class="(radio == 2)? 'text-primary': 'text-secondary'">Aktif</span>
  //                     </label>
  //                     </div>
  //                 </div>

  //               </div>
  //             `
  //   return htmlAddStock
  // }

  ubahWaktuMaksimalCetakNota.addEventListener('click', () => {

    swalPrepareUbah.fire({
      title: 'Ubah Waktu Maksimum Pencetakan Nota',
      text: 'Pengubahan data ini akan mengubah batas maksimal waktu (menit) untuk mencetak nota pasca penjualan. Lanjutkan?',
    }).then((prepare) => {

      if (prepare.isConfirmed) {
        swalCekAkun().then((cek) => {
          if (cek.isConfirmed) {

            Swal.fire({
              title: 'Ubah Waktu Maksimum Pencetakan Nota',
              input: 'range',
              inputLabel: 'Masukkan waktu baru dalam satuan MENIT',
              inputValue: (DATA.waktuMaksimalCetakNota) ? DATA.waktuMaksimalCetakNota : 0,
              inputAttributes: {
                // maxlength: 50
                min: 0,
                max: 60,
                step: 1
              },
              showCancelButton: true,
              scrollbarPadding: false,
              allowOutsideClick: false,
              confirmButtonColor: SwalCustomColor.button.confirm,
              confirmButtonText: 'Selanjutnya',
            }).then((gantiWaktuCetak) => {
              if (gantiWaktuCetak.isConfirmed) {

                swalKonfirmasiUbah.fire({
                  title: 'Konfirmasi Pengubahan',
                  text: 'Anda akan secara sengaja mengubah waktu maksimum pencetakan nota toko anda menjadi "' + gantiWaktuCetak.value + ' menit". Lanjutkan?',
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
                        url: '/app/pengaturan/api/transaksi/ubah-waktu-max-cetak-nota',
                        data: {
                          newWaktuCetak: gantiWaktuCetak.value,
                        },
                        dataType: 'json',
                        success: function () {
                          resolve({
                            apakahSukses: true,
                            msg: 'Waktu maksimum pencetakan nota berhasil diubah!'
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


  ubahPenaltiKeterlambatanMin.addEventListener('click', () => {

    swalPrepareUbah.fire({
      title: 'Ubah Penalti Minimum Keterlambatan Tukar Tambah',
      text: 'Pengubahan data ini akan mengubah nominal minimum yang ditagihkan kepada kustomer bila mengajukan tukar tambah diluar waktu perjanjian. Lanjutkan?',
    }).then((prepare) => {

      if (prepare.isConfirmed) {
        swalCekAkun().then((cek) => {
          if (cek.isConfirmed) {

            Swal.fire({
              title: 'Ubah Penalti Minimum Keterlambatan Tukar Tambah',
              input: 'number',
              inputLabel: 'Masukkan nominal penalti minimum baru',
              inputPlaceholder: 'Nominal penalti minimum baru',
              inputValue: (DATA.penaltiTelatJanjiTTMin) ? DATA.penaltiTelatJanjiTTMin : 0,
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
            }).then((gantiPenaltiMin) => {
              if (gantiPenaltiMin.isConfirmed) {

                swalKonfirmasiUbah.fire({
                  title: 'Konfirmasi Pengubahan',
                  text: 'Anda akan secara sengaja mengubah penalti minimum keterlambatan tukar tambah toko anda menjadi "' + rupiahParser(parseInt(gantiPenaltiMin.value)) + '". Lanjutkan?',
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
                        url: '/app/pengaturan/api/transaksi/ubah-penalti-telat-tt-min',
                        data: {
                          newPenaltiMin: gantiPenaltiMin.value,
                        },
                        dataType: 'json',
                        success: function () {
                          resolve({
                            apakahSukses: true,
                            msg: 'Penalti minimum keterlambatan tukar tambah berhasil diubah!'
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


  ubahPenaltiKeterlambatanMax.addEventListener('click', () => {

    swalPrepareUbah.fire({
      title: 'Ubah Penalti Maksimum Keterlambatan Tukar Tambah',
      text: 'Pengubahan data ini akan mengubah nominal maksimum yang ditagihkan kepada kustomer bila mengajukan tukar tambah diluar waktu perjanjian. Lanjutkan?',
    }).then((prepare) => {

      if (prepare.isConfirmed) {
        swalCekAkun().then((cek) => {
          if (cek.isConfirmed) {

            Swal.fire({
              title: 'Ubah Penalti Maksimum Keterlambatan Tukar Tambah',
              input: 'number',
              inputLabel: 'Masukkan nominal penalti maksimum baru',
              inputPlaceholder: 'Nominal penalti maksimum baru',
              inputValue: (DATA.penaltiTelatJanjiTTMax) ? DATA.penaltiTelatJanjiTTMax : 0,
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
            }).then((gantiPenaltiMax) => {
              if (gantiPenaltiMax.isConfirmed) {

                swalKonfirmasiUbah.fire({
                  title: 'Konfirmasi Pengubahan',
                  text: 'Anda akan secara sengaja mengubah penalti maksimum keterlambatan tukar tambah toko anda menjadi "' + rupiahParser(parseInt(gantiPenaltiMax.value)) + '". Lanjutkan?',
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
                        url: '/app/pengaturan/api/transaksi/ubah-penalti-telat-tt-max',
                        data: {
                          newPenaltiMax: gantiPenaltiMax.value,
                        },
                        dataType: 'json',
                        success: function () {
                          resolve({
                            apakahSukses: true,
                            msg: 'Penalti maksimum keterlambatan tukar tambah berhasil diubah!'
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


  // ubahWaktuMaksimalPengajuanGadai.addEventListener('click', () => {

  //   swalPrepareUbah.fire({
  //     title: 'Ubah Waktu Maksimum Pengajuan Gadai',
  //     text: 'Pengubahan data ini akan mengubah batas maksimal waktu (menit) untuk mengajukan gadai pasca transaksi pembelian. Lanjutkan?',
  //   }).then((prepare) => {

  //     if (prepare.isConfirmed) {
  //       swalCekAkun().then((cek) => {
  //         if (cek.isConfirmed) {

  //           Swal.fire({
  //             title: 'Ubah Waktu Maksimum Pengajuan Gadai',
  //             input: 'range',
  //             inputLabel: 'Masukkan waktu baru dalam satuan MENIT',
  //             inputValue: (DATA.waktuMaksimalPengajuanGadai) ? DATA.waktuMaksimalPengajuanGadai : 0,
  //             inputAttributes: {
  //               min: 0,
  //               max: 60,
  //               step: 1
  //             },
  //             showCancelButton: true,
  //             scrollbarPadding: false,
  //             allowOutsideClick: false,
  //             confirmButtonColor: SwalCustomColor.button.confirm,
  //             confirmButtonText: 'Selanjutnya',
  //           }).then((gantiWaktuAju) => {
  //             if (gantiWaktuAju.isConfirmed) {

  //               swalKonfirmasiUbah.fire({
  //                 title: 'Konfirmasi Pengubahan',
  //                 text: 'Anda akan secara sengaja mengubah waktu maksimum pengajuan gadai toko anda menjadi "' + gantiWaktuAju.value + ' menit". Lanjutkan?',
  //                 preConfirm: () => {
  //                   Swal.showLoading()

  //                   return new Promise(function (resolve, reject) {
  //                     setTimeout(function () {
  //                       reject({
  //                         tipe: 'lokal',
  //                         msg: 'Tidak ada respon dari server'
  //                       })
  //                     }, 5000)

  //                     $.ajax({
  //                       type: "PUT",
  //                       url: '/app/pengaturan/api/transaksi/ubah-waktu-max-pengajuan-gadai',
  //                       data: {
  //                         newWaktuAju: gantiWaktuAju.value,
  //                       },
  //                       dataType: 'json',
  //                       success: function () {
  //                         resolve({
  //                           apakahSukses: true,
  //                           msg: 'Waktu maksimum pengajuan gadai berhasil diubah!'
  //                         })
  //                       },
  //                       error: function (xhr) {
  //                         reject({
  //                           tipe: 'lokal',
  //                           msg: (typeof xhr.responseJSON.error === 'string') ? xhr.responseJSON.error : 'Ada error pada server!'
  //                         })
  //                       }
  //                     });
  //                   }).catch(function (error) {
  //                     if (error.tipe && error.tipe === 'lokal') {
  //                       return error
  //                     } else {
  //                       return {
  //                         apakahSukses: false,
  //                         msg: 'Ada kesalahan pada sistem. Silahkan coba lagi.'
  //                       }
  //                     }
  //                   })

  //                 }
  //               }).then((hasilUbah) => {
  //                 if (hasilUbah.isConfirmed) {
  //                   swalSelesai(hasilUbah).then(() => {
  //                     location.href = location.pathname
  //                   })
  //                 }
  //               })

  //             }
  //           })
  //         }
  //       })

  //     }

  //   })

  // })


  ubahHargaMal.addEventListener('click', () => {
    swalPrepareUbah.fire({
      title: 'Ubah Harga Mal',
      text: 'Pengubahan data ini akan mengubah nominal harga emas murni per gram yang diperlukan dalam kalkulasi rumus transaksi pembelian. Lanjutkan?',
    }).then((prepare) => {

      if (prepare.isConfirmed) {
        swalCekAkun().then((cek) => {
          if (cek.isConfirmed) {

            Swal.fire({
              title: 'Ubah Harga Mal',
              input: 'number',
              inputLabel: 'Masukkan nominal harga mal baru',
              inputPlaceholder: 'Nominal harga mal baru',
              inputValue: (DATA.hargaMal) ? DATA.hargaMal : 0,
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
            }).then((gantiHargaMal) => {
              if (gantiHargaMal.isConfirmed) {

                swalKonfirmasiUbah.fire({
                  title: 'Konfirmasi Pengubahan',
                  text: 'Anda akan secara sengaja mengubah harga mal toko anda menjadi "' + rupiahParser(parseInt(gantiHargaMal.value)) + '". Lanjutkan?',
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
                        url: '/app/pengaturan/api/transaksi/ubah-harga-mal',
                        data: {
                          newHargaMal: gantiHargaMal.value,
                        },
                        dataType: 'json',
                        success: function () {
                          resolve({
                            apakahSukses: true,
                            msg: 'Penalti maksimum keterlambatan tukar tambah berhasil diubah!'
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
}


