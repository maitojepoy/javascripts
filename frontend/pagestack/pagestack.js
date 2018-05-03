/*
this is used for routing for pages with nested popups (with URL's)
- take note popups mean fancy style popups

types ('where' key):
'popx' = page at firstload, pop at ajax loads
'pop' = strictly popup
'poptop' = popup that is top of everything (z-index 99999 yeah but not literally)
'' = just a page

e.g.

var directory = {
    'about': {
        'link': '/about',
        'route': 'pages/page-about.html',
        'tag': 'page-about',
        'where': ''
    },
    'details': {
        'link': '/details/:id',
        'route': 'pages/page-details.html',
        'tag': 'page-details',
        'where': 'pop',
        'method': 'putdetails'
    },
    'home': {
        'link': '/',
        'route': 'home-app.html',
        'tag': 'home-app',
        'where': '',
        'method': 'homeview'
    }
}

newpageobj = directory['details'];
newlink = location.href.slice(location.origin.length);

pagestack = new PageStackManager({'url':'/home.html','type':''});
newpage = pagestack.process_page(newpageobj,newlink,true);

newpage['popped'] // true if previous pop is closed

this.importHref(newpage['route'] ...) // import component


*/

class PageStackManager {
	constructor(start, rootpoint) { 
		//start is the current url+type
        var rp = rootpoint?rootpoint:'/';
		this.parentpops = [];
		this.haspoptop = false;
        this.haspoppedstate = false;
		if (start.type == 'pop' || start.type == 'poptop')
			this.current = {'url':rp,'type':'','runmeth': true};
        window.onpopstate = function(e){ this.haspoppedstate = true; }.bind(this);
	}
	get firstpop() {
		return this.parentpops[0] || {};
	}
	get latestpop() {
		return this.parentpops[this.parentpops.length-1] || {};
	}
	push_poprel(item) {
		if (!item['type']) item['type'] = item['where'];
		this.parentpops.push(item);
	}
	pop_poprel() {
		return this.parentpops.pop();
	}
	decode_poprel(pritem,amode) {
		if (pritem['where'] == 'popx'){
        	var idx = amode?0:1;
        	pritem['route'] = pritem['route'][idx];
        	pritem['where'] = amode?'pop':'';
        	pritem['tag'] = pritem['tag'][idx];
        	pritem['ispopx'] = true;
            if (pritem['options']) pritem['options'] = pritem['options'][idx];
        }else{
        	pritem['route'] = pritem['route'];
        	pritem['where'] = pritem['where'];
        	pritem['tag'] = pritem['tag'];
        	pritem['ispopx'] = false;
        	if (pritem['where'] == 'poptop') {
        		pritem['where'] = 'pop';
        		pritem['topmost'] = true;
        	}
        }
        pritem['type'] = pritem['where'];
        return pritem;
	}
	process_page(itmf,link,am) {
		// var aja = am;        
        var aja = am;
        if (this.parentpops.length == 1)
            aja = this.latestpop.url != link;
		//var aja = this.parentpops.length == 1 && (this.latestpop && this.latestpop.url == link);
		var newpage = this.decode_poprel(itmf,aja);
        newpage['url'] = link;
        newpage['loadcmpnt'] = true;
        newpage['popped'] = false;

        //put here latestpop is same to location.pathname
        // console.log('sameba',am,this.latestpop.url,link);
        if (am && this.latestpop.url == link) {
        	//we throw that pop
        	var ps = this.pop_poprel();
        	newpage['loadcmpnt'] = false;
        	// console.log('kekek',ps['type'] != 'pop',ps['topmost']);
            //newpage['popped'] = true;
            //popped = true is supposed to be inside the 'if' in line 195. I forgot why. If you encounter another route pop problem, check this.
            // console.log('leps:',ps);
        	if (ps['type'] != 'pop' || this.current['topmost']) {
                newpage['popped'] = true;
                if (ps['sctop']) newpage['sctop'] = ps['sctop'];
        	}
        	if (ps['runmeth']) newpage['forcerun'] = true;
        } else if (newpage['where']=='pop') {
            if (newpage['options'] && newpage['options']['preloaded']) 
                newpage['loadcmpnt'] = false;
        	if (Object.keys(this.latestpop).length == 0) {
        		this.push_poprel(this.current);
            //current vs incoming different pages & different types
        	}else if (this.latestpop['url'] != newpage['url'] || this.latestpop['type'] != newpage['type']) {   

                if (this.current && !this.current['ispopx'] && this.current['where'] == 'pop') {
                    // this.pop_poprel();
                    if (this.current['page'] != newpage['page']) newpage['popped'] = true;
                    newpage['forcerun'] = true;
                }else{
                    if (this.current['page'] != newpage['page']) {
                        this.current['sctop'] = document.querySelector('html').scrollTop;
                        this.push_poprel(this.current);
                    }
                }
        		//this.push_poprel({'url':this.current.url,'type':this.current.where});
        	}
        } else {
        	if (this.parentpops.length > 0) {
        		this.parentpops = [];
        		newpage['popped'] = true;
        		newpage['forcerun'] = true;
        	}
        	newpage['loadcmpnt'] = true;
        }
        newpage['fromstate'] = this.haspoppedstate;
        // console.log('onsetstate');
        this.haspoppedstate = false;
        this.current = newpage;
        return newpage;
	}

}