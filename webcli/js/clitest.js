{
	name : "clitest",

	begin : function(){
		var a, x;

		log("Beginning!");
		a = ["cat", "helloworld", "readtest"];
//		a = ["ll"];
		for(x in a)
			web.get("apps/" + a[x] + ".js", function(text){
				a[x] = josix.start(text, [], [vt, vt], a[x] == "readtest"? [function(code){
					alert("Session ended (pid = " + a[x] + ", exitcode = " + code + ")");
				}] : []);
			});
	},

	onload : function(){}
}
