import Swal from "sweetalert2";

$(function () {

  if ($('.base-page').data('pagename') == "formpegawai") {
    const tanggalLahir = document.getElementById('tanggalLahir')
    const tanggalAwalMasuk = document.getElementById('tanggalAwalMasuk')

    tanggalLahir.max = new Date().toISOString().split("T")[0]
    tanggalAwalMasuk.max = new Date().toISOString().split("T")[0]
    tanggalAwalMasuk.value = new Date().toISOString().split("T")[0]

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
            allowOutsideClick: false,
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

              const confirmButton = Swal.getConfirmButton()
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
})
