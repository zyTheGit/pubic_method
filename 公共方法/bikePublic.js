/**
*auther=zy
*version=1.0.0
*基于jquery
*ie8及以下浏览器不支持
**/

/**
*多码cookie值储存字段
*无牌车            MultiCodeNoPlateCar
*临时车            MultiCodeTempCar
*月租车            MultiCodeMothlyCar
*储值车            MultiCodeStockCar
*开闸状态          MultiCodeOpenGateCode
*锁车状态          MultiCodeLockCarStatus
*是否开启锁车功能   MultiCodeIsNoLockCar
*用户信息          MultiCodeUser
*NoticeID         MuliCodeNoticeId
*通道编号入口       MultiCodeChannelIndex
*通道编号出口       MultiCodeChannelIndexOut
*车辆类型          MultiCodeVehicleType  （2为无牌车）
*无牌车是否已预支付  MuliCodeIsNoPlatePrePayVehicle
*月租车密码        MuliCodeMonthPassword
**/

(function () {
    var BikePublic = {
        debug: true,//生产模式true，开发模式false
        logStorage: false,//日志是否存储在本地(包含ajax请求信息，和cookie信息)
        logStorageFixed: false,
        clearInfoTime: null,
        requestInterfaceUrl: {
            advertisement: window.location.origin + "/AdvertisingManager/GetAdvertisingManager",//获取广告路径
            log: window.location.origin + "/Logs/Log",//打印日志
        },
        data: {
            ajaxRequestInfoList: [],//储存ajax请求列表信息记录
            cookieInfo: [],//储存cookie
            valIndex: 0,//键盘标识符
        },
        init: function () {
            BikePublic.builtMethdsLog.giveBikePublicDataValue();
        },
        pageStroge: {
            setCookie: function (c_name, value, expiredays) {
                //设置Cookie
                if (!BikePublic.bindMethds.isNoParamIncorrect(c_name)) {
                    throw new Error(c_name);
                    return false;
                }
                if (!value && value != 0) value = "";
                var exdate = new Date();
                var domain = BikePublic.pageStroge.getCookieDomain();
                exdate.setDate(exdate.getDate() + expiredays);
                var expires = exdate.toGMTString();
                document.cookie = c_name + "=" + escape(value) + ";domain=" + domain + ";path=/" +
                ((expiredays == null) ? "" : ";expires=" + expires);
                BikePublic.builtMethdsLog.saveCookieInfo(c_name, value, domain, expiredays)
            },
            getCookie: function (name) {
                //获取Cookie
                if (!BikePublic.bindMethds.isNoParamIncorrect(name)) {
                    throw new Error(name);
                    return false;
                }
                var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
                if (arr = document.cookie.match(reg)) {
                    return unescape(arr[2]);
                }
                else {
                    return null;
                }
            },
            delCookie: function (name) {
                //删除Cookie
                if (!BikePublic.bindMethds.isNoParamIncorrect(name)) return false;
                this.setCookie(name, "", -1);
            },
            getCookieDomain: function () {
                //获取cookie的Domain
                var host = location.hostname;
                var ip = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;
                if (ip.test(host) === true || host === 'localhost') return host;
                var regex = /([^]*).*/;
                var match = host.match(regex);
                if (typeof match !== "undefined" && null !== match) host = match[1];
                if (typeof host !== "undefined" && null !== host) {
                    var strAry = host.split(".");
                    if (strAry.length > 1) {
                        host = strAry[strAry.length - 2] + "." + strAry[strAry.length - 1];
                    }
                }
                return '.' + host;
            },
            setLocalStorage: function (name, value) {
                window.localStorage.setItem(name, value);
            },
            getLocalStorage: function (name) {
                return window.localStorage.getItem(name);
            },
            delLocalStorge: function (name) {
                this.setLocalStorage(name, "");
            },
            clearAllLocalStorag: function () {
                window.localStorage.clear();
            }
        },
        bindMethds: {
            dialogMsg: function (msg, icon, time) {
                //dialog提示（dialog插件的）
                if (!this.isNoParamIncorrect(msg)) {
                    throw new Error(msg);
                    return false;
                }
                var closeTime = (!!time) ? time : 2000;
                var newIcon = icon == "loading" ? icon + ".gif" : icon + ".png";
                var infoIcon = '../Script/img/' + newIcon;//"success","error","loading"
                if (!$.dialog) return false;
                $.dialog({
                    type: 'info',
                    infoText: msg,
                    infoIcon: infoIcon,
                    autoClose: closeTime
                });
            },
            dialogConfirm: function (params) {
                /**
                *   var params = {
                *       title:"",
                *       contentHtml: "",
                *       okBtnName: "",
                *       cancelBtnName: "",
                *       confirmBtn: "",
                *       cancelBtn:""
                *   }
                **/
                if (!this.isNoParamIncorrect(params)) {
                    throw new Error(params);
                    return false;
                }
                if (!$.dialog) return false;
                $.dialog({
                    type: 'confirm',
                    buttonText: {
                        ok: !!params.okBtnName ? params.okBtnName : "确认",
                        cancel: !!params.cancelBtnName ? params.cancelBtnName : "取消"
                    },
                    titleText: !!params.title ? params.title : "信息提示",
                    onClickOk: function () {
                        params.confirmBtn && params.confirmBtn();
                    },
                    onClickCancel: function () {
                        params.cancelBtn && params.cancelBtn();
                    },
                    contentHtml: params.contentHtml
                });
            },
            jsonGetDateTime: function (jsondate) {
                //将json时间转换日期
                if (!this.isNoParamIncorrect(jsondate)) {
                    throw new Error(jsondate);
                    return false;
                };
                var date = new Date(parseInt(jsondate.replace("/Date(", "").replace(")/", ""), 10));
                var month = date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1;
                var day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();

                var hours = date.getHours();
                var min = date.getMinutes();
                var seconds = date.getSeconds();

                hours = (hours < 10) ? "0" + hours : hours;
                seconds = (seconds < 10) ? "0" + seconds : seconds;
                min = (min < 10) ? "0" + min : min;
                return date.getFullYear() + "-" + month + "-" + day + " " + hours + ":" + min + ":" + seconds;
            },
            getRequest: function () {
                //url请求参数获取
                var loc = window.location;
                var url = loc.href; //获取url中"?"符后的字串
                var theRequest = new Object();
                if (url.indexOf("?") != -1) {
                    var str = url.substr(url.indexOf("?") + 1);
                    var strs = str.split("&");
                    if (!strs) strs = str.split("");
                    for (var i = 0; i < strs.length; i++) {
                        theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
                    }
                }
                return theRequest;
            },
            getBrowserType: function () {
                //判断什么浏览器
                var ua = window.navigator.userAgent.toLowerCase();
                //判断是不是微信
                if (ua.match(/MicroMessenger/i) == 'micromessenger') {
                    return "weixin";
                }
                //判断是不是支付宝
                if (ua.match(/AlipayClient/i) == 'alipayclient') {
                    return "alipay";
                }
                return false;
            },
            closeBrowser: function (timerValue) {
                //关闭微信或者支付宝浏览器
                var timerValue = (!!timerValue) ? timerValue : 2000;
                var ua = navigator.userAgent.toLowerCase();
                var myBrowserVal = this.getBrowserType();
                if (myBrowserVal == "weixin") {
                    setTimeout(function () {
                        WeixinJSBridge.call('closeWindow');
                    }, timerValue);
                } else if (myBrowserVal == "alipay") {

                    setTimeout(function () {
                        AlipayJSBridge.call('closeWebview');
                    }, timerValue);
                }
                else if (!myBrowserVal) {
                    setTimeout(function () {
                        window.close();
                    }, timerValue);
                }
            },
            toLowerCase: function (element, elementValueType) {
                //返回字符串转为全小写
                var elementValueType = (!!elementValueType) ? elementValueType : "innerText";
                var eleDom = document.querySelector(element);
                switch (elementValueType) {
                    case ("innerText" || "text"):
                        return eleDom.innerText.toLowerCase();
                    case ("val" || "value"):
                        return eleDom.value.toLowerCase();
                    case ("innerHTML" || "html"):
                        return eleDom.innerHTML.toLowerCase();
                }
            },
            getCurrentTime: function (milliSeconds) {
                //获取当前时间
                var date = new Date();
                var seperator1 = "-";
                var seperator2 = ":";
                var month = date.getMonth() + 1;
                var strDate = date.getDate();
                var hours = date.getHours();
                var min = date.getMinutes();
                var seconds = date.getSeconds();
                var getMilliseconds = date.getMilliseconds();
                getMilliseconds = !!milliSeconds ? "." + getMilliseconds : "";
                hours = (hours < 10) ? "0" + hours : hours;
                seconds = (seconds < 10) ? "0" + seconds : seconds;
                min = (min < 10) ? "0" + min : min;
                if (month >= 1 && month <= 9) {
                    month = "0" + month;
                }
                if (strDate >= 0 && strDate <= 9) {
                    strDate = "0" + strDate;
                }
                var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate + " " + hours + ":" + min + ":" + seconds + getMilliseconds;
                return currentdate;
            },
            buildInTimeConversion: function (time) {
                //内置时间转换
                //eg:2018-10-26T09:15:23.006....
                if (!this.isNoParamIncorrect(time)) {
                    throw new Error(time);
                    return false;
                };
                return time.substr(0, 19).replace("T", " ");
            },
            isNoParamIncorrect: function (value) {
                if (value == "" || value == "null" || value == "undefined") {
                    console.log("%c 参数为空或者有误:" + value, "color:red");
                    return false;
                }
                return value;
            }
        },
        dataOperating: {
            //数据操作
            ajaxRequest: function (params) {
                /**
                 *ajax请求
                 * params结构
                 * var params = {
                 *     url: url,            //必填项
                 *     param: param,
                 *     async:true,
                 *     type:"post",
                 *     successCallback: successCallback,
                 *     beforeCallback: beforeCallback,
                 *     errorCallback: errorCallback,
                 *     completeCallback:completeCallback
                 **/
                if (!params.url) {
                    console.log("%c ajax请求url地址为空 \n", "color:red");
                    return false;
                }
                BikePublic.builtMethdsLog.getAjaxDynamic(params.url, params.param, "准备执行ajax请求...");
                $.ajax({
                    url: params.url,
                    data: params.param,
                    type: !!params.type ? params.type : "post",
                    async: !!params.async ? params.async : true,
                    beforeSend: function (e) {
                        if (BikePublic.debug) console.info({
                            requestUrl: params.url,
                            requestData: params.param,
                            step: "执行beforeSend方法"
                        });
                        BikePublic.builtMethdsLog.getAjaxDynamic(params.url, params.param, "beforeSend");
                        params.beforeCallback && params.beforeCallback();
                    },
                    success: function (result) {
                        if (BikePublic.debug) console.info({
                            requestUrl: params.url,
                            requestData: params.param,
                            step: "执行success方法",
                            responseData: result
                        });
                        BikePublic.dataOperating.backstageLog({
                            Levels: 1,
                            Describe: "请求" + params.url + "成功",
                            Message: JSON.stringify({
                                data: params.param,
                                result: result
                            })
                        });
                        BikePublic.builtMethdsLog.getAjaxDynamic(params.url, params.param, "success", result);
                        params.successCallback && params.successCallback(result);
                    },
                    error: function (ev) {
                        if (BikePublic.debug) console.info({
                            requestUrl: params.url,
                            requestData: params.param,
                            step: "执行error方法",
                            errorInfo: JSON.stringify(ev.response)
                        });
                        BikePublic.dataOperating.backstageLog({
                            Levels: 3,
                            Describe: "请求" + params.url + "失败",
                            Message: JSON.stringify({
                                data: params.param,
                                result: ev.response.substring(0, 1000)
                            })
                        });
                        BikePublic.builtMethdsLog.getAjaxDynamic(params.url, "error", ev.response);
                        params.errorCallback && params.errorCallback(ev);
                    },
                    complete: function () {
                        params.completeCallback && params.completeCallback();
                    }
                })
            },
            backstageLog: function (value) {
                //后台日志方法
                if (!BikePublic.requestInterfaceUrl.log) return false;
                $.ajax({
                    url: BikePublic.requestInterfaceUrl.log,
                    type: "post",
                    data: {
                        param: value
                    }
                })
            },
            receptionLog: function () {
                //前台日志（cookie）
                getMultiCodeCookie();
                var logUl = document.createElement("ul");
                var cookieLog = BikePublic.data.cookieInfo;
                var liBtn = document.createElement("li");
                var html = "";
                logUl.className = "cookieJsonLog";
                logUl.style.cssText += "width:100%;overflow:auto;min-height:8rem;verflow:auto;position:absolute;z-index:1000000;left:0;top:0;padding:10px;font-size:1.6rem;box-sizing:box-border;background-color:#fff;";
                liBtn.style.cssText += "height:4rem;";
                for (var i = 0, cookieLogLen = cookieLog.length; i < cookieLogLen; i++) {
                    var index = JSON.stringify(cookieLog[i]);
                    html += "<li>" + index + "</li><hr/>";
                }
                logUl.innerHTML = html;//cookie日志
                liBtn.innerHTML = "<button class='clear_cookie'>清除缓存</button>&nbsp&nbsp&nbsp&nbsp<button class='cancel_cookie'>取消</button>";
                logUl.appendChild(liBtn);
                document.body.appendChild(logUl);
            }
        },
        builtMethdsLog: {
            //内置打印日志方法
            getAjaxDynamic: function (url, requestData, requestStep, msg) {
                //获取ajax请求信息(打印ajax日志)
                var requestInfo = {};
                requestInfo.time = BikePublic.bindMethds.getCurrentTime(true);
                requestInfo.step = requestStep;//请求步骤
                requestInfo.requestData = requestData;
                requestInfo.msg = !!msg ? msg : null;
                this.insertThisSameUrl(url, requestInfo);
            },
            insertThisSameUrl: function (url, requestInfo) {
                //将相同的ajax请求放入一个数组中(打印ajax日志)
                var isNoRepeat = true;
                var ajaxInfoList = BikePublic.data.ajaxRequestInfoList;
                if (ajaxInfoList.length > 0) {
                    for (var i = 0; i < ajaxInfoList.length; i++) {
                        var ajaxUrl = ajaxInfoList[i].ajaxUrl;
                        if (ajaxUrl == url) {
                            isNoRepeat = false;
                            ajaxInfoList[i].ajaxDetailedInfo = [];
                            ajaxInfoList[i].ajaxDetailedInfo.push(requestInfo);
                        }
                    }
                }
                if (isNoRepeat) {
                    var array = [];
                    var obj = {};
                    obj.ajaxUrl = url;
                    array.push(requestInfo);
                    obj.ajaxDetailedInfo = array;
                    ajaxInfoList.push(obj);
                }
                if (!BikePublic.logStorageFixed) return false;
                BikePublic.pageStroge.setLocalStorage("AjaxRequestInfoStorge", JSON.stringify(ajaxInfoList));
            },
            saveCookieInfo: function (cookieName, cookieValue, cookieDomain, cookieDay) {
                //储存cookie信息
                if (!BikePublic.bindMethds.isNoParamIncorrect(cookieName)) {
                    throw new Error(cookieName);
                    return false;
                }
                if (!BikePublic.bindMethds.isNoParamIncorrect(cookieValue)) {
                    cookieValue = "";
                }
                this.isNoCookieRepeat(cookieName, cookieValue, cookieDomain, cookieDay);
            },
            isNoCookieRepeat: function (cookieName, cookieValue, cookieDomain, cookieDay) {
                //储存cookie信息
                var isNoRepeat = true;//判断日志里是否已有重复的cookie
                var cookieList = BikePublic.data.cookieInfo;
                if (cookieList.length <= 0) {
                    var obj = {
                        cookieName: cookieName,
                        cookieValue: cookieValue,
                        cookieDomain: !!cookieDomain ? cookieDomain : "",
                        cookieDays: !!cookieDay ? cookieDay : "",
                        cookiePath: ""
                    };
                    BikePublic.data.cookieInfo.push(obj);
                } else {
                    for (var i = 0; i < cookieList.length; i++) {
                        var name = cookieList[i].cookieName;
                        if (name == cookieName) {
                            isNoRepeat = false;
                            cookieList[i].cookieName = cookieName;
                            cookieList[i].cookieValue = cookieValue;
                            cookieList[i].cookieDomain = !!cookieDomain ? cookieDomain : "";
                            cookieList[i].cookieDays = !!cookieDay ? cookieDay : "";
                            cookieList[i].cookiePath = "";
                        }
                    }
                    if (isNoRepeat) {
                        var obj = {
                            cookieName: cookieName,
                            cookieValue: cookieValue,
                            cookieDomain: !!cookieDomain ? cookieDomain : "",
                            cookieDays: !!cookieDay ? cookieDay : "",
                            cookiePath: ""
                        };
                        BikePublic.data.cookieInfo.push(obj);
                    }
                }
                if (!BikePublic.logStorageFixed) return false;
                BikePublic.pageStroge.setLocalStorage("CookieInfoStorge", JSON.stringify(BikePublic.data.cookieInfo));
            },
            giveBikePublicDataValue: function () {
                //如果日志储存在本地直接获取
                if (!BikePublic.logStorageFixed) return false;
                var cookieInfoStorge = BikePublic.pageStroge.getLocalStorage("CookieInfoStorge");
                var ajaxRequestInfoStorge = BikePublic.pageStroge.getLocalStorage("AjaxRequestInfoStorge");
                if (!cookieInfoStorge) {
                    BikePublic.data.cookieInfo = [];
                } else {
                    BikePublic.data.cookieInfo = JSON.parse(cookieInfoStorge);
                }
                if (!!ajaxRequestInfoStorge) {
                    BikePublic.data.ajaxRequestInfoList = JSON.parse(ajaxRequestInfoStorge);
                }
            },
            createInfoPage: function () {
                //创建缓存界面
                var isNoExistence = document.querySelector(".infoShow");
                var ul = document.createElement("ul");
                var ajaxInfo = BikePublic.pageStroge.getLocalStorage("AjaxRequestInfoStorge");
                var cookieInfo = BikePublic.pageStroge.getLocalStorage("CookieInfoStorge");
                var html = "";
                if (!!ajaxInfo) {
                    ajaxInfo = JSON.parse(ajaxInfo);
                }
                if (!!cookieInfo) {
                    cookieInfo = JSON.parse(cookieInfo);
                }
                if (!isNoExistence) {
                    isNoExistence = document.createElement("div");
                    isNoExistence.className = "infoShow";
                } else {
                    isNoExistence.innerHTML = "";
                }
                isNoExistence.style.cssText += 'position: absolute;left: 0;top: 0;width: 100%;height: 100%;background-color: rgba(0,0,0,.8);z-index: 100000;font-size:12px;';
                ul.style.cssText += 'background-color: #fff;text-align: left;padding: .8rem;';
                for (var i = 0; i < ajaxInfo.length; i++) {
                    var ajaxInfoIndex = ajaxInfo[i];
                    if (!ajaxInfoIndex) break;
                    for (var key in ajaxInfoIndex) {
                        if (ajaxInfoIndex.hasOwnProperty(key)) {
                            html += "<li style='padding: .3rem .3rem 0;'><span>" + key + "</span>:<span style='color: red;'>" + JSON.stringify(ajaxInfoIndex[key]) + "</span></li>";
                        }
                    }
                }
                for (var i = 0; i < cookieInfo.length; i++) {
                    var cookieName = cookieInfo[i].cookieName;
                    var cookieValue = cookieInfo[i].cookieValue;
                    html += "<li style='padding: .3rem .3rem 0;' class='cookieLi'><span>" + cookieName + "</span>:<span style='color: red;'>" + cookieValue + "</span></li>";
                }
                ul.innerHTML = html + "<li><button style='margin-right: 1rem;cursor: pointer;' class='clearAllCookie'>清除缓存</button><button style='margin-right: 1rem;cursor: pointer;' class='closePage'>关闭</button></li>";
                isNoExistence.appendChild(ul);
                document.body.appendChild(isNoExistence);
            }
        }
    }

    Object.defineProperty(BikePublic, 'logStorage', {
        set: function (newVal) {
            if (newVal) {
                BikePublic.logStorageFixed = newVal;
                BikePublic.init();
            } else {
                BikePublic.data.ajaxRequestInfoList = [];
                BikePublic.data.cookieInfo = [];
                BikePublic.pageStroge.setLocalStorage("AjaxRequestInfoStorge", "");
                BikePublic.pageStroge.setLocalStorage("CookieInfoStorge", "");
            }
        },
        get: function () {
            return logStorage;
        }
    })

    //去掉波浪线
    $("input").attr("spellcheck", false);

    $(".receptionLog").on("touchstart", function (e) {
        BikePublic.clearInfoTime = setTimeout("BikePublic.dataOperating.receptionLog()", 3000);
        e.preventDefault();
    })

    $(".receptionLog").on("touchend", function () {
        clearTimeout(BikePublic.clearInfoTime);
        return false;
    })

    //清除页面缓存
    $(document).on("click", ".clear_cookie", function () {
        multiCodeDelCookieNeed(function () {
            alert("清除成功");
        });

    });
    //关闭日志页面
    $(document).on("click", ".cancel_cookie", function () {
        $(".cookieJsonLog").hide();
    });
    window.BikePublic = BikePublic;
})();

