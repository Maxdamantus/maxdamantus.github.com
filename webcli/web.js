var web;

web = {
	ajcons : 
		XMLHttpRequest? XMLHttpRequest :
		ActiveXObject && ActiveXObject("Msxml2.XMLHTTP")? ActiveXObject("Msxml2.XMLHTTP") :
		ActiveXObject && ActiveXObject("Microsoft.XMLHTTP")? ActiveXObject("Microsoft.XMLHTTP") : null,

	get : function(page, func, onpart){
		var aj;

		aj = new web.ajcons;
		aj.onreadystatechange = function(){
			if(func && aj.readyState == 4 || (onpart && aj.readyState == 3))
				func(aj.responseText, aj.readyState == 4);
		};
		aj.open("GET", page, true);
		aj.send(null);
	},
		
	load : function(page, func){
		web.get(page, function(text){
			func? func(eval("(" + text + ")")) :
			eval(text);
		});
	},

	run : function(page, func){
		web.load(page, function(res){
			if(typeof(res) == "object"){
				if(typeof(res.name) == "string")
					window[res.name] = res;
				if(typeof(res.onload) == "function")
					res.onload();
			}
			else if(typeof(res) == "function")
				res();
			if(func)
				func();
		});
	}
};
