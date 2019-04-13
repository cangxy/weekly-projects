/**
 * @todo 
 * 1. 判断时最好使用严格等于运算 "==="，因为普通的等于运算 "==" 会对变量进行类型转换，如 1 == '1' 期望结果为 false，但由于比较时进行了类型转换，结果反而为 true
 * 2. 声明变量时最好使用 ES6 标准，即尽量使用 let/const 来声明变量，因为 var 声明的变量不存在块级（局部）作用域，并且容易被污染
 * 3. 如果表达式中包含连续的 ) 如 6 + 6))))))))) 会导致页面崩溃
 */


var top, shower, answer, lis, ce, boxFun, flagToBox, nlis, sta, staFlag, exchange, exchangeFlag, header, flag, zone;
//初始化 作用域为全局方便calculate函数使用
function init() {    
    top = document.getElementsByClassName("top")[0];
    shower = document.getElementsByClassName("shower")[0]
    answer = document.getElementsByClassName("answer")[0];
    lis = document.getElementsByTagName("li");
    ce = document.getElementsByClassName("CE")[0];
    boxFun = document.getElementsByClassName("boxFun")[0];
    flagToBox = document.getElementsByClassName("flagToBox")[0];
    nlis = boxFun.getElementsByTagName("li");
    answer.innerHTML = "0";
    sta = new Array();
    staFlag = 0;
    exchange = new Array();
    exchangeFlag = 0;
    header = null;
    zone = false;
}

/**
 * @todo
 * * 当涉及到大量 if-else 或 switch 语句，并且后续有增加条件或修改的可能性时，最好是把条件提取出来，作为一个可自由扩展的“配置项”来处理
 * * 这里可以采用 key-value 的思路。将运算符与对应的优先级存储至对象或数组中，一种思路如下：
 * 
 * const OPERATOR_CONFIG = [
 *      {
 *          rank: 1,
 *          operator: ['+', '-']
 *      },
 * 
 *      {
 *          rank: 2,
 *          operator: ['*', '/']
 *      }
 * 
 *      ...
 * ]
 * 
 * 或者不整合也可以（类似 AST 语法树）
 * 
 * const OPERATOR_CONFIG = [
 *      {
 *          rank: 1,
 *          operator: '+'
 *      },
 * 
 *      {
 *          rank: 1,
 *          operator: '-'
 *      }
 * 
 *      ...
 * ]
 * 
 * * 然后可通过（ 这里使用了 ES6 的箭头函数，实际上可理解为: func(function(item){return item}) 等价于 func(item => item) 等价于 func(item => {return item}) )
 * （整合） return OPERATOR_CONFIG.filter(config => config.opeartor.includes(operator)).rank || 0
 * (不整合) return OPERATOR_CONFIG.filter(config => config.operator === opeartor).rank || 0
 *   
 * 当然基于 key-value 的方案不止以上一种，建议根据具体场景具体选择
 * 
 */

//设定运算符的优先级
function rank(str_flag) {
    if (str_flag == '+' || str_flag == '-')
        return 1;
    if (str_flag == '*' || str_flag == '/')
        return 2;
    if (str_flag == '^')
        return 3;
    if (str_flag == '(')
        return 4;
}

/**
 * @todo 
 * * 这部分的思路与上述大体一致
 */
//决策计算
function judge(l, r, str) {
    l = parseInt(l);
    r = parseInt(r);
    if (str == '+') {
        return l + r;
    } else if (str == '-') {
        return l - r;
    } else if (str == '*') {
        return l * r;
    } else if (str == '/') {
        return l / r;
    } else if (str == '%') {
        return l % r;
    } else if (str == '^') {
        var s = 1;
        while (r) {
            if (r % 2 == 1) s = l * s;
            r = Math.floor(r / 2);
            l = l * l;
        }
        return s;
    }
}

//动态移动
function control(obj, attr, speed, long, callback) {
    clearInterval(obj.timer);
    if (parseInt(getStyle(obj, attr)) < long)
        speed = Math.abs(speed);
    else
        speed = -Math.abs(speed);

    document.onkeydown = function (event) { //加速！
        event = event || window.event;
        if (event.ctrlKey) {
            if (speed > 0)
                speed += 2;
            else
                speed -= 2;
        }
    }
    obj.timer = setInterval(function () {
        now = getStyle(obj, attr);

        var nuu = parseInt(now) + speed;

        if (speed > 0 && nuu >= long || speed < 0 && nuu <= long) {
            nuu = long;
        }

        obj.style[attr] = nuu + "px";
        if (nuu == long) {
            callback && callback();
            clearInterval(obj.timer);
        }
    }, 30);
}

//获取样式信息
function getStyle(obj, name) {

    if (window.getComputedStyle) {
        return getComputedStyle(obj, null)[name];
    } else {
        return obj.currentStyle[name];
    }
}

//判断是否为数
function isNumber(val) {
    var res = /[-]{0,1}[1-9]{1}[0-9]{0,}/;
    if (res.test(val)) {
        return true;
    } else {
        return false;
    }
}

/**
 * 
 * @todo 可借助栈来优化表达式的计算过程
 */
