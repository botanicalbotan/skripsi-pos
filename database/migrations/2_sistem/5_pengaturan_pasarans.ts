import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class PengaturanPasarans extends BaseSchema {
  protected tableName = 'pengaturan_pasarans'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('pengaturan_id').unsigned().references('pengaturans.id').notNullable().onDelete('CASCADE')
      table.integer('pasaran_id').unsigned().references('pasarans.id').notNullable().onDelete('CASCADE')
      table.unique(['pengaturan_id', 'pasaran_id'])

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
