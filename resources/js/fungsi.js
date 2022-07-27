/** 
 * kalau dah bagus, ntar semua fungsi taro sini.
 * Tinggal panggil kalo butuh
 * JANGAN DIJADIIN GLOBAL
 * 
 */

export function capsFirstWord(text) {
  if (!isNaN(text.charAt(0))) {
    return text
  }
  return text.slice(0, 1).toUpperCase() + text.slice(1)
}

export function capsSentence(text) {
  const pure = text.split(' ')
  let newText = ''
  for (let i = 0; i < pure.length; i++) {
    newText += capsFirstWord(pure[i])
    if (i !== pure.length - 1) {
      newText += ' '
    }
  }
  return newText
}


export function rupiahParser(number) {
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

export function numberOnlyParser(stringnumber) {
  let final = stringnumber.replace(/\D/gi, '')
  return parseInt(final)
}

export function removeElementsByClass(className) {
  const elements = document.getElementsByClassName(className);
  while (elements.length > 0) {
    elements[0].parentNode.removeChild(elements[0]);
  }
}

export function belakangKoma(number) {
  return number / Math.pow(10, number.toString().replace(/\D/gi, '').length)
}

export function isEmptyObject(obj) {
  return (obj && Object.keys(obj).length === 0 && Object.getPrototypeOf(obj) === Object.prototype)
}

export const SwalCustomColor = {
  icon: {
    error: '#f27474'
  },
  button: {
    confirm: '#4b6bfb',
    deny: '#Dc3741',
    cancel: '#6E7881'
  }
}

