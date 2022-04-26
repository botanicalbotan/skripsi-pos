import Factory from '@ioc:Adonis/Lucid/Factory'
import Model from 'App/Models/barang/Model'

function getRandomInt(max) {
  return Math.floor(Math.random() * max)
}

let bentuk = ['Anting', 'Cincin', 'Gelang', 'Kalung', 'Liontin', 'Tindik', 'Lainnya']

export const ModelFactory = Factory.define(Model, ({ faker }) => {
  let fate = getRandomInt(bentuk.length)
  faker.locale = 'id_ID'
  return {
    nama:
      'Dummy ' +
      bentuk[fate] +
      ' ' +
      faker.random.word() +
      ' ' +
      faker.random.alpha().toUpperCase(),
    apakahPlaceholder: false,
    deskripsi: 'Model Dummy',
    bentukId: fate + 1,
    penggunaId: 1
  }
}).build()
