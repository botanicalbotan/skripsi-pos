import User from "App/Models/User";
import nodemailer from 'nodemailer';
import Env from '@ioc:Adonis/Core/Env'
import Drive from '@ioc:Adonis/Core/Drive'
import PasswordResetToken from "App/Models/akun/PasswordResetToken";
import { inet_ntoa } from './IPConverter'

const email = Env.get('SMTP_EMAIL')
const pass = Env.get('SMTP_PASS')
const DOMAIN = "http://127.0.0.1:3333"

export async function emailUbahPassword(user: User, passToken: PasswordResetToken) {

  let transporter = nodemailer.createTransport({
    host: "smtp-mail.outlook.com", //smtp.office365.com
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: email,
      pass: pass
    },
  });

  let url = DOMAIN + "/lupa-password/next?token=" + passToken.token

  const logoToko = (await Drive.exists('logos/logo-postoma.png') ? await Drive.get('logos/logo-postoma.png') : undefined)

  try {
    return await transporter.sendMail({
      from: {
        address: email,
        name: 'Team Postoma'
      },
      to: user.email, // list of receivers
      subject: 'Ubah password Postoma anda', // Subject line
      html: `
      <img src= "cid:logo-postoma-for-email" style="
      width:200px; 
      margin-bottom: 1rem; "
      /> <br>
  
      <div>Halo, ${ user.pengguna.nama }!<div><br>
  
      <div>Seseorang dengan IP ${inet_ntoa(passToken.clientIpv4)} mengirimkan permintaan pengubahan password untuk akun Postoma anda. Untuk melanjutkan proses pengubahan, klik link berikut dan ikuti arahan selanjutnya:<div><br>
  
      <a href='${url}' target='_blank' style="background-color: #4F6FBF;
      border: none;
      color: white;
      padding: 10px 24px;
      text-align: center;
      text-decoration: none;
      display: inline-block;
      font-size: 16px;">Klik disini</a><br><br>
  
      <div>Jika anda tidak mengetahui apa-apa perhial permintaan ini, cukup abaikan email ini dan akun Postoma anda akan baik-baik saja!</div><br>
  
      <div>Hormat kami,</div>
      <div>Team Postoma</div>
      `, // html body
      attachments: [{
        filename: 'logo-postoma.png',
        content: logoToko,
        cid: 'logo-postoma-for-email'
      }]
    })
  } catch (error) {
    console.error(error)
    console.error('ada error waktu ngirim email')
  }
  

}
