import '../css/app.css'

const $ = require('jquery')

// Ini Konfigurasi Landing Page

global.landingSetup = function () {
  const width = (window.innerWidth > 0) ? window.innerWidth : screen.width;
  if (width > 640) {
    return {
      activeTab: 0,
      tabs: [
        "Pilihan Variatif",
        "Transaksi Fleksibel",
        "Sopan dan Ramah",
        "Potongan yang rendah"
      ]
    };
  }
  return {
    activeTab: 0,
    tabs: [
      "Pilihan",
      "Fleksibel",
      "Ramah",
      "Potongan"
    ]
  };
};

global.isSmallScreen = function () {
  const width = (window.innerWidth > 0) ? window.innerWidth : screen.width;
  if (width > 640) {
    return false
  }
  return true
}

global.isLargeScreen = function () {
  const width = (window.innerWidth > 0) ? window.innerWidth : screen.width;
  if (width >= 1024) {
    return true
  }
  return false
}

$(function () {
  const buttonRight = document.getElementById('landingSlideKanan');
  const buttonLeft = document.getElementById('landingSlideKiri');
  const containerBarang = document.getElementById('container-barang');
  const anakContainerBarang = document.getElementById('anak-container-barang');
  let baseScroll = 0;

  let pushLeft = function () {
    const push = anakContainerBarang.firstElementChild.offsetWidth + 32;
    baseScroll = (baseScroll - 1 < 0) ? anakContainerBarang.childElementCount-1 : --baseScroll
    containerBarang.scrollTo({
      left: (baseScroll * push),
      behavior: 'smooth'
    })
  }

  let pushRight = function (){
    const push = anakContainerBarang.firstElementChild.offsetWidth + 32;
    baseScroll = (baseScroll + 1 >= anakContainerBarang.childElementCount) ? 0 : ++baseScroll
    // let n = (Math.ceil(containerBarang.scrollLeft/push) === 0)? 1 : Math.ceil(containerBarang.scrollLeft/push);
    // let centerChild = containerBarang.clientWidth - anakContainerBarang.firstElementChild.offsetWidth
    containerBarang.scrollTo({
      left: (baseScroll * push),
      behavior: 'smooth'
    })
  }

  const autoScroll = window.setInterval(pushRight, 5000)

  buttonRight.onclick = function () {
    pushRight()
  };

  buttonLeft.onclick = function () {
    pushLeft()
  };

  $('#main').on('scroll', function (event) {
    var factor = this.scrollLeft / (this.scrollWidth - $(this).width());
    if (factor < 0.2) {
      var move = $(this.lastChild);
      move.remove();
      $(this).prepend(move);
      this.scrollLeft += move.width();
    } else if (factor > 0.8) {
      var move = $(this.firstChild);
      move.remove();
      $(this).append(move);
      this.scrollLeft -= move.width();
    }
  });

  $('#main').contents().filter(function () {
    return this.nodeType == 3; //Node.TEXT_NODE
  }).remove();

  $('#scrollTopBtn').on('click', function () {
    document.documentElement.scrollTo({
      top: 0,
      behavior: "smooth"
    })
  });

  // When the user scrolls down 20px from the top of the document, show the button
  window.onscroll = function () {
    scrollFunction()
  };

  function scrollFunction() {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
      $('#scrollTopBtn').removeClass('invisible translate-y-8').addClass('visible translate-y-0')
    } else {
      $('#scrollTopBtn').removeClass('visible translate-y-0').addClass('invisible translate-y-8');
    }
  }
});
