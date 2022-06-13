import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Pengaturans extends BaseSchema {
  protected tableName = 'pengaturans'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      // auto generated
      table.increments('id').primary()

      // general
      table.string('nama_toko', 59).notNullable()
      table.string('alamat_toko_lengkap', 100).notNullable()
      table.string('alamat_toko_singkat', 50).notNullable()
      table.string('logo_toko')
      
      // transaksi
      table.float('toleransi_susut_berat').notNullable().defaultTo(0) // ditanyain lagi dulu ??
      table.boolean('default_boleh_print_nota').notNullable().defaultTo(true)
      table.integer('default_waktu_maksimal_print_nota').notNullable()
      table.integer('penalti_telat_janji_min').notNullable()
      table.integer('penalti_telat_janji_max').notNullable()
      // table.integer('toleransi_persentase_tawaran').notNullable().defaultTo(0)
      table.integer('harga_mal').notNullable().defaultTo(0)

      // saldo dan harga mal
      table.integer('saldo_toko').notNullable().defaultTo(0)
      

      // kelompok
      table.integer('default_stok_minimal_kelompok').notNullable().defaultTo(0)
      table.boolean('default_ingatkan_stok_menipis').notNullable().defaultTo(true)
      
      // pegawai
      table.integer('default_gaji_karyawan').notNullable().defaultTo(1000000)

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
