global.prepareAsal = function () {
  return [
    'Perhiasan yang dijual dibeli dari Toko Mas Leo atau cabang lain dibawah rumpun yang sama.',
    'Perhiasan yang dijual dibeli dari toko mas lain atau tidak diketahui sumbernya.'
  ]
}

global.prepareNota = function () {
  return [
    'Perhiasan yang dijual dilengkapi dengan nota bukti pembelian dari Toko Mas Leo atau dari toko emas lainnya.',
    'Perhiasan yang dijual tidak memiliki identitas apapun.'
  ]
}

global.prepareRusak = function () {
  return [
    'Perhiasan yang dijual tidak menerima kerusakan dalam bentuk apapun dan dapat langsung dijual kembali setelah dicuci ulang.',
    'Perhiasan yang dijual mengalami cidera ringan seperti kehilangan batu, penyok, atau patah yang masih dalam jangka wajar dan dapat diperbaiki.',
    'Perhiasan yang dijual mengalami cidera parah yang tidak dapat diperbaiki, hilang sebagian, hancur atau hilang pasangannya.'
  ]
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

// bikin domnya dulu, trus di willLoad, load pake promise biar nongol loading
// kerusakan yang bakal di load cuma yang bentuk barangnya sama ama yang dipilih, jdi kalo reset tipe barng, bakal RESET kerusakan
let printKerusakanHTML = function () {

  // ntar kerusakan datanya ngambil dari server, panggil pake ajax ma tunggu pake promise
  const rusakHTML = `
          <div class="w-full px-6 space-y-6 flex flex-col text-left">

              <div class="form-control">
                  <label for="swal-rusak">Kerusakan</label>
                  <select id="swal-rusak" class="select select-bordered w-full max-w-md swal">
                  <option disabled="" selected="">Pilih kerusakan</option> 
                  <option value="hilangmata">Hilang batu</option> 
                  <option value="putus">Putus</option> 
                  <option value="penyok">Penyok</option>
                  </select>
              </div>

              <div class="form-control">
                <label for="swal-tingkatrusak">
                  <span class="">Tingkat Kerusakan</span>
                </label>
                <input type="text" id="swal-tingkatrusak" name="swal-tingkatrusak" class="input input-bordered"
                  readonly placeholder="Silahkan pilih kerusakan terlebih dahulu"/>
              </div>

              <div class="form-control">
                <label for="swal-ongkosrusak">
                  <span class="">Ongkos per Kerusakan</span>
                </label>
                <input type="text" id="swal-ongkosrusak" name="swal-ongkosrusak" class="input input-bordered"
                  readonly placeholder="Silahkan pilih kerusakan terlebih dahulu"/>
              </div>

              <div class="flex pt-4 justify-center" x-data="{ counter: 1 }">
                  <div class="bg-base-300 rounded-box px-4 flex">
                  <button class="btn btn-ghost text-error" @click="(counter-1 < $refs.angka.min)? $refs.angka.min : counter--">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
                      </svg>
                  </button>
                  <input type="number" id="swal-banyakrusak" class="input input-ghost rounded-none text-2xl text-center w-16 focus:ring-0" x-model="counter" x-ref="angka" readonly min="1" max="99" value="1">
                  <button class="btn btn-ghost text-success" @click="(counter+1 > $refs.angka.max)? $refs.angka.min : counter++">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                      </svg>
                  </button>
                  </div>
              </div>
              
          </div>
      `
  return rusakHTML
}

// let Instascan = require('instascan');

import jsQR from "jsqr"
import Swal from "sweetalert2"

$(function () {
  // code here
  $('button#bukaScanner').on('click', function () {
    bukaScanner()
  });

  let bukaScanner = function () {
    Swal.fire({
      showConfirmButton: false,
      showCancelButton: true,
      cancelButtonText: 'Batal',
      // confirmButtonText: 'Ambil Foto',
      // confirmButtonColor: '#4b6bfb',
      title: 'Pindai Kode QR',
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

              console.log(code.data)
              // return Swal.close();
              return Swal.clickConfirm();
            } else {
              // something kalo ga kedetek
            }
          }
          requestAnimationFrame(tick);
        }
      },
      preConfirm: () => {
        console.log('bisa tuh confirm dari kode')
      }
    }).then((capture) => {
      if (window.stream) {
        window.stream.getTracks().forEach(track => {
          track.stop();
        });
      }
      if (capture.isConfirmed) {
        alert('ewe')
        // if (capture.value) {
        //   // hasilKamera(capture.value)
        // }
      }
    })
  }


  let confirmHasilScan = function (scan) {
    // ntar scan bakal kepake buat di cek ke server

    // logic here, sanitize, trus lempar ke server pake post
    // bikin promise buat nunggu hasilnya, kalau dapet resolve in trus pake di swal
    // kalo error / gadapet, bikin swal baru yang cuma jadi info error doang

    Swal.fire({
      showConfirmButton: true,
      showCancelButton: true,
      cancelButtonText: 'Batal',
      confirmButtonText: 'Ambil Foto',
      confirmButtonColor: '#4b6bfb',
      title: 'Ambil Foto',
    })

    // di swal ini, pas confirm datanya baru dimasukin ke form, bukan di swal pertama
  }

  $('button#tambah-kerusakan').on('click', function () {
    // bikin domnya dulu, trus di willLoad, load pake promise biar nongol loading
    // kerusakan yang bakal di load cuma yang bentuk barangnya sama ama yang dipilih, jdi kalo reset tipe barng, bakal RESET kerusakan
    if($('select#beli-bentuk').val() && $('select#beli-bentuk').val() != 'kosong'){
      tambahKerusakan()
    }
    
  });

  let tambahKerusakan = function () {
    Swal.fire({
      title: 'Tambah Kerusakan',
      confirmButtonText: 'Tambahkan',
      showCancelButton: true,
      cancelButtonText: 'Batal',
      confirmButtonColor: '#4b6bfb',
      html: printKerusakanHTML(),
      willOpen: () => {
        // disini harusya minta data ke server, trus taro di select yang awalnya gaada isinya
        // inget loh ya, select kerusakan itu aslinya kosong! baru keisi pas kita buka swal
        // dan pas manggil ke server, kasi parameter bentuk perhiasan ngambil dari form sebelomnya

        $('select#swal-rusak').on('change', function () {
          Swal.resetValidationMessage()

          // disini harusnya minta data object yang diambil dari server pas load pertama, ini misal doang
          document.getElementById('swal-tingkatrusak').value = 'Ringan'
          document.getElementById('swal-ongkosrusak').value = 'Rp. 10.000'

        });
      },
      preConfirm: () => {
        let kerusakan = document.getElementById('swal-rusak')
        let tingkat = document.getElementById('swal-tingkatrusak')
        let ongkos = document.getElementById('swal-ongkosrusak')
        let banyak = document.getElementById('swal-banyakrusak')

        // kalo dirasa kurang aman, ntar diganti jadi teks panjangnya
        // ntar ini pake promise ngambil data kerusakan dulu lewat ajax, kalo ga ketemu, lempar error + tersedia perhiasan jadi default lagi
        if (kerusakan.value == '' || tingkat.value == '' || ongkos.value == '' || banyak.value < 1 || banyak.value > 99) {
          Swal.showValidationMessage(
            'Input tidak valid!'
          )
        } else {
          return {
            'idKerusakan': kerusakan.value,
            'teksKerusakan': kerusakan[kerusakan.selectedIndex].innerText,
            'tingkat': tingkat.value,
            'teksOngkos': ongkos.value,
            'banyakrusak': banyak.value,
          }
        }
      }
    }).then((hasil) => {
      if (hasil.isConfirmed && hasil.value) {
        appendKerusakan(JSON.stringify(hasil.value))
        // Swal.fire('tambahKerusakan', JSON.stringify(hasil.value))
      }
    })
  }

  // perlu di sanitize lagi pake ngecek ke variabel?
  let appendKerusakan = function (kerusakan) {
    if (typeof kerusakan == undefined) {
      return
    }
    let rusakBaru = JSON.parse(kerusakan)
    let adaDuplikat = false
    const listRusak = document.getElementsByName('idKerusakan[]')

    for (let [index, input] of listRusak.entries()) {
      if (input.value === rusakBaru.idKerusakan) {
        adaDuplikat = true
        let jumlahBaru = numberOnlyParser(document.getElementsByName('jumlahKerusakan[]')[index].value) + numberOnlyParser(rusakBaru.banyakrusak)
        document.getElementsByClassName('teksJumlahKerusakan')[index].innerHTML = jumlahBaru
        break;
      }
    }

    if (adaDuplikat) {
      return
    }


    const htmlAppend = `
          <tr>
              <td>
                ` + rusakBaru.teksKerusakan + ` (<span class="teksJumlahKerusakan">` + rusakBaru.banyakrusak + `</span>)
                <input type="hidden" name="idKerusakan[]" value="` + rusakBaru.idKerusakan + `">
                <input type="hidden" name="ongkosKerusakan[]" value="` + numberOnlyParser(rusakBaru.teksOngkos) + `">
                <input type="hidden" name="jumlahKerusakan[]" value="` + rusakBaru.banyakrusak + `">
              </td>
              <td>` + rusakBaru.tingkat + `</td>
              <td>` + rusakBaru.teksOngkos + `</td>
              <td class="w-16">
                <button class="btn text-error btn-square btn-ghost btn-delete">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </td>
            </tr>
          `
    $('#wadah-data').append(htmlAppend);

    $('#wadah-data button.btn-delete').on('click', function (e) {
      e.preventDefault()
      $(this).parentsUntil('tbody#wadah-data').remove()
    });
  }


  // dibawah ini observer =========================================================================================
  if ($('.base-page').data('pagename') == "pembelian-umum") {
    // Select the node that will be observed for mutations
    const targetNode = document.getElementById('wadah-data');
    const targetChange = $('#teks-tabel-kosong');

    // Options for the observer (which mutations to observe)
    const config = {
      attributes: true,
      childList: true,
      subtree: true
    };

    // ntar tambahin cek dom input yang kesedia buat itungan menu samping, sekalian totalannya

    // Callback function to execute when mutations are observed
    const callback = function (mutationsList, observer) {
      for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
          if (targetNode.childElementCount < 1) {
            targetChange.removeClass('hidden').addClass('block')
          } else {
            targetChange.removeClass('block').addClass('hidden')
          }
        }
      }
    };

    // Create an observer instance linked to the callback function
    const observer = new MutationObserver(callback);

    // Start observing the target node for configured mutations
    observer.observe(targetNode, config);
  }

})
