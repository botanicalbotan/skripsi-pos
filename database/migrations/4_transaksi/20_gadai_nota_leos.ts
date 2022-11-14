import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class GadaiNotaLeos extends BaseSchema {
  protected tableName = 'gadai_nota_leos'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      // AUTO GENERATED
      table.increments('id')

      // FK PENTING
      table.integer('gadai_id').unsigned().references('gadais.id').notNullable()

      // Seputar Tukar Tambah
      table.datetime('tanggal_jual_pada_nota').notNullable()

      table.float('berat_barang_pada_nota').notNullable() // bisa dibandingin sama berat barang di sebelah
      table.integer('harga_jual_pada_nota').notNullable() // bisa dibandingin sama harga akhir di sebelah
      table.boolean('apakah_potongan_persen').notNullable()
      table.integer('potongan_pada_nota').notNullable()
      table.integer('ongkos_potongan_total').notNullable()

      // CONSTRAIN
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
