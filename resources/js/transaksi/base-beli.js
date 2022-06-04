$(function () {

    let form = document.getElementById('formPrepare')

    form.addEventListener('submit', (e) => {
        if(form.action !== '/app/pembelian/transaksi' || form.action !== '/app/pembelian/transaksiumum'){
            e.preventDefault()

            if (document.querySelector('input[name=prepareAsal]:checked').value == 1 || document.querySelector('input[name=prepareNota]:checked').value == 1 || document.querySelector('input[name=prepareRusak]:checked').value == 2 || document.querySelector('input[name=prepareSusut]:checked').value == 2) {
                // ntar ganti routingnya biar lebih propper
                form.action = '/app/transaksi/pembelian/'
            } else {
                // ntar ganti routingnya biar lebih propper
                form.action = '/app/transaksi/pembelian/transaksiumum'
            }

            form.submit()
        }
    })
})


global.prepareAsal = function () {
    return [
        'Perhiasan yang dijual dibeli dari Toko Mas Leo atau cabang lain dibawah rumpun yang sama.',
        'Perhiasan yang dijual dibeli dari toko mas lain atau tidak diketahui sumbernya.'
    ]
}

global.prepareNota = function () {
    return [
        'Perhiasan yang dijual dilengkapi dengan nota bukti pembelian dari Toko Mas Leo atau dari toko emas lainnya.',
        'Perhiasan yang dijual tidak memiliki identitas apapun.'
    ]
}

global.prepareRusak = function () {
    return [
        'Perhiasan yang dijual tidak mengalami kerusakan dalam bentuk apapun dan dapat langsung dijual kembali setelah dicuci ulang.',
        'Perhiasan yang dijual mengalami cidera ringan seperti kehilangan batu, penyok, atau patah yang masih dalam jangka wajar dan dapat diperbaiki.',
        'Perhiasan yang dijual mengalami cidera parah yang tidak dapat diperbaiki, hilang sebagian, hancur atau hilang pasangannya.'
    ]
}

global.prepareSusut = function () {
    return [
        'Perhiasan yang dijual memiliki berat yang sama persis dengan yang tertera pada nota.',
        'Perhiasan yang dijual memiliki berat yang sedikit menyusut dengan ketentuan selisih berat tidak lebih dari 0.2 gram dan dapat ditambal atau diperbaiki',
        'Perhiasan yang dijual memiliki berat yang menyusut karena hilang pasangan, hilang karena patah atau karena alasan lainnya, dengan ketentuan selisih berat lebih dari 0.2 gram atau tidak dapat diperbaki.'
    ]
}
