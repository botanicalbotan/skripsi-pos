const { join } = require('path')
const Encore = require('@symfony/webpack-encore')

/*
|--------------------------------------------------------------------------
| Encore runtime environment
|--------------------------------------------------------------------------
*/
if (!Encore.isRuntimeEnvironmentConfigured()) {
  Encore.configureRuntimeEnvironment(process.env.NODE_ENV || 'dev')
}

/*
|--------------------------------------------------------------------------
| Output path
|--------------------------------------------------------------------------
|
| The output path for writing the compiled files. It should always
| be inside the public directory, so that AdonisJS can serve it.
|
*/
Encore.setOutputPath('./public/assets')

/*
|--------------------------------------------------------------------------
| Public URI
|--------------------------------------------------------------------------
|
| The public URI to access the static files. It should always be
| relative from the "public" directory.
|
*/
Encore.setPublicPath('/assets')

/*
|--------------------------------------------------------------------------
| Entrypoints
|--------------------------------------------------------------------------
|
| Entrypoints are script files that boots your frontend application. Ideally
| a single entrypoint is used by majority of applications. However, feel
| free to add more (if required).
|
| Also, make sure to read the docs on "Assets bundler" to learn more about
| entrypoints.
|
*/
Encore.addEntry('app', './resources/js/app.js')
Encore.addEntry('guest', './resources/js/guest.js')
// Encore.addEntry('welcome-css', '/resources/css/template-welcome.css')
Encore.addEntry('landing', './resources/js/landing.js')
Encore.addEntry('beranda', './resources/js/beranda.js')

// library
Encore.addEntry('alpine', './resources/js/lib/alpine.js')

// Notifikasi
Encore.addEntry('all-notifikasi', './resources/js/sistem/notifikasi/all-notifikasi.js')

// Pembukuan Kas
Encore.addEntry('all-kas', './resources/js/pembukuan-kas/all-kas.js')
Encore.addEntry('all-rekap', './resources/js/pembukuan-kas/all-rekap.js')

// Riwayat ================================================
Encore.addEntry('all-riwayat-jual', './resources/js/riwayat/all-riwayat-jual.js')
Encore.addEntry('all-riwayat-beli', './resources/js/riwayat/all-riwayat-beli.js')


// Transaksi ==============================================
// Penjualan =======================================
Encore.addEntry('prepare-jual', './resources/js/transaksi/penjualan/prepare-jual.js')
Encore.addEntry('form-jual', './resources/js/transaksi/penjualan/form-jual.js')
Encore.addEntry('pasca-jual', './resources/js/transaksi/penjualan/pasca-jual.js')
Encore.addEntry('view-jual', './resources/js/transaksi/penjualan/view-jual.js')

Encore.addEntry('form-beli', './resources/js/transaksi/pembelian/form-beli.js')
Encore.addEntry('form-beli-qr', './resources/js/transaksi/pembelian/form-beli-qr.js')
Encore.addEntry('pasca-beli', './resources/js/transaksi/pembelian/pasca-beli.js')
Encore.addEntry('view-beli', './resources/js/transaksi/pembelian/view-beli.js')

Encore.addEntry('list-gadai', './resources/js/transaksi/gadai/list-gadai.js')
Encore.addEntry('form-gadai', './resources/js/transaksi/gadai/form-gadai.js')
Encore.addEntry('edit-gadai', './resources/js/transaksi/gadai/edit-gadai.js')
Encore.addEntry('view-gadai', './resources/js/transaksi/gadai/view-gadai.js')

// Pembayaran gadai ================================
Encore.addEntry('form-bayar-gadai', './resources/js/transaksi/gadai/pembayaran/form-bayar-gadai.js')
Encore.addEntry('view-bayar-gadai', './resources/js/transaksi/gadai/pembayaran/view-bayar-gadai.js')

// Kelola Barang ===================================
Encore.addEntry('all-kelompok', './resources/js/kelola-barang/kelompok/all-kelompok.js')
Encore.addEntry('view-kelompok', './resources/js/kelola-barang/kelompok/view-kelompok.js')
Encore.addEntry('all-kodepro', './resources/js/kelola-barang/kodepro/all-kodepro.js')
Encore.addEntry('all-model', './resources/js/kelola-barang/model/all-model.js')
Encore.addEntry('all-kerusakan', './resources/js/kelola-barang/kerusakan/all-kerusakan.js')
Encore.addEntry('form-penambahan', './resources/js/kelola-barang/penambahan-stok/form-penambahan.js')
Encore.addEntry('all-penambahan', './resources/js/kelola-barang/penambahan-stok/all-penambahan.js')

// Pegawai & Penggajian ===================================
Encore.addEntry('all-pegawai', './resources/js/pegawai/all-pegawai.js')
Encore.addEntry('form-pegawai', './resources/js/pegawai/form-pegawai.js')
Encore.addEntry('edit-pegawai', './resources/js/pegawai/edit-pegawai.js')
Encore.addEntry('akun-pegawai', './resources/js/pegawai/akun/akun-pegawai.js')
Encore.addEntry('all-penggajian', './resources/js/pegawai/penggajian/all-penggajian.js')

