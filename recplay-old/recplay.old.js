function hypot(a, b){
	return Math.sqrt(a*a + b*b);
}

function loadimages(/* ... ,*/ cb){
	var x, o = {}, a = arguments;

	for(x = 0; x < a.length - 1; x++) (function(n){
		(o[a[n]] = new Image()).onload = function(){
			a[a.length-1](a[n], --x);
		};
		o[a[n]].src = "images/" + a[n] + ".png";
	})(x);
	return o;
}

function skewimage(canv, img, bx, by, br, ih, x1, y1, x2, y2){
	var o = x2-x1, a = y2-y1;
	canv.save();
	canv.translate(x1, y1);
	canv.rotate(Math.atan2(a,o));
	canv.drawImage(img, -bx, -by*ih, bx + br + Math.sqrt(o*o + a*a), ih);
/*	canv.beginPath();
	canv.moveTo(0,0);
	canv.lineTo(Math.sqrt(o*o + a*a), 0);
	canv.strokeStyle = "#ff0000";
	canv.stroke(); */
	canv.restore();
}

function player(data, canv, xr, yr){
	var self;
	var ac = 0;;
	var leftw, rightw, head, state, turn = 0;
	var turnframe, turndisp;

	leftw = {xp: 0, yp: 0, r: 0, ra: 0};
	rightw = {xp: 0, yp: 0, r: 0, ra: 0};
	head = {xp: 0, yp: 0, r: 0, ra: 0};

	self = {
		xp : 0, yp : 0,
		xa : 0, ya : 0,
		rot: 0,
		nextframe : function(){
			if(ac >= data.length)
				leftw.r = leftw.ra = rightw.r = rightw.ra = ac = 0;
			self.xp = data[ac++];
			self.yp = data[ac++];
			self.rot = data[ac++]*Math.PI*2/10000; // bike rotation
			leftw.xp = data[ac++];
			leftw.yp = data[ac++];
			leftw.r = data[ac++]; // leftw rotation
			rightw.xp = data[ac++];
			rightw.yp = data[ac++];
			rightw.r = data[ac++]; // rightw rotation
			head.xp = data[ac++]*2;
			head.yp = data[ac++]*2;
			state = data[ac++]; // turn
			if(turn != (state >> 1 & 1)){
				turn = state >> 1 & 1;
				turndisp = !turn;
				turnframe = -14;
			}
//			if(turn)
//			alert(turn);
//			alert(leftw.r);
		},

		draw : function(left, top, wd, ht){
			var a, r, w;
			canv.save();
//			canv.translate(self.xp - left, self.yp - top);
			canv.translate(self.xp, self.yp);

			canv.save();
			canv.translate(leftw.xp, leftw.yp);
			canv.rotate(-leftw.r*Math.PI*2/250);
			canv.drawImage(images.wheel, -19.2, -19.2, 38.4, 38.4);
			canv.restore();

			canv.save();
			canv.translate(rightw.xp, rightw.yp);
			canv.rotate(-rightw.r*Math.PI*2/250);
			canv.drawImage(images.wheel, -19.2, -19.2, 38.4, 38.4);
			canv.restore();

			
//			skewimage(canv, images.susp1, 5, 0.5, 5, 5, r * Math.cos(a), r * Math.sin(a), leftw.xp, leftw.yp);
			canv.save();
			canv.rotate(-self.rot);
			if(turn != turndisp){
				//a = (turn? -1 : 1) * (turnframe++/15);
				a = (turn? -1 : 1) * (turnframe++/15);
				canv.scale(Math.abs(a) > 0.01? a : a < 0? -0.01 : 0.01, 1);
				if(turnframe >= 15){
					turndisp = turn;
					turnframe = -14;
				}
			}else if(turn)
				canv.scale(-1, 1);
			w = turn? rightw : leftw;
			a = Math.atan2(w.yp, (turn? -1 : 1) * w.xp) + (turn? -1 : 1) * self.rot;
			r = hypot(w.xp, w.yp);
			skewimage(canv, images.susp1, 5, 0.5, 5, 7, -20, -17, r * Math.cos(a), r * Math.sin(a));
			w = turn? leftw : rightw;
			a = Math.atan2(w.yp, (turn? -1 : 1) * w.xp) + (turn? -1 : 1) * self.rot;
			r = hypot(w.xp, w.yp);
			skewimage(canv, images.susp2, 5, 0.5, 5, 7, r * Math.cos(a), r * Math.sin(a), 10, 20);

			a = Math.atan2(head.yp, (turn? -1 : 1) * head.xp) + (turn? -1 : 1) * self.rot;
			r = hypot(head.xp, head.yp);
			w = [r * Math.cos(a), r * Math.sin(a)];
			canv.drawImage(images.head, w[0]- 23 + 8, w[1] - 23/2, 23, 23);
/*
			canv.beginPath();
			canv.moveTo(w[0] - 20, w[1]);
			canv.lineTo(w[0] + 20, w[1]);
			canv.moveTo(w[0], w[1] - 20);
			canv.lineTo(w[0], w[1] + 20);
			canv.stroke();
*/

			canv.translate(-42, -10);
//			canv.translate(-660/47, -1980/47);
			canv.rotate(-Math.atan(3/4));
//			canv.translate(-660/47, -1980/47);
			canv.scale(10/47, 10/47);

			// (482x475)/3
			canv.drawImage(images.bike, 0, 0, 380, 301);
			canv.restore();

/*
			a = Math.atan2(-17, -20) - self.rot;
			r = Math.sqrt(400+17*17);
//			skewimage(canv, images.susp1, 5, 0.5, 5, 5, r * Math.cos(a), r * Math.sin(a), leftw.xp, leftw.yp);
			a = Math.atan2(20, 10) - self.rot;
			r = Math.sqrt(500);
			skewimage(canv, images.susp2, 5, 0.5, 5, 5, r * Math.cos(a), r * Math.sin(a), rightw.xp, rightw.yp);
//			skewimage(canv, images.susp1, 0, 0, 0, 0, 0, r * Math.cos(a), r * Math.sin(a), leftw.xp, leftw.yp);
*/

/*			canv.save();
//			canv.rotate(-self.rot);
			canv.strokeStyle = "0xff0000";
			canv.beginPath();
			canv.moveTo(-100, 0);
			canv.lineTo(100, 0);
			canv.stroke();
			canv.beginPath();
			canv.moveTo(0, -100);
			canv.lineTo(0, 100);
			canv.stroke();
			canv.fillText("lws=" + leftw.r, -50, 0);
			canv.fillText("rws=" + rightw.r, 30, 0);
			canv.rotate(Math.PI/2);
			canv.fillText("turn=" + (state >> 1 & 1) + " gas=" + (state & 1) + "unk=" + (state >> 2), -120, 0);
			canv.restore(); */

/*			canv.strokeStyle = "#000000";
			canv.beginPath();
			canv.arc(self.xp + leftw.xp - left, self.yp + leftw.yp - top, 19.2, 0, Math.PI*2, false);
			canv.stroke();
			canv.beginPath();
			canv.arc(self.xp + rightw.xp - left, self.yp + rightw.yp - top, 19.2, 0, Math.PI*2, false);
			canv.stroke();*/
/*
			canv.strokeStyle = "#00ff00";
			canv.beginPath();
			canv.arc(head.xp, head.yp, 19.2, 0, Math.PI*2, false);
			canv.stroke();
*/

			canv.restore();
//			canv.restore();
		}
	}

	return self;
}

