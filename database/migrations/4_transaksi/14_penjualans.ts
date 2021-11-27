import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Penjualans extends BaseSchema {
  protected tableName = 'penjualans'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('kelompok_id').unsigned().references('kelompoks.id').notNullable().onDelete('CASCADE')
      table.string('kode_transaksi', 30).notNullable()
      table.string('kode_perhiasan', 10)
      table.integer('model_id').unsigned().references('models.id').notNullable().onDelete('CASCADE')
      table.boolean('apakah_perhiasan_baru').notNullable().defaultTo(false)
      table.string('keterangan', 100)
      table.float('berat_sebenarnya').notNullable()
      table.string('kondisi', 100)
      table.string('foto_barang')
      table.string('potongan_deksripsi', 20).notNullable()
      table.integer('potongan_nominal').notNullable()
      table.integer('harga_jual_akhir').notNullable()
      table.string('nama_pemilik', 50)
      table.enum('gender_pemilik', [
        'L',
        'P'
      ]).nullable()
      table.integer('rentang_usia_id').unsigned().references('rentang_usias.id')
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
