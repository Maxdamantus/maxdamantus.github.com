{
	name : "mlibj",

	readline : function(proc){
		var infd, outfd,
			line = "", linep = 0,
			prompt = "",
			termw = 0, termh = 0, ispty = 0,
			hist = [], histp = 0,
			cbfunc, tabfunc;

		var that = this;

		this.reset = function(nprompt, nline){
			var out = "", x;

			for(x = 0; x < linep + prompt.length; x++)
				out += "\x1b\x04";
			for(x = 0; x < prompt.length + line.length; x++)
				out += " ";
			for(x = 0; x < prompt.length + line.length; x++)
				out += "\x1b\x04";
			out += (prompt = nprompt) + (line = nline);
			linep = line.length;
			proc.write(outfd, out);
		};

		this.setprompt = function(nprompt){
			prompt = nprompt;
		};

		this.setfds = function(ninfd, noutfd){
			infd = ninfd;
			outfd = noutfd;
		};

		this.sethist = function(nhist){
			hist = nhist;
		};

		this.addhist = function(item){
			hist.push(item);
		};

		this.setcb = function(ncbfunc, ntabfunc){
			if(typeof ncbfunc == "function")
				cbfunc = ncbfunc;
			if(typeof ntabfunc == "function")
				tabfunc = ntabfunc;
		};

		this.start = function(){
			proc.read(infd, that.onread);
			line = "";
			linep = 0;
			proc.write(outfd, prompt);
		};

		this.onread = function(buf){
			var x, y, out = "";

			for(x = 0; x < buf.length; x++){
				if(buf.charAt(x) == "\x1b")
					switch(buf.charCodeAt(++x)){
						case 1: // up
							if(histp > 0 && hist.length)
								that.reset(prompt, hist[--histp]);
							break;
						case 2: // down
							if(histp < hist.length)
								that.reset(prompt, hist[++histp]? hist[histp] : "");
							break;
						case 4: // left
							if(linep > 0){
								linep--;
								out += "\x1b\x04";
							}
							break;
						case 3: // right
							if(linep < line.length){
								linep++;
								out += "\x1b\x03";
							}
							break;
						case 7: // end
							for(; linep < line.length; linep++)
								out += "\x1b\x03";
							break;
						case 8: // home
							for(; linep > 0; linep--)
								out += "\x1b\x04";
							break;
						case 11: // backspace
							if(linep > 0){
								out += "\x1b\x04";
								out += line.substr(linep) + " ";
								for(y = 0; y < line.length - linep + 1; y++)
									out += "\x1b\x04";
								line = line.substr(0, linep - 1) + line.substr(linep);
								linep--;
							}
							break;
						case 9: // delete
							if(linep < line.length){
								out += line.substr(linep + 1) + " ";
								for(y = 0; y < line.length - linep; y++)
									out += "\x1b\x04";
								line = line.substr(0, linep) + line.substr(linep + 1);
							}
							break;
					}
				else if(buf.charCodeAt(x) >= 32 && buf.charCodeAt(x) <= 126){
					out += buf.charAt(x) + line.substr(linep);
					line = line.substr(0, linep) + buf.charAt(x) + line.substr(linep);
					for(y = 0; y < line.length - linep - 1; y++)
						out += "\x1b\x04";
					linep++;
				}
				else if(buf.charAt(x) == "\n"){
					proc.write(outfd, out + "\n");
					hist.push(line);
					histp = hist.length;
					if(cbfunc)
						cbfunc(line);
					return;
				}
			}
			proc.write(outfd, out);
			proc.read(infd, that.onread);
		};
	}
}
