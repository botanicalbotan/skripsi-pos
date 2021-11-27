import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class StatusGadais extends BaseSchema {
  protected tableName = 'status_gadais'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('status', 10).notNullable()

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
