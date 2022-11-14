import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Gadais extends BaseSchema {
  protected tableName = 'gadais'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
 
      // FK PENTING
      table.integer('status_gadai_id').unsigned().references('status_gadais.id').notNullable() // start dari 'berjalan'
      table.integer('kode_produksi_id').unsigned().references('kode_produksis.id').notNullable()
      table.integer('model_id').unsigned().references('models.id').notNullable()
      table.integer('pengguna_id').unsigned().references('penggunas.id').notNullable() // pencatat

      // mulai form 1
      table.dateTime('tanggal_tenggat').notNullable()
      table.string('nama_penggadai', 50).notNullable()
      table.string('nik_penggadai', 16).notNullable()
      table.string('alamat_penggadai', 100).notNullable()
      table.string('nohp_penggadai', 15).notNullable()
      table.integer('nominal_gadai').notNullable().unsigned() // jadi harga barang akhir
      table.string('keterangan', 100).nullable()
      
      
      // mulai form 2
      // table.string('nama_barang', 120).notNullable() // gaperlu
      table.string('kode_transaksi', 30).notNullable()
      table.enum('kondisi_fisik', ['uripan', 'rusak', 'rosok']).notNullable()
      table.string('keterangan_transaksi', 100)
      table.float('berat_barang').notNullable()
      table.string('asal_toko', 50)
      table.string('alamat_asal_toko', 100)
      table.string('keterangan_barang', 100)
      table.boolean('apakah_ditawar').notNullable() // bakal jarang dipake, soalnya bahas tawaran
      table.integer('harga_barang_per_gram_seharusnya').notNullable() // hitungan tanpa tawaran, bisa dari nota dibagi berat, ato MAL
      table.integer('harga_barang_per_gram_akhir').notNullable()
      table.integer('harga_barang_seharusnya').notNullable() // hitungan tanpa tawaran
      // table.integer('harga_barang_akhir').notNullable() // jadi satu ama 'nominal gadai' diatas
      table.integer('ongkos_kerusakan_total').notNullable()


      // mulai form 3
      table.string('foto_ktp_penggadai') // bisa dihapus
      table.string('foto_barang')

      // CONSTRAIN
      table.dateTime('deleted_at').nullable()
      table.dateTime('dilunasi_at').nullable()

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
