import { DateTime } from 'luxon'
import {
  BaseModel,
  BelongsTo,
  belongsTo,
  column,
  hasMany,
  HasMany
} from '@ioc:Adonis/Lucid/Orm'
import Ka from 'App/Models/kas/Ka'
import Pengguna from '../akun/Pengguna'

export default class RekapHarian extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public apakahHariPasaran: boolean

  @column.date()
  public tanggalRekap: DateTime

  /** Calon Dipindah ke tabel baru */

  @column()
  public pasaran: string

  // ini penting banget buat banding stok sama IRL  
  @column()
  public apakahSudahBandingSaldo: boolean

  @column()
  public saldoTokoTerakhir: number

  @column()
  public saldoTokoReal: number

  @column.dateTime()
  public dibandingAt: DateTime | null

  @column()
  public pencatatBandingId: number | null

  @belongsTo(() => Pengguna, {
    foreignKey: 'pencatatBandingId'
  })
  public pencatatBanding: BelongsTo<typeof Pengguna>


  /** Mulai dari sini */

  // @column()
  // public totalNominalKasMasuk: number

  // @column()
  // public totalNominalKasKeluar: number

  // @column()
  // public saldoFinal: number

  // @column()
  // public selisihSaldoKemarin: number

  /** Sampe kesini, calon dihapus */

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime


  // FK dan relasi
  @hasMany(() => Ka)
  public kas: HasMany<typeof Ka>
}
