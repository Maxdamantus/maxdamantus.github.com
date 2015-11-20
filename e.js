void function(){
	if(window.thisFlagIsForCheckingThatMaxsScriptDoesntRunTwice) return;
	window.thisFlagIsForCheckingThatMaxsScriptDoesntRunTwice = true;
	function randcol(){var r = Math.floor(Math.random()*((1<<24)-1)).toString(16); return "#" + Array(7 - r.length).join("0") + r;}
	function rX(){return cw() * Math.random();}
	function rY(){return ch() * Math.random();}
	function ch(){return window.innerHeight;}
	function cw(){return window.innerWidth;}
	var a = [].concat.apply([], ["img", "div", "a", "span"].map(function(t){ return [].slice.call(document.getElementsByTagName(t)); })).map(function(e){
		e.parentNode.removeChild(e);
		document.body.appendChild(e);
		e.style.position = "absolute";
		return {
			d: e,
			x: rX(),
			y: rY(),
			i: Math.random()*20 - 10,
			j: Math.random()*20 - 10
		};
	});
	setInterval(function(){
		var x;

		for(x = 0; x < a.length; x++){
			a[x].d.style.backgroundColor = randcol();
			(a[x].x += a[x].i) + a[x].d.clientWidth > cw() && (a[x].i = -Math.abs(a[x].i));
			a[x].x < 0 && (a[x].i = Math.abs(a[x].i));
			(a[x].y += a[x].j) + (a[x].d.clientHeight > ch()? a[x].d.clientHeight/2 : a[x].d.clientHeight) > ch() && (a[x].j = -Math.abs(a[x].j));
			a[x].y < 0 && (a[x].j = Math.abs(a[x].j));
			a[x].d.style.left = Math.round(a[x].x) + "px";
			a[x].d.style.top = Math.round(a[x].y) + "px";
		}
	}, 100);
}();