//后缀表达式计算结果
function result(str_, index) {
    var answer = null,
        l, r, sum = null;
    for (var i = 0; i <= index; i++) {
        if (!isNumber(str_[i])) {
            r = i - 1;
            while (r > 0) {
                if (!isNumber(str_[r])) {
                    r--;
                } else {
                    break;
                }
            }
            l = r - 1;
            while (l > 0) {
                if (!isNumber(str_[l])) {
                    l--;
                } else {
                    break;
                }
            }
            sum = judge(str_[l], str_[r], str_[i]);
            str_[l] = sum;
            if (sum != null) {
                answer = sum;
            }
            str_[r] = null;
            str_[i] = null;
        }
    }
    return answer;
}

/**
 * @todo 
 * * 优化思路同上
 * 
 * * 像 (content == '+' || content == '-' || content == '^' || content == '*' || content == '%' || content == '/') 
 * * 可改写成 ['+', '-', '^', '*', '%', '/'].includes(operator) 来优化
 * 
 */
//前缀表达式转为后缀表达式且显示处理
function calculate(content) {
    if (zone == true) {
        zone = false;
        header = null;
    }
    if (header == null && (content > "0" && content <= "9")) {
        flag = content;
        answer.innerHTML = content;
        header = "number";
    } else if ((header == "number" || header == "string") && (content >= "0" && content <= "9")) {
        if (header == "string") {
            answer.innerHTML = content;
            header = "number"
        } else {
            answer.innerHTML += content;
        }
        flag = answer.innerHTML;
    } else if ((header == "number" || header == ')') && (content == '+' || content == '-' || content == '^' || content == '*' || content == '%' || content == '/') || (header == "string" || header == "number") && content == '(') {
        if (header == "number" && content != '(' && flag != "") {
            exchange[exchangeFlag++] = flag;
            flag = "";
        }
        if (staFlag == 0 || content == '(') {
            sta[staFlag++] = content;
        } else {
            var head = sta[staFlag - 1];
            if (rank(head) < rank(content) || head == '(') {
                sta[staFlag++] = content;
            } else {
                while (rank(head) >= rank(content) && head != '(' && staFlag > 0) {
                    exchange[exchangeFlag++] = head;
                    staFlag--;
                    head = sta[staFlag - 1];
                }
                sta[staFlag++] = content;
            }
        }
        if (header == "number") {
            shower.innerHTML += " " + answer.innerHTML + " " + content;
        } else {
            shower.innerHTML += " " + content;
        }
        header = "string";
    } else if (content == ')') {
        if (flag != "") {
            exchange[exchangeFlag++] = flag;
            flag = "";
        }
        head = sta[staFlag - 1];
        while (head != '(' && staFlag > 0) {
            exchange[exchangeFlag++] = head;
            staFlag--;
            head = sta[staFlag - 1];
        }
        staFlag--;
        if (header != ')') {
            shower.innerHTML += " " + answer.innerHTML + " " + content;
            header = ')';
        } else {
            shower.innerHTML += " " + content;
        }
    } else if (header == "string" && (content == '+' || content == '-' || content == '^' || content == '*' || content == '%' || content == '/')) {
        if (shower.innerHTML.charAt(shower.innerHTML.length - 1) != ')') {
            shower.innerHTML = shower.innerHTML.substring(0, shower.innerHTML.length - 1) + content;
        } else {
            header = "number";
        }
    } else if (content == '=') {
        zone = true;
        if (flag != "") {
            exchange[exchangeFlag++] = flag;
            flag = "";
        }
        while (staFlag) {
            exchange[exchangeFlag++] = sta[staFlag - 1];
            staFlag--;
        }
        shower.innerHTML = "";
        var point = result(exchange, exchangeFlag);
        if (point != null) {
            answer.innerHTML = point;
        } else {
            answer.innerHTML = '0';
            header = null;
        }
    }
}

window.onload = function () {

    init();

    flagToBox.onclick = function () {
        var width = parseInt(getStyle(boxFun, "width"));
        var style = getStyle(flagToBox, "backgroundColor");
        if (style == "rgb(135, 206, 235)") {
            flagToBox.style.backgroundColor = "rgba(50, 238, 156)";
        } else {
            flagToBox.style.backgroundColor = "rgb(135, 206, 235)";
        }
        if (width == 0) {
            control(boxFun, "width", 10, 200, function () {});
        } else {
            control(boxFun, "width", 10, 0, function () {});
        }
    }

    /**
     * @todo
     * * 以下可通过事件委托（事件代理）来优化
     */
    for (var i = 0; i < lis.length; i++) {
        ce.onclick = function () {
            answer.innerHTML = "0";
            header = null;
        }

        lis[i].onclick = function () {
            var content = this.innerHTML;
            calculate(content);
        }
    }

    for (var i = 0; i < nlis.length; i++) {
        nlis[i].onclick = function () {
            var content = this.innerHTML;
            if (content == "^") {
                calculate(content);
            } else {
                flag = answer.innerHTML.substring(0, answer.innerHTML.length - 1);
                answer.innerHTML = flag;
                if (answer.innerHTML == "") {
                    answer.innerHTML = '0';
                    header = null;
                }
            }
        }
    }
}