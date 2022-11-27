import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class PenyesuaianStoks extends BaseSchema {
  protected tableName = 'penyesuaian_stoks'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('keterangan', 100).notNullable() // kalau ga masalah, auto diisi '-'
      table.integer('kelompok_id').unsigned().references('kelompoks.id').notNullable()
      table.integer('pengguna_id').unsigned().references('penggunas.id').notNullable()
      table.boolean('butuh_cek_ulang').notNullable().defaultTo(false)
      table.integer('stok_tercatat').notNullable()
      table.integer('stok_sebenarnya').notNullable()
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
