// Selalu panggil file satuan gini abis manggil app.js biar ngga redundant

import Swal from "sweetalert2";

// Sekarang dipanggil semua gaapa, ntar dipilih2 yang penting aja
import {
  Chart,
  registerables
} from 'chart.js';
Chart.register(...registerables);


function numberWithDot(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// doc ready
$(function () {
  const animateValue = function (obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      obj.innerHTML = numberWithDot(Math.floor(progress * (end - start) + start));
      // obj.innerHTML = Math.floor(progress * (end - start) + start);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }

  let nominalPenjualan = document.getElementById('nominalPenjualan')
  animateValue(nominalPenjualan, 0, nominalPenjualan.innerHTML, 2000)
  let nominalPembelian = document.getElementById('nominalPembelian')
  animateValue(nominalPembelian, 0, nominalPembelian.innerHTML, 2000)


  const randomArrayGenerator = function(length){
    let temp = []
    for(let i=0; i<length; i++){
      temp.push(Math.random() * 100000001)
    }
    return temp
  }


const labels = ['13/10','14/10','15/10','16/10','17/10','18/10','19/10'];
const data = {
  labels: labels,
  datasets: [
    {
      label: 'Penjualan',
      data: randomArrayGenerator(7),
      borderColor: 'rgb(255, 99, 132)',
    },
    {
      label: 'Pembelian',
      data: randomArrayGenerator(7),
      borderColor: 'rgb(54, 162, 235)',
    }
  ]
};

  const chartConfig = {
    type: 'line',
    data: data,
    options: {
      responsive: true,
      maintainAspectRatio:false,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: false,
          text: 'Penjualan dan Pembelian seminggu terakhir'
        }
      }
    },
  };

  var ctx = document.getElementById('chartPJTT');
  var wadahChart = new Chart(ctx, chartConfig)
});