function AdvertEvent() {
    this.startPos = {};//开始位置
    this.endPos = {};//结束位置
    this.scrollDirection;//滚动方向
    this.touch;//记录触碰节点
    this.index = 0;//记录滑动到第几张图片
    this.oImg = "";
    this.oCircle = "";
    this.aCircle = "";
    this.ImgWidth;//图片宽度
    this.target;//目标
    this.autoTime = "";
    this.imgHrefList = [];//广告链接列表（必填项）
    this.advertLen = 0;//广告的个数
    this.loadedimages = 0;
}
AdvertEvent.prototype = {
    constructor: this,
    //生成广告盒子
    createAdvertBox: function (autoTimeSwitch) {
        //imgHrefList返回的广告链接列表（必填项）
        //autoTimeSwitch轮播时间，int单位毫秒（非必填项,默认2000毫秒）
        var advertDom = document.querySelector(".advertAlert");
        var ulImg = document.createElement("ul");
        var ulActive = document.createElement("ul");
        var imgHrefList = this.imgHrefList;
        var pTitle = document.createElement("p");
        var span = document.createElement("span");
        pTitle.appendChild(span);
        advertDom.appendChild(pTitle);
        span.innerHTML = "您可能感兴趣";
        ulImg.className = "advertBox";
        ulActive.className = "circle";
        if (!!imgHrefList) {
            var htmlImg = "";
            var htmlActive = "";
            var endHtml = "";
            var startHtml = "";
            this.advertLen = imgHrefList.length;
            advertDom.style.display = "block";
            this.imgLoading(imgHrefList, ulImg, ulActive, advertDom, autoTimeSwitch);
        } else {
            advertDom.style.display = "none";
        }
    },
    //事件启动
    touchEvent: function (autoTimeSwitch) {
        var This = this;
        this.autoBroadcast(autoTimeSwitch);
        this.oImg.addEventListener("touchstart", function (event) {
            This.touch = event.targetTouches[0];//取得第一个touch的坐标值
            This.startPos = { x: This.touch.pageX, y: This.touch.pageY }
            This.scrollDirection = 0;
            clearInterval(This.autoTime);
        })
        this.oImg.addEventListener("touchmove", function (event) {
            // 如果有多个地方滑动，就不发生这个事件
            if (event.targetTouches.length > 1) {
                return
            }
            This.touch = event.targetTouches[0];
            This.endPos = { x: This.touch.pageX, y: This.touch.pageY }
            // 判断出滑动方向，向右为1，向左为-1
            This.scrollDirection = This.touch.pageX - This.startPos.x > 0 ? 1 : -1;
        })
        this.oImg.addEventListener("touchend", function (event) {

            if (This.scrollDirection == 1) {
                //右移
                document.querySelector(".advertAlert .advertBox").style.transitionDuration = ".5s";
                if (This.index >= 1 && This.index <= This.aCircle.length - 1) {
                    This.index--;
                }
                else {
                    This.index = This.aCircle.length - 1;
                    document.querySelector(".advertAlert .advertBox").style.transitionDuration = "0s";
                }
            }
            else if (This.scrollDirection == -1) {
                //左移
                document.querySelector(".advertAlert .advertBox").style.transitionDuration = ".5s";
                if (This.index >= 0 && This.index <= This.aCircle.length - 2) {
                    This.index++;
                }
                else {
                    document.querySelector(".advertAlert .advertBox").style.transitionDuration = "0s";
                    This.index = 0;
                }
            }
            This.slide();
            This.autoBroadcast(autoTimeSwitch);
        })
    },
    //广告位手动切换
    slide: function () {
        for (var i = 0; i < this.aCircle.length; i++) {
            this.aCircle[i].className = '';
        }
        this.aCircle[this.index].className = 'active';
        this.ImgWidth = parseInt(this.oImg.offsetWidth / this.aCircle.length);
        this.target = -this.ImgWidth * this.index;

        this.oImg.style.left = this.target + "px";
    },
    //广告位自动切换
    autoBroadcast: function (autoTimeSwitch) {
        if (this.advertLen <= 1) return false;
        var This = this;
        var autoTimeSwitch = (!!autoTimeSwitch) ? autoTimeSwitch : 2000;
        this.autoTime = setInterval(function () {
            if (This.index >= This.aCircle.length - 1) {
                document.querySelector(".advertAlert .advertBox").style.transitionDuration = "0s";
                This.index = 0;
            } else {
                document.querySelector(".advertAlert .advertBox").style.transitionDuration = ".5s";
                This.index++;
            }
            for (var i = 0; i < This.aCircle.length; i++) {
                This.aCircle[i].className = '';
            }
            This.aCircle[This.index].className = 'active';
            This.oImg.style.left = -parseInt(This.oImg.offsetWidth / This.aCircle.length) * This.index + "px";
        }, autoTimeSwitch)
    },
    //图片预加载
    imgLoading: function (imgHrefList, ulImg, ulActive, advertDom, autoTimeSwitch) {
        var newimages = [];
        var liTips = [];
        var lis = [];
        var This = this;
        for (var i = 0; i < imgHrefList.length; i++) {
            lis[i] = document.createElement("li");
            liTips[i] = document.createElement('li');
            newimages[i] = new Image();
            newimages[i].src = imgHrefList[i].ImageHttpUrl;
            newimages[i].onload = function () {
                This.loadedimages++;
                This.imgSuccess(newimages, lis, liTips, imgHrefList, ulImg, ulActive, advertDom, autoTimeSwitch)
            }
            newimages[i].onerror = function () {
                This.loadedimages++;
                This.imgSuccess(newimages, lis, liTips, imgHrefList, ulImg, ulActive, advertDom, autoTimeSwitch)
            };
        }

    },
    //图片加载完执行
    imgSuccess: function (newimages, lis, liTips, imgHrefList, ulImg, ulActive, advertDom, autoTimeSwitch) {
        for (var j = 0; j < newimages.length; j++) {
            lis[j].appendChild(newimages[j]);
            ulImg.appendChild(lis[j]);
            if (imgHrefList.length > 1) {
                liTips[j].setAttribute("index", j);
                ulActive.appendChild(liTips[j]);
            }
            advertDom.appendChild(ulImg);
            advertDom.appendChild(ulActive);
        }
        if (this.loadedimages == imgHrefList.length) {
            this.addClass(document.querySelectorAll(".circle li")[0], "active");
            this.oImg = document.querySelector(".advertBox");
            this.oCircle = document.querySelector(".circle");
            this.aCircle = this.oCircle.getElementsByTagName("li");
            this.oImg.style.width = 100 * (imgHrefList.length) + "%";
            var liAdvert = document.querySelectorAll(".advertAlert .advertBox li");
            for (var k = 0; k < liAdvert.length; k++) {
                liAdvert[k].style.width = 100 / (imgHrefList.length) + "%";
            }
            this.touchEvent(autoTimeSwitch);

            this.setAllAdverBox();
        }

    },
    //移除广告事件
    removeAds: function (isNoCloseAdsBtn) {
        if (!!isNoCloseAdsBtn) {
            this.addClass(document.querySelector(".advertAlert .closeBtn"), "closeBtnHide");
            return false;
        }
        document.querySelector(".advertAlert .closeBtn").addEventListener("click", function () {
            document.querySelector(".advertAlert").style.display = "none";
        });
    },
    addClass: function (elements, cName) {
        if (!elements) return false;
        if (elements.className == "") {
            elements.className += cName;
        } else {
            elements.className += " " + cName;
        }
    },
    setAllAdverBox: function () {
        var advertAlertAll = document.querySelectorAll(".advertAlert");
        if (advertAlertAll.length > 1) {
            var html = document.querySelectorAll(".advertAlert")[0].innerHTML;
            for (var i = 0; i < advertAlertAll.length; i++) {
                advertAlertAll[i].innerHTML = html;
                advertAlertAll[i].style.display = "block";
            }
        }
    }
}
//getAdvertEvent();
//获取广告
function getAdvertEvent(cookieNoticeId) {
    //非机动车项目Id为BikeProjectID
    //多码项目Id为MultiCodeProjectId
    var timer = "";
    var adverEventUrl = BikePublic.requestInterfaceUrl.advertisement;
    var noticeId = BikePublic.pageStroge.getCookie(cookieNoticeId);
    if (!noticeId || noticeId == "undefind") {
        timer = setInterval(function () {
            noticeId = BikePublic.pageStroge.getCookie(cookieNoticeId);
        }, 1000)
        return false;
    } else {
        clearInterval(timer);
    }
    var params = {
        url: adverEventUrl,
        param: {
            noticeId: noticeId
        },
        successCallback: function (data) {
            if (!!data.data && data.data.length > 0) {
                var advertEvent = new AdvertEvent();
                advertEvent.imgHrefList = data.data;
                advertEvent.createAdvertBox();
            }
            return false;
        }
    };
    BikePublic.dataOperating.ajaxRequest(params);
}

