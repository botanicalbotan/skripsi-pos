// import Swal from "sweetalert2"
import Swal from "sweetalert2/dist/sweetalert2"
import { SwalCustomColor, capsFirstWord } from '../../fungsi.js'

// const basePage = document.getElementById('base-page').dataset.pagename

$(function () {
    // ============================================= list =====================================================

    const BASEURL = window.location.pathname
    const qsParam = new URLSearchParams(window.location.search)
    const pencarian = document.querySelector('input#pencarian')
    const hapuscari = document.getElementById('hapusPencarian')
    const btAturTabel = document.getElementById('btAturTabel')
    const filterStatus = document.getElementById('filterStatus')

    let ob = 0,
        aob = 0

    // cek lagi ntar jumlahnya
    if (qsParam.has('ob')) {
        if (['0', '1', '2', '3', '4'].includes(qsParam.get('ob'))) {
            ob = qsParam.get('ob')
        }
    }

    if (qsParam.has('aob')) {
        if (['0', '1'].includes(qsParam.get('aob'))) {
            aob = qsParam.get('aob')
        }
    }

    function persiapanKirim() {
        if (qsParam.get('cari') === null || pencarian.value === '') {
            qsParam.delete('cari')
        }

        if (qsParam.get('filter') === null) {
            qsParam.delete('filter')
        }

        updateKeyQs('ob', ob)
        updateKeyQs('aob', aob)

        qsParam.delete('page')
        window.location = BASEURL + '?' + qsParam.toString()
    }

    pencarian.addEventListener("keyup", function (event) {
        if (event.key === "Enter") {
            if (pencarian.value !== '' && pencarian.value) {
                updateKeyQs('cari', pencarian.value)
                persiapanKirim()
            }
        }
    });

    hapuscari.addEventListener("click", function () {
        pencarian.value = ''
        persiapanKirim()
    });

    filterStatus.addEventListener('change', () => {
        updateKeyQs('filter', filterStatus.value)
        persiapanKirim()
    })

    btAturTabel.addEventListener('click', (e) => {
        Swal.fire({
            title: 'Atur Tabel',
            confirmButtonText: 'Terapkan',
            showCancelButton: true,
            cancelButtonText: 'Batal',
            confirmButtonColor: '#4b6bfb',
            scrollbarPadding: false,
            html: printAturTabelHTML(),
            willOpen: () => {
                Swal.getHtmlContainer().querySelector('#swal-ob').value = ob
            },
            preConfirm: () => {
                return {
                    ob: Swal.getHtmlContainer().querySelector('#swal-ob').value,
                    aob: Swal.getHtmlContainer().querySelector('input[name="swal-arahOb"]:checked').value
                }
            }
        })
            .then((resolve) => {
                if (resolve.isConfirmed) {
                    ob = resolve.value.ob
                    aob = resolve.value.aob
                    persiapanKirim()
                }
            })
    })

    let updateKeyQs = function (key, value) {
        if (qsParam.has(key)) {
            qsParam.set(key, value)
        } else {
            qsParam.append(key, value)
        }
    }


    let printAturTabelHTML = function () {

        const htmlAddStock = `
                <div class="w-full px-6 space-y-6 flex flex-col text-left" >

                  <div class="form-control">
                      <label for="swal-ob">Urutkan Tabel Berdasarkan</label>
                      <select id="swal-ob" class="select select-bordered w-full max-w-md swal mt-2">
                          <option value="0">Kelompok Perhiasan</option>
                          <option value="1">Stok Tercatat</option>
                          <option value="2">Stok Sebenarnya</option>
                          <option value="3">Selisih</option>
                      </select>
                      <div class="flex space-x-4 mt-2" x-data="{ radio: ` + ((aob == 1) ? 2 : 1) + ` }">
                          <label class="cursor-pointer items-center py-2 flex-1 rounded-box px-4 border"
                              :class="(radio == 1)? 'bg-primary bg-opacity-10 border-primary': 'bg-white border-secondary'">
                              <input type="radio" name="swal-arahOb" ` + ((aob == 0) ? 'checked=checked' : '') + ` class="radio radio-primary hidden"
                              value="0" @click="radio = 1">
                              <span class="label-text text-base flex items-center"
                              :class="(radio == 1)? 'text-primary': 'text-secondary'">
                                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                      <path d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h5a1 1 0 000-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3zM13 16a1 1 0 102 0v-5.586l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 101.414 1.414L13 10.414V16z" />
                                  </svg>
                                  A - Z
                              </span>
                          </label>
                          <label class="cursor-pointer items-center py-2 flex-1 rounded-box px-4 border"
                              :class="(radio == 2)? 'bg-primary bg-opacity-10 border-primary': 'bg-white border-secondary'">
                              <input type="radio" name="swal-arahOb" ` + ((aob == 1) ? 'checked=checked' : '') + ` class="radio radio-primary hidden" value="1"
                              @click="radio = 2">
                              <span class="label-text text-base flex items-center"
                              :class="(radio == 2)? 'text-primary': 'text-secondary'">
                                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                      <path d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h7a1 1 0 100-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3zM15 8a1 1 0 10-2 0v5.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L15 13.586V8z" />
                                  </svg>
                                  Z - A
                              </span>
                          </label>
                      </div>
                  </div>

              </div>
            `
        return htmlAddStock
    }

    // -------------------------- btCekIni ---------------------------------
    const btCekInis = document.querySelectorAll('button.btCekIni')

    const eventCekIni = function (idKel, data) {
        let update = false
        if ((data.stokTercatat || data.stokTercatat === 0) && (data.stokSebenarnya || data.stokSebenarnya === 0) && data.createdAt) {
            update = true
        }

        Swal.fire({
            title: 'Penyesuaian Stok',
            html: printCekIniHTML(data.nama, data.status, data.stokTercatat, data.stokSebenarnya, update, data.keterangan),
            showCancelButton: true,
            scrollbarPadding: false,
            confirmButtonColor: SwalCustomColor.button.confirm,
            confirmButtonText: 'Selanjutnya',
            preConfirm: () => {
                const stokTercatat = document.getElementById('swal-stokTercatat')
                const stokSebenarnya = document.getElementById('swal-stokSebenarnya')
                const keterangan = document.getElementById('swal-keterangan')

                try {
                    let angka = parseInt(stokSebenarnya.value)

                    if (!stokSebenarnya.value || isNaN(angka)) throw 'Jumlah stok sebenarnya tidak boleh kosong!'
                    if (!stokTercatat.value) throw 'Jumlah stok tercatat tidak boleh kosong!'
                    if (data.stokTercatat - angka !== 0 && (!keterangan.value || keterangan.value === '-')) throw 'Jika terjadi selisih stok, maka keterangan wajib diisi'
                    if (angka < 0) throw 'Jumlah stok baru tidak valid!'

                    return {
                        stokSebenarnya: stokSebenarnya.value,
                        keterangan: keterangan.value
                    }

                } catch (error) {
                    Swal.showValidationMessage(error)
                }

            }
        }).then((konfirmPenyesuaian) => {
            if (konfirmPenyesuaian.isConfirmed) {
                Swal.fire({
                    title: 'Konfirmasi Penyesuaian Stok',
                    html: `Anda akan mencatat stok kelompok <span class="font-semibold">${ data.nama }</span> menjadi <span class="font-semibold">${konfirmPenyesuaian.value.stokSebenarnya}<span class="text-error">(${ konfirmPenyesuaian.value.stokSebenarnya - data.stokTercatat })</span></span>. Lanjutkan?`,
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonText: 'Ya, simpan!',
                    cancelButtonText: 'Batal',
                    scrollbarPadding: false,
                    focusCancel: true,
                    confirmButtonColor: SwalCustomColor.button.confirm,
                    preConfirm: () => {
                        Swal.showLoading()

                        return new Promise(function (resolve, reject) {
                            setTimeout(function () {
                                reject({
                                    tipe: 'lokal',
                                    msg: 'Tidak ada respon dari server'
                                })
                            }, 5000)

                            $.ajax({
                                type: "POST",
                                url: '/app/barang/penyesuaian/baru/' + idKel,
                                data: {
                                    stokSebenarnya: konfirmPenyesuaian.value.stokSebenarnya,
                                    keterangan: konfirmPenyesuaian.value.keterangan
                                },
                                dataType: 'json',
                                success: function (data) {
                                    resolve({
                                        apakahSukses: true,
                                        msg: 'Stok kelompok berhasil diperbarui!',
                                        stokBaru: konfirmPenyesuaian.value.stokSebenarnya
                                    })
                                },
                                error: function (xhr) {
                                    reject({
                                        tipe: 'lokal',
                                        msg: (typeof xhr.responseJSON.error === 'string') ? xhr.responseJSON.error : 'Ada error pada server!'
                                    })
                                }
                            });
                        }).catch(function (error) {
                            if (error.tipe && error.tipe === 'lokal') {
                                return error
                            } else {
                                return {
                                    apakahSukses: false,
                                    msg: 'Ada kesalahan pada sistem. Silahkan coba lagi.'
                                }
                            }
                        })

                    }
                })
                    .then((hasilUbah) => {
                        if (hasilUbah.isConfirmed) {

                            Swal.fire({
                                title: ((hasilUbah.value.apakahSukses) ? 'Pengubahan Berhasil!' : 'Error'),
                                text: capsFirstWord(hasilUbah.value.msg),
                                icon: ((hasilUbah.value.apakahSukses) ? 'success' : 'error'),
                                scrollbarPadding: false,
                                confirmButtonText: 'Tutup',
                                confirmButtonColor: SwalCustomColor.button.cancel
                            }).then(() => {
                                persiapanKirim()
                            })


                        }
                    })

            }
        })
    }

    let printCekIniHTML = function (namaKel, status, stokTercatat, stokSebenarnya, apakahUpdate, keterangan) {

        const html = `
          <form>
            <div class="w-full px-6 space-y-6 flex flex-col text-left">   
                <div class="form-control">
                  <label for="swal-namaKel">
                    <span class="">Nama Kelompok</span>
                  </label>
                  <input type="text" id="swal-namaKel" class="input input-bordered"
                    value = "${namaKel}" readonly>
                </div>

                <div class="form-control">
                  <label for="swal-status">
                    <span class="">Status</span>
                  </label>
                  <input type="text" id="swal-status" class="input input-bordered"
                    value = "${status}" readonly>
                </div>

                <div class="flex flex-row space-x-4">
                    <div class="form-control flex-1">
                        <label for="swal-stokTercatat">
                            <span class="">Stok Tercatat</span>
                        </label>
                        <input type="number" id="swal-stokTercatat" class="input input-bordered"
                        min="0" value="${stokTercatat}" readonly>
                    </div>

                    <div class="form-control flex-1">
                    <label for="swal-stokSebenarnya">
                        <span class="">Stok Sebenarnya<span class="text-error"> *</span></span>
                    </label>
                    <input type="number" oninput="validity.valid||(value='');" id="swal-stokSebenarnya" class="input input-bordered"
                        placeholder="0" min="0" value="${(apakahUpdate) ? stokSebenarnya : ''}" required>
                    </div>
                </div>

                <div class="form-control">
                    <label for="swal-keterangan">
                      <span class="">Keterangan</span>
                    </label>
                    <textarea type="text" id="swal-keterangan" name="swal-keterangan" class="textarea textarea-bordered h-24"
                      placeholder="Contoh: Catatan stok tidak cocok dengan stok sebenarnya" maxlength="100">${(apakahUpdate) ? keterangan : ''}</textarea>

                  </div>
                </div>

            </div>
          </form>
      `
        return html
    }

    btCekInis.forEach(tombol => {
        tombol.addEventListener('click', (e) => {
            if (e.target.closest('button').value) {
                $.getJSON("/app/cuma-data/kelompok-by-id-cek-today?id=" + e.target.closest('button').value, {},
                    function (data, textStatus, jqXHR) {
                        console.log(data)
                        eventCekIni(e.target.closest('button').value, data)
                    }
                );
            }
        })
    });

    // -------------------------- btLihatIni ---------------------------------
    const btLihatInis = document.querySelectorAll('button.btLihatIni')

    let tanggal = new Date()
    let datex = tanggal.getDate()
    let datey = (datex < 10)? `0${datex}` :  datex
    let monthx = tanggal.getMonth() + 1
    let monthy = (monthx < 10)? `0${monthx}` :  monthx
    let formatTanggal = `${tanggal.getFullYear()}-${monthy}-${datey}`

    btLihatInis.forEach(tombol => {
        tombol.addEventListener('click', (e) => {
            if (e.target.closest('button').value) {
                window.open(`/app/barang/penyesuaian/${formatTanggal}/${e.target.closest('button').value}`, '_blank')
            }
        })
    });


})
