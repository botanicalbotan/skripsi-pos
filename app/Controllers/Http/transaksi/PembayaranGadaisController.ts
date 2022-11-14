import type {
  HttpContextContract
} from '@ioc:Adonis/Core/HttpContext'
import Gadai from 'App/Models/transaksi/Gadai'
import {
  schema,
  rules
} from '@ioc:Adonis/Core/Validator'
import Pengaturan from 'App/Models/sistem/Pengaturan'
import User from 'App/Models/User'
import {
  prepareRekap
} from 'App/CustomClasses/CustomRekapHarian'
import Database from '@ioc:Adonis/Lucid/Database'
import StatusGadai from 'App/Models/transaksi/StatusGadai'
import PembayaranGadai from 'App/Models/transaksi/PembayaranGadai'
import {
  DateTime
} from 'luxon'

export default class PembayaranGadaisController {
  public async index({
    view,
    params,
    response,
    session
  }: HttpContextContract) {
    try {
      const gadai = await Gadai.findOrFail(params.idGadai)
      await gadai.load('statusGadai')
      await gadai.load('pembayaranGadais')

      let terbayar = 0
      for (const bayar of gadai.pembayaranGadais) {
        terbayar += bayar.nominal
      }

      const fungsi = {
        rupiahParser: rupiahParser,
        kapitalKalimat: kapitalKalimat
      }

      const tambahan = {
        terbayar,
        kekurangan: terbayar - gadai.nominalGadai
      }

      let roti = [
        {
          laman: 'Gadai',
          alamat: '/app/transaksi/gadai',
        },
        {
          laman: `Gadai ${rupiahParser(gadai.nominalGadai)} An. ${gadai.namaPenggadai}`,
          alamat: '/app/transaksi/gadai/' + gadai.id,
        },
        {
          laman: `Pembayaran`
        }
      ]

      return await view.render('transaksi/gadai/pembayaran/list-bayar-gadai', {
        gadai,
        fungsi,
        tambahan,
        roti
      })

    } catch (error) {
      session.flash('alertError', 'Ada kesalahan pada pencatatan pembayaran gadai, silahkan coba lagi nanti.')
      return response.redirect().toPath('/app/transaksi/gadai/' + params.idGadai)
    }


  }

  public async show({
    params,
    view,
    session,
    response
  }: HttpContextContract) {
    try {
      // ------ perlu di cek dulu idGadai sama id pembayarannya
      const pembayaran = await PembayaranGadai.findOrFail(params.id)

      if (pembayaran.gadaiId != params.idGadai) throw 'id gadai ngga sama'

      await pembayaran.load('pengguna', (query) => {
        query.preload('jabatan')
      })
      await pembayaran.load('gadai', (query) => {
        query.preload('statusGadai')
      })

      await pembayaran.load('gadai')

      const fungsi = {
        rupiahParser: rupiahParser,
        kapitalKalimat: kapitalKalimat
      }

      let roti = [
        {
          laman: 'Gadai',
          alamat: '/app/transaksi/gadai',
        },
        {
          laman: `Gadai ${rupiahParser(pembayaran.gadai.nominalGadai)} An. ${pembayaran.gadai.namaPenggadai}`,
          alamat: '/app/transaksi/gadai/' + pembayaran.gadai.id,
        },
        {
          laman: `Pembayaran`,
          alamat: `/app/transaksi/gadai/${pembayaran.gadai.id}/pembayaran`
        },
        {
          laman: pembayaran.judulPembayaran
        }
      ]

      return await view.render('transaksi/gadai/pembayaran/view-bayar-gadai', {
        pembayaran,
        fungsi,
        roti
      })

    } catch (error) {
      session.flash('alertError', 'Pembayaran yang anda pilih dihapus atau tidak valid!')
      return response.redirect().toPath('/app/transaksi/gadai/' + params.idGadai + '/pembayaran')
    }
  }

  public async create({
    params,
    view,
    session,
    response
  }: HttpContextContract) {
    try {
      const gadai = await Gadai.findOrFail(params.idGadai)
      await gadai.load('statusGadai')
      await gadai.load('pembayaranGadais')

      if (gadai.statusGadai.status === 'selesai' || gadai.statusGadai.status === 'dibatalkan') throw 'Ga boleh akses yang dah tuntas'

      let terbayar = 0
      for (const bayar of gadai.pembayaranGadais) {
        terbayar += bayar.nominal
      }

      const fungsi = {
        rupiahParser: rupiahParser
      }

      const tambahan = {
        terbayar,
        kekurangan: terbayar - gadai.nominalGadai
      }

      let roti = [
        {
          laman: 'Gadai',
          alamat: '/app/transaksi/gadai',
        },
        {
          laman: `Gadai ${rupiahParser(gadai.nominalGadai)} An. ${gadai.namaPenggadai}`,
          alamat: '/app/transaksi/gadai/' + gadai.id,
        },
        {
          laman: `Pembayaran`,
          alamat: `/app/transaksi/gadai/${gadai.id}/pembayaran`
        },
        {
          laman: 'Baru'
        }
      ]

      return await view.render('transaksi/gadai/pembayaran/form-bayar-gadai', {
        gadai,
        fungsi,
        tambahan,
        roti
      })
    } catch (error) {
      console.error('error create')
      session.flash('alertError', 'Ada kesalahan pada pencatatan pembayaran gadai, silahkan coba lagi nanti.')
      return response.redirect().toPath(`/app/transaksi/gadai/${params.id}/pembayaran`)
    }
  }

