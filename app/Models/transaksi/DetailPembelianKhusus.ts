import { DateTime } from 'luxon'
import { 
  BaseModel, 
  column,
  BelongsTo,
  belongsTo
} from '@ioc:Adonis/Lucid/Orm'
import Pembelian from 'App/Models/transaksi/Pembelian'

export default class DetailPembelianKhusus extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  // @column()
  // public beratSebenarnya: number

  @column()
  public persentaseHargaMal: number

  @column()
  public hargaBeliPergram: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime



  // FK dan relasi
  @column()
  public pembelianId: number

  @belongsTo(() => Pembelian)
  public pembelian: BelongsTo<typeof Pembelian>
}
