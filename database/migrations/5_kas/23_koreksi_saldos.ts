import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class KoreksiSaldos extends BaseSchema {
  protected tableName = 'koreksi_saldos'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('saldo_awal').notNullable()
      table.integer('saldo_akhir').notNullable()
      table.integer('selisih_saldo').notNullable()
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
