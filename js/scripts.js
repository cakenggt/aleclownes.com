var index = {
	name: 'Alec Lownes',
	description: 'I am a Software Developer at Performance Review Institute. I '+
	'currently spend my free time writing Minecraft plugins, learning Swedish, and '+
	'reading science fiction.',
	github: 'https://github.com/cakenggt',
	bukkit: 'http://dev.bukkit.org/profiles/cakenggt/',
	goToProjectsPage: function(){
		window.location = 'projects.html';
	},
		getResume: function(){
	window.location = 'AlecBLownesResume.pdf';
	}
};

var projects = {
	java: {
		SpellScript: {
			description: 'SpellScript is a plugin for Minecraft which enables JavaScript '+
			'parsing and execution in-game through a multithreaded script engine. Interacts '+
			'in a thread-safe way with the single-threaded bukkit wrapper.',
			created: new Date("2015-05"),
			github: 'https://github.com/cakenggt/SpellScript',
			bukkit: 'http://dev.bukkit.org/bukkit-plugins/spellscript/'
		},
		Capsule: {
			description: 'Capsule is a plugin for Minecraft which allows for the '+
			'serialization and deserialization of block data into item metadata, enabling '+
			'world area storage.',
			created: new Date("2015-02"),
			bukkit: 'http://dev.bukkit.org/bukkit-plugins/capsule/'
		},
		ManaGeo: {
			description: 'ManaGeo is an android application I created which uses the GPS '+
			'functionality to create a SimCity-like geolocation game experience.',
			created: new Date("2014-02"),
			github: 'https://github.com/cakenggt/ManaGeo'
		},
		Ollivanders: {
			description: 'Ollivander\'s is a plugin I made for '+
			'the Bukkit platform to approximate the world of Harry Potter in Minecraft. '+
			'Currently, this is my longest plugin and the first plugin I made after studying '+
			'software engineering.',
			created: new Date("2014-01"),
			github: 'https://github.com/cakenggt/Ollivanders/tree/master/Ollivanders',
			bukkit: 'http://dev.bukkit.org/bukkit-plugins/ollivanders/',
			javaDocs: 'http://aleclownes.com/jd/Ollivanders'
		},
		Multipart: {
			description: 'Multipart is the result of a project for the "Elements of Software '+
			'Construction" MIT OCW course. This downloads a file that can be in multiple '+
			'parts based on a manifest file. I coded everything in the manifest folder, '+
			'nothing in the animation or ui folders (that was provided by the OCW '+
			'course).',
			created: new Date("2013-11"),
			github: 'https://github.com/cakenggt/6005.multipart',
			specification: 'http://web.mit.edu/6.005/www/fa10/projects/multipart/assignment.html',
			runnableJar: 'http://aleclownes.com/projects/6005.multipart.jar'
		},
		RealisticChat: {
			description: 'Realistic Chat implements chat distance dependent message garbling '+
			'in Minecraft. This was my first experience collaborating with other plugin '+
			'developers using git.',
			created: new Date("2012-06"),
			bukkit: 'http://dev.bukkit.org/bukkit-plugins/realisticchat/'
		},
		ResourceBasedEconomy: {
			description: 'ResourceBasedEconomy is a plugin for Minecraft that adds a '+
			'resource based economy to the game. ',
			created: new Date("2012-07"),
			bukkit: 'http://dev.bukkit.org/bukkit-plugins/resourcebasedeconomy/'
		},
		MassRelay: {
			description: 'MassRelay is a plugin for Minecraft that adds a few features from '+
			'the Mass Effect series to the game. ',
			created: new Date("2012-04"),
			bukkit: 'http://dev.bukkit.org/bukkit-plugins/massrelay/'
		},
		CakesMinerApocalypse: {
			description: 'CakesMinerApocalypse is a plugin for Minecraft that approximates '+
			'an atom punk, post-apocalyptic world in Minecraft.',
			created: new Date("2012-03"),
			github: 'https://github.com/cakenggt/CakesMinerApocalypse',
			bukkit: 'http://dev.bukkit.org/bukkit-plugins/cakes-miner-apocalypse/'
		},
		GeometricMagic: {
			description: 'GeometricMagic is a plugin for Minecraft that approximates alchemy '+
			'from the series Fullmetal Alchemist in the game.',
			created: new Date("2012-02"),
			github: 'https://github.com/cakenggt/GeometricMagic',
			bukkit: 'http://dev.bukkit.org/bukkit-plugins/geometric-magic/'
		}
	},
	python: {
		CaveGame: {
			description: 'CaveGame is a text based cave exploration game coded in python3.',
			created: new Date("2013-07"),
			files: 'http://aleclownes.com/projects/CaveGame.zip'
		},
		SpaceGame: {
			description: 'SpaceGame is a 2d space exploration game implementing gravity '+
			'effects from to-scale star systems and galaxies. Unfortunately this makes the '+
			'game not very fun, as getting anywhere takes a long time. This is my first game '+
			'coded using OOP. Requires PyGame.',
			created: new Date("2013-02"),
			files: 'http://aleclownes.com/projects/SpaceGame.zip'
		}
	},
	goToIndexPage: function(){
		window.location = 'index.html';
	}
};

