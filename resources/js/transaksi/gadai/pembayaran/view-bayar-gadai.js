// import Swal from "sweetalert2"
import Swal from "sweetalert2/dist/sweetalert2"
import { SwalCustomColor } from '../../../fungsi'

const judulPembayaran = document.getElementById('judulPembayaran').textContent
const btHapus = document.getElementById('btHapus')
const formHapus = document.getElementById('formHapus')

btHapus.addEventListener('click', ()=>{

    Swal.fire({
        title: 'Yakin untuk menghapus?',
        text: 'Anda akan menghapus pembayaran "'+ judulPembayaran +'", dan pembayaran yang dihapus tidak dapat dikembalikan. Jika gadai sudah lunas, statusnya berubah menjadi "berjalan / terlambat".',
        icon: 'question',
        iconColor: SwalCustomColor.icon.error,
        showCancelButton: true,
        confirmButtonText: 'Ya, hapus!',
        cancelButtonText: 'Batal',
        scrollbarPadding: false,
        focusCancel: true,
        confirmButtonColor: SwalCustomColor.button.deny,
      }).then((result)=>{
        if(result.isConfirmed){
          formHapus.action = window.location.pathname + '?_method=DELETE'
          formHapus.submit()
        }
      })
})