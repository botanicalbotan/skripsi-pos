import Swal from "sweetalert2"
const Item = require('./partial/tambah-item')

$(function () {
  // ===================================================== SUPER =========================================================
  let sudahFoto = false
  let kodeproDipilih = false
  const beratKelompok = parseInt(document.getElementById('berat').value)

  // kalo takut id diapa2in, bisa ngambil dari qs
  const qsParam = new URLSearchParams(window.location.search)
  const idDariParam = qsParam.get('kt')

  let pointerStok = 0
  let hargas = [0, 0]
  let apakahPotonganPersen = false
  let potongans = [0, 0]

  global.setPointer = function (tunjuk = 0) {
    pointerStok = (tunjuk == 1) ? 1 : 0
    refreshSamping()
  }

  // ===================================================== MULAI ===========================================================
  const tambahItem = document.getElementById('tambahItem')
  tambahItem.addEventListener('click', () => {
    Item.tambahItem()
  })

  const teksHE = document.getElementById('teksHE')
  const teksPot = document.getElementById('teksPot')
  let refreshSamping = function () {
    teksHE.textContent = global.rupiahParser(hargas[pointerStok])
    teksPot.textContent = (apakahPotonganPersen) ? potongans[pointerStok] + '% penjualan' : global.rupiahParser(potongans[pointerStok]) + ' /g'
  }

  const kodepro = document.getElementById('kodepro')
  kodepro.addEventListener('change', () => {

    $.get("/app/cumaData/kodeproById", {
        id: kodepro.value
      },
      function (data, textStatus, jqXHR) {
        hargas[0] = data.hargaPerGramLama
        hargas[1] = data.hargaPerGramBaru
        apakahPotonganPersen = data.apakahPotonganPersen
        potongans[0] = data.potonganLama
        potongans[1] = data.potonganBaru

        kodeproDipilih = true
        refreshSamping()
        hitungHarga()
      },
      "json"
    ).fail(() => {
      console.log('gagalll maneengg')

      hargas = [0, 0]
      potonganPersen = false
      potongans = [0, 0]

      kodeproDipilih = false
    })
  })

  const teksHarga = document.getElementById('teksHarga')
  const beratDesimal = document.getElementById('beratDesimal')

  // aslinya kudu diitung diserver, tp datanya udah ada semua. JANGAN DICONTOH buat pembelian
  const hitungHarga = function () {
    // bisa lu ganti, SAMAIN AMA YANG DI SERVER
    const pembulatan = 1000

    const jenis = document.querySelector('input[name=jenisStok]:checked').value
    const totalBerat = global.belakangKoma(beratDesimal.value) + beratKelompok
    const hargaTerpilih = (jenis === 'baru') ? hargas[1] : hargas[0]

    const hitung = hargaTerpilih * totalBerat
    const bulat = Math.ceil(hitung / pembulatan) * pembulatan
    teksHarga.textContent = global.rupiahParser(bulat)
  }

  const jenisStoks = document.querySelectorAll('input[name="jenisStok"]')
  jenisStoks.forEach(element => {
    element.addEventListener('click', hitungHarga)
  });

  beratDesimal.addEventListener('change', hitungHarga)

  // ==================================================== FORM & SUBMIT ==========================================================
  const btSubmit = document.getElementById('btSubmit')
  const formJual = document.getElementById('formJual')
  const idKelompok = document.getElementById('id')
  const model = document.getElementById('model')

  const fotoBarang = document.getElementById('fotoBarang') // img
  const fotoBarangBase64 = document.getElementById('fotoBarangBase64') // input form
  const svgPHFoto = document.getElementById('svgPHFoto')
  const wadahFoto = document.getElementById('wadahFoto')

  let eventModel = false
  let eventKodepro = false

  function resetFoto () {
    wadahFoto.classList.remove('bg-error', 'bg-opacity-10')
    svgPHFoto.classList.remove('text-error')
    wadahFoto.classList.add('bg-base-300')
    svgPHFoto.classList.add('text-secondary')
    global.removeElementsByClass('pesanerror')
  }

  btSubmit.addEventListener('click', () => {
    let errorMsg = document.createElement('p')
    errorMsg.classList.add('text-error', 'pesanerror')
    idKelompok.value = idDariParam

    // cek kodepro
    if (kodepro.value === 'kosong' || !kodeproDipilih) {
      kodepro.classList.add('select-error', 'bg-error')
      kodepro.classList.remove('bg-primary', 'select-primary')
      errorMsg.innerText = 'Pilih salah satu kode!'
      if (document.getElementsByClassName('pesanerror').length == 0) kodepro.after(errorMsg)
      kodepro.scrollIntoView({
        // behavior: "smooth",
        block: "center",
        inline: "nearest"
      });

      if (!eventKodepro) {
        kodepro.addEventListener('change', function () {
          if (kodepro.value && kodepro.value !== 'kosong') {
            kodepro.classList.remove('select-error', 'bg-error')
            kodepro.classList.add('bg-primary', 'select-primary')
            global.removeElementsByClass('pesanerror')
          }
        })
        eventKodepro = true
      }

      return
    }

    // cek model
    if (model.value === 'kosong') {
      model.classList.add('select-error', 'bg-error')
      model.classList.remove('bg-primary', 'select-primary')
      errorMsg.innerText = 'Pilih salah satu model!'
      if (document.getElementsByClassName('pesanerror').length == 0) model.after(errorMsg)
      model.scrollIntoView({
        // behavior: "smooth",
        block: "center",
        inline: "nearest"
      });

      if (!eventModel) {
        model.addEventListener('change', function () {
          if (model.value && model.value !== 'kosong') {
            model.classList.remove('select-error', 'bg-error')
            model.classList.add('bg-primary', 'select-primary')
            global.removeElementsByClass('pesanerror')
          }
        })
        eventModel = true
      }

      return
    }

    // cek foto
    if(!sudahFoto || !fotoBarangBase64.value || fotoBarang.naturalHeight == 0){
      wadahFoto.classList.remove('bg-base-300')
      wadahFoto.classList.add('bg-error', 'bg-opacity-10')
      svgPHFoto.classList.remove('text-secondary')
      svgPHFoto.classList.add('text-error')

      errorMsg.innerText = 'Anda harus mengambil foto perhiasan!'
      if (document.getElementsByClassName('pesanerror').length == 0) fotoBarangBase64.after(errorMsg)
      wadahFoto.scrollIntoView({
        // behavior: "smooth",
        block: "center",
        inline: "nearest"
      });

      // ngga ada bind event macem yang lain, tapi langsung pas akses kamera
      return
    }

    if (!formJual.reportValidity()) return

    Swal.fire({
      title: 'Proses transaksi?',
      text: 'Pastikan data yang anda isikan sudah benar!',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Ya, proses!',
      scrollbarPadding: false,
      confirmButtonColor: global.SwalCustomColor.button.confirm,
      cancelButtonText: 'Batal',
      focusCancel: true,
    }).then((result) => {
      if (result.isConfirmed) {
        formJual.submit()
      }
    })
  })

  // ==================================================== TUKAR TAMBAH ==========================================================
  const ajukanTT = document.getElementById('ajukanTT')
  const wadahTanggalTT = document.getElementById('wadahTanggalTT')
  const tanggalTT = document.getElementById('tanggalTT')

  const besok = new Date(new Date().setDate(new Date().getDate() + 1))
  tanggalTT.value = besok.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year:'numeric' })

  ajukanTT.addEventListener('change', () => {
    if(ajukanTT.checked){
      wadahTanggalTT.classList.remove('hidden')
    } else{
      wadahTanggalTT.classList.add('hidden')
    }
  })

  // ==================================================== KAMERA FULL ==========================================================
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
      scrollbarPadding: false,
      confirmButtonColor: global.SwalCustomColor.button.confirm,
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
      scrollbarPadding: false,
      confirmButtonColor: global.SwalCustomColor.button.confirm,
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
      scrollbarPadding: false,
      confirmButtonColor: global.SwalCustomColor.button.confirm,
      willOpen: () => {
        const image = Swal.getPopup().querySelector('#cropperWadah')
        const cropper = new Cropper(image, {
          aspectRatio: 4/3,
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
          let fotoBarang = document.getElementById('fotoBarang')
          fotoBarang.src = cropper.getCroppedCanvas().toDataURL()
          fotoBarang.style.display = 'block'
          document.getElementById('fotoBarangBase64').value = cropper.getCroppedCanvas().toDataURL()
          sudahFoto = true
          resetFoto()
        })

      },
    })

  }

  // ==================================================== SAMPE SINI KAMERA ==================================================

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
