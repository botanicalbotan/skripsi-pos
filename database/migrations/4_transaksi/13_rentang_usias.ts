import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class RentangUsias extends BaseSchema {
  protected tableName = 'rentang_usias'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('golongan', 20).notNullable()
      table.string('deskripsi', 30)

      // INI UDAH HAMPIR FIX BAKAL DIHAPUS

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      //  table.timestamps(true, true)
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
