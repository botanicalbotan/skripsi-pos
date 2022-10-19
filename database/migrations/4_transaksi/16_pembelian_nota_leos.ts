import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class PembelianNotaLeos extends BaseSchema {
  protected tableName = 'pembelian_nota_leos'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      // AUTO GENERATED
      table.increments('id')

      // FK PENTING
      table.integer('pembelian_id').unsigned().references('pembelians.id').notNullable()

      // Seputar Tukar Tambah
      table.boolean('apakah_janji_tukar_tambah').notNullable()
      table.boolean('apakah_sudah_dipakai').notNullable()
      table.datetime('tanggal_jual_pada_nota').notNullable()

      table.float('berat_barang_pada_nota').notNullable() // bisa dibandingin sama berat barang di sebelah
      table.integer('harga_jual_pada_nota').notNullable() // bisa dibandingin sama harga akhir di sebelah

      table.boolean('apakah_potongan_persen').notNullable()
      table.integer('potongan_pada_nota').notNullable()
      table.integer('potongan_akhir').notNullable() // kalau ada pengurangan dari rumus (janji TT)
      table.integer('penalti_telat').notNullable()
      table.integer('ongkos_potongan_total').notNullable()

      // KEPEMILIKAN, OPTIONAL
      table.string('nama_pemilik', 50).nullable()
      table.string('alamat_pemilik', 50).nullable()

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
