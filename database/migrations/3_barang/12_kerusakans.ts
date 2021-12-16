import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Kerusakans extends BaseSchema {
  protected tableName = 'kerusakans'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('bentuk_id').unsigned().references('bentuks.id').notNullable().onDelete('CASCADE')

      table.string('nama', 50).notNullable()
      table.boolean('apakah_bisa_diperbaiki').notNullable()
      table.string('ongkos_deskripsi', 50).notNullable()
      table.integer('ongkos_nominal').notNullable()
      table.dateTime('deleted_at')


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
