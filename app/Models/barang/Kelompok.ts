import { DateTime } from 'luxon'
import { 
  BaseModel, 
  column,
  BelongsTo,
  belongsTo,
  HasMany,
  hasMany,
  manyToMany,
  ManyToMany
} from '@ioc:Adonis/Lucid/Orm'
import Kadar from 'App/Models/barang/Kadar'
import Bentuk from 'App/Models/barang/Bentuk'
import Penjualan from 'App/Models/transaksi/Penjualan'
import RekapRestok from 'App/Models/barang/RekapRestok'

export default class Kelompok extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public nama: string

  @column()
  public beratKelompok: number

  @column()
  public stokMinimal: number

  @column()
  public ingatkanStokMenipis: boolean

  @column()
  public stok: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime


  // FK dan relasi
  @column()
  public kadarId: number

  @belongsTo(() => Kadar)
  public kadar: BelongsTo<typeof Kadar>

  @column()
  public bentukId: number

  @belongsTo(() => Bentuk)
  public bentuk: BelongsTo<typeof Bentuk>

  @hasMany(() => Penjualan)
  public penjualans: HasMany<typeof Penjualan>

  @manyToMany(() => RekapRestok, {
    pivotTable: 'kelompok_rekaps',
    localKey: 'id',
    pivotForeignKey: 'kelompok_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'rekap_restok_id',
    pivotColumns: ['perubahan_stok']
  })
  public rekapRestoks: ManyToMany<typeof RekapRestok>
}
