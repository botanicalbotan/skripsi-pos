import { DateTime } from 'luxon'
import { 
  BaseModel, 
  column,
  BelongsTo,
  belongsTo
} from '@ioc:Adonis/Lucid/Orm'
import Pembelian from 'App/Models/transaksi/Pembelian'
import StatusGadai from 'App/Models/transaksi/StatusGadai'
import Pengguna from 'App/Models/akun/Pengguna'

export default class Gadai extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  // kalau mau kasi auto create langsung + 30 hari
  @column.date()
  public tanggalTenggat: DateTime

  @column()
  public namaPenggadai: string

  @column()
  public ktpPenggadai: string

  @column()
  public fotoKtpPenggadai: string | null

  @column()
  public alamatPenggadai: string

  @column()
  public nohpPenggadai: string

  @column()
  public nominalGadai: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime


  // FL dan relasi
  @column()
  public pembelianId: number

  @belongsTo(() => Pembelian)
  public pembelian: BelongsTo<typeof Pembelian>

  @column()
  public statusGadaiId: number

  @belongsTo(() => StatusGadai)
  public statusGadai: BelongsTo<typeof StatusGadai>

  @column()
  public penggunaId: number

  @belongsTo(() => Pengguna)
  public pengguna: BelongsTo<typeof Pengguna>
}
