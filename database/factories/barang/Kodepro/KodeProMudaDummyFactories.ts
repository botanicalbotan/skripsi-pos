import Factory from '@ioc:Adonis/Lucid/Factory'
import KodeProduksi from 'App/Models/barang/KodeProduksi'

function getRandomInt(max) {
  return Math.floor(Math.random() * max)
}

const varian = ['muda', 'mud', 'md', 'mu', 'md']

export const KodeProMudaDummyFactories = Factory.define(KodeProduksi, ({ faker }) => {
  let gacha = getRandomInt(varian.length)
  let gachaBuatan = getRandomInt(3) == 0
  let gachaHarga = (getRandomInt(5)*10000) + 100000
  let gachaPotongan = (getRandomInt(5)*1000) + 5000

  faker.locale = 'id_ID'
  return {
    kode: varian[gacha] + getRandomInt(99),
    apakahBuatanTangan: gachaBuatan,
    asalProduksi: faker.company.companyName(),
    kadarId: 2,
    hargaPerGramLama: gachaHarga,
    hargaPerGramBaru: gachaHarga + 50000,
    potonganLama: gachaPotongan,
    potonganBaru: gachaPotongan + 2000,
    persentaseMalUripan: getRandomInt(20) + 1,
    ongkosMalRosokPerGram: (getRandomInt(20)*1000),
    penggunaId: 1,
    deskripsi: faker.random.words(30)
  }
}).build()
