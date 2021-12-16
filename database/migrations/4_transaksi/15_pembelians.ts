import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Pembelians extends BaseSchema {
  protected tableName = 'pembelians'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('kadar_id').unsigned().references('kadars.id').notNullable().onDelete('CASCADE')
      table.integer('model_id').unsigned().references('models.id').notNullable().onDelete('CASCADE')
      table.string('kode_transaksi', 30).notNullable()
      table.string('asal_toko', 50)
      table.boolean('apakah_pembelian_normal').notNullable()
      table.string('kode_perhiasan', 10)
      table.string('keterangan', 100)
      table.integer('harga_beli_akhir').notNullable()
      table.integer('pengguna_id').unsigned().references('penggunas.id').notNullable().onDelete('CASCADE')
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
