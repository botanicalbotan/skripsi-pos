import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class KelompokPenambahans extends BaseSchema {
  protected tableName = 'kelompok_penambahans'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('penambahan_stok_id').unsigned().references('penambahan_stoks.id').notNullable().onDelete('CASCADE')
      table.integer('kelompok_id').unsigned().references('kelompoks.id').notNullable().onDelete('CASCADE')
      table.unique(['penambahan_stok_id', 'kelompok_id'])
      // table.unique(['penambahan_stok_id', 'kelompok_id', 'apakah_kulakan'], 'field_harus_unik')
      // table.unique(['penambahan_stok_id', 'kelompok_id', 'apakah_kulakan'], {indexName: 'field_harus_unik'})
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