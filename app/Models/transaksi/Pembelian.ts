import { DateTime } from 'luxon'
import {
  BaseModel,
  column,
  hasOne,
  HasOne,
  belongsTo,
  BelongsTo,
  manyToMany,
  ManyToMany
} from '@ioc:Adonis/Lucid/Orm'
import DetailPembelianKhusus from 'App/Models/transaksi/DetailPembelianKhusus'
import Kadar from 'App/Models/barang/Kadar'
import Model from 'App/Models/barang/Model'
import DetailPembelianUmum from 'App/Models/transaksi/DetailPembelianUmum'
import Kerusakan from 'App/Models/barang/Kerusakan'
import Pengguna from 'App/Models/akun/Pengguna'
import KodeProduksi from '../barang/KodeProduksi'

export default class Pembelian extends BaseModel {
  // ================================ AUTO GENERATED ===================================
  @column({ isPrimary: true })
  public id: number

  @column()
  public namaBarang: string

  @column()
  public kodeTransaksi: string

  @column()
  public kondisiFisik: string


  // ================================ KONPONEN FORM ===================================
  @column()
  public asalToko: string

  @column()
  public beratBarang: number

  @column()
  public keterangan: string


  // ================================ TRANSACTIONAL ===================================
  @column()
  public apakahPembelianNormal: boolean

  @column()
  public hargaBeliAkhir: number

  // ================================ CONSTRAIN ===================================
  
  @column.dateTime()
  public deletedAt: DateTime | null

  

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime



  // ========================== FK PENTING =====================================
  // @column()
  // public kadarId: number

  // @belongsTo(() => Kadar)
  // public kadar: BelongsTo<typeof Kadar>

  @column()
  public kodeProduksiId: number

  @belongsTo(() => KodeProduksi)
  public kodeProduksi: BelongsTo<typeof KodeProduksi>

  @column()
  public modelId: number

  @belongsTo(() => Model)
  public model: BelongsTo<typeof Model>

  @column()
  public penggunaId: number

  @belongsTo(() => Pengguna)
  public pengguna: BelongsTo<typeof Pengguna>

  // kalo bener sini mau ditambahin bentuk sendiri, panggil lewat sini

  @hasOne(() => DetailPembelianUmum)
  public detailPembelianUmum: HasOne<typeof DetailPembelianUmum>

  @hasOne(() => DetailPembelianKhusus)
  public detailPembelianKhusus: HasOne<typeof DetailPembelianKhusus>

  @manyToMany(() => Kerusakan, {
    pivotTable: 'pembelian_kerusakans',
    localKey: 'id',
    pivotForeignKey: 'pembelian_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'kerusakan_id',
    pivotColumns: [
      'apakah_diabaikan',
      'banyak_kerusakan',
      'total_ongkos'
    ]
  })
  public kerusakans: ManyToMany<typeof Kerusakan>
}
