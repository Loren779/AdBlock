function updateFiltersAndCss(){
	chrome.extension.sendRequest({command: 'UpdateFilters'});
	chrome.extension.sendRequest({command: 'UpdateCss'});
};

var list = {
	prefix: 'adblock+',
	set: function(txt){window.localStorage[this.prefix] = txt; updateFiltersAndCss()},
	get: function(){return window.localStorage[this.prefix] || ''},
	exist: function(){return !!window.localStorage[this.prefix]}
};

var userlist = {
	prefix: 'userfilters',
	set: function(txt){window.localStorage[this.prefix] = txt; updateFiltersAndCss()},
	get: function(){return window.localStorage[this.prefix] || ''},
	exist: function(){return !!window.localStorage[this.prefix]}
};

var subscriptionUrl = {
	prefix: 'subscription',
	set: function(url){window.localStorage[this.prefix] = url},
	get: function(){return window.localStorage[this.prefix] || ''},
	exist: function(){return !!window.localStorage[this.prefix]}
};

var convert = {
	prefix: 'convert',
	set: function(checked){window.localStorage[this.prefix] = checked ? 'checked' : ''},
	need: function(){return !!window.localStorage[this.prefix]},
	update: function(){document.getElementById('convertrules').checked = this.need()}
};

var blockExternal = {
	prefix: 'blockexternal',
	set: function(checked){window.localStorage[this.prefix] = checked ? 'checked' : ''},
	need: function(){return !!window.localStorage[this.prefix]},
	update: function(){document.getElementById('blockexternalobject').checked = this.need()}
};

