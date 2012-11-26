// CySelect v3.0
// By MacKinley Smith
(function($){
	var defaults = {
		widget:{
			arrowButton:{
				css:{
					width:24,
					height:30,
					padding:0,
					position:'absolute',
					top:0,
					'border-top-left-radius':0,
					'border-bottom-left-radius':0,
					'border-left':0
				},
				img:{
					css:{
						position:'relative',
						top:-1,
						left:-1
					},
					down:'images/icons/triangle-medium-circle-1.png',
					up:'images/icons/triangle-medium-circle-2.png'
				}
			},
			valueButton:{
				css:{
					'text-align':'left',
					padding:5,
					margin:0,
					height:30,
					'white-space':'nowrap',
					overflow:'hidden',
					'border-top-right-radius':0,
					'border-bottom-right-radius':0
				}
			},
			label:{
				css:{
					float:'left',
					font:'12px/30px '+_page.less.fonts_light,
					margin:'0px 5px'
				},
				html:"Label: "
			},
			optionsList:{
				animationSpeed:300,
				css:{
					display:'none',
					'list-style':'none',
					'margin-top':0,
					padding:'0 2px 2px',
					border:'1px solid #666',
					'border-bottom-left-radius':5,
					'border-bottom-right-radius':5,
					background:'#777',
					position:'absolute',
					right:0,
					'z-index':1000,
					'box-shadow':'inset 0px 10px 10px -10px rgba(0,0,0,0.3), 0 10px 10px -10px rgba(0,0,0,0.5)'
				},
				li:{
					css:{
						display:'block',
						height:20,
						font:'12px/20px '+_page.less.fonts_light,
						color:_page.less.colors_text,
						margin:'2px 0 0',
						padding:'0 5px',
						border:'1px solid #888',
						'border-radius':5,
						cursor:'pointer',
						overflow:'hidden',
						'text-overflow':'ellipsis',
						'white-space':'nowrap',
						'box-shadow':'inset 0px 0px 5px rgba(0,0,0,0.5)'
					},
					hover:function(cy,e){
						$(this).css({background:_page.less.colors_accent});
					},
					unhover:function(cy,e){
						$(this).css({background:'transparent'});
					}
				},
				maxHeight:400,
				searchTime:1000
			},
			wrapper:{
				css:{
					display:'inline-block',
					padding:0,
					position:'relative'
				}
			},
			width:'auto'
		},
		events:{
			create:function(cy){},
			change:function(cy,e){},
			beforeResize:function(cy){},
			resize:function(cy,e){},
			destroy:function(cy){}
		}
	};
	
	var methods = {
		init:function(options,reinit){
			if (reinit==null) reinit = false;
			return this.each(function(){
				var $this = $(this);
				if ($this.data('cySelect')!=null) return console.warn("You cannot reinstatiate $.cySelect before calling the destroy method.\nProtip: Use the refresh method to reinstantiate in one move.");
				if (!$this.hasClass('cySelect')) $this.addClass("cySelect");
				
				// Initialize settings
				var settings = $.extend(true,{},defaults,options);
				
				// Choose default value
				var selected = $this.find(":selected");
				var label = settings.widget.label;
				if (!label) label = ($this.data('label') != undefined) ? $this.data('label') : "";
				
				// Generate widget
				settings.widget.wrapper.element = $this.wrap('<div class="cySelect-wrapper"></div>').parent().css(settings.widget.wrapper.css);
				var tabindex = ($this.data('tabindex') != null) ? $this.data('tabindex') : $this.attr('tabindex');
				settings.widget.label.element = $('<span />').addClass('cySelect-label').html(label).css(settings.widget.label.css).appendTo(settings.widget.wrapper.element);
				settings.widget.valueButton.element = $("<button />").addClass('cySelect-valueButton').attr('tabindex',tabindex).html(selected.html()).css(settings.widget.valueButton.css).appendTo(settings.widget.wrapper.element);
				settings.widget.arrowButton.element = $("<button />").addClass('cySelect-arrowButton').attr('tabindex',-1).css(settings.widget.arrowButton.css).appendTo(settings.widget.wrapper.element);
				settings.widget.arrowButton.img.element = $("<img />").addClass('cySelect-arrowButtonImage').attr('src',settings.widget.arrowButton.img.down).css(settings.widget.arrowButton.img.css).appendTo(settings.widget.arrowButton.element);
				settings.widget.optionsList.element = $("<ul class='cySelect-optionsList' />").css(settings.widget.optionsList.css).appendTo(settings.widget.wrapper.element);
				$.each($this.children('option'),function(){
					var li = $("<li />").attr({title:$(this).html(),'data-value':$(this).val()}).html($(this).html()).css(settings.widget.optionsList.li.css).appendTo(settings.widget.optionsList.element);
					if ($(this).val() == selected.val()) li.addClass('active');
				});
				settings.widget.optionsList.li.elements = settings.widget.optionsList.element.children('li');
				if (!settings.widget.optionsList.li.elements.length) settings.widget.valueButton.element.html("<i>This CySelect has no options.</i>");
				$this.data('tabindex',$this.attr('tabindex')).attr('tabindex',-1).hide();
				
				// Cosmetic Fixes
				//if (/chrome/.test(navigator.userAgent.toLowerCase())) settings.widget.arrowButton.element.css({top:-1});
				
				$this.data('cySelect',settings);
				
				// Bindings
				settings.widget.valueButton.element.bind({
					"click.cySelect":function(e){
						e.preventDefault();
						if (settings.widget.optionsList.element.is(':visible')) methods.hideMenu.apply($this)
						else methods.showMenu.apply($this);
					},
					"keydown.cySelect":function(e){
						if (settings.widget.optionsList.element.is(':visible') || (e.which != 38 && e.which != 40)) return true;
						e.preventDefault();
						var current = settings.widget.optionsList.element.find('li.active');
						$this.val(((e.which == 38) ? ((!current.is(':first-child')) ? current.prev() : current.siblings(':last-child')) : ((!current.is(':last-child')) ? current.next() : current.siblings(':first-child'))).data('value')).trigger('change.cySelect');
					}
				});
				settings.widget.arrowButton.element.bind("click.cySelect",function(e){
					e.preventDefault();
					if (settings.widget.optionsList.element.is(':visible')) methods.hideMenu.apply($this)
					else methods.showMenu.apply($this);
				});
				$this.bind("change.cySelect",function(e){
					settings.widget.optionsList.li.elements.filter('.active').removeClass('active');
					var active = settings.widget.optionsList.li.elements.filter('[data-value="'+$(this).val()+'"]').addClass('active');
					settings.widget.valueButton.element.html(active.html());
					settings.events.change.apply($this,[settings,e]);
				});
				settings.widget.optionsList.element.bind({
					'mouseout.cySelect':function(e){$(this).find('.active').trigger('mouseover');}
				});
				settings.widget.optionsList.li.elements.bind({
					'click.cySelect':function(e){
						e.preventDefault();
						$(this).siblings('.active').removeClass('active').trigger("mouseout");
						$(this).addClass('active');
						methods.hideMenu.apply($this);
						settings.events.change.apply($this,[settings,e]);
					},
					'mouseover.cySelect':function(e){settings.widget.optionsList.li.hover.apply($(this),[settings,e]);},
					'mouseout.cySelect':function(e){settings.widget.optionsList.li.unhover.apply($(this),[settings,e]);}
				});
				if (settings.widget.optionsList.maxHeight <= settings.widget.optionsList.element.height()) settings.widget.optionsList.element.css({'overflow-y':'scroll',height:settings.widget.optionsList.maxHeight,'border-top':'none','border-right-color':'#bbb','border-bottom':'none'});
				
				$this.data({'cySelect':settings,'cySelect-toggled':0});
				methods.resize.apply($this);
				settings.events.create.apply($this,[settings]);
			});
		},
		hideMenu:function(){
			return this.each(function(){
				var $this = $(this).data('cySelect-toggled',0);
				var settings = $this.data('cySelect');
				
				var active = settings.widget.optionsList.element.find('.active');
				
				$(document).unbind(".cySelect-menu");
				$this.val(active.data('value'));
				settings.widget.valueButton.element.html(active.html()).css({'border-bottom-left-radius':3,'box-shadow':'none'});
				settings.widget.arrowButton.element.css('border-bottom-right-radius',3);
				settings.widget.arrowButton.img.element.attr('src',settings.widget.arrowButton.img.down);
				settings.widget.optionsList.element.hide("slide",{direction:'up'},settings.widget.optionsList.animationSpeed);
			});
		},
		showMenu:function(){
			return this.each(function(){
				var $this = $(this).data('cySelect-toggled',1);
				var settings = $this.data('cySelect');
				
				var active = settings.widget.optionsList.element.find('.active');
				
				// Skip if there aren't any list elements to show
				if (!settings.widget.optionsList.li.elements.length) return false;
				
				// Cosmetic changes
				settings.widget.valueButton.element.css({'border-bottom-left-radius':0,'box-shadow':'inset 0px 0px 5px black'});
				settings.widget.arrowButton.element.css('border-bottom-right-radius',0);
				settings.widget.arrowButton.img.element.attr('src',settings.widget.arrowButton.img.up);
				
				settings.widget.optionsList.element.show("slide",{direction:'up'},settings.widget.optionsList.animationSpeed,function(){
					// Fix hovering states
					settings.widget.optionsList.element.find('li:not(.active):hover').trigger('mouseout');
					active.trigger("mouseover");
					
					// Reset height of optionsList to fit elements
					settings.widget.optionsList.element.height('auto');
					// Size it down if its larger than the maxHeight settings
					if (settings.widget.optionsList.element.height()>settings.widget.optionsList.maxHeight) settings.widget.optionsList.element.height(settings.widget.optionsList.maxHeight);
					// If the optionsList is going offscreen, taper it to the edge of the page - 10 pixels
					var windowBottom = $(window).scrollTop()+$(window).height();
					var optionsBottom = settings.widget.optionsList.element.offset().top+settings.widget.optionsList.element.height();
					if (optionsBottom > windowBottom) {
						if (settings.widget.optionsList.element.css('overflow-y')!="scroll") settings.widget.optionsList.element.css({'overflow-y':'scroll','border-top':'none','border-right-color':'#bbb','border-bottom':'none'});
						settings.widget.optionsList.element.height(windowBottom-settings.widget.optionsList.element.offset().top-10);
					}
					
					// Scroll optionsList to active li
					var scrollTop = active.offset().top - settings.widget.optionsList.element.offset().top + settings.widget.optionsList.element.scrollTop();
					var new_y = scrollTop - (settings.widget.optionsList.element.height()/2);
					settings.widget.optionsList.element.scrollTop(new_y);
					
					// Globalized bindings
					$(document).bind({
						"click.cySelect-menu":function(){methods.hideMenu.apply($this);},
						"keydown.cySelect-menu":function(e){
							if (e.which == 9) {
								methods.hideMenu.apply($this);
								return true;
							}
							if (e.ctrlKey || e.metaKey) return true;
							e.preventDefault();
							var active = settings.widget.optionsList.element.find('li.active');
							if (e.which == 38) {var target = (settings.widget.optionsList.li.elements.length == 1) ? settings.widget.optionsList.li.elements : ((active.prev().is('*')) ? active.prev() : active.siblings(':last-child'));
							} else if (e.which == 40) {var target = (settings.widget.optionsList.li.elements.length == 1) ? settings.widget.optionsList.li.elements : ((active.next().is('*')) ? active.next() : active.siblings(':first-child'));
							} else {
								// Search menu
								var s = String.fromCharCode(e.which);
								if (s.match(/\w/)) {
									$.each(settings.widget.optionsList.li.elements,function(){
										if (s == $(this).html().substr(0,1)) {
											target = $(this);
											return false;
										}
									});
								} else target = active;
							}
							active.removeClass('active').trigger("mouseout");
							target.addClass('active').trigger("mouseover");
							settings.widget.valueButton.element.html(target.html());
							
							// Handle Scrolling
							var activeTop = active.offset().top - settings.widget.optionsList.element.offset().top + settings.widget.optionsList.element.scrollTop();
							var activeBottom = activeTop+settings.widget.optionsList.element.height()-active.height();
							var targetPos = target.offset().top - settings.widget.optionsList.element.offset().top + settings.widget.optionsList.element.scrollTop() + (settings.widget.optionsList.element.height()/2);
							var new_y = targetPos - settings.widget.optionsList.element.height();
							if (targetPos >= activeTop && targetPos <= activeBottom) settings.widget.optionsList.element.scrollTop(new_y);
							else settings.widget.optionsList.element.animate({scrollTop:new_y},settings.widget.optionsList.animationSpeed);
							
							if (e.which == 13) {
								methods.hideMenu.apply($this);
								settings.events.change.apply($this,[settings,e]);
							}
							return false;
						}
					});
				});
			});
		},
		destroy:function(){
			return this.each(function(){
				var $this = $(this);
				var settings = $this.data('cySelect');
				if (!$this.hasClass('cySelect') || settings==null) return console.warn("You must instanciate $.cySelect before calling the destroy method!");
				
				$this.insertBefore(settings.widget.wrapper.element);
				settings.widget.wrapper.element.remove();
				$this.unbind('.cySelect').removeClass('cySelect').data('cySelect',null).data('cySelect-toggled',null).show();
				settings.events.destroy.apply($this,[settings]);
			});
		},
		refresh:function(){
			return this.each(function(){
				var $this = $(this);
				var settings = $this.data('cySelect');
				if (!$this.hasClass('cySelect') || settings==null) return console.warn("You must instanciate $.cySelect before calling the refresh method!");
				
				methods.destroy.apply($this);
				methods.init.apply($this,[settings,true]);
				$this.trigger("change.cySelect");
			});
		},
		resize:function(){
			return this.each(function(){
				var $this = $(this);
				var settings = $this.data('cySelect');
				if (!$this.hasClass('cySelect') || settings==null) return console.warn("You must instanciate $.cySelect before calling the resize method!");
				
				settings.widget.valueButton.element.width(0);
				setTimeout(function(){
					settings.events.beforeResize.apply($this,[settings]);
					var desiredWidth = (settings.widget.width=="auto") ? settings.widget.wrapper.element.parent().innerWidth() : settings.widget.width;
					desiredWidth -= 32; // Offset that shit
					settings.widget.wrapper.element.width(desiredWidth);
					settings.widget.valueButton.element.width(desiredWidth - settings.widget.arrowButton.element.outerWidth(true));
					settings.widget.optionsList.element.width(desiredWidth+5).css({left:settings.widget.valueButton.element.position().left});
					settings.events.resize.apply($this,[settings]);
				},1);
			});
		},
		add:function(data){
			if (typeof data == "string") try {data = $.parseJSON(data);} catch (e) {return console.warn(e);}
			if (typeof data != "object") return console.warn("$.cySelect's add method accepts only an object or JSON string in the format of {value:html} for the first argument.");
			return this.each(function(){
				var $this = $(this);
				var settings = $this.data('cySelect');
				if (!$this.hasClass('cySelect') || settings==null) return console.warn("You must instanciate $.cySelect before calling the add method!");
				
				$.each(data,function(value,html){$this.append($("<option />").val(value).attr('title',html).html(html));});
				methods.refresh.apply($this);
			});
		},
		update:function(data){
			if (typeof data == "string") try {data = $.parseJSON(data);} catch (e) {return console.warn(e);}
			if (typeof data != "object") return console.warn("$.cySelect's update method accepts only an object or JSON string in the format of {value:html} for the first argument.");
			return this.each(function(){
				var $this = $(this);
				var settings = $this.data('cySelect');
				if (!$this.hasClass('cySelect') || settings==null) return console.warn("You must instanciate $.cySelect before calling the update method!");
				
				methods.clear.apply($this,[false]);
				methods.add.apply($this,[data]);
			});
		},
		clear:function(refresh){
			if (refresh==null) refresh = true;
			return this.each(function(){
				var $this = $(this);
				var settings = $this.data('cySelect');
				if (!$this.hasClass('cySelect') || settings==null) return console.warn("You must instanciate $.cySelect before calling the clear method!");
				
				$this.children('option').not("[value=''],[value='0']").remove();
				if (refresh) methods.refresh.apply($this);
			});
		},
		value:function(set){
			if (set==null || set==undefined) set = false;
			var value;
			this.each(function(){
				var $this = $(this);
				var settings = $this.data('cySelect');
				if (!$this.hasClass('cySelect') || settings==null) return console.warn("You must instantiate $.cySelect before you call the value method!");
				
				if (set===false) value = $this.val();
				else $this.val(set).trigger('change.cySelect');
			});
			return (value!=null) ? value : this;
		},
		options:function(newOptions){
			if (newOptions!=null) {
				return this.each(function(){
					var $this = $(this);
					var settings = $this.data('cySelect');
					if (!$this.hasClass("cySelect") || settings==null) return console.warn("You must instanciate $.cySelect before you call the options method!");
					$this.data('cySelect',$.extend(true,{},settings,newOptions));
					methods.refresh.apply($this);
				});
			} else {
				var returnVal;
				this.each(function(){
					var $this = $(this);
					var settings = $this.data('cySelect');
					if (!$this.hasClass("cySelect") || settings==null) return console.warn("You must instanciate $.cySelect before you call the options method!");
					returnVal = settings;
				});
				return returnVal;
			}
		}
	};
	$.fn.cySelect=function(method){
		if (methods[method]) return methods[method].apply(this,Array.prototype.slice.call(arguments,1));
		else if (typeof method == 'object' || !method) return methods.init.apply(this,arguments);
		else $.error('Method ' + method + ' does not exist on jQuery.cySelect!');
	};
	
	$(window).resize(function(){$('select.cySelect').cySelect("resize");});
	$(document).ready(function(){$('select.cySelect').cySelect();});
})(jQuery);