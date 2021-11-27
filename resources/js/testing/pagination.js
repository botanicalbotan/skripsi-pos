$(function () {

  // ========================================= V1 ==========================================================
  if ($('.base-page').data('pagename') == "v1") {
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

  // ========================================= V2 ==========================================================
  if ($('.base-page').data('pagename') == "v2") {
    const pengurutan = document.querySelector('select#pengurutan')
    const pencarian = document.querySelector('input#pencarian')
    const hapuscari = document.getElementById('hapusPencarian')

    const params = {
      cari: pencarian.value,
      ob: pengurutan.value,
    }

    function refreshTable() {
      params.cari = pencarian.value
      params.ob = pengurutan.value

      $('tbody#wadah-data').empty();

      if (pencarian.value && pencarian.value !== '') hapuscari.classList.remove('invisible')

      $.get("/app/test/paginated", params,
        function (data) {
          data.data.forEach(element => {
            const menikah = (element.menikah) ? 'Ya' : 'Tidak'
            const printRow = `
                <tr class="hover">
                  <td>
                    <a href="#" class="font-medium">`+ element.nama + `</a>
                  </td>
                  <td>`+ element.gender + `</td>
                  <td>`+ new Date(element.tanggallahir).toLocaleDateString() + `</td>
                  <td>`+ element.phone + `</td>
                  <td>`+ element.lamakerja + `</td>
                  <td>`+ menikah + `</td>
                </tr>
              `
            $('tbody#wadah-data').append(printRow);

          });
        },
        "json"
      );
    }
    refreshTable()

    pengurutan.addEventListener("change", function () {
      refreshTable()
    });

    pencarian.addEventListener("keyup", function (event) {
      if (event.key === "Enter") {
        if (pencarian.value !== '' && pencarian.value) {
          refreshTable()
        }
      }
    });

    hapuscari.addEventListener("click", function () {
      pencarian.value = ''
      if (!hapuscari.classList.contains('invisible')) {
        hapuscari.classList.add('invisible')
      }
      refreshTable()
    });


  }

  // ==================================================== V3 ====================================================
  if ($('.base-page').data('pagename') == "v3") {
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
})
