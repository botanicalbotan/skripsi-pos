$(function () {
  // code here
  const BASEURL = window.location.pathname
  const qsParam = new URLSearchParams(window.location.search)
  const filterKadar = document.getElementById('filterKadar')
  const filterBentuk = document.getElementById('filterBentuk')
  const filterSembunyiStok = document.getElementById('filterSembunyiStok')

  const pencarian = document.getElementById('pencarian')
  const hapuscari = document.getElementById('hapusPencarian')

  function persiapanKirim() {
    if (qsParam.get('cari') === null || pencarian.value === '') {
      qsParam.delete('cari')
    }
    qsParam.delete('page')
    window.location = BASEURL + '?' + qsParam.toString()
  }

  filterKadar.addEventListener("change", function () {
    updateKeyQs('k', filterKadar.value)
    persiapanKirim()
  });

  filterBentuk.addEventListener("change", function () {
    updateKeyQs('b', filterBentuk.value)
    persiapanKirim()
  });

  filterSembunyiStok.addEventListener("change", function () {
    let value = (filterSembunyiStok.checked)? 0:1
    updateKeyQs('ss', value)
    persiapanKirim()
  });

  pencarian.addEventListener("keyup", function (event) {
    if (event.key === "Enter") {
      if (pencarian.value !== '' && pencarian.value) {
        updateKeyQs('cari', pencarian.value)
        persiapanKirim()
      }
    }
  });

  hapuscari.addEventListener("click", function () {
    pencarian.value = ''
    persiapanKirim()
  });

  let updateKeyQs = function (key, value) {
    if (qsParam.has(key)) {
      qsParam.set(key, value)
    } else {
      qsParam.append(key, value)
    }
  }

  const formPenjualan = document.getElementById('pilih')
  var missing = {
    addEventListener: function () {}
  }; // a "null" element

  (formPenjualan || missing).addEventListener('submit', (e) => {
    if (!document.querySelector('input[name=kt]:checked')) {
      e.preventDefault()
    }
  })

})
