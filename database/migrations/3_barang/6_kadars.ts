import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Kadars extends BaseSchema {
  protected tableName = 'kadars'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('nama', 10).notNullable()
      table.string('deskripsi', 100).notNullable()
      table.boolean('apakah_potongan_persen').notNullable().defaultTo(0)
      table.integer('toleransi_potongan_tukar_tambah').notNullable().defaultTo(0)
      table.integer('harga_nota').notNullable()
      // ntar sini kasi warna ato template nota buat transaksi
      table.string('warna_nota', 10).notNullable()

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
