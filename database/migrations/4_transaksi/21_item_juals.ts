import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class ItemJuals extends BaseSchema {
  protected tableName = 'item_juals'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.enum('jenis', ['batu', 'mainan']).notNullable()
      table.string('keterangan', 30).notNullable()
      table.integer('jumlah').unsigned().notNullable()
      table.integer('penjualan_id').unsigned().references('penjualans.id').notNullable()

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
