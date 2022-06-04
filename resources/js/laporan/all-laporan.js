const Print = require('print-js')
const { default: Swal } = require('sweetalert2')

const tanggalLaporan = document.getElementById('tanggalLaporan')
const wadahTanggals = document.getElementById('wadahTanggals')
const tanggalAwal = document.getElementById('tanggalAwal')
const tanggalAkhir = document.getElementById('tanggalAkhir')

tanggalLaporan.addEventListener('change', () => {
  if (tanggalLaporan.value == 'pilih') {
    wadahTanggals.classList.remove('hidden')
  } else {
    wadahTanggals.classList.add('hidden')
  }

  tanggalAwal.value = ''
  tanggalAkhir.value = ''
})

function urutTanggal() {
  const raw1 = tanggalAwal.value
  const raw2 = tanggalAkhir.value

  if (raw1 && raw2) {
    const d1 = new Date(raw1).setHours(0, 0, 0, 0)
    const d2 = new Date(raw2).setHours(0, 0, 0, 0)

    if (d1 > d2) {
      tanggalAwal.value = raw2
      tanggalAkhir.value = raw1
    }

  }
}

tanggalAwal.addEventListener('change', urutTanggal)
tanggalAkhir.addEventListener('change', urutTanggal)

// ======================================================== Ini Logic UI CB =======================================================

const semuaKas = document.getElementById('semuaKas')
const rekapKas = document.getElementById('rekapKas')
const daftarKas = document.getElementById('daftarKas')

semuaKas.addEventListener('change', () => {
  if (semuaKas.checked) {
    rekapKas.checked = true
    daftarKas.checked = true
    rekapKas.disabled = true
    daftarKas.disabled = true
  } else {
    rekapKas.checked = false
    daftarKas.checked = false
    rekapKas.disabled = false
    daftarKas.disabled = false
  }
})

const semuaTransaksi = document.getElementById('semuaTransaksi')
const rekapTransaksi = document.getElementById('rekapTransaksi')
const daftarPenjualan = document.getElementById('daftarPenjualan')
const daftarPembelian = document.getElementById('daftarPembelian')
const daftarGadai = document.getElementById('daftarGadai')


semuaTransaksi.addEventListener('change', () => {
  if (semuaTransaksi.checked) {
    rekapTransaksi.checked = true
    daftarPenjualan.checked = true
    daftarPembelian.checked = true
    daftarGadai.checked = true

    rekapTransaksi.disabled = true
    daftarPenjualan.disabled = true
    daftarPembelian.disabled = true
    daftarGadai.disabled = true
  } else {
    rekapTransaksi.checked = false
    daftarPenjualan.checked = false
    daftarPembelian.checked = false
    daftarGadai.checked = false

    rekapTransaksi.disabled = false
    daftarPenjualan.disabled = false
    daftarPembelian.disabled = false
    daftarGadai.disabled = false
  }
})

const semuaBarang = document.getElementById('semuaBarang')
const penambahanStok = document.getElementById('daftarPenambahan')
const koreksiStok = document.getElementById('daftarKoreksi')
const daftarKelompokLaku = document.getElementById('daftarKelompokLaku')
const daftarKelompokMenipis = document.getElementById('daftarKelompokMenipis')
const daftarModelLaku = document.getElementById('daftarModelLaku')

semuaBarang.addEventListener('change', () => {
  if (semuaBarang.checked) {
    penambahanStok.checked = true
    koreksiStok.checked = true
    daftarKelompokLaku.checked = true
    daftarKelompokMenipis.checked = true
    daftarModelLaku.checked = true

    penambahanStok.disabled = true
    koreksiStok.disabled = true
    daftarKelompokLaku.disabled = true
    daftarKelompokMenipis.disabled = true
    daftarModelLaku.disabled = true
  } else {
    penambahanStok.checked = false
    koreksiStok.checked = false
    daftarKelompokLaku.checked = false
    daftarKelompokMenipis.checked = false
    daftarModelLaku.checked = false

    penambahanStok.disabled = false
    koreksiStok.disabled = false
    daftarKelompokLaku.disabled = false
    daftarKelompokMenipis.disabled = false
    daftarModelLaku.disabled = false
  }
})

// =========================================================== Ini Cek ma Persiapan Submit ==================================================

global.cekCB = function () {
  const cb = document.querySelectorAll('.checkbox')

  cb.forEach(element => {
    if (element.checked) {
      console.log('nyala: ' + element.name)
    }
  });
}

const btReset = document.getElementById('btReset')
const btSubmit = document.getElementById('btSubmit')
const labelError = document.getElementById('labelError')

const divMain = document.getElementById('divMain')
const divPDF = document.getElementById('divPDF')

btReset.addEventListener('click', () => {
  const cb = document.querySelectorAll('.checkbox')
  labelError.classList.add('hidden')

  cb.forEach(element => {
    element.checked = false
  });
})

// ===================================================== INI SUBMIT ======================================================================

btSubmit.addEventListener('click', () => {
  const cblen = document.querySelectorAll('.checkbox:checked').length
  labelError.classList.add('hidden')

  if(true){ // cblen > 0
    // sementara sung print dulu, tp ntar tampilin ke div bawahnya

    let formElement = document.getElementById('formLaporan')
    let params = new URLSearchParams(new FormData(formElement)).toString()

    Print({
      printable: '/app/laporan/generate?' + params,
      type: 'pdf',
      showModal: true, // jadiin false kalo gamau ada loading
      modalMessage: 'Menyiapkan dokumen...',
      onError: (error) =>{
        console.log(error)
        if(error === 'Forbidden'){
          Swal.fire({
            title: 'Permintaan Ditolak',
            text: 'Anda tidak memiliki izin untuk mencetak dokumen ini!',
            icon: 'error',
            scrollbarPadding: false,
            confirmButtonText: 'Tutup',
            confirmButtonColor: global.SwalCustomColor.button.cancel
          })
        }

        if(error === 'Bad Request'){
          Swal.fire({
            title: 'Permintaan Tidak Valid',
            text: 'Record penjualan tidak valid atau ada masalah saat menyiapkan nota!',
            icon: 'error',
            scrollbarPadding: false,
            confirmButtonText: 'Tutup',
            confirmButtonColor: global.SwalCustomColor.button.cancel
          })
        }
      }
    })


    // $.get('/app/laporan/generate', {},
    //   function (data, textStatus, jqXHR) {
    //     console.log(typeof data)
    //   },
    // );

  } else{
    labelError.classList.remove('hidden')
  }
})
