import { DateTime } from 'luxon'
import {
  BaseModel,
  column,
  hasMany,
  HasMany
} from '@ioc:Adonis/Lucid/Orm'
import Ka from 'App/Models/kas/Ka'

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

  @column()
  public apakahSudahBandingSaldo: boolean

  @column()
  public apakahAdaError: boolean // ntar ganti error jadi anomali

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
