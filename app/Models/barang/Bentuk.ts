// import { DateTime } from 'luxon'
import {
  BaseModel,
  column,
  hasMany,
  HasMany,
  hasManyThrough,
  HasManyThrough
} from '@ioc:Adonis/Lucid/Orm'
import Model from 'App/Models/barang/Model'
import Kelompok from 'App/Models/barang/Kelompok'
import Kerusakan from 'App/Models/barang/Kerusakan'
import Penjualan from 'App/Models/transaksi/Penjualan'
import Pembelian from 'App/Models/transaksi/Pembelian'


export default class Bentuk extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public kode: string

  @column()
  public bentuk: string

  // @column.dateTime({ autoCreate: true, serializeAs: null })
  // public createdAt: DateTime

  // @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  // public updatedAt: DateTime


  // FK dan relasi
  @hasMany(() => Model)
  public models: HasMany<typeof Model>

  @hasMany(() => Kelompok)
  public kelompoks: HasMany<typeof Kelompok>

  @hasMany(() => Kerusakan)
  public kerusakans: HasMany<typeof Kerusakan>

  @hasManyThrough([
    () => Penjualan,
    () => Kelompok
  ])
  public penjualans: HasManyThrough<typeof Penjualan>

  @hasManyThrough([
    () => Pembelian,
    () => Model
  ])
  public pembelians: HasManyThrough<typeof Pembelian>

  // kalau bisa manggil gadai juga, tp gabisa
  // ntar panggil ae dari id yang didapet dari hasmanythrough
}
