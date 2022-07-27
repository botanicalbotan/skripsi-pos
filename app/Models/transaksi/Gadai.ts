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
import Pembelian from 'App/Models/transaksi/Pembelian'
import StatusGadai from 'App/Models/transaksi/StatusGadai'
import Pengguna from 'App/Models/akun/Pengguna'
import PembayaranGadai from './PembayaranGadai'

type GadaiQuery = ModelQueryBuilderContract<typeof PembayaranGadai>

export default class Gadai extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  // kalau mau kasi auto create langsung + 30 hari
  @column.dateTime()
  public tanggalTenggat: DateTime

  @column()
  public namaPenggadai: string

  @column()
  public nikPenggadai: string

  @column()
  public fotoKtpPenggadai: string | null // bisa dihapus kalau emang ga make

  @column()
  public alamatPenggadai: string

  @column()
  public nohpPenggadai: string

  @column()
  public nominalGadai: number

  @column()
  public keterangan: string | null

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  // ================================ CONSTRAIN ===================================
  
  @column.dateTime()
  public deletedAt: DateTime | null

  @column.dateTime()
  public dilunasiAt: DateTime | null



  // FK dan relasi
  @column()
  public pembelianId: number

  @belongsTo(() => Pembelian)
  public pembelian: BelongsTo<typeof Pembelian>

  @column()
  public statusGadaiId: number

  @belongsTo(() => StatusGadai)
  public statusGadai: BelongsTo<typeof StatusGadai>

  @hasMany(() => PembayaranGadai)
  public pembayaranGadais: HasMany < typeof PembayaranGadai >

  @column()
  public penggunaId: number

  @belongsTo(() => Pengguna)
  public pengguna: BelongsTo<typeof Pengguna>


  @beforeFetch()
  @beforeFind()
  public static withoutSoftDeletes(query: GadaiQuery) {
    query.whereNull('gadais.deleted_at')
  }
}
