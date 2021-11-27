import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Bentuks extends BaseSchema {
  protected tableName = 'bentuks'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('bentuk', 10).notNullable()

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
       table.timestamps(true, true)
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
