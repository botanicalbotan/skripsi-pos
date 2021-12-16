$(function () {
    // ============================================= list =====================================================
    if ($('.base-page').data('pagename') == "list") {
        const BASEURL = window.location.pathname
        const qsParam = new URLSearchParams(window.location.search)
        const pengurutan = document.querySelector('select#pengurutan')
        const pencarian = document.querySelector('input#pencarian')
        const hapuscari = document.getElementById('hapusPencarian')

        const filterTersedia = document.getElementById('filterTersedia')
        const filterHampir = document.getElementById('filterHampir')
        const filterHabis = document.getElementById('filterHabis')

        function persiapanKirim() {
            if (qsParam.get('cari') === null || pencarian.value === '') {
                qsParam.delete('cari')
            }

            if (qsParam.get('filter') === null || pencarian.filter === '') {
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


        filterTersedia.addEventListener('click', function () {
            if (qsParam.has('filter')) {
                qsParam.set('filter', 1)
            } else {
                qsParam.append('filter', 1)
            }
            persiapanKirim()
        })

        filterHampir.addEventListener('click', function () {
            if (qsParam.has('filter')) {
                qsParam.set('filter', 2)
            } else {
                qsParam.append('filter', 2)
            }
            persiapanKirim()
        })

        filterHabis.addEventListener('click', function () {
            if (qsParam.has('filter')) {
                qsParam.set('filter', 3)
            } else {
                qsParam.append('filter', 3)
            }
            persiapanKirim()
        })

    }

    // ============================================= form =====================================================
    if ($('.base-page').data('pagename') == "form") {
        const formKelompok = document.querySelector('form#formKelompok')
        const kadar = document.querySelector('select[name="kadar"]')
        const bentuk = document.querySelector('select[name="bentuk"]')
        const berat = document.querySelector('input[name="beratKelompok"]')

        formKelompok.addEventListener('submit', function (e) {
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

                kadar.addEventListener('change', function () {
                    if (kadar.value && kadar.value !== 'kosong') {
                        kadar.classList.remove('ring', 'ring-error')
                        global.removeElementsByClass('pesanerror')
                    }
                })

            } else if (bentuk.value === 'kosong') {
                e.preventDefault()
                bentuk.classList.add('ring', 'ring-error')
                errorMsg.innerText = 'Pilih salah satu bentuk perhiasan!'
                if (document.getElementsByClassName('pesanerror').length == 0) bentuk.after(errorMsg)
                bentuk.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                    inline: "nearest"
                });

                bentuk.addEventListener('change', function () {
                    if (bentuk.value && bentuk.value !== 'kosong') {
                        bentuk.classList.remove('ring', 'ring-error')
                        global.removeElementsByClass('pesanerror')
                    }
                })
            } else if (berat.value == 0) {
                e.preventDefault()
                berat.classList.add('ring', 'ring-error')
                errorMsg.innerText = 'Berat kelompok tidak boleh 0!'
                if (document.getElementsByClassName('pesanerror').length == 0) berat.after(errorMsg)
                berat.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                    inline: "nearest"
                });

                berat.addEventListener('change', function () {
                    if (berat.value != 0) {
                        berat.classList.remove('ring', 'ring-error')
                        global.removeElementsByClass('pesanerror')
                    }
                })
            }

        })
    }


})