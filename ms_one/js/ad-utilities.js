function ad_begin() {
    ad_state = "ready"
}

function setupMraid(stage) {
    mraid.useCustomClose(!0), time_mraid_ready = (new Date).getTime(), genlog_time_since(time_wrapper_start, "time_mraid_ready"), console.log("setupMraid - start"), genlog("funnel", "setupMraid." + stage), registerMraidHandlers(mraid), showAd(), console.log("setupMraid - end")
}

function registerMraidHandlers(mraid) {
    console.log("registerMraidHandlers - start"), mraid.addEventListener("viewableChange", function(state) {
        console.log("viewable changed to: " + state + " (" + typeof state + ")"), genlog("mraidviewable", state), mraid.isViewable() && (console.log("showAd (viewable listener): calling"), showAd())
    }), mraid.addEventListener("error", function(message, action) {
        console.log("mraid error.  message: " + message + "   action: " + action), log_remote("mraid_error", "message: " + message + "   action: " + action)
    }), mraid.addEventListener("stateChange", function(state) {
        switch (console.log("stateChange: " + state), genlog("mraidstate", state), state) {
            case "hidden":
                break;
            case "default":
        }
    }), console.log("registerMraidHandlers - end")
}

function wrapper_click_go(depth) {
    genlog("funnel", "click_go");
    var url = ad_click_dest;
    url += "adex" == ad_exchange ? "%26sub12%3Dcta" : "&sub12=cta", depth && (url += "." + depth.toString()), localization && (url += "&lang=" + localization.getLanguage()), console.log("clicked; going to click destination: " + url), mraid.open(url)
}

function showCloseButtonCountdown() {
    if (!close_button_showing) {
        var seconds_remaining = close_button_time_remaining / 1e3,
            closeTimer = document.getElementById("close_timer");
        closeTimer.innerHTML = seconds_remaining;
        var styleAttr = document.createAttribute("style");
        styleAttr.value = "display:block", closeTimer.setAttributeNode(styleAttr), close_button_time_remaining -= 1e3, close_button_time_remaining > 0 && setTimeout(function() {
            showCloseButtonCountdown()
        }, 1e3)
    }
}

function showCloseButton() {
    genlog("render", "showCloseButton"), console.log("showCloseButton - start");
    var closeTimer = document.getElementById("close_timer"),
        timerStyleAttr = document.createAttribute("style");
    timerStyleAttr.value = "display:none", closeTimer.setAttributeNode(timerStyleAttr);
    var closeZone = document.getElementById("close_zone"),
        styleAttr = document.createAttribute("style");
    styleAttr.value = "display:block", closeZone.setAttributeNode(styleAttr), closeZone.onclick = function() {
        return console.log("clicked close button"), genlog("funnel", "close"), mraid.close(), !1
    }, close_button_showing = !0, console.log("showCloseButton - end")
}

function showAd() {
    if (console.log("showAd"), query_params.dev_nomraid || mraid.isViewable()) {
        time_mraid_viewable = (new Date).getTime(), genlog_time_since(time_mraid_ready, "time_mraid_viewable"), console.log("showAd - viewable"), genlog("funnel", "viewable");
        var addiv = document.getElementById("ad");
        if (addiv) {
            console.log("has ad div; setting style display:block");
            var styleAttr = document.createAttribute("style");
            styleAttr.value = "display:block", addiv.setAttributeNode(styleAttr)
        }
        wrapper_splash_shadows_start(), "mopub" == ad_exchange && (close_button_timeout_id = setTimeout(function() {
            showCloseButton()
        }, ad_close_duration)), console.log("ad_begin: calling"), ad_begin(), genlog("lang", localization.getLanguage())
    }
}

function wrapper_preload_complete() {
    time_app_preload_complete = (new Date).getTime(), genlog_time_since(time_wrapper_start, "time_app_preload")
}

function wrapper_load_progress(percent) {
    var splash = document.getElementById("splash_loading_bar_full");
    if (splash) {
        var styleAttr = document.createAttribute("style");
        styleAttr.value = "width:" + Math.floor(135 * percent / 100) + "px", splash.setAttributeNode(styleAttr)
    }
}

function wrapper_hide_splash() {
    wrapper_load_progress(100), time_app_start = (new Date).getTime(), genlog_time_since(time_mraid_viewable, "time_app_start"), genlog("funnel", "hide_splash");
    var splash = document.getElementById("splash");
    if (splash) {
        var styleAttr = document.createAttribute("style");
        styleAttr.value = "display:none", splash.setAttributeNode(styleAttr)
    }
    var header_logo = document.getElementById("ad_header_logo");
    if (header_logo) {
        var styleAttr = document.createAttribute("style");
        styleAttr.value = "display:block", header_logo.setAttributeNode(styleAttr)
    }
    console.log("close duration:", ad_close_duration), close_button_timeout_id && (clearTimeout(close_button_timeout_id), close_button_timeout_id = null), setTimeout(function() {
        showCloseButton()
    }, ad_close_duration), "mopub" == ad_exchange && ad_close_duration > 2e3 && (close_button_time_remaining = ad_close_duration, showCloseButtonCountdown())
}

