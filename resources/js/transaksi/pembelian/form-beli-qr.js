import Swal from "sweetalert2"
import {
  SwalCustomColor,
  rupiahParser,
  removeElementsByClass,
  numberOnlyParser
} from '../../fungsi.js'

// ===================================================== SUPER =========================================================
// ini semua input, kecuali select versi khusus (macem kelengkapan nota, asal pembelian, dkk)

const beratBarang = document.getElementById('beratBarang')
// yang lain ngga perlu di cek, cukup required + server-side check aja

// =============================================== SUPER MENU SAMPING ====================================================
const cardBukaKunci = document.getElementById('cardBukaKunci')
const btBukaKunci = document.getElementById('btBukaKunci')

const cardHitung = document.getElementById('cardHitung')
const btHitung = document.getElementById('btHitung')

const cardHasilHitung = document.getElementById('cardHasilHitung')
const sampingKadar = document.getElementById('sampingKadar')
const sampingBentuk = document.getElementById('sampingBentuk')
const sampingKode = document.getElementById('sampingKode')
const sampingBeratBarang = document.getElementById('sampingBeratBarang')
const sampingWadahInfoNota = document.getElementById('sampingWadahInfoNota')

const sampingWadahRusak = document.getElementById('sampingWadahRusak')
const sampingKeteranganTransaksi = document.getElementById('sampingKeteranganTransaksi')
const sampingWadahPerhitungan = document.getElementById('sampingWadahPerhitungan')

const sampingHargaPerGram = document.getElementById('sampingHargaPerGram')
const sampingKondisiBarang = document.getElementById('sampingKondisiBarang')

const sampingHargaBeliAkhir = document.getElementById('sampingHargaBeliAkhir')
const btTawar = document.getElementById('btTawar')
const btSimpan = document.getElementById('btSimpan')

// ================================================ TRANSAKSIONAL ========================================================
let SUDAHHITUNG = false
let BOLEHNAWAR = false
let APAKAHDITAWAR = false
let HARGABELITARGET = 0
let HARGABELIMAKSDITAWAR = 0
let HARGADEAL = 0
let MAXSELISIH = 0.2

function resetTransaksi() {
  SUDAHHITUNG = false
  BOLEHNAWAR = false
  APAKAHDITAWAR = false
  HARGABELITARGET = 0
  HARGABELIMAKSDITAWAR = 0
  HARGADEAL = 0
  cardHasilHitung.classList.add('hidden')
}

const kode = document.getElementById('kode')
let isiKode = kode.value // diambil langsung biar gabisa diubah2

const bentuk = document.getElementById('bentuk')
let isiBentuk = bentuk.value // diambil langsung biar gabisa diubah2

const apakahDitawar = document.getElementById('apakahDitawar')
const dealTawaran = document.getElementById('dealTawaran')

let formPembelianQR = document.getElementById('formPembelianQR')

// ============================================== MINI CHECK BERAT ========================================================
const infoBerat = document.getElementById('infoBerat')
let maxx = document.getElementById('beratMax')

let beratMax = parseFloat(maxx.value)
let wadahBerat = beratBarang.value
let selisihBerat = 0


beratBarang.addEventListener('change', beratSusut)

function beratSusut(e) {
  let temp = beratMax - e.target.value
  selisihBerat = parseFloat(temp.toFixed(2))
  wadahBerat = e.target.value

  let pesan = ''
  let tingkat = 0

  if(selisihBerat !== 0){
    tingkat = 1
    pesan = 'Berat nota tidak identik!'
  }

  // dibikin gini sementara jadi penginget doang
  if (selisihBerat >= MAXSELISIH || selisihBerat < 0) {
    tingkat = 2
    pesan = 'Berat nota tidak identik, dan selisihnya terlalu besar!'

    Swal.fire({
      title: 'Perhatian!',
      icon: 'warning',
      text: `Selisih berat riil perhiasan dan berat pada nota melebihi ${ MAXSELISIH } gram. Pastikan anda mencatat semua kerusakan perhiasan!`,
      confirmButtonText: 'Tutup',
      confirmButtonColor: SwalCustomColor.button.cancel,
    }) 
  }


  infoBerat.textContent = pesan

  infoBerat.classList.remove('text-warning', 'text-error')
  e.target.classList.remove('bg-warning', 'bg-opacity-20', 'input-warning', 'bg-error', 'input-error')

  if(tingkat === 1){
    infoBerat.classList.add('text-warning')
    e.target.classList.add('bg-warning', 'bg-opacity-20', 'input-warning')
  } else if (tingkat === 2){
    infoBerat.classList.add('text-error')
    e.target.classList.add('bg-error', 'bg-opacity-20', 'input-error')
  }

}

