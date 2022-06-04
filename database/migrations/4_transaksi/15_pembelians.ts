import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Pembelians extends BaseSchema {
  protected tableName = 'pembelians'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      // AUTO GENERATED
      table.increments('id').primary()
      table.string('nama_barang', 100).notNullable()
      table.string('kode_transaksi', 30).notNullable()
      table.enum('kondisi_fisik', ['uripan', 'rusak', 'rosok']).notNullable()
      
      // FK PENTING
      table.integer('kode_produksi_id').unsigned().references('kode_produksis.id').notNullable()
      table.integer('model_id').unsigned().references('models.id').notNullable()
      table.integer('pengguna_id').unsigned().references('penggunas.id').notNullable()
      // table.integer('kadar_id').unsigned().references('kadars.id').notNullable() // gajadi make
      
      // KOMPONEN FORM
      table.float('berat_barang').notNullable()
      table.string('asal_toko', 50)
      table.string('keterangan', 100)

      // TRANSACTIONAL, gaboleh keiket sama current model
      table.boolean('apakah_pembelian_normal').notNullable()
      table.integer('harga_beli_akhir').notNullable()

      // CONSTRAIN
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
