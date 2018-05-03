var Promise      = require('promise');
var fs           = require('fs');
var jsdom        = require('jsdom').jsdom;
var path         = require('path');
var con          = require('./conwrite');

//var polycomps = [];

class URLChecker {
    constructor() {
        this.urllist = [];
        this.polycomps = [];
    }
    findThatNodenum(nid) {
        return this.urllist.map(function (x) {
            return x.nodenum;
        }).indexOf(nid);
    }
    findThatURL(url) {
        return this.urllist.map(function (x) {
            return path.basename(x.url);
        }).indexOf(path.basename(url));
    }
    addURL(urlnode) {
        var dowehave = this.findThatURL(urlnode.url);
        /*var dowehave = this.urllist.map(function (x) {
            return path.basename(x.url);
        }).indexOf(path.basename(urlnode.url));*/
        if (dowehave == -1) {
            this.urllist.push(urlnode);
            return [true,this.urllist.length-1];
        } else {
            this.urllist[dowehave].uses++;
            return [false,dowehave];
        }
    }
    getChilds(nodenum) {
        var uidx = this.findThatNodenum(nodenum),
        lenode = this.urllist[uidx];

        var process = require('process');
        var isWin = /^win/.test(process.platform);
        var ree = isWin ? /cdn\\polymer/i : /cdn\/polymer/i;

        //con.write('//-------------who involves in: ',lenode.url);
        var getTheComps = function(node) {
            var invs = this.polycomps.filter(function(x){
                return (x.fileinfo.ref_id == node.nodenum); // && !ree.test(x.fileinfo.filename)
            });
            /*con.write(invs.map(function(x){
                return x.fileinfo.filename;
            }));*/
            var i=0, nodes = [];
            // con.write('going in',node.url);
            while (i<invs.length) {
                nodes.push(invs[i]);
                nodes = nodes.concat(getTheComps(invs[i].unode));
                i++;
                //nodes = nodes.concat(extractUnode(pcomp.unode));
            }
            /*con.write(nodes.map(function(x){
                return x.fileinfo.filename;
            }));*/
            return nodes;
        }.bind(this);
        return getTheComps(lenode).map(function(x){
            return x.fileinfo;
        });
        /*con.write('the gathering');
        con.write(gathrd.map(function(x){
            return x.filename;
        }));*/
        //return gathrd;
    }
    findThatComp(pid) {
        return this.polycomps.map(function(x){
            return x.compid;
        }).indexOf(pid);
    }
    _extractUnode(node) {
        var whos = node.whoused; //outs compids
        var i=0, nodes = [];
        // con.write('going in',node.filename);
        // con.write('whoused', whos);
        while (i<whos.length) {
            var pcomp = this.findThatComp(whos[i]); //outs polycomp
            // con.write('its',pcomp.fileinfo.filename);
            nodes.push(pcomp.fileinfo);
            nodes = nodes.concat(extractUnode(pcomp.unode));
        }
        return nodes;
    }
    whichCompInvolved(nodenum) {
        var uidx = this.findThatNodenum(nodenum),
        lenode = this.urllist[uidx];
        // con.write('//-------------who involves in: ',lenode.url);
        return this._extractUnode(lenode);
    }
}

var cnts = 0;

class URLNode {
    constructor(url) {
        this.url = url;
        cnts++;
        this.nodenum = cnts;
        this.uses = 1;
        this.whoused = [];
    }
}

var ucheck;

function cleanUCheck() {
    ucheck = new URLChecker();   
    return ucheck; 
}

var pccnt = 0;

class PolyComp {

    _createPNode(unode) {
        this.noderef = ucheck.findThatURL(unode);
        this.node_exists = (this.noderef != -1);
        this.unode = this.node_exists ? ucheck.urllist[this.noderef] : new URLNode(unode);

        this.unode.whoused.push(this.compid);

        if (!this.node_exists) ucheck.addURL(this.unode);

        return !0;
    }

    _createFileInfo(reff) {
        var _finfo = { id: this.unode.nodenum, filename: this.unode.url,
        'ref_id': 0, 'ref_fname': '', 'compid': this.compid };

        if (typeof reff != 'undefined') {
            _finfo['ref_id'] = reff.nodenum;
            _finfo['ref_fname'] = reff.url;
        }
        return _finfo;
    }


