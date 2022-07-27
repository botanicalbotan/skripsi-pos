import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Pembelians extends BaseSchema {
  protected tableName = 'pembelians'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      // AUTO GENERATED
      table.increments('id').primary()
      table.string('nama_barang', 120).notNullable()
      table.string('kode_transaksi', 30).notNullable()
      table.enum('kondisi_fisik', ['uripan', 'rusak', 'rosok']).notNullable()
      table.string('keterangan_transaksi', 100)
      
      // FK PENTING
      table.integer('kode_produksi_id').unsigned().references('kode_produksis.id').notNullable()
      table.integer('model_id').unsigned().references('models.id').notNullable()
      table.integer('pengguna_id').unsigned().references('penggunas.id').notNullable() // pencatat
      
      // KOMPONEN FORM
      table.float('berat_barang').notNullable()
      table.string('asal_toko', 50)
      table.string('keterangan', 100)

      // TRANSACTIONAL, gaboleh keiket sama current model
      table.boolean('apakah_tukar_tambah').notNullable()
      table.boolean('apakah_ditawar').notNullable() // bakal jarang dipake, soalnya bahas tawaran
      table.integer('harga_beli_per_gram_seharusnya').notNullable() // hitungan tanpa tawaran, bisa dari nota dibagi berat, ato MAL
      table.integer('harga_beli_per_gram_akhir').notNullable()
      
      table.integer('harga_beli_seharusnya').notNullable() // hitungan tanpa tawaran
      table.integer('harga_beli_akhir').notNullable()
      table.integer('ongkos_kerusakan_total').notNullable()

      // table.boolean('apakah_pembelian_normal').notNullable() //??

      // CONSTRAIN
      table.dateTime('deleted_at').nullable()

      // INI BUAT GADAI, permintaan dosen
      table.boolean('apakah_digadaikan').notNullable()
      table.dateTime('max_gadai_at').notNullable()
      table.dateTime('digadai_at').nullable() // kalo udah digadai gabisa digadai lagi

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
