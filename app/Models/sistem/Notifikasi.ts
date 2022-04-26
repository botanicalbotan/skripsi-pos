import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import TipeNotif from 'App/Models/sistem/TipeNotif'
import Pengguna from 'App/Models/akun/Pengguna'

export default class Notifikasi extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public isiNotif: string

  @column()
  public urlTujuan: string

  @column.dateTime()
  public dilihatAt: DateTime | null

  @column.dateTime()
  public diklikAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime



  // FK dan relasi
  @column()
  public tipeNotifId: number

  @belongsTo(() => TipeNotif)
  public tipeNotif: BelongsTo<typeof TipeNotif>

  @column()
  public penggunaId: number

  @belongsTo(() => Pengguna)
  public pengguna: BelongsTo<typeof Pengguna>
}
