var Promise    = require('promise');
var path       = require('path');
var process    = require('process');
//var express    = require("express");
var isWin = /^win/.test(process.platform);
var isMac = /^darwin/.test(process.platform);
var say;
if (isMac) say = require('say');

var ree = isWin ? /cdn\\polymer/i : /cdn\/polymer/i;

var settings   = require('./settings');
var PolyComp   = require('./polycomp');
var VulcMyBody = require('./vulcmybody');
var con        = require('./conwrite');

var targdir = settings.targetfolder, //'/Users/jepoy/ss/htdocs/' /usr/share/nginx/html/htdocs/
    manifest = [], subfiles = [],
    polysincluded, mainpageincs, fileputs, excludeputs,
    subexcludes, doneall = false;

var mainpages = settings.mainpages, uch,
    cycle = 0, thefiles = [], vulcs = [], procpages;

Array.prototype.objectIndexOf = function(ndl,key) {
	var ik = this.map(function(x){ return x[key]; });
	return ik.indexOf(ndl);
};

Array.prototype.showFilename = function() {
	return this.map(function(x){
		return x.filename;
	});
};

Array.prototype.unique = function(keyunique,mutate) {
    var unique = this.reduce(function(accum, current) {
    	var accomo,curro;
    	if (typeof keyunique != 'undefined'){
    		accomo = accum.map(function(x){ return x[keyunique]; });
    	}else accomo = accum.slice();
    	curro = (typeof keyunique != 'undefined')?current[keyunique]:current;
        if (accomo.indexOf(curro) < 0) {
            accum.push(current);
        }
        return accum;
    }, []);
    if (mutate) {
        this.length = 0;
        for (var i = 0; i < unique.length; ++i) {
            this.push(unique[i]);
        }
        return this;
    }
    return unique;
};

Array.prototype.commoner = function(keyunique,mutate) {
	var a = [], b = [], bb = [], tc;
	for (var i=0; i<this.length; i++) {
		tc = (typeof keyunique != 'undefined')?this[i][keyunique]:this[i];
		if (a.indexOf(tc) == -1) a.push(tc);
		else if (bb.indexOf(tc) == -1){ 
			b.push(this[i]);
			bb.push(tc);
		}
	}
    return b;
};

function speakUp(phrase) {
	if (isMac) say.speak(phrase);
}

function nextVulcCycle(filesaved) {
	con.write('vulcanize done at',filesaved);
	if (cycle < procpages.length-1) {
		cycle++;
		cycleVulcanize(cycle);
	}else{
		doneall = true;
		speakUp('Build complete.');
		con.write('Vulcanization complete!');
		exit;
	}
}

function cycleVulcanize(cyc) {
	var destfolder = targdir+'cdn/components/';
	con.write('beginning to compile at',cyc+1,procpages[cyc]);
	var xclude;
	if (cyc > 1) {
		if (thefiles[cyc].reference > 0) {
			con.write('whole subexcludes');
			con.write(subexcludes);
			con.write('chosen: ');
			var theref = thefiles[cyc].reference;
			con.write(theref);
			//con.write(subexcludes[theref-1]);
			var putonexc = [];
			if (typeof subexcludes[theref] != 'undefined') {
				putonexc = subexcludes[theref].map(function (aa) {
					return aa.replace('../',targdir+'cdn/');
				});
			}
			con.write('here');
			xclude = {
				'excludes': excludeputs['pages']['excludes'].concat(putonexc),
				'stripExcludes': excludeputs['pages']['stripExcludes'].concat(putonexc),
			};
			con.write('and here');
		} else xclude = excludeputs['pages'];
	}else if (cyc > 0) xclude = excludeputs['pageadmin']; 
	else xclude = excludeputs['pagemain'];
	
	//var incfiles = (cyc > 0) ? mainpageincs[cyc-1]:polysincluded;
	var incfiles = mainpageincs[cyc];
	con.write(incfiles);
	/*con.write('exclude rules: ');
	con.write(xclude);*/
	vulcs[cyc] = new VulcMyBody(targdir+procpages[cyc],destfolder,incfiles,xclude,true,true);
	vulcs[cyc].prom.then(nextVulcCycle.bind(this));
}

//------------- STEP 2: RESCAN TO SEE COMMON FILES -------------

