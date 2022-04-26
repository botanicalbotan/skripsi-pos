import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Notifikasis extends BaseSchema {
  protected tableName = 'notifikasis'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('isi_notif').notNullable()
      table.integer('tipe_notif_id').unsigned().references('tipe_notifs.id').notNullable()
      table.string('url_tujuan').notNullable()
      table.integer('pengguna_id').unsigned().references('penggunas.id').notNullable()
      table.dateTime('dilihat_at').nullable()
      table.dateTime('diklik_at').nullable()

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
