// import { DateTime } from 'luxon'
import {
  BaseModel,
  column,
  // hasMany,
  // HasMany
} from '@ioc:Adonis/Lucid/Orm'
// import Penjualan from './Penjualan'

// ini udah hampir yakin dihapus, tp masih mungkin buat di keep
// misal tetep pengen ngeimplementasiin spread data buat dashboard ama rekap harian (versi apgred)

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
