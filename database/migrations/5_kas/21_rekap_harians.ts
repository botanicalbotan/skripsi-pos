import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class RekapHarians extends BaseSchema {
  protected tableName = 'rekap_harians'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('pasaran', 10).notNullable()
      table.boolean('apakah_hari_pasaran').notNullable()
      table.date('tanggal_rekap').unique().notNullable()

      // ini yang dihapus dari iterasi 1, diganti ama yang dibawah
      // table.integer('saldo_final').notNullable().defaultTo(0)
      // table.integer('selisih_saldo_kemarin').notNullable().defaultTo(0)

      // perlu banget buat ngebandingin sama kondisi IRL
      table.boolean('apakah_sudah_banding_saldo').notNullable().defaultTo(0)
      table.integer('saldo_toko_terakhir').notNullable()
      table.integer('saldo_toko_real').notNullable()
      table.dateTime('dibanding_at').nullable()
      table.integer('pencatat_banding_id').unsigned().references('penggunas.id').nullable()

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
