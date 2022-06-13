import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Penggunas extends BaseSchema {
  protected tableName = 'penggunas'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      // email, password sama username dipindah ke users
      table.increments('id')
      table.integer('user_id').unsigned().references('users.id').notNullable()
      table.integer('jabatan_id').unsigned().references('jabatans.id').notNullable()
      table.string('nama', 50).notNullable()
      table.enum('gender', [
        'L',
        'P'
      ]).notNullable()
      table.string('tempat_lahir').notNullable()
      table.date('tanggal_lahir').notNullable()

      table.string('alamat', 100).notNullable()
      table.string('nohp_aktif', 15).notNullable()
      table.string('foto')
      table.string('catatan', 100)

      table.boolean('apakah_pegawai_aktif').notNullable().defaultTo(false)
      table.date('tanggal_mulai_aktif').nullable() // hapus kalo di deactivate, reset kalo diaktifin lagi
      table.dateTime('deleted_at').nullable()


      table.integer('gaji_bulanan').notNullable()
      table.date('tanggal_gajian_selanjutnya').nullable()
      table.date('tanggal_gajian_terakhir').nullable()
      table.integer('kali_gajian').notNullable().defaultTo(0)

      // ini dipertanyakan
      // table.date('tanggal_awal_masuk').notNullable()
      // table.date('tanggal_gajian').notNullable()
      // table.integer('lama_kerja').notNullable().defaultTo(0) // bulan

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
