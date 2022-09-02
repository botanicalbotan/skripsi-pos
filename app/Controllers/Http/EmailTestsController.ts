import type {
  HttpContextContract
} from '@ioc:Adonis/Core/HttpContext'
import nodemailer from 'nodemailer'
import Env from '@ioc:Adonis/Core/Env'

const email = Env.get('SMTP_EMAIL')
const pass = Env.get('SMTP_PASS')
// const port = Env.get('SMTP_PORT')

export default class EmailTestsController {
  public async kirimSekali({}: HttpContextContract) {

    let transporter = nodemailer.createTransport({
      host: "mail.botanicalbotan.com", //smtp.office365.com
      port: 465, // kalau mau tes 587
      secure: true, // true for 465, false for other ports
      auth: {
        user: email,
        pass: pass
      },
    });

    try {
      let info = await transporter.sendMail({
        from: email, // sender address
        to: 'ariaoneesama@gmail.com', // list of receivers
        subject: 'Hello ' + new Date().toLocaleString(), // Subject line
        text: "Hello world?", // plain text body
        html: "<b>Hello world </b><br> This is the first email sent with Nodemailer in Node.js", // html body
      })

      return "Message sent: %s" + info.messageId
    } catch (error) {
      return 'ada error: ' + error
    }

  }

  public async kirimBanyak({}: HttpContextContract) {
    const data2 = [{
        nama: 'Andi Keriting',
        email: 'ariaoneesama@gmail.com'
      }, {
        nama: 'Semar setiawan',
        email: 'neoarifania@gmail.com'
      },
      {
        nama: 'Budi balado',
        email: 'rico00730@gmail.com'
      },
      {
        nama: 'Mobius kukus',
        email: 'mricopratamaputra@gmail.com'
      },
    ]

    let emailTerkirim = 0
    let emailError = 0
    let pesanError = ''

    async function puter() {

      for (const item of data2) {
        let transporter = nodemailer.createTransport({
          host: "smtp-mail.outlook.com", //smtp.office365.com
          port: 587,
          secure: false, // true for 465, false for other ports
          auth: {
            user: email,
            pass: pass
          },
        });

        try {
          await transporter.sendMail({
            from: email, // sender address
            to: item.email, // list of receivers
            subject: 'Hello ' + item.nama + new Date().toLocaleString(), // Subject line
            text: "Hello world?", // plain text body
            html: "<b>Hello world </b><br> This is the first email sent with Nodemailer in Node.js", // html body
          })

          console.log('Email terkirim')
          emailTerkirim += 1
        } catch (error) {
          emailError += 1
          pesanError = error
        }

        transporter.close()
      }
    }

    await puter()

    return {
      emailTerkirim,
      emailError,
      pesanError
    }

  }

  public async kirimBanyakPakePool({}: HttpContextContract) {
    const data2 = [{
        nama: 'Budi balado',
        email: 'rico00730@gmail.com'
      }, {
        nama: 'Mobius kukus',
        email: 'mricopratamaputra@gmail.com'
      },
      {
        nama: 'Andi Keriting',
        email: 'ariaoneesama@gmail.com'
      },
      {
        nama: 'Semar setiawan',
        email: 'neoarifania@gmail.com'
      },
    ]

    console.log('=================================')

    let emailTerkirim = 0
    let emailError = 0
    let pesanError = ''

    async function puter() {
      let transporter = nodemailer.createTransport({
        pool: true,
        host: "smtp-mail.outlook.com", //smtp.office365.com
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: email,
          pass: pass
        },
      });

      for (const item of data2) {

        try {
          await transporter.sendMail({
            from: email, // sender address
            to: item.email, // list of receivers
            subject: 'Hello Pool ' + item.nama + new Date().toLocaleString(), // Subject line
            text: "Hello world?", // plain text body
            html: "<b>Hello world </b><br> This is the first email sent with Nodemailer in Node.js", // html body
          })

          console.log('Email terkirim')
          emailTerkirim += 1
        } catch (error) {
          emailError += 1
          pesanError = error
        }

      }      
      
    }

    await puter()

    return {
      emailTerkirim,
      emailError,
      pesanError
    }

  }
}
