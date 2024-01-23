function BasicModal(){
   var client, closer, wrapper, backer;
   function CLOSE(){
      _el.REMOVE(wrapper);
   }
   wrapper=_el.CREATE('div','','basicModalWrapper',{},[
      backer=_el.CREATE('div','','basicModalBacker'),
      client=_el.CREATE('div','','basicModalClient'),
      closer=_el.CREATE('div','','basicModalCloser',{onclick:CLOSE})
   ]);
   _el.APPEND(document.body, wrapper);
   return {
      wrapper:wrapper,
      client:client,
      closer:closer,
      backer:backer,
      CLOSE:CLOSE
   };
}