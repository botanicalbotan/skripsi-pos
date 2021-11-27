import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'

import Pengaturan from 'App/Models/sistem/Pengaturan'
import Bentuk from 'App/Models/barang/Bentuk'
import Kadar from 'App/Models/barang/Kadar'
import Jabatan from 'App/Models/akun/Jabatan'
import User from 'App/Models/User'
import Pengguna from 'App/Models/akun/Pengguna'
import Pasaran from 'App/Models/sistem/Pasaran'
import RentangUsia from 'App/Models/transaksi/RentangUsia'
import StatusGadai from 'App/Models/transaksi/StatusGadai'
import { DateTime, Settings } from 'luxon'

export default class BasicSeeder extends BaseSeeder {
  public async run () {

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
     * Seeder ini juga dipake buat ngebikin 1 super user / pemilik, yang gabisa dibikin pake cara lain
     */

    await Pengaturan.create({
      namaToko: 'Toko Anda',
      alamatToko: 'Alamat Toko Anda',
      deskripsiToko: 'Deskripsi Toko Anda',
      toleransiSusutBerat: 0,
      toleransiPersentaseTawaran: 0,
      saldoToko: 0,
      hargaMal: 0,
      defaultStokMinimalPerhiasan: 0,
      // ntar ganti jadi false kalo dah jalan
      defaultBolehPrintNota: true,
      defaultIngatkanStokMenipis: true,
      defaultGajiKaryawan: 1000000,
    })

    await Bentuk.createMany([
      {
        bentuk: 'Anting'
      },
      {
        bentuk: 'Cincin'
      },
      {
        bentuk: 'Gelang'
      },
      {
        bentuk: 'Kalung'
      },
      {
        bentuk: 'Liontin'
      },
      {
        bentuk: 'Tindik'
      },
      {
        bentuk: 'Lainnya'
      },
    ])

    const bentuk1 = await Bentuk.find(1)
    await bentuk1?.related('models').create({
      nama: 'Lainnya'
    })
    const bentuk2 = await Bentuk.find(2)
    await bentuk2?.related('models').create({
      nama: 'Lainnya'
    })
    const bentuk3 = await Bentuk.find(3)
    await bentuk3?.related('models').create({
      nama: 'Lainnya'
    })
    const bentuk4 = await Bentuk.find(4)
    await bentuk4?.related('models').create({
      nama: 'Lainnya'
    })
    const bentuk5 = await Bentuk.find(5)
    await bentuk5?.related('models').create({
      nama: 'Lainnya'
    })
    const bentuk6 = await Bentuk.find(6)
    await bentuk6?.related('models').create({
      nama: 'Lainnya'
    })
    const bentuk7 = await Bentuk.find(7)
    await bentuk7?.related('models').create({
      nama: 'Lainnya'
    })

    await Kadar.createMany([
      {
        nama: 'Tanggung',
        deskripsi: 'Perhiasan dengan kadar kandungan emas mulai dari 35% hingga 45%',
        hargaPerGramNormal: 0,
        hargaPerGramBaru: 0,
        potonganNormal: 0,
        potonganBaru: 0,
        apakahPotonganPersen: false
      },
      {
        nama: 'Muda',
        deskripsi: 'Perhiasan dengan kadar kandungan emas kurang dari 30%',
        hargaPerGramNormal: 0,
        hargaPerGramBaru: 0,
        potonganNormal: 0,
        potonganBaru: 0,
        apakahPotonganPersen: false
      },
      {
        nama: 'Tua',
        deskripsi: 'Perhiasan dengan kadar kandungan emas lebih dari 70%',
        hargaPerGramNormal: 0,
        hargaPerGramBaru: 0,
        potonganNormal: 0,
        potonganBaru: 0,
        apakahPotonganPersen: false
      },
    ])


    await Jabatan.createMany([
      {
        nama: 'Karyawan'
      },
      {
        nama: 'Karyawan Khusus'
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

    const pengguna = new Pengguna()
    pengguna.nama = 'Testing Admin'
    pengguna.gender= 'L'
    pengguna.alamat = 'Klego'
    pengguna.nohpAktif = '0888888888'
    pengguna.apakahPegawaiAktif = true
    pengguna.tanggalGajian = DateTime.now()
    pengguna.gajiBulanan = 1000000
    pengguna.userId = userBaru.id
    pengguna.jabatanId = jabatanPemilik.id
    pengguna.tempatLahir = 'Semarang'
    pengguna.tanggalLahir = DateTime.now()
    pengguna.tanggalAwalMasuk = DateTime.now()
    pengguna.lamaKerja = 0
    await pengguna.save()

    
    await Pasaran.createMany([
      {
        hari: 'Pon',
        referensiTanggal: DateTime.fromISO('2021-07-01')
      },
      {
        hari: 'Wage',
        referensiTanggal: DateTime.fromISO('2021-07-02')
      },
      {
        hari: 'Kliwon',
        referensiTanggal: DateTime.fromISO('2021-07-03')
      },
      {
        hari: 'Legi',
        referensiTanggal: DateTime.fromISO('2021-07-04')
      },
      {
        hari: 'Pahing',
        referensiTanggal: DateTime.fromISO('2021-07-05')
      },
    ])

    await RentangUsia.createMany([
      {
        golongan: 'Muda',
        deskripsi: 'Rentang usia 15-24 tahun'
      },
      {
        golongan: 'Dewasa / Pekerja',
        deskripsi: 'Rentang usia 19-59 tahun'
      },
      {
        golongan: 'Lansia / Pensiun',
        deskripsi: 'Rentang usia 60 tahun keatas'
      },
    ])

    await StatusGadai.createMany([
      {
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



  }
}
