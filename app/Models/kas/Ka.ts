import { DateTime } from 'luxon'
import { 
  BaseModel, 
  column,
  BelongsTo,
  belongsTo
} from '@ioc:Adonis/Lucid/Orm'
import Pengguna from 'App/Models/akun/Pengguna'
import RekapHarian from 'App/Models/kas/RekapHarian'

// aslinya Kas, tp ama sistem ngebug jadi Ka

export default class Ka extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public apakahKasKeluar: boolean

  @column()
  public nominal: number

  @column()
  public perihal: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime


  // FK dan relasi
  @column()
  public rekapHarianId: number

  @belongsTo(() => RekapHarian)
  public rekapHarian: BelongsTo<typeof RekapHarian>

  @column()
  public penggunaId: number

  @belongsTo(() => Pengguna)
  public pengguna: BelongsTo<typeof Pengguna>
}