// ========================================================== MULAI ==============================================================


// ===================================================== INPUT KERUSAKAN ==========================================================
const Rusak = require('./modul-kerusakan')
const btRusak = document.getElementById('btRusak')

btRusak.addEventListener('click', () => {
  // beda ama yang laen, disini ngga perlu di cek soalnya lu dah megang id nya
  Rusak.tambahKerusakan(isiBentuk, 'wadah-rusak', 'teks-tabel-kosong')
})

// ===================================================== MULAI CEK HARGA ========================================================
btHitung.addEventListener('click', () => {
  let temp = beratMax - wadahBerat
  selisihBerat = parseFloat(temp.toFixed(2))
  // let cekB = parseFloat(temp.toFixed(2))

  if(cekConstrain()){
    // dibikin gini sementara jadi penginget doang
    if (selisihBerat >= MAXSELISIH || selisihBerat < 0) {
      Swal.fire({
        title: 'Perhatian!',
        icon: 'warning',
        text: `Selisih berat riil perhiasan dan berat pada nota terlalu besar! Pastikan anda mencatat semua kerusakan perhiasan sebelum melakukan penghitungan harga.`,
        confirmButtonText: 'Lanjutkan',
        confirmButtonColor: SwalCustomColor.button.confirm,
        cancelButtonText: 'Batal',
        showCancelButton: true,
        focusCancel: true,
      }).then((selisih) => {
        if (selisih.isConfirmed) {
          cekHarga()
        }
      })

    } else {
      cekHarga()
    }
  }
  

})

function cekHarga() {
  let datas = new FormData(formPembelianQR)

  if (cekConstrain()) {
    resetTransaksi()

    $.ajaxSetup({
      headers: {
        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
      }
    });

    let tempWadah
    let tempError

    Swal.fire({
      title: 'Menghitung harga beli...',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      scrollbarPadding: false,
      didOpen: () => {
        Swal.showLoading()

        $.ajax({
          type: "POST",
          url: "/app/transaksi/pembelian/qr/hitung-harga-belakang",
          data: datas,
          dataType: 'json',
          processData: false,
          contentType: false,
          success: function (response) {
            setTimeout(() => {
              SUDAHHITUNG = true
              tempWadah = response

              console.log('nih data')
              console.log(response)

              Swal.clickConfirm()
            }, 1000)

          },
          error: function (response) {
            tempError = response.responseJSON
            Swal.clickDeny()
          }
        });

      }
    }).then((hitungHarga) => {
      if (hitungHarga.isDenied) {
        if (tempError && tempError.error.messages) swalError('Formulir yang anda kirim tidak valid', 'Validasi Error')
        else if (tempError && tempError.error) swalError(tempError.error)
        else swalError()

        bukaForm()
      }

      if (hitungHarga.isConfirmed) {

        try {
          // natanya disini
          sampingWadahRusak.textContent = ''
          sampingWadahInfoNota.textContent = ''
          sampingWadahPerhitungan.textContent = ''

          sampingBeratBarang.textContent = `${tempWadah.beratBarang} gram`

          if (tempWadah.kerusakan.wadahRusak.length > 0) {
            tempWadah.kerusakan.wadahRusak.forEach(item => {
              let warper = document.createElement('div')
              warper.classList.add('text-error')

              let divRusak = document.createElement('div')
              divRusak.textContent = item.teks
              let divOngkos = document.createElement('div')
              divOngkos.textContent = item.ongkos
              warper.append(divRusak, divOngkos)

              sampingWadahRusak.append(warper)
            });
          } else {
            sampingWadahRusak.textContent = 'Tidak ada'
          }


          sampingWadahInfoNota.append(buatListSamping('Jenis stok:', tempWadah.dataNota.jenisStok))
          sampingWadahInfoNota.append(buatListSamping('Berat nota:', tempWadah.dataNota.beratNota))
          sampingWadahInfoNota.append(buatListSamping('Harga nota:', tempWadah.dataNota.hargaJualNota))
          sampingWadahInfoNota.append(buatListSamping('Potongan:', tempWadah.dataNota.potonganDeskripsiNota))


          sampingKeteranganTransaksi.textContent = (tempWadah.keteranganTransaksi) ? tempWadah.keteranganTransaksi : '-'
          sampingHargaPerGram.textContent = tempWadah.hitunganTransaksi.hargaPerGram
          sampingKondisiBarang.textContent = tempWadah.kerusakan.kondisiBarang

          if (tempWadah.potonganNPenalti.potonganDeskripsi) {
            sampingWadahPerhitungan.append(buatListSamping('Potongan akhir:', tempWadah.potonganNPenalti.potonganDeskripsi, 1))
          }

          if (tempWadah.potonganNPenalti.totalPotonganDeskripsi) {
            sampingWadahPerhitungan.append(buatListSamping('Total potongan:', tempWadah.potonganNPenalti.totalPotonganDeskripsi, 1))
          }

          if (tempWadah.kerusakan.totalKerusakan) {
            sampingWadahPerhitungan.append(buatListSamping('Total kerusakan:', tempWadah.kerusakan.totalKerusakan, 1))
          }

          if (tempWadah.potonganNPenalti.penaltiDeskripsi) {
            sampingWadahPerhitungan.append(buatListSamping('Penalti:', tempWadah.potonganNPenalti.penaltiDeskripsi, 1))
          }


          // -------- transaksional -------- 
          sampingHargaBeliAkhir.textContent = rupiahParser(tempWadah.hitunganTransaksi.hargaBeliTarget)
          HARGABELITARGET = tempWadah.hitunganTransaksi.hargaBeliTarget
          BOLEHNAWAR = tempWadah.hitunganTransaksi.apakahBisaDitawar
          HARGABELIMAKSDITAWAR = (BOLEHNAWAR) ? tempWadah.hitunganTransaksi.hargaBeliMaksDitawar : HARGABELITARGET
          HARGADEAL = HARGABELITARGET
          SUDAHHITUNG = true

          kunciForm()

        } catch (error) {
          bukaForm()
          console.error(error)
          swalError('Parsing error, data tidak valid.')
        }

      }
    })

  }
}


