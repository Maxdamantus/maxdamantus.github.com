{
	name : "terminal",

	content : [],
	lines : [],

	cur : {x : 0, y : 0},

	szwidth : 0,
	szheight : 0,
	chrwidth : 0,
	chrheight : 0,

	begin : function(){
		terminal.out = document.getElementById("term");
		terminal.cursor = document.getElementById("termcursor");
		terminal.cursor.style.position = "absolute";
		terminal.cursor.style.left = terminal.cursor.style.top = "0px";
		terminal.cursor.appendChild(terminal.cursortext = document.createTextNode("\x0a"));
		(window.onresize = terminal.resize)();
	},

	line : function(text, elem){
		var tt, div, tn, isap;

		tt = document.createElement("tt");
		div = document.createElement("div");
		div.appendChild(tt);

		this.append = function(elem){
			if(isap)
				this.remove();
			elem.appendChild(div);
			isap = elem;
		};

		this.remove = function(elem){
			if(isap)
				isap.removeChild(div);
			isap = undefined;
		};

		this.set = function(text){
			if(tn)
				tt.removeChild(tn);
			tt.appendChild(tn = document.createTextNode(text));
		};

		this.width = function(){
			return tt.offsetWidth;
		};

		if(typeof(text) == "string")
			this.set(text);
		if(elem)
			this.append(elem);
	},

	draw : function(line){
		var x, s;

		if(!line)
			for(x = 0; x < terminal.szheight; x++)
				terminal.lines[x].set(terminal.content[x]?
						terminal.content[x].substring(0, terminal.szwidth) : "\xa0");
		else
			terminal.lines[line].set(terminal.content[line]?
						terminal.content[line].substring(0, terminal.szwidth) : "\xa0");
	},

	resize : function(){
		var x, s;

		for(x in terminal.lines)
			terminal.lines[x].set("\xa0");
		if(terminal.out.offsetHeight == document.body.clientHeight)
			return;
		else if(terminal.out.offsetHeight > document.body.clientHeight)
			while(terminal.out.offsetHeight > document.body.clientHeight && terminal.lines.length)
				terminal.lines.pop().remove();
		else
			while(terminal.out.offsetHeight < document.body.clientHeight && terminal.lines.length < 600)
				terminal.lines.push(new terminal.line("\xa0", terminal.out));
		if(terminal.out.offsetHeight > document.body.clientHeight && terminal.lines.length)
			terminal.lines.pop().remove();

		terminal.szheight = terminal.lines.length;
		terminal.szwidth = 0;
		terminal.chrheight = terminal.out.offsetHeight / terminal.szheight;
		terminal.chrwidth = 0;

		if(terminal.lines[0]){
			for(s = "\xa0", x = 1; terminal.lines[0].set(s), x < 800; s += "\xa0", x++)
				if(terminal.lines[0].width() > document.body.clientWidth)
					break;
			terminal.szwidth = x - 1;
			terminal.chrwidth = terminal.lines[0].width() / x;
		}

		while(terminal.content.length > terminal.szwidth)
			terminal.content.shift();

		log("resized to " + terminal.szwidth + "*" + terminal.szheight);

		terminal.draw();
	},

	setcur : function(x, y){
		if(x < 0){
			x = terminal.szwidth - 1;
			y--;
		}
		terminal.cur.x = x % terminal.szwidth;
		y += Math.floor(x / terminal.szwidth);
		if(y >= terminal.szheight){
			terminal.moveup(y - terminal.szheight + 1);
			terminal.cur.y = terminal.szheight - 1;
		}else
			terminal.cur.y = y;
		if(terminal.cur.y < 0)
			terminal.cur.y = 0;
		terminal.cursor.style.left = (terminal.cur.x * terminal.chrwidth) + "px";
		terminal.cursor.style.top = (terminal.cur.y * terminal.chrheight) + "px";
		terminal.cursor.removeChild(terminal.cursortext);
		terminal.cursor.appendChild(terminal.cursortext = document.createTextNode(terminal.charat(terminal.cur.x, terminal.cur.y)));
	},

	charat : function(x, y){
		return terminal.content[y] && terminal.content[y].length > x ? terminal.content[y].charAt(x) :
			"\x0a";
	},

	movecur : function(x, y){
		terminal.setcur(terminal.cur.x + x, terminal.cur.y + y);
	},

	down : function(count){
		terminal.movecur(0, count? count : 1);
	},

	cr : function(){
		terminal.setcur(0, terminal.cur.y);
	},

	lf : function(){
		terminal.setcur(0, terminal.cur.y + 1);
	},

	sanitise : function(input){
		while(input.indexOf("\x20") >= 0)
			input = input.replace("\x20", "\xa0");
		return input;
	},

	moveup : function(count){
		var x;

		log("moveup(" + count + ")");
		if(count == 0)
			return;
		if(!count)
			count = 1;
		for(x = count; x < terminal.szheight; x++)
			terminal.content[x - count] = terminal.content[x]? terminal.content[x] : "";
		for(; x < terminal.szheight + count; x++)
			terminal.content[x - count] = "";
		terminal.draw();
	},

	write : function(text){
		var s;
		text = terminal.sanitise(text);

		do{
			if(!terminal.content[terminal.cur.y])
				terminal.content[terminal.cur.y] = Array(terminal.szwidth + 1).join("\xa0");
			s = text.substr(0, terminal.szwidth - terminal.cur.x)
			terminal.content[terminal.cur.y] = terminal.content[terminal.cur.y].substr(0, terminal.cur.x) + s +
				terminal.content[terminal.cur.y].substr(terminal.cur.x + s.length, terminal.szwidth - terminal.cur.x - s.length);
			text = text.substr(terminal.szwidth - terminal.cur.x);
			terminal.draw(terminal.cur.y);
			terminal.movecur(s.length, 0);
		}while(text);
	}
}
