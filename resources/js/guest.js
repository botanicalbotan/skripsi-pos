import Swal from 'sweetalert2'
import '../css/app.css'

import {
  SwalCustomColor,
  removeElementsByClass
} from './fungsi'

// ntar ganti jquery ke ajax yang lain, soalnya lu ga make
global.$ = require('jquery');

$.ajaxSetup({
  headers: {
    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
  }
});

let IP = ''

$.get("https://api.ipify.org?format=jsonp&callback=?", {},
  function (data) {
    IP = data.ip
  },
  "json"
);


const basePage = document.getElementById('base-page').dataset.pagename

if (basePage === 'lupa-password') {
  const username = document.getElementById('username')
  const btCari = document.getElementById('btCari')

  let eventKodepro = false

  btCari.addEventListener('click', () => {
    let errorMsg = document.createElement('p')
    errorMsg.classList.add('text-error', 'pesanerror')

    // cek username
    if (!username.value || username.value == '') {
      username.classList.add('input-error', 'bg-error', 'bg-opacity-10')
      errorMsg.innerText = 'Pilih salah satu kode!'
      if (document.getElementsByClassName('pesanerror').length == 0) username.after(errorMsg)
      username.scrollIntoView({
        block: "center",
        inline: "nearest"
      });

      if (!eventKodepro) {
        username.addEventListener('change', function () {
          if (username.value && username.value !== '') {
            username.classList.remove('input-error', 'bg-error', 'bg-opacity-10')
            removeElementsByClass('pesanerror')
          }
        })
        eventKodepro = true
      }

      return false
    }

    // cek IP
    if(!IP) return console.error('ip belom keload')

    // ========================================= STEP 1 =========================================
    Swal.fire({
      title: 'Mencari akun anda...',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      scrollbarPadding: false,
      didOpen: () => {
        Swal.showLoading()

        setTimeout(() => {
          $.post("/lupa-password/cari", {
              un: username.value,
              ip: IP
            },
            function (data, textStatus, jqXH54R) {
              // ====================================== STEP 2 =====================================
              Swal.fire({
                icon: 'info',
                title: 'Verifikasi Keamanan',
                text: `Link akses untuk merubah password telah dikirim ke email anda: ${data.sensor}. Valid untuk ${data.menit} menit kedepan.`,
                confirmButtonColor: SwalCustomColor.button.cancel,
                confirmButtonText: 'Tutup',
                scrollbarPadding: false,
              }).then(() => {
                window.location = window.location.pathname
              })
            },
            "json"
          ).catch((xhr) => {
            swalError(xhr.responseJSON.error)
          })
        }, 1000)


      }
    })

  })
}


if (basePage === 'lupa-next') {
  const formUbah = document.getElementById('formUbah')
  const btUbah = document.getElementById('btUbah')

  const ip = document.getElementById('ip')
  const password = document.getElementById('password')
  const repassword = document.getElementById('repassword')

  btUbah.addEventListener('click', () =>{
    // cek validitas
    if(!formUbah.reportValidity()) return

    // cek input
    if(!password.value || !repassword.value || password.value !== repassword.value) return

    // cek IP
    if(!IP) return console.error('ip belom keload')

    Swal.fire({
      title: 'Yakin untuk mengubah?',
      text: 'Pastikan data yang anda isikan sudah benar!',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: SwalCustomColor.button.confirm,
      confirmButtonText: 'Ya, ubah!',
      cancelButtonText: 'Batal',
      scrollbarPadding: false,
      focusCancel: true,
    }).then((result)=>{
      if(result.isConfirmed){
        ip.value = IP

        formUbah.action = window.location.pathname + window.location.search
        formUbah.method = 'POST'
        formUbah.submit()
      }
    })
  })

}

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
