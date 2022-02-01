let myTextarea = document.querySelector('#input_script');
let editor = CodeMirror.fromTextArea(myTextarea, {
	lineNumbers: true,
	mode: 'sql',
	theme: 'dracula',
	keyMap: "sublime"
});