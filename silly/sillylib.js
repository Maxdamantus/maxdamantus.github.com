var silly = function(){
	var silly;

	function mn(ao, a){
		var f, o = Object.create(silly);

		o._c = function(g){
			f = g;
		};
		ao._c(a(function(){ if(f) f(); }));
		return o;
	}

	silly = {
		sleep: function(x){
			return mn(this, function(con){
				setTimeout(con, x);
			};
		},

		async: function(f){
			return mn(this, function(con){
				f();
				setTimeout(con, 0);
			};
		},

		_c: function(f){
			f();
		}
	};

	return silly;
}();
