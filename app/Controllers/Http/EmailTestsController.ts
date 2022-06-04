import type {
  HttpContextContract
} from '@ioc:Adonis/Core/HttpContext'
const nodemailer = require('nodemailer')

export default class EmailTestsController {
  public async kirimSekali({}: HttpContextContract) {

    let transporter = nodemailer.createTransport({
      host: "smtp-mail.outlook.com", //smtp.office365.com
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: "apakektesting@outlook.com",
        pass: "TestingAkun1234"
      },
    });

    try {
      let info = await transporter.sendMail({
        from: 'apakektesting@outlook.com', // sender address
        to: 'neoarifania@gmail.com', // list of receivers
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
            user: "apakektesting@outlook.com",
            pass: "TestingAkun1234"
          },
        });

        try {
          let info = await transporter.sendMail({
            from: 'apakektesting@outlook.com', // sender address
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
          user: "apakektesting@outlook.com",
          pass: "TestingAkun1234"
        },
      });

      for (const item of data2) {

        try {
          let info = await transporter.sendMail({
            from: 'apakektesting@outlook.com', // sender address
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
