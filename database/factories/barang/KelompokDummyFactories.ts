import Factory from '@ioc:Adonis/Lucid/Factory'
import Kelompok from 'App/Models/barang/Kelompok'
import { DateTime } from 'luxon'

function getRandomInt(max) {
  return Math.floor(Math.random() * max)
}

function generateKodeKelompok(kadar: string, bentuk: string){
    let kodebentuk = {
      Cincin: 'CC',
      Kalung: 'KL',
      Anting: 'AT',
      Liontin: 'LT',
      Tindik: 'TD',
      Gelang: 'GL'
    }

    // varian ini bisa dipake buat yang butuh random2
    // let kodekadar = {
    //   Muda: {nomer: 1, huruf: ['M', 'MU', 'YO', 'NO']},
    //   Tanggung: {nomer: 2, huruf: ['TA', 'TG', 'MI', 'CE']},
    //   Tua: {nomer:3, huruf: ['TU', 'NE', 'GR', 'OL']}
    // }

    let kodekadar = {
      Muda: {nomer: 1, huruf: 'MD'},
      Tanggung: {nomer: 2, huruf: 'TG'},
      Tua: {nomer:3, huruf: 'TU'}
    }

    return kodebentuk[bentuk] + kodekadar[kadar].nomer + kodekadar[kadar].huruf + DateTime.local().toMillis()
  }

let bentuk = ['Anting', 'Cincin', 'Gelang', 'Kalung', 'Liontin', 'Tindik', 'Lainnya']
let kadar = ['Muda', 'Tanggung', 'Tua']

export const KelompokFactory = Factory.define(Kelompok, ({ faker }) => {
  let gacha = getRandomInt(bentuk.length)
  let gacha2 = getRandomInt(kadar.length)
  faker.locale = 'id_ID'
  return {
    nama:
      'Kelompok Dummy ' +
      bentuk[gacha] +
      ' ' +
      faker.random.word() +
      ' ' +
      faker.random.alpha().toUpperCase(),
    kodeKelompok: generateKodeKelompok(kadar[gacha2], bentuk[gacha]),
    beratKelompok: getRandomInt(15),
    kadarId: gacha2 + 1,
    bentukId: gacha + 1,
    stokMinimal: getRandomInt(11),
    ingatkanStokMenipis: true,
    stok: getRandomInt(20),
    penggunaId: 1
  }
}).build()
