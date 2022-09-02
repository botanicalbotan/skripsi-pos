// import Swal from "sweetalert2"
import Swal from "sweetalert2/dist/sweetalert2"

import {
  SwalCustomColor,
} from '../../fungsi.js'

import { swalPrepareUbah, swalCekAkun, swalKonfirmasiUbah, swalSelesai } from './base-pengaturan'

// cek boleh ngedit ato ngga
const eleBolehEdit = document.getElementById('eleBolehEdit')
let BOLEHEDIT = (eleBolehEdit && eleBolehEdit.value && eleBolehEdit.value == 1)
// BOLEHEDIT wajib dipake di function buat event pengaturan

// ngambil data yang bakal dipake buat ubah data
let DATA = {}

if (BOLEHEDIT) {
  $.getJSON("/app/cuma-data/my-toko", {},
    function (data, textStatus, jqXHR) {
      DATA = data.toko
    }
  );

  const btPilihLogo = document.getElementById('btPilihLogo')
  const btUbahLogo = document.getElementById('btUbahLogo')
  const btHapusLogoToko = document.getElementById('btHapusLogoToko')
  let sudahFoto = false
  const MAXSIZE = 1000 // MB

  const ubahNamaToko = document.getElementById('ubahNamaToko')
  const ubahAlamatToko = document.getElementById('ubahAlamatToko')
  const ubahAlamatTokoSingkat = document.getElementById('ubahAlamatTokoSingkat')

  function eventFoto() {
    swalCekAkun().then((cek) => {
      if (cek.isConfirmed) {
        // ----------------- Pilih logo ------------------
        Swal.fire({
          title: 'Pilih logo toko',
          text: 'Pilih file gambar berformat JPG, PNG atau GIF dan maksimal ukuran 1 MB',
          input: 'file',
          inputAttributes: {
            'accept': 'image/*',
            'aria-label': 'Pilih logo toko anda'
          },
          showCancelButton: true,
          cancelButtonText: 'Batal',
          confirmButtonText: 'Selanjutnya',
          allowOutsideClick: false,
          scrollbarPadding: false,
          confirmButtonColor: SwalCustomColor.button.confirm,
          preConfirm: (inputfile) => {
            return new Promise((resolve, reject) => {
              if (inputfile) {
                if (inputfile.size / 1024 <= MAXSIZE && inputfile.size > 0) {
                  resolve(inputfile)
                } else {
                  reject({
                    err: 'Ukuran file terlalu besar!'
                  })
                }

              } else {
                reject({
                  err: 'Anda harus memilih file!'
                })
              }
            }).catch(function (error) {
              Swal.hideLoading()
              Swal.showValidationMessage(error.err)
            })
          }
        })
          // ------------ lanjut crop ------------------
          .then((logo) => {
            if (logo.isConfirmed && logo.value) {
              let reader = new FileReader()

              reader.onload = function (e) {
                Swal.fire({
                  title: 'Pratinjau Pemotongan Gambar',
                  html: `
              <div>
              <img id="cropperWadah" src="${e.target.result}">
              </div>
          `,
                  showCancelButton: true,
                  allowOutsideClick: false,
                  scrollbarPadding: false,
                  confirmButtonColor: SwalCustomColor.button.confirm,
                  willOpen: () => {
                    const image = Swal.getPopup().querySelector('#cropperWadah')
                    const cropper = new Cropper(image, {
                      aspectRatio: 2,
                      viewMode: 0,
                      autoCropArea: 0,
                      scalable: false,
                      zoomable: true, // biasanya false
                      movable: false,
                      minCropBoxWidth: 200,
                      minCropBoxHeight: 200,
                    })

                    const confirmButton = Swal.getConfirmButton()

                    confirmButton.addEventListener('click', () => {
                      Swal.showLoading()

                      prepareKirim(cropper.getCroppedCanvas().toDataURL())
                    })

                  },
                }).then((crop) => {
                  if (crop.isConfirmed) {
                    sudahFoto = true
                  } else {
                    sudahFoto = false
                  }
                })
              }

              reader.readAsDataURL(logo.value)
            } else {
              sudahFoto = false
            }
          })
      }
    })
  }

  function prepareKirim(base64) {
    // -------------------- konfirmasi sebelum ngirim --------------------
    Swal.fire({
      showConfirmButton: true,
      showCancelButton: true,
      cancelButtonText: 'Batal',
      confirmButtonText: 'Ya, ganti!',
      scrollbarPadding: false,
      confirmButtonColor: SwalCustomColor.button.confirm,
      allowOutsideClick: false,
      title: 'Gunakan Foto Ini?',
      imageUrl: base64,
      imageWidth: 400,
      imageAlt: 'Custom image',
      text: 'Anda akan mengganti logo toko dengan gambar ini. Lanjutkan?',
    }).then((hasil) => {
      if (hasil.isConfirmed && sudahFoto) {
        // ------------------- kirim foto ------------------
        $.post("/app/pengaturan/api/general/ganti-logo", {
          fileFoto: base64
        },
          function () {
            Swal.fire({
              title: 'Sukses!',
              text: 'Logo toko berhasil diubah',
              confirmButtonText: 'Tutup',
              icon: 'success',
              confirmButtonColor: SwalCustomColor.button.cancel
            }).then(() => {
              location.href = location.pathname
            })
          },
          "json"
        ).fail((jqXHR) => {
          Swal.fire({
            title: 'Error!',
            text: jqXHR.responseJSON.error | 'Ada error pada server',
            confirmButtonText: 'Tutup',
            icon: 'error',
            confirmButtonColor: SwalCustomColor.button.cancel
          }).then(() => {
            location.href = location.pathname
          })
        })
      }
    })
  }

  if (btPilihLogo) btPilihLogo.addEventListener('click', eventFoto)
  if (btUbahLogo) btUbahLogo.addEventListener('click', eventFoto)

  if (btHapusLogoToko) {
    btHapusLogoToko.addEventListener('click', () => {
      Swal.fire({
        title: 'Hapus Logo Toko?',
        showCancelButton: true,
        text: 'Dengan menghapus logo toko, toko akan kehilangan logo yang akan digunakan pada nota dan laporan. Lanjutkan?',
        confirmButtonText: 'Ya, hapus!',
        cancelButtonText: 'Batal',
        focusCancel: true,
        icon: 'question',
        confirmButtonColor: SwalCustomColor.button.deny,
        preConfirm: () => {
          Swal.showLoading(Swal.getConfirmButton())
          return new Promise(function (resolve, reject) {
            setTimeout(function () {
              Swal.hideLoading()
              reject('Tidak ada respon dari server')
            }, 5000)

            $.ajax({
              type: "DELETE",
              url: '/app/pengaturan/api/general/hapus-logo',
              dataType: "json",
              success: function () {
                console.log('awyeaah')
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
      }).then((hapus) => {
        if (hapus.isConfirmed) {
          Swal.fire(
            'Sukses!',
            'Logo toko berhasil dihapus!',
            'success'
          ).then(() => {
            location.href = location.pathname
          })
        }
      })
    })
  }


  ubahNamaToko.addEventListener('click', () => {
    swalPrepareUbah.fire({
      title: 'Ubah Nama Toko',
      text: 'Pengubahan nama toko akan mengubah identitas toko yang tertera pada sistem, nota penjualan dan laporan harian. Lanjutkan?',
    }).then((prepare) => {

      if (prepare.isConfirmed) {
        swalCekAkun().then((cek) => {
          if (cek.isConfirmed) {

            Swal.fire({
              title: 'Ubah Nama Toko',
              input: 'text',
              inputLabel: 'Masukkan nama baru toko anda pada input berikut',
              inputPlaceholder: 'Nama baru toko',
              inputValue: (DATA.namaToko) ? DATA.namaToko : '',
              inputAttributes: {
                maxlength: 50
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
                if (value.length > 50) {
                  return 'Input terlalu panjang!'
                }
              },
            }).then((gantiNama) => {
              if (gantiNama.isConfirmed) {

                swalKonfirmasiUbah.fire({
                  title: 'Konfirmasi Pengubahan',
                  text: 'Anda akan secara sengaja mengubah nama toko anda menjadi "' + gantiNama.value + '". Lanjutkan?',
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
                        url: '/app/pengaturan/api/general/ubah-nama-toko',
                        data: {
                          newNama: gantiNama.value,
                        },
                        dataType: 'json',
                        success: function () {
                          resolve({
                            apakahSukses: true,
                            msg: 'Nama toko berhasil diubah!'
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

  ubahAlamatToko.addEventListener('click', () => {
    swalPrepareUbah.fire({
      title: 'Ubah Alamat Toko',
      text: 'Pengubahan alamat toko akan mengubah identitas toko yang tertera pada sistem dan laporan harian. Lanjutkan?',
    }).then((prepare) => {

      if (prepare.isConfirmed) {
        swalCekAkun().then((cek) => {
          if (cek.isConfirmed) {

            Swal.fire({
              title: 'Ubah Alamat Toko',
              input: 'textarea',
              inputLabel: 'Masukkan alamat baru toko anda pada input berikut',
              inputPlaceholder: 'Alamat baru toko',
              inputValue: (DATA.alamatTokoLengkap) ? DATA.alamatTokoLengkap : '',
              inputAttributes: {
                maxlength: 100
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
                if (value.length > 100) {
                  return 'Input terlalu panjang!'
                }
              },
            }).then((gantiAlamat) => {
              if (gantiAlamat.isConfirmed) {

                swalKonfirmasiUbah.fire({
                  title: 'Konfirmasi Pengubahan',
                  text: 'Anda akan secara sengaja mengubah alamat toko anda menjadi "' + gantiAlamat.value + '". Lanjutkan?',
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
                        url: '/app/pengaturan/api/general/ubah-alamat-toko',
                        data: {
                          newAlamat: gantiAlamat.value,
                        },
                        dataType: 'json',
                        success: function () {
                          resolve({
                            apakahSukses: true,
                            msg: 'Alamat toko berhasil diubah!'
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

  ubahAlamatTokoSingkat.addEventListener('click', () => {
    swalPrepareUbah.fire({
      title: 'Ubah Alamat Singkat Toko',
      text: 'Pengubahan alamat singkat toko akan mengubah identitas toko yang tertera pada nota penjualan. Lanjutkan?',
    }).then((prepare) => {

      if (prepare.isConfirmed) {
        swalCekAkun().then((cek) => {
          if (cek.isConfirmed) {

            Swal.fire({
              title: 'Ubah Alamat Singkat Toko',
              input: 'textarea',
              inputLabel: 'Masukkan alamat singkat baru toko anda pada input berikut',
              inputPlaceholder: 'Alamat singkat baru toko',
              inputValue: (DATA.alamatTokoSingkat) ? DATA.alamatTokoSingkat : '',
              inputAttributes: {
                maxlength: 50
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
                if (value.length > 50) {
                  return 'Input terlalu panjang!'
                }
              },
            }).then((gantiAlamatSingkat) => {
              if (gantiAlamatSingkat.isConfirmed) {

                swalKonfirmasiUbah.fire({
                  title: 'Konfirmasi Pengubahan',
                  text: 'Anda akan secara sengaja mengubah alamat singkat toko anda menjadi "' + gantiAlamatSingkat.value + '". Lanjutkan?',
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
                        url: '/app/pengaturan/api/general/ubah-alamat-singkat-toko',
                        data: {
                          newAlamatSingkat: gantiAlamatSingkat.value,
                        },
                        dataType: 'json',
                        success: function () {
                          resolve({
                            apakahSukses: true,
                            msg: 'Alamat toko berhasil diubah!'
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