// interface
function showLoading(show){
	var img, ele = document.getElementById('subscribe');
	if(show){
		img = document.createElement('img');
		img.src = 'data:image/gif;base64,R0lGODlhEAAQALMAAO7u7gAAAODg4IGBgdHR0UFBQXJyclJSUiEhIaGhobKyshISEpKSkgMDAzIyMmFhYSH/C05FVFNDQVBFMi4wAwEAAAAh+QQFCgAAACwAAAAAEAAQAAAEcRBIIOg7dWpAEBFBQFCbRASI0IjCqBHjEAwrnElCMYPNcXymDEHXULhwQJwg4TjiNIOCj1GiCK7RQoFaul6tCsMtqBEMFgVnyzgxIBjmAYyQoLA5I4JDkWAQ5E8TAgcGAAxUBHAlBAYjhxIKYyUKClURACH5BAUKAAAALAAAAAAPABAAAARdEMgJzJOCziKRJEuiSQ6ANGagjBKDLEzATQcMLI4VBFkmHQAHYaIYsmYsQOJhMKySAMbh8XhCP4yRb5IoADUCgm9QEDFEn89W8iAoEgKrxpB9S+QYRsYOMCYJfhMRACH5BAUKAAAALAAAAAAQAA8AAARbEMgJ2KBYPlmQEE4mNQfQCWUmVEDSJROhSIYDO8UwhMQQBATNIiUhMH6B2UTxWC0DF4lCxwhinJKEYSvqtryYxwDbZRhmCsXnI3JeCEECmcKYwQECawYGuOMpEQAh+QQFCgAAACwAAAAAEAAQAAAEXBDIKRm90ghwijwKBjgG5z3YJi1KF6ICIQ2PXBgM4wnWohokgAqgQIgAJYqsJtgwEgnRY7FogHIM2eUR6DoooQthTFARBpbjRJEFjNVCiUDRHB4VsibcLbfD9RgRACH5BAUKAAAALAAAAAAQAA4AAARFEMgJjKFYHhkCz9zWAQsoGV7HkNixKEDgWF4VT0ewYfVK7RjHhABg+IKdQMlyyZQ+Q4xCljlOph0iQGtKZrgUBVACBkUAACH5BAUKAAAALAAAAAAQABAAAARrEMgJlKIYiCSHkQaRCQY3DMCAiBnxECexoJSSiANjGU6FFBKBYqAQTASEA8DBkhA4FEGBYdQQrlUK43AoDK7YDAOBWDyiGIKDgUE2AU8JMEgwCqqLQBKwyGYSAUoAUGgTCAEXI2kBbBmOfhEAIfkEBQoAAAAsAAAAABAAEAAABFsQyAkIoVgqyRjP3JV4TAFKgzACRYJZApAoFvNIxS0RdPYsB4zggnm4JoIkKPF4BJPKTKLgcBhOk0Miit0AHjGQ4YEACG6O0yIwAFx5IMGaSIw3ApfGMX5whCkRACH5BAUKAAAALAEAAQAPAA8AAARWEEgilZJJ6lqvetvmXc8FCKdGUEBiAMQxSAKBhobzbvc2mKGgwkDMBDWfg+xIKwVrrBoCsNsEAoNBYTor+AIGBIIBmIUIV8pC4DgmApfFGoAAqjSHYwQAIfkEBQoAAAAsAAAAABAAEAAABF0QyAmEoFheQIhUG0ZcHceElOB1wuBhm2UpiTQwGcw8eI4xLx+FMCgKJwSDsvZBKDCuYSEQ6E0Ki4GmEXB4EIzEowBgIB4SxtPmcNR6wQlC0AYcGr7G1yEh5zZKOREAIfkEBQoAAAAsAAABABAADwAABFoQyAmEkIRqaaXaWvdtmUaUzAhOyaBcVEmpwLPcD5jsihP8BRCD4RKcGAuZhLECvCaCh4MpQdQEiEICMDg4DwZJQsY4FBSLLUzjAJgBhvZGYQUUgjXlZjAARQAAIfkEBQoAAAAsAAABABAADwAABFgQyEmBqHgKUgnHxEUFwVCJgvIpZPBNhFoZQdKJEqJngOITh8ZiYcj4Eh9BooCxVQ6Sl2TwcAIcgGLh4GM8JAaGRCERJwwPApa3YKIBDCZI/oAKiryyGBMBACH5BAUKAAAALAAAAQAPAA8AAARaEEi1iLz4qoCyl0eQfFIHEEHgEcJpMuMlsBjTKFkrDU5RDJ4ZgWBAGIG5oaWlOHhwMgNg4UkMoE7gwzBMME6w02ShGEgfFoBO7XgAzICEYX1xv6WALykew0QAADs=';
		img.setAttribute('style', 'float: right; vertical-align: middle; ')
		ele.parentNode.appendChild(img);
	}
	else{
		img = ele.parentNode.lastElementChild;
		if(img && img instanceof HTMLImageElement)ele.parentNode.removeChild(img);
	}
};

function showAbout(){
	var s = document.getElementById('about').style;
	var m = document.getElementsByClassName('menu');
	if(s.display == 'none'){
		s.display = 'block';
		m[m.length - 3].style.display = 'none';
		m[m.length - 2].style.display = 'none';
		m[m.length - 1].style.display = 'none';

	}
	else{
		s.display = 'none';
		m[m.length - 3].style.display = 'block';
		m[m.length - 2].style.display = 'block';
		m[m.length - 1].style.display = 'block';
	}
};

function customUrl(ele){
	var prefix = 'customUrl';
	if(ele){
		window.localStorage[prefix] = ele.value;
	}
	else{
		var url = window.localStorage[prefix];
		if(url || url == '')document.getElementById('custom').value = url;
	}
};

function radioButton(ele){
	var e, f, url;
	if(ele){
		e = ele.nextElementSibling;
		if(e)subscriptionUrl.set(e.href || e.value || '');
	}
	else{
		f = document.getElementById('subscription').getElementsByTagName('input');
		url = subscriptionUrl.get();
		for(var i = 0; i < f.length; i++){
			f[i].checked = (f[i].type == 'radio' && (e = f[i].nextElementSibling) && (url == (e.href || e.value)));
		}
	}
};

