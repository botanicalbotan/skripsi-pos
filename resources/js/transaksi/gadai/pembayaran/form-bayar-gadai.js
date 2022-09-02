// import Swal from "sweetalert2"
import Swal from "sweetalert2/dist/sweetalert2"
import { SwalCustomColor, removeElementsByClass } from '../../../fungsi.js'

const kekuranganVal = parseInt(document.getElementById('kekurangan').value)
const nominal = document.getElementById('nominal')

const btSubmit = document.getElementById('btSubmit')
const formPembayaran = document.getElementById('formPembayaran')

let eventNominal = false

btSubmit.addEventListener('click', () => {
  let errorMsg = document.createElement('p')
  errorMsg.classList.add('text-error', 'pesanerror')

  let parsedNominal = parseInt(nominal.value)

  if (!formPembayaran.reportValidity()) return

  if (parsedNominal <= 0 || !nominal.value || parsedNominal > kekuranganVal) {
    nominal.classList.add('input-error', 'bg-error')
    errorMsg.innerText = (parsedNominal.value > kekuranganVal)? `Nominal pembayaran tidak boleh melebihi kekurangan pembayaran` : `Nominal tidak boleh nol!`
    
    if (document.getElementsByClassName('pesanerror').length == 0) nominal.after(errorMsg)
    nominal.scrollIntoView({
      block: "center",
      inline: "nearest"
    });

    if (!eventNominal) {
      nominal.addEventListener('change', function () {
        if (nominal.value && nominal.value !== 0 && parsedNominal <= kekuranganVal) {
          nominal.classList.remove('input-error', 'bg-error')
          removeElementsByClass('pesanerror')
        }
      })
      eventNominal = true
    }

    return false
  }


  Swal.fire({
    title: 'Simpan pembayaran gadai?',
    text: 'Pastikan data yang anda isikan sudah benar!',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Ya, simpan!',
    confirmButtonColor: SwalCustomColor.button.confirm,
    cancelButtonText: 'Batal',
    scrollbarPadding: false,
    focusCancel: true,
  }).then((result) => {
    if (result.isConfirmed) {
      formPembayaran.action = window.location.pathname.slice(0, -6)
      formPembayaran.method = 'POST'
      formPembayaran.submit()
    }
  })

})
