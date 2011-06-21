{
	name: "ll",

	run: function(code){

function print(){};

function parse(str){
	print("parse(\"" + str + "\")");
	var cur = 0, len = str.length;

	var opmap = {
		"=<<": { fix: 18, ass: 0 },
		">>=": { fix: 18, ass: 1 },
		">>": { fix: 18, ass: 1 },
		"->": { fix: 18, ass: 1 },
		"==": { fix: 6, ass: 0 },
		"/=": { fix: 6, ass: 0 },
		"<=": { fix: 6, ass: 0 },
		">=": { fix: 6, ass: 0 },
		"&&": { fix: 7, ass: 1 },
		"||": { fix: 8, ass: 1 },
		"++": { fix: 5, ass: 1 },
		"<": { fix: 6, ass: 0 },
		">": { fix: 6, ass: 0 },
		":": { fix: 5, ass: 1 },
		".": { fix: 1, ass: 1 },
		"$": { fix: 10, ass: 1 },
		"@": { fix: 17, ass: 1 },
		"~": { fix: 19.5, ass: 0 },
		"*": { fix: 3, ass: 0 },
		"/": { fix: 3, ass: 0 },
		"^": { fix: 2, ass: 1 },
		"+": { fix: 4, ass: 0 },
		"-": { fix: 4, ass: 0 },
		";": { fix: 999, ass: 1 }, // not really an operator
		"|": { fix: 19, ass: 1 },
		",": { fix: 20, ass: 1 },
		"=": { fix: 21, ass: 1 } // ...
	};

	function tokens(){
		var r = [], c, y, f;

		while(cur < len)
			switch(str.charAt(cur)){
				case '(': case '[': case '{':
					cur++; r.push(tokens());
					break;
				case ')': case ']': case '}':
					cur++; return {type: "list", br: str.charAt(cur-1), val: r};
				case ' ': case '\n': case '\t':
					cur++;
					break;
				case '"':
					for(y = cur + 1; y < len; y++)
						if(str.charAt(y) == "\\")
							y++;
						else if(str.charAt(y) == "\"")
							break;
					r.push({type: "string", val: str.substr(cur, y - cur + 1)});
					cur = y + 1;
					break;
				default:
					c = str.charCodeAt(cur);
					f = 0;
					if(c >= 48 && c <= 57){
						for(y = 0; cur + y < len; y++)
							if(((c = str.charCodeAt(cur + y)) < 48 || c > 57) && c != 46 && c != 95)
								break;
							else if(c == 95)
								f = 1;
						r.push({type: "num", val: (f? "-" : "") + str.substr(cur, y - f)});
						cur += y;
					}else if(c >= 97 && c <= 122 || c >= 65 && c <= 90 || c == 95){
						for(y = 0; cur + y < len; y++)
							if(!((c = str.charCodeAt(cur + y)) >= 97 && c <= 122 || c >= 65 && c <= 90 || c >= 48 && c <= 57 || c == 95))
								break;
						r.push({type: "sym", val: str.substr(cur, y)});
						cur += y;
					}else{
						f = false;
						for(y in opmap)
							if(str.substr(cur, y.length) == y){
								f = true;
								break;
							}
						if(f){
							r.push({type: "op", val: y});
							cur += y.length;
							break;
						}else{
							print("Unknown character: " + str.charAt(cur));
							cur++;
						}
					}
			}
		return r;
	}

	function tree(toks, s, e){
		var x, cur, m;

		function separateby(name){
			var r = [];
			for(m = x = s; x < e; x++)
				if(toks[x].type == "op")
					if(opmap[toks[x].val].fix > opmap[name].fix)
						return null;
					else if(toks[x].val == name)
						r.push(tree(toks, m, x)), m = x + 1;
			if(r.length){
				r.push(tree(toks, m, e));
				return r;
			}else
				return null;
		}

//		print("toks(" + toks.toSource() + ", " + s + ", " + e + ")");
		if(e - s == 0)
			return { type: "tuple", val: [] };
		if(e - s == 1)
			return toks[s].type == "list"? (toks[s].br == "]"? { type: "matchval", val: tree(toks[s].val, 0, toks[s].val.length) } : tree(toks[s].val, 0, toks[s].val.length)) : toks[s];
		if(m = separateby(";"))
			return {
				type: "exprls",
				val: m
			};
		if(m = separateby(","))
			return {
				type: "tuple",
				val: m
			};
		if(m = separateby("|"))
			return {
				type: "lambdals",
				val: m
			};

		for(x = s; x < e; x++)
			if(toks[x].type == "op" && (cur == undefined || m.fix < opmap[toks[x].val].fix || m.fix == opmap[toks[x].val].fix && !m.ass))
				m = opmap[toks[cur = x].val];
//		print("cur = " + cur);
		if(cur != undefined)
			if(toks[cur].val == "="){
				if(cur != s + 1 || cur >= e - 1 || toks[s].type != "sym")
					print("fuck, something went wrong");
				return {
					type: "defeq",
					sym: toks[s].val,
					val: tree(toks, cur + 1, e)
				};
			}
			else if(["->"].indexOf(toks[cur].val) >= 0){
				return {
					type: "lambda",
					left: tree(toks, s, cur),
					val: tree(toks, cur + 1, e)
				};
			}
			else if(s == cur && cur == e - 1)
				return { type: "sym", val: toks[cur].val }
			else if(s == cur || cur == e - 1)
				return {
					type: "apply",
					flip: s == cur,
					call: { type: "sym", val: toks[cur].val },
					arg: s == cur? tree(toks, cur + 1, e) :
						tree(toks, s, cur)
				};
			else
				return {
					type: "apply",
					call: {
						type: "apply",
						call: { type: "sym", val: toks[cur].val },
						arg: tree(toks, s, cur)
					},
					arg: tree(toks, cur + 1, e)
				};
		else
			return {
				type: "apply",
				call: tree(toks, s, e - 1),
				arg: tree(toks, e - 1, e)
			};
	}

	var t = tokens();

	return tree(t, 0, t.length);
}

function tree2s(t){
	if(t.type == "apply")
		return (t.flip? "flip" : "") + "(" + tree2s(t.call) + ")(" + tree2s(t.arg) + ")";
	else
		return t.val;
}

function tree2js(t, match, subl){
	var x, y, z, out;
//	print("tree2js(" + t.toSource() + ")");
	if(match)
		switch(t.type){
			case "sym": case "op":
				match.push(t.val);
				return "function(la){ll$" + symtonum(t.val) + "= la; return true;}";
			case "tuple":
				out = "function(la){la=la();return typeof la==\"object\"&&la instanceof Array&&la.length==" + t.val.length;
				for(x = 0; x < t.val.length; x++)
					out += "&&(" + tree2js(t.val[x], match) + ")(la[" + x + "])";
				out += ";}";
				return out;
			case "num":
				return "function(la){return la()==" + t.val + ";}";
			case "apply":
				if(t.call.type == "sym")
					if(t.call.val == "@")
						return "function(la){return(" + tree2js(t.arg, match) + ")(la);}";
					else
						return "function(la){la=la(); return typeof la==\"object\"&&la.o==ll$c" + symtonum(t.call.val) + "&&(" +
							tree2js(t.arg, match) + ")(la.v);}";
				return "function(la){return(" + tree2js(t.call, match) + ")(la)&&(" + tree2js(t.arg, match) + ")(la);}";
			case "matchval": case "string":
				return "function(la){return!!llequals(la(), (" + tree2js(t.type == "matchval"? t.val : t) + ")());}";
//			case "
		}
	if(t.type == "apply")
		return "value(function(){return " + (t.flip? "llflip" : "") + "(" + tree2js(t.call) + ")()(" + tree2js(t.arg) + ")();})";
	else if(t.type == "sym" || t.type == "op")
		return "ll$" + symtonum(t.val).toString();
	else if(t.type == "string")
		return "llstr(" + t.val + ", ll$" + symtonum("Char") + ", ll$" + symtonum("List") + ")";
	else if(t.type == "num")
		return "valuec(" + t.val + ")";
	else if(t.type == "exprls"){
		for(out = "value(function(){", x = 0; x < t.val.length - 1; x++)
			out += tree2js(t.val[x]);
		return out + "return " + tree2js(t.val[x]) + "();})";
	}
	else if(t.type == "defeq")
		return "var ll$" + symtonum(t.sym).toString() + "=value(function(){return " + tree2js(t.val) + "();});";
	else if(t.type == "lambdals"){
		out = "valuec(function(la){var rv;";
		for(x = 0; x < t.val.length; x++)
			out += "(" + tree2js(t.val[x], false, true) + ")(la)||";
		out += "(rv=valuec([])); return rv;})";
		return out;
	}
	else if(t.type == "lambda"){
		out = "function(la){";
		x = tree2js(t.left, y = []);
		for(z = 0; z < y.length; z++)
			out += (z == 0? "var " : "") + "ll$" + symtonum(y[z]) + (z < y.length - 1? "," : ";");
		if(subl)
			return out + "return (" + x + ")(la)?(rv=" + tree2js(t.val) + ",true):false;}";
		return "valuec(" + out + "return (" + x + ")(la)?" + tree2js(t.val) + ":valuec([]);})";
//		return out;
//		return "valuec(function(ll$" + symtonum(t.sym).toString() +"){return " + tree2js(t.val) + ";})";
	}
	else if(t.type == "tuple"){
		for(out = "value(function(){return [", x = 0; x < t.val.length; x++)
			out += tree2js(t.val[x]) + (x < t.val.length - 1? "," : "");
		return out + "];})";
	}
}

function llflip(fn){
	return curry(2, function(a, b){
		return fn()(b)()(a);
	});
}

function llstr(strc, charc, listc){
	function from(n){
		return value(function(){
			return listc()(valuec(
				n < strc.length? [charc()(valuec(strc.charCodeAt(n))), from(n+1)] : []
			))();
		});
	}
	return from(0);
}

// optimal for tuples with recursive ends
function llequals(a, b){
	var ta, tb, x;
	for(;;){
		if((ta = typeof a) != (tb = typeof b))
			return 0;
		if(ta == "object")
			if(a instanceof Array){
				if(!(b instanceof Array) || a.length != b.length)
					return 0;
				if(a.length == 0)
					return 1;
				for(x = 0; x < a.length - 1; x++)
					if(!llequals(a[x](), b[x]()))
						return 0;
				a = a[x]();
				b = b[x]();
				continue;
			}else{
				if(a.o != b.o)
					return 0;
				a = a.v();
				b = b.v();
				continue;
			}
		else if(ta == "number")
			return a == b? 1 : 0;
		else
			return 0;
	}
}


function lleval(inp){
	var main, head = "", x;

	syms = {};
	symn = 0;
	main = tree2js(parse(staticlib.join("") + inp));
	for(x in globalvals)
		if(syms.hasOwnProperty(x))
			head += "var ll$" + syms[x] + " = globalvals[\"" + x + "\"];\n";
	for(x in syms)
		if(x.charCodeAt(0) >= 65 && x.charCodeAt(0) <= 90)
			head += "var ll$c" + syms[x] + " = {n: \"" + x + "\", i: " + syms[x] + "}; var ll$" + syms[x] + " = valuec(function(a){return valuec({o: ll$c" + syms[x] + ",v:a});});\n";
	print("EVAL!!!");
	print(head + main);
//	print(syms.toSource());
	return eval(head + main)();
}

var syms, symn;

function symtonum(str){
	if(!syms.hasOwnProperty(str))
		syms[str] = symn++;
	return syms[str];
}

function value(fn){
	var vv = null, vc = false;

	return function(){
		if(!vc)
			vv = fn(), vc = true;
		return vv;
	};
}

function valuec(v){
	return value(function(){
		return v;
	});
}

function curry(nargs, fn, cur){
	if(!cur)
		cur = [];
	if(cur.length == nargs)
		return fn.apply(null, cur);
	return valuec(function(na){
		var c2 = cur.slice(0);
		c2.push(na);
		return curry(nargs, fn, c2);
	});
}

var staticlib = [
	". = a -> b -> c -> a (b c);",
	"$ = a -> b -> a b;", 
	"~ = a -> b -> b a;",
	"|| = 0 -> id | a -> const a;",
	"&& = 0 -> const 0 | a -> id;",
	"ap = a -> b -> c -> a c (b c);",
	"zipWith = a -> b -> c -> ife (empty b || empty c) el $ a (head b) (head c) : zipWith a (tail b) (tail c);",
	"zip = zipWith (a -> b -> (a, b));",
	"succ = 1+;",
	"pred = -1;",
	"iterate = a -> b -> b : iterate a (a b);",
	"map = a -> (List (b,c) -> (a b : map a c) | List () -> el);",
	"string = map Char;",
	"is = iterate succ;",
	"ip = iterate pred;",
	"id = a -> a;",
	"true = 1; false = 0;",
	"const = a -> b -> a;",
	": = a -> b -> List (a, b);",
	"el = List ();",
	"empty = List () -> 1 | a -> 0;",
	"head = List (a, b) -> a;",
	"tail = List (a, b) -> b;",
	"fix = a -> a (fix a);",
	"++ = flip (foldr (:));",
	"not = 0 -> 1 | a -> 0;",
	"signum = a -> {true ~ [a < 0] -> 1_ | [a == 0] -> 0 | [a > 0] -> 1};",
	"takeWhile = a -> b -> ife (empty b || not (a (head b))) el (head b : takeWhile a (tail b));",
	"take = a -> b -> ife (a <= 0 || empty b) el (head b : take (a - 1) (tail b));",
//	"dropWhile = a -> b -> ife (empty b || not (a (head b))) b (dropWhile a (tail b));",
	"dropWhile = a -> (f = List () -> (1, el) | List (b, c) -> ife (a b) (0, f c) (1, b : c); tco . f);",
//	"drop = a -> b -> ife (a <= 0 || empty b) b (drop (a - 1) (tail b));",
	"drop = (f = a -> { List () -> (1, el) | b @ List (_, d) -> ife (a <= 0) (1, b) (0, f (a - 1) d) }; (tco .) . f);",
	"fromTo = a -> b -> takeWhile (<= b) (is a);",
	"cycle = a -> a ++ cycle a;",
	"repeat = a -> a : repeat a;",
	"replicate = (. repeat) . take;",
	"concat = foldl (++) el;",
	"pi = 3.141592653589793238462643383279502884197169399375105820974944592307;",
	"e = 2.718281828459045235360287471352662497757247093699959574966967;",
	"fst = telem 0; snd = telem 1; thd = telem 2;",
	"curry = a -> b -> c -> a (b, c);",
	"uncurry = a -> (b,c) -> a b c;",
	"flip = a -> b -> c -> a c b;",
	"foldl = a -> b -> c -> (c ~ List() -> b | List (d, e) -> foldl a (a b d) e);",
	"foldl_ = a -> (f = b -> c -> (c ~ List() -> (1, b) | List (d, e) -> (s = a b d; seq s $ (0, f s e))); (tco .) . f);",
	"foldr = a -> b -> c -> (c ~ List() -> b | List (d, e) -> a d (foldr a b e));",
	"last = (f = List (a, List ()) -> (1, a) | List (a, b) -> (0, f b); tco . f);",
	"ife = 0 -> const id | a -> const;",
	"if = ife;",
	"scanl = a -> b -> c -> b : (ife (empty c) el $ scanl a (a b (head c)) (tail c));",
	"scanl1 = a -> b -> ife (empty b) el $ scanl a (head b) (tail b);",
	"sum = foldl_ (+) 0;",
	">>= = a -> b -> Action (a, b);",
	"=<< = flip (>>=);",
	">> = a -> b -> (a >>= const b);",
	"end = Action ();",
	"newStack = Stack ();",
	"withStack = a -> { Action (b, c) -> { b ~ Push d -> withStack (Stack (d, a)) (c ()) | Pop () -> { a ~ Stack (e, f) -> withStack f (c e) } } | Action () -> a };",
	"reverse = foldl (flip (:)) el;"
	];

var globalvals = {
	"*": curry(2, function(a, b){
		return value(function(){ return a() * b(); });
	}),

	"/": curry(2, function(a, b){
		return value(function(){ return a() / b(); });
	}),

	"+": curry(2, function(a, b){
		return value(function(){ return a() + b(); });
	}),

	"-": curry(2, function(a, b){
		return value(function(){ return a() - b(); });
	}),

	"^": curry(2, function(a, b){
		return value(function(){ return Math.pow(a(), b()); });
	}),

	"sqrt": valuec(function(a){
		return value(function(){ return Math.sqrt(a()); });
	}),

	"log": valuec(function(a){
		return value(function(){ return Math.sqrt(a()); });
	}),
/*
	"head": valuec(function(a){
		return a().v()[0];
	}),

	"tail": valuec(function(a){
		return a().v()[1];
	}),
*/
/*	"empty": valuec(function(a){
		return value(function(){ return a().v().length == 0; });
	}),
*/
	"telem": curry(2, function(a, b){
		return value(function(){ return b()[a()](); });
	}),

	"<": curry(2, function(a, b){
		return value(function(){ return a() < b()? 1 : 0; });
	}),

	">": curry(2, function(a, b){
		return value(function(){ return a() > b()? 1 : 0; });
	}),

	"<=": curry(2, function(a, b){
		return value(function(){ return a() <= b()? 1 : 0; });
	}),

	">=": curry(2, function(a, b){
		return value(function(){ return a() >= b()? 1 : 0; });
	}),

	"==": curry(2, function(a, b){
		return value(function(){
			return llequals(a(), b());
		});
	}),

	"seq": curry(2, function(a, b){
		a();
		return b;
	}),

	"tco": curry(1, function(a){
		for(a = a(); a[0]() == 0; a = a[1]());
		return a[1];
	}),

	"/=": curry(2, function(a, b){
		return value(function(){ return a() != b()? 1 : 0; });
	})
};

//print(ops.mult(valuec(4), valuec(5))());
//print(list().empty());
//print(parse("foo (bar : baz) (4*)").toSource());
//print(ops.cons(valuec(4), ops.cons(valuec(5), ops.cons(valuec(6), vlist()))).get().tail.get().tail.get().head.get());
//print(tree2s(parse("(+) ((/4) . (5*) . foo $ 6+5*4/(3+1)) 2")));
//print(tree2js(parse("5+4")));
//print(lleval("(2/) $ (/5) . (2*) . (3+) $ 4 + (5*) (4)"));
//print(lleval("a = b + c; c = (4*) $ 5 * b; b = 123*456+789; a"));
//print(lleval("a = (+ = *; 5 + 4); a + 5"));
//print(lleval("blah = a -> b -> 2*a + 3*b; foo = blah 5; foo 3 + foo 4"));
//print(lleval("fac = n -> ife (n == 0) 1 $ n * fac (n - 1); fac 100"));
//print(lleval("(4*) $ 5"));
//print(lleval("zipWith = fn -> a -> b -> ife (empty a || empty b) end $ fn (head a) (head b) : zipWith fn (tail a) (tail b); zipWith (*) (1:2:3:4:end) (5:6:7:end)"));
//print(lleval("zipWith = fn -> a -> b -> ife (empty a || empty b) end $ fn (head a) (head b) : zipWith fn (tail a) (tail b); iterate = fn -> s -> s : iterate fn (fn s); iterate (1+) 1; facs = 1 : zipWith (*) (iterate (1+) 1) facs; facs"));
return lleval(code);
}
}