  public async store({
    auth,
    response,
    request,
    session,
    params
  }: HttpContextContract) {
    const newPembayaranSchema = schema.create({
      nominal: schema.number([rules.unsigned()]),
      keterangan: schema.string({
        trim: true
      }, [rules.maxLength(100)]),
    })

    const validrequest = await request.validate({
      schema: newPembayaranSchema
    })

    try {
      if (!auth.user) throw 'auth ngga valid'

      const userPengakses = await User.findOrFail(auth.user.id)
      await userPengakses.load('pengguna')

      const gadai = await Gadai.findOrFail(params.idGadai)
      await gadai.load('statusGadai')
      await gadai.load('pembayaranGadais')

      // --------------- cek tuntas ------------------------
      if (gadai.statusGadai.status === 'selesai' || gadai.statusGadai.status === 'dibatalkan') throw 'Ga boleh akses yang dah tuntas'

      // -------------- cek yang udah kebayar --------------
      let terbayar = 0
      for (const bayar of gadai.pembayaranGadais) {
        terbayar += bayar.nominal
      }

      let kekurangan = terbayar - gadai.nominalGadai // ini mesti negatif

      if (validrequest.nominal + kekurangan > 0) throw { // makanya di plus, bukan di minus
        custom: true,
        error: 'Nominal pembayaran tidak boleh lebih besar dari kekurangan pembayaran!'
      }

      const cekUrutan = await Database
        .from('pembayaran_gadais')
        .count('id', 'urutan')
        .where('gadai_id', gadai.id)

      const judul = 'Pembayaran gadai #' + (parseInt(cekUrutan[0].urutan) + 1)

      // ----------- simpen data --------------
      await gadai.related('pembayaranGadais').create({
        keterangan: validrequest.keterangan,
        nominal: validrequest.nominal,
        penggunaId: userPengakses.pengguna.id,
        judulPembayaran: judul
      })

      // ---------- disimpen ke kas ------------
      const rekapHarian = await prepareRekap()
      await rekapHarian.related('kas').create({
        nominal: validrequest.nominal,
        apakahDariSistem: true,
        apakahKasKeluar: false,
        perihal: `${judul} An. ${gadai.namaPenggadai} dengan tenggat ${gadai.tanggalTenggat.toFormat('D')}`,
        penggunaId: userPengakses.pengguna.id
      })

      // ---------- ngubah saldo toko ----------
      const pengaturan = await Pengaturan.findOrFail(1)
      pengaturan.saldoToko += validrequest.nominal
      await pengaturan.save()


      // --------- ganti status kalo dah lunas ------------
      let newTerbayar = terbayar + validrequest.nominal
      if (gadai.nominalGadai - newTerbayar <= 0) {
        const statusBaru = await StatusGadai.findByOrFail('status', 'selesai')
        gadai.statusGadaiId = statusBaru.id
        await gadai.save()
      }

      session.flash('alertSukses', 'Pembayaran gadai berhasil dicatat!')
      return response.redirect().toPath(`/app/transaksi/gadai/${params.idGadai}/pembayaran`)

    } catch (error) {
      if (error.custom) {
        session.flash('alertError', error.error)
      } else {
        session.flash('alertError', 'Ada kesalahan pada pencatatan pembayaran gadai, silahkan coba lagi nanti.')
      }

      console.error(error)
      return response.redirect().back()
    }
  }

  public async destroy({
    params,
    response,
    session,
    auth
  }: HttpContextContract) {
    try {
      if (!auth.user) throw 'auth ngga valid'
      const userPengakses = await User.findOrFail(auth.user.id)
      await userPengakses.load('pengguna')

      const pembayaran = await PembayaranGadai.findOrFail(params.id)
      if (pembayaran.gadaiId != params.idGadai) throw 'id gadai ngga sama'
      await pembayaran.load('gadai', (query) => {
        query.preload('statusGadai')
      })

      // ---------- set softdelete -------------
      pembayaran.deletedAt = DateTime.now()
      await pembayaran.save()

      // ---------- set status gadai ----------
      if (pembayaran.gadai.statusGadai.status === 'selesai') {
        if (pembayaran.gadai.tanggalTenggat.startOf('day') < DateTime.now().startOf('day')) {
          const statusBaru = await StatusGadai.findByOrFail('status', 'terlambat')
          pembayaran.gadai.statusGadaiId = statusBaru.id
        } else {
          const statusBaru = await StatusGadai.findByOrFail('status', 'berjalan')
          pembayaran.gadai.statusGadaiId = statusBaru.id
        }
        await pembayaran.gadai.save()
      }

      // ---------- ngabarin kas --------------
      const rekapHarian = await prepareRekap()
      await rekapHarian.related('kas').create({
        nominal: -Math.abs(pembayaran.nominal),
        apakahDariSistem: true,
        apakahKasKeluar: true,
        perihal: `Pembatalan dan pengembalian ${ pembayaran.judulPembayaran.toLowerCase() } An. ${ pembayaran.gadai.namaPenggadai }`,
        penggunaId: userPengakses.pengguna.id
      })

      // ---------- ngubah saldo toko ----------
      const pengaturan = await Pengaturan.findOrFail(1)
      pengaturan.saldoToko -= pembayaran.nominal
      await pengaturan.save()

      return response.redirect().toPath('/app/transaksi/gadai/' + params.idGadai + '/pembayaran')

    } catch (error) {
      session.flash('alertError', 'Ada masalah saat menghapus data pembayaran. Silahkan coba lagi setelah beberapa saat.')
      return response.redirect().back()
    }
  }
}


function rupiahParser(angka: number) {
  if (typeof angka == 'number') {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(angka)
  } else {
    return 'error'
  }
}

function kapitalHurufPertama(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

function kapitalKalimat(text: string) {
  let pure = text.split(' ')
  let newText = ''
  for (let i = 0; i < pure.length; i++) {
    newText += kapitalHurufPertama(pure[i])
    if (i !== pure.length - 1) {
      newText += ' '
    }
  }
  return newText
}
