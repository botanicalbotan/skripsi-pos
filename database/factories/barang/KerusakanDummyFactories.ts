import Factory from '@ioc:Adonis/Lucid/Factory'
import Kerusakan from 'App/Models/barang/Kerusakan'

function getRandomInt(max) {
  return Math.floor(Math.random() * max)
}

let bentuk = ['Anting', 'Cincin', 'Gelang', 'Kalung', 'Liontin', 'Tindik', 'Lainnya']
let rusak = [
  'Hilang Sebelah',
  'Hilang Mata',
  'Rosok',
  'Penyok',
  'Penyok Parah',
  'Putus',
  'Putus Parah',
]

export const KerusakanFactory = Factory.define(Kerusakan, ({ faker }) => {
  let fate = getRandomInt(bentuk.length)
  let fate2 = getRandomInt(rusak.length)
  let fate3 = getRandomInt(3) != 0

  let harga = (getRandomInt(20) + 1) * 1000
  faker.locale = 'id_ID'
  return {
    nama:
      'Dummy ' +
      bentuk[fate] +
      ' ' +
      rusak[fate2] +
      ' ' +
      faker.random.alpha().toUpperCase(),
    apakahBisaDiperbaiki: fate3,
    ongkosNominal: fate3 ? harga : 0,
    ongkosDeskripsi: fate3
      ? new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
          minimumFractionDigits: 0,
        })
          .format(harga)
          .toString() + ' per kerusakan'
      : 'Dihitung harga rosok',
    bentukId: fate + 1,
  }
}).build()