function canvas(append, width, height){
	var ce = append.appendChild(document.createElement("canvas"));
	ce.setAttribute("width", width);
	ce.setAttribute("height", height);
	return ce.getContext("2d");
}

function rectcross(x1, y1, w1, h1, x2, y2, w2, h2){
	return	y2 < y1 + h1 &&
		y2 + h2 > y1 &&
		x2 < x1 + w1 &&
		x2 + w2 > x1;
}

function pointinbox(x, y, rx, ry, rw, rh){
	return x > rx && x < rx + rw && y > ry && y < ry + rh;
}

// why the fuck JS would have negative modulo outputs, I do not know
function mod(q, d){
	return q >= 0? q % d : d - (-1)*q % d;
}

function level(data, canv){
	var self, polys;
	var x, p, n, i, j, cache = [];
	
	for(polys = [], x = 0; x < data.length;){
		p = {type: data[x++],
		     count: data[x++],
		     verts: [],
		     min: {x: null, y: null},
		     max: {x: null, y: null},
		     siz: null
		    }
		for(n = 0; n < p.count; n++){
			i = data[x++];
			j = data[x++];
			(!n || p.min.x > i) && (p.min.x = i);
			(!n || p.min.y > j) && (p.min.y = j);
			(!n || p.max.x < i) && (p.max.x = i);
			(!n || p.max.y < j) && (p.max.y = j);
			p.verts.push([i,j]);
		}
		p.siz = {w: p.max.x - p.min.x, h: p.max.y - p.min.y};
		polys.push(p);
	}
	data = null;

	function onresize(wd, ht){
		var x, c;

		for(x = 0; x < 4; x++){
			c = document.createElement("canvas");
			c.width = wd;
			c.height = ht;
			cache[x] = {x: 0, y: 0, w: 0, h: 0, c: c, i: c.getContext("2d")};
		}
	}

	function drawpoly(canv, poly){
		var z, a;

//		canv.fillStyle =
//		  poly.type == 1? "#ff0000" : "#0000ff";
//		canv.beginPath();
		canv.moveTo(poly.verts[0][0], poly.verts[0][1]);
		for(z = 1; z < poly.count; z++)
//			for(a = -1; a < 2; a++)
//				if(pointinbox(poly.verts[(z+a)%poly.count][0], poly.verts[(z+a)%poly.count][1], x, y, wd, ht)){
					canv.lineTo(poly.verts[z][0], poly.verts[z][1]);
//					break;
//				}
//		canv.closePath();
//		canv.fill();
	}

	function cdraw(left, top, wd, ht){
		var x, y, z, a;

		for(x = 0; x < 4; x++){
			if(!rectcross(left, top, wd, ht, cache[x].x, cache[x].y, cache[x].w, cache[x].h))
				for(b = 0, y = left - mod(left, wd); !b && y < left + wd; y += wd)
					for(z = top - mod(top, ht); !b && z < top + ht; z += ht){
						for(a = 0; a < 4; a++)
							if(cache[a].x == y && cache[a].y == z)
								break;
						if(a == 4){
							draw0(cache[x].i, cache[x], y, z, wd, ht);
							b = 1;
						}
					}
//			alert("drawImage(" + [cache[x].c, cache[x].x, cache[x].y, cache[x].w, cache[x].h] + ")");
			canv.drawImage(cache[x].c, cache[x].x, cache[x].y, cache[x].w, cache[x].h);
			canv.strokeStyle = "#ff0000";
			canv.strokeRect(cache[x].x, cache[x].y, cache[x].w, cache[x].h);
		}
	}

	function draw0(canv, cobj, left, top, wd, ht){
		var x, bx, by;

//		cobj.c = document.createElement("canvas");
//		cobj.c.width = wd;
//		cobj.c.height = ht;
//		canv = cobj.i = cobj.c.getContext("2d");
//		canv.fillStyle = "#00ff00";
//		canv.fillRect(0, 0, wd, ht);

		canv.beginPath();
		canv.moveTo(0,0);
		canv.lineTo(wd, 0);
		canv.lineTo(wd, ht);
		canv.lineTo(0, ht);
		canv.closePath();

		canv.save();
		canv.clip();
		canv.translate(-left, -top);
		for(bx = left - mod(left, images.ground.width); bx < left + wd; bx += images.ground.width)
			for(by = top - mod(top, images.ground.height); by < top + ht; by += images.ground.height)
				canv.drawImage(images.ground, bx, by, images.ground.width, images.ground.height); 
		canv.beginPath();
		for(x = 0; x < polys.length; x++)
			if(polys[x].type && rectcross(left, top, wd, ht, polys[x].min.x, polys[x].min.y, polys[x].siz.w, polys[x].siz.h))
				drawpoly(canv, polys[x]);
//		canv.strokeStyle = "#ff0000";
//		canv.stroke();
		canv.clip();
		canv.clearRect(left, top, wd, ht);
//		canv.strokeStyle = "#ff0000";
//		canv.fill();
//		canv.stroke();
		canv.restore();
		cobj.x = left;
		cobj.y = top;
		cobj.w = wd;
		cobj.h = ht;
	}

	return self = {
		draw : function(left, top, wd, ht){
			var bx, by;

			canv.clearRect(left, top, wd, ht);
			for(bx = left - images.sky.width + mod(left, images.sky.width); bx < left + wd; bx += images.sky.width)
				for(by = top - mod(top, images.sky.height); by < top + ht; by += images.sky.height)
					canv.drawImage(images.sky, bx, by, images.sky.width, images.sky.height);

			cdraw(left, top, wd, ht);
		},
		onresize : onresize,
	/*
		draw : function(left, top, wd, ht){
			var x, bx, by;
//			canv.fillStyle = "#ff00ff";
//			canv.fillRect(0, 0, wd, ht);
			for(bx = left - mod(left, images.ground.width); bx < left + wd; bx += images.ground.width)
				for(by = top - mod(top, images.ground.height); by < top + ht; by += images.ground.height)
					canv.drawImage(images.ground, bx, by, images.ground.width, images.ground.height);
			canv.beginPath();
			for(x = 0; x < polys.length; x++)
				if(!polys[x].type)
					drawpoly(wd, ht, polys[x]);
			canv.strokeStyle = "#00ff00";
			canv.stroke();

			canv.beginPath();
			for(x = 0; x < polys.length; x++)
				if(polys[x].type ) // && rectcross(left, top, wd, ht, polys[x].min.x, polys[x].min.y, polys[x].siz.w, polys[x].siz.h))
					drawpoly(wd, ht, polys[x]);
			canv.strokeStyle = "#0000ff";
			canv.stroke();
//			canv.save();
//			canv.clip();
//			for(bx = left - images.sky.width + mod(left, images.sky.width); bx < left + wd; bx += images.sky.width)
//				for(by = top - mod(top, images.sky.height); by < top + ht; by += images.sky.height)
//					canv.drawImage(images.sky, bx, by, images.sky.width, images.sky.height);
//			canv.restore();
		}, */

		polys : function(){return polys;},

		cache : cache
	};
}

