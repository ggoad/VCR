_hist={
	incrId:0,
   firstHistory:true,
   uriOb:{},
	url:false,
   logflag:true,
   documentTitle:'',
   globOb:null,
   GRAB_addr:function(){
      if(history && history.state && history.state.VCR){
         var VCRaddr=history.state.VCR;
         for(var mem in VCRaddr)
         {
             VCR[mem].historyChange=true;
             VCR[mem].stagedView=''+VCRaddr[mem].view;
             if(VCRaddr[mem].viewData){
                VCR[mem].PUSH_viewData(VCRaddr[mem].viewData);
             }
         }
      }
	   
   }
};


if(history && history.state && history.state.stateId){
	_hist.incrId=history.state.stateId;
}

if(history && history.pushState){
   VC.prototype.LOG_change=function(){
          var uriOb={};
          
                   
		  for(var mem in VCR)
		  {
			 if(VCR[mem].active && !VCR[mem].config.noLog){
                                var view;
				uriOb[mem]={
                                   view:(view=VCR[mem].currentView)
                                };
                                var vd=VCR[mem][VCR[mem].GET_viewName()].viewData;
                                if(!Object.keys(vd).length){vd=false;}
                                if(vd){
                                   uriOb[mem].viewData=VCR[mem][VCR[mem].GET_viewName()].viewData;
                                }
                                if(VCR[mem].captured){
                                   uriOb[mem].captured=true;
                                }
			 }
		  }
		  var globOb=_hist.globOb || {};
                  if(_hist.logflag){
		     if(!_hist.firstHistory && !_ob.COMPARE(uriOb, _hist.uriOb)){
  		       _hist.incrId++;
			   history.pushState(_ob.COMBINE({VCR:uriOb, stateId:_hist.incrId}, globOb),"",_hist.url || undefined);  
		     }else{
   	 		_hist.firstHistory=false;
  
			    history.replaceState(_ob.COMBINE({VCR:uriOb, stateId:_hist.incrId},globOb),"", _hist.url || undefined);  
		     }
                  }
                   
			_hist.url=false;
                  _hist.uriOb=uriOb;
                  if(_hist.documentTitle){document.title=_hist.documentTitle; _hist.documentTitle="";}
	  
   };
   onpopstate=function(){
           var state=history.state.VCR;
           _hist.GRAB_addr();
           _hist.logflag=false;
           for(var mem in state)
           {
              if(!state[mem].captured){
                 VCR[mem].CHANGE();
              }
           }
	   _hist.logflag=true;
   };
}else{
   console.warn('no history supported');
}