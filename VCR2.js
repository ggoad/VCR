/*
	@param targetFunct : function : opt : a function to return the element that the controler has control over
	@param insertOb    : object   : opt : an object to insert any object values into the controler that you want
	@param config      : object   : opt : an object for the configuration 
			config structure:{
				noLog       : bool   : set to true to not register any changes in the history,
				noLogByView : object : disable logging for individual views by their numeric index
			}
			
	This is the main constructor of the library.
	
	I hope the arguments are all self explanitory. They are all optional.
	
	One important note about useage. To instantiate a controler, please use this form:
	
        VVV Use whatever name you want
	VCR.main = new VC();
	
	The history library assumes you instantiated this in this fashion, and iterates though the VCR variable when saving application state.
*/

function VC(targetFunct, insertOb, config){
	/* view indexes */
	this.currentView=0;
	this.previousView=0;
	this.nextView=0;
	
	/* a list of functions */
	this.views=[];
	
	/* 
		these maps map the names and indexes between each other. 
		Safe map can convert both an index and a name back to an index.
	*/
    this.indexMap={}; 
    this.safeMap={};

	/* overwrites the target funct if one has been provided. */
	if(targetFunct){
		this.targetFunct=targetFunct;
	}

	
	this.active=false;
	this.config=config || {};
	this.activeConfig=this.config;
	
	
	/* event ques */
	this.onchange=[];
	this.afterchange=[];
	this.onrelease=[];
	this.onlaunch=[];
	
	this.historyChange=null;
	
	
	this.captured=false;
	this.capParent=null;
	this.capTargetFunct=null;
	this.capConfig=null;
	this.capChildren=[];

	/* these registries can be used to register things that need cleaning up upon change */
	this.reg_elements=[];
	this.reg_timeouts=[];
	this.reg_intervals=[];
	this.reg_goodObjects=[];
	
	if(insertOb){
		for(var mem in insertOb)
		{
		   if(typeof this[mem] !== "undefined"){
			  throw new TypeError("The member "+mem+" already exists in the view controller");
		   }
		   this[mem]=insertOb[mem];
		}
	}
}
VC.prototype.is_VC=true; /* a quick check so you don't have to check against prototype */

/* This function is the default target function. This is called to indicate the container that the view controller has control of. */
VC.prototype.targetFunct=function(){
	return document.body;
}

/* returns a lits of the names of all the views */
VC.prototype.GET_viewList=function(){
   return Object.values(this.indexMap);
}

/*
@param emptyTarget : bool : opt : set to true to empty the target element before returning

This function gets the element that the view controler is in charge of.
*/
VC.prototype.GET_target=function(emptyTarget){
	var ret;
	if(this.captured && this.capTargetFunct){
		ret=this.capTargetFunct();
	}else{
		ret=this.targetFunct();
	}
	if(emptyTarget){
		_el.EMPTY(ret);
	}
	return ret;
}

/*

@param v : (int | string) : opt : the name or index of a view

This function gets the name of the a view by either the index or the name. 

If v is not provided, the current view of the view controler is returned.
*/
VC.prototype.GET_viewName=function(v){
    return this.indexMap[this.safeMap[v || this.currentView]];
}

/*
@param dat : object : req : an object to be the view data associated with the view.

This function is here to not only set the view data of a view,
but to also register a listener to reset the view data of a view onchange,
so that the data doesn't hang around when re-visiting a view
*/
VC.prototype.REGISTER_viewData=function(dat){
   var nm=this.GET_viewName();
   this[nm].viewData=dat;
   var sv=this[nm];
   this.REGISTER_changeANDrelease(function(){sv.viewData={};});
   
}

/*
@param dat : object : req : an object to be the view data associated with the view.

This function is here to pre-set the view data of an upcoming view, 
so that the history imprint stays in sync. This is called from the history library.
*/
VC.prototype.PUSH_viewData=function(dat){
   this.stagedViewData=dat;
}

/* returns the view data of the current view */
VC.prototype.GET_viewData=function(){
   return this[this.GET_viewName()].viewData;
}

/*
	@param name     : string   : req : a string to name the view.
	@param f        : function : req : a function with 1 argument (the parent view controller) to modify the container
	@param insertOb : object   : opt : this object is for the data-holding of the view. It can be anything you want, but viewData is reserved for use the view data to be saved with the view history
	@param config   : object   : opt : this object is for the view configuration. Currently unused
	
	This function registers the view with the view controler. 
	
	It pushes the callback function onto the views array, and registers the name in all of the necessary mapping objects.
	
	The insertOb is where you can indicated default viewData. 
	
	Right now, the config is unused.
	
*/
VC.prototype.REGISTER_view=function(name, f, insertOb, config){
        if(typeof this[name] !== "undefined"){throw new TypeError('Name already exists on this view controller: '+name);}
	this.views.push(f);
        if(insertOb && !insertOb.viewData){insertOb.viewData={};}
	this[name]=insertOb || {viewData:{}};
         var i=this.views.length-1;
         this.safeMap[name]=i; this.safeMap[i]=i;
         this.indexMap[i]=name;
	this.config[name]=config || {};
}

/* registers a function to be called upon change or realease */
VC.prototype.REGISTER_changeANDrelease=function(f){
        this.onrelease.push(f);this.onchange.push(f);
}

/* registers a function to be called upon release */
VC.prototype.REGISTER_release=function(f){
   this.onrelease.push(f);
}

/* registeres an object to have for  o.good=false; upon change */
VC.prototype.REGISTER_goodObject=function(o){
	this.reg_goodObjects.push(o);
	return o;
}