var _replacecdns = function(x) {
	if (isWin) {
		var cdnstru = x.split('cdn\\');
		var r = x.replace(cdnstru[0]+'cdn\\','..\\');
		return r.replace(/\\/g,'/');
	}else{
		var cdnstru = x.split('cdn/');
		return x.replace(cdnstru[0]+'cdn/','../');
	}
};

function prepareForVulcStep3(newgats,oldgats,commoners){
	subexcludes = [];

	for (i=0; i<newgats.length; i++) {
		var cc = newgats[i][0],
			rl = newgats[i][2],
			ro = newgats[i][1], //-1 for unlogged, -2 for logged
			fl = commoners[cc]; //to get fileinfo
		con.write('----------oooooooooooo-----------');
		con.write('check on', commoners[cc].filename);
		con.write(commoners[cc].id);
		con.write(commoners[cc].filename);
		con.write(newgats[i]);
		if (ro < 0) { //if move file to unlogged or logged
			con.write('<--------THIS IS MOVED!!!---------->')
			nod = [fl].concat(uch.getChilds(fl.id));
			con.write('returned');
			con.write(nod.showFilename());
			var where = (ro == -1)?0:1;
			for (var k=0; k<nod.length; k++) {
				fileputs[where].push(nod[k]);
			}
		} else { // if not to move on unlogged / logged
			if (typeof subexcludes[rl-1] == 'undefined') 
				subexcludes[rl-1] = [];
			subexcludes[rl-1].push(fl);
			oldgats[rl-1].push(fl);
		}
	}
	// con.write('done1');
	fileputs[0] = fileputs[0].unique('id');
	// fileputs[1] = fileputs[1].unique('id');
	//oldgats[0] = oldgats[0].concat(fileputs[1]).unique('id');
	oldgats[0] = oldgats[0].concat(fileputs[1]).unique('id');
	//subexcludes[0] = subexcludes[0].concat(fileputs[1]).unique('id');
	// con.write('done3');
	fileputs = [fileputs[0]].concat(oldgats);
	//mainpageincs = [mainpageincs[0]].concat(oldgats);
	// con.write('oi done');
	//con.write(fileputs[0].concat(fileputs[1]));
	// con.write(fileputs[0].concat(fileputs[1]).map(function(x){ return x['filename']; }));
	con.write(JSON.stringify(fileputs[1],null,'\t'));
	var foradminexclude = fileputs[0].map(function (aa) {
		return aa['filename'].replace('../',targdir+'cdn/');
	});
	// var forpageexclude = fileputs[0].unique('id').map(function (aa) {
	var forpageexclude = fileputs[0].concat(fileputs[1]).unique('id').map(function (aa) {
		return aa['filename'].replace('../',targdir+'cdn/');
	});

	excludeputs = {
		/*'polys': {
			excludes: [], //'\/polymer\\.html$\/'
		  	stripExcludes: [] //'\/polymer\\.html$\/'
		},
		'pagemain': {
			excludes: [ '\/cdn\\\/polymer\/' ],
		  	stripExcludes: [ '\/cdn\\\/polymer\/' ]
		},*/
		'pagemain': {
			excludes: [ ],
		  	stripExcludes: [ ]
		},
		'pageadmin': {
			excludes: foradminexclude,
		  	stripExcludes: foradminexclude
		},
		'pages': {
			excludes: forpageexclude,
		  	stripExcludes: forpageexclude
		}
	};
	return true;
}