//用户密码输入
function userPasswordInput(callback) {
    $(".numberKey").on("click", "li span", function () {
        var bindInpVal = $(".numberKey").attr("bindVal");//储存输入的验证码
        var index = Number($(".bindVal").attr("index"));
        var inputEle = $(".bindingCode input");
        var text = $(this).text();
        var inputEleLen = inputEle.length;
        if (text == "删除") {
            $(inputEle).eq(index).val("");
            if (!bindInpVal) {
                bindInpVal = "";
            } else {
                bindInpVal = bindInpVal.substring(0, bindInpVal.length - 1)
            }
            $(".numberKey").attr("bindVal", bindInpVal);
            if (index == 0) return;
            index--;
            $(inputEle).eq(index).siblings().removeClass("bindVal");
            $(inputEle).eq(index).addClass("bindVal");
            $(inputEle).eq(index).attr("index", index);
        }
        else if (text == "取消") {
            $(".bindVal").removeClass("bindVal");
            $(".bindingCode input").eq(0).addClass("bindVal");
            $(".numberKey").attr("bindVal", "");
            $(".checkCode").hide();
            $(".bindingCode input").val("");

            //键盘
            $(".confirmDisabled").attr("class", "confirm button");
        } else {
            if (index < inputEleLen - 1) {
                if ($(inputEle).eq(index).hasClass("bindVal")) {
                    if (!bindInpVal) {
                        bindInpVal = "";
                    }
                    bindInpVal += text;
                    $(inputEle).eq(index).val(text);
                    index++;
                    $(inputEle).eq(index).siblings().removeClass("bindVal");
                    $(inputEle).eq(index).addClass("bindVal");
                    $(inputEle).eq(index).attr("index", index);
                    $(".numberKey").attr("bindVal", bindInpVal);
                }
            } else {
                $(inputEle).eq(inputEleLen - 1).val(text);
                bindInpVal += text;
                $(".numberKey").attr("bindVal", bindInpVal);
                callback && callback();
            }
        }
    })
}
//用户密码输入初始化
function userPasswordInputInit() {
    $(".bindingCode input").val("");
    $(".numberKey").attr("bindVal", "");
    $(".bindingCode input").removeClass("bindVal");
    $(".bindingCode input").eq(0).addClass("bindVal");
}

