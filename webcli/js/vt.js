{
	name : "vt",

	rbuf : "",
	rdwait : [],

	lc : [0, 0], ll : false,

	begin : function(){
		document.onkeypress = vt.evhandler;
		terminal.out.onclick = vt.clickhandler;
	},

	clickhandler : function(){
		var t = (new Date()).getTime(), tl, ta, tv = "", en = false, f;

		if(vt.ll)
			return;
		if(t - vt.lc[0] < 1000){
			document.onkeypress = undefined;
			document.body.appendChild(ta = document.createElement("textarea"));
			ta.id = "cpinp";
			ta.focus();
			vt.ll = true;
			setTimeout(f = function(){
				t = (new Date()).getTime();
				if((!en && ta.value.length) || (en && tv != ta.value)){
					en = true;
					tv = ta.value;
					tl = t;
				}
				else if(en && t - tl > 250){
					document.body.removeChild(ta);
					document.onkeypress = vt.evhandler;
					vt.ll = false;
					vt.pushbuf(ta.value);
					return;
				}
				setTimeout(f, 100);
			}, 100);
			vt.lc = [0, 0];
		}else
			vt.lc = [vt.lc[1], t];
	},

	evhandler : function(e){
		var key;

		key = 0;
		switch(e.keyCode){
			case 27: key++; // 12 esc
			case 8:  key++; // 11 backspace

			case 45: key++; // 10 ins
			case 46: key++; //  9 del
			case 36: key++; //  8 home
			case 35: key++; //  7 end
			case 33: key++; //  6 pgup
			case 34: key++; //  5 pgdown

			case 37: key++; //  4 left
			case 39: key++; //  3 right
			case 40: key++; //  2 down
			case 38: key++; //  1 up
				vt.pushbuf("\x1b" + String.fromCharCode(key));
				break;
			default:
				if(e.keyCode == 13) // enter
					vt.pushbuf("\n");
				else if((e.charCode >= 32 && e.charCode <= 126) || e.charCode == 9)
					vt.pushbuf(String.fromCharCode(e.charCode));
				else{
					log(e.keyCode);
					return true;
				}
		}

		return false;
	},

	iogetvar : function(pid, name){
		switch(name){
			case "ispty":
				return true;
			case "width":
				return terminal.szwidth;
			case "height":
				return terminal.szheight;
		}
		return -2;
	},

	pushbuf : function(text){
		var x, wait = vt.rdwait;

		vt.rbuf += text;
		if(vt.rdwait.length){
			vt.rdwait = [];
			for(x in wait)
				wait[x](vt.rbuf);
			vt.rbuf = "";
		}
	},

	rdhandler : function(pid, func){
		vt.rdwait.push(func);
	},

	wrhandler : function(pid, text, func){
		var buf = "";

		for(x = 0; x < text.length; x++){
			if(text.charAt(x) == "\x1b"){
				terminal.write(buf), buf = "";
				switch(text.charCodeAt(++x)){
					case 1: terminal.movecur(0, -1); break;
					case 2: terminal.movecur(0, 1); break;
					case 3: terminal.movecur(1, 0); break;
					case 4: terminal.movecur(-1, 0); break;
				}
			}
			else if(text.charAt(x) == "\r")
				terminal.write(buf), buf = "", terminal.cr();
			else if(text.charAt(x) == "\n")
				terminal.write(buf), buf = "", terminal.lf();
			else if(text.charCodeAt(x) >= 32 && text.charCodeAt(x) <= 126)
				buf += text.charAt(x);
		}
		terminal.write(buf);
		if(func)
			func(x);
	}
}