function wrapper_mark_interaction() {
    return hadFirstInteraction ? hadSecondInteraction ? hadThirdInteraction ? void 0 : (genlog("funnel", "third_interaction"), void(hadThirdInteraction = !0)) : (genlog("funnel", "second_interaction"), void(hadSecondInteraction = !0)) : (genlog("funnel", "first_interaction"), void(hadFirstInteraction = !0))
}

function wrapper_mark_cta(depth) {
    var subbin = "cta";
    depth && (subbin += "." + depth.toString()), genlog("funnel", subbin)
}

function log_remote(bin, text) {
    console.log("%c[log_remote]  %s ==> %s", "background:tan;color:white", bin, text);
    var url = ad_logroot + "/log_string?bin=" + encodeURIComponent(ad_name + "." + bin) + "&s=" + encodeURIComponent(text),
        req = new XMLHttpRequest;
    req.open("GET", url), req.send()
}

function genlog(bin, subbin) {
    console.log("%c[genlog]  %s ==> %s", "background:grey;color:white", bin, subbin);
    var url = ad_logroot + "/log?bin=" + encodeURIComponent(ad_name + "." + bin) + "&subbin=" + encodeURIComponent(subbin),
        req = new XMLHttpRequest;
    req.open("GET", url), req.send()
}

function genlog_time_since(start, bin) {
    if (start) {
        var subbin = bucket_time_since(start);
        genlog(bin, subbin)
    }
}

function bucket_time_since(start) {
    var end = (new Date).getTime(),
        time = end - start,
        bucket = get_bucket(time, 0, 1e4, 40),
        bucket_str = "[";
    return bucket_str += bucket.start == Number.NEGATIVE_INFINITY ? "-inf" : bucket.start, bucket.start != bucket.end && (bucket_str += " to ", bucket_str += bucket.end == Number.POSITIVE_INFINITY ? "+inf" : bucket.end), bucket_str += "]"
}

function bucketObj() {
    this.offset = null, this.start = null, this.end = null, this.width = null
}

function get_bucket(item, min, max, numBuckets) {
    var bucket = new bucketObj;
    if (bucket.width = (max - min) / numBuckets, min >= item || max == min) bucket.offset = 0, bucket.start = Number.NEGATIVE_INFINITY, bucket.end = min + bucket.width;
    else if (item >= max) bucket.offset = numBuckets - 1, bucket.start = max - bucket.width, bucket.end = Number.POSITIVE_INFINITY;
    else {
        var position = numBuckets * (item - min) / (max - min),
            floored = Math.floor(position);
        bucket.offset = Math.round(floored), bucket.start = min + bucket.offset * bucket.width, bucket.end = bucket.start + bucket.width
    }
    return 0 == bucket.offset && (bucket.start = Number.NEGATIVE_INFINITY), bucket.offset == numBuckets - 1 && (bucket.end = Number.POSITIVE_INFINITY), bucket
}

function wrapper_splash_shadows_start() {
    var splash = document.getElementById("splash");
    if (splash) {
        for (var i = 0; bgNumShadows > i; i++) {
            var div = document.createElement("div");
            div.id = "bgShadow" + i;
            var width = 50 + i * Math.floor(150 / bgNumShadows);
            div.style.width = width + "px", div.style.height = Math.floor(width / 5) + "px";
            var colorAdd = 3 * Math.floor((200 - width) / 20) + 1;
            10 == colorAdd && (colorAdd = "A"), 11 == colorAdd && (colorAdd = "B"), 12 == colorAdd && (colorAdd = "C"), 13 == colorAdd && (colorAdd = "D"), 14 == colorAdd && (colorAdd = "E"), 15 == colorAdd && (colorAdd = "F"), colorAdd > 15 && (colorAdd = "E"), div.style.background = "#2" + colorAdd + "2" + colorAdd + "2" + colorAdd, div.style.borderRadius = Math.floor(width / 2) + "px", div.style.position = "absolute", div.style.zIndex = 1, div.style.left = -100 + Math.floor(Math.random() * (gameWidth + 1)) + "px", div.style.top = 50 + Math.floor(Math.random() * (gameHeight + 1)) + "px", splash.insertBefore(div, splash.firstChild)
        }
        setTimeout(wrapper_splash_shadows_move, 20)
    }
}

function wrapper_splash_shadows_move() {
    for (var i = 0; bgNumShadows > i; i++) {
        var div = document.getElementById("bgShadow" + i),
            left = parseInt(div.style.left),
            width = parseInt(div.style.width);
        left += Math.floor((200 - width) / 15) + 1, left > gameWidth + 200 && (left = -200), div.style.left = left + "px"
    }
    setTimeout(wrapper_splash_shadows_move, 20)
}

function fitTitle(elem) {
    var title = document.getElementById("ad_title");
    console.log(title);
    for (var curSize = 1.25; title.scrollHeight > 28 && curSize > .5;) {
        curSize -= .1;
        var styleAttr = document.createAttribute("style");
        styleAttr.value = "font-size: " + curSize + "em;line-height: " + curSize + "em", title.setAttributeNode(styleAttr)
    }
}