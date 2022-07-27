import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class PasswordResetTokens extends BaseSchema {
  protected tableName = 'password_reset_tokens'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('client_ipv4').notNullable().unsigned()
      table.integer('user_id').unsigned().references('users.id').notNullable()
      table.string('token', 64).notNullable().unique()
      table.datetime('expired_at').notNullable() // ngecek dihapusnya dari sini
      table.unique(['user_id', 'token'])
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
