// CyRadio v0.5
// By MacKinley Smith
(function($){
	var defaults = {
		widget:{
			buttonList:{
				buttons:{
					css:{
						display:'inline-block',
						height:30,
						padding:0,
						'border-radius':0
					},
					elements:[]
				},
				borderRadius:5,
				css:{
					width:"100%"
				}
			},
			inputList:{
				css:{
					display:'none'
				},
				inputs:{
					css:{},
					elements:[]
				}
			},
			labels:["On","Off"],
			wrapper:{
				css:{
					
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
			var namelist = [];
			return this.each(function(){
				var $this = $(this);
				if ($.inArray($this.attr('name'),namelist)>-1) return;
				if ($this.data('cyRadio')!=null) return console.warn("You cannot reinstatiate cyRadio before calling the destroy method.\nProtip: Use the refresh method to reinstantiate in one move.");
				
				// Initialize settings
				var settings = $.extend(true,{},defaults,options);
				
				// Generate widget
				settings.widget.inputList.inputs.elements = $('input[name="'+$this.attr('name')+'"]').addClass('cyRadio');
				// Data settings for individual radio buttons
				if (!reinit) settings.widget.inputList.inputs.elements.each(function(i){
					if ($(this).data('label')!=null) settings.widget.labels[i] = $(this).data('label');
				});
				settings.widget.wrapper.element = $this.wrap("<div class='cyRadio-wrapper'></div>").parent().css(settings.widget.wrapper.css);
				settings.widget.inputList.element = $('<div />').addClass('cyRadio-inputList').appendTo(settings.widget.wrapper.element).css(settings.widget.inputList.css);
				// Move inputs to inputList
				settings.widget.inputList.inputs.elements.css(settings.widget.inputList.inputs.css).appendTo(settings.widget.inputList.element);
				settings.widget.buttonList.element = $('<div />').addClass('cyRadio-buttonList').css(settings.widget.buttonList.css).appendTo(settings.widget.wrapper.element);
				settings.widget.inputList.inputs.elements.each(function(i){
					if ($(this).data('label')!=null) settings.widget.labels[i] = $(this).data('label');
					$(this).attr('data-cyradio-input',i);
					var button = $('<button />')
						.addClass('cyRadio-button')
						.attr({'data-cyradio-input':i,'data-cyradio-value':$(this).val()}).html(settings.widget.labels[i])
						.css(settings.widget.buttonList.buttons.css)
						.appendTo(settings.widget.buttonList.element);
				});
				settings.widget.buttonList.buttons.elements = settings.widget.buttonList.element.children('.cyRadio-button');
				// Round button edges
				settings.widget.buttonList.buttons.elements.filter(':first-child').css({'border-top-left-radius':settings.widget.buttonList.borderRadius,'border-bottom-left-radius':settings.widget.buttonList.borderRadius});
				settings.widget.buttonList.buttons.elements.filter(':not(:last-child)').css({'border-right':'none'});
				settings.widget.buttonList.buttons.elements.filter(':last-child').css({'border-top-right-radius':settings.widget.buttonList.borderRadius,'border-bottom-right-radius':settings.widget.buttonList.borderRadius});
				
				// Store settings in data-cyRadio
				settings.widget.inputList.inputs.elements.data('cyRadio',settings);
				
				// Choose active
				if (settings.widget.inputList.inputs.elements.find(':checked')) methods.value.apply(settings.widget.inputList.inputs.elements,[settings.widget.inputList.inputs.elements.find(':checked').val()]);
				
				// Bindings
				settings.widget.inputList.inputs.elements.change($.debounce(100,true,function(e){
					methods.value.apply(settings.widget.inputList.inputs.elements,[settings.widget.inputList.inputs.elements.filter(':checked').val()])
					settings.events.change.apply(settings.widget.inputList.inputs.elements,[settings,e]);
				})).trigger('change');
				settings.widget.buttonList.buttons.elements.click(function(e){
					e.preventDefault();
					if ($(this).hasClass('active')) return false;
					methods.value.apply($this,[$(this).data('cyradio-value')]);
					settings.widget.inputList.inputs.elements.trigger('change');
				});
				
				// Fire resize event
				methods.resize.apply(settings.widget.inputList.inputs.elements);
				
				settings.events.create.apply(settings.widget.inputList.inputs.elements,[settings]);
				
				// Add name to namelist
				namelist.push($this.attr('name'));
			});
		},
		destroy:function(){
			var namelist = [];
			return this.each(function(){
				var $this = $(this);
				if ($.inArray($this.attr('name'),namelist)>-1) return;
				var settings = $this.data('cyRadio');
				if (!$this.hasClass('cyRadio') || settings==null) return console.warn("You must instantiate jQuery.cyRadio before you call the destroy method!");
				
				// Move inputs back outside wrapper
				settings.widget.inputList.inputs.elements.insertAfter(settings.widget.wrapper.element).show();
				// Remove widget
				settings.widget.wrapper.element.remove();
				$this.removeClass('cyRadio').unbind('.cyRadio').data('cyRadio',null);
				namelist.push($this.attr('name'));
				settings.events.destroy.apply(settings.widget.inputList.inputs.elements,[settings]);
			});
		},
		refresh:function(){
			var namelist = [];
			return this.each(function(){
				var $this = $(this);
				if ($.inArray($this.attr('name'),namelist)>-1) return;
				var settings = $this.data('cyRadio');
				if (!$this.hasClass('cyRadio') || settings==null) return console.warn("You must instantiate jQuery.cyRadio before you call the refresh method!");
				
				methods.destroy.apply($this);
				methods.init.apply($this,[settings,true]);
				$this.trigger('change.cyRadio');
				
				namelist.push($this.attr('name'));
			});
		},
		resize:function(){
			var namelist = [];
			return this.each(function(){
				var $this = $(this);
				if ($.inArray($this.attr('name'),namelist)>-1) return;
				var settings = $this.data('cyRadio');
				if (!$this.hasClass('cyRadio') || settings==null) return console.warn("You must instantiate jQuery.cyRadio before you call the resize method!");
				
				settings.widget.wrapper.element.width(0);
				settings.widget.buttonList.buttons.elements.width("auto");
				setTimeout(function(){
					settings.widget.wrapper.element.width('100%');
					settings.widget.buttonList.buttons.elements.width((settings.widget.buttonList.element.innerWidth() * (1/settings.widget.buttonList.buttons.elements.length)) - 2);
					settings.widget.wrapper.element.width(settings.widget.wrapper.element.width()-1);
				},1);
			});
		},
		value:function(set){
			var namelist = [];
			if (set==null || set==undefined) set = false;
			var value;
			this.each(function(){
				var $this = $(this);
				if ($.inArray($this.attr('name'),namelist)>-1) return;
				var settings = $this.data('cyRadio');
				if (!$this.hasClass('cyRadio') || settings==null) return console.warn("You must instantiate jQuery.cyRadio before you call the value method!");
				
				if (set===false) value = settings.widget.inputList.inputs.elements.filter(':checked').val();
				else {
					settings.widget.inputList.inputs.elements.filter('[value="'+set+'"]').prop("checked",true);
					settings.widget.buttonList.element.find('.active').removeClass('active').end().find('[data-cyradio-value="'+set+'"]').addClass('active');
				}
				
				namelist.push($this.attr('name'));
			});
			return (value!=null) ? value : this;
		},
		options:function(newOptions){
			if (newOptions!=null) {
				return this.each(function(){
					var $this = $(this);
					var settings = $this.data('cyRadio');
					if (!$this.hasClass("cyRadio") || settings==null) return console.warn("You must instanciate $.cyRadio before you call the options method!");
					$this.data('cyRadio',$.extend(true,{},settings,newOptions));
					methods.refresh.apply($this);
				});
			} else {
				var returnVal;
				this.each(function(){
					var $this = $(this);
					var settings = $this.data('cyRadio');
					if (!$this.hasClass("cyRadio") || settings==null) return console.warn("You must instanciate $.cyRadio before you call the options method!");
					returnVal = settings;
				});
				return returnVal;
			}
		}
	};
	
	$.fn.cyRadio = function(method){
		if (methods[method]) return methods[method].apply(this,Array.prototype.slice.call(arguments,1));
		else if (typeof method == 'object' || !method) return methods.init.apply(this,arguments);
		else $.error('Method ' +  method + ' does not exist on $.cyRadio!');
	};
	
	$(window).resize(function(){$('.cyRadio').cyRadio("resize");});
	$(document).ready(function(){$('.cyRadio').cyRadio();});
})(jQuery);