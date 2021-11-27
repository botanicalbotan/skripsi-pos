import { DateTime } from 'luxon'
import { 
  BaseModel, 
  column,
  BelongsTo,
  belongsTo,
  hasMany,
  HasMany
} from '@ioc:Adonis/Lucid/Orm'
import Bentuk from 'App/Models/barang/Bentuk'
import Penjualan from 'App/Models/transaksi/Penjualan'
import Pembelian from 'App/Models/transaksi/Pembelian'

export default class Model extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public nama: string

  @column()
  public deskripsi: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  // FK dan relasi
  @column()
  public bentukId: number

  @belongsTo(() => Bentuk)
  public bentuk: BelongsTo<typeof Bentuk>

  @hasMany(() => Penjualan)
  public penjualans: HasMany<typeof Penjualan>

  @hasMany(() => Pembelian)
  public pembelians: HasMany<typeof Pembelian>
}