function moveCommonsStep2() {
	// ---------- get all common links! (more than once used link)

	/*var commoners = fileputs.slice(1).reduce(function (acc,curr) {
		return acc.concat(curr);
	}).commoner('id');*/
	var commoners = fileputs.reduce(function (acc,curr) {
		return acc.concat(curr);
	}).commoner('id');
	
	//mainpageincs[0] = mainpageincs[0].concat(doget);
	//oldgats = not common files
	//newgats = common files
	var newgats = [], oldgats = [], cfound, ngfound;
	//NOT INCLUDED mainpageincs[0]
	con.write('MOVING TIME!');
	for (var i=1; i<fileputs.length; i++) {
		oldgats[i-1] = [];
		con.write('begining to move on file #'+i);
		for (var j=0; j<fileputs[i].length; j++) {
			con.write('checking on file ', fileputs[i][j].filename);
			cfound = commoners.objectIndexOf(fileputs[i][j].id,'id');
			if (cfound == -1) { //if its not a commoner
				con.write('notcommon');
				oldgats[i-1].push(fileputs[i][j]); //only filename is inserted
			} else { //if its common
				con.write('common na!');
				//if its already in newgats
				// [<index_in_commons>,<parent_endpoint_index>,<loopindex>]
				//this is to check if the file is used more than once
				ngfound = newgats.map(function (x) { return x[0]; }).indexOf(cfound);
				if (ngfound == -1) {

					var wpu = (thefiles[i].foradmin==0) ? -1:-2;
					newgats.push([cfound, thefiles[i].reference, i, wpu]);
					con.write('added to oldgats');
					//con.write(wpu);
				}else {
					con.write('newgats for',fileputs[i][j].filename);
					//var refpar = thefiles[i].reference;
					//var par = thefiles[refpar].reference;
					//var par = thefiles[i].reference;
					con.write('newgats');
					con.write(newgats[ngfound][2], i);
					/*if (newgats[ngfound][2] != i) {
						if (newgats[ngfound][1] != -1) {
							if (newgats[ngfound][3] == -1)
								newgats[ngfound][1] = -1;
							else if (thefiles[i].foradmin == 1)
								newgats[ngfound][1] = -2;
							else newgats[ngfound][1] = -1;
						}
					}*/
					if (newgats[ngfound][2] != i) {
						if (newgats[ngfound][1] != -1) {
							if (thefiles[i].foradmin == 1) {
								newgats[ngfound][1] = -2;
							}
							else newgats[ngfound][1] = -1;
						}
					}
					/*if (newgats[ngfound][2] != i) {
						if (newgats[ngfound][1] != -1) { //---- CH
							if (newgats[ngfound][3] == -2) { //--- if not for logged
								if (thefiles[i].foradmin != 1) { 
									// newgats[ngfound][1] = -1; //---- CH
									newgats[ngfound][3] = -1;
								}
							}else newgats[ngfound][1] = -1;
						}
					}*/
				}
				//else if (newgats[ngfound][1] > thefiles[i].reference) newgats[ngfound][1] = thefiles[i].reference;
				//else if (newgats[ngfound][2] != i) newgats[ngfound][1] = 0;
				// if reference is above the current reference, move up
			}
		}
	}
	con.write('------------common library------------');
	con.write(JSON.stringify(commoners.showFilename(),null,'\t'));
	con.write('------------newgats------------');
	con.write(JSON.stringify(newgats,null,'\t'));
	con.write('------------oldgats------------');
	con.write(JSON.stringify(oldgats,null,'\t'));
	return {
		'newgats': newgats, 'oldgats': oldgats, 'commoners': commoners
	};
}

function removeDupsStep1() {
	//mainpageincs = [];
	fileputs = [];
	var mnput = [];
	for (var i=0; i<subfiles.length; i++) {
		//mainpageincs[i] = [];
		mnput[i] = [];
		fileputs[i] = [];
		for (var j=0; j<subfiles[i].length; j++) {
			// 0 is the main-components, everything there is loaded first
			// for the others, if the file contents already existed in main-components, remove it!
			//if (!ree.test(subfiles[i][j].filename)) {
			subfiles[i][j].filename = _replacecdns(subfiles[i][j].filename);
			if (i > 0) {
				var cc = mnput[0].map(function(xx){ return path.basename(xx); });
				if (cc.indexOf(path.basename(subfiles[i][j].filename)) == -1) {
					fileputs[i].push(subfiles[i][j]);
					mnput[i].push(subfiles[i][j].filename);
					//mainpageincs[i].push(subfiles[i][j].filename);
				}
			} else {
				fileputs[i].push(subfiles[i][j]);
				mnput[i].push(subfiles[i][j].filename);
				//mainpageincs[i].push(subfiles[i][j].filename); // for mainpageincs[0]
			}
			//}
		}
		//var uniqqi = mainpageincs[i].unique()
		//mainpageincs[i] = mainpageincs[i].unique(); //.map(_replacecdns) //restructure url struc 
		fileputs[i] = fileputs[i].unique('id');
	}
	return true;
}

