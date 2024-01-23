function ScreenCapture(msg, button, form){
    var mod=BasicModal();
    _el.REMOVE(mod.closer);
    
    mod.wrapper.id+=" screenCaptureWrapper";
    
    _el.APPEND(mod.client, _el.CREATE('h2','','',{},[msg]));
    
	_el.APPEND(mod.client, [
		_el.CREATE('br'),
		_el.CREATE('div','','lds-spinner',{},[
			_el.CREATE('div'),
			_el.CREATE('div'),
			_el.CREATE('div'),
			_el.CREATE('div'),
			_el.CREATE('div'),
			_el.CREATE('div'),
			_el.CREATE('div'),
			_el.CREATE('div'),
			_el.CREATE('div'),
			_el.CREATE('div'),
			_el.CREATE('div'),
			_el.CREATE('div')
		])
	]);
		
    var oldClose, oldListener;
    if(button){
        button.disabled=true;
        oldClose=mod.CLOSE;
        mod.CLOSE=function(){
            button.disabled=false;
            oldClose.call(this);
        }
    }
    if(form){
        oldListener=form.onsubmit;
        form.onsubmit=function(e){
            e.stopImmediatePropagation();
            e.preventDefault();
            e.cancelBubble=true;
           // console.log('here');
        }
        oldClose=mod.CLOSE;
        mod.CLOSE=function(){
            form.onsubmit=oldListener;
            oldClose.call(this);
        }
    }
    
    return mod;
}