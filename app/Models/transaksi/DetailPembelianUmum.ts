import { DateTime } from 'luxon'
import { 
  BaseModel, 
  column,
  BelongsTo,
  belongsTo
} from '@ioc:Adonis/Lucid/Orm'
import Pembelian from 'App/Models/transaksi/Pembelian'
import RentangUsia from './RentangUsia'

export default class DetailPembelianUmum extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public potonganDeskripsi: string

  @column()
  public potonganNominalTotal: number

  @column()
  public beratNota: number

  @column()
  public beratSebenarnya: number

  @column()
  public hargaJualNota: number

  @column()
  public beratSelisih: number

  @column()
  public namaPemilik: string | null

  @column()
  public genderPemilik: string | null

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime


  // FK dan relasi
  @column()
  public pembelianId: number

  @belongsTo(() => Pembelian)
  public pembelian: BelongsTo<typeof Pembelian>

  @column()
  public rentangUsiaId: number

  @belongsTo(() => RentangUsia)
  public rentangUsia: BelongsTo<typeof RentangUsia>
}
