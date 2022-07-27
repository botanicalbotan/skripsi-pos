import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class RefreshGadais extends BaseSchema {
  protected tableName = 'refresh_gadais'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.timestamp('direfresh_at').notNullable()
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
