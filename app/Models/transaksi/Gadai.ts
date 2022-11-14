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
  ModelQueryBuilderContract,
  hasOne,
  HasOne,
  manyToMany,
  ManyToMany,
} from '@ioc:Adonis/Lucid/Orm'
// import Pembelian from 'App/Models/transaksi/Pembelian'
import StatusGadai from 'App/Models/transaksi/StatusGadai'
import Pengguna from 'App/Models/akun/Pengguna'
import PembayaranGadai from './PembayaranGadai'
import KodeProduksi from '../barang/KodeProduksi'
import Model from '../barang/Model'
import GadaiNotaLeo from './GadaiNotaLeo'
import Kerusakan from '../barang/Kerusakan'

type GadaiQuery = ModelQueryBuilderContract<typeof PembayaranGadai>

export default class Gadai extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  // kalau mau kasi auto create langsung + 30 hari
  @column.dateTime()
  public tanggalTenggat: DateTime

  // ======================= FORM 1 ============================
  @column()
  public namaPenggadai: string

  @column()
  public nikPenggadai: string

  @column()
  public alamatPenggadai: string

  @column()
  public nohpPenggadai: string

  @column()
  public nominalGadai: number

  @column()
  public keterangan: string | null

  // ======================= FORM 2 ============================
  // @column()
  // public namaBarang: string

  @column()
  public kodeTransaksi: string

  @column()
  public kondisiFisik: string

  @column()
  public keteranganTransaksi: string

  @column()
  public beratBarang: number

  @column()
  public asalToko: string | null

  @column()
  public alamatAsalToko: string | null

  @column()
  public keteranganBarang: string

  @column()
  public apakahDitawar: boolean

  @column()
  public hargaBarangPerGramSeharusnya: number

  @column()
  public hargaBarangPerGramAkhir: number // kalo ditawar bakal nyimpen tawarannya

  @column()
  public hargaBarangSeharusnya: number

  // @column()
  // public hargaBarangAkhir: number // jadi satu ama nominal gadai diatas

  @column()
  public ongkosKerusakanTotal: number


  // ======================= FORM 3 ============================
  @column()
  public fotoKtpPenggadai: string | null // bisa dihapus kalau emang ga make
  
  @column()
  public fotoBarang: string


  // ====================== CONSTRAIN ==========================


  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @column.dateTime()
  public deletedAt: DateTime | null

  @column.dateTime()
  public dilunasiAt: DateTime | null

  // FK dan relasi
  // @column()
  // public pembelianId: number

  // @belongsTo(() => Pembelian)
  // public pembelian: BelongsTo<typeof Pembelian>

  @column()
  public statusGadaiId: number

  @belongsTo(() => StatusGadai)
  public statusGadai: BelongsTo<typeof StatusGadai>

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
  
  @hasMany(() => PembayaranGadai)
  public pembayaranGadais: HasMany<typeof PembayaranGadai>

  @hasOne(() => GadaiNotaLeo)
  public gadaiNotaLeo: HasOne<typeof GadaiNotaLeo>

  @manyToMany(() => Kerusakan, {
    pivotTable: 'gadai_kerusakans',
    localKey: 'id',
    pivotForeignKey: 'gadai_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'kerusakan_id',
    pivotColumns: [
      'apakah_diabaikan',
      'banyak_kerusakan',
      'total_ongkos'
    ]
  })
  public kerusakans: ManyToMany<typeof Kerusakan>

  @beforeFetch()
  @beforeFind()
  public static withoutSoftDeletes(query: GadaiQuery) {
    query.whereNull('gadais.deleted_at')
  }
}
