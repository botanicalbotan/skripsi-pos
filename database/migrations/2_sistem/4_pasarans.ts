import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Pasarans extends BaseSchema {
  protected tableName = 'pasarans'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('hari', 10).notNullable()
      table.date('referensi_tanggal').notNullable()

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
