import { DateTime } from 'luxon'
import { 
  BaseModel, 
  column,
  BelongsTo,
  belongsTo,
  manyToMany,
  ManyToMany
} from '@ioc:Adonis/Lucid/Orm'
import Bentuk from 'App/Models/barang/Bentuk'
import Pembelian from '../transaksi/Pembelian'

export default class Kerusakan extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public nama: string

  @column()
  public apakahBisaDiperbaiki: boolean

  @column()
  public ongkosDeskripsi: string

  @column()
  public ongkosNominal: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime



  // FK dan relasi
  @column()
  public bentukId: number

  @belongsTo(() => Bentuk)
  public bentuk: BelongsTo<typeof Bentuk>

  @manyToMany(() => Pembelian, {
    pivotTable: 'pembelian_kerusakans',
    localKey: 'id',
    pivotForeignKey: 'kerusakan_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'pembelian_id',
    pivotColumns: [
      'apakah_diabaikan',
      'banyak_kerusakan',
      'total_ongkos'
    ]
  })
  public pembelians: ManyToMany<typeof Pembelian>
}
