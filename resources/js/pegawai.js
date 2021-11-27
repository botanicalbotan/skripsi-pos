// Selalu panggil file satuan gini abis manggil app.js biar ngga redundant

import Swal from "sweetalert2";

global.banding = function (tanggal) {
  return capsFirstWord(moment(tanggal, 'YYYY-MM-DD').fromNow())
}

// doc ready
$(function () {
  // Kalau ternyata ntar simpel banget, gaperlu pake moment.js
  $('input[type=date]').prop('max', moment().format('YYYY-MM-DD'));
  $('input[type=date]#pegawai-tanggalmasuk').val(moment().format('YYYY-MM-DD')).prop('min', moment().subtract(20, 'years').format('YYYY-MM-DD'))

  $('#fileFotoPegawai').on('change', function () {
    const input = $("#fileFotoPegawai").prop('files')[0]

    if (input) {
      // ganti maxsize disini
      const maxSize = 1000
      console.log(input)
      if (input.size / 1024 > maxSize || input.size <= 0) {
        Swal.fire({
          title: 'File terlalu besar!',
          icon: 'error',
          text: 'Pilih file foto berformat .jpg atau .png berukuran maskimal 1 MB.'
        })
        return
      }

      var reader = new FileReader();
      reader.onload = function (e) {
        Swal.fire({
          title: 'Pratinjau Pemotongan Gambar',
          html: `
            <div>
              <img id="cropperjs" src="` + e.target.result + `">
            </div>
          `,
          showCancelButton: true,
          willOpen: () => {
            const image = Swal.getPopup().querySelector('#cropperjs')
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
              $('img#fotoPegawai').prop('src', cropper.getCroppedCanvas().toDataURL())
            })

          },
        }).then((result) => {
          // $('div#wadahInputFoto').load(' div#wadahInputFoto > * ')
          if (result.isConfirmed) {
            console.log('berhasil')
          }
        })
      };
      reader.readAsDataURL(input);
    }
  });

  // ========================================= list ==========================================================
  if ($('.base-page').data('pagename') == "list") {
    const BASEURL = window.location.pathname
    const qsParam = new URLSearchParams(window.location.search)
    const pengurutan = document.querySelector('select#pengurutan')
    const pencarian = document.querySelector('input#pencarian')
    const hapuscari = document.getElementById('hapusPencarian')

    function persiapanKirim() {
      if (qsParam.get('cari') === null || pencarian.value === '') {
        qsParam.delete('cari')
      }
      qsParam.delete('page')
      window.location = BASEURL + '?' + qsParam.toString()
    }

    pengurutan.addEventListener("change", function () {
      if (qsParam.has('ob')) {
        qsParam.set('ob', pengurutan.value)
      } else {
        qsParam.append('ob', pengurutan.value)
      }
      persiapanKirim()
    });

    pencarian.addEventListener("keyup", function (event) {
      if (event.key === "Enter") {
        if (pencarian.value !== '' && pencarian.value) {
          if (qsParam.has('cari')) {
            qsParam.set('cari', pencarian.value)
          } else {
            qsParam.append('cari', pencarian.value)
          }
          persiapanKirim()
        }
      }
    });

    hapuscari.addEventListener("click", function () {
      pencarian.value = ''
      persiapanKirim()
    });


  }

});
