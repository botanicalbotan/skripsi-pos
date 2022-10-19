import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import { KodeProMudaDummyFactories } from 'Database/factories/barang/Kodepro/KodeProMudaDummyFactories'
import { KodeProTanggungDummyFactories } from 'Database/factories/barang/Kodepro/KodeProTanggungDummyFactories'
import { KodeProTuaDummyFactories } from 'Database/factories/barang/Kodepro/KodeProTuaDummyFactories'

export default class KodeproKomplitSeeder extends BaseSeeder {
  public static developmentOnly = true
  public async run () {
    // Write your database queries inside the run method
    await KodeProMudaDummyFactories.createMany(10)
    await KodeProTanggungDummyFactories.createMany(10)
    await KodeProTuaDummyFactories.createMany(10)
  }
}