//汽车键盘start
function getKeydownFocus() {
    var inputVal = $(".plate_input .input_Val");
    $('.KeyboradDiv input').eq(0).css('border', '.2rem solid green');
    for (var i = 0; i < inputVal.length; i++) {
        $(inputVal[i]).attr("index", i);
        $(inputVal).eq(i).click(function () {
            if ($(this).attr("index") == 0) {
                $("#hz_keyborad").attr("class", "Keyborad Disp");
                $("#zm_keyborad").attr("class", "Keyborad Hide")
            } else {
                $("#hz_keyborad").attr("class", "Keyborad Hide");
                $("#zm_keyborad").attr("class", "Keyborad Disp");
            }
            $(this).addClass("inputFocus");
            $(this).siblings().removeClass("inputFocus");
        })
    }
}
$(".Keyborad").on("click", ".key", function () {
    if ($(this).hasClass("space")) return;
    var inputVal = $(".plate_input .input_Val");
    var index = Number($(".inputFocus").attr("index"));
    $(".inputFocus").text($(this).text());
    index++;
    if (index == $(inputVal).length) {
        $(".keyBoradContent").attr("data-startSex", true);
        return false;
    }
    $(inputVal).eq(index).addClass("inputFocus");
    $(inputVal).eq(index).siblings().removeClass("inputFocus");
    if (index == 0) {
        $("#hz_keyborad").attr("class", "Keyborad Disp");
        $("#zm_keyborad").attr("class", "Keyborad Hide")
    } else {
        $("#hz_keyborad").attr("class", "Keyborad Hide");
        $("#zm_keyborad").attr("class", "Keyborad Disp");
    }
})
$(".Keyborad").on("click", ".space", function () {
    var inputVal = $(".plate_input .input_Val");
    var index = Number($(".inputFocus").attr("index"));
    var startSex = $(".keyBoradContent").attr("data-startSex");
    index--;
    if (index < 0) return;
    if (index == 0) {
        $("#hz_keyborad").attr("class", "Keyborad Disp");
        $("#zm_keyborad").attr("class", "Keyborad Hide");
    } else {
        $("#hz_keyborad").attr("class", "Keyborad Hide");
        $("#zm_keyborad").attr("class", "Keyborad Disp");
    }
    if (startSex == "true") {
        $(".keyBoradContent").attr("data-startSex", false);
    } else {
        $(inputVal).eq(index).addClass("inputFocus");
        $(inputVal).eq(index).siblings().removeClass("inputFocus");
    }
    $(".inputFocus").text("");

})
//汽车键盘end

