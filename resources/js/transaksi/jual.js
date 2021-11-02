const {
  default: Swal
} = require("sweetalert2");

let printHTML = function () {
  return `
        <div class="space-y-4">
            <video autoplay muted playsinline class="border w-full"></video>
            <div class="flex justify-center">
                <select class="select select-bordered w-full max-w-xs" id="sumberVideo">
                </select>
            </div>
        </div>
    `
}

$(function () {

  // atau on change, liat kebutuhan
  $("input[type='radio'][name='gender-pegawai']").on('click', function () {
    console.log($("input[type='radio'][name='gender-pegawai']:checked").val())
  });

  $('button#bukaKamera').on('click', function () {
    bukaKamera()
  });

  let bukaKamera = function () {
    Swal.fire({
      showConfirmButton: true,
      showCancelButton: true,
      cancelButtonText: 'Batal',
      confirmButtonText: 'Ambil Foto',
      confirmButtonColor: '#4b6bfb',
      title: 'Ambil Foto',
      html: printHTML(),
      willOpen: () => {
        var videoElement = document.querySelector('video');
        var videoSelect = document.querySelector('select#sumberVideo');

        videoSelect.onchange = getStream;

        Swal.showLoading(Swal.getConfirmButton())
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
          videoElement.srcObject = stream;
        }

        function handleError(error) {
          console.error('Error: ', error);
        }
      },
      preConfirm: () => {
        var videoElement = document.querySelector('video');
        let canvas = document.createElement("canvas")

        try {
          canvas.height = videoElement.videoHeight
          canvas.width = videoElement.videoWidth
          canvas.getContext("2d").drawImage(videoElement, 0, 0);

          return canvas.toDataURL("image/webp");
        } catch (error) {
          Swal.showValidationMessage('Ada error')
        }
      }
    }).then((capture) => {
      if (window.stream) {
        window.stream.getTracks().forEach(track => {
          track.stop();
        });
      }
      if (capture.isConfirmed) {
        if (capture.value) {
          hasilKamera(capture.value)
        }
      }
    })
  }


  let hasilKamera = function (url) {
    Swal.fire({
      showConfirmButton: true,
      showDenyButton: true,
      showCancelButton: true,
      cancelButtonText: 'Batal',
      denyButtonText: 'Ulangi',
      confirmButtonText: 'Gunakan',
      confirmButtonColor: '#4b6bfb',
      title: 'Gunakan Foto Ini?',
      imageUrl: (url) ? url : 'https://unsplash.it/400/200',
      imageWidth: 400,
      imageAlt: 'Custom image',
    }).then((hasil) => {
      if (hasil.isConfirmed) {
          let fotoBarang = document.getElementById('fotoBarang')
          fotoBarang.src = url
      }

      if (hasil.isDenied) {
        bukaKamera()
      }
    })
  }

})
