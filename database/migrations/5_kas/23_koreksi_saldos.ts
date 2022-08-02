import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class KoreksiSaldos extends BaseSchema {
  protected tableName = 'koreksi_saldos'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('alasan', 100).notNullable()
      table.integer('perubahan_saldo').notNullable()
      table.integer('saldo_akhir').notNullable()
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
