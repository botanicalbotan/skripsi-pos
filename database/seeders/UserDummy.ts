import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import { UserFactory } from 'Database/factories/UserDummyFactories'

export default class UserDummySeeder extends BaseSeeder {
  public static developmentOnly = true
  public async run () {
    // angka disamping pengguna itu maksudnya pair relationshipnya. Kalo one to one, harus satu doang
    const newUser = await UserFactory.with('pengguna', 1).createMany(20)
  }
}
