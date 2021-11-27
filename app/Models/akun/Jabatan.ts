import { DateTime } from 'luxon'
import Pengguna from 'App/Models/akun/Pengguna'
import { 
  BaseModel, 
  column,
  hasMany,
  HasMany
} from '@ioc:Adonis/Lucid/Orm'

export default class Jabatan extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public nama: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  
  // FK dan relasi
  @hasMany(() => Pengguna, {
    localKey: 'id',
    foreignKey: 'jabatanId'
  })
  public penggunas: HasMany<typeof Pengguna>
}