function isolatePolysStep0() {
	if (isWin)
		polysincluded = ['cdn\\polymer\\polymer\\polymer.html'];
	else polysincluded = ['cdn/polymer/polymer/polymer.html'];

	for (var i=0; i<manifest.length; i++) {
		if (!ree.test(manifest[i].ref_fname) && ree.test(manifest[i].filename) 
			&& !/polymer\.html$/i.test(manifest[i].filename)) {
			polysincluded.push(manifest[i].filename);
			con.write('yes its part',manifest[i].filename, manifest[i].ref_fname);	
		}else{
			con.write('nope ', manifest[i].filename);
		}
	}
	polysincluded = polysincluded.unique().map(_replacecdns);
	return true;
}

function beginVulcanize() {
	con.write('\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n');
	
	//var a = isolatePolysStep0();

	a = removeDupsStep1();

	a = moveCommonsStep2();

	//con.write( JSON.stringify(a, null, '\t') );
	//return;

	a = prepareForVulcStep3(a['newgats'],a['oldgats'],a['commoners']);
	// return;
	// exit;

	mainpageincs = [];
	for (var i=0; i<fileputs.length; i++) {
		mainpageincs[i] = [];
		con.write('fileputs in #'+i);
		con.write(JSON.stringify(fileputs[i].showFilename(),null,'\t'));
		// con.write(fileputs[i].showFilename());
		for (var j=0; j<fileputs[i].length; j++) {
			mainpageincs[i].push(fileputs[i][j].filename);
		}
	}

	cycle = 0;
	procpages = mainpages.map(function (x) { return x[0] });
	vulcs = [];

	speakUp('Re-checking complete. Building.');

	cycleVulcanize(cycle);
}

//------------- end of STEP 2: RESCAN TO SEE COMMON FILES ----------------

//------------- STEP 1: SCAN FILES ----------------

function callNext(fl) {
	subfiles[cycle] = [thefiles[cycle].lemain.fileinfo].concat(fl);
	//else subfiles[cycle] = fl;
	con.write('\n\n>>>>>>>>>>>>>>>finished scanning file #'+cycle+'. The files are: \n');
	con.write(JSON.stringify(subfiles[cycle].showFilename(),null,'\t'));
	manifest = manifest.concat(subfiles[cycle]);
	if (cycle < mainpages.length-1) {
		cycle++;
		addFragment(cycle);
	}else{
		speakUp('Scanning complete. Checking common files.');
		beginVulcanize();
	}
}

function EntryPoint(url, num, ref, foradm) {
	//this.mainurl = new URLNode(url);
	ref = (typeof ref == 'undefined') ? 0 : ref ;
	this.mainurl = url;
	this.reference = ref;
	this.foradmin = foradm;
	this.lemain  = new PolyComp(num, this.mainurl);
	var el = this;
	this.prm = new Promise(function (resolve, reject) {
	            this.resolve = resolve;
	            this.reject = reject;
	         }.bind(this));

	this.lemain.prom.then(function(ee) {
		this.resolve(ee);
	}.bind(this));
}

function addFragment(idx) {
	//speakUp('scanning file number '+ (idx+1));
	var pat = path.relative('./',path.resolve(targdir,targdir+mainpages[idx][0]));
	con.write('\n\n\n------------------------*******************------------------------\n\n');
	con.write('begin calling: '+pat);
	con.write('\n\n------------------------*******************------------------------\n\n\n');
	thefiles[idx] = new EntryPoint(pat, idx, mainpages[idx][1], mainpages[idx][2]);
	thefiles[idx].prm.then(callNext.bind(this));
}

//------------- end of STEP 1: SCAN FILES ----------------

function _begin(){
	manifest = [];
	subfiles = [];
	cycle = 0;
	thefiles = [];
	doneall = false;
	uch = PolyComp.cleanUCheck();
	addFragment(0);
}

(function() {
	if (con.canwrite) {
		speakUp('beginning to scan files. This may take time.');
		con.canwrite = settings.canwrite;
		console.log('writemode is: '+settings.canwrite);
		if (settings.canwrite) con.prepare();
		setTimeout(_begin,2000);
	}else _begin();
}(!0));