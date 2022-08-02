import { DateTime } from 'luxon'
import { 
  BaseModel, 
  column,
  BelongsTo,
  belongsTo
} from '@ioc:Adonis/Lucid/Orm'
import Pengguna from 'App/Models/akun/Pengguna'

export default class KoreksiSaldo extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public alasan: string

  @column()
  public perubahanSaldo: number

  @column()
  public saldoAkhir: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime


  // FK dan relasi
  @column()
  public penggunaId: number

  @belongsTo(() => Pengguna)
  public pengguna: BelongsTo<typeof Pengguna>
}
