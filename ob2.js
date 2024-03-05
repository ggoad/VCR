/* START _object */
_ob={
	/* this is a legacy function. A long time ago, this was how you 'did' inheritance in JS */
	COPY_proto:(function(){
		function Temp(){}
		return function(O){
			if(typeof O != "object"){
				throw TypeError("Object prototype may only be an Object or null");
			}
			Temp.prototype=O;
			var obj=new Temp();
			Temp.prototype=null;
			return obj;
		};
	})(),
	/* is Array polyfill */
	IS_array:function(a){
		if(Array.isArray && Array.isArray(a)){
			return true;
		}return false;
	},
	/* combine 2 object into a new object */
	COMBINE:function(ob1, ob2){
		ob1=ob1 || {};
		ob2=ob2 || {};
		var ret={};
		this.INSERT(ret, ob1);
		this.INSERT(ret, ob2);
		return ret;
	},
	/* insert members into a reciever object */
	INSERT:function(reciever, con){
		con = con || {};
		for(var mem in con)
		{
			reciever[mem]=con[mem];
		}
	},
	/*  this could probably be removed */
	PARSE_default:function(def,set){
	   return this.COMBINE(def,set);
	},
	/* compare two objects, key by key */
	COMPARE:function(ob1, ob2){
		if(typeof ob1 !== "object" || typeof ob2 !== "object"){return false;}
		if(Object.keys(ob1).length !== Object.keys(ob2).length){return false;}
		var cmp=true;
		for(var mem in ob1)
		{
		   if(typeof ob1[mem] === "object"){
			  cmp=this.COMPARE(ob1[mem], ob2[mem]);
		   }else{
			  cmp=(ob1[mem] === ob2[mem]);
		   }
		   if(!cmp){return false;}
		}
		return true;
	},
	/* a control to set how deep clone will run recursively */
	CLONE_depthLimit:20,
	/* clone an object */
	CLONE:(function(){
		return function(obj, depth, callDepth){
			depth=depth || 1;
			callDepth=callDepth || 0;
			if(depth === -1){
				depth = this.CLONE_depthLimit;
				if(callDepth === this.CLONE_depthLimit){
					throw new TypeError("Depth limit reached: ", obj);
				}
			}
			
			if((obj === null || typeof obj !== "object") || (callDepth === depth || callDepth === this.CLONE_depthLimit)){
				return obj;
			}
			if(obj instanceof Date){
				return new Date(obj.getTime());
			}
			if(this.IS_array(obj)){
				var retArr=[];
				for(var i=0; i<obj.length; i++)
				{
					
					retArr[i]=this.CLONE(obj[i], depth, callDepth+1);
				}
				return retArr;
			}
			
			if(obj.CLONE){
				return obj.CLONE();
			}
			var ret={};
			for(var mem in obj)
			{
				if(obj.hasOwnProperty(mem)){
					ret[mem]=this.CLONE(obj[mem], depth, callDepth+1);
				}
			}
			return ret;
		};
	})()
};

/* Array.isArray polyfill */
if(!Array.isArray){
	Array.isArray=function(a){
		if(typeof a === "object" && a.constructor === Array){
			return true;
		}
	}
}
	

/* END _object*/
