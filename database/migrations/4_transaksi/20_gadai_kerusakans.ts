import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class GadaiKerusakans extends BaseSchema {
  protected tableName = 'gadai_kerusakans'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('gadai_id').unsigned().references('gadais.id').notNullable()
      table.integer('kerusakan_id').unsigned().references('kerusakans.id').notNullable()
      table.unique(['gadai_id', 'kerusakan_id'])
      table.boolean('apakah_diabaikan').notNullable().defaultTo(false)
      table.integer('banyak_kerusakan').notNullable().unsigned()
      table.integer('total_ongkos').notNullable()
      table.dateTime('deleted_at').nullable()
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
