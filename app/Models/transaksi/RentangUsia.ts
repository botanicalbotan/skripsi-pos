// import { DateTime } from 'luxon'
import {
  BaseModel,
  column,
  hasMany,
  HasMany
} from '@ioc:Adonis/Lucid/Orm'
import Penjualan from './Penjualan'
import DetailPembelianUmum from './DetailPembelianUmum'

export default class RentangUsia extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public golongan: string

  @column()
  public deskripsi: string

  // @column.dateTime({ autoCreate: true })
  // public createdAt: DateTime

  // @column.dateTime({ autoCreate: true, autoUpdate: true })
  // public updatedAt: DateTime



  // FK dan relasi
  // @hasMany(() => Penjualan)
  // public penjualans: HasMany<typeof Penjualan>

  // @hasMany(() => DetailPembelianUmum)
  // public detailPembelianUmums: HasMany<typeof DetailPembelianUmum>
}
