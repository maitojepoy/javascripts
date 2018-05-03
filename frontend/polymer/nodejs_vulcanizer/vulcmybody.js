var Promise   = require('promise');
var fs    	  = require('fs');
var path 	  = require('path');
var gulp 	  = require('gulp');
var gulpif 	  = require('gulp-if');
var vulcanize = require('gulp-vulcanize');
var polyclean = require('polyclean');
var rename 	  = require("gulp-rename");
var crisper   = require("gulp-crisper");

function VulcMyBody(lefile, destfolder, includefiles, excludees, dellink, crispy) {
	if (typeof excludees == 'undefined') excludees = {};

	if (typeof dellink == 'undefined') dellink = false;

	var crispness = crispy || !!0;

	this.prom = new Promise(function (resolve, reject) {
	            this.resolve = resolve;
	            this.reject = reject;
	         }.bind(this));

	var el = this;

	console.log('what are includefiles---------------');
	console.log(includefiles);
	console.log('what are excludees---------------');
	console.log(excludees);

	var reqs = Object.assign({
				inlineScripts: true,
				inlineCss: true,
				stripComments: true }, 
			excludees);
	
	var fname = path.basename(lefile);
	var base = path.basename(lefile, '.html');
	var newlefile = destfolder+base+'-links.html';
	var buildfile = destfolder+base+'-build.html';
	//var where = path.dirname(lefile);
	var towrite = includefiles.map(function (x) {
		return '<link href="'+x+'" rel="import" />';
	}).join("\n");

	//var writeDown = 
	console.log('what base', base);
	fs.truncate(newlefile,0, function () {
		console.log('Compiling', fname+'...');
		
		fs.writeFile(newlefile,towrite,function(err){
			console.log('we write');
			var ggulp = gulp.src(newlefile)
						.pipe(vulcanize(reqs))
						.pipe(gulpif(crispness,crisper({
    						jsFileName: base+'-build.js'
  						})))
						//.pipe(polyclean.cleanCss())
						//.pipe(rename(base+'-build.html'))
						.pipe(rename(function(file){
							file.basename = base+'-build';
						}))
						.pipe(gulp.dest(destfolder));
						//.pipe(el.resolve(destfolder+base+'-build.html'));
			ggulp.on('end', function () {
				 this.resolve(destfolder+base+'-build.html');
				 if (dellink)
				 	fs.unlink(destfolder+base+'-links.html')
			}.bind(el));
		}.bind(el));
	});
}

module.exports = VulcMyBody;