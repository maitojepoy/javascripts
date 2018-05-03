/**
Common useful string functions
**/
Stringers = {
	truncate: function(input, length, killwords, end) {
		//return input;
		if(!input || input == '') {
	        return;
	    }
		input = input.toString();
	    length = length || 255;
	    
	    if (input.length <= length)
	        return input;

	    if (killwords) {
	        input = input.substring(0, length);
	    } else {
	        var idx = input.lastIndexOf(' ', length);
	        if (idx === -1) {
	            idx = length;
	        }

	        input = input.substring(0, idx);
	    }

	    input += (end !== undefined && end !== null) ? end : '...';
	    return input;
	},

	nl2br: function(str, is_xhtml) {
		//  discuss at: http://phpjs.org/functions/nl2br/
		// original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
		// improved by: Philip Peterson
		// improved by: Onno Marsman
		// improved by: Atli Þór
		// improved by: Brett Zamir (http://brett-zamir.me)
		// improved by: Maximusya
		// bugfixed by: Onno Marsman
		// bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
		//    input by: Brett Zamir (http://brett-zamir.me)
		//   example 1: nl2br('Kevin\nvan\nZonneveld');
		//   returns 1: 'Kevin<br />\nvan<br />\nZonneveld'
		//   example 2: nl2br("\nOne\nTwo\n\nThree\n", false);
		//   returns 2: '<br>\nOne<br>\nTwo<br>\n<br>\nThree<br>\n'
		//   example 3: nl2br("\nOne\nTwo\n\nThree\n", true);
		//   returns 3: '<br />\nOne<br />\nTwo<br />\n<br />\nThree<br />\n'

		var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br ' + '/>' : '<br>'; // Adjust comment to avoid issue on phpjs.org display

		return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
	},

	shuffle: function(array){
	    var rand, index = -1,
	        length = array.length,
	        result = Array(length);
	    while (++index < length) {
	        rand = Math.floor(Math.random() * (index + 1));
	        result[index] = result[rand];
	        result[rand] = array[index];
	    }
	    return result;
	},

	name_to_url: function(name){
	    name = name.toLowerCase(); // lowercase
	    name = name.replace(/^\s+|\s+$/g, ''); // remove leading and trailing whitespaces
	    name = name.replace(/\s+/g, '-'); // convert (continuous) whitespaces to one -
	    name = name.replace(/[^a-z-0-9-]/g, ''); // remove everything that is not [a-z] or -
	    name = name.replace(/^-+|-+$|(-)+/g, '$1');
	    return name;
	}
};