    constructor(snum,unode,reff) {
        this.compid = pccnt;
        pccnt++;

        this.items = [];
        this.grpnum = snum;

        this.prom = new Promise(function (resolve, reject) {
                this.resolve = resolve;
                this.reject = reject;
             }.bind(this));

        this.taskdone = false;

        this._createPNode(unode);
        
        //---- to be used in doFindComponents
        this.dir = path.dirname(this.unode.url);
        this.key = path.basename(this.unode.url,'.html');
        
        this.filelist = [];
        this.fileinfo = this._createFileInfo(reff);

        ucheck.polycomps.push(this);

        /*con.query('INSERT INTO manifest SET ?', filee, function(err,res){
          if(err) throw err;
          con.write('Last insert ID:', res.insertId);
        });*/
        
        if (path.basename(this.unode.url) == 'polymer.html') {
            // con.write('\n----------the number: '+this.unode.nodenum);
            // con.write('----------the class: '+this.key);
            // con.write('omitted because its polymer.html.');
            this.taskdone = true;
            this.resolve(this.filelist);
            //this.emitter.emit('dingding');
            return;
        }

        if (this.node_exists) {
            // con.write('\n----------the number: '+this.unode.nodenum);
            // con.write('----------the class: '+this.key);
            // con.write('omitted because its already existing.');
            this.taskdone = true;
            this.resolve(this.filelist);
            //this.emitter.emit('dingding');
            return;
        }

        this._crawlComponents(this.unode,this.dir).then(this._crawlComplete.bind(this))
            .catch(function(e){
                con.write('an error: ');
                con.write(e);
            });
    }
    _crawlComplete(res) {
        // con.write('\n----------the number: '+this.unode.nodenum);
        // con.write('----------the class: '+this.key);
        // con.write('----------the where: '+this.dir);
        //con.write(res);
        if (res.length == 0) {
            this.taskdone = true;
            //con.write('its done, no subfiles at',el);
            this.resolve(this.filelist);
            //this.emitter.emit('dingding');
        }else{
            for (var i=0; i<res.length; i++) {
                var elx = res[i];
                this.items[i] = new PolyComp(this.grpnum, elx, this.unode);
                this.filelist.push(this.items[i].fileinfo);
                //this.items[idx].addEventListener('dingding', )
            }
            var ops = setInterval(function () {
                var donee = true;
                var filesin = [];
                for (var i=0; i<res.length; i++) {
                    //filesin.push(this.items[i].filelist);
                    filesin = filesin.concat(this.items[i].filelist);
                    if (!this.items[i].taskdone) { 
                        donee = false;
                        break;
                    }
                }
                if (donee) {
                    this.filelist = this.filelist.concat(filesin);
                    this.taskdone = true;
                    //con.write('its done',this.unode.url,this.unode.nodenum);
                    this.resolve(this.filelist);
                    //this.resolve(this.unode);
                    clearInterval(ops);
                }
            }.bind(this), 1000);
        }
    }
    _crawlComponents(url,dir) { //,main
        return new Promise(function (resolve, reject) {
            //con.write('opening: '+url.url);
            fs.readFile(url.url, function(error, content) {
                if (error) reject(error);
                var document;
                try {
                    document = jsdom(content);
                }catch(ev) {
                    console.error("\nscript error in #", url.nodenum, url.url, ev);
                    return;
                };
                var window = document.defaultView;
                //var xlinks = 
                //con.write('whats in '+url);
                //con.write([].slice.call(document.querySelectorAll('link')).map(function(x){ return x.getAttribute('href'); }));
                resolve([].slice.call(document.querySelectorAll('link:not([href^=http])')).map(function (x) {
                    var dref = x.getAttribute('href').replace(/^\/cdn/g,'..');
                    return path.relative('./',path.resolve(dir,dref));
                    //return dref;
                }));
            });
        });
    }
}

// PolyComp.comps = polycomps;
PolyComp.cleanUCheck = cleanUCheck;
module.exports = PolyComp;