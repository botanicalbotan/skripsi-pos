import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Pengaturans extends BaseSchema {
  protected tableName = 'pengaturans'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('nama_toko', 59).notNullable()
      table.string('alamat_toko', 100).notNullable()
      table.string('deskripsi_toko', 100).notNullable()
      table.float('toleransi_susut_berat').notNullable().defaultTo(0)
      table.integer('toleransi_persentase_tawaran').notNullable().defaultTo(0)
      table.integer('saldo_toko').notNullable().defaultTo(0)
      table.integer('harga_mal').notNullable().defaultTo(0)
      table.integer('default_stok_minimal_perhiasan').notNullable().defaultTo(0)
      // ntar di production boleh print ganti jadi false
      table.boolean('default_boleh_print_nota').notNullable().defaultTo(true)
      table.boolean('default_ingatkan_stok_menipis').notNullable().defaultTo(true)
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