//切换键盘新能源车牌start
$(".KeyboradDiv .switch").on("click", "span", function () {
    $(".switch span").css({
        "color": "#000",
        "border-bottom": "1px solid #fff"
    })
    var This = $(this);
    if ($(This).hasClass("Ordinary")) {
        $(This).css({
            "color": "#093",
            "border-bottom": "2px solid #093"
        })
        $(".keyBoradContent").show();
        $(".KeyboradDiv .box").hide();
    } else {
        $(".special").css({
            "color": "#093",
            "border-bottom": "2px solid #093"
        })
        $(".keyBoradContent").hide();
        $(".KeyboradDiv .box").show();
    }
})
$(".KeyboradDiv ul").on("click", "span", function () {
    var text = $(this).text();
    $('input').css('border', '.1rem solid #666');
    var val = BikePublic.data.valIndex;
    if (val < 8) {
        $(".KeyboradDiv input").eq(val).val(text);
        $('.KeyboradDiv input').eq(val).css('border', '.2rem solid green');
        $("#plateNumber").hide();
        $('#plateNumber1').show();
        val++;
        BikePublic.data.valIndex = val;
    } else {
        $('.KeyboradDiv input').eq(val - 1).css('border', '.2rem solid green');
        $(".KeyboradDiv input").eq(val - 1).val(text);
    }
})
//车牌号码删除
$(".KeyboradDiv .last").click(function () {
    var val = BikePublic.data.valIndex;
    $('.KeyboradDiv input').css('border', '.1rem solid #666');
    if (val > 0) {
        val--;
        BikePublic.data.valIndex = val;
        $(".KeyboradDiv input").eq(val).val("");
        $('.KeyboradDiv input').eq(val).css('border', '.2rem solid green');
        if (val == 0) {
            $("#plateNumber1").hide();
            $('#plateNumber').show();
        }
    }
})
$(".licensePlate").on("click", "input", function () {
    var index = $(this).index() - 1;
    BikePublic.data.valIndex = index;
    $('.KeyboradDiv input').css('border', '.1rem solid #666');
    $('.KeyboradDiv input').eq(index).css('border', '.2rem solid green');
})
//切换键盘新能源车牌end

