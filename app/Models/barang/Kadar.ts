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

export default class Kadar extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public nama: string

  @column()
  public deskripsi: string

  @column()
  public hargaPerGramNormal: number

  @column()
  public hargaPerGramBaru: number

  @column()
  public potonganNormal: number

  @column()
  public potonganBaru: number

  @column()
  public apakahPotonganPersen: boolean


  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime


  // FK dan relasi
  @hasMany(() => Kelompok)
  public kelompoks: HasMany<typeof Kelompok>

  @hasManyThrough([
    () => Penjualan,
    () => Kelompok
  ])
  public penjualans: HasManyThrough<typeof Penjualan>
}
