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
    let kodeValid = false
    const kode = document.getElementById('kode')
    const teksPengecekanKode = document.getElementById('teksPengecekanKode')

    // deklarasi submit
    const formKode = document.getElementById('formKode')
    const kadar = document.getElementById('kadar')

    // deklarasi cek kadar
    const hargaUmum = document.getElementById('hargaUmum')
    const hargaBaru = document.getElementById('hargaBaru')
    const tipePotongan = document.getElementById('tipePotongan')
    const potonganUmum = document.getElementById('potonganUmum')
    const potonganBaru = document.getElementById('potonganBaru')
    const persentaseMalUripan = document.getElementById('persentaseMalUripan')
    const ongkosMalRosokPerGram = document.getElementById('ongkosMalRosokPerGram')

    let resetKadar = function () {
      hargaUmum.value = ''
      hargaBaru.value = ''
      potonganUmum.value = ''
      potonganBaru.value = ''
      persentaseMalUripan.value = ''
      ongkosMalRosokPerGram.value = ''
    }

    let fullResetKadar = function () {
      resetKadar()
      kadar.value = 'kosong'
      tipePotongan.value = 'Pilih kadar terlebih dahulu!'
      tipePotongan.disabled = true
      potonganUmum.disabled = true
      potonganBaru.disabled = true
    }

    kode.addEventListener('change', function (e) {
      teksPengecekanKode.innerText = "Mengecek ketersediaan..."

      if (kode.value) {
        teksPengecekanKode.classList.remove('hidden')

        $.get("/app/barang/kodepro/cekKode", {
            kode: kode.value
          },
          function (data, textStatus, jqXHR) {
            kodeValid = true
            kode.classList.remove('input-error')
            kode.classList.add('input-success')
            teksPengecekanKode.classList.remove('text-secondary', 'text-error')
            teksPengecekanKode.classList.add('text-success')
            teksPengecekanKode.innerText = 'Kode siap digunakan'
          },
          "json"
        ).fail((xhr) => {
          kodeValid = false
          kode.classList.add('input-error')
          kode.classList.remove('input-success')
          teksPengecekanKode.classList.add('text-error')
          teksPengecekanKode.classList.remove('text-secondary', 'text-success')
          teksPengecekanKode.innerText = xhr.responseText
        })

      } else {
        kodeValid = false
        kode.classList.remove('input-error', 'input-success')
        teksPengecekanKode.classList.add('hidden')
        teksPengecekanKode.classList.remove('text-error', 'text-success')
      }
    })

    // ini ngambil data kadar ==========
    const labelPotonganUmum = document.getElementById('labelPotonganUmum')
    const tandaPotonganUmum = document.getElementById('tandaPotonganUmum')
    const labelPotonganBaru = document.getElementById('labelPotonganBaru')
    const tandaPotonganBaru = document.getElementById('tandaPotonganBaru')

    kadar.addEventListener('change', (e) => {
      if (kadar.value !== 'kosong') {
        $.get("/app/barang/cumaData/getKadarById", {
            id: kadar.value
          },
          function (data, textStatus, jqXHR) {
            console.log(data)
            tipePotongan.disabled = false
            potonganUmum.disabled = false
            potonganBaru.disabled = false
            resetKadar()

            if(data.apakah_potongan_persen){
              tandaPotonganUmum.innerText = '%'
              tandaPotonganBaru.innerText = '%'
              labelPotonganUmum.innerText = 'Persentase'
              labelPotonganBaru.innerText = 'Persentase'
              tipePotongan.value = 'Persentase dari harga jual'
            } else{
              tandaPotonganUmum.innerText = 'Rp.'
              tandaPotonganBaru.innerText = 'Rp.'
              labelPotonganUmum.innerText = 'Nominal'
              labelPotonganBaru.innerText = 'Nominal'
              tipePotongan.value = 'Nominal rupiah per gram'
            }
          },
          "json"
        ).fail((xhr) => {
          console.log(xhr)
          fullResetKadar()
        })
      }
    })



    // ini buat submit ==========
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
      if (!formKodepro.reportValidity()) return

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
