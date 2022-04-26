import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Penjualans extends BaseSchema {
  protected tableName = 'penjualans'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      // AUTO GENERATED
      table.increments('id').primary()
      table.string('kode_transaksi', 30).notNullable().unique()
      table.string('nama_barang', 100).notNullable()

      // FK PENTING
      table.integer('kelompok_id').unsigned().references('kelompoks.id').notNullable()
      table.integer('kode_produksi_id').unsigned().references('kode_produksis.id').notNullable()
      table.integer('pengguna_id').unsigned().references('penggunas.id').notNullable()
      table.integer('model_id').unsigned().references('models.id').notNullable()

      // KOMPONEN FORM
      table.float('berat_barang').notNullable()
      table.string('kondisi', 100)
      table.string('foto_barang')
      table.boolean('apakah_stok_baru').notNullable().defaultTo(false)

      // TRANSACTIONAL, gaboleh keiket sama current model
      table.integer('potongan').notNullable()
      table.boolean('apakah_potongan_persen').notNullable()
      table.integer('harga_jual_per_gram').notNullable()
      table.integer('harga_jual_akhir').notNullable()

      // OPTIONAL BELOM DIBUAT
      table.string('nama_pemilik', 50)
      table.enum('gender_pemilik', [
        'L',
        'P'
      ]).nullable()
      table.integer('rentang_usia_id').unsigned().references('rentang_usias.id')

      // CONSTRAIN
      table.dateTime('dibeli_at').nullable() // kalo udah dibeli gabisa dibeli lagi
      table.dateTime('deleted_at').nullable() // kalo udah dihapus gabisa diapa2in
      table.dateTime('max_print_at').notNullable() // kalo udah dihapus gabisa diapa2in


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