var canv, lev, pl, images;

window.onload = function(){
	var cw, ch, cow = 0, coh = 0, canvas;
	canv = document.body.appendChild(canvas = document.createElement("canvas")).getContext("2d");
	lev = level(levdata, canv);
	pl = player(testdata, canv);
	images = loadimages("ground", "sky", "wheel", "bike", "susp1", "susp2", "head", function(a,b){
		if(b > 0)
			return;
		setInterval(function(){
			pl.nextframe();
			cw = window.innerWidth;
			ch = window.innerHeight;
			if(cow != cw || coh != ch){
				canvas.width = cw;
				canvas.height = ch;
				lev.onresize(cw, ch);
				cow = cw;
				coh = ch;
			}
			cx = pl.xp - cw/2;
			cy = pl.yp - ch/2;
			canv.save();
//			canv.translate(cw/2, cw/2);
//			canv.rotate(pl.rot);
//			canv.translate(-pl.xp, -pl.yp);
//			canv.translate(cw/2, cw/2);
			canv.translate(-cx, -cy);
			lev.draw(cx, cy, cw, ch);
			pl.draw(cx, cy, cw, ch);
			canv.restore();
		}, 0/1000/30);
	});
}
var canv, lev, pl, images;

window.onload = function(){
	var cw, ch, cow = 0, coh = 0, canvas, ms1, ms2, ms3;
	var x, f = 0, recnom = [], watch = 0;
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
		ms3 = ms1 = (new Date()).getTime();
		setInterval(function(){
			ms2 = (new Date()).getTime();
			for(x in recs)
				recs[x].nextframe();
//			cw = 500;
//			ch = 500;
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
			canv.fillStyle = "#ffff00";
			canv.fillText("fps: " + Math.round(1000/(ms2 - ms1)*100)/100, 20, 20);
/*			if(ms2 > ms3 + 60000){
//				alert(f);
				f = 0;
				ms3 = (new Date()).getTime()
			}
			f++;
*/			ms1 = ms2;
		}, 1000/30);
	});
}

