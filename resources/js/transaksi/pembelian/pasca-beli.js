const cdMenit = document.getElementById('cdMenit')
const cdDetik = document.getElementById('cdDetik')
const btGadai = document.getElementById('btGadai')
let bolehGadai = false

// kalo takut id diapa2in
const id = document.getElementById('id').value

if(cdMenit && cdDetik){ // kalo ada, berarti di emang ada gadai, kalau gaada gaperlu minta data
    $.get("/app/cuma-data/max-pengajuan-gadai", {
        tid: id
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
          bolehGadai = true
    
          // If the count down is over, write some text
          if (distance < 0) {
            clearInterval(intervalId);
            cdMati()
          }
        }, 1000);
      },
      "json"
    ).fail(() => {
      cdMati()
    })
}

if(btGadai){
    btGadai.addEventListener('click', ()=> {
        if(bolehGadai){
          location.href = '/app/transaksi/pembelian/pengajuan-gadai?tid=' + id
        }
    })
}

const cdMati = function () {
  refreshCD(0, 0)
  bolehGadai = false
  if(btGadai) btGadai.remove()
  console.log('EXPIRED')
}

const refreshCD = function (menit, detik) {
    cdMenit.style.setProperty('--value', menit)
    cdDetik.style.setProperty('--value', detik)
}