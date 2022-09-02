// import Swal from "sweetalert2"
import Swal from "sweetalert2/dist/sweetalert2"

const rupiahParser = function (number) {
  if (typeof number == 'number') {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(number)
  } else {
    return 'error'
  }
}

const numberOnlyParser = function (stringnumber) {
  let final = stringnumber.replace(/\D/gi, '')
  return parseInt(final)
}

let wadahRusak
let teksWadahKosong

/**
 * Tambah Kerusakan
 * @idBentuk id dari bentuk, bukan nama bentuknya
 * @idWadah id wadah tempat naruh append kerusakan
 * @idTeksWadahKosong id teks yang nandain kalo isi tabelnya kosong
 */
export function tambahKerusakan(idBentuk, idWadah, idTeksWadahKosong) {
    wadahRusak = document.getElementById(idWadah)
    teksWadahKosong = document.getElementById(idTeksWadahKosong)
    if(!wadahRusak || !teksWadahKosong){
        console.error('wadah rusak ngga valid')
        return
    }

  Swal.fire({
    title: 'Tambah Kerusakan',
    confirmButtonText: 'Tambahkan',
    showCancelButton: true,
    cancelButtonText: 'Batal',
    scrollbarPadding: false,
    confirmButtonColor: '#4b6bfb',
    html: printKerusakanHTML(),
    willOpen: () => {
      let selectKerusakan = Swal.getHtmlContainer().querySelector('#swal-rusak')
      let inputTingkatRusak = Swal.getHtmlContainer().querySelector('#swal-tingkatrusak')
      let inputOngkosRusak = Swal.getHtmlContainer().querySelector('#swal-ongkosrusak')
      let inputHidden = Swal.getHtmlContainer().querySelector('#swal-hiddenId')

      Swal.showLoading(Swal.getConfirmButton())

      $.get("/app/cuma-data/kerusakan-by-bentuk", {
          bentuk: idBentuk // ini id
        },
        function (data, textStatus, jqXHR) {

          if (data.length > 0) {
            data.forEach((element, index) => {
              let opt = document.createElement('option')
              opt.value = JSON.stringify(element)
              opt.innerText = element.nama

              selectKerusakan.append(opt)

              if (index === 0) {
                inputTingkatRusak.value = (element.apakah_bisa_diperbaiki) ? 'Bisa diperbaiki' : 'Tidak bisa diperbaiki'
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
            opt.innerText = 'Kerusakan tidak ditemukan'
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
          inputTingkatRusak.value = (temp.apakah_bisa_diperbaiki) ? 'Bisa diperbaiki' : 'Tidak bisa diperbaiki'
          inputHidden.value = temp.id
        } catch (error) {
          Swal.showValidationMessage('Ada error!')
        }
      })

    },
    preConfirm: () => {
      let selectKerusakan = Swal.getHtmlContainer().querySelector('#swal-rusak')
      let inputTingkatRusak = Swal.getHtmlContainer().querySelector('#swal-tingkatrusak')
      let inputOngkosRusak = Swal.getHtmlContainer().querySelector('#swal-ongkosrusak')
      let inputHidden = Swal.getHtmlContainer().querySelector('#swal-hiddenId')
      let inputBanyak = Swal.getHtmlContainer().querySelector('#swal-banyakrusak')

      if (selectKerusakan.value && selectKerusakan.value !== 'kosong' && inputTingkatRusak.value && inputOngkosRusak.value && inputHidden.value && inputBanyak.value > 0) {
        return {
          'idKerusakan': inputHidden.value,
          'teksKerusakan': selectKerusakan[selectKerusakan.selectedIndex].innerText,
          'tingkat': inputTingkatRusak.value,
          'teksOngkos': inputOngkosRusak.value,
          'banyakrusak': inputBanyak.value,
        }
      } else {
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
      break;
    }
  }

  if (adaDuplikat) {
    return
  }


  const tr = document.createElement('tr')
  const td1 = document.createElement('td')
  const td2 = document.createElement('td')
  const td3 = document.createElement('td')

  const td1span = document.createElement('span')
  td1span.classList.add('teksKerusakan')

  const td1spanisi = document.createElement('span')
  td1spanisi.classList.add('teksJumlahKerusakan')
  td1spanisi.textContent = rusakBaru.banyakrusak

  td1span.append(rusakBaru.teksKerusakan, ' (', td1spanisi, ')')

  const input1 = document.createElement('input')
  input1.type = "hidden"
  input1.name = "idKerusakan[]"
  input1.value = rusakBaru.idKerusakan

//   const input2 = document.createElement('input')
//   input2.type = "number"
//   input2.classList.add('hidden')
//   input2.name = "ongkosKerusakan[]"
//   input2.value = numberOnlyParser(rusakBaru.teksOngkos)

  const input3 = document.createElement('input')
  input3.type = "number"
  input3.classList.add('hidden')
  input3.name = "jumlahKerusakan[]"
  input3.min = 1
  input3.value = rusakBaru.banyakrusak

  td1.append(td1span, input1, input3) // input2 dihapus

  td2.textContent = (rusakBaru.tingkat === 'Bisa diperbaiki')? rupiahParser(numberOnlyParser(rusakBaru.teksOngkos)) : 'Dianggap rosok'

  td3.classList.add('w-16')
  const butt = document.createElement('button')
  butt.type = "button"
  butt.classList.add('btn', 'text-error', 'btn-square', 'btn-ghost', 'btn-delete', 'bisaDikunci')

  // svg dan wadahnya
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
  svg.classList.add('h-5', 'w-5')
  svg.setAttribute('viewBox', '0 0 24 24')
  svg.setAttribute('fill', 'none')
  svg.setAttribute('stroke', 'currentColor')
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path")
  path.setAttribute('stroke-linecap', 'round')
  path.setAttribute('stroke-linejoin', 'round')
  path.setAttribute('stroke-width', '2')
  path.setAttribute('d', "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16")
  svg.append(path)

  butt.append(svg)
  td3.append(butt)
  
  tr.append(td1, td2, td3)
  wadahRusak.append(tr)

  butt.addEventListener('click', () => {
    butt.closest(`tbody#${wadahRusak.id} > tr`).remove()

    if (wadahRusak.rows.length == 0) {
      teksWadahKosong.classList.remove('hidden')
    }
  })

  if (wadahRusak.rows.length > 0) {
    teksWadahKosong.classList.add('hidden')
  }
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
