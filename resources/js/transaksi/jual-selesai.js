$(function () {
    // code here
    let scrollKeDetail = document.getElementById('scrollKeDetail')
    let scrollKesini = document.getElementById('scrollKesini')
    
    scrollKeDetail.addEventListener('click', (e)=>{
        scrollKesini.scrollIntoView({
            behavior: 'smooth',
        })
    })
})