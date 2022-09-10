// import Swal from "sweetalert2"
import Swal from "sweetalert2/dist/sweetalert2"

import { SwalCustomColor, rupiahParser, capsFirstWord, removeElementsByClass } from '../../fungsi.js'

// ======================================== SUPER ==============================================
let sudahFotoKTP = false
let sudahFotoPerhiasan = false
let inputId = document.getElementById('id') // di set balik kesini pas mau ngirim
let idPembelian = inputId.value
let hargaBeli = document.getElementById('nominalGadai').value
const nominalGadai = parseInt(hargaBeli)
const adaFotoBarang = (document.getElementById('fotoPerhiasanBase64').value == 'ada')
const adaFotoKTP = (document.getElementById('fotoKTPBase64').value == 'ada')

// ===================================== FORM & SUBMIT =========================================
const namaPenggadai = document.getElementById('namaPenggadai')

const fotoKTP = document.getElementById('fotoKTP') // img
const fotoKTPBase64 = document.getElementById('fotoKTPBase64') // input form
const wadahFoto = document.getElementById('wadahFoto')

const fotoPerhiasan = document.getElementById('fotoPerhiasan') // img
const fotoPerhiasanBase64 = document.getElementById('fotoPerhiasanBase64') // input form
const wadahFotoPerhiasan = document.getElementById('wadahFotoPerhiasan')

// ========================= KHUSUS EDIT =================================
const indiGambarPerhiasanBerubah = document.getElementById('indiGambarPerhiasanBerubah')
const indiGambarKTPBerubah = document.getElementById('indiGambarKTPBerubah')


const btLihatDetail = document.getElementById('btLihatDetail')
const tanggalTenggat = document.getElementById('tanggalTenggat')

function resetFoto(isPerhiasan) {
    if (isPerhiasan) {
        wadahFotoPerhiasan.classList.remove('bg-error', 'bg-opacity-10')
        wadahFotoPerhiasan.classList.add('bg-base-300')
    } else {
        wadahFoto.classList.remove('bg-error', 'bg-opacity-10')
        wadahFoto.classList.add('bg-base-300')
    }

    removeElementsByClass('pesanerror')
}

const formGadai = document.getElementById('formGadai')
const btSubmit = document.getElementById('btSubmit')

