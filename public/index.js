// eslint-disable-next-line no-undef
const socket = io();

const EVENTS = {
	JOIN: "join",
	SEND: "send",
	UPDATE: "update",
	LEAVE: "leave",
};

const NotePage = (room, message) => {
	const container = document.createElement("div");
	container.classList.add("container");
	const h1 = document.createElement("h1");
	h1.innerText = "Note page";
	const codeBlock = document.createElement("div");
	const span = document.createElement("span");
	span.innerText = "Your note's code is: ";
	const code = document.createElement("span");
	code.classList.add("bold");
	code.innerText = room;
	const copy = document.createElement("button");
	copy.innerText = "copy";
	copy.addEventListener("click", () =>
		navigator.clipboard.writeText(code.innerText),
	);
	codeBlock.append(span, code, copy);

	const textarea = document.createElement("textarea");
	textarea.placeholder = "Enter your note here";
	textarea.defaultValue = message || "";

	const btns = document.createElement("div");
	btns.classList.add("btns");
	const shareBtn = document.createElement("div");
	shareBtn.innerText = "Share";
	shareBtn.classList.add("btn");
	shareBtn.addEventListener("click", () => {
		socket.emit(EVENTS.SEND, textarea.value, (error) => {
			if (error) alert(error);
		});
	});
	const copyBtn = document.createElement("div");
	copyBtn.innerText = "Copy";
	copyBtn.classList.add("btn");
	copyBtn.addEventListener("click", () =>
		navigator.clipboard.writeText(textarea.value),
	);

	const backBtn = document.createElement("div");
	backBtn.innerText = "Back";
	backBtn.classList.add("btn");
	backBtn.addEventListener("click", () => {
		socket.emit(EVENTS.LEAVE, () => {});
		const body = document.body;
		body.innerText = "";
		body.appendChild(HomePage());
	});
	btns.append(shareBtn, copyBtn, backBtn);

	container.append(h1, codeBlock, textarea, btns);
	return container;
};

const onOpenPage = (room) => {
	socket.emit(EVENTS.JOIN, room, (error, newRoom, message) => {
		if (error) {
			return alert(error);
		}
		const body = document.body;
		body.innerText = "";
		body.appendChild(NotePage(newRoom, message));

		socket.on(EVENTS.UPDATE, (message) => {
			document.querySelector("textarea").value = message;
		});
	});
};

const HomePage = () => {
	const container = document.createElement("div");
	container.classList.add("container");
	const h1 = document.createElement("h1");
	h1.innerText = "Welcome to the Simple Share App";

	const h2 = document.createElement("h2");
	h2.innerText =
		"To continue, create your own note or enter 3-digit code to open existing";

	const existingNoteSection = document.createElement("div");
	existingNoteSection.classList.add("block");
	const existH3 = document.createElement("h3");
	existH3.innerText = "Open existing note";
	const openInput = document.createElement("input");
	openInput.name = "r";
	openInput.type = "text";
	openInput.maxLength = 3;
	openInput.placeholder = "Enter note's code";
	const openBtn = document.createElement("button");
	openBtn.innerText = "Open";
	openBtn.addEventListener("click", () => {
		onOpenPage(openInput.value);
	});
	existingNoteSection.append(existH3, openInput, openBtn);

	const createNoteSection = document.createElement("div");
	createNoteSection.classList.add("block");
	const newH3 = document.createElement("h3");
	newH3.innerText = "Create new note";
	const newBtn = document.createElement("button");
	newBtn.innerText = "Create";
	newBtn.addEventListener("click", () => {
		onOpenPage();
	});
	createNoteSection.append(newH3, newBtn);

	container.append(h1, h2, existingNoteSection, createNoteSection);
	return container;
};

window.addEventListener("load", () => document.body.appendChild(HomePage()));
