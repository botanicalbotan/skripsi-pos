// import Swal from "sweetalert2"
import Swal from "sweetalert2/dist/sweetalert2"


import { SwalCustomColor, capsFirstWord, removeElementsByClass } from '../../fungsi.js'

$(function () {
  const basePage = document.getElementById('base-page').dataset.pagename
  // ============================================= list =====================================================
  if (basePage == "list") {
    const BASEURL = window.location.pathname
    const qsParam = new URLSearchParams(window.location.search)
    const pencarian = document.querySelector('input#pencarian')
    const hapuscari = document.getElementById('hapusPencarian')
    const btAturTabel = document.getElementById('btAturTabel')

    let ob = 0,
      aob = 0
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

    const filterTersedia = document.getElementById('filterTersedia')
    const filterHampir = document.getElementById('filterHampir')
    const filterHabis = document.getElementById('filterHabis')

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


    filterTersedia.addEventListener('click', function () {
      updateKeyQs('filter', 1)
      persiapanKirim()
    })

    filterHampir.addEventListener('click', function () {
      updateKeyQs('filter', 2)
      persiapanKirim()
    })

    filterHabis.addEventListener('click', function () {
      updateKeyQs('filter', 3)
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
                            <option value="1">Berat Kelompok</option>
                            <option value="2">Kadar Perhiasan</option>
                            <option value="3">Bentuk Perhiasan</option>W
                            <option value="4">Stok</option>
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

  }

  // ============================================= form =====================================================
  if (basePage == "form") {
    const formKelompok = document.querySelector('form#formKelompok')
    const kadar = document.querySelector('select[name="kadar"]')
    let eventKadar = false
    const bentuk = document.querySelector('select[name="bentuk"]')
    let eventBentuk = false
    const berat = document.querySelector('input[name="beratKelompok"]')
    let eventBerat = false
    const btSubmit = document.getElementById('btSubmit')

    btSubmit.addEventListener('click', () => {
      let errorMsg = document.createElement('p')
      errorMsg.classList.add('text-error', 'pesanerror')

      if (kadar.value === 'kosong') {
        kadar.classList.add('select-error', 'bg-error')
        kadar.classList.remove('bg-primary', 'select-primary')
        errorMsg.innerText = 'Pilih salah satu kadar!'
        if (document.getElementsByClassName('pesanerror').length == 0) kadar.after(errorMsg)
        kadar.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "nearest"
        });

        if (!eventKadar) {
          kadar.addEventListener('change', function () {
            if (kadar.value && kadar.value !== 'kosong') {
              kadar.classList.remove('select-error', 'bg-error')
              kadar.classList.add('bg-primary', 'select-primary')
              removeElementsByClass('pesanerror')
            }
          })
          eventKadar = true
        }

        return

      } else if (bentuk.value === 'kosong') {
        bentuk.classList.add('select-error', 'bg-error')
        bentuk.classList.remove('bg-primary', 'select-primary')
        errorMsg.innerText = 'Pilih salah satu bentuk perhiasan!'
        if (document.getElementsByClassName('pesanerror').length == 0) bentuk.after(errorMsg)
        bentuk.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "nearest"
        });

        if (!eventBentuk) {
          bentuk.addEventListener('change', function () {
            if (bentuk.value && bentuk.value !== 'kosong') {
              bentuk.classList.remove('select-error', 'bg-error')
              bentuk.classList.add('bg-primary', 'select-primary')
              removeElementsByClass('pesanerror')
            }
          })
          eventBentuk = true
        }

        return

      } else if (berat.value == 0 || !berat.value) {
        berat.classList.add('input-error', 'bg-error')
        errorMsg.innerText = 'Berat kelompok tidak boleh 0!'
        if (document.getElementsByClassName('pesanerror').length == 0) berat.after(errorMsg)
        berat.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "nearest"
        });

        if (!eventBerat) {
          berat.addEventListener('change', function () {
            if (berat.value != 0 && berat.value) {
              berat.classList.remove('input-error', 'bg-error')
              removeElementsByClass('pesanerror')
            }
          })
          eventBerat = true
        }

        return
      }

      if (!formKelompok.reportValidity()) return

      Swal.fire({
        title: 'Simpan kelompok baru?',
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
          formKelompok.action = '/app/barang/kelompok'
          formKelompok.submit()
        }
      })
    })

    // ini ngambil data kadar ==========
    const infoKadar = document.getElementById('infoKadar')
    const iKKadar = document.getElementById('iKKadar')
    const iKTipe = document.getElementById('iKTipe')
    const iKDesk = document.getElementById('iKDesk')

    kadar.addEventListener('change', (e) => {
      if (kadar.value !== 'kosong') {
        $.get("/app/cuma-data/get-kadar-by-id", {
            id: kadar.value
          },
          function (data, textStatus, jqXHR) {
            if (data.apakah_potongan_persen) {
              iKTipe.textContent = 'Persentase (%)'
            } else {
              iKTipe.textContent = 'Nominal (Rp.)'
            }

            iKKadar.textContent = data.nama
            iKDesk.textContent = data.deskripsi
            infoKadar.classList.remove('hidden')
          },
          "json"
        ).fail((xhr) => {
          // console.log(xhr)
        })
      }
    })

  }


  // ============================================= edit =====================================================
  if (basePage == "edit") {
    const formKelompok = document.querySelector('form#formKelompok')
    const BASEURL = window.location.pathname

    const kadar = document.querySelector('select[name="kadar"]')
    let eventKadar = false
    const bentuk = document.querySelector('select[name="bentuk"]')
    let eventBentuk = false
    const berat = document.querySelector('input[name="beratKelompok"]')
    let eventBerat = false
    const btSubmit = document.getElementById('btSubmit')

    btSubmit.addEventListener('click', () => {
      let errorMsg = document.createElement('p')
      errorMsg.classList.add('text-error', 'pesanerror')

      if (kadar.value === 'kosong') {
        kadar.classList.add('select-error', 'bg-error')
        kadar.classList.remove('bg-primary', 'select-primary')
        errorMsg.innerText = 'Pilih salah satu kadar!'
        if (document.getElementsByClassName('pesanerror').length == 0) kadar.after(errorMsg)
        kadar.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "nearest"
        });

        if (!eventKadar) {
          kadar.addEventListener('change', function () {
            if (kadar.value && kadar.value !== 'kosong') {
              kadar.classList.remove('select-error', 'bg-error')
              kadar.classList.add('bg-primary', 'select-primary')
              removeElementsByClass('pesanerror')
            }
          })
          eventKadar = true
        }

        return

      } else if (bentuk.value === 'kosong') {
        bentuk.classList.add('select-error', 'bg-error')
        bentuk.classList.remove('bg-primary', 'select-primary')
        errorMsg.innerText = 'Pilih salah satu bentuk perhiasan!'
        if (document.getElementsByClassName('pesanerror').length == 0) bentuk.after(errorMsg)
        bentuk.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "nearest"
        });

        if (!eventBentuk) {
          bentuk.addEventListener('change', function () {
            if (bentuk.value && bentuk.value !== 'kosong') {
              bentuk.classList.remove('select-error', 'bg-error')
              bentuk.classList.add('bg-primary', 'select-primary')
              removeElementsByClass('pesanerror')
            }
          })
          eventBentuk = true
        }

        return

      } else if (berat.value == 0 || !berat.value) {
        berat.classList.add('input-error', 'bg-error')
        errorMsg.innerText = 'Berat kelompok tidak boleh 0!'
        if (document.getElementsByClassName('pesanerror').length == 0) berat.after(errorMsg)
        berat.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "nearest"
        });

        if (!eventBerat) {
          berat.addEventListener('change', function () {
            if (berat.value != 0 && berat.value) {
              berat.classList.remove('input-error', 'bg-error')
              removeElementsByClass('pesanerror')
            }
          })
          eventBerat = true
        }

        return
      }

      if (!formKelompok.reportValidity()) return

      Swal.fire({
        title: 'Simpan perubahan?',
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
          formKelompok.action = BASEURL.slice(0, -5) + '?_method=PUT'
          formKelompok.submit()
        }
      })
    })


    // disini buat ngedit kelompok
    const btGantiStok = document.getElementById('btGantiStok')
    const stok = document.getElementById('stok')
    let jumlahStok = stok.value

    btGantiStok.addEventListener('click', () => {
      Swal.fire({
        title: 'Pengubahan Stok',
        html: printChangeStockHTML(jumlahStok),
        showCancelButton: true,
        scrollbarPadding: false,
        confirmButtonColor: SwalCustomColor.button.confirm,
        confirmButtonText: 'Selanjutnya',
        preConfirm: () => {
          const stokBaru = document.getElementById('swal-stokBaru')
          const stokTercatat = document.getElementById('swal-stokTercatat')
          const alasan = document.getElementById('swal-alasan')

          try {
            if (!stokBaru.value) throw 'Jumlah stok baru tidak boleh kosong!'
            if (!stokTercatat.value) throw 'Jumlah stok tercatat tidak boleh kosong!'
            if (!alasan.value) throw 'Alasan pengubahan tidak boleh kosong!'

            if (stokBaru.value < 0) throw 'Jumlah stok baru tidak valid!'

            return {
              stokBaru: stokBaru.value,
              stokTercatat: stokTercatat.value,
              alasan: alasan.value
            }

          } catch (error) {
            Swal.showValidationMessage(error)
          }

        }
      }).then((gantiStok) => {
        if (gantiStok.isConfirmed) {

          Swal.fire({
            title: 'Konfirmasi Pengubahan Stok',
            html: `Anda akan mengubah stok kelompok ini dari <span class="font-semibold">${gantiStok.value.stokTercatat}</span> menjadi <span class="font-semibold">${gantiStok.value.stokBaru}</span> dengan alasan "${gantiStok.value.alasan}". Lanjutkan?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Ya, ubah stok!',
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
                  type: "PUT",
                  url: location.pathname.slice(0, -5) + '/ubah-stok',
                  data: {
                    stokBaru: gantiStok.value.stokBaru,
                    alasan: gantiStok.value.alasan
                  },
                  dataType: 'json',
                  success: function (data) {
                    resolve({
                      apakahSukses: true,
                      msg: 'Stok kelompok berhasil diubah!',
                      stokBaru: gantiStok.value.stokBaru
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
              if (hasilUbah.value.apakahSukses) {
                stok.value = hasilUbah.value.stokBaru
                jumlahStok = hasilUbah.value.stokBaru
              }

              Swal.fire({
                title: ((hasilUbah.value.apakahSukses) ? 'Pengubahan Berhasil!' : 'Error'),
                text: capsFirstWord(hasilUbah.value.msg),
                icon: ((hasilUbah.value.apakahSukses) ? 'success' : 'error'),
                scrollbarPadding: false,
                confirmButtonText: 'Tutup',
                confirmButtonColor: SwalCustomColor.button.cancel
              })
            }
          })

        }
      })
    })

    let printChangeStockHTML = function (stokLama = 0) {

      const html = `
              <form>
                <div class="w-full px-6 space-y-6 flex flex-col text-left">   
                    <div class="form-control">
                      <label for="swal-stokTercatat">
                        <span class="">Jumlah Stok Tercatat<span class="text-error"> *</span></span>
                      </label>
                      <input type="number" id="swal-stokTercatat" class="input input-bordered"
                        placeholder="0" value = "${stokLama}" disabled>
                    </div>

                    <div class="form-control">
                      <label for="swal-stokBaru">
                        <span class="">Jumlah Stok Baru<span class="text-error"> *</span></span>
                      </label>
                      <input type="number" oninput="validity.valid||(value='');" id="swal-stokBaru" class="input input-bordered"
                        placeholder="0" min="0" required>
                    </div>
    
                    <div class="form-control">
                        <label for="swal-alasan">
                          <span class="">Alasan Pengubahan Stok</span>
                        </label>
                        <textarea type="text" id="swal-alasan" name="swal-alasan" class="textarea textarea-bordered h-24"
                          placeholder="Contoh: Catatan stok tidak cocok dengan stok sebenarnya" maxlength="100" required></textarea>

                      </div>
                    </div>
    
                </div>
              </form>
          `
      return html
    }

  }


})
