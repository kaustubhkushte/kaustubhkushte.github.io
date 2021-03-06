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


imageLoader._game = null, imageLoader._backgrounds = [], imageLoader._atlases = [], Phaser.Cache.prototype.addBitmapFontByAtlas = function(key, xmlData, imageKey, frameKey, xSpacing, ySpacing) {
    var obj = {
        url: null,
        data: null,
        font: null,
        base: this.getBaseTexture(imageKey)
    };
    void 0 === xSpacing && (xSpacing = 0), void 0 === ySpacing && (ySpacing = 0), obj.font = Phaser.LoaderParser.xmlBitmapFont(xmlData, obj.base, xSpacing, ySpacing), this._cache.bitmapFont[key] = obj
};
App = {}, App.Preloader = function(game) {}, App.Preloader.prototype = {
    init: function() {
        this.stage.disableVisibilityChange = !0, this.game.device.desktop ? this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL : this.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT, utils.forceOrientation(this.game, ad_orientation), this.scale.pageAlignHorizontally = !0, this.scale.refresh()
    },
    preload: function() {
        imageLoader.registerGame(this.game), imageLoader.registerBackgroundImage(ad_webroot + "/mobilestrike/img/backgrounds/728x1280_MobileStrike_BG.jpg", 728, 1280), imageLoader.registerBackgroundImage(ad_webroot + "/mobilestrike/img/backgrounds/1280x728_MobileStrike_BG.jpg", 1280, 728), imageLoader.preloadBackground(), imageLoader.loadAtlasArray("assets", ad_webroot + "/mobilestrike/texture_sheets/assets.png", ad_webroot + "/mobilestrike/texture_sheets/assets.json")
    },
    create: function() {
        wrapper_preload_complete()
    },
    loadUpdate: function() {
        wrapper_load_progress(this.game.load.progress)
    },
    update: function() {
        "ready" == ad_state && (ad_state = "live", this.state.start("Game"))
    },
    pad: function(n, width, z) {
        return z = z || "0", n += "", n.length >= width ? n : new Array(width - n.length + 1).join(z) + n
    }
}, App.Game = function(game) {
    this.tileWidth = 0, this.tileHeight = 0, this.openTiles = [], this.buildings = [], this.targets = [], this.intro = null, this.intro_fading = !1, this.crosshair = null, this.dust = null, this.numGoodHits = 0, this.numBadHits = 0, this.textRemaining = null, this.callToAction = null, this.timeSinceLastAction = null
}, App.Game.prototype = {
    create: function() {
        wrapper_hide_splash(), this.createBackground(), this.createBuildings(), this.randomizeTargets(this.game.height / 2), this.displayIntro();
        var ths = this;
        game.time.events.add(3e3, function() {
            ths.flyJets()
        }, this), this.game.input.onTap.add(this.onTap, this)
    },
    createBackground: function() {
        imageLoader.displayBackground();
        this.tileWidth = 252, this.tileHeight = 129, "landscape" == ad_orientation ? this.openTiles = [{
            x: 724,
            y: 162.5
        }, {
            x: 850,
            y: 100
        }, {
            x: 974,
            y: 162.5
        }, {
            x: 374,
            y: 289.5
        }, {
            x: 500,
            y: 227
        }, {
            x: 624,
            y: 289.5
        }, {
            x: 750,
            y: 227
        }, {
            x: 874,
            y: 289.5
        }, {
            x: 1e3,
            y: 227
        }, {
            x: 1124,
            y: 289.5
        }, {
            x: 250,
            y: 354
        }, {
            x: 374,
            y: 416.5
        }, {
            x: 500,
            y: 354
        }, {
            x: 624,
            y: 416.5
        }, {
            x: 750,
            y: 354
        }, {
            x: 874,
            y: 416.5
        }, {
            x: 1e3,
            y: 354
        }, {
            x: 1124,
            y: 416.5
        }, {
            x: 250,
            y: 481
        }, {
            x: 374,
            y: 543.5
        }, {
            x: 500,
            y: 481
        }, {
            x: 624,
            y: 543.5
        }, {
            x: 750,
            y: 481
        }, {
            x: 874,
            y: 543.5
        }, {
            x: 1e3,
            y: 481
        }, {
            x: 1124,
            y: 543.5
        }, {
            x: 374,
            y: 670.5
        }, {
            x: 500,
            y: 608
        }, {
            x: 624,
            y: 670.5
        }, {
            x: 750,
            y: 608
        }, {
            x: 874,
            y: 670.5
        }, {
            x: 1e3,
            y: 608
        }] : this.openTiles = [{
            x: 474,
            y: 162.5
        }, {
            x: 250,
            y: 227
        }, {
            x: 374,
            y: 289.5
        }, {
            x: 500,
            y: 227
        }, {
            x: 124,
            y: 416.5
        }, {
            x: 250,
            y: 354
        }, {
            x: 374,
            y: 416.5
        }, {
            x: 500,
            y: 354
        }, {
            x: 624,
            y: 416.5
        }, {
            x: 124,
            y: 543.5
        }, {
            x: 250,
            y: 481
        }, {
            x: 374,
            y: 543.5
        }, {
            x: 500,
            y: 481
        }, {
            x: 0,
            y: 608
        }, {
            x: 124,
            y: 670.5
        }, {
            x: 250,
            y: 608
        }, {
            x: 374,
            y: 670.5
        }, {
            x: 500,
            y: 608
        }, {
            x: 0,
            y: 735
        }, {
            x: 124,
            y: 797.5
        }, {
            x: 250,
            y: 735
        }, {
            x: 374,
            y: 797.5
        }, {
            x: 0,
            y: 862
        }, {
            x: 124,
            y: 924.5
        }, {
            x: 250,
            y: 862
        }, {
            x: 374,
            y: 924.5
        }, {
            x: 500,
            y: 862
        }, {
            x: 250,
            y: 989
        }, {
            x: 374,
            y: 1051.5
        }, {
            x: 500,
            y: 989
        }, {
            x: 250,
            y: 1116
        }], this.openTiles = this.shuffle(this.openTiles)
    },
    createBuildings: function() {
        for (var totalSpaces = this.openTiles.length; this.buildings.length < .7 * totalSpaces && this.openTiles.length > 0;) {
            var openTile = this.openTiles.pop(),
                buildingNum = this.randomInt(0, 35),
                building = imageLoader.sprite(openTile.x, openTile.y, "building" + this.pad(buildingNum, 3) + ".png"),
                scale = 1;
            building.width != this.tileWidth && (scale = this.tileWidth / building.width), building.height != this.tileHeight && this.tileHeight / building.height < scale && (scale = this.tileHeight / building.height), building.scale.x = scale, building.scale.y = scale, building.anchor.set(.5, .5), building.inputEnabled = !0, building.events.onInputDown.add(this.destroyBuilding, {
                building: building,
                ths: this
            }, this), this.buildings.push(building)
        }
    },
    update: function() {
        this.timeSinceLastAction || (this.timeSinceLastAction = (new Date).getTime());
        var cur_time = (new Date).getTime();
        this.timeSinceLastAction && cur_time > this.timeSinceLastAction + 15e3 && !this.callToAction && (genlog("funnel", "timeout"), this.endScreen())
    },
    scoreGood: function() {
        var numHitsRequired = 5;
        this.numGoodHits++, this.timeSinceLastAction = (new Date).getTime();
        var goodHit = imageLoader.sprite(this.game.width - 20, 25, "quest_icon.png");
        goodHit.anchor.set(1, 0), goodHit.x -= (goodHit.width + 15) * (this.numGoodHits - 1), wrapper_mark_interaction(), this.textRemaining || (this.textRemaining = this.game.add.text(this.game.width - 20, 160, "", {
            font: "bold 32pt Arial",
            fill: "#ffffff",
            align: "center"
        }), this.textRemaining.anchor.set(1, 0));
        var numRemaining = numHitsRequired - this.numGoodHits;
        this.textRemaining.setText(localization.get("%COUNT% more", {
            "%COUNT%": numRemaining
        })), this.numGoodHits >= numHitsRequired && (this.textRemaining.destroy(), genlog("funnel", "won"), this.endScreen())
    },
    scoreBad: function() {
        this.numBadHits++, this.timeSinceLastAction = (new Date).getTime(), wrapper_mark_interaction(), this.numBadHits >= 5 && (genlog("funnel", "lost"), this.endScreen())
    },
    destroyBuilding: function() {
        console.log("destroying: ", this.building), console.log("{x: " + this.building.x + ", y: " + this.building.y + "}"), this.ths.destroyIntro(), this.building.inputEnabled = !1;
        for (var i = 0; i < this.ths.buildings.length; i++)
            if (this.ths.buildings[i] == this.building) {
                this.ths.buildings.splice(i, 1);
                break
            }
        for (var hitTarget = !1, i = 0; i < this.ths.targets.length; i++)
            if (this.ths.targets[i].building == this.building) {
                this.ths.targets[i].destroy(), this.ths.targets.splice(i, 1), hitTarget = !0, this.ths.removeCrosshair(), this.ths.scoreGood();
                break
            }
        if (!hitTarget) {
            var badHit = imageLoader.sprite(this.ths.game.width / 2, 200, "blockuser_icon.png");
            badHit.anchor.set(.5, .5);
            var twn = this.ths.game.add.tween(badHit).to({
                    alpha: 0
                }, 1e3, Phaser.Easing.Linear.None, !0),
                twn = this.ths.game.add.tween(badHit.scale).to({
                    x: 4,
                    y: 4
                }, 1e3, Phaser.Easing.Linear.None, !0);
            twn.onComplete.add(function() {
                badHit.destroy()
            }), this.ths.scoreBad()
        }
        var debris_image = "Debris_01_V02.png";
        1 == this.ths.randomInt(0, 1) && (debris_image = "Debris_02_V01.png");
        var debris = imageLoader.sprite(this.building.x, this.building.y, debris_image);
        debris.anchor.set(.5, .5);
        var maxDimension = this.building.height;
        this.building.width > this.building.height && (maxDimension = this.building.width), debris.scale.setTo(.85 * maxDimension / 252, .85 * maxDimension / 252), debris.alpha = 0, this.ths.game.add.tween(debris).to({
            alpha: 1
        }, 300, Phaser.Easing.Linear.None, !0), this.ths.explosionAnimation(this.building.x, this.building.y);
        var bldg = this.building,
            twn = this.ths.game.add.tween(bldg).to({
                alpha: 0
            }, 300, Phaser.Easing.Linear.None, !0);
        twn.onComplete.add(function() {
            bldg.destroy()
        })
    },
    onTap: function(pointer, doubleTap) {
        if (!this.callToAction && !this.dust) {
            console.log("onTap"), this.dust = imageLoader.sprite(pointer.position.x, pointer.position.y, "puff_smoke_01_0000.png"), this.dust.anchor.set(.5, .5), this.dust.scale.setTo(2, 2), this.dust.angle = this.randomInt(0, 359), this.dust.animations.add("dust", Phaser.Animation.generateFrameNames("puff_smoke_01_", 0, 31, ".png", 4), 30, !1, !1), this.dust.animations.play("dust");
            var ths = this;
            this.dust.events.onAnimationComplete.add(function() {
                ths.dust.destroy(), ths.dust = null
            })
        }
    },
    explosionAnimation: function(x, y) {
        var seriesFirst = null,
            seriesPrefix = null,
            seriesFrameStart = 0,
            seriesFrameEnd = 0;
        switch (this.randomInt(1, 2)) {
            case 1:
                seriesFirst = "expl_09_0000.png", seriesPrefix = "expl_09_", seriesFrameStart = 0, seriesFrameEnd = 31;
                break;
            case 2:
                seriesFirst = "expl_10_0000.png", seriesPrefix = "expl_10_", seriesFrameStart = 0, seriesFrameEnd = 31
        }
        var explosion = imageLoader.sprite(x, y, seriesFirst);
        explosion.anchor.set(.5, .5), explosion.scale.setTo(2, 2), explosion.angle = this.randomInt(0, 359), explosion.animations.add("boom", Phaser.Animation.generateFrameNames(seriesPrefix, seriesFrameStart, seriesFrameEnd, ".png", 4), this.randomInt(25, 35), !1, !1), explosion.animations.play("boom");
        var ths = this;
        explosion.events.onAnimationComplete.add(function() {
            var twn = ths.game.add.tween(explosion).to({
                alpha: 0
            }, 200, Phaser.Easing.Linear.None, !0, 0);
            twn.onComplete.add(function() {
                explosion.destroy()
            })
        })
    },
    displayIntro: function() {
        if (this.intro = game.add.group(), this.targets.length) {
            this.crosshair = imageLoader.sprite(this.targets[0].x, this.targets[0].y, "crosshairs.png"), this.crosshair.alpha = .5, this.crosshair.anchor.set(.5, .5), this.crosshair.scale.setTo(20, 20);
            var twn = this.game.add.tween(this.crosshair.scale).to({
                    x: 1,
                    y: 1
                }, 300, Phaser.Easing.Linear.None, !0),
                ths = this;
            twn.onComplete.add(function() {
                ths.game.add.tween(ths.crosshair.scale).to({
                    x: 1.5,
                    y: 1.5
                }, 500, Phaser.Easing.Sinusoidal.InOut, !0, 0, -1, !0)
            })
        }
        var bubbleHeight = 450,
            bubbleWidth = this.game.width - 100;
        "landscape" == ad_orientation && (bubbleHeight = 310, bubbleWidth = 700);
        var bubble = this.game.add.graphics(this.game.width / 2, bubbleHeight / 2 + 20);
        bubble.beginFill(0, 1), bubble.drawRoundedRect(0, 0, bubbleWidth, bubbleHeight, 10), bubble.alpha = 1, bubble.pivot.x = bubble.width / 2, bubble.pivot.y = bubble.height / 2, bubble.endFill(), this.game.add.tween(bubble).to({
            alpha: .7
        }, 500, Phaser.Easing.Sinusoidal.InOut, !0, 0, -1, !0), this.game.add.tween(bubble.scale).to({
            x: 1.02,
            y: 1.02
        }, 500, Phaser.Easing.Sinusoidal.InOut, !0, 0, -1, !0);
        var athena = imageLoader.sprite(bubble.x - bubble.width / 2 + 5, bubble.y, "athena_01.png");
        athena.anchor.set(0, .5), "landscape" == ad_orientation && athena.scale.setTo(.5, .5);
        var fontStyle = "bold 32pt Arial";
        "landscape" == ad_orientation && (fontStyle = "bold 24pt Arial");
        var text = this.game.add.text(bubble.x + bubble.width / 2 - 15, bubble.y - bubble.height / 2 + 40, localization.get("Quick! Tap to destroy 5 buildings with red arrows:"), {
            font: fontStyle,
            fill: "#ffffff",
            align: "center",
            wordWrap: !0,
            wordWrapWidth: bubble.width - athena.width - 40
        });
        localization.fitText(text, null, 120), text.anchor.set(1, 0), this.game.add.tween(text).to({
            alpha: .9
        }, 500, Phaser.Easing.Sinusoidal.InOut, !0, 0, -1, !0);
        var arrow = imageLoader.sprite(bubble.x + bubble.width / 2 - text.width / 2, bubble.y + bubble.height / 2 - 30, "target.png");
        arrow.anchor.set(.5, 1), arrow.scale.setTo(3, 3), this.intro.add(bubble), this.intro.add(athena), this.intro.add(arrow), this.intro.add(text)
    },
    destroyIntro: function() {
        if (this.intro && !this.intro_fading) {
            this.removeCrosshair(), this.intro_fading = !0;
            var twn = this.game.add.tween(this.intro).to({
                    alpha: 0
                }, 500, Phaser.Easing.Linear.None, !0),
                ths = this;
            twn.onComplete.add(function() {
                ths.intro.destroy(), ths.intro = null, ths.intro_fading = !1
            });
            var ths = this;
            game.time.events.loop(2500, function() {
                ths.randomizeTargets()
            }, this)
        }
    },
    removeCrosshair: function() {
        if (this.crosshair) {
            var crsshair = this.crosshair;
            this.crosshair = null;
            var twn = this.game.add.tween(crsshair).to({
                alpha: 0
            }, 300, Phaser.Easing.Linear.None, !0);
            twn.onComplete.add(function() {
                crsshair.destroy()
            })
        }
    },
    randomizeTargets: function(yMin) {
        yMin = yMin || 50;
        for (var i = 0; i < this.targets.length; i++) this.targets[i].destroy();
        this.targets = [], this.buildings = this.shuffle(this.buildings);
        for (var numPicked = 0, i = 0; i < this.buildings.length; i++)
            if (!(this.buildings[i].x < 50 || this.buildings[i].x >= this.game.width - 50 || this.buildings[i].y < yMin || this.buildings[i].y >= this.game.height - 50)) {
                var target = imageLoader.sprite(this.buildings[i].x, this.buildings[i].y - 20, "target.png");
                target.anchor.set(.5, .5), target.scale.setTo(3, 3);
                var twn = this.game.add.tween(target).to({
                    alpha: .5
                }, 500, Phaser.Easing.Linear.None, !0);
                if (twn.loop(), target.building = this.buildings[i], this.targets.push(target), numPicked++, numPicked >= 3) break
            }
    },
    flyJets: function() {
        var startX = -150,
            startY = this.randomInt(0, this.game.height),
            endX = this.game.width + 150,
            endY = this.randomInt(200, this.game.height - 200);
        this.callToAction && (endY = this.randomInt(0, this.game.height));
        var angle = Phaser.Math.angleBetween(startX, startY, endX, endY),
            jet = imageLoader.sprite(startX, startY, "jet.png");
        jet.angle = Phaser.Math.radToDeg(angle) + 90, jet.anchor.set(.5, .5);
        this.game.add.tween(jet).to({
            x: endX,
            y: endY
        }, 1e3, Phaser.Easing.Linear.None, !0);
        this.dialogsToTop();
        var ths = this;
        game.time.events.repeat(50, 20, function() {
            var smoke = imageLoader.sprite(jet.x, jet.y, "smoke_0000.png");
            smoke.anchor.set(.5, .5), smoke.angle = this.randomInt(0, 359), smoke.animations.add("smoke", Phaser.Animation.generateFrameNames("smoke_", 0, 18, ".png", 4), 30, !1, !1), smoke.animations.play("smoke"), smoke.events.onAnimationComplete.add(function() {
                smoke.destroy()
            }), this.dialogsToTop()
        }, this);
        var nextJet = this.randomInt(2500, 6500);
        this.callToAction && (nextJet = this.randomInt(500, 1500)), game.time.events.add(nextJet, function() {
            ths.flyJets()
        }, this)
    },
    endScreen: function() {
        if (!this.callToAction) {
            this.destroyIntro();
            for (var i = 0; i < this.buildings.length; i++) {
                var bldg = this.buildings[i],
                    twn = this.game.add.tween(bldg).to({
                        alpha: 0
                    }, 300, Phaser.Easing.Linear.None, !0);
                twn.onComplete.add(function() {
                    bldg.destroy()
                })
            }
            this.buildings = [], this.randomizeTargets();
            for (var i = 0; 50 > i; i++) this.explosionAnimation(this.randomInt(50, this.game.width - 50), this.randomInt(50, this.game.height - 50));
            var background_overlay = this.game.add.graphics(0, 0);
            background_overlay.beginFill(0, 1), background_overlay.drawRect(0, 0, this.game.width, this.game.height), background_overlay.alpha = .4, background_overlay.endFill(), background_overlay.inputEnabled = !0, background_overlay.events.onInputDown.add(function() {
                wrapper_click_go()
            }), this.callToAction = game.add.group();
            var bubbleHeight = 700,
                bubbleWidth = this.game.width - 100;
            "landscape" == ad_orientation && (bubbleWidth = 650);
            var bubble = this.game.add.graphics(this.game.width / 2, this.game.height / 2);
            bubble.beginFill(0, 1), bubble.drawRoundedRect(0, 0, bubbleWidth, bubbleHeight, 10), bubble.alpha = .9, bubble.pivot.x = bubble.width / 2, bubble.pivot.y = bubble.height / 2, bubble.endFill(), this.game.add.tween(bubble).to({
                alpha: .5
            }, 500, Phaser.Easing.Sinusoidal.InOut, !0, 0, -1, !0), this.game.add.tween(bubble.scale).to({
                x: 1.02,
                y: 1.02
            }, 500, Phaser.Easing.Sinusoidal.InOut, !0, 0, -1, !0);
            var logo = imageLoader.sprite(bubble.x, bubble.y - bubble.height / 2 + 15, "title_art.png");
            logo.anchor.set(.5, 0);
            var athena = imageLoader.sprite(bubble.x - bubble.width / 2 + 5, bubble.y + bubble.height / 2 - 15, "athena_02.png");
            athena.anchor.set(0, 1), athena.scale.setTo(.9, .9);
            var text = this.game.add.text(bubble.x + bubble.width / 2 - 15, bubble.y - bubble.height / 2 + logo.height + 25, localization.get("Continue on! Fight the new global war."), {
                font: "bold 32pt Arial",
                fill: "#ffffff",
                align: "center",
                wordWrap: !0,
                wordWrapWidth: bubble.width - athena.width - 40
            });
            localization.fitText(text, null, 220), text.anchor.set(1, 0), this.game.add.tween(text).to({
                alpha: .9
            }, 500, Phaser.Easing.Sinusoidal.InOut, !0, 0, -1, !0);
            var install = imageLoader.sprite(bubble.x + bubble.width / 2 - text.width / 2 - 10, bubble.y + bubble.height / 2 - 30, "install.png");
            install.anchor.set(.5, 1), install.scale.setTo(3, 3);
            var i_text = this.game.add.text(install.x - 5, install.y - 35, localization.get("Play Free"), {
                font: "bold 20pt Arial",
                fill: "#ffffff",
                align: "center",
                wordWrap: !0,
                wordWrapWidth: bubble.width - athena.width - 40
            });
            localization.fitText(i_text, 30, 50), i_text.anchor.set(.5, .5), this.callToAction.add(bubble), this.callToAction.add(logo), this.callToAction.add(athena), this.callToAction.add(install), this.callToAction.add(i_text), this.callToAction.add(text), wrapper_mark_cta()
        }
    },
    dialogsToTop: function() {
        this.intro && this.game.world.bringToTop(this.intro), this.callToAction && this.game.world.bringToTop(this.callToAction)
    },
    randomInt: function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min
    },
    pad: function(n, width, z) {
        return z = z || "0", n += "", n.length >= width ? n : new Array(width - n.length + 1).join(z) + n
    },
    shuffle: function(array) {
        for (var temporaryValue, randomIndex, currentIndex = array.length; 0 !== currentIndex;) randomIndex = Math.floor(Math.random() * currentIndex), currentIndex -= 1, temporaryValue = array[currentIndex], array[currentIndex] = array[randomIndex], array[randomIndex] = temporaryValue;
        return array
    }
};
var ad_state = null;
gameWidth = 728, gameHeight = 1280, console.log("orientation: " + ad_orientation), "landscape" == ad_orientation && (gameWidth = 1280, gameHeight = 728);
var game = new Phaser.Game(gameWidth, gameHeight, Phaser.CANVAS, "");
console.log("forcing canvas"), game.state.add("Preloader", App.Preloader), game.state.add("Game", App.Game), game.state.start("Preloader"), console.log("wrapper - start"), genlog("funnel", "wrapper");
var time_wrapper_start = (new Date).getTime(),
    time_mraid_ready = null,
    time_mraid_viewable = null,
    time_app_preload_complete = null,
    time_app_start = null,
    close_button_time_remaining = null,
    close_button_showing = !1,
    close_button_timeout_id = null,
    query_params = {};
