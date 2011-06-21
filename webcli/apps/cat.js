wait(){
	read(stdin, (text){
		write(stdout, text, wait);
	});
}

write(stdout, "Hello world! I have PID " + getpid() + "\n");
write(stdout, "This terminal is " + iogetvar(stdout, "width") + "x" + iogetvar(stdout, "height") + " characters big\n");
eval("write(stdout, \"eval() works too, still PID == \" + getpid() + \"\\n\")");
write(stdout, "btw, the text you see is actually all going through this cat process, along with the movement keys etc\n");
write(stdout, "nvm, wait() is commented, so it doesn't interfere with the readline stuff\n");

//wait();
