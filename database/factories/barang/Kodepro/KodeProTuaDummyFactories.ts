import Factory from '@ioc:Adonis/Lucid/Factory'
import KodeProduksi from 'App/Models/barang/KodeProduksi'

function getRandomInt(max) {
  return Math.floor(Math.random() * max)
}

const varian = ['tua', 'tu', 'ua', 'tuwa', 'towa']

export const KodeProTuaDummyFactories = Factory.define(KodeProduksi, ({ faker }) => {
  let gacha = getRandomInt(varian.length)
  let gachaBuatan = getRandomInt(3) == 0
  let gachaHarga = (getRandomInt(10)*15000) + 100000
  let gachaPotongan = getRandomInt(20) + 5

  faker.locale = 'id_ID'
  return {
    kode: varian[gacha] + getRandomInt(99),
    apakahBuatanTangan: gachaBuatan,
    asalProduksi: faker.company.companyName(),
    kadarId: 3,
    hargaPerGramLama: gachaHarga,
    hargaPerGramBaru: gachaHarga + 150000,
    potonganLama: gachaPotongan,
    potonganBaru: gachaPotongan + 3,
    persentaseMalUripan: getRandomInt(70) + 20,
    ongkosMalRosokPerGram: (getRandomInt(16)*2000),
    penggunaId: 1,
    deskripsi: faker.random.words(30)
  }
}).build()
