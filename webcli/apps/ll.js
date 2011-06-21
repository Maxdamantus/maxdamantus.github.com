var rl;

rl = readline();
rl.setfds(stdin, stdout);
rl.setprompt("ll> ");
rl.setcb((line){
	write(stdout, lleval(line).toString() + "\n");
	rl.start();
});
rl.start();
