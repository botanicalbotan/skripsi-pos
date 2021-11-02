import '../css/app.css'

// kalo ntar ternyata datetimenya simpel, gaperlu make moment.js
// tp bisa juga dipake di server pengganti carbon
global.moment = require('moment')
import 'moment/locale/id'
moment.locale('id')

const pasaran = require('./pasaran')
global.pasaranBerformat = function(){
    return capsFirstWord(pasaran.pasaranHariIni())
}

global.$ = require('jquery');
// global.Swal = require('sweetalert2');

$('div.drawer-side ul li.drawable').on('click', function () {
    const svg = $(this).find('svg.doorknob');
    if(svg.hasClass('rotate-180')){
        svg.removeClass('rotate-180').addClass('rotate-0')
    } else{
        svg.removeClass('rotate-0').addClass('rotate-180')
    }
});

global.capsFirstWord = function (text){
    if(!isNaN(text.charAt(0))){
        return text
    }
    return text.slice(0, 1).toUpperCase() + text.slice(1)
}

global.rupiahParser = function(number){
    if(typeof number == 'number'){
      return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0}).format(number)
    }
  }

global.numberOnlyParser = function(stringnumber){
    let final = stringnumber.replace(/\D/gi, '')
    return parseInt(final)
}