function renderPage(name, json){
	var table = $('#container');
	table.empty();
	//print var name = {
	table.append('<tr><td class="gutter">1</td><td> <span class="storage">var</span> ' +
	name + " = {</tr></td>");
	renderObject(table, json, 1, true);
	var lastRow = $('.indent:last');
	lastRow.html(lastRow.html().substring(0, lastRow.html().length-1));
	table.append('<tr><td class="gutter">' + ($('#container tr').length+1) + '</td><td>};</td></tr>');
	table.append('<tr><td class="gutter">' + ($('#container tr').length+1) + '</td><td></td></tr>');
	$('#line-num').text($('#container tr').length+":1");
}

function renderObject(table, obj, indents, differentLine){
	var indentStart = '';
	var indentEnd = '';
	var indentList = generateIndents(indents);
	indentStart = indentList[0];
	indentEnd = indentList[1];
	var intro = differentLine ?
	'<tr>'+ '<td class="gutter">' + ($('#container tr').length+1) + '</td>' + '<td>' + indentStart :
	'';
	var outro = differentLine ? '</td></tr>' : '</tr>';
	if (obj instanceof Object){
		if (obj instanceof Date){
			//If date
			$('.indent:last').append('new <span class="class">Date</span>(<span class="string">"'+
			obj.getFullYear()+'-'+('0'+(obj.getMonth()+1)).slice(-2)+
				'"</span>),');
		}
		else if (obj instanceof Function){
			//If function
			var entire = obj.toString();
			var body = entire.slice(entire.indexOf("{") + 1, entire.lastIndexOf("}"));
			var partsOfFunction = $('.indent:last').html().split(':');
			$('.indent:last').html('<span class="function-name">'+partsOfFunction[0]+'</span>:'+partsOfFunction[1]);
			$('.indent:last').append('<span class="function">function</span>(){');
			//wrap the class and constant parts in their respective classes
			var re = /(\w*)\.(\w*)\s/;
			var subst = '<span class="class">$1</span>.<span class="constant">$2</span> ';
			body = body.replace(re, subst);
			//make the location a string class
			re = /\'(.*)\'/;
			subst = '<span class="string">\'$1\'</span>';
			body = body.replace(re, subst);
			table.append('<tr>'+ '<td class="gutter">' + ($('#container tr').length+1) + '</td>' + '<td>' + indentStart + body + indentEnd);
		}
		else{
			//general object
			$('.indent:last').append('{');
			var first = true;
			for (var key in obj) {
			  if (obj.hasOwnProperty(key)) {
					table.append('<tr>'+ '<td class="gutter">' + ($('#container tr').length+1) + '</td>' + '<td>' + indentStart +
					'<span class="key">' + key + ':&nbsp' + '</span>' + indentEnd);
					renderObject(table, obj[key], indents+1, !first);
					first = false;
			  }
			}
			//Remove the last comma
			var lastIndent = $('.indent:last');
			lastIndent.html(lastIndent.html().substring(0, lastIndent.html().length-1));
			//Generate indent level for previous level,
			//except if that level is 0, then generate for 1
			//because that means it is the next to last closing brace
			var previousIndents = generateIndents(indents > 1 ? indents-1 : 1);
			table.append('<tr>'+ '<td class="gutter">' + ($('#container tr').length+1) + '</td>' + '<td>' + previousIndents[0] + '},' + previousIndents[1]);
		}
	}
	else{
		//Not an object
		var appended = '';
		if (typeof obj == 'string'){
			//Is a string
			var stringText = JSON.stringify(obj);
			stringText = stringText.substring(1, stringText.length-1);
			var lastKey = $('.key:last').text();
			var keyLength = lastKey.length;
			while (stringText.indexOf('<a') == -1 && stringText.length + keyLength + 2 > 80){
				var stringRe1 = new RegExp('(.{40,'+(80-keyLength)+'}\\s)?(.*)');
				var firstLineString = stringText.replace(stringRe1, '$1');
				stringText = stringText.replace(stringRe1, '$2');
				appended += '<span class="string">"' +  firstLineString + '"</span>+';
				console.log(appended);
				$('.indent:last').append(appended);
				keyLength = 0;
				intro = '<tr>'+ '<td class="gutter">' + ($('#container tr').length+1) + '</td>' + '<td>' + indentStart;
				outro = '</td></tr>';
				table.append(intro + indentEnd + outro);
				appended = '';
			}
			appended += '<span class="string">"' +  stringText + '"</span>';
		}
		appended += ',';
		$('.indent:last').append(appended);
	}
}

function generateIndents(indents){
	var indentStart = '';
	var indentEnd = '';
	for (var i = 0; i < indents; i ++){
		indentStart += '<div class="indent">';
		indentEnd += '</div>';
	}
	return [indentStart, indentEnd];
}

function escapeGenerator(){
	$('.string').each(function(){
		var innerHTML = $(this).html();
		var re = /(\\\S)/g;
		var subst = '<span class="escape">$1</span>';
		var result = innerHTML.replace(re, subst);
		$(this).html(result);
	});
}

function urlLinker(){
	$('.string').each(function(){
		var innerHTML = $(this).html();
		var re = /(((http|ftp|https):\/\/)?[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?)/g;
		var subst = '<a href="$1">$1</a>';
		var result = innerHTML.replace(re, subst);
		$(this).html(result);
	});
}

function bootPage(name, json){
	renderPage(name, json);
	escapeGenerator();
	urlLinker();
}

//Analytics
/*
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','//www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-64371674-1', 'auto');
ga('send', 'pageview');
*/
