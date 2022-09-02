import {
  Chart,
  registerables
} from 'chart.js';
// import Swal from "sweetalert2"
import Swal from "sweetalert2/dist/sweetalert2";
Chart.register(...registerables);

import { SwalCustomColor, rupiahParser, capsFirstWord } from '../../fungsi.js'

$(function () {
  // DOM
  const totalTerjual = document.getElementById('totalTerjual')
  const peringkatPenjualanTotal = document.getElementById('peringkatPenjualanTotal')
  const penjualanBulanIni = document.getElementById('penjualanBulanIni')
  const peringkatPenjualanBulanIni = document.getElementById('peringkatPenjualanBulanIni')
  const penjualanTahunIni = document.getElementById('penjualanTahunIni')
  const peringkatPenjualanTahunIni = document.getElementById('peringkatPenjualanTahunIni')
  const wadahAnalisis = document.getElementById('wadahAnalisis')
  const wadahLoadingAnalisis = document.getElementById('wadahLoadingAnalisis')
  const penjualanTerakhir = document.getElementById('penjualanTerakhir')


  // DOM Statistik
  const subjudulStatistik = document.getElementById('subjudulStatistik')
  const wadahStatistik = document.getElementById('wadahStatistik')
  const wadahLoadingStatistik = document.getElementById('wadahLoadingStatistik')
  const wadahSebaranData = document.getElementById('sebaranData');

  $.get("/app/cuma-data/peringkat-kelompok/" + ($('.base-page').data('idk') || 'kosong'), {},
    function (data, textStatus, jqXHR) {
      // kalau mau ini bisa dibikin promise, mulai dari getnya. trus bisa dikasi preventif kalau error ngapain
      if (data.peringkatTotal) {
        totalTerjual.innerText = data.peringkatTotal.jumlah + ' buah'
        peringkatPenjualanTotal.innerText = 'Urutan ke-' + data.peringkatTotal.ranking + ' dari ' + data.totalKelompok + ' kelompok'
      } else {
        totalTerjual.innerText = '0 buah'
        peringkatPenjualanTotal.innerText = 'Tidak ada penjualan'
      }

      if (data.peringkatTahunIni) {
        penjualanTahunIni.innerText = data.peringkatTahunIni.jumlah + ' buah'
        peringkatPenjualanTahunIni.innerText = 'Urutan ke-' + data.peringkatTahunIni.ranking + ' dari ' + data.totalKelompok + ' kelompok'
      } else {
        penjualanTahunIni.innerText = '0 buah'
        peringkatPenjualanTahunIni.innerText = 'Tidak ada penjualan'
      }

      if (data.peringkatBulanIni) {
        penjualanBulanIni.innerText = data.peringkatBulanIni.jumlah + ' buah'
        peringkatPenjualanBulanIni.innerText = 'Urutan ke-' + data.peringkatBulanIni.ranking + ' dari ' + data.totalKelompok + ' kelompok'
      } else {
        penjualanBulanIni.innerText = '0 buah'
        peringkatPenjualanBulanIni.innerText = 'Tidak ada penjualan'
      }

      if (data.transaksiTerakhir) {
        penjualanTerakhir.innerText = new Date(data.transaksiTerakhir.tanggal).toLocaleDateString('id-ID')
      } else {
        penjualanTerakhir.innerText = 'Tidak ada penjualan'
      }

      wadahAnalisis.classList.remove('hidden')
      wadahLoadingAnalisis.classList.add('hidden')
    },
    "json"
  );

  loadStatistik()

  // wadabChart jangan dipake macem2, khusus buat nampung chart
  let wadahChart = undefined
  let pointer = 0

  function loadStatistik(mode = 0) {
    $.get("/app/cuma-data/sebaran-data/" + ($('.base-page').data('idk') || 'kosong'), {
      mode: mode
    },
      function (data, textStatus, jqXHR) {
        pointer = mode

        let labels = []
        let datas = []

        data.forEach(element => {
          labels.push(element.label)
          datas.push(element.jumlah)
        });

        const input = {
          labels: labels,
          datasets: [{
            label: 'Penjualan',
            data: datas,
            borderColor: 'rgb(255, 99, 132)',
          },]
        };

        const chartConfig = {
          type: 'line',
          data: input,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: 'Penjualan ' + ((mode == 1) ? 'Bulan Ini' : (mode == 2) ? 'Tahun Ini' : 'Minggu Ini')
              }
            },
            scale: {
              ticks: {
                precision: 0,
              }
            }
          },
        };

        if (wadahChart) wadahChart.destroy()

        wadahChart = new Chart(wadahSebaranData, chartConfig)
        subjudulStatistik.innerText = 'Statistik Transaksi ' + ((mode == 1) ? ' Bulan Ini' : (mode == 2) ? ' Tahun Ini' : ' Minggu Ini')

        wadahStatistik.classList.remove('hidden')
        wadahLoadingStatistik.classList.add('hidden')
      },
      "json"
    ).fail(() => {
      if (wadahChart) wadahChart.destroy()

      wadahStatistik.classList.add('hidden')
      wadahLoadingStatistik.classList.remove('hidden')

      Swal.fire({
        title: 'Error - Statistik',
        text: 'Ada masalah pada server saat akan memuat statistik',
        icon: 'error',
        scrollbarPadding: false,
        confirmButtonColor: SwalCustomColor.button.cancel,
        confirmButtonText: 'Tutup'
      })
    })
  }


  document.getElementById('aturStatistik').addEventListener('click', (e) => {
    Swal.fire({
      title: 'Atur jangkauan statistik',
      html: printAturStatistikHTML(pointer),
      confirmButtonText: 'Terapkan',
      showCancelButton: true,
      cancelButtonText: 'Batal',
      scrollbarPadding: false,
      preConfirm: () => {
        return document.getElementById('swal-range').value
      }
    }).then(hasil => {
      if (hasil.isConfirmed) {
        loadStatistik(hasil.value)
      }
    })
  })


  // ========================================================= CEK HARGA =========================================================
  const selectCekHarga = document.getElementById('selectCekHarga')
  const hargaLama = document.getElementById('hargaLama')
  const hargaBaru = document.getElementById('hargaBaru')
  const potonganLama = document.getElementById('potonganLama')
  const potonganBaru = document.getElementById('potonganBaru')

  selectCekHarga.addEventListener('change', () => {
    $.get("/app/cuma-data/kodepro-by-id", {
      id: selectCekHarga.value
    },
      function (data, textStatus, jqXHR) {
        hargaLama.innerText = rupiahParser(data.hargaPerGramLama)
        hargaBaru.innerText = rupiahParser(data.hargaPerGramBaru)
        potonganLama.innerText = (data.apakahPotonganPersen) ? data.potonganLama + '% dari harga jual' : rupiahParser(data.potonganLama)
        potonganBaru.innerText = (data.apakahPotonganPersen) ? data.potonganBaru + '% dari harga jual' : rupiahParser(data.potonganBaru)
      },
      "json"
    ).fail(() => {
      hargaLama.innerText = rupiahParser(0)
      hargaBaru.innerText = rupiahParser(0)
      potonganLama.innerText = rupiahParser(0)
      potonganBaru.innerText = rupiahParser(0)
    })
  })

})

