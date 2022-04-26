import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Pengguna from 'App/Models/akun/Pengguna'

export default class PenggajianPegawai extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public status: string

  @column.dateTime()
  public tanggalSeharusnyaDibayar: DateTime

  @column.dateTime()
  public dibayarAt: DateTime | null

  @column()
  public nominalGaji: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime


  // dibawah ini relasii
  @column()
  public penerimaGajiId: number

  @belongsTo(() => Pengguna, {
    foreignKey: 'penerimaGajiId'
  })
  public penerimaGaji: BelongsTo<typeof Pengguna>

  @column()
  public pencatatGajianId: number | null

  @belongsTo(() => Pengguna, {
    foreignKey: 'pencatatGajianId'
  })
  public pencatatGajian: BelongsTo<typeof Pengguna>

}
