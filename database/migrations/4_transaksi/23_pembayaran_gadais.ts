import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class PembayaranGadais extends BaseSchema {
  protected tableName = 'pembayaran_gadais'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      // auto-generated
      table.increments('id')
      table.integer('gadai_id').unsigned().references('gadais.id').notNullable()
      table.integer('pengguna_id').unsigned().references('penggunas.id').notNullable() // siapa yang bayar
      table.string('judul_pembayaran', 50).notNullable()

      // input form
      table.integer('nominal').unsigned().notNullable()
      table.string('keterangan', 100).notNullable()

      // constrain
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
