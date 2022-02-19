import { DateTime } from 'luxon'
import { 
  BaseModel, 
  column,
  BelongsTo,
  belongsTo,
  HasMany,
  hasMany,
  manyToMany,
  ManyToMany,
  ModelQueryBuilderContract,
  beforeFetch,
  beforeFind,
  scope
} from '@ioc:Adonis/Lucid/Orm'
import Kadar from 'App/Models/barang/Kadar'
import Bentuk from 'App/Models/barang/Bentuk'
import Penjualan from 'App/Models/transaksi/Penjualan'
import RekapRestok from 'App/Models/barang/RekapRestok'
import PenambahanStok from 'App/Models/barang/PenambahanStok'

type KelompokQuery = ModelQueryBuilderContract<typeof Kelompok>

export default class Kelompok extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public nama: string

  @column()
  public kodeKelompok: string

  @column()
  public beratKelompok: number

  @column()
  public stokMinimal: number

  @column()
  public ingatkanStokMenipis: boolean

  @column()
  public stok: number

  @column.dateTime()
  public deletedAt: DateTime

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
    pivotColumns: ['perubahan_stok', 'stok_akhir']
  })
  public rekapRestoks: ManyToMany<typeof RekapRestok>

  @manyToMany(() => PenambahanStok, {
    pivotTable: 'kelompok_penambahans',
    localKey: 'id',
    pivotForeignKey: 'kelompok_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'penambahan_stok_id',
    pivotColumns: ['perubahan_stok', 'stok_akhir']
  })
  public penambahanStoks: ManyToMany<typeof PenambahanStok>


  @beforeFetch()
  @beforeFind()
  public static withoutSoftDeletes(query: KelompokQuery) {
    query.whereNull('deleted_at')
  }


  // ========================================== Ini scope ====================================================
  public static adaStokTidakDihapus = scope((query)=>{
    query.where('stok', '>', 0).andWhereNull('deleted_at')
  })
}
