"use strict";

/*
Customizable options:
- self.filePrefix
- self.frameTotal
- self.passInt

Start with startTask(), stop with stopTask().
*/

const downloadAgent = document.createElement("a");

let $e = (selector, context = self.document) => {
	return context?.querySelector(selector);
};
self.HTMLCanvasElement.prototype.blob = function (type, quality) {
	let upThis = this;
	return new Promise((resolve) => {
		upThis.toBlob(resolve, type, quality);
	});
};
let downloadBlob = (filename, blob) => {
	if (!blob?.stream) {
		throw(new TypeError(`The target is not a blob.`));
	};
	downloadAgent.download = filename;
	downloadAgent.href = URL.createObjectURL(blob);
	downloadAgent.type = blob.type;
	downloadAgent.click();
	URL.revokeObjectURL(downloadAgent.href);
};

let downloadLock = false;
let taskCounter = 0, taskMax = 4;
let downloadThread;
const downloadTask = async () => {
	if (self.frameIndex <= self.frameTotal) {
		if (taskCounter == taskMax - 1) {
			// Capture screen
			downloadBlob(`${self?.filePrefix ?? "extractedFrame"}_${`${self.frameIndex}`.padStart(6, "0")}.webp`, await document.querySelector("canvas").blob("image/webp", 1));
			console.debug(`Requested a download at ${frameIndex}/${frameTotal}.`);
			self.frameIndex ++;
		} else if (!taskCounter) {
			// Key press
			document.querySelector("canvas").parentElement.dispatchEvent(new KeyboardEvent("keydown", {keyCode: 13, charCode: 0, key: "Enter", code: "Enter"}));
			console.debug(`Requested a page turn.`);
		};
		taskCounter ++;
		if (taskCounter >= taskMax) {
			taskCounter = 0;
		};
	} else {
		clearInterval(downloadThread);
		downloadLock = false;
		frameIndex = 1;
		taskCounter = 0;
	};
};
self.stopTask = () => {
	clearInterval(downloadThread);
	self.frameIndex = self.frameTotal + 1;
	downloadLock = false;
	taskCounter = 0;
};
self.startTask = () => {
	if (self.frameIndex > self.frameTotal || !self.frameIndex) {
		self.frameIndex = 1;
	};
	if (self.frameTotal < 1) {
		self.frameTotal = 1;
	};
	if (self.frameIndex <= self.frameTotal && !downloadLock) {
		taskCounter = false;
		downloadThread = setInterval(downloadTask, self.passInt >= 1000 ? self.passInt : 750);
		downloadLock = true;
	};
};

let retrievalLock = false;
let retrievalCounter = 0, retrievalMax = 12;
let retrievalThread;
const retrievalTask = async () => {
	if (self.frameIndex <= self.frameTotal) {
		if (self.frameTargets?.indexOf(self.frameIndex) < 0 || retrievalCounter > retrievalMax) {
			retrievalCounter = 0;
			console.debug(`Moved on from ${frameIndex}/${frameTotal}.`);
			document.querySelector("canvas").parentElement.dispatchEvent(new KeyboardEvent("keydown", {keyCode: 13, charCode: 0, key: "Enter", code: "Enter"}));
			self.frameIndex ++;
		} else {
			switch (retrievalCounter) {
				case 0: {
					console.debug(`Target found at ${frameIndex}/${frameTotal}. Waiting to receive the whole frame...`);
					break;
				};
				case retrievalMax: {
					// Capture screen
					downloadBlob(`${self?.filePrefix ?? "extractedFrame"}_${`${self.frameIndex}`.padStart(6, "0")}.webp`, await document.querySelector("canvas").blob("image/webp", 1));
					console.debug(`Requested a download at ${frameIndex}/${frameTotal}.`);
					break;
				};
			};
			retrievalCounter ++;
		};
	} else {
		clearInterval(retrievalThread);
		retrievalLock = false;
		frameIndex = 1;
		retrievalCounter = 0;
	};
};
self.stopRetrieval = () => {
	clearInterval(retrievalThread);
	self.frameIndex = self.frameTotal + 1;
	retrievalLock = false;
	retrievalCounter = 0;
};
self.startRetrieval = () => {
	if (self.frameIndex > self.frameTotal || !self.frameIndex) {
		self.frameIndex = 1;
	};
	if (self.frameTotal < 1) {
		self.frameTotal = 1;
	};
	if (self.frameIndex <= self.frameTotal && self.frameTargets?.length && !retrievalLock) {
		retrievalCounter = false;
		retrievalThread = setInterval(retrievalTask, self.retrInt >= 100 ? self.retrInt : 200);
		if (retrievalThread) {
			document.querySelector("canvas").parentElement.dispatchEvent(new KeyboardEvent("keydown", {keyCode: 13, charCode: 0, key: "Enter", code: "Enter"}));
		};
		retrievalLock = true;
	};
};
