import { BaseModel, column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'
import Notifikasi from 'App/Models/sistem/Notifikasi'

export default class TipeNotif extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public nama: string

  @column()
  public kode: string

  @column()
  public sintaksJudul: string

  @column()
  public sintaksSubjudul: string

  @hasMany(() => Notifikasi)
  public notifikasis: HasMany<typeof Notifikasi>
}
