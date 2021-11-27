import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class RekapRestoks extends BaseSchema {
  protected tableName = 'rekap_restoks'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('catatan')
      table.integer('pengguna_id').unsigned().references('penggunas.id').notNullable().onDelete('CASCADE')

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
