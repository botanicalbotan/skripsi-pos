import { DateTime } from 'luxon'
import { BaseModel, belongsTo, BelongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Pengguna from '../akun/Pengguna'
import Kelompok from './Kelompok'

export default class PenyesuaianStok extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public keterangan: string

  @column()
  public stokTercatat: number

  @column()
  public stokSebenarnya: number

  @column()
  public butuhCekUlang: boolean

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime


  // ============== FK =====================================================
  @column()
  public penggunaId: number

  @belongsTo(() => Pengguna)
  public pengguna: BelongsTo<typeof Pengguna>

  @column()
  public kelompokId: number

  @belongsTo(() => Kelompok)
  public kelompok: BelongsTo<typeof Kelompok>
}
