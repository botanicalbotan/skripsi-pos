import { DateTime } from 'luxon'
import {
  BaseModel,
  column,
  manyToMany,
  ManyToMany
} from '@ioc:Adonis/Lucid/Orm'
import Pengaturan from 'App/Models/sistem/Pengaturan'

export default class Pasaran extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public hari: string

  @column.date()
  public referensiTanggal: DateTime

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime



  // FK dan relasi
  @manyToMany(() => Pengaturan, {
    pivotTable: 'pengaturan_pasarans',
    localKey: 'id',
    pivotForeignKey: 'pasaran_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'pengaturan_id',
  })
  public pengaturans: ManyToMany<typeof Pengaturan>
}
