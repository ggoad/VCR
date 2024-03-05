/* this is just so we have a function when we have to execute something,
// so we don't have to create an empty function every time (expensive in JS) */
function DUMMY_FUNCT(){}
_fun={
	curryScope:function(fun,scp){
		return function(){
			fun.apply(scp,arguments);
		};
	},
	curryArgs:function(fun, arg){
		if(!Array.isArray(arg)){throw new TypeError('Arg must be an array');}
		return function(){
			fun.apply({}, arg);
		};
	},
	curryScopeArgs:function(fun,scp,arg){
		if(!Array.isArray(arg)){throw new TypeError('Arg must be an array');}
		return function(){
			fun.apply(scp,arg);
		};
	},
	/* run an array of functions. keep indicates whether to erase the array after */
	RunQue:function(arr, keep){
	   arr.forEach(function(a){a();});
	   if(!keep){arr.length=0;}
	}
};