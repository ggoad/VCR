/// this is normaly hooked into a template pipeline
// `--CookieManager-StorageName--` can be whatever you want it to be
// `--CookieManager-SiteCookies--` is the list of cookies you can ask permission for
// 	see the comment above site cookies for examples
CookieManager=(function(){ 
	var permissions=localStorage.getItem('`--CookieManager-StorageName--`');

	var ret={
                autoRender:true,
                allowAllOnPlaceholder:false,
                localStorageIndex:'`--CookieManager-StorageName--`',
                /*siteCookies:{
                   test:{
                      name:'test',
                      readableName:'Test Cookie', 
                      category:'Cookies for Testing',
                      description:'Yo. this is just a test. We are seeing if it works',
                      added:false,
                      level:false, 
                      listeners:[],
                      adder:function(){
                         console.log('added');
                      }
                   },
                   grecaptcha:{
                      name:'grecaptcha',
                      readableName:'Google Recaptcha', 
                      category:'3rd Party',
                      description:'We use this 3rd party service provided by google to guard against bot attacks.',
                      added:false,
                      level:false, 
                      listeners:[],
                      adder:function(){
                         console.log('grecaptcah added');
                      }
                   },
                   youtube:{
                      name:'youtube',
                      readableName:'Youtube Player', 
                      category:'3rd Party',
                      description:'When we embed the youtube player, certain information about your browsing session will be shared with Google',
                      added:false,
                      level:false, 
                      listeners:[],
                      adder:function(){
                         console.log('youtube added');
                      }
                   },
                },*/siteCookies:`--CookieManager-SiteCookies--`,
                SoftAdd:function(name){
                   if(this.siteCookies[name].listeners.length){this.Add(name);}
                },
                Add:function(name){
                   var sc=this.siteCookies[name];
                   
                   sc.adder(function(){
                      
                      sc.added=true;
                      sc.listeners.forEach(function(l){l();});
                      sc.listeners=[];
                      if(sc.level === 'once'){CookieManager.SetPermission(name,'none');}
                   },function(msg){msg=msg||''; if(msg){msg=' '+msg;}sc.added=false;SoftNotification.Render("Failed to Add Cookie"+msg);});
                },
                PermissionPlaceholder:function(cooks, reason){
                   var t=this;
                   if(!_ob.IS_array(cooks)){cooks=[cooks];}
                   return _el.CREATE('div','','CookieManager-PermissionPlaceholder',{},[
                      _el.CREATE('div','','',{},["A cookie is required ", reason]),
                      _el.CREATE('button','','',{
                         onclick:function(e){
                            _el.CancelEvent(e);
                            t.SetPermissionArr(cooks,"any");
                         }
                      },["Allow"]),
                      _el.CREATE('button','','',{
                         onclick:function(e){
                            _el.CancelEvent(e);
                            t.SetPermissionArr(cooks,"once");
                         }
                      },["Allow Once"]),
                      ((!this.autoRender && this.allowAllOnPlaceholder) ?  
                         _el.CREATE('button','','',{
                            onclick:function(e){
                               _el.CancelEvent(e);
                               t.SetAllPermission('any');
                            }
                         },["Allow All Cookies"]) : ''
                      ),
                      (this.autoRender ? '' : 
                         _el.CREATE('button','','',{
                            onclick:function(e){
                               _el.CancelEvent(e);
                               t.Render();
                            }
                         },["Manage Cookies"])
                      ),
                      _el.CREATE('br'),
                      _el.CREATE('details','','',{},[
                         _el.CREATE('summary','','',{},[""]),
                         ...cooks.map(c=>{
                            var d=t.siteCookies[c].description;
                            if(d.cloneNode){d=d.cloneNode(true);}
                            return _el.CREATE('div','','CookieManager-CookieDetails',{},[
                              _el.CREATE('h3','','',{},[t.siteCookies[c].readableName+" ("+t.siteCookies[c].category+")"]),
                              _el.CREATE('p','','',{},[d])
                            ]);
                         })
                      ])
                   ]);
                },
		GetPermission:function(name, el, success, reason){
                        var t=this;
                        reason= reason || "for this section to function";
                        if(!_ob.IS_array(name)){
                           name=[name];
                        }
                        name.forEach(function(n){if(!t.siteCookies[n]){throw new Error("Could not find cookie. "+n);}});

                        if(name.reduce(function(a,n){return a && t.siteCookies[n].added;}, true)){
                            success();
                            return true;
                        }
                        var blocked=false;
                        var allNone=true;
                        name.forEach(function(n){
                           if(['once', 'any'].indexOf(t.siteCookies[n].level) > -1){
                              t.Add(n);
                              return;
                           }
                           blocked=true;
                           if(t.siteCookies[n].level !== 'none'){
                              allNone=false;
                           }
                        });

                        if(blocked){
                            
                            _el.APPEND(el, this.PermissionPlaceholder(name, reason));
                            this.siteCookies[name].listeners.push(this.Emptier(el, success, name));
                            if(!allNone && this.autoRender){
                               this.Render(true);
                            }
                            return;
                        }
                        success();
		},
                Emptier:function(el, f,nameArr){
                   var t=this;
                   return function(){if(!nameArr.reduce(function( acc,n){return acc && t.siteCookies[n].added;},true)){return; }_el.EMPTY(el);f();}
                },
                CloseRender:function(){
                   document.documentElement.style.removeProperty("padding-bottom");
                   _el.REMOVE(document.querySelector("#CookieManager-Interface"));
                },
		Render:function(spec){
                        var text="Cookie Management";
                        if(spec){text="This section of the website uses cookies.";}
                        var t=this;
                        if(document.querySelector("#CookieManager-Interface")){return;}
                        var interface;
                        var ext;
                        var manageButton;
                        var noCloseAfterSave=false;
                        var closer;
			_el.APPEND(this.GetTarget(), interface=_el.CREATE('div','CookieManager-Interface','',{},[
                           _el.CREATE('div','CookieManager-CloseHolder','',{},[
                              closer=_el.CREATE('button','','',{onclick:function(){
                                  var sub;
                                  if((sub=document.querySelector('#CookieManager-Submit'))){sub.dispatchEvent(new Event('click'));}
                                  t.CloseRender();
                              }},['X'])
                           ]),
                           _el.CREATE('h3','','',{},[text]),
                           _el.CREATE('div','CookieManager-ButtonHold','',{},[
                              _el.CREATE('button','','',{
                                  onclick:function(e){
                                     _el.CancelEvent(e);
                                     t.SetAllPermission('any');
                                     t.CloseRender();
                                  }
                              },["Allow All"]),
                              _el.CREATE('button','','',{
                                  onclick:function(e){
                                     _el.CancelEvent(e);
                                     t.SetAllPermission('none');
                                     t.CloseRender();
                                  }
                              },["Block All"]),
                              manageButton=_el.CREATE('button','','',{
                                 onclick:function(e){
                                    function RenderSubmitter(){
                                       if((document.querySelector("#CookieManager-Submit"))){
                                          return;
                                       }
                                       _el.APPEND(ext, _el.CREATE("div",'CookieManager-Submit','',{onclick:function(){
                                          
                                           var list=Array.from(document.querySelectorAll('.CookieManagerSetting'));
                                           list.forEach(function(l){
                                              var n=l.id.replace("CookieManagerSetting-",''); 
                                              var set=(Array.from(l.querySelectorAll('[type="radio"]')).filter(function(e){return e.checked;})[0] || {}).value;
                                              if(set){t.SetPermission(n, set);} 
                                           });
                                           if(!noCloseAfterSave){
                                              t.CloseRender();
                                           }else{noCloseAfterSave=false;}
                                       }},["Save Cookie Settings"]));
                                       
                                    }
                                       var ht=interface.scrollHeight;
                                       interface.style.height=ht+"px";
                                       interface.style.overflow='hidden';
                                       setTimeout(function(){interface.style.height="100%"; setTimeout(function(){interface.style.removeProperty('overflow');}, 501);},1);
                                       
                                    this.style.display='none';
                                    var cats={};
                                    var sc=t.siteCookies;
                                    _el.EMPTY(ext);
                                    _el.APPEND(ext, [_el.CREATE('button','','',{onclick:function(){
                                     
                                      var sub;
                                      if((sub=document.querySelector('#CookieManager-Submit'))){noCloseAfterSave=true;sub.dispatchEvent(new Event('click'));}
                                      _el.EMPTY(ext);ext.onchange='';
                                      interface.style.height=ht+'px';
                                      interface.style.overflow='hidden';
                                      setTimeout(function(){interface.style.removeProperty('overflow');interface.style.removeProperty('height');manageButton.style.removeProperty('display');},501);
                                       
                                      
                                    }},["Hide Details"]),_el.CREATE('br')]);
                                    ext.onchange=function(e){
                                       RenderSubmitter();
                                    };
                                    for(var mem in sc)
                                    {
                                       if(!cats[sc[mem].category]){cats[sc[mem].category]=[];}cats[sc[mem].category].push(sc[mem]);
                                    }
                                    for(var mem in cats)
                                    {
                                       _el.APPEND(ext, _el.CREATE('div','','CookieManager-Manager-Category',{},[
                                          _el.CREATE('h4','','',{},[mem]),
                                          _el.CREATE('div','','',{
                                             onchange:function(e){
                                                
                                             }
                                          },[
                                             _el.CREATE('label','','',{},[
                                                "Allow: ",
                                                _el.CREATE('input','','CookieManager-Category CookieManager-Category-RadioAllow',{type:'radio', name:'cookieManager-category-'+mem, onchange:function(){
                                                    var list=this.parentNode.parentNode.querySelectorAll('.CookieManager-Cookie-RadioAllow');
                                                    list.forEach(function(l){l.checked=true;});
                                                }, checked:cats[mem].reduce(function(acc, curr){return acc && curr.level === 'any';},true)})
                                             ]),
                                             _el.CREATE('label','','',{},[
                                                "Block: ",
                                                _el.CREATE('input','','CookieManager-Category CookieManager-Category-RadioBlock',{type:'radio', name:'cookieManager-category-'+mem, onchange:function(){
                                                    var list=this.parentNode.parentNode.querySelectorAll('.CookieManager-Cookie-RadioBlock');
                                                    list.forEach(function(l){l.checked=true;});
                                                }, checked:cats[mem].reduce(function(acc, curr){return acc && curr.level === 'none';},true)})
                                             ]),
                                             _el.CREATE('label','','',{},[
                                                "Allow Once: ",
                                                _el.CREATE('input','','CookieManager-Category CookieManager-Category-RadioAllowOnce',{type:'radio', name:'cookieManager-category-'+mem, onchange:function(){
                                                    var list=this.parentNode.parentNode.querySelectorAll('.CookieManager-Cookie-RadioAllowOnce');
                                                    list.forEach(function(l){l.checked=true;});
                                                }, checked:cats[mem].reduce(function(acc, curr){return acc && curr.level === 'once';},true)})
                                             ]),
                                             _el.CREATE('br'),
                                             _el.CREATE('details','','',{onchange:function(){Array.from(this.parentNode.querySelectorAll('.CookieManager-Category')).forEach(function(a){a.checked=false;});}},[
                                                _el.CREATE('summary'),
                                                ...cats[mem].map(function(c){
                                                   return _el.CREATE('div','','CookieManager-Manager-Cookie',{},[
                                                      _el.CREATE('h4','','',{},[c.readableName]),
                                                      _el.CREATE('p','','',{},[c.description]),
                                                      _el.CREATE('div','CookieManagerSetting-'+c.name,'CookieManagerSetting',{},[
                                                         _el.CREATE('label','','',{},[
                                                           "Allow: ",
                                                            _el.CREATE('input','','CookieManager-Cookie CookieManager-Cookie-RadioAllow',{type:'radio', name:'cookieManager-cookie-'+c.name,value:'any',checked:(c.level === 'any')})
                                                         ]),
                                                         _el.CREATE('label','','',{},[
                                                           "Block: ",
                                                            _el.CREATE('input','','CookieManager-Cookie CookieManager-Cookie-RadioBlock',{type:'radio', name:'cookieManager-cookie-'+c.name, value:'none', checked:c.level === 'none'})
                                                         ]),
                                                         _el.CREATE('label','','',{},[
                                                           "Allow Once: ",
                                                            _el.CREATE('input','','CookieManager-Cookie CookieManager-Cookie-RadioAllowOnce',{type:'radio', name:'cookieManager-cookie-'+c.name, value:'once',checked:c.level === 'once'})
                                                         ]),
                                                      ]),
                                                   ])
                                                })
                                             ])
                                          ]),
                                       ]));
                                    }
                                 }
                              },["Manage Cookies"]),
                           ]),
                           ext=_el.CREATE('div','CookieManager-Details','',{},[])
                        ]));
                        var sh=interface.scrollHeight;
                        document.documentElement.style.paddingBottom=sh+"px";
                        interface.style.bottom=(-sh)+"px";
                        
                        setTimeout(function(){interface.style.transition="bottom 500ms, height 500ms"; interface.style.bottom=0; setTimeout(function(){interface.style.removeProperty("transition");interface.style.removeProperty("bottom"); closer.focus();},501);},1);

                     
		},
                SetAllPermission:function(level){
                   for(var mem in this.siteCookies)
                   {
                      this.SetPermission(mem, level,true);
                   }
                   this.WritePermission();
                },
                SetPermissionArr:function(cooks, level){
                   var t=this;
                   cooks.forEach(function(c){t.SetPermission(c, level, true);});
                   this.WritePermission();
                },
		SetPermission:function(name,level, noWrite){
			this.siteCookies[name].level=level;
                        if(level !== 'none'){
                           this.SoftAdd(name);
                        }
                        if(!noWrite){
                           this.WritePermission();
                        }
                        
		},
                WritePermission:function(){
                   var t=this;
                   var keys=Object.keys(this.siteCookies);
                   var entries=keys.filter(function(k){return t.siteCookies[k].level;}).map(function(k){return [k,t.siteCookies[k].level];});
                   var ob=Object.fromEntries(entries);
                   console.log(ob);
                   localStorage.setItem(this.localStorageIndex, JSON.stringify(ob));
                },
		tar:null,
                vc:null,
                GetTarget:function(){
                  return this.tar || (this.vc || {}).currentTarget || document.body;
                },
                REGISTER_VC:function(vc){
                  var t=this;
                  this.vc=vc;
                  VC.REGISTER_changeANDrelease(function(){
                     t.permissionListeners={};
                  });
                }
	};
        if(permissions){
           permissions=JSON.parse(permissions);
           for(var mem in permissions)
           {ret.siteCookies[mem].level=permissions[mem];}
        }
        return ret;
})();

