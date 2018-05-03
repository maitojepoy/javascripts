var puppeteer = require('puppeteer');

/*for making session and gathering stock data*/

class Gatherer {
	constructor() {
		this.est = !1;
		this.lasthistdata = {};
		this.lastinfdata = {};
		this.mainurl = 'http://www.pse.com.ph/stockMarket/';
		//this.establish();
	}
	establish(){
		return puppeteer.launch().then(function (b) {
			console.log('launching chrome');
			this.browser = b;
			return b.newPage();
		}.bind(this)).then(function (p) {
			console.log('creating new PSEi session');
			this.page = p;
			return this.page.goto(this.mainurl+'home.html');
		}.bind(this)).then(function (resp) {
			this.est = !0;
			return resp.text();
		}.bind(this)).then(function (txt) {
			return txt;
		});
	}
	get_ticker() {
		return this.page
			.goto(this.mainurl+'home.html?method=getSecuritiesAndIndicesForPublic&ajax=true')
			.then(function (res) {
				return res.json();
			}.bind(this))
			.then(function(ti){
				this.ticker = ti;
				return ti;
			}.bind(this));
	}
	get_pse_list() {
		return this.page
			.goto(this.mainurl+'companyInfoSecurityProfile.html?method=getListedRecords&common=yes&ajax=true')
			.then(function (res) { return res.json(); }.bind(this))
			.then(function(ti){
				this.pselist = ti;
				return ti;
			}.bind(this));
	}
	get_history_by_sec(scid, ccode) {
		/*http://www.pse.com.ph/stockMarket/companyInfoHistoricalData.html?method=getRecentSecurityQuoteData&ajax=true*/
		//need post data. how??????
		return this.page
			.goto(this.mainurl+'companyInfoHistoricalData.html?method=getRecentSecurityQuoteData&ajax=true')
			.then(function (res) { return res.json(); }.bind(this))
			.then(function(ti){
				this.lasthistdata[ccode] = ti;
				return ti;
			}.bind(this));
	}
	get_companyinfo_by_sec(scid, ccode) {
		/*http://www.pse.com.ph/stockMarket/companyInfoHistoricalData.html?method=getRecentSecurityQuoteData&ajax=true*/
		//need post data. how??????
		return this.page
			.goto(this.mainurl+'companyInfoHistoricalData.html?method=getRecentSecurityQuoteData&ajax=true')
			.then(function (res) { return res.json(); }.bind(this))
			.then(function(ti){
				this.lasthistdata[ccode] = ti;
				return ti;
			}.bind(this));
	}

}