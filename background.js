// work with the adblock plus list
function isCorrectDomain(domain, domains){
	if(!domains)return true;
	var d, a = domains.split(','), rez = false, reTrim = /^\s+|\s+$/g;
	while(domain){
		for(var i = 0, f = true; i < a.length; i++){
			d = a[i].replace(reTrim, '');
			if(d[0] != '~'){
				if(d == domain){return true;}
				else{f = false;}
			}
			else{
				if(d.slice(1) == domain){return false;}
			}
		};
		if(f){rez = true};
		domain = domain.slice(domain.indexOf('.') + 1 || domain.length);
	};
	return rez;
};

function convertOldRules(tagName, attrRules){
	var rule, rules, sep, additional = '', id = null, reAttrRules = /\([\w\-]+(?:[$^*]?=[^\(\)"]*)?\)/g;
	if(tagName == '*')tagName = '';
	if(attrRules){
		rules = attrRules.match(reAttrRules);
		for(var i = 0; i < rules.length; i++){
			rule = rules[i].slice(1, -1);
			sep = rule.indexOf('=');
			if(sep > 0){
				rule = rule.slice(0, sep) + '="' + rule.slice(sep + 1) + '"';
				additional += '[' + rule + ']';
			}
			else{
				if(id){return ''}else{id = rule};
			}
		}
	};
	if(id){
		return tagName + '.' + id + additional + ',' + tagName + '#' + id + additional;
	}
	else{
		return (tagName || additional) ? tagName + additional : '';
	}
};

function getHidingRules(list){
	var rez = [], reTrim = /^\s+|\s+$/g, reElemHide = /^([^\/\*\|\@"]*?)#(?:([\w\-]+|\*)((?:\([\w\-]+(?:[$^*]?=[^\(\)"]*)?\))*)|#([^{}]+))$/;
	if(list){
		var rule, domains, tagName, attrRules, selector, a = list.split('\n');
		for(var i = 0; i < a.length; i++){
			rule = a[i].replace(reTrim, '');
			if(rule && rule[0] != '!' && rule[0] != '[' && rule[0] != '@' && !(rule[0] == '/' && rule[rule.length - 1] == '/')){
				if(reElemHide.test(rule)){
					domains = RegExp.$1;
					tagName = RegExp.$2;
					attrRules = RegExp.$3;
					selector = RegExp.$4 || convertOldRules(tagName, attrRules);
					if(selector)rez.push([domains, selector]);
				}
			}
		}
	};
	return rez;
};

function getWhiteList(list){
	var rez = [];
	if(list){
		var a = list.split('\n');
		for(var i = 0; i < a.length; i++){
			if(a[i].indexOf('@@||') == 0)rez.push(a[i].slice(4));
		}
	}
	return rez;
};

// create a two-dimensional array with domains and selectors.
var globalFilters = getHidingRules(window.localStorage['adblock+']).concat(getHidingRules(window.localStorage['userfilters']));
// create a array with whitelisted domains
var whiteList = getWhiteList(window.localStorage['userfilters']);


// communications
function getRules(url){
	var link, domain, rez = [], reUrl = /^(https?|file):\/\//i;
	if(!reUrl.test(url))return '';

	link = document.createElement('a');
	link.href = url;
	domain = link.host;
	for(var i = 0; i < whiteList.length; i++){
		if(whiteList[i] == domain)return '';
	};

	for(var j = 0; j < globalFilters.length; j++){
		if(isCorrectDomain(domain, globalFilters[j][0]))rez.push(globalFilters[j][1]);
	}
	return rez.join(', ');
};

chrome.extension.onRequest.addListener(
	function(request, sender, sendResponse){
		switch(request.command){
			case 'GetRules':
				sendResponse({css: getRules(sender.tab.url), blockExternal: window.localStorage['blockexternal'] == 'checked'});
				break;
			case 'UpdateFilters':
				globalFilters = getHidingRules(window.localStorage['adblock+']).concat(getHidingRules(window.localStorage['userfilters']));
				whiteList = getWhiteList(window.localStorage['userfilters']);
				break;
			case 'UpdateCss':
				chrome.windows.getCurrent(function(wnd){
					chrome.tabs.getAllInWindow(wnd.id, function(tabs){
						for(var i = 0; i < tabs.length; i++){
							chrome.tabs.sendRequest(tabs[i].id, {css: getRules(tabs[i].url)});
						}
					});
				});
				break;
		}
	}
);