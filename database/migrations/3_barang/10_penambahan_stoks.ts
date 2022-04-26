import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class PenambahanStoks extends BaseSchema {
  protected tableName = 'penambahan_stoks'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.boolean('apakah_kulakan').notNullable().defaultTo(false)
      table.string('asal_stok', 100).notNullable()
      table.string('catatan')
      table.integer('pengguna_id').unsigned().references('penggunas.id').notNullable()

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
