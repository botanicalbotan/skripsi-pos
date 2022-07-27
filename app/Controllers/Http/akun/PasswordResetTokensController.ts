import type {
  HttpContextContract
} from '@ioc:Adonis/Core/HttpContext'
import PasswordResetToken from 'App/Models/akun/PasswordResetToken'
import User from 'App/Models/User'
import {
  emailUbahPassword
} from 'App/CustomClasses/EmailGenerator'

import {
  DateTime
} from 'luxon'

import {
  nanoid
} from 'nanoid'

import { schema, rules } from '@ioc:Adonis/Core/Validator'

import { inet_aton } from 'App/CustomClasses/IPConverter'

export default class PasswordResetTokensController {
  public async index({
    view
  }: HttpContextContract) {
    return await view.render('zguest/lupa-password')
  }

  public async cariKirim({
    request,
    response
  }: HttpContextContract) {
    const newRequestSchema = schema.create({
      un: schema.string({}, [
        rules.exists({
          table: 'users',
          column: 'username',
          where: {
            deleted_at: null
          }
        })
      ]),

      ip: schema.string({}, [
        rules.ip({ version: 4 })
      ])
    })

    const menit = 5 // bisa diganti

    try {
      const validrequest = await request.validate({ schema: newRequestSchema })

      const user = await User.findByOrFail('username', validrequest.un)
      await user.load('pengguna', (query) => {
        query.preload('jabatan')
      })

      if (!user.email) throw 'ngga ada email'
      if (user.pengguna.jabatan.nama !== 'Pemilik') throw 'bukan pemilik' // kepala toko bisa juga ngga ya?

      const latestReq = await PasswordResetToken
        .query()
        .where('user_id', user.id)
        .orderBy('expired_at', 'desc')
        .first()

      // kalo ada request yang masih aktif, ngga ngirim lagi
      if (!latestReq || latestReq.expiredAt < DateTime.now()) {
        // bikin token
        const reqBaru = await user.related('passwordResetTokens').create({
          token: nanoid(64),
          expiredAt: DateTime.now().plus({
            minutes: menit
          }),
          clientIpv4: inet_aton(validrequest.ip)
        })

        // kirim tokennya ke email
        // jangan ditunggu, lama, biarin aja ngirim dibelakang
        emailUbahPassword(user, reqBaru)
      }

      // nyensor email
      const pecah = user.email.split('@')
      const emailSensor = pecah[0][0] + '****' + pecah[0][pecah[0].length - 1] + '@' + pecah[1]

      return {
        sensor: emailSensor,
        menit
      }

    } catch (error) {
      return response.badRequest({
        error: 'Akun anda tidak ditemukan atau tidak memiliki akses perubahan password!'
      })
    }
  }

  public async indexNext({
    request,
    view,
    response,
    session
  }: HttpContextContract) {
    const token = request.input('token')

    try {
      const passToken = await PasswordResetToken.findByOrFail('token', token)
      if (passToken.expiredAt < DateTime.now()) throw new Error('expired')
      return await view.render('zguest/lupa-password-next')

    } catch (error) {
      session.flash('alertError', 'Permintaan tidak valid atau sudah kadaluarsa.')
      return response.redirect().toPath('/lupa-password')
    }
  }

  public async simpanUbahPass({
    request,
    response,
    session
  }: HttpContextContract) {
    const simpanPassSchema = schema.create({
      password: schema.string({ trim:true }),
      ip: schema.string({}, [
        rules.ip({ version: 4 })
      ]),
      token: schema.string({}, [
        rules.maxLength(64),
        rules.exists({
          table: 'password_reset_tokens',
          column: 'token',
        })
      ])
    })

    try {
      const validrequest = await request.validate({ schema: simpanPassSchema })

      const passToken = await PasswordResetToken.findByOrFail('token', validrequest.token)
      await passToken.load('user')

      if (passToken.expiredAt < DateTime.now()) throw new Error('expired')

      passToken.user.password = validrequest.password
      await passToken.user.save()

      passToken.expiredAt = DateTime.now()
      await passToken.save()
     
      session.flash('alertSukses', 'Password berhasil diubah. Silahkan masuk sistem dengan password baru anda.')
      return response.redirect().toPath('/login')

    } catch (error) {
      session.flash('alertError', 'Permintaan tidak valid atau sudah kadaluarsa.')
      return response.redirect().toPath('/lupa-password')
    }
  }
}
