import { DateTime } from 'luxon'
import {
  BaseModel, 
  column,
  belongsTo, 
  BelongsTo,
  hasMany,
  HasMany
} from '@ioc:Adonis/Lucid/Orm'
import Kadar from 'App/Models/Barang/Kadar'
import Penjualan from 'App/Models/transaksi/Penjualan'

export default class KodeProduksi extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public kode: string

  @column()
  public asalProduksi: string

  @column()
  public apakahBuatanTangan: boolean

  @column()
  public deskripsi: string

  @column.dateTime()
  public deletedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime



  // FK dan relasi
  @column()
  public kadarId: number

  @belongsTo(() => Kadar)
  public kadar: BelongsTo<typeof Kadar>

  @hasMany(() => Penjualan)
  public penjualans: HasMany<typeof Penjualan>
}
