import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Kadars extends BaseSchema {
  protected tableName = 'kadars'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('nama', 10).notNullable()
      table.string('deskripsi', 100).notNullable()
      table.integer('harga_per_gram_normal').notNullable()
      table.integer('harga_per_gram_baru').notNullable()
      table.integer('potongan_normal').notNullable()
      table.integer('potongan_baru').notNullable()
      // table.integer('potongan_tukartambah').notNullable()
      table.boolean('apakah_potongan_persen').notNullable().defaultTo(0)

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
