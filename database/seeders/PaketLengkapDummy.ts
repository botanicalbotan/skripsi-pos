import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import { ModelFactory } from 'Database/factories/barang/ModelDummyFactories'
import { KerusakanFactory } from 'Database/factories/barang/KerusakanDummyFactories'
import { KelompokFactory } from 'Database/factories/barang/KelompokDummyFactories'

export default class UserDummySeeder extends BaseSeeder {
  public static developmentOnly = true
  public async run () {
    const dummyModel = await ModelFactory.createMany(20)
    const dummyKerusakan = await KerusakanFactory.createMany(20)
    const dummyKelompok = await KelompokFactory.createMany(20)

    // aslinya ada kelompok sama transaksi juga, tp ntar dulu
  }
}
