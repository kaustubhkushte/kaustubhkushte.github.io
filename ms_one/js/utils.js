var Utils = function() {};
Utils.prototype.getAspectRatio = function(containerWidth,containerHeight,imageWidth,imageHeight){
  var hRatio = containerWidth / imageWidth    ;
  var vRatio = containerHeight / imageHeight  ;
  var ratio  = Math.min ( hRatio, vRatio );
  return ratio;
};

Utils.prototype.getAdParameters = function(specs) {
    var params = {};
    if (ad_dynamic_parameters && ad_dynamic_parameters.split("&").forEach(function(item) {
            params[item.split("=")[0]] = decodeURIComponent(item.split("=")[1])
        }), specs) {
        for (var param in params)
            if ("undefined" != typeof specs[param]) switch (specs[param].type.toLowerCase()) {
                case "int":
                case "integer":
                    params[param] = parseInt(params[param]);
                    break;
                case "int[]":
                case "integer[]":
                    for (var intArray = params[param].split(","), i = 0; i < intArray.length; i++) intArray[i] = +intArray[i];
                    params[param] = intArray;
                    break;
                case "float":
                    params[param] = parseFloat(params[param]);
                    break;
                case "bool":
                case "boolean":
                    "true" == params[param].toLowerCase() ? params[param] = !0 : params[param] = !1
            }
            for (var param in specs) "undefined" == typeof params[param] && (params[param] = specs[param]["default"])
    }
    return params
}, Utils.prototype.applyAdParameters = function(pTarget) {
    var params = {};
    if (!ad_dynamic_parameters) return void console.log("[UTILS]: ad_dynamic_parameters was not found.");
    ad_dynamic_parameters.split("&").forEach(function(pItem) {
        params[pItem.split("=")[0]] = decodeURIComponent(pItem.split("=")[1])
    });
    for (var k in params) {
        var val = params[k],
            o = pTarget;
        if (o = k == k.toUpperCase() ? window : pTarget, o.hasOwnProperty(k)) {
            var tp = o[k];
            tp.constructor === Array ? (o[k] = [], val.split(",").forEach(function(pItem) {
                o[k].push(utils.convertType(0, pItem))
            })) : o[k] = utils.convertType(tp, val)
        } else console.log("[UTILS]: unable to find property:", k)
    }
}, Utils.prototype.convertType = function(pTargetProperty, pVal) {
    return "boolean" == typeof pTargetProperty ? "true" == pVal ? !0 : "1" == pVal ? !0 : !1 : "number" == typeof pTargetProperty ? parseFloat(pVal) : pVal
}, Utils.prototype.checkOverlap = function(spriteA, spriteB) {
    var boundsA = spriteA.getBounds(),
        boundsB = spriteB.getBounds();
    return Phaser.Rectangle.intersects(boundsA, boundsB)
}, Utils.prototype.checkPointInside = function(point, sprite) {
    var pointRect = new PIXI.Rectangle(point.x, point.y, 1, 1),
        spriteBounds = sprite.getBounds();
    return Phaser.Rectangle.intersects(pointRect, spriteBounds)
}, Utils.prototype.lineLength = function(x, y, x0, y0) {
    var xd = Math.abs(x0 - x),
        yd = Math.abs(y0 - y);
    return Math.sqrt(xd * xd + yd * yd)
}, Utils.prototype.highlightRegion = function(game, x, y, radius, alpha) {
    alpha = alpha || .4;
    var mask_small = null;
    imageLoader.hasFrameName("mask.png") ? mask_small = !1 : imageLoader.hasFrameName("mask_small.png") && (mask_small = !0);
    var highlight = imageLoader.sprite(x, y, mask_small ? "mask_small.png" : "mask.png");
    highlight.alpha = alpha, highlight.anchor.set(.5, .5);
    var scale = radius / 20;
    return mask_small && (scale *= 2), highlight.scale.setTo(scale, scale), highlight
}, Utils.prototype.random = function(min, max) {
    return null == max && (max = min, min = 0), min + Math.floor(Math.random() * (max - min + 1))
}, Utils.prototype.shuffle = function(obj) {
    for (var rand, value, index = 0, shuffled = [], i = obj.length - 1; i >= 0; i--) value = obj[i], rand = this.random(index++), shuffled[index - 1] = shuffled[rand], shuffled[rand] = value;
    return shuffled
}, Utils.prototype.arrayDistinct = function(needles, haystack) {
    var res_array = [];
    return haystack.forEach(function(entry) {
        -1 == needles.indexOf(entry) && res_array.push(entry)
    }), res_array
}, Utils.prototype.forceOrientation = function(game, orientation) {
    if (!game.device.desktop) {
        console.log("forcing orientation: " + orientation), game.scale.forceOrientation("landscape" == orientation ? !0 : !1, "landscape" == orientation ? !1 : !0);
        var ths = this;
        game.scale.enterIncorrectOrientation.add(function() {
            ths.handleIncorrectOrientation(game)
        }), game.scale.leaveIncorrectOrientation.add(function() {
            ths.handleCorrectOrientation(game)
        })
    }
}, Utils.prototype.handleIncorrectOrientation = function(game) {
    console.log("entered incorrect orientation"), document.getElementById("orientation").style.display = "block"
}, Utils.prototype.handleCorrectOrientation = function() {
    console.log("resumed correct orientation"), document.getElementById("orientation").style.display = "none"
}, Utils.prototype.parseXML = function(xmlStr) {
    if ("undefined" != typeof window.DOMParser) return (new window.DOMParser).parseFromString(xmlStr, "text/xml");
    if ("undefined" != typeof window.ActiveXObject && new window.ActiveXObject("Microsoft.XMLDOM")) {
        var xmlDoc = new window.ActiveXObject("Microsoft.XMLDOM");
        return xmlDoc.async = "false", xmlDoc.loadXML(xmlStr), xmlDoc
    }
    return null
}, Utils.prototype.applyAdParameters = function(target) {
    var params = utils.getAdParameters();
    for (var k in params) {
        var val = params[k],
            o = target;
        o = k == k.toUpperCase() ? window : target, o.hasOwnProperty(k) ? "boolean" == typeof o[k] ? o[k] = "true" == val ? !0 : "1" == val ? !0 : !1 : o[k] = val : console.log("Ad params: unable to find property:", k)
    }
}, Object.prototype.hasOwnProperty = function(property) {
    return "undefined" != typeof this[property]
}, String.prototype.lpad = function(padString, length) {
    for (var str = this; str.length < length;) str = padString + str;
    return str
}, String.prototype.isUpperCase = function(val) {
    return val == val.toUpperCase()
}, Utils.prototype.lerp = function(a, b, t) {
    return a + t * (b - a)
}, Utils.prototype.hermite = function(start, end, value) {
    return this.lerp(start, end, value * value * (3 - 2 * value))
}, Utils.prototype.sinerp = function(start, end, value) {
    return this.lerp(start, end, Math.sin(value * Math.PI * .5))
}, Number.prototype.mod = function(n) {
    return (this % n + n) % n
}, Utils.prototype.fitIntoRect = function(sprite, bounds, fillRect, align) {
    var wD = sprite.width / sprite.scale.x,
        hD = sprite.height / sprite.scale.y,
        wR = bounds.width,
        hR = bounds.height,
        sX = wR / wD,
        sY = hR / hD,
        rD = wD / hD,
        rR = wR / hR,
        sH = fillRect ? sY : sX,
        sV = fillRect ? sX : sY,
        s = rD >= rR ? sH : sV,
        w = wD * s,
        h = hD * s,
        tX = 0,
        tY = 0;
    switch (align) {
        case "left":
        case "topLeft":
        case "bottomLeft":
            tX = 0;
            break;
        case "right":
        case "topRight":
        case "bottomRight":
            tX = w - wR;
            break;
        default:
            tX = .5 * (w - wR)
    }
    switch (align) {
        case "top":
        case "topLeft":
        case "topRight":
            tY = 0;
            break;
        case "bottom":
        case "bottomLeft":
        case "bottomRight":
            tY = h - hR;
            break;
        default:
            tY = .5 * (h - hR)
    }
    sprite.x = bounds.x - tX, sprite.y = bounds.y - tY, sprite.scale.set(s)
};
var utils = new Utils;