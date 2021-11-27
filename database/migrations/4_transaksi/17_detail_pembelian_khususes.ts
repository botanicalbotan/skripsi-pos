import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class DetailPembelianKhususes extends BaseSchema {
  protected tableName = 'detail_pembelian_khususes'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('pembelian_id').unsigned().references('pembelians.id').notNullable().onDelete('CASCADE')
      table.float('berat_sebenarnya').notNullable()
      table.integer('persentase_harga_mal').notNullable()
      table.integer('harga_beli_pergram').notNullable()
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
