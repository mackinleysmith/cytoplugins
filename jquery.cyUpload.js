// CyUpload v2.0
// By MacKinley Smith
(function($){
	var defaults = {
		widget:{
			button:{
				placeholder:"Click to select a file for upload…",
				css:{
					"text-align":"left",
					height:30
				},
				element:null,
				nameReadout:{
					css:{},
					element:null
				},
				sizeReadout:{
					css:{
						font:_page.less.fonts_small+" "+_page.less.fonts_medium,
						float:'right'
					},
					element:null,
					precision:2,
					units:['b','Kb','Mb','Gb','Tb']
				},
				active:false
			},
			input:{
				css:{display:'none'},
				element:null
			},
			wrapper:{
				css:{},
				element:null
			}
		},
		events:{
			create:function(){},
			change:function(file){},
			destroy:function(){}
		},
		filters:{
			name:false,
			type:false,
			size:false
		},
		errors:{
			name:"The file you have chosen is not named correctly.",
			size:"The file you have chosen is larger that the allowed size.",
			type:"The file you have chosen is not the correct type."
		}
	};
	var methods = {
		init:function(options,reinit){
			if (reinit==null) reinit = false;
			return this.each(function(){
				var $this = $(this);
				if ($this.data("cyUpload")!=null && $this.hasClass("cyUpload")) return console.warn("You cannot reinstatiate cyUpload before calling the destroy method.\nProtip: Use the refresh method to reinstantiate in one move.");
				
				// Instantiate settings
				var settings = $.extend(true,{},defaults,options);
				$this.data('cyUpload',settings);
				
				// Generate widget
				settings.widget.wrapper.element = $this.wrap("<div></div>").parent().addClass('cyUpload-wrapper').css(settings.widget.wrapper.css);
				settings.widget.input.element = $this.addClass('cyUpload').css(settings.widget.input.css);
				settings.widget.button.element = $('<button />').addClass('cyUpload-button').css(settings.widget.button.css).appendTo(settings.widget.wrapper.element)
				settings.widget.button.nameReadout.element = $('<span />').addClass('cyUpload-nameReadout').css(settings.widget.button.nameReadout.css).html(settings.widget.button.placeholder).appendTo(settings.widget.button.element);
				settings.widget.button.sizeReadout.element = $('<span />').addClass('cyUpload-sizeReadout').css(settings.widget.button.sizeReadout.css).appendTo(settings.widget.button.element);
				
				// Bindings
				settings.widget.button.element.bind('click.cyUpload',function(e){
					e.preventDefault();
					$this.click();
				});
				$this.bind('change.cyUpload',function(){
					if (settings.widget.errorMessage.element.is(':visible')) settings.widget.errorMessage.element.hide(400);
					methods.activatethis.files[0];
					var size = file.size;
					
					for (u=0;size>=1024;u++) size/=1024;
					button.html(file.name+"<span style='font:"+_page.less.fonts_small+"px "+_page.less.fonts_medium+";float:right;'>"+size.toFixed(2)+" "+settings.widget.button.sizeUnits[u]+"</span>").addClass('active');
					settings.events.change.apply($this,[file]);
				});
				
				// Store data in data-cyUpload
				$this.data('cyUpload',settings);
				
				// Attempt to activate via JSON from data-file attribute
				if ($this.data('file')!=null) try {
					var file = $.parseJSON($this.data('file'));
					methods.activate.apply($this,[file]);
				} catch (e) {console.warn("The file parameter you passed did not contain valid JSON and therefore it has been ignored.");}
				
				settings.events.create.apply($this);
			});
		},
		activate:function(file){
			if (file==null || typeof file!="object" || typeof file.name!="string" || typeof file.size!="number" || typeof file.type!="string") return $.error("$.cyUpload('activate') requires one parameter of type File Object ({name:(string containing filename),size:(integer containing filesize in bytes),type:(string containing a MIME type)}.");
			return this.each(function(){
				var $this = $(this);
				var settings = $this.data('cyUpload');
				if (!$this.hasClass('cyUpload') || settings==null) return console.warn("You must instanciate $.cyUpload before you call the activate method!");
				
				// Run filters over the received data
				var error;
				if (typeof settings.widget.filters.name == "string" && file.name != settings.widget.filters.name) error = settings.widget.errorMessage.nameError;
				if ((typeof settings.widget.filters.type == "string" && file.type != settings.widget.filters.type) || (typeof settings.widget.filters.type=="object" && $.inArray(file.type,settings.widget.filters.type)==-1)) error = settings.widget.errorMessage.typeError;
				if (settings.widget.filters.size && size > settings.widget.filters.size) error = settings.widget.errorMessage.sizeError;
				if (error!=null) {
					$.cyAjaxResponse(error,"error");
					return;
				}
				
				// Calculate size
				var size = file.size;
				for (u=0;size>=1024;u++) size/=1024;
				size = size.toFixed(settings.widget.button.sizeReadout.precision)+" "+settings.widget.button.sizeUnits[u];
				
				// Apply cosmetic changes
				settings.widget.button.element.addClass('active');
				settings.widget.button.nameReadout.element.html(file.name);
				settings.widget.button.sizeReadout.element.html(size);
			});
		},
		destroy:function(){
			return this.each(function(){
				var $this = $(this);
				var settings = $this.data('cyUpload');
				if (!$this.hasClass('cyUpload') || settings==null) return console.warn("You must instanciate $.cyUpload before you call the destroy method!");
				
				$this.removeClass('cyUpload').unbind('.cyUpload').data('cyUpload',null).siblings('*').remove().end().unwrap().show();
			});
		},
		refresh:function(){
			return this.each(function(){
				var $this = $(this);
				var settings = $this.data('cyUpload');
				if (!$this.hasClass('cyUpload') || settings==null) return console.warn("You must instanciate $.cyUpload before you call the refresh method!");
				
				methods.destroy.apply($this);
				methods.init.apply($this,[settings,true]);
				$this.trigger('change.cyUpload');
			});
		},
		error:function(message){
			return this.each(function(){
				var $this = $(this);
				var settings = $this.data('cyUpload');
				if (!$this.hasClass('cyUpload') || settings==null) return console.warn("You must instanciate $.cyUpload before you call the error method!");
				
				settings.widget.errorMessage.element.html(((typeof message == "string")?message:"An error occurred, please try again.")).show(settings.widget.errorMessage.animationTime);
				settings.widget.button.element.removeClass('active');
				methods.refresh.apply($this);
			});
		},
		resize:function(){
			return this.each(function(){
				var $this = $(this);
				var settings = $this.data('cyUpload');
				if (!$this.hasClass('cyUpload') || settings==null) return console.warn("You must instanciate $.cyUpload before you call the resize method!");
				
				settings.widget.wrapper.element.width(0);
				setTimeout(function(){
					settings.widget.wrapper.element.width("100%");
				},1);
			});
		},
		options:function(newOptions){
			if (newOptions!=null) {
				return this.each(function(){
					var $this = $(this);
					var settings = $this.data('cyUpload');
					if (!$this.hasClass("cyUpload") || settings==null) return console.warn("You must instanciate $.cyUpload before you call the options method!");
					$this.data('cyUpload',$.extend(true,{},settings,newOptions));
					methods.refresh.apply($this);
				});
			} else {
				var returnVal;
				this.each(function(){
					var $this = $(this);
					var settings = $this.data('cyUpload');
					if (!$this.hasClass("cyUpload") || settings==null) return console.warn("You must instanciate $.cyUpload before you call the options method!");
					returnVal = settings;
				});
				return returnVal;
			}
		}
	};
	
	$.fn.cyUpload = function(method){
		if (methods[method]) return methods[method].apply(this,Array.prototype.slice.call(arguments,1));
		else if (typeof method == 'object' || !method) return methods.init.apply(this,arguments);
		else $.error('Method '+method+' does not exist on jQuery.cyUpload!');
	};
	
	$(window).resize(function(){$('.cyUpload').cyUpload('resize');});
	$(document).ready(function(){$('.cyUpload').cyUpload();});
})(jQuery);