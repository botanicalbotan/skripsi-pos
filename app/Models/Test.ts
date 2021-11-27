import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Test extends BaseModel {

  // lu bisa ganti nama tabel disini
  // public static table = 'contoh'

  @column({ isPrimary: true })
  public id: number

  @column()
  public nama: string

  @column()
  public gender: string

  // tanggal lahir
  @column.date()
  public tanggallahir: DateTime

  @column()
  public phone: string

  @column()
  public pekerjaan: string

  @column()
  public lamakerja: number

  @column()
  public menikah: boolean

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
