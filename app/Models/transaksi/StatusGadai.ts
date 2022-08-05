// import { DateTime } from 'luxon'
import {
  BaseModel,
  column,
  hasMany,
  HasMany
} from '@ioc:Adonis/Lucid/Orm'
import Gadai from 'App/Models/transaksi/Gadai'

export default class StatusGadai extends BaseModel {

  // Kalau ada error, coba definisiin tabelnya manual disini

  @column({ isPrimary: true })
  public id: number

  @column()
  public status: string

  // FK dan relasi
  @hasMany(() => Gadai)
  public gadais: HasMany<typeof Gadai>
}
