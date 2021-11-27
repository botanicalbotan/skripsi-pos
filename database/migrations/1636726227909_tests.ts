import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Tests extends BaseSchema {
  protected tableName = 'tests'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('nama')
      table.string('gender', 1),
      table.date('tanggallahir'),
      table.string('phone'),
      table.string('pekerjaan'),
      table.string('lamakerja'),
      table.boolean('menikah')

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
