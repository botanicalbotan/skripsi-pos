import Swal from "sweetalert2"
// import Swal from "sweetalert2/dist/sweetalert2"

import { SwalCustomColor, capsFirstWord } from '../../fungsi.js'

const BASEURL = window.location.pathname
const namaBarang = document.getElementById('namaBarang')

// ======================== Ubah waktu cetak nota ======================
const btUbahDurasi = document.getElementById('btUbahDurasi')
const durasiEle = document.getElementById('durasiSekarang')

if (durasiEle && durasiEle.value && btUbahDurasi) {
  const durasiSekarang = durasiEle.value
  const beformatSekarang = new Date(durasiSekarang).toLocaleString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })

  btUbahDurasi.addEventListener('click', () => {
    Swal.fire({
      title: 'Pilih Waktu Baru',
      text: 'ewe',
      html: `<div class="form-control space-y-4 items-center">
        <label for="cetakNotaBaru">
          Masukkan waktu maksimal cetak nota baru untuk transaksi ini
        </label>
        <input type="datetime-local" name="durasiBaru" id="durasiBaru"
          class="input input-bordered w-full max-w-xs" value="${durasiSekarang}" min="${durasiSekarang}" step="1" required>
      </div>`,
      preConfirm: () => {
        const baru = Swal.getHtmlContainer().querySelector('#durasiBaru')
        baru.addEventListener('change', () => {
          Swal.resetValidationMessage()
        })

        if (!baru.checkValidity()) {
          Swal.showValidationMessage('Waktu baru harus lebih dari ' + beformatSekarang)
        }

        if (!baru.value) {
          Swal.showValidationMessage('Masukan wajib diisi')
        }

        return baru.value
      },
      confirmButtonText: 'Simpan',
      confirmButtonColor: SwalCustomColor.button.confirm,
      showCancelButton: true,
      cancelButtonText: 'Batal',
      cancelButtonColor: SwalCustomColor.button.cancel,
      scrollbarPadding: false
    }).then((baru) => {
      if (baru.isConfirmed) {
        const berformatBaru = new Date(baru.value).toLocaleString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })

        Swal.fire({
          title: 'Konfirmasi Pengubahan',
          html: `Anda akan mengubah maksimal waktu cetak nota untuk transaksi ini menjadi <span class="font-semibold">${berformatBaru}</span>. Lanjutkan?`,
          confirmButtonText: 'Ya, simpan!',
          icon: 'question',
          confirmButtonColor: SwalCustomColor.button.confirm,
          showCancelButton: true,
          cancelButtonText: 'Batal',
          cancelButtonColor: SwalCustomColor.button.cancel,
          allowOutsideClick: false,
          allowEscapeKey: false,
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
                url: BASEURL + '/gantiDurasi',
                data: {
                  durasiBaru: baru.value,
                },
                dataType: 'json',
                success: function () {
                  resolve({
                    apakahSukses: true,
                    msg: 'Durasi cetak nota transaksi berhasil diperbarui!'
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

  })
}

// ============================= Hapus PJ ==============================
const formHapusPJ = document.getElementById('formHapusPJ')
const hapusPJ = document.getElementById('hapusPJ')

if (formHapusPJ && hapusPJ) {
  hapusPJ.addEventListener('click', (e) => {
    Swal.fire({
      title: 'Yakin untuk menghapus?',
      text: 'Anda akan menghapus penjualan "' + namaBarang.innerText + '", dan penjualan yang dihapus tidak dapat dikembalikan.',
      icon: 'question',
      iconColor: SwalCustomColor.icon.error,
      showCancelButton: true,
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal',
      scrollbarPadding: false,
      focusCancel: true,
      confirmButtonColor: SwalCustomColor.button.deny,
    }).then((result) => {
      if (result.isConfirmed) {
        formHapusPJ.action = BASEURL + '?_method=DELETE'
        formHapusPJ.submit()
      }
    })

  })
}

function swalSelesai(selesai) {
  return Swal.fire({
    title: ((selesai.value.apakahSukses) ? 'Pengubahan Berhasil!' : 'Error'),
    text: capsFirstWord(selesai.value.msg),
    icon: ((selesai.value.apakahSukses) ? 'success' : 'error'),
    scrollbarPadding: false,
    confirmButtonText: 'Tutup',
    confirmButtonColor: SwalCustomColor.button.cancel
  })
}