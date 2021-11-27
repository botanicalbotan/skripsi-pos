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

export default class Pembelian extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  // kode transaksi kalo mau dibikin auto bisa dari sini
  @column()
  public kodeTransaksi: string

  @column()
  public asalToko: string

  @column()
  public apakahPembelianNormal: boolean

  @column()
  public kodePerhiasan: string

  @column()
  public keterangan: string

  @column()
  public hargaBeliAkhir: number

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
