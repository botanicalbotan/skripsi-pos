// import Swal from "sweetalert2"
import Swal from "sweetalert2/dist/sweetalert2";

import { SwalCustomColor } from '../fungsi.js'

const setStatusAktif = document.getElementById('setStatusAktif')
const setStatusKeluar = document.getElementById('setStatusKeluar')

const tanggalLahir = document.getElementById('tanggalLahir')
const wadahTanggalAktif = document.getElementById('wadahTanggalAktif')
const tanggalMulaiAktif = document.getElementById('tanggalMulaiAktif')

tanggalLahir.max = new Date().toISOString().split("T")[0]
tanggalMulaiAktif.max = new Date().toISOString().split("T")[0]
tanggalMulaiAktif.value = new Date().toISOString().split("T")[0]

function setStatus(i = 'aktif') {
  if (i === 'aktif') {
    wadahTanggalAktif.classList.remove('hidden')
    tanggalMulaiAktif.required = true
  } else {
    wadahTanggalAktif.classList.add('hidden')
    tanggalMulaiAktif.required = false
  }
}

setStatusAktif.addEventListener('click', ()=> {
  setStatus('aktif')
})

setStatusKeluar.addEventListener('click', ()=> {
  setStatus('keluar')
})

const statusPegawai = document.querySelector('input[name="status"]:checked').value
setStatus(statusPegawai)

const fotoPegawai = document.getElementById('fotoPegawai')
const fileFotoPegawai = document.getElementById('fileFotoPegawai')
const fotoPegawaiBase64 = document.getElementById('fotoPegawaiBase64')

fileFotoPegawai.addEventListener('change', (e) => {
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
        confirmButtonColor: SwalCustomColor.button.confirm,
        willOpen: () => {
          const image = Swal.getPopup().querySelector('#cropperWadah')
          const cropper = new Cropper(image, {
            aspectRatio: 1,
            viewMode: 1,
            autoCropArea: 0,
            scalable: false,
            zoomable: false, // biasanya false
            movable: false,
            minCropBoxWidth: 200,
            minCropBoxHeight: 200,
          })

          const confirmButton = Swal.getConfirmButton()

          confirmButton.addEventListener('click', () => {
            Swal.showLoading()

            fotoPegawai.src = cropper.getCroppedCanvas().toDataURL()
            fotoPegawaiBase64.value = cropper.getCroppedCanvas().toDataURL()
          })

        },
      })

    }

    reader.readAsDataURL(terpilih)
  }
})


const wadahEmail = document.getElementById('wadahEmail')
const email = document.getElementById('email')

const jabatan = document.getElementById('jabatan')
jabatan.addEventListener('change', (e) => {
  if (e.target.value == 'pemiliktoko') {
    wadahEmail.classList.remove('hidden')
    email.required = true
  } else {
    wadahEmail.classList.add('hidden')
    email.required = false
  }
})

// ===================================================== INI FORM AMA SUBMIT ====================================================
const pegawaiBaru = document.getElementById('pegawaiBaru')
const btSubmit = document.getElementById('btSubmit')

btSubmit.addEventListener('click', () => {
  if (jabatan.value == 'kosong' || !['karyawan', 'kepalatoko', 'pemiliktoko'].includes(jabatan.value)) {
    jabatan.scrollIntoView({
      block: "center",
      inline: "nearest"
    });

    return
  }

  if (!pegawaiBaru.reportValidity()) return

  Swal.fire({
    title: 'Yakin untuk menyimpan?',
    text: 'Pastikan data yang anda isikan sudah benar!',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: SwalCustomColor.button.confirm,
    confirmButtonText: 'Ya, simpan!',
    cancelButtonText: 'Batal',
    scrollbarPadding: false,
    focusCancel: true,
  }).then((result) => {
    if (result.isConfirmed) {
      pegawaiBaru.action = '/app/pegawai'
      pegawaiBaru.submit()
    }
  })
})
