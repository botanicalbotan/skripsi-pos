import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class KoreksiStoks extends BaseSchema {
  protected tableName = 'koreksi_stoks'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('alasan', 100).notNullable()
      table.integer('kelompok_id').unsigned().references('kelompoks.id').notNullable()
      table.integer('pengguna_id').unsigned().references('penggunas.id').notNullable()
      table.integer('perubahan_stok').notNullable()
      table.integer('stok_akhir').notNullable()
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
