import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Models extends BaseSchema {
  protected tableName = 'models'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('bentuk_id').unsigned().references('bentuks.id').notNullable()
      table.string('nama', 50).notNullable()
      table.string('deskripsi', 100)
      table.boolean('apakah_placeholder').notNullable().defaultTo(false)
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
