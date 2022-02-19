import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Gadais extends BaseSchema {
  protected tableName = 'gadais'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('pembelian_id').unsigned().references('pembelians.id').notNullable().onDelete('CASCADE')
      table.date('tanggal_tenggat').notNullable()
      table.string('nama_penggadai', 50).notNullable()
      table.string('ktp_penggadai', 20).notNullable()
      table.string('foto_ktp_penggadai')
      table.string('alamat_penggadai', 100).notNullable()
      table.string('nohp_penggadai', 15).notNullable()
      table.integer('nominal_gadai').notNullable()
      table.integer('status_gadai_id').unsigned().references('status_gadais.id').notNullable()
      table.integer('pengguna_id').unsigned().references('penggunas.id').notNullable().onDelete('CASCADE')
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
