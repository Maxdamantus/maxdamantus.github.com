var rl;

rl = readline();
rl.setfds(stdin, stdout);
rl.setprompt("> ");
write(stdout, "foo\n");
write(stdout, "bar\n");
rl.setcb((line){
	var s;

	s = line.split(" ");
	switch(s[0]){
		case "eval":
			write(stdout, "=> " + eval(line.substr(line.indexOf(" ") + 1)) + "\n");
			break;
		case "exec":
			write(stdout, "=> " + exec(line.substr(line.indexOf(" ") + 1), [], [stdin, stdout], [(exitcode){
				write(stdout, "=> exited with code " + exitcode + "\n");
				rl.start();
			}]) + "\n");
			return;
		case "help":
			write(stdout, "For help, dial 111\n");
			break;
		case "exit":
			exit(0);
			return;
		case "run":
			read(http("apps/" + line.substr(line.indexOf(" ")) + ".js"), (c){
				exec(c, [], [stdin, stdout], [(exitcode){
					write(stdout, "=> exited with code " + exitcode + "\n");
					rl.start();
				}]);
			});
			break;
		default:
			write(stdout, "unknown command, \"" + s[0] + "\"\n");
	}
	rl.start();
});
write(stdout, "baz\n");
write(stdout, "Beginning the readline..\n");
rl.start();
