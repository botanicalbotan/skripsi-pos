import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class TipeNotifs extends BaseSchema {
  protected tableName = 'tipe_notifs'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('nama', 100).notNullable()
      table.string('kode', 10).notNullable().unique()
      table.string('sintaks_judul').notNullable()
      table.string('sintaks_subjudul').notNullable()
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