// Laporan Harian ===================================
Encore.addEntry('all-laporan', './resources/js/laporan/all-laporan.js')

// Pengaturan ===================================
Encore.addEntry('atur-toko', './resources/js/sistem/pengaturan/atur-toko.js')
Encore.addEntry('atur-kadar', './resources/js/sistem/pengaturan/atur-kadar.js')
Encore.addEntry('atur-transaksi', './resources/js/sistem/pengaturan/atur-transaksi.js')
Encore.addEntry('atur-saldo', './resources/js/sistem/pengaturan/atur-saldo.js')
Encore.addEntry('all-ubah-saldo', './resources/js/sistem/pengaturan/all-ubah-saldo.js')
Encore.addEntry('atur-barang', './resources/js/sistem/pengaturan/atur-barang.js')
Encore.addEntry('atur-pegawai', './resources/js/sistem/pengaturan/atur-pegawai.js')


/*
|--------------------------------------------------------------------------
| Copy assets
|--------------------------------------------------------------------------
|
| Since the edge templates are not part of the Webpack compile lifecycle, any
| images referenced by it will not be processed by Webpack automatically. Hence
| we must copy them manually.
|
*/
Encore.copyFiles({
  from: './resources/images',
  to: 'images/[path][name].[hash:8].[ext]',
})

/*
|--------------------------------------------------------------------------
| Split shared code
|--------------------------------------------------------------------------
|
| Instead of bundling duplicate code in all the bundles, generate a separate
| bundle for the shared code.
|
| https://symfony.com/doc/current/frontend/encore/split-chunks.html
| https://webpack.js.org/plugins/split-chunks-plugin/
|
*/
// Encore.splitEntryChunks()

/*
|--------------------------------------------------------------------------
| Isolated entrypoints
|--------------------------------------------------------------------------
|
| Treat each entry point and its dependencies as its own isolated module.
|
*/
Encore.disableSingleRuntimeChunk()

/*
|--------------------------------------------------------------------------
| Cleanup output folder
|--------------------------------------------------------------------------
|
| It is always nice to cleanup the build output before creating a build. It
| will ensure that all unused files from the previous build are removed.
|
*/
Encore.cleanupOutputBeforeBuild()

/*
|--------------------------------------------------------------------------
| Source maps
|--------------------------------------------------------------------------
|
| Enable source maps in production
|
*/
Encore.enableSourceMaps(!Encore.isProduction())

/*
|--------------------------------------------------------------------------
| Assets versioning
|--------------------------------------------------------------------------
|
| Enable assets versioning to leverage lifetime browser and CDN cache
|
*/
Encore.enableVersioning(Encore.isProduction())

/*
|--------------------------------------------------------------------------
| Configure dev server
|--------------------------------------------------------------------------
|
| Here we configure the dev server to enable live reloading for edge templates.
| Remember edge templates are not processed by Webpack and hence we need
| to watch them explicitly and livereload the browser.
|
*/
Encore.configureDevServerOptions((options) => {
  /**
   * Normalize "options.static" property to an array
   */
  if (!options.static) {
    options.static = []
  } else if (!Array.isArray(options.static)) {
    options.static = [options.static]
  }

  /**
   * Enable live reload and add views directory
   */
  options.liveReload = true
  options.static.push({
    directory: join(__dirname, './resources/views'),
    watch: true,
  })
})

/*
|--------------------------------------------------------------------------
| CSS precompilers support
|--------------------------------------------------------------------------
|
| Uncomment one of the following lines of code to enable support for your
| favorite CSS precompiler
|
*/
// Encore.enableSassLoader()
// Encore.enableLessLoader()
// Encore.enableStylusLoader()

/*
|--------------------------------------------------------------------------
| CSS loaders
|--------------------------------------------------------------------------
|
| Uncomment one of the following line of code to enable support for
| PostCSS or CSS.
|
*/
Encore.enablePostCssLoader()
// Encore.configureCssLoader(() => {})

/*
|--------------------------------------------------------------------------
| Enable Vue loader
|--------------------------------------------------------------------------
|
| Uncomment the following lines of code to enable support for vue. Also make
| sure to install the required dependencies.
|
*/
// Encore.enableVueLoader(() => {}, {
//   version: 3,
//   runtimeCompilerBuild: false,
//   useJsx: false
// })

/*
|--------------------------------------------------------------------------
| Configure logging
|--------------------------------------------------------------------------
|
| To keep the terminal clean from unnecessary info statements , we only
| log warnings and errors. If you want all the logs, you can change
| the level to "info".
|
*/
const config = Encore.getWebpackConfig()
config.infrastructureLogging = {
  level: 'warn',
}
config.stats = 'errors-warnings'

/*
|--------------------------------------------------------------------------
| Export config
|--------------------------------------------------------------------------
|
| Export config for webpack to do its job
|
*/
module.exports = config
