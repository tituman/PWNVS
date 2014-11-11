javascript: var b64pad = '';
var chrsz = 8;
/*H contains all the forms included in nested frames*/
var H = new Array();
/*
* 
* v12: 
* new way of handling iterations,
* now using objects and arrays
*
* beruecksichtigt: 
* ITERATIONS:
* -Cardcomplete + 11 -->1
* -3xFH + 11 --> 3
* -Google --> 1
* -evernote (old)
* 
*
* FH domains 
* host == null
* more host problems
* better host erkennung with:
	[bla.]example.com[:4000]
	[bla.]example.co.at[:4000]
	[bla.exam.]ple.at[:4000]
* fh-wels
* all forms, also in subframes
*/

/*
Domain iterations:

*/

var specialIterations = [
{ domains: ['fh-wels.at', 'fh-ooe.at', 'fhooe.at'], iter: 4, addOnes: true },
{ domains: ['cardcomplete.com'], iter: 1, addOnes: true },
{ domains: ['google.com', 'google'], iter: 1, addOnes: false },
{ domains: ['evernote.com'], iter: 1, addOnes: false }
];


function b64_sha1(s) {
    return binb2b64(core_sha1(str2binb(s), s.length * chrsz));
}
function core_sha1(x, len) {
    x[len >> 5] |= 0x80 << (24 - len);
    x[((len + 64 >> 9) << 4) + 15] = len;
    var w = Array(80);
    var a = 1732584193;
    var b = -271733879;
    var c = -1732584194;
    var d = 271733878;
    var e = -1009589776;
    for (var i = 0; i < x.length; i += 16) {
        var olda = a;
        var oldb = b;
        var oldc = c;
        var oldd = d;
        var olde = e;
        for (var j = 0; j < 80; j++) {
            if (j < 16) w[j] = x[i + j];
            else w[j] = rol(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1);
            var t = safe_add(safe_add(rol(a, 5), sha1_ft(j, b, c, d)), safe_add(safe_add(e, w[j]), sha1_kt(j)));
            e = d;
            d = c;
            c = rol(b, 30);
            b = a;
            a = t;
        }
        a = safe_add(a, olda);
        b = safe_add(b, oldb);
        c = safe_add(c, oldc);
        d = safe_add(d, oldd);
        e = safe_add(e, olde);
    }
    return Array(a, b, c, d, e);
}
function sha1_ft(t, b, c, d) {
    if (t < 20) return (b & c) | ((~b) & d);
    if (t < 40) return b ^ c ^ d;
    if (t < 60) return (b & c) | (b & d) | (c & d);
    return b ^ c ^ d;
}
function sha1_kt(t) {
    return (t < 20) ? 1518500249 : (t < 40) ? 1859775393 : (t < 60) ? -1894007588 : -899497514;
}
function safe_add(x, y) {
    var lsw = (x & 0xFFFF) + (y & 0xFFFF);
    var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return (msw << 16) | (lsw & 0xFFFF);
}
function rol(num, cnt) {
    return (num << cnt) | (num >>> (32 - cnt));
}
function str2binb(str) {
    var bin = Array();
    var mask = (1 << chrsz) - 1;
    for (var i = 0; i < str.length * chrsz; i += chrsz) bin[i >> 5] |= (str.charCodeAt(i / chrsz) & mask) << (24 - i);
    return bin;
}
function binb2b64(binarray) {
    var tab = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    var str = '';
    for (var i = 0; i < binarray.length * 4; i += 3) {
        var triplet = (((binarray[i >> 2] >> 8 * (3 - i % 4)) & 0xFF) << 16) | (((binarray[i + 1 >> 2] >> 8 * (3 - (i + 1) % 4)) & 0xFF) << 8) | ((binarray[i + 2 >> 2] >> 8 * (3 - (i + 2) % 4)) & 0xFF);
        for (var j = 0; j < 4; j++) {
            if (i * 8 + j * 6 > binarray.length * 32) str += b64pad;
            else str += tab.charAt((triplet >> 6 * (3 - j)) & 0x3F);
        }
    }
    return str;
}
var intArr = new Array; /* tiene ints*/

