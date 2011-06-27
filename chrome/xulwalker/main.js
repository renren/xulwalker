const nsICommandLine = Components.interfaces.nsICommandLine;
const nsITransport = Components.interfaces.nsITransport;

const nsIWebProgress = Components.interfaces.nsIWebProgress;
const nsIWebProgressListener = Components.interfaces.nsIWebProgressListener;

window.addEventListener('load', startServer, false);
window.alert = null;

function startServer(){

    var SocketServer = Components.classes['@mozilla.org/network/server-socket;1']
                                 .createInstance(Components.interfaces.nsIServerSocket);
    
    SocketServer.init(8080, false, -1);
    
    while (true)
        SocketServer.asyncListen(aServListener);

    // ?
    obj.close();
}

var aServListener = {
    _count: 0,
    
    onSocketAccepted: function(aServ, aTransport){
        var streamIn = aTransport.openInputStream(0, 0, 0);
        var streamOut = aTransport.openOutputStream(0, 0, 0);
        
        var outContent = 'READY\r\n';
        streamOut.write(outContent, outContent.length);
        
        var box = document.getElementById('box');
        
        var abrowser = document.createElement('browser');
        abrowser.setAttribute('id', this._count);
        abrowser.setAttribute('type', 'content-primary');
        abrowser.setAttribute('flex', '1');
        
        box.appendChild(abrowser);
        
        this._count++;

        var browserProgressListener = {
            _requestsStarted: 0,
            _requestsFinished: 0,
            
            _blankRequest: 0,
            _blankFinish: 0,
            
            _myHashMap: new HashMap(),

            QueryInterface: function(iid){
                if (iid.equals(Components.interfaces.nsIWebProgressListener)
                        || iid.equals(Components.interfaces.nsISupportsWeakReference)
                        || iid.equals(Components.interfaces.nsISupports)) 
                    return this;
                
                throw Components.results.NS_ERROR_NO_INTERFACE;
            },
            
            onStateChange: function(aWebProgress, aRequest, aStateFlags, aStatus){
                var progress = document.getElementById("progress");
                var loadtime = document.getElementById("loadtime");
                var serverstatus = document.getElementById("serverstatus");

                var timer = new Date();
                
                var starttime = null;
                var finishtime = null;

                if (aStateFlags & nsIWebProgressListener.STATE_IS_REQUEST) {
                    if (aStateFlags & nsIWebProgressListener.STATE_START) {
                        if (aRequest.name != 'about:document-onload-blocker'
                                        && aRequest.name != 'about:blank'
                                        && aRequest.name != 'about:layout-dummy-request') {
                            this._requestsStarted++;

                            var obj = new objvalue();
                            obj.objvalue(aRequest.name, Number(timer.getTime()));
                            this._myHashMap.put(aRequest.name, obj);
                        }
                        else 
                            this._blankRequest++;
                    }
                    else if (aStateFlags & nsIWebProgressListener.STATE_STOP) {
                        if (aRequest.name != 'about:document-onload-blocker'
                                        && aRequest.name != 'about:blank'
                                        && aRequest.name != 'about:layout-dummy-request') {
                            this._requestsFinished++;

                            this._myHashMap.setValue(aRequest.name, Number(timer.getTime()));
                        }
                        else {
                            this._blankFinish++;
                        }
                    }
                    
                    if (this._requestsStarted > 1) {
                        var value = (100 * this._requestsFinished) / this._requestsStarted;
                        progress.setAttribute("mode", "determined");
                        progress.setAttribute("value", value + "%");
                    }
                }
                
                if (aStateFlags & nsIWebProgressListener.STATE_IS_NETWORK) {
                    if (aStateFlags & nsIWebProgressListener.STATE_START) {
                        progress.setAttribute("style", "");
                        
                        this._myHashMap.setName(aRequest.name);
                        this._myHashMap.setPageStart(Number(timer.getTime()));
                    }
                    else if (aStateFlags & nsIWebProgressListener.STATE_STOP) {
                        progress.setAttribute("style", "display: none");
                    
                        this.onStatusChange(aWebProgress, aRequest, 0, "Done");
                    
                        this._myHashMap.setPageFinish(Number(timer.getTime()));
                        this._myHashMap.setRequestSuccess(this._requestsFinished);
                        this._myHashMap.setRequestTotal(this._requestsStarted);

                        var contentConsole = this._myHashMap.printResult2() + 'READY\r\n'
                        if (aRequest.name == "about:blank") {
                            // do nothing
                        }
                        else {
                            streamOut.write(contentConsole, contentConsole.length);
                        }
                        
                        this._requestsStarted = 0;
                        this._requestsFinished = 0;
                        
                        this._myHashMap.clear();
                        
                        _blankRequest = 0;
                        _blankFinish = 0;
                    }
                }
                
                if (aStateFlags & nsIWebProgressListener.STATE_IS_DOCUMENT) {
                    if (aStateFlags & nsIWebProgressListener.STATE_START) {
                        // do nothing
                    } else if (aStateFlags & nsIWebProgressListener.STATE_STOP) {
                        var domDocument = aWebProgress.DOMWindow.document;
                        
                        domDocument.addEventListener("click", click, true);
                        domDocument.addEventListener("DOMActivate", activate, true);
                        domDocument.addEventListener("onchange", cleanup, false);
                        
                        if (domDocument.title && domDocument.title.length > 0) 
                            window.title = domDocument.title;
                    }
                }

                if ( aStateFlags & nsIWebProgressListener.STATE_STOP ) {
                    if (aRequest.name != 'about:document-onload-blocker'
                                    && aRequest.name != 'about:blank'
                                    && aRequest.name != 'about:layout-dummy-request') {
                        serverstatus.setAttribute('label',
                                aRequest.QueryInterface(Components.interfaces.nsIHttpChannel).responseStatus + " : "
                                                            + aRequest.QueryInterface(Components.interfaces.nsIHttpChannel).responseStatusText
                                                            + " >> T " + aRequest.name );
                        this._myHashMap.setRspValue(aRequest.name,
                                aRequest.QueryInterface(Components.interfaces.nsIHttpChannel).responseStatus + "["
                                                            + aRequest.QueryInterface(Components.interfaces.nsIHttpChannel).responseStatusText
                                                            + "]" );
                    }
                }
            },
            
            onProgressChange: function(aWebProgress, aRequest, aCurSelf, aMaxSelf, aCurTotal, aMaxTotal) {
                if (this._requestsStarted == 1) {
                    var progress = document.getElementById("progress");
                    if (maxSelf == -1) {
                        progress.setAttribute("mode", "undetermined");
                    } else {
                        progress.setAttribute("mode", "determined");
                        progress.setAttribute("value", ((100 * aCurSelf) / aMaxSelf) + "%");
                    }
                }
            },
            
            onLocationChange: function(aWebProgress, aRequest, aLocation){
                var urlbar = document.getElementById("loadtime");
                urlbar.setAttribute("label", "URL: " + aRequest.name);
            },
            
            onStatusChange: function(aWebProgress, aRequest, aStatus, aMessage){
                var statusbar = document.getElementById("status");
                statusbar.setAttribute("label", aMessage);
            },
            
            onSecurityChange: function(aWebProgress, aRequest, aState){
                var security = document.getElementById("security");
                
                switch (aState) {
                    case nsIWebProgressListener.STATE_IS_SECURE | nsIWebProgressListener.STATE_SECURE_HIGH:
                        security.setAttribute("level", "high");
                        break;
                    case nsIWebProgressListener.STATE_IS_SECURE | nsIWebProgressListener.STATE_SECURE_MEDIUM:
                        security.setAttribute("level", "med");
                        break;
                    case nsIWebProgressListener.STATE_IS_SECURE | nsIWebProgressListener.STATE_SECURE_LOW:
                        security.setAttribute("level", "low");
                        break;
                    case nsIWebProgressListener.STATE_IS_BROKEN:
                        security.setAttribute("level", "broken");
                        break;
                    case nsIWebProgressListener.STATE_IS_INSECURE:
                    default:
                        security.removeAttribute("level");
                        break;
                }
            }
        };
        
        abrowser.webProgress.addProgressListener(browserProgressListener, nsIWebProgress.NOTIFY_ALL);

        var instream = Components.classes["@mozilla.org/scriptableinputstream;1"]
                                 .createInstance(Components.interfaces.nsIScriptableInputStream);
        instream.init(streamIn);
        
        var dataListener = {
            contentRead: '',

            onStartRequest: function(request, context){
            },

            onStopRequest: function(request, context, aStatus){
                instream.close();
                box.removeChild(abrowser);
            },

            onDataAvailable: function(request, context, inputStream, offset, count){
                this.contentRead = instream.read(count);
                var kill = new RegExp(/^kill/);
                
                if (kill.test(this.contentRead))
                    while (box.firstChild)
                        box.removeChild(box.firstChild);
                else             
                    abrowser.webNavigation.loadURI(this.contentRead, 128, null, null, null);                	
            },
        };
        
        var pump = Components.classes["@mozilla.org/network/input-stream-pump;1"]
                             .createInstance(Components.interfaces.nsIInputStreamPump);

        pump.init(streamIn, -1, -1, 0, 0, false);
        pump.asyncRead(dataListener, null);
        
    },
    
    onStopListening: function(aServ, aStatus){
    }
}


