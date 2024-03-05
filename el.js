/* START _element */
_el={
	/* cancel an event */
    CancelEvent:function(e){e.preventDefault(); e.cancelBubble=true;},
	/* move an id from 1 element to another */
    MoveId:function(id,el){
       (document.getElementById(id) || {}).id='';
       el.id=id;
    },
	/* this is a helper for CREATE */
    PARSE_element:function(a){
       if(typeof a === "string"){return this.TEXT(a);}
       return a;
    },
	/* remove an element */
	REMOVE:function(e){
		if(e && e.parentNode){e.parentNode.removeChild(e);}
	},
	/* append an element to a parent, returns the parent */
	APPEND:function(p,c){
		if(Array.isArray(c)){
			for(var i=0; i<c.length; i++)
			{
				p.appendChild(this.PARSE_element(c[i]));
			}
		}else{
			p.appendChild(this.PARSE_element(c));
		}
		return p;
	},
	/* append an element to a parent, returns the child */
	_APPEND:function(p,c){
		if(Array.isArray(c)){
		   c.forEach(function(a){p.appendChild(_el.PARSE_element(c));});
		}else{p.appendChild(this.PARSE_element(c));}
			

		return c;
	},
	/* 
		create an element: 
			tp is the tag name 
			id is id
			className is className 
			otherMemOb 
				is anything to insert as a property on the element
				two special properties:
					'style'
						and
					'attributes'
			append 
				an array of elements to append to the created element
				raw strings are created as text nodes
	*/
	CREATE:function(tp, id, className, otherMemOb, append){
		var ret=document.createElement(tp);
		if(id){
			ret.id=id;
		}
		if(className){
			ret.className=className;
		}
		if(otherMemOb){
			for(var mem in otherMemOb)
			{
				if(mem === "style"){
					for(var s in otherMemOb[mem])
					{
						ret.style[s]=otherMemOb[mem][s];
					}
				}else if(mem === 'attributes'){
					for(var a in otherMemOb[mem]){ret.setAttribute(a, otherMemOb[mem][a]);}
				}else{
					ret[mem]=otherMemOb[mem];
				}
			}
		}
		if(append){
		   this.APPEND(ret, append);
		}
		return ret;
	},
	/* create a text node */
	TEXT:function(txt){
		return document.createTextNode(txt);
	},
	/* removes all child elements */
	EMPTY:function(el){
		if(el && el.childNodes){
			for(var i=0; i<el.childNodes.length; i++)
			{
				if(el.childNodes[i]){
					el.removeChild(el.childNodes[i]);
					i--;
				}
			}
		}
	}
};


/* END _element */