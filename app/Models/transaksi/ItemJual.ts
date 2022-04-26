import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import Penjualan from 'App/Models/transaksi/Penjualan'

export default class ItemJual extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public jenis: string

  @column()
  public jumlah: number

  @column()
  public keterangan: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime



  @column()
  public penjualanId: number

  @belongsTo(() => Penjualan)
  public penjualan: BelongsTo<typeof Penjualan>
}
