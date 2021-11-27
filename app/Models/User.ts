import { DateTime } from 'luxon'
import Hash from '@ioc:Adonis/Core/Hash'
import { 
  column, 
  beforeSave, 
  BaseModel,
  hasOne,
  HasOne
} from '@ioc:Adonis/Lucid/Orm'
import Pengguna from 'App/Models/akun/Pengguna'

export default class User extends BaseModel {

  @column({ isPrimary: true })
  public id: number

  @column()
  public email: string
  // // kalau mau dibikin encrption bisa lebih aman, tp tipe kolomnya diganti text bukan varchar
  // @column({
  //   prepare: (value: string) => Encryption.encrypt(value),
  //   consume: (value: string) => Encryption.decrypt(value),
  // })
  // public email: string

  @column()
  public username: string

  @column({ serializeAs: null })
  public password: string

  @column({ serializeAs: null })
  public rememberMeToken?: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeSave()
  public static async hashPassword (user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password)
    }
  }



  // FK dan relasi
  @hasOne(() => Pengguna, {
    localKey: 'id',
    foreignKey: 'userId'
  })
  public pengguna: HasOne<typeof Pengguna>
}
