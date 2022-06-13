import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Kadars extends BaseSchema {
  protected tableName = 'kadars'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('nama', 10).notNullable()
      table.string('deskripsi', 100).notNullable()
      table.boolean('apakah_potongan_persen').notNullable().defaultTo(0)
      table.string('warna_nota', 10).notNullable()

      // transaksi pembelian
      table.integer('toleransi_pengurangan_potongan_min').notNullable()
      table.integer('toleransi_pengurangan_potongan_max').notNullable()

      // harga mal dan persentase kadar
      table.integer('persentase_mal_uripan').notNullable().unsigned()
      table.integer('persentase_mal_rosok').notNullable().unsigned()
      table.integer('margin_persen_untung_uripan_min').notNullable()
      table.integer('margin_persen_untung_uripan_max').notNullable()
      table.integer('margin_persen_untung_rosok_min').notNullable()
      table.integer('margin_persen_untung_rosok_max').notNullable()
      table.integer('margin_persen_untung_rosok_tt_min').notNullable()
      table.integer('margin_persen_untung_rosok_tt_max').notNullable()

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */

      table.timestamps(true, true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
