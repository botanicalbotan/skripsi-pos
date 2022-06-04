import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Jabatans extends BaseSchema {
  protected tableName = 'jabatans'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.enum('nama', [
        'Karyawan',
        'Kepala Toko',
        'Pemilik'
      ]).notNullable()
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
