const {
  default: Swal
} = require('sweetalert2')

$(function () {
  // ============================== Data Statis (ga bakal berubah) ==============================
  let maxSelisih = document.getElementById('maxSelisih').value
  let beliId = document.getElementById('beliBid').value

  // ===================================== Data Dinamis =========================================

  const btnTambahKerusakan = document.getElementById('tambah-kerusakan')
  const beliBentuk = document.getElementById('beliBentuk')

  btnTambahKerusakan.addEventListener('click', (e) => {
    if (beliId && beliId !== '' && beliBentuk.value !== '') {
      // Rusak.tambahKerusakan(beliId)
      tambahKerusakan(beliId)
    } else {
      beliBentuk.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest"
      });
    }
  })

  // ================================= side menu ===============================================
  const preHitungCard = document.getElementById('preHitungCard')
  const postHitungCard = document.getElementById('postHitungCard')
  const sideKadar = document.getElementById('sideKadar')
  const sideBentuk = document.getElementById('sideBentuk')
  const sideStatus = document.getElementById('sideStatus')
  const sideBeratNota = document.getElementById('sideBeratNota')
  const sideBeratSebenarnya = document.getElementById('sideBeratSebenarnya')
  const sideHargaPerGram = document.getElementById('sideHargaPerGram')
  const sidePotongan = document.getElementById('sidePotongan')
  const sideWadahKerusakan = document.getElementById('sideWadahKerusakan')
  const sideHargaNota = document.getElementById('sideHargaNota')
  const sideTotalPotongan = document.getElementById('sideTotalPotongan')
  const sideBeratTotalPotongan = document.getElementById('sideBeratTotalPotongan')
  const sideTotalKerusakan = document.getElementById('sideTotalKerusakan')
  const sideHargaBeli = document.getElementById('sideHargaBeli')

  // tombol & persiapan
  const btnSimpan = document.getElementById('btnSimpan')
  const labelAksesTutup = document.getElementById('labelAksesTutup')
  let aksesSimpanTertutup = true

  //  ================================= hitungan ================================================

  const beliBeratSebenarnya = document.getElementById('beliBeratSebenarnya')
  const cekHarga = document.getElementById('cekHarga')
  const loadBtn = document.getElementById('loadBtn')

  let max = beliBeratSebenarnya.max
  let eventBeli = false
  let loading = false

  cekHarga.addEventListener('click', (e) => {
    if (loading) {
      e.preventDefault()
      return
    }

    if (beliBeratSebenarnya.value <= 0 || beliBeratSebenarnya.value > max) {
      beliBeratSebenarnya.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest"
      });

      beliBeratSebenarnya.classList.add('ring', 'ring-error')
      if (!eventBeli) {
        beliBeratSebenarnya.addEventListener('focusout', (e) => {
          if (beliBeratSebenarnya.value > 0) beliBeratSebenarnya.classList.remove('ring', 'ring-error')
        })
      }
      eventBeli = true
    } else if ((max - beliBeratSebenarnya.value) > maxSelisih) {
      Swal.fire({
        title: 'Selisih berat terlalu besar!',
        icon: 'info',
        iconColor: '#FF5724',
        html: 'Maksimal selisih berat untuk transaksi umum adalah <span class=" font-semibold">' + maxSelisih + ' gram</span>. Selebihnya akan dianggap sebagai rosok dan diproses sebagai kategori transaksi khusus. Alihkan ke kategori tersebut?',
        showCancelButton: true,
        cancelButtonText: 'Tidak',
        confirmButtonText: 'Ya, alihkan!',
        confirmButtonColor: '#4b6bfb',
      })
    } else {
      loading = true
      loadBtn.classList.remove('hidden')

      $.post("/app/transaksi/pembelian/hitungHargaNormal", $('#formPembelian').serialize(),
        function (data, textStatus, jqXHR) {
          console.log(data)
          if (data) {
            sideKadar.textContent = data.penjualan.kelompok.kadar.nama
            sideBentuk.textContent = data.penjualan.kelompok.bentuk.bentuk
            sideStatus.textContent = (data.penjualan.apakah_perhiasan_baru) ? 'Baru (N)' : 'Normal'
            sideBeratNota.textContent = data.penjualan.berat_sebenarnya + ' g'
            sideBeratSebenarnya.textContent = data.beratSebenarnya + ' g'
            sideHargaPerGram.textContent = global.rupiahParser(data.hargaPerGram)
            sidePotongan.textContent = data.penjualan.potongan_deskripsi

            sideWadahKerusakan.textContent = ''
            if (data.listKerusakan.length > 0) {
              data.listKerusakan.forEach(element => {
                let row = document.createElement('li')
                row.classList.add('flex', 'text-error')

                let spanNama = document.createElement('span')
                spanNama.classList.add('flex-1')
                spanNama.textContent = element.detail

                let spanOngkos = document.createElement('span')
                spanOngkos.classList.add('flex-none')
                spanOngkos.textContent = global.rupiahParser(element.ongkos)

                row.append(spanNama, spanOngkos)
                sideWadahKerusakan.append(row)
              });
            } else {
              let row = document.createElement('li')
              row.textContent = 'Tidak ada kerusakan'

              sideWadahKerusakan.append(row)
            }

            sideHargaNota.textContent = global.rupiahParser(data.penjualan.harga_jual_akhir)
            sideTotalPotongan.textContent = global.rupiahParser(data.totalPotongan)
            sideBeratTotalPotongan.textContent = data.penjualan.berat_sebenarnya + ' g'
            sideTotalKerusakan.textContent = global.rupiahParser(data.totalKerusakan)
            sideHargaBeli.textContent = global.rupiahParser(data.hargaBeli)

            if(!preHitungCard.classList.contains('hidden')) preHitungCard.classList.add('hidden')
            postHitungCard.classList.remove('hidden')

            bukaAksesSimpan()
          }
        },
        "json"
      ).always(() => {
        loading = false
        loadBtn.classList.add('hidden')
      })
    }
  })

  // ========================================== Reset State =============================================
  let tutupAksesSimpan = function () {
    btnSimpan.disabled = true
    aksesSimpanTertutup = true
    labelAksesTutup.classList.remove('hidden')
    console.log('ewe')
  }

  let bukaAksesSimpan = function () {
    btnSimpan.disabled = false
    aksesSimpanTertutup = false
    if(!labelAksesTutup.classList.contains('hidden')) labelAksesTutup.classList.add('hidden')
  }

  beliBeratSebenarnya.addEventListener('change', tutupAksesSimpan)

  // ============================================ Ini observer ==========================================
  const targetNode = document.getElementById('wadah-data');
  const tabelTeksKosong = document.getElementById('teks-tabel-kosong')

  const config = {
    childList: true,
  };

  const callback = function (mutationsList, observer) {
    for (const mutation of mutationsList) {
      if (mutation.type === 'childList' || mutation.type === 'attributes') {
        if (targetNode.childElementCount < 1) {
          tabelTeksKosong.classList.remove('hidden')
        } else {
          tabelTeksKosong.classList.add('hidden')
        }
        tutupAksesSimpan()
      }
    }
  };

  const observer = new MutationObserver(callback);
  observer.observe(targetNode, config);



  // ====================================== Kerusakan ==========================================
  function tambahKerusakan(bentuk) {
    Swal.fire({
      title: 'Tambah Kerusakan',
      confirmButtonText: 'Tambahkan',
      showCancelButton: true,
      cancelButtonText: 'Batal',
      confirmButtonColor: '#4b6bfb',
      html: printKerusakanHTML(),
      footer: '<a href="#" id="linkPindah" class="link">Kerusakan yang anda cari tidak ada?</a>',
      willOpen: () => {
        let selectKerusakan = Swal.getHtmlContainer().querySelector('#swal-rusak')
        let inputTingkatRusak = Swal.getHtmlContainer().querySelector('#swal-tingkatrusak')
        let inputOngkosRusak = Swal.getHtmlContainer().querySelector('#swal-ongkosrusak')
        let inputHidden = Swal.getHtmlContainer().querySelector('#swal-hiddenId')

        Swal.showLoading(Swal.getConfirmButton())

        $.get("/app/cumaData/kerusakanByBentuk", { bentuk:bentuk },
          function (data, textStatus, jqXHR) {

            if (data.length > 0) {
              data.forEach((element, index) => {
                let opt = document.createElement('option')
                opt.value = JSON.stringify(element)
                opt.innerText = element.nama

                selectKerusakan.append(opt)

                if(index === 0){
                  inputTingkatRusak.value = (element.apakah_bisa_diperbaiki)? 'Bisa diperbaiki' : 'Tidak bisa diperbaiki'
                  inputOngkosRusak.value = element.ongkos_deskripsi
                  inputHidden.value = element.id
                }
              });

              selectKerusakan.disabled = false
              inputOngkosRusak.disabled = false
              inputTingkatRusak.disabled = false
            } else {
              let opt = document.createElement('option')
              opt.value = 'kosong'
              opt.innerText = 'Kelompok tidak ditemukan'
              opt.disabled = true
              opt.selected = true

              selectKerusakan.append(opt)
            }

            Swal.hideLoading()
          },
          "json"
        );

        selectKerusakan.addEventListener('change', (e) => {
          Swal.resetValidationMessage()
          try {
            let temp = JSON.parse(selectKerusakan.value)
            inputOngkosRusak.value = temp.ongkos_deskripsi
            inputTingkatRusak.value = (temp.apakah_bisa_diperbaiki)? 'Bisa diperbaiki' : 'Tidak bisa diperbaiki'
            inputHidden.value = temp.id
          } catch (error) {
            Swal.showValidationMessage('Ada error!')
          }
        })

        let linkPindah = document.getElementById('linkPindah')
        linkPindah.addEventListener('click', (e) => {
          e.preventDefault()
          otwPindah()
        })
      },
      preConfirm: () => {
        let selectKerusakan = Swal.getHtmlContainer().querySelector('#swal-rusak')
        let inputTingkatRusak = Swal.getHtmlContainer().querySelector('#swal-tingkatrusak')
        let inputOngkosRusak = Swal.getHtmlContainer().querySelector('#swal-ongkosrusak')
        let inputHidden = Swal.getHtmlContainer().querySelector('#swal-hiddenId')
        let inputBanyak = Swal.getHtmlContainer().querySelector('#swal-banyakrusak')

        if(selectKerusakan.value && selectKerusakan.value !== 'kosong' && inputTingkatRusak.value && inputOngkosRusak.value && inputHidden.value && inputBanyak.value > 0){
            return {
                'idKerusakan': inputHidden.value,
                'teksKerusakan': selectKerusakan[selectKerusakan.selectedIndex].innerText,
                'tingkat': inputTingkatRusak.value,
                'teksOngkos': inputOngkosRusak.value,
                'banyakrusak': inputBanyak.value,
              }
        } else{
            Swal.showValidationMessage(
                'Input tidak valid!'
              )
        }

      }
    }).then((hasil) => {
      if (hasil.isConfirmed && hasil.value) {
        appendKerusakan(JSON.stringify(hasil.value))
      }
    })
  }

  let appendKerusakan = function (kerusakan) {
    if (typeof kerusakan == undefined) {
      return
    }
    let rusakBaru = JSON.parse(kerusakan)
    let adaDuplikat = false
    const listRusak = document.getElementsByName('idKerusakan[]')

    for (let [index, input] of listRusak.entries()) {
      if (input.value === rusakBaru.idKerusakan) {
        adaDuplikat = true
        let jumlahBaru = numberOnlyParser(document.getElementsByName('jumlahKerusakan[]')[index].value) + numberOnlyParser(rusakBaru.banyakrusak)
        document.getElementsByClassName('teksJumlahKerusakan')[index].textContent = jumlahBaru
        document.getElementsByName('jumlahKerusakan[]')[index].value = jumlahBaru
        tutupAksesSimpan()
        break;
      }
    }

    if (adaDuplikat) {
      return
    }

    const htmlAppend = `
          <tr>
              <td>
                <span class="teksKerusakan">` + rusakBaru.teksKerusakan + ` (<span class="teksJumlahKerusakan">` + rusakBaru.banyakrusak + `</span>)</span>
                <input type="hidden" name="idKerusakan[]" value="` + rusakBaru.idKerusakan + `">
                <input type="hidden" name="ongkosKerusakan[]" value="` + numberOnlyParser(rusakBaru.teksOngkos) + `">
                <input type="hidden" name="jumlahKerusakan[]" value="` + rusakBaru.banyakrusak + `">
              </td>
              <td>` + rupiahParser(numberOnlyParser(rusakBaru.teksOngkos)) + `</td>
              <td class="w-16">
                <button class="btn text-error btn-square btn-ghost btn-delete">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </td>
            </tr>
          `
    $('#wadah-data').append(htmlAppend);

    $('#wadah-data button.btn-delete').on('click', function (e) {
      e.preventDefault()
      $(this).parentsUntil('tbody#wadah-data').remove()
    });
  }

