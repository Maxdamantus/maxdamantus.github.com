var x, y, dx = 0, dy = 0;

x = iogetvar(stdout, "width")/2;
y = iogetvar(stdout, "height")/2;

rd(text){
	if(text.indexOf("q") >= 0)
		exit(0);
	else
		read(stdin, rd);
}

tick(){
	var cx = x, cy = y,
	    width = iogetvar(stdout, "width"), height = iogetvar(stdout, "height");

	a
