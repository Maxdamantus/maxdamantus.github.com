var d = false;

var web = {
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

	loader : function(){
		var count = 0, self;

		function checkzero(){
			if(count <= 0 && self.hasOwnProperty("onload"))
				self.onload();
		}

		function loadImages(names, func){
			var out = [], i;

			names.forEach(function(name, x){
				out.push([name, i = new Image()]);
				i.src = name;
				i.onload = function(){
					count--;
					if(func)
						func(name);
					checkzero();
				};
				count++;
			});
			return out;
		}

		function loadAjax(page, func){
			web.get(page, function(data){
				count--;
				func(data);
				checkzero();
			});
			count++;
		}

		function load92(page, func){
			loadAjax(page, function(data){
				func(decode92(data));
			});
		}

		return self = {
			loadImages: loadImages,
			loadAjax: loadAjax,
			load92: load92
		};
	}
};

function decode92(data){
        var p = 0;

        function cc(i){
                return data.charCodeAt(i) - 33;
        }

        function reset(){
        	p = 0;
        }

        function getInt(){
                var s = 0, e = false, o, m = 23;

                for(; !e && p < data.length; p++){
                	if(cc(p) < 0 || cc(p) >= 92)
                		continue;
                        e = cc(p) % 2 == 0;
                        if(!s){
                                s = cc(p) % 4 >= 2? 1 : -1;
                                o = Math.floor(cc(p)/4);
                        }else{
                                o += m * Math.floor(cc(p)/2);
                                m *= 46;
                        }
                }
                return s * o;
        }

        function hasNext(){
        	for(; p < data.length && (cc(p) < 0 || cc(p) >= 92); p++);
                return p < data.length;
        }

        function listAll(){
                var o;

                for(o = []; hasNext(); o.push(getInt()));
                return o;
        }

        return {getInt: getInt, reset: reset, hasNext: hasNext, listAll: listAll};
}

function hypot(a, b){
	return Math.sqrt(a*a + b*b);
}

function loadGraphics(loader, names, func){
	var o = {};

	names.forEach(function(name){
		o[name] = loader.loadImages(["images/" + name + ".png"], function(){
			if(func)
				func(name);
		}).pop()[1];
	});
	return o;
}

function skewimage(canv, img, bx, by, br, ih, x1, y1, x2, y2){
	var o = x2-x1, a = y2-y1;
	canv.save();
	canv.translate(x1, y1);
	canv.rotate(Math.atan2(a,o));
	canv.drawImage(img, -bx, -by*ih, bx + br + hypot(o, a), ih);
	canv.restore();
}

function player(data, images){
	var self;
	var ac = 0;;
	var leftw, rightw, head, state, rot, turn;
	var turnframe, turndisp;

	function reset(){
		leftw = {xp: 0, yp: 0, r: 0, ra: 0};
		rightw = {xp: 0, yp: 0, r: 0, ra: 0};
		head = {xp: 0, yp: 0, r: 0, ra: 0};
		state = turn = rot =
		self.xp = self.yp = self.rot = 0
		data.reset();
	}

	self = {
		nextframe : function(){
			var t;
			if(!data.hasNext())
				reset();
			self.xp += data.getInt();
			self.yp += data.getInt();
			if(self.xp != Math.floor(self.xp) || self.yp != Math.floor(self.yp))
				alert(self.xp + "," + self.yp);
			self.rot = (rot += data.getInt())*Math.PI*2/10000; // bike rotation
			leftw.xp += data.getInt();
			leftw.yp += data.getInt();
			leftw.r += data.getInt(); // leftw rotation
			rightw.xp += data.getInt();
			rightw.yp += data.getInt();
			rightw.r += data.getInt(); // rightw rotation
			head.xp += data.getInt();
			head.yp += data.getInt();
			state += data.getInt(); // turn
			if(turn != (state >> 1 & 1)){
				turn = state >> 1 & 1;
				turndisp = !turn;
				turnframe = -14;
			}
		},

		draw : function(canv, left, top, wd, ht){
			var a, r, w;
			canv.save();
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
				
				canv.save();
					canv.rotate(-self.rot);
					if(turn != turndisp){
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
					canv.drawImage(images.head, w[0]- 23 + 6, w[1] - 23/2 + 8, 23, 23);
					canv.beginPath();
					// head crosshair
					/*
					canv.moveTo(w[0] - 20, w[1]);
					canv.lineTo(w[0] + 20, w[1]);
					canv.moveTo(w[0], w[1] - 20);
					canv.lineTo(w[0], w[1] + 20);
					canv.stroke();
					*/
					canv.translate(-42, -10);
					canv.rotate(-Math.atan(3/4));
					canv.scale(10/47, 10/47);
	
					// (482x475)/3
					canv.drawImage(images.bike, 0, 0, 380, 301);
				canv.restore();
	
//				canv.strokeStyle = "#00ff00";
//				canv.beginPath();
//				canv.arc(head.xp, head.yp, 25/2, 0, Math.PI*2, false);
				canv.stroke();
			canv.restore();
		}
	};

	reset();

	return self;
}

function canvas(append, width, height){
	var ce = append.appendChild(document.createElement("canvas"));
	ce.setAttribute("width", width);
	ce.setAttribute("height", height);
	ce = ce.getContext("2d");
	if(ce.mozImageSmoothingEnabled)
		ce.mozImageSmoothingEnabled = false;
	return ce;
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

function level(data, images){
	var self, polys;
	var px, py, x, p, n, i, j, cache = [];
	
	for(polys = [], px = py = 0; data.hasNext();){
		p = {type: data.getInt(),
		     count: data.getInt(),
		     verts: [],
		     min: {x: null, y: null},
		     max: {x: null, y: null},
		     siz: null
		    }
		for(n = 0; n < p.count; n++){
			i = px += data.getInt();
			j = py += data.getInt();
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

	function drawpoly(canv, poly){
		var z, a;

		canv.moveTo(poly.verts[0][0], poly.verts[0][1]);
		for(z = 1; z < poly.count; z++)
			canv.lineTo(poly.verts[z][0], poly.verts[z][1]);
	}

	function renderer(){
		var cache = [], width = 0, height = 0;

		function resized(wd, ht){
			var x, c;
	
			for(x = 0; x < 4; x++){
				c = document.createElement("canvas");
				c.width = wd;
				c.height = ht;
				cache[x] = {x: 0, y: 0, w: 0, h: 0, c: c, i: c.getContext("2d")};
				if(cache[x].mozImageSmoothingEnabled)
					cache[x].c.mozImageSmoothingEnabled;
			}
			width = wd;
			height = ht;
		}

		function cdraw(canv, left, top, wd, ht){
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
				canv.drawImage(cache[x].c, cache[x].x, cache[x].y, cache[x].w, cache[x].h);
			}
		}
	
		function draw0(canv, cobj, left, top, wd, ht){
			var x, bx, by;
	
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
			canv.clip();
			canv.clearRect(left, top, wd, ht);
			canv.restore();