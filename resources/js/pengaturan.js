// Selalu panggil file satuan gini abis manggil app.js biar ngga redundant

import Swal from "sweetalert2";

// import Swal from "sweetalert2";

// doc ready
$(function () {

  $('#fileFotoToko').on('change', function () {
    const input = $("#fileFotoToko").prop('files')[0]

    const styledSwal = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger',
        denyButton: 'btn btn-warning',
      },
      buttonsStyling: true // Kalau mau yang diatas nyala, set ke false
    })


    // Karna ngeganti input file gabisa programatically, tiap ngecancel reload pagenya pake location.reload()
    if (input) {
      var reader = new FileReader();

      reader.onload = function (e) {

        styledSwal.fire({
          title: 'Gunakan gambar ini?',
          text: 'Anda dapat mengubahnya kembali kapan saja',
          imageUrl: e.target.result,
          imageWidth: 400,
          imageAlt: 'Custom image',
          confirmButtonText: 'Simpan',
          showCancelButton: true,
          cancelButtonText: 'Batalkan',
        }).then((result) => {
          if (result.isConfirmed) {
            // buat iseng sung ditaro gitu aja
            $('img#fotoToko').prop('src', e.target.result)
          }
        })
      };

      reader.readAsDataURL(input);
    }
  });



});
