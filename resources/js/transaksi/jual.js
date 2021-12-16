const { default: Swal } = require("sweetalert2");

$(function () {

  let btnBukaKamera = document.getElementById('bukaKamera')
  btnBukaKamera.addEventListener('click', (e) => {
    bukaKamera()
  })

  let btnBukaUlangKamera = document.getElementById('bukaUlangKamera')
  btnBukaUlangKamera.addEventListener('click', (e) => {
    bukaKamera()
  })

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


  let hasilKamera = function (gambar) {
    Swal.fire({
      showConfirmButton: true,
      showDenyButton: true,
      showCancelButton: true,
      cancelButtonText: 'Batal',
      denyButtonText: 'Ulangi',
      confirmButtonText: 'Gunakan',
      confirmButtonColor: '#4b6bfb',
      title: 'Gunakan Foto Ini?',
      imageUrl: gambar,
      imageWidth: 400,
      imageAlt: 'Custom image',
    }).then((hasil) => {
      if (hasil.isConfirmed) {
        cropGambar(gambar)
      }
      if (hasil.isDenied) {
        bukaKamera()
      }
    })
  }

  // 
  let cropGambar = function (imgData) {

    Swal.fire({
      title: 'Pratinjau Pemotongan Gambar',
      html: `
            <div>
              <img id="cropperWadah" src="` + imgData + `">
            </div>
          `,
      showCancelButton: true,
      willOpen: () => {
        const image = Swal.getPopup().querySelector('#cropperWadah')
        const cropper = new Cropper(image, {
          aspectRatio: 1,
          viewMode: 1,
          autoCropArea: 0,
          scalable: false,
          zoomable: false,
          movable: false,
          minCropBoxWidth: 200,
          minCropBoxHeight: 200,
        })

        const confirmButton = Swal.getPopup().querySelector('button.swal2-confirm')
        confirmButton.addEventListener('click', () => {
          Swal.showLoading()

        // ngeinput gambar ke image tag, masih belum nemu cara yang bagus
          let fotoBarang = document.getElementById('fotoBarang')
          fotoBarang.src = cropper.getCroppedCanvas().toDataURL()
          document.getElementById('fotoBarangBase64').value = cropper.getCroppedCanvas().toDataURL()

          if (document.getElementsByClassName('pesanerror').length > 0) global.removeElementsByClass('pesanerror')
        })

      },
    }).then((result) => {
      // $('div#wadahInputFoto').load(' div#wadahInputFoto > * ')
      if (result.isConfirmed) {
        console.log('berhasil')
      }
    })

  }

  // basic
  let formJual = document.getElementById('formJual')
  let btnSubmit = document.getElementById('btnSubmit')
  let formTambahan = document.getElementById('formTambahan')

  // input penting
  let idKelompok = document.getElementById('id')
  let model = document.getElementById('jualModel')
  let fotoBarang = document.getElementById('fotoBarang')
  let fotoBarangBase64 = document.getElementById('fotoBarangBase64')

  // side menu
  let finalTeksKadar = document.getElementById('finalTeksKadar')
  let finalTeksBentuk = document.getElementById('finalTeksBentuk')
  let finalTeksBerat = document.getElementById('finalTeksBerat')
  let finalTeksHarga = document.getElementById('finalTeksHarga')

  btnSubmit.addEventListener('click', (e) => {
    if (!idKelompok.value || idKelompok.value == '') {
      Swal.fire({
        title: 'Error!',
        html: 'Kelompok yang anda pilih tidak valid, kembali ke menu pemilihan kelompok',
        icon: 'error',
        timer: 2000,
        confirmButtonText: 'Tutup'
      }).then(() => {
        window.location = "/app/transaksi/penjualan"
      })
    }


    let errorMsg = document.createElement('p')
    errorMsg.classList.add('text-error', 'pesanerror')

    if (model.value === 'kosong') {
      e.preventDefault()
      model.classList.add('ring', 'ring-error')
      errorMsg.innerText = 'Pilih salah satu model perhiasan!'
      if (document.getElementsByClassName('pesanerror').length == 0) model.after(errorMsg)
      model.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest"
      });

      model.addEventListener('change', function () {
        if (model.value && model.value !== 'kosong') {
          model.classList.remove('ring', 'ring-error')
          global.removeElementsByClass('pesanerror')
        }
      })
    }
    else if (!fotoBarangBase64.value || fotoBarangBase64.value == '' || fotoBarang.src == '' || fotoBarang.src == window.location.href) {
      errorMsg.innerText = 'Anda harus mengambil gambar!'
      if (document.getElementsByClassName('pesanerror').length == 0) fotoBarangBase64.after(errorMsg)
      fotoBarang.parentElement.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest"
      });
    }
    else {
      Swal.fire({
        title: 'Simpan Transaksi?',
        html: 'Anda akan menyimpan transaksi penjualan <b>'+ finalTeksBentuk.innerText +' '+ finalTeksKadar.innerText +' '+ model.options[model.selectedIndex].text +'</b> seberat <b>'+ finalTeksBerat.innerText +'</b> gram dengan harga <b>' + finalTeksHarga.innerText +'</b>',
        icon: 'question',
        // iconColor: '#Dc3741',
        showCancelButton: true,
        confirmButtonText: 'Ya, simpan!',
        cancelButtonText: 'Batal',
        didOpen: () => {
          Swal.getCancelButton().focus()
        }
      }).then((result) => {
        if (result.isConfirmed) {
          btnSubmit.disabled = true

          let beratDesimalAsli = document.createElement('input')
          beratDesimalAsli.type = 'number'
          beratDesimalAsli.name = 'jualBeratDesimal'
          beratDesimalAsli.hidden = true
          beratDesimalAsli.classList.add('hidden', 'hidden-but-real')
          beratDesimalAsli.value = belakangKoma(document.getElementById('jualBeratDesimal').value)

          formTambahan.append(beratDesimalAsli)
          formJual.submit()
          
        }
      })
    }

  })

})


const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer)
    toast.addEventListener('mouseleave', Swal.resumeTimer)
  }
})


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