function savelist(){
	list.set(document.getElementById('rules').value);
};

function updateTextarea(){
	document.getElementById('rules').value = list.get();
};

function updateUserTextarea(){
	document.getElementById('userrules').value = userlist.get();
};

function clearSubscription(){
	if(subscriptionUrl.exist()){
		list.set('');
		subscriptionUrl.set('');
		updateTextarea();
		radioButton();
	}
};

// download the adblock plus list
function convertBlockingRule(rule){
	while(rule.indexOf('|') == 0){rule = rule.slice(1)};
	var options = null, sep = rule.indexOf('$');
	if(sep > 0){
		options = rule.slice(sep + 1);
		if(options != 'third-party')return '';
		rule = rule.slice(0, sep);
	};
	rule = rule.replace(/\^/g, '/');

	var rez = options ? '~' + rule.slice(0, rule.indexOf('/')) + '##*' : '##*';
	var a = rule.split('*');
	for(var i = 0; i < a.length; i++){
		if(a[i])rez += '[src*="' + a[i] + '"]';
	};
	return rez;
};

function downloadList(){
	var url = subscriptionUrl.get(), isNeedConvert = convert.need();
	if(!url)return;
	showLoading(true);
	var xhr = new XMLHttpRequest();
	var abortTimerId = window.setTimeout(function(){xhr.abort()}, 20000);
	var stopTimer = function(){window.clearTimeout(abortTimerId); showLoading(false)};
	try{
		xhr.onreadystatechange = function(){
			var a, txt, rule, rez = [], reTrim = /^\s+|\s+$/g;
			if (xhr.readyState == 4){
				stopTimer();
				txt = xhr.responseText;
				if(txt && txt.length > 10000){
					a = txt.split('\n');
					for(var i = 0; i < a.length; i++){
						rule = a[i].replace(reTrim, '');
						if(rule && rule[0] != '!' && rule[0] != '[' && rule[0] != '@' && !(rule[0] == '/' && rule[rule.length - 1] == '/')){
							if(rule.indexOf('#') != -1){
								rez.push(rule);
							}
							else if(isNeedConvert){
								//rule = convertBlockingRule(rule);
								//if(rule)rez.push(rule);
							}
						}
					};
					list.set(rez.join('\n'));
					updateTextarea();
				}
			  }
			};
		xhr.onerror = function(error){
			console.log('error: ' + error);
			stopTimer();
		};
		xhr.open('GET', url, true);
		xhr.send(null);
		}
	catch(e){
		console.log('exception: ' + e);
		stopTimer();
	};
};

document.addEventListener('DOMContentLoaded', function () {
	document.getElementById('imghelp').addEventListener('click',showAbout);
	var subs=document.getElementsByName("subs");
	for(var i=0;i<subs.length;i++)
	{
		subs[i].addEventListener('click', function(){radioButton(this);});
	}
	document.getElementById('custom').addEventListener('onKeyUp',function(){customUrl(this);subscriptionUrl.set(this.value);});
	document.getElementById('subscribe').addEventListener('click',downloadList);
	document.getElementById('cancelsub').addEventListener('click',clearSubscription);
	document.getElementById('convertrules').addEventListener('click', function(){convert.set(this.checked);});
	document.getElementById('blockexternalobject').addEventListener('click',function(){blockExternal.set(this.checked);});

	document.getElementById('SaveRules').addEventListener('click',savelist);
	document.getElementById('CancelRules').addEventListener('click',updateTextarea);
	document.getElementById('SaveUserRules').addEventListener('click',function(){userlist.set(document.getElementById('userrules').value);});
	document.getElementById('CancelUserRules').addEventListener('click',updateUserTextarea);
	document.getElementById('Close').addEventListener('click',function(){window.close();});

	updateTextarea();updateUserTextarea();customUrl();radioButton();convert.update();blockExternal.update();
});