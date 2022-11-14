import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo, ModelQueryBuilderContract, beforeFetch, beforeFind } from '@ioc:Adonis/Lucid/Orm'
import Gadai from './Gadai'

type NotaLeoQuery = ModelQueryBuilderContract<typeof GadaiNotaLeo>

export default class GadaiNotaLeo extends BaseModel {
  @column({ isPrimary: true })
  public id: number

 // ================================ DATA ===================================

  @column.dateTime()
  public tanggalJualPadaNota: DateTime


 // ================================ TRANSAKSIONAL ===================================
  @column()
  public beratBarangPadaNota: number

  @column()
  public hargaJualPadaNota: number

  @column()
  public apakahPotonganPersen: boolean

  @column()
  public potonganPadaNota: number

  @column()
  public ongkosPotonganTotal: number

 // ================================ CONSTRAIN ===================================
  @column.dateTime()
  public deletedAt: DateTime | null



  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime



  // ================================ FK PENTING ===================================
  @column()
  public gadaiId: number

  @belongsTo(() => Gadai)
  public gadai: BelongsTo<typeof Gadai>


  // disini decorators
  @beforeFetch()
  @beforeFind()
  public static withoutSoftDeletes(query: NotaLeoQuery){
    query.whereNull('gadai_nota_leos.deleted_at')
  }
}
