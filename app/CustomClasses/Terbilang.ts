const IDreadThousand = function (n,dg,snum,thousandDesc) {
  var s='';
  var d1=Math.floor(n/100);
  var d2=Math.floor((n-(d1*100))/10);
  var d3=n-(d1*100)-(d2*10);

  if (d1>0) {
    if (d1==1) {
     s=s+'seratus ';
    } else {
     s=s+snum[d1]+' ratus ';
    }
  }

  if (d2>0) {
    if (d2==1) {
      switch(d3) {
        case 0: s=s+'sepuluh ';
                break;
        case 1: s=s+'sebelas ';
                break;
        default: s=s+snum[d3]+' belas ';
      }
    } else {
     s=s+snum[d2]+' puluh ';
    }
  }

  if (d3>0) {
    if ((d2>1)||(d2==0)) {
      if ((dg==1)&&(d3==1)) {
        s=s+'se';
      } else {
        s=s+snum[d3]+' ';
      }
    }
  }

  return s;
}

const readAll = function (x) {
  var s='';
  var i=0;
  var isfailed=false;

  var snum=new Array('nol','satu','dua','tiga','empat','lima','enam','tujuh','delapan','sembilan');
  var thousandDesc=new Array('','ribu','juta','miliar','triliun');


  if (isNaN(x)) {
    isfailed=true;
  } else {
   x=parseFloat(x);
  }

  if (isfailed==false) {
   do {
    var groupNumbers = Math.round(((Math.floor(x)/1000)-Math.floor((Math.floor(x)/1000)))*1000);
    s=IDreadThousand(groupNumbers,i,snum,thousandDesc)+thousandDesc[i]+' '+s;
    if (x==0) {s='nol'};

    x=Math.floor(Math.floor(x)/1000);
    i++;
   } while (x>0);
   return s.replace(/^\s*|\s(?=\s)|\s*$/g, '');
  } else {
   return 'NaN';
  }
}

export default class Terbilang {
  ubahKeTeks(angka: number){
    return readAll(angka)
  }
}
