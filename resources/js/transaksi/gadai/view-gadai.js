// import Swal from "sweetalert2"
import Swal from "sweetalert2/dist/sweetalert2"

import {
  SwalCustomColor,
} from '../../fungsi.js'


const idGadai = document.getElementById('id').value

const btNIKKTP = document.getElementById('btNIKKTP')
btNIKKTP.addEventListener('click', () => {
  $.get(`/app/transaksi/gadai/${idGadai}/nik`, {},
    function (data, textStatus, jqXHR) {
      let nik = data.nik

      Swal.fire({
        imageUrl: `/app/cuma-data/foto-secret/gadai/${idGadai}`,
        text: 'NIK: ' + nik,
        confirmButtonText: 'Tutup',
        confirmButtonColor: SwalCustomColor.button.cancel
      })
    },
    "json"
  ).fail((jqXHR) => {
    swalError()
  })


})

function swalError(error = '', judul = '') {
  Swal.fire({
    icon: 'error',
    title: (judul) ? judul : 'Error',
    scrollbarPadding: false,
    text: (error) ? error : 'Ada masalah pada server!',
    confirmButtonText: 'Tutup',
    confirmButtonColor: SwalCustomColor.button.cancel
  })
}


// =============================== batalkan gadai ================================
const btBatalGadai = document.getElementById('btBatalGadai')
const formBatalGadai = document.getElementById('formBatalGadai')
const judulGadai = document.getElementById('judulGadai')

if (btBatalGadai && formBatalGadai) {
  btBatalGadai.addEventListener('click', () => {
    Swal.fire({
      title: 'Yakin untuk batal gadai?',
      text: 'Anda akan membatalkan gadai "' + judulGadai.innerText + '", dan gadai yang dibatalkan tidak dapat dikembalikan.',
      icon: 'info',
      iconColor: SwalCustomColor.icon.error,
      showCancelButton: true,
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal',
      scrollbarPadding: false,
      confirmButtonColor: SwalCustomColor.button.deny,
      focusCancel: true,
    }).then((result) => {
      if (result.isConfirmed) {
        formBatalGadai.action = window.location.pathname + '?_method=DELETE'
        formBatalGadai.submit()
      }
    })
  })
}