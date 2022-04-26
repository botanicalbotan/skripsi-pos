// import print from 'print-js'
const Print = require('print-js')
const { default: Swal } = require('sweetalert2')

$(function () {
  const cdMenit = document.getElementById('cdMenit')
  const cdDetik = document.getElementById('cdDetik')
  const teksCetak = document.getElementById('teksCetak')
  const btCetak = document.getElementById('btCetak')
  let bolehCetak = false

  // kalo takut id diapa2in, bisa ngambil dari qs
  const qsParam = new URLSearchParams(window.location.search)
  const idDariParam = qsParam.get('tid')

  if(btCetak){
    btCetak.addEventListener('click', () => {
      if(bolehCetak){

        Print({
          printable: '/app/cumaData/cetakNota?idpj=' + idDariParam,
          type: 'pdf',
          showModal: true, // jadiin false kalo gamau ada loading
          modalMessage: 'Menyiapkan dokumen...',
          onError: (error) =>{
            console.log(error)
            if(error === 'Forbidden'){
              Swal.fire({
                title: 'Akses Kadaluarsa',
                text: 'Nota transaksi tidak lagi dapat dicetak!',
                icon: 'error',
                confirmButtonText: 'Tutup',
                confirmButtonColor: global.SwalCustomColor.button.cancel
              })
            }

            if(error === 'Bad Request'){
              Swal.fire({
                title: 'Permintaan Tidak Valid',
                text: 'Record penjualan tidak valid atau ada masalah saat menyiapkan nota!',
                icon: 'error',
                confirmButtonText: 'Tutup',
                confirmButtonColor: global.SwalCustomColor.button.cancel
              })
            }
          }
        })

      }
    })
  }


  $.get("/app/cumaData/maxCetakPenjualan", {
      tid: idDariParam
    },
    function (data, textStatus, jqXHR) {
      let countDownDate = new Date(data.max).getTime();

      // Update the count down every 1 second
      let intervalId = setInterval(function () {

        let now = new Date().getTime();
        let distance = countDownDate - now;

        // Time calculations for days, hours, minutes and seconds
        let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        let seconds = Math.floor((distance % (1000 * 60)) / 1000);

        refreshCD(minutes, seconds)
        bolehCetak = true

        // If the count down is over, write some text
        if (distance < 0) {
          clearInterval(intervalId);
          refreshCD(0, 0)
          bolehCetak = false
          if(btCetak) btCetak.remove()
          console.log('EXPIRED')
        }
      }, 1000);
    },
    "json"
  ).fail(() => {
    refreshCD(0, 0)
    bolehCetak = false
    if(btCetak) btCetak.remove()
    console.log('EXPIRED')
  })


  const refreshCD = function (menit, detik) {
    cdMenit.style.setProperty('--value', menit)
    cdDetik.style.setProperty('--value', detik)
  }


})
