/**
gc(cookiename) = getcookie
sc(cookiename,val,daysexpire,domain) = setcookie
rc(cookiename) = removecookie
**/
window._CK = {};
_CK.gc = function(t){for(var n=t+"=",r=document.cookie.split(";"),e=0;e<r.length;e++){for(var i=r[e];" "==i.charAt(0);)i=i.substring(1);if(0==i.indexOf(n))return i.substring(n.length,i.length)}return""};
_CK.sc = function(a,b,c,d){if(c){var e=new Date;e.setTime(e.getTime()+24*c*60*60*1e3);var f="; expires="+e.toGMTString()}else var f="";var g=d?"; domain="+d:"";document.cookie=a+"="+b+f+g+"; path=/"}
_CK.rc = function(e,d){_CK.sc(e,"",-1,d);};