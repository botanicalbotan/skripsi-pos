import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Kelompoks extends BaseSchema {
  protected tableName = 'kelompoks'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('nama', 50).notNullable()
      table.string('kode_kelompok', 50).notNullable().unique() // ntar diganti jadi kode unik
      table.integer('berat_kelompok').notNullable()
      table.integer('kadar_id').unsigned().references('kadars.id').notNullable()
      table.integer('bentuk_id').unsigned().references('bentuks.id').notNullable()
      table.integer('stok_minimal').notNullable().defaultTo(0)
      table.boolean('ingatkan_stok_menipis').notNullable().defaultTo(true)
      table.integer('stok').notNullable().defaultTo(0)
      table.dateTime('deleted_at').nullable()

      /**Ini ntar di uncomment kalo dah siap modelnya
       *
       * table.integer('pengguna_id').unsigned().references('penggunas.id').notNullable()
       */

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
