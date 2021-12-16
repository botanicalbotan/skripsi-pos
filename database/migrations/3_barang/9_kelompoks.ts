import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Kelompoks extends BaseSchema {
  protected tableName = 'kelompoks'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('nama', 50).notNullable()
      table.string('kode_perhiasan', 50) // masih belum fix
      table.integer('berat_kelompok').notNullable()
      table.integer('kadar_id').unsigned().references('kadars.id').notNullable().onDelete('CASCADE')
      table.integer('bentuk_id').unsigned().references('bentuks.id').notNullable().onDelete('CASCADE')
      table.integer('stok_minimal').notNullable().defaultTo(0)
      table.boolean('ingatkan_stok_menipis').notNullable().defaultTo(true)
      table.integer('stok').notNullable().defaultTo(0)
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
