function lineWrapper(){
	var top = 0;
	var breaks = $('br');
	var standard = 0;
	for (var i = 0; i < breaks.length; i++){
		var item = $(breaks[i]);
		if (i == 0){
			top = item.position().top;
			continue;
		}
		if (i == 1){
			standard = item.position().top - top;
		}
		var newHeight = item.position().top - top;
		$('#gutter-'+i).css('height', (newHeight > 0 && newHeight < 100) ? newHeight : standard + 'px');
		top = item.position().top;
	}
}

function lineNumberGenerator(){
	var breaks = $('br').length;
	for (var i = 0; i < breaks; i++){
		$('.gutter').append('<div id="gutter-'+i+'">'+(i+1)+'</div>');
	}
	$('.gutter').append('<div id=gutter-'+i+' class="cursor-line">'+(i+1)+'</div>');
	$('#line-num').html((i+1)+':1');
}

function stringBreaker(){
	//break first considering key length
	$('.text').each(function(){
		if ($(this).children('.key').length && $(this).children('.string').length){
			var keyLength = $($(this).children('.key')[0]).html().length;
			var string = $($(this).children('.string')[0]);
			var stringText = string.html();
			if (stringText.indexOf('<a') == -1 && stringText.length > (80-keyLength)){
				var re = new RegExp('(.{40,'+(80-keyLength)+'}\\s)?(.*)');
				var subst = '$1';
				var result = stringText.replace(re, subst);
				string.html(result);
				string.append('\'<span class="text">+<br></span>'+'<span class="string second">\''+stringText.replace(re, '$2')+'</span>');
			}
		}
	});
	//break second not regarding key length
	$('.string.second').each(function(){
		var innerHTML = $(this).html();
		if (innerHTML.indexOf('<a') == -1 && innerHTML.length > 80){
			var re = /(.{60,80}\s)+?/g;
			var subst = '$1\'<span class="text">+<br></span>\'';
			var result = innerHTML.replace(re, subst);
			$(this).html(result);
		}
	});
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

$(function() {

	escapeGenerator();
	urlLinker();
	stringBreaker();
	lineNumberGenerator();
	lineWrapper();
	$(window).on('resize', function(){
		lineWrapper();
	});

});

//Analytics
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','//www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-64371674-1', 'auto');
ga('send', 'pageview');