location.search.substr(1).split("&").forEach(function(item) {
    query_params[item.split("=")[0]] = decodeURIComponent(item.split("=")[1])
});
var hadFirstInteraction = !1,
    hadSecondInteraction = !1,
    hadThirdInteraction = !1;

var bgNumShadows = 30;
console.log("wrapper - html writing..."), document.write('<div id="ad_header"><div id="ad_header_logo" style="display:none"></div><div id="ad_title">' + ad_title + '</div><div id="close_timer" style="display:none"></div><div id="close_zone" style="display:none"><div class="close-button"></div></div></div><div id="orientation"></div>'), ad_has_custom_load_screen || document.write('<div id="splash"><div id="splash_icon_wrap"><a href="' + ad_click_dest + '&sub12=splash"><img src="' + ad_splash_image + '" id="splash_icon"/></a></div><div id="splash_wait" lang="' + localization.getLanguage() + '">' + localization.get("Mini game loading, please wait...") + '</div><div id="splash_loading"><div id="splash_loading_bar"></div><div id="splash_loading_bar_full"></div></div><div id="splash_footer"><div id="splash_footer_logo"></div></div></div>'), console.log("wrapper - html written"), fitTitle(), query_params.dev_nomraid ? (console.log("dev_nomraid showAd"), showAd()) : "ready" != mraid.getState() ? (console.log("MRAID Ad: adding event listener for ready"), mraid.addEventListener("ready", function() {
    setupMraid("ready")
})) : (console.log("MRAID default ready"), setupMraid("default")), console.log("wrapper - end");