/* fills H with all forms (many HTMLCollection's) */
function wow(mFrames, n) {
    for (intArr[n] = 0; intArr[n] < mFrames.length; intArr[n]++) {
        if (mFrames[intArr[n]].document && mFrames[intArr[n]].document.forms) {
            H.push(mFrames[intArr[n]].document.forms);
        }
        if (mFrames[intArr[n]].frames.length) {
            wow(mFrames[intArr[n]].frames, n + 1);
        }
    }
    return;
}
function doIt() {
    var domain = '';
    var flagShow = false;
    var flagWritePWN = false;
    var flagTypeInDomain = false;
    /*1 REMOVE--> */
    var Domain = window.prompt('Enter your domain');
    flagShow = true;
    if (Domain != null && Domain != '') {
        flagTypeInDomain = true;
    }
    /* <--REMOVE 2*/
    var host1 = window.location.hostname;
    if (host1 != null) {
        if (sld = host1.match(/([^.]+\.([a-z][a-z][a-z]|[a-z][a-z]\.[a-z][a-z]|[a-z][a-z]))$/i)) {
            domain = sld[0];

        } else {
            try {
                domain = host1.match(/([^.]+\.[^.]+\.[a-z][a-z])$/i)[0];
                window.alert('second match: ' + domain);
            } catch (err) {
                domain = window.prompt('host not recognized, type in custom domain');
            }
        }
    } else {
        domain = window.prompt('host not recognized, type in custom domain');
    }
    /*1 do not remove--> */
    if (flagTypeInDomain == true) {
        if (Domain != null && Domain != '') {
            domain = Domain;
        }
    };
    /* <--do not remove 2*/

    /* add special iterations from above  
	if (!flagTypeInDomain &&  */
    for (i = 0; i < specialIterations.length; i++) {
        for (j = 0; j < specialIterations[i].domains.length; j++) {
            if ((domain.indexOf(specialIterations[i].domains[j]) != -1)) {
                domain = specialIterations[i].domains[0] + specialIterations[i].iter;
                var addOnes = specialIterations[i].addOnes;
            }
        }

    }

    var p; /* string containing calculated password */
    var i = 0, j = 0; /* iterators */

    var theseForms = document.forms;
    var theseInputs = document.getElementsByTagName('input');

    /*H has all the forms of all the frames. H is an array of HTMLCollection  */
    H.push(theseForms);

    /* fills H with all forms (many HTMLCollection's) */
    try {
        wow(top.frames, 0);
    }
    catch (err) {
        txt = "@pnd: Gmail Error: " + err.message + "\n";
        alert(txt);
    }

    var wrotePWAtLeastOnce = false;
    var wrotePWAtLeastOnceSecondChance = false;

    /* H is array of HTMLCollection */
    for (var k = 0; k < H.length; k++) {
        /* F contains an HTMLCollection */
        F = H[k];
        if (F == null || F == '' || F == 0) { continue; }
        for (i = 0; i < F.length; i++) {
            if (F[i] == null || F[i] == '' || F[i] == 0) { continue; }
            /* E contains elements of HTMLCollection, type is HTMLFormControlsCollection*/
            E = F[i].elements;
            if (F[i].elements == null || F[i].elements == '' || F[i].elements == 0) { continue; }
            for (j = 0; j < E.length; j++) {
                flagWritePWN = false;
                if (E[j] == null || E[j] == '' || E[j] == 0) { continue; }
                /* D is element of HTMLFormControlsCollection (inputs) */
                D = E[j];
                if (D.type == 'password') {
                    if (D.value || D.value != '') {
                        p = b64_sha1(D.value + ':' + domain).substr(0, 8) + '1a';
                        if (addOnes) {
                            p = p + '11';
                        }
                        /*1 REMOVE-->  */
                        flagWritePWN = window.prompt(domain, p);
                        /* <--REMOVE 2*/
                        if (flagShow) {
                            if (flagWritePWN) {
                                D.value = p;
                                D.focus();
                                D.style.background = '#FF69B4';
                                wrotePWAtLeastOnce = true;
                            }
                        } else {
                            D.value = p;
                            D.focus();
                            D.style.background = '#FF69B4';
                            wrotePWAtLeastOnce = true;
                        }
                    }
                }
                if (D.type == 'text') {
                    if (D.value || D.value != '') {
                        if (D.name.toUpperCase().indexOf('PASSWORD') != -1 || D.name.toUpperCase().indexOf('PASSWD') != -1) {
                            p = b64_sha1(D.value + ':' + domain).substr(0, 8) + '1a';
                            if (addOnes) {
                                p = p + '11';
                            }
                            /*1 REMOVE-->  */
                            flagWritePWN = window.prompt(domain, p);
                            /* <--REMOVE 2*/
                            if (flagShow) {
                                if (flagWritePWN) {
                                    D.value = p;
                                    D.focus();
                                    D.style.background = '#FF69B4';
                                    wrotePWAtLeastOnce = true;
                                }
                            } else {
                                D.value = p;
                                D.focus();
                                D.style.background = '#FF69B4';
                                wrotePWAtLeastOnce = true;
                            }
                        }
                    }
                }
            }
        }
    }

    /* try with the inputs strategy */
    if (wrotePWAtLeastOnce == false) {
        for (var i = 0; i < theseInputs.length; ++i) {
            /* figure out what to do here */
            flagWritePWN = false;
            if (theseInputs[i].type == 'password') {
                if (theseInputs[i].value || theseInputs[i].value != '') {
                    p = b64_sha1(theseInputs[i].value + ':' + domain).substr(0, 8) + '1a';
                    if (addOnes) {
                        p = p + '11';
                    }
                    /*1 REMOVE-->  */
                    flagWritePWN = window.prompt(domain, p);
                    /* <--REMOVE 2*/
                    if (flagShow) {
                        if (flagWritePWN) {
                            theseInputs[i].value = p;
                            theseInputs[i].focus();
                            theseInputs[i].style.background = '#FF69B4';
                            wrotePWAtLeastOnceSecondChance = true;
                        }
                    } else {
                        theseInputs[i].value = p;
                        theseInputs[i].focus();
                        theseInputs[i].style.background = '#FF69B4';
                        wrotePWAtLeastOnceSecondChance = true;
                    }
                }
            }
            if (theseInputs[i].type == 'text') {
                if (theseInputs[i].value || theseInputs[i].value != '') {
                    if (theseInputs[i].name.toUpperCase().indexOf('PASSWORD') != -1 || theseInputs[i].name.toUpperCase().indexOf('PASSWD') != -1) {
                        p = b64_sha1(theseInputs[i].value + ':' + domain).substr(0, 8) + '1a';
                        if (addOnes) {
                            p = p + '11';
                        }
                        /*1 REMOVE-->  */
                        flagWritePWN = window.prompt(domain, p);
                        /* <--REMOVE 2*/
                        if (flagShow) {
                            if (flagWritePWN) {
                                theseInputs[i].value = p;
                                theseInputs[i].focus();
                                theseInputs[i].style.background = '#FF69B4';
                                wrotePWAtLeastOnceSecondChance = true;
                            }
                        } else {
                            theseInputs[i].value = p;
                            theseInputs[i].focus();
                            theseInputs[i].style.background = '#FF69B4';
                            wrotePWAtLeastOnceSecondChance = true;
                        }
                    }
                }
            }
        }
    } else {
        wrotePWAtLeastOnceSecondChance = true;
    }

    if (wrotePWAtLeastOnceSecondChance == false) {
        var pwClear = window.prompt('enter pw in clear');
        if (pwClear) {
            p = b64_sha1(pwClear + ':' + domain).substr(0, 8) + '1a';
            if (addOnes) {
                p = p + '11';
            }
            window.prompt(domain, p);
        }
    }

}
doIt();
void (null);