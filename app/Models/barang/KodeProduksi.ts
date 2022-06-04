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

  @column()
  public persentaseMalUripan: number



  // mulai dari sini
  @column()
  public persentaseMalRosok: number

  @column()
  public ongkosBeliTanpaNota: number

  // sampe sini, kolom baru


  // bawah ini otw dihapus
  @column()
  public ongkosMalRosokPerGram: number



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

  @column()
  public penggunaId: number

  @belongsTo(() => Pengguna)
  public pengguna: BelongsTo<typeof Pengguna>



  // disini decorators
  @beforeFetch()
  @beforeFind()
  public static withoutSoftDeletes(query: KodeProduksiQuery){
    query.whereNull('deleted_at')
  }
}
