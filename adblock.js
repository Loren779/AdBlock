// ==UserScript==
// @name AdBlock+
// @author Lex1
// @version 1.1.5
// @run-at document-start
// @include *
// @description AdBlock+ for Chrome. Press Alt+B for blocking ads and Alt+U for unblocking. Press Alt+E for editing styles.
// @namespace http://ruzanow.ru/index/0-4
// ==/UserScript==


(function(){
	var style, _style, enabled = false, prefix = 'ujs_adblock', none = '{display: none !important;}';

	var getValue = function(name){
		if(window.localStorage){
			return window.localStorage[name] || '';
		}
		else{
			var nameEQ = name+'=';
			var ca = document.cookie.split(';');
			for(var i = 0, c; c = ca[i]; i++){
				while(c.charAt(0) == ' ')c = c.substring(1, c.length);
				if(c.indexOf(nameEQ) == 0)return unescape(c.substring(nameEQ.length, c.length));
			};
			return '';
		}
	};
	var setValue = function(name, value, days){
		if(window.localStorage){
			window.localStorage[name] = value;
		}
		else{
			var date = new Date();
			date.setTime(date.getTime()+((days || 10*365)*24*60*60*1000));
			if(document.cookie.split(';').length < 30 && document.cookie.length-escape(getValue(name)).length+escape(value).length < 4000){
				document.cookie = name+'='+escape(value)+'; expires='+date.toGMTString()+'; path=/';
			}
			else{
				alert('Cookies is full!');
			}
		}
	};
	var addStyle = function(css){
		var s = document.createElement('style');
		s.setAttribute('type', 'text/css');
		s.setAttribute('style', 'display: none !important;');
		s.appendChild(document.createTextNode(css));
		return (document.getElementsByTagName('head')[0] || document.documentElement).appendChild(s);
	};
	var addScript = function(css){
		var s = document.createElement('script');
		s.setAttribute('type', 'text/javascript');
		s.setAttribute('style', 'display: none !important;');
		s.appendChild(document.createTextNode(css));
		if(document.getElementsByTagName('head').length){
			return document.getElementsByTagName('head')[0].appendChild(s);
		}
	};
	var replaceStyle = function(ele, css){
		if(ele){
			if(ele.firstChild)ele.removeChild(ele.firstChild);
			ele.appendChild(document.createTextNode(css));
		}
	};
	var splitCss = function(css){
		var rez = [];
		css.replace(/(([\w#:.~>+()\s-]+|\*|\[.*?\])+)\s*(,|$)/g, function(s, m){rez.push(m.replace(/^\s+|\s+$/g, ''))});
		return rez;
	};
	var clearCss = function(css){
		var a = splitCss(css);
		for(var i = a.length-1; i >= 0; i--){
			var rule = a[i]+'>';
			for(var j = a.length-1; j >= 0; j--){
				if(a[j].indexOf(rule) == 0)a.splice(j, 1);
			}
		};
		return a.join(',');
	};
	var delCss = function(css, del){
		var a = splitCss(css);
		if(del){
			for(var i = a.length-1; i >= 0; i--){
				if(del.indexOf(a[i]) == 0)a.splice(i, 1);
			}
		}
		else{
			a.pop();
		};
		return a.join(',');
	};
	var getAtt = function(el, tags){
		var rez = '';
		if(el.attributes){
			var r = new RegExp('^('+tags+')$');
			for(var i = 0, a; a = el.attributes[i]; i++){
				var n = a.nodeName.toLowerCase();
				if(r.test(n))rez += '['+n+'=\x22'+a.nodeValue.replace(/[\x22\x5C]/g, '\\$&')+'\x22]';
			}
		};
		return rez;
	};
	var getNth = function(el){
		var nth, n = 0, p = el.parentNode;
		for(var i = 0, c; c = p.childNodes[i]; i++){if(c.nodeType == 1){n++; if(c == el)nth = n}};
		return (!nth || n < 2) ? '' : ':nth-child('+nth+')';
	};
	var getCssRules = function(el, wide){
		var att, tag, rez = [];
		while(el){
			if(el.nodeType == 1){
				att = getAtt(el, 'src') || getAtt(el, 'href');
				tag = el.nodeName;
				if(att){
					rez.unshift(tag+(wide ? att.replace(/^(\[\w+)(=\x22[^?#]+\/).*(\x22\])$/, '$1^$2$3') : att));
					break;
				}
				else{
					rez.unshift(tag+getAtt(el, 'id|class|height|width|color|bgcolor|align|type')+((wide || /^(html|body)$/i.test(tag)) ? '' : getNth(el)));
				}
			};
			el = el.parentNode;
		};
		return rez.join('>');
	};
	var setBlockStyle = function(){
		if(document.documentElement instanceof HTMLHtmlElement){
			var css = getValue(prefix);
			if(css)style = addStyle(css+none);
			return true;
		}
	};

	var editStyles = function(){
		var rez = prompt('请输入自定义编辑规则代码:', getValue(prefix));
		if(rez != null){
			setValue(prefix, rez);
			if(rez)rez += none;
			if(style){replaceStyle(style, rez)}else{style = addStyle(rez)};
		}
	};
	var unblockEle = function(latest){
		var css = getValue(prefix);
		if(enabled || !style || !css)return;

		var remove = function(){
			document.removeEventListener('click', click, false);
			document.removeEventListener('keyup', press, false);
			enabled = false;
		};
		var click = function(ev){
			ev.preventDefault();
			var oldCss = getValue(prefix);
			var css = delCss(oldCss, getCssRules(ev.target, false));
			if(css == oldCss)css = delCss(oldCss, getCssRules(ev.target, true));
			if(css != oldCss)setValue(prefix, css);
			replaceStyle(style, css ? css+none : '');
			remove();
		};
		var press = function(ev){
			if(ev.keyCode == 27){
				var css = getValue(prefix);
				replaceStyle(style, css ? css+none : '');
				remove();
			}
		};

		if(latest){
			css = delCss(css);
			setValue(prefix, css);
			replaceStyle(style, css ? css+none : '');
		}
		else{
			enabled = true;
			replaceStyle(style, css+'{background-color: #FF5555 !important; border: 2px solid #FF1111 !important; opacity: 0.7 !important;}');
			document.addEventListener('click', click, false);
			document.addEventListener('keyup', press, false);
		}
	};
	var blockEle = function(wide){
		if(enabled)return;
		var ele = '', outline = '', border = '', bgColor = '', title = '', reObjects = /^(iframe|object|embed)$/i;

		var remove = function(){
			document.removeEventListener('mouseover', over, false);
			document.removeEventListener('mouseout', out, false);
			document.removeEventListener('click', click, false);
			document.removeEventListener('keyup', press, false);
			enabled = false;
		};
		var over = function(ev){
			ele = ev.target;
			title = ele.title;
			ele.title = 'Tag: '+ele.nodeName+(ele.id ? ', ID: '+ele.id : '')+(ele.className ? ', Class: '+ele.className : '');
			if(reObjects.test(ele.nodeName)){
				border = ele.style.border;
				ele.style.border = '2px solid #306EFF';
			}
			else{
				outline = ele.style.outline;
				ele.style.outline = '1px solid #306EFF';
				bgColor = ele.style.backgroundColor;
				ele.style.backgroundColor = '#C6DEFF';
			}
		};
		var out = function(){
			if(ele){
				ele.title = title;
				if(reObjects.test(ele.nodeName)){
					ele.style.border = border;
				}
				else{
					ele.style.outline = outline;
					ele.style.backgroundColor = bgColor;
				}
			}
		};
		var click = function(ev){
			if(ele){
				ev.preventDefault();
				out();
				remove();
				var css = getCssRules(ele, wide || ev.altKey);
				var tmpCss = addStyle(css+'{background-color: #FF5555 !important; border: 1px solid #FF1111 !important; opacity: 0.7 !important;}');
				css = prompt('您确定隐藏此元素?', css);
				if(css){
					var oldCss = getValue(prefix);
					if(oldCss)css = clearCss(oldCss+','+css);
					setValue(prefix, css);
					if(style){replaceStyle(style, css+none)}else{style = addStyle(css+none)};
				};
				tmpCss.parentNode.removeChild(tmpCss);
			}
		};
		var press = function(ev){
			if(ev.keyCode == 27){
				out();
				remove();
			}
		};

		enabled = true;
		document.addEventListener('mouseover', over, false);
		document.addEventListener('mouseout', out, false);
		document.addEventListener('click', click, false);
		document.addEventListener('keyup', press, false);
	};


	// Set style at loading page
	window.setTimeout(setBlockStyle, 1);

	// Hotkeys
	document.addEventListener('keydown', function(e){
		if(!e.shiftKey && !e.ctrlKey && e.altKey){
			switch(e.keyCode){
				// Edit styles with Alt+E
				case 69: editStyles(); break;
				// Unblock elements with Alt+U
				case 85: unblockEle(); break;
				 // Block element with Alt+B
				case 66: blockEle(); break;
				// Unblock latest element with Alt+L
				case 76: unblockEle(true); break;
				 // Block elements (don't use nth-child) with Alt+W
				case 87: blockEle(true); break;
			}
		}
	}, false);

	// Non html
	if(!(document.documentElement instanceof HTMLHtmlElement))return;
	
	// Get rules
	chrome.extension.sendRequest({command: 'GetRules'}, function(data){
		if(data.css){
			if(!_style){
				_style = addStyle(data.css+none);
				if(data.blockExternal){
					addScript("document.write = function(w){return function(s){s=Array.prototype.join.call(arguments,'');var getTLD=function(url){if(!url)return'';var link=document.createElement('a');link.href=url;var domain=link.host;var r=domain.match(/^((?:\\d{1,3}\\.){3})\\d{1,3}$/);if(r)return r[1]+'0';var a=domain.split('.');var l=a.length;if(l<2)return domain;return!/\\.[a-z]{2}$/.test(window.location.hostname)?a[l-2]+'.'+a[l-1]:a[(l>2&&/^(co|com|net|org|edu|gov|mil)$/i.test(a[l-2]))?l-3:l-2]}; if(!/src\\s*=\\s*\\x22(.+)\\x22/i.test(s) || getTLD(RegExp.$1) == getTLD(location.href)){w.call(this, s)}}}(document.write);");
				}
				/*else{
					if(/googlesyndication|pagead/i.test(data.css))addScript('document.write = function(w){return function(s){console.log(arguments);for(var i=1;i<arguments.length;i++)s+=arguments[i];if(s && !/pagead2\\.googlesyndication\\.com\\/pagead|googleads\\.g\\.doubleclick\\.net/i.test(s))w.call(this, s)}}(document.write);');
				}*/
				//加入语句for(var i=1;i<arguments.length;i++)s+=arguments[i];以防止document.write多个参数情况。
				//更简洁的写法：s=Array.prototype.join.call(arguments,'');
				//2012.12.29屏蔽此段js，因为发现此段js导致部分页面js出错。
			}
		}
	});

	
	chrome.extension.onRequest.addListener(
		function(data){
			if(top == self)switch(data.command){
				case 'Edit': editStyles(); break;
				case 'Unblock': unblockEle(); break;
				case 'Block': blockEle(); break;
				case 'UnblockLatest': unblockEle(true); break;
				case 'BlockElements': blockEle(true); break;
			};
			if(data.css != undefined){
				if(data.css != ''){
					if(_style){replaceStyle(_style, data.css+none)}else{_style = addStyle(data.css+none)};
				}
				else{
					replaceStyle(_style, '');
				}
			}
		}
	);

})();
