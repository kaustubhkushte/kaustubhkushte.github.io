ImageLoader = function() {};
ImageLoader.prototype.registerGame = function(game) {
    this._game = game, this._game.load.crossOrigin = "Anonymous", console.log("load.crossOrigin: ", this._game.load.crossOrigin)
}, ImageLoader.prototype.registerBackgroundImage = function(imageUrl, imageWidth, imageHeight) {
    var background = {
        url: imageUrl,
        width: imageWidth,
        height: imageHeight,
        landscape: imageWidth > imageHeight ? !0 : !1
    };
    this._backgrounds.push(background)
}, ImageLoader.prototype.preloadBackground = function() {
    var landscape = !1;
    this._game.width > this._game.height && (landscape = !0), this._backgrounds = Phaser.ArrayUtils.shuffle(this._backgrounds);
    for (var i = 0; i < this._backgrounds.length; i++)
        if (landscape == this._backgrounds[i].landscape) return console.log("Preloading background: " + this._backgrounds[i].url + "    landscape? " + this._backgrounds[i].landscape), void this.loadImage("background", this._backgrounds[i].url);
    console.log("No matching background found for preloading")
}, ImageLoader.prototype.displayBackground = function() {
    return this._game.add.sprite(0, 0, "background")
}, ImageLoader.prototype.loadImage = function(name, imgpath) {
    return this._game.load.image(name, imgpath)
}, ImageLoader.prototype.sprite = function(x, y, name) {
    for (var i = 0; i < this._atlases.length; i++) {
        var img = this._game.cache.getFrameByName(this._atlases[i], name);
        if (void 0 !== img && null != img) return this._game.add.sprite(x, y, this._atlases[i], name)
    }
    return console.log("image_loader: warning: sprite not found in atlases; assuming it was loaded individually: " + name), this._game.add.sprite(x, y, name)
}, ImageLoader.prototype.spriteMake = function(x, y, name) {
    for (var i = 0; i < this._atlases.length; i++) {
        var img = this._game.cache.getFrameByName(this._atlases[i], name);
        if (void 0 !== img && null != img) return this._game.make.sprite(x, y, this._atlases[i], name)
    }
    return this._game.make.sprite(x, y, name)
}, ImageLoader.prototype.button = function(x, y, name, cbk, ths) {
    console.log("CBBB"), console.log(cbk);
    for (var i = 0; i < this._atlases.length; i++) {
        var img = this._game.cache.getFrameByName(this._atlases[i], name);
        if (void 0 !== img && null != img) return console.log("key"), console.log(this._atlases[i]), this._game.add.button(x, y, this._atlases[i], name, cbk, ths)
    }
    return console.log("image_loader: warning: button not found in atlases; assuming it was loaded individually: " + name), this._game.add.button(x, y, "", name, cbk, ths)
}, ImageLoader.prototype.hasFrameName = function(name) {
    for (var i = 0; i < this._atlases.length; i++) {
        var img = this._game.cache.getFrameByName(this._atlases[i], name);
        if (void 0 !== img && null != img) return !0
    }
    return !1
}, ImageLoader.prototype.loadSpritesheet = function(name, imgpath, frameheight, framewidth, spacing) {
    return this._game.load.spritesheet(name, imgpath, frameheight, framewidth, spacing)
}, ImageLoader.prototype.loadAtlasHash = function(key, textureURL, atlasURL, atlasData) {
    var loader = this._game.load.atlasJSONHash(key, textureURL, atlasURL, atlasData);
    return this._atlases.push(key), console.log("Loaded atlas: " + key), loader
}, ImageLoader.prototype.loadAtlasArray = function(key, textureURL, atlasURL, atlasData) {
    var loader = this._game.load.atlasJSONArray(key, textureURL, atlasURL, atlasData);
    return this._atlases.push(key), console.log("Loaded atlas: " + key), loader
};
var imageLoader = new ImageLoader;