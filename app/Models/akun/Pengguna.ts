import { DateTime } from 'luxon'
import Jabatan from 'App/Models/akun/Jabatan'
import {
  BaseModel,
  column,
  belongsTo,
  BelongsTo,
  hasMany,
  HasMany
} from '@ioc:Adonis/Lucid/Orm'
import Ka from 'App/Models/kas/Ka'
import KoreksiSaldo from 'App/Models/kas/KoreksiSaldo'
import User from 'App/Models/User'
import RekapRestok from 'App/Models/barang/RekapRestok'
import Gadai from 'App/Models/transaksi/Gadai'
import Pembelian from 'App/Models/transaksi/Pembelian'
import Penjualan from 'App/Models/transaksi/Penjualan'

export default class Pengguna extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public nama: string

  @column()
  public gender: string

  @column()
  public tempatLahir: string

  @column.date()
  public tanggalLahir: DateTime

  @column.date()
  public tanggalAwalMasuk: DateTime

  // lama kerja ini tahun
  @column()
  public lamaKerja: number

  @column()
  public alamat: string

  @column()
  public nohpAktif: string

  @column()
  public apakahPegawaiAktif: boolean

  @column()
  public foto: string

  @column.date()
  public tanggalGajian: DateTime

  @column()
  public gajiBulanan: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime


  // FK dan relasi
  @column()
  public jabatanId: number

  @belongsTo(() => Jabatan, {
    localKey: 'id'
  })
  public jabatan: BelongsTo<typeof Jabatan>

  @column()
  public userId: number

  @belongsTo(() => User, {
    localKey: 'id',
  })
  public user: BelongsTo<typeof User>

  @hasMany(() => Ka)
  public kas: HasMany<typeof Ka>

  @hasMany(() => KoreksiSaldo)
  public koreksiSaldos: HasMany<typeof KoreksiSaldo>

  @hasMany(() => RekapRestok)
  public rekapRestoks: HasMany<typeof RekapRestok>

  @hasMany(() => Gadai)
  public gadais: HasMany<typeof Gadai>

  @hasMany(() => Pembelian)
  public pembelians: HasMany<typeof Pembelian>

  @hasMany(() => Penjualan)
  public penjualans: HasMany<typeof Penjualan>
}
