/* works like indexOf but items are object, and looks at given key */
Array.prototype.objectIndexOf = function(ndl,key) {
	var ik = this.map(function(x){ return x[key]; });
	return ik.indexOf(ndl);
};

/* returns all unique items (object-based) */
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

/* returns all common items (object-based) */
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