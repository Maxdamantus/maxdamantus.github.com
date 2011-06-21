var deps = ["terminal", "sandbox", "vt", "josix", "mlibj", "clitest", "ll"];
var dbg = true, pages = {};

function checkdeps(){
	for(x in deps)
		if(!window[deps[x]])
			return;
	for(x in deps)
		if(window[deps[x]].begin)
			window[deps[x]].begin();
}

function log(){}

function main(){
	for(x in deps)
		web.run("js/" + deps[x] + ".js", checkdeps);
}
