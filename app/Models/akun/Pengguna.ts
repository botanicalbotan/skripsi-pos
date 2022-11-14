import { DateTime } from 'luxon'
import Jabatan from 'App/Models/akun/Jabatan'
import {
  BaseModel,
  column,
  belongsTo,
  BelongsTo,
  hasMany,
  HasMany,
  ModelQueryBuilderContract,
  beforeFetch,
  beforeFind,
} from '@ioc:Adonis/Lucid/Orm'
import Ka from 'App/Models/kas/Ka'
import User from 'App/Models/User'
import PenambahanStok from 'App/Models/barang/PenambahanStok'
import Gadai from 'App/Models/transaksi/Gadai'
import Pembelian from 'App/Models/transaksi/Pembelian'
import Penjualan from 'App/Models/transaksi/Penjualan'
import PenggajianPegawai from 'App/Models/akun/PenggajianPegawai'
import Notifikasi from 'App/Models/sistem/Notifikasi'
import KodeProduksi from 'App/Models/barang/KodeProduksi'
import Kelompok from 'App/Models/barang/Kelompok'
import Kerusakan from 'App/Models/barang/Kerusakan'
import Model from 'App/Models/barang/Model'
import KoreksiStok from 'App/Models/barang/KoreksiStok'
import PembayaranGadai from '../transaksi/PembayaranGadai'
import RekapHarian from '../kas/RekapHarian'

type PenggunaQuery = ModelQueryBuilderContract<typeof Pengguna>

export default class Pengguna extends BaseModel {
  @column({
    isPrimary: true,
  })
  public id: number

  @column()
  public super: boolean

  @column()
  public nama: string

  @column()
  public gender: string

  @column()
  public tempatLahir: string

  @column.date()
  public tanggalLahir: DateTime

  @column()
  public alamat: string

  @column()
  public nohpAktif: string

  @column()
  public apakahPegawaiAktif: boolean

  @column({
    serializeAs: null,
  })
  public foto?: string | null

  @column()
  public catatan: string | null

  @column()
  public gajiBulanan: number

  @column.dateTime()
  public deletedAt: DateTime | null

  @column.dateTime({
    autoCreate: true,
  })
  public createdAt: DateTime

  @column.dateTime({
    autoCreate: true,
    autoUpdate: true,
  })
  public updatedAt: DateTime

  // ini tambahan baru
  @column.date()
  public tanggalMulaiAktif: DateTime | null

  @column.date()
  public tanggalGajianSelanjutnya: DateTime | null

  @column.date()
  public tanggalGajianTerakhir: DateTime | null

  // di ++ tiap gajian
  @column()
  public kaliGajian: number

  // FK dan relasi
  @column()
  public jabatanId: number

  @belongsTo(() => Jabatan, {
    localKey: 'id',
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

  @hasMany(() => PenggajianPegawai, {
    foreignKey: 'pencatatGajianId',
    localKey: 'id',
  })
  public pencatatGajians: HasMany<typeof PenggajianPegawai>

  @hasMany(() => PenggajianPegawai, {
    foreignKey: 'penerimaGajiId',
    localKey: 'id',
  })
  public penerimaGajis: HasMany<typeof PenggajianPegawai>

  @hasMany(() => RekapHarian, {
    foreignKey: 'pencatatBandingId',
    localKey: 'id',
  })
  public pencatatBandingSaldo: HasMany<typeof RekapHarian>

  @hasMany(() => Notifikasi)
  public notifikasis: HasMany<typeof Notifikasi>

  @hasMany(() => PenambahanStok)
  public penambahanStoks: HasMany<typeof PenambahanStok>

  @hasMany(() => KoreksiStok)
  public koreksiStoks: HasMany<typeof KoreksiStok>

  @hasMany(() => Gadai)
  public gadais: HasMany<typeof Gadai>

  @hasMany(() => PembayaranGadai)
  public pembayaranGadais: HasMany<typeof PembayaranGadai>

  @hasMany(() => Penjualan)
  public penjualans: HasMany<typeof Penjualan>

  @hasMany(() => Pembelian)
  public pembelians: HasMany<typeof Pembelian>

  @hasMany(() => KodeProduksi)
  public kodeProduksis: HasMany<typeof KodeProduksi>

  @hasMany(() => Kelompok)
  public kelompoks: HasMany<typeof Kelompok>

  @hasMany(() => Kerusakan)
  public kerusakans: HasMany<typeof Kerusakan>

  @hasMany(() => Model)
  public models: HasMany<typeof Model>

  

  // ini decoratorss
  @beforeFetch()
  @beforeFind()
  public static withoutSoftDeletes(query: PenggunaQuery) {
    query.whereNull('penggunas.deleted_at')
  }
}
