// let Instascan = require('instascan');

import Swal from "sweetalert2"

const QR  = require('./modul-QR')

// pastiin punya wadah buat nampung data tbody#wadah-data
const Rusak = require('./modul-kerusakan')


$(function () {
  //============================================ VARIABEL SUPER ====================================================
  let TOTALRUSAK = 0
  let TOTALPOTONGAN = 0


  //============================================= mulai method =====================================================
  $('button#bukaScanner').on('click', function () {
    QR.bukaScanner()
    // QR.test()
  });

  let beliBentuk = document.getElementById('beliBentuk')
  let beliKadar = document.getElementById('beliKadar')
  let beliModel = document.getElementById('beliModel')
  let wadahData = document.getElementById('wadah-data')

  $.get("/app/cumaData/kadarBentuk", {},
    function (data, textStatus, jqXHR) {
      data.bentuk.forEach(element => {
        let opt = document.createElement('option')
        opt.value = element.id
        opt.textContent = element.bentuk

        beliBentuk.append(opt)
      });

      data.kadar.forEach(element => {
        let opt = document.createElement('option')
        opt.value = element.id
        opt.textContent = element.nama

        beliKadar.append(opt)
      });
    },
    "json"
  );

  beliBentuk.addEventListener('change', (e) => {
    if (beliBentuk.value && beliBentuk.value != 'kosong') {
      $.get("/app/cumaData/modelByBentuk", { bentukId: beliBentuk.value },
        function (data, textStatus, jqXHR) {
          global.removeElementsByClass('opt-model')
          let opt = document.createElement('option')
          opt.classList.add('opt-model')
          opt.value = 'kosong'
          opt.textContent = 'Model untuk ' + beliBentuk.options[beliBentuk.selectedIndex].textContent
          beliModel.append(opt)

          if (data.model.length > 0) {
            data.model.forEach(element => {
              let opt = document.createElement('option')
              opt.classList.add('opt-model')
              opt.value = element.id
              opt.textContent = element.nama

              beliModel.append(opt)
            });
          }

        },
        "json"
      );
    }
    wadahData.textContent = ''
  })

  let penjelasPotongan = document.getElementById('penjelasPotongan')
  let beliPotongan = document.getElementById('beliPotongan')
  let beliHargaNota = document.getElementById('beliHargaNota')
  let beliTotalPotongan = document.getElementById('beliTotalPotongan')
  let beliBeratNota = document.getElementById('beliBeratNota')

  beliKadar.addEventListener('change', (e) => {
    beliTotalPotongan.value = 0
    beliPotongan.value = 0

    if (beliKadar.options[beliKadar.selectedIndex].text == 'Tua') {
      penjelasPotongan.textContent = '% dari harga jual'
      beliPotongan.max = 99
    } else {
      penjelasPotongan.textContent = 'per gram'
      beliPotongan.max = undefined
    }
  })

  beliPotongan.addEventListener('focusout', (e) => {
    if (beliKadar.options[beliKadar.selectedIndex].text == 'Tua') {
      beliTotalPotongan.value = beliHargaNota.value * (beliPotongan.value) / 100
    } else {
      beliTotalPotongan.value = beliBeratNota.value * beliPotongan.value
    }
  })

  // ============================================ Cek Harga ======================================================
  let cekHarga = document.getElementById('cekHarga')
  let formPembelian = document.getElementById('formPembelian')

  let kadarRunPertama = true
  let bentukRunPertama = true
  let modelRunPertama = true
  cekHarga.addEventListener('click', (e) => {
    if (!formPembelian.reportValidity()) return

    let errorMsg = document.createElement('p')
    errorMsg.classList.add('text-error', 'pesanerror')

    if (beliKadar.value === '' || beliKadar.value === 'kosong') {
      beliKadar.classList.add('ring', 'ring-error')
      errorMsg.textContent = 'Pilih salah satu kadar!'
      if (document.getElementsByClassName('pesanerror').length == 0) beliKadar.after(errorMsg)
      beliKadar.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest"
      });

      if(kadarRunPertama){
        kadarRunPertama = false
        beliKadar.addEventListener('change', function () {
          if (beliKadar.value && beliKadar.value !== 'kosong') {
              beliKadar.classList.remove('ring', 'ring-error')
              global.removeElementsByClass('pesanerror')
          }
        })
      }
      return
    }

    if (beliBentuk.value === '' || beliBentuk.value === 'kosong') {
      beliBentuk.classList.add('ring', 'ring-error')
      errorMsg.textContent = 'Pilih salah satu bentuk!'
      if (document.getElementsByClassName('pesanerror').length == 0) beliBentuk.after(errorMsg)
      beliBentuk.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest"
      });

      if(bentukRunPertama){
        bentukRunPertama = false
        beliBentuk.addEventListener('change', function () {
          if (beliBentuk.value && beliBentuk.value !== 'kosong') {
              beliBentuk.classList.remove('ring', 'ring-error')
              global.removeElementsByClass('pesanerror')
          }
        })
      }
      return
    }

    if (beliModel.value === '' || beliModel.value === 'kosong') {
      beliModel.classList.add('ring', 'ring-error')
      errorMsg.textContent = 'Pilih salah satu model!'
      if (document.getElementsByClassName('pesanerror').length == 0) beliModel.after(errorMsg)
      beliModel.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest"
      });

      if(modelRunPertama){
        modelRunPertama = false
        beliModel.addEventListener('change', function () {
          if (beliModel.value && beliModel.value !== 'kosong') {
              beliModel.classList.remove('ring', 'ring-error')
              global.removeElementsByClass('pesanerror')
          }
        })
      }
      return
    }



    $.ajaxSetup({
      headers: {
        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
      }
    });

    $.post("/app/test/dump", $('form#formPembelian').serialize(),
      function (data, textStatus, jqXHR) {
        console.log(data);
      },
      "json"
    );
  })


  // ============================================ Kerusakan =======================================================
  $('button#tambah-kerusakan').on('click', function () {
    if ($('select#beliBentuk :selected').val() && $('select#beliBentuk :selected').val() != 'kosong') {
      Rusak.tambahKerusakan(beliBentuk.value)
    } else {
      var scrollKe = document.getElementById("beliBentuk");
      scrollKe.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest"
      });
      $('select#beliBentuk').addClass('ring ring-error').on('change', function () {
        if ($('select#beliBentuk :selected').val() && $('select#beliBentuk :selected').val() != 'kosong') {
          $('select#beliBentuk').removeClass('ring ring-error')
        }
      })
    }

  });

  let tataMenuRusak = function () {
    TOTALRUSAK = 0
    let menuRusak = document.getElementById('sidemenu-kerusakan')
    while (menuRusak.firstChild) {
      menuRusak.removeChild(menuRusak.firstChild);
    }

    const listRusak = document.getElementsByName('idKerusakan[]')
    for (let [index] of listRusak.entries()) {
      let li = document.createElement('li')
      li.classList.add('flex')
      li.classList.add('text-error')

      let span = document.createElement('span')
      span.classList.add('flex-1')
      span.innerHTML = document.getElementsByClassName('teksKerusakan')[index].innerText
      li.appendChild(span)

      let spanValue = document.createElement('span')
      spanValue.classList.add('flex-none')
      let hitung = numberOnlyParser(document.getElementsByName('jumlahKerusakan[]')[index].value) * numberOnlyParser(document.getElementsByName('ongkosKerusakan[]')[index].value) * -1
      spanValue.innerHTML = rupiahParser(hitung)
      li.appendChild(spanValue)

      menuRusak.appendChild(li)
      TOTALRUSAK += hitung
    }

    // ntar ganti ngambil dari input. yang inputnya auto generated dari harga nota dbagi berat
    let hargaPerGram = 500000
    // ada toleransi ignore susut kalo kurang dari 200 mili / 0.2 gram
    let selisih = document.getElementById('beliBeratNota').value - document.getElementById('beliBeratSebenarnya').value
    if (selisih >= 0.2) {
      let li = document.createElement('li')
      li.classList.add('flex')
      li.classList.add('text-error')

      let span = document.createElement('span')
      span.classList.add('flex-1')
      span.innerHTML = 'Susut berat (' + selisih + 'g):'
      li.appendChild(span)

      let spanValue = document.createElement('span')
      spanValue.classList.add('flex-none')
      let hitung = selisih * hargaPerGram * -1
      spanValue.innerHTML = rupiahParser(hitung)
      li.appendChild(spanValue)

      menuRusak.appendChild(li)
      TOTALRUSAK += hitung
    }

    // buat itungan, mending disimpen ke variabel ato buat input disabled biar gampang manggilnya?
    // kalo ke variabel bisa make array, ato malah dijumlahin langsung
    document.getElementById('sidemenu-totalkerusakan').innerHTML = rupiahParser(TOTALRUSAK)
  }

  let tataMenuPotongan = function () {

    // ntar ganti jadi ngambil dari input
    let potonganperg = 10000
    // ini juga ganti
    let kadar = 'muda'

    if (kadar === 'tua') {
      // ganti mode itungan persen * harga nota
      // ASLINYA UDAH DIITUNG kalo make qr
    }
  }

  // =============================== dibawah ini observer ===================================================
  if ($('.base-page').data('pagename') == "pembelian-umum") {
    // Select the node that will be observed for mutations
    const targetNode = document.getElementById('wadah-data');
    const targetChange = $('#teks-tabel-kosong');

    // Options for the observer (which mutations to observe)
    const config = {
      attributes: true,
      childList: true,
      subtree: true
    };

    // ntar tambahin cek dom input yang kesedia buat itungan menu samping, sekalian totalannya

    // Callback function to execute when mutations are observed
    const callback = function (mutationsList, observer) {
      for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
          if (targetNode.childElementCount < 1) {
            targetChange.removeClass('hidden').addClass('block')
          } else {
            targetChange.removeClass('block').addClass('hidden')
          }
          tataMenuRusak()
        }
      }
    };

    // Create an observer instance linked to the callback function
    const observer = new MutationObserver(callback);

    // Start observing the target node for configured mutations
    observer.observe(targetNode, config);
  }

})