/**
 * 先处理不记录多次重连时间的
 * 目前记录第一次重连的时间就OK
 */
function objvalue(){
    var _name = null; //uri
    var _rspstatus = null;

    var _totlerequest = 1; //重连次数，默认为1

    /**
     * 先不处理后面连接的问题 只记录连接次数和重连次数
     */
    var _starttime = 0; //开始重连接时间
    var _finishtime = 0;

    var _loadtime = 0; //第一次载入的时间 first request 和 first get的时间差距
    
    var _content = null;
    var _content2 = null;
    
    /**
     * construct a object for application
     * @param {Object} aname --uri
     * @param {Object} starttime --request start time
     */
    this.objvalue = function(aname, starttime){
        this._name = aname;
        this._starttime = Number(starttime);
        this._totlerequest = 1;
        this._rspstatus = 0;
    }
    
    this.setRequest = function(times){
        this._totlerequest = times;
    }

    /**
     * return the uri
     */
    this.getName = function(){
        return this._name;
    }
    
    /**
     * return the times of request
     */
    this.getTotleRequest = function(){
        return this._totlerequest;
    }
    
    /**
     * return the first request time
     */
    this.getStartTime = function(){
        return this._starttime;
    }
    
    this.getRspStatus = function(){
        return this._rspstatus;
    }

    /**
     * return the first responsd time
     */
    this.getFinishTime = function(){
        return this._finishtime;
    }
    
    /**
     * return load time
     */
    this.getLoadTime = function(){
        return this._loadtime;
    }
    
    this.incRequest = function(){
        this._totlerequest++;
    }
    
    this.contentResult2 = function(){
        var content2 = '';
        content2 = '<URI:' + this._name + '> ';
        content2 += '<try:' + this._totlerequest + '> ';
        content2 += '<loadtime:' + this._loadtime + ' ms> ';
	    
        if ( this._rspstatus != undefined && this._rspstatus != 0 && this._rspstatus != null ) {
            content2 += '<STATUS:' + this._rspstatus + '>';
	    }

	    content2 += '\n';
        if (this._content2 != undefined) {
            alert('content2 rewrite');
            this._content2 = null;
        }

        this._content2 = content2;
    }
    
    this.contentResult = function(){
        var content = "";
        content = "URI	:" + this._name + "\n";
        content += "Retry:" + this._totlerequest + "\n";
        content += "<start:" + this._starttime + "><finish:" + this._finishtime + "><loadtime:" + this._loadtime + " ms>\n";

        if (this._content != undefined) {
            this._content = null;
        }

        this._content = content;
    }
   
    this.putRspStatus = function(resstatus){
        if (this._totlerequest > 1) {
            return;
        }

        this._rspstatus = resstatus;
    }
 
    /**
     * get finish time and get loadtime
     * @param {Object} finishtime
     */
    this.putFinishTime = function(finishtime){
        if (this._totlerequest > 1) {
            return;
        }

        this._finishtime = Number(finishtime);
        this._loadtime = Number(Number(this._finishtime) - Number(this._starttime));
    }
    
    this.getContent = function(){
        this.contentResult();
        if (this._content != undefined) {
            return this._content;
        }
    }
    
    this.getContent2 = function(){
        this.contentResult2();
        if (this._content2 != undefined) {
            return this._content2;
        }
    }
    
    this.warning = function(){
        alert("warning");
    }
}

