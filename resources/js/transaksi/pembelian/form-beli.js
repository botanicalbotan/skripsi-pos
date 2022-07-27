import Swal from "sweetalert2"

import {
  SwalCustomColor,
  rupiahParser,
  removeElementsByClass,
  numberOnlyParser
} from '../../fungsi.js'

$(function () {
  // ===================================================== SUPER =========================================================
  // ini semua input, kecuali select versi khusus (macem kelengkapan nota, asal pembelian, dkk)

  const pilihTanpaNota = document.getElementById('pilihTanpaNota')
  const pilihAsalLuar = document.getElementById('pilihAsalLuar')

  // const namaToko = document.getElementById('namaToko')

  const kadar = document.getElementById('kadar')
  const kodepro = document.getElementById('kodepro')

  const bentuk = document.getElementById('bentuk')
  const model = document.getElementById('model')
  // input jenis stok
  // const keteranganCatatan = document.getElementById('keteranganCatatan')

  const beratNota = document.getElementById('beratNota')
  const beratBarang = document.getElementById('beratBarang')

  const hargaJualNota = document.getElementById('hargaJualNota')
  const potonganNota = document.getElementById('potonganNota')

  const tanggalBeli = document.getElementById('tanggalBeli')

  const ajukanTT = document.getElementById('ajukanTT')
  const adaJanjiTT = document.getElementById('adaJanjiTT')
  const barangDipakai = document.getElementById('barangDipakai')
  const pelangganTetap = document.getElementById('pelangganTetap')

  // ini tanda potongan berubah
  const tandaPotonganNotaLabel = document.getElementById('tandaPotonganNotaLabel')
  const tandaPotonganNota = document.getElementById('tandaPotonganNota')
  const tandaPotonganNotaPlus = document.getElementById('tandaPotonganNotaPlus')

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
  // const sampingTotalPotongan = document.getElementById('sampingTotalPotongan')
  // const sampingTotalKerusakan = document.getElementById('sampingTotalKerusakan')

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

  const apakahDitawar = document.getElementById('apakahDitawar')
  const dealTawaran = document.getElementById('dealTawaran')

  let formPembelian = document.getElementById('formPembelian')

  // ===================================================== QR Scanner ======================================================
  const QR = require('./modul-QR')

  // masalah QR ntar dulu, kek methodnya pake POST apa GET, dll
  const bukaScanner = document.getElementById('bukaScanner')
  bukaScanner.addEventListener('click', () => {
    QR.bukaScanner()
  })

  // ===================================================== MULAI ===========================================================
  function resetAsal() {
    // nama toko ama beberapa input laen udah dibantu alpine, cek .edge filenya
    beratNota.value = ''
    hargaJualNota.value = ''
    potonganNota.value = ''
    tanggalBeli.value = ''
    adaJanjiTT.checked = false
    barangDipakai.checked = false
    pelangganTetap.checked = false
  }


  // ganti value kalo bukan leo
  pilihTanpaNota.addEventListener('click', resetAsal)
  pilihAsalLuar.addEventListener('click', resetAsal)


  // ambil data yang dibutuhin
  $.get("/app/cuma-data/kadar-bentuk", {},
    function (data, textStatus, jqXHR) {
      data.bentuk.forEach(element => {
        let opt = document.createElement('option')
        opt.value = element.id
        opt.textContent = element.bentuk

        bentuk.append(opt)
      });

      data.kadar.forEach(element => {
        let opt = document.createElement('option')
        opt.value = element.id
        opt.textContent = element.nama

        kadar.append(opt)
      });
    },
    "json"
  );

  let resetKodepro = function (isi = undefined) {
    kodepro.textContent = '' // kosongin isinya dulu

    // default
    let opt = document.createElement('option')
    opt.value = 'kosong'
    opt.textContent = (isi) ? isi : 'Pilih kadar terlebih dahulu'
    kodepro.append(opt)
  }

  kadar.addEventListener('change', (e) => {
    if (kadar.value && kadar.value != 'kosong') {
      sampingKadar.textContent = e.target.options[e.target.selectedIndex].text

      $.get("/app/cuma-data/kodepros-by-id", {
          id: kadar.value
        },
        function (data, textStatus, jqXHR) {
          resetKodepro('Pilih kode ' + kadar.options[kadar.selectedIndex].textContent.toLowerCase())

          if (data.kodepros.length > 0) {
            data.kodepros.forEach(element => {
              let opt = document.createElement('option')
              opt.value = element.id
              opt.textContent = element.kode

              kodepro.append(opt)
            });
          }

          if (data.kadar.apakahPotonganPersen) {
            tandaPotonganNotaLabel.textContent = '(persentase)'
            tandaPotonganNota.textContent = '%'
            tandaPotonganNotaPlus.textContent = ''
          } else {
            tandaPotonganNotaLabel.textContent = '(nominal)'
            tandaPotonganNota.textContent = 'Rp.'
            tandaPotonganNotaPlus.textContent = 'per gram'
          }

          potonganNota.disabled = false
        },
        "json"
      ).fail(() => {
        potonganNota.disabled = true
        resetKodepro()
      }).always(() => {
        potonganNota.value = ''
      })
    }
  })

  let resetModel = function (isi = undefined) {
    model.textContent = '' // kosongin isinya dulu

    // default
    let opt = document.createElement('option')
    opt.value = 'kosong'
    opt.textContent = (isi) ? isi : 'Pilih bentuk terlebih dahulu'
    model.append(opt)
  }

  bentuk.addEventListener('change', (e) => {
    sampingBentuk.textContent = e.target.options[e.target.selectedIndex].text

    if (bentuk.value && bentuk.value != 'kosong') {
      $.get("/app/cuma-data/model-by-bentuk", {
          bentukId: bentuk.value
        },
        function (data, textStatus, jqXHR) {
          resetModel('Pilih model ' + bentuk.options[bentuk.selectedIndex].textContent.toLowerCase())

          if (data.model.length > 0) {
            data.model.forEach(element => {
              let opt = document.createElement('option')
              opt.value = element.id
              opt.textContent = element.nama

              model.append(opt)
            });
          }

        },
        "json"
      ).fail(() => {
        resetModel()
      })
    }
  })

  kodepro.addEventListener('change', (e) => {
    sampingKode.textContent = e.target.options[e.target.selectedIndex].text
  })


  // -------------------- SELISIH BERAT ----------------------
  const infoBerat = document.getElementById('infoBerat')
  let selisihBerat = 0
  let setMax = false

  beratNota.addEventListener('change', () => {
    beratBarang.max = beratNota.value
    setMax = true

    beratSusut()
  })


  beratBarang.addEventListener('change', (e) => {
    if (e.target.value > e.target.max && setMax) {
      e.target.value = e.target.max
    }

    beratSusut()
  })

  function beratSusut() {
    if (document.querySelector('input[name=kelengkapanNota]:checked').value === 'dengan' && beratNota.value && beratBarang.value) {
      let temp = beratNota.value - beratBarang.value
      selisihBerat = parseFloat(temp.toFixed(2))

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
      beratBarang.classList.remove('bg-warning', 'bg-opacity-20', 'input-warning', 'bg-error', 'input-error')
      beratNota.classList.remove('bg-warning', 'bg-opacity-20', 'input-warning', 'bg-error', 'input-error')

      if(tingkat === 1){
        infoBerat.classList.add('text-warning')
        beratBarang.classList.add('bg-warning', 'bg-opacity-20', 'input-warning')
        beratNota.classList.add('bg-warning', 'bg-opacity-20', 'input-warning')
      } else if (tingkat === 2){
        infoBerat.classList.add('text-error')
        beratBarang.classList.add('bg-error', 'bg-opacity-20', 'input-error')
        beratNota.classList.add('bg-error', 'bg-opacity-20', 'input-error')
      }
    }
  }


  // ===================================================== INPUT KERUSAKAN ==========================================================
  let eventBentuk = false
  const Rusak = require('./modul-kerusakan')
  const btRusak = document.getElementById('btRusak')

  btRusak.addEventListener('click', () => {
    let errorMsg = document.createElement('p')
    errorMsg.classList.add('text-error', 'pesanerrorRusak')

    // cek bentuk dulu
    if (bentuk.value === 'kosong') {
      bentuk.classList.add('select-error', 'bg-error')
      bentuk.classList.remove('bg-primary', 'select-primary')
      errorMsg.innerText = 'Pilih salah satu bentuk!'
      if (document.getElementsByClassName('pesanerrorRusak').length == 0) bentuk.after(errorMsg)
      bentuk.scrollIntoView({
        // behavior: "smooth",
        block: "center",
        inline: "nearest"
      });

      if (!eventBentuk) {
        bentuk.addEventListener('change', function () {
          if (bentuk.value && bentuk.value !== 'kosong') {
            bentuk.classList.remove('select-error', 'bg-error')
            bentuk.classList.add('bg-primary', 'select-primary')
            removeElementsByClass('pesanerrorRusak')
          }
        })
        eventBentuk = true
      }

      return
    }

    Rusak.tambahKerusakan(bentuk.value, 'wadah-rusak', 'teks-tabel-kosong')
  })

  // ===================================================== MULAI CEK HARGA ===========================================================
  btHitung.addEventListener('click', () => {

    // dibikin gini sementara jadi penginget doang
    if(cekConstrain()){
      if (selisihBerat >= MAXSELISIH || selisihBerat < 0) {
        infoBerat.textContent = 'Berat nota tidak identik!'
        
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
        infoBerat.textContent = ''
        cekHarga()
      }
    }

  })

  function cekHarga() {
    let datas = new FormData(formPembelian)

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
            url: "/app/transaksi/pembelian/hitung-harga-belakang",
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

            if (tempWadah.adaNotaLeo) {
              sampingWadahInfoNota.append(buatListSamping('Jenis stok:', tempWadah.dataNota.jenisStok))
              sampingWadahInfoNota.append(buatListSamping('Berat nota:', tempWadah.dataNota.beratNota))
              sampingWadahInfoNota.append(buatListSamping('Harga nota:', tempWadah.dataNota.hargaJualNota))
              sampingWadahInfoNota.append(buatListSamping('Potongan:', tempWadah.dataNota.potonganDeskripsiNota))
            }

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

  // ======================================== RESET KALO ADA YANG BERUBAH ======================================================
  function bukaForm() {
    const inputs = document.querySelectorAll('form#formPembelian .bisaDikunci')
    for (const i of inputs) {
      i.disabled = false
    }

    resetTransaksi()

    cardHitung.classList.remove('hidden')
    cardBukaKunci.classList.add('hidden')
    cardHasilHitung.classList.add('hidden')
  }

  function kunciForm() {
    const inputs = document.querySelectorAll('form#formPembelian .bisaDikunci')
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
        return swalError('Ada error teknikal!')
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

          formPembelian.method = 'POST'
          formPembelian.action = window.location.pathname
          formPembelian.submit()
        }

      })
    }
  })

  // ===================================================== CONSTRAIN ===========================================================

  let eventModel = false
  let eventKodepro = false
  let eventBeratBarang = false
  let eventBeratNota = false

  function cekConstrain() {
    let errorMsg = document.createElement('p')
    errorMsg.classList.add('text-error', 'pesanerror')
    // cek kodepro
    if (kodepro.value === 'kosong') {
      kodepro.classList.add('select-error', 'bg-error')
      kodepro.classList.remove('bg-primary', 'select-primary')
      errorMsg.innerText = 'Pilih salah satu kode!'
      if (document.getElementsByClassName('pesanerror').length == 0) kodepro.after(errorMsg)
      kodepro.scrollIntoView({
        // behavior: "smooth",
        block: "center",
        inline: "nearest"
      });

      if (!eventKodepro) {
        kodepro.addEventListener('change', function () {
          if (kodepro.value && kodepro.value !== 'kosong') {
            kodepro.classList.remove('select-error', 'bg-error')
            kodepro.classList.add('bg-primary', 'select-primary')
            removeElementsByClass('pesanerror')
          }
        })
        eventKodepro = true
      }

      return false
    }

    // cek model
    if (model.value === 'kosong') {
      model.classList.add('select-error', 'bg-error')
      model.classList.remove('bg-primary', 'select-primary')
      errorMsg.innerText = 'Pilih salah satu model!'
      if (document.getElementsByClassName('pesanerror').length == 0) model.after(errorMsg)
      model.scrollIntoView({
        // behavior: "smooth",
        block: "center",
        inline: "nearest"
      });

      if (!eventModel) {
        model.addEventListener('change', function () {
          if (model.value && model.value !== 'kosong') {
            model.classList.remove('select-error', 'bg-error')
            model.classList.add('bg-primary', 'select-primary')
            removeElementsByClass('pesanerror')
          }
        })
        eventModel = true
      }

      return false
    }

    // cek berat nota
    if ((beratNota.value <= 0 || !beratNota.value) && document.querySelector('input[name=kelengkapanNota]:checked').value === 'dengan') {
      beratNota.classList.add('input-error', 'bg-error')
      // beratNota.classList.remove('bg-primary', 'input-primary')
      errorMsg.innerText = `Berat nota tidak boleh nol!`
      if (document.getElementsByClassName('pesanerror').length == 0) beratNota.after(errorMsg)
      beratNota.scrollIntoView({
        // behavior: "smooth",
        block: "center",
        inline: "nearest"
      });

      if (!eventBeratNota) {
        beratNota.addEventListener('change', function () {
          if (beratNota.value && beratNota.value !== 'kosong') {
            beratNota.classList.remove('input-error', 'bg-error')
            // beratNota.classList.add('bg-primary', 'input-primary')
            removeElementsByClass('pesanerror')
          }
        })
        eventBeratNota = true
      }

      return false
    }

    // cek berat barang
    if (beratBarang.value <= 0 || !beratBarang.value || (beratBarang.value > beratNota.value && document.querySelector('input[name=kelengkapanNota]:checked').value === 'dengan')) {
      beratBarang.classList.add('input-error', 'bg-error')
      // beratBarang.classList.remove('bg-primary', 'input-primary')
      errorMsg.innerText = `Berat barang harus diatas nol dan kurang dari sama dengan ${beratBarang.max}!`
      if (document.getElementsByClassName('pesanerror').length == 0) beratBarang.after(errorMsg)
      beratBarang.scrollIntoView({
        // behavior: "smooth",
        block: "center",
        inline: "nearest"
      });

      if (!eventBeratBarang) {
        beratBarang.addEventListener('change', function () {
          if (beratBarang.value && beratBarang.value !== 'kosong') {
            beratBarang.classList.remove('input-error', 'bg-error')
            // beratBarang.classList.add('bg-primary', 'input-primary')
            removeElementsByClass('pesanerror')
          }
        })
        eventBeratBarang = true
      }

      return false
    }

    if (!formPembelian.reportValidity()) return false

    return true
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
