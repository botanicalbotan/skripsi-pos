// icon + kode dari db
let pathsD = Object.create(null)

// money & sementara jadi default
pathsD['pg'] = "M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
// keranjang belanja
pathsD['tr'] = "M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z"
// gear / pengaturan
pathsD['atur'] = "M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"

pathsD['gd'] = "M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1zm-5 8.274l-.818 2.552c.25.112.526.174.818.174.292 0 .569-.062.818-.174L5 10.274zm10 0l-.818 2.552c.25.112.526.174.818.174.292 0 .569-.062.818-.174L15 10.274z"


let cekWaktu = function (minute) {
  let menitDiff = (isNaN(minute)) ? 0 : minute
  let teksDiff = ''

  if (menitDiff > 60) {
    let jamDiff = Math.floor(menitDiff / 60)

    if (jamDiff > 24) {
      let hariDiff = Math.floor(jamDiff / 24)

      if (hariDiff > 30) {
        let bulanDiff = Math.floor(hariDiff / 30)

        teksDiff = bulanDiff + ' bulan'
      } else {
        teksDiff = hariDiff + ' hari'
      }
    } else {
      teksDiff = jamDiff + ' jam'
    }
  } else {
    teksDiff = menitDiff + ' menit'
  }

  return teksDiff
}

// ============================================== Mulai Append Notif ====================================================================

/**
 * @param {string} kode Kode notifikasi dari DB
 * @param {string} topik Topik notifikasi dari DB
 * @param {string} judul Judul notifikasi yang mau ditampilin
 * @param {string} penjelas Penjelas notifikasi yang mau ditampilin
 * @param {number} jarakWaktu Perbedaan menit waktu notif dibuat sama skarang
 * @param {string} url URL lokasi kalo notif di klik
 * @param {boolean} belumDilihat checklist notif udah diliat apa belom
 */
export function buatNotif(kode, topik, judul, penjelas, jarakWaktu, url, belumDilihat = true) {
  let wadah = document.createElement('li')
  wadah.classList.add('border-b', 'last:border-0')

  let link = document.createElement('a')
  link.href = url
  link.classList.add('flex', 'hover:bg-gray-100', 'space-x-2', '-mx-2')


  // konten ========================================================================
  const dKonten = document.createElement('div')
  dKonten.classList.add('flex-1')

  const d1 = document.createElement('div')
  d1.classList.add('inline-flex', 'text-secondary', 'items-end', 'space-x-2')

  // svg dan wadahnya
  const wadahSvg = document.createElement('span')
  wadahSvg.classList.add('text-primary')
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
  svg.classList.add('h-5', 'w-5', 'mr-2')
  svg.setAttribute('viewBox', '0 0 20 20')
  svg.setAttribute('fill', 'currentColor')
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path")
  path.setAttribute('fill-rule', 'evenodd')
  path.setAttribute('clip-rule', 'evenodd')
  path.setAttribute('d', ((pathsD[kode])? pathsD[kode]: pathsD['pg']))
  svg.append(path)
  wadahSvg.append(svg)

  const pemisah = document.createElement('div')
  pemisah.classList.add('font-bold', 'text-lg')
  pemisah.textContent = '.'

  const waktu = document.createElement('span')
  waktu.textContent = cekWaktu(jarakWaktu)

  d1.append(wadahSvg, topik, pemisah, waktu)

  const d2 = document.createElement('div')
  d2.classList.add('block', 'font-semibold')
  d2.textContent = judul

  const d3 = document.createElement('div')
  d3.classList.add('block', 'text-secondary')
  d3.textContent = penjelas

  dKonten.append(d1, d2, d3)

  // indikator =====================================================================
  const dIndi = document.createElement('div')
  dIndi.classList.add('flex-none')

  if(belumDilihat){
    const bola = document.createElement('div')
    bola.classList.add('w-2', 'h-2', 'rounded-full', 'bg-primary')
    dIndi.append(bola)
  }

  // append terakhir
  link.append(dKonten, dIndi)
  wadah.append(link)


  return wadah
}
