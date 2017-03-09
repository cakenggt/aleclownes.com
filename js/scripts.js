var urlRegex = /(((http|ftp|https):\/\/)?[\w-\/]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?)/g;

const enterSound = new Audio('/audio/enter.wav');
const keySounds = [
	new Audio('/audio/key01.wav'),
	new Audio('/audio/key02.wav'),
	new Audio('/audio/key03.wav'),
	new Audio('/audio/key04.wav'),
	new Audio('/audio/key05.wav'),
	new Audio('/audio/key06.wav')
];

const timeoutIds = [];
var finished = false;
var container;
var jsonString;

function renderPage(name, str){
	container = document.querySelector('#container');
	jsonString = str;
	var typingSpeed = 10;
	for (var i = 1; i < jsonString.length; i++) {
		var substring = jsonString.substr(0, i);
		timeoutIds.push(setTimeout(setText(container, substring), typingSpeed*i));
	}
	timeoutIds.push(setTimeout(urlLinker, jsonString.length*typingSpeed));
}

function setText(element, str) {
	return function () {
		element.innerText = str;
		if (str[str.length-1] == '\n') {
			enterSound.play();
		} else {
			var key = keySounds[Math.floor(Math.random() * keySounds.length)];
			key.play();
		}
	};
}

function onBodyClick() {
	if (!finished) {
		for (var i = 0; i < timeoutIds.length; i++) {
			clearTimeout(timeoutIds[i]);
		}
		setText(container, jsonString)();
		urlLinker();
	}
}

function urlLinker(){
	var subst = '<a href="$1">$1</a>';
	container.innerHTML = container.innerHTML.replace(urlRegex, subst);
	finished = true;
}

function isUrl(string){
	return urlRegex.exec(string) !== null;
}

//Analytics
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','//www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-64371674-1', 'auto');
ga('send', 'pageview');
