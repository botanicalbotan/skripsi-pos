import Swal from "sweetalert2"

$(function () {
  // ===================================== list ================================================
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
  // ========================================== form ===========================================
  if ($('.base-page').data('pagename') == "form") {
    const formKode = document.getElementById('formKode')
    const kadar = document.getElementById('kadar')
    let eventKadar = false

    formKode.addEventListener('submit', (e) => {
      let errorMsg = document.createElement('p')
      errorMsg.classList.add('text-error', 'pesanerror')

      if (kadar.value === 'kosong') {
        e.preventDefault()
        kadar.classList.add('ring', 'ring-error')
        errorMsg.innerText = 'Pilih salah satu kadar!'
        if (document.getElementsByClassName('pesanerror').length == 0) kadar.after(errorMsg)
        kadar.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "nearest"
        });

        if (!eventKadar) {
          kadar.addEventListener('change', function () {
            if (kadar.value && kadar.value !== 'kosong') {
              kadar.classList.remove('ring', 'ring-error')
              global.removeElementsByClass('pesanerror')
            }
          })
          eventKadar = true
        }

      }
    })
  }

  // ========================================== detail ===========================================
  if ($('.base-page').data('pagename') == "detail") {
    const BASEURL = window.location.pathname
    const formKodepro = document.getElementById('formKodepro')
    const hapusKodepro = document.getElementById('hapusKodepro')
    const namaRusak = document.getElementById('namaRusak')

    hapusKodepro.addEventListener('click', (e) => {
      formKodepro.action = BASEURL + '?_method=DELETE'

      Swal.fire({
        title: 'Yakin untuk menghapus?',
        text: 'Anda akan menghapus kerusakan "' + namaRusak.innerText + '", dan kerusakan yang dihapus tidak dapat dikembalikan.',
        icon: 'question',
        // iconColor: '#Dc3741',
        showCancelButton: true,
        confirmButtonText: 'Ya, hapus!',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#Dc3741',
        focusCancel: true,
      }).then((result) => {
        if (result.isConfirmed) formKodepro.submit()
      })

    })

  }

  // ========================================== edit ===========================================
  if ($('.base-page').data('pagename') == "edit") {
    const formKodepro = document.getElementById('formKodepro')
    const editKodepro = document.getElementById('editKodepro')

    editKodepro.addEventListener('click', (e) => {
      if(!formKodepro.reportValidity()) return

      formKodepro.action = formKodepro.action + '?_method=PUT'

      Swal.fire({
        title: 'Yakin untuk mengubah?',
        text: 'Pastikan data yang anda isikan sudah benar!',
        icon: 'question',
        // iconColor: '#Dc3741',
        showCancelButton: true,
        confirmButtonText: 'Ya, ubah!',
        cancelButtonText: 'Batal',
        focusCancel: true,
      }).then((result) => {
        if (result.isConfirmed) formKodepro.submit()
      })

    })

  }
})
