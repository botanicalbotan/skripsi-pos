import Swal from "sweetalert2"

export function tambahItem() {
  Swal.fire({
    title: 'Tambah Item',
    confirmButtonText: 'Tambahkan',
    showCancelButton: true,
    cancelButtonText: 'Batal',
    confirmButtonColor: global.SwalCustomColor.button.confirm,
    focusCancel: true,
    html: itemHTML(),
    preConfirm: () => {
      const jenis = Swal.getHtmlContainer().querySelector('input[name="swalJenis"]:checked').value
      const keterangan = Swal.getHtmlContainer().querySelector('#swalKeterangan').value
      const jumlah = Swal.getHtmlContainer().querySelector('#swalJumlah').value

      console.log(jenis + ' ' + keterangan + ' ' + jumlah)

      if (jenis && ['batu', 'mainan'].includes(jenis) && keterangan && jumlah > 0) {
        return {
          jenis,
          keterangan,
          jumlah
        }
      } else {
        Swal.showValidationMessage(
          'Input tidak valid!'
        )
      }

    }
  }).then((hasil) => {
    if (hasil.isConfirmed && hasil.value) {
      appendItem(JSON.stringify(hasil.value))
    }
  })
}

let appendItem = function (item) {
  if (typeof item == undefined) {
    return
  }

  let itemBaru = JSON.parse(item)
  const wadahItem = document.getElementById('wadah-item')
  const teksTabelItemKosong = document.getElementById('teks-tabel-item-kosong')

  const tr = document.createElement('tr')
  const td1 = document.createElement('td')
  const td2 = document.createElement('td')
  const td3 = document.createElement('td')

  const td1span = document.createElement('span')
  td1span.classList.add('teksItem')
  td1span.textContent = ((itemBaru.jenis === 'mainan') ? 'Mainan ' : 'Batu ') + global.capsFirstWord(itemBaru.keterangan)

  const input1 = document.createElement('input')
  input1.type = "hidden"
  input1.name = "jenisItem[]"
  input1.value = itemBaru.jenis

  const input2 = document.createElement('input')
  input2.type = "hidden"
  input2.name = "keteranganItem[]"
  input2.value = itemBaru.keterangan

  const input3 = document.createElement('input')
  input3.type = "number"
  input3.classList.add('hidden')
  input3.name = "jumlahItem[]"
  input3.min = 1
  input3.value = itemBaru.jumlah

  td1.append(td1span, input1, input2, input3)

  td2.textContent = itemBaru.jumlah

  td3.classList.add('w-16')
  const butt = document.createElement('button')
  butt.type = "button"
  butt.classList.add('btn', 'text-error', 'btn-square', 'btn-ghost', 'btn-delete')

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
  wadahItem.append(tr)

  butt.addEventListener('click', () => {
    butt.closest('tbody#wadah-item > tr').remove()
    const wadahItem = document.getElementById('wadah-item')
    const teksTabelItemKosong = document.getElementById('teks-tabel-item-kosong')

    if (wadahItem.rows.length == 0) {
      teksTabelItemKosong.classList.remove('hidden')
    }
  })

  if (wadahItem.rows.length > 0) {
    teksTabelItemKosong.classList.add('hidden')
  }
}


let itemHTML = function () {

  const rusakHTML = `
            <div class="w-full px-6 space-y-6 flex flex-col text-left" x-data="{ radio:0 }">

                <div class="form-control">
                  <label for="">Jenis Item<span class="text-error"> *</span></label>
                  <div class="flex space-x-4 mt-1">
                    <label class="cursor-pointer items-center py-2 flex-1 rounded-box px-4 border"
                      :class="(radio == 0)? 'bg-primary bg-opacity-10 border-primary': 'bg-white border-secondary'">
                      <input type="radio" name="swalJenis" checked="checked" class="radio radio-primary hidden"
                        value="batu"
                        @click="radio = 0; $refs.keterangan.value=''">
                      <span class="label-text text-base"
                        :class="(radio == 0)? 'text-primary': 'text-secondary'">Batu</span>
                    </label>
                    <label class="cursor-pointer items-center py-2 flex-1 rounded-box px-4 border"
                      :class="(radio == 1)? 'bg-primary bg-opacity-10 border-primary': 'bg-white border-secondary'">
                      <input type="radio" name="swalJenis" class="radio radio-primary hidden" value="mainan"
                        @click="radio = 1; $refs.keterangan.value=''">
                      <span class="label-text text-base" :class="(radio == 1)? 'text-primary': 'text-secondary'">Mainan</span>
                    </label>
                  </div>
                </div>

                <div class="form-control">
                  <label for="swalKeterangan">
                    <span x-text="(radio == 1)? 'Bentuk Mainan':'Warna Batu'"></span><span class="text-error"> *</span>
                  </label>
                  <input type="text" id="swalKeterangan" name="swalKeterangan" class="input input-bordered" x-ref="keterangan"
                      maxLength="30" :placeholder="(radio == 1)? 'Contoh: Love, Dora, Huruf F':'Contoh: Merah, Putih, Hitam'"/>
                </div>

                <div class="flex pt-4 justify-center" x-data="{ counter: 1 }">
                    <div class="bg-base-300 rounded-box px-4 flex">
                    <button class="btn btn-ghost text-error" @click="(counter-1 < $refs.angka.min)? $refs.angka.min : counter--">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
                        </svg>
                    </button>
                    <input type="number" id="swalJumlah" class="input input-ghost rounded-none text-2xl text-center w-16 focus:ring-0" x-model="counter" x-ref="angka" readonly min="1" max="99" value="1">
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
