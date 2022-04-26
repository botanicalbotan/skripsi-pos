import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class DetailPembelianUmums extends BaseSchema {
  protected tableName = 'detail_pembelian_umums'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('pembelian_id').unsigned().references('pembelians.id').notNullable()
      table.string('potongan_deskripsi', 30).notNullable()
      table.integer('potongan_nominal_total').notNullable()
      table.float('berat_nota').notNullable()
      table.float('berat_sebenarnya').notNullable()
      table.integer('harga_jual_nota').notNullable()
      table.float('berat_selisih').notNullable()
      table.string('nama_pemilik', 50)
      table.enum('gender_pemilik', [
        'L',
        'P'
      ]).nullable()
      table.integer('rentang_usia_id').unsigned().references('rentang_usias.id')
      table.dateTime('deleted_at').nullable()


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
