import { DateTime } from 'luxon'
import { 
  BaseModel, 
  column,
  BelongsTo,
  belongsTo
} from '@ioc:Adonis/Lucid/Orm'
import RentangUsia from 'App/Models/transaksi/RentangUsia'
import Kelompok from 'App/Models/barang/Kelompok'
import Model from 'App/Models/barang/Model'
import Pengguna from 'App/Models/akun/Pengguna'

export default class Penjualan extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  // kalau mau bisa auto generated disini
  @column()
  public kodeTransaksi: string

  @column()
  public kodePerhiasan: string

  @column()
  public apakahPerhiasanBaru: boolean

  @column()
  public keterangan: string

  @column()
  public beratSebenarnya: number

  @column()
  public kondisi: string

  @column()
  public fotoBarang: string

  @column()
  public potonganDeskripsi: string

  @column()
  public potonganNominal: number

  @column()
  public hargaJualAkhir: number

  @column()
  public namaPemilik: string | null

  @column()
  public genderPemilik: string | null

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
  public modelId: number

  @belongsTo(() => Model)
  public model: BelongsTo<typeof Model>

  @column()
  public rentangUsiaId: number

  @belongsTo(() => RentangUsia)
  public rentangUsia: BelongsTo<typeof RentangUsia>

  @column()
  public penggunaId: number

  @belongsTo(() => Pengguna)
  public pengguna: BelongsTo<typeof Pengguna>
}
