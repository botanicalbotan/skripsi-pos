import { DateTime } from 'luxon'
import { BaseModel, beforeFetch, beforeFind, BelongsTo, belongsTo, column, ModelQueryBuilderContract } from '@ioc:Adonis/Lucid/Orm'
import Pengguna from '../akun/Pengguna'
import Gadai from './Gadai'

type PembayaranQuery = ModelQueryBuilderContract<typeof PembayaranGadai>

export default class PembayaranGadai extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public judulPembayaran: string

  @column()
  public nominal: number

  @column()
  public keterangan: string

  @column.dateTime()
  public deletedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime


  // ============================ FK Penting ===============================

  @column()
  public penggunaId: number

  @belongsTo(() => Pengguna)
  public pengguna: BelongsTo<typeof Pengguna>
  
  @column()
  public gadaiId: number

  @belongsTo(() => Gadai)
  public gadai: BelongsTo<typeof Gadai>


  @beforeFetch()
  @beforeFind()
  public static withoutSoftDeletes(query: PembayaranQuery) {
    query.whereNull('pembayaran_gadais.deleted_at')
  }

}
