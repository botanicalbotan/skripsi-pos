import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Penggunas extends BaseSchema {
  protected tableName = 'penggunas'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      // email, password sama username dipindah ke users
      table.increments('id')
      table.integer('user_id').unsigned().references('users.id').notNullable().onDelete('CASCADE')
      table.integer('jabatan_id').unsigned().references('jabatans.id').notNullable().onDelete('CASCADE')
      table.string('nama', 50)
      table.enum('gender', [
        'L',
        'P'
      ]).nullable()
      table.string('tempat_lahir').notNullable()
      table.date('tanggal_lahir').notNullable()
      table.date('tanggal_awal_masuk').notNullable()
      // lama kerja ini bentuknya tahun
      table.integer('lama_kerja').notNullable().defaultTo(0)
      table.string('alamat', 100)
      table.string('nohp_aktif', 15)
      table.boolean('apakah_pegawai_aktif').notNullable().defaultTo(false)
      table.string('foto')
      table.date('tanggal_gajian').notNullable()
      table.integer('gaji_bulanan').notNullable()
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
