{
	name : "sandbox",

	keywords : [
		["break"],
		["case"],
		["catch"],
		["continue"],
		["default"],
		["delete"],
		["do"],
		["else"],
		["finally"],
		["for"],
		["function"],
		["if"],
		["in"],
		["instanceof"],
		["new"],
		["return"],
		["switch"],
		["this", "(this == window? undefined : this)"],
		["throw"],
		["try"],
		["typeof"],
		["var"],
		["void"],
		["while"],
		["with"]
	],

	kwmap : {},

	begin : function(){
		var x;

		for(x in sandbox.keywords)
			sandbox.kwmap[sandbox.keywords[x][0]] = sandbox.keywords[x][1]? sandbox.keywords[x][1] : sandbox.keywords[x][0];
	},

	l : function(str, dir, x, y){
		for(; dir > 0? x < str.length : x > 0; x += dir)
			if(" \n\t\r".indexOf(str.charAt(x)) < 0)
				return str.charAt(y? y[0] = x : x);
		if(y)
			y[0] = x;
	},
	
	conv2sb : function(pre, code){
		var x, y, z, c, d, apos, out, sym;

		for(apos = x = 0, out = ""; x < code.length; x++){
			switch(code.charAt(x)){
				case "\"":
					apos++;
				case "'":
					apos++;
					for(y = x + 1; y < code.length; y++){
						if(code.charAt(y) == "\\")
							y++;
						else if(code.charAt(y) == (apos == 1? "'" : "\"")){
							y++;
							break;
						}
					}
					out += code.substr(x, y - x);
					apos = 0;
					x = y - 1;
					break;
				default:
					c = code.charCodeAt(x);
					if(c == 40){
						for(y = x + 1, z = 1; (d = code.charCodeAt(y)) && z; y++)
							z += d == 40? 1 : d == 41? -1 : 0;
						if(sandbox.l(code, 1, y) == "{")
							out += " function ";
					}
					if(c == 95 || c == 36 || ((c & 95) >= 65 && (c & 95) <= 90)){
						for(y = x + 1; c = code.charCodeAt(y), y < code.length && (c == 95 || c == 36 || ((c & 95) >= 65 && (c & 95) <= 90) || (c >= 48 && c < 58)); y++);
						if(sandbox.kwmap.hasOwnProperty(sym = code.substr(x, y - x)))
							out += sandbox.kwmap[sym];
						else if(sandbox.l(code, 1, y) == ":" || sandbox.l(code, -1, x - 1) == ".")
							out += sym;
						else if(sandbox.l(code, 1, y, z = []) == "("){
							for(y = (d = z[0]) + 1, z = 1; y < code.length && (c = code.charCodeAt(y)) && z; y++)
								z += c == 40? 1 : c == 41? -1 : 0;
							out += (sandbox.l(code, 1, y) == "{"? " function " : "") + pre + sym;
							y = d;
						}else
							out += pre + sym;
						if(sandbox.l(code, 1, y) == "(")
							out += "(", y++;
						x = y - 1;
					}else
						out += code.charAt(x);
			}
		}
		return out;
	}
}
