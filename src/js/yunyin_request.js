/*
andyjyuan@163.com

most of the codes comes from a script named "Aui_Ajax" downloaded from internet.
*/

var po = require('./public_object.js')

var baseurl = 'http://localhost/index.php/'

module.exports = {
	rest_api: function(method,resource,data,successfn) {
		return new yyajax({
			method: method,
			url: baseurl + resource,
			data: data,
			withCredentials:true,
			success: function(responseText,status) {
				var rpdata = JSON.parse(responseText)
				if(resource=='auth/') {
					successfn(rpdata.status,rpdata.info)
				} else {
					if(rpdata.status==-1) {
						po.app.showLoginModal = true
					} else {
						successfn(rpdata.status,rpdata.info)
					}
				}
			},
			error: function(status) {
				alert('网络请求出错：'+ status)
			}
		})
	},

	ajax: function(options) {
		return new yyajax(options);
	},
}



var yyajax = function(options) {
	this.XHR = null;
	this.method   = options["method"]   || "get"  ;
	this.url      = options["url"]      || ""     ;
	this.user     = options["user"]     || null   ;
	this.pwd      = options["password"] || null   ;
	this.data     = options["data"]     || null   ;
	this.encoding = options["encoding"] || "utf-8";

	this.content = options["content"] || "urlencoded";
	this.success  = options["success"];
	this.error    = options["error"];

	this.sendRequest(options["withCredentials"]);
}

yyajax.prototype = {
	sendRequest: function(withCredentials) {
		var o = this,
			reg = /\?/,
			data = o.formatData(o.data),
			url = reg.test(o.url)?o.data?o.url.substring(0,o.url.search(reg)):o.url:o.url;

		if(o.method == "get"){
			if(o.data) url += "?"+data;
			data = null;
		};
		o.XHR = o.createXHR();
		if(!o.XHR) return false;
		o.XHR.open(o.method, url, true);
		o.XHR.onreadystatechange = function(){
			o.handleEvent(o,this);
		};

		if(this.content=="urlencoded"){
			o.XHR.setRequestHeader("Content-Type","application/x-www-form-urlencoded;charset="+o.encoding+"");
		}

		o.XHR.withCredentials=withCredentials;
		o.XHR.setRequestHeader("X-Requested-With","XMLHttpRequest");
	    o.XHR.send(data);
	},

	handleEvent: function(o,x){
		if (x.readyState == 4) {
			switch(x.status){
				case 200:
					o.success.call(x,x.responseText,x.status,"success");
					break;
				default:
					o.error.call(x,x.status,"error");
			};
		};
	},

	createXHR: function(){
		try {
			return new XMLHttpRequest();
		} catch(e){
			var MSXML = [ "MSXML2.XMLHTTP.5.0",
						  "MSXML2.XMLHTTP.4.0",
						  "MSXML2.XMLHTTP.3.0",
						  "MSXML2.XMLHTTP",
						  "Microsoft.XMLHTTP"
						],
				i,len = MSXML.length;
			for(i = 0; i < len; i+=1) {
				try {
					return new ActiveXObject(MSXML[i]);
					break;
				} catch(e){
					return null;
				};
			}
		}
	},

	formatData: function(d) {
		var s = function(d){
				var arr = [];
				for(var i in d){
					arr.push( i + "=" + d[i]);
				};
				return arr;
		};

		if(this.content=="urlencoded") {
			if( typeof d == "object" ){
				return s(d).join("&");
			} else if(typeof d == "string" ){
				var n = /{/g.test(d)?JSON.parse(d):d;
				return typeof n == "string"?n:s(n).join("&");
			};
		} else {
			var myFormData = new FormData();
			for(var i in d) {
				myFormData.append(i,d[i]);
			}

			return myFormData;
		}

	},

}