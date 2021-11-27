import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Kas extends BaseSchema {
  protected tableName = 'kas'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.boolean('apakah_kas_keluar').notNullable()
      table.integer('nominal').notNullable()
      table.string('perihal', 50).notNullable()
      table.integer('rekap_harian_id').unsigned().references('rekap_harians.id').notNullable().onDelete('CASCADE')
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
