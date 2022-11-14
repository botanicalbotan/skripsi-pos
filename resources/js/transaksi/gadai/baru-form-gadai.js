import Swal from "sweetalert2"
// import Swal from "sweetalert2/dist/sweetalert2"

import {
    SwalCustomColor,
    rupiahParser,
    removeElementsByClass,
    numberOnlyParser
} from '../../fungsi.js'

$(function () {
    const bagianAtas = document.getElementById('bagianAtas')
    const kepalaForm1 = document.getElementById('kepalaForm1')
    const kepalaForm2 = document.getElementById('kepalaForm2')
    const kepalaForm3 = document.getElementById('kepalaForm3')

    const formGadai = document.getElementById('formGadai')

    // ini cuma div aja, yang asli diatas
    const form1 = document.getElementById('form1')
    const form2 = document.getElementById('form2')
    const form3 = document.getElementById('form3')

    const btPindah1 = document.getElementById('btPindah1')
    const btPindah2 = document.getElementById('btPindah2')
    const btBalik2 = document.getElementById('btBalik2')
    const btPindah3 = document.getElementById('btPindah3')
    const btSimpan = document.getElementById('btSimpan')

    // dari f2 ke f1
    btPindah1.addEventListener('click', () => {
        keTampilanF1()
    })

    // dari f1 ke f2, f1 di cek dulu
    btPindah2.addEventListener('click', () => {
        if (cekConstrain1()) {
            keTampilanF2()
        }
    })

    // dari f2 ke f3, f2 di cek dulu
    btPindah3.addEventListener('click', () => {
        apakahDitawar.checked = APAKAHDITAWAR
        dealTawaran.value = HARGADEAL

        if (cekConstrain2()) {
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

            keTampilanF3()
        }
    })

    // dari f3 ke f2
    btBalik2.addEventListener('click', () => {
        keTampilanF2()
    })

    // dah otw nyimpen transaksi
    btSimpan.addEventListener('click', () => {
        apakahDitawar.checked = APAKAHDITAWAR
        dealTawaran.value = HARGADEAL

        if (!cekConstrain1()) {
            return keTampilanF1()
        }

        if (!cekConstrain2()) {
            return keTampilanF2()
        }

        if (!cekConstrain3()) {
            return keTampilanF3()
        }

        if (!SUDAHHITUNG) {
            swalError('Belom dihitung!')
            return keTampilanF2()
        }

        if (!BOLEHNAWAR && APAKAHDITAWAR) {
            swalError('Ngga boleh ditawar!')
            return keTampilanF2()
        }

        if (HARGABELIMAKSDITAWAR == 0 || HARGABELITARGET == 0 || HARGADEAL == 0) {
            swalError('Harga beli tidak valid!')
            return keTampilanF2()
        }

        if (!dealTawaran.value || !apakahDitawar.value) {
            swalError('Ada error teknikal!')
            return keTampilanF2()
        }

        // kalau ngga ada yang error, submit disini
        Swal.fire({
            title: 'Simpan gadai?',
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

                formGadai.method = 'POST'
                formGadai.action = window.location.pathname.slice(0, -5)
                formGadai.submit()
            }

        })
    })


    // ======================================= INI BAGIAN FORM 1 ==========================================
    const f1NamaPenggadai = document.getElementById('f1NamaPenggadai')
    const f1NikPenggadai = document.getElementById('f1NikPenggadai')
    const f1NoHpAktif = document.getElementById('f1NoHpAktif')
    const f1TanggalTenggat = document.getElementById('f1TanggalTenggat')
    const f1Keterangan = document.getElementById('f1Keterangan')

    function keTampilanF1() {
        form1.classList.remove('hidden')
        form2.classList.add('hidden')
        form3.classList.add('hidden')

        kepalaForm1.classList.add('bg-primary', 'text-white')
        kepalaForm2.classList.remove('bg-primary', 'text-white')
        kepalaForm3.classList.remove('bg-primary', 'text-white')

        balikAtas()
    }

    function cekConstrain1() {
        if (f1NamaPenggadai.reportValidity() && f1NikPenggadai.reportValidity() && f1NoHpAktif.reportValidity() && f1TanggalTenggat.reportValidity() && f1Keterangan.reportValidity()) {
            return true
        }

        return false
    }

    // ======================================= INI BAGIAN FORM 2 =========================================

    function keTampilanF2() {
        form1.classList.add('hidden')
        form2.classList.remove('hidden')
        form3.classList.add('hidden')

        kepalaForm1.classList.remove('bg-primary', 'text-white')
        kepalaForm2.classList.add('bg-primary', 'text-white')
        kepalaForm3.classList.remove('bg-primary', 'text-white')

        balikAtas()
    }

    // ------------- SUPER -----------------
    // ini semua input, kecuali select versi khusus (macem kelengkapan nota, asal pembelian, dkk)
    const f2PilihTanpaNota = document.getElementById('f2PilihTanpaNota')
    const f2PilihAsalLuar = document.getElementById('f2PilihAsalLuar')
    const f2Kadar = document.getElementById('f2Kadar')
    const f2Kodepro = document.getElementById('f2Kodepro')
    const f2Bentuk = document.getElementById('f2Bentuk')
    const f2Model = document.getElementById('f2Model')
    const f2BeratNota = document.getElementById('f2BeratNota')
    const f2BeratBarang = document.getElementById('f2BeratBarang')
    const f2HargaJualNota = document.getElementById('f2HargaJualNota')
    const f2PotonganNota = document.getElementById('f2PotonganNota')
    const f2TanggalBeli = document.getElementById('f2TanggalBeli')

    // ini tanda potongan berubah
    const tandaPotonganNotaLabel = document.getElementById('tandaPotonganNotaLabel')
    const tandaPotonganNota = document.getElementById('tandaPotonganNota')
    const tandaPotonganNotaPlus = document.getElementById('tandaPotonganNotaPlus')

    // --------------------- SUPER MENU SAMPING -------------------------
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

    // ------------------------ TRANSAKSIONAL ---------------------------
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

    // -------------------- MULAI ----------------------------
    function resetAsal() {
        // nama toko ama beberapa input laen udah dibantu alpine, cek .edge filenya
        f2BeratNota.value = ''
        f2HargaJualNota.value = ''
        f2PotonganNota.value = ''
        f2TanggalBeli.value = ''
    }

    // ganti value kalo bukan leo
    f2PilihTanpaNota.addEventListener('click', resetAsal)
    f2PilihAsalLuar.addEventListener('click', resetAsal)

    // ambil data yang dibutuhin
    $.get("/app/cuma-data/kadar-bentuk", {},
        function (data, textStatus, jqXHR) {
            data.bentuk.forEach(element => {
                let opt = document.createElement('option')
                opt.value = element.id
                opt.textContent = element.bentuk

                f2Bentuk.append(opt)
            });

            data.kadar.forEach(element => {
                let opt = document.createElement('option')
                opt.value = element.id
                opt.textContent = element.nama

                f2Kadar.append(opt)
            });
        },
        "json"
    );

    let resetKodepro = function (isi = undefined) {
        f2Kodepro.textContent = '' // kosongin isinya dulu

        // default
        let opt = document.createElement('option')
        opt.value = 'kosong'
        opt.textContent = (isi) ? isi : 'Pilih kadar terlebih dahulu'
        f2Kodepro.append(opt)
    }

    f2Kadar.addEventListener('change', (e) => {
        if (f2Kadar.value && f2Kadar.value != 'kosong') {
            sampingKadar.textContent = e.target.options[e.target.selectedIndex].text

            $.get("/app/cuma-data/kodepros-by-id", {
                id: f2Kadar.value
            },
                function (data, textStatus, jqXHR) {
                    resetKodepro('Pilih kode ' + f2Kadar.options[f2Kadar.selectedIndex].textContent.toLowerCase())

                    if (data.kodepros.length > 0) {
                        data.kodepros.forEach(element => {
                            let opt = document.createElement('option')
                            opt.value = element.id
                            opt.textContent = element.kode

                            f2Kodepro.append(opt)
                        });
                    }

                    if (data.kadar.apakahPotonganPersen) {
                        tandaPotonganNotaLabel.textContent = '(persentase)'
                        tandaPotonganNota.textContent = '%'
                        tandaPotonganNotaPlus.textContent = ''
                        // yes, hardcoded
                        f2PotonganNota.max = 100
                    } else {
                        tandaPotonganNotaLabel.textContent = '(nominal)'
                        tandaPotonganNota.textContent = 'Rp.'
                        tandaPotonganNotaPlus.textContent = 'per gram'
                        // yes, hardcoded
                        f2PotonganNota.max = 50000
                    }

                    f2PotonganNota.disabled = false
                },
                "json"
            ).fail(() => {
                f2PotonganNota.disabled = true
                resetKodepro()
            }).always(() => {
                f2PotonganNota.value = ''
            })
        }
    })

    let resetModel = function (isi = undefined) {
        f2Model.textContent = '' // kosongin isinya dulu

        // default
        let opt = document.createElement('option')
        opt.value = 'kosong'
        opt.textContent = (isi) ? isi : 'Pilih bentuk terlebih dahulu'
        f2Model.append(opt)
    }

    f2Bentuk.addEventListener('change', (e) => {
        sampingBentuk.textContent = e.target.options[e.target.selectedIndex].text

        if (f2Bentuk.value && f2Bentuk.value != 'kosong') {
            $.get("/app/cuma-data/model-by-bentuk", {
                bentukId: f2Bentuk.value
            },
                function (data, textStatus, jqXHR) {
                    resetModel('Pilih model ' + f2Bentuk.options[f2Bentuk.selectedIndex].textContent.toLowerCase())

                    if (data.model.length > 0) {
                        data.model.forEach(element => {
                            let opt = document.createElement('option')
                            opt.value = element.id
                            opt.textContent = element.nama

                            f2Model.append(opt)
                        });
                    }

                },
                "json"
            ).fail(() => {
                resetModel()
            })
        }
    })

    f2Kodepro.addEventListener('change', (e) => {
        sampingKode.textContent = e.target.options[e.target.selectedIndex].text
    })


    // -------------------- SELISIH BERAT ----------------------
    const infoBerat = document.getElementById('infoBerat')
    let selisihBerat = 0
    let setMax = false

    f2BeratNota.addEventListener('change', () => {
        f2BeratBarang.max = f2BeratNota.value
        setMax = true

        beratSusut()
    })


    f2BeratBarang.addEventListener('change', (e) => {
        if (e.target.value > e.target.max && setMax) {
            e.target.value = e.target.max
        }

        beratSusut()
    })

    function beratSusut() {
        if (document.querySelector('input[name=f2KelengkapanNota]:checked').value === 'dengan' && f2BeratNota.value && f2BeratBarang.value) {
            let temp = f2BeratNota.value - f2BeratBarang.value
            selisihBerat = parseFloat(temp.toFixed(2))

            let pesan = ''
            let tingkat = 0

            if (selisihBerat !== 0) {
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
                    text: `Selisih berat riil perhiasan dan berat pada nota melebihi ${MAXSELISIH} gram. Pastikan anda mencatat semua kerusakan perhiasan!`,
                    confirmButtonText: 'Tutup',
                    confirmButtonColor: SwalCustomColor.button.cancel,
                })
            }

            infoBerat.textContent = pesan

            infoBerat.classList.remove('text-warning', 'text-error')
            f2BeratBarang.classList.remove('bg-warning', 'bg-opacity-20', 'input-warning', 'bg-error', 'input-error')
            f2BeratNota.classList.remove('bg-warning', 'bg-opacity-20', 'input-warning', 'bg-error', 'input-error')

            if (tingkat === 1) {
                infoBerat.classList.add('text-warning')
                f2BeratBarang.classList.add('bg-warning', 'bg-opacity-20', 'input-warning')
                f2BeratNota.classList.add('bg-warning', 'bg-opacity-20', 'input-warning')
            } else if (tingkat === 2) {
                infoBerat.classList.add('text-error')
                f2BeratBarang.classList.add('bg-error', 'bg-opacity-20', 'input-error')
                f2BeratNota.classList.add('bg-error', 'bg-opacity-20', 'input-error')
            }
        }
    }


    // ------------------------- INPUT KERUSAKAN --------------------------------
    let eventBentuk = false
    const Rusak = require('../pembelian/modul-kerusakan')
    const btRusak = document.getElementById('btRusak')

    btRusak.addEventListener('click', () => {
        let errorMsg = document.createElement('p')
        errorMsg.classList.add('text-error', 'pesanerrorRusak')

        // cek bentuk dulu
        if (f2Bentuk.value === 'kosong') {
            f2Bentuk.classList.add('select-error', 'bg-error')
            f2Bentuk.classList.remove('bg-primary', 'select-primary')
            errorMsg.innerText = 'Pilih salah satu bentuk!'
            if (document.getElementsByClassName('pesanerrorRusak').length == 0) f2Bentuk.after(errorMsg)
            f2Bentuk.scrollIntoView({
                // behavior: "smooth",
                block: "center",
                inline: "nearest"
            });

            if (!eventBentuk) {
                f2Bentuk.addEventListener('change', function () {
                    if (f2Bentuk.value && f2Bentuk.value !== 'kosong') {
                        f2Bentuk.classList.remove('select-error', 'bg-error')
                        f2Bentuk.classList.add('bg-primary', 'select-primary')
                        removeElementsByClass('pesanerrorRusak')
                    }
                })
                eventBentuk = true
            }

            return
        }

        Rusak.tambahKerusakan(f2Bentuk.value, 'wadah-rusak', 'teks-tabel-kosong')
    })

    // -------------------------- MULAI CEK HARGA -------------------------------
    btHitung.addEventListener('click', () => {
        // dibikin gini sementara jadi penginget doang
        if (cekConstrain2()) {
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
        // aslinya ga perlu semua, tp ntar dicek diatas aja
        let datas = new FormData(formGadai)

        if (cekConstrain2()) {
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
                        url: "/app/transaksi/gadai/hitung-harga-belakang",
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

    // ------------------------ RESET KALO ADA YANG BERUBAH ----------------------------
    function bukaForm() {
        const inputs = document.querySelectorAll('form#formGadai .bisaDikunci')
        for (const i of inputs) {
            i.disabled = false
        }

        resetTransaksi()

        cardHitung.classList.remove('hidden')
        cardBukaKunci.classList.add('hidden')
        cardHasilHitung.classList.add('hidden')

        // kunci tombol selanjutnya
        btPindah3.disabled = true
    }

    function kunciForm() {
        const inputs = document.querySelectorAll('form#formGadai .bisaDikunci')
        for (const i of inputs) {
            i.disabled = true
        }

        cardHitung.classList.add('hidden')
        cardBukaKunci.classList.remove('hidden')
        cardHasilHitung.classList.remove('hidden')

        // buka kunci tombol selanjutnya
        btPindah3.disabled = false
    }

    btBukaKunci.addEventListener('click', bukaForm)

    // ----------------------------- AJUKAN TAWARAN -------------------------------
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
            swalError('Anda belum menghitung harga perhiasan!')
        }
    })

    // ---------------------------- INI SUBMIT FORM ---------------------------------
    // BISA DIPAKE BUAT REFERENSI, TP NTAR DIGANTI DIATAS
    // btSimpan.addEventListener('click', () => {
    //     apakahDitawar.checked = APAKAHDITAWAR
    //     dealTawaran.value = HARGADEAL

    //     if (cekConstrain2()) {
    //         if (!SUDAHHITUNG) {
    //             return swalError('Belom dihitung!')
    //         }

    //         if (!BOLEHNAWAR && APAKAHDITAWAR) {
    //             return swalError('Ngga boleh ditawar!')
    //         }

    //         if (HARGABELIMAKSDITAWAR == 0 || HARGABELITARGET == 0 || HARGADEAL == 0) {
    //             return swalError('Harga beli tidak valid!')
    //         }

    //         if (!dealTawaran.value || !apakahDitawar.value) {
    //             return swalError('Ada error teknikal!')
    //         }

    //         Swal.fire({
    //             title: 'Simpan pembelian?',
    //             text: 'Pastikan data yang anda isikan sudah benar!',
    //             icon: 'question',
    //             showCancelButton: true,
    //             confirmButtonText: 'Ya, simpan!',
    //             confirmButtonColor: SwalCustomColor.button.confirm,
    //             cancelButtonText: 'Batal',
    //             scrollbarPadding: false,
    //             focusCancel: true,
    //         }).then((result) => {

    //             if (result.isConfirmed) {
    //                 bukaForm()

    //                 formGadai.method = 'POST'
    //                 formGadai.action = window.location.pathname
    //                 formGadai.submit()
    //             }

    //         })
    //     }
    // })

    // ---------------------- CONSTRAIN --------------------------

    let eventModel = false
    let eventKodepro = false
    let eventBeratBarang = false
    let eventBeratNota = false

    function cekConstrain2() {
        let errorMsg = document.createElement('p')
        errorMsg.classList.add('text-error', 'pesanerror')
        // cek kodepro
        if (f2Kodepro.value === 'kosong') {
            f2Kodepro.classList.add('select-error', 'bg-error')
            f2Kodepro.classList.remove('bg-primary', 'select-primary')
            errorMsg.innerText = 'Pilih salah satu kode!'
            if (document.getElementsByClassName('pesanerror').length == 0) f2Kodepro.after(errorMsg)
            f2Kodepro.scrollIntoView({
                // behavior: "smooth",
                block: "center",
                inline: "nearest"
            });

            if (!eventKodepro) {
                f2Kodepro.addEventListener('change', function () {
                    if (f2Kodepro.value && f2Kodepro.value !== 'kosong') {
                        f2Kodepro.classList.remove('select-error', 'bg-error')
                        f2Kodepro.classList.add('bg-primary', 'select-primary')
                        removeElementsByClass('pesanerror')
                    }
                })
                eventKodepro = true
            }

            return false
        }

        // cek model
        if (f2Model.value === 'kosong') {
            f2Model.classList.add('select-error', 'bg-error')
            f2Model.classList.remove('bg-primary', 'select-primary')
            errorMsg.innerText = 'Pilih salah satu model!'
            if (document.getElementsByClassName('pesanerror').length == 0) f2Model.after(errorMsg)
            f2Model.scrollIntoView({
                // behavior: "smooth",
                block: "center",
                inline: "nearest"
            });

            if (!eventModel) {
                f2Model.addEventListener('change', function () {
                    if (f2Model.value && f2Model.value !== 'kosong') {
                        f2Model.classList.remove('select-error', 'bg-error')
                        f2Model.classList.add('bg-primary', 'select-primary')
                        removeElementsByClass('pesanerror')
                    }
                })
                eventModel = true
            }

            return false
        }

        // cek berat nota
        if ((f2BeratNota.value <= 0 || !f2BeratNota.value) && document.querySelector('input[name=f2KelengkapanNota]:checked').value === 'dengan') {
            f2BeratNota.classList.add('input-error', 'bg-error')
            // beratNota.classList.remove('bg-primary', 'input-primary')
            errorMsg.innerText = `Berat nota tidak boleh nol!`
            if (document.getElementsByClassName('pesanerror').length == 0) f2BeratNota.after(errorMsg)
            f2BeratNota.scrollIntoView({
                // behavior: "smooth",
                block: "center",
                inline: "nearest"
            });

            if (!eventBeratNota) {
                f2BeratNota.addEventListener('change', function () {
                    if (f2BeratNota.value && f2BeratNota.value !== 'kosong') {
                        f2BeratNota.classList.remove('input-error', 'bg-error')
                        removeElementsByClass('pesanerror')
                    }
                })
                eventBeratNota = true
            }

            return false
        }

        // cek berat barang
        if (f2BeratBarang.value <= 0 || !f2BeratBarang.value || (f2BeratBarang.value > f2BeratNota.value && document.querySelector('input[name=f2KelengkapanNota]:checked').value === 'dengan')) {
            f2BeratBarang.classList.add('input-error', 'bg-error')
            // f2BeratBarang.classList.remove('bg-primary', 'input-primary')
            errorMsg.innerText = `Berat barang harus diatas nol dan kurang dari sama dengan ${f2BeratBarang.max}!`
            if (document.getElementsByClassName('pesanerror').length == 0) f2BeratBarang.after(errorMsg)
            f2BeratBarang.scrollIntoView({
                // behavior: "smooth",
                block: "center",
                inline: "nearest"
            });

            if (!eventBeratBarang) {
                f2BeratBarang.addEventListener('change', function () {
                    if (f2BeratBarang.value && f2BeratBarang.value !== 'kosong') {
                        f2BeratBarang.classList.remove('input-error', 'bg-error')
                        // f2BeratBarang.classList.add('bg-primary', 'input-primary')
                        removeElementsByClass('pesanerror')
                    }
                })
                eventBeratBarang = true
            }

            return false
        }

        // kudu di list atu2, soalnya ga butuh semua form
        if (!f2Bentuk.reportValidity() || !f2HargaJualNota.reportValidity() || !f2Kadar.reportValidity() || !f2PilihAsalLuar.reportValidity() || !f2PilihTanpaNota.reportValidity() || !f2PotonganNota.reportValidity() | !f2TanggalBeli.reportValidity()) return false

        return true
    }

    // ==================================== INI BAGIAN FORM 3 =========================================
    let sudahFotoKTP = false
    let sudahFotoPerhiasan = false

    const fotoKTP = document.getElementById('fotoKTP') // img
    const fotoKTPBase64 = document.getElementById('fotoKTPBase64') // input form
    const wadahFoto = document.getElementById('wadahFoto')

    const fotoPerhiasan = document.getElementById('fotoPerhiasan') // img
    const fotoPerhiasanBase64 = document.getElementById('fotoPerhiasanBase64') // input form
    const wadahFotoPerhiasan = document.getElementById('wadahFotoPerhiasan')

    function resetFoto(isPerhiasan) {
        if (isPerhiasan) {
            wadahFotoPerhiasan.classList.remove('bg-error', 'bg-opacity-10')
            wadahFotoPerhiasan.classList.add('bg-base-300')
        } else {
            wadahFoto.classList.remove('bg-error', 'bg-opacity-10')
            wadahFoto.classList.add('bg-base-300')
        }

        removeElementsByClass('pesanerror')
    }

    function keTampilanF3() {
        form1.classList.add('hidden')
        form2.classList.add('hidden')
        form3.classList.remove('hidden')

        kepalaForm1.classList.remove('bg-primary', 'text-white')
        kepalaForm2.classList.remove('bg-primary', 'text-white')
        kepalaForm3.classList.add('bg-primary', 'text-white')

        balikAtas()
    }

    function cekConstrain3() {
        let errorMsg = document.createElement('p')
        errorMsg.classList.add('text-error', 'pesanerror')

        // cek foto KTP, masukin di constrain
        if (!sudahFotoKTP || !fotoKTPBase64.value || fotoKTP.naturalHeight == 0) {
            wadahFoto.classList.remove('bg-base-300')
            wadahFoto.classList.add('bg-error', 'bg-opacity-10')

            errorMsg.innerText = 'Anda harus mengambil foto KTP penggadai!'
            if (document.getElementsByClassName('pesanerror').length == 0) fotoKTPBase64.after(errorMsg)
            wadahFoto.scrollIntoView({
                // behavior: "smooth",
                block: "center",
                inline: "nearest"
            });

            // ngga ada bind event macem yang lain, tapi langsung pas akses kamera
            return
        }

        if (!sudahFotoPerhiasan || !fotoPerhiasanBase64.value || fotoPerhiasan.naturalHeight == 0) {
            wadahFotoPerhiasan.classList.remove('bg-base-300')
            wadahFotoPerhiasan.classList.add('bg-error', 'bg-opacity-10')

            errorMsg.innerText = 'Anda harus mengambil foto perhiasan yang akan digadaikan!'
            if (document.getElementsByClassName('pesanerror').length == 0) fotoPerhiasanBase64.after(errorMsg)
            wadahFotoPerhiasan.scrollIntoView({
                // behavior: "smooth",
                block: "center",
                inline: "nearest"
            });

            return
        }
        return true
    }

    // ---------------------------- KAMERA FULL --------------------------------------
    const btnBukaKamera = document.getElementById('bukaKamera')
    btnBukaKamera.addEventListener('click', (e) => {
        bukaKamera(false)
    })

    const btnBukaUlangKamera = document.getElementById('bukaUlangKamera')
    btnBukaUlangKamera.addEventListener('click', (e) => {
        bukaKamera(false)
    })

    const btnBukaKameraPerhiasan = document.getElementById('bukaKameraPerhiasan')
    btnBukaKameraPerhiasan.addEventListener('click', () => {
        bukaKamera(true)
    })

    const btnBukaUlangKameraPerhiasan = document.getElementById('bukaUlangKameraPerhiasan')
    btnBukaUlangKameraPerhiasan.addEventListener('click', () => {
        bukaKamera(true)
    })

    let bukaKamera = function (isPerhiasan) {
        Swal.fire({
            showConfirmButton: true,
            showCancelButton: true,
            cancelButtonText: 'Batal',
            confirmButtonText: 'Ambil Foto',
            scrollbarPadding: false,
            confirmButtonColor: SwalCustomColor.button.confirm,
            title: 'Ambil Foto',
            html: printHTML(),
            willOpen: () => {
                var videoElement = Swal.getHtmlContainer().querySelector('video');
                var videoSelect = Swal.getHtmlContainer().querySelector('select#sumberVideo');

                videoSelect.onchange = getStream;

                Swal.showLoading(Swal.getConfirmButton())
                getStream().then(getDevices).then(gotDevices).then(Swal.hideLoading);

                function getDevices() {
                    // AFAICT in Safari this only gets default devices until gUM is called :/
                    return navigator.mediaDevices.enumerateDevices();
                }

                function gotDevices(deviceInfos) {
                    window.deviceInfos = deviceInfos; // make available to console
                    console.log('Available input and output devices:', deviceInfos);
                    for (const deviceInfo of deviceInfos) {
                        const option = document.createElement('option');
                        option.value = deviceInfo.deviceId;
                        if (deviceInfo.kind === 'videoinput') {
                            option.text = deviceInfo.label || `Camera ${videoSelect.length + 1}`;
                            videoSelect.appendChild(option);
                        }
                    }
                }

                function getStream() {
                    if (window.stream) {
                        window.stream.getTracks().forEach(track => {
                            track.stop();
                        });
                    }
                    const videoSource = videoSelect.value;
                    const constraints = {
                        video: {
                            deviceId: videoSource ? {
                                exact: videoSource
                            } : undefined
                        }
                    };
                    return navigator.mediaDevices.getUserMedia(constraints).
                        then(gotStream).catch(handleError);
                }

                function gotStream(stream) {
                    window.stream = stream; // make stream available to console
                    videoSelect.selectedIndex = [...videoSelect.options].
                        findIndex(option => option.text === stream.getVideoTracks()[0].label);
                    videoElement.srcObject = stream;
                }

                function handleError(error) {
                    console.error('Error: ', error);
                }
            },
            preConfirm: () => {
                var videoElement = document.querySelector('video');
                let canvas = document.createElement("canvas")

                try {
                    canvas.height = videoElement.videoHeight
                    canvas.width = videoElement.videoWidth
                    canvas.getContext("2d").drawImage(videoElement, 0, 0);

                    return canvas.toDataURL("image/webp");
                } catch (error) {
                    Swal.showValidationMessage('Ada error')
                }
            }
        }).then((capture) => {
            if (window.stream) {
                window.stream.getTracks().forEach(track => {
                    track.stop();
                });
            }
            if (capture.isConfirmed) {
                if (capture.value) {
                    hasilKamera(capture.value, isPerhiasan)
                }
            }
        })
    }


    let hasilKamera = function (gambar, isPerhiasan) {
        Swal.fire({
            showConfirmButton: true,
            showDenyButton: true,
            showCancelButton: true,
            cancelButtonText: 'Batal',
            denyButtonText: 'Ulangi',
            confirmButtonText: 'Gunakan',
            scrollbarPadding: false,
            confirmButtonColor: SwalCustomColor.button.confirm,
            title: 'Gunakan Foto Ini?',
            imageUrl: gambar,
            imageWidth: 400,
            imageAlt: 'Custom image',
        }).then((hasil) => {
            if (hasil.isConfirmed) {
                cropGambar(gambar, isPerhiasan)
            }
            if (hasil.isDenied) {
                bukaKamera(isPerhiasan)
            }
        })
    }

    //
    let cropGambar = function (imgData, isPerhiasan) {

        Swal.fire({
            title: 'Pratinjau Pemotongan Gambar',
            html: `
          <div>
            <img id="cropperWadah" src="` + imgData + `">
          </div>
        `,
            showCancelButton: true,
            scrollbarPadding: false,
            allowOutsideClick: false,
            confirmButtonColor: SwalCustomColor.button.confirm,
            willOpen: () => {
                const image = Swal.getPopup().querySelector('#cropperWadah')
                const cropper = new Cropper(image, {
                    aspectRatio: 4 / 3,
                    viewMode: 1,
                    autoCropArea: 0,
                    scalable: false,
                    zoomable: false,
                    movable: false,
                    minCropBoxWidth: 200,
                    minCropBoxHeight: 200,
                })

                const confirmButton = Swal.getConfirmButton()

                confirmButton.addEventListener('click', () => {
                    Swal.showLoading()

                    // ngeinput gambar ke image tag, masih belum nemu cara yang bagus
                    if (isPerhiasan) {
                        fotoPerhiasan.src = cropper.getCroppedCanvas().toDataURL()
                        fotoPerhiasan.style.display = 'block'
                        fotoPerhiasanBase64.value = cropper.getCroppedCanvas().toDataURL()
                        sudahFotoPerhiasan = true
                    } else {
                        // let fotoKTP = document.getElementById('fotoKTP')
                        fotoKTP.src = cropper.getCroppedCanvas().toDataURL()
                        fotoKTP.style.display = 'block'
                        fotoKTPBase64.value = cropper.getCroppedCanvas().toDataURL()
                        sudahFotoKTP = true
                    }

                    resetFoto(isPerhiasan)
                })

            },
        })

    }

    let printHTML = function () {
        return `
          <div class="space-y-4">
              <video autoplay muted playsinline class="border w-full"></video>
              <div class="flex justify-center">
                  <select class="select select-bordered w-full max-w-xs" id="sumberVideo">
                  </select>
              </div>
          </div>
      `
    }

    // ------------------------- SAMPE SINI KAMERA -------------------------




    // ====================================== INI BAGIAN UMUM, BUAT PELENGKAP ===========================
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

    function balikAtas() {
        bagianAtas.scrollIntoView({
            // behavior: "smooth",
            block: "center",
            inline: "nearest"
        });
    }
})