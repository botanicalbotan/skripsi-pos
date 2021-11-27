import { DateTime } from 'luxon'
import Pasaran from 'App/Models/sistem/Pasaran'
import { 
  BaseModel, 
  column,
  manyToMany,
  ManyToMany 
} from '@ioc:Adonis/Lucid/Orm'

export default class Pengaturan extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public namaToko: string

  @column()
  public alamatToko: string

  @column()
  public deskripsiToko: string

  @column()
  public toleransiSusutBerat: number

  @column()
  public toleransiPersentaseTawaran: number

  @column()
  public saldoToko: number

  @column()
  public hargaMal: number

  @column()
  public defaultStokMinimalPerhiasan: number

  @column()
  public defaultBolehPrintNota: boolean

  @column()
  public defaultIngatkanStokMenipis: boolean

  @column()
  public defaultGajiKaryawan: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @manyToMany(() => Pasaran, {
    pivotTable: 'pengaturan_pasarans',
    localKey: 'id',
    pivotForeignKey: 'pengaturan_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'pasaran_id',
  })
  public pasarans: ManyToMany<typeof Pasaran>
}
