import qs from 'qs';

export default {
	methods: {
		turnPage( direction, callback){
	      if( direction == 'left'){
	        this.page--
	      } else {
	        this.page++
	      }
	      callback && callback(this.page)
	    },
	    getAdminParkingList( callback ){
	    	this.$http.get(this.$request+'?action=parkinglot_admin_all&admin_id='+this.admin_id).then( res => {
	    		const resp = res.data;
	    		if(resp.error_code == '0'){
	    			callback && callback(resp)
	    		}
	    	})
	    },
	    fetchPost(url, date, callback){
	    	this.$http.post(url, qs.stringify(date), {
	    		headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				}
	    	}).then( res => {
	    		callback && callback(res)
	    	})
	    }
	}
}
Date.prototype.Format = function (fmt) { //author: meizz 
    var o = {
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "h+": this.getHours(), //小时 
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

