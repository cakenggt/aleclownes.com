var urlRegex = /(((http|ftp|https):\/\/)?[\w-\/]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?)/g;

function renderPage(name, json){
	var table = $('#container');
	table.empty();
	//print var name = {
	table.append('<tr><td class="gutter">1</td><td> <span class="storage">var</span> ' +
	name + " = {</tr></td>");
	renderObject(table, json, 1, true);
	var lastRow = $('td:last');
	//Remove last comma and replace with semicolon
	lastRow.html(lastRow.html().substring(0, lastRow.html().length-1)+';');
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
			var previousIndents = generateIndents(indents-1);
			table.append('<tr>'+ '<td class="gutter">' + ($('#container tr').length+1) + '</td>' + '<td>' + previousIndents[0] + '},' + previousIndents[1]);
		}
		else{
			//general object or array
			var wrappers = '';
			if (obj instanceof Array){
				wrappers = '[]';
			}
			else{
				wrappers = '{}';
			}
			$('.indent:last').append(wrappers[0]);
			var first = true;
			for (var key in obj) {
			  if (obj.hasOwnProperty(key)) {
					var keyStr;
					if (obj instanceof Array){
						keyStr = '<tr>'+ '<td class="gutter">' + ($('#container tr').length+1) + '</td>' + '<td>' + indentStart +
						indentEnd;
					}
					else{
						keyStr = '<tr>'+ '<td class="gutter">' + ($('#container tr').length+1) + '</td>' + '<td>' + indentStart +
						'<span class="key">' + key + ':&nbsp' + '</span>' + indentEnd;
					}
					table.append(keyStr);
					renderObject(table, obj[key], indents+1, !first);
					first = false;
			  }
			}
			//Remove the last comma if it wasn't empty
			if (!$.isEmptyObject(obj)){
				var lastIndent = $('.indent:last');
				lastIndent.html(lastIndent.html().substring(0, lastIndent.html().length-1));
			}
			//Generate indent level for previous level,
			//except if that level is 0, then generate for 1
			//because that means it is the next to last closing brace
			var previousIndents = generateIndents(indents-1);
			table.append('<tr>'+ '<td class="gutter">' + ($('#container tr').length+1) + '</td>' + '<td>' + previousIndents[0] + wrappers[1] + ',' + previousIndents[1]);
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
			while (!isUrl(stringText) && stringText.length + keyLength + 2 > 80){
				var stringRe1 = new RegExp('(.{40,'+(80-keyLength)+'}\\s)?(.*)');
				var firstLineString = stringText.replace(stringRe1, '$1');
				stringText = stringText.replace(stringRe1, '$2');
				if (!firstLineString){
					//break if the string was too long to break, and thus would loop forever
					break;
				}
				appended += '<span class="string">"' +  firstLineString + '"</span>+';
				$('.indent:last').append(appended);
				keyLength = 0;
				intro = '<tr>'+ '<td class="gutter">' + ($('#container tr').length+1) + '</td>' + '<td>' + indentStart;
				outro = '</td></tr>';
				table.append(intro + indentEnd + outro);
				appended = '';
			}
			appended += '<span class="string">"' +  stringText + '"</span>';
		}
		else if (typeof obj == 'number' || typeof obj == 'boolean' || obj === null){
			appended += '<span class="constant">' + obj + '</span>';
		}
		else {
			appended += '<span>' + obj + '</span>';
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
		var subst = '<a href="$1">$1</a>';
		var result = innerHTML.replace(urlRegex, subst);
		$(this).html(result);
	});
}

function isUrl(string){
	return urlRegex.exec(string) !== null;
}

function bootPage(name, json){
	renderPage(name, json);
	escapeGenerator();
	urlLinker();
}

$(function(){
	//Activates the easter egg
	$('#resource').on('dblclick', function(){
		ga('send', 'event', 'easter-egg', 'dblclick');
		$(this).attr('contenteditable', 'true');
	});
	$('#resource').on('blur', function(){
		$.getJSON($(this).text(), function(data){
			bootPage('newJSON', data);
		});
	});
	console.log('For an easter egg, double click on the resource span in the bottom '+
	'left corner and enter in a url used to retrieve a JSON');
});

//Analytics
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','//www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-64371674-1', 'auto');
ga('send', 'pageview');