function otwPindah (){
  Swal.fire({
    title: 'Tidak seluruh kerusakan ditampilkan',
    text: 'Menu ini hanya menampilkan kerusakan yang tidak parah dan dapat diperbaiki. Kerusakan lainnya masuk dalam kategori transaksi pembelian khusus. Alihkan ke kategori tersebut?',
    showCancelButton: true,
    icon: 'info',
    cancelButtonText: 'Tidak',
    confirmButtonText: 'Ya, alihkan!',
    confirmButtonColor: '#4b6bfb',
  })
}

let printKerusakanHTML = function () {

    const rusakHTML = `
            <div class="w-full px-6 space-y-6 flex flex-col text-left">

                <div class="form-control">
                    <label for="swal-rusak">Kerusakan</label>
                    <select id="swal-rusak" class="select select-bordered w-full max-w-md swal" disabled>
                    <input type="hidden" id="swal-hiddenId" hidden>
                    </select>
                </div>

                <div class="form-control">
                  <label for="swal-tingkatrusak">
                    <span class="">Tingkat Kerusakan</span>
                  </label>
                  <input type="text" id="swal-tingkatrusak" name="swal-tingkatrusak" class="input input-bordered"
                    readonly disabled value="Tidak ada kerusakan terpilih"/>
                </div>

                <div class="form-control">
                  <label for="swal-ongkosrusak">
                    <span class="">Ongkos Perbaikan</span>
                  </label>
                  <input type="text" id="swal-ongkosrusak" name="swal-ongkosrusak" class="input input-bordered"
                    readonly disabled value="Tidak ada kerusakan terpilih"/>
                </div>

                <div class="flex pt-4 justify-center" x-data="{ counter: 1 }">
                    <div class="bg-base-300 rounded-box px-4 flex">
                    <button class="btn btn-ghost text-error" @click="(counter-1 < $refs.angka.min)? $refs.angka.min : counter--">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
                        </svg>
                    </button>
                    <input type="number" id="swal-banyakrusak" class="input input-ghost rounded-none text-2xl text-center w-16 focus:ring-0" x-model="counter" x-ref="angka" readonly min="1" max="99" value="1">
                    <button class="btn btn-ghost text-success" @click="(counter+1 > $refs.angka.max)? $refs.angka.min : counter++">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                        </svg>
                    </button>
                    </div>
                </div>

            </div>
        `
    return rusakHTML
  }
})