/////////////////////////////////////// Hash Map ///////////////////////////////////////////////////
function HashMap() {
    var _size = 0;              // map size
    var _entry = new Object();  // for store obj
    var _average = 0;   // 所有请求的时间的均值
    var _dx = 0;        // 所有请求的方差
    var _max_time = 0;
    var _max_name = '';
    var _failure = 0;
    
    var _page_name = '';
    var _page_start = 0;
    var _page_finish = 0;
    var _page_load = 0;

    var _rspstatus = null;

    var _request_ok = 0;   // 请求成功次数
    var _request_time = 0;
    
    this.setPageStart = function(starttime){
        _page_start = Number(starttime);
    }
    
    this.setPageFinish = function(finishtime){
        _page_finish = Number(finishtime);
        _page_load = Number(_page_finish - _page_start);
    }

    this.setPageStatus = function(pagestatus){
        _rspstatus = pagestatus;
    }
    
    this.setName = function(name){
        _page_name = name;
    }
    
    
    this.setRequestSuccess = function(requesttime){
        _request_ok = requesttime;
    }
    
    this.setRequestTotal = function(request){
        _request_time = request;
    }
    
    /**
     * put key and value(obj) to entry ,inc totletime if uri had requested
     */
    this.put = function(key, aobj){
        if (!this.containsKey(key)) {
            _size++;
            _entry[key] = aobj;
        }
        else {
            (this.get(key)).incRequest();//只记录重连次数 不对时间进行统计 目前的
        }
    }
    
    //	get from key to value  key 根据key得到当前对应的object
    this.get = function(key){
        return this.containsKey(key) ? _entry[key] : null;
    }
    
    //	remove key--obj
    this.remove = function(key){
        if (this.containsKey(key) && (delete _entry[key])) {
            _size--;
        }
    }
    
    this.getAverage = function(){
        if (this._average == 0) {
            alert("均值还未设置");
        }
        return this._average;
    }
    
    //put the finish time to obj
    this.setValue = function(key, finishtime){
        var obj = this.get(key);
        obj.putFinishTime(finishtime);
    }
    
    //put the finish Status to obj
    this.setRspValue = function(key, resstatus){
        var obj = this.get(key);
        obj.putRspStatus(resstatus);
    }
    
    
    //look for key
    this.containsKey = function(key){
        return (key in _entry);
    }
    
    //return all values
    this.values = function(){
        var values = new Array();
        for (var prop in _entry) {
            values.push(_entry[prop]);
        }
        return values;
    }
    
    //return all keys
    this.keys = function(){
        var keys = new Array();
        for (var prop in _entry) {
            keys.push(prop);
        }
        return keys;
    }
    
    //return entry size
    this.size = function(){
        return _size;
    }
    
    
    //分类 计算相关数据
    this.infoResult = function(){
        var max_time = 0;
        var max_name = '';
        var sum = 0;
        //for average
        for (var prop in _entry) {
            var loadtime = _entry[prop].getLoadTime();
            if (loadtime != undefined) {
                sum += loadtime;
                if (loadtime > max_time) {
                    max_time = loadtime;
                    max_name = _entry[prop].getName();
                }
            }
            else {
                _failure++;
            }
        }
        
        _max_time = max_time;
        _max_name = max_name;
        _average = Number(Number(sum) / Number(_size)).toFixed(3);
        sum = 0;
        
        //for dx
        for (var prop in _entry) {
            var loadtime = _entry[prop].getLoadTime();
            if (loadtime != undefined) {
                var temp = Number(loadtime - _average);
                sum += temp * temp;
            }
        }
        _dx = Number(sum / Number(_size)).toFixed(3);
        
        
        var temp_entry = new Object();
        for (var i = 0; i < _size;) {
        
            temp_max_value = -1;
            temp_max_name = '';
            for (var index in _entry) {
                var loadtime = _entry[index].getLoadTime();
                if ((loadtime != undefined) && (loadtime > temp_max_value)) {
                    temp_max_value = loadtime;
                    temp_max_name = index;
                }
            }
            
            if (temp_max_value > -1) {
                var temp_obj = new objvalue();
                temp_obj.objvalue(_entry[temp_max_name].getName(), _entry[temp_max_name].getStartTime());
                temp_obj.putFinishTime(Number(_entry[temp_max_name].getFinishTime()));
                temp_obj.putRspStatus(_entry[temp_max_name].getRspStatus());
                temp_obj.setRequest(_entry[temp_max_name].getTotleRequest());
                temp_entry[temp_max_name] = temp_obj;
                this.remove(temp_max_name);
                i = i + 1;
            }
            else {
                break;
            }
        }

        tempresult = '';
        for (var prop in temp_entry) {
            tempresult += prop + "=>" + temp_entry[prop].getLoadTime() + "\n";
        }

        for (var prop in temp_entry) {
            _entry[prop] = temp_entry[prop];
        }
    }
    
    // print the all result format by myself
    this.printResult1 = function() {
        // 加入后面的sortResult()	
        var result = "\nResult:all request informatin ...\n";
        
        for (var prop in _entry) {
            result += _entry[prop].getContent();
        }
        
        result += '\n';
        
        return result;
    }
    
    this.printResult2 = function() {
        this.infoResult();

        var result = '';
        result += "\nURL:" + _page_name + "<loadtime :" + _page_load + " ms>";

        if (_request_ok == _request_time) {
            result += "<Request:" + _request_ok + ">\n";
        }
        else {
            result += "<Request:" + _request_time + " success:" + _request_ok + ">\n";
        }
        
        result += 'MaxName:' + _max_name + ' MaxTime:' + _max_time + " ms\n"
                         +"AverageTime:" + _average + " ms && dx = " + _dx + "\n";
        
        for (var prop in _entry) {
            result += _entry[prop].getContent2();
        }
        
        return result;
    }
    
    this.clear = function(){
        _size = 0;
        _dx = 0;
        _average = 0;
        _max_time = 0;
        _max_name = null;
        _entry = null;
        _entry = new Object();
        _failure = 0;
        
        _page_name = null;
        _page_finish = 0;
        _page_start = 0;

        _rspstatus = null;
        
        _request_ok = 0;
        _request_time = 0;
    } 
}


// xulrunner 层面上认定链接的重要程度
function checkRequest(str_req){
    var lastname = str_req.substring(str_req.lastIndexOf(".") + 1, str_req.length);
    
    switch (lastname) {
        case 'jpg':{ //alert('jpg');
            return 1;
            break;
        }
        case 'png':{ //alert('png');
            return 2;
            break;
        }
        case 'gif':{ //alert('gif');
            return 3;
            break;
        }
        case 'css':{ //alert('css');
            return 14;
            break;
        }
        case 'js':{ //alert('js');
            return 12;
            break;
        }
        case 'com/':{ //alert('com');
            return 16;
            break;
        }
        case 'com':{ //alert('com');
            return 16;
            break;
        }
        default:{ //alert('other');
            return 9;
        }
    }
    
    alert(str_req.substring(str_req.lastIndexOf(".") + 1, str_req.length));
    
    return 1;
}

