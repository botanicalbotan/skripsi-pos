import Swal from "sweetalert2"

import { SwalCustomColor } from '../../fungsi.js'

const basePage = document.getElementById('base-page').dataset.pagename

if(basePage == 'edit'){
    const BASEURL = window.location.pathname
    const formEditKadar = document.getElementById('formEditKadar')
    const btEditKadar = document.getElementById('btEditKadar')
    const warna = document.getElementById('warna')
    const hexWarna = document.getElementById('hexWarna')

    warna.addEventListener('change', (e) => {
        hexWarna.textContent = e.target.value
    })

    const penguranganPotonganMin = document.getElementById('penguranganPotonganMin')
    const penguranganPotonganMax = document.getElementById('penguranganPotonganMax')

    const tandaPenguranganMin = document.getElementById('tandaPenguranganMin')
    const tandaPenguranganMinPlus = document.getElementById('tandaPenguranganMinPlus') 
    const tandaPenguranganMax = document.getElementById('tandaPenguranganMax')
    const tandaPenguranganMaxPlus = document.getElementById('tandaPenguranganMaxPlus')

    const potPersen = document.getElementById('potPersen')
    const potNominal = document.getElementById('potNominal')

    const pilhanPertama = document.querySelector('input[name="jenisPotongan"]:checked').value

    if(pilhanPertama == 'persen'){
        setJenisPot(1)
    }

    function setJenisPot(tipe) {
        if(tipe == 0){
            tandaPenguranganMin.textContent = 'Rp.'
            tandaPenguranganMinPlus.textContent = 'per gram'
            tandaPenguranganMax.textContent = 'Rp.'
            tandaPenguranganMaxPlus.textContent = 'per gram'
        } else{
            tandaPenguranganMin.textContent = '%'
            tandaPenguranganMinPlus.textContent = ''
            tandaPenguranganMax.textContent = '%'
            tandaPenguranganMaxPlus.textContent = ''
        }
    }

    potNominal.addEventListener('click', ()=>{
        setJenisPot(0)
        penguranganPotonganMax.value = null
        penguranganPotonganMin.value = null
    })

    potPersen.addEventListener('click', ()=>{
        setJenisPot(1)
        penguranganPotonganMax.value = null
        penguranganPotonganMin.value = null
    })

    btEditKadar.addEventListener('click', ()=> {
        if(!formEditKadar.reportValidity()) return

        Swal.fire({
            title: 'Simpan perubahan?',
            text: 'Pastikan data yang anda isikan sudah benar!',
            icon: 'question',
            // iconColor: '#Dc3741',
            showCancelButton: true,
            confirmButtonText: 'Ya, ubah!',
            confirmButtonColor: SwalCustomColor.button.confirm,
            cancelButtonText: 'Batal',
            scrollbarPadding: false,
            focusCancel: true,
          }).then((result) => {
            if (result.isConfirmed) {
                formEditKadar.action = BASEURL.slice(0, -5) + '?_method=PUT'
                formEditKadar.submit()
            }
          })
    })
}