//键盘确认
function keydownConfirm(callback) {
    var plate = "";
    var displayStatus = "";
    $(".confirm").attr("class", "confirmDisabled button");
    ($(".keyBoradContent").css("display") != "none") ? displayStatus = true : displayStatus = false;
    if (displayStatus) {
        var inputVal = $(".input_Val");
        var html = "";
        for (var i = 0, inputLen = inputVal.length; i < inputLen; i++) {
            html += $(inputVal[i]).text();
        }
        if (html.length != 7) {
            $.dialog({
                autoClose: 1500,
                contentHtml: '<p>请输入完整车牌</p>'
            });
            $(".confirmDisabled").attr("class", "confirm button");
            return false;
        } else {
            //普通车牌
            callback && callback(html);
        }
    } else {
        var inputVal = $(".licensePlate input");
        var html = "";
        for (var i = 0, inputLen = inputVal.length; i < inputLen; i++) {
            html += $(inputVal[i]).val();
        }
        if (html.length != 8) {
            $.dialog({
                autoClose: 1500,
                contentHtml: '<p>请输入完整车牌</p>'
            });
            $(".confirmDisabled").attr("class", "confirm button");
            return false;
        } else {
            //新能源车牌
            callback && callback(html);
        }

    }
}

//多码保证缓存只有一个车牌
function multiCodeSaveOnePlate(plateName, plate) {
    var time = !!time ? time : 730;
    switch (plateName) {
        case 'MultiCodeNoPlateCar':
            BikePublic.pageStroge.setCookie("MultiCodeNoPlateCar", plate, time);
            BikePublic.pageStroge.delCookie("MultiCodeTempCar");
            BikePublic.pageStroge.delCookie("MultiCodeStockCar");
            BikePublic.pageStroge.delCookie("MultiCodeMothlyCar");
            break;
        case 'MultiCodeTempCar':
            BikePublic.pageStroge.setCookie("MultiCodeTempCar", plate, time);
            BikePublic.pageStroge.delCookie("MultiCodeNoPlateCar");
            BikePublic.pageStroge.delCookie("MultiCodeStockCar");
            BikePublic.pageStroge.delCookie("MultiCodeMothlyCar");
            break;
        case 'MultiCodeStockCar':
            BikePublic.pageStroge.setCookie("MultiCodeStockCar", plate, time);
            BikePublic.pageStroge.delCookie("MultiCodeNoPlateCar");
            BikePublic.pageStroge.delCookie("MultiCodeTempCar");
            BikePublic.pageStroge.delCookie("MultiCodeMothlyCar");
            break;
        case 'MultiCodeMothlyCar':
            BikePublic.pageStroge.setCookie("MultiCodeMothlyCar", plate, time);
            BikePublic.pageStroge.delCookie("MultiCodeNoPlateCar");
            BikePublic.pageStroge.delCookie("MultiCodeTempCar");
            BikePublic.pageStroge.delCookie("MultiCodeStockCar");
            break;
    }
}

