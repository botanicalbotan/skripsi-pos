import Swal from "sweetalert2"

const fileLogoToko = document.getElementById('fileLogoToko')
let sudahFoto = false

fileLogoToko.addEventListener('change', (e) => {
  let terpilih = e.target.files[0]

  if (terpilih) {
    const maxSize = 1000
    if (terpilih.size / 1024 > maxSize || terpilih.size <= 0) {
      Swal.fire({
        title: 'File terlalu besar!',
        icon: 'error',
        text: 'Pilih file foto berformat .jpg atau .png berukuran maskimal 1 MB.'
      })
      return
    }

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
        confirmButtonColor: global.SwalCustomColor.button.confirm,
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

    reader.readAsDataURL(terpilih)
  } else {
    sudahFoto = false
  }
})

function prepareKirim(base64) {
  Swal.fire({
    showConfirmButton: true,
    showCancelButton: true,
    cancelButtonText: 'Batal',
    confirmButtonText: 'Ya, ganti!',
    scrollbarPadding: false,
    confirmButtonColor: global.SwalCustomColor.button.confirm,
    title: 'Gunakan Foto Ini?',
    imageUrl: base64,
    imageWidth: 400,
    imageAlt: 'Custom image',
    text: 'Anda akan mengganti logo toko dengan gambar ini. Lanjutkan?',
  }).then((hasil) => {
    if (hasil.isConfirmed && sudahFoto) {
      $.post("/app/pengaturan/api/gantiLogo", {
          fileFoto: base64
        },
        function () {
          Swal.fire({
            title: 'Sukses!',
            text: 'Logo toko berhasil diubah',
            confirmButtonText: 'Tutup',
            icon: 'success',
            confirmButtonColor: global.SwalCustomColor.button.cancel
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
          confirmButtonColor: global.SwalCustomColor.button.cancel
        }).then(() => {
          location.href = location.pathname
        })
      })
    }
  })
}


const btHapusLogoToko = document.getElementById('btHapusLogoToko')
if (btHapusLogoToko) {
  btHapusLogoToko.addEventListener('click', () => {
    Swal.fire({
      title: 'Hapus Logo Toko?',
      showCancelButton: true,
      text: 'Dengan menghapus logo toko, toko akan kehilangan logo yang akan digunakan pada nota dan laporan. Lanjutkan?',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal',
      focusCancel: true,
      icon: 'error',
      confirmButtonColor: global.SwalCustomColor.button.deny,
      preConfirm: () => {
        Swal.showLoading(Swal.getConfirmButton())
        return new Promise(function (resolve, reject) {
          setTimeout(function () {
            Swal.hideLoading()
            reject('Tidak ada respon dari server')
          }, 5000)

          $.ajax({
            type: "DELETE",
            url: '/app/pengaturan/api/hapusLogo',
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