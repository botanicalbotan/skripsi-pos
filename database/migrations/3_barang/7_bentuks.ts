import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Bentuks extends BaseSchema {
  protected tableName = 'bentuks'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('kode', 5).notNullable()
      table.string('bentuk', 10).notNullable()
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
