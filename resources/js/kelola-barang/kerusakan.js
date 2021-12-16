import Swal from "sweetalert2"

$(function () {
  // code here
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

  // ========================================== detail ===========================================
  if ($('.base-page').data('pagename') == "detail") {
    const BASEURL = window.location.pathname
    const formRusak = document.getElementById('formRusak')
    const hapusRusak = document.getElementById('hapusRusak')
    const namaRusak = document.getElementById('namaRusak')

    hapusRusak.addEventListener('click', (e) => {
      formRusak.action = BASEURL + '?_method=DELETE'
      
      Swal.fire({
        title: 'Yakin untuk menghapus?',
        text: 'Anda akan menghapus kerusakan "'+namaRusak.innerText+'", dan kerusakan yang dihapus tidak dapat dikembalikan.',
        icon: 'question',
        // iconColor: '#Dc3741',
        showCancelButton: true,
        confirmButtonText: 'Ya, hapus!',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#Dc3741',
        didOpen: ()=>{
          Swal.getCancelButton().focus()
        }
      }).then((result)=>{
        if(result.isConfirmed) formRusak.submit()
      })
      
    })

  }

  // ========================================== edit ===========================================
  if ($('.base-page').data('pagename') == "edit") {
    const formRusak = document.getElementById('formRusak')
    const editRusak = document.getElementById('editRusak')

    editRusak.addEventListener('click', (e) => {
      formRusak.action = formRusak.action + '?_method=PUT'
      
      Swal.fire({
        title: 'Yakin untuk mengubah?',
        text: 'Pastikan data yang anda isikan sudah benar!',
        icon: 'question',
        // iconColor: '#Dc3741',
        showCancelButton: true,
        confirmButtonText: 'Ya, ubah!',
        cancelButtonText: 'Batal',
        didOpen: ()=>{
          Swal.getCancelButton().focus()
        }
      }).then((result)=>{
        if(result.isConfirmed) formRusak.submit()
        // console.log(formRusak.action)
      })
      
    })

    formRusak.addEventListener('submit', (e) => {
      if(!formRusak.reportValidity()) e.preventDefault()
    })

  }
})