import Swal from "sweetalert2"
import {
    SwalCustomColor,
    capsFirstWord
  } from '../../fungsi.js'

export const swalPrepareUbah = Swal.mixin({
  icon: 'info',
  showCancelButton: true,
  confirmButtonText: 'Ya, lanjutkan!',
  cancelButtonText: 'Batal',
  scrollbarPadding: false,
  focusCancel: true,
  confirmButtonColor: SwalCustomColor.button.confirm,
})

export const swalKonfirmasiUbah = Swal.mixin({
  icon: 'question',
  showCancelButton: true,
  confirmButtonText: 'Ya, simpan!',
  cancelButtonText: 'Batal',
  scrollbarPadding: false,
  allowOutsideClick: false,
  focusCancel: true,
  confirmButtonColor: SwalCustomColor.button.confirm,
})

/**
 * Swal Selesai
 * @selesai resolve dari promise Swal
 */
export function swalSelesai(selesai) {
  return Swal.fire({
    title: ((selesai.value.apakahSukses) ? 'Pengubahan Berhasil!' : 'Error'),
    text: capsFirstWord(selesai.value.msg),
    icon: ((selesai.value.apakahSukses) ? 'success' : 'error'),
    scrollbarPadding: false,
    confirmButtonText: 'Tutup',
    confirmButtonColor: SwalCustomColor.button.cancel
  })
}

export function swalCekAkun() {
  return Swal.fire({
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
          url: '/app/pengaturan/api/check-akun',
          data: {
            pass: password
          },
          dataType: 'json',
          success: function (data) {
            resolve({
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
  })
}
