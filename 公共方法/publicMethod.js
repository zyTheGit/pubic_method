//其中的MAP.arr是二维数组
function searchRoad(start_x, start_y, end_x, end_y) {
    var openList = [],    //开启列表
        closeList = [],   //关闭列表
        result = [],      //结果数组
        result_index;   //结果数组在开启列表中的序号

    //var b=[8,3];
    openList.push({ x: start_x, y: start_y, G: 0 });//把当前点加入到开启列表中，并且G是0

    do {
        var currentPoint = openList.pop();
        closeList.push(currentPoint);
        var surroundPoint = SurroundPoint(currentPoint);
        for (var i in surroundPoint) {
            var item = surroundPoint[i];
            //获得周围的八个点
            if (
                item.x >= 0 &&                            //判断是否在地图上
                item.y >= 0 &&
                item.x < OBJGLOBAL.MAP.rows &&
                item.y < OBJGLOBAL.MAP.cols &&
                OBJGLOBAL.MAP.arr[item.x][item.y] != 0 &&         //判断是否是障碍物
                !existList(item, closeList)) {        //判断是否在关闭列表中

                //g 到父节点的位置
                //如果是上下左右位置的则g等于10，斜对角的就是14
                var g = currentPoint.G + ((currentPoint.x - item.x) * (currentPoint.y - item.y) == 0 ? 10 : 14);
                if (!existList(item, openList)) {       //如果不在开启列表中
                    //计算H，通过水平和垂直距离进行确定
                    item['H'] = Math.abs(end_x - item.x) * 10 + Math.abs(end_y - item.y) * 10;
                    item['G'] = g;
                    item['F'] = item.H + item.G;
                    item['parent'] = currentPoint;
                    openList.push(item);
                }
                else {//存在在开启列表中，比较目前的g值和之前的g的大小
                    var index = existList(item, openList);
                    //如果当前点的g更小
                    if (g < openList[index].G) {
                        openList[index].parent = currentPoint;
                        openList[index].G = g;
                        openList[index].F = g + openList[index].H;
                    }
                }
            }
        }
        //如果开启列表空了，没有通路，结果为空
        if (openList.length == 0) {
            break;
        }
        openList.sort(sortF);//这一步是为了循环回去的时候，找出 F 值最小的, 将它从 "开启列表" 中移掉
    } while (!(result_index = existList({ x: end_x, y: end_y }, openList)));

    //判断结果列表是否为空
    if (!result_index) {
        result = [];
    }
    else {
        var currentObj = openList[result_index];
        do {
            //把路劲节点添加到result当中
            result.unshift({
                x: currentObj.x,
                y: currentObj.y
            });
            currentObj = currentObj.parent;
        } while (currentObj.x != start_x || currentObj.y != start_y);

    }
    return result;
}

//用F值对数组排序
function sortF(a, b) {
    return b.F - a.F;
}

//获取周围八个点的值
function SurroundPoint(curPoint) {
    var x = curPoint.x, y = curPoint.y;
    return [
        { x: x - 1, y: y - 1 },
        { x: x, y: y - 1 },
        { x: x + 1, y: y - 1 },
        { x: x + 1, y: y },
        { x: x + 1, y: y + 1 },
        { x: x, y: y + 1 },
        { x: x - 1, y: y + 1 },
        { x: x - 1, y: y }
    ]
}

//去掉相同的数组对象
function removal(arry) {
    var result = [], isRepeated;
    for (var i = 0, arryLength = arry.length ; i < arryLength; i++) {
        isRepeated = false;
        var arryX = arry[i].x;
        var arryY = arry[i].y;
        for (var j = 0, len = result.length; j < len; j++) {
            var resX = result[j].x;
            var resY = result[j].y;
            if (arryX == resX && arryY == resY) {
                isRepeated = true;
                break;
            }
        }
        if (!isRepeated) result.push(arry[i]);
    }
    return result;
}

