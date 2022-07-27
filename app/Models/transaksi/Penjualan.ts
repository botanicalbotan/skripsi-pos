import { DateTime } from 'luxon'
import {
  BaseModel,
  column,
  BelongsTo,
  belongsTo,
  hasMany,
  HasMany,
  beforeFetch,
  beforeFind,
  ModelQueryBuilderContract
} from '@ioc:Adonis/Lucid/Orm'
// import RentangUsia from 'App/Models/transaksi/RentangUsia'
import Kelompok from 'App/Models/barang/Kelompok'
import Model from 'App/Models/barang/Model'
import Pengguna from 'App/Models/akun/Pengguna'
import KodeProduksi from 'App/Models/barang/KodeProduksi'
import ItemJual from 'App/Models/transaksi/ItemJual'

type PenjualanQuery = ModelQueryBuilderContract<typeof Penjualan>


export default class Penjualan extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  // kalau mau bisa auto generated disini
  @column()
  public kodeTransaksi: string

  @column()
  public namaBarang: string

  @column()
  public beratBarang: number

  @column()
  public kondisi: string

  @column()
  public fotoBarang: string

  @column()
  public apakahStokBaru: boolean

  @column()
  public apakahJanjiTukarTambah: boolean


  @column()
  public potongan: number

  @column()
  public apakahPotonganPersen: boolean

  @column()
  public hargaJualPerGram: number

  @column()
  public hargaJualAkhir: number



  @column()
  public namaPemilik: string | null

  @column()
  public alamatPemilik: string | null


  // Gender ama rentang usia ada kemungkiann bakal dihapus, tp jangan dulu!
  // @column()
  // public genderPemilik: string | null


  @column.dateTime()
  public deletedAt: DateTime | null

  @column.dateTime()
  public dibeliAt: DateTime | null

  @column.dateTime()
  public maxPrintAt: DateTime


  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime


  // FK dan relasi
  @column()
  public kelompokId: number

  @belongsTo(() => Kelompok)
  public kelompok: BelongsTo<typeof Kelompok>

  @column()
  public kodeProduksiId: number

  @belongsTo(() => KodeProduksi)
  public kodeProduksi: BelongsTo<typeof KodeProduksi>

  @column()
  public modelId: number

  @belongsTo(() => Model)
  public model: BelongsTo<typeof Model>

  // @column()
  // public rentangUsiaId: number | null

  // @belongsTo(() => RentangUsia)
  // public rentangUsia: BelongsTo<typeof RentangUsia>

  @column()
  public penggunaId: number

  @belongsTo(() => Pengguna)
  public pengguna: BelongsTo<typeof Pengguna>

  @hasMany(() => ItemJual)
  public itemJuals: HasMany<typeof ItemJual>


  // disini decorators
  @beforeFetch()
  @beforeFind()
  public static withoutSoftDeletes(query: PenjualanQuery){
    query.whereNull('penjualans.deleted_at')
  }
}
