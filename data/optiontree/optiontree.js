var OptNode = class {
	constructor(ident,arr,obj) {
		this.ident = ident;
		if (typeof obj != 'undefined') this.obj = obj;
		this.choices = arr || [];
		this.nodes = new Array(this.choices.length);
	}
	get numchoices() {
		return this.choices.length;
	}
	addNode(node,where){
		var idx = this.choices.indexOf(where);
		this.nodes[idx] = node;
		return idx;
	}
	whatNode(choice) {
		var idx = this.choices.indexOf(choice);
		return this.nodes[idx];
	}
}

var OptionTree = class {
	constructor(options,variants) {
		this._ro = options, this._rov = variants;
		this.options = this._ro.map(function(x){
			var vlput = x.values.map(function(y){
					return y.value_id;
				});
			return { 
				'option_id': x.option_id, 
				'option_name': x.option_name, 
				'display_type': x.display_type, 
				'choices': vlput
			};
		});
		this.idents = this._ro.map(function(x){
			return x.option_name;
		});
		this.variants = this._rov.map(function(x){
			return JSON.parse('['+x.value_ids+']');
		});
		this.optionLevel = (this.variants.length > 0)?this.variants[0].length:0;
		this.userchoice = [];
		this._lvl = 0;
	}
	get topNode(){
		return this._top;
	}
	process(){
		this._top = new OptNode('_top',this.options[0].choices, this._ro[0]);
		for (var i=0; i<this.variants.length; i++) {
			var point = this._top, nn;
			for (var j=0; j<this.variants[i].length; j++) {
				nn = point.whatNode(this.variants[i][j]);
				if (typeof nn == 'undefined') {
					var optin = this.options[j+1];
					if (typeof optin == 'undefined') optin = null;
					else optin = optin.choices;
					nn = new OptNode(this.idents[j],optin || null, this._ro[j+1] || undefined);
					if (j==this.variants[i].length-1) nn.variant_value = this._rov[i];
					point.addNode(nn,this.variants[i][j]);
				}
				point = nn;
			}
		}
		this.resetpointer();
	}

	resetpointer(){
		this._lvl = 0;
		this._userpoint = this._top;
	}
	giveChoiceByLevel(opt,lvl) {
		var lvl = (typeof lvl == 'undefined')?this._lvl:lvl;
		if (lvl > this._lvl+1) throw new Error('level_exceed');

		if (lvl != this._lvl) {
			this.userchoice = this.userchoice.slice(0,lvl);
			var __ttop = this._top, uup;
			for (var i=0; i<this.userchoice.length; i++) {
				uup = this._executePointChange(__ttop,this.userchoice[i],i);
				__ttop = uup.node;
			}
			this._userpoint = __ttop;
		}
		var mifilt = this._executePointChange(this._userpoint,opt,lvl);
		this._userpoint = mifilt.node;
		this.userchoice[lvl] = opt;
		this._lvl = lvl+1;
		return mifilt.options;
	}
	_executePointChange(whatpoint,opt,lvl) {
		var uu = whatpoint.whatNode(opt);
		var filt = [];
		for (var i=0; i<uu.nodes.length; i++) {
			if (typeof uu.nodes[i] != 'undefined')
				filt.push({'rawopt':uu.obj.values[i],'node':uu.nodes[i]});
		}
		return {'node':uu,'options':filt};
	}
}

/**

This is used to map out product options (size, color, fabric, etc) with availability of variants (size 10, color blue, etc.)

The concept of this is using tree traversal. Maximum of 4 options only.

Example to use:

prodopt = new OptionTree(<options_obj>,<variants_obj>);
prodopt.process();
prodopt.giveChoiceByLevel(<chosen.value_id_or_something>,<lvl>);

**/