//生成区域范围rows:列，cols:行
function multiArray(rows, cols) {
    var a = new Array(rows);
    for (var i = 0, l = a.length; i < l; i++) {
        a[i] = new Array(cols);
        for (var j = 0; j < cols; j++) {
            a[i][j] = 0;
        }
    }
    return a;
}

//判断点是否存在在列表中，是的话返回的是序列号
function existList(point, list) {
    for (var i in list) {
        if (point.x == list[i].x && point.y == list[i].y) {
            return i;
        }
    }
    return false;
}

//获取当前ip地址
function getHrefIp() {
    var href = window.location.href,
        b = /^\w+\:\/\/\/?[^\:]+/.exec(href)[0];
    if (!!b) {
        var url = b.replace(/^\w+\:\/\//g, "");
        return url;
    } else {
        console.log("ip地址为空")
        return false;
    }
    //return "192.168.0.155"
}
//获取当前浏览ip地址和端口
function getHtrefIpAndPort(){
    var ipPort = window.location.host;
    return ipPort;
}

//获取当前页面链接后的参数
function getRequestPa() {
    var loc = window.location;
    var url = loc.href; //获取url中"?"符后的字串
    var theRequest = new Object();
    if (url.indexOf("?") != -1) {
        var str = url.substr(url.indexOf("?") + 1);
        strs = str.split("&");
        for (var i = 0; i < strs.length; i++) {
            theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
        }
    }
    return theRequest;
}
//乘法计算
function accMul(arg1, arg2) {
    var m = 0, s1 = arg1.toString(), s2 = arg2.toString();
    try { m += s1.split(".")[1].length } catch (e) { }
    try { m += s2.split(".")[1].length } catch (e) { }
    return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m)
}
//加法 
function accAdd(arg1, arg2) {
    var r1, r2, m;
    try { r1 = arg1.toString().split(".")[1].length } catch (e) { r1 = 0 }
    try { r2 = arg2.toString().split(".")[1].length } catch (e) { r2 = 0 }
    m = Math.pow(10, Math.max(r1, r2))
    return (arg1 * m + arg2 * m) / m
}
//减法 
function Subtr(arg1, arg2) {
    var r1, r2, m, n;
    try { r1 = arg1.toString().split(".")[1].length } catch (e) { r1 = 0 }
    try { r2 = arg2.toString().split(".")[1].length } catch (e) { r2 = 0 }
    m = Math.pow(10, Math.max(r1, r2));
    n = (r1 >= r2) ? r1 : r2;
    return ((arg1 * m - arg2 * m) / m).toFixed(n);
}
//除法
function accDiv(arg1, arg2) {
    var t1 = 0, t2 = 0, r1, r2;
    try { t1 = arg1.toString().split(".")[1].length } catch (e) { }
    try { t2 = arg2.toString().split(".")[1].length } catch (e) { }
    with (Math) {
        r1 = Number(arg1.toString().replace(".", ""))
        r2 = Number(arg2.toString().replace(".", ""))
        return accMul((r1 / r2), pow(10, t2 - t1));
    }
}
//阻止事件冒泡
function preventEvent(event) {
    var event = event || window.event;
    (event.stopPropagation) ? event.stopPropagation() : event.cancelBubble = true;
}
//向后台异步请求公共方法
function ajaxRequest(url, param, callback, errorCallback, beforeSend) {
    $.ajax({
        url: url,
        type: "post",
        data: param,
        beforeSend: function () {
            beforeSend && beforeSend();
        },
        success: function (data) {
            callback(data);
        },
        error: function () {
            errorCallback && errorCallback()
        }
    })
}

//向后台发起同步请求的方法
function ajaxSynchronization(url, param, callback, errorCallback, beforeSend) {
    $.ajax({
        url: url,
        type: "post",
        data: param,
        async: false,
        beforeSend: function () {
            beforeSend && beforeSend();
        },
        success: function (data) {
            callback(data);
        },
        error: function () {
            errorCallback && errorCallback()
        }
    })
}