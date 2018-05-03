var _WRITETOLOG = true;
var _CONSOLELOG = true;
var _filetowrite = 'console.log';
var _fd;
var fs = require('fs');

_preparetowrite = function() {
	if (!_WRITETOLOG) return;
	fs.truncate(_filetowrite,0, function(){
		_fd = fs.createWriteStream(_filetowrite, {
		  flags: "a",
		  defaultEncoding: 'utf8',
		  mode: 0744
		});
	});
};

_write = function(str) {
	var ss = [];
	for (var i in arguments) ss.push(arguments[i]);
	str = ss.join(' ');
	if (_WRITETOLOG && typeof _fd != 'undefined')
		_fd.write(str + '\n');
	if (_CONSOLELOG)
		console.log(str);
};

module.exports = {
	'canwrite': _WRITETOLOG,
	'canlog': _CONSOLELOG,
	'prepare':_preparetowrite,
	'write': _write
};