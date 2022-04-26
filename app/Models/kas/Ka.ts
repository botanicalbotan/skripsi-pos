import { DateTime } from 'luxon'
import {
  BaseModel,
  column,
  BelongsTo,
  belongsTo,
  beforeFind,
  beforeFetch,
  ModelQueryBuilderContract
} from '@ioc:Adonis/Lucid/Orm'
import Pengguna from 'App/Models/akun/Pengguna'
import RekapHarian from 'App/Models/kas/RekapHarian'

type KaQuery = ModelQueryBuilderContract<typeof Ka>
// aslinya Kas, tp ama sistem ngebug jadi Ka

export default class Ka extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public apakahKasKeluar: boolean

  @column()
  public apakahDariSistem: boolean

  @column()
  public nominal: number

  @column()
  public perihal: string

  @column.dateTime()
  public deletedAt: DateTime | null

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



  // Decorators
  // disini decorators

  @beforeFetch()
  @beforeFind()
  public static withoutSoftDeletes(query: KaQuery){
    query.whereNull('deleted_at')
  }
}