//多码获取车牌
function multiCodeGetPlateNumber() {
    var noPlate = BikePublic.pageStroge.getCookie("MultiCodeNoPlateCar");
    var tempCar = BikePublic.pageStroge.getCookie("MultiCodeTempCar");
    var stockCar = BikePublic.pageStroge.getCookie("MultiCodeStockCar");
    var mothlyCar = BikePublic.pageStroge.getCookie("MultiCodeMothlyCar");
    var vehicleType = BikePublic.pageStroge.getCookie("MultiCodeVehicleType");
    var isNoPlatePrePayVehicle = BikePublic.pageStroge.getCookie("MuliCodeIsNoPlatePrePayVehicle");
    if (!!noPlate) return {
        plate: noPlate,
        vehicleType: vehicleType,
        isNoPlatePrePayVehicle: isNoPlatePrePayVehicle
    };
    if (!!tempCar) return {
        plate: tempCar,
        vehicleType: vehicleType,
        isNoPlatePrePayVehicle: isNoPlatePrePayVehicle
    };
    if (!!stockCar) return {
        plate: stockCar,
        vehicleType: vehicleType,
        isNoPlatePrePayVehicle: isNoPlatePrePayVehicle
    };
    if (!!mothlyCar) return {
        plate: mothlyCar,
        vehicleType: vehicleType,
        isNoPlatePrePayVehicle: isNoPlatePrePayVehicle
    };
    if (!!isNoPlatePrePayVehicle) return {
        plate: noPlate,
        vehicleType: vehicleType,
        isNoPlatePrePayVehicle: isNoPlatePrePayVehicle
    };
    return {
        plate: "",
        vehicleType: "",
        isNoPlatePrePayVehicle: false
    };
}

