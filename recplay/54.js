var canv, lev, pl, images;

window.onload = function(){
	var cw, ch, cow = 0, coh = 0, canvas;
	var x, recnom = [], watch = 0;
	canv = document.body.appendChild(canvas = document.createElement("canvas")).getContext("2d");
	canvas.onclick = function(){watch = (watch + 1) % recnom.length;};
	lev = level(levdata, canv);
	for(x in recs){
		recnom.push(x);
		recs[x] = player(recs[x], canv);
	}
	images = loadimages("ground", "sky", "wheel", "bike", "susp1", "susp2", "head", function(a,b){
		if(b > 0)
			return;
		setInterval(function(){
			for(x in recs)
				recs[x].nextframe();
			cw = window.innerWidth;
			ch = window.innerHeight;
			if(cow != cw || coh != ch){
				canvas.width = cw;
				canvas.height = ch;
				lev.onresize(cw, ch);
				cow = cw;
				coh = ch;
			}
			pl = recs[recnom[watch]];
			cx = pl.xp - cw/2;
			cy = pl.yp - ch/2;
			canv.save();
			canv.translate(-cx, -cy);
			lev.draw(cx, cy, cw, ch);
			for(x in recs)
				recs[x].draw(cx, cy, cw, ch);
			canv.restore();
		}, 0/1000/30);
	});
}

