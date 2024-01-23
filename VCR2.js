function VC(targetFunct, insertOb, config){
	this.currentView=0;
	this.previousView=0;
	this.nextView=0;
	
	this.views=[];
	
	
        this.indexMap={};
        this.safeMap={};

	if(targetFunct){
		this.targetFunct=targetFunct;
	}

	
        this.active=false;
	this.config=config || {};
	this.activeConfig=this.config;
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
VC.prototype.is_VC=true;
VC.prototype.targetFunct=function(){
	return document.body;
}
VC.prototype.GET_viewList=function(){
   return Object.values(this.indexMap);
},
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
VC.prototype.GET_viewName=function(v){
    return this.indexMap[this.safeMap[v || this.currentView]];
}
VC.prototype.REGISTER_viewData=function(dat){
   var nm=this.GET_viewName();
   this[nm].viewData=dat;
   var sv=this[nm];
   this.REGISTER_changeANDrelease(function(){sv.viewData={};});
   
}
VC.prototype.PUSH_viewData=function(dat){
   this.stagedViewData=dat;
}
VC.prototype.GET_viewData=function(){
   return this[this.GET_viewName()].viewData;
}
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
VC.prototype.REGISTER_changeANDrelease=function(f){
        this.onrelease.push(f);this.onchange.push(f);
}
VC.prototype.REGISTER_release=function(f){
   this.onrelease.push(f);
}
VC.prototype.REGISTER_goodObject=function(o){
	this.reg_goodObjects.push(o);
	return o;
}
VC.prototype.REGISTER_element=function(e){
    this.reg_elements.push(e);
    return e;
}
VC.prototype.REGISTER_timeout=function(t){
    this.reg_timeouts.push(t);
    return t;
}
VC.prototype.REGISTER_interval=function(i){
    this.reg_intervals.push(i);
    return i;
}
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
VC.prototype.VCR_depth=0;
VC.prototype.LAUNCH=function(v, changeLabel, f, config){
	_fun.RunQue([
		_fun.curryArgs(_fun.RunQue, [this.onlaunch, true]),
		_fun.curryScopeArgs(this.CHANGE, this, [v,changeLabel,f,config])
	]);
}
VC.prototype.CAPTURE=function(par, tar, lab, conf){
	if(par && par.is_VC){
                par.capChildren.push(this);
		this.captured=true;
		this.capParent=par;
		this.capTargetFunct=tar;
		this.capLabelFunct=lab;
		this.capConfig=_ob.COMBINE(this.config, conf);
		this.activeConfig=this.capConfig;
	}else{
		throw new TypeError("par was not a view controler...", par);
	}
}

VC.prototype.RELEASE=function(a){
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
VC.prototype.INCR=function(){
    this.CHANGE((this.currentView+1)%this.views.length);
}
VC.prototype.DECR=function(){
    var c=this.currentView-1; 
    if(c<0){c=this.views.length-1;}
    this.CHANGE(c);
}
VC.prototype.HAS_view=function(str){
    return (Object.values(this.safeMap).indexOf(str) >= 0);
}

var VCR={};