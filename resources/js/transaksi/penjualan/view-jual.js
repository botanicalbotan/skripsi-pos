import Swal from "sweetalert2"

$(function () {
    const BASEURL = window.location.pathname
    const namaBarang = document.getElementById('namaBarang')

    const formHapusPJ = document.getElementById('formHapusPJ')
    const hapusPJ = document.getElementById('hapusPJ')

    if(formHapusPJ && hapusPJ){
      hapusPJ.addEventListener('click', (e) => {
        Swal.fire({
          title: 'Yakin untuk menghapus?',
          text: 'Anda akan menghapus penjualan "'+ namaBarang.innerText +'", dan penjualan yang dihapus tidak dapat dikembalikan.',
          icon: 'question',
          iconColor: global.SwalCustomColor.icon.error,
          showCancelButton: true,
          confirmButtonText: 'Ya, hapus!',
          cancelButtonText: 'Batal',
          scrollbarPadding: false,
          focusCancel: true,
          confirmButtonColor: global.SwalCustomColor.button.deny,
        }).then((result)=>{
          if(result.isConfirmed){
            formHapusPJ.action = BASEURL + '?_method=DELETE'
            formHapusPJ.submit()
          }
        })

      })
    }
})