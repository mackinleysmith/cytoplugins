(function($){
	var defaults = {
		format:'hsla', // hsla, hex, rgba
		events:{
			change:function(color){}
		},
		widget:{
			previewer:{
				css:{
					display:'inline-block',
					width:152,
					height:152,
					"margin-right":10,
					"border-radius":10,
					"box-shadow":"0px 0px 10px rgba(0,0,0,0.5)"
				},
				element:null
			},
			slider_table:{
				attrs:{
					hue:{
						max:359
					},
					saturation:{
						max:1,
						step:0.01
					},
					lightness:{
						max:1,
						step:0.01
					},
					alpha:{
						max:1,
						step:0.01
					}
				},
				css:{
					display:'inline-block',
					'vertical-align':'top',
					'border-width':1
				},
				element:null,
				sliders:{
					elements:[],
					settings:{
						animate:true,
						min:0,
						slide:function(e,ui){
							$(this).parent().parent().find("span.num").html($(this).slider("value"));
							methods.update.apply($(this).parents(".cyColorPicker-wrapper").find('.cyColorPicker'));
						},
						change:function(e,ui){
							$(this).parent().parent().find("span.num").html($(this).slider("value"));
							methods.update.apply($(this).parents(".cyColorPicker-wrapper").find('.cyColorPicker'));
						}
					}
				}
			},
			wrapper:{
				css:{},
				element:null
			}
		},
		default_value:"hlsa(0,0%,100%,1)"
	};
	var attrs = ['hue','saturation','lightness','alpha'];
	var methods = {
		init:function(options){
			return this.each(function(){
				var $this = $(this);
				
				// Instantiate settings
				var settings = $.extend(true,{},defaults,options);
				$this.data('cyColorPicker',settings);
				
				// Generate widget
				$this.addClass('cyColorPicker').css({display:'none'});
				settings.widget.wrapper.element = $this.wrap("<div class='cyColorPicker-wrapper' />").parent().css(settings.widget.wrapper.css);
				settings.widget.previewer.element = $('<div />').addClass('cyColorPicker-previewer').css(settings.widget.previewer.css).appendTo(settings.widget.wrapper.element).click(function(e){
					settings.widget.previewer.element.flip({direction:'tb',color:settings.widget.previewer.element.css('background-color')});
				});
				
				// Generate slider table
				var slider_table = $('<table />').attr({cellPadding:0,cellSpacing:0}).css(settings.widget.slider_table.css).appendTo(settings.widget.wrapper.element);
				for (var i=0;i<settings.format.length;i++) {
					var letter = settings.format[i];
					var tr = $('<tr />').appendTo(slider_table);
					var lc = $('<td />').addClass('labelcell').html(letter.toUpperCase()+": ").append($('<span />').addClass('num').html(0)).appendTo(tr);
					var sc = $('<td />').addClass('cyColorPicker-sliderCell').appendTo(tr);
					var slider = $('<div data-attr="'+attrs[i]+'" />').appendTo(sc).slider($.extend(true,{},settings.widget.slider_table.sliders.settings,settings.widget.slider_table.attrs[attrs[i]]));
					settings.widget.slider_table.sliders.elements.push(slider);
				}
				slider_table.find('td').css({'padding':"5px 10px"}).filter('.labelcell').width(35);
				
				$this.data('cyColorPicker',settings);
				
				// Get initial value as color
				var wasSet = ($this.val()!="");
				if (wasSet) settings.default_value = $this.val();
				settings.value = $.Color(settings.default_value);
				
				// Commit settings to data-cyColorPicker attribute
				$this.data('cyColorPicker',settings);
				methods.resize.apply($this);
				if (wasSet) methods.set.apply($this,[settings.value]);
				else methods.update.apply($this);
			});
		},
		update:function(){
			return this.each(function(){
				var $this = $(this);
				var settings = $this.data('cyColorPicker');
				if (!$this.hasClass('cyColorPicker') || settings==null) return console.warn("You must instanciate $.cyColorPicker before calling this method!");
				
				var wrapper = $this.parent();
				var previewer = wrapper.find(".cyColorPicker-previewer");
				var sliders = wrapper.find('.ui-slider');
				var color = {};
				sliders.each(function(i){color[attrs[i]] = sliders.filter("[data-attr="+attrs[i]+"]").slider("value");});
				color = $.Color(color);
				previewer.css({"background-color":color.toHslaString()});
				
				$this.val(color.toHslaString());
				settings.events.change.apply($this,[color]);
			});
		},
		set:function(color){
			return this.each(function(){
				var $this = $(this);
				var settings = $this.data('cyColorPicker');
				if (!$this.hasClass('cyColorPicker') || settings==null) return console.warn("You must instanciate $.cyColorPicker before calling the set method!");
				
				var wrapper = $this.parent();
				color = $.Color(color);
				var sliders = wrapper.find('.ui-slider');
				sliders.each(function(i){sliders.filter("[data-attr="+attrs[i]+"]").slider("value",color.hsla()[i]);});
				
				methods.update.apply($this,[color]);
			});
		},
		resize:function(){
			return this.each(function(){
				var $this = $(this);
				var settings = $this.data('cyColorPicker');
				if (!$this.hasClass('cyColorPicker') || settings==null) return console.warn("You must instanciate $.cyColorPicker before calling the resize method!");
				settings.widget.wrapper.element.width(0);
				setTimeout(function(){
					settings.widget.wrapper.element.width('100%').find('.cyColorPicker-sliderCell').width(settings.widget.wrapper.element.innerWidth()-settings.widget.previewer.element.outerWidth(true)-80);
				},1);
			});
		},
		destroy:function(){
			return this.each(function(){
				var $this = $(this);
				var settings = $(this).data('cyColorPicker');
				if (!$this.hasClass('cyColorPicker') || settings==null) return console.warn("You must instanciate $.cyColorPicker before calling the destroy method!");
				var wrapper = $this.parent();
				$this.insertBefore(wrapper).removeClass('cyColorPicker').data('cyColorPicker',null);
				wrapper.remove();
			});
		},
		refresh:function(){
			return this.each(function(){
				var $this = $(this);
				var settings = $(this).data('cyColorPicker');
				if (!$this.hasClass('cyColorPicker') || settings==null) return console.warn("You must instanciate $.cyColorPicker before calling the refresh method!");
				methods.destroy.apply($this);
				methods.init.apply($this,[settings]);
				$this.trigger('change.cyColorPicker');
			});
		},
		options:function(newOptions){
			if (newOptions!=null) {
				return this.each(function(){
					var $this = $(this);
					var settings = $this.data('cyColorPicker');
					if (!$this.hasClass("cyColorPicker") || settings==null) return console.warn("You must instanciate $.cyColorPicker before you call the options method!");
					$this.data('cyColorPicker',$.extend(true,{},settings,newOptions));
					methods.refresh.apply($this);
				});
			} else {
				var returnVal;
				this.each(function(){
					var $this = $(this);
					var settings = $this.data('cyColorPicker');
					if (!$this.hasClass("cyColorPicker") || settings==null) return console.warn("You must instanciate $.cyColorPicker before you call the options method!");
					returnVal = settings;
				});
				return returnVal;
			}
		}
	};
	
	$.fn.cyColorPicker = function(method){
		if (methods[method]) return methods[method].apply(this,Array.prototype.slice.call(arguments,1));
		else if (typeof method == 'object' || !method) return methods.init.apply(this,arguments);
		else $.error('Method ' +  method + ' does not exist on $.cyColorPicker!');
	};
	
	$(window).resize(function(){$('.cyColorPicker').cyColorPicker("resize");});
	$(document).ready(function(){$('.cyColorPicker').cyColorPicker();});
})(jQuery);