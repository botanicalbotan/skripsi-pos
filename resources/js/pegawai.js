// Selalu panggil file satuan gini abis manggil app.js biar ngga redundant

// import Cropper from "cropperjs";
import Swal from "sweetalert2";

global.banding = function (tanggal) {
  return capsFirstWord(moment(tanggal, 'YYYY-MM-DD').fromNow())
}

// doc ready
$(function () {
  // ========================================= form ==========================================================

  if ($('.base-page').data('pagename') == "formpegawai") {
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
          console.log(e.target.result)
          // ini bisa dijadiin method umum yang bisa dipanggil2
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
                document.getElementById('fotoPegawaiBase64').value = cropper.getCroppedCanvas().toDataURL()
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

    $('form#pegawaiBaru').on('submit', function (e) {
      // gaperlu trigger submit, cukup cek yang ga lu bolehin, trus panggil prevent default
      if($("input#password").val() != $("input#repassword").val()){
        e.preventDefault()
        var scrollKe = document.getElementById("repassword");
        scrollKe.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "nearest"
        });
      }
    });
  }

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


  // ========================================= detail ==========================================================
  if ($('.base-page').data('pagename') == "detail") {
    $('a#ubahStatus').on('click', function () {
      console.log(location.pathname.replace('/app/pegawai/', ''))
      console.log($(this).attr('data-statussekarang'))

      const status = ($(this).attr('data-statussekarang') == 0) ? 0 : 1
      const defineModal = [
        {
          title: 'Aktifkan pegawai?',
          text: "Dengan mengaktifkan pegawai, pegawai tersebut akan kembali mendapat akses ke sistem ini",
          targetStatus: 1,
          confirmButton: 'Ya, aktifkan!',
          confirmButtonColor: '#41BE88'
        },
        {
          title: 'Nonaktifkan pegawai?',
          text: "Dengan menonaktifkan pegawai, pegawai tersebut akan kehilangan akses ke sistem ini",
          targetStatus: 0,
          confirmButton: 'Ya, nonaktifkan!',
          confirmButtonColor: '#Dc3741'
        },
      ]

      Swal.fire({
        title: defineModal[status].title,
        text: defineModal[status].text,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: defineModal[status].confirmButtonColor,
        confirmButtonText: defineModal[status].confirmButton,
        cancelButtonText: 'Batal',
        didOpen: ()=>{
          Swal.getCancelButton().focus()
        },
        preConfirm: () => {

          Swal.showLoading(Swal.getConfirmButton())
          return new Promise(function (resolve, reject) {
            setTimeout(function () {
              Swal.hideLoading()
              reject('Tidak ada respon dari server')
            }, 5000)

            $.ajaxSetup({
              headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
              }
            });
  
            $.ajax({
              type: "PUT",
              url: location.pathname + '/status',
              data: { target: defineModal[status].targetStatus },
              dataType: "json",
              success: function () {
                resolve()
              },
              error: function (xhr) {
                reject(xhr.responseJSON.error)
              }
            });
          }).catch(function (error) {
            Swal.hideLoading()
            Swal.showValidationMessage('Error: ' + error)
          })
        }
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire(
            'Sukses!',
            'Pegawai berhasil ' + ((status == 0)? 'diaktifkan.': 'dinonaktifkan.'),
            'success'
          ).then(() => {
            location.href = location.pathname
          })
        }
      })
    });
  }

});
