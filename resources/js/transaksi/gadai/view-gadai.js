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
