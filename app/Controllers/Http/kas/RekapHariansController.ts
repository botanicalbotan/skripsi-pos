import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import RekapHarian from 'App/Models/kas/RekapHarian'
import { DateTime } from 'luxon'

export default class RekapHariansController {
  public async index({ view, request }: HttpContextContract) {
    const opsiOrder = [
      'tanggal_rekap',
      'pasaran',
      'totalPemasukan',
      'totalPengeluaran',
      'saldo_toko_terakhir',
    ]
    const page = request.input('page', 1)
    const order = request.input('ob', 0)
    const arahOrder = request.input('aob', 0)
    const sanitizedOrder = order < opsiOrder.length && order >= 0 && order ? order : 0
    const sanitizedArahOrder = arahOrder == 1 ? 1 : 0
    const filterShow = request.input('fs', 0)
    const sanitizedFilterShow = filterShow == 1 ? 1 : 0
    const limit = 10

    const rekaps = await Database.from('rekap_harians')
      .select(
        'id',
        'pasaran',
        'tanggal_rekap as tanggalRekap',
        'apakah_hari_pasaran as apakahHariPasaran',
        'apakah_sudah_banding_saldo as apakahSudahBandingSaldo',
        'saldo_toko_terakhir as saldoTokoTerakhir',
        'saldo_toko_real as saldoTokoReal'
      )
      // .select(
      //   Database.from('koreksi_stoks')
      //     .count('koreksi_stoks.id')
      //     .whereRaw('DATE(koreksi_stoks.created_at) = DATE(rekap_harians.tanggal_rekap)')
      //     .as('jumlahKoreksiStok')
      // )
      .select(
        Database.from('penyesuaian_stoks')
          .count('penyesuaian_stoks.id')
          .where('penyesuaian_stoks.butuh_cek_ulang', true)
          .whereRaw('DATE(penyesuaian_stoks.created_at) = DATE(rekap_harians.tanggal_rekap)')
          .as('jumlahCekUlang')
      )
      .select(
        Database.from('penyesuaian_stoks')
          .count('penyesuaian_stoks.id')
          .whereNotColumn('penyesuaian_stoks.stok_tercatat', 'penyesuaian_stoks.stok_sebenarnya')
          .whereRaw('DATE(penyesuaian_stoks.created_at) = DATE(rekap_harians.tanggal_rekap)')
          .as('jumlahMasalah')
      )
      .if(
        sanitizedFilterShow == 1,
        (query) => {
          query
            .select(
              Database.raw(
                "(SELECT (SELECT IFNULL(SUM(kas.nominal), 0) FROM kas WHERE kas.rekap_harian_id = rekap_harians.id AND kas.apakah_kas_keluar = FALSE AND kas.deleted_at IS NULL) + (SELECT IFNULL(SUM(penjualans.harga_jual_akhir), 0) FROM penjualans WHERE DATE(penjualans.created_at) = DATE(rekap_harians.created_at) AND penjualans.deleted_at IS NULL)) as 'totalPemasukan'"
              )
            )
            .select(
              Database.raw(
                "(SELECT (SELECT IFNULL(SUM(kas.nominal), 0) FROM kas WHERE kas.rekap_harian_id = rekap_harians.id AND kas.apakah_kas_keluar = TRUE AND kas.deleted_at IS NULL) - (SELECT IFNULL(SUM(pembelians.harga_beli_akhir), 0) FROM pembelians WHERE DATE(pembelians.created_at) = DATE(rekap_harians.created_at) AND pembelians.deleted_at IS NULL)) as 'totalPengeluaran'"
              )
            )
        },
        (query) => {
          query
            .select(
              Database.raw(
                "(SELECT IFNULL(SUM(penjualans.harga_jual_akhir), 0) FROM penjualans WHERE DATE(penjualans.created_at) = DATE(rekap_harians.created_at) AND penjualans.deleted_at IS NULL) as 'totalPemasukan'"
              )
            )
            .select(
              Database.raw(
                "(SELECT IFNULL(-SUM(pembelians.harga_beli_akhir), 0) FROM pembelians WHERE DATE(pembelians.created_at) = DATE(rekap_harians.created_at) AND pembelians.deleted_at IS NULL) as 'totalPengeluaran'"
              )
            )
        }
      )
      .if(
        sanitizedOrder !== 0,
        (query) => {
          query
            .orderBy(opsiOrder[sanitizedOrder], sanitizedArahOrder == 1 ? 'desc' : 'asc')
            .orderBy('tanggal_rekap', 'desc')
        },
        (query) => {
          query.orderBy('tanggal_rekap', sanitizedArahOrder == 0 ? 'desc' : 'asc')
        }
      )

      .paginate(page, limit)

    rekaps.baseUrl('/app/kas/rekap-harian')

    let qsParam = {
      ob: sanitizedOrder,
      aob: sanitizedArahOrder,
    }

    if (sanitizedFilterShow !== 0) qsParam['fs'] = sanitizedFilterShow

    rekaps.queryString(qsParam)

    let firstPage =
      rekaps.currentPage - 2 > 0
        ? rekaps.currentPage - 2
        : rekaps.currentPage - 1 > 0
        ? rekaps.currentPage - 1
        : rekaps.currentPage
    let lastPage =
      rekaps.currentPage + 2 <= rekaps.lastPage
        ? rekaps.currentPage + 2
        : rekaps.currentPage + 1 <= rekaps.lastPage
        ? rekaps.currentPage + 1
        : rekaps.currentPage

    if (lastPage - firstPage < 4 && rekaps.lastPage > 4) {
      if (rekaps.currentPage < rekaps.firstPage + 2) {
        lastPage += 4 - (lastPage - firstPage)
      }

      if (lastPage == rekaps.lastPage) {
        firstPage -= 4 - (lastPage - firstPage)
      }
    }
    // sampe sini
    const tempLastData = 10 + (rekaps.currentPage - 1) * limit

    const tambahan = {
      pengurutan: sanitizedOrder,
      firstPage: firstPage,
      lastPage: lastPage,
      firstDataInPage: 1 + (rekaps.currentPage - 1) * limit,
      lastDataInPage: tempLastData >= rekaps.total ? rekaps.total : tempLastData,
      filter: sanitizedFilterShow,
    }

    const fungsi = {
      rupiahParser: rupiahParser,
      kapitalHurufPertama: kapitalHurufPertama,
      formatDate: formatDate,
    }

    let roti = [
      {
        laman: 'Pembukuan Kas',
        alamat: '/app/kas',
      },
      {
        laman: 'Rekap Harian',
      },
    ]

    return await view.render('kas/rekap-harian/list-rekap-harian', {
      rekaps,
      tambahan,
      fungsi,
      roti,
    })
  }