btSubmit.addEventListener('click', () => {
    let errorMsg = document.createElement('p')
    errorMsg.classList.add('text-error', 'pesanerror')

    // cek foto KTP, masukin di constrain
    if ((!sudahFotoKTP || !fotoKTPBase64.value || fotoKTP.naturalHeight == 0) && !adaFotoKTP) {
        wadahFoto.classList.remove('bg-base-300')
        wadahFoto.classList.add('bg-error', 'bg-opacity-10')

        errorMsg.innerText = 'Anda harus mengambil foto KTP penggadai!'
        if (document.getElementsByClassName('pesanerror').length == 0) fotoKTPBase64.after(errorMsg)
        wadahFoto.scrollIntoView({
            // behavior: "smooth",
            block: "center",
            inline: "nearest"
        });

        // ngga ada bind event macem yang lain, tapi langsung pas akses kamera
        return
    }

    if ((!sudahFotoPerhiasan || !fotoPerhiasanBase64.value || fotoPerhiasan.naturalHeight == 0) && !adaFotoBarang) {
        wadahFotoPerhiasan.classList.remove('bg-base-300')
        wadahFotoPerhiasan.classList.add('bg-error', 'bg-opacity-10')

        errorMsg.innerText = 'Anda harus mengambil foto perhiasan yang akan digadaikan!'
        if (document.getElementsByClassName('pesanerror').length == 0) fotoPerhiasanBase64.after(errorMsg)
        wadahFotoPerhiasan.scrollIntoView({
            // behavior: "smooth",
            block: "center",
            inline: "nearest"
        });

        return
    }

    if (!formGadai.reportValidity()) return

    Swal.fire({
        title: 'Konfirmasi Pengubahan',
        text: `Anda akan menyimpan pengubahan data gadai ${rupiahParser(nominalGadai)} oleh ${capsFirstWord(namaPenggadai.value)} dengan tenggat waktu tanggal ${new Date(tanggalTenggat.value).toLocaleDateString('id-ID', { month: 'long', day: 'numeric', year: 'numeric' })}. Lanjutkan?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Ya, simpan!',
        scrollbarPadding: false,
        confirmButtonColor: SwalCustomColor.button.confirm,
        cancelButtonText: 'Batal',
        focusCancel: true,
    }).then((result) => {
        if (result.isConfirmed) {

            if (sudahFotoKTP) indiGambarKTPBerubah.value = "ganti"
            if (sudahFotoPerhiasan) indiGambarPerhiasanBerubah.value = "ganti"

            inputId.value = idPembelian
            formGadai.method = 'POST'
            formGadai.action = window.location.pathname.slice(0, -5) + '?_method=PUT'
            formGadai.submit()
        }
    })
})

btLihatDetail.addEventListener('click', () => {
    window.open('/app/transaksi/pembelian/' + idPembelian, '_blank');
})

// ==================================================== KAMERA FULL ==========================================================
const btnBukaKamera = document.getElementById('bukaKamera')
btnBukaKamera.addEventListener('click', (e) => {
    bukaKamera(false)
})

const btnBukaUlangKamera = document.getElementById('bukaUlangKamera')
btnBukaUlangKamera.addEventListener('click', (e) => {
    bukaKamera(false)
})

const btnBukaKameraPerhiasan = document.getElementById('bukaKameraPerhiasan')
btnBukaKameraPerhiasan.addEventListener('click', () => {
    bukaKamera(true)
})

const btnBukaUlangKameraPerhiasan = document.getElementById('bukaUlangKameraPerhiasan')
btnBukaUlangKameraPerhiasan.addEventListener('click', () => {
    bukaKamera(true)
})

let bukaKamera = function (isPerhiasan) {
    Swal.fire({
        showConfirmButton: true,
        showCancelButton: true,
        cancelButtonText: 'Batal',
        confirmButtonText: 'Ambil Foto',
        scrollbarPadding: false,
        confirmButtonColor: SwalCustomColor.button.confirm,
        title: 'Ambil Foto',
        html: printHTML(),
        willOpen: () => {
            var videoElement = Swal.getHtmlContainer().querySelector('video');
            var videoSelect = Swal.getHtmlContainer().querySelector('select#sumberVideo');

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
                hasilKamera(capture.value, isPerhiasan)
            }
        }
    })
}


let hasilKamera = function (gambar, isPerhiasan) {
    Swal.fire({
        showConfirmButton: true,
        showDenyButton: true,
        showCancelButton: true,
        cancelButtonText: 'Batal',
        denyButtonText: 'Ulangi',
        confirmButtonText: 'Gunakan',
        scrollbarPadding: false,
        confirmButtonColor: SwalCustomColor.button.confirm,
        title: 'Gunakan Foto Ini?',
        imageUrl: gambar,
        imageWidth: 400,
        imageAlt: 'Custom image',
    }).then((hasil) => {
        if (hasil.isConfirmed) {
            cropGambar(gambar, isPerhiasan)
        }
        if (hasil.isDenied) {
            bukaKamera(isPerhiasan)
        }
    })
}

//
let cropGambar = function (imgData, isPerhiasan) {

    Swal.fire({
        title: 'Pratinjau Pemotongan Gambar',
        html: `
          <div>
            <img id="cropperWadah" src="` + imgData + `">
          </div>
        `,
        showCancelButton: true,
        scrollbarPadding: false,
        allowOutsideClick: false,
        confirmButtonColor: SwalCustomColor.button.confirm,
        willOpen: () => {
            const image = Swal.getPopup().querySelector('#cropperWadah')
            const cropper = new Cropper(image, {
                aspectRatio: 4 / 3,
                viewMode: 1,
                autoCropArea: 0,
                scalable: false,
                zoomable: false,
                movable: false,
                minCropBoxWidth: 200,
                minCropBoxHeight: 200,
            })

            const confirmButton = Swal.getConfirmButton()

            confirmButton.addEventListener('click', () => {
                Swal.showLoading()

                // ngeinput gambar ke image tag, masih belum nemu cara yang bagus
                if (isPerhiasan) {
                    fotoPerhiasan.src = cropper.getCroppedCanvas().toDataURL()
                    fotoPerhiasan.style.display = 'block'
                    fotoPerhiasanBase64.value = cropper.getCroppedCanvas().toDataURL()
                    sudahFotoPerhiasan = true
                } else {
                    // let fotoKTP = document.getElementById('fotoKTP')
                    fotoKTP.src = cropper.getCroppedCanvas().toDataURL()
                    fotoKTP.style.display = 'block'
                    fotoKTPBase64.value = cropper.getCroppedCanvas().toDataURL()
                    sudahFotoKTP = true
                }

                resetFoto(isPerhiasan)
            })

        },
    })

}

// ==================================================== SAMPE SINI KAMERA ==================================================

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
