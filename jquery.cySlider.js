// CySlider v0.2
// By MacKinley Smith
(function($){
	var defaults = {
		widget:{
			label:{
				css:{
					font:_page.less.fonts_small+" "+_page.less.fonts_light
				},
				html:"",
				readout:{
					css:{},
					unit:false
				}
			},
			slider:{
				css:{},
				options:{
					min:0,
					max:100,
					value:0,
					slide:function(e,ui){},
					change:function(e,ui){}
				}
			},
			wrapper:{
				css:{
					padding:"5px 0px"
				}
			}
		},
		events:{
			create:function(cy){},
			change:function(cy,event){},
			destroy:function(cy){}
		}
	};
	var methods = {
		init:function(options,reinit){
			if (reinit==null) reinit = false;
			return this.each(function(){
				var $this = $(this);
				if ($this.data('cyslider')!=null) return console.warn("You cannot reinstatiate cySlider before calling the destroy method.\nProtip: Use the refresh method to reinstantiate in one move.");
				if (!$this.hasClass('cySlider')) $this.addClass("cySlider");
				
				// Initialize settings
				var settings;
				if (!reinit) {
					settings = $.extend(true,{},defaults,options);
					if ($this.data('settings')!=null) settings = $.extend(true,{},settings,$this.data('settings'));
					if ($this.data('label')!=null) settings.widget.label.html = $this.data('label');
					if ($this.data('unit')!=null) settings.widget.label.readout.unit = $this.data('unit');
					if ($this.data('min')!=null) settings.widget.slider.options.min = $this.data('min');
					if ($this.data('max')!=null) settings.widget.slider.options.max = $this.data('max');
					if ($this.val()!=null && $this.val()!="") settings.widget.slider.options.value = parseInt($this.val());
				} else settings = options;
				
				// Generate widget
				settings.widget.wrapper.element = $this.wrap("<div></div>").parent().addClass('cySlider-wrapper').css(settings.widget.wrapper.css);
				settings.widget.label.element = $('<label />').attr("for",$this.attr("name")).addClass('cySlider-label').css(settings.widget.label.css).html(settings.widget.label.html+": ").prependTo(settings.widget.wrapper.element);
				settings.widget.label.readout.element = $('<span />').addClass("cySlider-label-readout").css(settings.widget.label.readout.css).appendTo(settings.widget.label.element);
				settings.widget.slider.element = $('<div />').addClass('cySlider-slider').css(settings.widget.slider.css).appendTo(settings.widget.wrapper.element);
				
				// Bindings
				$this.bind("change.cySlider",function(e){
					settings.widget.label.readout.element.html($(this).val());
					settings.events.change.apply($this,[settings,e]);
				});
				
				// Set up slider
				$.each(["slide","change"],function(i,v){
					var orig = settings.widget.slider.options[v];
					settings.widget.slider.options[v] = function(e,ui){
						$this.val($(this).slider("value")+settings.widget.label.readout.unit);
						orig.apply(this,arguments);
						$this.trigger("change.cySlider");
					};
				});
				settings.widget.slider.element.slider(settings.widget.slider.options).slider("value",settings.widget.slider.options.value);
				
				// Save settings data to input
				$this.data('cyslider',settings);
				methods.resize.apply($this);
				settings.events.create.apply($this,[settings]);
			});
		},
		destroy:function(){
			return this.each(function(){
				var $this = $(this);
				var settings = $this.data('cyslider');
				if (!$this.hasClass("cySlider") || settings==null) return console.warn("You must instanciate $.cySlider before you call the destroy method!");
				
				// Destroy widget
				$this.unbind(".cySlider").removeClass("cySlider").data("cyslider",null).insertBefore(settings.widget.wrapper.element);
				settings.widget.wrapper.element.remove();
				
				settings.events.destroy.apply($this,[settings]);
			});
		},
		refresh:function(){
			return this.each(function(){
				var $this = $(this);
				var settings = $this.data('cyslider');
				if (!$this.hasClass("cySlider") || settings==null) return console.warn("You must instanciate $.cySlider before you call the refresh method!");
				
				// Destroy and reinit
				methods.destroy.apply($this);
				methods.init.apply($this,[settings,true]);
				$this.trigger('change.cySlider');
			});
		},
		resize:function(){
			return this.each(function(){
				var $this = $(this);
				var settings = $this.data('cyslider');
				if (!$this.hasClass("cySlider") || settings==null) return console.warn("You must instanciate $.cySlider before you call the resize method!");
				
				settings.widget.wrapper.element.width(0);
				setTimeout(function(){
					settings.widget.wrapper.element.width("auto");
				},1);
			});
		},
		value:function(set){
			if (set==null || set==undefined) set = false;
			var value;
			this.each(function(){
				var $this = $(this);
				var settings = $this.data('cyslider');
				if (!$this.hasClass('cySlider') || settings==null) return console.warn("You must instantiate $.cySlider before you call the value method!");
				
				if (set===false) value = $this.val();
				else {
					settings.widget.slider.element.slider("value",set);
					$this.trigger('change.cySlider');
				}
			});
			return (value!=null) ? value : this;
		},
		options:function(newOptions){
			if (newOptions!=null) {
				return this.each(function(){
					var $this = $(this);
					var settings = $this.data('cyslider');
					if (!$this.hasClass("cySlider") || settings==null) return console.warn("You must instanciate $.cySlider before you call the options method!");
					$this.data('cyslider',$.extend(true,{},settings,newOptions));
					methods.refresh.apply($this);
				});
			} else {
				var returnVal;
				this.each(function(){
					var $this = $(this);
					var settings = $this.data('cyslider');
					if (!$this.hasClass("cySlider") || settings==null) return console.warn("You must instanciate $.cySlider before you call the options method!");
					returnVal = settings;
				});
				return returnVal;
			}
		}
	};
	
	$.fn.cySlider=function(method){
		if (methods[method]) return methods[method].apply(this,Array.prototype.slice.call(arguments,1));
		else if (typeof method == 'object' || !method) return methods.init.apply(this,arguments);
		else $.error('Method ' + method + ' does not exist on $.cySlider!');
	};
	
	$(window).resize(function(){$('.cySlider').cySlider('resize');});
	$(document).ready(function(){$('.cySlider').cySlider();});
})(jQuery);