  public async show({ params, view, session, response }: HttpContextContract) {
    try {
      let tanggal = DateTime.fromISO(params.tanggal).startOf('day')
      if (!tanggal.isValid) throw 'tanggal ngga valid'

      const rekap = await RekapHarian.findByOrFail('tanggal_rekap', params.tanggal)
      await rekap.load('pencatatBanding', (query) => {
        query.preload('jabatan')
      })

      const kemarin = tanggal.minus({ days: 1 })
      const rekapKemarin = await RekapHarian.findBy('tanggal_rekap', kemarin.toISODate())

      const totalKasMasuk = await Database.from('kas')
        .sum('nominal', 'nominal')
        .count('*', 'count')
        .whereNull('deleted_at')
        .andWhere('apakah_kas_keluar', 0)
        .andWhereRaw('DATE(created_at) = DATE(?)', [rekap.tanggalRekap.toISO()])

      const totalKasKeluar = await Database.from('kas')
        .sum('nominal', 'nominal')
        .count('*', 'count')
        .whereNull('deleted_at')
        .andWhere('apakah_kas_keluar', 1)
        .andWhereRaw('DATE(created_at) = DATE(?)', [rekap.tanggalRekap.toISO()])

      const totalJual = await Database.from('penjualans')
        .sum('harga_jual_akhir', 'nominal')
        .whereNull('deleted_at')
        .whereRaw('DATE(created_at) = DATE(?)', [rekap.tanggalRekap.toISO()])

      const totalBeli = await Database.from('pembelians')
        .sum('harga_beli_akhir', 'nominal')
        .whereNull('deleted_at')
        .whereRaw('DATE(created_at) = DATE(?)', [rekap.tanggalRekap.toISO()])

      const anomaliStok = await Database.from('koreksi_stoks')
        .count('koreksi_stoks.id', 'jumlah')
        .whereRaw('DATE(koreksi_stoks.created_at) = DATE(?)', [rekap.tanggalRekap.toISO()])
        .first()

      const rekapPenjualan = {
        apakahKasKeluar: 0,
        nominal: totalJual[0].nominal | 0,
        perihal: 'Penjualan Barang',
        namaPencatat: 'Sistem',
        createdAt: rekap.tanggalRekap,
      }

      const rekapPembelian = {
        apakahKasKeluar: 1,
        nominal: -totalBeli[0].nominal | 0,
        perihal: 'Pembelian Barang',
        namaPencatat: 'Sistem',
        createdAt: rekap.tanggalRekap,
      }

      const penambahan = await Database.from('kelompok_penambahans')
        .count('id', 'totalKel')
        .sum('perubahan_stok', 'totalStok')
        .whereRaw('DATE(created_at) = DATE(?)', [rekap.tanggalRekap.toSQLDate()])
        .first()

      //----------------- ngeliat jumlah kelompok diabaikan ----------------------
      const kelompokMonitor = await Database.from('kelompoks')
        .count('id', 'jumlah')
        .where('apakah_dimonitor', '=', 1)
        .andWhereNull('deleted_at')
        .andWhereRaw('DATE(created_at) <= DATE(?)', [rekap.tanggalRekap.toSQLDate()]) // WAJIB
        .first()

      //---------------- sudah, belum, bermasalah -------------------------------
      const belumCek = await Database.from('kelompoks')
        .leftJoin('penyesuaian_stoks', (query) => {
          query.on('penyesuaian_stoks.kelompok_id', 'kelompoks.id').onExists((subQuery) => {
            subQuery
              .select('*')
              .from('penyesuaian_stoks as sub')
              .whereRaw('penyesuaian_stoks.id = sub.id')
              .whereRaw('DATE(sub.created_at) = DATE(?)', [rekap.tanggalRekap.toSQLDate()])
          })
        })
        .count('kelompoks.id', 'jumlah')
        .where('apakah_dimonitor', '=', 1)
        .andWhereRaw('DATE(kelompoks.created_at) <= DATE(?)', [rekap.tanggalRekap.toSQLDate()]) // WAJIB
        .andWhereNull('penyesuaian_stoks.id')
        .andWhereNull('kelompoks.deleted_at')
        .first()

      const sesuai = await Database.from('kelompoks')
        .leftJoin('penyesuaian_stoks', (query) => {
          query.on('penyesuaian_stoks.kelompok_id', 'kelompoks.id').onExists((subQuery) => {
            subQuery
              .select('*')
              .from('penyesuaian_stoks as sub')
              .whereRaw('penyesuaian_stoks.id = sub.id')
              .whereRaw('DATE(sub.created_at) = DATE(?)', [rekap.tanggalRekap.toSQLDate()])
          })
        })
        .count('kelompoks.id', 'jumlah')
        .where('apakah_dimonitor', '=', 1)
        .andWhere('butuh_cek_ulang', false)
        .andWhereNull('kelompoks.deleted_at')
        .andWhereRaw('DATE(kelompoks.created_at) <= DATE(?)', [rekap.tanggalRekap.toSQLDate()]) // WAJIB
        .andWhereNotNull('penyesuaian_stoks.stok_tercatat')
        .andWhereColumn('penyesuaian_stoks.stok_tercatat', 'penyesuaian_stoks.stok_sebenarnya')
        .first()

      const bermasalah = await Database.from('kelompoks')
        .leftJoin('penyesuaian_stoks', (query) => {
          query.on('penyesuaian_stoks.kelompok_id', 'kelompoks.id').onExists((subQuery) => {
            subQuery
              .select('*')
              .from('penyesuaian_stoks as sub')
              .whereRaw('penyesuaian_stoks.id = sub.id')
              .whereRaw('DATE(sub.created_at) = DATE(?)', [rekap.tanggalRekap.toSQLDate()])
          })
        })
        .count('kelompoks.id', 'jumlah')
        .where('apakah_dimonitor', '=', 1)
        .andWhere('butuh_cek_ulang', false)
        .andWhereNull('kelompoks.deleted_at')
        .andWhereRaw('DATE(kelompoks.created_at) <= DATE(?)', [rekap.tanggalRekap.toSQLDate()]) // WAJIB
        .andWhereNotNull('penyesuaian_stoks.id')
        .andWhereNotColumn('penyesuaian_stoks.stok_tercatat', 'penyesuaian_stoks.stok_sebenarnya')
        .first()

      const cekUlang = await Database.from('kelompoks')
        .leftJoin('penyesuaian_stoks', (query) => {
          query.on('penyesuaian_stoks.kelompok_id', 'kelompoks.id').onExists((subQuery) => {
            subQuery
              .select('*')
              .from('penyesuaian_stoks as sub')
              .whereRaw('penyesuaian_stoks.id = sub.id')
              .whereRaw('DATE(sub.created_at) = DATE(?)', [DateTime.now().toSQLDate()])
          })
        })
        .count('kelompoks.id', 'jumlah')
        .where('apakah_dimonitor', '=', 1)
        .andWhere('butuh_cek_ulang', true)
        .andWhereNull('kelompoks.deleted_at')
        .first()

      const fungsi = {
        rupiahParser: rupiahParser,
        kapitalHurufPertama: kapitalHurufPertama,
      }

      const tambahan = {
        totalKasMasuk: totalKasMasuk[0].nominal + rekapPenjualan.nominal,
        totalKasKeluar: totalKasKeluar[0].nominal + rekapPembelian.nominal,
        hitungKasMasuk: totalKasMasuk[0].count + 1,
        hitungKasKeluar: totalKasKeluar[0].count + 1,
        anomaliStok: anomaliStok.jumlah | 0,
        tanggalKemarin: kemarin,
      }

      let roti = [
        {
          laman: 'Pembukuan Kas',
          alamat: '/app/kas',
        },
        {
          laman: 'Rekap Harian',
          alamat: '/app/kas/rekap-harian',
        },
        {
          laman: rekap.tanggalRekap.toFormat('D'),
        },
      ]

      return await view.render('kas/rekap-harian/view-rekap-harian', {
        rekap,
        rekapKemarin,
        rekapPenjualan,
        rekapPembelian,
        fungsi,
        tambahan,
        roti,
        penambahan,
        penyesuaian: {
          kelompokMonitor: kelompokMonitor.jumlah,
          sesuai: sesuai.jumlah,
          bermasalah: bermasalah.jumlah,
          belumCek: belumCek.jumlah,
          cekUlang: cekUlang.jumlah
        },
      })
    } catch (error) {
      console.error(error)
      session.flash('alertError', 'Rekap harian yang anda pilih tidak valid!')
      return response.redirect('/app/kas/rekap-harian')
    }
  }
}

function kapitalHurufPertama(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1)
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

function formatDate(ISODate: string) {
  const tanggal = DateTime.fromISO(ISODate)

  if (tanggal.isValid) {
    return tanggal.toISODate()
  } else {
    return 'error'
  }
}
