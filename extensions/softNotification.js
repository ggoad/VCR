SoftNotification={
   Render:function(body, fadeOutDur){
      fadeOutDur=fadeOutDur || 1000;
      var r;
      _el.APPEND(document.body, r=_el.CREATE('div','','SoftNotification-Wrapper',{},[
         _el.CREATE('div','','SoftNotification-ActionWrapper',{},[_el.CREATE('button','','',{onclick:function(){_el.REMOVE(this.parentNode.parentNode);}},["X"])]),
         _el.CREATE('div','','SoftNotification-BodyWrapper',{},body)
      ]));
      r.style.opacity='0';
      setTimeout(function(){
         r.style.opacity='1';
         if(fadeOutDur === -1){return;}
         setTimeout(function(){
            r.style.opacity="0";
            setTimeout(function(){_el.REMOVE(r);},501);
         },fadeOutDur+501);
      },1);
   }
};