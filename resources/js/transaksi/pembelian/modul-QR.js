import Swal from "sweetalert2"
import jsQR from "jsqr"

import { SwalCustomColor } from '../../fungsi.js'

let urlKeQR = '/app/transaksi/pembelian/qr?kode='

function cariTransaksiDariQR(kode){
  $.ajaxSetup({
    headers: {
      'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
    }
  });

  $.post("/app/transaksi/pembelian/qr/cari", { scan:kode },
    function (data, textStatus, jqXHR) {
      if(!data.kodePenjualan) throw 'Error'

      Swal.fire({
        title: 'Konfirmasi Data Transaksi',
        html: 'Anda akan menjual perhiasan <u class="text-primary">' + data.namaQR + '</u>. Apakah data tersebut sesuai dengan yang anda cari?',
        imageUrl: '/app/cuma-data/foto/penjualan/' + data.idPJ,
        imageWidth: 400,
        confirmButtonText: 'Ya, benar!',
        showCancelButton: true,
        scrollbarPadding: false,
        cancelButtonText: 'Batal',
        confirmButtonColor: SwalCustomColor.button.confirm,
        focusCancel: true
      }).then((result)=>{
        if(result.isConfirmed){
          urlKeQR += data.kodePenjualan
          window.location = urlKeQR
        }
      })
    },
    "json"
  ).fail((xhr) => {
    if(xhr.responseJSON.error) swalError(xhr.responseJSON.error, 'Transaksi Tidak Ditemukan')
    else swalError()
  })
}

export function bukaScanner () {
  let data
    Swal.fire({
      showConfirmButton: false,
      showCancelButton: true,
      cancelButtonText: 'Tutup Kamera',
      title: 'Pindai Kode QR',
      scrollbarPadding: false,
      html: printKameraHTML(),
      willOpen: () => {
        var video = document.createElement("video");
        var videoSelect = document.querySelector('select#sumberVideo');
        var canvasElement = document.getElementById("canvas");
        var canvas = canvasElement.getContext("2d");

        videoSelect.onchange = getStream;

        function drawLine(begin, end, color) {
          canvas.beginPath();
          canvas.moveTo(begin.x, begin.y);
          canvas.lineTo(end.x, end.y);
          canvas.lineWidth = 4;
          canvas.strokeStyle = color;
          canvas.stroke();
        }

        Swal.showLoading(Swal.getCancelButton())
        getStream().then(getDevices).then(gotDevices).then(Swal.hideLoading);

        function getDevices() {
          // AFAICT in Safari this only gets default devices until gUM is called :/
          return navigator.mediaDevices.enumerateDevices();
        }

        function gotDevices(deviceInfos) {
          window.deviceInfos = deviceInfos; // make available to console
          console.log('Available input and output devices:', deviceInfos);
          for (const deviceInfo of deviceInfos) {
            const option = document.createElement('option');
            option.value = deviceInfo.deviceId;
            if (deviceInfo.kind === 'videoinput') {
              option.text = deviceInfo.label || `Camera ${videoSelect.length + 1}`;
              videoSelect.appendChild(option);
            }
          }
        }

        function getStream() {
          if (window.stream) {
            window.stream.getTracks().forEach(track => {
              track.stop();
            });
          }
          const videoSource = videoSelect.value;
          const constraints = {
            video: {
              deviceId: videoSource ? {
                exact: videoSource
              } : undefined
            }
          };
          return navigator.mediaDevices.getUserMedia(constraints).
            then(gotStream).catch(handleError);
        }

        function gotStream(stream) {
          window.stream = stream; // make stream available to console
          videoSelect.selectedIndex = [...videoSelect.options].
            findIndex(option => option.text === stream.getVideoTracks()[0].label);
          video.srcObject = stream;
          video.setAttribute("playsinline", true); // required to tell iOS safari we don't want fullscreen
          video.play();
          requestAnimationFrame(tick);
        }

        function handleError(error) {
          console.error('Error: ', error);
        }

        function tick() {
          if (typeof loadingMessage == 'undefined') {
            console.log('tutup')
            return;
          }
          loadingMessage.innerText = "⌛ Loading video..."
          if (video.readyState === video.HAVE_ENOUGH_DATA) {
            loadingMessage.hidden = true;
            canvasElement.hidden = false;

            canvasElement.height = video.videoHeight;
            canvasElement.width = video.videoWidth;
            canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
            var imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);
            var code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: "dontInvert",
            });
            if (code) {
              drawLine(code.location.topLeftCorner, code.location.topRightCorner, "#FF3B58");
              drawLine(code.location.topRightCorner, code.location.bottomRightCorner, "#FF3B58");
              drawLine(code.location.bottomRightCorner, code.location.bottomLeftCorner, "#FF3B58");
              drawLine(code.location.bottomLeftCorner, code.location.topLeftCorner, "#FF3B58");

              data = code.data
              return Swal.clickConfirm();
              // return code.data
            } else {
              // something kalo ga kedetek
            }
          }
          requestAnimationFrame(tick);
        }
      },
    }).then((capture) => {
      if (window.stream) {
        window.stream.getTracks().forEach(track => {
          track.stop();
        });
      }
      if (capture.isConfirmed) {
        if(data){
          console.log(data)
          cariTransaksiDariQR(data)
        }
      }
    })
  }

  
let printKameraHTML = function () {
    return `
          <div class="space-y-4">
          <div class="px-2" id="loadingMessage">🎥 Tidak dapat mengakses kamera, pastikan webcam anda menyala dan terhubung dengan baik</div>
          <canvas id="canvas" class="w-full" hidden></canvas>
              <div class="flex justify-center">
                  <select class="select select-bordered w-full max-w-xs" id="sumberVideo">
                  </select>
              </div>
          </div>
      `
  }

  function swalError (error = '', judul = '') {
    Swal.fire({
      icon: 'error',
      title: (judul)? judul: 'Error',
      scrollbarPadding: false,
      text: (error)? error : 'Ada masalah pada server!',
      confirmButtonText: 'Tutup',
      confirmButtonColor: SwalCustomColor.button.cancel
    })
  }