//清除多码缓存
function multiCodeDelCookieNeed(callback) {
    BikePublic.pageStroge.delCookie("MultiCodeMothlyCar");
    BikePublic.pageStroge.delCookie("MultiCodeNoPlateCar");
    BikePublic.pageStroge.delCookie("MultiCodeTempCar");
    BikePublic.pageStroge.delCookie("MultiCodeStockCar");

    BikePublic.pageStroge.delCookie("MultiCodeOpenGateCode");
    BikePublic.pageStroge.delCookie("MultiCodeLockCarStatus");
    BikePublic.pageStroge.delCookie("MultiCodeIsNoLockCar");
    BikePublic.pageStroge.delCookie("MultiCodeUser");
    BikePublic.pageStroge.delCookie("MuliCodeNoticeId");

    BikePublic.pageStroge.delCookie("MultiCodeVehicleType");
    BikePublic.pageStroge.delCookie("MuliCodeIsNoPlatePrePayVehicle");
    BikePublic.pageStroge.delCookie("MuliCodeMonthPassword");

    callback && callback();
    BikePublic.bindMethds.closeBrowser();
}

//获取缓存
function getMultiCodeCookie() {
    var MultiCodeMothlyCar = BikePublic.pageStroge.getCookie("MultiCodeMothlyCar");
    var MultiCodeNoPlateCar = BikePublic.pageStroge.getCookie("MultiCodeNoPlateCar");
    var MultiCodeTempCar = BikePublic.pageStroge.getCookie("MultiCodeTempCar");
    var MultiCodeStockCar = BikePublic.pageStroge.getCookie("MultiCodeStockCar");

    var MultiCodeOpenGateCode = BikePublic.pageStroge.getCookie("MultiCodeOpenGateCode");
    var MultiCodeLockCarStatus = BikePublic.pageStroge.getCookie("MultiCodeLockCarStatus");
    var MultiCodeIsNoLockCar = BikePublic.pageStroge.getCookie("MultiCodeIsNoLockCar");
    var MultiCodeUser = BikePublic.pageStroge.getCookie("MultiCodeUser");
    var MuliCodeNoticeId = BikePublic.pageStroge.getCookie("MuliCodeNoticeId");

    var MultiCodeVehicleType = BikePublic.pageStroge.getCookie("MultiCodeVehicleType");
    var MuliCodeIsNoPlatePrePayVehicle = BikePublic.pageStroge.getCookie("MuliCodeIsNoPlatePrePayVehicle");
    var MuliCodeMonthPassword = BikePublic.pageStroge.getCookie("MuliCodeMonthPassword");
    var array = [
        { "MultiCodeMothlyCar": MultiCodeMothlyCar },
        { "MultiCodeNoPlateCar": MultiCodeNoPlateCar },
        { "MultiCodeTempCar": MultiCodeTempCar },
        { "MultiCodeStockCar": MultiCodeStockCar },
        { "MultiCodeLockCarStatus": MultiCodeLockCarStatus },
        { "MultiCodeIsNoLockCar": MultiCodeIsNoLockCar },
        { "MultiCodeUser": MultiCodeUser },
        { "MuliCodeNoticeId": MuliCodeNoticeId }
    ];
    for (var i = 0; i < array.length; i++) {
        var objIndex = array[i];
        var objKey = Object.keys(objIndex)[i];
        var objValue = array[i][objKey];
        BikePublic.builtMethdsLog.isNoCookieRepeat(objKey, objValue);
    }
}