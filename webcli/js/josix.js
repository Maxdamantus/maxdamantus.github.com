{
	name : "josix",

	exports : ["read", "write", "close", "exit", "stdin", "stdout", "argv", "iogetvar", "getpid", "eval", "exec", "readline", "http", "sleep", "lleval"],

	procs : [],

	//vfs : tmpfs.new(),

	proc : function(){
		var proc = this;
		var x;

		for(this.pid = 1; this.pid < 65536; this.pid++)
			if(!josix.procs[this.pid])
				break;
		this.pref = "_proc_" + this.pid + "_";
		josix.procs[this.pid] = this;

		this.isalive = true;
		this.fds = [];
		this.onexit = [];
		this.argv = [];

		this.stdin = 0;
		this.stdout = 1;

		this.lleval = ll.run;

		this.read = function(fd, func){
			if(typeof fd == "number" && proc.isalive && proc.fds[fd] && proc.fds[fd].rdhandler)
				proc.fds[fd].rdhandler(proc.pid, function(text){
					if(proc.isalive && func instanceof Function)
						func(typeof text == "string"? text : "");
				});
			else
				return -1;
			return 0;
		};

		this.write = function(fd, text, func){
			if(typeof fd == "number" && proc.isalive && proc.fds[fd] && proc.fds[fd].wrhandler)
				proc.fds[fd].wrhandler(proc.pid, typeof text == "string"? text : "", function(){
					if(proc.isalive && func instanceof Function)
						func();
				});
			else
				return -1;
			return 0;
		};

		this.close = function(fd, func){
			if(typeof fd == "number" && proc.isalive && proc.fds[fd] && proc.fds[fd].clhandler)
				proc.fds[fd].clhandler(proc.pid, function(){
					if(proc.isalive && func instanceof Function)
						func();
				});
			else
				return -1;
			return 0;
		};

		this.exit = function(code){
			if(typeof code != "number")
				code = 0;
			proc.isalive = false;
			for(x in window)
				if(x.substr(0, proc.pref.length) == proc.pref)
					delete window[x];
			for(x in proc.onexit)
				proc.onexit[x](code);
			delete josix.procs[proc.pid];
		};

		this.iogetvar = function(fd, name){
			var res;

			if(typeof fd == "number" && typeof name == "string" && proc.fds[fd] && proc.fds[fd].iogetvar){
				res = proc.fds[fd].iogetvar(proc.pid, name);
				if(typeof res == "number" || typeof res == "string" || typeof res == "boolean")
					return res;
			}
				return -1;
		};

		this.getpid = function(){
			return proc.pid;
		};

		this.eval = function(code){
			return typeof code == "string"? eval(sandbox.conv2sb(proc.pref, code)) : null;
		};

		this.readline = function(){
			return new mlibj.readline(proc);
		};

		this.exec = function(code, argv, fds, onexit){
			var x, nargv = [], nfds = [], nonexit = [];

			if(argv instanceof Array)
				for(x in argv)
					if(typeof argv[x] == "string")
						nargv.push(argv[x]);

			if(fds instanceof Array)
				for(x in fds)
					if(typeof fds[x] == "number" && proc.fds[fds[x]])
						nfds[x] = proc.fds[fds[x]];

			if(onexit instanceof Array)
				for(x in onexit)
					if(onexit[x] instanceof Function)
						nonexit.push(function(exitcode){
							if(proc.isalive)
								onexit[x](exitcode);
						});
			return josix.start(code, nargv, nfds, nonexit);
		};
/*
		this.cwd = new (function(){
			var wdname = "/", wdstack = [];

			this.get = function(){
				return wdname;
			};

			this.set = function(wd){
				var dirs;

				if(typeof wd != "string")
					return -1;
				dirs = wd.split("/");
*/
		this.http = function(page){
			var obj;

			if(typeof page != "string")
				return -1;
			obj = new (function(){
				var rdwait = [], upto = 0, rbuf = "", dead = false;

				this.pushbuf = function(data){
					var x, wait = rdwait;

					rbuf += data;
					if(rdwait.length){
						rdwait = [];
						for(x in wait){
							wait[x](rbuf);
							if(dead && rbuf.length)
								wait[x]("");
						}
						rbuf = "";
					}
				};

				this.rdhandler = function(pid, func){
					rdwait.push(func);
					if(dead)
						obj.pushbuf("");
				};

				web.get(page, function(data){
					var x, wait = rdwait;

					if(data.length > upto){
						obj.pushbuf(data.substr(upto));
						upto = data.length;
					}else{
						dead = true;
						obj.pushbuf("");
					}
				}, true);

			})();
			return proc.addfd(obj);
		};

		proc.addfd = function(obj){
			var x;

			for(x = 0; proc.fds[x]; x++);
			proc.fds[x] = obj;
			return x;
		};

		this.sleep = function(secs, func){
			setTimeout(function(){
				if(proc.isalive && func instanceof Function)
					func();
			}, secs * 1000);
		};

		for(x in josix.exports)
			window[this.pref + josix.exports[x]] = this[josix.exports[x]];
	},

	start : function(prog, argv, fds, onexit){
		var proc, x, code;

		proc = new josix.proc();
		if(fds)
			for(x in fds)
				proc.fds[x] = fds[x];
		if(argv)
			proc.argv = argv;
		if(onexit)
			for(x in onexit)
				proc.onexit.push(onexit[x]);
		try{
			eval(sandbox.conv2sb(proc.pref, prog));
			return proc.pid;
		}catch(e){
			if(onexit)
				setTimeout(function(){
					for(x in onexit)
						onexit[x](-1);
				}, 0);
			alert(e);
			return -1;
		}
	}
}
