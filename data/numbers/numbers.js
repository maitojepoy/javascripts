Numbers = {
	created: function() {
		this._isInteger();
	},

	//ES6 stuff polyfills!
	/**
	 *	Numbers.isInteger() method determines whether the passed value is an integer
	 */

	_isInteger: function() {
		Number.isInteger = Number.isInteger || function(value) {
		  return typeof value === "number" && 
		    isFinite(value) && 
		    Math.floor(value) === value;
		};		
	},

	/**
	 * Round a number by a specific precision or method
	 * @param  {integer} val       
	 * @param  {integer} precision 
	 * @param  {string} method
	 * @return {string} 
	 */
	round: function (val, precision, method) {
	    precision = precision || 0;
	    var factor = Math.pow(10, precision);
	    var rounder;

	    if (method == 'ceil') {
	        rounder = Math.ceil;
	    } else if (method == 'floor') {
	        rounder = Math.floor;
	    } else {
	        rounder = Math.round;
	    }
	    return rounder(val * factor) / factor;
	},
	
	number_format: function (number, decimals, dec_point, thousands_sep) {
		//   example 1: number_format(1234.56);
		//   returns 1: '1,235'
		//   example 2: number_format(1234.56, 2, ',', ' ');
		//   returns 2: '1 234,56'
		//   example 3: number_format(1234.5678, 2, '.', '');
		//   returns 3: '1234.57'
		//   example 4: number_format(67, 2, ',', '.');
		//   returns 4: '67,00'
		//   example 5: number_format(1000);
		//   returns 5: '1,000'
		//   example 6: number_format(67.311, 2);
		//   returns 6: '67.31'
		//   example 7: number_format(1000.55, 1);
		//   returns 7: '1,000.6'
		//   example 8: number_format(67000, 5, ',', '.');
		//   returns 8: '67.000,00000'
		//   example 9: number_format(0.9, 0);
		//   returns 9: '1'
		//  example 10: number_format('1.20', 2);
		//  returns 10: '1.20'
		//  example 11: number_format('1.20', 4);
		//  returns 11: '1.2000'
		//  example 12: number_format('1.2000', 3);
		//  returns 12: '1.200'
		//  example 13: number_format('1 000,50', 2, '.', ' ');
		//  returns 13: '100 050.00'
		//  example 14: number_format(1e-8, 8, '.', '');
		//  returns 14: '0.00000001'
		number = (number + '')
		.replace(/[^0-9+\-Ee.]/g, '');
		var n = !isFinite(+number) ? 0 : +number,
		prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
		sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
		dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
		s = '',
		toFixedFix = function(n, prec) {
		  var k = Math.pow(10, prec);
		  return '' + (Math.round(n * k) / k)
		    .toFixed(prec);
		};
		// Fix for IE parseFloat(0.55).toFixed(0) = 0;
		s = (prec ? toFixedFix(n, prec) : '' + Math.round(n))
		.split('.');
		if (s[0].length > 3) {
		s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
		}
		if ((s[1] || '')
		.length < prec) {
		s[1] = s[1] || '';
		s[1] += new Array(prec - s[1].length + 1)
		  .join('0');
		}
		return s.join(dec);
	},

	/* get product discount */
	price_discount: function(base_price, sale_price){
		if(typeof sale_price == "undefined") {
			return 0;
		}
		var discount = ((base_price - sale_price) / base_price ) * 100;
		return this.round( discount, 2 );
	},

	abbreviate: function (number, maxPlaces, forcePlaces, forceLetter) {

		/*abbreviate(1200000, 2, false, false)
		abbreviate(1248000, 2, false, false)
		abbreviate(248000, 2, false, false)

		abbreviate(1200000, 2, 2, false)
		abbreviate(1248000, 2, 2, false)
		abbreviate(248000, 2, 2, false)

		abbreviate(1200000, 3, 3, 'M')
		abbreviate(1248000, 3, 3, 'M')
		abbreviate(248000, 3, 3, 'M')*/

		number = Number(number);
		forceLetter = forceLetter || false;
		if(forceLetter !== false) {
			return this.annotate(number, maxPlaces, forcePlaces, forceLetter);
		}
		var abbr;
		if(number >= 1e12) {
			abbr = 'T';
		}
		else if(number >= 1e9) {
			abbr = 'B';
		}
		else if(number >= 1e6) {
			abbr = 'M';
		}
		else if(number >= 1e3) {
			abbr = 'K';
		}
		else {
			abbr = '';
		}
		return this.annotate(number, maxPlaces, forcePlaces, abbr);
	},

	annotate: function (number, maxPlaces, forcePlaces, abbr) {
		// set places to false to not round
		var rounded = 0;
		switch(abbr) {
			case 'T':
				rounded = number / 1e12;
			break;
			case 'B':
				rounded = number / 1e9;
			break;
			case 'M':
				rounded = number / 1e6;
			break;
			case 'K':
				rounded = number / 1e3;
			break;
			case '':
				rounded = number;
			break;
		}
		if(maxPlaces !== false) {
			var test = new RegExp('\\.\\d{' + (maxPlaces + 1) + ',}$');
			if(test.test(('' + rounded))) {
				rounded = rounded.toFixed(maxPlaces);
			}
		}
		if(forcePlaces !== false) {
			rounded = Number(rounded).toFixed(forcePlaces);
		}
		return rounded + abbr;
	},

	abbreviate_number: function(num, fixed) {
		if (num === null) { return null; } // terminate early
		if (num === 0) { return '0'; } // terminate early
		fixed = (!fixed || fixed < 0) ? 0 : fixed; // number of decimal places to show
		var b = (num).toPrecision(2).split("e"), // get power
			k = b.length === 1 ? 0 : Math.floor(Math.min(b[1].slice(1), 14) / 3), // floor at decimals, ceiling at trillions
			c = k < 1 ? num.toFixed(0 + fixed) : (num / Math.pow(10, k * 3) ).toFixed(1 + fixed), // divide by power
			d = c < 0 ? c : Math.abs(c), // enforce -0 is 0
			e = d + ['', 'K', 'M', 'B', 'T'][k]; // append power
		return e;
	}
};