let printAturStatistikHTML = function (pointer = 0) {

  const html = `
            <div class="w-full px-6 space-y-6 flex flex-col text-left">

                <div class="form-control">
                    <select id="swal-range" class="select select-bordered w-full max-w-md swal">
                    <option value="0" ${(pointer == 0) ? 'selected' : ''}>Penjualan minggu ini</option>
                    <option value="1" ${(pointer == 1) ? 'selected' : ''}>Penjualan bulan ini</option>
                    <option value="2" ${(pointer == 2) ? 'selected' : ''}>Penjualan tahun ini</option>
                    </select>
                </div>

            </div>
        `
  return html
}


// disini buat ngedit kelompok
const btGantiStok = document.getElementById('btGantiStok')
const stok = document.getElementById('stok')

if (btGantiStok && stok) {
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
                url: location.pathname + '/ubah-stok',
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

              Swal.fire({
                title: ((hasilUbah.value.apakahSukses) ? 'Pengubahan Berhasil!' : 'Error'),
                text: capsFirstWord(hasilUbah.value.msg),
                icon: ((hasilUbah.value.apakahSukses) ? 'success' : 'error'),
                scrollbarPadding: false,
                confirmButtonText: 'Tutup',
                confirmButtonColor: SwalCustomColor.button.cancel
              }).then(() => {
                window.location = location.pathname
              })

              
            }
          })

      }
    })
  })
}

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