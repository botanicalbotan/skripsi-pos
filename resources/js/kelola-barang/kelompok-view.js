import {
    Chart,
    registerables
} from 'chart.js';
import Swal from 'sweetalert2';
Chart.register(...registerables);

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

    $.get("/app/barang/cumaData/peringkatKelompok/" + ($('.base-page').data('idk') || 'kosong'), {},
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

    function loadStatistik(mode = 0) {
        $.get("/app/barang/cumaData/sebaranData/" + ($('.base-page').data('idk') || 'kosong'), { mode: mode },
            function (data, textStatus, jqXHR) {
                let labels = []
                let datas = []

                data.forEach(element => {
                    labels.push(element.label)

                    if (element.data) datas.push(element.data.jumlah)
                    else datas.push(0)
                });

                const input = {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Penjualan',
                            data: datas,
                            borderColor: 'rgb(255, 99, 132)',
                        },
                    ]
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

                if(wadahChart) wadahChart.destroy()

                wadahChart = new Chart(wadahSebaranData, chartConfig)
                subjudulStatistik.innerText = 'Statistik Transaksi ' + ((mode == 1) ? ' Bulan Ini' : (mode == 2) ? ' Tahun Ini' : ' Minggu Ini')

                wadahStatistik.classList.remove('hidden')
                wadahLoadingStatistik.classList.add('hidden')
            },
            "json"
        )
    }


    document.getElementById('aturStatistik').addEventListener('click', (e) => {
        Swal.fire({
            title: 'Atur jangkauan statistik',
            html: printAturStatistikHTML(),
            confirmButtonText: 'Terapkan',
            showCancelButton: true,
            cancelButtonText: 'Batal',
            preConfirm: () => {
                return document.getElementById('swal-range').value
            }
        }).then(hasil => {
            if(hasil.isConfirmed){
                loadStatistik(hasil.value)
            }
        })
    })


})

let printAturStatistikHTML = function () {

    const html = `
            <div class="w-full px-6 space-y-6 flex flex-col text-left">

                <div class="form-control">
                    <select id="swal-range" class="select select-bordered w-full max-w-md swal">
                    <option value="0">Penjualan minggu ini</option> 
                    <option value="1">Penjualan bulan ini</option> 
                    <option value="2">Penjualan tahun ini</option>
                    </select>
                </div>
 
            </div>
        `
    return html
}