// import Swal from "sweetalert2"
import Swal from "sweetalert2/dist/sweetalert2"

import {
    SwalCustomColor,
    rupiahParser
} from '../../fungsi.js'

import { swalPrepareUbah, swalCekAkun, swalKonfirmasiUbah, swalSelesai } from './base-pengaturan'

// cek boleh ngedit ato ngga
const eleBolehEdit = document.getElementById('eleBolehEdit')
let BOLEHEDITPEMILIK = (eleBolehEdit && eleBolehEdit.value && eleBolehEdit.value == 1)
// BOLEHEDIT wajib dipake di function buat event pengaturan

// ==================== Banding Saldo ======================

const btBandingSaldo = document.getElementById('btBandingSaldo')
const saldoSistem = document.getElementById('saldoSistem').value

btBandingSaldo.addEventListener('click', () => {
    swalPrepareUbah.fire({
        title: 'Bandingkan Saldo',
        text: 'Hasil banding saldo pada sistem dengan saldo sebenarnya akan disimpan dan diolah untuk dibandingkan dengan data lain. Lanjutkan?',
    }).then((prepare) => {

        if (prepare.isConfirmed) {
            swalCekAkun(1).then((cek) => {
                if (cek.isConfirmed) {

                    Swal.fire({
                        title: 'Bandingkan Saldo',
                        html: printBandingHTML(saldoSistem),
                        showCancelButton: true,
                        scrollbarPadding: false,
                        confirmButtonColor: SwalCustomColor.button.confirm,
                        confirmButtonText: 'Selanjutnya',
                        preConfirm: () => {
                            Swal.showLoading()

                            const saldoSistem = document.getElementById('swal-saldoSistem')
                            const saldoSebenarnya = document.getElementById('swal-saldoSebenarnya')

                            if (!saldoSistem.value) {
                                Swal.showValidationMessage('Nominal saldo sistem tidak boleh kosong!')
                                Swal.hideLoading()
                            }
                            else if (!saldoSebenarnya.value) {
                                Swal.showValidationMessage('Nominal saldo sebenarnya tidak boleh kosong!')
                                Swal.hideLoading()
                            }
                            else if (saldoSebenarnya.value < 0) {
                                Swal.showValidationMessage('Nominal saldo sebenarnya tidak valid!')
                                Swal.hideLoading()
                            }
                            else {
                                return new Promise(function (resolve, reject) {
                                    setTimeout(function () {
                                        reject({
                                            tipe: 'lokal',
                                            msg: 'Tidak ada respon dari server'
                                        })
                                    }, 5000)

                                    $.ajax({
                                        type: "PUT",
                                        url: '/app/pengaturan/api/saldo/banding-saldo',
                                        data: {
                                            saldoRiil: saldoSebenarnya.value,
                                        },
                                        dataType: 'json',
                                        success: function (data) {
                                            resolve({
                                                apakahSukses: true,
                                                msg: (data.selisih) ? `Selisih antara saldo toko pada sistem dengan saldo toko sebenarnya hari ini adalah: <span class="text-error">${data.selisih}</span>` : 'Hasil banding berhasil dicatat'
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

                        }
                    }).then((hasilBanding) => {
                        if (hasilBanding.isConfirmed) {
                            swalSelesaiBanding(hasilBanding).then(() => {
                                location.href = location.pathname
                            })
                        }
                    })

                }
            })

        }

    })
})

let printBandingHTML = function (saldoSistem = 0) {

    const html = `
            <form>
              <div class="w-full px-6 space-y-6 flex flex-col text-left">
                  <div class="form-control">
                    <label for="swal-waktuBanding">
                      <span class="">Waktu Banding<span class="text-error"> *</span></span>
                    </label>
                    <input type="text" id="swal-waktuBanding" class="input input-bordered"
                      placeholder="0" value = "${new Date().toLocaleString('id-ID')}" disabled>
                  </div>
                  <div class="form-control">
                    <label for="swal-saldoSistem">
                      <span class="">Saldo Toko Pada Sistem<span class="text-error"> *</span></span>
                    </label>

                    <div class="relative flex w-full flex-wrap items-stretch">
                        <span
                        class="z-10 h-full leading-snug absolute text-center text-secondary items-center justify-center w-10 pl-3 py-3">
                        Rp.
                        </span>
                        
                        <input type="number" placeholder="0" id="swal-saldoSistem" min="0" disabled
                        oninput="validity.valid||(value='');"
                        class="uang px-3 py-3 relative input input-bordered w-full pl-12" value = "${saldoSistem}"/>
                    </div>
                  </div>
  
                  <div class="form-control">
                    <label for="swal-saldoSebenarnya">
                      <span class="">Saldo Toko Sebenarnya<span class="text-error"> *</span></span>
                    </label>
                    <div class="relative flex w-full flex-wrap items-stretch">
                        <span
                        class="z-10 h-full leading-snug absolute text-center text-secondary items-center justify-center w-10 pl-3 py-3">
                        Rp.
                        </span>
                        
                        <input type="number" placeholder="0" id="swal-saldoSebenarnya" min="0" required
                        oninput="validity.valid||(value='');"
                        class="uang px-3 py-3 relative input input-bordered w-full pl-12"/>
                    </div>

                  </div>
  
              </div>
            </form>
        `
    return html
}

// ==================== Ubah Saldo =========================

if (BOLEHEDITPEMILIK) {
    const btUbahSaldo = document.getElementById('btUbahSaldo')

    btUbahSaldo.addEventListener('click', () => {
        swalPrepareUbah.fire({
            title: 'Ubah Saldo',
            text: 'Pengubahan data ini akan mengubah nominal stok saldo toko yang tersimpan pada sistem. Lanjutkan?',
        }).then((prepare) => {

            if (prepare.isConfirmed) {
                swalCekAkun().then((cek) => {
                    if (cek.isConfirmed) {

                        Swal.fire({
                            title: 'Ubah Saldo',
                            html: printUbahHTML(saldoSistem),
                            showCancelButton: true,
                            scrollbarPadding: false,
                            confirmButtonColor: SwalCustomColor.button.confirm,
                            confirmButtonText: 'Selanjutnya',
                            preConfirm: () => {
                                Swal.showLoading()

                                const saldoSistem = document.getElementById('swal-saldoSistem')
                                const saldoBaru = document.getElementById('swal-saldoBaru')
                                const alasan = document.getElementById('swal-alasan')

                                try {
                                    if (!saldoSistem.value) throw 'Nominal saldo sistem tidak boleh kosong!'
                                    else if (!saldoBaru.value) throw 'Nominal saldo sistem tidak boleh kosong!'
                                    else if (saldoBaru.value <= 0) throw 'Nominal saldo baru harus lebih dari 0!'
                                    else if (!alasan.value) throw 'Alasan pengubahan saldo tidak boleh kosong!'
                                    else return {
                                        saldoBaru: saldoBaru.value,
                                        alasan: alasan.value
                                    }
                                } catch (error) {
                                    Swal.showValidationMessage(error)
                                    Swal.hideLoading()
                                }
                            }
                        }).then((ubahSaldo) => {
                            if (ubahSaldo.isConfirmed && ubahSaldo.value.saldoBaru && ubahSaldo.value.alasan) {

                                swalKonfirmasiUbah.fire({
                                    title: 'Konfirmasi Pengubahan',
                                    html: `Anda akan secara sengaja mengubah nominal saldo toko yang tercatat pada sistem anda menjadi <span class="font-semibold">${rupiahParser(ubahSaldo.value.saldoBaru)}</span> dengan alasan "${ubahSaldo.value.alasan}". Lanjutkan?`,
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
                                                type: "PUT",
                                                url: '/app/pengaturan/api/saldo/ubah-saldo',
                                                data: {
                                                    saldoBaru: ubahSaldo.value.saldoBaru,
                                                    alasan: ubahSaldo.value.alasan
                                                },
                                                dataType: 'json',
                                                success: function () {
                                                    resolve({
                                                        apakahSukses: true,
                                                        msg: 'Nominal saldo toko pada sistem berhasil diubah!'
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
                                }).then((hasilUbah) => {
                                    if (hasilUbah.isConfirmed) {
                                        swalSelesai(hasilUbah).then(() => {
                                            location.href = location.pathname
                                        })
                                    }
                                })
                            }
                        })

                    }
                })

            }

        })
    })
}



let printUbahHTML = function (saldoSistem = 0) {
    const html = `
            <form>
              <div class="w-full px-6 space-y-6 flex flex-col text-left">
                  <div class="form-control">
                    <label for="swal-waktuUbah">
                      <span class="">Waktu Pengubahan<span class="text-error"> *</span></span>
                    </label>
                    <input type="text" id="swal-waktuUbah" class="input input-bordered"
                      placeholder="0" value = "${new Date().toLocaleString('id-ID')}" disabled>
                  </div>
                  <div class="form-control">
                    <label for="swal-saldoSistem">
                      <span class="">Saldo Toko Saat Ini<span class="text-error"> *</span></span>
                    </label>

                    <div class="relative flex w-full flex-wrap items-stretch">
                        <span
                        class="z-10 h-full leading-snug absolute text-center text-secondary items-center justify-center w-10 pl-3 py-3">
                        Rp.
                        </span>
                        
                        <input type="number" placeholder="0" id="swal-saldoSistem" min="0" disabled
                        oninput="validity.valid||(value='');"
                        class="uang px-3 py-3 relative input input-bordered w-full pl-12" value = "${saldoSistem}"/>
                    </div>
                  </div>
  
                  <div class="form-control">
                    <label for="swal-saldoBaru">
                      <span class="">Saldo Toko Baru<span class="text-error"> *</span></span>
                    </label>
                    <div class="relative flex w-full flex-wrap items-stretch">
                        <span
                        class="z-10 h-full leading-snug absolute text-center text-secondary items-center justify-center w-10 pl-3 py-3">
                        Rp.
                        </span>
                        
                        <input type="number" placeholder="0" id="swal-saldoBaru" min="0" required
                        oninput="validity.valid||(value='');"
                        class="uang px-3 py-3 relative input input-bordered w-full pl-12"/>
                    </div>
                  </div>

                  <div class="form-control">
                    <label for="swal-alasan">
                      <span class="">Alasan Pengubahan Saldo</span>
                    </label>
                    <textarea type="text" id="swal-alasan" name="swal-alasan" class="textarea textarea-bordered h-24"
                      placeholder="Contoh: Catatan saldo tidak cocok dengan saldo sebenarnya" maxlength="100" required></textarea>
                  </div>
                </div>
  
              </div>
            </form>
        `
    return html
}



function swalSelesaiBanding(selesai) {
    return Swal.fire({
        title: ((selesai.value.apakahSukses) ? 'Hasil Banding Saldo' : 'Error'),
        html: selesai.value.msg,
        icon: ((selesai.value.apakahSukses) ? 'success' : 'error'),
        scrollbarPadding: false,
        confirmButtonText: 'Tutup',
        confirmButtonColor: SwalCustomColor.button.cancel
    })
}