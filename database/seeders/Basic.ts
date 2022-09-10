import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'

import Pengaturan from 'App/Models/sistem/Pengaturan'
import Bentuk from 'App/Models/barang/Bentuk'
import Kadar from 'App/Models/barang/Kadar'
import Jabatan from 'App/Models/akun/Jabatan'
import User from 'App/Models/User'
import Pasaran from 'App/Models/sistem/Pasaran'
// import RentangUsia from 'App/Models/transaksi/RentangUsia'
import StatusGadai from 'App/Models/transaksi/StatusGadai'
import TipeNotif from 'App/Models/sistem/TipeNotif'
import {
  DateTime,
  Settings
} from 'luxon'

export default class BasicSeeder extends BaseSeeder {
  public async run() {

    // cukup panggil seeder ini SEKALI aja

    /** Seeder ini dipake buat ngisi data tabel static berikut:
     * - pengaturan
     * - bentuk perhiasan
     * - kadar perhiasan
     * - jabatan
     * - pasaran
     * - rentang usia
     * - status gadai
     * - model perhiasan (lainnya buat semua bentuk) -> ditaro di faker aja kali ya
     * - kerusakan mau ditambahin sekalian? gausah pake faker tp seedernya dipisah
     *
     *  Seeder ini juga dipake buat ngebikin 1 super user / pemilik, yang gabisa dibikin pake cara lain
     */

    await Pengaturan.create({
      namaToko: 'Toko Mas Leo',
      alamatTokoLengkap: 'Alamat Toko Anda',
      alamatTokoSingkat: 'Timur Pasar Karanggede - BOYOLALI',
      toleransiSusutBerat: 0,
      defaultWaktuMaksimalPrintNota: 30, // menit
      defaultWaktuMaksimalPengajuanGadai: 30, // menit
      penaltiTelatJanjiMin: 5000,
      penaltiTelatJanjiMax: 10000,
      saldoToko: 200000000,
      hargaMal: 800000,
      defaultStokMinimalKelompok: 0,
      // ntar ganti jadi false kalo dah jalan
      defaultBolehPrintNota: true,
      defaultIngatkanStokMenipis: true,
      defaultGajiKaryawan: 1000000,
    })


    await Jabatan.createMany([{
        nama: 'Karyawan'
      },
      {
        nama: 'Kepala Toko'
      },
      {
        nama: 'Pemilik'
      }
    ])

    Settings.defaultZone = 'Asia/Jakarta'

    const jabatanPemilik = await Jabatan.findByOrFail('nama', 'Pemilik')
    const userBaru = await User.create({
      username: 'admin',
      email: 'testbotan@gmail.com',
      password: 'admin'
    })

    const penggunaBaru = await userBaru.related('pengguna').create({
      nama: 'Testing Admin',
      super: true,
      gender: 'L',
      alamat: 'Klego',
      nohpAktif: '0888888888',
      apakahPegawaiAktif: true,
      gajiBulanan: 1000000,
      jabatanId: jabatanPemilik.id,
      tempatLahir: 'Semarang',
      tanggalLahir: DateTime.now(),
    })

    await Bentuk.createMany([{
        bentuk: 'Anting',
        kode: 'ATG'
      },
      {
        bentuk: 'Cincin',
        kode: 'CC'
      },
      {
        bentuk: 'Gelang',
        kode: 'GL'
      },
      {
        bentuk: 'Kalung',
        kode: 'KL'
      },
      {
        bentuk: 'Liontin',
        kode: 'LT'
      },
      {
        bentuk: 'Tindik',
        kode: 'TD'
      },
      {
        bentuk: 'Lainnya',
        kode: 'Lain'
      },
    ])

    const bentuk1 = await Bentuk.findOrFail(1)
    await bentuk1.related('models').create({
      nama: 'Model Anting Lainnya',
      apakahPlaceholder: true,
      deskripsi: 'Model ini adalah placeholder bila model perhiasan belum terdefinisikan di sistem',
      penggunaId: penggunaBaru.id
    })
    const bentuk2 = await Bentuk.findOrFail(2)
    await bentuk2.related('models').create({
      nama: 'Model Cincin Lainnya',
      apakahPlaceholder: true,
      deskripsi: 'Model ini adalah placeholder bila model perhiasan belum terdefinisikan di sistem',
      penggunaId: penggunaBaru.id
    })
    const bentuk3 = await Bentuk.findOrFail(3)
    await bentuk3.related('models').create({
      nama: 'Model Gelang Lainnya',
      apakahPlaceholder: true,
      deskripsi: 'Model ini adalah placeholder bila model perhiasan belum terdefinisikan di sistem',
      penggunaId: penggunaBaru.id
    })
    const bentuk4 = await Bentuk.findOrFail(4)
    await bentuk4.related('models').create({
      nama: 'Model Kalung Lainnya',
      apakahPlaceholder: true,
      deskripsi: 'Model ini adalah placeholder bila model perhiasan belum terdefinisikan di sistem',
      penggunaId: penggunaBaru.id
    })
    const bentuk5 = await Bentuk.findOrFail(5)
    await bentuk5.related('models').create({
      nama: 'Model Liontin Lainnya',
      apakahPlaceholder: true,
      deskripsi: 'Model ini adalah placeholder bila model perhiasan belum terdefinisikan di sistem',
      penggunaId: penggunaBaru.id
    })
    const bentuk6 = await Bentuk.findOrFail(6)
    await bentuk6.related('models').create({
      nama: 'Model Tindik Lainnya',
      apakahPlaceholder: true,
      deskripsi: 'Model ini adalah placeholder bila model perhiasan belum terdefinisikan di sistem',
      penggunaId: penggunaBaru.id
    })
    const bentuk7 = await Bentuk.findOrFail(7)
    await bentuk7.related('models').create({
      nama: 'Model Lain dari Bentuk Lainnya',
      apakahPlaceholder: true,
      deskripsi: 'Model ini adalah placeholder bila model perhiasan belum terdefinisikan di sistem',
      penggunaId: penggunaBaru.id
    })

    await Kadar.createMany([{
        nama: 'Tanggung',
        deskripsi: 'Perhiasan dengan kadar kandungan emas mulai dari 35% hingga 45%',
        warnaNota: '#ff0000', // bisa nama, bisa HEX
        apakahPotonganPersen: false,
        persentaseMalRosok: 40,
        persentaseMalUripan: 42,
        toleransiPenguranganPotonganMin: 1000,
        toleransiPenguranganPotonganMax: 3000,
        marginPersenUntungUripanMin: 0,
        marginPersenUntungUripanMax: 0,
        marginPersenUntungUripanTtMin: 0,
        marginPersenUntungUripanTtMax: 0,
        marginPersenUntungRosokMin: 0,
        marginPersenUntungRosokMax: 0,
        marginPersenUntungRosokTtMin: 0,
        marginPersenUntungRosokTtMax: 0
      },
      {
        nama: 'Muda',
        deskripsi: 'Perhiasan dengan kadar kandungan emas kurang dari 30%',
        warnaNota: '#FFD700', // bisa nama, bisa HEX
        apakahPotonganPersen: false,
        persentaseMalRosok: 20,
        persentaseMalUripan: 22,
        toleransiPenguranganPotonganMin: 1000,
        toleransiPenguranganPotonganMax: 3000,
        marginPersenUntungUripanMin: 0,
        marginPersenUntungUripanMax: 0,
        marginPersenUntungUripanTtMin: 0,
        marginPersenUntungUripanTtMax: 0,
        marginPersenUntungRosokMin: 0,
        marginPersenUntungRosokMax: 0,
        marginPersenUntungRosokTtMin: 0,
        marginPersenUntungRosokTtMax: 0
      },
      {
        nama: 'Tua',
        deskripsi: 'Perhiasan dengan kadar kandungan emas lebih dari 70%',
        warnaNota: '#0000ff', // bisa nama, bisa HEX
        apakahPotonganPersen: true,
        persentaseMalRosok: 70,
        persentaseMalUripan: 72,
        toleransiPenguranganPotonganMin: 1,
        toleransiPenguranganPotonganMax: 2,
        marginPersenUntungUripanMin: 0,
        marginPersenUntungUripanMax: 0,
        marginPersenUntungUripanTtMin: 0,
        marginPersenUntungUripanTtMax: 0,
        marginPersenUntungRosokMin: 0,
        marginPersenUntungRosokMax: 0,
        marginPersenUntungRosokTtMin: 0,
        marginPersenUntungRosokTtMax: 0
      },
    ])

    // bikin pasaran
    await Pasaran.createMany([{
        hari: 'pon',
        referensiTanggal: DateTime.fromISO('2021-07-01')
      },
      {
        hari: 'wage',
        referensiTanggal: DateTime.fromISO('2021-07-02')
      },
      {
        hari: 'kliwon',
        referensiTanggal: DateTime.fromISO('2021-07-03')
      },
      {
        hari: 'legi',
        referensiTanggal: DateTime.fromISO('2021-07-04')
      },
      {
        hari: 'pahing',
        referensiTanggal: DateTime.fromISO('2021-07-05')
      },
    ])

    // kalau mau ngeset pasaran, tp ngga usah
    // let pasaranPon = await Pasaran.findByOrFail('hari', 'pon')
    // await pengaturan.related('pasarans').attach([pasaranPon.id])

    // kalau mau make rentang usia, tp buat sekarang ngga dulu
    // await RentangUsia.createMany([{
    //     golongan: 'Muda',
    //     deskripsi: 'Rentang usia 15-24 tahun'
    //   },
    //   {
    //     golongan: 'Dewasa / Pekerja',
    //     deskripsi: 'Rentang usia 19-59 tahun'
    //   },
    //   {
    //     golongan: 'Lansia / Pensiun',
    //     deskripsi: 'Rentang usia 60 tahun keatas'
    //   },
    // ])

    await StatusGadai.createMany([{
        status: 'berjalan'
      },
      {
        status: 'selesai'
      },
      {
        status: 'terlambat'
      },
      {
        status: 'dibatalkan'
      }
    ])


    // sementara disini dulu, kalo banyak baru dipisah
    await TipeNotif.create({
      nama: 'Penggajian',
      kode: 'pg',
      sintaksJudul: 'Ada {jumlah} tagihan pembayaran gaji hari ini!',
      sintaksSubjudul: 'Klik disini untuk mereview tagihan penggajian'
    })

    await TipeNotif.create({
      nama: 'Gadai',
      kode: 'gd',
      sintaksJudul: 'Ada {jumlah} gadai yang terlambat hari ini!',
      sintaksSubjudul: 'Klik disini untuk mereview tagihan gadai'
    })
  }
}
