import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class KelompokRekaps extends BaseSchema {
  protected tableName = 'kelompok_rekaps'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('rekap_restok_id').unsigned().references('rekap_restoks.id').notNullable().onDelete('CASCADE')
      table.integer('kelompok_id').unsigned().references('kelompoks.id').notNullable().onDelete('CASCADE')
      table.unique(['rekap_restok_id', 'kelompok_id'])
      table.integer('perubahan_stok').notNullable()

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
