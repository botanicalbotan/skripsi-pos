import { DateTime } from 'luxon'
import { BaseModel, column, BelongsTo, belongsTo } from '@ioc:Adonis/Lucid/Orm'
import Pengguna from 'App/Models/akun/Pengguna'
import Kelompok from 'App/Models/barang/Kelompok'


export default class KoreksiStok extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public alasan: string

  @column()
  public perubahanStok: number

  @column()
  public stokAkhir: number

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
