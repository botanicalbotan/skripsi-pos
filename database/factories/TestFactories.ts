// import Factory from '@ioc:Adonis/Lucid/Factory'

import Test from 'App/Models/Test'
import Factory from '@ioc:Adonis/Lucid/Factory'
import { DateTime } from 'luxon'

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

export const TestFactory = Factory
  .define(Test, ({ faker }) => {
    faker.locale = "id_ID"
    return {
      nama: faker.name.findName(),
      gender: (getRandomInt(2) === 1)? 'L':'P',
      tanggallahir: DateTime.fromJSDate(faker.date.past(60)),
      phone: '08' + Math.floor(1000000000 + Math.random() * 9000000000).toString(),
      pekerjaan: faker.name.jobTitle(),
      lamakerja: getRandomInt(20),
      menikah: getRandomInt(2) === 1
    }
  })
  .build()
