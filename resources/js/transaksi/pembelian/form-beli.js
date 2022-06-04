$(function () {
  // ===================================================== SUPER =========================================================
  // ini semua input, kecuali select versi khusus (macem kelengkapan nota, asal pembelian, dkk)

  // input kelengkapan nota
  // input asal pembelian
  const namaToko = document.getElementById('namaToko')

  const kadar = document.getElementById('kadar')
  const kodepro = document.getElementById('kodepro')

  const bentuk = document.getElementById('bentuk')
  const model = document.getElementById('model')
  // input jenis stok
  const keteranganCatatan = document.getElementById('keteranganCatatan')

  const beratNota = document.getElementById('beratNota')
  const beratBarang = document.getElementById('beratBarang')

  const hargaJualNota = document.getElementById('hargaJualNota')
  const potonganNota = document.getElementById('potonganNota')

  const tanggalBeli = document.getElementById('tanggalBeli')

  const ajukanTT = document.getElementById('ajukanTT')
  const adaJanjiTT = document.getElementById('adaJanjiTT')

  // ini tanda potongan berubah
  const tandaPotonganNota1 = document.getElementById('tandaPotonganNota1')
  const tandaPotonganNota2 = document.getElementById('tandaPotonganNota2')
  const tandaPotonganNota3 = document.getElementById('tandaPotonganNota3')

  // ===================================================== MULAI ===========================================================

  // ambil data yang dibutuhin
  $.get("/app/cumaData/kadarBentuk", {},
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
      $.get("/app/cumaData/kodeprosByKadarId", {
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
            tandaPotonganNota1.textContent = '(persentase)'
            tandaPotonganNota2.textContent = '%'
            tandaPotonganNota3.textContent = ''
          } else {
            tandaPotonganNota1.textContent = '(nominal)'
            tandaPotonganNota2.textContent = 'Rp.'
            tandaPotonganNota3.textContent = 'per gram'
          }

          potonganNota.disabled = false
        },
        "json"
      ).fail(() => {
        potonganNota.disabled = true
        resetKodepro()
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
    if (bentuk.value && bentuk.value != 'kosong') {
      $.get("/app/cumaData/modelByBentuk", {
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

  // ===================================================== CEK HARGA ===========================================================
  const btHitung = document.getElementById('btHitung')
  btHitung.addEventListener('click', () => {
    let form = document.getElementById('formPembelian')
    let datas = new FormData(form)


    if (cekConstrain()) {
      $.ajax({
        type: "POST",
        url: "/app/transaksi/pembelian/tesBuang",
        data: datas,
        dataType: 'json',
        processData: false,
        contentType: false,
        success: function (response) {
          console.log(response)
        }, 
        error: function (response){
          if(response.responseJSON.errors && response.responseJSON.errors.length > 0){
            response.responseJSON.errors.forEach(element => {
              console.error(element.field + ': ' + element.message)
            });
          }
          else console.error(response.responseText)
        }
      });
    }

  })

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
            global.removeElementsByClass('pesanerror')
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
            global.removeElementsByClass('pesanerror')
          }
        })
        eventModel = true
      }

      return false
    }

    // cek berat nota
    if((beratNota.value == 0 || !beratNota.value) && document.querySelector('input[name=kelengkapanNota]:checked').value === 'dengan'){
      beratNota.classList.add('select-error', 'bg-error')
      beratNota.classList.remove('bg-primary', 'select-primary')
      errorMsg.innerText = 'Berat nota tidak boleh kosong dan nol!'
      if (document.getElementsByClassName('pesanerror').length == 0) beratNota.after(errorMsg)
      beratNota.scrollIntoView({
        // behavior: "smooth",
        block: "center",
        inline: "nearest"
      });

      if (!eventBeratNota) {
        beratNota.addEventListener('change', function () {
          if (beratNota.value && beratNota.value !== 'kosong') {
            beratNota.classList.remove('select-error', 'bg-error')
            beratNota.classList.add('bg-primary', 'select-primary')
            global.removeElementsByClass('pesanerror')
          }
        })
        eventBeratNota = true
      }

      return false
    }

    // cek berat barang
    if(beratBarang.value == 0 || !beratBarang.value){
      beratBarang.classList.add('select-error', 'bg-error')
      beratBarang.classList.remove('bg-primary', 'select-primary')
      errorMsg.innerText = 'Berat barang tidak boleh kosong dan nol!'
      if (document.getElementsByClassName('pesanerror').length == 0) beratBarang.after(errorMsg)
      beratBarang.scrollIntoView({
        // behavior: "smooth",
        block: "center",
        inline: "nearest"
      });

      if (!eventBeratBarang) {
        beratBarang.addEventListener('change', function () {
          if (beratBarang.value && beratBarang.value !== 'kosong') {
            beratBarang.classList.remove('select-error', 'bg-error')
            beratBarang.classList.add('bg-primary', 'select-primary')
            global.removeElementsByClass('pesanerror')
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
