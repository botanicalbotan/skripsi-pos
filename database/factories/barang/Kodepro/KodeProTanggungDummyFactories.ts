import Factory from '@ioc:Adonis/Lucid/Factory'
import KodeProduksi from 'App/Models/barang/KodeProduksi'

function getRandomInt(max) {
  return Math.floor(Math.random() * max)
}

const varian = ['tanggung', 'tgg', 'tag', 'tg', 'toga', 'ta']

export const KodeProTanggungDummyFactories = Factory.define(KodeProduksi, ({ faker }) => {
  let gacha = getRandomInt(varian.length)
  let gachaBuatan = getRandomInt(3) == 0
  let gachaHarga = (getRandomInt(10)*10000) + 100000
  let gachaPotongan = (getRandomInt(10)*1000) + 5000

  faker.locale = 'id_ID'
  return {
    kode: varian[gacha] + getRandomInt(899),
    apakahBuatanTangan: gachaBuatan,
    asalProduksi: faker.company.companyName(),
    kadarId: 1,
    hargaPerGramLama: gachaHarga,
    hargaPerGramBaru: gachaHarga + 50000,
    potonganLama: gachaPotongan,
    potonganBaru: gachaPotongan + 2000,
    // persentaseMalUripan: getRandomInt(50) + 1,
    // persentaseMalRosok: getRandomInt(10) + 1,
    // ongkosBeliTanpaNota: (getRandomInt(20)*1000),
    // ongkosMalRosokPerGram: (getRandomInt(16)*1000),
    penggunaId: 1,
    deskripsi: faker.random.words(30)
  }
}).build()
