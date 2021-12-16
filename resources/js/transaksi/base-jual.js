$(function () {
    // code here
    const BASEURL = window.location.pathname
    const qsParam = new URLSearchParams(window.location.search)
    const filterKadar = document.querySelector('select#filterKadar')
    const filterBentuk = document.querySelector('select#filterBentuk')
    
    const pencarian = document.querySelector('input#pencarian')
    const hapuscari = document.getElementById('hapusPencarian')

    function persiapanKirim() {
      if (qsParam.get('cari') === null || pencarian.value === '') {
        qsParam.delete('cari')
      }
      qsParam.delete('page')
      window.location = BASEURL + '?' + qsParam.toString()
    }

    filterKadar.addEventListener("change", function () {
      if (qsParam.has('kadar')) {
        qsParam.set('kadar', filterKadar.value)
      } else {
        qsParam.append('kadar', filterKadar.value)
      }
      persiapanKirim()
    });

    filterBentuk.addEventListener("change", function () {
        if (qsParam.has('bentuk')) {
          qsParam.set('bentuk', filterBentuk.value)
        } else {
          qsParam.append('bentuk', filterBentuk.value)
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

    const formPenjualan = document.getElementById('pilih')
    var missing = {
      addEventListener: function() {}
    };  // a "null" element

    (formPenjualan || missing).addEventListener('submit', (e)=>{
      if(!document.querySelector('input[name=kt]:checked')){
        e.preventDefault()
      } 
    })

})