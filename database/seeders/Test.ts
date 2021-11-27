import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import { TestFactory } from 'Database/factories/TestFactories'

export default class TestSeeder extends BaseSeeder {
  public static developmentOnly = true
  
  public async run () {
    // Write your database queries inside the run method
    await TestFactory.createMany(100)
  }
}
