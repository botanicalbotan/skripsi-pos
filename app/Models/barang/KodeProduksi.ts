import { DateTime } from 'luxon'
import {
  BaseModel,
  column,
  belongsTo,
  BelongsTo,
  hasMany,
  HasMany,
  ModelQueryBuilderContract,
  beforeFind,
  beforeFetch
} from '@ioc:Adonis/Lucid/Orm'
import Kadar from 'App/Models/Barang/Kadar'
import Penjualan from 'App/Models/transaksi/Penjualan'
import Pengguna from 'App/Models/akun/Pengguna'
import Pembelian from '../transaksi/Pembelian'

type KodeProduksiQuery = ModelQueryBuilderContract<typeof KodeProduksi>

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

  @column()
  public hargaPerGramLama: number

  @column()
  public hargaPerGramBaru: number

  @column()
  public potonganLama: number

  @column()
  public potonganBaru: number


  // @column()
  // public persentaseMalUripan: number

  // @column()
  // public persentaseMalRosok: number

  // @column()
  // public ongkosBeliTanpaNota: number

  // @column()
  // public ongkosMalRosokPerGram: number



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

  @hasMany(() => Pembelian)
  public pembelians: HasMany<typeof Pembelian>

  @column()
  public penggunaId: number

  @belongsTo(() => Pengguna)
  public pengguna: BelongsTo<typeof Pengguna>



  // disini decorators
  @beforeFetch()
  @beforeFind()
  public static withoutSoftDeletes(query: KodeProduksiQuery){
    query.whereNull('kode_produksis.deleted_at')
  }
}
