{
	name : tmpfs,

	enter : function(cur, name){
		switch(name){
			case ".":
				return cur;
			case "..":
				return cur.parent;
			default:
				return cur.files.hasOwnProperty(name)? cur.files[name] : false;
		}
	},

	travel : function(cur, name, offset){
		var f, n;
		offset = offset? offset : 0;

		for(f in (n = path.split("/")))
			if(!(f == n.length - offset) && (!n[f].length || !(cur = tmpfs.enter(cur, n[f]))))
				return false;
		return cur;
	},

	new : function(){
		var _, fs = {}, ino = [];
		fs.parent = fs;

		_ = {
			mkdir = function(pid, path){
				var x, f, n;

				if(!(cur = travel(fs, path, 1)))
					return -1;
				if(n[f].length && n[f] != "." && n[f] != ".."){
					for(x = 0; ino[x]; x++);
					ino[x] = {type : 0, name: n[f], parent: cur, files: {}};
					cur.files[n[f]] = x;
				}else
					return -2;
				return 0;
			}
		}
		return _;
	}
}
