/*
 * 	Easy Editor
 *	written by cyokodog
 *
 *	Copyright (c) 2013 cyokodog 
 *		http://www.cyokodog.net/
 *		http://d.hatena.ne.jp/cyokodog/)
 *		http://cyokodog.tumblr.com/
 *	MIT LICENCE
 *
 */

;(function($){
	$.fn.blankBox = function(){
		var el = 'blank-box-el';
		return this.each(function(){
			var t = $(this);
			var d = t.data(el) || $('<div/>').addClass(el).insertAfter(t);
			d.hide();
			d.height(t.height()).width(t.width());
			if(/^(fixed|absolute)$/.test(t.css('position'))) d.show();
			t.data(el, d);
		});
	}
	$.fn.responsiveClass = function( classNames ){
		if(!classNames) return this;
		var w = $(window).width();
		return this.each(function(){
			var t = $(this);
			var className;
			for(var i in classNames){
				var name = classNames[i]
				t.removeClass(name);
				if(w >= i) className = name;
			}
			t.addClass(className).data('responsive-class-name', className);
		});
	}
	$.fn.getResponsiveClass = function(){
		return this.data('responsive-class-name');
	}
	$.fn.fitHeight = function(){
		return this.each(function(){
			var t = $(this).height('auto');
			var parent = t.parent();
			var h = parent.height();
			var sum = 0;
			parent.find('> *').each(function(idx){
				var e = $(this);
				if(t[0] != e[0] && !(/^(fixed|absolute)$/.test(e.css('position')))){
					sum += e.outerHeight();
				}
			});
			t.height(parent.height() - sum);
		});
	}
})(jQuery);
;(function($){
	var app = $.easyEditor = function(){
		var o = this;
		o.init();
	}
	$.extend(app.prototype,{
		init : function(){
			var o = this;

			// set parameter
			o.el = {
				saveName : $('input.my-save-name'),
				saveList : $('ul.my-save-list'),
				saveBtn : $('a.my-save-btn'),
				runBtn : $('a.run-button'),
				loadBtn : $('a.my-load-btn')
			};
			o.pa = {
				timer : '',
				saveNameDefaultValue : o.el.saveName.prop('defaultValue'),
				selectCode : sessionStorage.getItem('select-code')
			};
			if(o.pa.selectCode == null) o.pa.selectCode = o.pa.saveNameDefaultValue;


			//bind event
			$('a.my-del-btn').on('click', function(){
				$.each(o.api, function(i){
					o.api[i].clearStorage();
				});
				o.deleteCodeList(o.pa.selectCode);
				o.loadCodeList();
				if(o.isSampleCode(o.pa.selectCode)){
					alert('Initialized ' + o.pa.selectCode + ' !')
					o.reloadPage();
				}
				else{
					sessionStorage.removeItem('select-code');
					alert('Deleted ' + o.pa.selectCode + ' !')
				}

			});
			o.el.loadBtn.on('click', function(){
				o.toggleSaveList();
				return false;
			});
			o.el.saveList.on('click','a',function(){
				var name = $(this).text();
				sessionStorage.setItem('select-code',name);
				o.reloadPage();
			});
			o.el.saveBtn.on('click', function(){
				var name = o.el.saveName.val();
				if(!name) return;
				$.each(o.api, function(i){
					o.api[i].saveCodeToStorage(name);
				});
				var list = o.getSaveList();
				list[name] = 1;
				o.saveCodeList(list);
				o.loadCodeList();
				alert('save as '+(name));
			});
			o.el.runBtn.on('click', function(){
				if($('html').hasClass('my-mobile')){
					var demoTop = $('div.my-panel-demo').position().top;
					if(demoTop > $('html').scrollTop() + $(window).height()-100){
						$('html,body').animate({scrollTop:demoTop - $('div.my-header').outerHeight()});
					}
				}
			});
			$(window).on('resize', function(){
				if(o.pa.timer) clearTimeout(o.pa.timer);
				o.pa.timer = setTimeout(function(){
					o.adjustLayout();
				},0);
			});

			//rendar
			o.loadCodeList();
			if(o.pa.selectCode){
				o.el.saveName.val(o.pa.selectCode);
			}
			if(!o.pa.selectCode || o.isSampleCode(o.pa.selectCode)){
				$('a.my-del-btn').text('初期化');
			}

			o.loadSample();
			o.api = $('.easy-editor-code textarea.code').exCodePrettify({
				api : true,
				container : 'div.my-contents-demo',
				showDemo : true,
				editCode : true,
				saveLabel : 'APPLY',
				autoSaveToStorage : false,
				autoLoadFromStorage : true,
				savePrefix : o.el.saveName.val(),
				behaveJS : true
			});
			o.adjustLayout();
		},
		isSampleCode : function(codeId){
			var o = this;
			return o.getSaveList()[o.pa.selectCode] == 9;
		},
		loadSample : function(){
			var o = this;
			$('div.easy-editor-sample').each(function(){
				var t = $(this);
				if(t.data('code-id') == o.pa.selectCode){
					$('div.easy-editor-code').html(t.html());
				}
			});
		},
		getSaveList : function(){
			var o = this;
			var list = JSON.parse(localStorage.getItem('save-list')) || {};
			$('div.easy-editor-sample').each(function(){
				list[$(this).data('code-id')] = 9;
			});
			return list;
		},
		saveCodeList : function(json){
			var o = this;
			localStorage.setItem('save-list',JSON.stringify(json));
		},
		deleteCodeList : function(key){
			var o = this;
			var list = o.getSaveList();
			delete list[key];
			o.saveCodeList(list);
		},
		loadCodeList : function(){
			var o = this;
			o.el.saveList.html('');
			var list = o.getSaveList();
			var add = function(text){
				$('<a/>').prop('href','javascript:void(0)').text(text).wrap('<li/>').parent().appendTo(o.el.saveList);
			}
			for(var i in list) add(i);
		},
		toggleSaveList : function(method){
			var o = this;
			var panel = $('div.my-tool-b');
			var method = method || (panel.is(':hidden') ? 'show' : 'hide');
			o.el.loadBtn.removeClass('show-toggle');
			if(method == 'show'){
				o.el.loadBtn.addClass('show-toggle');
			}
			$('div.my-tool-b')[method]();
			o.adjustLayout();
		},
		adjustLayout : function(){
			var rClass = $('html').responsiveClass( {0:'my-mobile',600:'my-pc'} ).getResponsiveClass();
			$('div.my-header').blankBox();
			if(rClass == 'my-pc'){
				$('div.my-main').fitHeight();
			}
			else{
				$('div.my-main').height('auto');
			}
		},
		reloadPage : function(){
			setTimeout(function(){location.reload();},100);
		}
	});
})(jQuery);
