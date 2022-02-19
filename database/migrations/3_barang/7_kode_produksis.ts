import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class KodeProduksis extends BaseSchema {
  protected tableName = 'kode_produksis'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('kode', 10).notNullable().unique()
      table.string('deskripsi', 100)
      table.boolean('apakah_buatan_tangan').notNullable().defaultTo(false)
      table.string('asal_produksi', 50).notNullable()
      table.dateTime('deleted_at').nullable()
      table.integer('kadar_id').unsigned().references('kadars.id').notNullable().onDelete('CASCADE')

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