// ============================================== RESET KALO ADA YANG BERUBAH ===================================================
function bukaForm() {
  const inputs = document.querySelectorAll('form#formPembelianQR .bisaDikunci')
  for (const i of inputs) {
    i.disabled = false
  }

  resetTransaksi()

  cardHitung.classList.remove('hidden')
  cardBukaKunci.classList.add('hidden')
  cardHasilHitung.classList.add('hidden')
}

function kunciForm() {
  const inputs = document.querySelectorAll('form#formPembelianQR .bisaDikunci')
  for (const i of inputs) {
    i.disabled = true
  }

  cardHitung.classList.add('hidden')
  cardBukaKunci.classList.remove('hidden')
  cardHasilHitung.classList.remove('hidden')
}

btBukaKunci.addEventListener('click', bukaForm)

// =============================================== AJUKAN TAWARAN ===========================================================
btTawar.addEventListener('click', () => {

  if (SUDAHHITUNG) {
    if (BOLEHNAWAR) {
      Swal.fire({
        title: 'Tawar Harga',
        html: `<div>Isikan harga beli yang dikehendaki penjual, mulai dari range <b>${rupiahParser(HARGABELITARGET)}</b> hingga <b>${rupiahParser(HARGABELIMAKSDITAWAR)}</b></div>`,
        input: 'number',
        inputPlaceholder: 'Harga beli',
        showCancelButton: true,
        inputValue: HARGADEAL,
        cancelButtonText: 'Batal',
        confirmButtonColor: SwalCustomColor.button.confirm,
        confirmButtonText: 'Tawar',
        focusCancel: true,
        scrollbarPadding: false,
        inputValidator: (value) => {
          if (value < HARGABELITARGET) return 'Tawar tidak boleh dibawah harga target'
          if (value > HARGABELIMAKSDITAWAR) return 'Tawaran terlalu tinggi!'
        }
      }).then((tawar) => {
        if (tawar.isConfirmed) {
          let angkaTawar = numberOnlyParser(tawar.value)

          Swal.fire({
            title: 'Simpan penawaran?',
            html: `Anda akan mengubah harga beli dari <b>${rupiahParser(HARGADEAL)}</b> menjadi <b>${rupiahParser(angkaTawar)}</b>. Tawaran dapat diubah kembali setalahnya.`,
            showCancelButton: true,
            cancelButtonText: 'Batal',
            confirmButtonColor: SwalCustomColor.button.confirm,
            confirmButtonText: 'Ya, simpan',
            focusCancel: true,
            scrollbarPadding: false,
          }).then((simpan) => {
            if (simpan.isConfirmed) {
              if (angkaTawar === HARGABELITARGET) {
                APAKAHDITAWAR = false
              } else {
                APAKAHDITAWAR = true
              }
              HARGADEAL = angkaTawar

              sampingHargaBeliAkhir.textContent = rupiahParser(angkaTawar)
            }
          })

        }
      })

    } else {
      swalError('Harga ini sudah PAS dan tidak dapat ditawar!', 'Mohon Maaf')
    }

  } else {
    swalError('Anda belum menghitung harga beli!')
  }
})

