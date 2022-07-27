import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo, ModelQueryBuilderContract, beforeFetch, beforeFind } from '@ioc:Adonis/Lucid/Orm'
import Pembelian from 'App/Models/transaksi/Pembelian'

type NotaLeoQuery = ModelQueryBuilderContract<typeof PembelianNotaLeo>

export default class PembelianNotaLeo extends BaseModel {
  @column({ isPrimary: true })
  public id: number

 // ================================ TUKAR TAMBAH ===================================
  @column()
  public apakahJanjiTukarTambah: boolean

  @column()
  public apakahSudahDipakai: boolean  

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
  public potonganAkhir: number

  @column()
  public penaltiTelat: number

  @column()
  public ongkosPotonganTotal: number

  // ================================ OPSIONAL ===================================
  @column()
  public namaPemilik: string | null

  @column()
  public alamatPemilik: string | null


 // ================================ CONSTRAIN ===================================
  @column.dateTime()
  public deletedAt: DateTime | null



  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime



  // ================================ FK PENTING ===================================
  @column()
  public pembelianId: number

  @belongsTo(() => Pembelian)
  public pembelian: BelongsTo<typeof Pembelian>


  // disini decorators
  @beforeFetch()
  @beforeFind()
  public static withoutSoftDeletes(query: NotaLeoQuery){
    query.whereNull('pembelian_nota_leos.deleted_at')
  }
}
