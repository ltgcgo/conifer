"use strict";

const u8Enc = new TextEncoder();
// let {columns, rows} =  Deno.consoleSize();
const correctionHeader = ` \x1b[1;30m\u2588\x1b[0;37m\u2588\x1b[1;37m\u2588\x1b[0m`;
const wipeConsoleBuf = u8Enc.encode("\x1b[H\x1b[2J\x1b[3J");

const getSingle = (halfByte) => {
	//halfByte &= 15;
	return `\x1b[${halfByte >> 3};3${halfByte & 7}m\u2588`;
};
const getByteColour = (byte) => {
	//byte &= 255;
	return `${getSingle(byte >> 4)}${getSingle(byte & 15)}`;
};

let dummyBuf = new Uint8Array(1);
let fileHandle = await Deno.open(Deno.args[0]);
//console.debug(`File opened.`);
let fileSize = (await fileHandle.stat()).size;
let filePos = await fileHandle.seek(0, 0); // Seek to start
let readBuffer = new Uint8Array(32768);
let readBufferWindow;
let readActualWindow;
let readActualSize;
let readChunkIndex = 1;
//console.debug(`Preparing to read...`);
while (filePos < fileSize) {
	let {columns, rows} = Deno.consoleSize();
	let readMaxSize = ((columns * rows) >> 1) - 20;
	readBufferWindow = readBuffer.subarray(0, readMaxSize);
	readActualSize = await fileHandle.read(readBufferWindow);
	readActualWindow = readBufferWindow.subarray(0, readActualSize);
	//console.debug(filePos, readActualSize, fileSize);
	// The conversion magic happens here.
	let showBuf = correctionHeader;
	for (let byte of readActualWindow) {
		showBuf += getByteColour(byte);
	};
	// The final help message.
	showBuf += `${" ".repeat((readMaxSize - readActualSize) << 1)}\x1b[0mW:${`${columns}`.padEnd(3, " ")} H:${`${rows}`.padEnd(2, " ")} E0 ${`${readChunkIndex}`.padStart(6, "0")}/${`${Math.ceil(fileSize / readMaxSize)}`.padStart(6, "0")} L:${readActualSize}`;
	Deno.stdout.write(wipeConsoleBuf);
	Deno.stdout.write(u8Enc.encode(showBuf));
	await Deno.stdin.read(dummyBuf);
	filePos = await fileHandle.seek(filePos + readActualSize, 0); // Seek to a later chunk
	readChunkIndex ++;
};
Deno.stdout.write(wipeConsoleBuf);
console.debug(`Conifer 4-bit export ended at ${filePos}/${fileSize}.`);
