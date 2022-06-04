import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class KodeProduksis extends BaseSchema {
  protected tableName = 'kode_produksis'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('kode', 10).notNullable().unique()
      table.string('deskripsi', 100)
      table.boolean('apakah_buatan_tangan').notNullable().defaultTo(false)
      table.string('asal_produksi', 50).notNullable()
      table.dateTime('deleted_at').nullable()
      table.integer('kadar_id').unsigned().references('kadars.id').notNullable()
      table.integer('harga_per_gram_lama').notNullable()
      table.integer('harga_per_gram_baru').notNullable()
      table.integer('potongan_lama').notNullable()
      table.integer('potongan_baru').notNullable()
      table.integer('persentase_mal_uripan').notNullable().unsigned()
      table.integer('pengguna_id').unsigned().references('penggunas.id').notNullable()

      // ini baru
      table.integer('persentase_mal_rosok').notNullable().unsigned()
      table.integer('ongkos_beli_tanpa_nota').notNullable().unsigned() // dipanggil kalo pas jual gaada notanya

      // belom kepikir soal tuker tambah sama penawaran

      // ini kebawah otw dihapus
      table.integer('ongkos_mal_rosok_per_gram').notNullable().unsigned()

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
