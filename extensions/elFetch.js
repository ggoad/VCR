function ElFetch( target,fetchMessage, file, config, responseType,responseHandlers,disablers){
    /*
      target: element to be the target,
      fetchMessage: a node to be appended to the target, 
     
         file:string, 
         config (the config of the actual call to fetch): {body:string, method:'POST', etc...}, 
         responseType: string json | text 
    */
    /* responseHandlers ={
         success: function(result, target){} to be fired on success
         fail: function(error, target){} to be fired on failure,
         overrideMsg: if you only want to display a single message on failure
       }
    */
    config=config || {};
    disablers=disablers || {};
    if(disablers.button){
       disablers.button.setAttribute('disabled','');
    }else if(disablers.form){
       var oldListener=disablers.form.onsubmit;
       disablers.form.onsubmit=function(e){
            e.stopImmediatePropagation();
            e.preventDefault();
            e.cancelBubble=true;
       }
    }else if(disablers.fieldset){
       disablers.fieldset.setAttribute('disabled','');
    }
    if(typeof fetchMessage === 'string'){fetchMessage=_el.TEXT(fetchMessage);}
    _el.APPEND(target, fetchMessage);
    fetch(file,config)
    .then(function(res){
        _el.REMOVE(fetchMessage);
        console.log("fetchResult:",res, res.status);
        if(parseInt(res.status) >= 400){
            console.log(file+" errorStatus: "+res.status);
            throw new Error("Server Error "+res.status);
        }
        return res[responseType]();
    }).then(function(rt){
        if(disablers.button){
           disablers.button.removeAttribute('disabled');
        }else if(disablers.form){
           disablers.form.onsubmit=oldListener;
        }else if(disablers.fieldset){
           disablers.fieldset.removeAttribute('disabled');
        }
        if((responseType === 'json' &&  rt.success) || rt === "SUCCESS"){
            _el.REMOVE(fetchMessage);
            responseHandlers.success(rt,target);
        }else{
            console.log('error', rt);
            var err= new Error(responseHandlers.overrideMsg || "Error Processing: "+((responseType === "json") ? (rt.msg || '') : rt || ''));
            err.dat=rt;
            throw err;
        }
        
    }).catch(function(e){
        _el.REMOVE(fetchMessage);
        if(disablers.button){
           disablers.button.removeAttribute('disabled');
        }else if(disablers.form){
           disablers.form.onsubmit=oldListener;
        }else if(disablers.fieldset){
           disablers.fieldset.removeAttribute('disabled');
        }
        console.log(e, e.dat || '');
        if(responseHandlers.fail){
           setTimeout(responseHandlers.fail(e,target), 1);
        }
        _el.REMOVE(fetchMessage);
        var m=e.message;
        if(e.message === 'Failed to fetch'){
            m=("There was a problem submitting. Possibly a network error. Please try again.");
        }
        console.log(file+" Fetch Error: "+m);
		if(!responseHandlers.quietError){
			_el.APPEND(target, m);
		}
    });
}