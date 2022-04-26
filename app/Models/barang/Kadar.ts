import { DateTime } from 'luxon'
import {
  BaseModel,
  column,
  hasMany,
  HasMany,
  hasManyThrough,
  HasManyThrough
} from '@ioc:Adonis/Lucid/Orm'
import Kelompok from 'App/Models/barang/Kelompok'
import Penjualan from 'App/Models/transaksi/Penjualan'
import KodeProduksi from 'App/Models/barang/KodeProduksi'

export default class Kadar extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public nama: string

  @column()
  public deskripsi: string

  @column()
  public apakahPotonganPersen: boolean

  @column()
  public toleransiPotonganTukarTambah: number

  @column()
  public hargaNota: number

  @column()
  public warnaNota: string


  @column.dateTime({ autoCreate: true, serializeAs: null })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime


  // FK dan relasi
  @hasMany(() => Kelompok)
  public kelompoks: HasMany<typeof Kelompok>

  @hasMany(() => KodeProduksi)
  public kodeProduksis: HasMany<typeof KodeProduksi>

  @hasManyThrough([
    () => Penjualan,
    () => Kelompok
  ])
  public penjualans: HasManyThrough<typeof Penjualan>
}
