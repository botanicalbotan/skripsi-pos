import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class PenggajianPegawais extends BaseSchema {
  protected tableName = 'penggajian_pegawais'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.enum('status', ['menunggu', 'dibayar', 'dihapus']).notNullable()
      table.dateTime('tanggal_seharusnya_dibayar').notNullable()
      table.dateTime('dibayar_at').nullable()
      table.integer('nominal_gaji').notNullable().defaultTo(0)
      table.integer('penerima_gaji_id').unsigned().references('penggunas.id').notNullable()
      table.integer('pencatat_gajian_id').unsigned().references('penggunas.id').nullable()


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
