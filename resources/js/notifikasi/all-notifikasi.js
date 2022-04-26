$(function () {
  const BASEURL = window.location.pathname
  const qsParam = new URLSearchParams(window.location.search)
  const btSemua = document.getElementById('btSemua')
  const btBelumDibaca = document.getElementById('btBelumDibaca')

  let fs = 0
  if (qsParam.has('fs')) {
    if(['0', '1'].includes(qsParam.get('fs'))){
      fs = qsParam.get('fs')
    }
  }

  let updateKeyQs = function(key, value){
    if (qsParam.has(key)) {
      qsParam.set(key, value)
    } else {
      qsParam.append(key, value)
    }
  }

  function persiapanKirim() {
    if (qsParam.get('cari') === null || pencarian.value === '') {
      qsParam.delete('cari')
    }

    updateKeyQs('fs', fs)

    qsParam.delete('page')
    window.location = BASEURL + '?' + qsParam.toString()
  }

  btSemua.addEventListener('click', () => {
    fs = 0
    persiapanKirim()
  })

  btBelumDibaca.addEventListener('click', () => {
    fs = 1
    persiapanKirim()
  })
})
