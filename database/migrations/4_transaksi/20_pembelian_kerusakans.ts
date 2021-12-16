import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class PembelianKerusakans extends BaseSchema {
  protected tableName = 'pembelian_kerusakans'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('pembelian_id').unsigned().references('pembelians.id').notNullable().onDelete('CASCADE')
      table.integer('kerusakan_id').unsigned().references('kerusakans.id').notNullable().onDelete('CASCADE')
      table.unique(['pembelian_id', 'kerusakan_id'])
      table.boolean('apakah_diabaikan').notNullable().defaultTo(false)
      table.integer('banyak_kerusakan').notNullable()
      table.integer('total_ongkos').notNullable()
      table.dateTime('deleted_at')
      // default kalo diabaikan, total ongkos = 0

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
