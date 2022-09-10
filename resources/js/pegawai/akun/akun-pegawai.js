// import Swal from "sweetalert2"
import Swal from "sweetalert2/dist/sweetalert2"

import { SwalCustomColor, capsFirstWord } from '../../fungsi.js'


const namaPegawai = document.getElementById('namaPegawai').textContent
const jabatanPegawai = document.getElementById('jabatanPegawai').textContent
const ubahUsername = document.getElementById('ubahUsername')
const ubahEmail = document.getElementById('ubahEmail')
const ubahPassword = document.getElementById('ubahPassword')

let passwordValid = false

$.ajaxSetup({
  headers: {
    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
  }
});


ubahUsername.addEventListener('click', () => {
  Swal.fire({
    title: 'Menu Ubah Username',
    text: 'Username adalah kalimat unik yang diperlukan untuk masuk kedalam sistem. Dengan mengubah username, anda juga akan mengubah cara anda untuk mengakses sistem. Lanjutkan?',
    icon: 'info',
    showCancelButton: true,
    confirmButtonText: 'Ya, ubah username!',
    cancelButtonText: 'Batal',
    scrollbarPadding: false,
    focusCancel: true,
    confirmButtonColor: SwalCustomColor.button.confirm,
  }).then((prepare) => {

    if (prepare.isConfirmed) {
      Swal.fire({
        title: 'Isikan password anda',
        input: 'password',
        inputLabel: 'Sebagai konfirmasi bahwa ini adalah anda',
        inputPlaceholder: 'Password anda',
        showCancelButton: true,
        scrollbarPadding: false,
        confirmButtonColor: SwalCustomColor.button.confirm,
        confirmButtonText: 'Selanjutnya',
        inputValidator: (password) => {
          if (!password) {
            return 'Password tidak boleh kosong!'
          }
        },
        preConfirm: (password) => {
          Swal.showLoading()

          return new Promise(function (resolve, reject) {
            setTimeout(function () {
              reject({
                tipe: 'lokal',
                msg: 'Tidak ada respon dari server'
              })
            }, 5000)

            $.ajax({
              type: "POST",
              url: location.pathname + '/check',
              data: {
                pass: password
              },
              dataType: 'json',
              success: function (data) {
                resolve({
                  yangPunya: data.yangPunya,
                  pass: password
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
            Swal.hideLoading()
            if (error.tipe && error.tipe === 'lokal') {
              Swal.showValidationMessage(error.msg)
            } else {
              Swal.showValidationMessage(error)
            }

          })

        }
      }).then((cekPassword) => {
        if (cekPassword.isConfirmed) {
          const nyebut = (cekPassword.value.yangPunya) ? 'anda' : 'pegawai ini'

          Swal.fire({
            title: 'Isikan username baru ' + nyebut,
            input: 'text',
            inputLabel: 'Gunakan kombinasi huruf, angka dan kapital.',
            inputPlaceholder: 'Username baru',
            showCancelButton: true,
            scrollbarPadding: false,
            confirmButtonColor: SwalCustomColor.button.confirm,
            confirmButtonText: 'Selanjutnya',
            inputValidator: (value) => {
              if (!value) {
                return 'Input tidak boleh kosong!'
              }
            },
          }).then((gantiUsername) => {
            if (gantiUsername.isConfirmed) {

              Swal.fire({
                title: 'Konfirmasi Pengubahan Username',
                text: 'Anda akan secara sengaja mengubah username ' + nyebut + ' menjadi "' + gantiUsername.value + '". Lanjutkan?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Ya, ubah username!',
                cancelButtonText: 'Batal',
                scrollbarPadding: false,
                focusCancel: true,
                confirmButtonColor: SwalCustomColor.button.confirm,
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
                      url: location.pathname + '/ubah-username',
                      data: {
                        newUN: gantiUsername.value,
                      },
                      dataType: 'json',
                      success: function () {
                        resolve({
                          apakahSukses: true,
                          msg: 'Username ' + nyebut + ' berhasil diubah!'
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
                  Swal.fire({
                    title: ((hasilUbah.value.apakahSukses) ? 'Pengubahan Berhasil!' : 'Error'),
                    text: capsFirstWord(hasilUbah.value.msg),
                    icon: ((hasilUbah.value.apakahSukses) ? 'success' : 'error'),
                    scrollbarPadding: false,
                    confirmButtonText: 'Tutup',
                    confirmButtonColor: SwalCustomColor.button.cancel
                  }).then(() => {
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

if(ubahEmail){
  ubahEmail.addEventListener('click', () => {
    Swal.fire({
      title: 'Menu Ubah Email',
      text: 'Pada sistem ini, email digunakan sebagai media pengubahan password pegawai dari menu Lupa Password. Lanjutkan?',
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Ya, ubah email!',
      cancelButtonText: 'Batal',
      scrollbarPadding: false,
      focusCancel: true,
      confirmButtonColor: SwalCustomColor.button.confirm,
    }).then((prepare) => {
  
      if (prepare.isConfirmed) {
        Swal.fire({
          title: 'Isikan password anda',
          input: 'password',
          inputLabel: 'Sebagai konfirmasi bahwa ini adalah anda',
          inputPlaceholder: 'Password anda',
          showCancelButton: true,
          scrollbarPadding: false,
          confirmButtonColor: SwalCustomColor.button.confirm,
          confirmButtonText: 'Selanjutnya',
          inputValidator: (password) => {
            if (!password) {
              return 'Password tidak boleh kosong!'
            }
          },
          preConfirm: (password) => {
            Swal.showLoading()
  
            return new Promise(function (resolve, reject) {
              setTimeout(function () {
                reject({
                  tipe: 'lokal',
                  msg: 'Tidak ada respon dari server'
                })
              }, 5000)
  
              $.ajax({
                type: "POST",
                url: location.pathname + '/check',
                data: {
                  pass: password
                },
                dataType: 'json',
                success: function (data) {
                  resolve({
                    yangPunya: data.yangPunya,
                    pass: password
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
              Swal.hideLoading()
              if (error.tipe && error.tipe === 'lokal') {
                Swal.showValidationMessage(error.msg)
              } else {
                Swal.showValidationMessage(error)
              }
  
            })
  
          }
        }).then((cekPassword) => {
          if (cekPassword.isConfirmed) {
            const nyebut = (cekPassword.value.yangPunya) ? 'anda' : 'pegawai ini'
  
            Swal.fire({
              title: 'Isikan email baru ' + nyebut,
              input: 'email',
              inputPlaceholder: 'Email baru',
              showCancelButton: true,
              scrollbarPadding: false,
              confirmButtonColor: SwalCustomColor.button.confirm,
              confirmButtonText: 'Selanjutnya',
            }).then((gantiEmail) => {
              if (gantiEmail.isConfirmed) {
  
                Swal.fire({
                  title: 'Konfirmasi Pengubahan Email',
                  text: 'Anda akan secara sengaja mengubah email ' + nyebut + ' menjadi "' + gantiEmail.value + '". Lanjutkan?',
                  icon: 'question',
                  showCancelButton: true,
                  confirmButtonText: 'Ya, ubah email!',
                  cancelButtonText: 'Batal',
                  scrollbarPadding: false,
                  focusCancel: true,
                  confirmButtonColor: SwalCustomColor.button.confirm,
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
                        url: location.pathname + '/ubah-email',
                        data: {
                          newEmail: gantiEmail.value,
                        },
                        dataType: 'json',
                        success: function () {
                          resolve({
                            apakahSukses: true,
                            msg: 'Email ' + nyebut + ' berhasil diubah!'
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
                    Swal.fire({
                      title: ((hasilUbah.value.apakahSukses) ? 'Pengubahan Berhasil!' : 'Error'),
                      text: capsFirstWord(hasilUbah.value.msg),
                      icon: ((hasilUbah.value.apakahSukses) ? 'success' : 'error'),
                      scrollbarPadding: false,
                      confirmButtonText: 'Tutup',
                      confirmButtonColor: SwalCustomColor.button.cancel
                    }).then(() => {
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


ubahPassword.addEventListener('click', () => {
  Swal.fire({
    title: 'Menu Ubah Password',
    text: 'Password adalah informasi rahasia yang diperlukan untuk masuk kedalam sistem. Dengan mengubah password, anda juga akan mengubah cara anda untuk mengakses sistem. Lanjutkan?',
    icon: 'info',
    showCancelButton: true,
    confirmButtonText: 'Ya, ubah password!',
    cancelButtonText: 'Batal',
    scrollbarPadding: false,
    focusCancel: true,
    confirmButtonColor: SwalCustomColor.button.confirm,
  }).then((prepare) => {
    if (prepare.isConfirmed) {
      Swal.fire({
        title: 'Isikan password anda',
        input: 'password',
        inputLabel: 'Sebagai konfirmasi bahwa ini adalah anda',
        inputPlaceholder: 'Password anda',
        showCancelButton: true,
        scrollbarPadding: false,
        confirmButtonColor: SwalCustomColor.button.confirm,
        confirmButtonText: 'Selanjutnya',
        inputValidator: (password) => {
          if (!password) {
            return 'Password tidak boleh kosong!'
          }
        },
        preConfirm: (password) => {
          Swal.showLoading()

          return new Promise(function (resolve, reject) {
            setTimeout(function () {
              reject({
                tipe: 'lokal',
                msg: 'Tidak ada respon dari server'
              })
            }, 5000)

            $.ajax({
              type: "POST",
              url: location.pathname + '/check',
              data: {
                pass: password
              },
              dataType: 'json',
              success: function (data) {
                resolve({
                  yangPunya: data.yangPunya,
                  pass: password
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
            Swal.hideLoading()
            if (error.tipe && error.tipe === 'lokal') {
              Swal.showValidationMessage(error.msg)
            } else {
              Swal.showValidationMessage(error)
            }

          })
        }
      }).then((cekPassword) => {
        if (cekPassword.isConfirmed) {
          const nyebut = (cekPassword.value.yangPunya) ? 'anda' : 'pegawai ini'

          Swal.fire({
            title: 'Isikan password baru ' + nyebut,
            html: printNewPasswordHTML(),
            showCancelButton: true,
            scrollbarPadding: false,
            confirmButtonColor: SwalCustomColor.button.confirm,
            confirmButtonText: 'Selanjutnya',
            preConfirm: () => {
              const pass = document.getElementById('swal-pass')
              const repass = document.getElementById('swal-repass')

              try {
                if (!pass.value) throw 'Password tidak boleh kosong'
                if (!repass.value) throw 'Konfirmasi password tidak boleh kosong!'
                if (pass.value !== repass.value) throw 'Kedua password tidak sama!'

                return {
                  pass: pass.value
                }

              } catch (error) {
                Swal.showValidationMessage(error)
              }

            }
          }).then((gantiPassword) => {
            if (gantiPassword.isConfirmed) {

              Swal.fire({
                title: 'Konfirmasi Pengubahan Password',
                text: 'Anda akan secara sengaja mengubah password ' + nyebut + '. Lanjutkan?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Ya, ubah password!',
                cancelButtonText: 'Batal',
                scrollbarPadding: false,
                focusCancel: true,
                confirmButtonColor: SwalCustomColor.button.confirm,
                preConfirm: () => {
                  Swal.showLoading()

                  try {
                    return new Promise(function (resolve, reject) {
                      setTimeout(function () {
                        reject({
                          tipe: 'lokal',
                          msg: 'Tidak ada respon dari server'
                        })
                      }, 5000)

                      $.ajax({
                        type: "PUT",
                        url: location.pathname + '/ubah-password',
                        data: {
                          passbaru: gantiPassword.value.pass,
                          passlama: cekPassword.value.pass
                        },
                        dataType: 'json',
                        success: function () {
                          resolve({
                            apakahSukses: true,
                            msg: 'Password ' + nyebut + ' berhasil diubah!'
                          })
                        },
                        error: function (xhr_1) {
                          reject({
                            tipe: 'lokal',
                            msg: (typeof xhr_1.responseJSON.error === 'string') ? xhr_1.responseJSON.error : 'Ada error pada server!'
                          })
                        }
                      })
                    })
                  } catch (error) {
                    if (error.tipe && error.tipe === 'lokal') {
                      return error
                    } else {
                      return {
                        apakahSukses: false,
                        msg: 'Ada kesalahan pada sistem. Silahkan coba lagi.'
                      }
                    }
                  }

                }
              }).then((hasilUbah) => {
                if (hasilUbah.isConfirmed) {
                  Swal.fire({
                    title: ((hasilUbah.value.apakahSukses) ? 'Pengubahan Berhasil!' : 'Error'),
                    text: capsFirstWord(hasilUbah.value.msg),
                    icon: ((hasilUbah.value.apakahSukses) ? 'success' : 'error'),
                    scrollbarPadding: false,
                    confirmButtonText: 'Tutup',
                    confirmButtonColor: SwalCustomColor.button.cancel
                  }).then(() => {
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




let printNewPasswordHTML = function () {

  const html = `
          <form>
            <div class="w-full px-6 space-y-6 flex flex-col text-left">   
                <div class="form-control">
                  <label for="swal-pass">
                    <span class="">Password Baru Anda<span class="text-error"> *</span></span>
                  </label>
                  <input type="password" id="swal-pass" class="input input-bordered"
                    placeholder="Password Baru" required maxlength="100" autocomplete="off">
                </div>

                <div class="form-control">
                  <label for="swal-repass">
                    <span class="">Konfirmasi Password Baru Anda<span class="text-error"> *</span></span>
                  </label>
                  <input type="password" id="swal-repass" class="input input-bordered"
                    placeholder="Konfirmasi Password Baru" required maxlength="100" autocomplete="off">
                </div>

            </div>
          </form>
      `
  return html
}
