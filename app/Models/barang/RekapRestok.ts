import { DateTime } from 'luxon'
import { 
  BaseModel, 
  column,
  BelongsTo,
  belongsTo,
  manyToMany,
  ManyToMany
} from '@ioc:Adonis/Lucid/Orm'
import Pengguna from 'App/Models/akun/Pengguna'
import Kelompok from 'App/Models/barang/Kelompok'

export default class RekapRestok extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public catatan: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime



  // FK dan relasi
  @column()
  public penggunaId: number

  @belongsTo(() => Pengguna)
  public pengguna: BelongsTo<typeof Pengguna>

  @manyToMany(() => Kelompok, {
    pivotTable: 'kelompok_rekaps',
    localKey: 'id',
    pivotForeignKey: 'rekap_restok_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'kelompok_id',
    pivotColumns: ['perubahan_stok', 'stok_akhir']
  })
  public kelompoks: ManyToMany<typeof Kelompok>
}
