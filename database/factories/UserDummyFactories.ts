import Factory from '@ioc:Adonis/Lucid/Factory'
import { DateTime } from 'luxon'
import User from 'App/Models/User'
import Pengguna from 'App/Models/akun/Pengguna'
// import Jabatan from 'App/Models/akun/Jabatan'

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

let gacha = (getRandomInt(2) !== 1)

export const PenggunaFactory = Factory
  .define(Pengguna, ({ faker }) => {
      faker.locale = "id_ID"
      return{
          nama: faker.name.findName(),
          gender: (getRandomInt(2) === 1)? 'L': 'P',
          tempatLahir: faker.address.cityName(),
          tanggalLahir: DateTime.fromJSDate(faker.date.past(50)),
          lamaKerja: getRandomInt(10),
          alamat: faker.address.cityName(),
          nohpAktif: '08' + Math.floor(1000000000 + Math.random() * 9000000000).toString(),
          apakahPegawaiAktif: gacha,
          tanggalGajianSelanjutnya: (gacha)? DateTime.local().plus({ days: getRandomInt(25) }) : null,
          tanggalMulaiAktif: (gacha)? DateTime.local() : null,
          tanggalGajianTerakhir: (gacha)? DateTime.local() : null,
          gajiBulanan: 1000000,
          jabatanId: getRandomInt(2)+1
      }
  })
  .build()

export const UserFactory = Factory
    .define(User, ({ faker }) => {
        faker.locale = "id_ID"
        return{
            email: faker.internet.email(),
            username: faker.name.firstName().toLocaleLowerCase() + DateTime.now().second.toString(),
            password: 'admin'
        }
    })
    .relation('pengguna', () => PenggunaFactory)
    .build()