/* registers an element to be removed upon change */
VC.prototype.REGISTER_element=function(e){
    this.reg_elements.push(e);
    return e;
}

/* registers a timeout to be cleared upon change */
VC.prototype.REGISTER_timeout=function(t){
    this.reg_timeouts.push(t);
    return t;
}

/*  registers an interval to be canceled upon change. */
VC.prototype.REGISTER_interval=function(i){
    this.reg_intervals.push(i);
    return i;
}

/* iterates through all of the registries and cleans up with the apropriate action */
VC.prototype.CLEANUP=function(){
    while(this.reg_elements.length){
           _el.REMOVE(this.reg_elements.pop());
        }
        while(this.reg_timeouts.length){
           clearTimeout(this.reg_timeouts.pop());
        }
        while(this.reg_intervals.length){
           clearInterval(this.reg_intervals.pop());
        }
		while(this.reg_goodObjects.length){
			var r=this.reg_goodObjects.pop().good=false;
			if(r.target){_el.REMOVE(r.target);}
		}
        while(this.capChildren.length)
        {this.capChildren.pop().RELEASE();}
}

/*
	@param v      : int|string : opt : the view you want to change to
	@param dat    : object     : opt : an object to register 
	@param f      : function   : opt : a function to be called after the change has taken place
	@param config : object     : opt : a configuration object to overwrite the config of the VC 
		config sturcture{
			noLog : bool : set to true to not log in the history
		}
		
	This is the meat an potatoes.
	
	Call this function to change the view 
	
	v can be an index or the name of a view... 
	
	OR v can be omitted, and it'll change to this.stagedView || this.currentView
*/
VC.prototype.CHANGE=function(v, dat, f, config){
	VC.prototype.VCR_depth++;
	switch(typeof v){
		case "string":
		case "number":
		   break;
		 default:
			v=this.stagedView || this.currentView;
			this.stagedView='';
			break;
	}
	this.CLEANUP();
	var arr, arr2;
	if(this.views.length){
		v=this.safeMap[v];
		this.previousView=this.currentView;
		this.currentView=v;
	


		this.active=true;
		var lgger;
		if(
			!this.config.noLog 
			&& (!config || config && !config.noLog) 
			&& (!this.config.noLogByView || !this.config.noLogByView[v])
			&& this.VCR_depth === 1
		){
			lgger=this.LOG_change;
		}
		VC.prototype.VCR_depth--;

		if(this.stagedViewData){
			dat=this.stagedViewData; this.stagedViewData=null;
		}

		_fun.RunQue([
			_fun.curryArgs(_fun.RunQue, [this.onchange]),
			_fun.curryScope(function(){if(dat){this.REGISTER_viewData(dat);}}, this),
			_fun.curryArgs(this.views[v],[this]),
			_fun.curryArgs(_fun.RunQue, [this.afterchange]),
			f || DUMMY_FUNCT, 
			_fun.curryScope(lgger || DUMMY_FUNCT,this)
		]);
		this.historyChange=null;
	}
}

/* this is used to determine when it's time to write to the browser's history */
VC.prototype.VCR_depth=0; 

/*
	@param v      : string|int : opt : v is the view to launch into
	@param dat    : object     : opt : dat is the viewData object to pass to CHANGE
	@param f      : function   : opt : f is a function to be called after the change
	@param config : object     : opt : config is a config to overwrite the config of the VC
	
	This function launches a view from the view function of another view controler.
	
	It needs to be differentiated from change because of reasons that have to do with the history registry.
*/
VC.prototype.LAUNCH=function(v, dat, f, config){
	_fun.RunQue([
		_fun.curryArgs(_fun.RunQue, [this.onlaunch, true]),
		_fun.curryScopeArgs(this.CHANGE, this, [v,dat,f,config])
	]);
}

/*
	@param par  : VC       : req : the VC that is capturing the VC
	@param tar  : function : req : a function to return the new target
	@param conf : object   : opt : an object to overwrite the default configuration of the vc
	
	This function captures a VC, changing its behaviour to yield to the parent VC.
*/
VC.prototype.CAPTURE=function(par, tar, conf){
	conf=conf || {};
	if(par && par.is_VC){
		par.capChildren.push(this);
		this.captured=true;
		this.capParent=par;
		this.capTargetFunct=tar;
		this.capConfig=_ob.COMBINE(this.config, conf);
		this.activeConfig=this.capConfig;
	}else{
		throw new TypeError("par was not a view controler...", par);
	}
}

/* this function releases a view controler, and returns it to its default behavior */
VC.prototype.RELEASE=function(){
    this.active=false;
	this.captured=false;
	this.capParent=undefined;
	this.capTargetFunct=undefined;
	this.capConfig=undefined;
	this.activeConfig=this.config;
    this.CLEANUP();        
	_fun.RunQue(this.onrelease);
	_fun.RunQue(this.onchange);
	if(this.config.resetViewOnRelease){
		if(this.historyChange === true){
			this.historyChange=null;
		}else{
			this.currentView=0;
		}
	}
}

/* go to next view */
VC.prototype.INCR=function(){
    this.CHANGE((this.currentView+1)%this.views.length);
}

/* go to previous view */
VC.prototype.DECR=function(){
    var c=this.currentView-1; 
    if(c<0){c=this.views.length-1;}
    this.CHANGE(c);
}

/* asks if a particular view is present in the view controler */
VC.prototype.HAS_view=function(str){
    return (Object.values(this.safeMap).indexOf(str) >= 0);
}

/* the global variable to hold all your VC instantiations.
	the history library looks here to save view state.*/
var VCR={};