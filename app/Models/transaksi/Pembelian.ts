import { DateTime } from 'luxon'
import {
  BaseModel,
  column,
  hasOne,
  HasOne,
  belongsTo,
  BelongsTo,
  manyToMany,
  ManyToMany,
  beforeFetch,
  beforeFind,
  ModelQueryBuilderContract,
  scope
} from '@ioc:Adonis/Lucid/Orm'
// import DetailPembelianKhusus from 'App/Models/transaksi/DetailPembelianKhusus'
// import Kadar from 'App/Models/barang/Kadar'
import Model from 'App/Models/barang/Model'
// import DetailPembelianUmum from 'App/Models/transaksi/DetailPembelianUmum'
import Kerusakan from 'App/Models/barang/Kerusakan'
import Pengguna from 'App/Models/akun/Pengguna'
import KodeProduksi from '../barang/KodeProduksi'
import PembelianNotaLeo from './PembelianNotaLeo'
import Gadai from './Gadai'

type PembeliansQuery = ModelQueryBuilderContract<typeof Pembelian>


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

  @column()
  public keteranganTransaksi: string

  // ================================ KONPONEN FORM ===================================
  @column()
  public beratBarang: number

  @column()
  public asalToko: string

  @column()
  public keterangan: string


  // ================================ TRANSACTIONAL ===================================
  @column()
  public apakahTukarTambah: boolean

  @column()
  public apakahDitawar: boolean

  @column()
  public hargaBeliPerGramSeharusnya: number

  @column()
  public hargaBeliPerGramAkhir: number // kalo ditawar bakal nyimpen tawarannya

  @column()
  public hargaBeliSeharusnya: number

  @column()
  public hargaBeliAkhir: number // kalo ditawar bakal nyimpen tawarannya

  @column()
  public ongkosKerusakanTotal: number

  // ================================ CONSTRAIN ===================================
  
  @column.dateTime()
  public deletedAt: DateTime | null


  // ========================== GADAI, PERMINTAAN DOSEN ============================
  @column.dateTime()
  public maxGadaiAt: DateTime

  @column()
  public apakahDigadaikan: boolean

  @column.dateTime()
  public digadaiAt: DateTime | null

  @hasOne(() => Gadai)
  public gadai: HasOne<typeof Gadai>
  

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime



  // ========================== FK PENTING =====================================

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

  @hasOne(() => PembelianNotaLeo)
  public pembelianNotaLeo: HasOne<typeof PembelianNotaLeo>

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


  // disini decorators
  @beforeFetch()
  @beforeFind()
  public static withoutSoftDeletes(query: PembeliansQuery){
    query.whereNull('pembelians.deleted_at')
  }


  // ================================ SCOPE ==============================================
  public static formGadai = scope((query) => {
    query
      .where('apakah_digadaikan', true)
      .whereNull('deleted_at')
      // tanggalnya di cek manual
  })

}
