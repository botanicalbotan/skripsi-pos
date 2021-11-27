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
  public pasaran: string

  @column()
  public apakahHariPasaran: boolean

  @column.date()
  public tanggalRekap: DateTime

  @column()
  public totalNominalKasMasuk: number

  @column()
  public totalNominalKasKeluar: number

  @column()
  public apakahSudahBandingSaldo: boolean

  // somehow bisa milih bigInt, ku kasi gini buat jaga2
  @column()
  public saldoFinal: number

  @column()
  public selisihSaldoKemarin: number

  @column()
  public apakahAdaError: boolean

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime


  // FK dan relasi
  @hasMany(() => Ka)
  public kas: HasMany<typeof Ka>
}