// =============================================== INI SUBMIT FORM ===========================================================
btSimpan.addEventListener('click', () => {
  apakahDitawar.checked = APAKAHDITAWAR
  dealTawaran.value = HARGADEAL

  if (cekConstrain()) {
    if (!SUDAHHITUNG) {
      return swalError('Belom dihitung!')
    }

    if (!BOLEHNAWAR && APAKAHDITAWAR) {
      return swalError('Ngga boleh ditawar!')
    }

    if (HARGABELIMAKSDITAWAR == 0 || HARGABELITARGET == 0 || HARGADEAL == 0) {
      return swalError('Harga beli tidak valid!')
    }

    if (!dealTawaran.value || !apakahDitawar.value) {
      return swalError('Ada error teknis!')
    }

    Swal.fire({
      title: 'Simpan pembelian?',
      text: 'Pastikan data yang anda isikan sudah benar!',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Ya, simpan!',
      confirmButtonColor: SwalCustomColor.button.confirm,
      cancelButtonText: 'Batal',
      scrollbarPadding: false,
      focusCancel: true,
    }).then((result) => {

      if (result.isConfirmed) {
        bukaForm()

        formPembelianQR.method = 'POST'
        formPembelianQR.action = window.location.pathname
        formPembelianQR.submit()
      }

    })
  }
})


// ======================================================= CONSTRAIN =============================================================
let eventBeratBarang = false

function cekConstrain() {
  let errorMsg = document.createElement('p')
  errorMsg.classList.add('text-error', 'pesanerror')

  // cek berat
  if (beratBarang.value <= 0 || !beratBarang.value || beratBarang.value > beratMax) {
    beratBarang.classList.add('input-error', 'bg-error')
    errorMsg.innerText = `Berat barang harus diatas nol dan kurang dari sama dengan ${beratMax} gram!`
    if (document.getElementsByClassName('pesanerror').length == 0) beratBarang.after(errorMsg)
    beratBarang.scrollIntoView({
      block: "center",
      inline: "nearest"
    });

    if (!eventBeratBarang) {
      beratBarang.addEventListener('change', function () {
        // console.log('wewe ', beratBarang.value, beratMax)
        if (beratBarang.value && beratBarang.value > 0 && beratBarang.value <= beratMax) {
          beratBarang.classList.remove('input-error', 'bg-error')
          removeElementsByClass('pesanerror')
        }
      })
      eventBeratBarang = true
    }

    return false
  }


  if (!formPembelianQR.reportValidity()) return false

  return true
}


// ========================================================== EXTRA ==============================================================
const fotoPJ = document.getElementById('fotoPJ')
fotoPJ.addEventListener('click', (e) => {
  if (e.target.src) {
    Swal.fire({
      imageUrl: e.target.src,
      confirmButtonText: 'Tutup',
      confirmButtonColor: SwalCustomColor.button.cancel,
    })
  } else {
    swalError('Foto penjualan tidak valid')
  }
})

function swalError(error = '', judul = '') {
  Swal.fire({
    icon: 'error',
    title: (judul) ? judul : 'Error',
    scrollbarPadding: false,
    text: (error) ? error : 'Ada masalah pada server!',
    confirmButtonText: 'Tutup',
    confirmButtonColor: SwalCustomColor.button.cancel
  })
}


function buatListSamping(field, input, mode = 0) {
  let warper = document.createElement('div')
  warper.classList.add('flex')

  let divField = document.createElement('span')
  divField.textContent = field
  divField.classList.add('flex-1')

  let divInput = document.createElement('span')
  divInput.textContent = input
  divInput.classList.add('flex-none')
  if (mode == 1) {
    divInput.classList.add('text-error')
  }

  warper.append(divField, divInput)

  return warper
}
