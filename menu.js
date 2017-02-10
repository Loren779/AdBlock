// communication
function sendCommand(msg){
  chrome.windows.getCurrent(function(wnd){
    chrome.tabs.getSelected(wnd.id, function(tab){
      chrome.tabs.sendRequest(tab.id, {command: msg});
	  window.close();
    });
  });
};

// disable adblock for the current site
var whiteList = {
	prefix: 'userfilters',
	_set: function(a){window.localStorage[this.prefix] = a.join('\n')},
	_get: function(){return (window.localStorage[this.prefix] || '').split('\n')},
	add: function(domain){var a = this._get(); a.unshift('@@||' + domain); this._set(a)},
	del: function(domain){var a = this._get(); for(var i = 0; i < a.length; i++){if(a[i].indexOf('@@||') == 0 && a[i].slice(4) == domain)a.splice(i, 1)}; this._set(a)},
	into: function(domain){var a = this._get(); for(var i = 0; i < a.length; i++){if(a[i].indexOf('@@||') == 0 && a[i].slice(4) == domain)return true}}
};

function getDomain(url){
	var link = document.createElement('a');
	link.href = url;
	return link.host;
};

function disableSubscription(){
	if(window.localStorage['adblock+'])chrome.windows.getCurrent(function(wnd){
		chrome.tabs.getSelected(wnd.id, function(tab){
			var domain = getDomain(tab.url);
			var s = document.getElementById('subscription');
			if(whiteList.into(domain)){
				whiteList.del(domain);
				s.innerHTML = "禁用此网站订阅";
			}
			else{
				whiteList.add(domain);
				s.innerHTML = "启用此网站订阅";
			};
			chrome.extension.sendRequest({command: 'UpdateFilters'});
			chrome.extension.sendRequest({command: 'UpdateCss'});
		});
	});
};

function createMenu(){
	var menu = '<div class="menu">';
	menu += '<div id="Block">隐藏元素<span>Alt+B</span></div>';
	menu += '<div id="BlockElements">隐藏类似元素<span>Alt+W</span></div>';
	menu += '<div id="Unblock">撤销隐藏元素<span>Alt+U</span></div>';
	menu += '<div id="UnblockLatest">撤销最近一次隐藏元素<span>Alt+L</span></div>';
	menu += '<div id="Edit">自定义规则<span>Alt+E</span></div>';
	menu += '<hr>';
	menu += '<div id="subscription">禁用此网站订阅</div>';
	menu += '<hr>';
	menu += '<div id="preferences">设置</div>';
	menu += '</div>';
	document.body.innerHTML = menu;
	document.getElementById('Block').addEventListener('click', function(){sendCommand('Block');});
	document.getElementById('BlockElements').addEventListener('click', function(){sendCommand('BlockElements');});
	document.getElementById('Unblock').addEventListener('click', function(){sendCommand('Unblock');});
	document.getElementById('UnblockLatest').addEventListener('click', function(){sendCommand('UnblockLatest');});
	document.getElementById('Edit').addEventListener('click', function(){sendCommand('Edit');});
	document.getElementById('subscription').addEventListener('click', disableSubscription);
	document.getElementById('preferences').addEventListener('click', function(){chrome.tabs.create({url:'preferences.html'});});
	chrome.windows.getCurrent(function(wnd){
		chrome.tabs.getSelected(wnd.id, function(tab){
			var ele = document.getElementById('subscription'), notSubscribed = !window.localStorage['adblock+'];
			if(notSubscribed){
				ele.style.opacity = 0.5;
				ele.innerHTML = "启用此网站订阅";
			}
			else if(whiteList.into(getDomain(tab.url))){
				ele.innerHTML = "启用此网站订阅";
			}
		});
	});
};

document.addEventListener('DOMContentLoaded', function () {
	createMenu();
});