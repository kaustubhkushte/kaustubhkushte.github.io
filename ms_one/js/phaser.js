(function() {
    var root = this,
        PIXI = PIXI || {};
    return PIXI.game = null, PIXI.WEBGL_RENDERER = 0, PIXI.CANVAS_RENDERER = 1, PIXI.VERSION = "v2.2.9", PIXI._UID = 0, "undefined" != typeof Float32Array ? (PIXI.Float32Array = Float32Array, PIXI.Uint16Array = Uint16Array, PIXI.Uint32Array = Uint32Array, PIXI.ArrayBuffer = ArrayBuffer) : (PIXI.Float32Array = Array, PIXI.Uint16Array = Array), PIXI.PI_2 = 2 * Math.PI, PIXI.RAD_TO_DEG = 180 / Math.PI, PIXI.DEG_TO_RAD = Math.PI / 180, PIXI.RETINA_PREFIX = "@2x", PIXI.DisplayObject = function() {
        this.position = new PIXI.Point(0, 0), this.scale = new PIXI.Point(1, 1), this.pivot = new PIXI.Point(0, 0), this.rotation = 0, this.alpha = 1, this.visible = !0, this.hitArea = null, this.renderable = !1, this.parent = null, this.stage = null, this.worldAlpha = 1, this.worldTransform = new PIXI.Matrix, this.worldPosition = new PIXI.Point(0, 0), this.worldScale = new PIXI.Point(1, 1), this.worldRotation = 0, this._sr = 0, this._cr = 1, this.filterArea = null, this._bounds = new PIXI.Rectangle(0, 0, 1, 1), this._currentBounds = null, this._mask = null, this._cacheAsBitmap = !1, this._cacheIsDirty = !1
    }, PIXI.DisplayObject.prototype.constructor = PIXI.DisplayObject, PIXI.DisplayObject.prototype.destroy = function() {
        if (this.children) {
            for (var i = this.children.length; i--;) this.children[i].destroy();
            this.children = []
        }
        this.hitArea = null, this.parent = null, this.stage = null, this.worldTransform = null, this.filterArea = null, this._bounds = null, this._currentBounds = null, this._mask = null, this.renderable = !1, this._destroyCachedSprite()
    }, Object.defineProperty(PIXI.DisplayObject.prototype, "worldVisible", {
        get: function() {
            var item = this;
            do {
                if (!item.visible) return !1;
                item = item.parent
            } while (item);
            return !0
        }
    }), Object.defineProperty(PIXI.DisplayObject.prototype, "mask", {
        get: function() {
            return this._mask
        },
        set: function(value) {
            this._mask && (this._mask.isMask = !1), this._mask = value, this._mask && (this._mask.isMask = !0)
        }
    }), Object.defineProperty(PIXI.DisplayObject.prototype, "filters", {
        get: function() {
            return this._filters
        },
        set: function(value) {
            if (value) {
                for (var passes = [], i = 0; i < value.length; i++)
                    for (var filterPasses = value[i].passes, j = 0; j < filterPasses.length; j++) passes.push(filterPasses[j]);
                this._filterBlock = {
                    target: this,
                    filterPasses: passes
                }
            }
            this._filters = value, this.blendMode && this.blendMode === PIXI.blendModes.MULTIPLY && (this.blendMode = PIXI.blendModes.NORMAL)
        }
    }), Object.defineProperty(PIXI.DisplayObject.prototype, "cacheAsBitmap", {
        get: function() {
            return this._cacheAsBitmap
        },
        set: function(value) {
            this._cacheAsBitmap !== value && (value ? this._generateCachedSprite() : this._destroyCachedSprite(), this._cacheAsBitmap = value)
        }
    }), PIXI.DisplayObject.prototype.updateTransform = function(parent) {
        if (parent || this.parent || this.game) {
            var p = this.parent;
            parent ? p = parent : this.parent || (p = this.game.world);
            var a, b, c, d, tx, ty, pt = p.worldTransform,
                wt = this.worldTransform;
            this.rotation % PIXI.PI_2 ? (this.rotation !== this.rotationCache && (this.rotationCache = this.rotation, this._sr = Math.sin(this.rotation), this._cr = Math.cos(this.rotation)), a = this._cr * this.scale.x, b = this._sr * this.scale.x, c = -this._sr * this.scale.y, d = this._cr * this.scale.y, tx = this.position.x, ty = this.position.y, (this.pivot.x || this.pivot.y) && (tx -= this.pivot.x * a + this.pivot.y * c, ty -= this.pivot.x * b + this.pivot.y * d), wt.a = a * pt.a + b * pt.c, wt.b = a * pt.b + b * pt.d, wt.c = c * pt.a + d * pt.c, wt.d = c * pt.b + d * pt.d, wt.tx = tx * pt.a + ty * pt.c + pt.tx, wt.ty = tx * pt.b + ty * pt.d + pt.ty) : (a = this.scale.x, d = this.scale.y, tx = this.position.x - this.pivot.x * a, ty = this.position.y - this.pivot.y * d, wt.a = a * pt.a, wt.b = a * pt.b, wt.c = d * pt.c, wt.d = d * pt.d, wt.tx = tx * pt.a + ty * pt.c + pt.tx, wt.ty = tx * pt.b + ty * pt.d + pt.ty), this.worldAlpha = this.alpha * p.worldAlpha, this.worldPosition.set(wt.tx, wt.ty), this.worldScale.set(Math.sqrt(wt.a * wt.a + wt.b * wt.b), Math.sqrt(wt.c * wt.c + wt.d * wt.d)), this.worldRotation = Math.atan2(-wt.c, wt.d), this._currentBounds = null, this.transformCallback && this.transformCallback.call(this.transformCallbackContext, wt, pt)
        }
    }, PIXI.DisplayObject.prototype.displayObjectUpdateTransform = PIXI.DisplayObject.prototype.updateTransform, PIXI.DisplayObject.prototype.getBounds = function(matrix) {
        return matrix = matrix, PIXI.EmptyRectangle
    }, PIXI.DisplayObject.prototype.getLocalBounds = function() {
        return this.getBounds(PIXI.identityMatrix)
    }, PIXI.DisplayObject.prototype.setStageReference = function(stage) {
        this.stage = stage
    }, PIXI.DisplayObject.prototype.preUpdate = function() {}, PIXI.DisplayObject.prototype.generateTexture = function(resolution, scaleMode, renderer) {
        var bounds = this.getLocalBounds(),
            renderTexture = new PIXI.RenderTexture(0 | bounds.width, 0 | bounds.height, renderer, scaleMode, resolution);
        return PIXI.DisplayObject._tempMatrix.tx = -bounds.x, PIXI.DisplayObject._tempMatrix.ty = -bounds.y, renderTexture.render(this, PIXI.DisplayObject._tempMatrix), renderTexture
    }, PIXI.DisplayObject.prototype.updateCache = function() {
        this._generateCachedSprite()
    }, PIXI.DisplayObject.prototype.toGlobal = function(position) {
        return this.displayObjectUpdateTransform(), this.worldTransform.apply(position)
    }, PIXI.DisplayObject.prototype.toLocal = function(position, from) {
        return from && (position = from.toGlobal(position)), this.displayObjectUpdateTransform(), this.worldTransform.applyInverse(position)
    }, PIXI.DisplayObject.prototype._renderCachedSprite = function(renderSession) {
        this._cachedSprite.worldAlpha = this.worldAlpha, renderSession.gl ? PIXI.Sprite.prototype._renderWebGL.call(this._cachedSprite, renderSession) : PIXI.Sprite.prototype._renderCanvas.call(this._cachedSprite, renderSession)
    }, PIXI.DisplayObject.prototype._generateCachedSprite = function() {
        this._cacheAsBitmap = !1;
        var bounds = this.getLocalBounds();
        if (this.updateTransform(), this._cachedSprite) this._cachedSprite.texture.resize(1 | bounds.width, 1 | bounds.height);
        else {
            var renderTexture = new PIXI.RenderTexture(1 | bounds.width, 1 | bounds.height);
            this._cachedSprite = new PIXI.Sprite(renderTexture), this._cachedSprite.worldTransform = this.worldTransform
        }
        var tempFilters = this._filters;
        this._filters = null, this._cachedSprite.filters = tempFilters, PIXI.DisplayObject._tempMatrix.tx = -bounds.x, PIXI.DisplayObject._tempMatrix.ty = -bounds.y, this._cachedSprite.texture.render(this, PIXI.DisplayObject._tempMatrix, !0), this._cachedSprite.anchor.x = -(bounds.x / bounds.width), this._cachedSprite.anchor.y = -(bounds.y / bounds.height), this._filters = tempFilters, this._cacheAsBitmap = !0
    }, PIXI.DisplayObject.prototype._destroyCachedSprite = function() {
        this._cachedSprite && (this._cachedSprite.texture.destroy(!0), this._cachedSprite = null)
    }, PIXI.DisplayObject.prototype._renderWebGL = function(renderSession) {
        renderSession = renderSession
    }, PIXI.DisplayObject.prototype._renderCanvas = function(renderSession) {
        renderSession = renderSession
    }, Object.defineProperty(PIXI.DisplayObject.prototype, "x", {
        get: function() {
            return this.position.x
        },
        set: function(value) {
            this.position.x = value
        }
    }), Object.defineProperty(PIXI.DisplayObject.prototype, "y", {
        get: function() {
            return this.position.y
        },
        set: function(value) {
            this.position.y = value
        }
    }), PIXI.DisplayObjectContainer = function() {
        PIXI.DisplayObject.call(this), this.children = []
    }, PIXI.DisplayObjectContainer.prototype = Object.create(PIXI.DisplayObject.prototype), PIXI.DisplayObjectContainer.prototype.constructor = PIXI.DisplayObjectContainer, Object.defineProperty(PIXI.DisplayObjectContainer.prototype, "width", {
        get: function() {
            return this.scale.x * this.getLocalBounds().width
        },
        set: function(value) {
            var width = this.getLocalBounds().width;
            0 !== width ? this.scale.x = value / width : this.scale.x = 1, this._width = value
        }
    }), Object.defineProperty(PIXI.DisplayObjectContainer.prototype, "height", {
        get: function() {
            return this.scale.y * this.getLocalBounds().height
        },
        set: function(value) {
            var height = this.getLocalBounds().height;
            0 !== height ? this.scale.y = value / height : this.scale.y = 1, this._height = value
        }
    }), PIXI.DisplayObjectContainer.prototype.addChild = function(child) {
        return this.addChildAt(child, this.children.length)
    }, PIXI.DisplayObjectContainer.prototype.addChildAt = function(child, index) {
        if (index >= 0 && index <= this.children.length) return child.parent && child.parent.removeChild(child), child.parent = this, this.children.splice(index, 0, child), this.stage && child.setStageReference(this.stage), child;
        throw new Error(child + "addChildAt: The index " + index + " supplied is out of bounds " + this.children.length)
    }, PIXI.DisplayObjectContainer.prototype.swapChildren = function(child, child2) {
        if (child !== child2) {
            var index1 = this.getChildIndex(child),
                index2 = this.getChildIndex(child2);
            if (0 > index1 || 0 > index2) throw new Error("swapChildren: Both the supplied DisplayObjects must be a child of the caller.");
            this.children[index1] = child2, this.children[index2] = child
        }
    }, PIXI.DisplayObjectContainer.prototype.getChildIndex = function(child) {
        var index = this.children.indexOf(child);
        if (-1 === index) throw new Error("The supplied DisplayObject must be a child of the caller");
        return index
    }, PIXI.DisplayObjectContainer.prototype.setChildIndex = function(child, index) {
        if (0 > index || index >= this.children.length) throw new Error("The supplied index is out of bounds");
        var currentIndex = this.getChildIndex(child);
        this.children.splice(currentIndex, 1), this.children.splice(index, 0, child)
    }, PIXI.DisplayObjectContainer.prototype.getChildAt = function(index) {
        if (0 > index || index >= this.children.length) throw new Error("getChildAt: Supplied index " + index + " does not exist in the child list, or the supplied DisplayObject must be a child of the caller");
        return this.children[index]
    }, PIXI.DisplayObjectContainer.prototype.removeChild = function(child) {
        var index = this.children.indexOf(child);
        if (-1 !== index) return this.removeChildAt(index)
    }, PIXI.DisplayObjectContainer.prototype.removeChildAt = function(index) {
        var child = this.getChildAt(index);
        return this.stage && child.removeStageReference(), child.parent = void 0, this.children.splice(index, 1), child
    }, PIXI.DisplayObjectContainer.prototype.removeChildren = function(beginIndex, endIndex) {
        var begin = beginIndex || 0,
            end = "number" == typeof endIndex ? endIndex : this.children.length,
            range = end - begin;
        if (range > 0 && end >= range) {
            for (var removed = this.children.splice(begin, range), i = 0; i < removed.length; i++) {
                var child = removed[i];
                this.stage && child.removeStageReference(), child.parent = void 0
            }
            return removed
        }
        if (0 === range && 0 === this.children.length) return [];
        throw new Error("removeChildren: Range Error, numeric values are outside the acceptable range")
    }, PIXI.DisplayObjectContainer.prototype.updateTransform = function() {
        if (this.visible && (this.displayObjectUpdateTransform(), !this._cacheAsBitmap))
            for (var i = 0; i < this.children.length; i++) this.children[i].updateTransform()
    }, PIXI.DisplayObjectContainer.prototype.displayObjectContainerUpdateTransform = PIXI.DisplayObjectContainer.prototype.updateTransform, PIXI.DisplayObjectContainer.prototype.getBounds = function() {
        if (0 === this.children.length) return PIXI.EmptyRectangle;
        for (var childBounds, childMaxX, childMaxY, minX = 1 / 0, minY = 1 / 0, maxX = -(1 / 0), maxY = -(1 / 0), childVisible = !1, i = 0, j = this.children.length; j > i; i++) {
            var child = this.children[i];
            child.visible && (childVisible = !0, childBounds = this.children[i].getBounds(), minX = minX < childBounds.x ? minX : childBounds.x, minY = minY < childBounds.y ? minY : childBounds.y, childMaxX = childBounds.width + childBounds.x, childMaxY = childBounds.height + childBounds.y, maxX = maxX > childMaxX ? maxX : childMaxX, maxY = maxY > childMaxY ? maxY : childMaxY)
        }
        if (!childVisible) return PIXI.EmptyRectangle;
        var bounds = this._bounds;
        return bounds.x = minX, bounds.y = minY, bounds.width = maxX - minX, bounds.height = maxY - minY, bounds
    }, PIXI.DisplayObjectContainer.prototype.getLocalBounds = function() {
        var matrixCache = this.worldTransform;
        this.worldTransform = PIXI.identityMatrix;
        for (var i = 0, j = this.children.length; j > i; i++) this.children[i].updateTransform();
        var bounds = this.getBounds();
        return this.worldTransform = matrixCache, bounds
    }, PIXI.DisplayObjectContainer.prototype.setStageReference = function(stage) {
        this.stage = stage;
        for (var i = 0; i < this.children.length; i++) this.children[i].setStageReference(stage)
    }, PIXI.DisplayObjectContainer.prototype.removeStageReference = function() {
        for (var i = 0; i < this.children.length; i++) this.children[i].removeStageReference();
        this.stage = null
    }, PIXI.DisplayObjectContainer.prototype._renderWebGL = function(renderSession) {
        if (this.visible && !(this.alpha <= 0)) {
            if (this._cacheAsBitmap) return void this._renderCachedSprite(renderSession);
            var i;
            if (this._mask || this._filters) {
                for (this._filters && (renderSession.spriteBatch.flush(), renderSession.filterManager.pushFilter(this._filterBlock)), this._mask && (renderSession.spriteBatch.stop(), renderSession.maskManager.pushMask(this.mask, renderSession), renderSession.spriteBatch.start()), i = 0; i < this.children.length; i++) this.children[i]._renderWebGL(renderSession);
                renderSession.spriteBatch.stop(), this._mask && renderSession.maskManager.popMask(this._mask, renderSession), this._filters && renderSession.filterManager.popFilter(), renderSession.spriteBatch.start()
            } else
                for (i = 0; i < this.children.length; i++) this.children[i]._renderWebGL(renderSession)
        }
    }, PIXI.DisplayObjectContainer.prototype._renderCanvas = function(renderSession) {
        if (this.visible !== !1 && 0 !== this.alpha) {
            if (this._cacheAsBitmap) return void this._renderCachedSprite(renderSession);
            this._mask && renderSession.maskManager.pushMask(this._mask, renderSession);
            for (var i = 0; i < this.children.length; i++) this.children[i]._renderCanvas(renderSession);
            this._mask && renderSession.maskManager.popMask(renderSession)
        }
    }, PIXI.Sprite = function(texture) {
        PIXI.DisplayObjectContainer.call(this), this.anchor = new PIXI.Point, this.texture = texture || PIXI.Texture.emptyTexture, this._width = 0, this._height = 0, this.tint = 16777215, this.cachedTint = -1, this.tintedTexture = null, this.blendMode = PIXI.blendModes.NORMAL, this.shader = null, this.texture.baseTexture.hasLoaded && this.onTextureUpdate(), this.renderable = !0
    }, PIXI.Sprite.prototype = Object.create(PIXI.DisplayObjectContainer.prototype), PIXI.Sprite.prototype.constructor = PIXI.Sprite, Object.defineProperty(PIXI.Sprite.prototype, "width", {
        get: function() {
            return this.scale.x * this.texture.frame.width
        },
        set: function(value) {
            this.scale.x = value / this.texture.frame.width, this._width = value
        }
    }), Object.defineProperty(PIXI.Sprite.prototype, "height", {
        get: function() {
            return this.scale.y * this.texture.frame.height
        },
        set: function(value) {
            this.scale.y = value / this.texture.frame.height, this._height = value
        }
    }), PIXI.Sprite.prototype.setTexture = function(texture, destroyBase) {
        void 0 !== destroyBase && this.texture.baseTexture.destroy(), this.texture = texture, this.texture.valid = !0
    }, PIXI.Sprite.prototype.onTextureUpdate = function() {
        this._width && (this.scale.x = this._width / this.texture.frame.width), this._height && (this.scale.y = this._height / this.texture.frame.height)
    }, PIXI.Sprite.prototype.getBounds = function(matrix) {
        var width = this.texture.frame.width,
            height = this.texture.frame.height,
            w0 = width * (1 - this.anchor.x),
            w1 = width * -this.anchor.x,
            h0 = height * (1 - this.anchor.y),
            h1 = height * -this.anchor.y,
            worldTransform = matrix || this.worldTransform,
            a = worldTransform.a,
            b = worldTransform.b,
            c = worldTransform.c,
            d = worldTransform.d,
            tx = worldTransform.tx,
            ty = worldTransform.ty,
            maxX = -(1 / 0),
            maxY = -(1 / 0),
            minX = 1 / 0,
            minY = 1 / 0;
        if (0 === b && 0 === c) {
            if (0 > a) {
                a *= -1;
                var temp = w0;
                w0 = -w1, w1 = -temp
            }
            if (0 > d) {
                d *= -1;
                var temp = h0;
                h0 = -h1, h1 = -temp
            }
            minX = a * w1 + tx, maxX = a * w0 + tx, minY = d * h1 + ty, maxY = d * h0 + ty
        } else {
            var x1 = a * w1 + c * h1 + tx,
                y1 = d * h1 + b * w1 + ty,
                x2 = a * w0 + c * h1 + tx,
                y2 = d * h1 + b * w0 + ty,
                x3 = a * w0 + c * h0 + tx,
                y3 = d * h0 + b * w0 + ty,
                x4 = a * w1 + c * h0 + tx,
                y4 = d * h0 + b * w1 + ty;
            minX = minX > x1 ? x1 : minX, minX = minX > x2 ? x2 : minX, minX = minX > x3 ? x3 : minX, minX = minX > x4 ? x4 : minX, minY = minY > y1 ? y1 : minY, minY = minY > y2 ? y2 : minY, minY = minY > y3 ? y3 : minY, minY = minY > y4 ? y4 : minY, maxX = x1 > maxX ? x1 : maxX, maxX = x2 > maxX ? x2 : maxX, maxX = x3 > maxX ? x3 : maxX, maxX = x4 > maxX ? x4 : maxX, maxY = y1 > maxY ? y1 : maxY, maxY = y2 > maxY ? y2 : maxY, maxY = y3 > maxY ? y3 : maxY, maxY = y4 > maxY ? y4 : maxY
        }
        var bounds = this._bounds;
        return bounds.x = minX, bounds.width = maxX - minX, bounds.y = minY, bounds.height = maxY - minY, this._currentBounds = bounds, bounds
    }, PIXI.Sprite.prototype._renderWebGL = function(renderSession, matrix) {
        if (this.visible && !(this.alpha <= 0) && this.renderable) {
            var wt = this.worldTransform;
            if (matrix && (wt = matrix), this._mask || this._filters) {
                var spriteBatch = renderSession.spriteBatch;
                this._filters && (spriteBatch.flush(), renderSession.filterManager.pushFilter(this._filterBlock)), this._mask && (spriteBatch.stop(), renderSession.maskManager.pushMask(this.mask, renderSession), spriteBatch.start()), spriteBatch.render(this);
                for (var i = 0; i < this.children.length; i++) this.children[i]._renderWebGL(renderSession);
                spriteBatch.stop(), this._mask && renderSession.maskManager.popMask(this._mask, renderSession), this._filters && renderSession.filterManager.popFilter(), spriteBatch.start()
            } else {
                renderSession.spriteBatch.render(this);
                for (var i = 0; i < this.children.length; i++) this.children[i]._renderWebGL(renderSession, wt)
            }
        }
    }, PIXI.Sprite.prototype._renderCanvas = function(renderSession, matrix) {
        if (!(!this.visible || 0 === this.alpha || !this.renderable || this.texture.crop.width <= 0 || this.texture.crop.height <= 0)) {
            var wt = this.worldTransform;
            if (matrix && (wt = matrix), this.blendMode !== renderSession.currentBlendMode && (renderSession.currentBlendMode = this.blendMode, renderSession.context.globalCompositeOperation = PIXI.blendModesCanvas[renderSession.currentBlendMode]), this._mask && renderSession.maskManager.pushMask(this._mask, renderSession), this.texture.valid) {
                var resolution = this.texture.baseTexture.resolution / renderSession.resolution;
                renderSession.context.globalAlpha = this.worldAlpha, renderSession.smoothProperty && renderSession.scaleMode !== this.texture.baseTexture.scaleMode && (renderSession.scaleMode = this.texture.baseTexture.scaleMode, renderSession.context[renderSession.smoothProperty] = renderSession.scaleMode === PIXI.scaleModes.LINEAR);
                var dx = this.texture.trim ? this.texture.trim.x - this.anchor.x * this.texture.trim.width : this.anchor.x * -this.texture.frame.width,
                    dy = this.texture.trim ? this.texture.trim.y - this.anchor.y * this.texture.trim.height : this.anchor.y * -this.texture.frame.height;
                renderSession.roundPixels ? (renderSession.context.setTransform(wt.a, wt.b, wt.c, wt.d, wt.tx * renderSession.resolution | 0, wt.ty * renderSession.resolution | 0), dx |= 0, dy |= 0) : renderSession.context.setTransform(wt.a, wt.b, wt.c, wt.d, wt.tx * renderSession.resolution, wt.ty * renderSession.resolution);
                var cw = this.texture.crop.width,
                    ch = this.texture.crop.height;
                if (dx /= resolution, dy /= resolution, 16777215 !== this.tint)(this.texture.requiresReTint || this.cachedTint !== this.tint) && (this.tintedTexture = PIXI.CanvasTinter.getTintedTexture(this, this.tint), this.cachedTint = this.tint), renderSession.context.drawImage(this.tintedTexture, 0, 0, cw, ch, dx, dy, cw / resolution, ch / resolution);
                else {
                    var cx = this.texture.crop.x,
                        cy = this.texture.crop.y;
                    renderSession.context.drawImage(this.texture.baseTexture.source, cx, cy, cw, ch, dx, dy, cw / resolution, ch / resolution)
                }
            }
            for (var i = 0; i < this.children.length; i++) this.children[i]._renderCanvas(renderSession);
            this._mask && renderSession.maskManager.popMask(renderSession)
        }
    }, PIXI.Sprite.fromFrame = function(frameId) {
        var texture = PIXI.TextureCache[frameId];
        if (!texture) throw new Error('The frameId "' + frameId + '" does not exist in the texture cache' + this);
        return new PIXI.Sprite(texture)
    }, PIXI.Sprite.fromImage = function(imageId, crossorigin, scaleMode) {
        var texture = PIXI.Texture.fromImage(imageId, crossorigin, scaleMode);
        return new PIXI.Sprite(texture)
    }, PIXI.SpriteBatch = function(texture) {
        PIXI.DisplayObjectContainer.call(this), this.textureThing = texture, this.ready = !1
    }, PIXI.SpriteBatch.prototype = Object.create(PIXI.DisplayObjectContainer.prototype), PIXI.SpriteBatch.prototype.constructor = PIXI.SpriteBatch, PIXI.SpriteBatch.prototype.initWebGL = function(gl) {
        this.fastSpriteBatch = new PIXI.WebGLFastSpriteBatch(gl), this.ready = !0
    }, PIXI.SpriteBatch.prototype.updateTransform = function() {
        this.displayObjectUpdateTransform()
    }, PIXI.SpriteBatch.prototype._renderWebGL = function(renderSession) {
        !this.visible || this.alpha <= 0 || !this.children.length || (this.ready || this.initWebGL(renderSession.gl), this.fastSpriteBatch.gl !== renderSession.gl && this.fastSpriteBatch.setContext(renderSession.gl), renderSession.spriteBatch.stop(), renderSession.shaderManager.setShader(renderSession.shaderManager.fastShader), this.fastSpriteBatch.begin(this, renderSession), this.fastSpriteBatch.render(this), renderSession.spriteBatch.start())
    }, PIXI.SpriteBatch.prototype._renderCanvas = function(renderSession) {
        if (this.visible && !(this.alpha <= 0) && this.children.length) {
            var context = renderSession.context;
            context.globalAlpha = this.worldAlpha, this.displayObjectUpdateTransform();
            for (var transform = this.worldTransform, isRotated = !0, i = 0; i < this.children.length; i++) {
                var child = this.children[i];
                if (child.visible) {
                    var texture = child.texture,
                        frame = texture.frame;
                    if (context.globalAlpha = this.worldAlpha * child.alpha, child.rotation % (2 * Math.PI) === 0) isRotated && (context.setTransform(transform.a, transform.b, transform.c, transform.d, transform.tx, transform.ty), isRotated = !1), context.drawImage(texture.baseTexture.source, frame.x, frame.y, frame.width, frame.height, child.anchor.x * (-frame.width * child.scale.x) + child.position.x + .5 | 0, child.anchor.y * (-frame.height * child.scale.y) + child.position.y + .5 | 0, frame.width * child.scale.x, frame.height * child.scale.y);
                    else {
                        isRotated || (isRotated = !0), child.displayObjectUpdateTransform();
                        var childTransform = child.worldTransform;
                        renderSession.roundPixels ? context.setTransform(childTransform.a, childTransform.b, childTransform.c, childTransform.d, 0 | childTransform.tx, 0 | childTransform.ty) : context.setTransform(childTransform.a, childTransform.b, childTransform.c, childTransform.d, childTransform.tx, childTransform.ty), context.drawImage(texture.baseTexture.source, frame.x, frame.y, frame.width, frame.height, child.anchor.x * -frame.width + .5 | 0, child.anchor.y * -frame.height + .5 | 0, frame.width, frame.height)
                    }
                }
            }
        }
    }, PIXI.hex2rgb = function(hex) {
        return [(hex >> 16 & 255) / 255, (hex >> 8 & 255) / 255, (255 & hex) / 255]
    }, PIXI.rgb2hex = function(rgb) {
        return (255 * rgb[0] << 16) + (255 * rgb[1] << 8) + 255 * rgb[2]
    }, PIXI.canUseNewCanvasBlendModes = function() {
        if (void 0 === document) return !1;
        var pngHead = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAABAQMAAADD8p2OAAAAA1BMVEX/",
            pngEnd = "AAAACklEQVQI12NgAAAAAgAB4iG8MwAAAABJRU5ErkJggg==",
            magenta = new Image;
        magenta.src = pngHead + "AP804Oa6" + pngEnd;
        var yellow = new Image;
        yellow.src = pngHead + "/wCKxvRF" + pngEnd;
        var canvas = PIXI.CanvasPool.create(this, 6, 1),
            context = canvas.getContext("2d");
        if (context.globalCompositeOperation = "multiply", context.drawImage(magenta, 0, 0), context.drawImage(yellow, 2, 0), !context.getImageData(2, 0, 1, 1)) return !1;
        var data = context.getImageData(2, 0, 1, 1).data;
        return PIXI.CanvasPool.remove(this), 255 === data[0] && 0 === data[1] && 0 === data[2]
    }, PIXI.getNextPowerOfTwo = function(number) {
        if (number > 0 && 0 === (number & number - 1)) return number;
        for (var result = 1; number > result;) result <<= 1;
        return result
    }, PIXI.isPowerOfTwo = function(width, height) {
        return width > 0 && 0 === (width & width - 1) && height > 0 && 0 === (height & height - 1)
    }, PIXI.CanvasPool = {
        create: function(parent, width, height) {
            var canvas, idx = PIXI.CanvasPool.getFirst();
            if (-1 === idx) {
                var container = {
                    parent: parent,
                    canvas: document.createElement("canvas")
                };
                PIXI.CanvasPool.pool.push(container), canvas = container.canvas
            } else PIXI.CanvasPool.pool[idx].parent = parent, canvas = PIXI.CanvasPool.pool[idx].canvas;
            return void 0 !== width && (canvas.width = width, canvas.height = height), canvas
        },
        getFirst: function() {
            for (var pool = PIXI.CanvasPool.pool, i = 0; i < pool.length; i++)
                if (null === pool[i].parent) return i;
            return -1
        },
        remove: function(parent) {
            for (var pool = PIXI.CanvasPool.pool, i = 0; i < pool.length; i++) pool[i].parent === parent && (pool[i].parent = null)
        },
        removeByCanvas: function(canvas) {
            for (var pool = PIXI.CanvasPool.pool, i = 0; i < pool.length; i++) pool[i].canvas === canvas && (pool[i].parent = null)
        },
        getTotal: function() {
            for (var pool = PIXI.CanvasPool.pool, c = 0, i = 0; i < pool.length; i++) null !== pool[i].parent && c++;
            return c
        },
        getFree: function() {
            for (var pool = PIXI.CanvasPool.pool, c = 0, i = 0; i < pool.length; i++) null === pool[i].parent && c++;
            return c
        }
    }, PIXI.CanvasPool.pool = [], PIXI.initDefaultShaders = function() {}, PIXI.CompileVertexShader = function(gl, shaderSrc) {
        return PIXI._CompileShader(gl, shaderSrc, gl.VERTEX_SHADER)
    }, PIXI.CompileFragmentShader = function(gl, shaderSrc) {
        return PIXI._CompileShader(gl, shaderSrc, gl.FRAGMENT_SHADER)
    }, PIXI._CompileShader = function(gl, shaderSrc, shaderType) {
        var src = shaderSrc;
        Array.isArray(shaderSrc) && (src = shaderSrc.join("\n"));
        var shader = gl.createShader(shaderType);
        return gl.shaderSource(shader, src), gl.compileShader(shader), gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : (window.console.log(gl.getShaderInfoLog(shader)), null)
    }, PIXI.compileProgram = function(gl, vertexSrc, fragmentSrc) {
        var fragmentShader = PIXI.CompileFragmentShader(gl, fragmentSrc),
            vertexShader = PIXI.CompileVertexShader(gl, vertexSrc),
            shaderProgram = gl.createProgram();
        return gl.attachShader(shaderProgram, vertexShader), gl.attachShader(shaderProgram, fragmentShader), gl.linkProgram(shaderProgram), gl.getProgramParameter(shaderProgram, gl.LINK_STATUS) || window.console.log("Could not initialise shaders"), shaderProgram
    }, PIXI.PixiShader = function(gl) {
        this._UID = PIXI._UID++, this.gl = gl, this.program = null, this.fragmentSrc = ["precision lowp float;", "varying vec2 vTextureCoord;", "varying vec4 vColor;", "uniform sampler2D uSampler;", "void main(void) {", "   gl_FragColor = texture2D(uSampler, vTextureCoord) * vColor ;", "}"], this.textureCount = 0, this.firstRun = !0, this.dirty = !0, this.attributes = [], this.init()
    }, PIXI.PixiShader.prototype.constructor = PIXI.PixiShader, PIXI.PixiShader.prototype.init = function() {
        var gl = this.gl,
            program = PIXI.compileProgram(gl, this.vertexSrc || PIXI.PixiShader.defaultVertexSrc, this.fragmentSrc);
        gl.useProgram(program), this.uSampler = gl.getUniformLocation(program, "uSampler"), this.projectionVector = gl.getUniformLocation(program, "projectionVector"), this.offsetVector = gl.getUniformLocation(program, "offsetVector"), this.dimensions = gl.getUniformLocation(program, "dimensions"), this.aVertexPosition = gl.getAttribLocation(program, "aVertexPosition"), this.aTextureCoord = gl.getAttribLocation(program, "aTextureCoord"), this.colorAttribute = gl.getAttribLocation(program, "aColor"), -1 === this.colorAttribute && (this.colorAttribute = 2), this.attributes = [this.aVertexPosition, this.aTextureCoord, this.colorAttribute];
        for (var key in this.uniforms) this.uniforms[key].uniformLocation = gl.getUniformLocation(program, key);
        this.initUniforms(), this.program = program
    }, PIXI.PixiShader.prototype.initUniforms = function() {
        this.textureCount = 1;
        var uniform, gl = this.gl;
        for (var key in this.uniforms) {
            uniform = this.uniforms[key];
            var type = uniform.type;
            "sampler2D" === type ? (uniform._init = !1, null !== uniform.value && this.initSampler2D(uniform)) : "mat2" === type || "mat3" === type || "mat4" === type ? (uniform.glMatrix = !0, uniform.glValueLength = 1, "mat2" === type ? uniform.glFunc = gl.uniformMatrix2fv : "mat3" === type ? uniform.glFunc = gl.uniformMatrix3fv : "mat4" === type && (uniform.glFunc = gl.uniformMatrix4fv)) : (uniform.glFunc = gl["uniform" + type], "2f" === type || "2i" === type ? uniform.glValueLength = 2 : "3f" === type || "3i" === type ? uniform.glValueLength = 3 : "4f" === type || "4i" === type ? uniform.glValueLength = 4 : uniform.glValueLength = 1)
        }
    }, PIXI.PixiShader.prototype.initSampler2D = function(uniform) {
        if (uniform.value && uniform.value.baseTexture && uniform.value.baseTexture.hasLoaded) {
            var gl = this.gl;
            if (gl.activeTexture(gl["TEXTURE" + this.textureCount]), gl.bindTexture(gl.TEXTURE_2D, uniform.value.baseTexture._glTextures[gl.id]), uniform.textureData) {
                var data = uniform.textureData,
                    magFilter = data.magFilter ? data.magFilter : gl.LINEAR,
                    minFilter = data.minFilter ? data.minFilter : gl.LINEAR,
                    wrapS = data.wrapS ? data.wrapS : gl.CLAMP_TO_EDGE,
                    wrapT = data.wrapT ? data.wrapT : gl.CLAMP_TO_EDGE,
                    format = data.luminance ? gl.LUMINANCE : gl.RGBA;
                if (data.repeat && (wrapS = gl.REPEAT, wrapT = gl.REPEAT), gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, !!data.flipY), data.width) {
                    var width = data.width ? data.width : 512,
                        height = data.height ? data.height : 2,
                        border = data.border ? data.border : 0;
                    gl.texImage2D(gl.TEXTURE_2D, 0, format, width, height, border, format, gl.UNSIGNED_BYTE, null)
                } else gl.texImage2D(gl.TEXTURE_2D, 0, format, gl.RGBA, gl.UNSIGNED_BYTE, uniform.value.baseTexture.source);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, magFilter), gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilter), gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapS), gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapT)
            }
            gl.uniform1i(uniform.uniformLocation, this.textureCount), uniform._init = !0, this.textureCount++
        }
    }, PIXI.PixiShader.prototype.syncUniforms = function() {
        this.textureCount = 1;
        var uniform, gl = this.gl;
        for (var key in this.uniforms) uniform = this.uniforms[key], 1 === uniform.glValueLength ? uniform.glMatrix === !0 ? uniform.glFunc.call(gl, uniform.uniformLocation, uniform.transpose, uniform.value) : uniform.glFunc.call(gl, uniform.uniformLocation, uniform.value) : 2 === uniform.glValueLength ? uniform.glFunc.call(gl, uniform.uniformLocation, uniform.value.x, uniform.value.y) : 3 === uniform.glValueLength ? uniform.glFunc.call(gl, uniform.uniformLocation, uniform.value.x, uniform.value.y, uniform.value.z) : 4 === uniform.glValueLength ? uniform.glFunc.call(gl, uniform.uniformLocation, uniform.value.x, uniform.value.y, uniform.value.z, uniform.value.w) : "sampler2D" === uniform.type && (uniform._init ? (gl.activeTexture(gl["TEXTURE" + this.textureCount]), uniform.value.baseTexture._dirty[gl.id] ? PIXI.instances[gl.id].updateTexture(uniform.value.baseTexture) : gl.bindTexture(gl.TEXTURE_2D, uniform.value.baseTexture._glTextures[gl.id]), gl.uniform1i(uniform.uniformLocation, this.textureCount), this.textureCount++) : this.initSampler2D(uniform))
    }, PIXI.PixiShader.prototype.destroy = function() {
        this.gl.deleteProgram(this.program), this.uniforms = null, this.gl = null, this.attributes = null
    }, PIXI.PixiShader.defaultVertexSrc = ["attribute vec2 aVertexPosition;", "attribute vec2 aTextureCoord;", "attribute vec4 aColor;", "uniform vec2 projectionVector;", "uniform vec2 offsetVector;", "varying vec2 vTextureCoord;", "varying vec4 vColor;", "const vec2 center = vec2(-1.0, 1.0);", "void main(void) {", "   gl_Position = vec4( ((aVertexPosition + offsetVector) / projectionVector) + center , 0.0, 1.0);", "   vTextureCoord = aTextureCoord;", "   vColor = vec4(aColor.rgb * aColor.a, aColor.a);", "}"], PIXI.PixiFastShader = function(gl) {
        this._UID = PIXI._UID++, this.gl = gl, this.program = null, this.fragmentSrc = ["precision lowp float;", "varying vec2 vTextureCoord;", "varying float vColor;", "uniform sampler2D uSampler;", "void main(void) {", "   gl_FragColor = texture2D(uSampler, vTextureCoord) * vColor ;", "}"], this.vertexSrc = ["attribute vec2 aVertexPosition;", "attribute vec2 aPositionCoord;", "attribute vec2 aScale;", "attribute float aRotation;", "attribute vec2 aTextureCoord;", "attribute float aColor;", "uniform vec2 projectionVector;", "uniform vec2 offsetVector;", "uniform mat3 uMatrix;", "varying vec2 vTextureCoord;", "varying float vColor;", "const vec2 center = vec2(-1.0, 1.0);", "void main(void) {", "   vec2 v;", "   vec2 sv = aVertexPosition * aScale;", "   v.x = (sv.x) * cos(aRotation) - (sv.y) * sin(aRotation);", "   v.y = (sv.x) * sin(aRotation) + (sv.y) * cos(aRotation);", "   v = ( uMatrix * vec3(v + aPositionCoord , 1.0) ).xy ;", "   gl_Position = vec4( ( v / projectionVector) + center , 0.0, 1.0);", "   vTextureCoord = aTextureCoord;", "   vColor = aColor;", "}"], this.textureCount = 0, this.init()
    }, PIXI.PixiFastShader.prototype.constructor = PIXI.PixiFastShader, PIXI.PixiFastShader.prototype.init = function() {
        var gl = this.gl,
            program = PIXI.compileProgram(gl, this.vertexSrc, this.fragmentSrc);
        gl.useProgram(program), this.uSampler = gl.getUniformLocation(program, "uSampler"), this.projectionVector = gl.getUniformLocation(program, "projectionVector"), this.offsetVector = gl.getUniformLocation(program, "offsetVector"), this.dimensions = gl.getUniformLocation(program, "dimensions"), this.uMatrix = gl.getUniformLocation(program, "uMatrix"), this.aVertexPosition = gl.getAttribLocation(program, "aVertexPosition"), this.aPositionCoord = gl.getAttribLocation(program, "aPositionCoord"), this.aScale = gl.getAttribLocation(program, "aScale"), this.aRotation = gl.getAttribLocation(program, "aRotation"), this.aTextureCoord = gl.getAttribLocation(program, "aTextureCoord"), this.colorAttribute = gl.getAttribLocation(program, "aColor"), -1 === this.colorAttribute && (this.colorAttribute = 2), this.attributes = [this.aVertexPosition, this.aPositionCoord, this.aScale, this.aRotation, this.aTextureCoord, this.colorAttribute], this.program = program
    }, PIXI.PixiFastShader.prototype.destroy = function() {
        this.gl.deleteProgram(this.program), this.uniforms = null, this.gl = null, this.attributes = null
    }, PIXI.StripShader = function(gl) {
        this._UID = PIXI._UID++, this.gl = gl, this.program = null, this.fragmentSrc = ["precision mediump float;", "varying vec2 vTextureCoord;", "uniform float alpha;", "uniform sampler2D uSampler;", "void main(void) {", "   gl_FragColor = texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y)) * alpha;", "}"], this.vertexSrc = ["attribute vec2 aVertexPosition;", "attribute vec2 aTextureCoord;", "uniform mat3 translationMatrix;", "uniform vec2 projectionVector;", "uniform vec2 offsetVector;", "varying vec2 vTextureCoord;", "void main(void) {", "   vec3 v = translationMatrix * vec3(aVertexPosition , 1.0);", "   v -= offsetVector.xyx;", "   gl_Position = vec4( v.x / projectionVector.x -1.0, v.y / -projectionVector.y + 1.0 , 0.0, 1.0);", "   vTextureCoord = aTextureCoord;", "}"], this.init()
    }, PIXI.StripShader.prototype.constructor = PIXI.StripShader, PIXI.StripShader.prototype.init = function() {
        var gl = this.gl,
            program = PIXI.compileProgram(gl, this.vertexSrc, this.fragmentSrc);
        gl.useProgram(program), this.uSampler = gl.getUniformLocation(program, "uSampler"), this.projectionVector = gl.getUniformLocation(program, "projectionVector"), this.offsetVector = gl.getUniformLocation(program, "offsetVector"), this.colorAttribute = gl.getAttribLocation(program, "aColor"), this.aVertexPosition = gl.getAttribLocation(program, "aVertexPosition"), this.aTextureCoord = gl.getAttribLocation(program, "aTextureCoord"), this.attributes = [this.aVertexPosition, this.aTextureCoord], this.translationMatrix = gl.getUniformLocation(program, "translationMatrix"), this.alpha = gl.getUniformLocation(program, "alpha"), this.program = program
    }, PIXI.StripShader.prototype.destroy = function() {
        this.gl.deleteProgram(this.program), this.uniforms = null, this.gl = null, this.attribute = null
    }, PIXI.PrimitiveShader = function(gl) {
        this._UID = PIXI._UID++, this.gl = gl, this.program = null, this.fragmentSrc = ["precision mediump float;", "varying vec4 vColor;", "void main(void) {", "   gl_FragColor = vColor;", "}"], this.vertexSrc = ["attribute vec2 aVertexPosition;", "attribute vec4 aColor;", "uniform mat3 translationMatrix;", "uniform vec2 projectionVector;", "uniform vec2 offsetVector;", "uniform float alpha;", "uniform float flipY;", "uniform vec3 tint;", "varying vec4 vColor;", "void main(void) {", "   vec3 v = translationMatrix * vec3(aVertexPosition , 1.0);", "   v -= offsetVector.xyx;", "   gl_Position = vec4( v.x / projectionVector.x -1.0, (v.y / projectionVector.y * -flipY) + flipY , 0.0, 1.0);", "   vColor = aColor * vec4(tint * alpha, alpha);", "}"], this.init()
    }, PIXI.PrimitiveShader.prototype.constructor = PIXI.PrimitiveShader, PIXI.PrimitiveShader.prototype.init = function() {
        var gl = this.gl,
            program = PIXI.compileProgram(gl, this.vertexSrc, this.fragmentSrc);
        gl.useProgram(program), this.projectionVector = gl.getUniformLocation(program, "projectionVector"), this.offsetVector = gl.getUniformLocation(program, "offsetVector"), this.tintColor = gl.getUniformLocation(program, "tint"), this.flipY = gl.getUniformLocation(program, "flipY"), this.aVertexPosition = gl.getAttribLocation(program, "aVertexPosition"), this.colorAttribute = gl.getAttribLocation(program, "aColor"), this.attributes = [this.aVertexPosition, this.colorAttribute], this.translationMatrix = gl.getUniformLocation(program, "translationMatrix"), this.alpha = gl.getUniformLocation(program, "alpha"), this.program = program
    }, PIXI.PrimitiveShader.prototype.destroy = function() {
        this.gl.deleteProgram(this.program), this.uniforms = null, this.gl = null, this.attributes = null
    }, PIXI.ComplexPrimitiveShader = function(gl) {
        this._UID = PIXI._UID++, this.gl = gl, this.program = null, this.fragmentSrc = ["precision mediump float;", "varying vec4 vColor;", "void main(void) {", "   gl_FragColor = vColor;", "}"], this.vertexSrc = ["attribute vec2 aVertexPosition;", "uniform mat3 translationMatrix;", "uniform vec2 projectionVector;", "uniform vec2 offsetVector;", "uniform vec3 tint;", "uniform float alpha;", "uniform vec3 color;", "uniform float flipY;", "varying vec4 vColor;", "void main(void) {", "   vec3 v = translationMatrix * vec3(aVertexPosition , 1.0);", "   v -= offsetVector.xyx;", "   gl_Position = vec4( v.x / projectionVector.x -1.0, (v.y / projectionVector.y * -flipY) + flipY , 0.0, 1.0);", "   vColor = vec4(color * alpha * tint, alpha);", "}"], this.init()
    }, PIXI.ComplexPrimitiveShader.prototype.constructor = PIXI.ComplexPrimitiveShader, PIXI.ComplexPrimitiveShader.prototype.init = function() {
        var gl = this.gl,
            program = PIXI.compileProgram(gl, this.vertexSrc, this.fragmentSrc);
        gl.useProgram(program), this.projectionVector = gl.getUniformLocation(program, "projectionVector"), this.offsetVector = gl.getUniformLocation(program, "offsetVector"), this.tintColor = gl.getUniformLocation(program, "tint"), this.color = gl.getUniformLocation(program, "color"), this.flipY = gl.getUniformLocation(program, "flipY"), this.aVertexPosition = gl.getAttribLocation(program, "aVertexPosition"), this.attributes = [this.aVertexPosition, this.colorAttribute], this.translationMatrix = gl.getUniformLocation(program, "translationMatrix"), this.alpha = gl.getUniformLocation(program, "alpha"), this.program = program
    }, PIXI.ComplexPrimitiveShader.prototype.destroy = function() {
        this.gl.deleteProgram(this.program), this.uniforms = null, this.gl = null, this.attribute = null
    }, PIXI.glContexts = [], PIXI.instances = [], PIXI.WebGLRenderer = function(game) {
        this.game = game, PIXI.defaultRenderer || (PIXI.defaultRenderer = this), this.type = PIXI.WEBGL_RENDERER, this.resolution = game.resolution, this.transparent = game.transparent, this.autoResize = !1, this.preserveDrawingBuffer = game.preserveDrawingBuffer, this.clearBeforeRender = game.clearBeforeRender, this.width = game.width, this.height = game.height, this.view = game.canvas, this._contextOptions = {
            alpha: this.transparent,
            antialias: game.antialias,
            premultipliedAlpha: this.transparent && "notMultiplied" !== this.transparent,
            stencil: !0,
            preserveDrawingBuffer: this.preserveDrawingBuffer
        }, this.projection = new PIXI.Point, this.offset = new PIXI.Point, this.shaderManager = new PIXI.WebGLShaderManager, this.spriteBatch = new PIXI.WebGLSpriteBatch, this.maskManager = new PIXI.WebGLMaskManager, this.filterManager = new PIXI.WebGLFilterManager, this.stencilManager = new PIXI.WebGLStencilManager, this.blendModeManager = new PIXI.WebGLBlendModeManager, this.renderSession = {}, this.renderSession.game = this.game, this.renderSession.gl = this.gl, this.renderSession.drawCount = 0, this.renderSession.shaderManager = this.shaderManager, this.renderSession.maskManager = this.maskManager, this.renderSession.filterManager = this.filterManager, this.renderSession.blendModeManager = this.blendModeManager, this.renderSession.spriteBatch = this.spriteBatch, this.renderSession.stencilManager = this.stencilManager, this.renderSession.renderer = this, this.renderSession.resolution = this.resolution, this.initContext(), this.mapBlendModes()
    }, PIXI.WebGLRenderer.prototype.constructor = PIXI.WebGLRenderer, PIXI.WebGLRenderer.prototype.initContext = function() {
        var gl = this.view.getContext("webgl", this._contextOptions) || this.view.getContext("experimental-webgl", this._contextOptions);
        if (this.gl = gl, !gl) throw new Error("This browser does not support webGL. Try using the canvas renderer");
        this.glContextId = gl.id = PIXI.WebGLRenderer.glContextId++, PIXI.glContexts[this.glContextId] = gl, PIXI.instances[this.glContextId] = this, gl.disable(gl.DEPTH_TEST), gl.disable(gl.CULL_FACE), gl.enable(gl.BLEND), this.shaderManager.setContext(gl), this.spriteBatch.setContext(gl), this.maskManager.setContext(gl), this.filterManager.setContext(gl), this.blendModeManager.setContext(gl), this.stencilManager.setContext(gl), this.renderSession.gl = this.gl, this.resize(this.width, this.height)
    }, PIXI.WebGLRenderer.prototype.render = function(stage) {
        if (!this.contextLost) {
            stage.updateTransform();
            var gl = this.gl;
            gl.viewport(0, 0, this.width, this.height), gl.bindFramebuffer(gl.FRAMEBUFFER, null), this.game.clearBeforeRender && (gl.clearColor(stage._bgColor.r, stage._bgColor.g, stage._bgColor.b, stage._bgColor.a), gl.clear(gl.COLOR_BUFFER_BIT)), this.renderDisplayObject(stage, this.projection)
        }
    }, PIXI.WebGLRenderer.prototype.renderDisplayObject = function(displayObject, projection, buffer, matrix) {
        this.renderSession.blendModeManager.setBlendMode(PIXI.blendModes.NORMAL), this.renderSession.drawCount = 0, this.renderSession.flipY = buffer ? -1 : 1, this.renderSession.projection = projection, this.renderSession.offset = this.offset, this.spriteBatch.begin(this.renderSession), this.filterManager.begin(this.renderSession, buffer), displayObject._renderWebGL(this.renderSession, matrix), this.spriteBatch.end()
    }, PIXI.WebGLRenderer.prototype.resize = function(width, height) {
        this.width = width * this.resolution, this.height = height * this.resolution, this.view.width = this.width, this.view.height = this.height, this.autoResize && (this.view.style.width = this.width / this.resolution + "px", this.view.style.height = this.height / this.resolution + "px"), this.gl.viewport(0, 0, this.width, this.height), this.projection.x = this.width / 2 / this.resolution, this.projection.y = -this.height / 2 / this.resolution
    }, PIXI.WebGLRenderer.prototype.updateTexture = function(texture) {
        if (!texture.hasLoaded) return !1;
        var gl = this.gl;
        return texture._glTextures[gl.id] || (texture._glTextures[gl.id] = gl.createTexture()), gl.bindTexture(gl.TEXTURE_2D, texture._glTextures[gl.id]), gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, texture.premultipliedAlpha), gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.source), gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, texture.scaleMode === PIXI.scaleModes.LINEAR ? gl.LINEAR : gl.NEAREST), texture.mipmap && PIXI.isPowerOfTwo(texture.width, texture.height) ? (gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, texture.scaleMode === PIXI.scaleModes.LINEAR ? gl.LINEAR_MIPMAP_LINEAR : gl.NEAREST_MIPMAP_NEAREST), gl.generateMipmap(gl.TEXTURE_2D)) : gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, texture.scaleMode === PIXI.scaleModes.LINEAR ? gl.LINEAR : gl.NEAREST), texture._powerOf2 ? (gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT), gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT)) : (gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE), gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)), texture._dirty[gl.id] = !1, !0
    }, PIXI.WebGLRenderer.prototype.destroy = function() {
        PIXI.glContexts[this.glContextId] = null, this.projection = null, this.offset = null, this.shaderManager.destroy(), this.spriteBatch.destroy(), this.maskManager.destroy(), this.filterManager.destroy(), this.shaderManager = null, this.spriteBatch = null, this.maskManager = null, this.filterManager = null, this.gl = null, this.renderSession = null, PIXI.CanvasPool.remove(this), PIXI.instances[this.glContextId] = null, PIXI.WebGLRenderer.glContextId--
    }, PIXI.WebGLRenderer.prototype.mapBlendModes = function() {
        var gl = this.gl;
        if (!PIXI.blendModesWebGL) {
            var b = [],
                modes = PIXI.blendModes;
            b[modes.NORMAL] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA], b[modes.ADD] = [gl.SRC_ALPHA, gl.DST_ALPHA], b[modes.MULTIPLY] = [gl.DST_COLOR, gl.ONE_MINUS_SRC_ALPHA], b[modes.SCREEN] = [gl.SRC_ALPHA, gl.ONE], b[modes.OVERLAY] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA], b[modes.DARKEN] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA], b[modes.LIGHTEN] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA], b[modes.COLOR_DODGE] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA], b[modes.COLOR_BURN] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA], b[modes.HARD_LIGHT] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA], b[modes.SOFT_LIGHT] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA], b[modes.DIFFERENCE] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA], b[modes.EXCLUSION] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA], b[modes.HUE] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA], b[modes.SATURATION] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA], b[modes.COLOR] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA], b[modes.LUMINOSITY] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA], PIXI.blendModesWebGL = b
        }
    }, PIXI.WebGLRenderer.glContextId = 0, PIXI.WebGLBlendModeManager = function() {
        this.currentBlendMode = 99999
    }, PIXI.WebGLBlendModeManager.prototype.constructor = PIXI.WebGLBlendModeManager, PIXI.WebGLBlendModeManager.prototype.setContext = function(gl) {
        this.gl = gl
    }, PIXI.WebGLBlendModeManager.prototype.setBlendMode = function(blendMode) {
        if (this.currentBlendMode === blendMode) return !1;
        this.currentBlendMode = blendMode;
        var blendModeWebGL = PIXI.blendModesWebGL[this.currentBlendMode];
        return blendModeWebGL && this.gl.blendFunc(blendModeWebGL[0], blendModeWebGL[1]), !0
    }, PIXI.WebGLBlendModeManager.prototype.destroy = function() {
        this.gl = null
    }, PIXI.WebGLMaskManager = function() {}, PIXI.WebGLMaskManager.prototype.constructor = PIXI.WebGLMaskManager, PIXI.WebGLMaskManager.prototype.setContext = function(gl) {
        this.gl = gl
    }, PIXI.WebGLMaskManager.prototype.pushMask = function(maskData, renderSession) {
        var gl = renderSession.gl;
        maskData.dirty && PIXI.WebGLGraphics.updateGraphics(maskData, gl), maskData._webGL[gl.id].data.length && renderSession.stencilManager.pushStencil(maskData, maskData._webGL[gl.id].data[0], renderSession)
    }, PIXI.WebGLMaskManager.prototype.popMask = function(maskData, renderSession) {
        var gl = this.gl;
        renderSession.stencilManager.popStencil(maskData, maskData._webGL[gl.id].data[0], renderSession)
    }, PIXI.WebGLMaskManager.prototype.destroy = function() {
        this.gl = null
    }, PIXI.WebGLStencilManager = function() {
        this.stencilStack = [], this.reverse = !0, this.count = 0
    }, PIXI.WebGLStencilManager.prototype.setContext = function(gl) {
        this.gl = gl
    }, PIXI.WebGLStencilManager.prototype.pushStencil = function(graphics, webGLData, renderSession) {
        var gl = this.gl;
        this.bindGraphics(graphics, webGLData, renderSession), 0 === this.stencilStack.length && (gl.enable(gl.STENCIL_TEST), gl.clear(gl.STENCIL_BUFFER_BIT), this.reverse = !0, this.count = 0), this.stencilStack.push(webGLData);
        var level = this.count;
        gl.colorMask(!1, !1, !1, !1), gl.stencilFunc(gl.ALWAYS, 0, 255), gl.stencilOp(gl.KEEP, gl.KEEP, gl.INVERT), 1 === webGLData.mode ? (gl.drawElements(gl.TRIANGLE_FAN, webGLData.indices.length - 4, gl.UNSIGNED_SHORT, 0), this.reverse ? (gl.stencilFunc(gl.EQUAL, 255 - level, 255), gl.stencilOp(gl.KEEP, gl.KEEP, gl.DECR)) : (gl.stencilFunc(gl.EQUAL, level, 255), gl.stencilOp(gl.KEEP, gl.KEEP, gl.INCR)), gl.drawElements(gl.TRIANGLE_FAN, 4, gl.UNSIGNED_SHORT, 2 * (webGLData.indices.length - 4)), this.reverse ? gl.stencilFunc(gl.EQUAL, 255 - (level + 1), 255) : gl.stencilFunc(gl.EQUAL, level + 1, 255), this.reverse = !this.reverse) : (this.reverse ? (gl.stencilFunc(gl.EQUAL, level, 255), gl.stencilOp(gl.KEEP, gl.KEEP, gl.INCR)) : (gl.stencilFunc(gl.EQUAL, 255 - level, 255), gl.stencilOp(gl.KEEP, gl.KEEP, gl.DECR)), gl.drawElements(gl.TRIANGLE_STRIP, webGLData.indices.length, gl.UNSIGNED_SHORT, 0), this.reverse ? gl.stencilFunc(gl.EQUAL, level + 1, 255) : gl.stencilFunc(gl.EQUAL, 255 - (level + 1), 255)), gl.colorMask(!0, !0, !0, !0), gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP), this.count++
    }, PIXI.WebGLStencilManager.prototype.bindGraphics = function(graphics, webGLData, renderSession) {
        this._currentGraphics = graphics;
        var shader, gl = this.gl,
            projection = renderSession.projection,
            offset = renderSession.offset;
        1 === webGLData.mode ? (shader = renderSession.shaderManager.complexPrimitiveShader, renderSession.shaderManager.setShader(shader), gl.uniform1f(shader.flipY, renderSession.flipY), gl.uniformMatrix3fv(shader.translationMatrix, !1, graphics.worldTransform.toArray(!0)), gl.uniform2f(shader.projectionVector, projection.x, -projection.y), gl.uniform2f(shader.offsetVector, -offset.x, -offset.y), gl.uniform3fv(shader.tintColor, PIXI.hex2rgb(graphics.tint)), gl.uniform3fv(shader.color, webGLData.color), gl.uniform1f(shader.alpha, graphics.worldAlpha * webGLData.alpha), gl.bindBuffer(gl.ARRAY_BUFFER, webGLData.buffer), gl.vertexAttribPointer(shader.aVertexPosition, 2, gl.FLOAT, !1, 8, 0), gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, webGLData.indexBuffer)) : (shader = renderSession.shaderManager.primitiveShader, renderSession.shaderManager.setShader(shader), gl.uniformMatrix3fv(shader.translationMatrix, !1, graphics.worldTransform.toArray(!0)), gl.uniform1f(shader.flipY, renderSession.flipY), gl.uniform2f(shader.projectionVector, projection.x, -projection.y), gl.uniform2f(shader.offsetVector, -offset.x, -offset.y), gl.uniform3fv(shader.tintColor, PIXI.hex2rgb(graphics.tint)), gl.uniform1f(shader.alpha, graphics.worldAlpha), gl.bindBuffer(gl.ARRAY_BUFFER, webGLData.buffer), gl.vertexAttribPointer(shader.aVertexPosition, 2, gl.FLOAT, !1, 24, 0), gl.vertexAttribPointer(shader.colorAttribute, 4, gl.FLOAT, !1, 24, 8), gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, webGLData.indexBuffer))
    }, PIXI.WebGLStencilManager.prototype.popStencil = function(graphics, webGLData, renderSession) {
        var gl = this.gl;
        if (this.stencilStack.pop(), this.count--, 0 === this.stencilStack.length) gl.disable(gl.STENCIL_TEST);
        else {
            var level = this.count;
            this.bindGraphics(graphics, webGLData, renderSession), gl.colorMask(!1, !1, !1, !1), 1 === webGLData.mode ? (this.reverse = !this.reverse, this.reverse ? (gl.stencilFunc(gl.EQUAL, 255 - (level + 1), 255), gl.stencilOp(gl.KEEP, gl.KEEP, gl.INCR)) : (gl.stencilFunc(gl.EQUAL, level + 1, 255), gl.stencilOp(gl.KEEP, gl.KEEP, gl.DECR)), gl.drawElements(gl.TRIANGLE_FAN, 4, gl.UNSIGNED_SHORT, 2 * (webGLData.indices.length - 4)), gl.stencilFunc(gl.ALWAYS, 0, 255), gl.stencilOp(gl.KEEP, gl.KEEP, gl.INVERT), gl.drawElements(gl.TRIANGLE_FAN, webGLData.indices.length - 4, gl.UNSIGNED_SHORT, 0), this.reverse ? gl.stencilFunc(gl.EQUAL, level, 255) : gl.stencilFunc(gl.EQUAL, 255 - level, 255)) : (this.reverse ? (gl.stencilFunc(gl.EQUAL, level + 1, 255), gl.stencilOp(gl.KEEP, gl.KEEP, gl.DECR)) : (gl.stencilFunc(gl.EQUAL, 255 - (level + 1), 255), gl.stencilOp(gl.KEEP, gl.KEEP, gl.INCR)), gl.drawElements(gl.TRIANGLE_STRIP, webGLData.indices.length, gl.UNSIGNED_SHORT, 0), this.reverse ? gl.stencilFunc(gl.EQUAL, level, 255) : gl.stencilFunc(gl.EQUAL, 255 - level, 255)), gl.colorMask(!0, !0, !0, !0), gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP)
        }
    }, PIXI.WebGLStencilManager.prototype.destroy = function() {
        this.stencilStack = null, this.gl = null
    }, PIXI.WebGLShaderManager = function() {
        this.maxAttibs = 10, this.attribState = [], this.tempAttribState = [];
        for (var i = 0; i < this.maxAttibs; i++) this.attribState[i] = !1;
        this.stack = []
    }, PIXI.WebGLShaderManager.prototype.constructor = PIXI.WebGLShaderManager, PIXI.WebGLShaderManager.prototype.setContext = function(gl) {
        this.gl = gl, this.primitiveShader = new PIXI.PrimitiveShader(gl), this.complexPrimitiveShader = new PIXI.ComplexPrimitiveShader(gl), this.defaultShader = new PIXI.PixiShader(gl), this.fastShader = new PIXI.PixiFastShader(gl), this.stripShader = new PIXI.StripShader(gl), this.setShader(this.defaultShader)
    }, PIXI.WebGLShaderManager.prototype.setAttribs = function(attribs) {
        var i;
        for (i = 0; i < this.tempAttribState.length; i++) this.tempAttribState[i] = !1;
        for (i = 0; i < attribs.length; i++) {
            var attribId = attribs[i];
            this.tempAttribState[attribId] = !0
        }
        var gl = this.gl;
        for (i = 0; i < this.attribState.length; i++) this.attribState[i] !== this.tempAttribState[i] && (this.attribState[i] = this.tempAttribState[i], this.tempAttribState[i] ? gl.enableVertexAttribArray(i) : gl.disableVertexAttribArray(i))
    }, PIXI.WebGLShaderManager.prototype.setShader = function(shader) {
        return this._currentId === shader._UID ? !1 : (this._currentId = shader._UID, this.currentShader = shader, this.gl.useProgram(shader.program), this.setAttribs(shader.attributes), !0)
    }, PIXI.WebGLShaderManager.prototype.destroy = function() {
        this.attribState = null, this.tempAttribState = null, this.primitiveShader.destroy(), this.complexPrimitiveShader.destroy(), this.defaultShader.destroy(), this.fastShader.destroy(), this.stripShader.destroy(), this.gl = null
    }, PIXI.WebGLSpriteBatch = function() {
        this.vertSize = 5, this.size = 2e3;
        var numVerts = 4 * this.size * 4 * this.vertSize,
            numIndices = 6 * this.size;
        this.vertices = new PIXI.ArrayBuffer(numVerts), this.positions = new PIXI.Float32Array(this.vertices), this.colors = new PIXI.Uint32Array(this.vertices), this.indices = new PIXI.Uint16Array(numIndices), this.lastIndexCount = 0;
        for (var i = 0, j = 0; numIndices > i; i += 6, j += 4) this.indices[i + 0] = j + 0, this.indices[i + 1] = j + 1, this.indices[i + 2] = j + 2, this.indices[i + 3] = j + 0, this.indices[i + 4] = j + 2, this.indices[i + 5] = j + 3;
        this.drawing = !1, this.currentBatchSize = 0, this.currentBaseTexture = null, this.dirty = !0, this.textures = [], this.blendModes = [], this.shaders = [], this.sprites = [], this.defaultShader = new PIXI.AbstractFilter(["precision lowp float;", "varying vec2 vTextureCoord;", "varying vec4 vColor;", "uniform sampler2D uSampler;", "void main(void) {", "   gl_FragColor = texture2D(uSampler, vTextureCoord) * vColor ;", "}"])
    }, PIXI.WebGLSpriteBatch.prototype.setContext = function(gl) {
        this.gl = gl, this.vertexBuffer = gl.createBuffer(), this.indexBuffer = gl.createBuffer(), gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer), gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW), gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer), gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.DYNAMIC_DRAW), this.currentBlendMode = 99999;
        var shader = new PIXI.PixiShader(gl);
        shader.fragmentSrc = this.defaultShader.fragmentSrc, shader.uniforms = {}, shader.init(), this.defaultShader.shaders[gl.id] = shader
    }, PIXI.WebGLSpriteBatch.prototype.begin = function(renderSession) {
        this.renderSession = renderSession, this.shader = this.renderSession.shaderManager.defaultShader, this.start()
    }, PIXI.WebGLSpriteBatch.prototype.end = function() {
        this.flush()
    }, PIXI.WebGLSpriteBatch.prototype.render = function(sprite, matrix) {
        var texture = sprite.texture,
            wt = sprite.worldTransform;
        matrix && (wt = matrix), this.currentBatchSize >= this.size && (this.flush(), this.currentBaseTexture = texture.baseTexture);
        var uvs = texture._uvs;
        if (uvs) {
            var w0, w1, h0, h1, aX = sprite.anchor.x,
                aY = sprite.anchor.y;
            if (texture.trim) {
                var trim = texture.trim;
                w1 = trim.x - aX * trim.width, w0 = w1 + texture.crop.width, h1 = trim.y - aY * trim.height, h0 = h1 + texture.crop.height
            } else w0 = texture.frame.width * (1 - aX), w1 = texture.frame.width * -aX, h0 = texture.frame.height * (1 - aY), h1 = texture.frame.height * -aY;
            var i = 4 * this.currentBatchSize * this.vertSize,
                resolution = texture.baseTexture.resolution,
                a = wt.a / resolution,
                b = wt.b / resolution,
                c = wt.c / resolution,
                d = wt.d / resolution,
                tx = wt.tx,
                ty = wt.ty,
                colors = this.colors,
                positions = this.positions;
            this.renderSession.roundPixels ? (positions[i] = a * w1 + c * h1 + tx | 0, positions[i + 1] = d * h1 + b * w1 + ty | 0, positions[i + 5] = a * w0 + c * h1 + tx | 0, positions[i + 6] = d * h1 + b * w0 + ty | 0, positions[i + 10] = a * w0 + c * h0 + tx | 0, positions[i + 11] = d * h0 + b * w0 + ty | 0, positions[i + 15] = a * w1 + c * h0 + tx | 0, positions[i + 16] = d * h0 + b * w1 + ty | 0) : (positions[i] = a * w1 + c * h1 + tx, positions[i + 1] = d * h1 + b * w1 + ty, positions[i + 5] = a * w0 + c * h1 + tx, positions[i + 6] = d * h1 + b * w0 + ty, positions[i + 10] = a * w0 + c * h0 + tx, positions[i + 11] = d * h0 + b * w0 + ty, positions[i + 15] = a * w1 + c * h0 + tx, positions[i + 16] = d * h0 + b * w1 + ty), positions[i + 2] = uvs.x0, positions[i + 3] = uvs.y0, positions[i + 7] = uvs.x1, positions[i + 8] = uvs.y1, positions[i + 12] = uvs.x2, positions[i + 13] = uvs.y2, positions[i + 17] = uvs.x3, positions[i + 18] = uvs.y3;
            var tint = sprite.tint;
            colors[i + 4] = colors[i + 9] = colors[i + 14] = colors[i + 19] = (tint >> 16) + (65280 & tint) + ((255 & tint) << 16) + (255 * sprite.worldAlpha << 24), this.sprites[this.currentBatchSize++] = sprite
        }
    }, PIXI.WebGLSpriteBatch.prototype.renderTilingSprite = function(sprite) {
        var texture = sprite.tilingTexture;
        this.currentBatchSize >= this.size && (this.flush(), this.currentBaseTexture = texture.baseTexture), sprite._uvs || (sprite._uvs = new PIXI.TextureUvs);
        var uvs = sprite._uvs,
            w = texture.baseTexture.width,
            h = texture.baseTexture.height;
        sprite.tilePosition.x %= w * sprite.tileScaleOffset.x, sprite.tilePosition.y %= h * sprite.tileScaleOffset.y;
        var offsetX = sprite.tilePosition.x / (w * sprite.tileScaleOffset.x),
            offsetY = sprite.tilePosition.y / (h * sprite.tileScaleOffset.y),
            scaleX = sprite.width / w / (sprite.tileScale.x * sprite.tileScaleOffset.x),
            scaleY = sprite.height / h / (sprite.tileScale.y * sprite.tileScaleOffset.y);
        uvs.x0 = 0 - offsetX, uvs.y0 = 0 - offsetY, uvs.x1 = 1 * scaleX - offsetX, uvs.y1 = 0 - offsetY, uvs.x2 = 1 * scaleX - offsetX, uvs.y2 = 1 * scaleY - offsetY, uvs.x3 = 0 - offsetX, uvs.y3 = 1 * scaleY - offsetY;
        var tint = sprite.tint,
            color = (tint >> 16) + (65280 & tint) + ((255 & tint) << 16) + (255 * sprite.worldAlpha << 24),
            positions = this.positions,
            colors = this.colors,
            width = sprite.width,
            height = sprite.height,
            aX = sprite.anchor.x,
            aY = sprite.anchor.y,
            w0 = width * (1 - aX),
            w1 = width * -aX,
            h0 = height * (1 - aY),
            h1 = height * -aY,
            i = 4 * this.currentBatchSize * this.vertSize,
            resolution = texture.baseTexture.resolution,
            wt = sprite.worldTransform,
            a = wt.a / resolution,
            b = wt.b / resolution,
            c = wt.c / resolution,
            d = wt.d / resolution,
            tx = wt.tx,
            ty = wt.ty;
        positions[i++] = a * w1 + c * h1 + tx, positions[i++] = d * h1 + b * w1 + ty, positions[i++] = uvs.x0, positions[i++] = uvs.y0, colors[i++] = color, positions[i++] = a * w0 + c * h1 + tx, positions[i++] = d * h1 + b * w0 + ty, positions[i++] = uvs.x1, positions[i++] = uvs.y1, colors[i++] = color, positions[i++] = a * w0 + c * h0 + tx, positions[i++] = d * h0 + b * w0 + ty, positions[i++] = uvs.x2, positions[i++] = uvs.y2, colors[i++] = color, positions[i++] = a * w1 + c * h0 + tx, positions[i++] = d * h0 + b * w1 + ty, positions[i++] = uvs.x3, positions[i++] = uvs.y3, colors[i++] = color, this.sprites[this.currentBatchSize++] = sprite
    }, PIXI.WebGLSpriteBatch.prototype.flush = function() {
        if (0 !== this.currentBatchSize) {
            var shader, gl = this.gl;
            if (this.dirty) {
                this.dirty = !1, gl.activeTexture(gl.TEXTURE0), gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer), gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer), shader = this.defaultShader.shaders[gl.id];
                var stride = 4 * this.vertSize;
                gl.vertexAttribPointer(shader.aVertexPosition, 2, gl.FLOAT, !1, stride, 0), gl.vertexAttribPointer(shader.aTextureCoord, 2, gl.FLOAT, !1, stride, 8),
                    gl.vertexAttribPointer(shader.colorAttribute, 4, gl.UNSIGNED_BYTE, !0, stride, 16)
            }
            if (this.currentBatchSize > .5 * this.size) gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vertices);
            else {
                var view = this.positions.subarray(0, 4 * this.currentBatchSize * this.vertSize);
                gl.bufferSubData(gl.ARRAY_BUFFER, 0, view)
            }
            for (var nextTexture, nextBlendMode, nextShader, sprite, batchSize = 0, start = 0, currentBaseTexture = null, currentBlendMode = this.renderSession.blendModeManager.currentBlendMode, currentShader = null, blendSwap = !1, shaderSwap = !1, i = 0, j = this.currentBatchSize; j > i; i++) {
                if (sprite = this.sprites[i], nextTexture = sprite.tilingTexture ? sprite.tilingTexture.baseTexture : sprite.texture.baseTexture, nextBlendMode = sprite.blendMode, nextShader = sprite.shader || this.defaultShader, blendSwap = currentBlendMode !== nextBlendMode, shaderSwap = currentShader !== nextShader, (currentBaseTexture !== nextTexture && !nextTexture.skipRender || blendSwap || shaderSwap) && (this.renderBatch(currentBaseTexture, batchSize, start), start = i, batchSize = 0, currentBaseTexture = nextTexture, blendSwap && (currentBlendMode = nextBlendMode, this.renderSession.blendModeManager.setBlendMode(currentBlendMode)), shaderSwap)) {
                    currentShader = nextShader, shader = currentShader.shaders[gl.id], shader || (shader = new PIXI.PixiShader(gl), shader.fragmentSrc = currentShader.fragmentSrc, shader.uniforms = currentShader.uniforms, shader.init(), currentShader.shaders[gl.id] = shader), this.renderSession.shaderManager.setShader(shader), shader.dirty && shader.syncUniforms();
                    var projection = this.renderSession.projection;
                    gl.uniform2f(shader.projectionVector, projection.x, projection.y);
                    var offsetVector = this.renderSession.offset;
                    gl.uniform2f(shader.offsetVector, offsetVector.x, offsetVector.y)
                }
                batchSize++
            }
            this.renderBatch(currentBaseTexture, batchSize, start), this.currentBatchSize = 0
        }
    }, PIXI.WebGLSpriteBatch.prototype.renderBatch = function(texture, size, startIndex) {
        if (0 !== size) {
            var gl = this.gl;
            if (texture._dirty[gl.id]) {
                if (!this.renderSession.renderer.updateTexture(texture)) return
            } else gl.bindTexture(gl.TEXTURE_2D, texture._glTextures[gl.id]);
            gl.drawElements(gl.TRIANGLES, 6 * size, gl.UNSIGNED_SHORT, 6 * startIndex * 2), this.renderSession.drawCount++
        }
    }, PIXI.WebGLSpriteBatch.prototype.stop = function() {
        this.flush(), this.dirty = !0
    }, PIXI.WebGLSpriteBatch.prototype.start = function() {
        this.dirty = !0
    }, PIXI.WebGLSpriteBatch.prototype.destroy = function() {
        this.vertices = null, this.indices = null, this.gl.deleteBuffer(this.vertexBuffer), this.gl.deleteBuffer(this.indexBuffer), this.currentBaseTexture = null, this.gl = null
    }, PIXI.WebGLFastSpriteBatch = function(gl) {
        this.vertSize = 10, this.maxSize = 6e3, this.size = this.maxSize;
        var numVerts = 4 * this.size * this.vertSize,
            numIndices = 6 * this.maxSize;
        this.vertices = new PIXI.Float32Array(numVerts), this.indices = new PIXI.Uint16Array(numIndices), this.vertexBuffer = null, this.indexBuffer = null, this.lastIndexCount = 0;
        for (var i = 0, j = 0; numIndices > i; i += 6, j += 4) this.indices[i + 0] = j + 0, this.indices[i + 1] = j + 1, this.indices[i + 2] = j + 2, this.indices[i + 3] = j + 0, this.indices[i + 4] = j + 2, this.indices[i + 5] = j + 3;
        this.drawing = !1, this.currentBatchSize = 0, this.currentBaseTexture = null, this.currentBlendMode = 0, this.renderSession = null, this.shader = null, this.matrix = null, this.setContext(gl)
    }, PIXI.WebGLFastSpriteBatch.prototype.constructor = PIXI.WebGLFastSpriteBatch, PIXI.WebGLFastSpriteBatch.prototype.setContext = function(gl) {
        this.gl = gl, this.vertexBuffer = gl.createBuffer(), this.indexBuffer = gl.createBuffer(), gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer), gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW), gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer), gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.DYNAMIC_DRAW)
    }, PIXI.WebGLFastSpriteBatch.prototype.begin = function(spriteBatch, renderSession) {
        this.renderSession = renderSession, this.shader = this.renderSession.shaderManager.fastShader, this.matrix = spriteBatch.worldTransform.toArray(!0), this.start()
    }, PIXI.WebGLFastSpriteBatch.prototype.end = function() {
        this.flush()
    }, PIXI.WebGLFastSpriteBatch.prototype.render = function(spriteBatch) {
        var children = spriteBatch.children,
            sprite = children[0];
        if (sprite.texture._uvs) {
            this.currentBaseTexture = sprite.texture.baseTexture, sprite.blendMode !== this.renderSession.blendModeManager.currentBlendMode && (this.flush(), this.renderSession.blendModeManager.setBlendMode(sprite.blendMode));
            for (var i = 0, j = children.length; j > i; i++) this.renderSprite(children[i]);
            this.flush()
        }
    }, PIXI.WebGLFastSpriteBatch.prototype.renderSprite = function(sprite) {
        if (sprite.visible && (sprite.texture.baseTexture === this.currentBaseTexture || sprite.texture.baseTexture.skipRender || (this.flush(), this.currentBaseTexture = sprite.texture.baseTexture, sprite.texture._uvs))) {
            var uvs, width, height, w0, w1, h0, h1, index, vertices = this.vertices;
            if (uvs = sprite.texture._uvs, width = sprite.texture.frame.width, height = sprite.texture.frame.height, sprite.texture.trim) {
                var trim = sprite.texture.trim;
                w1 = trim.x - sprite.anchor.x * trim.width, w0 = w1 + sprite.texture.crop.width, h1 = trim.y - sprite.anchor.y * trim.height, h0 = h1 + sprite.texture.crop.height
            } else w0 = sprite.texture.frame.width * (1 - sprite.anchor.x), w1 = sprite.texture.frame.width * -sprite.anchor.x, h0 = sprite.texture.frame.height * (1 - sprite.anchor.y), h1 = sprite.texture.frame.height * -sprite.anchor.y;
            index = 4 * this.currentBatchSize * this.vertSize, vertices[index++] = w1, vertices[index++] = h1, vertices[index++] = sprite.position.x, vertices[index++] = sprite.position.y, vertices[index++] = sprite.scale.x, vertices[index++] = sprite.scale.y, vertices[index++] = sprite.rotation, vertices[index++] = uvs.x0, vertices[index++] = uvs.y1, vertices[index++] = sprite.alpha, vertices[index++] = w0, vertices[index++] = h1, vertices[index++] = sprite.position.x, vertices[index++] = sprite.position.y, vertices[index++] = sprite.scale.x, vertices[index++] = sprite.scale.y, vertices[index++] = sprite.rotation, vertices[index++] = uvs.x1, vertices[index++] = uvs.y1, vertices[index++] = sprite.alpha, vertices[index++] = w0, vertices[index++] = h0, vertices[index++] = sprite.position.x, vertices[index++] = sprite.position.y, vertices[index++] = sprite.scale.x, vertices[index++] = sprite.scale.y, vertices[index++] = sprite.rotation, vertices[index++] = uvs.x2, vertices[index++] = uvs.y2, vertices[index++] = sprite.alpha, vertices[index++] = w1, vertices[index++] = h0, vertices[index++] = sprite.position.x, vertices[index++] = sprite.position.y, vertices[index++] = sprite.scale.x, vertices[index++] = sprite.scale.y, vertices[index++] = sprite.rotation, vertices[index++] = uvs.x3, vertices[index++] = uvs.y3, vertices[index++] = sprite.alpha, this.currentBatchSize++, this.currentBatchSize >= this.size && this.flush()
        }
    }, PIXI.WebGLFastSpriteBatch.prototype.flush = function() {
        if (0 !== this.currentBatchSize) {
            var gl = this.gl;
            if (this.currentBaseTexture._glTextures[gl.id] || this.renderSession.renderer.updateTexture(this.currentBaseTexture, gl), gl.bindTexture(gl.TEXTURE_2D, this.currentBaseTexture._glTextures[gl.id]), this.currentBatchSize > .5 * this.size) gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vertices);
            else {
                var view = this.vertices.subarray(0, 4 * this.currentBatchSize * this.vertSize);
                gl.bufferSubData(gl.ARRAY_BUFFER, 0, view)
            }
            gl.drawElements(gl.TRIANGLES, 6 * this.currentBatchSize, gl.UNSIGNED_SHORT, 0), this.currentBatchSize = 0, this.renderSession.drawCount++
        }
    }, PIXI.WebGLFastSpriteBatch.prototype.stop = function() {
        this.flush()
    }, PIXI.WebGLFastSpriteBatch.prototype.start = function() {
        var gl = this.gl;
        gl.activeTexture(gl.TEXTURE0), gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer), gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        var projection = this.renderSession.projection;
        gl.uniform2f(this.shader.projectionVector, projection.x, projection.y), gl.uniformMatrix3fv(this.shader.uMatrix, !1, this.matrix);
        var stride = 4 * this.vertSize;
        gl.vertexAttribPointer(this.shader.aVertexPosition, 2, gl.FLOAT, !1, stride, 0), gl.vertexAttribPointer(this.shader.aPositionCoord, 2, gl.FLOAT, !1, stride, 8), gl.vertexAttribPointer(this.shader.aScale, 2, gl.FLOAT, !1, stride, 16), gl.vertexAttribPointer(this.shader.aRotation, 1, gl.FLOAT, !1, stride, 24), gl.vertexAttribPointer(this.shader.aTextureCoord, 2, gl.FLOAT, !1, stride, 28), gl.vertexAttribPointer(this.shader.colorAttribute, 1, gl.FLOAT, !1, stride, 36)
    }, PIXI.WebGLFilterManager = function() {
        this.filterStack = [], this.offsetX = 0, this.offsetY = 0
    }, PIXI.WebGLFilterManager.prototype.constructor = PIXI.WebGLFilterManager, PIXI.WebGLFilterManager.prototype.setContext = function(gl) {
        this.gl = gl, this.texturePool = [], this.initShaderBuffers()
    }, PIXI.WebGLFilterManager.prototype.begin = function(renderSession, buffer) {
        this.renderSession = renderSession, this.defaultShader = renderSession.shaderManager.defaultShader;
        var projection = this.renderSession.projection;
        this.width = 2 * projection.x, this.height = 2 * -projection.y, this.buffer = buffer
    }, PIXI.WebGLFilterManager.prototype.pushFilter = function(filterBlock) {
        var gl = this.gl,
            projection = this.renderSession.projection,
            offset = this.renderSession.offset;
        filterBlock._filterArea = filterBlock.target.filterArea || filterBlock.target.getBounds(), this.filterStack.push(filterBlock);
        var filter = filterBlock.filterPasses[0];
        this.offsetX += filterBlock._filterArea.x, this.offsetY += filterBlock._filterArea.y;
        var texture = this.texturePool.pop();
        texture ? texture.resize(this.width, this.height) : texture = new PIXI.FilterTexture(this.gl, this.width, this.height), gl.bindTexture(gl.TEXTURE_2D, texture.texture);
        var filterArea = filterBlock._filterArea,
            padding = filter.padding;
        filterArea.x -= padding, filterArea.y -= padding, filterArea.width += 2 * padding, filterArea.height += 2 * padding, filterArea.x < 0 && (filterArea.x = 0), filterArea.width > this.width && (filterArea.width = this.width), filterArea.y < 0 && (filterArea.y = 0), filterArea.height > this.height && (filterArea.height = this.height), gl.bindFramebuffer(gl.FRAMEBUFFER, texture.frameBuffer), gl.viewport(0, 0, filterArea.width, filterArea.height), projection.x = filterArea.width / 2, projection.y = -filterArea.height / 2, offset.x = -filterArea.x, offset.y = -filterArea.y, gl.colorMask(!0, !0, !0, !0), gl.clearColor(0, 0, 0, 0), gl.clear(gl.COLOR_BUFFER_BIT), filterBlock._glFilterTexture = texture
    }, PIXI.WebGLFilterManager.prototype.popFilter = function() {
        var gl = this.gl,
            filterBlock = this.filterStack.pop(),
            filterArea = filterBlock._filterArea,
            texture = filterBlock._glFilterTexture,
            projection = this.renderSession.projection,
            offset = this.renderSession.offset;
        if (filterBlock.filterPasses.length > 1) {
            gl.viewport(0, 0, filterArea.width, filterArea.height), gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer), this.vertexArray[0] = 0, this.vertexArray[1] = filterArea.height, this.vertexArray[2] = filterArea.width, this.vertexArray[3] = filterArea.height, this.vertexArray[4] = 0, this.vertexArray[5] = 0, this.vertexArray[6] = filterArea.width, this.vertexArray[7] = 0, gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vertexArray), gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer), this.uvArray[2] = filterArea.width / this.width, this.uvArray[5] = filterArea.height / this.height, this.uvArray[6] = filterArea.width / this.width, this.uvArray[7] = filterArea.height / this.height, gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.uvArray);
            var inputTexture = texture,
                outputTexture = this.texturePool.pop();
            outputTexture || (outputTexture = new PIXI.FilterTexture(this.gl, this.width, this.height)), outputTexture.resize(this.width, this.height), gl.bindFramebuffer(gl.FRAMEBUFFER, outputTexture.frameBuffer), gl.clear(gl.COLOR_BUFFER_BIT), gl.disable(gl.BLEND);
            for (var i = 0; i < filterBlock.filterPasses.length - 1; i++) {
                var filterPass = filterBlock.filterPasses[i];
                gl.bindFramebuffer(gl.FRAMEBUFFER, outputTexture.frameBuffer), gl.activeTexture(gl.TEXTURE0), gl.bindTexture(gl.TEXTURE_2D, inputTexture.texture), this.applyFilterPass(filterPass, filterArea, filterArea.width, filterArea.height);
                var temp = inputTexture;
                inputTexture = outputTexture, outputTexture = temp
            }
            gl.enable(gl.BLEND), texture = inputTexture, this.texturePool.push(outputTexture)
        }
        var filter = filterBlock.filterPasses[filterBlock.filterPasses.length - 1];
        this.offsetX -= filterArea.x, this.offsetY -= filterArea.y;
        var sizeX = this.width,
            sizeY = this.height,
            offsetX = 0,
            offsetY = 0,
            buffer = this.buffer;
        if (0 === this.filterStack.length) gl.colorMask(!0, !0, !0, !0);
        else {
            var currentFilter = this.filterStack[this.filterStack.length - 1];
            filterArea = currentFilter._filterArea, sizeX = filterArea.width, sizeY = filterArea.height, offsetX = filterArea.x, offsetY = filterArea.y, buffer = currentFilter._glFilterTexture.frameBuffer
        }
        projection.x = sizeX / 2, projection.y = -sizeY / 2, offset.x = offsetX, offset.y = offsetY, filterArea = filterBlock._filterArea;
        var x = filterArea.x - offsetX,
            y = filterArea.y - offsetY;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer), this.vertexArray[0] = x, this.vertexArray[1] = y + filterArea.height, this.vertexArray[2] = x + filterArea.width, this.vertexArray[3] = y + filterArea.height, this.vertexArray[4] = x, this.vertexArray[5] = y, this.vertexArray[6] = x + filterArea.width, this.vertexArray[7] = y, gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vertexArray), gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer), this.uvArray[2] = filterArea.width / this.width, this.uvArray[5] = filterArea.height / this.height, this.uvArray[6] = filterArea.width / this.width, this.uvArray[7] = filterArea.height / this.height, gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.uvArray), gl.viewport(0, 0, sizeX * this.renderSession.resolution, sizeY * this.renderSession.resolution), gl.bindFramebuffer(gl.FRAMEBUFFER, buffer), gl.activeTexture(gl.TEXTURE0), gl.bindTexture(gl.TEXTURE_2D, texture.texture), this.applyFilterPass(filter, filterArea, sizeX, sizeY), this.texturePool.push(texture), filterBlock._glFilterTexture = null
    }, PIXI.WebGLFilterManager.prototype.applyFilterPass = function(filter, filterArea, width, height) {
        var gl = this.gl,
            shader = filter.shaders[gl.id];
        shader || (shader = new PIXI.PixiShader(gl), shader.fragmentSrc = filter.fragmentSrc, shader.uniforms = filter.uniforms, shader.init(), filter.shaders[gl.id] = shader), this.renderSession.shaderManager.setShader(shader), gl.uniform2f(shader.projectionVector, width / 2, -height / 2), gl.uniform2f(shader.offsetVector, 0, 0), filter.uniforms.dimensions && (filter.uniforms.dimensions.value[0] = this.width, filter.uniforms.dimensions.value[1] = this.height, filter.uniforms.dimensions.value[2] = this.vertexArray[0], filter.uniforms.dimensions.value[3] = this.vertexArray[5]), shader.syncUniforms(), gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer), gl.vertexAttribPointer(shader.aVertexPosition, 2, gl.FLOAT, !1, 0, 0), gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer), gl.vertexAttribPointer(shader.aTextureCoord, 2, gl.FLOAT, !1, 0, 0), gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer), gl.vertexAttribPointer(shader.colorAttribute, 2, gl.FLOAT, !1, 0, 0), gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer), gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0), this.renderSession.drawCount++
    }, PIXI.WebGLFilterManager.prototype.initShaderBuffers = function() {
        var gl = this.gl;
        this.vertexBuffer = gl.createBuffer(), this.uvBuffer = gl.createBuffer(), this.colorBuffer = gl.createBuffer(), this.indexBuffer = gl.createBuffer(), this.vertexArray = new PIXI.Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer), gl.bufferData(gl.ARRAY_BUFFER, this.vertexArray, gl.STATIC_DRAW), this.uvArray = new PIXI.Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer), gl.bufferData(gl.ARRAY_BUFFER, this.uvArray, gl.STATIC_DRAW), this.colorArray = new PIXI.Float32Array([1, 16777215, 1, 16777215, 1, 16777215, 1, 16777215]), gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer), gl.bufferData(gl.ARRAY_BUFFER, this.colorArray, gl.STATIC_DRAW), gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer), gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 1, 3, 2]), gl.STATIC_DRAW)
    }, PIXI.WebGLFilterManager.prototype.destroy = function() {
        var gl = this.gl;
        this.filterStack = null, this.offsetX = 0, this.offsetY = 0;
        for (var i = 0; i < this.texturePool.length; i++) this.texturePool[i].destroy();
        this.texturePool = null, gl.deleteBuffer(this.vertexBuffer), gl.deleteBuffer(this.uvBuffer), gl.deleteBuffer(this.colorBuffer), gl.deleteBuffer(this.indexBuffer)
    }, PIXI.FilterTexture = function(gl, width, height, scaleMode) {
        this.gl = gl, this.frameBuffer = gl.createFramebuffer(), this.texture = gl.createTexture(), scaleMode = scaleMode || PIXI.scaleModes.DEFAULT, gl.bindTexture(gl.TEXTURE_2D, this.texture), gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, scaleMode === PIXI.scaleModes.LINEAR ? gl.LINEAR : gl.NEAREST), gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, scaleMode === PIXI.scaleModes.LINEAR ? gl.LINEAR : gl.NEAREST), gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE), gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE), gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer), gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer), gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture, 0), this.renderBuffer = gl.createRenderbuffer(), gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderBuffer), gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, this.renderBuffer), this.resize(width, height)
    }, PIXI.FilterTexture.prototype.constructor = PIXI.FilterTexture, PIXI.FilterTexture.prototype.clear = function() {
        var gl = this.gl;
        gl.clearColor(0, 0, 0, 0), gl.clear(gl.COLOR_BUFFER_BIT)
    }, PIXI.FilterTexture.prototype.resize = function(width, height) {
        if (this.width !== width || this.height !== height) {
            this.width = width, this.height = height;
            var gl = this.gl;
            gl.bindTexture(gl.TEXTURE_2D, this.texture), gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null), gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderBuffer), gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_STENCIL, width, height)
        }
    }, PIXI.FilterTexture.prototype.destroy = function() {
        var gl = this.gl;
        gl.deleteFramebuffer(this.frameBuffer), gl.deleteTexture(this.texture), this.frameBuffer = null, this.texture = null
    }, PIXI.CanvasBuffer = function(width, height) {
        this.width = width, this.height = height, this.canvas = PIXI.CanvasPool.create(this, this.width, this.height), this.context = this.canvas.getContext("2d"), this.canvas.width = width, this.canvas.height = height
    }, PIXI.CanvasBuffer.prototype.constructor = PIXI.CanvasBuffer, PIXI.CanvasBuffer.prototype.clear = function() {
        this.context.setTransform(1, 0, 0, 1, 0, 0), this.context.clearRect(0, 0, this.width, this.height)
    }, PIXI.CanvasBuffer.prototype.resize = function(width, height) {
        this.width = this.canvas.width = width, this.height = this.canvas.height = height
    }, PIXI.CanvasBuffer.prototype.destroy = function() {
        PIXI.CanvasPool.remove(this)
    }, PIXI.CanvasMaskManager = function() {}, PIXI.CanvasMaskManager.prototype.constructor = PIXI.CanvasMaskManager, PIXI.CanvasMaskManager.prototype.pushMask = function(maskData, renderSession) {
        var context = renderSession.context;
        context.save();
        var cacheAlpha = maskData.alpha,
            transform = maskData.worldTransform,
            resolution = renderSession.resolution;
        context.setTransform(transform.a * resolution, transform.b * resolution, transform.c * resolution, transform.d * resolution, transform.tx * resolution, transform.ty * resolution), PIXI.CanvasGraphics.renderGraphicsMask(maskData, context), context.clip(), maskData.worldAlpha = cacheAlpha
    }, PIXI.CanvasMaskManager.prototype.popMask = function(renderSession) {
        renderSession.context.restore()
    }, PIXI.CanvasTinter = function() {}, PIXI.CanvasTinter.getTintedTexture = function(sprite, color) {
        var canvas = sprite.tintedTexture || PIXI.CanvasPool.create(this);
        return PIXI.CanvasTinter.tintMethod(sprite.texture, color, canvas), canvas
    }, PIXI.CanvasTinter.tintWithMultiply = function(texture, color, canvas) {
        var context = canvas.getContext("2d"),
            crop = texture.crop;
        (canvas.width !== crop.width || canvas.height !== crop.height) && (canvas.width = crop.width, canvas.height = crop.height), context.clearRect(0, 0, crop.width, crop.height), context.fillStyle = "#" + ("00000" + (0 | color).toString(16)).substr(-6), context.fillRect(0, 0, crop.width, crop.height), context.globalCompositeOperation = "multiply", context.drawImage(texture.baseTexture.source, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height), context.globalCompositeOperation = "destination-atop", context.drawImage(texture.baseTexture.source, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height)
    }, PIXI.CanvasTinter.tintWithPerPixel = function(texture, color, canvas) {
        var context = canvas.getContext("2d"),
            crop = texture.crop;
        canvas.width = crop.width, canvas.height = crop.height, context.globalCompositeOperation = "copy", context.drawImage(texture.baseTexture.source, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height);
        for (var rgbValues = PIXI.hex2rgb(color), r = rgbValues[0], g = rgbValues[1], b = rgbValues[2], pixelData = context.getImageData(0, 0, crop.width, crop.height), pixels = pixelData.data, i = 0; i < pixels.length; i += 4)
            if (pixels[i + 0] *= r, pixels[i + 1] *= g, pixels[i + 2] *= b, !PIXI.CanvasTinter.canHandleAlpha) {
                var alpha = pixels[i + 3];
                pixels[i + 0] /= 255 / alpha, pixels[i + 1] /= 255 / alpha, pixels[i + 2] /= 255 / alpha
            }
        context.putImageData(pixelData, 0, 0)
    }, PIXI.CanvasTinter.checkInverseAlpha = function() {
        var canvas = new PIXI.CanvasBuffer(2, 1);
        canvas.context.fillStyle = "rgba(10, 20, 30, 0.5)", canvas.context.fillRect(0, 0, 1, 1);
        var s1 = canvas.context.getImageData(0, 0, 1, 1);
        if (null === s1) return !1;
        canvas.context.putImageData(s1, 1, 0);
        var s2 = canvas.context.getImageData(1, 0, 1, 1);
        return s2.data[0] === s1.data[0] && s2.data[1] === s1.data[1] && s2.data[2] === s1.data[2] && s2.data[3] === s1.data[3]
    }, PIXI.CanvasTinter.canHandleAlpha = PIXI.CanvasTinter.checkInverseAlpha(), PIXI.CanvasTinter.canUseMultiply = PIXI.canUseNewCanvasBlendModes(), PIXI.CanvasTinter.tintMethod = PIXI.CanvasTinter.canUseMultiply ? PIXI.CanvasTinter.tintWithMultiply : PIXI.CanvasTinter.tintWithPerPixel, PIXI.CanvasRenderer = function(game) {
        this.game = game, PIXI.defaultRenderer || (PIXI.defaultRenderer = this), this.type = PIXI.CANVAS_RENDERER, this.resolution = game.resolution, this.clearBeforeRender = game.clearBeforeRender, this.transparent = game.transparent, this.autoResize = !1, this.width = game.width * this.resolution, this.height = game.height * this.resolution, this.view = game.canvas, this.context = this.view.getContext("2d", {
            alpha: this.transparent
        }), this.refresh = !0, this.count = 0, this.maskManager = new PIXI.CanvasMaskManager, this.renderSession = {
            context: this.context,
            maskManager: this.maskManager,
            scaleMode: null,
            smoothProperty: Phaser.Canvas.getSmoothingPrefix(this.context),
            roundPixels: !1
        }, this.mapBlendModes(), this.resize(this.width, this.height)
    }, PIXI.CanvasRenderer.prototype.constructor = PIXI.CanvasRenderer, PIXI.CanvasRenderer.prototype.render = function(stage) {
        stage.updateTransform(), this.context.setTransform(1, 0, 0, 1, 0, 0), this.context.globalAlpha = 1, this.renderSession.currentBlendMode = 0, this.context.globalCompositeOperation = "source-over", navigator.isCocoonJS && this.view.screencanvas && (this.context.fillStyle = "black", this.context.clear()), this.clearBeforeRender && (this.transparent ? this.context.clearRect(0, 0, this.width, this.height) : (this.context.fillStyle = stage._bgColor.rgba, this.context.fillRect(0, 0, this.width, this.height))), this.renderDisplayObject(stage)
    }, PIXI.CanvasRenderer.prototype.destroy = function(removeView) {
        void 0 === removeView && (removeView = !0), removeView && this.view.parent && this.view.parent.removeChild(this.view), this.view = null, this.context = null, this.maskManager = null, this.renderSession = null
    }, PIXI.CanvasRenderer.prototype.resize = function(width, height) {
        this.width = width * this.resolution, this.height = height * this.resolution, this.view.width = this.width, this.view.height = this.height, this.autoResize && (this.view.style.width = this.width / this.resolution + "px", this.view.style.height = this.height / this.resolution + "px")
    }, PIXI.CanvasRenderer.prototype.renderDisplayObject = function(displayObject, context, matrix) {
        this.renderSession.context = context || this.context, this.renderSession.resolution = this.resolution, displayObject._renderCanvas(this.renderSession, matrix)
    }, PIXI.CanvasRenderer.prototype.mapBlendModes = function() {
        if (!PIXI.blendModesCanvas) {
            var b = [],
                modes = PIXI.blendModes,
                useNew = PIXI.canUseNewCanvasBlendModes();
            b[modes.NORMAL] = "source-over", b[modes.ADD] = "lighter", b[modes.MULTIPLY] = useNew ? "multiply" : "source-over", b[modes.SCREEN] = useNew ? "screen" : "source-over", b[modes.OVERLAY] = useNew ? "overlay" : "source-over", b[modes.DARKEN] = useNew ? "darken" : "source-over", b[modes.LIGHTEN] = useNew ? "lighten" : "source-over", b[modes.COLOR_DODGE] = useNew ? "color-dodge" : "source-over", b[modes.COLOR_BURN] = useNew ? "color-burn" : "source-over", b[modes.HARD_LIGHT] = useNew ? "hard-light" : "source-over", b[modes.SOFT_LIGHT] = useNew ? "soft-light" : "source-over", b[modes.DIFFERENCE] = useNew ? "difference" : "source-over", b[modes.EXCLUSION] = useNew ? "exclusion" : "source-over", b[modes.HUE] = useNew ? "hue" : "source-over", b[modes.SATURATION] = useNew ? "saturation" : "source-over", b[modes.COLOR] = useNew ? "color" : "source-over", b[modes.LUMINOSITY] = useNew ? "luminosity" : "source-over", PIXI.blendModesCanvas = b
        }
    }, PIXI.BaseTextureCache = {}, PIXI.BaseTextureCacheIdGenerator = 0, PIXI.BaseTexture = function(source, scaleMode) {
        this.resolution = 1, this.width = 100, this.height = 100, this.scaleMode = scaleMode || PIXI.scaleModes.DEFAULT, this.hasLoaded = !1, this.source = source, this._UID = PIXI._UID++, this.premultipliedAlpha = !0, this._glTextures = [], this.mipmap = !1, this._dirty = [!0, !0, !0, !0], source && ((this.source.complete || this.source.getContext) && this.source.width && this.source.height && (this.hasLoaded = !0, this.width = this.source.naturalWidth || this.source.width, this.height = this.source.naturalHeight || this.source.height, this.dirty()), this.skipRender = !1, this.imageUrl = null, this._powerOf2 = !1)
    }, PIXI.BaseTexture.prototype.constructor = PIXI.BaseTexture, PIXI.BaseTexture.prototype.forceLoaded = function(width, height) {
        this.hasLoaded = !0, this.width = width, this.height = height, this.dirty()
    }, PIXI.BaseTexture.prototype.destroy = function() {
        this.imageUrl ? (delete PIXI.BaseTextureCache[this.imageUrl], delete PIXI.TextureCache[this.imageUrl], this.imageUrl = null, navigator.isCocoonJS || (this.source.src = "")) : this.source && this.source._pixiId && (PIXI.CanvasPool.removeByCanvas(this.source), delete PIXI.BaseTextureCache[this.source._pixiId]), this.source = null, this.unloadFromGPU()
    }, PIXI.BaseTexture.prototype.updateSourceImage = function(newSrc) {
        this.hasLoaded = !1, this.source.src = null, this.source.src = newSrc
    }, PIXI.BaseTexture.prototype.dirty = function() {
        for (var i = 0; i < this._glTextures.length; i++) this._dirty[i] = !0
    }, PIXI.BaseTexture.prototype.unloadFromGPU = function() {
        this.dirty();
        for (var i = this._glTextures.length - 1; i >= 0; i--) {
            var glTexture = this._glTextures[i],
                gl = PIXI.glContexts[i];
            gl && glTexture && gl.deleteTexture(glTexture)
        }
        this._glTextures.length = 0, this.dirty()
    }, PIXI.BaseTexture.fromImage = function(imageUrl, crossorigin, scaleMode) {
        var baseTexture = PIXI.BaseTextureCache[imageUrl];
        if (void 0 === crossorigin && -1 === imageUrl.indexOf("data:") && (crossorigin = !0), !baseTexture) {
            var image = new Image;
            crossorigin && (image.crossOrigin = ""), image.src = imageUrl, baseTexture = new PIXI.BaseTexture(image, scaleMode), baseTexture.imageUrl = imageUrl, PIXI.BaseTextureCache[imageUrl] = baseTexture, -1 !== imageUrl.indexOf(PIXI.RETINA_PREFIX + ".") && (baseTexture.resolution = 2)
        }
        return baseTexture
    }, PIXI.BaseTexture.fromCanvas = function(canvas, scaleMode) {
        canvas._pixiId || (canvas._pixiId = "canvas_" + PIXI.TextureCacheIdGenerator++), 0 === canvas.width && (canvas.width = 1), 0 === canvas.height && (canvas.height = 1);
        var baseTexture = PIXI.BaseTextureCache[canvas._pixiId];
        return baseTexture || (baseTexture = new PIXI.BaseTexture(canvas, scaleMode), PIXI.BaseTextureCache[canvas._pixiId] = baseTexture), baseTexture
    }, PIXI.TextureCache = {}, PIXI.FrameCache = {}, PIXI.TextureSilentFail = !1, PIXI.TextureCacheIdGenerator = 0, PIXI.Texture = function(baseTexture, frame, crop, trim) {
        this.noFrame = !1, frame || (this.noFrame = !0, frame = new PIXI.Rectangle(0, 0, 1, 1)), baseTexture instanceof PIXI.Texture && (baseTexture = baseTexture.baseTexture), this.baseTexture = baseTexture, this.frame = frame, this.trim = trim, this.valid = !1, this.isTiling = !1, this.requiresUpdate = !1, this.requiresReTint = !1, this._uvs = null, this.width = 0, this.height = 0, this.crop = crop || new PIXI.Rectangle(0, 0, 1, 1), baseTexture.hasLoaded && (this.noFrame && (frame = new PIXI.Rectangle(0, 0, baseTexture.width, baseTexture.height)), this.setFrame(frame))
    }, PIXI.Texture.prototype.constructor = PIXI.Texture, PIXI.Texture.prototype.onBaseTextureLoaded = function() {
        var baseTexture = this.baseTexture;
        this.noFrame && (this.frame = new PIXI.Rectangle(0, 0, baseTexture.width, baseTexture.height)), this.setFrame(this.frame)
    }, PIXI.Texture.prototype.destroy = function(destroyBase) {
        destroyBase && this.baseTexture.destroy(), this.valid = !1
    }, PIXI.Texture.prototype.setFrame = function(frame) {
        if (this.noFrame = !1, this.frame = frame, this.width = frame.width, this.height = frame.height, this.crop.x = frame.x, this.crop.y = frame.y, this.crop.width = frame.width, this.crop.height = frame.height, !this.trim && (frame.x + frame.width > this.baseTexture.width || frame.y + frame.height > this.baseTexture.height)) {
            if (!PIXI.TextureSilentFail) throw new Error("Texture Error: frame does not fit inside the base Texture dimensions " + this);
            return void(this.valid = !1)
        }
        this.valid = frame && frame.width && frame.height && this.baseTexture.source && this.baseTexture.hasLoaded, this.trim && (this.width = this.trim.width, this.height = this.trim.height, this.frame.width = this.trim.width, this.frame.height = this.trim.height), this.valid && this._updateUvs()
    }, PIXI.Texture.prototype._updateUvs = function() {
        this._uvs || (this._uvs = new PIXI.TextureUvs);
        var frame = this.crop,
            tw = this.baseTexture.width,
            th = this.baseTexture.height;
        this._uvs.x0 = frame.x / tw, this._uvs.y0 = frame.y / th, this._uvs.x1 = (frame.x + frame.width) / tw, this._uvs.y1 = frame.y / th, this._uvs.x2 = (frame.x + frame.width) / tw, this._uvs.y2 = (frame.y + frame.height) / th, this._uvs.x3 = frame.x / tw, this._uvs.y3 = (frame.y + frame.height) / th
    }, PIXI.Texture.fromImage = function(imageUrl, crossorigin, scaleMode) {
        var texture = PIXI.TextureCache[imageUrl];
        return texture || (texture = new PIXI.Texture(PIXI.BaseTexture.fromImage(imageUrl, crossorigin, scaleMode)), PIXI.TextureCache[imageUrl] = texture), texture
    }, PIXI.Texture.fromFrame = function(frameId) {
        var texture = PIXI.TextureCache[frameId];
        if (!texture) throw new Error('The frameId "' + frameId + '" does not exist in the texture cache ');
        return texture
    }, PIXI.Texture.fromCanvas = function(canvas, scaleMode) {
        var baseTexture = PIXI.BaseTexture.fromCanvas(canvas, scaleMode);
        return new PIXI.Texture(baseTexture)
    }, PIXI.Texture.addTextureToCache = function(texture, id) {
        PIXI.TextureCache[id] = texture
    }, PIXI.Texture.removeTextureFromCache = function(id) {
        var texture = PIXI.TextureCache[id];
        return delete PIXI.TextureCache[id], delete PIXI.BaseTextureCache[id], texture
    }, PIXI.TextureUvs = function() {
        this.x0 = 0, this.y0 = 0, this.x1 = 0, this.y1 = 0, this.x2 = 0, this.y2 = 0, this.x3 = 0, this.y3 = 0
    }, PIXI.RenderTexture = function(width, height, renderer, scaleMode, resolution) {
        if (this.width = width || 100, this.height = height || 100, this.resolution = resolution || 1, this.frame = new PIXI.Rectangle(0, 0, this.width * this.resolution, this.height * this.resolution), this.crop = new PIXI.Rectangle(0, 0, this.width * this.resolution, this.height * this.resolution), this.baseTexture = new PIXI.BaseTexture, this.baseTexture.width = this.width * this.resolution, this.baseTexture.height = this.height * this.resolution, this.baseTexture._glTextures = [], this.baseTexture.resolution = this.resolution, this.baseTexture.scaleMode = scaleMode || PIXI.scaleModes.DEFAULT, this.baseTexture.hasLoaded = !0, PIXI.Texture.call(this, this.baseTexture, new PIXI.Rectangle(0, 0, this.width * this.resolution, this.height * this.resolution)), this.renderer = renderer || PIXI.defaultRenderer, this.renderer.type === PIXI.WEBGL_RENDERER) {
            var gl = this.renderer.gl;
            this.baseTexture._dirty[gl.id] = !1, this.textureBuffer = new PIXI.FilterTexture(gl, this.width, this.height, this.baseTexture.scaleMode), this.baseTexture._glTextures[gl.id] = this.textureBuffer.texture, this.render = this.renderWebGL, this.projection = new PIXI.Point(.5 * this.width, .5 * -this.height)
        } else this.render = this.renderCanvas, this.textureBuffer = new PIXI.CanvasBuffer(this.width * this.resolution, this.height * this.resolution), this.baseTexture.source = this.textureBuffer.canvas;
        this.valid = !0, this.tempMatrix = new Phaser.Matrix, this._updateUvs()
    }, PIXI.RenderTexture.prototype = Object.create(PIXI.Texture.prototype), PIXI.RenderTexture.prototype.constructor = PIXI.RenderTexture, PIXI.RenderTexture.prototype.resize = function(width, height, updateBase) {
        (width !== this.width || height !== this.height) && (this.valid = width > 0 && height > 0, this.width = width, this.height = height, this.frame.width = this.crop.width = width * this.resolution, this.frame.height = this.crop.height = height * this.resolution, updateBase && (this.baseTexture.width = this.width * this.resolution, this.baseTexture.height = this.height * this.resolution), this.renderer.type === PIXI.WEBGL_RENDERER && (this.projection.x = this.width / 2, this.projection.y = -this.height / 2), this.valid && this.textureBuffer.resize(this.width, this.height))
    }, PIXI.RenderTexture.prototype.clear = function() {
        this.valid && (this.renderer.type === PIXI.WEBGL_RENDERER && this.renderer.gl.bindFramebuffer(this.renderer.gl.FRAMEBUFFER, this.textureBuffer.frameBuffer),
            this.textureBuffer.clear())
    }, PIXI.RenderTexture.prototype.renderWebGL = function(displayObject, matrix, clear) {
        if (this.valid && 0 !== displayObject.alpha) {
            var wt = displayObject.worldTransform;
            wt.identity(), wt.translate(0, 2 * this.projection.y), matrix && wt.append(matrix), wt.scale(1, -1);
            for (var i = 0; i < displayObject.children.length; i++) displayObject.children[i].updateTransform();
            var gl = this.renderer.gl;
            gl.viewport(0, 0, this.width * this.resolution, this.height * this.resolution), gl.bindFramebuffer(gl.FRAMEBUFFER, this.textureBuffer.frameBuffer), clear && this.textureBuffer.clear(), this.renderer.spriteBatch.dirty = !0, this.renderer.renderDisplayObject(displayObject, this.projection, this.textureBuffer.frameBuffer, matrix), this.renderer.spriteBatch.dirty = !0
        }
    }, PIXI.RenderTexture.prototype.renderCanvas = function(displayObject, matrix, clear) {
        if (this.valid && 0 !== displayObject.alpha) {
            var wt = displayObject.worldTransform;
            wt.identity(), matrix && wt.append(matrix);
            for (var i = 0; i < displayObject.children.length; i++) displayObject.children[i].updateTransform();
            clear && this.textureBuffer.clear();
            var realResolution = this.renderer.resolution;
            this.renderer.resolution = this.resolution, this.renderer.renderDisplayObject(displayObject, this.textureBuffer.context, matrix), this.renderer.resolution = realResolution
        }
    }, PIXI.RenderTexture.prototype.getImage = function() {
        var image = new Image;
        return image.src = this.getBase64(), image
    }, PIXI.RenderTexture.prototype.getBase64 = function() {
        return this.getCanvas().toDataURL()
    }, PIXI.RenderTexture.prototype.getCanvas = function() {
        if (this.renderer.type === PIXI.WEBGL_RENDERER) {
            var gl = this.renderer.gl,
                width = this.textureBuffer.width,
                height = this.textureBuffer.height,
                webGLPixels = new Uint8Array(4 * width * height);
            gl.bindFramebuffer(gl.FRAMEBUFFER, this.textureBuffer.frameBuffer), gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, webGLPixels), gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            var tempCanvas = new PIXI.CanvasBuffer(width, height),
                canvasData = tempCanvas.context.getImageData(0, 0, width, height);
            return canvasData.data.set(webGLPixels), tempCanvas.context.putImageData(canvasData, 0, 0), tempCanvas.canvas
        }
        return this.textureBuffer.canvas
    }, PIXI.AbstractFilter = function(fragmentSrc, uniforms) {
        this.passes = [this], this.shaders = [], this.dirty = !0, this.padding = 0, this.uniforms = uniforms || {}, this.fragmentSrc = fragmentSrc || []
    }, PIXI.AbstractFilter.prototype.constructor = PIXI.AbstractFilter, PIXI.AbstractFilter.prototype.syncUniforms = function() {
        for (var i = 0, j = this.shaders.length; j > i; i++) this.shaders[i].dirty = !0
    }, PIXI.Strip = function(texture) {
        PIXI.DisplayObjectContainer.call(this), this.texture = texture, this.uvs = new PIXI.Float32Array([0, 1, 1, 1, 1, 0, 0, 1]), this.vertices = new PIXI.Float32Array([0, 0, 100, 0, 100, 100, 0, 100]), this.colors = new PIXI.Float32Array([1, 1, 1, 1]), this.indices = new PIXI.Uint16Array([0, 1, 2, 3]), this.dirty = !0, this.blendMode = PIXI.blendModes.NORMAL, this.canvasPadding = 0, this.drawMode = PIXI.Strip.DrawModes.TRIANGLE_STRIP
    }, PIXI.Strip.prototype = Object.create(PIXI.DisplayObjectContainer.prototype), PIXI.Strip.prototype.constructor = PIXI.Strip, PIXI.Strip.prototype._renderWebGL = function(renderSession) {
        !this.visible || this.alpha <= 0 || (renderSession.spriteBatch.stop(), this._vertexBuffer || this._initWebGL(renderSession), renderSession.shaderManager.setShader(renderSession.shaderManager.stripShader), this._renderStrip(renderSession), renderSession.spriteBatch.start())
    }, PIXI.Strip.prototype._initWebGL = function(renderSession) {
        var gl = renderSession.gl;
        this._vertexBuffer = gl.createBuffer(), this._indexBuffer = gl.createBuffer(), this._uvBuffer = gl.createBuffer(), this._colorBuffer = gl.createBuffer(), gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer), gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.DYNAMIC_DRAW), gl.bindBuffer(gl.ARRAY_BUFFER, this._uvBuffer), gl.bufferData(gl.ARRAY_BUFFER, this.uvs, gl.STATIC_DRAW), gl.bindBuffer(gl.ARRAY_BUFFER, this._colorBuffer), gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.STATIC_DRAW), gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer), gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW)
    }, PIXI.Strip.prototype._renderStrip = function(renderSession) {
        var gl = renderSession.gl,
            projection = renderSession.projection,
            offset = renderSession.offset,
            shader = renderSession.shaderManager.stripShader,
            drawMode = this.drawMode === PIXI.Strip.DrawModes.TRIANGLE_STRIP ? gl.TRIANGLE_STRIP : gl.TRIANGLES;
        renderSession.blendModeManager.setBlendMode(this.blendMode), gl.uniformMatrix3fv(shader.translationMatrix, !1, this.worldTransform.toArray(!0)), gl.uniform2f(shader.projectionVector, projection.x, -projection.y), gl.uniform2f(shader.offsetVector, -offset.x, -offset.y), gl.uniform1f(shader.alpha, this.worldAlpha), this.dirty ? (this.dirty = !1, gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer), gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW), gl.vertexAttribPointer(shader.aVertexPosition, 2, gl.FLOAT, !1, 0, 0), gl.bindBuffer(gl.ARRAY_BUFFER, this._uvBuffer), gl.bufferData(gl.ARRAY_BUFFER, this.uvs, gl.STATIC_DRAW), gl.vertexAttribPointer(shader.aTextureCoord, 2, gl.FLOAT, !1, 0, 0), gl.activeTexture(gl.TEXTURE0), this.texture.baseTexture._dirty[gl.id] ? renderSession.renderer.updateTexture(this.texture.baseTexture) : gl.bindTexture(gl.TEXTURE_2D, this.texture.baseTexture._glTextures[gl.id]), gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer), gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW)) : (gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer), gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vertices), gl.vertexAttribPointer(shader.aVertexPosition, 2, gl.FLOAT, !1, 0, 0), gl.bindBuffer(gl.ARRAY_BUFFER, this._uvBuffer), gl.vertexAttribPointer(shader.aTextureCoord, 2, gl.FLOAT, !1, 0, 0), gl.activeTexture(gl.TEXTURE0), this.texture.baseTexture._dirty[gl.id] ? renderSession.renderer.updateTexture(this.texture.baseTexture) : gl.bindTexture(gl.TEXTURE_2D, this.texture.baseTexture._glTextures[gl.id]), gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer)), gl.drawElements(drawMode, this.indices.length, gl.UNSIGNED_SHORT, 0)
    }, PIXI.Strip.prototype._renderCanvas = function(renderSession) {
        var context = renderSession.context,
            transform = this.worldTransform;
        renderSession.roundPixels ? context.setTransform(transform.a, transform.b, transform.c, transform.d, 0 | transform.tx, 0 | transform.ty) : context.setTransform(transform.a, transform.b, transform.c, transform.d, transform.tx, transform.ty), this.drawMode === PIXI.Strip.DrawModes.TRIANGLE_STRIP ? this._renderCanvasTriangleStrip(context) : this._renderCanvasTriangles(context)
    }, PIXI.Strip.prototype._renderCanvasTriangleStrip = function(context) {
        var vertices = this.vertices,
            uvs = this.uvs,
            length = vertices.length / 2;
        this.count++;
        for (var i = 0; length - 2 > i; i++) {
            var index = 2 * i;
            this._renderCanvasDrawTriangle(context, vertices, uvs, index, index + 2, index + 4)
        }
    }, PIXI.Strip.prototype._renderCanvasTriangles = function(context) {
        var vertices = this.vertices,
            uvs = this.uvs,
            indices = this.indices,
            length = indices.length;
        this.count++;
        for (var i = 0; length > i; i += 3) {
            var index0 = 2 * indices[i],
                index1 = 2 * indices[i + 1],
                index2 = 2 * indices[i + 2];
            this._renderCanvasDrawTriangle(context, vertices, uvs, index0, index1, index2)
        }
    }, PIXI.Strip.prototype._renderCanvasDrawTriangle = function(context, vertices, uvs, index0, index1, index2) {
        var textureSource = this.texture.baseTexture.source,
            textureWidth = this.texture.width,
            textureHeight = this.texture.height,
            x0 = vertices[index0],
            x1 = vertices[index1],
            x2 = vertices[index2],
            y0 = vertices[index0 + 1],
            y1 = vertices[index1 + 1],
            y2 = vertices[index2 + 1],
            u0 = uvs[index0] * textureWidth,
            u1 = uvs[index1] * textureWidth,
            u2 = uvs[index2] * textureWidth,
            v0 = uvs[index0 + 1] * textureHeight,
            v1 = uvs[index1 + 1] * textureHeight,
            v2 = uvs[index2 + 1] * textureHeight;
        if (this.canvasPadding > 0) {
            var paddingX = this.canvasPadding / this.worldTransform.a,
                paddingY = this.canvasPadding / this.worldTransform.d,
                centerX = (x0 + x1 + x2) / 3,
                centerY = (y0 + y1 + y2) / 3,
                normX = x0 - centerX,
                normY = y0 - centerY,
                dist = Math.sqrt(normX * normX + normY * normY);
            x0 = centerX + normX / dist * (dist + paddingX), y0 = centerY + normY / dist * (dist + paddingY), normX = x1 - centerX, normY = y1 - centerY, dist = Math.sqrt(normX * normX + normY * normY), x1 = centerX + normX / dist * (dist + paddingX), y1 = centerY + normY / dist * (dist + paddingY), normX = x2 - centerX, normY = y2 - centerY, dist = Math.sqrt(normX * normX + normY * normY), x2 = centerX + normX / dist * (dist + paddingX), y2 = centerY + normY / dist * (dist + paddingY)
        }
        context.save(), context.beginPath(), context.moveTo(x0, y0), context.lineTo(x1, y1), context.lineTo(x2, y2), context.closePath(), context.clip();
        var delta = u0 * v1 + v0 * u2 + u1 * v2 - v1 * u2 - v0 * u1 - u0 * v2,
            deltaA = x0 * v1 + v0 * x2 + x1 * v2 - v1 * x2 - v0 * x1 - x0 * v2,
            deltaB = u0 * x1 + x0 * u2 + u1 * x2 - x1 * u2 - x0 * u1 - u0 * x2,
            deltaC = u0 * v1 * x2 + v0 * x1 * u2 + x0 * u1 * v2 - x0 * v1 * u2 - v0 * u1 * x2 - u0 * x1 * v2,
            deltaD = y0 * v1 + v0 * y2 + y1 * v2 - v1 * y2 - v0 * y1 - y0 * v2,
            deltaE = u0 * y1 + y0 * u2 + u1 * y2 - y1 * u2 - y0 * u1 - u0 * y2,
            deltaF = u0 * v1 * y2 + v0 * y1 * u2 + y0 * u1 * v2 - y0 * v1 * u2 - v0 * u1 * y2 - u0 * y1 * v2;
        context.transform(deltaA / delta, deltaD / delta, deltaB / delta, deltaE / delta, deltaC / delta, deltaF / delta), context.drawImage(textureSource, 0, 0), context.restore()
    }, PIXI.Strip.prototype.renderStripFlat = function(strip) {
        var context = this.context,
            vertices = strip.vertices,
            length = vertices.length / 2;
        this.count++, context.beginPath();
        for (var i = 1; length - 2 > i; i++) {
            var index = 2 * i,
                x0 = vertices[index],
                x1 = vertices[index + 2],
                x2 = vertices[index + 4],
                y0 = vertices[index + 1],
                y1 = vertices[index + 3],
                y2 = vertices[index + 5];
            context.moveTo(x0, y0), context.lineTo(x1, y1), context.lineTo(x2, y2)
        }
        context.fillStyle = "#FF0000", context.fill(), context.closePath()
    }, PIXI.Strip.prototype.onTextureUpdate = function() {
        this.updateFrame = !0
    }, PIXI.Strip.prototype.getBounds = function(matrix) {
        for (var worldTransform = matrix || this.worldTransform, a = worldTransform.a, b = worldTransform.b, c = worldTransform.c, d = worldTransform.d, tx = worldTransform.tx, ty = worldTransform.ty, maxX = -(1 / 0), maxY = -(1 / 0), minX = 1 / 0, minY = 1 / 0, vertices = this.vertices, i = 0, n = vertices.length; n > i; i += 2) {
            var rawX = vertices[i],
                rawY = vertices[i + 1],
                x = a * rawX + c * rawY + tx,
                y = d * rawY + b * rawX + ty;
            minX = minX > x ? x : minX, minY = minY > y ? y : minY, maxX = x > maxX ? x : maxX, maxY = y > maxY ? y : maxY
        }
        if (minX === -(1 / 0) || maxY === 1 / 0) return PIXI.EmptyRectangle;
        var bounds = this._bounds;
        return bounds.x = minX, bounds.width = maxX - minX, bounds.y = minY, bounds.height = maxY - minY, this._currentBounds = bounds, bounds
    }, PIXI.Strip.DrawModes = {
        TRIANGLE_STRIP: 0,
        TRIANGLES: 1
    }, PIXI.Rope = function(texture, points) {
        PIXI.Strip.call(this, texture), this.points = points, this.vertices = new PIXI.Float32Array(4 * points.length), this.uvs = new PIXI.Float32Array(4 * points.length), this.colors = new PIXI.Float32Array(2 * points.length), this.indices = new PIXI.Uint16Array(2 * points.length), this.refresh()
    }, PIXI.Rope.prototype = Object.create(PIXI.Strip.prototype), PIXI.Rope.prototype.constructor = PIXI.Rope, PIXI.Rope.prototype.refresh = function() {
        var points = this.points;
        if (!(points.length < 1)) {
            var uvs = this.uvs,
                lastPoint = points[0],
                indices = this.indices,
                colors = this.colors;
            this.count -= .2, uvs[0] = 0, uvs[1] = 0, uvs[2] = 0, uvs[3] = 1, colors[0] = 1, colors[1] = 1, indices[0] = 0, indices[1] = 1;
            for (var point, index, amount, total = points.length, i = 1; total > i; i++) point = points[i], index = 4 * i, amount = i / (total - 1), i % 2 ? (uvs[index] = amount, uvs[index + 1] = 0, uvs[index + 2] = amount, uvs[index + 3] = 1) : (uvs[index] = amount, uvs[index + 1] = 0, uvs[index + 2] = amount, uvs[index + 3] = 1), index = 2 * i, colors[index] = 1, colors[index + 1] = 1, index = 2 * i, indices[index] = index, indices[index + 1] = index + 1, lastPoint = point
        }
    }, PIXI.Rope.prototype.updateTransform = function() {
        var points = this.points;
        if (!(points.length < 1)) {
            var nextPoint, lastPoint = points[0],
                perp = {
                    x: 0,
                    y: 0
                };
            this.count -= .2;
            for (var point, index, ratio, perpLength, num, vertices = this.vertices, total = points.length, i = 0; total > i; i++) point = points[i], index = 4 * i, nextPoint = i < points.length - 1 ? points[i + 1] : point, perp.y = -(nextPoint.x - lastPoint.x), perp.x = nextPoint.y - lastPoint.y, ratio = 10 * (1 - i / (total - 1)), ratio > 1 && (ratio = 1), perpLength = Math.sqrt(perp.x * perp.x + perp.y * perp.y), num = this.texture.height / 2, perp.x /= perpLength, perp.y /= perpLength, perp.x *= num, perp.y *= num, vertices[index] = point.x + perp.x, vertices[index + 1] = point.y + perp.y, vertices[index + 2] = point.x - perp.x, vertices[index + 3] = point.y - perp.y, lastPoint = point;
            PIXI.DisplayObjectContainer.prototype.updateTransform.call(this)
        }
    }, PIXI.Rope.prototype.setTexture = function(texture) {
        this.texture = texture
    }, PIXI.TilingSprite = function(texture, width, height) {
        PIXI.Sprite.call(this, texture), this._width = width || 128, this._height = height || 128, this.tileScale = new PIXI.Point(1, 1), this.tileScaleOffset = new PIXI.Point(1, 1), this.tilePosition = new PIXI.Point, this.renderable = !0, this.tint = 16777215, this.textureDebug = !1, this.blendMode = PIXI.blendModes.NORMAL, this.canvasBuffer = null, this.tilingTexture = null, this.tilePattern = null, this.refreshTexture = !0, this.frameWidth = 0, this.frameHeight = 0
    }, PIXI.TilingSprite.prototype = Object.create(PIXI.Sprite.prototype), PIXI.TilingSprite.prototype.constructor = PIXI.TilingSprite, PIXI.TilingSprite.prototype.setTexture = function(texture) {
        this.texture !== texture && (this.texture = texture, this.refreshTexture = !0, this.cachedTint = 16777215)
    }, PIXI.TilingSprite.prototype._renderWebGL = function(renderSession) {
        if (this.visible !== !1 && 0 !== this.alpha) {
            if (this._mask && (renderSession.spriteBatch.stop(), renderSession.maskManager.pushMask(this.mask, renderSession), renderSession.spriteBatch.start()), this._filters && (renderSession.spriteBatch.flush(), renderSession.filterManager.pushFilter(this._filterBlock)), this.refreshTexture) {
                if (this.generateTilingTexture(!0, renderSession), !this.tilingTexture) return;
                this.tilingTexture.needsUpdate && (renderSession.renderer.updateTexture(this.tilingTexture.baseTexture), this.tilingTexture.needsUpdate = !1)
            }
            renderSession.spriteBatch.renderTilingSprite(this);
            for (var i = 0; i < this.children.length; i++) this.children[i]._renderWebGL(renderSession);
            renderSession.spriteBatch.stop(), this._filters && renderSession.filterManager.popFilter(), this._mask && renderSession.maskManager.popMask(this._mask, renderSession), renderSession.spriteBatch.start()
        }
    }, PIXI.TilingSprite.prototype._renderCanvas = function(renderSession) {
        if (this.visible !== !1 && 0 !== this.alpha) {
            var context = renderSession.context;
            this._mask && renderSession.maskManager.pushMask(this._mask, renderSession), context.globalAlpha = this.worldAlpha;
            var wt = this.worldTransform,
                resolution = renderSession.resolution;
            if (context.setTransform(wt.a * resolution, wt.b * resolution, wt.c * resolution, wt.d * resolution, wt.tx * resolution, wt.ty * resolution), this.refreshTexture) {
                if (this.generateTilingTexture(!1, renderSession), !this.tilingTexture) return;
                this.tilePattern = context.createPattern(this.tilingTexture.baseTexture.source, "repeat")
            }
            var sessionBlendMode = renderSession.currentBlendMode;
            this.blendMode !== renderSession.currentBlendMode && (renderSession.currentBlendMode = this.blendMode, context.globalCompositeOperation = PIXI.blendModesCanvas[renderSession.currentBlendMode]);
            var tilePosition = this.tilePosition,
                tileScale = this.tileScale;
            tilePosition.x %= this.tilingTexture.baseTexture.width, tilePosition.y %= this.tilingTexture.baseTexture.height, context.scale(tileScale.x, tileScale.y), context.translate(tilePosition.x + this.anchor.x * -this._width, tilePosition.y + this.anchor.y * -this._height), context.fillStyle = this.tilePattern;
            var tx = -tilePosition.x,
                ty = -tilePosition.y,
                tw = this._width / tileScale.x,
                th = this._height / tileScale.y;
            renderSession.roundPixels && (tx |= 0, ty |= 0, tw |= 0, th |= 0), context.fillRect(tx, ty, tw, th), context.scale(1 / tileScale.x, 1 / tileScale.y), context.translate(-tilePosition.x + this.anchor.x * this._width, -tilePosition.y + this.anchor.y * this._height), this._mask && renderSession.maskManager.popMask(renderSession);
            for (var i = 0; i < this.children.length; i++) this.children[i]._renderCanvas(renderSession);
            sessionBlendMode !== this.blendMode && (renderSession.currentBlendMode = sessionBlendMode, context.globalCompositeOperation = PIXI.blendModesCanvas[sessionBlendMode])
        }
    }, PIXI.TilingSprite.prototype.onTextureUpdate = function() {}, PIXI.TilingSprite.prototype.generateTilingTexture = function(forcePowerOfTwo, renderSession) {
        if (this.texture.baseTexture.hasLoaded) {
            var texture = this.texture,
                frame = texture.frame,
                targetWidth = this._frame.sourceSizeW,
                targetHeight = this._frame.sourceSizeH,
                dx = 0,
                dy = 0;
            this._frame.trimmed && (dx = this._frame.spriteSourceSizeX, dy = this._frame.spriteSourceSizeY), forcePowerOfTwo && (targetWidth = PIXI.getNextPowerOfTwo(targetWidth), targetHeight = PIXI.getNextPowerOfTwo(targetHeight)), this.canvasBuffer ? (this.canvasBuffer.resize(targetWidth, targetHeight), this.tilingTexture.baseTexture.width = targetWidth, this.tilingTexture.baseTexture.height = targetHeight, this.tilingTexture.needsUpdate = !0) : (this.canvasBuffer = new PIXI.CanvasBuffer(targetWidth, targetHeight), this.tilingTexture = PIXI.Texture.fromCanvas(this.canvasBuffer.canvas), this.tilingTexture.isTiling = !0, this.tilingTexture.needsUpdate = !0), this.textureDebug && (this.canvasBuffer.context.strokeStyle = "#00ff00", this.canvasBuffer.context.strokeRect(0, 0, targetWidth, targetHeight));
            var w = texture.crop.width,
                h = texture.crop.height;
            (w !== targetWidth || h !== targetHeight) && (w = targetWidth, h = targetHeight), this.canvasBuffer.context.drawImage(texture.baseTexture.source, texture.crop.x, texture.crop.y, texture.crop.width, texture.crop.height, dx, dy, w, h), this.tileScaleOffset.x = frame.width / targetWidth, this.tileScaleOffset.y = frame.height / targetHeight, this.refreshTexture = !1, this.tilingTexture.baseTexture._powerOf2 = !0
        }
    }, PIXI.TilingSprite.prototype.getBounds = function() {
        var width = this._width,
            height = this._height,
            w0 = width * (1 - this.anchor.x),
            w1 = width * -this.anchor.x,
            h0 = height * (1 - this.anchor.y),
            h1 = height * -this.anchor.y,
            worldTransform = this.worldTransform,
            a = worldTransform.a,
            b = worldTransform.b,
            c = worldTransform.c,
            d = worldTransform.d,
            tx = worldTransform.tx,
            ty = worldTransform.ty,
            x1 = a * w1 + c * h1 + tx,
            y1 = d * h1 + b * w1 + ty,
            x2 = a * w0 + c * h1 + tx,
            y2 = d * h1 + b * w0 + ty,
            x3 = a * w0 + c * h0 + tx,
            y3 = d * h0 + b * w0 + ty,
            x4 = a * w1 + c * h0 + tx,
            y4 = d * h0 + b * w1 + ty,
            maxX = -(1 / 0),
            maxY = -(1 / 0),
            minX = 1 / 0,
            minY = 1 / 0;
        minX = minX > x1 ? x1 : minX, minX = minX > x2 ? x2 : minX, minX = minX > x3 ? x3 : minX, minX = minX > x4 ? x4 : minX, minY = minY > y1 ? y1 : minY, minY = minY > y2 ? y2 : minY, minY = minY > y3 ? y3 : minY, minY = minY > y4 ? y4 : minY, maxX = x1 > maxX ? x1 : maxX, maxX = x2 > maxX ? x2 : maxX, maxX = x3 > maxX ? x3 : maxX, maxX = x4 > maxX ? x4 : maxX, maxY = y1 > maxY ? y1 : maxY, maxY = y2 > maxY ? y2 : maxY, maxY = y3 > maxY ? y3 : maxY, maxY = y4 > maxY ? y4 : maxY;
        var bounds = this._bounds;
        return bounds.x = minX, bounds.width = maxX - minX, bounds.y = minY, bounds.height = maxY - minY, this._currentBounds = bounds, bounds
    }, PIXI.TilingSprite.prototype.destroy = function() {
        PIXI.Sprite.prototype.destroy.call(this), this.canvasBuffer && (this.canvasBuffer.destroy(), this.canvasBuffer = null), this.tileScale = null, this.tileScaleOffset = null, this.tilePosition = null, this.tilingTexture && (this.tilingTexture.destroy(!0), this.tilingTexture = null)
    }, Object.defineProperty(PIXI.TilingSprite.prototype, "width", {
        get: function() {
            return this._width
        },
        set: function(value) {
            this._width = value
        }
    }), Object.defineProperty(PIXI.TilingSprite.prototype, "height", {
        get: function() {
            return this._height
        },
        set: function(value) {
            this._height = value
        }
    }), "undefined" != typeof exports ? ("undefined" != typeof module && module.exports && (exports = module.exports = PIXI), exports.PIXI = PIXI) : "undefined" != typeof define && define.amd ? define("PIXI", function() {
        return root.PIXI = PIXI
    }()) : root.PIXI = PIXI, PIXI
}).call(this),
    function() {
        function WheelEventProxy(scaleFactor, deltaMode) {
            this._scaleFactor = scaleFactor, this._deltaMode = deltaMode, this.originalEvent = null
        }
        var root = this,
            Phaser = Phaser || {
                VERSION: "2.4.4",
                GAMES: [],
                AUTO: 0,
                CANVAS: 1,
                WEBGL: 2,
                HEADLESS: 3,
                NONE: 0,
                LEFT: 1,
                RIGHT: 2,
                UP: 3,
                DOWN: 4,
                SPRITE: 0,
                BUTTON: 1,
                IMAGE: 2,
                GRAPHICS: 3,
                TEXT: 4,
                TILESPRITE: 5,
                BITMAPTEXT: 6,
                GROUP: 7,
                RENDERTEXTURE: 8,
                TILEMAP: 9,
                TILEMAPLAYER: 10,
                EMITTER: 11,
                POLYGON: 12,
                BITMAPDATA: 13,
                CANVAS_FILTER: 14,
                WEBGL_FILTER: 15,
                ELLIPSE: 16,
                SPRITEBATCH: 17,
                RETROFONT: 18,
                POINTER: 19,
                ROPE: 20,
                CIRCLE: 21,
                RECTANGLE: 22,
                LINE: 23,
                MATRIX: 24,
                POINT: 25,
                ROUNDEDRECTANGLE: 26,
                CREATURE: 27,
                VIDEO: 28,
                blendModes: {
                    NORMAL: 0,
                    ADD: 1,
                    MULTIPLY: 2,
                    SCREEN: 3,
                    OVERLAY: 4,
                    DARKEN: 5,
                    LIGHTEN: 6,
                    COLOR_DODGE: 7,
                    COLOR_BURN: 8,
                    HARD_LIGHT: 9,
                    SOFT_LIGHT: 10,
                    DIFFERENCE: 11,
                    EXCLUSION: 12,
                    HUE: 13,
                    SATURATION: 14,
                    COLOR: 15,
                    LUMINOSITY: 16
                },
                scaleModes: {
                    DEFAULT: 0,
                    LINEAR: 0,
                    NEAREST: 1
                },
                PIXI: PIXI || {}
            };
        if (Math.trunc || (Math.trunc = function(x) {
                return 0 > x ? Math.ceil(x) : Math.floor(x)
            }), Function.prototype.bind || (Function.prototype.bind = function() {
                var slice = Array.prototype.slice;
                return function(thisArg) {
                    function bound() {
                        var args = boundArgs.concat(slice.call(arguments));
                        target.apply(this instanceof bound ? this : thisArg, args)
                    }
                    var target = this,
                        boundArgs = slice.call(arguments, 1);
                    if ("function" != typeof target) throw new TypeError;
                    return bound.prototype = function F(proto) {
                        return proto && (F.prototype = proto), this instanceof F ? void 0 : new F
                    }(target.prototype), bound
                }
            }()), Array.isArray || (Array.isArray = function(arg) {
                return "[object Array]" == Object.prototype.toString.call(arg)
            }), Array.prototype.forEach || (Array.prototype.forEach = function(fun) {
                "use strict";
                if (void 0 === this || null === this) throw new TypeError;
                var t = Object(this),
                    len = t.length >>> 0;
                if ("function" != typeof fun) throw new TypeError;
                for (var thisArg = arguments.length >= 2 ? arguments[1] : void 0, i = 0; len > i; i++) i in t && fun.call(thisArg, t[i], i, t)
            }), "function" != typeof window.Uint32Array && "object" != typeof window.Uint32Array) {
            var CheapArray = function(type) {
                var proto = new Array;
                window[type] = function(arg) {
                    if ("number" == typeof arg) {
                        Array.call(this, arg), this.length = arg;
                        for (var i = 0; i < this.length; i++) this[i] = 0
                    } else {
                        Array.call(this, arg.length), this.length = arg.length;
                        for (var i = 0; i < this.length; i++) this[i] = arg[i]
                    }
                }, window[type].prototype = proto, window[type].constructor = window[type]
            };
            CheapArray("Uint32Array"), CheapArray("Int16Array")
        }
        window.console || (window.console = {}, window.console.log = window.console.assert = function() {}, window.console.warn = window.console.assert = function() {}), Phaser.Utils = {
            getProperty: function(obj, prop) {
                for (var parts = prop.split("."), last = parts.pop(), l = parts.length, i = 1, current = parts[0]; l > i && (obj = obj[current]);) current = parts[i], i++;
                return obj ? obj[last] : null
            },
            setProperty: function(obj, prop, value) {
                for (var parts = prop.split("."), last = parts.pop(), l = parts.length, i = 1, current = parts[0]; l > i && (obj = obj[current]);) current = parts[i], i++;
                return obj && (obj[last] = value), obj
            },
            chanceRoll: function(chance) {
                return void 0 === chance && (chance = 50), chance > 0 && 100 * Math.random() <= chance
            },
            randomChoice: function(choice1, choice2) {
                return Math.random() < .5 ? choice1 : choice2
            },
            parseDimension: function(size, dimension) {
                var f = 0,
                    px = 0;
                return "string" == typeof size ? "%" === size.substr(-1) ? (f = parseInt(size, 10) / 100, px = 0 === dimension ? window.innerWidth * f : window.innerHeight * f) : px = parseInt(size, 10) : px = size, px
            },
            pad: function(str, len, pad, dir) {
                if (void 0 === len) var len = 0;
                if (void 0 === pad) var pad = " ";
                if (void 0 === dir) var dir = 3;
                var padlen = 0;
                if (len + 1 >= str.length) switch (dir) {
                    case 1:
                        str = new Array(len + 1 - str.length).join(pad) + str;
                        break;
                    case 3:
                        var right = Math.ceil((padlen = len - str.length) / 2),
                            left = padlen - right;
                        str = new Array(left + 1).join(pad) + str + new Array(right + 1).join(pad);
                        break;
                    default:
                        str += new Array(len + 1 - str.length).join(pad)
                }
                return str
            },
            isPlainObject: function(obj) {
                if ("object" != typeof obj || obj.nodeType || obj === obj.window) return !1;
                try {
                    if (obj.constructor && !{}.hasOwnProperty.call(obj.constructor.prototype, "isPrototypeOf")) return !1
                } catch (e) {
                    return !1
                }
                return !0
            },
            extend: function() {
                var options, name, src, copy, copyIsArray, clone, target = arguments[0] || {},
                    i = 1,
                    length = arguments.length,
                    deep = !1;
                for ("boolean" == typeof target && (deep = target, target = arguments[1] || {}, i = 2), length === i && (target = this, --i); length > i; i++)
                    if (null != (options = arguments[i]))
                        for (name in options) src = target[name], copy = options[name], target !== copy && (deep && copy && (Phaser.Utils.isPlainObject(copy) || (copyIsArray = Array.isArray(copy))) ? (copyIsArray ? (copyIsArray = !1, clone = src && Array.isArray(src) ? src : []) : clone = src && Phaser.Utils.isPlainObject(src) ? src : {}, target[name] = Phaser.Utils.extend(deep, clone, copy)) : void 0 !== copy && (target[name] = copy));
                return target
            },
            mixinPrototype: function(target, mixin, replace) {
                void 0 === replace && (replace = !1);
                for (var mixinKeys = Object.keys(mixin), i = 0; i < mixinKeys.length; i++) {
                    var key = mixinKeys[i],
                        value = mixin[key];
                    !replace && key in target || (!value || "function" != typeof value.get && "function" != typeof value.set ? target[key] = value : "function" == typeof value.clone ? target[key] = value.clone() : Object.defineProperty(target, key, value))
                }
            },
            mixin: function(from, to) {
                if (!from || "object" != typeof from) return to;
                for (var key in from) {
                    var o = from[key];
                    if (!o.childNodes && !o.cloneNode) {
                        var type = typeof from[key];
                        from[key] && "object" === type ? typeof to[key] === type ? to[key] = Phaser.Utils.mixin(from[key], to[key]) : to[key] = Phaser.Utils.mixin(from[key], new o.constructor) : to[key] = from[key]
                    }
                }
                return to
            }
        }, Phaser.Circle = function(x, y, diameter) {
            x = x || 0, y = y || 0, diameter = diameter || 0, this.x = x, this.y = y, this._diameter = diameter, this._radius = 0, diameter > 0 && (this._radius = .5 * diameter), this.type = Phaser.CIRCLE
        }, Phaser.Circle.prototype = {
            circumference: function() {
                return 2 * (Math.PI * this._radius)
            },
            random: function(out) {
                void 0 === out && (out = new Phaser.Point);
                var t = 2 * Math.PI * Math.random(),
                    u = Math.random() + Math.random(),
                    r = u > 1 ? 2 - u : u,
                    x = r * Math.cos(t),
                    y = r * Math.sin(t);
                return out.x = this.x + x * this.radius, out.y = this.y + y * this.radius, out
            },
            getBounds: function() {
                return new Phaser.Rectangle(this.x - this.radius, this.y - this.radius, this.diameter, this.diameter)
            },
            setTo: function(x, y, diameter) {
                return this.x = x, this.y = y, this._diameter = diameter, this._radius = .5 * diameter, this
            },
            copyFrom: function(source) {
                return this.setTo(source.x, source.y, source.diameter)
            },
            copyTo: function(dest) {
                return dest.x = this.x, dest.y = this.y, dest.diameter = this._diameter, dest
            },
            distance: function(dest, round) {
                var distance = Phaser.Math.distance(this.x, this.y, dest.x, dest.y);
                return round ? Math.round(distance) : distance
            },
            clone: function(output) {
                return void 0 === output || null === output ? output = new Phaser.Circle(this.x, this.y, this.diameter) : output.setTo(this.x, this.y, this.diameter), output
            },
            contains: function(x, y) {
                return Phaser.Circle.contains(this, x, y)
            },
            circumferencePoint: function(angle, asDegrees, out) {
                return Phaser.Circle.circumferencePoint(this, angle, asDegrees, out)
            },
            offset: function(dx, dy) {
                return this.x += dx, this.y += dy, this
            },
            offsetPoint: function(point) {
                return this.offset(point.x, point.y)
            },
            toString: function() {
                return "[{Phaser.Circle (x=" + this.x + " y=" + this.y + " diameter=" + this.diameter + " radius=" + this.radius + ")}]"
            }
        }, Phaser.Circle.prototype.constructor = Phaser.Circle, Object.defineProperty(Phaser.Circle.prototype, "diameter", {
            get: function() {
                return this._diameter
            },
            set: function(value) {
                value > 0 && (this._diameter = value, this._radius = .5 * value)
            }
        }), Object.defineProperty(Phaser.Circle.prototype, "radius", {
            get: function() {
                return this._radius
            },
            set: function(value) {
                value > 0 && (this._radius = value, this._diameter = 2 * value)
            }
        }), Object.defineProperty(Phaser.Circle.prototype, "left", {
            get: function() {
                return this.x - this._radius
            },
            set: function(value) {
                value > this.x ? (this._radius = 0, this._diameter = 0) : this.radius = this.x - value
            }
        }), Object.defineProperty(Phaser.Circle.prototype, "right", {
            get: function() {
                return this.x + this._radius
            },
            set: function(value) {
                value < this.x ? (this._radius = 0, this._diameter = 0) : this.radius = value - this.x
            }
        }), Object.defineProperty(Phaser.Circle.prototype, "top", {
            get: function() {
                return this.y - this._radius
            },
            set: function(value) {
                value > this.y ? (this._radius = 0, this._diameter = 0) : this.radius = this.y - value
            }
        }), Object.defineProperty(Phaser.Circle.prototype, "bottom", {
            get: function() {
                return this.y + this._radius
            },
            set: function(value) {
                value < this.y ? (this._radius = 0, this._diameter = 0) : this.radius = value - this.y
            }
        }), Object.defineProperty(Phaser.Circle.prototype, "area", {
            get: function() {
                return this._radius > 0 ? Math.PI * this._radius * this._radius : 0
            }
        }), Object.defineProperty(Phaser.Circle.prototype, "empty", {
            get: function() {
                return 0 === this._diameter
            },
            set: function(value) {
                value === !0 && this.setTo(0, 0, 0)
            }
        }), Phaser.Circle.contains = function(a, x, y) {
            if (a.radius > 0 && x >= a.left && x <= a.right && y >= a.top && y <= a.bottom) {
                var dx = (a.x - x) * (a.x - x),
                    dy = (a.y - y) * (a.y - y);
                return dx + dy <= a.radius * a.radius
            }
            return !1
        }, Phaser.Circle.equals = function(a, b) {
            return a.x == b.x && a.y == b.y && a.diameter == b.diameter
        }, Phaser.Circle.intersects = function(a, b) {
            return Phaser.Math.distance(a.x, a.y, b.x, b.y) <= a.radius + b.radius
        }, Phaser.Circle.circumferencePoint = function(a, angle, asDegrees, out) {
            return void 0 === asDegrees && (asDegrees = !1), void 0 === out && (out = new Phaser.Point), asDegrees === !0 && (angle = Phaser.Math.degToRad(angle)), out.x = a.x + a.radius * Math.cos(angle), out.y = a.y + a.radius * Math.sin(angle), out
        }, Phaser.Circle.intersectsRectangle = function(c, r) {
            var cx = Math.abs(c.x - r.x - r.halfWidth),
                xDist = r.halfWidth + c.radius;
            if (cx > xDist) return !1;
            var cy = Math.abs(c.y - r.y - r.halfHeight),
                yDist = r.halfHeight + c.radius;
            if (cy > yDist) return !1;
            if (cx <= r.halfWidth || cy <= r.halfHeight) return !0;
            var xCornerDist = cx - r.halfWidth,
                yCornerDist = cy - r.halfHeight,
                xCornerDistSq = xCornerDist * xCornerDist,
                yCornerDistSq = yCornerDist * yCornerDist,
                maxCornerDistSq = c.radius * c.radius;
            return maxCornerDistSq >= xCornerDistSq + yCornerDistSq
        }, PIXI.Circle = Phaser.Circle, Phaser.Ellipse = function(x, y, width, height) {
            x = x || 0, y = y || 0, width = width || 0, height = height || 0, this.x = x, this.y = y, this.width = width, this.height = height, this.type = Phaser.ELLIPSE
        }, Phaser.Ellipse.prototype = {
            setTo: function(x, y, width, height) {
                return this.x = x, this.y = y, this.width = width, this.height = height, this
            },
            getBounds: function() {
                return new Phaser.Rectangle(this.x - this.width, this.y - this.height, this.width, this.height)
            },
            copyFrom: function(source) {
                return this.setTo(source.x, source.y, source.width, source.height)
            },
            copyTo: function(dest) {
                return dest.x = this.x, dest.y = this.y, dest.width = this.width, dest.height = this.height, dest
            },
            clone: function(output) {
                return void 0 === output || null === output ? output = new Phaser.Ellipse(this.x, this.y, this.width, this.height) : output.setTo(this.x, this.y, this.width, this.height), output
            },
            contains: function(x, y) {
                return Phaser.Ellipse.contains(this, x, y)
            },
            random: function(out) {
                void 0 === out && (out = new Phaser.Point);
                var p = Math.random() * Math.PI * 2,
                    r = Math.random();
                return out.x = Math.sqrt(r) * Math.cos(p), out.y = Math.sqrt(r) * Math.sin(p), out.x = this.x + out.x * this.width / 2, out.y = this.y + out.y * this.height / 2, out
            },
            toString: function() {
                return "[{Phaser.Ellipse (x=" + this.x + " y=" + this.y + " width=" + this.width + " height=" + this.height + ")}]"
            }
        }, Phaser.Ellipse.prototype.constructor = Phaser.Ellipse, Object.defineProperty(Phaser.Ellipse.prototype, "left", {
            get: function() {
                return this.x
            },
            set: function(value) {
                this.x = value
            }
        }), Object.defineProperty(Phaser.Ellipse.prototype, "right", {
            get: function() {
                return this.x + this.width
            },
            set: function(value) {
                value < this.x ? this.width = 0 : this.width = value - this.x
            }
        }), Object.defineProperty(Phaser.Ellipse.prototype, "top", {
            get: function() {
                return this.y
            },
            set: function(value) {
                this.y = value
            }
        }), Object.defineProperty(Phaser.Ellipse.prototype, "bottom", {
            get: function() {
                return this.y + this.height
            },
            set: function(value) {
                value < this.y ? this.height = 0 : this.height = value - this.y
            }
        }), Object.defineProperty(Phaser.Ellipse.prototype, "empty", {
            get: function() {
                return 0 === this.width || 0 === this.height
            },
            set: function(value) {
                value === !0 && this.setTo(0, 0, 0, 0)
            }
        }), Phaser.Ellipse.contains = function(a, x, y) {
            if (a.width <= 0 || a.height <= 0) return !1;
            var normx = (x - a.x) / a.width - .5,
                normy = (y - a.y) / a.height - .5;
            return normx *= normx, normy *= normy, .25 > normx + normy
        }, PIXI.Ellipse = Phaser.Ellipse, Phaser.Line = function(x1, y1, x2, y2) {
            x1 = x1 || 0, y1 = y1 || 0, x2 = x2 || 0, y2 = y2 || 0, this.start = new Phaser.Point(x1, y1), this.end = new Phaser.Point(x2, y2), this.type = Phaser.LINE
        }, Phaser.Line.prototype = {
            setTo: function(x1, y1, x2, y2) {
                return this.start.setTo(x1, y1), this.end.setTo(x2, y2), this
            },
            fromSprite: function(startSprite, endSprite, useCenter) {
                return void 0 === useCenter && (useCenter = !1), useCenter ? this.setTo(startSprite.center.x, startSprite.center.y, endSprite.center.x, endSprite.center.y) : this.setTo(startSprite.x, startSprite.y, endSprite.x, endSprite.y)
            },
            fromAngle: function(x, y, angle, length) {
                return this.start.setTo(x, y), this.end.setTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length), this
            },
            rotate: function(angle, asDegrees) {
                var cx = (this.start.x + this.end.x) / 2,
                    cy = (this.start.y + this.end.y) / 2;
                return this.start.rotate(cx, cy, angle, asDegrees), this.end.rotate(cx, cy, angle, asDegrees), this
            },
            rotateAround: function(x, y, angle, asDegrees) {
                return this.start.rotate(x, y, angle, asDegrees), this.end.rotate(x, y, angle, asDegrees), this
            },
            intersects: function(line, asSegment, result) {
                return Phaser.Line.intersectsPoints(this.start, this.end, line.start, line.end, asSegment, result)
            },
            reflect: function(line) {
                return Phaser.Line.reflect(this, line)
            },
            midPoint: function(out) {
                return void 0 === out && (out = new Phaser.Point), out.x = (this.start.x + this.end.x) / 2, out.y = (this.start.y + this.end.y) / 2, out
            },
            centerOn: function(x, y) {
                var cx = (this.start.x + this.end.x) / 2,
                    cy = (this.start.y + this.end.y) / 2,
                    tx = x - cx,
                    ty = y - cy;
                this.start.add(tx, ty), this.end.add(tx, ty)
            },
            pointOnLine: function(x, y) {
                return (x - this.start.x) * (this.end.y - this.start.y) === (this.end.x - this.start.x) * (y - this.start.y)
            },
            pointOnSegment: function(x, y) {
                var xMin = Math.min(this.start.x, this.end.x),
                    xMax = Math.max(this.start.x, this.end.x),
                    yMin = Math.min(this.start.y, this.end.y),
                    yMax = Math.max(this.start.y, this.end.y);
                return this.pointOnLine(x, y) && x >= xMin && xMax >= x && y >= yMin && yMax >= y
            },
            random: function(out) {
                void 0 === out && (out = new Phaser.Point);
                var t = Math.random();
                return out.x = this.start.x + t * (this.end.x - this.start.x), out.y = this.start.y + t * (this.end.y - this.start.y), out
            },
            coordinatesOnLine: function(stepRate, results) {
                void 0 === stepRate && (stepRate = 1), void 0 === results && (results = []);
                var x1 = Math.round(this.start.x),
                    y1 = Math.round(this.start.y),
                    x2 = Math.round(this.end.x),
                    y2 = Math.round(this.end.y),
                    dx = Math.abs(x2 - x1),
                    dy = Math.abs(y2 - y1),
                    sx = x2 > x1 ? 1 : -1,
                    sy = y2 > y1 ? 1 : -1,
                    err = dx - dy;
                results.push([x1, y1]);
                for (var i = 1; x1 != x2 || y1 != y2;) {
                    var e2 = err << 1;
                    e2 > -dy && (err -= dy, x1 += sx), dx > e2 && (err += dx, y1 += sy), i % stepRate === 0 && results.push([x1, y1]), i++
                }
                return results
            },
            clone: function(output) {
                return void 0 === output || null === output ? output = new Phaser.Line(this.start.x, this.start.y, this.end.x, this.end.y) : output.setTo(this.start.x, this.start.y, this.end.x, this.end.y), output
            }
        }, Object.defineProperty(Phaser.Line.prototype, "length", {
            get: function() {
                return Math.sqrt((this.end.x - this.start.x) * (this.end.x - this.start.x) + (this.end.y - this.start.y) * (this.end.y - this.start.y))
            }
        }), Object.defineProperty(Phaser.Line.prototype, "angle", {
            get: function() {
                return Math.atan2(this.end.y - this.start.y, this.end.x - this.start.x)
            }
        }), Object.defineProperty(Phaser.Line.prototype, "slope", {
            get: function() {
                return (this.end.y - this.start.y) / (this.end.x - this.start.x)
            }
        }), Object.defineProperty(Phaser.Line.prototype, "perpSlope", {
            get: function() {
                return -((this.end.x - this.start.x) / (this.end.y - this.start.y))
            }
        }), Object.defineProperty(Phaser.Line.prototype, "x", {
            get: function() {
                return Math.min(this.start.x, this.end.x)
            }
        }), Object.defineProperty(Phaser.Line.prototype, "y", {
            get: function() {
                return Math.min(this.start.y, this.end.y)
            }
        }), Object.defineProperty(Phaser.Line.prototype, "left", {
            get: function() {
                return Math.min(this.start.x, this.end.x)
            }
        }), Object.defineProperty(Phaser.Line.prototype, "right", {
            get: function() {
                return Math.max(this.start.x, this.end.x)
            }
        }), Object.defineProperty(Phaser.Line.prototype, "top", {
            get: function() {
                return Math.min(this.start.y, this.end.y)
            }
        }), Object.defineProperty(Phaser.Line.prototype, "bottom", {
            get: function() {
                return Math.max(this.start.y, this.end.y)
            }
        }), Object.defineProperty(Phaser.Line.prototype, "width", {
            get: function() {
                return Math.abs(this.start.x - this.end.x)
            }
        }), Object.defineProperty(Phaser.Line.prototype, "height", {
            get: function() {
                return Math.abs(this.start.y - this.end.y)
            }
        }), Object.defineProperty(Phaser.Line.prototype, "normalX", {
            get: function() {
                return Math.cos(this.angle - 1.5707963267948966)
            }
        }), Object.defineProperty(Phaser.Line.prototype, "normalY", {
            get: function() {
                return Math.sin(this.angle - 1.5707963267948966)
            }
        }), Object.defineProperty(Phaser.Line.prototype, "normalAngle", {
            get: function() {
                return Phaser.Math.wrap(this.angle - 1.5707963267948966, -Math.PI, Math.PI)
            }
        }), Phaser.Line.intersectsPoints = function(a, b, e, f, asSegment, result) {
            void 0 === asSegment && (asSegment = !0), void 0 === result && (result = new Phaser.Point);
            var a1 = b.y - a.y,
                a2 = f.y - e.y,
                b1 = a.x - b.x,
                b2 = e.x - f.x,
                c1 = b.x * a.y - a.x * b.y,
                c2 = f.x * e.y - e.x * f.y,
                denom = a1 * b2 - a2 * b1;
            if (0 === denom) return null;
            if (result.x = (b1 * c2 - b2 * c1) / denom, result.y = (a2 * c1 - a1 * c2) / denom, asSegment) {
                var uc = (f.y - e.y) * (b.x - a.x) - (f.x - e.x) * (b.y - a.y),
                    ua = ((f.x - e.x) * (a.y - e.y) - (f.y - e.y) * (a.x - e.x)) / uc,
                    ub = ((b.x - a.x) * (a.y - e.y) - (b.y - a.y) * (a.x - e.x)) / uc;
                return ua >= 0 && 1 >= ua && ub >= 0 && 1 >= ub ? result : null
            }
            return result
        }, Phaser.Line.intersects = function(a, b, asSegment, result) {
            return Phaser.Line.intersectsPoints(a.start, a.end, b.start, b.end, asSegment, result)
        }, Phaser.Line.reflect = function(a, b) {
            return 2 * b.normalAngle - 3.141592653589793 - a.angle
        }, Phaser.Matrix = function(a, b, c, d, tx, ty) {
            a = a || 1, b = b || 0, c = c || 0, d = d || 1, tx = tx || 0, ty = ty || 0, this.a = a, this.b = b, this.c = c, this.d = d, this.tx = tx, this.ty = ty, this.type = Phaser.MATRIX
        }, Phaser.Matrix.prototype = {
            fromArray: function(array) {
                return this.setTo(array[0], array[1], array[3], array[4], array[2], array[5])
            },
            setTo: function(a, b, c, d, tx, ty) {
                return this.a = a, this.b = b, this.c = c, this.d = d, this.tx = tx, this.ty = ty, this
            },
            clone: function(output) {
                return void 0 === output || null === output ? output = new Phaser.Matrix(this.a, this.b, this.c, this.d, this.tx, this.ty) : (output.a = this.a, output.b = this.b, output.c = this.c, output.d = this.d, output.tx = this.tx, output.ty = this.ty), output
            },
            copyTo: function(matrix) {
                return matrix.copyFrom(this), matrix
            },
            copyFrom: function(matrix) {
                return this.a = matrix.a, this.b = matrix.b, this.c = matrix.c, this.d = matrix.d, this.tx = matrix.tx, this.ty = matrix.ty, this
            },
            toArray: function(transpose, array) {
                return void 0 === array && (array = new PIXI.Float32Array(9)), transpose ? (array[0] = this.a, array[1] = this.b, array[2] = 0, array[3] = this.c, array[4] = this.d, array[5] = 0, array[6] = this.tx, array[7] = this.ty, array[8] = 1) : (array[0] = this.a, array[1] = this.c, array[2] = this.tx, array[3] = this.b, array[4] = this.d, array[5] = this.ty, array[6] = 0, array[7] = 0, array[8] = 1), array
            },
            apply: function(pos, newPos) {
                return void 0 === newPos && (newPos = new Phaser.Point), newPos.x = this.a * pos.x + this.c * pos.y + this.tx, newPos.y = this.b * pos.x + this.d * pos.y + this.ty, newPos
            },
            applyInverse: function(pos, newPos) {
                void 0 === newPos && (newPos = new Phaser.Point);
                var id = 1 / (this.a * this.d + this.c * -this.b),
                    x = pos.x,
                    y = pos.y;
                return newPos.x = this.d * id * x + -this.c * id * y + (this.ty * this.c - this.tx * this.d) * id, newPos.y = this.a * id * y + -this.b * id * x + (-this.ty * this.a + this.tx * this.b) * id, newPos
            },
            translate: function(x, y) {
                return this.tx += x, this.ty += y, this
            },
            scale: function(x, y) {
                return this.a *= x, this.d *= y, this.c *= x, this.b *= y, this.tx *= x, this.ty *= y, this
            },
            rotate: function(angle) {
                var cos = Math.cos(angle),
                    sin = Math.sin(angle),
                    a1 = this.a,
                    c1 = this.c,
                    tx1 = this.tx;
                return this.a = a1 * cos - this.b * sin, this.b = a1 * sin + this.b * cos, this.c = c1 * cos - this.d * sin, this.d = c1 * sin + this.d * cos, this.tx = tx1 * cos - this.ty * sin, this.ty = tx1 * sin + this.ty * cos, this
            },
            append: function(matrix) {
                var a1 = this.a,
                    b1 = this.b,
                    c1 = this.c,
                    d1 = this.d;
                return this.a = matrix.a * a1 + matrix.b * c1, this.b = matrix.a * b1 + matrix.b * d1, this.c = matrix.c * a1 + matrix.d * c1, this.d = matrix.c * b1 + matrix.d * d1, this.tx = matrix.tx * a1 + matrix.ty * c1 + this.tx, this.ty = matrix.tx * b1 + matrix.ty * d1 + this.ty, this
            },
            identity: function() {
                return this.setTo(1, 0, 0, 1, 0, 0)
            }
        }, Phaser.identityMatrix = new Phaser.Matrix, PIXI.Matrix = Phaser.Matrix, PIXI.identityMatrix = Phaser.identityMatrix, Phaser.Point = function(x, y) {
            x = x || 0, y = y || 0, this.x = x, this.y = y, this.type = Phaser.POINT
        }, Phaser.Point.prototype = {
            copyFrom: function(source) {
                return this.setTo(source.x, source.y)
            },
            invert: function() {
                return this.setTo(this.y, this.x)
            },
            setTo: function(x, y) {
                return this.x = x || 0, this.y = y || (0 !== y ? this.x : 0), this
            },
            set: function(x, y) {
                return this.x = x || 0, this.y = y || (0 !== y ? this.x : 0), this
            },
            add: function(x, y) {
                return this.x += x, this.y += y, this
            },
            subtract: function(x, y) {
                return this.x -= x, this.y -= y, this
            },
            multiply: function(x, y) {
                return this.x *= x, this.y *= y, this
            },
            divide: function(x, y) {
                return this.x /= x, this.y /= y, this
            },
            clampX: function(min, max) {
                return this.x = Phaser.Math.clamp(this.x, min, max), this
            },
            clampY: function(min, max) {
                return this.y = Phaser.Math.clamp(this.y, min, max), this
            },
            clamp: function(min, max) {
                return this.x = Phaser.Math.clamp(this.x, min, max), this.y = Phaser.Math.clamp(this.y, min, max), this
            },
            clone: function(output) {
                return void 0 === output || null === output ? output = new Phaser.Point(this.x, this.y) : output.setTo(this.x, this.y), output
            },
            copyTo: function(dest) {
                return dest.x = this.x, dest.y = this.y, dest
            },
            distance: function(dest, round) {
                return Phaser.Point.distance(this, dest, round)
            },
            equals: function(a) {
                return a.x === this.x && a.y === this.y
            },
            angle: function(a, asDegrees) {
                return void 0 === asDegrees && (asDegrees = !1), asDegrees ? Phaser.Math.radToDeg(Math.atan2(a.y - this.y, a.x - this.x)) : Math.atan2(a.y - this.y, a.x - this.x)
            },
            rotate: function(x, y, angle, asDegrees, distance) {
                return Phaser.Point.rotate(this, x, y, angle, asDegrees, distance)
            },
            getMagnitude: function() {
                return Math.sqrt(this.x * this.x + this.y * this.y)
            },
            getMagnitudeSq: function() {
                return this.x * this.x + this.y * this.y
            },
            setMagnitude: function(magnitude) {
                return this.normalize().multiply(magnitude, magnitude)
            },
            normalize: function() {
                if (!this.isZero()) {
                    var m = this.getMagnitude();
                    this.x /= m, this.y /= m
                }
                return this
            },
            isZero: function() {
                return 0 === this.x && 0 === this.y
            },
            dot: function(a) {
                return this.x * a.x + this.y * a.y
            },
            cross: function(a) {
                return this.x * a.y - this.y * a.x
            },
            perp: function() {
                return this.setTo(-this.y, this.x)
            },
            rperp: function() {
                return this.setTo(this.y, -this.x)
            },
            normalRightHand: function() {
                return this.setTo(-1 * this.y, this.x)
            },
            floor: function() {
                return this.setTo(Math.floor(this.x), Math.floor(this.y))
            },
            ceil: function() {
                return this.setTo(Math.ceil(this.x), Math.ceil(this.y))
            },
            toString: function() {
                return "[{Point (x=" + this.x + " y=" + this.y + ")}]"
            }
        }, Phaser.Point.prototype.constructor = Phaser.Point, Phaser.Point.add = function(a, b, out) {
            return void 0 === out && (out = new Phaser.Point), out.x = a.x + b.x, out.y = a.y + b.y, out
        }, Phaser.Point.subtract = function(a, b, out) {
            return void 0 === out && (out = new Phaser.Point), out.x = a.x - b.x, out.y = a.y - b.y, out
        }, Phaser.Point.multiply = function(a, b, out) {
            return void 0 === out && (out = new Phaser.Point), out.x = a.x * b.x, out.y = a.y * b.y, out
        }, Phaser.Point.divide = function(a, b, out) {
            return void 0 === out && (out = new Phaser.Point), out.x = a.x / b.x, out.y = a.y / b.y, out
        }, Phaser.Point.equals = function(a, b) {
            return a.x === b.x && a.y === b.y
        }, Phaser.Point.angle = function(a, b) {
            return Math.atan2(a.y - b.y, a.x - b.x)
        }, Phaser.Point.negative = function(a, out) {
            return void 0 === out && (out = new Phaser.Point), out.setTo(-a.x, -a.y)
        }, Phaser.Point.multiplyAdd = function(a, b, s, out) {
            return void 0 === out && (out = new Phaser.Point), out.setTo(a.x + b.x * s, a.y + b.y * s)
        }, Phaser.Point.interpolate = function(a, b, f, out) {
            return void 0 === out && (out = new Phaser.Point), out.setTo(a.x + (b.x - a.x) * f, a.y + (b.y - a.y) * f)
        }, Phaser.Point.perp = function(a, out) {
            return void 0 === out && (out = new Phaser.Point), out.setTo(-a.y, a.x)
        }, Phaser.Point.rperp = function(a, out) {
            return void 0 === out && (out = new Phaser.Point), out.setTo(a.y, -a.x)
        }, Phaser.Point.distance = function(a, b, round) {
            var distance = Phaser.Math.distance(a.x, a.y, b.x, b.y);
            return round ? Math.round(distance) : distance
        }, Phaser.Point.project = function(a, b, out) {
            void 0 === out && (out = new Phaser.Point);
            var amt = a.dot(b) / b.getMagnitudeSq();
            return 0 !== amt && out.setTo(amt * b.x, amt * b.y), out
        }, Phaser.Point.projectUnit = function(a, b, out) {
            void 0 === out && (out = new Phaser.Point);
            var amt = a.dot(b);
            return 0 !== amt && out.setTo(amt * b.x, amt * b.y), out
        }, Phaser.Point.normalRightHand = function(a, out) {
            return void 0 === out && (out = new Phaser.Point), out.setTo(-1 * a.y, a.x)
        }, Phaser.Point.normalize = function(a, out) {
            void 0 === out && (out = new Phaser.Point);
            var m = a.getMagnitude();
            return 0 !== m && out.setTo(a.x / m, a.y / m), out
        }, Phaser.Point.rotate = function(a, x, y, angle, asDegrees, distance) {
            if (asDegrees && (angle = Phaser.Math.degToRad(angle)), void 0 === distance) {
                a.subtract(x, y);
                var s = Math.sin(angle),
                    c = Math.cos(angle),
                    tx = c * a.x - s * a.y,
                    ty = s * a.x + c * a.y;
                a.x = tx + x, a.y = ty + y
            } else {
                var t = angle + Math.atan2(a.y - y, a.x - x);
                a.x = x + distance * Math.cos(t), a.y = y + distance * Math.sin(t)
            }
            return a
        }, Phaser.Point.centroid = function(points, out) {
            if (void 0 === out && (out = new Phaser.Point), "[object Array]" !== Object.prototype.toString.call(points)) throw new Error("Phaser.Point. Parameter 'points' must be an array");
            var pointslength = points.length;
            if (1 > pointslength) throw new Error("Phaser.Point. Parameter 'points' array must not be empty");
            if (1 === pointslength) return out.copyFrom(points[0]), out;
            for (var i = 0; pointslength > i; i++) Phaser.Point.add(out, points[i], out);
            return out.divide(pointslength, pointslength), out
        }, Phaser.Point.parse = function(obj, xProp, yProp) {
            xProp = xProp || "x", yProp = yProp || "y";
            var point = new Phaser.Point;
            return obj[xProp] && (point.x = parseInt(obj[xProp], 10)), obj[yProp] && (point.y = parseInt(obj[yProp], 10)), point
        }, PIXI.Point = Phaser.Point, Phaser.Polygon = function() {
            this.area = 0, this._points = [], arguments.length > 0 && this.setTo.apply(this, arguments), this.closed = !0, this.type = Phaser.POLYGON
        }, Phaser.Polygon.prototype = {
            toNumberArray: function(output) {
                void 0 === output && (output = []);
                for (var i = 0; i < this._points.length; i++) "number" == typeof this._points[i] ? (output.push(this._points[i]), output.push(this._points[i + 1]), i++) : (output.push(this._points[i].x), output.push(this._points[i].y));
                return output
            },
            flatten: function() {
                return this._points = this.toNumberArray(), this
            },
            clone: function(output) {
                var points = this._points.slice();
                return void 0 === output || null === output ? output = new Phaser.Polygon(points) : output.setTo(points), output
            },
            contains: function(x, y) {
                for (var length = this._points.length, inside = !1, i = -1, j = length - 1; ++i < length; j = i) {
                    var ix = this._points[i].x,
                        iy = this._points[i].y,
                        jx = this._points[j].x,
                        jy = this._points[j].y;
                    (y >= iy && jy > y || y >= jy && iy > y) && (jx - ix) * (y - iy) / (jy - iy) + ix > x && (inside = !inside)
                }
                return inside
            },
            setTo: function(points) {
                if (this.area = 0, this._points = [], arguments.length > 0) {
                    Array.isArray(points) || (points = Array.prototype.slice.call(arguments));
                    for (var y0 = Number.MAX_VALUE, i = 0, len = points.length; len > i; i++) {
                        if ("number" == typeof points[i]) {
                            var p = new PIXI.Point(points[i], points[i + 1]);
                            i++
                        } else var p = new PIXI.Point(points[i].x, points[i].y);
                        this._points.push(p), p.y < y0 && (y0 = p.y)
                    }
                    this.calculateArea(y0)
                }
                return this
            },
            calculateArea: function(y0) {
                for (var p1, p2, avgHeight, width, i = 0, len = this._points.length; len > i; i++) p1 = this._points[i], p2 = i === len - 1 ? this._points[0] : this._points[i + 1], avgHeight = (p1.y - y0 + (p2.y - y0)) / 2, width = p1.x - p2.x, this.area += avgHeight * width;
                return this.area
            }
        }, Phaser.Polygon.prototype.constructor = Phaser.Polygon, Object.defineProperty(Phaser.Polygon.prototype, "points", {
            get: function() {
                return this._points
            },
            set: function(points) {
                null != points ? this.setTo(points) : this.setTo()
            }
        }), PIXI.Polygon = Phaser.Polygon, Phaser.Rectangle = function(x, y, width, height) {
            x = x || 0, y = y || 0, width = width || 0, height = height || 0, this.x = x, this.y = y, this.width = width, this.height = height, this.type = Phaser.RECTANGLE
        }, Phaser.Rectangle.prototype = {
            offset: function(dx, dy) {
                return this.x += dx, this.y += dy, this
            },
            offsetPoint: function(point) {
                return this.offset(point.x, point.y)
            },
            setTo: function(x, y, width, height) {
                return this.x = x, this.y = y, this.width = width, this.height = height, this
            },
            scale: function(x, y) {
                return void 0 === y && (y = x), this.width *= x, this.height *= y, this
            },
            centerOn: function(x, y) {
                return this.centerX = x, this.centerY = y, this
            },
            floor: function() {
                this.x = Math.floor(this.x), this.y = Math.floor(this.y)
            },
            floorAll: function() {
                this.x = Math.floor(this.x), this.y = Math.floor(this.y), this.width = Math.floor(this.width), this.height = Math.floor(this.height)
            },
            ceil: function() {
                this.x = Math.ceil(this.x), this.y = Math.ceil(this.y)
            },
            ceilAll: function() {
                this.x = Math.ceil(this.x), this.y = Math.ceil(this.y), this.width = Math.ceil(this.width), this.height = Math.ceil(this.height)
            },
            copyFrom: function(source) {
                return this.setTo(source.x, source.y, source.width, source.height)
            },
            copyTo: function(dest) {
                return dest.x = this.x, dest.y = this.y, dest.width = this.width, dest.height = this.height, dest
            },
            inflate: function(dx, dy) {
                return Phaser.Rectangle.inflate(this, dx, dy)
            },
            size: function(output) {
                return Phaser.Rectangle.size(this, output)
            },
            resize: function(width, height) {
                return this.width = width, this.height = height, this
            },
            clone: function(output) {
                return Phaser.Rectangle.clone(this, output)
            },
            contains: function(x, y) {
                return Phaser.Rectangle.contains(this, x, y)
            },
            containsRect: function(b) {
                return Phaser.Rectangle.containsRect(b, this)
            },
            equals: function(b) {
                return Phaser.Rectangle.equals(this, b)
            },
            intersection: function(b, out) {
                return Phaser.Rectangle.intersection(this, b, out)
            },
            intersects: function(b) {
                return Phaser.Rectangle.intersects(this, b)
            },
            intersectsRaw: function(left, right, top, bottom, tolerance) {
                return Phaser.Rectangle.intersectsRaw(this, left, right, top, bottom, tolerance)
            },
            union: function(b, out) {
                return Phaser.Rectangle.union(this, b, out)
            },
            random: function(out) {
                return void 0 === out && (out = new Phaser.Point), out.x = this.randomX, out.y = this.randomY, out
            },
            toString: function() {
                return "[{Rectangle (x=" + this.x + " y=" + this.y + " width=" + this.width + " height=" + this.height + " empty=" + this.empty + ")}]"
            }
        }, Object.defineProperty(Phaser.Rectangle.prototype, "halfWidth", {
            get: function() {
                return Math.round(this.width / 2)
            }
        }), Object.defineProperty(Phaser.Rectangle.prototype, "halfHeight", {
            get: function() {
                return Math.round(this.height / 2)
            }
        }), Object.defineProperty(Phaser.Rectangle.prototype, "bottom", {
            get: function() {
                return this.y + this.height
            },
            set: function(value) {
                value <= this.y ? this.height = 0 : this.height = value - this.y
            }
        }), Object.defineProperty(Phaser.Rectangle.prototype, "bottomLeft", {
            get: function() {
                return new Phaser.Point(this.x, this.bottom)
            },
            set: function(value) {
                this.x = value.x, this.bottom = value.y
            }
        }), Object.defineProperty(Phaser.Rectangle.prototype, "bottomRight", {
            get: function() {
                return new Phaser.Point(this.right, this.bottom)
            },
            set: function(value) {
                this.right = value.x, this.bottom = value.y
            }
        }), Object.defineProperty(Phaser.Rectangle.prototype, "left", {
            get: function() {
                return this.x
            },
            set: function(value) {
                value >= this.right ? this.width = 0 : this.width = this.right - value, this.x = value
            }
        }), Object.defineProperty(Phaser.Rectangle.prototype, "right", {
            get: function() {
                return this.x + this.width
            },
            set: function(value) {
                value <= this.x ? this.width = 0 : this.width = value - this.x
            }
        }), Object.defineProperty(Phaser.Rectangle.prototype, "volume", {
            get: function() {
                return this.width * this.height
            }
        }), Object.defineProperty(Phaser.Rectangle.prototype, "perimeter", {
            get: function() {
                return 2 * this.width + 2 * this.height
            }
        }), Object.defineProperty(Phaser.Rectangle.prototype, "centerX", {
            get: function() {
                return this.x + this.halfWidth
            },
            set: function(value) {
                this.x = value - this.halfWidth
            }
        }), Object.defineProperty(Phaser.Rectangle.prototype, "centerY", {
            get: function() {
                return this.y + this.halfHeight
            },
            set: function(value) {
                this.y = value - this.halfHeight
            }
        }), Object.defineProperty(Phaser.Rectangle.prototype, "randomX", {
            get: function() {
                return this.x + Math.random() * this.width
            }
        }), Object.defineProperty(Phaser.Rectangle.prototype, "randomY", {
            get: function() {
                return this.y + Math.random() * this.height
            }
        }), Object.defineProperty(Phaser.Rectangle.prototype, "top", {
            get: function() {
                return this.y
            },
            set: function(value) {
                value >= this.bottom ? (this.height = 0, this.y = value) : this.height = this.bottom - value
            }
        }), Object.defineProperty(Phaser.Rectangle.prototype, "topLeft", {
            get: function() {
                return new Phaser.Point(this.x, this.y)
            },
            set: function(value) {
                this.x = value.x, this.y = value.y
            }
        }), Object.defineProperty(Phaser.Rectangle.prototype, "topRight", {
            get: function() {
                return new Phaser.Point(this.x + this.width, this.y)
            },
            set: function(value) {
                this.right = value.x, this.y = value.y
            }
        }), Object.defineProperty(Phaser.Rectangle.prototype, "empty", {
            get: function() {
                return !this.width || !this.height
            },
            set: function(value) {
                value === !0 && this.setTo(0, 0, 0, 0)
            }
        }), Phaser.Rectangle.prototype.constructor = Phaser.Rectangle, Phaser.Rectangle.inflate = function(a, dx, dy) {
            return a.x -= dx, a.width += 2 * dx, a.y -= dy, a.height += 2 * dy, a
        }, Phaser.Rectangle.inflatePoint = function(a, point) {
            return Phaser.Rectangle.inflate(a, point.x, point.y)
        }, Phaser.Rectangle.size = function(a, output) {
            return void 0 === output || null === output ? output = new Phaser.Point(a.width, a.height) : output.setTo(a.width, a.height), output
        }, Phaser.Rectangle.clone = function(a, output) {
            return void 0 === output || null === output ? output = new Phaser.Rectangle(a.x, a.y, a.width, a.height) : output.setTo(a.x, a.y, a.width, a.height), output
        }, Phaser.Rectangle.contains = function(a, x, y) {
            return a.width <= 0 || a.height <= 0 ? !1 : x >= a.x && x < a.right && y >= a.y && y < a.bottom
        }, Phaser.Rectangle.containsRaw = function(rx, ry, rw, rh, x, y) {
            return x >= rx && rx + rw > x && y >= ry && ry + rh > y
        }, Phaser.Rectangle.containsPoint = function(a, point) {
            return Phaser.Rectangle.contains(a, point.x, point.y)
        }, Phaser.Rectangle.containsRect = function(a, b) {
            return a.volume > b.volume ? !1 : a.x >= b.x && a.y >= b.y && a.right < b.right && a.bottom < b.bottom
        }, Phaser.Rectangle.equals = function(a, b) {
            return a.x == b.x && a.y == b.y && a.width == b.width && a.height == b.height
        }, Phaser.Rectangle.sameDimensions = function(a, b) {
            return a.width === b.width && a.height === b.height
        }, Phaser.Rectangle.intersection = function(a, b, output) {
            return void 0 === output && (output = new Phaser.Rectangle), Phaser.Rectangle.intersects(a, b) && (output.x = Math.max(a.x, b.x), output.y = Math.max(a.y, b.y), output.width = Math.min(a.right, b.right) - output.x, output.height = Math.min(a.bottom, b.bottom) - output.y), output
        }, Phaser.Rectangle.intersects = function(a, b) {
            return a.width <= 0 || a.height <= 0 || b.width <= 0 || b.height <= 0 ? !1 : !(a.right < b.x || a.bottom < b.y || a.x > b.right || a.y > b.bottom)
        }, Phaser.Rectangle.intersectsRaw = function(a, left, right, top, bottom, tolerance) {
            return void 0 === tolerance && (tolerance = 0), !(left > a.right + tolerance || right < a.left - tolerance || top > a.bottom + tolerance || bottom < a.top - tolerance)
        }, Phaser.Rectangle.union = function(a, b, output) {
            return void 0 === output && (output = new Phaser.Rectangle), output.setTo(Math.min(a.x, b.x), Math.min(a.y, b.y), Math.max(a.right, b.right) - Math.min(a.left, b.left), Math.max(a.bottom, b.bottom) - Math.min(a.top, b.top))
        }, Phaser.Rectangle.aabb = function(points, out) {
            void 0 === out && (out = new Phaser.Rectangle);
            var xMax = Number.MIN_VALUE,
                xMin = Number.MAX_VALUE,
                yMax = Number.MIN_VALUE,
                yMin = Number.MAX_VALUE;
            return points.forEach(function(point) {
                point.x > xMax && (xMax = point.x), point.x < xMin && (xMin = point.x), point.y > yMax && (yMax = point.y), point.y < yMin && (yMin = point.y)
            }), out.setTo(xMin, yMin, xMax - xMin, yMax - yMin), out
        }, PIXI.Rectangle = Phaser.Rectangle, PIXI.EmptyRectangle = new Phaser.Rectangle(0, 0, 0, 0), Phaser.RoundedRectangle = function(x, y, width, height, radius) {
            void 0 === x && (x = 0), void 0 === y && (y = 0), void 0 === width && (width = 0), void 0 === height && (height = 0), void 0 === radius && (radius = 20), this.x = x, this.y = y, this.width = width, this.height = height, this.radius = radius || 20, this.type = Phaser.ROUNDEDRECTANGLE
        }, Phaser.RoundedRectangle.prototype = {
            clone: function() {
                return new Phaser.RoundedRectangle(this.x, this.y, this.width, this.height, this.radius)
            },
            contains: function(x, y) {
                if (this.width <= 0 || this.height <= 0) return !1;
                var x1 = this.x;
                if (x >= x1 && x <= x1 + this.width) {
                    var y1 = this.y;
                    if (y >= y1 && y <= y1 + this.height) return !0
                }
                return !1
            }
        }, Phaser.RoundedRectangle.prototype.constructor = Phaser.RoundedRectangle, PIXI.RoundedRectangle = Phaser.RoundedRectangle, Phaser.Camera = function(game, id, x, y, width, height) {
            this.game = game, this.world = game.world, this.id = 0, this.view = new Phaser.Rectangle(x, y, width, height), this.bounds = new Phaser.Rectangle(x, y, width, height), this.deadzone = null, this.visible = !0, this.roundPx = !0, this.atLimit = {
                x: !1,
                y: !1
            }, this.target = null, this.displayObject = null, this.scale = null, this.totalInView = 0, this._targetPosition = new Phaser.Point, this._edge = 0, this._position = new Phaser.Point
        }, Phaser.Camera.FOLLOW_LOCKON = 0, Phaser.Camera.FOLLOW_PLATFORMER = 1, Phaser.Camera.FOLLOW_TOPDOWN = 2, Phaser.Camera.FOLLOW_TOPDOWN_TIGHT = 3, Phaser.Camera.prototype = {
            preUpdate: function() {
                this.totalInView = 0
            },
            follow: function(target, style) {
                void 0 === style && (style = Phaser.Camera.FOLLOW_LOCKON), this.target = target;
                var helper;
                switch (style) {
                    case Phaser.Camera.FOLLOW_PLATFORMER:
                        var w = this.width / 8,
                            h = this.height / 3;
                        this.deadzone = new Phaser.Rectangle((this.width - w) / 2, (this.height - h) / 2 - .25 * h, w, h);
                        break;
                    case Phaser.Camera.FOLLOW_TOPDOWN:
                        helper = Math.max(this.width, this.height) / 4, this.deadzone = new Phaser.Rectangle((this.width - helper) / 2, (this.height - helper) / 2, helper, helper);
                        break;
                    case Phaser.Camera.FOLLOW_TOPDOWN_TIGHT:
                        helper = Math.max(this.width, this.height) / 8, this.deadzone = new Phaser.Rectangle((this.width - helper) / 2, (this.height - helper) / 2, helper, helper);
                        break;
                    case Phaser.Camera.FOLLOW_LOCKON:
                        this.deadzone = null;
                        break;
                    default:
                        this.deadzone = null
                }
            },
            unfollow: function() {
                this.target = null
            },
            focusOn: function(displayObject) {
                this.setPosition(Math.round(displayObject.x - this.view.halfWidth), Math.round(displayObject.y - this.view.halfHeight))
            },
            focusOnXY: function(x, y) {
                this.setPosition(Math.round(x - this.view.halfWidth), Math.round(y - this.view.halfHeight))
            },
            update: function() {
                this.target && this.updateTarget(), this.bounds && this.checkBounds(), this.roundPx && this.view.floor(), this.displayObject.position.x = -this.view.x, this.displayObject.position.y = -this.view.y
            },
            updateTarget: function() {
                this._targetPosition.copyFrom(this.target), this.target.parent && this._targetPosition.multiply(this.target.parent.worldTransform.a, this.target.parent.worldTransform.d), this.deadzone ? (this._edge = this._targetPosition.x - this.view.x, this._edge < this.deadzone.left ? this.view.x = this._targetPosition.x - this.deadzone.left : this._edge > this.deadzone.right && (this.view.x = this._targetPosition.x - this.deadzone.right), this._edge = this._targetPosition.y - this.view.y, this._edge < this.deadzone.top ? this.view.y = this._targetPosition.y - this.deadzone.top : this._edge > this.deadzone.bottom && (this.view.y = this._targetPosition.y - this.deadzone.bottom)) : (this.view.x = this._targetPosition.x - this.view.halfWidth, this.view.y = this._targetPosition.y - this.view.halfHeight)
            },
            setBoundsToWorld: function() {
                this.bounds && this.bounds.copyFrom(this.game.world.bounds)
            },
            checkBounds: function() {
                this.atLimit.x = !1, this.atLimit.y = !1, this.view.x <= this.bounds.x && (this.atLimit.x = !0, this.view.x = this.bounds.x), this.view.right >= this.bounds.right && (this.atLimit.x = !0, this.view.x = this.bounds.right - this.width), this.view.y <= this.bounds.top && (this.atLimit.y = !0, this.view.y = this.bounds.top), this.view.bottom >= this.bounds.bottom && (this.atLimit.y = !0, this.view.y = this.bounds.bottom - this.height)
            },
            setPosition: function(x, y) {
                this.view.x = x, this.view.y = y, this.bounds && this.checkBounds()
            },
            setSize: function(width, height) {
                this.view.width = width, this.view.height = height
            },
            reset: function() {
                this.target = null, this.view.x = 0, this.view.y = 0
            }
        }, Phaser.Camera.prototype.constructor = Phaser.Camera, Object.defineProperty(Phaser.Camera.prototype, "x", {
            get: function() {
                return this.view.x
            },
            set: function(value) {
                this.view.x = value, this.bounds && this.checkBounds()
            }
        }), Object.defineProperty(Phaser.Camera.prototype, "y", {
            get: function() {
                return this.view.y
            },
            set: function(value) {
                this.view.y = value, this.bounds && this.checkBounds()
            }
        }), Object.defineProperty(Phaser.Camera.prototype, "position", {
            get: function() {
                return this._position.set(this.view.centerX, this.view.centerY), this._position
            },
            set: function(value) {
                "undefined" != typeof value.x && (this.view.x = value.x), "undefined" != typeof value.y && (this.view.y = value.y), this.bounds && this.checkBounds()
            }
        }), Object.defineProperty(Phaser.Camera.prototype, "width", {
            get: function() {
                return this.view.width
            },
            set: function(value) {
                this.view.width = value
            }
        }), Object.defineProperty(Phaser.Camera.prototype, "height", {
            get: function() {
                return this.view.height
            },
            set: function(value) {
                this.view.height = value
            }
        }), Phaser.State = function() {
            this.game = null, this.key = "", this.add = null, this.make = null, this.camera = null, this.cache = null, this.input = null, this.load = null, this.math = null, this.sound = null, this.scale = null, this.stage = null, this.time = null, this.tweens = null, this.world = null, this.particles = null, this.physics = null, this.rnd = null
        }, Phaser.State.prototype = {
            init: function() {},
            preload: function() {},
            loadUpdate: function() {},
            loadRender: function() {},
            create: function() {},
            update: function() {},
            preRender: function() {},
            render: function() {},
            resize: function() {},
            paused: function() {},
            resumed: function() {},
            pauseUpdate: function() {},
            shutdown: function() {}
        }, Phaser.State.prototype.constructor = Phaser.State, Phaser.StateManager = function(game, pendingState) {
            this.game = game, this.states = {}, this._pendingState = null, "undefined" != typeof pendingState && null !== pendingState && (this._pendingState = pendingState), this._clearWorld = !1, this._clearCache = !1, this._created = !1, this._args = [], this.current = "", this.onStateChange = new Phaser.Signal, this.onInitCallback = null, this.onPreloadCallback = null, this.onCreateCallback = null, this.onUpdateCallback = null, this.onRenderCallback = null, this.onResizeCallback = null, this.onPreRenderCallback = null, this.onLoadUpdateCallback = null, this.onLoadRenderCallback = null, this.onPausedCallback = null, this.onResumedCallback = null, this.onPauseUpdateCallback = null, this.onShutDownCallback = null
        }, Phaser.StateManager.prototype = {
            boot: function() {
                this.game.onPause.add(this.pause, this), this.game.onResume.add(this.resume, this), null !== this._pendingState && "string" != typeof this._pendingState && this.add("default", this._pendingState, !0)
            },
            add: function(key, state, autoStart) {
                void 0 === autoStart && (autoStart = !1);
                var newState;
                return state instanceof Phaser.State ? newState = state : "object" == typeof state ? (newState = state, newState.game = this.game) : "function" == typeof state && (newState = new state(this.game)), this.states[key] = newState, autoStart && (this.game.isBooted ? this.start(key) : this._pendingState = key), newState
            },
            remove: function(key) {
                this.current === key && (this.callbackContext = null, this.onInitCallback = null, this.onShutDownCallback = null, this.onPreloadCallback = null, this.onLoadRenderCallback = null, this.onLoadUpdateCallback = null, this.onCreateCallback = null, this.onUpdateCallback = null, this.onPreRenderCallback = null, this.onRenderCallback = null, this.onResizeCallback = null, this.onPausedCallback = null, this.onResumedCallback = null, this.onPauseUpdateCallback = null), delete this.states[key]
            },
            start: function(key, clearWorld, clearCache) {
                void 0 === clearWorld && (clearWorld = !0), void 0 === clearCache && (clearCache = !1), this.checkState(key) && (this._pendingState = key, this._clearWorld = clearWorld, this._clearCache = clearCache, arguments.length > 3 && (this._args = Array.prototype.splice.call(arguments, 3)))
            },
            restart: function(clearWorld, clearCache) {
                void 0 === clearWorld && (clearWorld = !0), void 0 === clearCache && (clearCache = !1), this._pendingState = this.current, this._clearWorld = clearWorld, this._clearCache = clearCache, arguments.length > 2 && (this._args = Array.prototype.slice.call(arguments, 2))
            },
            dummy: function() {},
            preUpdate: function() {
                if (this._pendingState && this.game.isBooted) {
                    var previousStateKey = this.current;
                    if (this.clearCurrentState(), this.setCurrentState(this._pendingState), this.onStateChange.dispatch(this.current, previousStateKey), this.current !== this._pendingState) return;
                    this._pendingState = null, this.onPreloadCallback ? (this.game.load.reset(!0), this.onPreloadCallback.call(this.callbackContext, this.game), 0 === this.game.load.totalQueuedFiles() && 0 === this.game.load.totalQueuedPacks() ? this.loadComplete() : this.game.load.start()) : this.loadComplete()
                }
            },
            clearCurrentState: function() {
                this.current && (this.onShutDownCallback && this.onShutDownCallback.call(this.callbackContext, this.game), this.game.tweens.removeAll(), this.game.camera.reset(), this.game.input.reset(!0), this.game.physics.clear(), this.game.time.removeAll(), this.game.scale.reset(this._clearWorld), this.game.debug && this.game.debug.reset(), this._clearWorld && (this.game.world.shutdown(), this._clearCache === !0 && this.game.cache.destroy()))
            },
            checkState: function(key) {
                if (this.states[key]) {
                    var valid = !1;
                    return (this.states[key].preload || this.states[key].create || this.states[key].update || this.states[key].render) && (valid = !0), valid === !1 ? (console.warn("Invalid Phaser State object given. Must contain at least a one of the required functions: preload, create, update or render"), !1) : !0
                }
                return console.warn("Phaser.StateManager - No state found with the key: " + key), !1
            },
            link: function(key) {
                this.states[key].game = this.game, this.states[key].add = this.game.add, this.states[key].make = this.game.make, this.states[key].camera = this.game.camera, this.states[key].cache = this.game.cache, this.states[key].input = this.game.input, this.states[key].load = this.game.load, this.states[key].math = this.game.math, this.states[key].sound = this.game.sound, this.states[key].scale = this.game.scale, this.states[key].state = this, this.states[key].stage = this.game.stage, this.states[key].time = this.game.time, this.states[key].tweens = this.game.tweens, this.states[key].world = this.game.world, this.states[key].particles = this.game.particles, this.states[key].rnd = this.game.rnd, this.states[key].physics = this.game.physics, this.states[key].key = key
            },
            unlink: function(key) {
                this.states[key] && (this.states[key].game = null, this.states[key].add = null, this.states[key].make = null, this.states[key].camera = null, this.states[key].cache = null, this.states[key].input = null, this.states[key].load = null, this.states[key].math = null, this.states[key].sound = null, this.states[key].scale = null, this.states[key].state = null, this.states[key].stage = null, this.states[key].time = null, this.states[key].tweens = null, this.states[key].world = null, this.states[key].particles = null, this.states[key].rnd = null, this.states[key].physics = null)
            },
            setCurrentState: function(key) {
                this.callbackContext = this.states[key], this.link(key), this.onInitCallback = this.states[key].init || this.dummy, this.onPreloadCallback = this.states[key].preload || null, this.onLoadRenderCallback = this.states[key].loadRender || null, this.onLoadUpdateCallback = this.states[key].loadUpdate || null, this.onCreateCallback = this.states[key].create || null, this.onUpdateCallback = this.states[key].update || null,
                    this.onPreRenderCallback = this.states[key].preRender || null, this.onRenderCallback = this.states[key].render || null, this.onResizeCallback = this.states[key].resize || null, this.onPausedCallback = this.states[key].paused || null, this.onResumedCallback = this.states[key].resumed || null, this.onPauseUpdateCallback = this.states[key].pauseUpdate || null, this.onShutDownCallback = this.states[key].shutdown || this.dummy, "" !== this.current && this.game.physics.reset(), this.current = key, this._created = !1, this.onInitCallback.apply(this.callbackContext, this._args), key === this._pendingState && (this._args = []), this.game._kickstart = !0
            },
            getCurrentState: function() {
                return this.states[this.current]
            },
            loadComplete: function() {
                this._created === !1 && this.onCreateCallback ? (this._created = !0, this.onCreateCallback.call(this.callbackContext, this.game)) : this._created = !0
            },
            pause: function() {
                this._created && this.onPausedCallback && this.onPausedCallback.call(this.callbackContext, this.game)
            },
            resume: function() {
                this._created && this.onResumedCallback && this.onResumedCallback.call(this.callbackContext, this.game)
            },
            update: function() {
                this._created ? this.onUpdateCallback && this.onUpdateCallback.call(this.callbackContext, this.game) : this.onLoadUpdateCallback && this.onLoadUpdateCallback.call(this.callbackContext, this.game)
            },
            pauseUpdate: function() {
                this._created ? this.onPauseUpdateCallback && this.onPauseUpdateCallback.call(this.callbackContext, this.game) : this.onLoadUpdateCallback && this.onLoadUpdateCallback.call(this.callbackContext, this.game)
            },
            preRender: function(elapsedTime) {
                this._created && this.onPreRenderCallback && this.onPreRenderCallback.call(this.callbackContext, this.game, elapsedTime)
            },
            resize: function(width, height) {
                this.onResizeCallback && this.onResizeCallback.call(this.callbackContext, width, height)
            },
            render: function() {
                this._created ? this.onRenderCallback && (this.game.renderType === Phaser.CANVAS ? (this.game.context.save(), this.game.context.setTransform(1, 0, 0, 1, 0, 0), this.onRenderCallback.call(this.callbackContext, this.game), this.game.context.restore()) : this.onRenderCallback.call(this.callbackContext, this.game)) : this.onLoadRenderCallback && this.onLoadRenderCallback.call(this.callbackContext, this.game)
            },
            destroy: function() {
                this.clearCurrentState(), this.callbackContext = null, this.onInitCallback = null, this.onShutDownCallback = null, this.onPreloadCallback = null, this.onLoadRenderCallback = null, this.onLoadUpdateCallback = null, this.onCreateCallback = null, this.onUpdateCallback = null, this.onRenderCallback = null, this.onPausedCallback = null, this.onResumedCallback = null, this.onPauseUpdateCallback = null, this.game = null, this.states = {}, this._pendingState = null, this.current = ""
            }
        }, Phaser.StateManager.prototype.constructor = Phaser.StateManager, Object.defineProperty(Phaser.StateManager.prototype, "created", {
            get: function() {
                return this._created
            }
        }), Phaser.Signal = function() {}, Phaser.Signal.prototype = {
            _bindings: null,
            _prevParams: null,
            memorize: !1,
            _shouldPropagate: !0,
            active: !0,
            _boundDispatch: !0,
            validateListener: function(listener, fnName) {
                if ("function" != typeof listener) throw new Error("Phaser.Signal: listener is a required param of {fn}() and should be a Function.".replace("{fn}", fnName))
            },
            _registerListener: function(listener, isOnce, listenerContext, priority, args) {
                var binding, prevIndex = this._indexOfListener(listener, listenerContext);
                if (-1 !== prevIndex) {
                    if (binding = this._bindings[prevIndex], binding.isOnce() !== isOnce) throw new Error("You cannot add" + (isOnce ? "" : "Once") + "() then add" + (isOnce ? "Once" : "") + "() the same listener without removing the relationship first.")
                } else binding = new Phaser.SignalBinding(this, listener, isOnce, listenerContext, priority, args), this._addBinding(binding);
                return this.memorize && this._prevParams && binding.execute(this._prevParams), binding
            },
            _addBinding: function(binding) {
                this._bindings || (this._bindings = []);
                var n = this._bindings.length;
                do n--; while (this._bindings[n] && binding._priority <= this._bindings[n]._priority);
                this._bindings.splice(n + 1, 0, binding)
            },
            _indexOfListener: function(listener, context) {
                if (!this._bindings) return -1;
                void 0 === context && (context = null);
                for (var cur, n = this._bindings.length; n--;)
                    if (cur = this._bindings[n], cur._listener === listener && cur.context === context) return n;
                return -1
            },
            has: function(listener, context) {
                return -1 !== this._indexOfListener(listener, context)
            },
            add: function(listener, listenerContext, priority) {
                this.validateListener(listener, "add");
                var args = [];
                if (arguments.length > 3)
                    for (var i = 3; i < arguments.length; i++) args.push(arguments[i]);
                return this._registerListener(listener, !1, listenerContext, priority, args)
            },
            addOnce: function(listener, listenerContext, priority) {
                this.validateListener(listener, "addOnce");
                var args = [];
                if (arguments.length > 3)
                    for (var i = 3; i < arguments.length; i++) args.push(arguments[i]);
                return this._registerListener(listener, !0, listenerContext, priority, args)
            },
            remove: function(listener, context) {
                this.validateListener(listener, "remove");
                var i = this._indexOfListener(listener, context);
                return -1 !== i && (this._bindings[i]._destroy(), this._bindings.splice(i, 1)), listener
            },
            removeAll: function(context) {
                if (void 0 === context && (context = null), this._bindings) {
                    for (var n = this._bindings.length; n--;) context ? this._bindings[n].context === context && (this._bindings[n]._destroy(), this._bindings.splice(n, 1)) : this._bindings[n]._destroy();
                    context || (this._bindings.length = 0)
                }
            },
            getNumListeners: function() {
                return this._bindings ? this._bindings.length : 0
            },
            halt: function() {
                this._shouldPropagate = !1
            },
            dispatch: function() {
                if (this.active && this._bindings) {
                    var bindings, paramsArr = Array.prototype.slice.call(arguments),
                        n = this._bindings.length;
                    if (this.memorize && (this._prevParams = paramsArr), n) {
                        bindings = this._bindings.slice(), this._shouldPropagate = !0;
                        do n--; while (bindings[n] && this._shouldPropagate && bindings[n].execute(paramsArr) !== !1)
                    }
                }
            },
            forget: function() {
                this._prevParams && (this._prevParams = null)
            },
            dispose: function() {
                this.removeAll(), this._bindings = null, this._prevParams && (this._prevParams = null)
            },
            toString: function() {
                return "[Phaser.Signal active:" + this.active + " numListeners:" + this.getNumListeners() + "]"
            }
        }, Object.defineProperty(Phaser.Signal.prototype, "boundDispatch", {
            get: function() {
                var _this = this;
                return this._boundDispatch || (this._boundDispatch = function() {
                    return _this.dispatch.apply(_this, arguments)
                })
            }
        }), Phaser.Signal.prototype.constructor = Phaser.Signal, Phaser.SignalBinding = function(signal, listener, isOnce, listenerContext, priority, args) {
            this._listener = listener, isOnce && (this._isOnce = !0), null != listenerContext && (this.context = listenerContext), this._signal = signal, priority && (this._priority = priority), args && args.length && (this._args = args)
        }, Phaser.SignalBinding.prototype = {
            context: null,
            _isOnce: !1,
            _priority: 0,
            _args: null,
            callCount: 0,
            active: !0,
            params: null,
            execute: function(paramsArr) {
                var handlerReturn, params;
                return this.active && this._listener && (params = this.params ? this.params.concat(paramsArr) : paramsArr, this._args && (params = params.concat(this._args)), handlerReturn = this._listener.apply(this.context, params), this.callCount++, this._isOnce && this.detach()), handlerReturn
            },
            detach: function() {
                return this.isBound() ? this._signal.remove(this._listener, this.context) : null
            },
            isBound: function() {
                return !!this._signal && !!this._listener
            },
            isOnce: function() {
                return this._isOnce
            },
            getListener: function() {
                return this._listener
            },
            getSignal: function() {
                return this._signal
            },
            _destroy: function() {
                delete this._signal, delete this._listener, delete this.context
            },
            toString: function() {
                return "[Phaser.SignalBinding isOnce:" + this._isOnce + ", isBound:" + this.isBound() + ", active:" + this.active + "]"
            }
        }, Phaser.SignalBinding.prototype.constructor = Phaser.SignalBinding, Phaser.Filter = function(game, uniforms, fragmentSrc) {
            this.game = game, this.type = Phaser.WEBGL_FILTER, this.passes = [this], this.shaders = [], this.dirty = !0, this.padding = 0, this.prevPoint = new Phaser.Point;
            var d = new Date;
            if (this.uniforms = {
                    resolution: {
                        type: "2f",
                        value: {
                            x: 256,
                            y: 256
                        }
                    },
                    time: {
                        type: "1f",
                        value: 0
                    },
                    mouse: {
                        type: "2f",
                        value: {
                            x: 0,
                            y: 0
                        }
                    },
                    date: {
                        type: "4fv",
                        value: [d.getFullYear(), d.getMonth(), d.getDate(), 60 * d.getHours() * 60 + 60 * d.getMinutes() + d.getSeconds()]
                    },
                    sampleRate: {
                        type: "1f",
                        value: 44100
                    },
                    iChannel0: {
                        type: "sampler2D",
                        value: null,
                        textureData: {
                            repeat: !0
                        }
                    },
                    iChannel1: {
                        type: "sampler2D",
                        value: null,
                        textureData: {
                            repeat: !0
                        }
                    },
                    iChannel2: {
                        type: "sampler2D",
                        value: null,
                        textureData: {
                            repeat: !0
                        }
                    },
                    iChannel3: {
                        type: "sampler2D",
                        value: null,
                        textureData: {
                            repeat: !0
                        }
                    }
                }, uniforms)
                for (var key in uniforms) this.uniforms[key] = uniforms[key];
            this.fragmentSrc = fragmentSrc || ""
        }, Phaser.Filter.prototype = {
            init: function() {},
            setResolution: function(width, height) {
                this.uniforms.resolution.value.x = width, this.uniforms.resolution.value.y = height
            },
            update: function(pointer) {
                if ("undefined" != typeof pointer) {
                    var x = pointer.x / this.game.width,
                        y = 1 - pointer.y / this.game.height;
                    (x !== this.prevPoint.x || y !== this.prevPoint.y) && (this.uniforms.mouse.value.x = x.toFixed(2), this.uniforms.mouse.value.y = y.toFixed(2), this.prevPoint.set(x, y))
                }
                this.uniforms.time.value = this.game.time.totalElapsedSeconds()
            },
            addToWorld: function(x, y, width, height, anchorX, anchorY) {
                void 0 === anchorX && (anchorX = 0), void 0 === anchorY && (anchorY = 0), void 0 !== width && null !== width ? this.width = width : width = this.width, void 0 !== height && null !== height ? this.height = height : height = this.height;
                var image = this.game.add.image(x, y, "__default");
                return image.width = width, image.height = height, image.anchor.set(anchorX, anchorY), image.filters = [this], image
            },
            destroy: function() {
                this.game = null
            }
        }, Phaser.Filter.prototype.constructor = Phaser.Filter, Object.defineProperty(Phaser.Filter.prototype, "width", {
            get: function() {
                return this.uniforms.resolution.value.x
            },
            set: function(value) {
                this.uniforms.resolution.value.x = value
            }
        }), Object.defineProperty(Phaser.Filter.prototype, "height", {
            get: function() {
                return this.uniforms.resolution.value.y
            },
            set: function(value) {
                this.uniforms.resolution.value.y = value
            }
        }), Phaser.Plugin = function(game, parent) {
            void 0 === parent && (parent = null), this.game = game, this.parent = parent, this.active = !1, this.visible = !1, this.hasPreUpdate = !1, this.hasUpdate = !1, this.hasPostUpdate = !1, this.hasRender = !1, this.hasPostRender = !1
        }, Phaser.Plugin.prototype = {
            preUpdate: function() {},
            update: function() {},
            render: function() {},
            postRender: function() {},
            destroy: function() {
                this.game = null, this.parent = null, this.active = !1, this.visible = !1
            }
        }, Phaser.Plugin.prototype.constructor = Phaser.Plugin, Phaser.PluginManager = function(game) {
            this.game = game, this.plugins = [], this._len = 0, this._i = 0
        }, Phaser.PluginManager.prototype = {
            add: function(plugin) {
                var args = Array.prototype.slice.call(arguments, 1),
                    result = !1;
                return "function" == typeof plugin ? plugin = new plugin(this.game, this) : (plugin.game = this.game, plugin.parent = this), "function" == typeof plugin.preUpdate && (plugin.hasPreUpdate = !0, result = !0), "function" == typeof plugin.update && (plugin.hasUpdate = !0, result = !0), "function" == typeof plugin.postUpdate && (plugin.hasPostUpdate = !0, result = !0), "function" == typeof plugin.render && (plugin.hasRender = !0, result = !0), "function" == typeof plugin.postRender && (plugin.hasPostRender = !0, result = !0), result ? ((plugin.hasPreUpdate || plugin.hasUpdate || plugin.hasPostUpdate) && (plugin.active = !0), (plugin.hasRender || plugin.hasPostRender) && (plugin.visible = !0), this._len = this.plugins.push(plugin), "function" == typeof plugin.init && plugin.init.apply(plugin, args), plugin) : null
            },
            remove: function(plugin) {
                for (this._i = this._len; this._i--;)
                    if (this.plugins[this._i] === plugin) return plugin.destroy(), this.plugins.splice(this._i, 1), void this._len--
            },
            removeAll: function() {
                for (this._i = this._len; this._i--;) this.plugins[this._i].destroy();
                this.plugins.length = 0, this._len = 0
            },
            preUpdate: function() {
                for (this._i = this._len; this._i--;) this.plugins[this._i].active && this.plugins[this._i].hasPreUpdate && this.plugins[this._i].preUpdate()
            },
            update: function() {
                for (this._i = this._len; this._i--;) this.plugins[this._i].active && this.plugins[this._i].hasUpdate && this.plugins[this._i].update()
            },
            postUpdate: function() {
                for (this._i = this._len; this._i--;) this.plugins[this._i].active && this.plugins[this._i].hasPostUpdate && this.plugins[this._i].postUpdate()
            },
            render: function() {
                for (this._i = this._len; this._i--;) this.plugins[this._i].visible && this.plugins[this._i].hasRender && this.plugins[this._i].render()
            },
            postRender: function() {
                for (this._i = this._len; this._i--;) this.plugins[this._i].visible && this.plugins[this._i].hasPostRender && this.plugins[this._i].postRender()
            },
            destroy: function() {
                this.removeAll(), this.game = null
            }
        }, Phaser.PluginManager.prototype.constructor = Phaser.PluginManager, Phaser.Stage = function(game) {
            this.game = game, PIXI.DisplayObjectContainer.call(this), this.name = "_stage_root", this.disableVisibilityChange = !1, this.exists = !0, this.worldTransform = new PIXI.Matrix, this.stage = this, this.currentRenderOrderID = 0, this._hiddenVar = "hidden", this._onChange = null, this._bgColor = {
                r: 0,
                g: 0,
                b: 0,
                a: 0,
                color: 0,
                rgba: "#000000"
            }, this.game.transparent || (this._bgColor.a = 1), game.config && this.parseConfig(game.config)
        }, Phaser.Stage.prototype = Object.create(PIXI.DisplayObjectContainer.prototype), Phaser.Stage.prototype.constructor = Phaser.Stage, Phaser.Stage.prototype.parseConfig = function(config) {
            config.disableVisibilityChange && (this.disableVisibilityChange = config.disableVisibilityChange), config.backgroundColor && this.setBackgroundColor(config.backgroundColor)
        }, Phaser.Stage.prototype.boot = function() {
            Phaser.DOM.getOffset(this.game.canvas, this.offset), Phaser.Canvas.setUserSelect(this.game.canvas, "none"), Phaser.Canvas.setTouchAction(this.game.canvas, "none"), this.checkVisibility()
        }, Phaser.Stage.prototype.preUpdate = function() {
            this.currentRenderOrderID = 0;
            for (var i = 0; i < this.children.length; i++) this.children[i].preUpdate()
        }, Phaser.Stage.prototype.update = function() {
            for (var i = this.children.length; i--;) this.children[i].update()
        }, Phaser.Stage.prototype.postUpdate = function() {
            if (this.game.world.camera.target) {
                this.game.world.camera.target.postUpdate(), this.game.world.camera.update();
                for (var i = this.children.length; i--;) this.children[i] !== this.game.world.camera.target && this.children[i].postUpdate()
            } else {
                this.game.world.camera.update();
                for (var i = this.children.length; i--;) this.children[i].postUpdate()
            }
        }, Phaser.Stage.prototype.updateTransform = function() {
            this.worldAlpha = 1;
            for (var i = 0; i < this.children.length; i++) this.children[i].updateTransform()
        }, Phaser.Stage.prototype.checkVisibility = function() {
            void 0 !== document.webkitHidden ? this._hiddenVar = "webkitvisibilitychange" : void 0 !== document.mozHidden ? this._hiddenVar = "mozvisibilitychange" : void 0 !== document.msHidden ? this._hiddenVar = "msvisibilitychange" : void 0 !== document.hidden ? this._hiddenVar = "visibilitychange" : this._hiddenVar = null;
            var _this = this;
            this._onChange = function(event) {
                return _this.visibilityChange(event)
            }, this._hiddenVar && document.addEventListener(this._hiddenVar, this._onChange, !1), window.onblur = this._onChange, window.onfocus = this._onChange, window.onpagehide = this._onChange, window.onpageshow = this._onChange, this.game.device.cocoonJSApp && (CocoonJS.App.onSuspended.addEventListener(function() {
                Phaser.Stage.prototype.visibilityChange.call(_this, {
                    type: "pause"
                })
            }), CocoonJS.App.onActivated.addEventListener(function() {
                Phaser.Stage.prototype.visibilityChange.call(_this, {
                    type: "resume"
                })
            }))
        }, Phaser.Stage.prototype.visibilityChange = function(event) {
            return "pagehide" === event.type || "blur" === event.type || "pageshow" === event.type || "focus" === event.type ? void("pagehide" === event.type || "blur" === event.type ? this.game.focusLoss(event) : ("pageshow" === event.type || "focus" === event.type) && this.game.focusGain(event)) : void(this.disableVisibilityChange || (document.hidden || document.mozHidden || document.msHidden || document.webkitHidden || "pause" === event.type ? this.game.gamePaused(event) : this.game.gameResumed(event)))
        }, Phaser.Stage.prototype.setBackgroundColor = function(color) {
            this.game.transparent || (Phaser.Color.valueToColor(color, this._bgColor), Phaser.Color.updateColor(this._bgColor), this._bgColor.r /= 255, this._bgColor.g /= 255, this._bgColor.b /= 255, this._bgColor.a = 1)
        }, Phaser.Stage.prototype.destroy = function() {
            this._hiddenVar && document.removeEventListener(this._hiddenVar, this._onChange, !1), window.onpagehide = null, window.onpageshow = null, window.onblur = null, window.onfocus = null
        }, Object.defineProperty(Phaser.Stage.prototype, "backgroundColor", {
            get: function() {
                return this._bgColor.color
            },
            set: function(color) {
                this.setBackgroundColor(color)
            }
        }), Object.defineProperty(Phaser.Stage.prototype, "smoothed", {
            get: function() {
                return PIXI.scaleModes.DEFAULT === PIXI.scaleModes.LINEAR
            },
            set: function(value) {
                value ? PIXI.scaleModes.DEFAULT = PIXI.scaleModes.LINEAR : PIXI.scaleModes.DEFAULT = PIXI.scaleModes.NEAREST
            }
        }), Phaser.Group = function(game, parent, name, addToStage, enableBody, physicsBodyType) {
            void 0 === addToStage && (addToStage = !1), void 0 === enableBody && (enableBody = !1), void 0 === physicsBodyType && (physicsBodyType = Phaser.Physics.ARCADE), this.game = game, void 0 === parent && (parent = game.world), this.name = name || "group", this.z = 0, PIXI.DisplayObjectContainer.call(this), addToStage ? (this.game.stage.addChild(this), this.z = this.game.stage.children.length) : parent && (parent.addChild(this), this.z = parent.children.length), this.type = Phaser.GROUP, this.physicsType = Phaser.GROUP, this.alive = !0, this.exists = !0, this.ignoreDestroy = !1, this.pendingDestroy = !1, this.classType = Phaser.Sprite, this.cursor = null, this.enableBody = enableBody, this.enableBodyDebug = !1, this.physicsBodyType = physicsBodyType, this.physicsSortDirection = null, this.onDestroy = new Phaser.Signal, this.cursorIndex = 0, this.fixedToCamera = !1, this.cameraOffset = new Phaser.Point, this.hash = [], this._sortProperty = "z"
        }, Phaser.Group.prototype = Object.create(PIXI.DisplayObjectContainer.prototype), Phaser.Group.prototype.constructor = Phaser.Group, Phaser.Group.RETURN_NONE = 0, Phaser.Group.RETURN_TOTAL = 1, Phaser.Group.RETURN_CHILD = 2, Phaser.Group.SORT_ASCENDING = -1, Phaser.Group.SORT_DESCENDING = 1, Phaser.Group.prototype.add = function(child, silent) {
            return void 0 === silent && (silent = !1), child.parent !== this && (this.addChild(child), child.z = this.children.length, this.enableBody && null === child.body ? this.game.physics.enable(child, this.physicsBodyType) : child.body && this.addToHash(child), !silent && child.events && child.events.onAddedToGroup$dispatch(child, this), null === this.cursor && (this.cursor = child)), child
        }, Phaser.Group.prototype.addToHash = function(child) {
            if (child.parent === this) {
                var index = this.hash.indexOf(child);
                if (-1 === index) return this.hash.push(child), !0
            }
            return !1
        }, Phaser.Group.prototype.removeFromHash = function(child) {
            if (child) {
                var index = this.hash.indexOf(child);
                if (-1 !== index) return this.hash.splice(index, 1), !0
            }
            return !1
        }, Phaser.Group.prototype.addMultiple = function(children, silent) {
            if (children instanceof Phaser.Group) children.moveAll(this, silent);
            else if (Array.isArray(children))
                for (var i = 0; i < children.length; i++) this.add(children[i], silent);
            return children
        }, Phaser.Group.prototype.addAt = function(child, index, silent) {
            return void 0 === silent && (silent = !1), child.parent !== this && (this.addChildAt(child, index), this.updateZ(), this.enableBody && null === child.body ? this.game.physics.enable(child, this.physicsBodyType) : child.body && this.addToHash(child), !silent && child.events && child.events.onAddedToGroup$dispatch(child, this), null === this.cursor && (this.cursor = child)), child
        }, Phaser.Group.prototype.getAt = function(index) {
            return 0 > index || index >= this.children.length ? -1 : this.getChildAt(index)
        }, Phaser.Group.prototype.create = function(x, y, key, frame, exists) {
            void 0 === exists && (exists = !0);
            var child = new this.classType(this.game, x, y, key, frame);
            return child.exists = exists, child.visible = exists, child.alive = exists, this.addChild(child), child.z = this.children.length, this.enableBody && this.game.physics.enable(child, this.physicsBodyType, this.enableBodyDebug), child.events && child.events.onAddedToGroup$dispatch(child, this), null === this.cursor && (this.cursor = child), child
        }, Phaser.Group.prototype.createMultiple = function(quantity, key, frame, exists) {
            void 0 === exists && (exists = !1);
            for (var i = 0; quantity > i; i++) this.create(0, 0, key, frame, exists)
        }, Phaser.Group.prototype.updateZ = function() {
            for (var i = this.children.length; i--;) this.children[i].z = i
        }, Phaser.Group.prototype.resetCursor = function(index) {
            return void 0 === index && (index = 0), index > this.children.length - 1 && (index = 0), this.cursor ? (this.cursorIndex = index, this.cursor = this.children[this.cursorIndex], this.cursor) : void 0
        }, Phaser.Group.prototype.next = function() {
            return this.cursor ? (this.cursorIndex >= this.children.length - 1 ? this.cursorIndex = 0 : this.cursorIndex++, this.cursor = this.children[this.cursorIndex], this.cursor) : void 0
        }, Phaser.Group.prototype.previous = function() {
            return this.cursor ? (0 === this.cursorIndex ? this.cursorIndex = this.children.length - 1 : this.cursorIndex--, this.cursor = this.children[this.cursorIndex], this.cursor) : void 0
        }, Phaser.Group.prototype.swap = function(child1, child2) {
            this.swapChildren(child1, child2), this.updateZ()
        }, Phaser.Group.prototype.bringToTop = function(child) {
            return child.parent === this && this.getIndex(child) < this.children.length && (this.remove(child, !1, !0), this.add(child, !0)), child
        }, Phaser.Group.prototype.sendToBack = function(child) {
            return child.parent === this && this.getIndex(child) > 0 && (this.remove(child, !1, !0), this.addAt(child, 0, !0)), child
        }, Phaser.Group.prototype.moveUp = function(child) {
            if (child.parent === this && this.getIndex(child) < this.children.length - 1) {
                var a = this.getIndex(child),
                    b = this.getAt(a + 1);
                b && this.swap(child, b)
            }
            return child
        }, Phaser.Group.prototype.moveDown = function(child) {
            if (child.parent === this && this.getIndex(child) > 0) {
                var a = this.getIndex(child),
                    b = this.getAt(a - 1);
                b && this.swap(child, b)
            }
            return child
        }, Phaser.Group.prototype.xy = function(index, x, y) {
            return 0 > index || index > this.children.length ? -1 : (this.getChildAt(index).x = x, void(this.getChildAt(index).y = y))
        }, Phaser.Group.prototype.reverse = function() {
            this.children.reverse(), this.updateZ()
        }, Phaser.Group.prototype.getIndex = function(child) {
            return this.children.indexOf(child)
        }, Phaser.Group.prototype.replace = function(oldChild, newChild) {
            var index = this.getIndex(oldChild);
            return -1 !== index ? (newChild.parent && (newChild.parent instanceof Phaser.Group ? newChild.parent.remove(newChild) : newChild.parent.removeChild(newChild)), this.remove(oldChild), this.addAt(newChild, index), oldChild) : void 0
        }, Phaser.Group.prototype.hasProperty = function(child, key) {
            var len = key.length;
            return 1 === len && key[0] in child ? !0 : 2 === len && key[0] in child && key[1] in child[key[0]] ? !0 : 3 === len && key[0] in child && key[1] in child[key[0]] && key[2] in child[key[0]][key[1]] ? !0 : 4 === len && key[0] in child && key[1] in child[key[0]] && key[2] in child[key[0]][key[1]] && key[3] in child[key[0]][key[1]][key[2]] ? !0 : !1
        }, Phaser.Group.prototype.setProperty = function(child, key, value, operation, force) {
            if (void 0 === force && (force = !1), operation = operation || 0, !this.hasProperty(child, key) && (!force || operation > 0)) return !1;
            var len = key.length;
            return 1 === len ? 0 === operation ? child[key[0]] = value : 1 == operation ? child[key[0]] += value : 2 == operation ? child[key[0]] -= value : 3 == operation ? child[key[0]] *= value : 4 == operation && (child[key[0]] /= value) : 2 === len ? 0 === operation ? child[key[0]][key[1]] = value : 1 == operation ? child[key[0]][key[1]] += value : 2 == operation ? child[key[0]][key[1]] -= value : 3 == operation ? child[key[0]][key[1]] *= value : 4 == operation && (child[key[0]][key[1]] /= value) : 3 === len ? 0 === operation ? child[key[0]][key[1]][key[2]] = value : 1 == operation ? child[key[0]][key[1]][key[2]] += value : 2 == operation ? child[key[0]][key[1]][key[2]] -= value : 3 == operation ? child[key[0]][key[1]][key[2]] *= value : 4 == operation && (child[key[0]][key[1]][key[2]] /= value) : 4 === len && (0 === operation ? child[key[0]][key[1]][key[2]][key[3]] = value : 1 == operation ? child[key[0]][key[1]][key[2]][key[3]] += value : 2 == operation ? child[key[0]][key[1]][key[2]][key[3]] -= value : 3 == operation ? child[key[0]][key[1]][key[2]][key[3]] *= value : 4 == operation && (child[key[0]][key[1]][key[2]][key[3]] /= value)), !0
        }, Phaser.Group.prototype.checkProperty = function(child, key, value, force) {
            return void 0 === force && (force = !1), !Phaser.Utils.getProperty(child, key) && force ? !1 : Phaser.Utils.getProperty(child, key) !== value ? !1 : !0
        }, Phaser.Group.prototype.set = function(child, key, value, checkAlive, checkVisible, operation, force) {
            return void 0 === force && (force = !1), key = key.split("."), void 0 === checkAlive && (checkAlive = !1), void 0 === checkVisible && (checkVisible = !1), (checkAlive === !1 || checkAlive && child.alive) && (checkVisible === !1 || checkVisible && child.visible) ? this.setProperty(child, key, value, operation, force) : void 0
        }, Phaser.Group.prototype.setAll = function(key, value, checkAlive, checkVisible, operation, force) {
            void 0 === checkAlive && (checkAlive = !1), void 0 === checkVisible && (checkVisible = !1), void 0 === force && (force = !1), key = key.split("."), operation = operation || 0;
            for (var i = 0; i < this.children.length; i++)(!checkAlive || checkAlive && this.children[i].alive) && (!checkVisible || checkVisible && this.children[i].visible) && this.setProperty(this.children[i], key, value, operation, force)
        }, Phaser.Group.prototype.setAllChildren = function(key, value, checkAlive, checkVisible, operation, force) {
            void 0 === checkAlive && (checkAlive = !1), void 0 === checkVisible && (checkVisible = !1), void 0 === force && (force = !1), operation = operation || 0;
            for (var i = 0; i < this.children.length; i++)(!checkAlive || checkAlive && this.children[i].alive) && (!checkVisible || checkVisible && this.children[i].visible) && (this.children[i] instanceof Phaser.Group ? this.children[i].setAllChildren(key, value, checkAlive, checkVisible, operation, force) : this.setProperty(this.children[i], key.split("."), value, operation, force))
        }, Phaser.Group.prototype.checkAll = function(key, value, checkAlive, checkVisible, force) {
            void 0 === checkAlive && (checkAlive = !1), void 0 === checkVisible && (checkVisible = !1), void 0 === force && (force = !1);
            for (var i = 0; i < this.children.length; i++)
                if ((!checkAlive || checkAlive && this.children[i].alive) && (!checkVisible || checkVisible && this.children[i].visible) && !this.checkProperty(this.children[i], key, value, force)) return !1;
            return !0
        }, Phaser.Group.prototype.addAll = function(property, amount, checkAlive, checkVisible) {
            this.setAll(property, amount, checkAlive, checkVisible, 1)
        }, Phaser.Group.prototype.subAll = function(property, amount, checkAlive, checkVisible) {
            this.setAll(property, amount, checkAlive, checkVisible, 2)
        }, Phaser.Group.prototype.multiplyAll = function(property, amount, checkAlive, checkVisible) {
            this.setAll(property, amount, checkAlive, checkVisible, 3)
        }, Phaser.Group.prototype.divideAll = function(property, amount, checkAlive, checkVisible) {
            this.setAll(property, amount, checkAlive, checkVisible, 4)
        }, Phaser.Group.prototype.callAllExists = function(callback, existsValue) {
            var args;
            if (arguments.length > 2) {
                args = [];
                for (var i = 2; i < arguments.length; i++) args.push(arguments[i])
            }
            for (var i = 0; i < this.children.length; i++) this.children[i].exists === existsValue && this.children[i][callback] && this.children[i][callback].apply(this.children[i], args)
        }, Phaser.Group.prototype.callbackFromArray = function(child, callback, length) {
            if (1 == length) {
                if (child[callback[0]]) return child[callback[0]]
            } else if (2 == length) {
                if (child[callback[0]][callback[1]]) return child[callback[0]][callback[1]]
            } else if (3 == length) {
                if (child[callback[0]][callback[1]][callback[2]]) return child[callback[0]][callback[1]][callback[2]]
            } else if (4 == length) {
                if (child[callback[0]][callback[1]][callback[2]][callback[3]]) return child[callback[0]][callback[1]][callback[2]][callback[3]]
            } else if (child[callback]) return child[callback];
            return !1
        }, Phaser.Group.prototype.callAll = function(method, context) {
            if (void 0 !== method) {
                method = method.split(".");
                var methodLength = method.length;
                if (void 0 === context || null === context || "" === context) context = null;
                else if ("string" == typeof context) {
                    context = context.split(".");
                    var contextLength = context.length
                }
                var args;
                if (arguments.length > 2) {
                    args = [];
                    for (var i = 2; i < arguments.length; i++) args.push(arguments[i])
                }
                for (var callback = null, callbackContext = null, i = 0; i < this.children.length; i++) callback = this.callbackFromArray(this.children[i], method, methodLength), context && callback ? (callbackContext = this.callbackFromArray(this.children[i], context, contextLength), callback && callback.apply(callbackContext, args)) : callback && callback.apply(this.children[i], args)
            }
        }, Phaser.Group.prototype.preUpdate = function() {
            if (this.pendingDestroy) return this.destroy(), !1;
            if (!this.exists || !this.parent.exists) return this.renderOrderID = -1, !1;
            for (var i = this.children.length; i--;) this.children[i].preUpdate();
            return !0
        }, Phaser.Group.prototype.update = function() {
            for (var i = this.children.length; i--;) this.children[i].update()
        }, Phaser.Group.prototype.postUpdate = function() {
            this.fixedToCamera && (this.x = this.game.camera.view.x + this.cameraOffset.x, this.y = this.game.camera.view.y + this.cameraOffset.y);
            for (var i = this.children.length; i--;) this.children[i].postUpdate()
        }, Phaser.Group.prototype.filter = function(predicate, checkExists) {
            for (var index = -1, length = this.children.length, results = []; ++index < length;) {
                var child = this.children[index];
                (!checkExists || checkExists && child.exists) && predicate(child, index, this.children) && results.push(child)
            }
            return new Phaser.ArraySet(results)
        }, Phaser.Group.prototype.forEach = function(callback, callbackContext, checkExists) {
            if (void 0 === checkExists && (checkExists = !1), arguments.length <= 3)
                for (var i = 0; i < this.children.length; i++)(!checkExists || checkExists && this.children[i].exists) && callback.call(callbackContext, this.children[i]);
            else {
                for (var args = [null], i = 3; i < arguments.length; i++) args.push(arguments[i]);
                for (var i = 0; i < this.children.length; i++)(!checkExists || checkExists && this.children[i].exists) && (args[0] = this.children[i], callback.apply(callbackContext, args))
            }
        }, Phaser.Group.prototype.forEachExists = function(callback, callbackContext) {
            var args;
            if (arguments.length > 2) {
                args = [null];
                for (var i = 2; i < arguments.length; i++) args.push(arguments[i])
            }
            this.iterate("exists", !0, Phaser.Group.RETURN_TOTAL, callback, callbackContext, args)
        }, Phaser.Group.prototype.forEachAlive = function(callback, callbackContext) {
            var args;
            if (arguments.length > 2) {
                args = [null];
                for (var i = 2; i < arguments.length; i++) args.push(arguments[i])
            }
            this.iterate("alive", !0, Phaser.Group.RETURN_TOTAL, callback, callbackContext, args)
        }, Phaser.Group.prototype.forEachDead = function(callback, callbackContext) {
            var args;
            if (arguments.length > 2) {
                args = [null];
                for (var i = 2; i < arguments.length; i++) args.push(arguments[i])
            }
            this.iterate("alive", !1, Phaser.Group.RETURN_TOTAL, callback, callbackContext, args)
        }, Phaser.Group.prototype.sort = function(key, order) {
            this.children.length < 2 || (void 0 === key && (key = "z"), void 0 === order && (order = Phaser.Group.SORT_ASCENDING), this._sortProperty = key, order === Phaser.Group.SORT_ASCENDING ? this.children.sort(this.ascendingSortHandler.bind(this)) : this.children.sort(this.descendingSortHandler.bind(this)), this.updateZ())
        }, Phaser.Group.prototype.customSort = function(sortHandler, context) {
            this.children.length < 2 || (this.children.sort(sortHandler.bind(context)), this.updateZ())
        }, Phaser.Group.prototype.ascendingSortHandler = function(a, b) {
            return a[this._sortProperty] < b[this._sortProperty] ? -1 : a[this._sortProperty] > b[this._sortProperty] ? 1 : a.z < b.z ? -1 : 1
        }, Phaser.Group.prototype.descendingSortHandler = function(a, b) {
            return a[this._sortProperty] < b[this._sortProperty] ? 1 : a[this._sortProperty] > b[this._sortProperty] ? -1 : 0
        }, Phaser.Group.prototype.iterate = function(key, value, returnType, callback, callbackContext, args) {
            if (returnType === Phaser.Group.RETURN_TOTAL && 0 === this.children.length) return 0;
            for (var total = 0, i = 0; i < this.children.length; i++)
                if (this.children[i][key] === value && (total++, callback && (args ? (args[0] = this.children[i], callback.apply(callbackContext, args)) : callback.call(callbackContext, this.children[i])), returnType === Phaser.Group.RETURN_CHILD)) return this.children[i];
            return returnType === Phaser.Group.RETURN_TOTAL ? total : null
        }, Phaser.Group.prototype.getFirstExists = function(exists, createIfNull, x, y, key, frame) {
            void 0 === createIfNull && (createIfNull = !1), "boolean" != typeof exists && (exists = !0);
            var child = this.iterate("exists", exists, Phaser.Group.RETURN_CHILD);
            return null === child && createIfNull ? this.create(x, y, key, frame) : this.resetChild(child, x, y, key, frame)
        }, Phaser.Group.prototype.getFirstAlive = function(createIfNull, x, y, key, frame) {
            void 0 === createIfNull && (createIfNull = !1);
            var child = this.iterate("alive", !0, Phaser.Group.RETURN_CHILD);
            return null === child && createIfNull ? this.create(x, y, key, frame) : this.resetChild(child, x, y, key, frame)
        }, Phaser.Group.prototype.getFirstDead = function(createIfNull, x, y, key, frame) {
            void 0 === createIfNull && (createIfNull = !1);
            var child = this.iterate("alive", !1, Phaser.Group.RETURN_CHILD);
            return null === child && createIfNull ? this.create(x, y, key, frame) : this.resetChild(child, x, y, key, frame)
        }, Phaser.Group.prototype.resetChild = function(child, x, y, key, frame) {
            return null === child ? null : (void 0 === x && (x = null), void 0 === y && (y = null), null !== x && null !== y && child.reset(x, y), void 0 !== key && child.loadTexture(key, frame), child);
        }, Phaser.Group.prototype.getTop = function() {
            return this.children.length > 0 ? this.children[this.children.length - 1] : void 0
        }, Phaser.Group.prototype.getBottom = function() {
            return this.children.length > 0 ? this.children[0] : void 0
        }, Phaser.Group.prototype.countLiving = function() {
            return this.iterate("alive", !0, Phaser.Group.RETURN_TOTAL)
        }, Phaser.Group.prototype.countDead = function() {
            return this.iterate("alive", !1, Phaser.Group.RETURN_TOTAL)
        }, Phaser.Group.prototype.getRandom = function(startIndex, length) {
            return 0 === this.children.length ? null : (startIndex = startIndex || 0, length = length || this.children.length, Phaser.ArrayUtils.getRandomItem(this.children, startIndex, length))
        }, Phaser.Group.prototype.remove = function(child, destroy, silent) {
            if (void 0 === destroy && (destroy = !1), void 0 === silent && (silent = !1), 0 === this.children.length || -1 === this.children.indexOf(child)) return !1;
            silent || !child.events || child.destroyPhase || child.events.onRemovedFromGroup$dispatch(child, this);
            var removed = this.removeChild(child);
            return this.removeFromHash(child), this.updateZ(), this.cursor === child && this.next(), destroy && removed && removed.destroy(!0), !0
        }, Phaser.Group.prototype.moveAll = function(group, silent) {
            if (void 0 === silent && (silent = !1), this.children.length > 0 && group instanceof Phaser.Group) {
                do group.add(this.children[0], silent); while (this.children.length > 0);
                this.hash = [], this.cursor = null
            }
            return group
        }, Phaser.Group.prototype.removeAll = function(destroy, silent) {
            if (void 0 === destroy && (destroy = !1), void 0 === silent && (silent = !1), 0 !== this.children.length) {
                do {
                    !silent && this.children[0].events && this.children[0].events.onRemovedFromGroup$dispatch(this.children[0], this);
                    var removed = this.removeChild(this.children[0]);
                    this.removeFromHash(removed), destroy && removed && removed.destroy(!0)
                } while (this.children.length > 0);
                this.hash = [], this.cursor = null
            }
        }, Phaser.Group.prototype.removeBetween = function(startIndex, endIndex, destroy, silent) {
            if (void 0 === endIndex && (endIndex = this.children.length - 1), void 0 === destroy && (destroy = !1), void 0 === silent && (silent = !1), 0 !== this.children.length) {
                if (startIndex > endIndex || 0 > startIndex || endIndex > this.children.length) return !1;
                for (var i = endIndex; i >= startIndex;) {
                    !silent && this.children[i].events && this.children[i].events.onRemovedFromGroup$dispatch(this.children[i], this);
                    var removed = this.removeChild(this.children[i]);
                    this.removeFromHash(removed), destroy && removed && removed.destroy(!0), this.cursor === this.children[i] && (this.cursor = null), i--
                }
                this.updateZ()
            }
        }, Phaser.Group.prototype.destroy = function(destroyChildren, soft) {
            null === this.game || this.ignoreDestroy || (void 0 === destroyChildren && (destroyChildren = !0), void 0 === soft && (soft = !1), this.onDestroy.dispatch(this, destroyChildren, soft), this.removeAll(destroyChildren), this.cursor = null, this.filters = null, this.pendingDestroy = !1, soft || (this.parent && this.parent.removeChild(this), this.game = null, this.exists = !1))
        }, Object.defineProperty(Phaser.Group.prototype, "total", {
            get: function() {
                return this.iterate("exists", !0, Phaser.Group.RETURN_TOTAL)
            }
        }), Object.defineProperty(Phaser.Group.prototype, "length", {
            get: function() {
                return this.children.length
            }
        }), Object.defineProperty(Phaser.Group.prototype, "angle", {
            get: function() {
                return Phaser.Math.radToDeg(this.rotation)
            },
            set: function(value) {
                this.rotation = Phaser.Math.degToRad(value)
            }
        }), Phaser.World = function(game) {
            Phaser.Group.call(this, game, null, "__world", !1), this.bounds = new Phaser.Rectangle(0, 0, game.width, game.height), this.camera = null, this._definedSize = !1, this._width = game.width, this._height = game.height, this.game.state.onStateChange.add(this.stateChange, this)
        }, Phaser.World.prototype = Object.create(Phaser.Group.prototype), Phaser.World.prototype.constructor = Phaser.World, Phaser.World.prototype.boot = function() {
            this.camera = new Phaser.Camera(this.game, 0, 0, 0, this.game.width, this.game.height), this.camera.displayObject = this, this.camera.scale = this.scale, this.game.camera = this.camera, this.game.stage.addChild(this)
        }, Phaser.World.prototype.stateChange = function() {
            this.x = 0, this.y = 0, this.camera.reset()
        }, Phaser.World.prototype.setBounds = function(x, y, width, height) {
            this._definedSize = !0, this._width = width, this._height = height, this.bounds.setTo(x, y, width, height), this.x = x, this.y = y, this.camera.bounds && this.camera.bounds.setTo(x, y, Math.max(width, this.game.width), Math.max(height, this.game.height)), this.game.physics.setBoundsToWorld()
        }, Phaser.World.prototype.resize = function(width, height) {
            this._definedSize && (width < this._width && (width = this._width), height < this._height && (height = this._height)), this.bounds.width = width, this.bounds.height = height, this.game.camera.setBoundsToWorld(), this.game.physics.setBoundsToWorld()
        }, Phaser.World.prototype.shutdown = function() {
            this.destroy(!0, !0)
        }, Phaser.World.prototype.wrap = function(sprite, padding, useBounds, horizontal, vertical) {
            void 0 === padding && (padding = 0), void 0 === useBounds && (useBounds = !1), void 0 === horizontal && (horizontal = !0), void 0 === vertical && (vertical = !0), useBounds ? (sprite.getBounds(), horizontal && (sprite.x + sprite._currentBounds.width < this.bounds.x ? sprite.x = this.bounds.right : sprite.x > this.bounds.right && (sprite.x = this.bounds.left)), vertical && (sprite.y + sprite._currentBounds.height < this.bounds.top ? sprite.y = this.bounds.bottom : sprite.y > this.bounds.bottom && (sprite.y = this.bounds.top))) : (horizontal && sprite.x + padding < this.bounds.x ? sprite.x = this.bounds.right + padding : horizontal && sprite.x - padding > this.bounds.right && (sprite.x = this.bounds.left - padding), vertical && sprite.y + padding < this.bounds.top ? sprite.y = this.bounds.bottom + padding : vertical && sprite.y - padding > this.bounds.bottom && (sprite.y = this.bounds.top - padding))
        }, Object.defineProperty(Phaser.World.prototype, "width", {
            get: function() {
                return this.bounds.width
            },
            set: function(value) {
                value < this.game.width && (value = this.game.width), this.bounds.width = value, this._width = value, this._definedSize = !0
            }
        }), Object.defineProperty(Phaser.World.prototype, "height", {
            get: function() {
                return this.bounds.height
            },
            set: function(value) {
                value < this.game.height && (value = this.game.height), this.bounds.height = value, this._height = value, this._definedSize = !0
            }
        }), Object.defineProperty(Phaser.World.prototype, "centerX", {
            get: function() {
                return this.bounds.halfWidth
            }
        }), Object.defineProperty(Phaser.World.prototype, "centerY", {
            get: function() {
                return this.bounds.halfHeight
            }
        }), Object.defineProperty(Phaser.World.prototype, "randomX", {
            get: function() {
                return this.bounds.x < 0 ? this.game.rnd.between(this.bounds.x, this.bounds.width - Math.abs(this.bounds.x)) : this.game.rnd.between(this.bounds.x, this.bounds.width)
            }
        }), Object.defineProperty(Phaser.World.prototype, "randomY", {
            get: function() {
                return this.bounds.y < 0 ? this.game.rnd.between(this.bounds.y, this.bounds.height - Math.abs(this.bounds.y)) : this.game.rnd.between(this.bounds.y, this.bounds.height)
            }
        }), Phaser.Game = function(width, height, renderer, parent, state, transparent, antialias, physicsConfig) {
            return this.id = Phaser.GAMES.push(this) - 1, this.config = null, this.physicsConfig = physicsConfig, this.parent = "", this.width = 800, this.height = 600, this.resolution = 1, this._width = 800, this._height = 600, this.transparent = !1, this.antialias = !0, this.preserveDrawingBuffer = !1, this.clearBeforeRender = !0, this.renderer = null, this.renderType = Phaser.AUTO, this.state = null, this.isBooted = !1, this.isRunning = !1, this.raf = null, this.add = null, this.make = null, this.cache = null, this.input = null, this.load = null, this.math = null, this.net = null, this.scale = null, this.sound = null, this.stage = null, this.time = null, this.tweens = null, this.world = null, this.physics = null, this.plugins = null, this.rnd = null, this.device = Phaser.Device, this.camera = null, this.canvas = null, this.context = null, this.debug = null, this.particles = null, this.create = null, this.lockRender = !1, this.stepping = !1, this.pendingStep = !1, this.stepCount = 0, this.onPause = null, this.onResume = null, this.onBlur = null, this.onFocus = null, this._paused = !1, this._codePaused = !1, this.currentUpdateID = 0, this.updatesThisFrame = 1, this._deltaTime = 0, this._lastCount = 0, this._spiraling = 0, this._kickstart = !0, this.fpsProblemNotifier = new Phaser.Signal, this.forceSingleUpdate = !1, this._nextFpsNotification = 0, 1 === arguments.length && "object" == typeof arguments[0] ? this.parseConfig(arguments[0]) : (this.config = {
                enableDebug: !0
            }, "undefined" != typeof width && (this._width = width), "undefined" != typeof height && (this._height = height), "undefined" != typeof renderer && (this.renderType = renderer), "undefined" != typeof parent && (this.parent = parent), "undefined" != typeof transparent && (this.transparent = transparent), "undefined" != typeof antialias && (this.antialias = antialias), this.rnd = new Phaser.RandomDataGenerator([(Date.now() * Math.random()).toString()]), this.state = new Phaser.StateManager(this, state)), this.device.whenReady(this.boot, this), this
        }, Phaser.Game.prototype = {
            parseConfig: function(config) {
                this.config = config, void 0 === config.enableDebug && (this.config.enableDebug = !0), config.width && (this._width = config.width), config.height && (this._height = config.height), config.renderer && (this.renderType = config.renderer), config.parent && (this.parent = config.parent), config.transparent && (this.transparent = config.transparent), config.antialias && (this.antialias = config.antialias), config.resolution && (this.resolution = config.resolution), config.preserveDrawingBuffer && (this.preserveDrawingBuffer = config.preserveDrawingBuffer), config.physicsConfig && (this.physicsConfig = config.physicsConfig);
                var seed = [(Date.now() * Math.random()).toString()];
                config.seed && (seed = config.seed), this.rnd = new Phaser.RandomDataGenerator(seed);
                var state = null;
                config.state && (state = config.state), this.state = new Phaser.StateManager(this, state)
            },
            boot: function() {
                this.isBooted || (this.onPause = new Phaser.Signal, this.onResume = new Phaser.Signal, this.onBlur = new Phaser.Signal, this.onFocus = new Phaser.Signal, this.isBooted = !0, PIXI.game = this, this.math = Phaser.Math, this.scale = new Phaser.ScaleManager(this, this._width, this._height), this.stage = new Phaser.Stage(this), this.setUpRenderer(), this.world = new Phaser.World(this), this.add = new Phaser.GameObjectFactory(this), this.make = new Phaser.GameObjectCreator(this), this.cache = new Phaser.Cache(this), this.load = new Phaser.Loader(this), this.time = new Phaser.Time(this), this.tweens = new Phaser.TweenManager(this), this.input = new Phaser.Input(this), this.sound = new Phaser.SoundManager(this), this.physics = new Phaser.Physics(this, this.physicsConfig), this.particles = new Phaser.Particles(this), this.create = new Phaser.Create(this), this.plugins = new Phaser.PluginManager(this), this.net = new Phaser.Net(this), this.time.boot(), this.stage.boot(), this.world.boot(), this.scale.boot(), this.input.boot(), this.sound.boot(), this.state.boot(), this.config.enableDebug ? (this.debug = new Phaser.Utils.Debug(this), this.debug.boot()) : this.debug = {
                    preUpdate: function() {},
                    update: function() {},
                    reset: function() {}
                }, this.showDebugHeader(), this.isRunning = !0, this.config && this.config.forceSetTimeOut ? this.raf = new Phaser.RequestAnimationFrame(this, this.config.forceSetTimeOut) : this.raf = new Phaser.RequestAnimationFrame(this, !1), this._kickstart = !0, window.focus && (!window.PhaserGlobal || window.PhaserGlobal && !window.PhaserGlobal.stopFocus) && window.focus(), this.raf.start())
            },
            showDebugHeader: function() {
                if (!window.PhaserGlobal || !window.PhaserGlobal.hideBanner) {
                    var v = Phaser.VERSION,
                        r = "Canvas",
                        a = "HTML Audio",
                        c = 1;
                    if (this.renderType === Phaser.WEBGL ? (r = "WebGL", c++) : this.renderType == Phaser.HEADLESS && (r = "Headless"), this.device.webAudio && (a = "WebAudio", c++), this.device.chrome) {
                        for (var args = ["%c %c %c Phaser v" + v + " | Pixi.js " + PIXI.VERSION + " | " + r + " | " + a + "  %c %c %c http://phaser.io %c♥%c♥%c♥", "background: #9854d8", "background: #6c2ca7", "color: #ffffff; background: #450f78;", "background: #6c2ca7", "background: #9854d8", "background: #ffffff"], i = 0; 3 > i; i++) c > i ? args.push("color: #ff2424; background: #fff") : args.push("color: #959595; background: #fff");
                        console.log.apply(console, args)
                    } else window.console && console.log("Phaser v" + v + " | Pixi.js " + PIXI.VERSION + " | " + r + " | " + a + " | http://phaser.io")
                }
            },
            setUpRenderer: function() {
                if (this.canvas = Phaser.Canvas.create(this, this.width, this.height, this.config.canvasID, !0), this.config.canvasStyle ? this.canvas.style = this.config.canvasStyle : this.canvas.style["-webkit-full-screen"] = "width: 100%; height: 100%", this.renderType === Phaser.HEADLESS || this.renderType === Phaser.CANVAS || this.renderType === Phaser.AUTO && !this.device.webGL) {
                    if (!this.device.canvas) throw new Error("Phaser.Game - Cannot create Canvas or WebGL context, aborting.");
                    this.renderType = Phaser.CANVAS, this.renderer = new PIXI.CanvasRenderer(this), this.context = this.renderer.context
                } else this.renderType = Phaser.WEBGL, this.renderer = new PIXI.WebGLRenderer(this), this.context = null, this.canvas.addEventListener("webglcontextlost", this.contextLost.bind(this), !1), this.canvas.addEventListener("webglcontextrestored", this.contextRestored.bind(this), !1);
                this.device.cocoonJS && (this.canvas.screencanvas = this.renderType === Phaser.CANVAS ? !0 : !1), this.renderType !== Phaser.HEADLESS && (this.stage.smoothed = this.antialias, Phaser.Canvas.addToDOM(this.canvas, this.parent, !1), Phaser.Canvas.setTouchAction(this.canvas))
            },
            contextLost: function(event) {
                event.preventDefault(), this.renderer.contextLost = !0
            },
            contextRestored: function() {
                this.renderer.initContext(), this.cache.clearGLTextures(), this.renderer.contextLost = !1
            },
            update: function(time) {
                if (this.time.update(time), this._kickstart) return this.updateLogic(this.time.desiredFpsMult), this.stage.updateTransform(), this.updateRender(this.time.slowMotion * this.time.desiredFps), void(this._kickstart = !1);
                if (this._spiraling > 1 && !this.forceSingleUpdate) this.time.time > this._nextFpsNotification && (this._nextFpsNotification = this.time.time + 1e4, this.fpsProblemNotifier.dispatch()), this._deltaTime = 0, this._spiraling = 0, this.updateRender(this.time.slowMotion * this.time.desiredFps);
                else {
                    var slowStep = 1e3 * this.time.slowMotion / this.time.desiredFps;
                    this._deltaTime += Math.max(Math.min(3 * slowStep, this.time.elapsed), 0);
                    var count = 0;
                    for (this.updatesThisFrame = Math.floor(this._deltaTime / slowStep), this.forceSingleUpdate && (this.updatesThisFrame = Math.min(1, this.updatesThisFrame)); this._deltaTime >= slowStep && (this._deltaTime -= slowStep, this.currentUpdateID = count, this.updateLogic(this.time.desiredFpsMult), this.stage.updateTransform(), count++, !this.forceSingleUpdate || 1 !== count);) this.time.refresh();
                    count > this._lastCount ? this._spiraling++ : count < this._lastCount && (this._spiraling = 0), this._lastCount = count, this.updateRender(this._deltaTime / slowStep)
                }
            },
            updateLogic: function(timeStep) {
                this._paused || this.pendingStep ? (this.scale.pauseUpdate(), this.state.pauseUpdate(), this.debug.preUpdate()) : (this.stepping && (this.pendingStep = !0), this.scale.preUpdate(), this.debug.preUpdate(), this.world.camera.preUpdate(), this.physics.preUpdate(), this.state.preUpdate(timeStep), this.plugins.preUpdate(timeStep), this.stage.preUpdate(), this.state.update(), this.stage.update(), this.tweens.update(), this.sound.update(), this.input.update(), this.physics.update(), this.particles.update(), this.plugins.update(), this.stage.postUpdate(), this.plugins.postUpdate())
            },
            updateRender: function(elapsedTime) {
                this.lockRender || (this.state.preRender(elapsedTime), this.renderer.render(this.stage), this.plugins.render(elapsedTime), this.state.render(elapsedTime), this.plugins.postRender(elapsedTime))
            },
            enableStep: function() {
                this.stepping = !0, this.pendingStep = !1, this.stepCount = 0
            },
            disableStep: function() {
                this.stepping = !1, this.pendingStep = !1
            },
            step: function() {
                this.pendingStep = !1, this.stepCount++
            },
            destroy: function() {
                this.raf.stop(), this.state.destroy(), this.sound.destroy(), this.scale.destroy(), this.stage.destroy(), this.input.destroy(), this.physics.destroy(), this.state = null, this.cache = null, this.input = null, this.load = null, this.sound = null, this.stage = null, this.time = null, this.world = null, this.isBooted = !1, this.renderer.destroy(!1), Phaser.Canvas.removeFromDOM(this.canvas), Phaser.GAMES[this.id] = null
            },
            gamePaused: function(event) {
                this._paused || (this._paused = !0, this.time.gamePaused(), this.sound.setMute(), this.onPause.dispatch(event), this.device.cordova && this.device.iOS && (this.lockRender = !0))
            },
            gameResumed: function(event) {
                this._paused && !this._codePaused && (this._paused = !1, this.time.gameResumed(), this.input.reset(), this.sound.unsetMute(), this.onResume.dispatch(event), this.device.cordova && this.device.iOS && (this.lockRender = !1))
            },
            focusLoss: function(event) {
                this.onBlur.dispatch(event), this.stage.disableVisibilityChange || this.gamePaused(event)
            },
            focusGain: function(event) {
                this.onFocus.dispatch(event), this.stage.disableVisibilityChange || this.gameResumed(event)
            }
        }, Phaser.Game.prototype.constructor = Phaser.Game, Object.defineProperty(Phaser.Game.prototype, "paused", {
            get: function() {
                return this._paused
            },
            set: function(value) {
                value === !0 ? (this._paused === !1 && (this._paused = !0, this.sound.setMute(), this.time.gamePaused(), this.onPause.dispatch(this)), this._codePaused = !0) : (this._paused && (this._paused = !1, this.input.reset(), this.sound.unsetMute(), this.time.gameResumed(), this.onResume.dispatch(this)), this._codePaused = !1)
            }
        }), Phaser.Input = function(game) {
            this.game = game, this.hitCanvas = null, this.hitContext = null, this.moveCallbacks = [], this.pollRate = 0, this.enabled = !0, this.multiInputOverride = Phaser.Input.MOUSE_TOUCH_COMBINE, this.position = null, this.speed = null, this.circle = null, this.scale = null, this.maxPointers = -1, this.tapRate = 200, this.doubleTapRate = 300, this.holdRate = 2e3, this.justPressedRate = 200, this.justReleasedRate = 200, this.recordPointerHistory = !1, this.recordRate = 100, this.recordLimit = 100, this.pointer1 = null, this.pointer2 = null, this.pointer3 = null, this.pointer4 = null, this.pointer5 = null, this.pointer6 = null, this.pointer7 = null, this.pointer8 = null, this.pointer9 = null, this.pointer10 = null, this.pointers = [], this.activePointer = null, this.mousePointer = null, this.mouse = null, this.keyboard = null, this.touch = null, this.mspointer = null, this.gamepad = null, this.resetLocked = !1, this.onDown = null, this.onUp = null, this.onTap = null, this.onHold = null, this.minPriorityID = 0, this.interactiveItems = new Phaser.ArraySet, this._localPoint = new Phaser.Point, this._pollCounter = 0, this._oldPosition = null, this._x = 0, this._y = 0
        }, Phaser.Input.MOUSE_OVERRIDES_TOUCH = 0, Phaser.Input.TOUCH_OVERRIDES_MOUSE = 1, Phaser.Input.MOUSE_TOUCH_COMBINE = 2, Phaser.Input.MAX_POINTERS = 10, Phaser.Input.prototype = {
            boot: function() {
                this.mousePointer = new Phaser.Pointer(this.game, 0, Phaser.PointerMode.CURSOR), this.addPointer(), this.addPointer(), this.mouse = new Phaser.Mouse(this.game), this.touch = new Phaser.Touch(this.game), this.mspointer = new Phaser.MSPointer(this.game), Phaser.Keyboard && (this.keyboard = new Phaser.Keyboard(this.game)), Phaser.Gamepad && (this.gamepad = new Phaser.Gamepad(this.game)), this.onDown = new Phaser.Signal, this.onUp = new Phaser.Signal, this.onTap = new Phaser.Signal, this.onHold = new Phaser.Signal, this.scale = new Phaser.Point(1, 1), this.speed = new Phaser.Point, this.position = new Phaser.Point, this._oldPosition = new Phaser.Point, this.circle = new Phaser.Circle(0, 0, 44), this.activePointer = this.mousePointer, this.hitCanvas = PIXI.CanvasPool.create(this, 1, 1), this.hitContext = this.hitCanvas.getContext("2d"), this.mouse.start(), this.touch.start(), this.mspointer.start(), this.mousePointer.active = !0, this.keyboard && this.keyboard.start();
                var _this = this;
                this._onClickTrampoline = function(event) {
                    _this.onClickTrampoline(event)
                }, this.game.canvas.addEventListener("click", this._onClickTrampoline, !1)
            },
            destroy: function() {
                this.mouse.stop(), this.touch.stop(), this.mspointer.stop(), this.keyboard && this.keyboard.stop(), this.gamepad && this.gamepad.stop(), this.moveCallbacks = [], PIXI.CanvasPool.remove(this), this.game.canvas.removeEventListener("click", this._onClickTrampoline)
            },
            addMoveCallback: function(callback, context) {
                this.moveCallbacks.push({
                    callback: callback,
                    context: context
                })
            },
            deleteMoveCallback: function(callback, context) {
                for (var i = this.moveCallbacks.length; i--;)
                    if (this.moveCallbacks[i].callback === callback && this.moveCallbacks[i].context === context) return void this.moveCallbacks.splice(i, 1)
            },
            addPointer: function() {
                if (this.pointers.length >= Phaser.Input.MAX_POINTERS) return console.warn("Phaser.Input.addPointer: Maximum limit of " + Phaser.Input.MAX_POINTERS + " pointers reached."), null;
                var id = this.pointers.length + 1,
                    pointer = new Phaser.Pointer(this.game, id, Phaser.PointerMode.TOUCH);
                return this.pointers.push(pointer), this["pointer" + id] = pointer, pointer
            },
            update: function() {
                if (this.keyboard && this.keyboard.update(), this.pollRate > 0 && this._pollCounter < this.pollRate) return void this._pollCounter++;
                this.speed.x = this.position.x - this._oldPosition.x, this.speed.y = this.position.y - this._oldPosition.y, this._oldPosition.copyFrom(this.position), this.mousePointer.update(), this.gamepad && this.gamepad.active && this.gamepad.update();
                for (var i = 0; i < this.pointers.length; i++) this.pointers[i].update();
                this._pollCounter = 0
            },
            reset: function(hard) {
                if (this.game.isBooted && !this.resetLocked) {
                    void 0 === hard && (hard = !1), this.mousePointer.reset(), this.keyboard && this.keyboard.reset(hard), this.gamepad && this.gamepad.reset();
                    for (var i = 0; i < this.pointers.length; i++) this.pointers[i].reset();
                    "none" !== this.game.canvas.style.cursor && (this.game.canvas.style.cursor = "inherit"), hard && (this.onDown.dispose(), this.onUp.dispose(), this.onTap.dispose(), this.onHold.dispose(), this.onDown = new Phaser.Signal, this.onUp = new Phaser.Signal, this.onTap = new Phaser.Signal, this.onHold = new Phaser.Signal, this.moveCallbacks = []), this._pollCounter = 0
                }
            },
            resetSpeed: function(x, y) {
                this._oldPosition.setTo(x, y), this.speed.setTo(0, 0)
            },
            startPointer: function(event) {
                if (this.maxPointers >= 0 && this.countActivePointers(this.maxPointers) >= this.maxPointers) return null;
                if (!this.pointer1.active) return this.pointer1.start(event);
                if (!this.pointer2.active) return this.pointer2.start(event);
                for (var i = 2; i < this.pointers.length; i++) {
                    var pointer = this.pointers[i];
                    if (!pointer.active) return pointer.start(event)
                }
                return null
            },
            updatePointer: function(event) {
                if (this.pointer1.active && this.pointer1.identifier === event.identifier) return this.pointer1.move(event);
                if (this.pointer2.active && this.pointer2.identifier === event.identifier) return this.pointer2.move(event);
                for (var i = 2; i < this.pointers.length; i++) {
                    var pointer = this.pointers[i];
                    if (pointer.active && pointer.identifier === event.identifier) return pointer.move(event)
                }
                return null
            },
            stopPointer: function(event) {
                if (this.pointer1.active && this.pointer1.identifier === event.identifier) return this.pointer1.stop(event);
                if (this.pointer2.active && this.pointer2.identifier === event.identifier) return this.pointer2.stop(event);
                for (var i = 2; i < this.pointers.length; i++) {
                    var pointer = this.pointers[i];
                    if (pointer.active && pointer.identifier === event.identifier) return pointer.stop(event)
                }
                return null
            },
            countActivePointers: function(limit) {
                void 0 === limit && (limit = this.pointers.length);
                for (var count = limit, i = 0; i < this.pointers.length && count > 0; i++) {
                    var pointer = this.pointers[i];
                    pointer.active && count--
                }
                return limit - count
            },
            getPointer: function(isActive) {
                void 0 === isActive && (isActive = !1);
                for (var i = 0; i < this.pointers.length; i++) {
                    var pointer = this.pointers[i];
                    if (pointer.active === isActive) return pointer
                }
                return null
            },
            getPointerFromIdentifier: function(identifier) {
                for (var i = 0; i < this.pointers.length; i++) {
                    var pointer = this.pointers[i];
                    if (pointer.identifier === identifier) return pointer
                }
                return null
            },
            getPointerFromId: function(pointerId) {
                for (var i = 0; i < this.pointers.length; i++) {
                    var pointer = this.pointers[i];
                    if (pointer.pointerId === pointerId) return pointer
                }
                return null
            },
            getLocalPosition: function(displayObject, pointer, output) {
                void 0 === output && (output = new Phaser.Point);
                var wt = displayObject.worldTransform,
                    id = 1 / (wt.a * wt.d + wt.c * -wt.b);
                return output.setTo(wt.d * id * pointer.x + -wt.c * id * pointer.y + (wt.ty * wt.c - wt.tx * wt.d) * id, wt.a * id * pointer.y + -wt.b * id * pointer.x + (-wt.ty * wt.a + wt.tx * wt.b) * id)
            },
            hitTest: function(displayObject, pointer, localPoint) {
                if (!displayObject.worldVisible) return !1;
                if (this.getLocalPosition(displayObject, pointer, this._localPoint), localPoint.copyFrom(this._localPoint), displayObject.hitArea && displayObject.hitArea.contains) return displayObject.hitArea.contains(this._localPoint.x, this._localPoint.y);
                if (displayObject instanceof Phaser.TileSprite) {
                    var width = displayObject.width,
                        height = displayObject.height,
                        x1 = -width * displayObject.anchor.x;
                    if (this._localPoint.x >= x1 && this._localPoint.x < x1 + width) {
                        var y1 = -height * displayObject.anchor.y;
                        if (this._localPoint.y >= y1 && this._localPoint.y < y1 + height) return !0
                    }
                } else if (displayObject instanceof PIXI.Sprite) {
                    var width = displayObject.texture.frame.width,
                        height = displayObject.texture.frame.height,
                        x1 = -width * displayObject.anchor.x;
                    if (this._localPoint.x >= x1 && this._localPoint.x < x1 + width) {
                        var y1 = -height * displayObject.anchor.y;
                        if (this._localPoint.y >= y1 && this._localPoint.y < y1 + height) return !0
                    }
                } else if (displayObject instanceof Phaser.Graphics)
                    for (var i = 0; i < displayObject.graphicsData.length; i++) {
                        var data = displayObject.graphicsData[i];
                        if (data.fill && data.shape && data.shape.contains(this._localPoint.x, this._localPoint.y)) return !0
                    }
                for (var i = 0, len = displayObject.children.length; len > i; i++)
                    if (this.hitTest(displayObject.children[i], pointer, localPoint)) return !0;
                return !1
            },
            onClickTrampoline: function() {
                this.activePointer.processClickTrampolines()
            }
        }, Phaser.Input.prototype.constructor = Phaser.Input, Object.defineProperty(Phaser.Input.prototype, "x", {
            get: function() {
                return this._x
            },
            set: function(value) {
                this._x = Math.floor(value)
            }
        }), Object.defineProperty(Phaser.Input.prototype, "y", {
            get: function() {
                return this._y
            },
            set: function(value) {
                this._y = Math.floor(value)
            }
        }), Object.defineProperty(Phaser.Input.prototype, "pollLocked", {
            get: function() {
                return this.pollRate > 0 && this._pollCounter < this.pollRate
            }
        }), Object.defineProperty(Phaser.Input.prototype, "totalInactivePointers", {
            get: function() {
                return this.pointers.length - this.countActivePointers()
            }
        }), Object.defineProperty(Phaser.Input.prototype, "totalActivePointers", {
            get: function() {
                return this.countActivePointers()
            }
        }), Object.defineProperty(Phaser.Input.prototype, "worldX", {
            get: function() {
                return this.game.camera.view.x + this.x
            }
        }), Object.defineProperty(Phaser.Input.prototype, "worldY", {
            get: function() {
                return this.game.camera.view.y + this.y
            }
        }), Phaser.Mouse = function(game) {
            this.game = game, this.input = game.input, this.callbackContext = this.game, this.mouseDownCallback = null, this.mouseUpCallback = null, this.mouseOutCallback = null, this.mouseOverCallback = null, this.mouseWheelCallback = null, this.capture = !1, this.button = -1, this.wheelDelta = 0, this.enabled = !0, this.locked = !1, this.stopOnGameOut = !1, this.pointerLock = new Phaser.Signal, this.event = null, this._onMouseDown = null, this._onMouseMove = null, this._onMouseUp = null, this._onMouseOut = null, this._onMouseOver = null, this._onMouseWheel = null, this._wheelEvent = null
        }, Phaser.Mouse.NO_BUTTON = -1, Phaser.Mouse.LEFT_BUTTON = 0, Phaser.Mouse.MIDDLE_BUTTON = 1, Phaser.Mouse.RIGHT_BUTTON = 2, Phaser.Mouse.BACK_BUTTON = 3, Phaser.Mouse.FORWARD_BUTTON = 4, Phaser.Mouse.WHEEL_UP = 1, Phaser.Mouse.WHEEL_DOWN = -1, Phaser.Mouse.prototype = {
            start: function() {
                if ((!this.game.device.android || this.game.device.chrome !== !1) && null === this._onMouseDown) {
                    var _this = this;
                    this._onMouseDown = function(event) {
                        return _this.onMouseDown(event)
                    }, this._onMouseMove = function(event) {
                        return _this.onMouseMove(event)
                    }, this._onMouseUp = function(event) {
                        return _this.onMouseUp(event)
                    }, this._onMouseUpGlobal = function(event) {
                        return _this.onMouseUpGlobal(event)
                    }, this._onMouseOut = function(event) {
                        return _this.onMouseOut(event)
                    }, this._onMouseOver = function(event) {
                        return _this.onMouseOver(event)
                    }, this._onMouseWheel = function(event) {
                        return _this.onMouseWheel(event)
                    };
                    var canvas = this.game.canvas;
                    canvas.addEventListener("mousedown", this._onMouseDown, !0), canvas.addEventListener("mousemove", this._onMouseMove, !0), canvas.addEventListener("mouseup", this._onMouseUp, !0), this.game.device.cocoonJS || (window.addEventListener("mouseup", this._onMouseUpGlobal, !0), canvas.addEventListener("mouseover", this._onMouseOver, !0), canvas.addEventListener("mouseout", this._onMouseOut, !0));
                    var wheelEvent = this.game.device.wheelEvent;
                    wheelEvent && (canvas.addEventListener(wheelEvent, this._onMouseWheel, !0), "mousewheel" === wheelEvent ? this._wheelEvent = new WheelEventProxy(-1 / 40, 1) : "DOMMouseScroll" === wheelEvent && (this._wheelEvent = new WheelEventProxy(1, 1)))
                }
            },
            onMouseDown: function(event) {
                this.event = event, this.capture && event.preventDefault(), this.mouseDownCallback && this.mouseDownCallback.call(this.callbackContext, event), this.input.enabled && this.enabled && (event.identifier = 0, this.input.mousePointer.start(event))
            },
            onMouseMove: function(event) {
                this.event = event, this.capture && event.preventDefault(), this.mouseMoveCallback && this.mouseMoveCallback.call(this.callbackContext, event), this.input.enabled && this.enabled && (event.identifier = 0, this.input.mousePointer.move(event))
            },
            onMouseUp: function(event) {
                this.event = event, this.capture && event.preventDefault(), this.mouseUpCallback && this.mouseUpCallback.call(this.callbackContext, event), this.input.enabled && this.enabled && (event.identifier = 0, this.input.mousePointer.stop(event))
            },
            onMouseUpGlobal: function(event) {
                this.input.mousePointer.withinGame || (this.mouseUpCallback && this.mouseUpCallback.call(this.callbackContext, event), event.identifier = 0, this.input.mousePointer.stop(event))
            },
            onMouseOut: function(event) {
                this.event = event, this.capture && event.preventDefault(), this.input.mousePointer.withinGame = !1, this.mouseOutCallback && this.mouseOutCallback.call(this.callbackContext, event), this.input.enabled && this.enabled && this.stopOnGameOut && (event.identifier = 0, this.input.mousePointer.stop(event))
            },
            onMouseOver: function(event) {
                this.event = event, this.capture && event.preventDefault(), this.input.mousePointer.withinGame = !0, this.mouseOverCallback && this.mouseOverCallback.call(this.callbackContext, event)
            },
            onMouseWheel: function(event) {
                this._wheelEvent && (event = this._wheelEvent.bindEvent(event)), this.event = event, this.capture && event.preventDefault(), this.wheelDelta = Phaser.Math.clamp(-event.deltaY, -1, 1), this.mouseWheelCallback && this.mouseWheelCallback.call(this.callbackContext, event)
            },
            requestPointerLock: function() {
                if (this.game.device.pointerLock) {
                    var element = this.game.canvas;
                    element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock, element.requestPointerLock();
                    var _this = this;
                    this._pointerLockChange = function(event) {
                        return _this.pointerLockChange(event)
                    }, document.addEventListener("pointerlockchange", this._pointerLockChange, !0), document.addEventListener("mozpointerlockchange", this._pointerLockChange, !0), document.addEventListener("webkitpointerlockchange", this._pointerLockChange, !0)
                }
            },
            pointerLockChange: function(event) {
                var element = this.game.canvas;
                document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ? (this.locked = !0, this.pointerLock.dispatch(!0, event)) : (this.locked = !1, this.pointerLock.dispatch(!1, event))
            },
            releasePointerLock: function() {
                document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock || document.webkitExitPointerLock, document.exitPointerLock(), document.removeEventListener("pointerlockchange", this._pointerLockChange, !0), document.removeEventListener("mozpointerlockchange", this._pointerLockChange, !0), document.removeEventListener("webkitpointerlockchange", this._pointerLockChange, !0)
            },
            stop: function() {
                var canvas = this.game.canvas;
                canvas.removeEventListener("mousedown", this._onMouseDown, !0), canvas.removeEventListener("mousemove", this._onMouseMove, !0), canvas.removeEventListener("mouseup", this._onMouseUp, !0), canvas.removeEventListener("mouseover", this._onMouseOver, !0), canvas.removeEventListener("mouseout", this._onMouseOut, !0);
                var wheelEvent = this.game.device.wheelEvent;
                wheelEvent && canvas.removeEventListener(wheelEvent, this._onMouseWheel, !0), window.removeEventListener("mouseup", this._onMouseUpGlobal, !0), document.removeEventListener("pointerlockchange", this._pointerLockChange, !0), document.removeEventListener("mozpointerlockchange", this._pointerLockChange, !0), document.removeEventListener("webkitpointerlockchange", this._pointerLockChange, !0)
            }
        }, Phaser.Mouse.prototype.constructor = Phaser.Mouse, WheelEventProxy.prototype = {}, WheelEventProxy.prototype.constructor = WheelEventProxy, WheelEventProxy.prototype.bindEvent = function(event) {
            if (!WheelEventProxy._stubsGenerated && event) {
                var makeBinder = function(name) {
                    return function() {
                        var v = this.originalEvent[name];
                        return "function" != typeof v ? v : v.bind(this.originalEvent)
                    }
                };
                for (var prop in event) prop in WheelEventProxy.prototype || Object.defineProperty(WheelEventProxy.prototype, prop, {
                    get: makeBinder(prop)
                });
                WheelEventProxy._stubsGenerated = !0
            }
            return this.originalEvent = event, this
        }, Object.defineProperties(WheelEventProxy.prototype, {
            type: {
                value: "wheel"
            },
            deltaMode: {
                get: function() {
                    return this._deltaMode
                }
            },
            deltaY: {
                get: function() {
                    return this._scaleFactor * (this.originalEvent.wheelDelta || this.originalEvent.detail) || 0
                }
            },
            deltaX: {
                get: function() {
                    return this._scaleFactor * this.originalEvent.wheelDeltaX || 0
                }
            },
            deltaZ: {
                value: 0
            }
        }), Phaser.MSPointer = function(game) {
            this.game = game, this.input = game.input, this.callbackContext = this.game, this.pointerDownCallback = null, this.pointerMoveCallback = null, this.pointerUpCallback = null, this.capture = !0, this.button = -1, this.event = null, this.enabled = !0, this._onMSPointerDown = null, this._onMSPointerMove = null, this._onMSPointerUp = null, this._onMSPointerUpGlobal = null, this._onMSPointerOut = null, this._onMSPointerOver = null
        }, Phaser.MSPointer.prototype = {
            start: function() {
                if (null === this._onMSPointerDown) {
                    var _this = this;
                    if (this.game.device.mspointer) {
                        this._onMSPointerDown = function(event) {
                            return _this.onPointerDown(event)
                        }, this._onMSPointerMove = function(event) {
                            return _this.onPointerMove(event)
                        }, this._onMSPointerUp = function(event) {
                            return _this.onPointerUp(event)
                        }, this._onMSPointerUpGlobal = function(event) {
                            return _this.onPointerUpGlobal(event)
                        }, this._onMSPointerOut = function(event) {
                            return _this.onPointerOut(event)
                        }, this._onMSPointerOver = function(event) {
                            return _this.onPointerOver(event)
                        };
                        var canvas = this.game.canvas;
                        canvas.addEventListener("MSPointerDown", this._onMSPointerDown, !1), canvas.addEventListener("MSPointerMove", this._onMSPointerMove, !1), canvas.addEventListener("MSPointerUp", this._onMSPointerUp, !1), canvas.addEventListener("pointerdown", this._onMSPointerDown, !1), canvas.addEventListener("pointermove", this._onMSPointerMove, !1), canvas.addEventListener("pointerup", this._onMSPointerUp, !1), canvas.style["-ms-content-zooming"] = "none", canvas.style["-ms-touch-action"] = "none", this.game.device.cocoonJS || (window.addEventListener("MSPointerUp", this._onMSPointerUpGlobal, !0), canvas.addEventListener("MSPointerOver", this._onMSPointerOver, !0), canvas.addEventListener("MSPointerOut", this._onMSPointerOut, !0), window.addEventListener("pointerup", this._onMSPointerUpGlobal, !0), canvas.addEventListener("pointerover", this._onMSPointerOver, !0), canvas.addEventListener("pointerout", this._onMSPointerOut, !0))
                    }
                }
            },
            onPointerDown: function(event) {
                this.event = event, this.capture && event.preventDefault(), this.pointerDownCallback && this.pointerDownCallback.call(this.callbackContext, event), this.input.enabled && this.enabled && (event.identifier = event.pointerId, "mouse" === event.pointerType || 4 === event.pointerType ? this.input.mousePointer.start(event) : this.input.startPointer(event))
            },
            onPointerMove: function(event) {
                this.event = event, this.capture && event.preventDefault(), this.pointerMoveCallback && this.pointerMoveCallback.call(this.callbackContext, event), this.input.enabled && this.enabled && (event.identifier = event.pointerId, "mouse" === event.pointerType || 4 === event.pointerType ? this.input.mousePointer.move(event) : this.input.updatePointer(event))
            },
            onPointerUp: function(event) {
                this.event = event, this.capture && event.preventDefault(), this.pointerUpCallback && this.pointerUpCallback.call(this.callbackContext, event), this.input.enabled && this.enabled && (event.identifier = event.pointerId, "mouse" === event.pointerType || 4 === event.pointerType ? this.input.mousePointer.stop(event) : this.input.stopPointer(event))
            },
            onPointerUpGlobal: function(event) {
                if ("mouse" !== event.pointerType && 4 !== event.pointerType || this.input.mousePointer.withinGame) {
                    var pointer = this.input.getPointerFromIdentifier(event.identifier);
                    pointer && pointer.withinGame && this.onPointerUp(event)
                } else this.onPointerUp(event)
            },
            onPointerOut: function(event) {
                if (this.event = event, this.capture && event.preventDefault(), "mouse" === event.pointerType || 4 === event.pointerType) this.input.mousePointer.withinGame = !1;
                else {
                    var pointer = this.input.getPointerFromIdentifier(event.identifier);
                    pointer && (pointer.withinGame = !1)
                }
                this.input.mouse.mouseOutCallback && this.input.mouse.mouseOutCallback.call(this.input.mouse.callbackContext, event), this.input.enabled && this.enabled && this.input.mouse.stopOnGameOut && (event.identifier = 0, pointer ? pointer.stop(event) : this.input.mousePointer.stop(event))
            },
            onPointerOver: function(event) {
                if (this.event = event, this.capture && event.preventDefault(), "mouse" === event.pointerType || 4 === event.pointerType) this.input.mousePointer.withinGame = !0;
                else {
                    var pointer = this.input.getPointerFromIdentifier(event.identifier);
                    pointer && (pointer.withinGame = !0)
                }
                this.input.mouse.mouseOverCallback && this.input.mouse.mouseOverCallback.call(this.input.mouse.callbackContext, event)
            },
            stop: function() {
                var canvas = this.game.canvas;
                canvas.removeEventListener("MSPointerDown", this._onMSPointerDown, !1), canvas.removeEventListener("MSPointerMove", this._onMSPointerMove, !1), canvas.removeEventListener("MSPointerUp", this._onMSPointerUp, !1), canvas.removeEventListener("pointerdown", this._onMSPointerDown, !1), canvas.removeEventListener("pointermove", this._onMSPointerMove, !1), canvas.removeEventListener("pointerup", this._onMSPointerUp, !1), window.removeEventListener("MSPointerUp", this._onMSPointerUpGlobal, !0), canvas.removeEventListener("MSPointerOver", this._onMSPointerOver, !0), canvas.removeEventListener("MSPointerOut", this._onMSPointerOut, !0), window.removeEventListener("pointerup", this._onMSPointerUpGlobal, !0), canvas.removeEventListener("pointerover", this._onMSPointerOver, !0), canvas.removeEventListener("pointerout", this._onMSPointerOut, !0)
            }
        }, Phaser.MSPointer.prototype.constructor = Phaser.MSPointer, Phaser.DeviceButton = function(parent, buttonCode) {
            this.parent = parent, this.game = parent.game, this.event = null, this.isDown = !1, this.isUp = !0, this.timeDown = 0, this.timeUp = 0, this.repeats = 0, this.altKey = !1, this.shiftKey = !1, this.ctrlKey = !1, this.value = 0, this.buttonCode = buttonCode, this.onDown = new Phaser.Signal, this.onUp = new Phaser.Signal, this.onFloat = new Phaser.Signal
        }, Phaser.DeviceButton.prototype = {
            start: function(event, value) {
                this.isDown || (this.isDown = !0, this.isUp = !1, this.timeDown = this.game.time.time, this.repeats = 0, this.event = event, this.value = value, event && (this.altKey = event.altKey, this.shiftKey = event.shiftKey, this.ctrlKey = event.ctrlKey), this.onDown.dispatch(this, value))
            },
            stop: function(event, value) {
                this.isUp || (this.isDown = !1, this.isUp = !0, this.timeUp = this.game.time.time, this.event = event, this.value = value, event && (this.altKey = event.altKey, this.shiftKey = event.shiftKey, this.ctrlKey = event.ctrlKey), this.onUp.dispatch(this, value))
            },
            padFloat: function(value) {
                this.value = value, this.onFloat.dispatch(this, value)
            },
            justPressed: function(duration) {
                return duration = duration || 250, this.isDown && this.timeDown + duration > this.game.time.time
            },
            justReleased: function(duration) {
                return duration = duration || 250, this.isUp && this.timeUp + duration > this.game.time.time
            },
            reset: function() {
                this.isDown = !1, this.isUp = !0, this.timeDown = this.game.time.time, this.repeats = 0, this.altKey = !1, this.shiftKey = !1, this.ctrlKey = !1
            },
            destroy: function() {
                this.onDown.dispose(), this.onUp.dispose(), this.onFloat.dispose(), this.parent = null, this.game = null
            }
        }, Phaser.DeviceButton.prototype.constructor = Phaser.DeviceButton, Object.defineProperty(Phaser.DeviceButton.prototype, "duration", {
            get: function() {
                return this.isUp ? -1 : this.game.time.time - this.timeDown
            }
        }), Phaser.Pointer = function(game, id, pointerMode) {
            this.game = game, this.id = id, this.type = Phaser.POINTER, this.exists = !0, this.identifier = 0, this.pointerId = null, this.pointerMode = pointerMode || Phaser.PointerMode.CURSOR | Phaser.PointerMode.CONTACT, this.target = null, this.button = null, this.leftButton = new Phaser.DeviceButton(this, Phaser.Pointer.LEFT_BUTTON), this.middleButton = new Phaser.DeviceButton(this, Phaser.Pointer.MIDDLE_BUTTON), this.rightButton = new Phaser.DeviceButton(this, Phaser.Pointer.RIGHT_BUTTON), this.backButton = new Phaser.DeviceButton(this, Phaser.Pointer.BACK_BUTTON), this.forwardButton = new Phaser.DeviceButton(this, Phaser.Pointer.FORWARD_BUTTON), this.eraserButton = new Phaser.DeviceButton(this, Phaser.Pointer.ERASER_BUTTON), this._holdSent = !1, this._history = [], this._nextDrop = 0, this._stateReset = !1, this.withinGame = !1, this.clientX = -1, this.clientY = -1, this.pageX = -1, this.pageY = -1, this.screenX = -1, this.screenY = -1, this.rawMovementX = 0, this.rawMovementY = 0, this.movementX = 0, this.movementY = 0, this.x = -1, this.y = -1, this.isMouse = 0 === id, this.isDown = !1, this.isUp = !0, this.timeDown = 0, this.timeUp = 0, this.previousTapTime = 0, this.totalTouches = 0, this.msSinceLastClick = Number.MAX_VALUE, this.targetObject = null, this.active = !1, this.dirty = !1, this.position = new Phaser.Point, this.positionDown = new Phaser.Point, this.positionUp = new Phaser.Point, this.circle = new Phaser.Circle(0, 0, 44), this._clickTrampolines = null, this._trampolineTargetObject = null
        }, Phaser.Pointer.NO_BUTTON = 0, Phaser.Pointer.LEFT_BUTTON = 1, Phaser.Pointer.RIGHT_BUTTON = 2, Phaser.Pointer.MIDDLE_BUTTON = 4, Phaser.Pointer.BACK_BUTTON = 8, Phaser.Pointer.FORWARD_BUTTON = 16, Phaser.Pointer.ERASER_BUTTON = 32, Phaser.Pointer.prototype = {
            resetButtons: function() {
                this.isDown = !1, this.isUp = !0, this.isMouse && (this.leftButton.reset(), this.middleButton.reset(), this.rightButton.reset(), this.backButton.reset(), this.forwardButton.reset(), this.eraserButton.reset())
            },
            processButtonsDown: function(buttons, event) {
                Phaser.Pointer.LEFT_BUTTON & buttons && this.leftButton.start(event), Phaser.Pointer.RIGHT_BUTTON & buttons && this.rightButton.start(event), Phaser.Pointer.MIDDLE_BUTTON & buttons && this.middleButton.start(event), Phaser.Pointer.BACK_BUTTON & buttons && this.backButton.start(event), Phaser.Pointer.FORWARD_BUTTON & buttons && this.forwardButton.start(event), Phaser.Pointer.ERASER_BUTTON & buttons && this.eraserButton.start(event)
            },
            processButtonsUp: function(button, event) {
                button === Phaser.Mouse.LEFT_BUTTON && this.leftButton.stop(event), button === Phaser.Mouse.RIGHT_BUTTON && this.rightButton.stop(event), button === Phaser.Mouse.MIDDLE_BUTTON && this.middleButton.stop(event), button === Phaser.Mouse.BACK_BUTTON && this.backButton.stop(event), button === Phaser.Mouse.FORWARD_BUTTON && this.forwardButton.stop(event), 5 === button && this.eraserButton.stop(event)
            },
            updateButtons: function(event) {
                this.button = event.button;
                var down = "down" === event.type.toLowerCase().substr(-4);
                void 0 !== event.buttons ? down ? this.processButtonsDown(event.buttons, event) : this.processButtonsUp(event.button, event) : down ? this.leftButton.start(event) : (this.leftButton.stop(event), this.rightButton.stop(event)), event.ctrlKey && this.leftButton.isDown && this.rightButton.start(event), this.isUp = !0, this.isDown = !1, (this.leftButton.isDown || this.rightButton.isDown || this.middleButton.isDown || this.backButton.isDown || this.forwardButton.isDown || this.eraserButton.isDown) && (this.isUp = !1, this.isDown = !0)
            },
            start: function(event) {
                var input = this.game.input;
                return event.pointerId && (this.pointerId = event.pointerId), this.identifier = event.identifier, this.target = event.target, this.isMouse ? this.updateButtons(event) : (this.isDown = !0, this.isUp = !1), this.active = !0, this.withinGame = !0, this.dirty = !1, this._history = [], this._clickTrampolines = null, this._trampolineTargetObject = null, this.msSinceLastClick = this.game.time.time - this.timeDown, this.timeDown = this.game.time.time, this._holdSent = !1, this.move(event, !0), this.positionDown.setTo(this.x, this.y), (input.multiInputOverride === Phaser.Input.MOUSE_OVERRIDES_TOUCH || input.multiInputOverride === Phaser.Input.MOUSE_TOUCH_COMBINE || input.multiInputOverride === Phaser.Input.TOUCH_OVERRIDES_MOUSE && 0 === input.totalActivePointers) && (input.x = this.x, input.y = this.y, input.position.setTo(this.x, this.y), input.onDown.dispatch(this, event), input.resetSpeed(this.x, this.y)), this._stateReset = !1, this.totalTouches++, null !== this.targetObject && this.targetObject._touchedHandler(this), this
            },
            update: function() {
                var input = this.game.input;
                this.active && (this.dirty && (input.interactiveItems.total > 0 && this.processInteractiveObjects(!1), this.dirty = !1), this._holdSent === !1 && this.duration >= input.holdRate && ((input.multiInputOverride === Phaser.Input.MOUSE_OVERRIDES_TOUCH || input.multiInputOverride === Phaser.Input.MOUSE_TOUCH_COMBINE || input.multiInputOverride === Phaser.Input.TOUCH_OVERRIDES_MOUSE && 0 === input.totalActivePointers) && input.onHold.dispatch(this), this._holdSent = !0), input.recordPointerHistory && this.game.time.time >= this._nextDrop && (this._nextDrop = this.game.time.time + input.recordRate, this._history.push({
                    x: this.position.x,
                    y: this.position.y
                }), this._history.length > input.recordLimit && this._history.shift()))
            },
            move: function(event, fromClick) {
                var input = this.game.input;
                if (!input.pollLocked) {
                    if (void 0 === fromClick && (fromClick = !1), void 0 !== event.button && (this.button = event.button), fromClick && this.isMouse && this.updateButtons(event), this.clientX = event.clientX, this.clientY = event.clientY, this.pageX = event.pageX, this.pageY = event.pageY, this.screenX = event.screenX, this.screenY = event.screenY, this.isMouse && input.mouse.locked && !fromClick && (this.rawMovementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0, this.rawMovementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0, this.movementX += this.rawMovementX, this.movementY += this.rawMovementY), this.x = (this.pageX - this.game.scale.offset.x) * input.scale.x, this.y = (this.pageY - this.game.scale.offset.y) * input.scale.y, this.position.setTo(this.x, this.y), this.circle.x = this.x, this.circle.y = this.y, (input.multiInputOverride === Phaser.Input.MOUSE_OVERRIDES_TOUCH || input.multiInputOverride === Phaser.Input.MOUSE_TOUCH_COMBINE || input.multiInputOverride === Phaser.Input.TOUCH_OVERRIDES_MOUSE && 0 === input.totalActivePointers) && (input.activePointer = this, input.x = this.x, input.y = this.y, input.position.setTo(input.x, input.y), input.circle.x = input.x, input.circle.y = input.y), this.withinGame = this.game.scale.bounds.contains(this.pageX, this.pageY), this.game.paused) return this;
                    for (var i = input.moveCallbacks.length; i--;) input.moveCallbacks[i].callback.call(input.moveCallbacks[i].context, this, this.x, this.y, fromClick);
                    return null !== this.targetObject && this.targetObject.isDragged === !0 ? this.targetObject.update(this) === !1 && (this.targetObject = null) : input.interactiveItems.total > 0 && this.processInteractiveObjects(fromClick), this
                }
            },
            processInteractiveObjects: function(fromClick) {
                for (var highestRenderOrderID = Number.MAX_VALUE, highestInputPriorityID = -1, candidateTarget = null, currentNode = this.game.input.interactiveItems.first; currentNode;) currentNode.checked = !1, currentNode.validForInput(highestInputPriorityID, highestRenderOrderID, !1) && (currentNode.checked = !0, (fromClick && currentNode.checkPointerDown(this, !0) || !fromClick && currentNode.checkPointerOver(this, !0)) && (highestRenderOrderID = currentNode.sprite.renderOrderID, highestInputPriorityID = currentNode.priorityID, candidateTarget = currentNode)), currentNode = this.game.input.interactiveItems.next;
                for (var currentNode = this.game.input.interactiveItems.first; currentNode;) !currentNode.checked && currentNode.validForInput(highestInputPriorityID, highestRenderOrderID, !0) && (fromClick && currentNode.checkPointerDown(this, !1) || !fromClick && currentNode.checkPointerOver(this, !1)) && (highestRenderOrderID = currentNode.sprite.renderOrderID, highestInputPriorityID = currentNode.priorityID, candidateTarget = currentNode), currentNode = this.game.input.interactiveItems.next;
                return null === candidateTarget ? this.targetObject && (this.targetObject._pointerOutHandler(this), this.targetObject = null) : null === this.targetObject ? (this.targetObject = candidateTarget, candidateTarget._pointerOverHandler(this)) : this.targetObject === candidateTarget ? candidateTarget.update(this) === !1 && (this.targetObject = null) : (this.targetObject._pointerOutHandler(this), this.targetObject = candidateTarget, this.targetObject._pointerOverHandler(this)), null !== this.targetObject
            },
            leave: function(event) {
                this.withinGame = !1, this.move(event, !1)
            },
            stop: function(event) {
                var input = this.game.input;
                return this._stateReset && this.withinGame ? void event.preventDefault() : (this.timeUp = this.game.time.time, (input.multiInputOverride === Phaser.Input.MOUSE_OVERRIDES_TOUCH || input.multiInputOverride === Phaser.Input.MOUSE_TOUCH_COMBINE || input.multiInputOverride === Phaser.Input.TOUCH_OVERRIDES_MOUSE && 0 === input.totalActivePointers) && (input.onUp.dispatch(this, event), this.duration >= 0 && this.duration <= input.tapRate && (this.timeUp - this.previousTapTime < input.doubleTapRate ? input.onTap.dispatch(this, !0) : input.onTap.dispatch(this, !1), this.previousTapTime = this.timeUp)), this.isMouse ? this.updateButtons(event) : (this.isDown = !1, this.isUp = !0), this.id > 0 && (this.active = !1), this.withinGame = this.game.scale.bounds.contains(event.pageX, event.pageY), this.pointerId = null, this.identifier = null, this.positionUp.setTo(this.x, this.y), this.isMouse === !1 && input.currentPointers--, input.interactiveItems.callAll("_releasedHandler", this), this._clickTrampolines && (this._trampolineTargetObject = this.targetObject), this.targetObject = null, this)
            },
            justPressed: function(duration) {
                return duration = duration || this.game.input.justPressedRate, this.isDown === !0 && this.timeDown + duration > this.game.time.time
            },
            justReleased: function(duration) {
                return duration = duration || this.game.input.justReleasedRate, this.isUp && this.timeUp + duration > this.game.time.time
            },
            addClickTrampoline: function(name, callback, callbackContext, callbackArgs) {
                if (this.isDown) {
                    for (var trampolines = this._clickTrampolines = this._clickTrampolines || [], i = 0; i < trampolines.length; i++)
                        if (trampolines[i].name === name) {
                            trampolines.splice(i, 1);
                            break
                        }
                    trampolines.push({
                        name: name,
                        targetObject: this.targetObject,
                        callback: callback,
                        callbackContext: callbackContext,
                        callbackArgs: callbackArgs
                    })
                }
            },
            processClickTrampolines: function() {
                var trampolines = this._clickTrampolines;
                if (trampolines) {
                    for (var i = 0; i < trampolines.length; i++) {
                        var trampoline = trampolines[i];
                        trampoline.targetObject === this._trampolineTargetObject && trampoline.callback.apply(trampoline.callbackContext, trampoline.callbackArgs)
                    }
                    this._clickTrampolines = null, this._trampolineTargetObject = null
                }
            },
            reset: function() {
                this.isMouse === !1 && (this.active = !1), this.pointerId = null, this.identifier = null, this.dirty = !1, this.totalTouches = 0, this._holdSent = !1, this._history.length = 0, this._stateReset = !0, this.resetButtons(), this.targetObject && this.targetObject._releasedHandler(this), this.targetObject = null
            },
            resetMovement: function() {
                this.movementX = 0, this.movementY = 0
            }
        }, Phaser.Pointer.prototype.constructor = Phaser.Pointer, Object.defineProperty(Phaser.Pointer.prototype, "duration", {
            get: function() {
                return this.isUp ? -1 : this.game.time.time - this.timeDown
            }
        }), Object.defineProperty(Phaser.Pointer.prototype, "worldX", {
            get: function() {
                return this.game.world.camera.x + this.x
            }
        }), Object.defineProperty(Phaser.Pointer.prototype, "worldY", {
            get: function() {
                return this.game.world.camera.y + this.y
            }
        }), Phaser.PointerMode = {
            CURSOR: 1,
            CONTACT: 2
        }, Phaser.Touch = function(game) {
            this.game = game, this.enabled = !0, this.touchLockCallbacks = [], this.callbackContext = this.game, this.touchStartCallback = null, this.touchMoveCallback = null, this.touchEndCallback = null, this.touchEnterCallback = null, this.touchLeaveCallback = null, this.touchCancelCallback = null, this.preventDefault = !0, this.event = null, this._onTouchStart = null, this._onTouchMove = null, this._onTouchEnd = null, this._onTouchEnter = null, this._onTouchLeave = null, this._onTouchCancel = null, this._onTouchMove = null
        }, Phaser.Touch.prototype = {
            start: function() {
                if (null === this._onTouchStart) {
                    var _this = this;
                    this.game.device.touch && (this._onTouchStart = function(event) {
                        return _this.onTouchStart(event)
                    }, this._onTouchMove = function(event) {
                        return _this.onTouchMove(event)
                    }, this._onTouchEnd = function(event) {
                        return _this.onTouchEnd(event)
                    }, this._onTouchEnter = function(event) {
                        return _this.onTouchEnter(event)
                    }, this._onTouchLeave = function(event) {
                        return _this.onTouchLeave(event)
                    }, this._onTouchCancel = function(event) {
                        return _this.onTouchCancel(event)
                    }, this.game.canvas.addEventListener("touchstart", this._onTouchStart, !1), this.game.canvas.addEventListener("touchmove", this._onTouchMove, !1), this.game.canvas.addEventListener("touchend", this._onTouchEnd, !1), this.game.canvas.addEventListener("touchcancel", this._onTouchCancel, !1), this.game.device.cocoonJS || (this.game.canvas.addEventListener("touchenter", this._onTouchEnter, !1), this.game.canvas.addEventListener("touchleave", this._onTouchLeave, !1)))
                }
            },
            consumeDocumentTouches: function() {
                this._documentTouchMove = function(event) {
                    event.preventDefault()
                }, document.addEventListener("touchmove", this._documentTouchMove, !1)
            },
            addTouchLockCallback: function(callback, context, onEnd) {
                void 0 === onEnd && (onEnd = !1), this.touchLockCallbacks.push({
                    callback: callback,
                    context: context,
                    onEnd: onEnd
                })
            },
            removeTouchLockCallback: function(callback, context) {
                for (var i = this.touchLockCallbacks.length; i--;)
                    if (this.touchLockCallbacks[i].callback === callback && this.touchLockCallbacks[i].context === context) return this.touchLockCallbacks.splice(i, 1), !0;
                return !1
            },
            onTouchStart: function(event) {
                for (var i = this.touchLockCallbacks.length; i--;) {
                    var cb = this.touchLockCallbacks[i];
                    !cb.onEnd && cb.callback.call(cb.context, this, event) && this.touchLockCallbacks.splice(i, 1)
                }
                if (this.event = event, this.game.input.enabled && this.enabled) {
                    this.touchStartCallback && this.touchStartCallback.call(this.callbackContext, event), this.preventDefault && event.preventDefault();
                    for (var i = 0; i < event.changedTouches.length; i++) this.game.input.startPointer(event.changedTouches[i])
                }
            },
            onTouchCancel: function(event) {
                if (this.event = event, this.touchCancelCallback && this.touchCancelCallback.call(this.callbackContext, event), this.game.input.enabled && this.enabled) {
                    this.preventDefault && event.preventDefault();
                    for (var i = 0; i < event.changedTouches.length; i++) this.game.input.stopPointer(event.changedTouches[i])
                }
            },
            onTouchEnter: function(event) {
                this.event = event, this.touchEnterCallback && this.touchEnterCallback.call(this.callbackContext, event), this.game.input.enabled && this.enabled && this.preventDefault && event.preventDefault()
            },
            onTouchLeave: function(event) {
                this.event = event, this.touchLeaveCallback && this.touchLeaveCallback.call(this.callbackContext, event), this.preventDefault && event.preventDefault()
            },
            onTouchMove: function(event) {
                this.event = event, this.touchMoveCallback && this.touchMoveCallback.call(this.callbackContext, event), this.preventDefault && event.preventDefault();
                for (var i = 0; i < event.changedTouches.length; i++) this.game.input.updatePointer(event.changedTouches[i])
            },
            onTouchEnd: function(event) {
                for (var i = this.touchLockCallbacks.length; i--;) {
                    var cb = this.touchLockCallbacks[i];
                    cb.onEnd && cb.callback.call(cb.context, this, event) && this.touchLockCallbacks.splice(i, 1)
                }
                this.event = event, this.touchEndCallback && this.touchEndCallback.call(this.callbackContext, event), this.preventDefault && event.preventDefault();
                for (var i = 0; i < event.changedTouches.length; i++) this.game.input.stopPointer(event.changedTouches[i])
            },
            stop: function() {
                this.game.device.touch && (this.game.canvas.removeEventListener("touchstart", this._onTouchStart), this.game.canvas.removeEventListener("touchmove", this._onTouchMove), this.game.canvas.removeEventListener("touchend", this._onTouchEnd), this.game.canvas.removeEventListener("touchenter", this._onTouchEnter), this.game.canvas.removeEventListener("touchleave", this._onTouchLeave), this.game.canvas.removeEventListener("touchcancel", this._onTouchCancel))
            }
        }, Phaser.Touch.prototype.constructor = Phaser.Touch, Phaser.InputHandler = function(sprite) {
            this.sprite = sprite, this.game = sprite.game, this.enabled = !1, this.checked = !1, this.priorityID = 0, this.useHandCursor = !1, this._setHandCursor = !1, this.isDragged = !1, this.allowHorizontalDrag = !0, this.allowVerticalDrag = !0, this.bringToTop = !1, this.snapOffset = null, this.snapOnDrag = !1, this.snapOnRelease = !1, this.snapX = 0, this.snapY = 0, this.snapOffsetX = 0, this.snapOffsetY = 0, this.pixelPerfectOver = !1, this.pixelPerfectClick = !1, this.pixelPerfectAlpha = 255, this.draggable = !1, this.boundsRect = null, this.boundsSprite = null, this.consumePointerEvent = !1, this.scaleLayer = !1, this.dragOffset = new Phaser.Point, this.dragFromCenter = !1, this.dragStartPoint = new Phaser.Point, this.snapPoint = new Phaser.Point, this._dragPoint = new Phaser.Point, this._dragPhase = !1, this._wasEnabled = !1, this._tempPoint = new Phaser.Point, this._pointerData = [], this._pointerData.push({
                id: 0,
                x: 0,
                y: 0,
                isDown: !1,
                isUp: !1,
                isOver: !1,
                isOut: !1,
                timeOver: 0,
                timeOut: 0,
                timeDown: 0,
                timeUp: 0,
                downDuration: 0,
                isDragged: !1
            })
        }, Phaser.InputHandler.prototype = {
            start: function(priority, useHandCursor) {
                if (priority = priority || 0, void 0 === useHandCursor && (useHandCursor = !1), this.enabled === !1) {
                    this.game.input.interactiveItems.add(this), this.useHandCursor = useHandCursor, this.priorityID = priority;
                    for (var i = 0; 10 > i; i++) this._pointerData[i] = {
                        id: i,
                        x: 0,
                        y: 0,
                        isDown: !1,
                        isUp: !1,
                        isOver: !1,
                        isOut: !1,
                        timeOver: 0,
                        timeOut: 0,
                        timeDown: 0,
                        timeUp: 0,
                        downDuration: 0,
                        isDragged: !1
                    };
                    this.snapOffset = new Phaser.Point, this.enabled = !0, this._wasEnabled = !0
                }
                return this.sprite.events.onAddedToGroup.add(this.addedToGroup, this), this.sprite.events.onRemovedFromGroup.add(this.removedFromGroup, this), this.flagged = !1, this.sprite
            },
            addedToGroup: function() {
                this._dragPhase || this._wasEnabled && !this.enabled && this.start()
            },
            removedFromGroup: function() {
                this._dragPhase || (this.enabled ? (this._wasEnabled = !0, this.stop()) : this._wasEnabled = !1)
            },
            reset: function() {
                this.enabled = !1, this.flagged = !1;
                for (var i = 0; 10 > i; i++) this._pointerData[i] = {
                    id: i,
                    x: 0,
                    y: 0,
                    isDown: !1,
                    isUp: !1,
                    isOver: !1,
                    isOut: !1,
                    timeOver: 0,
                    timeOut: 0,
                    timeDown: 0,
                    timeUp: 0,
                    downDuration: 0,
                    isDragged: !1
                }
            },
            stop: function() {
                this.enabled !== !1 && (this.enabled = !1, this.game.input.interactiveItems.remove(this))
            },
            destroy: function() {
                this.sprite && (this._setHandCursor && (this.game.canvas.style.cursor = "default", this._setHandCursor = !1), this.enabled = !1, this.game.input.interactiveItems.remove(this), this._pointerData.length = 0, this.boundsRect = null, this.boundsSprite = null, this.sprite = null)
            },
            validForInput: function(highestID, highestRenderID, includePixelPerfect) {
                return void 0 === includePixelPerfect && (includePixelPerfect = !0), !this.enabled || 0 === this.sprite.scale.x || 0 === this.sprite.scale.y || this.priorityID < this.game.input.minPriorityID ? !1 : (includePixelPerfect || !this.pixelPerfectClick && !this.pixelPerfectOver) && (this.priorityID > highestID || this.priorityID === highestID && this.sprite.renderOrderID < highestRenderID) ? !0 : !1
            },
            isPixelPerfect: function() {
                return this.pixelPerfectClick || this.pixelPerfectOver
            },
            pointerX: function(pointerId) {
                return pointerId = pointerId || 0, this._pointerData[pointerId].x
            },
            pointerY: function(pointerId) {
                return pointerId = pointerId || 0, this._pointerData[pointerId].y
            },
            pointerDown: function(pointerId) {
                return pointerId = pointerId || 0, this._pointerData[pointerId].isDown
            },
            pointerUp: function(pointerId) {
                return pointerId = pointerId || 0, this._pointerData[pointerId].isUp
            },
            pointerTimeDown: function(pointerId) {
                return pointerId = pointerId || 0, this._pointerData[pointerId].timeDown
            },
            pointerTimeUp: function(pointerId) {
                return pointerId = pointerId || 0, this._pointerData[pointerId].timeUp
            },
            pointerOver: function(pointerId) {
                if (!this.enabled) return !1;
                if (void 0 !== pointerId) return this._pointerData[pointerId].isOver;
                for (var i = 0; 10 > i; i++)
                    if (this._pointerData[i].isOver) return !0
            },
            pointerOut: function(pointerId) {
                if (!this.enabled) return !1;
                if (void 0 !== pointerId) return this._pointerData[pointerId].isOut;
                for (var i = 0; 10 > i; i++)
                    if (this._pointerData[i].isOut) return !0
            },
            pointerTimeOver: function(pointerId) {
                return pointerId = pointerId || 0, this._pointerData[pointerId].timeOver
            },
            pointerTimeOut: function(pointerId) {
                return pointerId = pointerId || 0, this._pointerData[pointerId].timeOut
            },
            pointerDragged: function(pointerId) {
                return pointerId = pointerId || 0, this._pointerData[pointerId].isDragged
            },
            checkPointerDown: function(pointer, fastTest) {
                return pointer.isDown && this.enabled && this.sprite && this.sprite.parent && this.sprite.visible && this.sprite.parent.visible && this.game.input.hitTest(this.sprite, pointer, this._tempPoint) ? (void 0 === fastTest && (fastTest = !1), !fastTest && this.pixelPerfectClick ? this.checkPixel(this._tempPoint.x, this._tempPoint.y) : !0) : !1
            },
            checkPointerOver: function(pointer, fastTest) {
                return this.enabled && this.sprite && this.sprite.parent && this.sprite.visible && this.sprite.parent.visible && this.game.input.hitTest(this.sprite, pointer, this._tempPoint) ? (void 0 === fastTest && (fastTest = !1), !fastTest && this.pixelPerfectOver ? this.checkPixel(this._tempPoint.x, this._tempPoint.y) : !0) : !1
            },
            checkPixel: function(x, y, pointer) {
                if (this.sprite.texture.baseTexture.source) {
                    if (null === x && null === y) {
                        this.game.input.getLocalPosition(this.sprite, pointer, this._tempPoint);
                        var x = this._tempPoint.x,
                            y = this._tempPoint.y
                    }
                    if (0 !== this.sprite.anchor.x && (x -= -this.sprite.texture.frame.width * this.sprite.anchor.x), 0 !== this.sprite.anchor.y && (y -= -this.sprite.texture.frame.height * this.sprite.anchor.y), x += this.sprite.texture.frame.x, y += this.sprite.texture.frame.y, this.sprite.texture.trim && (x -= this.sprite.texture.trim.x, y -= this.sprite.texture.trim.y, x < this.sprite.texture.crop.x || x > this.sprite.texture.crop.right || y < this.sprite.texture.crop.y || y > this.sprite.texture.crop.bottom)) return this._dx = x, this._dy = y, !1;
                    this._dx = x, this._dy = y, this.game.input.hitContext.clearRect(0, 0, 1, 1), this.game.input.hitContext.drawImage(this.sprite.texture.baseTexture.source, x, y, 1, 1, 0, 0, 1, 1);
                    var rgb = this.game.input.hitContext.getImageData(0, 0, 1, 1);
                    if (rgb.data[3] >= this.pixelPerfectAlpha) return !0
                }
                return !1
            },
            update: function(pointer) {
                return null !== this.sprite && void 0 !== this.sprite.parent ? this.enabled && this.sprite.visible && this.sprite.parent.visible ? this.draggable && this._draggedPointerID === pointer.id ? this.updateDrag(pointer) : this._pointerData[pointer.id].isOver ? this.checkPointerOver(pointer) ? (this._pointerData[pointer.id].x = pointer.x - this.sprite.x, this._pointerData[pointer.id].y = pointer.y - this.sprite.y, !0) : (this._pointerOutHandler(pointer), !1) : void 0 : (this._pointerOutHandler(pointer), !1) : void 0
            },
            _pointerOverHandler: function(pointer) {
                if (null !== this.sprite) {
                    var data = this._pointerData[pointer.id];
                    (data.isOver === !1 || pointer.dirty) && (data.isOver = !0, data.isOut = !1, data.timeOver = this.game.time.time, data.x = pointer.x - this.sprite.x, data.y = pointer.y - this.sprite.y, this.useHandCursor && data.isDragged === !1 && (this.game.canvas.style.cursor = "pointer", this._setHandCursor = !0), this.sprite && this.sprite.events && this.sprite.events.onInputOver$dispatch(this.sprite, pointer))
                }
            },
            _pointerOutHandler: function(pointer) {
                if (null !== this.sprite) {
                    var data = this._pointerData[pointer.id];
                    data.isOver = !1, data.isOut = !0, data.timeOut = this.game.time.time, this.useHandCursor && data.isDragged === !1 && (this.game.canvas.style.cursor = "default", this._setHandCursor = !1), this.sprite && this.sprite.events && this.sprite.events.onInputOut$dispatch(this.sprite, pointer)
                }
            },
            _touchedHandler: function(pointer) {
                if (null !== this.sprite) {
                    var data = this._pointerData[pointer.id];
                    if (!data.isDown && data.isOver) {
                        if (this.pixelPerfectClick && !this.checkPixel(null, null, pointer)) return;
                        data.isDown = !0, data.isUp = !1, data.timeDown = this.game.time.time, this.sprite && this.sprite.events && this.sprite.events.onInputDown$dispatch(this.sprite, pointer), pointer.dirty = !0, this.draggable && this.isDragged === !1 && this.startDrag(pointer), this.bringToTop && this.sprite.bringToTop()
                    }
                    return this.consumePointerEvent
                }
            },
            _releasedHandler: function(pointer) {
                if (null !== this.sprite) {
                    var data = this._pointerData[pointer.id];
                    if (data.isDown && pointer.isUp) {
                        data.isDown = !1, data.isUp = !0, data.timeUp = this.game.time.time, data.downDuration = data.timeUp - data.timeDown;
                        var isOver = this.checkPointerOver(pointer);
                        this.sprite && this.sprite.events && (this.sprite.events.onInputUp$dispatch(this.sprite, pointer, isOver), isOver && (isOver = this.checkPointerOver(pointer))), data.isOver = isOver, !isOver && this.useHandCursor && (this.game.canvas.style.cursor = "default", this._setHandCursor = !1), pointer.dirty = !0, this.draggable && this.isDragged && this._draggedPointerID === pointer.id && this.stopDrag(pointer)
                    }
                }
            },
            updateDrag: function(pointer) {
                if (pointer.isUp) return this.stopDrag(pointer), !1;
                var px = this.globalToLocalX(pointer.x) + this._dragPoint.x + this.dragOffset.x,
                    py = this.globalToLocalY(pointer.y) + this._dragPoint.y + this.dragOffset.y;
                return this.sprite.fixedToCamera ? (this.allowHorizontalDrag && (this.sprite.cameraOffset.x = px), this.allowVerticalDrag && (this.sprite.cameraOffset.y = py), this.boundsRect && this.checkBoundsRect(), this.boundsSprite && this.checkBoundsSprite(), this.snapOnDrag && (this.sprite.cameraOffset.x = Math.round((this.sprite.cameraOffset.x - this.snapOffsetX % this.snapX) / this.snapX) * this.snapX + this.snapOffsetX % this.snapX, this.sprite.cameraOffset.y = Math.round((this.sprite.cameraOffset.y - this.snapOffsetY % this.snapY) / this.snapY) * this.snapY + this.snapOffsetY % this.snapY, this.snapPoint.set(this.sprite.cameraOffset.x, this.sprite.cameraOffset.y))) : (this.allowHorizontalDrag && (this.sprite.x = px), this.allowVerticalDrag && (this.sprite.y = py), this.boundsRect && this.checkBoundsRect(), this.boundsSprite && this.checkBoundsSprite(), this.snapOnDrag && (this.sprite.x = Math.round((this.sprite.x - this.snapOffsetX % this.snapX) / this.snapX) * this.snapX + this.snapOffsetX % this.snapX,
                    this.sprite.y = Math.round((this.sprite.y - this.snapOffsetY % this.snapY) / this.snapY) * this.snapY + this.snapOffsetY % this.snapY, this.snapPoint.set(this.sprite.x, this.sprite.y))), this.sprite.events.onDragUpdate.dispatch(this.sprite, pointer, px, py, this.snapPoint), !0
            },
            justOver: function(pointerId, delay) {
                return pointerId = pointerId || 0, delay = delay || 500, this._pointerData[pointerId].isOver && this.overDuration(pointerId) < delay
            },
            justOut: function(pointerId, delay) {
                return pointerId = pointerId || 0, delay = delay || 500, this._pointerData[pointerId].isOut && this.game.time.time - this._pointerData[pointerId].timeOut < delay
            },
            justPressed: function(pointerId, delay) {
                return pointerId = pointerId || 0, delay = delay || 500, this._pointerData[pointerId].isDown && this.downDuration(pointerId) < delay
            },
            justReleased: function(pointerId, delay) {
                return pointerId = pointerId || 0, delay = delay || 500, this._pointerData[pointerId].isUp && this.game.time.time - this._pointerData[pointerId].timeUp < delay
            },
            overDuration: function(pointerId) {
                return pointerId = pointerId || 0, this._pointerData[pointerId].isOver ? this.game.time.time - this._pointerData[pointerId].timeOver : -1
            },
            downDuration: function(pointerId) {
                return pointerId = pointerId || 0, this._pointerData[pointerId].isDown ? this.game.time.time - this._pointerData[pointerId].timeDown : -1
            },
            enableDrag: function(lockCenter, bringToTop, pixelPerfect, alphaThreshold, boundsRect, boundsSprite) {
                void 0 === lockCenter && (lockCenter = !1), void 0 === bringToTop && (bringToTop = !1), void 0 === pixelPerfect && (pixelPerfect = !1), void 0 === alphaThreshold && (alphaThreshold = 255), void 0 === boundsRect && (boundsRect = null), void 0 === boundsSprite && (boundsSprite = null), this._dragPoint = new Phaser.Point, this.draggable = !0, this.bringToTop = bringToTop, this.dragOffset = new Phaser.Point, this.dragFromCenter = lockCenter, this.pixelPerfectClick = pixelPerfect, this.pixelPerfectAlpha = alphaThreshold, boundsRect && (this.boundsRect = boundsRect), boundsSprite && (this.boundsSprite = boundsSprite)
            },
            disableDrag: function() {
                if (this._pointerData)
                    for (var i = 0; 10 > i; i++) this._pointerData[i].isDragged = !1;
                this.draggable = !1, this.isDragged = !1, this._draggedPointerID = -1
            },
            startDrag: function(pointer) {
                var x = this.sprite.x,
                    y = this.sprite.y;
                if (this.isDragged = !0, this._draggedPointerID = pointer.id, this._pointerData[pointer.id].isDragged = !0, this.sprite.fixedToCamera) this.dragFromCenter ? (this.sprite.centerOn(pointer.x, pointer.y), this._dragPoint.setTo(this.sprite.cameraOffset.x - pointer.x, this.sprite.cameraOffset.y - pointer.y)) : this._dragPoint.setTo(this.sprite.cameraOffset.x - pointer.x, this.sprite.cameraOffset.y - pointer.y);
                else {
                    if (this.dragFromCenter) {
                        var bounds = this.sprite.getBounds();
                        this.sprite.x = this.globalToLocalX(pointer.x) + (this.sprite.x - bounds.centerX), this.sprite.y = this.globalToLocalY(pointer.y) + (this.sprite.y - bounds.centerY)
                    }
                    this._dragPoint.setTo(this.sprite.x - this.globalToLocalX(pointer.x), this.sprite.y - this.globalToLocalY(pointer.y))
                }
                this.updateDrag(pointer), this.bringToTop && (this._dragPhase = !0, this.sprite.bringToTop()), this.dragStartPoint.set(x, y), this.sprite.events.onDragStart$dispatch(this.sprite, pointer, x, y)
            },
            globalToLocalX: function(x) {
                return this.scaleLayer && (x -= this.game.scale.grid.boundsFluid.x, x *= this.game.scale.grid.scaleFluidInversed.x), x
            },
            globalToLocalY: function(y) {
                return this.scaleLayer && (y -= this.game.scale.grid.boundsFluid.y, y *= this.game.scale.grid.scaleFluidInversed.y), y
            },
            stopDrag: function(pointer) {
                this.isDragged = !1, this._draggedPointerID = -1, this._pointerData[pointer.id].isDragged = !1, this._dragPhase = !1, this.snapOnRelease && (this.sprite.fixedToCamera ? (this.sprite.cameraOffset.x = Math.round((this.sprite.cameraOffset.x - this.snapOffsetX % this.snapX) / this.snapX) * this.snapX + this.snapOffsetX % this.snapX, this.sprite.cameraOffset.y = Math.round((this.sprite.cameraOffset.y - this.snapOffsetY % this.snapY) / this.snapY) * this.snapY + this.snapOffsetY % this.snapY) : (this.sprite.x = Math.round((this.sprite.x - this.snapOffsetX % this.snapX) / this.snapX) * this.snapX + this.snapOffsetX % this.snapX, this.sprite.y = Math.round((this.sprite.y - this.snapOffsetY % this.snapY) / this.snapY) * this.snapY + this.snapOffsetY % this.snapY)), this.sprite.events.onDragStop$dispatch(this.sprite, pointer), this.checkPointerOver(pointer) === !1 && this._pointerOutHandler(pointer)
            },
            setDragLock: function(allowHorizontal, allowVertical) {
                void 0 === allowHorizontal && (allowHorizontal = !0), void 0 === allowVertical && (allowVertical = !0), this.allowHorizontalDrag = allowHorizontal, this.allowVerticalDrag = allowVertical
            },
            enableSnap: function(snapX, snapY, onDrag, onRelease, snapOffsetX, snapOffsetY) {
                void 0 === onDrag && (onDrag = !0), void 0 === onRelease && (onRelease = !1), void 0 === snapOffsetX && (snapOffsetX = 0), void 0 === snapOffsetY && (snapOffsetY = 0), this.snapX = snapX, this.snapY = snapY, this.snapOffsetX = snapOffsetX, this.snapOffsetY = snapOffsetY, this.snapOnDrag = onDrag, this.snapOnRelease = onRelease
            },
            disableSnap: function() {
                this.snapOnDrag = !1, this.snapOnRelease = !1
            },
            checkBoundsRect: function() {
                this.sprite.fixedToCamera ? (this.sprite.cameraOffset.x < this.boundsRect.left ? this.sprite.cameraOffset.x = this.boundsRect.left : this.sprite.cameraOffset.x + this.sprite.width > this.boundsRect.right && (this.sprite.cameraOffset.x = this.boundsRect.right - this.sprite.width), this.sprite.cameraOffset.y < this.boundsRect.top ? this.sprite.cameraOffset.y = this.boundsRect.top : this.sprite.cameraOffset.y + this.sprite.height > this.boundsRect.bottom && (this.sprite.cameraOffset.y = this.boundsRect.bottom - this.sprite.height)) : (this.sprite.left < this.boundsRect.left ? this.sprite.x = this.boundsRect.x + this.sprite.offsetX : this.sprite.right > this.boundsRect.right && (this.sprite.x = this.boundsRect.right - (this.sprite.width - this.sprite.offsetX)), this.sprite.top < this.boundsRect.top ? this.sprite.y = this.boundsRect.top + this.sprite.offsetY : this.sprite.bottom > this.boundsRect.bottom && (this.sprite.y = this.boundsRect.bottom - (this.sprite.height - this.sprite.offsetY)))
            },
            checkBoundsSprite: function() {
                this.sprite.fixedToCamera && this.boundsSprite.fixedToCamera ? (this.sprite.cameraOffset.x < this.boundsSprite.cameraOffset.x ? this.sprite.cameraOffset.x = this.boundsSprite.cameraOffset.x : this.sprite.cameraOffset.x + this.sprite.width > this.boundsSprite.cameraOffset.x + this.boundsSprite.width && (this.sprite.cameraOffset.x = this.boundsSprite.cameraOffset.x + this.boundsSprite.width - this.sprite.width), this.sprite.cameraOffset.y < this.boundsSprite.cameraOffset.y ? this.sprite.cameraOffset.y = this.boundsSprite.cameraOffset.y : this.sprite.cameraOffset.y + this.sprite.height > this.boundsSprite.cameraOffset.y + this.boundsSprite.height && (this.sprite.cameraOffset.y = this.boundsSprite.cameraOffset.y + this.boundsSprite.height - this.sprite.height)) : (this.sprite.left < this.boundsSprite.left ? this.sprite.x = this.boundsSprite.left + this.sprite.offsetX : this.sprite.right > this.boundsSprite.right && (this.sprite.x = this.boundsSprite.right - (this.sprite.width - this.sprite.offsetX)), this.sprite.top < this.boundsSprite.top ? this.sprite.y = this.boundsSprite.top + this.sprite.offsetY : this.sprite.bottom > this.boundsSprite.bottom && (this.sprite.y = this.boundsSprite.bottom - (this.sprite.height - this.sprite.offsetY)))
            }
        }, Phaser.InputHandler.prototype.constructor = Phaser.InputHandler, Phaser.Gamepad = function(game) {
            this.game = game, this._gamepadIndexMap = {}, this._rawPads = [], this._active = !1, this.enabled = !0, this._gamepadSupportAvailable = !!navigator.webkitGetGamepads || !!navigator.webkitGamepads || -1 != navigator.userAgent.indexOf("Firefox/") || !!navigator.getGamepads, this._prevRawGamepadTypes = [], this._prevTimestamps = [], this.callbackContext = this, this.onConnectCallback = null, this.onDisconnectCallback = null, this.onDownCallback = null, this.onUpCallback = null, this.onAxisCallback = null, this.onFloatCallback = null, this._ongamepadconnected = null, this._gamepaddisconnected = null, this._gamepads = [new Phaser.SinglePad(game, this), new Phaser.SinglePad(game, this), new Phaser.SinglePad(game, this), new Phaser.SinglePad(game, this)]
        }, Phaser.Gamepad.prototype = {
            addCallbacks: function(context, callbacks) {
                "undefined" != typeof callbacks && (this.onConnectCallback = "function" == typeof callbacks.onConnect ? callbacks.onConnect : this.onConnectCallback, this.onDisconnectCallback = "function" == typeof callbacks.onDisconnect ? callbacks.onDisconnect : this.onDisconnectCallback, this.onDownCallback = "function" == typeof callbacks.onDown ? callbacks.onDown : this.onDownCallback, this.onUpCallback = "function" == typeof callbacks.onUp ? callbacks.onUp : this.onUpCallback, this.onAxisCallback = "function" == typeof callbacks.onAxis ? callbacks.onAxis : this.onAxisCallback, this.onFloatCallback = "function" == typeof callbacks.onFloat ? callbacks.onFloat : this.onFloatCallback, this.callbackContext = context)
            },
            start: function() {
                if (!this._active) {
                    this._active = !0;
                    var _this = this;
                    this._onGamepadConnected = function(event) {
                        return _this.onGamepadConnected(event)
                    }, this._onGamepadDisconnected = function(event) {
                        return _this.onGamepadDisconnected(event)
                    }, window.addEventListener("gamepadconnected", this._onGamepadConnected, !1), window.addEventListener("gamepaddisconnected", this._onGamepadDisconnected, !1)
                }
            },
            onGamepadConnected: function(event) {
                var newPad = event.gamepad;
                this._rawPads.push(newPad), this._gamepads[newPad.index].connect(newPad)
            },
            onGamepadDisconnected: function(event) {
                var removedPad = event.gamepad;
                for (var i in this._rawPads) this._rawPads[i].index === removedPad.index && this._rawPads.splice(i, 1);
                this._gamepads[removedPad.index].disconnect()
            },
            update: function() {
                this._pollGamepads(), this.pad1.pollStatus(), this.pad2.pollStatus(), this.pad3.pollStatus(), this.pad4.pollStatus()
            },
            _pollGamepads: function() {
                if (navigator.getGamepads) var rawGamepads = navigator.getGamepads();
                else if (navigator.webkitGetGamepads) var rawGamepads = navigator.webkitGetGamepads();
                else if (navigator.webkitGamepads) var rawGamepads = navigator.webkitGamepads();
                if (rawGamepads) {
                    this._rawPads = [];
                    for (var gamepadsChanged = !1, i = 0; i < rawGamepads.length && (typeof rawGamepads[i] !== this._prevRawGamepadTypes[i] && (gamepadsChanged = !0, this._prevRawGamepadTypes[i] = typeof rawGamepads[i]), rawGamepads[i] && this._rawPads.push(rawGamepads[i]), 3 !== i); i++);
                    if (gamepadsChanged) {
                        for (var singlePad, validConnections = {
                                rawIndices: {},
                                padIndices: {}
                            }, j = 0; j < this._gamepads.length; j++)
                            if (singlePad = this._gamepads[j], singlePad.connected)
                                for (var k = 0; k < this._rawPads.length; k++) this._rawPads[k].index === singlePad.index && (validConnections.rawIndices[singlePad.index] = !0, validConnections.padIndices[j] = !0);
                        for (var l = 0; l < this._gamepads.length; l++)
                            if (singlePad = this._gamepads[l], !validConnections.padIndices[l]) {
                                this._rawPads.length < 1 && singlePad.disconnect();
                                for (var m = 0; m < this._rawPads.length && !validConnections.padIndices[l]; m++) {
                                    var rawPad = this._rawPads[m];
                                    if (rawPad) {
                                        if (validConnections.rawIndices[rawPad.index]) {
                                            singlePad.disconnect();
                                            continue
                                        }
                                        singlePad.connect(rawPad), validConnections.rawIndices[rawPad.index] = !0, validConnections.padIndices[l] = !0
                                    } else singlePad.disconnect()
                                }
                            }
                    }
                }
            },
            setDeadZones: function(value) {
                for (var i = 0; i < this._gamepads.length; i++) this._gamepads[i].deadZone = value
            },
            stop: function() {
                this._active = !1, window.removeEventListener("gamepadconnected", this._onGamepadConnected), window.removeEventListener("gamepaddisconnected", this._onGamepadDisconnected)
            },
            reset: function() {
                this.update();
                for (var i = 0; i < this._gamepads.length; i++) this._gamepads[i].reset()
            },
            justPressed: function(buttonCode, duration) {
                for (var i = 0; i < this._gamepads.length; i++)
                    if (this._gamepads[i].justPressed(buttonCode, duration) === !0) return !0;
                return !1
            },
            justReleased: function(buttonCode, duration) {
                for (var i = 0; i < this._gamepads.length; i++)
                    if (this._gamepads[i].justReleased(buttonCode, duration) === !0) return !0;
                return !1
            },
            isDown: function(buttonCode) {
                for (var i = 0; i < this._gamepads.length; i++)
                    if (this._gamepads[i].isDown(buttonCode) === !0) return !0;
                return !1
            },
            destroy: function() {
                this.stop();
                for (var i = 0; i < this._gamepads.length; i++) this._gamepads[i].destroy()
            }
        }, Phaser.Gamepad.prototype.constructor = Phaser.Gamepad, Object.defineProperty(Phaser.Gamepad.prototype, "active", {
            get: function() {
                return this._active
            }
        }), Object.defineProperty(Phaser.Gamepad.prototype, "supported", {
            get: function() {
                return this._gamepadSupportAvailable
            }
        }), Object.defineProperty(Phaser.Gamepad.prototype, "padsConnected", {
            get: function() {
                return this._rawPads.length
            }
        }), Object.defineProperty(Phaser.Gamepad.prototype, "pad1", {
            get: function() {
                return this._gamepads[0]
            }
        }), Object.defineProperty(Phaser.Gamepad.prototype, "pad2", {
            get: function() {
                return this._gamepads[1]
            }
        }), Object.defineProperty(Phaser.Gamepad.prototype, "pad3", {
            get: function() {
                return this._gamepads[2]
            }
        }), Object.defineProperty(Phaser.Gamepad.prototype, "pad4", {
            get: function() {
                return this._gamepads[3]
            }
        }), Phaser.Gamepad.BUTTON_0 = 0, Phaser.Gamepad.BUTTON_1 = 1, Phaser.Gamepad.BUTTON_2 = 2, Phaser.Gamepad.BUTTON_3 = 3, Phaser.Gamepad.BUTTON_4 = 4, Phaser.Gamepad.BUTTON_5 = 5, Phaser.Gamepad.BUTTON_6 = 6, Phaser.Gamepad.BUTTON_7 = 7, Phaser.Gamepad.BUTTON_8 = 8, Phaser.Gamepad.BUTTON_9 = 9, Phaser.Gamepad.BUTTON_10 = 10, Phaser.Gamepad.BUTTON_11 = 11, Phaser.Gamepad.BUTTON_12 = 12, Phaser.Gamepad.BUTTON_13 = 13, Phaser.Gamepad.BUTTON_14 = 14, Phaser.Gamepad.BUTTON_15 = 15, Phaser.Gamepad.AXIS_0 = 0, Phaser.Gamepad.AXIS_1 = 1, Phaser.Gamepad.AXIS_2 = 2, Phaser.Gamepad.AXIS_3 = 3, Phaser.Gamepad.AXIS_4 = 4, Phaser.Gamepad.AXIS_5 = 5, Phaser.Gamepad.AXIS_6 = 6, Phaser.Gamepad.AXIS_7 = 7, Phaser.Gamepad.AXIS_8 = 8, Phaser.Gamepad.AXIS_9 = 9, Phaser.Gamepad.XBOX360_A = 0, Phaser.Gamepad.XBOX360_B = 1, Phaser.Gamepad.XBOX360_X = 2, Phaser.Gamepad.XBOX360_Y = 3, Phaser.Gamepad.XBOX360_LEFT_BUMPER = 4, Phaser.Gamepad.XBOX360_RIGHT_BUMPER = 5, Phaser.Gamepad.XBOX360_LEFT_TRIGGER = 6, Phaser.Gamepad.XBOX360_RIGHT_TRIGGER = 7, Phaser.Gamepad.XBOX360_BACK = 8, Phaser.Gamepad.XBOX360_START = 9, Phaser.Gamepad.XBOX360_STICK_LEFT_BUTTON = 10, Phaser.Gamepad.XBOX360_STICK_RIGHT_BUTTON = 11, Phaser.Gamepad.XBOX360_DPAD_LEFT = 14, Phaser.Gamepad.XBOX360_DPAD_RIGHT = 15, Phaser.Gamepad.XBOX360_DPAD_UP = 12, Phaser.Gamepad.XBOX360_DPAD_DOWN = 13, Phaser.Gamepad.XBOX360_STICK_LEFT_X = 0, Phaser.Gamepad.XBOX360_STICK_LEFT_Y = 1, Phaser.Gamepad.XBOX360_STICK_RIGHT_X = 2, Phaser.Gamepad.XBOX360_STICK_RIGHT_Y = 3, Phaser.Gamepad.PS3XC_X = 0, Phaser.Gamepad.PS3XC_CIRCLE = 1, Phaser.Gamepad.PS3XC_SQUARE = 2, Phaser.Gamepad.PS3XC_TRIANGLE = 3, Phaser.Gamepad.PS3XC_L1 = 4, Phaser.Gamepad.PS3XC_R1 = 5, Phaser.Gamepad.PS3XC_L2 = 6, Phaser.Gamepad.PS3XC_R2 = 7, Phaser.Gamepad.PS3XC_SELECT = 8, Phaser.Gamepad.PS3XC_START = 9, Phaser.Gamepad.PS3XC_STICK_LEFT_BUTTON = 10, Phaser.Gamepad.PS3XC_STICK_RIGHT_BUTTON = 11, Phaser.Gamepad.PS3XC_DPAD_UP = 12, Phaser.Gamepad.PS3XC_DPAD_DOWN = 13, Phaser.Gamepad.PS3XC_DPAD_LEFT = 14, Phaser.Gamepad.PS3XC_DPAD_RIGHT = 15, Phaser.Gamepad.PS3XC_STICK_LEFT_X = 0, Phaser.Gamepad.PS3XC_STICK_LEFT_Y = 1, Phaser.Gamepad.PS3XC_STICK_RIGHT_X = 2, Phaser.Gamepad.PS3XC_STICK_RIGHT_Y = 3, Phaser.SinglePad = function(game, padParent) {
            this.game = game, this.index = null, this.connected = !1, this.callbackContext = this, this.onConnectCallback = null, this.onDisconnectCallback = null, this.onDownCallback = null, this.onUpCallback = null, this.onAxisCallback = null, this.onFloatCallback = null, this.deadZone = .26, this._padParent = padParent, this._rawPad = null, this._prevTimestamp = null, this._buttons = [], this._buttonsLen = 0, this._axes = [], this._axesLen = 0
        }, Phaser.SinglePad.prototype = {
            addCallbacks: function(context, callbacks) {
                "undefined" != typeof callbacks && (this.onConnectCallback = "function" == typeof callbacks.onConnect ? callbacks.onConnect : this.onConnectCallback, this.onDisconnectCallback = "function" == typeof callbacks.onDisconnect ? callbacks.onDisconnect : this.onDisconnectCallback, this.onDownCallback = "function" == typeof callbacks.onDown ? callbacks.onDown : this.onDownCallback, this.onUpCallback = "function" == typeof callbacks.onUp ? callbacks.onUp : this.onUpCallback, this.onAxisCallback = "function" == typeof callbacks.onAxis ? callbacks.onAxis : this.onAxisCallback, this.onFloatCallback = "function" == typeof callbacks.onFloat ? callbacks.onFloat : this.onFloatCallback)
            },
            getButton: function(buttonCode) {
                return this._buttons[buttonCode] ? this._buttons[buttonCode] : null
            },
            pollStatus: function() {
                if (this.connected && this.game.input.enabled && this.game.input.gamepad.enabled && (!this._rawPad.timestamp || this._rawPad.timestamp !== this._prevTimestamp)) {
                    for (var i = 0; i < this._buttonsLen; i++) {
                        var rawButtonVal = isNaN(this._rawPad.buttons[i]) ? this._rawPad.buttons[i].value : this._rawPad.buttons[i];
                        rawButtonVal !== this._buttons[i].value && (1 === rawButtonVal ? this.processButtonDown(i, rawButtonVal) : 0 === rawButtonVal ? this.processButtonUp(i, rawButtonVal) : this.processButtonFloat(i, rawButtonVal))
                    }
                    for (var index = 0; index < this._axesLen; index++) {
                        var value = this._rawPad.axes[index];
                        value > 0 && value > this.deadZone || 0 > value && value < -this.deadZone ? this.processAxisChange(index, value) : this.processAxisChange(index, 0)
                    }
                    this._prevTimestamp = this._rawPad.timestamp
                }
            },
            connect: function(rawPad) {
                var triggerCallback = !this.connected;
                this.connected = !0, this.index = rawPad.index, this._rawPad = rawPad, this._buttons = [], this._buttonsLen = rawPad.buttons.length, this._axes = [], this._axesLen = rawPad.axes.length;
                for (var a = 0; a < this._axesLen; a++) this._axes[a] = rawPad.axes[a];
                for (var buttonCode in rawPad.buttons) buttonCode = parseInt(buttonCode, 10), this._buttons[buttonCode] = new Phaser.DeviceButton(this, buttonCode);
                triggerCallback && this._padParent.onConnectCallback && this._padParent.onConnectCallback.call(this._padParent.callbackContext, this.index), triggerCallback && this.onConnectCallback && this.onConnectCallback.call(this.callbackContext)
            },
            disconnect: function() {
                var triggerCallback = this.connected,
                    disconnectingIndex = this.index;
                this.connected = !1, this.index = null, this._rawPad = void 0;
                for (var i = 0; i < this._buttonsLen; i++) this._buttons[i].destroy();
                this._buttons = [], this._buttonsLen = 0, this._axes = [], this._axesLen = 0, triggerCallback && this._padParent.onDisconnectCallback && this._padParent.onDisconnectCallback.call(this._padParent.callbackContext, disconnectingIndex), triggerCallback && this.onDisconnectCallback && this.onDisconnectCallback.call(this.callbackContext)
            },
            destroy: function() {
                this._rawPad = void 0;
                for (var i = 0; i < this._buttonsLen; i++) this._buttons[i].destroy();
                this._buttons = [], this._buttonsLen = 0, this._axes = [], this._axesLen = 0, this.onConnectCallback = null, this.onDisconnectCallback = null, this.onDownCallback = null, this.onUpCallback = null, this.onAxisCallback = null, this.onFloatCallback = null
            },
            processAxisChange: function(index, value) {
                this._axes[index] !== value && (this._axes[index] = value, this._padParent.onAxisCallback && this._padParent.onAxisCallback.call(this._padParent.callbackContext, this, index, value), this.onAxisCallback && this.onAxisCallback.call(this.callbackContext, this, index, value))
            },
            processButtonDown: function(buttonCode, value) {
                this._padParent.onDownCallback && this._padParent.onDownCallback.call(this._padParent.callbackContext, buttonCode, value, this.index), this.onDownCallback && this.onDownCallback.call(this.callbackContext, buttonCode, value), this._buttons[buttonCode] && this._buttons[buttonCode].start(null, value)
            },
            processButtonUp: function(buttonCode, value) {
                this._padParent.onUpCallback && this._padParent.onUpCallback.call(this._padParent.callbackContext, buttonCode, value, this.index), this.onUpCallback && this.onUpCallback.call(this.callbackContext, buttonCode, value), this._buttons[buttonCode] && this._buttons[buttonCode].stop(null, value)
            },
            processButtonFloat: function(buttonCode, value) {
                this._padParent.onFloatCallback && this._padParent.onFloatCallback.call(this._padParent.callbackContext, buttonCode, value, this.index), this.onFloatCallback && this.onFloatCallback.call(this.callbackContext, buttonCode, value), this._buttons[buttonCode] && this._buttons[buttonCode].padFloat(value)
            },
            axis: function(axisCode) {
                return this._axes[axisCode] ? this._axes[axisCode] : !1
            },
            isDown: function(buttonCode) {
                return this._buttons[buttonCode] ? this._buttons[buttonCode].isDown : !1
            },
            isUp: function(buttonCode) {
                return this._buttons[buttonCode] ? this._buttons[buttonCode].isUp : !1
            },
            justReleased: function(buttonCode, duration) {
                return this._buttons[buttonCode] ? this._buttons[buttonCode].justReleased(duration) : void 0
            },
            justPressed: function(buttonCode, duration) {
                return this._buttons[buttonCode] ? this._buttons[buttonCode].justPressed(duration) : void 0
            },
            buttonValue: function(buttonCode) {
                return this._buttons[buttonCode] ? this._buttons[buttonCode].value : null
            },
            reset: function() {
                for (var j = 0; j < this._axes.length; j++) this._axes[j] = 0
            }
        }, Phaser.SinglePad.prototype.constructor = Phaser.SinglePad, Phaser.Key = function(game, keycode) {
            this.game = game, this._enabled = !0, this.event = null, this.isDown = !1, this.isUp = !0, this.altKey = !1, this.ctrlKey = !1, this.shiftKey = !1, this.timeDown = 0, this.duration = 0, this.timeUp = -2500, this.repeats = 0, this.keyCode = keycode, this.onDown = new Phaser.Signal, this.onHoldCallback = null, this.onHoldContext = null, this.onUp = new Phaser.Signal, this._justDown = !1, this._justUp = !1
        }, Phaser.Key.prototype = {
            update: function() {
                this._enabled && this.isDown && (this.duration = this.game.time.time - this.timeDown, this.repeats++, this.onHoldCallback && this.onHoldCallback.call(this.onHoldContext, this))
            },
            processKeyDown: function(event) {
                this._enabled && (this.event = event, this.isDown || (this.altKey = event.altKey, this.ctrlKey = event.ctrlKey, this.shiftKey = event.shiftKey, this.isDown = !0, this.isUp = !1, this.timeDown = this.game.time.time, this.duration = 0, this.repeats = 0, this._justDown = !0, this.onDown.dispatch(this)))
            },
            processKeyUp: function(event) {
                this._enabled && (this.event = event, this.isUp || (this.isDown = !1, this.isUp = !0, this.timeUp = this.game.time.time, this.duration = this.game.time.time - this.timeDown, this._justUp = !0, this.onUp.dispatch(this)))
            },
            reset: function(hard) {
                void 0 === hard && (hard = !0), this.isDown = !1, this.isUp = !0, this.timeUp = this.game.time.time, this.duration = 0, this._enabled = !0, this._justDown = !1, this._justUp = !1, hard && (this.onDown.removeAll(), this.onUp.removeAll(), this.onHoldCallback = null, this.onHoldContext = null)
            },
            downDuration: function(duration) {
                return void 0 === duration && (duration = 50), this.isDown && this.duration < duration
            },
            upDuration: function(duration) {
                return void 0 === duration && (duration = 50), !this.isDown && this.game.time.time - this.timeUp < duration
            }
        }, Object.defineProperty(Phaser.Key.prototype, "justDown", {
            get: function() {
                var current = this._justDown;
                return this._justDown = !1, current
            }
        }), Object.defineProperty(Phaser.Key.prototype, "justUp", {
            get: function() {
                var current = this._justUp;
                return this._justUp = !1, current
            }
        }), Object.defineProperty(Phaser.Key.prototype, "enabled", {
            get: function() {
                return this._enabled
            },
            set: function(value) {
                value = !!value, value !== this._enabled && (value || this.reset(!1), this._enabled = value)
            }
        }), Phaser.Key.prototype.constructor = Phaser.Key, Phaser.Keyboard = function(game) {
            this.game = game, this.enabled = !0, this.event = null, this.pressEvent = null, this.callbackContext = this, this.onDownCallback = null, this.onPressCallback = null, this.onUpCallback = null, this._keys = [], this._capture = [], this._onKeyDown = null, this._onKeyPress = null, this._onKeyUp = null, this._i = 0, this._k = 0
        }, Phaser.Keyboard.prototype = {
            addCallbacks: function(context, onDown, onUp, onPress) {
                this.callbackContext = context, void 0 !== onDown && null !== onDown && (this.onDownCallback = onDown), void 0 !== onUp && null !== onUp && (this.onUpCallback = onUp), void 0 !== onPress && null !== onPress && (this.onPressCallback = onPress)
            },
            addKey: function(keycode) {
                return this._keys[keycode] || (this._keys[keycode] = new Phaser.Key(this.game, keycode), this.addKeyCapture(keycode)), this._keys[keycode]
            },
            addKeys: function(keys) {
                var output = {};
                for (var key in keys) output[key] = this.addKey(keys[key]);
                return output
            },
            removeKey: function(keycode) {
                this._keys[keycode] && (this._keys[keycode] = null, this.removeKeyCapture(keycode))
            },
            createCursorKeys: function() {
                return this.addKeys({
                    up: Phaser.KeyCode.UP,
                    down: Phaser.KeyCode.DOWN,
                    left: Phaser.KeyCode.LEFT,
                    right: Phaser.KeyCode.RIGHT
                })
            },
            start: function() {
                if (!this.game.device.cocoonJS && null === this._onKeyDown) {
                    var _this = this;
                    this._onKeyDown = function(event) {
                        return _this.processKeyDown(event)
                    }, this._onKeyUp = function(event) {
                        return _this.processKeyUp(event)
                    }, this._onKeyPress = function(event) {
                        return _this.processKeyPress(event)
                    }, window.addEventListener("keydown", this._onKeyDown, !1), window.addEventListener("keyup", this._onKeyUp, !1), window.addEventListener("keypress", this._onKeyPress, !1)
                }
            },
            stop: function() {
                window.removeEventListener("keydown", this._onKeyDown), window.removeEventListener("keyup", this._onKeyUp), window.removeEventListener("keypress", this._onKeyPress), this._onKeyDown = null, this._onKeyUp = null, this._onKeyPress = null
            },
            destroy: function() {
                this.stop(), this.clearCaptures(), this._keys.length = 0, this._i = 0
            },
            addKeyCapture: function(keycode) {
                if ("object" == typeof keycode)
                    for (var key in keycode) this._capture[keycode[key]] = !0;
                else this._capture[keycode] = !0
            },
            removeKeyCapture: function(keycode) {
                delete this._capture[keycode]
            },
            clearCaptures: function() {
                this._capture = {}
            },
            update: function() {
                for (this._i = this._keys.length; this._i--;) this._keys[this._i] && this._keys[this._i].update()
            },
            processKeyDown: function(event) {
                this.event = event, this.game.input.enabled && this.enabled && (this._capture[event.keyCode] && event.preventDefault(), this._keys[event.keyCode] || (this._keys[event.keyCode] = new Phaser.Key(this.game, event.keyCode)), this._keys[event.keyCode].processKeyDown(event), this._k = event.keyCode, this.onDownCallback && this.onDownCallback.call(this.callbackContext, event))
            },
            processKeyPress: function(event) {
                this.pressEvent = event, this.game.input.enabled && this.enabled && this.onPressCallback && this.onPressCallback.call(this.callbackContext, String.fromCharCode(event.charCode), event)
            },
            processKeyUp: function(event) {
                this.event = event, this.game.input.enabled && this.enabled && (this._capture[event.keyCode] && event.preventDefault(), this._keys[event.keyCode] || (this._keys[event.keyCode] = new Phaser.Key(this.game, event.keyCode)), this._keys[event.keyCode].processKeyUp(event), this.onUpCallback && this.onUpCallback.call(this.callbackContext, event))
            },
            reset: function(hard) {
                void 0 === hard && (hard = !0), this.event = null;
                for (var i = this._keys.length; i--;) this._keys[i] && this._keys[i].reset(hard)
            },
            downDuration: function(keycode, duration) {
                return this._keys[keycode] ? this._keys[keycode].downDuration(duration) : null
            },
            upDuration: function(keycode, duration) {
                return this._keys[keycode] ? this._keys[keycode].upDuration(duration) : null
            },
            isDown: function(keycode) {
                return this._keys[keycode] ? this._keys[keycode].isDown : null
            }
        }, Object.defineProperty(Phaser.Keyboard.prototype, "lastChar", {
            get: function() {
                return 32 === this.event.charCode ? "" : String.fromCharCode(this.pressEvent.charCode)
            }
        }), Object.defineProperty(Phaser.Keyboard.prototype, "lastKey", {
            get: function() {
                return this._keys[this._k]
            }
        }), Phaser.Keyboard.prototype.constructor = Phaser.Keyboard, Phaser.KeyCode = {
            A: "A".charCodeAt(0),
            B: "B".charCodeAt(0),
            C: "C".charCodeAt(0),
            D: "D".charCodeAt(0),
            E: "E".charCodeAt(0),
            F: "F".charCodeAt(0),
            G: "G".charCodeAt(0),
            H: "H".charCodeAt(0),
            I: "I".charCodeAt(0),
            J: "J".charCodeAt(0),
            K: "K".charCodeAt(0),
            L: "L".charCodeAt(0),
            M: "M".charCodeAt(0),
            N: "N".charCodeAt(0),
            O: "O".charCodeAt(0),
            P: "P".charCodeAt(0),
            Q: "Q".charCodeAt(0),
            R: "R".charCodeAt(0),
            S: "S".charCodeAt(0),
            T: "T".charCodeAt(0),
            U: "U".charCodeAt(0),
            V: "V".charCodeAt(0),
            W: "W".charCodeAt(0),
            X: "X".charCodeAt(0),
            Y: "Y".charCodeAt(0),
            Z: "Z".charCodeAt(0),
            ZERO: "0".charCodeAt(0),
            ONE: "1".charCodeAt(0),
            TWO: "2".charCodeAt(0),
            THREE: "3".charCodeAt(0),
            FOUR: "4".charCodeAt(0),
            FIVE: "5".charCodeAt(0),
            SIX: "6".charCodeAt(0),
            SEVEN: "7".charCodeAt(0),
            EIGHT: "8".charCodeAt(0),
            NINE: "9".charCodeAt(0),
            NUMPAD_0: 96,
            NUMPAD_1: 97,
            NUMPAD_2: 98,
            NUMPAD_3: 99,
            NUMPAD_4: 100,
            NUMPAD_5: 101,
            NUMPAD_6: 102,
            NUMPAD_7: 103,
            NUMPAD_8: 104,
            NUMPAD_9: 105,
            NUMPAD_MULTIPLY: 106,
            NUMPAD_ADD: 107,
            NUMPAD_ENTER: 108,
            NUMPAD_SUBTRACT: 109,
            NUMPAD_DECIMAL: 110,
            NUMPAD_DIVIDE: 111,
            F1: 112,
            F2: 113,
            F3: 114,
            F4: 115,
            F5: 116,
            F6: 117,
            F7: 118,
            F8: 119,
            F9: 120,
            F10: 121,
            F11: 122,
            F12: 123,
            F13: 124,
            F14: 125,
            F15: 126,
            COLON: 186,
            EQUALS: 187,
            COMMA: 188,
            UNDERSCORE: 189,
            PERIOD: 190,
            QUESTION_MARK: 191,
            TILDE: 192,
            OPEN_BRACKET: 219,
            BACKWARD_SLASH: 220,
            CLOSED_BRACKET: 221,
            QUOTES: 222,
            BACKSPACE: 8,
            TAB: 9,
            CLEAR: 12,
            ENTER: 13,
            SHIFT: 16,
            CONTROL: 17,
            ALT: 18,
            CAPS_LOCK: 20,
            ESC: 27,
            SPACEBAR: 32,
            PAGE_UP: 33,
            PAGE_DOWN: 34,
            END: 35,
            HOME: 36,
            LEFT: 37,
            UP: 38,
            RIGHT: 39,
            DOWN: 40,
            PLUS: 43,
            MINUS: 44,
            INSERT: 45,
            DELETE: 46,
            HELP: 47,
            NUM_LOCK: 144
        };
        for (var key in Phaser.KeyCode) Phaser.KeyCode.hasOwnProperty(key) && !key.match(/[a-z]/) && (Phaser.Keyboard[key] = Phaser.KeyCode[key]);
        Phaser.Component = function() {}, Phaser.Component.Angle = function() {}, Phaser.Component.Angle.prototype = {
            angle: {
                get: function() {
                    return Phaser.Math.wrapAngle(Phaser.Math.radToDeg(this.rotation))
                },
                set: function(value) {
                    this.rotation = Phaser.Math.degToRad(Phaser.Math.wrapAngle(value))
                }
            }
        }, Phaser.Component.Animation = function() {}, Phaser.Component.Animation.prototype = {
            play: function(name, frameRate, loop, killOnComplete) {
                return this.animations ? this.animations.play(name, frameRate, loop, killOnComplete) : void 0
            }
        }, Phaser.Component.AutoCull = function() {}, Phaser.Component.AutoCull.prototype = {
            autoCull: !1,
            inCamera: {
                get: function() {
                    return this.autoCull || this.checkWorldBounds || (this._bounds.copyFrom(this.getBounds()), this._bounds.x += this.game.camera.view.x, this._bounds.y += this.game.camera.view.y), this.game.world.camera.view.intersects(this._bounds)
                }
            }
        }, Phaser.Component.Bounds = function() {}, Phaser.Component.Bounds.prototype = {
            offsetX: {
                get: function() {
                    return this.anchor.x * this.width
                }
            },
            offsetY: {
                get: function() {
                    return this.anchor.y * this.height
                }
            },
            left: {
                get: function() {
                    return this.x - this.offsetX
                }
            },
            right: {
                get: function() {
                    return this.x + this.width - this.offsetX
                }
            },
            top: {
                get: function() {
                    return this.y - this.offsetY
                }
            },
            bottom: {
                get: function() {
                    return this.y + this.height - this.offsetY
                }
            }
        }, Phaser.Component.BringToTop = function() {}, Phaser.Component.BringToTop.prototype.bringToTop = function() {
            return this.parent && this.parent.bringToTop(this), this
        }, Phaser.Component.BringToTop.prototype.sendToBack = function() {
            return this.parent && this.parent.sendToBack(this), this
        }, Phaser.Component.BringToTop.prototype.moveUp = function() {
            return this.parent && this.parent.moveUp(this), this
        }, Phaser.Component.BringToTop.prototype.moveDown = function() {
            return this.parent && this.parent.moveDown(this), this
        }, Phaser.Component.Core = function() {}, Phaser.Component.Core.install = function(components) {
            Phaser.Utils.mixinPrototype(this, Phaser.Component.Core.prototype), this.components = {};
            for (var i = 0; i < components.length; i++) {
                var id = components[i],
                    replace = !1;
                "Destroy" === id && (replace = !0), Phaser.Utils.mixinPrototype(this, Phaser.Component[id].prototype, replace), this.components[id] = !0
            }
        }, Phaser.Component.Core.init = function(game, x, y, key, frame) {
            this.game = game, this.key = key, this.position.set(x, y), this.world = new Phaser.Point(x, y), this.previousPosition = new Phaser.Point(x, y), this.events = new Phaser.Events(this), this._bounds = new Phaser.Rectangle, this.components.PhysicsBody && (this.body = this.body), this.components.Animation && (this.animations = new Phaser.AnimationManager(this)), this.components.LoadTexture && null !== key && this.loadTexture(key, frame), this.components.FixedToCamera && (this.cameraOffset = new Phaser.Point(x, y))
        }, Phaser.Component.Core.preUpdate = function() {
            if (this.pendingDestroy) return void this.destroy();
            if (this.previousPosition.set(this.world.x, this.world.y), this.previousRotation = this.rotation, !this.exists || !this.parent.exists) return this.renderOrderID = -1, !1;
            this.world.setTo(this.game.camera.x + this.worldTransform.tx, this.game.camera.y + this.worldTransform.ty), this.visible && (this.renderOrderID = this.game.stage.currentRenderOrderID++), this.texture && (this.texture.requiresReTint = !1), this.animations && this.animations.update(), this.body && this.body.preUpdate();
            for (var i = 0; i < this.children.length; i++) this.children[i].preUpdate();
            return !0
        }, Phaser.Component.Core.prototype = {
            game: null,
            name: "",
            components: {},
            z: 0,
            events: void 0,
            animations: void 0,
            key: "",
            world: null,
            debug: !1,
            previousPosition: null,
            previousRotation: 0,
            renderOrderID: 0,
            fresh: !0,
            pendingDestroy: !1,
            _bounds: null,
            _exists: !0,
            exists: {
                get: function() {
                    return this._exists
                },
                set: function(value) {
                    value ? (this._exists = !0, this.body && this.body.type === Phaser.Physics.P2JS && this.body.addToWorld(), this.visible = !0) : (this._exists = !1, this.body && this.body.type === Phaser.Physics.P2JS && this.body.removeFromWorld(), this.visible = !1)
                }
            },
            update: function() {},
            postUpdate: function() {
                this.customRender && this.key.render(), this.components.PhysicsBody && Phaser.Component.PhysicsBody.postUpdate.call(this), this.components.FixedToCamera && Phaser.Component.FixedToCamera.postUpdate.call(this);
                for (var i = 0; i < this.children.length; i++) this.children[i].postUpdate()
            }
        }, Phaser.Component.Crop = function() {}, Phaser.Component.Crop.prototype = {
            cropRect: null,
            _crop: null,
            crop: function(rect, copy) {
                void 0 === copy && (copy = !1), rect ? (copy && null !== this.cropRect ? this.cropRect.setTo(rect.x, rect.y, rect.width, rect.height) : copy && null === this.cropRect ? this.cropRect = new Phaser.Rectangle(rect.x, rect.y, rect.width, rect.height) : this.cropRect = rect,
                    this.updateCrop()) : (this._crop = null, this.cropRect = null, this.resetFrame())
            },
            updateCrop: function() {
                if (this.cropRect) {
                    this._crop = Phaser.Rectangle.clone(this.cropRect, this._crop), this._crop.x += this._frame.x, this._crop.y += this._frame.y;
                    var cx = Math.max(this._frame.x, this._crop.x),
                        cy = Math.max(this._frame.y, this._crop.y),
                        cw = Math.min(this._frame.right, this._crop.right) - cx,
                        ch = Math.min(this._frame.bottom, this._crop.bottom) - cy;
                    this.texture.crop.x = cx, this.texture.crop.y = cy, this.texture.crop.width = cw, this.texture.crop.height = ch, this.texture.frame.width = Math.min(cw, this.cropRect.width), this.texture.frame.height = Math.min(ch, this.cropRect.height), this.texture.width = this.texture.frame.width, this.texture.height = this.texture.frame.height, this.texture._updateUvs()
                }
            }
        }, Phaser.Component.Delta = function() {}, Phaser.Component.Delta.prototype = {
            deltaX: {
                get: function() {
                    return this.world.x - this.previousPosition.x
                }
            },
            deltaY: {
                get: function() {
                    return this.world.y - this.previousPosition.y
                }
            },
            deltaZ: {
                get: function() {
                    return this.rotation - this.previousRotation
                }
            }
        }, Phaser.Component.Destroy = function() {}, Phaser.Component.Destroy.prototype = {
            destroyPhase: !1,
            destroy: function(destroyChildren) {
                if (null !== this.game && !this.destroyPhase) {
                    void 0 === destroyChildren && (destroyChildren = !0), this.destroyPhase = !0, this.events && this.events.onDestroy$dispatch(this), this.parent && (this.parent instanceof Phaser.Group ? this.parent.remove(this) : this.parent.removeChild(this)), this.input && this.input.destroy(), this.animations && this.animations.destroy(), this.body && this.body.destroy(), this.events && this.events.destroy();
                    var i = this.children.length;
                    if (destroyChildren)
                        for (; i--;) this.children[i].destroy(destroyChildren);
                    else
                        for (; i--;) this.removeChild(this.children[i]);
                    this._crop && (this._crop = null), this._frame && (this._frame = null), Phaser.Video && this.key instanceof Phaser.Video && this.key.onChangeSource.remove(this.resizeFrame, this), Phaser.BitmapText && this._glyphs && (this._glyphs = []), this.alive = !1, this.exists = !1, this.visible = !1, this.filters = null, this.mask = null, this.game = null, this.renderable = !1, this.transformCallback && (this.transformCallback = null, this.transformCallbackContext = null), this.hitArea = null, this.parent = null, this.stage = null, this.worldTransform = null, this.filterArea = null, this._bounds = null, this._currentBounds = null, this._mask = null, this._destroyCachedSprite(), this.destroyPhase = !1, this.pendingDestroy = !1
                }
            }
        }, Phaser.Events = function(sprite) {
            this.parent = sprite
        }, Phaser.Events.prototype = {
            destroy: function() {
                this._parent = null, this._onDestroy && this._onDestroy.dispose(), this._onAddedToGroup && this._onAddedToGroup.dispose(), this._onRemovedFromGroup && this._onRemovedFromGroup.dispose(), this._onRemovedFromWorld && this._onRemovedFromWorld.dispose(), this._onKilled && this._onKilled.dispose(), this._onRevived && this._onRevived.dispose(), this._onEnterBounds && this._onEnterBounds.dispose(), this._onOutOfBounds && this._onOutOfBounds.dispose(), this._onInputOver && this._onInputOver.dispose(), this._onInputOut && this._onInputOut.dispose(), this._onInputDown && this._onInputDown.dispose(), this._onInputUp && this._onInputUp.dispose(), this._onDragStart && this._onDragStart.dispose(), this._onDragUpdate && this._onDragUpdate.dispose(), this._onDragStop && this._onDragStop.dispose(), this._onAnimationStart && this._onAnimationStart.dispose(), this._onAnimationComplete && this._onAnimationComplete.dispose(), this._onAnimationLoop && this._onAnimationLoop.dispose()
            },
            onAddedToGroup: null,
            onRemovedFromGroup: null,
            onRemovedFromWorld: null,
            onDestroy: null,
            onKilled: null,
            onRevived: null,
            onOutOfBounds: null,
            onEnterBounds: null,
            onInputOver: null,
            onInputOut: null,
            onInputDown: null,
            onInputUp: null,
            onDragStart: null,
            onDragUpdate: null,
            onDragStop: null,
            onAnimationStart: null,
            onAnimationComplete: null,
            onAnimationLoop: null
        }, Phaser.Events.prototype.constructor = Phaser.Events;
        for (var prop in Phaser.Events.prototype) Phaser.Events.prototype.hasOwnProperty(prop) && 0 === prop.indexOf("on") && null === Phaser.Events.prototype[prop] && ! function(prop, backing) {
            "use strict";
            Object.defineProperty(Phaser.Events.prototype, prop, {
                get: function() {
                    return this[backing] || (this[backing] = new Phaser.Signal)
                }
            }), Phaser.Events.prototype[prop + "$dispatch"] = function() {
                return this[backing] ? this[backing].dispatch.apply(this[backing], arguments) : null
            }
        }(prop, "_" + prop);
        Phaser.Component.FixedToCamera = function() {}, Phaser.Component.FixedToCamera.postUpdate = function() {
            this.fixedToCamera && (this.position.x = (this.game.camera.view.x + this.cameraOffset.x) / this.game.camera.scale.x, this.position.y = (this.game.camera.view.y + this.cameraOffset.y) / this.game.camera.scale.y)
        }, Phaser.Component.FixedToCamera.prototype = {
            _fixedToCamera: !1,
            fixedToCamera: {
                get: function() {
                    return this._fixedToCamera
                },
                set: function(value) {
                    value ? (this._fixedToCamera = !0, this.cameraOffset.set(this.x, this.y)) : this._fixedToCamera = !1
                }
            },
            cameraOffset: new Phaser.Point
        }, Phaser.Component.Health = function() {}, Phaser.Component.Health.prototype = {
            health: 1,
            maxHealth: 100,
            damage: function(amount) {
                return this.alive && (this.health -= amount, this.health <= 0 && this.kill()), this
            },
            heal: function(amount) {
                return this.alive && (this.health += amount, this.health > this.maxHealth && (this.health = this.maxHealth)), this
            }
        }, Phaser.Component.InCamera = function() {}, Phaser.Component.InCamera.prototype = {
            inCamera: {
                get: function() {
                    return this.game.world.camera.view.intersects(this._bounds)
                }
            }
        }, Phaser.Component.InputEnabled = function() {}, Phaser.Component.InputEnabled.prototype = {
            input: null,
            inputEnabled: {
                get: function() {
                    return this.input && this.input.enabled
                },
                set: function(value) {
                    value ? null === this.input ? (this.input = new Phaser.InputHandler(this), this.input.start()) : this.input && !this.input.enabled && this.input.start() : this.input && this.input.enabled && this.input.stop()
                }
            }
        }, Phaser.Component.InWorld = function() {}, Phaser.Component.InWorld.preUpdate = function() {
            if ((this.autoCull || this.checkWorldBounds) && (this._bounds.copyFrom(this.getBounds()), this._bounds.x += this.game.camera.view.x, this._bounds.y += this.game.camera.view.y, this.autoCull && (this.game.world.camera.view.intersects(this._bounds) ? (this.renderable = !0, this.game.world.camera.totalInView++) : this.renderable = !1), this.checkWorldBounds))
                if (this._outOfBoundsFired && this.game.world.bounds.intersects(this._bounds)) this._outOfBoundsFired = !1, this.events.onEnterBounds$dispatch(this);
                else if (!this._outOfBoundsFired && !this.game.world.bounds.intersects(this._bounds) && (this._outOfBoundsFired = !0, this.events.onOutOfBounds$dispatch(this), this.outOfBoundsKill)) return this.kill(), !1;
            return !0
        }, Phaser.Component.InWorld.prototype = {
            checkWorldBounds: !1,
            outOfBoundsKill: !1,
            _outOfBoundsFired: !1,
            inWorld: {
                get: function() {
                    return this.game.world.bounds.intersects(this.getBounds())
                }
            }
        }, Phaser.Component.LifeSpan = function() {}, Phaser.Component.LifeSpan.preUpdate = function() {
            return this.lifespan > 0 && (this.lifespan -= this.game.time.physicsElapsedMS, this.lifespan <= 0) ? (this.kill(), !1) : !0
        }, Phaser.Component.LifeSpan.prototype = {
            alive: !0,
            lifespan: 0,
            revive: function(health) {
                return void 0 === health && (health = 1), this.alive = !0, this.exists = !0, this.visible = !0, "function" == typeof this.heal && this.heal(health), this.events && this.events.onRevived$dispatch(this), this
            },
            kill: function() {
                return this.alive = !1, this.exists = !1, this.visible = !1, this.events && this.events.onKilled$dispatch(this), this
            }
        }, Phaser.Component.LoadTexture = function() {}, Phaser.Component.LoadTexture.prototype = {
            customRender: !1,
            _frame: null,
            loadTexture: function(key, frame, stopAnimation) {
                frame = frame || 0, (stopAnimation || void 0 === stopAnimation) && this.animations && this.animations.stop(), this.key = key, this.customRender = !1;
                var cache = this.game.cache,
                    setFrame = !0,
                    smoothed = !this.texture.baseTexture.scaleMode;
                if (Phaser.RenderTexture && key instanceof Phaser.RenderTexture) this.key = key.key, this.setTexture(key);
                else if (Phaser.BitmapData && key instanceof Phaser.BitmapData) this.customRender = !0, this.setTexture(key.texture), cache.hasFrameData(key.key, Phaser.Cache.BITMAPDATA) && (setFrame = !this.animations.loadFrameData(cache.getFrameData(key.key, Phaser.Cache.BITMAPDATA), frame));
                else if (Phaser.Video && key instanceof Phaser.Video) {
                    this.customRender = !0;
                    var valid = key.texture.valid;
                    this.setTexture(key.texture), this.setFrame(key.texture.frame.clone()), key.onChangeSource.add(this.resizeFrame, this), this.texture.valid = valid
                } else if (key instanceof PIXI.Texture) this.setTexture(key);
                else {
                    var img = cache.getImage(key, !0);
                    this.key = img.key, this.setTexture(new PIXI.Texture(img.base)), setFrame = !this.animations.loadFrameData(img.frameData, frame)
                }
                setFrame && (this._frame = Phaser.Rectangle.clone(this.texture.frame)), smoothed || (this.texture.baseTexture.scaleMode = 1)
            },
            setFrame: function(frame) {
                this._frame = frame, this.texture.frame.x = frame.x, this.texture.frame.y = frame.y, this.texture.frame.width = frame.width, this.texture.frame.height = frame.height, this.texture.crop.x = frame.x, this.texture.crop.y = frame.y, this.texture.crop.width = frame.width, this.texture.crop.height = frame.height, frame.trimmed ? (this.texture.trim ? (this.texture.trim.x = frame.spriteSourceSizeX, this.texture.trim.y = frame.spriteSourceSizeY, this.texture.trim.width = frame.sourceSizeW, this.texture.trim.height = frame.sourceSizeH) : this.texture.trim = {
                    x: frame.spriteSourceSizeX,
                    y: frame.spriteSourceSizeY,
                    width: frame.sourceSizeW,
                    height: frame.sourceSizeH
                }, this.texture.width = frame.sourceSizeW, this.texture.height = frame.sourceSizeH, this.texture.frame.width = frame.sourceSizeW, this.texture.frame.height = frame.sourceSizeH) : !frame.trimmed && this.texture.trim && (this.texture.trim = null), this.cropRect && this.updateCrop(), this.texture.requiresReTint = !0, this.texture._updateUvs(), this.tilingTexture && (this.refreshTexture = !0)
            },
            resizeFrame: function(parent, width, height) {
                this.texture.frame.resize(width, height), this.texture.setFrame(this.texture.frame)
            },
            resetFrame: function() {
                this._frame && this.setFrame(this._frame)
            },
            frame: {
                get: function() {
                    return this.animations.frame
                },
                set: function(value) {
                    this.animations.frame = value
                }
            },
            frameName: {
                get: function() {
                    return this.animations.frameName
                },
                set: function(value) {
                    this.animations.frameName = value
                }
            }
        }, Phaser.Component.Overlap = function() {}, Phaser.Component.Overlap.prototype = {
            overlap: function(displayObject) {
                return Phaser.Rectangle.intersects(this.getBounds(), displayObject.getBounds())
            }
        }, Phaser.Component.PhysicsBody = function() {}, Phaser.Component.PhysicsBody.preUpdate = function() {
            return this.fresh && this.exists ? (this.world.setTo(this.parent.position.x + this.position.x, this.parent.position.y + this.position.y), this.worldTransform.tx = this.world.x, this.worldTransform.ty = this.world.y, this.previousPosition.set(this.world.x, this.world.y), this.previousRotation = this.rotation, this.body && this.body.preUpdate(), this.fresh = !1, !1) : (this.previousPosition.set(this.world.x, this.world.y), this.previousRotation = this.rotation, this._exists && this.parent.exists ? !0 : (this.renderOrderID = -1, !1))
        }, Phaser.Component.PhysicsBody.postUpdate = function() {
            this.exists && this.body && this.body.postUpdate()
        }, Phaser.Component.PhysicsBody.prototype = {
            body: null,
            x: {
                get: function() {
                    return this.position.x
                },
                set: function(value) {
                    this.position.x = value, this.body && !this.body.dirty && (this.body._reset = !0)
                }
            },
            y: {
                get: function() {
                    return this.position.y
                },
                set: function(value) {
                    this.position.y = value, this.body && !this.body.dirty && (this.body._reset = !0)
                }
            }
        }, Phaser.Component.Reset = function() {}, Phaser.Component.Reset.prototype.reset = function(x, y, health) {
            return void 0 === health && (health = 1), this.world.set(x, y), this.position.set(x, y), this.fresh = !0, this.exists = !0, this.visible = !0, this.renderable = !0, this.components.InWorld && (this._outOfBoundsFired = !1), this.components.LifeSpan && (this.alive = !0, this.health = health), this.components.PhysicsBody && this.body && this.body.reset(x, y, !1, !1), this
        }, Phaser.Component.ScaleMinMax = function() {}, Phaser.Component.ScaleMinMax.prototype = {
            transformCallback: null,
            transformCallbackContext: this,
            scaleMin: null,
            scaleMax: null,
            checkTransform: function(wt) {
                this.scaleMin && (wt.a < this.scaleMin.x && (wt.a = this.scaleMin.x), wt.d < this.scaleMin.y && (wt.d = this.scaleMin.y)), this.scaleMax && (wt.a > this.scaleMax.x && (wt.a = this.scaleMax.x), wt.d > this.scaleMax.y && (wt.d = this.scaleMax.y))
            },
            setScaleMinMax: function(minX, minY, maxX, maxY) {
                void 0 === minY ? minY = maxX = maxY = minX : void 0 === maxX && (maxX = maxY = minY, minY = minX), null === minX ? this.scaleMin = null : this.scaleMin ? this.scaleMin.set(minX, minY) : this.scaleMin = new Phaser.Point(minX, minY), null === maxX ? this.scaleMax = null : this.scaleMax ? this.scaleMax.set(maxX, maxY) : this.scaleMax = new Phaser.Point(maxX, maxY), null === this.scaleMin ? this.transformCallback = null : (this.transformCallback = this.checkTransform, this.transformCallbackContext = this)
            }
        }, Phaser.Component.Smoothed = function() {}, Phaser.Component.Smoothed.prototype = {
            smoothed: {
                get: function() {
                    return !this.texture.baseTexture.scaleMode
                },
                set: function(value) {
                    value ? this.texture && (this.texture.baseTexture.scaleMode = 0) : this.texture && (this.texture.baseTexture.scaleMode = 1)
                }
            }
        }, Phaser.GameObjectFactory = function(game) {
            this.game = game, this.world = this.game.world
        }, Phaser.GameObjectFactory.prototype = {
            existing: function(object) {
                return this.world.add(object)
            },
            image: function(x, y, key, frame, group) {
                return void 0 === group && (group = this.world), group.add(new Phaser.Image(this.game, x, y, key, frame))
            },
            sprite: function(x, y, key, frame, group) {
                return void 0 === group && (group = this.world), group.create(x, y, key, frame)
            },
            creature: function(x, y, key, mesh, group) {
                void 0 === group && (group = this.world);
                var obj = new Phaser.Creature(this.game, x, y, key, mesh);
                return group.add(obj), obj
            },
            tween: function(object) {
                return this.game.tweens.create(object)
            },
            group: function(parent, name, addToStage, enableBody, physicsBodyType) {
                return new Phaser.Group(this.game, parent, name, addToStage, enableBody, physicsBodyType)
            },
            physicsGroup: function(physicsBodyType, parent, name, addToStage) {
                return new Phaser.Group(this.game, parent, name, addToStage, !0, physicsBodyType)
            },
            spriteBatch: function(parent, name, addToStage) {
                return void 0 === parent && (parent = null), void 0 === name && (name = "group"), void 0 === addToStage && (addToStage = !1), new Phaser.SpriteBatch(this.game, parent, name, addToStage)
            },
            audio: function(key, volume, loop, connect) {
                return this.game.sound.add(key, volume, loop, connect)
            },
            sound: function(key, volume, loop, connect) {
                return this.game.sound.add(key, volume, loop, connect)
            },
            audioSprite: function(key) {
                return this.game.sound.addSprite(key)
            },
            tileSprite: function(x, y, width, height, key, frame, group) {
                return void 0 === group && (group = this.world), group.add(new Phaser.TileSprite(this.game, x, y, width, height, key, frame))
            },
            rope: function(x, y, key, frame, points, group) {
                return void 0 === group && (group = this.world), group.add(new Phaser.Rope(this.game, x, y, key, frame, points))
            },
            text: function(x, y, text, style, group) {
                return void 0 === group && (group = this.world), group.add(new Phaser.Text(this.game, x, y, text, style))
            },
            button: function(x, y, key, callback, callbackContext, overFrame, outFrame, downFrame, upFrame, group) {
                return void 0 === group && (group = this.world), group.add(new Phaser.Button(this.game, x, y, key, callback, callbackContext, overFrame, outFrame, downFrame, upFrame))
            },
            graphics: function(x, y, group) {
                return void 0 === group && (group = this.world), group.add(new Phaser.Graphics(this.game, x, y))
            },
            emitter: function(x, y, maxParticles) {
                return this.game.particles.add(new Phaser.Particles.Arcade.Emitter(this.game, x, y, maxParticles))
            },
            retroFont: function(font, characterWidth, characterHeight, chars, charsPerRow, xSpacing, ySpacing, xOffset, yOffset) {
                return new Phaser.RetroFont(this.game, font, characterWidth, characterHeight, chars, charsPerRow, xSpacing, ySpacing, xOffset, yOffset)
            },
            bitmapText: function(x, y, font, text, size, group) {
                return void 0 === group && (group = this.world), group.add(new Phaser.BitmapText(this.game, x, y, font, text, size))
            },
            tilemap: function(key, tileWidth, tileHeight, width, height) {
                return new Phaser.Tilemap(this.game, key, tileWidth, tileHeight, width, height)
            },
            renderTexture: function(width, height, key, addToCache) {
                (void 0 === key || "" === key) && (key = this.game.rnd.uuid()), void 0 === addToCache && (addToCache = !1);
                var texture = new Phaser.RenderTexture(this.game, width, height, key);
                return addToCache && this.game.cache.addRenderTexture(key, texture), texture
            },
            video: function(key, url) {
                return new Phaser.Video(this.game, key, url)
            },
            bitmapData: function(width, height, key, addToCache) {
                void 0 === addToCache && (addToCache = !1), (void 0 === key || "" === key) && (key = this.game.rnd.uuid());
                var texture = new Phaser.BitmapData(this.game, key, width, height);
                return addToCache && this.game.cache.addBitmapData(key, texture), texture
            },
            filter: function(filter) {
                var args = Array.prototype.slice.call(arguments, 1),
                    filter = new Phaser.Filter[filter](this.game);
                return filter.init.apply(filter, args), filter
            },
            plugin: function(plugin) {
                return this.game.plugins.add(plugin)
            }
        }, Phaser.GameObjectFactory.prototype.constructor = Phaser.GameObjectFactory, Phaser.GameObjectCreator = function(game) {
            this.game = game, this.world = this.game.world
        }, Phaser.GameObjectCreator.prototype = {
            image: function(x, y, key, frame) {
                return new Phaser.Image(this.game, x, y, key, frame)
            },
            sprite: function(x, y, key, frame) {
                return new Phaser.Sprite(this.game, x, y, key, frame)
            },
            tween: function(obj) {
                return new Phaser.Tween(obj, this.game, this.game.tweens)
            },
            group: function(parent, name, addToStage, enableBody, physicsBodyType) {
                return new Phaser.Group(this.game, parent, name, addToStage, enableBody, physicsBodyType)
            },
            spriteBatch: function(parent, name, addToStage) {
                return void 0 === name && (name = "group"), void 0 === addToStage && (addToStage = !1), new Phaser.SpriteBatch(this.game, parent, name, addToStage)
            },
            audio: function(key, volume, loop, connect) {
                return this.game.sound.add(key, volume, loop, connect)
            },
            audioSprite: function(key) {
                return this.game.sound.addSprite(key)
            },
            sound: function(key, volume, loop, connect) {
                return this.game.sound.add(key, volume, loop, connect)
            },
            tileSprite: function(x, y, width, height, key, frame) {
                return new Phaser.TileSprite(this.game, x, y, width, height, key, frame)
            },
            rope: function(x, y, key, frame, points) {
                return new Phaser.Rope(this.game, x, y, key, frame, points)
            },
            text: function(x, y, text, style) {
                return new Phaser.Text(this.game, x, y, text, style)
            },
            button: function(x, y, key, callback, callbackContext, overFrame, outFrame, downFrame, upFrame) {
                return new Phaser.Button(this.game, x, y, key, callback, callbackContext, overFrame, outFrame, downFrame, upFrame)
            },
            graphics: function(x, y) {
                return new Phaser.Graphics(this.game, x, y)
            },
            emitter: function(x, y, maxParticles) {
                return new Phaser.Particles.Arcade.Emitter(this.game, x, y, maxParticles)
            },
            retroFont: function(font, characterWidth, characterHeight, chars, charsPerRow, xSpacing, ySpacing, xOffset, yOffset) {
                return new Phaser.RetroFont(this.game, font, characterWidth, characterHeight, chars, charsPerRow, xSpacing, ySpacing, xOffset, yOffset)
            },
            bitmapText: function(x, y, font, text, size, align) {
                return new Phaser.BitmapText(this.game, x, y, font, text, size, align)
            },
            tilemap: function(key, tileWidth, tileHeight, width, height) {
                return new Phaser.Tilemap(this.game, key, tileWidth, tileHeight, width, height)
            },
            renderTexture: function(width, height, key, addToCache) {
                (void 0 === key || "" === key) && (key = this.game.rnd.uuid()), void 0 === addToCache && (addToCache = !1);
                var texture = new Phaser.RenderTexture(this.game, width, height, key);
                return addToCache && this.game.cache.addRenderTexture(key, texture), texture
            },
            bitmapData: function(width, height, key, addToCache) {
                void 0 === addToCache && (addToCache = !1), (void 0 === key || "" === key) && (key = this.game.rnd.uuid());
                var texture = new Phaser.BitmapData(this.game, key, width, height);
                return addToCache && this.game.cache.addBitmapData(key, texture), texture
            },
            filter: function(filter) {
                var args = Array.prototype.slice.call(arguments, 1),
                    filter = new Phaser.Filter[filter](this.game);
                return filter.init.apply(filter, args), filter
            }
        }, Phaser.GameObjectCreator.prototype.constructor = Phaser.GameObjectCreator, Phaser.Sprite = function(game, x, y, key, frame) {
            x = x || 0, y = y || 0, key = key || null, frame = frame || null, this.type = Phaser.SPRITE, this.physicsType = Phaser.SPRITE, PIXI.Sprite.call(this, PIXI.TextureCache.__default), Phaser.Component.Core.init.call(this, game, x, y, key, frame)
        }, Phaser.Sprite.prototype = Object.create(PIXI.Sprite.prototype), Phaser.Sprite.prototype.constructor = Phaser.Sprite, Phaser.Component.Core.install.call(Phaser.Sprite.prototype, ["Angle", "Animation", "AutoCull", "Bounds", "BringToTop", "Crop", "Delta", "Destroy", "FixedToCamera", "Health", "InCamera", "InputEnabled", "InWorld", "LifeSpan", "LoadTexture", "Overlap", "PhysicsBody", "Reset", "ScaleMinMax", "Smoothed"]), Phaser.Sprite.prototype.preUpdatePhysics = Phaser.Component.PhysicsBody.preUpdate, Phaser.Sprite.prototype.preUpdateLifeSpan = Phaser.Component.LifeSpan.preUpdate, Phaser.Sprite.prototype.preUpdateInWorld = Phaser.Component.InWorld.preUpdate, Phaser.Sprite.prototype.preUpdateCore = Phaser.Component.Core.preUpdate, Phaser.Sprite.prototype.preUpdate = function() {
            return this.preUpdatePhysics() && this.preUpdateLifeSpan() && this.preUpdateInWorld() ? this.preUpdateCore() : !1
        }, Phaser.Image = function(game, x, y, key, frame) {
            x = x || 0, y = y || 0, key = key || null, frame = frame || null, this.type = Phaser.IMAGE, PIXI.Sprite.call(this, PIXI.TextureCache.__default), Phaser.Component.Core.init.call(this, game, x, y, key, frame)
        }, Phaser.Image.prototype = Object.create(PIXI.Sprite.prototype), Phaser.Image.prototype.constructor = Phaser.Image, Phaser.Component.Core.install.call(Phaser.Image.prototype, ["Angle", "Animation", "AutoCull", "Bounds", "BringToTop", "Crop", "Destroy", "FixedToCamera", "InputEnabled", "LifeSpan", "LoadTexture", "Overlap", "Reset", "Smoothed"]), Phaser.Image.prototype.preUpdateInWorld = Phaser.Component.InWorld.preUpdate, Phaser.Image.prototype.preUpdateCore = Phaser.Component.Core.preUpdate, Phaser.Image.prototype.preUpdate = function() {
            return this.preUpdateInWorld() ? this.preUpdateCore() : !1
        }, Phaser.Button = function(game, x, y, key, callback, callbackContext, overFrame, outFrame, downFrame, upFrame) {
            x = x || 0, y = y || 0, key = key || null, callback = callback || null, callbackContext = callbackContext || this, Phaser.Image.call(this, game, x, y, key, outFrame), this.type = Phaser.BUTTON, this.physicsType = Phaser.SPRITE, this._onOverFrame = null, this._onOutFrame = null, this._onDownFrame = null, this._onUpFrame = null, this.onOverSound = null, this.onOutSound = null, this.onDownSound = null, this.onUpSound = null, this.onOverSoundMarker = "", this.onOutSoundMarker = "", this.onDownSoundMarker = "", this.onUpSoundMarker = "", this.onInputOver = new Phaser.Signal, this.onInputOut = new Phaser.Signal, this.onInputDown = new Phaser.Signal, this.onInputUp = new Phaser.Signal, this.onOverMouseOnly = !0, this.justReleasedPreventsOver = Phaser.PointerMode.TOUCH, this.freezeFrames = !1, this.forceOut = !1, this.inputEnabled = !0, this.input.start(0, !0), this.input.useHandCursor = !0, this.setFrames(overFrame, outFrame, downFrame, upFrame), null !== callback && this.onInputUp.add(callback, callbackContext), this.events.onInputOver.add(this.onInputOverHandler, this), this.events.onInputOut.add(this.onInputOutHandler, this), this.events.onInputDown.add(this.onInputDownHandler, this), this.events.onInputUp.add(this.onInputUpHandler, this), this.events.onRemovedFromWorld.add(this.removedFromWorld, this)
        }, Phaser.Button.prototype = Object.create(Phaser.Image.prototype), Phaser.Button.prototype.constructor = Phaser.Button;
        var STATE_OVER = "Over",
            STATE_OUT = "Out",
            STATE_DOWN = "Down",
            STATE_UP = "Up";
        Phaser.Button.prototype.clearFrames = function() {
            this.setFrames(null, null, null, null)
        }, Phaser.Button.prototype.removedFromWorld = function() {
            this.inputEnabled = !1
        }, Phaser.Button.prototype.setStateFrame = function(state, frame, switchImmediately) {
            var frameKey = "_on" + state + "Frame";
            null !== frame ? (this[frameKey] = frame, switchImmediately && this.changeStateFrame(state)) : this[frameKey] = null
        }, Phaser.Button.prototype.changeStateFrame = function(state) {
            if (this.freezeFrames) return !1;
            var frameKey = "_on" + state + "Frame",
                frame = this[frameKey];
            return "string" == typeof frame ? (this.frameName = frame, !0) : "number" == typeof frame ? (this.frame = frame, !0) : !1
        }, Phaser.Button.prototype.setFrames = function(overFrame, outFrame, downFrame, upFrame) {
            this.setStateFrame(STATE_OVER, overFrame, this.input.pointerOver()), this.setStateFrame(STATE_OUT, outFrame, !this.input.pointerOver()), this.setStateFrame(STATE_DOWN, downFrame, this.input.pointerDown()), this.setStateFrame(STATE_UP, upFrame, this.input.pointerUp())
        }, Phaser.Button.prototype.setStateSound = function(state, sound, marker) {
            var soundKey = "on" + state + "Sound",
                markerKey = "on" + state + "SoundMarker";
            sound instanceof Phaser.Sound || sound instanceof Phaser.AudioSprite ? (this[soundKey] = sound, this[markerKey] = "string" == typeof marker ? marker : "") : (this[soundKey] = null, this[markerKey] = "")
        }, Phaser.Button.prototype.playStateSound = function(state) {
            var soundKey = "on" + state + "Sound",
                sound = this[soundKey];
            if (sound) {
                var markerKey = "on" + state + "SoundMarker",
                    marker = this[markerKey];
                return sound.play(marker), !0
            }
            return !1
        }, Phaser.Button.prototype.setSounds = function(overSound, overMarker, downSound, downMarker, outSound, outMarker, upSound, upMarker) {
            this.setStateSound(STATE_OVER, overSound, overMarker), this.setStateSound(STATE_OUT, outSound, outMarker), this.setStateSound(STATE_DOWN, downSound, downMarker), this.setStateSound(STATE_UP, upSound, upMarker)
        }, Phaser.Button.prototype.setOverSound = function(sound, marker) {
            this.setStateSound(STATE_OVER, sound, marker)
        }, Phaser.Button.prototype.setOutSound = function(sound, marker) {
            this.setStateSound(STATE_OUT, sound, marker)
        }, Phaser.Button.prototype.setDownSound = function(sound, marker) {
            this.setStateSound(STATE_DOWN, sound, marker)
        }, Phaser.Button.prototype.setUpSound = function(sound, marker) {
            this.setStateSound(STATE_UP, sound, marker)
        }, Phaser.Button.prototype.onInputOverHandler = function(sprite, pointer) {
            pointer.justReleased() && (this.justReleasedPreventsOver & pointer.pointerMode) === pointer.pointerMode || (this.changeStateFrame(STATE_OVER), (!this.onOverMouseOnly || pointer.isMouse) && (this.playStateSound(STATE_OVER), this.onInputOver && this.onInputOver.dispatch(this, pointer)))
        }, Phaser.Button.prototype.onInputOutHandler = function(sprite, pointer) {
            this.changeStateFrame(STATE_OUT), this.playStateSound(STATE_OUT), this.onInputOut && this.onInputOut.dispatch(this, pointer)
        }, Phaser.Button.prototype.onInputDownHandler = function(sprite, pointer) {
            this.changeStateFrame(STATE_DOWN), this.playStateSound(STATE_DOWN), this.onInputDown && this.onInputDown.dispatch(this, pointer)
        }, Phaser.Button.prototype.onInputUpHandler = function(sprite, pointer, isOver) {
            if (this.playStateSound(STATE_UP), this.onInputUp && this.onInputUp.dispatch(this, pointer, isOver), !this.freezeFrames)
                if (this.forceOut === !0 || (this.forceOut & pointer.pointerMode) === pointer.pointerMode) this.changeStateFrame(STATE_OUT);
                else {
                    var changedUp = this.changeStateFrame(STATE_UP);
                    changedUp || (isOver ? this.changeStateFrame(STATE_OVER) : this.changeStateFrame(STATE_OUT))
                }
        }, Phaser.SpriteBatch = function(game, parent, name, addToStage) {
            (void 0 === parent || null === parent) && (parent = game.world), PIXI.SpriteBatch.call(this), Phaser.Group.call(this, game, parent, name, addToStage), this.type = Phaser.SPRITEBATCH
        }, Phaser.SpriteBatch.prototype = Phaser.Utils.extend(!0, Phaser.SpriteBatch.prototype, Phaser.Group.prototype, PIXI.SpriteBatch.prototype), Phaser.SpriteBatch.prototype.constructor = Phaser.SpriteBatch, Phaser.BitmapData = function(game, key, width, height) {
            (void 0 === width || 0 === width) && (width = 256), (void 0 === height || 0 === height) && (height = 256), this.game = game, this.key = key, this.width = width, this.height = height, this.canvas = PIXI.CanvasPool.create(this, width, height), this.context = this.canvas.getContext("2d", {
                alpha: !0
            }), this.ctx = this.context, this.imageData = this.context.getImageData(0, 0, width, height), this.data = null, this.imageData && (this.data = this.imageData.data), this.pixels = null, this.data && (this.imageData.data.buffer ? (this.buffer = this.imageData.data.buffer, this.pixels = new Uint32Array(this.buffer)) : window.ArrayBuffer ? (this.buffer = new ArrayBuffer(this.imageData.data.length), this.pixels = new Uint32Array(this.buffer)) : this.pixels = this.imageData.data), this.baseTexture = new PIXI.BaseTexture(this.canvas), this.texture = new PIXI.Texture(this.baseTexture), this.textureFrame = new Phaser.Frame(0, 0, 0, width, height, "bitmapData"), this.texture.frame = this.textureFrame, this.type = Phaser.BITMAPDATA, this.disableTextureUpload = !1, this.dirty = !1, this.cls = this.clear, this._image = null, this._pos = new Phaser.Point, this._size = new Phaser.Point, this._scale = new Phaser.Point, this._rotate = 0, this._alpha = {
                prev: 1,
                current: 1
            }, this._anchor = new Phaser.Point, this._tempR = 0, this._tempG = 0, this._tempB = 0, this._circle = new Phaser.Circle, this._swapCanvas = PIXI.CanvasPool.create(this, width, height)
        }, Phaser.BitmapData.prototype = {
            move: function(x, y, wrap) {
                return 0 !== x && this.moveH(x, wrap), 0 !== y && this.moveV(y, wrap), this
            },
            moveH: function(distance, wrap) {
                void 0 === wrap && (wrap = !0);
                var c = this._swapCanvas,
                    ctx = c.getContext("2d"),
                    h = this.height,
                    src = this.canvas;
                if (ctx.clearRect(0, 0, this.width, this.height), 0 > distance) {
                    distance = Math.abs(distance);
                    var w = this.width - distance;
                    wrap && ctx.drawImage(src, 0, 0, distance, h, w, 0, distance, h), ctx.drawImage(src, distance, 0, w, h, 0, 0, w, h)
                } else {
                    var w = this.width - distance;
                    wrap && ctx.drawImage(src, w, 0, distance, h, 0, 0, distance, h), ctx.drawImage(src, 0, 0, w, h, distance, 0, w, h)
                }
                return this.clear(), this.copy(this._swapCanvas)
            },
            moveV: function(distance, wrap) {
                void 0 === wrap && (wrap = !0);
                var c = this._swapCanvas,
                    ctx = c.getContext("2d"),
                    w = this.width,
                    src = this.canvas;
                if (ctx.clearRect(0, 0, this.width, this.height), 0 > distance) {
                    distance = Math.abs(distance);
                    var h = this.height - distance;
                    wrap && ctx.drawImage(src, 0, 0, w, distance, 0, h, w, distance), ctx.drawImage(src, 0, distance, w, h, 0, 0, w, h)
                } else {
                    var h = this.height - distance;
                    wrap && ctx.drawImage(src, 0, h, w, distance, 0, 0, w, distance), ctx.drawImage(src, 0, 0, w, h, 0, distance, w, h)
                }
                return this.clear(), this.copy(this._swapCanvas)
            },
            add: function(object) {
                if (Array.isArray(object))
                    for (var i = 0; i < object.length; i++) object[i].loadTexture && object[i].loadTexture(this);
                else object.loadTexture(this);
                return this
            },
            load: function(source) {
                return "string" == typeof source && (source = this.game.cache.getImage(source)), source ? (this.resize(source.width, source.height), this.cls(), this.draw(source), this.update(), this) : void 0
            },
            clear: function(x, y, width, height) {
                return void 0 === x && (x = 0), void 0 === y && (y = 0), void 0 === width && (width = this.width), void 0 === height && (height = this.height), this.context.clearRect(x, y, width, height), this.update(), this.dirty = !0, this
            },
            fill: function(r, g, b, a) {
                return void 0 === a && (a = 1), this.context.fillStyle = "rgba(" + r + "," + g + "," + b + "," + a + ")", this.context.fillRect(0, 0, this.width, this.height), this.dirty = !0, this
            },
            generateTexture: function(key) {
                var image = new Image;
                image.src = this.canvas.toDataURL("image/png");
                var obj = this.game.cache.addImage(key, "", image);
                return new PIXI.Texture(obj.base)
            },
            resize: function(width, height) {
                return (width !== this.width || height !== this.height) && (this.width = width, this.height = height, this.canvas.width = width, this.canvas.height = height, this._swapCanvas.width = width, this._swapCanvas.height = height, this.baseTexture.width = width, this.baseTexture.height = height, this.textureFrame.width = width, this.textureFrame.height = height, this.texture.width = width, this.texture.height = height, this.texture.crop.width = width, this.texture.crop.height = height, this.update(), this.dirty = !0), this
            },
            update: function(x, y, width, height) {
                return void 0 === x && (x = 0), void 0 === y && (y = 0), void 0 === width && (width = Math.max(1, this.width)), void 0 === height && (height = Math.max(1, this.height)), this.imageData = this.context.getImageData(x, y, width, height), this.data = this.imageData.data, this.imageData.data.buffer ? (this.buffer = this.imageData.data.buffer, this.pixels = new Uint32Array(this.buffer)) : window.ArrayBuffer ? (this.buffer = new ArrayBuffer(this.imageData.data.length), this.pixels = new Uint32Array(this.buffer)) : this.pixels = this.imageData.data, this
            },
            processPixelRGB: function(callback, callbackContext, x, y, width, height) {
                void 0 === x && (x = 0), void 0 === y && (y = 0), void 0 === width && (width = this.width), void 0 === height && (height = this.height);
                for (var w = x + width, h = y + height, pixel = Phaser.Color.createColor(), result = {
                        r: 0,
                        g: 0,
                        b: 0,
                        a: 0
                    }, dirty = !1, ty = y; h > ty; ty++)
                    for (var tx = x; w > tx; tx++) Phaser.Color.unpackPixel(this.getPixel32(tx, ty), pixel), result = callback.call(callbackContext, pixel, tx, ty), result !== !1 && null !== result && void 0 !== result && (this.setPixel32(tx, ty, result.r, result.g, result.b, result.a, !1), dirty = !0);
                return dirty && (this.context.putImageData(this.imageData, 0, 0), this.dirty = !0), this
            },
            processPixel: function(callback, callbackContext, x, y, width, height) {
                void 0 === x && (x = 0), void 0 === y && (y = 0), void 0 === width && (width = this.width), void 0 === height && (height = this.height);
                for (var w = x + width, h = y + height, pixel = 0, result = 0, dirty = !1, ty = y; h > ty; ty++)
                    for (var tx = x; w > tx; tx++) pixel = this.getPixel32(tx, ty), result = callback.call(callbackContext, pixel, tx, ty), result !== pixel && (this.pixels[ty * this.width + tx] = result, dirty = !0);
                return dirty && (this.context.putImageData(this.imageData, 0, 0),
                    this.dirty = !0), this
            },
            replaceRGB: function(r1, g1, b1, a1, r2, g2, b2, a2, region) {
                var sx = 0,
                    sy = 0,
                    w = this.width,
                    h = this.height,
                    source = Phaser.Color.packPixel(r1, g1, b1, a1);
                void 0 !== region && region instanceof Phaser.Rectangle && (sx = region.x, sy = region.y, w = region.width, h = region.height);
                for (var y = 0; h > y; y++)
                    for (var x = 0; w > x; x++) this.getPixel32(sx + x, sy + y) === source && this.setPixel32(sx + x, sy + y, r2, g2, b2, a2, !1);
                return this.context.putImageData(this.imageData, 0, 0), this.dirty = !0, this
            },
            setHSL: function(h, s, l, region) {
                if ((void 0 === h || null === h) && (h = !1), (void 0 === s || null === s) && (s = !1), (void 0 === l || null === l) && (l = !1), h || s || l) {
                    void 0 === region && (region = new Phaser.Rectangle(0, 0, this.width, this.height));
                    for (var pixel = Phaser.Color.createColor(), y = region.y; y < region.bottom; y++)
                        for (var x = region.x; x < region.right; x++) Phaser.Color.unpackPixel(this.getPixel32(x, y), pixel, !0), h && (pixel.h = h), s && (pixel.s = s), l && (pixel.l = l), Phaser.Color.HSLtoRGB(pixel.h, pixel.s, pixel.l, pixel), this.setPixel32(x, y, pixel.r, pixel.g, pixel.b, pixel.a, !1);
                    return this.context.putImageData(this.imageData, 0, 0), this.dirty = !0, this
                }
            },
            shiftHSL: function(h, s, l, region) {
                if ((void 0 === h || null === h) && (h = !1), (void 0 === s || null === s) && (s = !1), (void 0 === l || null === l) && (l = !1), h || s || l) {
                    void 0 === region && (region = new Phaser.Rectangle(0, 0, this.width, this.height));
                    for (var pixel = Phaser.Color.createColor(), y = region.y; y < region.bottom; y++)
                        for (var x = region.x; x < region.right; x++) Phaser.Color.unpackPixel(this.getPixel32(x, y), pixel, !0), h && (pixel.h = this.game.math.wrap(pixel.h + h, 0, 1)), s && (pixel.s = this.game.math.limitValue(pixel.s + s, 0, 1)), l && (pixel.l = this.game.math.limitValue(pixel.l + l, 0, 1)), Phaser.Color.HSLtoRGB(pixel.h, pixel.s, pixel.l, pixel), this.setPixel32(x, y, pixel.r, pixel.g, pixel.b, pixel.a, !1);
                    return this.context.putImageData(this.imageData, 0, 0), this.dirty = !0, this
                }
            },
            setPixel32: function(x, y, red, green, blue, alpha, immediate) {
                return void 0 === immediate && (immediate = !0), x >= 0 && x <= this.width && y >= 0 && y <= this.height && (Phaser.Device.LITTLE_ENDIAN ? this.pixels[y * this.width + x] = alpha << 24 | blue << 16 | green << 8 | red : this.pixels[y * this.width + x] = red << 24 | green << 16 | blue << 8 | alpha, immediate && (this.context.putImageData(this.imageData, 0, 0), this.dirty = !0)), this
            },
            setPixel: function(x, y, red, green, blue, immediate) {
                return this.setPixel32(x, y, red, green, blue, 255, immediate)
            },
            getPixel: function(x, y, out) {
                out || (out = Phaser.Color.createColor());
                var index = ~~(x + y * this.width);
                return index *= 4, out.r = this.data[index], out.g = this.data[++index], out.b = this.data[++index], out.a = this.data[++index], out
            },
            getPixel32: function(x, y) {
                return x >= 0 && x <= this.width && y >= 0 && y <= this.height ? this.pixels[y * this.width + x] : void 0
            },
            getPixelRGB: function(x, y, out, hsl, hsv) {
                return Phaser.Color.unpackPixel(this.getPixel32(x, y), out, hsl, hsv)
            },
            getPixels: function(rect) {
                return this.context.getImageData(rect.x, rect.y, rect.width, rect.height)
            },
            getFirstPixel: function(direction) {
                void 0 === direction && (direction = 0);
                var pixel = Phaser.Color.createColor(),
                    x = 0,
                    y = 0,
                    v = 1,
                    scan = !1;
                1 === direction ? (v = -1, y = this.height) : 3 === direction && (v = -1, x = this.width);
                do Phaser.Color.unpackPixel(this.getPixel32(x, y), pixel), 0 === direction || 1 === direction ? (x++, x === this.width && (x = 0, y += v, (y >= this.height || 0 >= y) && (scan = !0))) : (2 === direction || 3 === direction) && (y++, y === this.height && (y = 0, x += v, (x >= this.width || 0 >= x) && (scan = !0))); while (0 === pixel.a && !scan);
                return pixel.x = x, pixel.y = y, pixel
            },
            getBounds: function(rect) {
                return void 0 === rect && (rect = new Phaser.Rectangle), rect.x = this.getFirstPixel(2).x, rect.x === this.width ? rect.setTo(0, 0, 0, 0) : (rect.y = this.getFirstPixel(0).y, rect.width = this.getFirstPixel(3).x - rect.x + 1, rect.height = this.getFirstPixel(1).y - rect.y + 1, rect)
            },
            addToWorld: function(x, y, anchorX, anchorY, scaleX, scaleY) {
                scaleX = scaleX || 1, scaleY = scaleY || 1;
                var image = this.game.add.image(x, y, this);
                return image.anchor.set(anchorX, anchorY), image.scale.set(scaleX, scaleY), image
            },
            copy: function(source, x, y, width, height, tx, ty, newWidth, newHeight, rotate, anchorX, anchorY, scaleX, scaleY, alpha, blendMode, roundPx) {
                if ((void 0 === source || null === source) && (source = this), this._image = source, source instanceof Phaser.Sprite || source instanceof Phaser.Image || source instanceof Phaser.Text || source instanceof PIXI.Sprite) this._pos.set(source.texture.crop.x, source.texture.crop.y), this._size.set(source.texture.crop.width, source.texture.crop.height), this._scale.set(source.scale.x, source.scale.y), this._anchor.set(source.anchor.x, source.anchor.y), this._rotate = source.rotation, this._alpha.current = source.alpha, this._image = source.texture.baseTexture.source, (void 0 === tx || null === tx) && (tx = source.x), (void 0 === ty || null === ty) && (ty = source.y), source.texture.trim && (tx += source.texture.trim.x - source.anchor.x * source.texture.trim.width, ty += source.texture.trim.y - source.anchor.y * source.texture.trim.height), 16777215 !== source.tint && (source.cachedTint !== source.tint && (source.cachedTint = source.tint, source.tintedTexture = PIXI.CanvasTinter.getTintedTexture(source, source.tint)), this._image = source.tintedTexture);
                else {
                    if (this._pos.set(0), this._scale.set(1), this._anchor.set(0), this._rotate = 0, this._alpha.current = 1, source instanceof Phaser.BitmapData) this._image = source.canvas;
                    else if ("string" == typeof source) {
                        if (source = this.game.cache.getImage(source), null === source) return;
                        this._image = source
                    }
                    this._size.set(this._image.width, this._image.height)
                }
                if ((void 0 === x || null === x) && (x = 0), (void 0 === y || null === y) && (y = 0), width && (this._size.x = width), height && (this._size.y = height), (void 0 === tx || null === tx) && (tx = x), (void 0 === ty || null === ty) && (ty = y), (void 0 === newWidth || null === newWidth) && (newWidth = this._size.x), (void 0 === newHeight || null === newHeight) && (newHeight = this._size.y), "number" == typeof rotate && (this._rotate = rotate), "number" == typeof anchorX && (this._anchor.x = anchorX), "number" == typeof anchorY && (this._anchor.y = anchorY), "number" == typeof scaleX && (this._scale.x = scaleX), "number" == typeof scaleY && (this._scale.y = scaleY), "number" == typeof alpha && (this._alpha.current = alpha), void 0 === blendMode && (blendMode = null), void 0 === roundPx && (roundPx = !1), !(this._alpha.current <= 0 || 0 === this._scale.x || 0 === this._scale.y || 0 === this._size.x || 0 === this._size.y)) {
                    var ctx = this.context;
                    return this._alpha.prev = ctx.globalAlpha, ctx.save(), ctx.globalAlpha = this._alpha.current, blendMode && (this.op = blendMode), roundPx && (tx |= 0, ty |= 0), ctx.translate(tx, ty), ctx.scale(this._scale.x, this._scale.y), ctx.rotate(this._rotate), ctx.drawImage(this._image, this._pos.x + x, this._pos.y + y, this._size.x, this._size.y, -newWidth * this._anchor.x, -newHeight * this._anchor.y, newWidth, newHeight), ctx.restore(), ctx.globalAlpha = this._alpha.prev, this.dirty = !0, this
                }
            },
            copyRect: function(source, area, x, y, alpha, blendMode, roundPx) {
                return this.copy(source, area.x, area.y, area.width, area.height, x, y, area.width, area.height, 0, 0, 0, 1, 1, alpha, blendMode, roundPx)
            },
            draw: function(source, x, y, width, height, blendMode, roundPx) {
                return this.copy(source, null, null, null, null, x, y, width, height, null, null, null, null, null, null, blendMode, roundPx)
            },
            drawGroup: function(group, blendMode, roundPx) {
                return group.total > 0 && group.forEachExists(this.copy, this, null, null, null, null, null, null, null, null, null, null, null, null, null, null, blendMode, roundPx), this
            },
            drawFull: function(parent, blendMode, roundPx) {
                if (parent.worldVisible === !1 || 0 === parent.worldAlpha || parent.hasOwnProperty("exists") && parent.exists === !1) return this;
                if (parent.type !== Phaser.GROUP && parent.type !== Phaser.EMITTER && parent.type !== Phaser.BITMAPTEXT)
                    if (parent.type === Phaser.GRAPHICS) {
                        var bounds = parent.getBounds();
                        this.ctx.save(), this.ctx.translate(bounds.x, bounds.y), PIXI.CanvasGraphics.renderGraphics(parent, this.ctx), this.ctx.restore()
                    } else this.copy(parent, null, null, null, null, parent.worldPosition.x, parent.worldPosition.y, null, null, parent.worldRotation, null, null, parent.worldScale.x, parent.worldScale.y, parent.worldAlpha, blendMode, roundPx);
                if (parent.children)
                    for (var i = 0; i < parent.children.length; i++) this.drawFull(parent.children[i], blendMode, roundPx);
                return this
            },
            shadow: function(color, blur, x, y) {
                var ctx = this.context;
                void 0 === color || null === color ? ctx.shadowColor = "rgba(0,0,0,0)" : (ctx.shadowColor = color, ctx.shadowBlur = blur || 5, ctx.shadowOffsetX = x || 10, ctx.shadowOffsetY = y || 10)
            },
            alphaMask: function(source, mask, sourceRect, maskRect) {
                return void 0 === maskRect || null === maskRect ? this.draw(mask).blendSourceAtop() : this.draw(mask, maskRect.x, maskRect.y, maskRect.width, maskRect.height).blendSourceAtop(), void 0 === sourceRect || null === sourceRect ? this.draw(source).blendReset() : this.draw(source, sourceRect.x, sourceRect.y, sourceRect.width, sourceRect.height).blendReset(), this
            },
            extract: function(destination, r, g, b, a, resize, r2, g2, b2) {
                return void 0 === a && (a = 255), void 0 === resize && (resize = !1), void 0 === r2 && (r2 = r), void 0 === g2 && (g2 = g), void 0 === b2 && (b2 = b), resize && destination.resize(this.width, this.height), this.processPixelRGB(function(pixel, x, y) {
                    return pixel.r === r && pixel.g === g && pixel.b === b && destination.setPixel32(x, y, r2, g2, b2, a, !1), !1
                }, this), destination.context.putImageData(destination.imageData, 0, 0), destination.dirty = !0, destination
            },
            rect: function(x, y, width, height, fillStyle) {
                return "undefined" != typeof fillStyle && (this.context.fillStyle = fillStyle), this.context.fillRect(x, y, width, height), this
            },
            text: function(text, x, y, font, color, shadow) {
                void 0 === x && (x = 0), void 0 === y && (y = 0), void 0 === font && (font = "14px Courier"), void 0 === color && (color = "rgb(255,255,255)"), void 0 === shadow && (shadow = !0);
                var ctx = this.context,
                    prevFont = ctx.font;
                ctx.font = font, shadow && (ctx.fillStyle = "rgb(0,0,0)", ctx.fillText(text, x + 1, y + 1)), ctx.fillStyle = color, ctx.fillText(text, x, y), ctx.font = prevFont
            },
            circle: function(x, y, radius, fillStyle) {
                var ctx = this.context;
                return void 0 !== fillStyle && (ctx.fillStyle = fillStyle), ctx.beginPath(), ctx.arc(x, y, radius, 0, 2 * Math.PI, !1), ctx.closePath(), ctx.fill(), this
            },
            line: function(x1, y1, x2, y2, color, width) {
                void 0 === color && (color = "#fff"), void 0 === width && (width = 1);
                var ctx = this.context;
                return ctx.beginPath(), ctx.moveTo(x1, y1), ctx.lineTo(x2, y2), ctx.lineWidth = width, ctx.strokeStyle = color, ctx.stroke(), ctx.closePath(), this
            },
            textureLine: function(line, image, repeat) {
                if (void 0 === repeat && (repeat = "repeat-x"), "string" != typeof image || (image = this.game.cache.getImage(image))) {
                    var width = line.length;
                    "no-repeat" === repeat && width > image.width && (width = image.width);
                    var ctx = this.context;
                    return ctx.fillStyle = ctx.createPattern(image, repeat), this._circle = new Phaser.Circle(line.start.x, line.start.y, image.height), this._circle.circumferencePoint(line.angle - 1.5707963267948966, !1, this._pos), ctx.save(), ctx.translate(this._pos.x, this._pos.y), ctx.rotate(line.angle), ctx.fillRect(0, 0, width, image.height), ctx.restore(), this.dirty = !0, this
                }
            },
            render: function() {
                return !this.disableTextureUpload && this.dirty && (this.baseTexture.dirty(), this.dirty = !1), this
            },
            destroy: function() {
                PIXI.CanvasPool.remove(this)
            },
            blendReset: function() {
                return this.op = "source-over", this
            },
            blendSourceOver: function() {
                return this.op = "source-over", this
            },
            blendSourceIn: function() {
                return this.op = "source-in", this
            },
            blendSourceOut: function() {
                return this.op = "source-out", this
            },
            blendSourceAtop: function() {
                return this.op = "source-atop", this
            },
            blendDestinationOver: function() {
                return this.op = "destination-over", this
            },
            blendDestinationIn: function() {
                return this.op = "destination-in", this
            },
            blendDestinationOut: function() {
                return this.op = "destination-out", this
            },
            blendDestinationAtop: function() {
                return this.op = "destination-atop", this
            },
            blendXor: function() {
                return this.op = "xor", this
            },
            blendAdd: function() {
                return this.op = "lighter", this
            },
            blendMultiply: function() {
                return this.op = "multiply", this
            },
            blendScreen: function() {
                return this.op = "screen", this
            },
            blendOverlay: function() {
                return this.op = "overlay", this
            },
            blendDarken: function() {
                return this.op = "darken", this
            },
            blendLighten: function() {
                return this.op = "lighten", this
            },
            blendColorDodge: function() {
                return this.op = "color-dodge", this
            },
            blendColorBurn: function() {
                return this.op = "color-burn", this
            },
            blendHardLight: function() {
                return this.op = "hard-light", this
            },
            blendSoftLight: function() {
                return this.op = "soft-light", this
            },
            blendDifference: function() {
                return this.op = "difference", this
            },
            blendExclusion: function() {
                return this.op = "exclusion", this
            },
            blendHue: function() {
                return this.op = "hue", this
            },
            blendSaturation: function() {
                return this.op = "saturation", this
            },
            blendColor: function() {
                return this.op = "color", this
            },
            blendLuminosity: function() {
                return this.op = "luminosity", this
            }
        }, Object.defineProperty(Phaser.BitmapData.prototype, "smoothed", {
            get: function() {
                Phaser.Canvas.getSmoothingEnabled(this.context)
            },
            set: function(value) {
                Phaser.Canvas.setSmoothingEnabled(this.context, value)
            }
        }), Object.defineProperty(Phaser.BitmapData.prototype, "op", {
            get: function() {
                return this.context.globalCompositeOperation
            },
            set: function(value) {
                this.context.globalCompositeOperation = value
            }
        }), Phaser.BitmapData.getTransform = function(translateX, translateY, scaleX, scaleY, skewX, skewY) {
            return "number" != typeof translateX && (translateX = 0), "number" != typeof translateY && (translateY = 0), "number" != typeof scaleX && (scaleX = 1), "number" != typeof scaleY && (scaleY = 1), "number" != typeof skewX && (skewX = 0), "number" != typeof skewY && (skewY = 0), {
                sx: scaleX,
                sy: scaleY,
                scaleX: scaleX,
                scaleY: scaleY,
                skewX: skewX,
                skewY: skewY,
                translateX: translateX,
                translateY: translateY,
                tx: translateX,
                ty: translateY
            }
        }, Phaser.BitmapData.prototype.constructor = Phaser.BitmapData, PIXI.Graphics = function() {
            PIXI.DisplayObjectContainer.call(this), this.renderable = !0, this.fillAlpha = 1, this.lineWidth = 0, this.lineColor = 0, this.graphicsData = [], this.tint = 16777215, this.blendMode = PIXI.blendModes.NORMAL, this.currentPath = null, this._webGL = [], this.isMask = !1, this.boundsPadding = 0, this._localBounds = new PIXI.Rectangle(0, 0, 1, 1), this.dirty = !0, this.webGLDirty = !1, this.cachedSpriteDirty = !1
        }, PIXI.Graphics.prototype = Object.create(PIXI.DisplayObjectContainer.prototype), PIXI.Graphics.prototype.constructor = PIXI.Graphics, PIXI.Graphics.prototype.lineStyle = function(lineWidth, color, alpha) {
            return this.lineWidth = lineWidth || 0, this.lineColor = color || 0, this.lineAlpha = void 0 === alpha ? 1 : alpha, this.currentPath && (this.currentPath.shape.points.length ? this.drawShape(new PIXI.Polygon(this.currentPath.shape.points.slice(-2))) : (this.currentPath.lineWidth = this.lineWidth, this.currentPath.lineColor = this.lineColor, this.currentPath.lineAlpha = this.lineAlpha)), this
        }, PIXI.Graphics.prototype.moveTo = function(x, y) {
            return this.drawShape(new PIXI.Polygon([x, y])), this
        }, PIXI.Graphics.prototype.lineTo = function(x, y) {
            return this.currentPath || this.moveTo(0, 0), this.currentPath.shape.points.push(x, y), this.dirty = !0, this
        }, PIXI.Graphics.prototype.quadraticCurveTo = function(cpX, cpY, toX, toY) {
            this.currentPath ? 0 === this.currentPath.shape.points.length && (this.currentPath.shape.points = [0, 0]) : this.moveTo(0, 0);
            var xa, ya, n = 20,
                points = this.currentPath.shape.points;
            0 === points.length && this.moveTo(0, 0);
            for (var fromX = points[points.length - 2], fromY = points[points.length - 1], j = 0, i = 1; n >= i; ++i) j = i / n, xa = fromX + (cpX - fromX) * j, ya = fromY + (cpY - fromY) * j, points.push(xa + (cpX + (toX - cpX) * j - xa) * j, ya + (cpY + (toY - cpY) * j - ya) * j);
            return this.dirty = !0, this
        }, PIXI.Graphics.prototype.bezierCurveTo = function(cpX, cpY, cpX2, cpY2, toX, toY) {
            this.currentPath ? 0 === this.currentPath.shape.points.length && (this.currentPath.shape.points = [0, 0]) : this.moveTo(0, 0);
            for (var dt, dt2, dt3, t2, t3, n = 20, points = this.currentPath.shape.points, fromX = points[points.length - 2], fromY = points[points.length - 1], j = 0, i = 1; n >= i; ++i) j = i / n, dt = 1 - j, dt2 = dt * dt, dt3 = dt2 * dt, t2 = j * j, t3 = t2 * j, points.push(dt3 * fromX + 3 * dt2 * j * cpX + 3 * dt * t2 * cpX2 + t3 * toX, dt3 * fromY + 3 * dt2 * j * cpY + 3 * dt * t2 * cpY2 + t3 * toY);
            return this.dirty = !0, this
        }, PIXI.Graphics.prototype.arcTo = function(x1, y1, x2, y2, radius) {
            this.currentPath ? 0 === this.currentPath.shape.points.length && this.currentPath.shape.points.push(x1, y1) : this.moveTo(x1, y1);
            var points = this.currentPath.shape.points,
                fromX = points[points.length - 2],
                fromY = points[points.length - 1],
                a1 = fromY - y1,
                b1 = fromX - x1,
                a2 = y2 - y1,
                b2 = x2 - x1,
                mm = Math.abs(a1 * b2 - b1 * a2);
            if (1e-8 > mm || 0 === radius)(points[points.length - 2] !== x1 || points[points.length - 1] !== y1) && points.push(x1, y1);
            else {
                var dd = a1 * a1 + b1 * b1,
                    cc = a2 * a2 + b2 * b2,
                    tt = a1 * a2 + b1 * b2,
                    k1 = radius * Math.sqrt(dd) / mm,
                    k2 = radius * Math.sqrt(cc) / mm,
                    j1 = k1 * tt / dd,
                    j2 = k2 * tt / cc,
                    cx = k1 * b2 + k2 * b1,
                    cy = k1 * a2 + k2 * a1,
                    px = b1 * (k2 + j1),
                    py = a1 * (k2 + j1),
                    qx = b2 * (k1 + j2),
                    qy = a2 * (k1 + j2),
                    startAngle = Math.atan2(py - cy, px - cx),
                    endAngle = Math.atan2(qy - cy, qx - cx);
                this.arc(cx + x1, cy + y1, radius, startAngle, endAngle, b1 * a2 > b2 * a1)
            }
            return this.dirty = !0, this
        }, PIXI.Graphics.prototype.arc = function(cx, cy, radius, startAngle, endAngle, anticlockwise) {
            if (startAngle === endAngle) return this;
            void 0 === anticlockwise && (anticlockwise = !1), !anticlockwise && startAngle >= endAngle ? endAngle += 2 * Math.PI : anticlockwise && endAngle >= startAngle && (startAngle += 2 * Math.PI);
            var sweep = anticlockwise ? -1 * (startAngle - endAngle) : endAngle - startAngle,
                segs = 40 * Math.ceil(Math.abs(sweep) / (2 * Math.PI));
            if (0 === sweep) return this;
            var startX = cx + Math.cos(startAngle) * radius,
                startY = cy + Math.sin(startAngle) * radius;
            anticlockwise && this.filling ? this.moveTo(cx, cy) : this.moveTo(startX, startY);
            for (var points = this.currentPath.shape.points, theta = sweep / (2 * segs), theta2 = 2 * theta, cTheta = Math.cos(theta), sTheta = Math.sin(theta), segMinus = segs - 1, remainder = segMinus % 1 / segMinus, i = 0; segMinus >= i; i++) {
                var real = i + remainder * i,
                    angle = theta + startAngle + theta2 * real,
                    c = Math.cos(angle),
                    s = -Math.sin(angle);
                points.push((cTheta * c + sTheta * s) * radius + cx, (cTheta * -s + sTheta * c) * radius + cy)
            }
            return this.dirty = !0, this
        }, PIXI.Graphics.prototype.beginFill = function(color, alpha) {
            return this.filling = !0, this.fillColor = color || 0, this.fillAlpha = void 0 === alpha ? 1 : alpha, this.currentPath && this.currentPath.shape.points.length <= 2 && (this.currentPath.fill = this.filling, this.currentPath.fillColor = this.fillColor, this.currentPath.fillAlpha = this.fillAlpha), this
        }, PIXI.Graphics.prototype.endFill = function() {
            return this.filling = !1, this.fillColor = null, this.fillAlpha = 1, this
        }, PIXI.Graphics.prototype.drawRect = function(x, y, width, height) {
            return this.drawShape(new PIXI.Rectangle(x, y, width, height)), this
        }, PIXI.Graphics.prototype.drawRoundedRect = function(x, y, width, height, radius) {
            return this.drawShape(new PIXI.RoundedRectangle(x, y, width, height, radius)), this
        }, PIXI.Graphics.prototype.drawCircle = function(x, y, diameter) {
            return this.drawShape(new PIXI.Circle(x, y, diameter)), this
        }, PIXI.Graphics.prototype.drawEllipse = function(x, y, width, height) {
            return this.drawShape(new PIXI.Ellipse(x, y, width, height)), this
        }, PIXI.Graphics.prototype.drawPolygon = function(path) {
            (path instanceof Phaser.Polygon || path instanceof PIXI.Polygon) && (path = path.points);
            var points = path;
            if (!Array.isArray(points)) {
                points = new Array(arguments.length);
                for (var i = 0; i < points.length; ++i) points[i] = arguments[i]
            }
            return this.drawShape(new Phaser.Polygon(points)), this
        }, PIXI.Graphics.prototype.clear = function() {
            return this.lineWidth = 0, this.filling = !1, this.dirty = !0, this.clearDirty = !0, this.graphicsData = [], this
        }, PIXI.Graphics.prototype.generateTexture = function(resolution, scaleMode) {
            resolution = resolution || 1;
            var bounds = this.getBounds(),
                canvasBuffer = new PIXI.CanvasBuffer(bounds.width * resolution, bounds.height * resolution),
                texture = PIXI.Texture.fromCanvas(canvasBuffer.canvas, scaleMode);
            return texture.baseTexture.resolution = resolution, canvasBuffer.context.scale(resolution, resolution), canvasBuffer.context.translate(-bounds.x, -bounds.y), PIXI.CanvasGraphics.renderGraphics(this, canvasBuffer.context), texture
        }, PIXI.Graphics.prototype._renderWebGL = function(renderSession) {
            if (this.visible !== !1 && 0 !== this.alpha && this.isMask !== !0) {
                if (this._cacheAsBitmap) return (this.dirty || this.cachedSpriteDirty) && (this._generateCachedSprite(), this.updateCachedSpriteTexture(), this.cachedSpriteDirty = !1, this.dirty = !1), this._cachedSprite.worldAlpha = this.worldAlpha, void PIXI.Sprite.prototype._renderWebGL.call(this._cachedSprite, renderSession);
                if (renderSession.spriteBatch.stop(), renderSession.blendModeManager.setBlendMode(this.blendMode), this._mask && renderSession.maskManager.pushMask(this._mask, renderSession), this._filters && renderSession.filterManager.pushFilter(this._filterBlock), this.blendMode !== renderSession.spriteBatch.currentBlendMode) {
                    renderSession.spriteBatch.currentBlendMode = this.blendMode;
                    var blendModeWebGL = PIXI.blendModesWebGL[renderSession.spriteBatch.currentBlendMode];
                    renderSession.spriteBatch.gl.blendFunc(blendModeWebGL[0], blendModeWebGL[1])
                }
                if (this.webGLDirty && (this.dirty = !0, this.webGLDirty = !1), PIXI.WebGLGraphics.renderGraphics(this, renderSession), this.children.length) {
                    renderSession.spriteBatch.start();
                    for (var i = 0; i < this.children.length; i++) this.children[i]._renderWebGL(renderSession);
                    renderSession.spriteBatch.stop()
                }
                this._filters && renderSession.filterManager.popFilter(), this._mask && renderSession.maskManager.popMask(this.mask, renderSession), renderSession.drawCount++, renderSession.spriteBatch.start()
            }
        }, PIXI.Graphics.prototype._renderCanvas = function(renderSession) {
            if (this.visible !== !1 && 0 !== this.alpha && this.isMask !== !0) {
                if (this._prevTint !== this.tint && (this.dirty = !0, this._prevTint = this.tint), this._cacheAsBitmap) return (this.dirty || this.cachedSpriteDirty) && (this._generateCachedSprite(), this.updateCachedSpriteTexture(), this.cachedSpriteDirty = !1, this.dirty = !1), this._cachedSprite.alpha = this.alpha, void PIXI.Sprite.prototype._renderCanvas.call(this._cachedSprite, renderSession);
                var context = renderSession.context,
                    transform = this.worldTransform;
                this.blendMode !== renderSession.currentBlendMode && (renderSession.currentBlendMode = this.blendMode, context.globalCompositeOperation = PIXI.blendModesCanvas[renderSession.currentBlendMode]), this._mask && renderSession.maskManager.pushMask(this._mask, renderSession);
                var resolution = renderSession.resolution;
                context.setTransform(transform.a * resolution, transform.b * resolution, transform.c * resolution, transform.d * resolution, transform.tx * resolution, transform.ty * resolution), PIXI.CanvasGraphics.renderGraphics(this, context);
                for (var i = 0; i < this.children.length; i++) this.children[i]._renderCanvas(renderSession);
                this._mask && renderSession.maskManager.popMask(renderSession)
            }
        }, PIXI.Graphics.prototype.getBounds = function(matrix) {
            if (!this._currentBounds) {
                if (!this.renderable) return PIXI.EmptyRectangle;
                this.dirty && (this.updateLocalBounds(), this.webGLDirty = !0, this.cachedSpriteDirty = !0, this.dirty = !1);
                var bounds = this._localBounds,
                    w0 = bounds.x,
                    w1 = bounds.width + bounds.x,
                    h0 = bounds.y,
                    h1 = bounds.height + bounds.y,
                    worldTransform = matrix || this.worldTransform,
                    a = worldTransform.a,
                    b = worldTransform.b,
                    c = worldTransform.c,
                    d = worldTransform.d,
                    tx = worldTransform.tx,
                    ty = worldTransform.ty,
                    x1 = a * w1 + c * h1 + tx,
                    y1 = d * h1 + b * w1 + ty,
                    x2 = a * w0 + c * h1 + tx,
                    y2 = d * h1 + b * w0 + ty,
                    x3 = a * w0 + c * h0 + tx,
                    y3 = d * h0 + b * w0 + ty,
                    x4 = a * w1 + c * h0 + tx,
                    y4 = d * h0 + b * w1 + ty,
                    maxX = x1,
                    maxY = y1,
                    minX = x1,
                    minY = y1;
                minX = minX > x2 ? x2 : minX, minX = minX > x3 ? x3 : minX, minX = minX > x4 ? x4 : minX, minY = minY > y2 ? y2 : minY, minY = minY > y3 ? y3 : minY, minY = minY > y4 ? y4 : minY, maxX = x2 > maxX ? x2 : maxX, maxX = x3 > maxX ? x3 : maxX, maxX = x4 > maxX ? x4 : maxX, maxY = y2 > maxY ? y2 : maxY, maxY = y3 > maxY ? y3 : maxY, maxY = y4 > maxY ? y4 : maxY, this._bounds.x = minX, this._bounds.width = maxX - minX, this._bounds.y = minY, this._bounds.height = maxY - minY, this._currentBounds = this._bounds
            }
            return this._currentBounds
        }, PIXI.Graphics.prototype.containsPoint = function(point) {
            this.worldTransform.applyInverse(point, tempPoint);
            for (var graphicsData = this.graphicsData, i = 0; i < graphicsData.length; i++) {
                var data = graphicsData[i];
                if (data.fill && data.shape && data.shape.contains(tempPoint.x, tempPoint.y)) return !0
            }
            return !1
        }, PIXI.Graphics.prototype.updateLocalBounds = function() {
            var minX = 1 / 0,
                maxX = -(1 / 0),
                minY = 1 / 0,
                maxY = -(1 / 0);
            if (this.graphicsData.length)
                for (var shape, points, x, y, w, h, i = 0; i < this.graphicsData.length; i++) {
                    var data = this.graphicsData[i],
                        type = data.type,
                        lineWidth = data.lineWidth;
                    if (shape = data.shape, type === PIXI.Graphics.RECT || type === PIXI.Graphics.RREC) x = shape.x - lineWidth / 2, y = shape.y - lineWidth / 2, w = shape.width + lineWidth, h = shape.height + lineWidth, minX = minX > x ? x : minX, maxX = x + w > maxX ? x + w : maxX, minY = minY > y ? y : minY, maxY = y + h > maxY ? y + h : maxY;
                    else if (type === PIXI.Graphics.CIRC) x = shape.x, y = shape.y, w = shape.radius + lineWidth / 2, h = shape.radius + lineWidth / 2, minX = minX > x - w ? x - w : minX, maxX = x + w > maxX ? x + w : maxX, minY = minY > y - h ? y - h : minY, maxY = y + h > maxY ? y + h : maxY;
                    else if (type === PIXI.Graphics.ELIP) x = shape.x, y = shape.y, w = shape.width + lineWidth / 2, h = shape.height + lineWidth / 2, minX = minX > x - w ? x - w : minX, maxX = x + w > maxX ? x + w : maxX, minY = minY > y - h ? y - h : minY, maxY = y + h > maxY ? y + h : maxY;
                    else {
                        points = shape.points;
                        for (var j = 0; j < points.length; j++) points[j] instanceof Phaser.Point ? (x = points[j].x, y = points[j].y) : (x = points[j], y = points[j + 1], j < points.length - 1 && j++), minX = minX > x - lineWidth ? x - lineWidth : minX, maxX = x + lineWidth > maxX ? x + lineWidth : maxX, minY = minY > y - lineWidth ? y - lineWidth : minY, maxY = y + lineWidth > maxY ? y + lineWidth : maxY
                    }
                } else minX = 0, maxX = 0, minY = 0, maxY = 0;
            var padding = this.boundsPadding;
            this._localBounds.x = minX - padding, this._localBounds.width = maxX - minX + 2 * padding, this._localBounds.y = minY - padding, this._localBounds.height = maxY - minY + 2 * padding
        }, PIXI.Graphics.prototype._generateCachedSprite = function() {
            var bounds = this.getLocalBounds();
            if (this._cachedSprite) this._cachedSprite.buffer.resize(bounds.width, bounds.height);
            else {
                var canvasBuffer = new PIXI.CanvasBuffer(bounds.width, bounds.height),
                    texture = PIXI.Texture.fromCanvas(canvasBuffer.canvas);
                this._cachedSprite = new PIXI.Sprite(texture), this._cachedSprite.buffer = canvasBuffer, this._cachedSprite.worldTransform = this.worldTransform
            }
            this._cachedSprite.anchor.x = -(bounds.x / bounds.width), this._cachedSprite.anchor.y = -(bounds.y / bounds.height), this._cachedSprite.buffer.context.translate(-bounds.x, -bounds.y), this.worldAlpha = 1, PIXI.CanvasGraphics.renderGraphics(this, this._cachedSprite.buffer.context), this._cachedSprite.alpha = this.alpha
        }, PIXI.Graphics.prototype.updateCachedSpriteTexture = function() {
            var cachedSprite = this._cachedSprite,
                texture = cachedSprite.texture,
                canvas = cachedSprite.buffer.canvas;
            texture.baseTexture.width = canvas.width, texture.baseTexture.height = canvas.height, texture.crop.width = texture.frame.width = canvas.width, texture.crop.height = texture.frame.height = canvas.height, cachedSprite._width = canvas.width, cachedSprite._height = canvas.height, texture.baseTexture.dirty()
        }, PIXI.Graphics.prototype.destroyCachedSprite = function() {
            this._cachedSprite.texture.destroy(!0), this._cachedSprite = null
        }, PIXI.Graphics.prototype.drawShape = function(shape) {
            this.currentPath && this.currentPath.shape.points.length <= 2 && this.graphicsData.pop(), this.currentPath = null, shape instanceof Phaser.Polygon && (shape = shape.clone(), shape.flatten());
            var data = new PIXI.GraphicsData(this.lineWidth, this.lineColor, this.lineAlpha, this.fillColor, this.fillAlpha, this.filling, shape);
            return this.graphicsData.push(data), data.type === PIXI.Graphics.POLY && (data.shape.closed = this.filling, this.currentPath = data), this.dirty = !0, data
        }, Object.defineProperty(PIXI.Graphics.prototype, "cacheAsBitmap", {
            get: function() {
                return this._cacheAsBitmap
            },
            set: function(value) {
                this._cacheAsBitmap = value, this._cacheAsBitmap ? this._generateCachedSprite() : (this.destroyCachedSprite(), this.dirty = !0)
            }
        }), PIXI.GraphicsData = function(lineWidth, lineColor, lineAlpha, fillColor, fillAlpha, fill, shape) {
            this.lineWidth = lineWidth, this.lineColor = lineColor, this.lineAlpha = lineAlpha, this._lineTint = lineColor, this.fillColor = fillColor, this.fillAlpha = fillAlpha, this._fillTint = fillColor, this.fill = fill, this.shape = shape, this.type = shape.type
        }, PIXI.GraphicsData.prototype.constructor = PIXI.GraphicsData, PIXI.GraphicsData.prototype.clone = function() {
            return new GraphicsData(this.lineWidth, this.lineColor, this.lineAlpha, this.fillColor, this.fillAlpha, this.fill, this.shape)
        }, PIXI.PolyK = {}, PIXI.PolyK.Triangulate = function(p) {
            var sign = !0,
                n = p.length >> 1;
            if (3 > n) return [];
            for (var tgs = [], avl = [], i = 0; n > i; i++) avl.push(i);
            i = 0;
            for (var al = n; al > 3;) {
                var i0 = avl[(i + 0) % al],
                    i1 = avl[(i + 1) % al],
                    i2 = avl[(i + 2) % al],
                    ax = p[2 * i0],
                    ay = p[2 * i0 + 1],
                    bx = p[2 * i1],
                    by = p[2 * i1 + 1],
                    cx = p[2 * i2],
                    cy = p[2 * i2 + 1],
                    earFound = !1;
                if (PIXI.PolyK._convex(ax, ay, bx, by, cx, cy, sign)) {
                    earFound = !0;
                    for (var j = 0; al > j; j++) {
                        var vi = avl[j];
                        if (vi !== i0 && vi !== i1 && vi !== i2 && PIXI.PolyK._PointInTriangle(p[2 * vi], p[2 * vi + 1], ax, ay, bx, by, cx, cy)) {
                            earFound = !1;
                            break
                        }
                    }
                }
                if (earFound) tgs.push(i0, i1, i2), avl.splice((i + 1) % al, 1), al--, i = 0;
                else if (i++ > 3 * al) {
                    if (!sign) return null;
                    for (tgs = [], avl = [], i = 0; n > i; i++) avl.push(i);
                    i = 0, al = n, sign = !1
                }
            }
            return tgs.push(avl[0], avl[1], avl[2]), tgs
        }, PIXI.PolyK._PointInTriangle = function(px, py, ax, ay, bx, by, cx, cy) {
            var v0x = cx - ax,
                v0y = cy - ay,
                v1x = bx - ax,
                v1y = by - ay,
                v2x = px - ax,
                v2y = py - ay,
                dot00 = v0x * v0x + v0y * v0y,
                dot01 = v0x * v1x + v0y * v1y,
                dot02 = v0x * v2x + v0y * v2y,
                dot11 = v1x * v1x + v1y * v1y,
                dot12 = v1x * v2x + v1y * v2y,
                invDenom = 1 / (dot00 * dot11 - dot01 * dot01),
                u = (dot11 * dot02 - dot01 * dot12) * invDenom,
                v = (dot00 * dot12 - dot01 * dot02) * invDenom;
            return u >= 0 && v >= 0 && 1 > u + v
        }, PIXI.PolyK._convex = function(ax, ay, bx, by, cx, cy, sign) {
            return (ay - by) * (cx - bx) + (bx - ax) * (cy - by) >= 0 === sign
        }, PIXI.WebGLGraphics = function() {}, PIXI.WebGLGraphics.renderGraphics = function(graphics, renderSession) {
            var webGLData, gl = renderSession.gl,
                projection = renderSession.projection,
                offset = renderSession.offset,
                shader = renderSession.shaderManager.primitiveShader;
            graphics.dirty && PIXI.WebGLGraphics.updateGraphics(graphics, gl);
            for (var webGL = graphics._webGL[gl.id], i = 0; i < webGL.data.length; i++) 1 === webGL.data[i].mode ? (webGLData = webGL.data[i], renderSession.stencilManager.pushStencil(graphics, webGLData, renderSession), gl.drawElements(gl.TRIANGLE_FAN, 4, gl.UNSIGNED_SHORT, 2 * (webGLData.indices.length - 4)), renderSession.stencilManager.popStencil(graphics, webGLData, renderSession)) : (webGLData = webGL.data[i], renderSession.shaderManager.setShader(shader), shader = renderSession.shaderManager.primitiveShader, gl.uniformMatrix3fv(shader.translationMatrix, !1, graphics.worldTransform.toArray(!0)), gl.uniform1f(shader.flipY, 1), gl.uniform2f(shader.projectionVector, projection.x, -projection.y), gl.uniform2f(shader.offsetVector, -offset.x, -offset.y), gl.uniform3fv(shader.tintColor, PIXI.hex2rgb(graphics.tint)), gl.uniform1f(shader.alpha, graphics.worldAlpha), gl.bindBuffer(gl.ARRAY_BUFFER, webGLData.buffer), gl.vertexAttribPointer(shader.aVertexPosition, 2, gl.FLOAT, !1, 24, 0), gl.vertexAttribPointer(shader.colorAttribute, 4, gl.FLOAT, !1, 24, 8), gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, webGLData.indexBuffer), gl.drawElements(gl.TRIANGLE_STRIP, webGLData.indices.length, gl.UNSIGNED_SHORT, 0))
        }, PIXI.WebGLGraphics.updateGraphics = function(graphics, gl) {
            var webGL = graphics._webGL[gl.id];
            webGL || (webGL = graphics._webGL[gl.id] = {
                lastIndex: 0,
                data: [],
                gl: gl
            }), graphics.dirty = !1;
            var i;
            if (graphics.clearDirty) {
                for (graphics.clearDirty = !1, i = 0; i < webGL.data.length; i++) {
                    var graphicsData = webGL.data[i];
                    graphicsData.reset(), PIXI.WebGLGraphics.graphicsDataPool.push(graphicsData)
                }
                webGL.data = [], webGL.lastIndex = 0
            }
            var webGLData;
            for (i = webGL.lastIndex; i < graphics.graphicsData.length; i++) {
                var data = graphics.graphicsData[i];
                if (data.type === PIXI.Graphics.POLY) {
                    if (data.points = data.shape.points.slice(), data.shape.closed && (data.points[0] !== data.points[data.points.length - 2] || data.points[1] !== data.points[data.points.length - 1]) && data.points.push(data.points[0], data.points[1]), data.fill && data.points.length >= 6)
                        if (data.points.length < 12) {
                            webGLData = PIXI.WebGLGraphics.switchMode(webGL, 0);
                            var canDrawUsingSimple = PIXI.WebGLGraphics.buildPoly(data, webGLData);
                            canDrawUsingSimple || (webGLData = PIXI.WebGLGraphics.switchMode(webGL, 1), PIXI.WebGLGraphics.buildComplexPoly(data, webGLData))
                        } else webGLData = PIXI.WebGLGraphics.switchMode(webGL, 1), PIXI.WebGLGraphics.buildComplexPoly(data, webGLData);
                    data.lineWidth > 0 && (webGLData = PIXI.WebGLGraphics.switchMode(webGL, 0), PIXI.WebGLGraphics.buildLine(data, webGLData))
                } else webGLData = PIXI.WebGLGraphics.switchMode(webGL, 0), data.type === PIXI.Graphics.RECT ? PIXI.WebGLGraphics.buildRectangle(data, webGLData) : data.type === PIXI.Graphics.CIRC || data.type === PIXI.Graphics.ELIP ? PIXI.WebGLGraphics.buildCircle(data, webGLData) : data.type === PIXI.Graphics.RREC && PIXI.WebGLGraphics.buildRoundedRectangle(data, webGLData);
                webGL.lastIndex++
            }
            for (i = 0; i < webGL.data.length; i++) webGLData = webGL.data[i], webGLData.dirty && webGLData.upload()
        }, PIXI.WebGLGraphics.switchMode = function(webGL, type) {
            var webGLData;
            return webGL.data.length ? (webGLData = webGL.data[webGL.data.length - 1], (webGLData.mode !== type || 1 === type) && (webGLData = PIXI.WebGLGraphics.graphicsDataPool.pop() || new PIXI.WebGLGraphicsData(webGL.gl), webGLData.mode = type, webGL.data.push(webGLData))) : (webGLData = PIXI.WebGLGraphics.graphicsDataPool.pop() || new PIXI.WebGLGraphicsData(webGL.gl), webGLData.mode = type, webGL.data.push(webGLData)), webGLData.dirty = !0, webGLData
        }, PIXI.WebGLGraphics.buildRectangle = function(graphicsData, webGLData) {
            var rectData = graphicsData.shape,
                x = rectData.x,
                y = rectData.y,
                width = rectData.width,
                height = rectData.height;
            if (graphicsData.fill) {
                var color = PIXI.hex2rgb(graphicsData.fillColor),
                    alpha = graphicsData.fillAlpha,
                    r = color[0] * alpha,
                    g = color[1] * alpha,
                    b = color[2] * alpha,
                    verts = webGLData.points,
                    indices = webGLData.indices,
                    vertPos = verts.length / 6;
                verts.push(x, y), verts.push(r, g, b, alpha), verts.push(x + width, y), verts.push(r, g, b, alpha), verts.push(x, y + height), verts.push(r, g, b, alpha), verts.push(x + width, y + height), verts.push(r, g, b, alpha), indices.push(vertPos, vertPos, vertPos + 1, vertPos + 2, vertPos + 3, vertPos + 3)
            }
            if (graphicsData.lineWidth) {
                var tempPoints = graphicsData.points;
                graphicsData.points = [x, y, x + width, y, x + width, y + height, x, y + height, x, y], PIXI.WebGLGraphics.buildLine(graphicsData, webGLData), graphicsData.points = tempPoints
            }
        }, PIXI.WebGLGraphics.buildRoundedRectangle = function(graphicsData, webGLData) {
            var rrectData = graphicsData.shape,
                x = rrectData.x,
                y = rrectData.y,
                width = rrectData.width,
                height = rrectData.height,
                radius = rrectData.radius,
                recPoints = [];
            if (recPoints.push(x, y + radius), recPoints = recPoints.concat(PIXI.WebGLGraphics.quadraticBezierCurve(x, y + height - radius, x, y + height, x + radius, y + height)), recPoints = recPoints.concat(PIXI.WebGLGraphics.quadraticBezierCurve(x + width - radius, y + height, x + width, y + height, x + width, y + height - radius)), recPoints = recPoints.concat(PIXI.WebGLGraphics.quadraticBezierCurve(x + width, y + radius, x + width, y, x + width - radius, y)), recPoints = recPoints.concat(PIXI.WebGLGraphics.quadraticBezierCurve(x + radius, y, x, y, x, y + radius)), graphicsData.fill) {
                var color = PIXI.hex2rgb(graphicsData.fillColor),
                    alpha = graphicsData.fillAlpha,
                    r = color[0] * alpha,
                    g = color[1] * alpha,
                    b = color[2] * alpha,
                    verts = webGLData.points,
                    indices = webGLData.indices,
                    vecPos = verts.length / 6,
                    triangles = PIXI.PolyK.Triangulate(recPoints),
                    i = 0;
                for (i = 0; i < triangles.length; i += 3) indices.push(triangles[i] + vecPos), indices.push(triangles[i] + vecPos), indices.push(triangles[i + 1] + vecPos), indices.push(triangles[i + 2] + vecPos), indices.push(triangles[i + 2] + vecPos);
                for (i = 0; i < recPoints.length; i++) verts.push(recPoints[i], recPoints[++i], r, g, b, alpha)
            }
            if (graphicsData.lineWidth) {
                var tempPoints = graphicsData.points;
                graphicsData.points = recPoints, PIXI.WebGLGraphics.buildLine(graphicsData, webGLData), graphicsData.points = tempPoints
            }
        }, PIXI.WebGLGraphics.quadraticBezierCurve = function(fromX, fromY, cpX, cpY, toX, toY) {
            function getPt(n1, n2, perc) {
                var diff = n2 - n1;
                return n1 + diff * perc
            }
            for (var xa, ya, xb, yb, x, y, n = 20, points = [], j = 0, i = 0; n >= i; i++) j = i / n, xa = getPt(fromX, cpX, j), ya = getPt(fromY, cpY, j), xb = getPt(cpX, toX, j), yb = getPt(cpY, toY, j), x = getPt(xa, xb, j), y = getPt(ya, yb, j), points.push(x, y);
            return points
        }, PIXI.WebGLGraphics.buildCircle = function(graphicsData, webGLData) {
            var width, height, circleData = graphicsData.shape,
                x = circleData.x,
                y = circleData.y;
            graphicsData.type === PIXI.Graphics.CIRC ? (width = circleData.radius, height = circleData.radius) : (width = circleData.width, height = circleData.height);
            var totalSegs = 40,
                seg = 2 * Math.PI / totalSegs,
                i = 0;
            if (graphicsData.fill) {
                var color = PIXI.hex2rgb(graphicsData.fillColor),
                    alpha = graphicsData.fillAlpha,
                    r = color[0] * alpha,
                    g = color[1] * alpha,
                    b = color[2] * alpha,
                    verts = webGLData.points,
                    indices = webGLData.indices,
                    vecPos = verts.length / 6;
                for (indices.push(vecPos), i = 0; totalSegs + 1 > i; i++) verts.push(x, y, r, g, b, alpha), verts.push(x + Math.sin(seg * i) * width, y + Math.cos(seg * i) * height, r, g, b, alpha), indices.push(vecPos++, vecPos++);
                indices.push(vecPos - 1)
            }
            if (graphicsData.lineWidth) {
                var tempPoints = graphicsData.points;
                for (graphicsData.points = [], i = 0; totalSegs + 1 > i; i++) graphicsData.points.push(x + Math.sin(seg * i) * width, y + Math.cos(seg * i) * height);
                PIXI.WebGLGraphics.buildLine(graphicsData, webGLData), graphicsData.points = tempPoints
            }
        }, PIXI.WebGLGraphics.buildLine = function(graphicsData, webGLData) {
            var i = 0,
                points = graphicsData.points;
            if (0 !== points.length) {
                if (graphicsData.lineWidth % 2)
                    for (i = 0; i < points.length; i++) points[i] += .5;
                var firstPoint = new PIXI.Point(points[0], points[1]),
                    lastPoint = new PIXI.Point(points[points.length - 2], points[points.length - 1]);
                if (firstPoint.x === lastPoint.x && firstPoint.y === lastPoint.y) {
                    points = points.slice(), points.pop(), points.pop(), lastPoint = new PIXI.Point(points[points.length - 2], points[points.length - 1]);
                    var midPointX = lastPoint.x + .5 * (firstPoint.x - lastPoint.x),
                        midPointY = lastPoint.y + .5 * (firstPoint.y - lastPoint.y);
                    points.unshift(midPointX, midPointY), points.push(midPointX, midPointY)
                }
                var px, py, p1x, p1y, p2x, p2y, p3x, p3y, perpx, perpy, perp2x, perp2y, perp3x, perp3y, a1, b1, c1, a2, b2, c2, denom, pdist, dist, verts = webGLData.points,
                    indices = webGLData.indices,
                    length = points.length / 2,
                    indexCount = points.length,
                    indexStart = verts.length / 6,
                    width = graphicsData.lineWidth / 2,
                    color = PIXI.hex2rgb(graphicsData.lineColor),
                    alpha = graphicsData.lineAlpha,
                    r = color[0] * alpha,
                    g = color[1] * alpha,
                    b = color[2] * alpha;
                for (p1x = points[0], p1y = points[1], p2x = points[2], p2y = points[3], perpx = -(p1y - p2y), perpy = p1x - p2x, dist = Math.sqrt(perpx * perpx + perpy * perpy), perpx /= dist, perpy /= dist, perpx *= width, perpy *= width, verts.push(p1x - perpx, p1y - perpy, r, g, b, alpha), verts.push(p1x + perpx, p1y + perpy, r, g, b, alpha), i = 1; length - 1 > i; i++) p1x = points[2 * (i - 1)], p1y = points[2 * (i - 1) + 1], p2x = points[2 * i], p2y = points[2 * i + 1], p3x = points[2 * (i + 1)], p3y = points[2 * (i + 1) + 1], perpx = -(p1y - p2y), perpy = p1x - p2x, dist = Math.sqrt(perpx * perpx + perpy * perpy), perpx /= dist, perpy /= dist, perpx *= width, perpy *= width, perp2x = -(p2y - p3y), perp2y = p2x - p3x, dist = Math.sqrt(perp2x * perp2x + perp2y * perp2y), perp2x /= dist, perp2y /= dist, perp2x *= width, perp2y *= width, a1 = -perpy + p1y - (-perpy + p2y), b1 = -perpx + p2x - (-perpx + p1x), c1 = (-perpx + p1x) * (-perpy + p2y) - (-perpx + p2x) * (-perpy + p1y), a2 = -perp2y + p3y - (-perp2y + p2y), b2 = -perp2x + p2x - (-perp2x + p3x), c2 = (-perp2x + p3x) * (-perp2y + p2y) - (-perp2x + p2x) * (-perp2y + p3y), denom = a1 * b2 - a2 * b1, Math.abs(denom) < .1 ? (denom += 10.1, verts.push(p2x - perpx, p2y - perpy, r, g, b, alpha), verts.push(p2x + perpx, p2y + perpy, r, g, b, alpha)) : (px = (b1 * c2 - b2 * c1) / denom, py = (a2 * c1 - a1 * c2) / denom, pdist = (px - p2x) * (px - p2x) + (py - p2y) + (py - p2y), pdist > 19600 ? (perp3x = perpx - perp2x, perp3y = perpy - perp2y, dist = Math.sqrt(perp3x * perp3x + perp3y * perp3y), perp3x /= dist, perp3y /= dist, perp3x *= width, perp3y *= width, verts.push(p2x - perp3x, p2y - perp3y), verts.push(r, g, b, alpha), verts.push(p2x + perp3x, p2y + perp3y), verts.push(r, g, b, alpha), verts.push(p2x - perp3x, p2y - perp3y), verts.push(r, g, b, alpha), indexCount++) : (verts.push(px, py), verts.push(r, g, b, alpha), verts.push(p2x - (px - p2x), p2y - (py - p2y)), verts.push(r, g, b, alpha)));
                for (p1x = points[2 * (length - 2)], p1y = points[2 * (length - 2) + 1], p2x = points[2 * (length - 1)], p2y = points[2 * (length - 1) + 1], perpx = -(p1y - p2y), perpy = p1x - p2x, dist = Math.sqrt(perpx * perpx + perpy * perpy), perpx /= dist, perpy /= dist, perpx *= width, perpy *= width, verts.push(p2x - perpx, p2y - perpy), verts.push(r, g, b, alpha), verts.push(p2x + perpx, p2y + perpy), verts.push(r, g, b, alpha), indices.push(indexStart), i = 0; indexCount > i; i++) indices.push(indexStart++);
                indices.push(indexStart - 1)
            }
        }, PIXI.WebGLGraphics.buildComplexPoly = function(graphicsData, webGLData) {
            var points = graphicsData.points.slice();
            if (!(points.length < 6)) {
                var indices = webGLData.indices;
                webGLData.points = points, webGLData.alpha = graphicsData.fillAlpha, webGLData.color = PIXI.hex2rgb(graphicsData.fillColor);
                for (var x, y, minX = 1 / 0, maxX = -(1 / 0), minY = 1 / 0, maxY = -(1 / 0), i = 0; i < points.length; i += 2) x = points[i], y = points[i + 1], minX = minX > x ? x : minX, maxX = x > maxX ? x : maxX, minY = minY > y ? y : minY, maxY = y > maxY ? y : maxY;
                points.push(minX, minY, maxX, minY, maxX, maxY, minX, maxY);
                var length = points.length / 2;
                for (i = 0; length > i; i++) indices.push(i)
            }
        }, PIXI.WebGLGraphics.buildPoly = function(graphicsData, webGLData) {
            var points = graphicsData.points;
            if (!(points.length < 6)) {
                var verts = webGLData.points,
                    indices = webGLData.indices,
                    length = points.length / 2,
                    color = PIXI.hex2rgb(graphicsData.fillColor),
                    alpha = graphicsData.fillAlpha,
                    r = color[0] * alpha,
                    g = color[1] * alpha,
                    b = color[2] * alpha,
                    triangles = PIXI.PolyK.Triangulate(points);
                if (!triangles) return !1;
                var vertPos = verts.length / 6,
                    i = 0;
                for (i = 0; i < triangles.length; i += 3) indices.push(triangles[i] + vertPos), indices.push(triangles[i] + vertPos), indices.push(triangles[i + 1] + vertPos), indices.push(triangles[i + 2] + vertPos), indices.push(triangles[i + 2] + vertPos);
                for (i = 0; length > i; i++) verts.push(points[2 * i], points[2 * i + 1], r, g, b, alpha);
                return !0
            }
        }, PIXI.WebGLGraphics.graphicsDataPool = [], PIXI.WebGLGraphicsData = function(gl) {
            this.gl = gl, this.color = [0, 0, 0], this.points = [], this.indices = [], this.buffer = gl.createBuffer(), this.indexBuffer = gl.createBuffer(), this.mode = 1, this.alpha = 1, this.dirty = !0
        }, PIXI.WebGLGraphicsData.prototype.reset = function() {
            this.points = [], this.indices = []
        }, PIXI.WebGLGraphicsData.prototype.upload = function() {
            var gl = this.gl;
            this.glPoints = new PIXI.Float32Array(this.points), gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer), gl.bufferData(gl.ARRAY_BUFFER, this.glPoints, gl.STATIC_DRAW), this.glIndicies = new PIXI.Uint16Array(this.indices), gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer), gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.glIndicies, gl.STATIC_DRAW), this.dirty = !1
        }, PIXI.CanvasGraphics = function() {}, PIXI.CanvasGraphics.renderGraphics = function(graphics, context) {
            var worldAlpha = graphics.worldAlpha;
            graphics.dirty && (this.updateGraphicsTint(graphics), graphics.dirty = !1);
            for (var i = 0; i < graphics.graphicsData.length; i++) {
                var data = graphics.graphicsData[i],
                    shape = data.shape,
                    fillColor = data._fillTint,
                    lineColor = data._lineTint;
                if (context.lineWidth = data.lineWidth, data.type === PIXI.Graphics.POLY) {
                    context.beginPath();
                    var points = shape.points;
                    context.moveTo(points[0], points[1]);
                    for (var j = 1; j < points.length / 2; j++) context.lineTo(points[2 * j], points[2 * j + 1]);
                    shape.closed && context.lineTo(points[0], points[1]), points[0] === points[points.length - 2] && points[1] === points[points.length - 1] && context.closePath(), data.fill && (context.globalAlpha = data.fillAlpha * worldAlpha, context.fillStyle = "#" + ("00000" + (0 | fillColor).toString(16)).substr(-6), context.fill()), data.lineWidth && (context.globalAlpha = data.lineAlpha * worldAlpha, context.strokeStyle = "#" + ("00000" + (0 | lineColor).toString(16)).substr(-6), context.stroke())
                } else if (data.type === PIXI.Graphics.RECT)(data.fillColor || 0 === data.fillColor) && (context.globalAlpha = data.fillAlpha * worldAlpha, context.fillStyle = "#" + ("00000" + (0 | fillColor).toString(16)).substr(-6), context.fillRect(shape.x, shape.y, shape.width, shape.height)), data.lineWidth && (context.globalAlpha = data.lineAlpha * worldAlpha, context.strokeStyle = "#" + ("00000" + (0 | lineColor).toString(16)).substr(-6), context.strokeRect(shape.x, shape.y, shape.width, shape.height));
                else if (data.type === PIXI.Graphics.CIRC) context.beginPath(), context.arc(shape.x, shape.y, shape.radius, 0, 2 * Math.PI), context.closePath(), data.fill && (context.globalAlpha = data.fillAlpha * worldAlpha, context.fillStyle = "#" + ("00000" + (0 | fillColor).toString(16)).substr(-6), context.fill()), data.lineWidth && (context.globalAlpha = data.lineAlpha * worldAlpha, context.strokeStyle = "#" + ("00000" + (0 | lineColor).toString(16)).substr(-6), context.stroke());
                else if (data.type === PIXI.Graphics.ELIP) {
                    var w = 2 * shape.width,
                        h = 2 * shape.height,
                        x = shape.x - w / 2,
                        y = shape.y - h / 2;
                    context.beginPath();
                    var kappa = .5522848,
                        ox = w / 2 * kappa,
                        oy = h / 2 * kappa,
                        xe = x + w,
                        ye = y + h,
                        xm = x + w / 2,
                        ym = y + h / 2;
                    context.moveTo(x, ym), context.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y), context.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym), context.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye), context.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym), context.closePath(), data.fill && (context.globalAlpha = data.fillAlpha * worldAlpha, context.fillStyle = "#" + ("00000" + (0 | fillColor).toString(16)).substr(-6), context.fill()), data.lineWidth && (context.globalAlpha = data.lineAlpha * worldAlpha, context.strokeStyle = "#" + ("00000" + (0 | lineColor).toString(16)).substr(-6), context.stroke())
                } else if (data.type === PIXI.Graphics.RREC) {
                    var rx = shape.x,
                        ry = shape.y,
                        width = shape.width,
                        height = shape.height,
                        radius = shape.radius,
                        maxRadius = Math.min(width, height) / 2 | 0;
                    radius = radius > maxRadius ? maxRadius : radius, context.beginPath(), context.moveTo(rx, ry + radius), context.lineTo(rx, ry + height - radius), context.quadraticCurveTo(rx, ry + height, rx + radius, ry + height), context.lineTo(rx + width - radius, ry + height), context.quadraticCurveTo(rx + width, ry + height, rx + width, ry + height - radius), context.lineTo(rx + width, ry + radius), context.quadraticCurveTo(rx + width, ry, rx + width - radius, ry), context.lineTo(rx + radius, ry), context.quadraticCurveTo(rx, ry, rx, ry + radius), context.closePath(), (data.fillColor || 0 === data.fillColor) && (context.globalAlpha = data.fillAlpha * worldAlpha, context.fillStyle = "#" + ("00000" + (0 | fillColor).toString(16)).substr(-6), context.fill()), data.lineWidth && (context.globalAlpha = data.lineAlpha * worldAlpha, context.strokeStyle = "#" + ("00000" + (0 | lineColor).toString(16)).substr(-6), context.stroke())
                }
            }
        }, PIXI.CanvasGraphics.renderGraphicsMask = function(graphics, context) {
            var len = graphics.graphicsData.length;
            if (0 !== len) {
                context.beginPath();
                for (var i = 0; len > i; i++) {
                    var data = graphics.graphicsData[i],
                        shape = data.shape;
                    if (data.type === PIXI.Graphics.POLY) {
                        var points = shape.points;
                        context.moveTo(points[0], points[1]);
                        for (var j = 1; j < points.length / 2; j++) context.lineTo(points[2 * j], points[2 * j + 1]);
                        points[0] === points[points.length - 2] && points[1] === points[points.length - 1] && context.closePath()
                    } else if (data.type === PIXI.Graphics.RECT) context.rect(shape.x, shape.y, shape.width, shape.height), context.closePath();
                    else if (data.type === PIXI.Graphics.CIRC) context.arc(shape.x, shape.y, shape.radius, 0, 2 * Math.PI), context.closePath();
                    else if (data.type === PIXI.Graphics.ELIP) {
                        var w = 2 * shape.width,
                            h = 2 * shape.height,
                            x = shape.x - w / 2,
                            y = shape.y - h / 2,
                            kappa = .5522848,
                            ox = w / 2 * kappa,
                            oy = h / 2 * kappa,
                            xe = x + w,
                            ye = y + h,
                            xm = x + w / 2,
                            ym = y + h / 2;
                        context.moveTo(x, ym), context.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y), context.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym), context.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye), context.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym), context.closePath()
                    } else if (data.type === PIXI.Graphics.RREC) {
                        var rx = shape.x,
                            ry = shape.y,
                            width = shape.width,
                            height = shape.height,
                            radius = shape.radius,
                            maxRadius = Math.min(width, height) / 2 | 0;
                        radius = radius > maxRadius ? maxRadius : radius, context.moveTo(rx, ry + radius), context.lineTo(rx, ry + height - radius), context.quadraticCurveTo(rx, ry + height, rx + radius, ry + height), context.lineTo(rx + width - radius, ry + height), context.quadraticCurveTo(rx + width, ry + height, rx + width, ry + height - radius), context.lineTo(rx + width, ry + radius), context.quadraticCurveTo(rx + width, ry, rx + width - radius, ry), context.lineTo(rx + radius, ry), context.quadraticCurveTo(rx, ry, rx, ry + radius), context.closePath()
                    }
                }
            }
        }, PIXI.CanvasGraphics.updateGraphicsTint = function(graphics) {
            if (16777215 !== graphics.tint)
                for (var tintR = (graphics.tint >> 16 & 255) / 255, tintG = (graphics.tint >> 8 & 255) / 255, tintB = (255 & graphics.tint) / 255, i = 0; i < graphics.graphicsData.length; i++) {
                    var data = graphics.graphicsData[i],
                        fillColor = 0 | data.fillColor,
                        lineColor = 0 | data.lineColor;
                    data._fillTint = ((fillColor >> 16 & 255) / 255 * tintR * 255 << 16) + ((fillColor >> 8 & 255) / 255 * tintG * 255 << 8) + (255 & fillColor) / 255 * tintB * 255, data._lineTint = ((lineColor >> 16 & 255) / 255 * tintR * 255 << 16) + ((lineColor >> 8 & 255) / 255 * tintG * 255 << 8) + (255 & lineColor) / 255 * tintB * 255
                }
        }, Phaser.Graphics = function(game, x, y) {
            void 0 === x && (x = 0), void 0 === y && (y = 0), this.type = Phaser.GRAPHICS, this.physicsType = Phaser.SPRITE, PIXI.Graphics.call(this), Phaser.Component.Core.init.call(this, game, x, y, "", null)
        }, Phaser.Graphics.prototype = Object.create(PIXI.Graphics.prototype), Phaser.Graphics.prototype.constructor = Phaser.Graphics, Phaser.Component.Core.install.call(Phaser.Graphics.prototype, ["Angle", "AutoCull", "Bounds", "Destroy", "FixedToCamera", "InputEnabled", "InWorld", "LifeSpan", "PhysicsBody", "Reset"]), Phaser.Graphics.prototype.preUpdatePhysics = Phaser.Component.PhysicsBody.preUpdate, Phaser.Graphics.prototype.preUpdateLifeSpan = Phaser.Component.LifeSpan.preUpdate, Phaser.Graphics.prototype.preUpdateInWorld = Phaser.Component.InWorld.preUpdate, Phaser.Graphics.prototype.preUpdateCore = Phaser.Component.Core.preUpdate, Phaser.Graphics.prototype.preUpdate = function() {
            return this.preUpdatePhysics() && this.preUpdateLifeSpan() && this.preUpdateInWorld() ? this.preUpdateCore() : !1
        }, Phaser.Graphics.prototype.destroy = function(destroyChildren) {
            this.clear(), Phaser.Component.Destroy.prototype.destroy.call(this, destroyChildren)
        }, Phaser.Graphics.prototype.drawTriangle = function(points, cull) {
            void 0 === cull && (cull = !1);
            var triangle = new Phaser.Polygon(points);
            if (cull) {
                var cameraToFace = new Phaser.Point(this.game.camera.x - points[0].x, this.game.camera.y - points[0].y),
                    ab = new Phaser.Point(points[1].x - points[0].x, points[1].y - points[0].y),
                    cb = new Phaser.Point(points[1].x - points[2].x, points[1].y - points[2].y),
                    faceNormal = cb.cross(ab);
                cameraToFace.dot(faceNormal) > 0 && this.drawPolygon(triangle)
            } else this.drawPolygon(triangle)
        }, Phaser.Graphics.prototype.drawTriangles = function(vertices, indices, cull) {
            void 0 === cull && (cull = !1);
            var i, point1 = new Phaser.Point,
                point2 = new Phaser.Point,
                point3 = new Phaser.Point,
                points = [];
            if (indices)
                if (vertices[0] instanceof Phaser.Point)
                    for (i = 0; i < indices.length / 3; i++) points.push(vertices[indices[3 * i]]), points.push(vertices[indices[3 * i + 1]]), points.push(vertices[indices[3 * i + 2]]), 3 === points.length && (this.drawTriangle(points, cull), points = []);
                else
                    for (i = 0; i < indices.length; i++) point1.x = vertices[2 * indices[i]], point1.y = vertices[2 * indices[i] + 1], points.push(point1.copyTo({})), 3 === points.length && (this.drawTriangle(points, cull), points = []);
            else if (vertices[0] instanceof Phaser.Point)
                for (i = 0; i < vertices.length / 3; i++) this.drawTriangle([vertices[3 * i], vertices[3 * i + 1], vertices[3 * i + 2]], cull);
            else
                for (i = 0; i < vertices.length / 6; i++) point1.x = vertices[6 * i + 0], point1.y = vertices[6 * i + 1], point2.x = vertices[6 * i + 2], point2.y = vertices[6 * i + 3], point3.x = vertices[6 * i + 4], point3.y = vertices[6 * i + 5], this.drawTriangle([point1, point2, point3], cull)
        }, Phaser.RenderTexture = function(game, width, height, key, scaleMode, resolution) {
            void 0 === key && (key = ""), void 0 === scaleMode && (scaleMode = Phaser.scaleModes.DEFAULT), void 0 === resolution && (resolution = 1), this.game = game, this.key = key, this.type = Phaser.RENDERTEXTURE, this._tempMatrix = new PIXI.Matrix, PIXI.RenderTexture.call(this, width, height, this.game.renderer, scaleMode, resolution), this.render = Phaser.RenderTexture.prototype.render
        }, Phaser.RenderTexture.prototype = Object.create(PIXI.RenderTexture.prototype), Phaser.RenderTexture.prototype.constructor = Phaser.RenderTexture, Phaser.RenderTexture.prototype.renderXY = function(displayObject, x, y, clear) {
            displayObject.updateTransform(), this._tempMatrix.copyFrom(displayObject.worldTransform), this._tempMatrix.tx = x, this._tempMatrix.ty = y, this.renderer.type === PIXI.WEBGL_RENDERER ? this.renderWebGL(displayObject, this._tempMatrix, clear) : this.renderCanvas(displayObject, this._tempMatrix, clear)
        }, Phaser.RenderTexture.prototype.renderRawXY = function(displayObject, x, y, clear) {
            this._tempMatrix.identity().translate(x, y), this.renderer.type === PIXI.WEBGL_RENDERER ? this.renderWebGL(displayObject, this._tempMatrix, clear) : this.renderCanvas(displayObject, this._tempMatrix, clear)
        }, Phaser.RenderTexture.prototype.render = function(displayObject, matrix, clear) {
            void 0 === matrix || null === matrix ? this._tempMatrix.copyFrom(displayObject.worldTransform) : this._tempMatrix.copyFrom(matrix), this.renderer.type === PIXI.WEBGL_RENDERER ? this.renderWebGL(displayObject, this._tempMatrix, clear) : this.renderCanvas(displayObject, this._tempMatrix, clear)
        }, Phaser.Text = function(game, x, y, text, style) {
            x = x || 0, y = y || 0, text = void 0 === text || null === text ? "" : text.toString(), style = style || {}, this.type = Phaser.TEXT, this.physicsType = Phaser.SPRITE, this.padding = new Phaser.Point, this.textBounds = null, this.canvas = PIXI.CanvasPool.create(this), this.context = this.canvas.getContext("2d"), this.colors = [], this.strokeColors = [], this.fontStyles = [], this.fontWeights = [], this.autoRound = !1, this._res = game.renderer.resolution, this._text = text, this._fontComponents = null, this._lineSpacing = 0, this._charCount = 0, this._width = 0, this._height = 0, Phaser.Sprite.call(this, game, x, y, PIXI.Texture.fromCanvas(this.canvas)), this.setStyle(style), "" !== text && this.updateText()
        }, Phaser.Text.prototype = Object.create(Phaser.Sprite.prototype), Phaser.Text.prototype.constructor = Phaser.Text, Phaser.Text.prototype.preUpdate = function() {
            return this.preUpdatePhysics() && this.preUpdateLifeSpan() && this.preUpdateInWorld() ? this.preUpdateCore() : !1
        }, Phaser.Text.prototype.update = function() {}, Phaser.Text.prototype.destroy = function(destroyChildren) {
            this.texture.destroy(!0), PIXI.CanvasPool.remove(this), Phaser.Component.Destroy.prototype.destroy.call(this, destroyChildren)
        }, Phaser.Text.prototype.setShadow = function(x, y, color, blur, shadowStroke, shadowFill) {
            return void 0 === x && (x = 0), void 0 === y && (y = 0), void 0 === color && (color = "rgba(0, 0, 0, 1)"), void 0 === blur && (blur = 0), void 0 === shadowStroke && (shadowStroke = !0), void 0 === shadowFill && (shadowFill = !0), this.style.shadowOffsetX = x, this.style.shadowOffsetY = y, this.style.shadowColor = color, this.style.shadowBlur = blur, this.style.shadowStroke = shadowStroke, this.style.shadowFill = shadowFill, this.dirty = !0, this
        }, Phaser.Text.prototype.setStyle = function(style) {
            style = style || {}, style.font = style.font || "bold 20pt Arial", style.backgroundColor = style.backgroundColor || null, style.fill = style.fill || "black", style.align = style.align || "left", style.boundsAlignH = style.boundsAlignH || "left", style.boundsAlignV = style.boundsAlignV || "top", style.stroke = style.stroke || "black", style.strokeThickness = style.strokeThickness || 0, style.wordWrap = style.wordWrap || !1, style.wordWrapWidth = style.wordWrapWidth || 100, style.shadowOffsetX = style.shadowOffsetX || 0, style.shadowOffsetY = style.shadowOffsetY || 0, style.shadowColor = style.shadowColor || "rgba(0,0,0,0)", style.shadowBlur = style.shadowBlur || 0, style.tabs = style.tabs || 0;
            var components = this.fontToComponents(style.font);
            return style.fontStyle && (components.fontStyle = style.fontStyle), style.fontVariant && (components.fontVariant = style.fontVariant), style.fontWeight && (components.fontWeight = style.fontWeight), style.fontSize && ("number" == typeof style.fontSize && (style.fontSize = style.fontSize + "px"), components.fontSize = style.fontSize), this._fontComponents = components, style.font = this.componentsToFont(this._fontComponents), this.style = style, this.dirty = !0, this
        }, Phaser.Text.prototype.updateText = function() {
            this.texture.baseTexture.resolution = this._res, this.context.font = this.style.font;
            var outputText = this.text;
            this.style.wordWrap && (outputText = this.runWordWrap(this.text));
            for (var lines = outputText.split(/(?:\r\n|\r|\n)/), tabs = this.style.tabs, lineWidths = [], maxLineWidth = 0, fontProperties = this.determineFontProperties(this.style.font), i = 0; i < lines.length; i++) {
                if (0 === tabs) {
                    var lineWidth = this.context.measureText(lines[i]).width + this.style.strokeThickness + this.padding.x;
                    this.style.wordWrap && (lineWidth -= this.context.measureText(" ").width)
                } else {
                    var line = lines[i].split(/(?:\t)/),
                        lineWidth = this.padding.x + this.style.strokeThickness;
                    if (Array.isArray(tabs))
                        for (var tab = 0, c = 0; c < line.length; c++) {
                            var section = Math.ceil(this.context.measureText(line[c]).width);
                            c > 0 && (tab += tabs[c - 1]), lineWidth = tab + section
                        } else
                            for (var c = 0; c < line.length; c++) {
                                lineWidth += Math.ceil(this.context.measureText(line[c]).width);
                                var diff = this.game.math.snapToCeil(lineWidth, tabs) - lineWidth;
                                lineWidth += diff
                            }
                }
                lineWidths[i] = Math.ceil(lineWidth), maxLineWidth = Math.max(maxLineWidth, lineWidths[i])
            }
            this.canvas.width = maxLineWidth * this._res;
            var lineHeight = fontProperties.fontSize + this.style.strokeThickness + this.padding.y,
                height = lineHeight * lines.length,
                lineSpacing = this._lineSpacing;
            if (0 > lineSpacing && Math.abs(lineSpacing) > lineHeight && (lineSpacing = -lineHeight), 0 !== lineSpacing) {
                var diff = lineSpacing * (lines.length - 1);
                height += diff
            }
            this.canvas.height = height * this._res, this.context.scale(this._res, this._res), navigator.isCocoonJS && this.context.clearRect(0, 0, this.canvas.width, this.canvas.height), this.style.backgroundColor && (this.context.fillStyle = this.style.backgroundColor, this.context.fillRect(0, 0, this.canvas.width, this.canvas.height)), this.context.fillStyle = this.style.fill, this.context.font = this.style.font, this.context.strokeStyle = this.style.stroke, this.context.textBaseline = "alphabetic", this.context.lineWidth = this.style.strokeThickness, this.context.lineCap = "round", this.context.lineJoin = "round";
            var linePositionX, linePositionY;
            for (this._charCount = 0, i = 0; i < lines.length; i++) linePositionX = this.style.strokeThickness / 2, linePositionY = this.style.strokeThickness / 2 + i * lineHeight + fontProperties.ascent, i > 0 && (linePositionY += lineSpacing * i), "right" === this.style.align ? linePositionX += maxLineWidth - lineWidths[i] : "center" === this.style.align && (linePositionX += (maxLineWidth - lineWidths[i]) / 2), this.autoRound && (linePositionX = Math.round(linePositionX), linePositionY = Math.round(linePositionY)), this.colors.length > 0 || this.strokeColors.length > 0 || this.fontWeights.length > 0 || this.fontStyles.length > 0 ? this.updateLine(lines[i], linePositionX, linePositionY) : (this.style.stroke && this.style.strokeThickness && (this.updateShadow(this.style.shadowStroke), 0 === tabs ? this.context.strokeText(lines[i], linePositionX, linePositionY) : this.renderTabLine(lines[i], linePositionX, linePositionY, !1)), this.style.fill && (this.updateShadow(this.style.shadowFill), 0 === tabs ? this.context.fillText(lines[i], linePositionX, linePositionY) : this.renderTabLine(lines[i], linePositionX, linePositionY, !0)));
            this.updateTexture()
        }, Phaser.Text.prototype.renderTabLine = function(line, x, y, fill) {
            var text = line.split(/(?:\t)/),
                tabs = this.style.tabs,
                snap = 0;
            if (Array.isArray(tabs))
                for (var tab = 0, c = 0; c < text.length; c++) c > 0 && (tab += tabs[c - 1]), snap = x + tab, fill ? this.context.fillText(text[c], snap, y) : this.context.strokeText(text[c], snap, y);
            else
                for (var c = 0; c < text.length; c++) {
                    var section = Math.ceil(this.context.measureText(text[c]).width);
                    snap = this.game.math.snapToCeil(x, tabs), fill ? this.context.fillText(text[c], snap, y) : this.context.strokeText(text[c], snap, y), x = snap + section
                }
        }, Phaser.Text.prototype.updateShadow = function(state) {
            state ? (this.context.shadowOffsetX = this.style.shadowOffsetX, this.context.shadowOffsetY = this.style.shadowOffsetY, this.context.shadowColor = this.style.shadowColor, this.context.shadowBlur = this.style.shadowBlur) : (this.context.shadowOffsetX = 0, this.context.shadowOffsetY = 0, this.context.shadowColor = 0, this.context.shadowBlur = 0)
        }, Phaser.Text.prototype.updateLine = function(line, x, y) {
            for (var i = 0; i < line.length; i++) {
                var letter = line[i];
                if (this.fontWeights.length > 0 || this.fontStyles.length > 0) {
                    var components = this.fontToComponents(this.context.font);
                    this.fontStyles[this._charCount] && (components.fontStyle = this.fontStyles[this._charCount]), this.fontWeights[this._charCount] && (components.fontWeight = this.fontWeights[this._charCount]), this.context.font = this.componentsToFont(components)
                }
                this.style.stroke && this.style.strokeThickness && (this.strokeColors[this._charCount] && (this.context.strokeStyle = this.strokeColors[this._charCount]), this.updateShadow(this.style.shadowStroke), this.context.strokeText(letter, x, y)), this.style.fill && (this.colors[this._charCount] && (this.context.fillStyle = this.colors[this._charCount]), this.updateShadow(this.style.shadowFill), this.context.fillText(letter, x, y)), x += this.context.measureText(letter).width, this._charCount++
            }
        }, Phaser.Text.prototype.clearColors = function() {
            return this.colors = [], this.strokeColors = [], this.dirty = !0, this
        }, Phaser.Text.prototype.clearFontValues = function() {
            return this.fontStyles = [], this.fontWeights = [], this.dirty = !0, this
        }, Phaser.Text.prototype.addColor = function(color, position) {
            return this.colors[position] = color, this.dirty = !0, this
        }, Phaser.Text.prototype.addStrokeColor = function(color, position) {
            return this.strokeColors[position] = color, this.dirty = !0, this
        }, Phaser.Text.prototype.addFontStyle = function(style, position) {
            return this.fontStyles[position] = style, this.dirty = !0, this
        }, Phaser.Text.prototype.addFontWeight = function(weight, position) {
            return this.fontWeights[position] = weight, this.dirty = !0, this
        }, Phaser.Text.prototype.runWordWrap = function(text) {
            for (var result = "", lines = text.split("\n"), i = 0; i < lines.length; i++) {
                for (var spaceLeft = this.style.wordWrapWidth, words = lines[i].split(" "), j = 0; j < words.length; j++) {
                    var wordWidth = this.context.measureText(words[j]).width,
                        wordWidthWithSpace = wordWidth + this.context.measureText(" ").width;
                    wordWidthWithSpace > spaceLeft ? (j > 0 && (result += "\n"), result += words[j] + " ", spaceLeft = this.style.wordWrapWidth - wordWidth) : (spaceLeft -= wordWidthWithSpace, result += words[j] + " ")
                }
                i < lines.length - 1 && (result += "\n")
            }
            return result
        }, Phaser.Text.prototype.updateFont = function(components) {
            var font = this.componentsToFont(components);
            this.style.font !== font && (this.style.font = font, this.dirty = !0, this.parent && this.updateTransform())
        }, Phaser.Text.prototype.fontToComponents = function(font) {
            var m = font.match(/^\s*(?:\b(normal|italic|oblique|inherit)?\b)\s*(?:\b(normal|small-caps|inherit)?\b)\s*(?:\b(normal|bold|bolder|lighter|100|200|300|400|500|600|700|800|900|inherit)?\b)\s*(?:\b(xx-small|x-small|small|medium|large|x-large|xx-large|larger|smaller|0|\d*(?:[.]\d*)?(?:%|[a-z]{2,5}))?\b)\s*(.*)\s*$/);
            return m ? {
                font: font,
                fontStyle: m[1] || "normal",
                fontVariant: m[2] || "normal",
                fontWeight: m[3] || "normal",
                fontSize: m[4] || "medium",
                fontFamily: m[5]
            } : (console.warn("Phaser.Text - unparsable CSS font: " + font), {
                font: font
            })
        }, Phaser.Text.prototype.componentsToFont = function(components) {
            var v, parts = [];
            return v = components.fontStyle, v && "normal" !== v && parts.push(v), v = components.fontVariant, v && "normal" !== v && parts.push(v), v = components.fontWeight, v && "normal" !== v && parts.push(v), v = components.fontSize, v && "medium" !== v && parts.push(v), v = components.fontFamily, v && parts.push(v), parts.length || parts.push(components.font), parts.join(" ")
        }, Phaser.Text.prototype.setText = function(text) {
            return this.text = text.toString() || "", this.dirty = !0, this
        }, Phaser.Text.prototype.parseList = function(list) {
            if (!Array.isArray(list)) return this;
            for (var s = "", i = 0; i < list.length; i++) Array.isArray(list[i]) ? (s += list[i].join("	"), i < list.length - 1 && (s += "\n")) : (s += list[i], i < list.length - 1 && (s += "	"));
            return this.text = s, this.dirty = !0, this
        }, Phaser.Text.prototype.setTextBounds = function(x, y, width, height) {
            return void 0 === x ? this.textBounds = null : (this.textBounds ? this.textBounds.setTo(x, y, width, height) : this.textBounds = new Phaser.Rectangle(x, y, width, height), this.style.wordWrapWidth > width && (this.style.wordWrapWidth = width)), this.updateTexture(), this
        }, Phaser.Text.prototype.updateTexture = function() {
            var base = this.texture.baseTexture,
                crop = this.texture.crop,
                frame = this.texture.frame,
                w = this.canvas.width,
                h = this.canvas.height;
            if (base.width = w, base.height = h, crop.width = w, crop.height = h, frame.width = w, frame.height = h, this.texture.width = w, this.texture.height = h, this._width = w, this._height = h, this.textBounds) {
                var x = this.textBounds.x,
                    y = this.textBounds.y;
                "right" === this.style.boundsAlignH ? x += this.textBounds.width - this.canvas.width : "center" === this.style.boundsAlignH && (x += this.textBounds.halfWidth - this.canvas.width / 2), "bottom" === this.style.boundsAlignV ? y += this.textBounds.height - this.canvas.height : "middle" === this.style.boundsAlignV && (y += this.textBounds.halfHeight - this.canvas.height / 2), this.pivot.x = -x, this.pivot.y = -y
            }
            this.renderable = 0 !== w && 0 !== h, this.texture.requiresReTint = !0, this.texture.baseTexture.dirty()
        }, Phaser.Text.prototype._renderWebGL = function(renderSession) {
            this.dirty && (this.updateText(), this.dirty = !1), PIXI.Sprite.prototype._renderWebGL.call(this, renderSession)
        }, Phaser.Text.prototype._renderCanvas = function(renderSession) {
            this.dirty && (this.updateText(), this.dirty = !1), PIXI.Sprite.prototype._renderCanvas.call(this, renderSession)
        }, Phaser.Text.prototype.determineFontProperties = function(fontStyle) {
            var properties = Phaser.Text.fontPropertiesCache[fontStyle];
            if (!properties) {
                properties = {};
                var canvas = Phaser.Text.fontPropertiesCanvas,
                    context = Phaser.Text.fontPropertiesContext;
                context.font = fontStyle;
                var width = Math.ceil(context.measureText("|MÉq").width),
                    baseline = Math.ceil(context.measureText("|MÉq").width),
                    height = 2 * baseline;
                if (baseline = 1.4 * baseline | 0, canvas.width = width, canvas.height = height, context.fillStyle = "#f00", context.fillRect(0, 0, width, height), context.font = fontStyle, context.textBaseline = "alphabetic", context.fillStyle = "#000", context.fillText("|MÉq", 0, baseline), !context.getImageData(0, 0, width, height)) return properties.ascent = baseline, properties.descent = baseline + 6, properties.fontSize = properties.ascent + properties.descent, Phaser.Text.fontPropertiesCache[fontStyle] = properties, properties;
                var i, j, imagedata = context.getImageData(0, 0, width, height).data,
                    pixels = imagedata.length,
                    line = 4 * width,
                    idx = 0,
                    stop = !1;
                for (i = 0; baseline > i; i++) {
                    for (j = 0; line > j; j += 4)
                        if (255 !== imagedata[idx + j]) {
                            stop = !0;
                            break
                        }
                    if (stop) break;
                    idx += line
                }
                for (properties.ascent = baseline - i, idx = pixels - line, stop = !1, i = height; i > baseline; i--) {
                    for (j = 0; line > j; j += 4)
                        if (255 !== imagedata[idx + j]) {
                            stop = !0;
                            break
                        }
                    if (stop) break;
                    idx -= line
                }
                properties.descent = i - baseline, properties.descent += 6, properties.fontSize = properties.ascent + properties.descent, Phaser.Text.fontPropertiesCache[fontStyle] = properties
            }
            return properties
        }, Phaser.Text.prototype.getBounds = function(matrix) {
            return this.dirty && (this.updateText(), this.dirty = !1), PIXI.Sprite.prototype.getBounds.call(this, matrix)
        }, Object.defineProperty(Phaser.Text.prototype, "text", {
            get: function() {
                return this._text
            },
            set: function(value) {
                value !== this._text && (this._text = value.toString() || "", this.dirty = !0, this.parent && this.updateTransform())
            }
        }), Object.defineProperty(Phaser.Text.prototype, "cssFont", {
            get: function() {
                return this.componentsToFont(this._fontComponents)
            },
            set: function(value) {
                value = value || "bold 20pt Arial", this._fontComponents = this.fontToComponents(value), this.updateFont(this._fontComponents)
            }
        }), Object.defineProperty(Phaser.Text.prototype, "font", {
            get: function() {
                return this._fontComponents.fontFamily
            },
            set: function(value) {
                value = value || "Arial", value = value.trim(), /^(?:inherit|serif|sans-serif|cursive|fantasy|monospace)$/.exec(value) || /['",]/.exec(value) || (value = "'" + value + "'"), this._fontComponents.fontFamily = value, this.updateFont(this._fontComponents)
            }
        }), Object.defineProperty(Phaser.Text.prototype, "fontSize", {
            get: function() {
                var size = this._fontComponents.fontSize;
                return size && /(?:^0$|px$)/.exec(size) ? parseInt(size, 10) : size
            },
            set: function(value) {
                value = value || "0", "number" == typeof value && (value += "px"), this._fontComponents.fontSize = value, this.updateFont(this._fontComponents)
            }
        }), Object.defineProperty(Phaser.Text.prototype, "fontWeight", {
            get: function() {
                return this._fontComponents.fontWeight || "normal"
            },
            set: function(value) {
                value = value || "normal", this._fontComponents.fontWeight = value, this.updateFont(this._fontComponents)
            }
        }), Object.defineProperty(Phaser.Text.prototype, "fontStyle", {
            get: function() {
                return this._fontComponents.fontStyle || "normal"
            },
            set: function(value) {
                value = value || "normal", this._fontComponents.fontStyle = value, this.updateFont(this._fontComponents)
            }
        }), Object.defineProperty(Phaser.Text.prototype, "fontVariant", {
            get: function() {
                return this._fontComponents.fontVariant || "normal"
            },
            set: function(value) {
                value = value || "normal", this._fontComponents.fontVariant = value, this.updateFont(this._fontComponents)
            }
        }), Object.defineProperty(Phaser.Text.prototype, "fill", {
            get: function() {
                return this.style.fill
            },
            set: function(value) {
                value !== this.style.fill && (this.style.fill = value, this.dirty = !0)
            }
        }), Object.defineProperty(Phaser.Text.prototype, "align", {
            get: function() {
                return this.style.align
            },
            set: function(value) {
                value !== this.style.align && (this.style.align = value, this.dirty = !0)
            }
        }), Object.defineProperty(Phaser.Text.prototype, "resolution", {
            get: function() {
                return this._res
            },
            set: function(value) {
                value !== this._res && (this._res = value, this.dirty = !0)
            }
        }), Object.defineProperty(Phaser.Text.prototype, "tabs", {
            get: function() {
                return this.style.tabs
            },
            set: function(value) {
                value !== this.style.tabs && (this.style.tabs = value, this.dirty = !0)
            }
        }), Object.defineProperty(Phaser.Text.prototype, "boundsAlignH", {
            get: function() {
                return this.style.boundsAlignH
            },
            set: function(value) {
                value !== this.style.boundsAlignH && (this.style.boundsAlignH = value, this.dirty = !0)
            }
        }), Object.defineProperty(Phaser.Text.prototype, "boundsAlignV", {
            get: function() {
                return this.style.boundsAlignV
            },
            set: function(value) {
                value !== this.style.boundsAlignV && (this.style.boundsAlignV = value, this.dirty = !0)
            }
        }), Object.defineProperty(Phaser.Text.prototype, "stroke", {
            get: function() {
                return this.style.stroke
            },
            set: function(value) {
                value !== this.style.stroke && (this.style.stroke = value, this.dirty = !0)
            }
        }), Object.defineProperty(Phaser.Text.prototype, "strokeThickness", {
            get: function() {
                return this.style.strokeThickness
            },
            set: function(value) {
                value !== this.style.strokeThickness && (this.style.strokeThickness = value, this.dirty = !0)
            }
        }), Object.defineProperty(Phaser.Text.prototype, "wordWrap", {
            get: function() {
                return this.style.wordWrap
            },
            set: function(value) {
                value !== this.style.wordWrap && (this.style.wordWrap = value, this.dirty = !0)
            }
        }), Object.defineProperty(Phaser.Text.prototype, "wordWrapWidth", {
            get: function() {
                return this.style.wordWrapWidth
            },
            set: function(value) {
                value !== this.style.wordWrapWidth && (this.style.wordWrapWidth = value, this.dirty = !0)
            }
        }), Object.defineProperty(Phaser.Text.prototype, "lineSpacing", {
            get: function() {
                return this._lineSpacing
            },
            set: function(value) {
                value !== this._lineSpacing && (this._lineSpacing = parseFloat(value), this.dirty = !0, this.parent && this.updateTransform())
            }
        }), Object.defineProperty(Phaser.Text.prototype, "shadowOffsetX", {
            get: function() {
                return this.style.shadowOffsetX
            },
            set: function(value) {
                value !== this.style.shadowOffsetX && (this.style.shadowOffsetX = value, this.dirty = !0)
            }
        }), Object.defineProperty(Phaser.Text.prototype, "shadowOffsetY", {
            get: function() {
                return this.style.shadowOffsetY
            },
            set: function(value) {
                value !== this.style.shadowOffsetY && (this.style.shadowOffsetY = value, this.dirty = !0)
            }
        }), Object.defineProperty(Phaser.Text.prototype, "shadowColor", {
            get: function() {
                return this.style.shadowColor
            },
            set: function(value) {
                value !== this.style.shadowColor && (this.style.shadowColor = value, this.dirty = !0)
            }
        }), Object.defineProperty(Phaser.Text.prototype, "shadowBlur", {
            get: function() {
                return this.style.shadowBlur
            },
            set: function(value) {
                value !== this.style.shadowBlur && (this.style.shadowBlur = value, this.dirty = !0)
            }
        }), Object.defineProperty(Phaser.Text.prototype, "shadowStroke", {
            get: function() {
                return this.style.shadowStroke
            },
            set: function(value) {
                value !== this.style.shadowStroke && (this.style.shadowStroke = value, this.dirty = !0)
            }
        }), Object.defineProperty(Phaser.Text.prototype, "shadowFill", {
            get: function() {
                return this.style.shadowFill
            },
            set: function(value) {
                value !== this.style.shadowFill && (this.style.shadowFill = value, this.dirty = !0)
            }
        }), Object.defineProperty(Phaser.Text.prototype, "width", {
            get: function() {
                return this.dirty && (this.updateText(), this.dirty = !1), this.scale.x * this.texture.frame.width
            },
            set: function(value) {
                this.scale.x = value / this.texture.frame.width, this._width = value
            }
        }), Object.defineProperty(Phaser.Text.prototype, "height", {
            get: function() {
                return this.dirty && (this.updateText(), this.dirty = !1), this.scale.y * this.texture.frame.height
            },
            set: function(value) {
                this.scale.y = value / this.texture.frame.height, this._height = value
            }
        }), Phaser.Text.fontPropertiesCache = {}, Phaser.Text.fontPropertiesCanvas = PIXI.CanvasPool.create(Phaser.Text.fontPropertiesCanvas), Phaser.Text.fontPropertiesContext = Phaser.Text.fontPropertiesCanvas.getContext("2d"), Phaser.BitmapText = function(game, x, y, font, text, size, align) {
            x = x || 0, y = y || 0, font = font || "", text = text || "", size = size || 32, align = align || "left", PIXI.DisplayObjectContainer.call(this), this.type = Phaser.BITMAPTEXT, this.physicsType = Phaser.SPRITE, this.textWidth = 0, this.textHeight = 0, this.anchor = new Phaser.Point, this._prevAnchor = new Phaser.Point, this._glyphs = [], this._maxWidth = 0, this._text = text, this._data = game.cache.getBitmapFont(font), this._font = font, this._fontSize = size, this._align = align, this._tint = 16777215, this.updateText(), this.dirty = !1, Phaser.Component.Core.init.call(this, game, x, y, "", null)
        }, Phaser.BitmapText.prototype = Object.create(PIXI.DisplayObjectContainer.prototype), Phaser.BitmapText.prototype.constructor = Phaser.BitmapText, Phaser.Component.Core.install.call(Phaser.BitmapText.prototype, ["Angle", "AutoCull", "Bounds", "Destroy", "FixedToCamera", "InputEnabled", "InWorld", "LifeSpan", "PhysicsBody", "Reset"]), Phaser.BitmapText.prototype.preUpdatePhysics = Phaser.Component.PhysicsBody.preUpdate, Phaser.BitmapText.prototype.preUpdateLifeSpan = Phaser.Component.LifeSpan.preUpdate, Phaser.BitmapText.prototype.preUpdateInWorld = Phaser.Component.InWorld.preUpdate, Phaser.BitmapText.prototype.preUpdateCore = Phaser.Component.Core.preUpdate, Phaser.BitmapText.prototype.preUpdate = function() {
            return this.preUpdatePhysics() && this.preUpdateLifeSpan() && this.preUpdateInWorld() ? this.preUpdateCore() : !1
        }, Phaser.BitmapText.prototype.postUpdate = function() {
            Phaser.Component.PhysicsBody.postUpdate.call(this), Phaser.Component.FixedToCamera.postUpdate.call(this), this.body && this.body.type === Phaser.Physics.ARCADE && (this.textWidth !== this.body.sourceWidth || this.textHeight !== this.body.sourceHeight) && this.body.setSize(this.textWidth, this.textHeight)
        }, Phaser.BitmapText.prototype.setText = function(text) {
            this.text = text
        }, Phaser.BitmapText.prototype.scanLine = function(data, scale, text) {
            for (var x = 0, w = 0, lastSpace = -1, prevCharCode = null, maxWidth = this._maxWidth > 0 ? this._maxWidth : null, chars = [], i = 0; i < text.length; i++) {
                var end = i === text.length - 1 ? !0 : !1;
                if (/(?:\r\n|\r|\n)/.test(text.charAt(i))) return {
                    width: w,
                    text: text.substr(0, i),
                    end: end,
                    chars: chars
                };
                var charCode = text.charCodeAt(i),
                    charData = data.chars[charCode],
                    c = 0;
                if (charData) {
                    var kerning = prevCharCode && charData.kerning[prevCharCode] ? charData.kerning[prevCharCode] : 0;
                    if (lastSpace = /(\s)/.test(text.charAt(i)) ? i : lastSpace, c = (kerning + charData.texture.width + charData.xOffset) * scale, maxWidth && w + c >= maxWidth && lastSpace > -1) return {
                        width: w,
                        text: text.substr(0, i - (i - lastSpace)),
                        end: end,
                        chars: chars
                    };
                    w += charData.xAdvance * scale, chars.push(x + charData.xOffset * scale), x += charData.xAdvance * scale, prevCharCode = charCode
                }
            }
            return {
                width: w,
                text: text,
                end: end,
                chars: chars
            }
        }, Phaser.BitmapText.prototype.updateText = function() {
            var data = this._data.font;
            if (data) {
                var text = this.text,
                    scale = this._fontSize / data.size,
                    lines = [],
                    y = 0;
                this.textWidth = 0;
                do {
                    var line = this.scanLine(data, scale, text);
                    line.y = y, lines.push(line), line.width > this.textWidth && (this.textWidth = line.width), y += data.lineHeight * scale, text = text.substr(line.text.length + 1)
                } while (line.end === !1);
                this.textHeight = y;
                for (var t = 0, align = 0, ax = this.textWidth * this.anchor.x, ay = this.textHeight * this.anchor.y, i = 0; i < lines.length; i++) {
                    var line = lines[i];
                    "right" === this._align ? align = this.textWidth - line.width : "center" === this._align && (align = (this.textWidth - line.width) / 2);
                    for (var c = 0; c < line.text.length; c++) {
                        var charCode = line.text.charCodeAt(c),
                            charData = data.chars[charCode],
                            g = this._glyphs[t];
                        g ? g.texture = charData.texture : (g = new PIXI.Sprite(charData.texture), g.name = line.text[c], this._glyphs.push(g)), g.position.x = line.chars[c] + align - ax, g.position.y = line.y + charData.yOffset * scale - ay, g.scale.set(scale), g.tint = this.tint, g.texture.requiresReTint = !0, g.parent || this.addChild(g), t++
                    }
                }
                for (i = t; i < this._glyphs.length; i++) this.removeChild(this._glyphs[i])
            }
        }, Phaser.BitmapText.prototype.purgeGlyphs = function() {
            for (var len = this._glyphs.length, kept = [], i = 0; i < this._glyphs.length; i++) this._glyphs[i].parent !== this ? this._glyphs[i].destroy() : kept.push(this._glyphs[i]);
            return this._glyphs = [], this._glyphs = kept, this.updateText(), len - kept.length
        }, Phaser.BitmapText.prototype.updateTransform = function() {
            (this.dirty || !this.anchor.equals(this._prevAnchor)) && (this.updateText(), this.dirty = !1, this._prevAnchor.copyFrom(this.anchor)), PIXI.DisplayObjectContainer.prototype.updateTransform.call(this)
        }, Object.defineProperty(Phaser.BitmapText.prototype, "align", {
            get: function() {
                return this._align
            },
            set: function(value) {
                value === this._align || "left" !== value && "center" !== value && "right" !== value || (this._align = value, this.updateText())
            }
        }), Object.defineProperty(Phaser.BitmapText.prototype, "tint", {
            get: function() {
                return this._tint
            },
            set: function(value) {
                value !== this._tint && (this._tint = value, this.updateText())
            }
        }), Object.defineProperty(Phaser.BitmapText.prototype, "font", {
            get: function() {
                return this._font
            },
            set: function(value) {
                value !== this._font && (this._font = value.trim(), this._data = this.game.cache.getBitmapFont(this._font), this.updateText())
            }
        }), Object.defineProperty(Phaser.BitmapText.prototype, "fontSize", {
            get: function() {
                return this._fontSize
            },
            set: function(value) {
                value = parseInt(value, 10), value !== this._fontSize && value > 0 && (this._fontSize = value, this.updateText())
            }
        }), Object.defineProperty(Phaser.BitmapText.prototype, "text", {
            get: function() {
                return this._text
            },
            set: function(value) {
                value !== this._text && (this._text = value.toString() || "", this.updateText())
            }
        }), Object.defineProperty(Phaser.BitmapText.prototype, "maxWidth", {
            get: function() {
                return this._maxWidth
            },
            set: function(value) {
                value !== this._maxWidth && (this._maxWidth = value, this.updateText())
            }
        }), Object.defineProperty(Phaser.BitmapText.prototype, "smoothed", {
            get: function() {
                return !this._data.base.scaleMode
            },
            set: function(value) {
                value ? this._data.base.scaleMode = 0 : this._data.base.scaleMode = 1
            }
        }), Phaser.RetroFont = function(game, key, characterWidth, characterHeight, chars, charsPerRow, xSpacing, ySpacing, xOffset, yOffset) {
            if (!game.cache.checkImageKey(key)) return !1;
            (void 0 === charsPerRow || null === charsPerRow) && (charsPerRow = game.cache.getImage(key).width / characterWidth), this.characterWidth = characterWidth, this.characterHeight = characterHeight, this.characterSpacingX = xSpacing || 0, this.characterSpacingY = ySpacing || 0, this.characterPerRow = charsPerRow, this.offsetX = xOffset || 0, this.offsetY = yOffset || 0, this.align = "left", this.multiLine = !1, this.autoUpperCase = !0, this.customSpacingX = 0, this.customSpacingY = 0, this.fixedWidth = 0, this.fontSet = game.cache.getImage(key), this._text = "", this.grabData = [], this.frameData = new Phaser.FrameData;
            for (var currentX = this.offsetX, currentY = this.offsetY, r = 0, c = 0; c < chars.length; c++) {
                var frame = this.frameData.addFrame(new Phaser.Frame(c, currentX, currentY, this.characterWidth, this.characterHeight));
                this.grabData[chars.charCodeAt(c)] = frame.index, r++, r === this.characterPerRow ? (r = 0, currentX = this.offsetX, currentY += this.characterHeight + this.characterSpacingY) : currentX += this.characterWidth + this.characterSpacingX
            }
            game.cache.updateFrameData(key, this.frameData), this.stamp = new Phaser.Image(game, 0, 0, key, 0), Phaser.RenderTexture.call(this, game, 100, 100, "", Phaser.scaleModes.NEAREST), this.type = Phaser.RETROFONT
        }, Phaser.RetroFont.prototype = Object.create(Phaser.RenderTexture.prototype), Phaser.RetroFont.prototype.constructor = Phaser.RetroFont, Phaser.RetroFont.ALIGN_LEFT = "left", Phaser.RetroFont.ALIGN_RIGHT = "right", Phaser.RetroFont.ALIGN_CENTER = "center", Phaser.RetroFont.TEXT_SET1 = " !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~", Phaser.RetroFont.TEXT_SET2 = " !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ", Phaser.RetroFont.TEXT_SET3 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ", Phaser.RetroFont.TEXT_SET4 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ 0123456789", Phaser.RetroFont.TEXT_SET5 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ.,/() '!?-*:0123456789", Phaser.RetroFont.TEXT_SET6 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ!?:;0123456789\"(),-.' ", Phaser.RetroFont.TEXT_SET7 = "AGMSY+:4BHNTZ!;5CIOU.?06DJPV,(17EKQW\")28FLRX-'39", Phaser.RetroFont.TEXT_SET8 = "0123456789 .ABCDEFGHIJKLMNOPQRSTUVWXYZ", Phaser.RetroFont.TEXT_SET9 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ()-0123456789.:,'\"?!", Phaser.RetroFont.TEXT_SET10 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ", Phaser.RetroFont.TEXT_SET11 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ.,\"-+!?()':;0123456789", Phaser.RetroFont.prototype.setFixedWidth = function(width, lineAlignment) {
            void 0 === lineAlignment && (lineAlignment = "left"), this.fixedWidth = width, this.align = lineAlignment
        }, Phaser.RetroFont.prototype.setText = function(content, multiLine, characterSpacing, lineSpacing, lineAlignment, allowLowerCase) {
            this.multiLine = multiLine || !1, this.customSpacingX = characterSpacing || 0, this.customSpacingY = lineSpacing || 0, this.align = lineAlignment || "left", allowLowerCase ? this.autoUpperCase = !1 : this.autoUpperCase = !0, content.length > 0 && (this.text = content)
        }, Phaser.RetroFont.prototype.buildRetroFontText = function() {
            var cx = 0,
                cy = 0;
            if (this.clear(), this.multiLine) {
                var lines = this._text.split("\n");
                this.fixedWidth > 0 ? this.resize(this.fixedWidth, lines.length * (this.characterHeight + this.customSpacingY) - this.customSpacingY, !0) : this.resize(this.getLongestLine() * (this.characterWidth + this.customSpacingX), lines.length * (this.characterHeight + this.customSpacingY) - this.customSpacingY, !0);
                for (var i = 0; i < lines.length; i++) cx = 0, this.align === Phaser.RetroFont.ALIGN_RIGHT ? cx = this.width - lines[i].length * (this.characterWidth + this.customSpacingX) : this.align === Phaser.RetroFont.ALIGN_CENTER && (cx = this.width / 2 - lines[i].length * (this.characterWidth + this.customSpacingX) / 2, cx += this.customSpacingX / 2), 0 > cx && (cx = 0), this.pasteLine(lines[i], cx, cy, this.customSpacingX), cy += this.characterHeight + this.customSpacingY
            } else this.fixedWidth > 0 ? this.resize(this.fixedWidth, this.characterHeight, !0) : this.resize(this._text.length * (this.characterWidth + this.customSpacingX), this.characterHeight, !0), cx = 0, this.align === Phaser.RetroFont.ALIGN_RIGHT ? cx = this.width - this._text.length * (this.characterWidth + this.customSpacingX) : this.align === Phaser.RetroFont.ALIGN_CENTER && (cx = this.width / 2 - this._text.length * (this.characterWidth + this.customSpacingX) / 2, cx += this.customSpacingX / 2), 0 > cx && (cx = 0), this.pasteLine(this._text, cx, 0, this.customSpacingX);
            this.requiresReTint = !0
        }, Phaser.RetroFont.prototype.pasteLine = function(line, x, y, customSpacingX) {
            for (var c = 0; c < line.length; c++)
                if (" " === line.charAt(c)) x += this.characterWidth + customSpacingX;
                else if (this.grabData[line.charCodeAt(c)] >= 0 && (this.stamp.frame = this.grabData[line.charCodeAt(c)], this.renderXY(this.stamp, x, y, !1), x += this.characterWidth + customSpacingX, x > this.width)) break
        }, Phaser.RetroFont.prototype.getLongestLine = function() {
            var longestLine = 0;
            if (this._text.length > 0)
                for (var lines = this._text.split("\n"), i = 0; i < lines.length; i++) lines[i].length > longestLine && (longestLine = lines[i].length);
            return longestLine
        }, Phaser.RetroFont.prototype.removeUnsupportedCharacters = function(stripCR) {
            for (var newString = "", c = 0; c < this._text.length; c++) {
                var aChar = this._text[c],
                    code = aChar.charCodeAt(0);
                (this.grabData[code] >= 0 || !stripCR && "\n" === aChar) && (newString = newString.concat(aChar))
            }
            return newString
        }, Phaser.RetroFont.prototype.updateOffset = function(x, y) {
            if (this.offsetX !== x || this.offsetY !== y) {
                for (var diffX = x - this.offsetX, diffY = y - this.offsetY, frames = this.game.cache.getFrameData(this.stamp.key).getFrames(), i = frames.length; i--;) frames[i].x += diffX, frames[i].y += diffY;
                this.buildRetroFontText()
            }
        }, Object.defineProperty(Phaser.RetroFont.prototype, "text", {
            get: function() {
                return this._text
            },
            set: function(value) {
                var newText;
                newText = this.autoUpperCase ? value.toUpperCase() : value, newText !== this._text && (this._text = newText, this.removeUnsupportedCharacters(this.multiLine), this.buildRetroFontText())
            }
        }), Object.defineProperty(Phaser.RetroFont.prototype, "smoothed", {
            get: function() {
                return this.stamp.smoothed
            },
            set: function(value) {
                this.stamp.smoothed = value, this.buildRetroFontText()
            }
        }), Phaser.Rope = function(game, x, y, key, frame, points) {
            this.points = [], this.points = points, this._hasUpdateAnimation = !1, this._updateAnimationCallback = null, x = x || 0, y = y || 0, key = key || null, frame = frame || null, this.type = Phaser.ROPE, PIXI.Rope.call(this, PIXI.TextureCache.__default, this.points), Phaser.Component.Core.init.call(this, game, x, y, key, frame)
        }, Phaser.Rope.prototype = Object.create(PIXI.Rope.prototype), Phaser.Rope.prototype.constructor = Phaser.Rope, Phaser.Component.Core.install.call(Phaser.Rope.prototype, ["Angle", "Animation", "AutoCull", "Bounds", "BringToTop", "Crop", "Delta", "Destroy", "FixedToCamera", "InWorld", "LifeSpan", "LoadTexture", "Overlap", "PhysicsBody", "Reset", "ScaleMinMax", "Smoothed"]), Phaser.Rope.prototype.preUpdatePhysics = Phaser.Component.PhysicsBody.preUpdate, Phaser.Rope.prototype.preUpdateLifeSpan = Phaser.Component.LifeSpan.preUpdate, Phaser.Rope.prototype.preUpdateInWorld = Phaser.Component.InWorld.preUpdate, Phaser.Rope.prototype.preUpdateCore = Phaser.Component.Core.preUpdate, Phaser.Rope.prototype.preUpdate = function() {
            return this.preUpdatePhysics() && this.preUpdateLifeSpan() && this.preUpdateInWorld() ? this.preUpdateCore() : !1
        }, Phaser.Rope.prototype.update = function() {
            this._hasUpdateAnimation && this.updateAnimation.call(this)
        }, Phaser.Rope.prototype.reset = function(x, y) {
            return Phaser.Component.Reset.prototype.reset.call(this, x, y), this
        }, Object.defineProperty(Phaser.Rope.prototype, "updateAnimation", {
            get: function() {
                return this._updateAnimation
            },
            set: function(value) {
                value && "function" == typeof value ? (this._hasUpdateAnimation = !0, this._updateAnimation = value) : (this._hasUpdateAnimation = !1, this._updateAnimation = null)
            }
        }), Object.defineProperty(Phaser.Rope.prototype, "segments", {
            get: function() {
                for (var index, x1, y1, x2, y2, width, height, rect, segments = [], i = 0; i < this.points.length; i++) index = 4 * i, x1 = this.vertices[index] * this.scale.x, y1 = this.vertices[index + 1] * this.scale.y, x2 = this.vertices[index + 4] * this.scale.x, y2 = this.vertices[index + 3] * this.scale.y, width = Phaser.Math.difference(x1, x2), height = Phaser.Math.difference(y1, y2), x1 += this.world.x, y1 += this.world.y, rect = new Phaser.Rectangle(x1, y1, width, height), segments.push(rect);
                return segments
            }
        }), Phaser.TileSprite = function(game, x, y, width, height, key, frame) {
            x = x || 0, y = y || 0, width = width || 256, height = height || 256, key = key || null, frame = frame || null, this.type = Phaser.TILESPRITE, this.physicsType = Phaser.SPRITE, this._scroll = new Phaser.Point;
            var def = game.cache.getImage("__default", !0);
            PIXI.TilingSprite.call(this, new PIXI.Texture(def.base), width, height), Phaser.Component.Core.init.call(this, game, x, y, key, frame)
        }, Phaser.TileSprite.prototype = Object.create(PIXI.TilingSprite.prototype), Phaser.TileSprite.prototype.constructor = Phaser.TileSprite, Phaser.Component.Core.install.call(Phaser.TileSprite.prototype, ["Angle", "Animation", "AutoCull", "Bounds", "BringToTop", "Destroy", "FixedToCamera", "Health", "InCamera", "InputEnabled", "InWorld", "LifeSpan", "LoadTexture", "Overlap", "PhysicsBody", "Reset", "Smoothed"]), Phaser.TileSprite.prototype.preUpdatePhysics = Phaser.Component.PhysicsBody.preUpdate, Phaser.TileSprite.prototype.preUpdateLifeSpan = Phaser.Component.LifeSpan.preUpdate, Phaser.TileSprite.prototype.preUpdateInWorld = Phaser.Component.InWorld.preUpdate, Phaser.TileSprite.prototype.preUpdateCore = Phaser.Component.Core.preUpdate, Phaser.TileSprite.prototype.preUpdate = function() {
            return 0 !== this._scroll.x && (this.tilePosition.x += this._scroll.x * this.game.time.physicsElapsed), 0 !== this._scroll.y && (this.tilePosition.y += this._scroll.y * this.game.time.physicsElapsed), this.preUpdatePhysics() && this.preUpdateLifeSpan() && this.preUpdateInWorld() ? this.preUpdateCore() : !1
        }, Phaser.TileSprite.prototype.autoScroll = function(x, y) {
            this._scroll.set(x, y)
        }, Phaser.TileSprite.prototype.stopScroll = function() {
            this._scroll.set(0, 0)
        }, Phaser.TileSprite.prototype.destroy = function(destroyChildren) {
            Phaser.Component.Destroy.prototype.destroy.call(this, destroyChildren), PIXI.TilingSprite.prototype.destroy.call(this)
        }, Phaser.TileSprite.prototype.reset = function(x, y) {
            return Phaser.Component.Reset.prototype.reset.call(this, x, y), this.tilePosition.x = 0, this.tilePosition.y = 0, this
        }, Phaser.Device = function() {
            this.deviceReadyAt = 0, this.initialized = !1, this.desktop = !1, this.iOS = !1, this.iOSVersion = 0, this.cocoonJS = !1, this.cocoonJSApp = !1, this.cordova = !1, this.node = !1, this.nodeWebkit = !1, this.electron = !1, this.ejecta = !1, this.crosswalk = !1, this.android = !1, this.chromeOS = !1, this.linux = !1, this.macOS = !1, this.windows = !1, this.windowsPhone = !1, this.canvas = !1, this.canvasBitBltShift = null, this.webGL = !1, this.file = !1, this.fileSystem = !1, this.localStorage = !1, this.worker = !1, this.css3D = !1, this.pointerLock = !1, this.typedArray = !1, this.vibration = !1, this.getUserMedia = !0, this.quirksMode = !1, this.touch = !1, this.mspointer = !1, this.wheelEvent = null, this.arora = !1, this.chrome = !1, this.chromeVersion = 0, this.epiphany = !1, this.firefox = !1, this.firefoxVersion = 0, this.ie = !1, this.ieVersion = 0, this.trident = !1, this.tridentVersion = 0, this.mobileSafari = !1, this.midori = !1, this.opera = !1, this.safari = !1, this.webApp = !1, this.silk = !1, this.audioData = !1, this.webAudio = !1, this.ogg = !1, this.opus = !1, this.mp3 = !1, this.wav = !1, this.m4a = !1, this.webm = !1, this.oggVideo = !1, this.h264Video = !1, this.mp4Video = !1, this.webmVideo = !1, this.vp9Video = !1, this.hlsVideo = !1, this.iPhone = !1, this.iPhone4 = !1, this.iPad = !1, this.pixelRatio = 0, this.littleEndian = !1, this.LITTLE_ENDIAN = !1, this.support32bit = !1, this.fullscreen = !1, this.requestFullscreen = "", this.cancelFullscreen = "", this.fullscreenKeyboard = !1
        }, Phaser.Device = new Phaser.Device, Phaser.Device.onInitialized = new Phaser.Signal, Phaser.Device.whenReady = function(callback, context, nonPrimer) {
            var readyCheck = this._readyCheck;
            if (this.deviceReadyAt || !readyCheck) callback.call(context, this);
            else if (readyCheck._monitor || nonPrimer) readyCheck._queue = readyCheck._queue || [], readyCheck._queue.push([callback, context]);
            else {
                readyCheck._monitor = readyCheck.bind(this), readyCheck._queue = readyCheck._queue || [], readyCheck._queue.push([callback, context]);
                var cordova = "undefined" != typeof window.cordova,
                    cocoonJS = navigator.isCocoonJS;
                "complete" === document.readyState || "interactive" === document.readyState ? window.setTimeout(readyCheck._monitor, 0) : cordova && !cocoonJS ? document.addEventListener("deviceready", readyCheck._monitor, !1) : (document.addEventListener("DOMContentLoaded", readyCheck._monitor, !1), window.addEventListener("load", readyCheck._monitor, !1))
            }
        }, Phaser.Device._readyCheck = function() {
            var readyCheck = this._readyCheck;
            if (document.body) {
                if (!this.deviceReadyAt) {
                    this.deviceReadyAt = Date.now(), document.removeEventListener("deviceready", readyCheck._monitor), document.removeEventListener("DOMContentLoaded", readyCheck._monitor), window.removeEventListener("load", readyCheck._monitor), this._initialize(), this.initialized = !0, this.onInitialized.dispatch(this);
                    for (var item; item = readyCheck._queue.shift();) {
                        var callback = item[0],
                            context = item[1];
                        callback.call(context, this)
                    }
                    this._readyCheck = null, this._initialize = null, this.onInitialized = null
                }
            } else window.setTimeout(readyCheck._monitor, 20)
        }, Phaser.Device._initialize = function() {
            function _checkOS() {
                var ua = navigator.userAgent;
                /Playstation Vita/.test(ua) ? device.vita = !0 : /Kindle/.test(ua) || /\bKF[A-Z][A-Z]+/.test(ua) || /Silk.*Mobile Safari/.test(ua) ? device.kindle = !0 : /Android/.test(ua) ? device.android = !0 : /CrOS/.test(ua) ? device.chromeOS = !0 : /iP[ao]d|iPhone/i.test(ua) ? (device.iOS = !0, navigator.appVersion.match(/OS (\d+)/), device.iOSVersion = parseInt(RegExp.$1, 10)) : /Linux/.test(ua) ? device.linux = !0 : /Mac OS/.test(ua) ? device.macOS = !0 : /Windows/.test(ua) && (device.windows = !0), (/Windows Phone/i.test(ua) || /IEMobile/i.test(ua)) && (device.android = !1, device.iOS = !1, device.macOS = !1, device.windows = !0, device.windowsPhone = !0);
                var silk = /Silk/.test(ua);
                (device.windows || device.macOS || device.linux && !silk || device.chromeOS) && (device.desktop = !0), (device.windowsPhone || /Windows NT/i.test(ua) && /Touch/i.test(ua)) && (device.desktop = !1)
            }

            function _checkFeatures() {
                device.canvas = !!window.CanvasRenderingContext2D || device.cocoonJS;
                try {
                    device.localStorage = !!localStorage.getItem
                } catch (error) {
                    device.localStorage = !1
                }
                device.file = !!(window.File && window.FileReader && window.FileList && window.Blob), device.fileSystem = !!window.requestFileSystem, device.webGL = function() {
                    try {
                        var canvas = document.createElement("canvas");
                        return canvas.screencanvas = !1, !!window.WebGLRenderingContext && (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
                    } catch (e) {
                        return !1
                    }
                }(), device.webGL = !!device.webGL, device.worker = !!window.Worker, device.pointerLock = "pointerLockElement" in document || "mozPointerLockElement" in document || "webkitPointerLockElement" in document, device.quirksMode = "CSS1Compat" === document.compatMode ? !1 : !0, navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia || navigator.oGetUserMedia, window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL, device.getUserMedia = device.getUserMedia && !!navigator.getUserMedia && !!window.URL, device.firefox && device.firefoxVersion < 21 && (device.getUserMedia = !1), !device.iOS && (device.ie || device.firefox || device.chrome) && (device.canvasBitBltShift = !0), (device.safari || device.mobileSafari) && (device.canvasBitBltShift = !1)
            }

            function _checkInput() {
                ("ontouchstart" in document.documentElement || window.navigator.maxTouchPoints && window.navigator.maxTouchPoints >= 1) && (device.touch = !0), (window.navigator.msPointerEnabled || window.navigator.pointerEnabled) && (device.mspointer = !0), device.cocoonJS || ("onwheel" in window || device.ie && "WheelEvent" in window ? device.wheelEvent = "wheel" : "onmousewheel" in window ? device.wheelEvent = "mousewheel" : device.firefox && "MouseScrollEvent" in window && (device.wheelEvent = "DOMMouseScroll"))
            }

            function _checkFullScreenSupport() {
                for (var fs = ["requestFullscreen", "requestFullScreen", "webkitRequestFullscreen", "webkitRequestFullScreen", "msRequestFullscreen", "msRequestFullScreen", "mozRequestFullScreen", "mozRequestFullscreen"], element = document.createElement("div"), i = 0; i < fs.length; i++)
                    if (element[fs[i]]) {
                        device.fullscreen = !0, device.requestFullscreen = fs[i];
                        break
                    }
                var cfs = ["cancelFullScreen", "exitFullscreen", "webkitCancelFullScreen", "webkitExitFullscreen", "msCancelFullScreen", "msExitFullscreen", "mozCancelFullScreen", "mozExitFullscreen"];
                if (device.fullscreen)
                    for (var i = 0; i < cfs.length; i++)
                        if (document[cfs[i]]) {
                            device.cancelFullscreen = cfs[i];
                            break
                        }
                window.Element && Element.ALLOW_KEYBOARD_INPUT && (device.fullscreenKeyboard = !0)
            }

            function _checkBrowser() {
                var ua = navigator.userAgent;
                if (/Arora/.test(ua) ? device.arora = !0 : /Chrome\/(\d+)/.test(ua) && !device.windowsPhone ? (device.chrome = !0, device.chromeVersion = parseInt(RegExp.$1, 10)) : /Epiphany/.test(ua) ? device.epiphany = !0 : /Firefox\D+(\d+)/.test(ua) ? (device.firefox = !0, device.firefoxVersion = parseInt(RegExp.$1, 10)) : /AppleWebKit/.test(ua) && device.iOS ? device.mobileSafari = !0 : /MSIE (\d+\.\d+);/.test(ua) ? (device.ie = !0, device.ieVersion = parseInt(RegExp.$1, 10)) : /Midori/.test(ua) ? device.midori = !0 : /Opera/.test(ua) ? device.opera = !0 : /Safari/.test(ua) && !device.windowsPhone ? device.safari = !0 : /Trident\/(\d+\.\d+)(.*)rv:(\d+\.\d+)/.test(ua) && (device.ie = !0, device.trident = !0, device.tridentVersion = parseInt(RegExp.$1, 10), device.ieVersion = parseInt(RegExp.$3, 10)), /Silk/.test(ua) && (device.silk = !0), navigator.standalone && (device.webApp = !0), "undefined" != typeof window.cordova && (device.cordova = !0), "undefined" != typeof process && "undefined" != typeof require && (device.node = !0), device.node && "object" == typeof process.versions && (device.nodeWebkit = !!process.versions["node-webkit"], device.electron = !!process.versions.electron), navigator.isCocoonJS && (device.cocoonJS = !0), device.cocoonJS) try {
                    device.cocoonJSApp = "undefined" != typeof CocoonJS
                } catch (error) {
                    device.cocoonJSApp = !1
                }
                "undefined" != typeof window.ejecta && (device.ejecta = !0), /Crosswalk/.test(ua) && (device.crosswalk = !0)
            }

            function _checkVideo() {
                var videoElement = document.createElement("video"),
                    result = !1;
                try {
                    (result = !!videoElement.canPlayType) && (videoElement.canPlayType('video/ogg; codecs="theora"').replace(/^no$/, "") && (device.oggVideo = !0), videoElement.canPlayType('video/mp4; codecs="avc1.42E01E"').replace(/^no$/, "") && (device.h264Video = !0, device.mp4Video = !0), videoElement.canPlayType('video/webm; codecs="vp8, vorbis"').replace(/^no$/, "") && (device.webmVideo = !0), videoElement.canPlayType('video/webm; codecs="vp9"').replace(/^no$/, "") && (device.vp9Video = !0), videoElement.canPlayType('application/x-mpegURL; codecs="avc1.42E01E"').replace(/^no$/, "") && (device.hlsVideo = !0))
                } catch (e) {}
            }

            function _checkAudio() {
                device.audioData = !!window.Audio, device.webAudio = !(!window.AudioContext && !window.webkitAudioContext);
                var audioElement = document.createElement("audio"),
                    result = !1;
                try {
                    (result = !!audioElement.canPlayType) && (audioElement.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, "") && (device.ogg = !0), (audioElement.canPlayType('audio/ogg; codecs="opus"').replace(/^no$/, "") || audioElement.canPlayType("audio/opus;").replace(/^no$/, "")) && (device.opus = !0), audioElement.canPlayType("audio/mpeg;").replace(/^no$/, "") && (device.mp3 = !0), audioElement.canPlayType('audio/wav; codecs="1"').replace(/^no$/, "") && (device.wav = !0), (audioElement.canPlayType("audio/x-m4a;") || audioElement.canPlayType("audio/aac;").replace(/^no$/, "")) && (device.m4a = !0), audioElement.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/, "") && (device.webm = !0))
                } catch (e) {}
            }

            function _checkDevice() {
                device.pixelRatio = window.devicePixelRatio || 1, device.iPhone = -1 != navigator.userAgent.toLowerCase().indexOf("iphone"), device.iPhone4 = 2 == device.pixelRatio && device.iPhone, device.iPad = -1 != navigator.userAgent.toLowerCase().indexOf("ipad"), "undefined" != typeof Int8Array ? device.typedArray = !0 : device.typedArray = !1, "undefined" != typeof ArrayBuffer && "undefined" != typeof Uint8Array && "undefined" != typeof Uint32Array && (device.littleEndian = _checkIsLittleEndian(), device.LITTLE_ENDIAN = device.littleEndian), device.support32bit = "undefined" != typeof ArrayBuffer && "undefined" != typeof Uint8ClampedArray && "undefined" != typeof Int32Array && null !== device.littleEndian && _checkIsUint8ClampedImageData(), navigator.vibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate, navigator.vibrate && (device.vibration = !0)
            }

            function _checkIsLittleEndian() {
                var a = new ArrayBuffer(4),
                    b = new Uint8Array(a),
                    c = new Uint32Array(a);
                return b[0] = 161, b[1] = 178, b[2] = 195, b[3] = 212, 3569595041 == c[0] ? !0 : 2712847316 == c[0] ? !1 : null
            }

            function _checkIsUint8ClampedImageData() {
                if (void 0 === Uint8ClampedArray) return !1;
                var elem = PIXI.CanvasPool.create(this, 1, 1),
                    ctx = elem.getContext("2d");
                if (!ctx) return !1;
                var image = ctx.createImageData(1, 1);
                return PIXI.CanvasPool.remove(this), image.data instanceof Uint8ClampedArray
            }

            function _checkCSS3D() {
                var has3d, el = document.createElement("p"),
                    transforms = {
                        webkitTransform: "-webkit-transform",
                        OTransform: "-o-transform",
                        msTransform: "-ms-transform",
                        MozTransform: "-moz-transform",
                        transform: "transform"
                    };
                document.body.insertBefore(el, null);
                for (var t in transforms) void 0 !== el.style[t] && (el.style[t] = "translate3d(1px,1px,1px)", has3d = window.getComputedStyle(el).getPropertyValue(transforms[t]));
                document.body.removeChild(el), device.css3D = void 0 !== has3d && has3d.length > 0 && "none" !== has3d
            }
            var device = this;
            _checkOS(), _checkAudio(), _checkVideo(), _checkBrowser(), _checkCSS3D(), _checkDevice(), _checkFeatures(), _checkFullScreenSupport(), _checkInput()
        }, Phaser.Device.canPlayAudio = function(type) {
            return "mp3" === type && this.mp3 ? !0 : "ogg" === type && (this.ogg || this.opus) ? !0 : "m4a" === type && this.m4a ? !0 : "opus" === type && this.opus ? !0 : "wav" === type && this.wav ? !0 : "webm" === type && this.webm ? !0 : !1
        }, Phaser.Device.canPlayVideo = function(type) {
            return "webm" === type && (this.webmVideo || this.vp9Video) ? !0 : "mp4" === type && (this.mp4Video || this.h264Video) ? !0 : "ogg" !== type && "ogv" !== type || !this.oggVideo ? "mpeg" === type && this.hlsVideo ? !0 : !1 : !0
        }, Phaser.Device.isConsoleOpen = function() {
            return window.console && window.console.firebug ? !0 : window.console && (console.profile(), console.profileEnd(), console.clear && console.clear(), console.profiles) ? console.profiles.length > 0 : !1
        }, Phaser.Device.isAndroidStockBrowser = function() {
            var matches = window.navigator.userAgent.match(/Android.*AppleWebKit\/([\d.]+)/);
            return matches && matches[1] < 537
        }, Phaser.Canvas = {
            create: function(parent, width, height, id, skipPool) {
                if (width = width || 256, height = height || 256, void 0 === skipPool) var canvas = PIXI.CanvasPool.create(parent, width, height);
                else var canvas = document.createElement("canvas");
                return "string" == typeof id && "" !== id && (canvas.id = id), canvas.width = width, canvas.height = height, canvas.style.display = "block", canvas
            },
            setBackgroundColor: function(canvas, color) {
                return color = color || "rgb(0,0,0)", canvas.style.backgroundColor = color, canvas
            },
            setTouchAction: function(canvas, value) {
                return value = value || "none", canvas.style.msTouchAction = value, canvas.style["ms-touch-action"] = value, canvas.style["touch-action"] = value, canvas
            },
            setUserSelect: function(canvas, value) {
                return value = value || "none", canvas.style["-webkit-touch-callout"] = value, canvas.style["-webkit-user-select"] = value, canvas.style["-khtml-user-select"] = value, canvas.style["-moz-user-select"] = value, canvas.style["-ms-user-select"] = value, canvas.style["user-select"] = value, canvas.style["-webkit-tap-highlight-color"] = "rgba(0, 0, 0, 0)", canvas
            },
            addToDOM: function(canvas, parent, overflowHidden) {
                var target;
                return void 0 === overflowHidden && (overflowHidden = !0), parent && ("string" == typeof parent ? target = document.getElementById(parent) : "object" == typeof parent && 1 === parent.nodeType && (target = parent)), target || (target = document.body), overflowHidden && target.style && (target.style.overflow = "hidden"), target.appendChild(canvas), canvas
            },
            removeFromDOM: function(canvas) {
                canvas.parentNode && canvas.parentNode.removeChild(canvas)
            },
            setTransform: function(context, translateX, translateY, scaleX, scaleY, skewX, skewY) {
                return context.setTransform(scaleX, skewX, skewY, scaleY, translateX, translateY), context
            },
            setSmoothingEnabled: function(context, value) {
                var s = Phaser.Canvas.getSmoothingPrefix(context);
                return s && (context[s] = value), context
            },
            getSmoothingPrefix: function(context) {
                var vendor = ["i", "webkitI", "msI", "mozI", "oI"];
                for (var prefix in vendor) {
                    var s = vendor[prefix] + "mageSmoothingEnabled";
                    if (s in context) return s
                }
                return null
            },
            getSmoothingEnabled: function(context) {
                var s = Phaser.Canvas.getSmoothingPrefix(context);
                return s ? context[s] : void 0
            },
            setImageRenderingCrisp: function(canvas) {
                for (var types = ["optimizeSpeed", "crisp-edges", "-moz-crisp-edges", "-webkit-optimize-contrast", "optimize-contrast", "pixelated"], i = 0; i < types.length; i++) canvas.style["image-rendering"] = types[i];
                return canvas.style.msInterpolationMode = "nearest-neighbor", canvas
            },
            setImageRenderingBicubic: function(canvas) {
                return canvas.style["image-rendering"] = "auto", canvas.style.msInterpolationMode = "bicubic", canvas
            }
        }, Phaser.RequestAnimationFrame = function(game, forceSetTimeOut) {
            void 0 === forceSetTimeOut && (forceSetTimeOut = !1), this.game = game, this.isRunning = !1, this.forceSetTimeOut = forceSetTimeOut;
            for (var vendors = ["ms", "moz", "webkit", "o"], x = 0; x < vendors.length && !window.requestAnimationFrame; x++) window.requestAnimationFrame = window[vendors[x] + "RequestAnimationFrame"], window.cancelAnimationFrame = window[vendors[x] + "CancelAnimationFrame"];
            this._isSetTimeOut = !1, this._onLoop = null, this._timeOutID = null
        }, Phaser.RequestAnimationFrame.prototype = {
            start: function() {
                this.isRunning = !0;
                var _this = this;
                !window.requestAnimationFrame || this.forceSetTimeOut ? (this._isSetTimeOut = !0, this._onLoop = function() {
                    return _this.updateSetTimeout()
                }, this._timeOutID = window.setTimeout(this._onLoop, 0)) : (this._isSetTimeOut = !1, this._onLoop = function(time) {
                    return _this.updateRAF(time)
                }, this._timeOutID = window.requestAnimationFrame(this._onLoop))
            },
            updateRAF: function(rafTime) {
                this.game.update(Math.floor(rafTime)), this._timeOutID = window.requestAnimationFrame(this._onLoop)
            },
            updateSetTimeout: function() {
                this.game.update(Date.now()), this._timeOutID = window.setTimeout(this._onLoop, this.game.time.timeToCall)
            },
            stop: function() {
                this._isSetTimeOut ? clearTimeout(this._timeOutID) : window.cancelAnimationFrame(this._timeOutID), this.isRunning = !1
            },
            isSetTimeOut: function() {
                return this._isSetTimeOut
            },
            isRAF: function() {
                return this._isSetTimeOut === !1
            }
        }, Phaser.RequestAnimationFrame.prototype.constructor = Phaser.RequestAnimationFrame, Phaser.Math = {
            PI2: 2 * Math.PI,
            fuzzyEqual: function(a, b, epsilon) {
                return void 0 === epsilon && (epsilon = 1e-4), Math.abs(a - b) < epsilon
            },
            fuzzyLessThan: function(a, b, epsilon) {
                return void 0 === epsilon && (epsilon = 1e-4), b + epsilon > a
            },
            fuzzyGreaterThan: function(a, b, epsilon) {
                return void 0 === epsilon && (epsilon = 1e-4), a > b - epsilon
            },
            fuzzyCeil: function(val, epsilon) {
                return void 0 === epsilon && (epsilon = 1e-4), Math.ceil(val - epsilon)
            },
            fuzzyFloor: function(val, epsilon) {
                return void 0 === epsilon && (epsilon = 1e-4), Math.floor(val + epsilon)
            },
            average: function() {
                for (var sum = 0, len = arguments.length, i = 0; len > i; i++) sum += +arguments[i];
                return sum / len
            },
            shear: function(n) {
                return n % 1
            },
            snapTo: function(input, gap, start) {
                return void 0 === start && (start = 0), 0 === gap ? input : (input -= start, input = gap * Math.round(input / gap), start + input)
            },
            snapToFloor: function(input, gap, start) {
                return void 0 === start && (start = 0), 0 === gap ? input : (input -= start, input = gap * Math.floor(input / gap), start + input)
            },
            snapToCeil: function(input, gap, start) {
                return void 0 === start && (start = 0), 0 === gap ? input : (input -= start, input = gap * Math.ceil(input / gap), start + input)
            },
            roundTo: function(value, place, base) {
                void 0 === place && (place = 0), void 0 === base && (base = 10);
                var p = Math.pow(base, -place);
                return Math.round(value * p) / p
            },
            floorTo: function(value, place, base) {
                void 0 === place && (place = 0), void 0 === base && (base = 10);
                var p = Math.pow(base, -place);
                return Math.floor(value * p) / p
            },
            ceilTo: function(value, place, base) {
                void 0 === place && (place = 0), void 0 === base && (base = 10);
                var p = Math.pow(base, -place);
                return Math.ceil(value * p) / p
            },
            angleBetween: function(x1, y1, x2, y2) {
                return Math.atan2(y2 - y1, x2 - x1)
            },
            angleBetweenY: function(x1, y1, x2, y2) {
                return Math.atan2(x2 - x1, y2 - y1)
            },
            angleBetweenPoints: function(point1, point2) {
                return Math.atan2(point2.y - point1.y, point2.x - point1.x)
            },
            angleBetweenPointsY: function(point1, point2) {
                return Math.atan2(point2.x - point1.x, point2.y - point1.y)
            },
            reverseAngle: function(angleRad) {
                return this.normalizeAngle(angleRad + Math.PI, !0)
            },
            normalizeAngle: function(angleRad) {
                return angleRad %= 2 * Math.PI, angleRad >= 0 ? angleRad : angleRad + 2 * Math.PI
            },
            maxAdd: function(value, amount, max) {
                return Math.min(value + amount, max)
            },
            minSub: function(value, amount, min) {
                return Math.max(value - amount, min)
            },
            wrap: function(value, min, max) {
                var range = max - min;
                if (0 >= range) return 0;
                var result = (value - min) % range;
                return 0 > result && (result += range), result + min
            },
            wrapValue: function(value, amount, max) {
                var diff;
                return value = Math.abs(value), amount = Math.abs(amount), max = Math.abs(max), diff = (value + amount) % max
            },
            isOdd: function(n) {
                return !!(1 & n)
            },
            isEven: function(n) {
                return !(1 & n)
            },
            min: function() {
                if (1 === arguments.length && "object" == typeof arguments[0]) var data = arguments[0];
                else var data = arguments;
                for (var i = 1, min = 0, len = data.length; len > i; i++) data[i] < data[min] && (min = i);
                return data[min]
            },
            max: function() {
                if (1 === arguments.length && "object" == typeof arguments[0]) var data = arguments[0];
                else var data = arguments;
                for (var i = 1, max = 0, len = data.length; len > i; i++) data[i] > data[max] && (max = i);
                return data[max]
            },
            minProperty: function(property) {
                if (2 === arguments.length && "object" == typeof arguments[1]) var data = arguments[1];
                else var data = arguments.slice(1);
                for (var i = 1, min = 0, len = data.length; len > i; i++) data[i][property] < data[min][property] && (min = i);
                return data[min][property]
            },
            maxProperty: function(property) {
                if (2 === arguments.length && "object" == typeof arguments[1]) var data = arguments[1];
                else var data = arguments.slice(1);
                for (var i = 1, max = 0, len = data.length; len > i; i++) data[i][property] > data[max][property] && (max = i);
                return data[max][property]
            },
            wrapAngle: function(angle, radians) {
                return radians ? this.wrap(angle, -Math.PI, Math.PI) : this.wrap(angle, -180, 180)
            },
            linearInterpolation: function(v, k) {
                var m = v.length - 1,
                    f = m * k,
                    i = Math.floor(f);
                return 0 > k ? this.linear(v[0], v[1], f) : k > 1 ? this.linear(v[m], v[m - 1], m - f) : this.linear(v[i], v[i + 1 > m ? m : i + 1], f - i)
            },
            bezierInterpolation: function(v, k) {
                for (var b = 0, n = v.length - 1, i = 0; n >= i; i++) b += Math.pow(1 - k, n - i) * Math.pow(k, i) * v[i] * this.bernstein(n, i);
                return b
            },
            catmullRomInterpolation: function(v, k) {
                var m = v.length - 1,
                    f = m * k,
                    i = Math.floor(f);
                return v[0] === v[m] ? (0 > k && (i = Math.floor(f = m * (1 + k))), this.catmullRom(v[(i - 1 + m) % m], v[i], v[(i + 1) % m], v[(i + 2) % m], f - i)) : 0 > k ? v[0] - (this.catmullRom(v[0], v[0], v[1], v[1], -f) - v[0]) : k > 1 ? v[m] - (this.catmullRom(v[m], v[m], v[m - 1], v[m - 1], f - m) - v[m]) : this.catmullRom(v[i ? i - 1 : 0], v[i], v[i + 1 > m ? m : i + 1], v[i + 2 > m ? m : i + 2], f - i)
            },
            linear: function(p0, p1, t) {
                return (p1 - p0) * t + p0
            },
            bernstein: function(n, i) {
                return this.factorial(n) / this.factorial(i) / this.factorial(n - i)
            },
            factorial: function(value) {
                if (0 === value) return 1;
                for (var res = value; --value;) res *= value;
                return res
            },
            catmullRom: function(p0, p1, p2, p3, t) {
                var v0 = .5 * (p2 - p0),
                    v1 = .5 * (p3 - p1),
                    t2 = t * t,
                    t3 = t * t2;
                return (2 * p1 - 2 * p2 + v0 + v1) * t3 + (-3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 + v0 * t + p1
            },
            difference: function(a, b) {
                return Math.abs(a - b)
            },
            roundAwayFromZero: function(value) {
                return value > 0 ? Math.ceil(value) : Math.floor(value)
            },
            sinCosGenerator: function(length, sinAmplitude, cosAmplitude, frequency) {
                void 0 === sinAmplitude && (sinAmplitude = 1), void 0 === cosAmplitude && (cosAmplitude = 1), void 0 === frequency && (frequency = 1);
                for (var sin = sinAmplitude, cos = cosAmplitude, frq = frequency * Math.PI / length, cosTable = [], sinTable = [], c = 0; length > c; c++) cos -= sin * frq, sin += cos * frq, cosTable[c] = cos, sinTable[c] = sin;
                return {
                    sin: sinTable,
                    cos: cosTable,
                    length: length
                }
            },
            distance: function(x1, y1, x2, y2) {
                var dx = x1 - x2,
                    dy = y1 - y2;
                return Math.sqrt(dx * dx + dy * dy)
            },
            distanceSq: function(x1, y1, x2, y2) {
                var dx = x1 - x2,
                    dy = y1 - y2;
                return dx * dx + dy * dy
            },
            distancePow: function(x1, y1, x2, y2, pow) {
                return void 0 === pow && (pow = 2), Math.sqrt(Math.pow(x2 - x1, pow) + Math.pow(y2 - y1, pow))
            },
            clamp: function(x, a, b) {
                return a > x ? a : x > b ? b : x
            },
            clampBottom: function(x, a) {
                return a > x ? a : x
            },
            within: function(a, b, tolerance) {
                return Math.abs(a - b) <= tolerance
            },
            mapLinear: function(x, a1, a2, b1, b2) {
                return b1 + (x - a1) * (b2 - b1) / (a2 - a1)
            },
            smoothstep: function(x, min, max) {
                return x = Math.max(0, Math.min(1, (x - min) / (max - min))), x * x * (3 - 2 * x)
            },
            smootherstep: function(x, min, max) {
                return x = Math.max(0, Math.min(1, (x - min) / (max - min))), x * x * x * (x * (6 * x - 15) + 10)
            },
            sign: function(x) {
                return 0 > x ? -1 : x > 0 ? 1 : 0
            },
            percent: function(a, b, base) {
                return void 0 === base && (base = 0), a > b || base > b ? 1 : base > a || base > a ? 0 : (a - base) / b
            }
        };
        var degreeToRadiansFactor = Math.PI / 180,
            radianToDegreesFactor = 180 / Math.PI;
        return Phaser.Math.degToRad = function(degrees) {
            return degrees * degreeToRadiansFactor
        }, Phaser.Math.radToDeg = function(radians) {
            return radians * radianToDegreesFactor
        }, Phaser.RandomDataGenerator = function(seeds) {
            void 0 === seeds && (seeds = []), this.c = 1, this.s0 = 0, this.s1 = 0, this.s2 = 0, "string" == typeof seeds ? this.state(seeds) : this.sow(seeds)
        }, Phaser.RandomDataGenerator.prototype = {
            rnd: function() {
                var t = 2091639 * this.s0 + 2.3283064365386963e-10 * this.c;
                return this.c = 0 | t, this.s0 = this.s1, this.s1 = this.s2, this.s2 = t - this.c, this.s2
            },
            sow: function(seeds) {
                if (this.s0 = this.hash(" "), this.s1 = this.hash(this.s0), this.s2 = this.hash(this.s1), this.c = 1, seeds)
                    for (var i = 0; i < seeds.length && null != seeds[i]; i++) {
                        var seed = seeds[i];
                        this.s0 -= this.hash(seed), this.s0 += ~~(this.s0 < 0), this.s1 -= this.hash(seed), this.s1 += ~~(this.s1 < 0), this.s2 -= this.hash(seed), this.s2 += ~~(this.s2 < 0)
                    }
            },
            hash: function(data) {
                var h, i, n;
                for (n = 4022871197, data = data.toString(), i = 0; i < data.length; i++) n += data.charCodeAt(i), h = .02519603282416938 * n, n = h >>> 0, h -= n, h *= n, n = h >>> 0, h -= n, n += 4294967296 * h;
                return 2.3283064365386963e-10 * (n >>> 0)
            },
            integer: function() {
                return 4294967296 * this.rnd.apply(this)
            },
            frac: function() {
                return this.rnd.apply(this) + 1.1102230246251565e-16 * (2097152 * this.rnd.apply(this) | 0)
            },
            real: function() {
                return this.integer() + this.frac()
            },
            integerInRange: function(min, max) {
                return Math.floor(this.realInRange(0, max - min + 1) + min)
            },
            between: function(min, max) {
                return this.integerInRange(min, max)
            },
            realInRange: function(min, max) {
                return this.frac() * (max - min) + min
            },
            normal: function() {
                return 1 - 2 * this.frac()
            },
            uuid: function() {
                var a = "",
                    b = "";
                for (b = a = ""; a++ < 36; b += ~a % 5 | 3 * a & 4 ? (15 ^ a ? 8 ^ this.frac() * (20 ^ a ? 16 : 4) : 4).toString(16) : "-");
                return b
            },
            pick: function(ary) {
                return ary[this.integerInRange(0, ary.length - 1)]
            },
            weightedPick: function(ary) {
                return ary[~~(Math.pow(this.frac(), 2) * (ary.length - 1) + .5)]
            },
            timestamp: function(min, max) {
                return this.realInRange(min || 9466848e5, max || 1577862e6)
            },
            angle: function() {
                return this.integerInRange(-180, 180)
            },
            state: function(state) {
                return "string" == typeof state && state.match(/^!rnd/) && (state = state.split(","), this.c = parseFloat(state[1]), this.s0 = parseFloat(state[2]), this.s1 = parseFloat(state[3]), this.s2 = parseFloat(state[4])), ["!rnd", this.c, this.s0, this.s1, this.s2].join(",")
            }
        }, Phaser.RandomDataGenerator.prototype.constructor = Phaser.RandomDataGenerator, Phaser.QuadTree = function(x, y, width, height, maxObjects, maxLevels, level) {
            this.maxObjects = 10, this.maxLevels = 4, this.level = 0, this.bounds = {}, this.objects = [], this.nodes = [], this._empty = [], this.reset(x, y, width, height, maxObjects, maxLevels, level)
        }, Phaser.QuadTree.prototype = {
            reset: function(x, y, width, height, maxObjects, maxLevels, level) {
                this.maxObjects = maxObjects || 10, this.maxLevels = maxLevels || 4, this.level = level || 0, this.bounds = {
                    x: Math.round(x),
                    y: Math.round(y),
                    width: width,
                    height: height,
                    subWidth: Math.floor(width / 2),
                    subHeight: Math.floor(height / 2),
                    right: Math.round(x) + Math.floor(width / 2),
                    bottom: Math.round(y) + Math.floor(height / 2)
                }, this.objects.length = 0, this.nodes.length = 0
            },
            populate: function(group) {
                group.forEach(this.populateHandler, this, !0)
            },
            populateHandler: function(sprite) {
                sprite.body && sprite.exists && this.insert(sprite.body)
            },
            split: function() {
                this.nodes[0] = new Phaser.QuadTree(this.bounds.right, this.bounds.y, this.bounds.subWidth, this.bounds.subHeight, this.maxObjects, this.maxLevels, this.level + 1), this.nodes[1] = new Phaser.QuadTree(this.bounds.x, this.bounds.y, this.bounds.subWidth, this.bounds.subHeight, this.maxObjects, this.maxLevels, this.level + 1), this.nodes[2] = new Phaser.QuadTree(this.bounds.x, this.bounds.bottom, this.bounds.subWidth, this.bounds.subHeight, this.maxObjects, this.maxLevels, this.level + 1), this.nodes[3] = new Phaser.QuadTree(this.bounds.right, this.bounds.bottom, this.bounds.subWidth, this.bounds.subHeight, this.maxObjects, this.maxLevels, this.level + 1)
            },
            insert: function(body) {
                var index, i = 0;
                if (null != this.nodes[0] && (index = this.getIndex(body), -1 !== index)) return void this.nodes[index].insert(body);
                if (this.objects.push(body), this.objects.length > this.maxObjects && this.level < this.maxLevels)
                    for (null == this.nodes[0] && this.split(); i < this.objects.length;) index = this.getIndex(this.objects[i]), -1 !== index ? this.nodes[index].insert(this.objects.splice(i, 1)[0]) : i++
            },
            getIndex: function(rect) {
                var index = -1;
                return rect.x < this.bounds.right && rect.right < this.bounds.right ? rect.y < this.bounds.bottom && rect.bottom < this.bounds.bottom ? index = 1 : rect.y > this.bounds.bottom && (index = 2) : rect.x > this.bounds.right && (rect.y < this.bounds.bottom && rect.bottom < this.bounds.bottom ? index = 0 : rect.y > this.bounds.bottom && (index = 3)), index
            },
            retrieve: function(source) {
                if (source instanceof Phaser.Rectangle) var returnObjects = this.objects,
                    index = this.getIndex(source);
                else {
                    if (!source.body) return this._empty;
                    var returnObjects = this.objects,
                        index = this.getIndex(source.body)
                }
                return this.nodes[0] && (-1 !== index ? returnObjects = returnObjects.concat(this.nodes[index].retrieve(source)) : (returnObjects = returnObjects.concat(this.nodes[0].retrieve(source)), returnObjects = returnObjects.concat(this.nodes[1].retrieve(source)), returnObjects = returnObjects.concat(this.nodes[2].retrieve(source)), returnObjects = returnObjects.concat(this.nodes[3].retrieve(source)))), returnObjects
            },
            clear: function() {
                this.objects.length = 0;
                for (var i = this.nodes.length; i--;) this.nodes[i].clear(), this.nodes.splice(i, 1);
                this.nodes.length = 0
            }
        }, Phaser.QuadTree.prototype.constructor = Phaser.QuadTree, Phaser.Net = function(game) {
            this.game = game
        }, Phaser.Net.prototype = {
            getHostName: function() {
                return window.location && window.location.hostname ? window.location.hostname : null
            },
            checkDomainName: function(domain) {
                return -1 !== window.location.hostname.indexOf(domain)
            },
            updateQueryString: function(key, value, redirect, url) {
                void 0 === redirect && (redirect = !1), (void 0 === url || "" === url) && (url = window.location.href);
                var output = "",
                    re = new RegExp("([?|&])" + key + "=.*?(&|#|$)(.*)", "gi");
                if (re.test(url)) output = "undefined" != typeof value && null !== value ? url.replace(re, "$1" + key + "=" + value + "$2$3") : url.replace(re, "$1$3").replace(/(&|\?)$/, "");
                else if ("undefined" != typeof value && null !== value) {
                    var separator = -1 !== url.indexOf("?") ? "&" : "?",
                        hash = url.split("#");
                    url = hash[0] + separator + key + "=" + value, hash[1] && (url += "#" + hash[1]), output = url
                } else output = url;
                return redirect ? void(window.location.href = output) : output
            },
            getQueryString: function(parameter) {
                void 0 === parameter && (parameter = "");
                var output = {},
                    keyValues = location.search.substring(1).split("&");
                for (var i in keyValues) {
                    var key = keyValues[i].split("=");
                    if (key.length > 1) {
                        if (parameter && parameter == this.decodeURI(key[0])) return this.decodeURI(key[1]);
                        output[this.decodeURI(key[0])] = this.decodeURI(key[1])
                    }
                }
                return output
            },
            decodeURI: function(value) {
                return decodeURIComponent(value.replace(/\+/g, " "))
            }
        }, Phaser.Net.prototype.constructor = Phaser.Net, Phaser.TweenManager = function(game) {
            this.game = game, this.frameBased = !1, this._tweens = [], this._add = [], this.easeMap = {
                Power0: Phaser.Easing.Power0,
                Power1: Phaser.Easing.Power1,
                Power2: Phaser.Easing.Power2,
                Power3: Phaser.Easing.Power3,
                Power4: Phaser.Easing.Power4,
                Linear: Phaser.Easing.Linear.None,
                Quad: Phaser.Easing.Quadratic.Out,
                Cubic: Phaser.Easing.Cubic.Out,
                Quart: Phaser.Easing.Quartic.Out,
                Quint: Phaser.Easing.Quintic.Out,
                Sine: Phaser.Easing.Sinusoidal.Out,
                Expo: Phaser.Easing.Exponential.Out,
                Circ: Phaser.Easing.Circular.Out,
                Elastic: Phaser.Easing.Elastic.Out,
                Back: Phaser.Easing.Back.Out,
                Bounce: Phaser.Easing.Bounce.Out,
                "Quad.easeIn": Phaser.Easing.Quadratic.In,
                "Cubic.easeIn": Phaser.Easing.Cubic.In,
                "Quart.easeIn": Phaser.Easing.Quartic.In,
                "Quint.easeIn": Phaser.Easing.Quintic.In,
                "Sine.easeIn": Phaser.Easing.Sinusoidal.In,
                "Expo.easeIn": Phaser.Easing.Exponential.In,
                "Circ.easeIn": Phaser.Easing.Circular.In,
                "Elastic.easeIn": Phaser.Easing.Elastic.In,
                "Back.easeIn": Phaser.Easing.Back.In,
                "Bounce.easeIn": Phaser.Easing.Bounce.In,
                "Quad.easeOut": Phaser.Easing.Quadratic.Out,
                "Cubic.easeOut": Phaser.Easing.Cubic.Out,
                "Quart.easeOut": Phaser.Easing.Quartic.Out,
                "Quint.easeOut": Phaser.Easing.Quintic.Out,
                "Sine.easeOut": Phaser.Easing.Sinusoidal.Out,
                "Expo.easeOut": Phaser.Easing.Exponential.Out,
                "Circ.easeOut": Phaser.Easing.Circular.Out,
                "Elastic.easeOut": Phaser.Easing.Elastic.Out,
                "Back.easeOut": Phaser.Easing.Back.Out,
                "Bounce.easeOut": Phaser.Easing.Bounce.Out,
                "Quad.easeInOut": Phaser.Easing.Quadratic.InOut,
                "Cubic.easeInOut": Phaser.Easing.Cubic.InOut,
                "Quart.easeInOut": Phaser.Easing.Quartic.InOut,
                "Quint.easeInOut": Phaser.Easing.Quintic.InOut,
                "Sine.easeInOut": Phaser.Easing.Sinusoidal.InOut,
                "Expo.easeInOut": Phaser.Easing.Exponential.InOut,
                "Circ.easeInOut": Phaser.Easing.Circular.InOut,
                "Elastic.easeInOut": Phaser.Easing.Elastic.InOut,
                "Back.easeInOut": Phaser.Easing.Back.InOut,
                "Bounce.easeInOut": Phaser.Easing.Bounce.InOut
            }, this.game.onPause.add(this._pauseAll, this), this.game.onResume.add(this._resumeAll, this)
        }, Phaser.TweenManager.prototype = {
            getAll: function() {
                return this._tweens
            },
            removeAll: function() {
                for (var i = 0; i < this._tweens.length; i++) this._tweens[i].pendingDelete = !0;
                this._add = []
            },
            removeFrom: function(obj, children) {
                void 0 === children && (children = !0);
                var i, len;
                if (Array.isArray(obj))
                    for (i = 0, len = obj.length; len > i; i++) this.removeFrom(obj[i]);
                else if (obj.type === Phaser.GROUP && children)
                    for (var i = 0, len = obj.children.length; len > i; i++) this.removeFrom(obj.children[i]);
                else {
                    for (i = 0, len = this._tweens.length; len > i; i++) obj === this._tweens[i].target && this.remove(this._tweens[i]);
                    for (i = 0, len = this._add.length; len > i; i++) obj === this._add[i].target && this.remove(this._add[i])
                }
            },
            add: function(tween) {
                tween._manager = this, this._add.push(tween)
            },
            create: function(object) {
                return new Phaser.Tween(object, this.game, this)
            },
            remove: function(tween) {
                var i = this._tweens.indexOf(tween); - 1 !== i ? this._tweens[i].pendingDelete = !0 : (i = this._add.indexOf(tween), -1 !== i && (this._add[i].pendingDelete = !0))
            },
            update: function() {
                var addTweens = this._add.length,
                    numTweens = this._tweens.length;
                if (0 === numTweens && 0 === addTweens) return !1;
                for (var i = 0; numTweens > i;) this._tweens[i].update(this.game.time.time) ? i++ : (this._tweens.splice(i, 1), numTweens--);
                return addTweens > 0 && (this._tweens = this._tweens.concat(this._add), this._add.length = 0), !0
            },
            isTweening: function(object) {
                return this._tweens.some(function(tween) {
                    return tween.target === object
                })
            },
            _pauseAll: function() {
                for (var i = this._tweens.length - 1; i >= 0; i--) this._tweens[i]._pause()
            },
            _resumeAll: function() {
                for (var i = this._tweens.length - 1; i >= 0; i--) this._tweens[i]._resume()
            },
            pauseAll: function() {
                for (var i = this._tweens.length - 1; i >= 0; i--) this._tweens[i].pause()
            },
            resumeAll: function() {
                for (var i = this._tweens.length - 1; i >= 0; i--) this._tweens[i].resume(!0)
            }
        }, Phaser.TweenManager.prototype.constructor = Phaser.TweenManager, Phaser.Tween = function(target, game, manager) {
            this.game = game, this.target = target, this.manager = manager, this.timeline = [], this.reverse = !1, this.timeScale = 1, this.repeatCounter = 0, this.pendingDelete = !1, this.onStart = new Phaser.Signal, this.onLoop = new Phaser.Signal, this.onRepeat = new Phaser.Signal, this.onChildComplete = new Phaser.Signal, this.onComplete = new Phaser.Signal, this.isRunning = !1, this.current = 0, this.properties = {}, this.chainedTween = null, this.isPaused = !1, this.frameBased = manager.frameBased, this._onUpdateCallback = null, this._onUpdateCallbackContext = null, this._pausedTime = 0, this._codePaused = !1, this._hasStarted = !1
        }, Phaser.Tween.prototype = {
            to: function(properties, duration, ease, autoStart, delay, repeat, yoyo) {
                return (void 0 === duration || 0 >= duration) && (duration = 1e3), (void 0 === ease || null === ease) && (ease = Phaser.Easing.Default), void 0 === autoStart && (autoStart = !1), void 0 === delay && (delay = 0), void 0 === repeat && (repeat = 0), void 0 === yoyo && (yoyo = !1), "string" == typeof ease && this.manager.easeMap[ease] && (ease = this.manager.easeMap[ease]), this.isRunning ? (console.warn("Phaser.Tween.to cannot be called after Tween.start"), this) : (this.timeline.push(new Phaser.TweenData(this).to(properties, duration, ease, delay, repeat, yoyo)), autoStart && this.start(), this)
            },
            from: function(properties, duration, ease, autoStart, delay, repeat, yoyo) {
                return void 0 === duration && (duration = 1e3), (void 0 === ease || null === ease) && (ease = Phaser.Easing.Default), void 0 === autoStart && (autoStart = !1), void 0 === delay && (delay = 0), void 0 === repeat && (repeat = 0), void 0 === yoyo && (yoyo = !1), "string" == typeof ease && this.manager.easeMap[ease] && (ease = this.manager.easeMap[ease]), this.isRunning ? (console.warn("Phaser.Tween.from cannot be called after Tween.start"), this) : (this.timeline.push(new Phaser.TweenData(this).from(properties, duration, ease, delay, repeat, yoyo)), autoStart && this.start(), this)
            },
            start: function(index) {
                if (void 0 === index && (index = 0), null === this.game || null === this.target || 0 === this.timeline.length || this.isRunning) return this;
                for (var i = 0; i < this.timeline.length; i++)
                    for (var property in this.timeline[i].vEnd) this.properties[property] = this.target[property] || 0, Array.isArray(this.properties[property]) || (this.properties[property] *= 1);
                for (var i = 0; i < this.timeline.length; i++) this.timeline[i].loadValues();
                return this.manager.add(this), this.isRunning = !0, (0 > index || index > this.timeline.length - 1) && (index = 0), this.current = index, this.timeline[this.current].start(), this
            },
            stop: function(complete) {
                return void 0 === complete && (complete = !1), this.isRunning = !1, this._onUpdateCallback = null, this._onUpdateCallbackContext = null, complete && (this.onComplete.dispatch(this.target, this), this.chainedTween && this.chainedTween.start()), this.manager.remove(this), this
            },
            updateTweenData: function(property, value, index) {
                if (0 === this.timeline.length) return this;
                if (void 0 === index && (index = 0), -1 === index)
                    for (var i = 0; i < this.timeline.length; i++) this.timeline[i][property] = value;
                else this.timeline[index][property] = value;
                return this
            },
            delay: function(duration, index) {
                return this.updateTweenData("delay", duration, index)
            },
            repeat: function(total, repeatDelay, index) {
                return void 0 === repeatDelay && (repeatDelay = 0), this.updateTweenData("repeatCounter", total, index), this.updateTweenData("repeatDelay", repeatDelay, index)
            },
            repeatDelay: function(duration, index) {
                return this.updateTweenData("repeatDelay", duration, index)
            },
            yoyo: function(enable, yoyoDelay, index) {
                return void 0 === yoyoDelay && (yoyoDelay = 0), this.updateTweenData("yoyo", enable, index), this.updateTweenData("yoyoDelay", yoyoDelay, index)
            },
            yoyoDelay: function(duration, index) {
                return this.updateTweenData("yoyoDelay", duration, index)
            },
            easing: function(ease, index) {
                return "string" == typeof ease && this.manager.easeMap[ease] && (ease = this.manager.easeMap[ease]), this.updateTweenData("easingFunction", ease, index)
            },
            interpolation: function(interpolation, context, index) {
                return void 0 === context && (context = Phaser.Math), this.updateTweenData("interpolationFunction", interpolation, index), this.updateTweenData("interpolationContext", context, index)
            },
            repeatAll: function(total) {
                return void 0 === total && (total = 0), this.repeatCounter = total, this
            },
            chain: function() {
                for (var i = arguments.length; i--;) i > 0 ? arguments[i - 1].chainedTween = arguments[i] : this.chainedTween = arguments[i];
                return this
            },
            loop: function(value) {
                return void 0 === value && (value = !0), value ? this.repeatAll(-1) : this.repeatCounter = 0, this
            },
            onUpdateCallback: function(callback, callbackContext) {
                return this._onUpdateCallback = callback, this._onUpdateCallbackContext = callbackContext, this
            },
            pause: function() {
                this.isPaused = !0, this._codePaused = !0, this._pausedTime = this.game.time.time
            },
            _pause: function() {
                this._codePaused || (this.isPaused = !0, this._pausedTime = this.game.time.time)
            },
            resume: function() {
                if (this.isPaused) {
                    this.isPaused = !1, this._codePaused = !1;
                    for (var i = 0; i < this.timeline.length; i++) this.timeline[i].isRunning || (this.timeline[i].startTime += this.game.time.time - this._pausedTime)
                }
            },
            _resume: function() {
                this._codePaused || this.resume()
            },
            update: function(time) {
                if (this.pendingDelete) return !1;
                if (this.isPaused) return !0;
                var status = this.timeline[this.current].update(time);
                if (status === Phaser.TweenData.PENDING) return !0;
                if (status === Phaser.TweenData.RUNNING) return this._hasStarted || (this.onStart.dispatch(this.target, this), this._hasStarted = !0), null !== this._onUpdateCallback && this._onUpdateCallback.call(this._onUpdateCallbackContext, this, this.timeline[this.current].value, this.timeline[this.current]), this.isRunning;
                if (status === Phaser.TweenData.LOOPED) return this.onLoop.dispatch(this.target, this), !0;
                if (status === Phaser.TweenData.COMPLETE) {
                    var complete = !1;
                    return this.reverse ? (this.current--, this.current < 0 && (this.current = this.timeline.length - 1, complete = !0)) : (this.current++, this.current === this.timeline.length && (this.current = 0, complete = !0)), complete ? -1 === this.repeatCounter ? (this.timeline[this.current].start(), this.onRepeat.dispatch(this.target, this), !0) : this.repeatCounter > 0 ? (this.repeatCounter--, this.timeline[this.current].start(), this.onRepeat.dispatch(this.target, this), !0) : (this.isRunning = !1, this.onComplete.dispatch(this.target, this), this.chainedTween && this.chainedTween.start(), !1) : (this.onChildComplete.dispatch(this.target, this), this.timeline[this.current].start(), !0)
                }
            },
            generateData: function(frameRate, data) {
                if (null === this.game || null === this.target) return null;
                void 0 === frameRate && (frameRate = 60), void 0 === data && (data = []);
                for (var i = 0; i < this.timeline.length; i++)
                    for (var property in this.timeline[i].vEnd) this.properties[property] = this.target[property] || 0, Array.isArray(this.properties[property]) || (this.properties[property] *= 1);
                for (var i = 0; i < this.timeline.length; i++) this.timeline[i].loadValues();
                for (var i = 0; i < this.timeline.length; i++) data = data.concat(this.timeline[i].generateData(frameRate));
                return data
            }
        }, Object.defineProperty(Phaser.Tween.prototype, "totalDuration", {
            get: function() {
                for (var total = 0, i = 0; i < this.timeline.length; i++) total += this.timeline[i].duration;
                return total
            }
        }), Phaser.Tween.prototype.constructor = Phaser.Tween, Phaser.TweenData = function(parent) {
            this.parent = parent, this.game = parent.game, this.vStart = {}, this.vStartCache = {}, this.vEnd = {}, this.vEndCache = {}, this.duration = 1e3, this.percent = 0, this.value = 0, this.repeatCounter = 0, this.repeatDelay = 0, this.interpolate = !1, this.yoyo = !1, this.yoyoDelay = 0, this.inReverse = !1, this.delay = 0, this.dt = 0, this.startTime = null, this.easingFunction = Phaser.Easing.Default, this.interpolationFunction = Phaser.Math.linearInterpolation, this.interpolationContext = Phaser.Math, this.isRunning = !1, this.isFrom = !1
        }, Phaser.TweenData.PENDING = 0, Phaser.TweenData.RUNNING = 1, Phaser.TweenData.LOOPED = 2, Phaser.TweenData.COMPLETE = 3, Phaser.TweenData.prototype = {
            to: function(properties, duration, ease, delay, repeat, yoyo) {
                return this.vEnd = properties, this.duration = duration, this.easingFunction = ease, this.delay = delay, this.repeatCounter = repeat, this.yoyo = yoyo, this.isFrom = !1, this
            },
            from: function(properties, duration, ease, delay, repeat, yoyo) {
                return this.vEnd = properties, this.duration = duration, this.easingFunction = ease, this.delay = delay, this.repeatCounter = repeat, this.yoyo = yoyo, this.isFrom = !0, this
            },
            start: function() {
                if (this.startTime = this.game.time.time + this.delay, this.parent.reverse ? this.dt = this.duration : this.dt = 0, this.delay > 0 ? this.isRunning = !1 : this.isRunning = !0, this.isFrom)
                    for (var property in this.vStartCache) this.vStart[property] = this.vEndCache[property], this.vEnd[property] = this.vStartCache[property], this.parent.target[property] = this.vStart[property];
                return this.value = 0, this.yoyoCounter = 0, this
            },
            loadValues: function() {
                for (var property in this.parent.properties) {
                    if (this.vStart[property] = this.parent.properties[property], Array.isArray(this.vEnd[property])) {
                        if (0 === this.vEnd[property].length) continue;
                        0 === this.percent && (this.vEnd[property] = [this.vStart[property]].concat(this.vEnd[property]))
                    }
                    "undefined" != typeof this.vEnd[property] ? ("string" == typeof this.vEnd[property] && (this.vEnd[property] = this.vStart[property] + parseFloat(this.vEnd[property], 10)), this.parent.properties[property] = this.vEnd[property]) : this.vEnd[property] = this.vStart[property], this.vStartCache[property] = this.vStart[property], this.vEndCache[property] = this.vEnd[property]
                }
                return this
            },
            update: function(time) {
                if (this.isRunning) {
                    if (time < this.startTime) return Phaser.TweenData.RUNNING
                } else {
                    if (!(time >= this.startTime)) return Phaser.TweenData.PENDING;
                    this.isRunning = !0
                }
                var ms = this.parent.frameBased ? this.game.time.physicsElapsedMS : this.game.time.elapsedMS;
                this.parent.reverse ? (this.dt -= ms * this.parent.timeScale, this.dt = Math.max(this.dt, 0)) : (this.dt += ms * this.parent.timeScale, this.dt = Math.min(this.dt, this.duration)), this.percent = this.dt / this.duration, this.value = this.easingFunction(this.percent);
                for (var property in this.vEnd) {
                    var start = this.vStart[property],
                        end = this.vEnd[property];
                    Array.isArray(end) ? this.parent.target[property] = this.interpolationFunction.call(this.interpolationContext, end, this.value) : this.parent.target[property] = start + (end - start) * this.value
                }
                return !this.parent.reverse && 1 === this.percent || this.parent.reverse && 0 === this.percent ? this.repeat() : Phaser.TweenData.RUNNING
            },
            generateData: function(frameRate) {
                this.parent.reverse ? this.dt = this.duration : this.dt = 0;
                var data = [],
                    complete = !1,
                    fps = 1 / frameRate * 1e3;
                do {
                    this.parent.reverse ? (this.dt -= fps, this.dt = Math.max(this.dt, 0)) : (this.dt += fps,
                        this.dt = Math.min(this.dt, this.duration)), this.percent = this.dt / this.duration, this.value = this.easingFunction(this.percent);
                    var blob = {};
                    for (var property in this.vEnd) {
                        var start = this.vStart[property],
                            end = this.vEnd[property];
                        Array.isArray(end) ? blob[property] = this.interpolationFunction(end, this.value) : blob[property] = start + (end - start) * this.value
                    }
                    data.push(blob), (!this.parent.reverse && 1 === this.percent || this.parent.reverse && 0 === this.percent) && (complete = !0)
                } while (!complete);
                if (this.yoyo) {
                    var reversed = data.slice();
                    reversed.reverse(), data = data.concat(reversed)
                }
                return data
            },
            repeat: function() {
                if (this.yoyo) {
                    if (this.inReverse && 0 === this.repeatCounter) return Phaser.TweenData.COMPLETE;
                    this.inReverse = !this.inReverse
                } else if (0 === this.repeatCounter) return Phaser.TweenData.COMPLETE;
                if (this.inReverse)
                    for (var property in this.vStartCache) this.vStart[property] = this.vEndCache[property], this.vEnd[property] = this.vStartCache[property];
                else {
                    for (var property in this.vStartCache) this.vStart[property] = this.vStartCache[property], this.vEnd[property] = this.vEndCache[property];
                    this.repeatCounter > 0 && this.repeatCounter--
                }
                return this.startTime = this.game.time.time, this.yoyo && this.inReverse ? this.startTime += this.yoyoDelay : this.inReverse || (this.startTime += this.repeatDelay), this.parent.reverse ? this.dt = this.duration : this.dt = 0, Phaser.TweenData.LOOPED
            }
        }, Phaser.TweenData.prototype.constructor = Phaser.TweenData, Phaser.Easing = {
            Linear: {
                None: function(k) {
                    return k
                }
            },
            Quadratic: {
                In: function(k) {
                    return k * k
                },
                Out: function(k) {
                    return k * (2 - k)
                },
                InOut: function(k) {
                    return (k *= 2) < 1 ? .5 * k * k : -.5 * (--k * (k - 2) - 1)
                }
            },
            Cubic: {
                In: function(k) {
                    return k * k * k
                },
                Out: function(k) {
                    return --k * k * k + 1
                },
                InOut: function(k) {
                    return (k *= 2) < 1 ? .5 * k * k * k : .5 * ((k -= 2) * k * k + 2)
                }
            },
            Quartic: {
                In: function(k) {
                    return k * k * k * k
                },
                Out: function(k) {
                    return 1 - --k * k * k * k
                },
                InOut: function(k) {
                    return (k *= 2) < 1 ? .5 * k * k * k * k : -.5 * ((k -= 2) * k * k * k - 2)
                }
            },
            Quintic: {
                In: function(k) {
                    return k * k * k * k * k
                },
                Out: function(k) {
                    return --k * k * k * k * k + 1
                },
                InOut: function(k) {
                    return (k *= 2) < 1 ? .5 * k * k * k * k * k : .5 * ((k -= 2) * k * k * k * k + 2)
                }
            },
            Sinusoidal: {
                In: function(k) {
                    return 0 === k ? 0 : 1 === k ? 1 : 1 - Math.cos(k * Math.PI / 2)
                },
                Out: function(k) {
                    return 0 === k ? 0 : 1 === k ? 1 : Math.sin(k * Math.PI / 2)
                },
                InOut: function(k) {
                    return 0 === k ? 0 : 1 === k ? 1 : .5 * (1 - Math.cos(Math.PI * k))
                }
            },
            Exponential: {
                In: function(k) {
                    return 0 === k ? 0 : Math.pow(1024, k - 1)
                },
                Out: function(k) {
                    return 1 === k ? 1 : 1 - Math.pow(2, -10 * k)
                },
                InOut: function(k) {
                    return 0 === k ? 0 : 1 === k ? 1 : (k *= 2) < 1 ? .5 * Math.pow(1024, k - 1) : .5 * (-Math.pow(2, -10 * (k - 1)) + 2)
                }
            },
            Circular: {
                In: function(k) {
                    return 1 - Math.sqrt(1 - k * k)
                },
                Out: function(k) {
                    return Math.sqrt(1 - --k * k)
                },
                InOut: function(k) {
                    return (k *= 2) < 1 ? -.5 * (Math.sqrt(1 - k * k) - 1) : .5 * (Math.sqrt(1 - (k -= 2) * k) + 1)
                }
            },
            Elastic: {
                In: function(k) {
                    var s, a = .1,
                        p = .4;
                    return 0 === k ? 0 : 1 === k ? 1 : (!a || 1 > a ? (a = 1, s = p / 4) : s = p * Math.asin(1 / a) / (2 * Math.PI), -(a * Math.pow(2, 10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p)))
                },
                Out: function(k) {
                    var s, a = .1,
                        p = .4;
                    return 0 === k ? 0 : 1 === k ? 1 : (!a || 1 > a ? (a = 1, s = p / 4) : s = p * Math.asin(1 / a) / (2 * Math.PI), a * Math.pow(2, -10 * k) * Math.sin((k - s) * (2 * Math.PI) / p) + 1)
                },
                InOut: function(k) {
                    var s, a = .1,
                        p = .4;
                    return 0 === k ? 0 : 1 === k ? 1 : (!a || 1 > a ? (a = 1, s = p / 4) : s = p * Math.asin(1 / a) / (2 * Math.PI), (k *= 2) < 1 ? -.5 * (a * Math.pow(2, 10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p)) : a * Math.pow(2, -10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p) * .5 + 1)
                }
            },
            Back: {
                In: function(k) {
                    var s = 1.70158;
                    return k * k * ((s + 1) * k - s)
                },
                Out: function(k) {
                    var s = 1.70158;
                    return --k * k * ((s + 1) * k + s) + 1
                },
                InOut: function(k) {
                    var s = 2.5949095;
                    return (k *= 2) < 1 ? .5 * (k * k * ((s + 1) * k - s)) : .5 * ((k -= 2) * k * ((s + 1) * k + s) + 2)
                }
            },
            Bounce: {
                In: function(k) {
                    return 1 - Phaser.Easing.Bounce.Out(1 - k)
                },
                Out: function(k) {
                    return 1 / 2.75 > k ? 7.5625 * k * k : 2 / 2.75 > k ? 7.5625 * (k -= 1.5 / 2.75) * k + .75 : 2.5 / 2.75 > k ? 7.5625 * (k -= 2.25 / 2.75) * k + .9375 : 7.5625 * (k -= 2.625 / 2.75) * k + .984375
                },
                InOut: function(k) {
                    return .5 > k ? .5 * Phaser.Easing.Bounce.In(2 * k) : .5 * Phaser.Easing.Bounce.Out(2 * k - 1) + .5
                }
            }
        }, Phaser.Easing.Default = Phaser.Easing.Linear.None, Phaser.Easing.Power0 = Phaser.Easing.Linear.None, Phaser.Easing.Power1 = Phaser.Easing.Quadratic.Out, Phaser.Easing.Power2 = Phaser.Easing.Cubic.Out, Phaser.Easing.Power3 = Phaser.Easing.Quartic.Out, Phaser.Easing.Power4 = Phaser.Easing.Quintic.Out, Phaser.Time = function(game) {
            this.game = game, this.time = 0, this.prevTime = 0, this.now = 0, this.elapsed = 0, this.elapsedMS = 0, this.physicsElapsed = 1 / 60, this.physicsElapsedMS = 1 / 60 * 1e3, this.desiredFpsMult = 1 / 60, this._desiredFps = 60, this.suggestedFps = this.desiredFps, this.slowMotion = 1, this.advancedTiming = !1, this.frames = 0, this.fps = 0, this.fpsMin = 1e3, this.fpsMax = 0, this.msMin = 1e3, this.msMax = 0, this.pauseDuration = 0, this.timeToCall = 0, this.timeExpected = 0, this.events = new Phaser.Timer(this.game, !1), this._frameCount = 0, this._elapsedAccumulator = 0, this._started = 0, this._timeLastSecond = 0, this._pauseStarted = 0, this._justResumed = !1, this._timers = []
        }, Phaser.Time.prototype = {
            boot: function() {
                this._started = Date.now(), this.time = Date.now(), this.events.start(), this.timeExpected = this.time
            },
            add: function(timer) {
                return this._timers.push(timer), timer
            },
            create: function(autoDestroy) {
                void 0 === autoDestroy && (autoDestroy = !0);
                var timer = new Phaser.Timer(this.game, autoDestroy);
                return this._timers.push(timer), timer
            },
            removeAll: function() {
                for (var i = 0; i < this._timers.length; i++) this._timers[i].destroy();
                this._timers = [], this.events.removeAll()
            },
            refresh: function() {
                var previousDateNow = this.time;
                this.time = Date.now(), this.elapsedMS = this.time - previousDateNow
            },
            update: function(time) {
                var previousDateNow = this.time;
                this.time = Date.now(), this.elapsedMS = this.time - previousDateNow, this.prevTime = this.now, this.now = time, this.elapsed = this.now - this.prevTime, this.game.raf._isSetTimeOut && (this.timeToCall = Math.floor(Math.max(0, 1e3 / this._desiredFps - (this.timeExpected - time))), this.timeExpected = time + this.timeToCall), this.advancedTiming && this.updateAdvancedTiming(), this.game.paused || (this.events.update(this.time), this._timers.length && this.updateTimers())
            },
            updateTimers: function() {
                for (var i = 0, len = this._timers.length; len > i;) this._timers[i].update(this.time) ? i++ : (this._timers.splice(i, 1), len--)
            },
            updateAdvancedTiming: function() {
                this._frameCount++, this._elapsedAccumulator += this.elapsed, this._frameCount >= 2 * this._desiredFps && (this.suggestedFps = 5 * Math.floor(200 / (this._elapsedAccumulator / this._frameCount)), this._frameCount = 0, this._elapsedAccumulator = 0), this.msMin = Math.min(this.msMin, this.elapsed), this.msMax = Math.max(this.msMax, this.elapsed), this.frames++, this.now > this._timeLastSecond + 1e3 && (this.fps = Math.round(1e3 * this.frames / (this.now - this._timeLastSecond)), this.fpsMin = Math.min(this.fpsMin, this.fps), this.fpsMax = Math.max(this.fpsMax, this.fps), this._timeLastSecond = this.now, this.frames = 0)
            },
            gamePaused: function() {
                this._pauseStarted = Date.now(), this.events.pause();
                for (var i = this._timers.length; i--;) this._timers[i]._pause()
            },
            gameResumed: function() {
                this.time = Date.now(), this.pauseDuration = this.time - this._pauseStarted, this.events.resume();
                for (var i = this._timers.length; i--;) this._timers[i]._resume()
            },
            totalElapsedSeconds: function() {
                return .001 * (this.time - this._started)
            },
            elapsedSince: function(since) {
                return this.time - since
            },
            elapsedSecondsSince: function(since) {
                return .001 * (this.time - since)
            },
            reset: function() {
                this._started = this.time, this.removeAll()
            }
        }, Object.defineProperty(Phaser.Time.prototype, "desiredFps", {
            get: function() {
                return this._desiredFps
            },
            set: function(value) {
                this._desiredFps = value, this.physicsElapsed = 1 / value, this.physicsElapsedMS = 1e3 * this.physicsElapsed, this.desiredFpsMult = 1 / value
            }
        }), Phaser.Time.prototype.constructor = Phaser.Time, Phaser.Timer = function(game, autoDestroy) {
            void 0 === autoDestroy && (autoDestroy = !0), this.game = game, this.running = !1, this.autoDestroy = autoDestroy, this.expired = !1, this.elapsed = 0, this.events = [], this.onComplete = new Phaser.Signal, this.nextTick = 0, this.timeCap = 1e3, this.paused = !1, this._codePaused = !1, this._started = 0, this._pauseStarted = 0, this._pauseTotal = 0, this._now = Date.now(), this._len = 0, this._marked = 0, this._i = 0, this._diff = 0, this._newTick = 0
        }, Phaser.Timer.MINUTE = 6e4, Phaser.Timer.SECOND = 1e3, Phaser.Timer.HALF = 500, Phaser.Timer.QUARTER = 250, Phaser.Timer.prototype = {
            create: function(delay, loop, repeatCount, callback, callbackContext, args) {
                delay = Math.round(delay);
                var tick = delay;
                tick += 0 === this._now ? this.game.time.time : this._now;
                var event = new Phaser.TimerEvent(this, delay, tick, repeatCount, loop, callback, callbackContext, args);
                return this.events.push(event), this.order(), this.expired = !1, event
            },
            add: function(delay, callback, callbackContext) {
                return this.create(delay, !1, 0, callback, callbackContext, Array.prototype.slice.call(arguments, 3))
            },
            repeat: function(delay, repeatCount, callback, callbackContext) {
                return this.create(delay, !1, repeatCount, callback, callbackContext, Array.prototype.slice.call(arguments, 4))
            },
            loop: function(delay, callback, callbackContext) {
                return this.create(delay, !0, 0, callback, callbackContext, Array.prototype.slice.call(arguments, 3))
            },
            start: function(delay) {
                if (!this.running) {
                    this._started = this.game.time.time + (delay || 0), this.running = !0;
                    for (var i = 0; i < this.events.length; i++) this.events[i].tick = this.events[i].delay + this._started
                }
            },
            stop: function(clearEvents) {
                this.running = !1, void 0 === clearEvents && (clearEvents = !0), clearEvents && (this.events.length = 0)
            },
            remove: function(event) {
                for (var i = 0; i < this.events.length; i++)
                    if (this.events[i] === event) return this.events[i].pendingDelete = !0, !0;
                return !1
            },
            order: function() {
                this.events.length > 0 && (this.events.sort(this.sortHandler), this.nextTick = this.events[0].tick)
            },
            sortHandler: function(a, b) {
                return a.tick < b.tick ? -1 : a.tick > b.tick ? 1 : 0
            },
            clearPendingEvents: function() {
                for (this._i = this.events.length; this._i--;) this.events[this._i].pendingDelete && this.events.splice(this._i, 1);
                this._len = this.events.length, this._i = 0
            },
            update: function(time) {
                if (this.paused) return !0;
                if (this.elapsed = time - this._now, this._now = time, this.elapsed > this.timeCap && this.adjustEvents(time - this.elapsed), this._marked = 0, this.clearPendingEvents(), this.running && this._now >= this.nextTick && this._len > 0) {
                    for (; this._i < this._len && this.running && this._now >= this.events[this._i].tick && !this.events[this._i].pendingDelete;) this._newTick = this._now + this.events[this._i].delay - (this._now - this.events[this._i].tick), this._newTick < 0 && (this._newTick = this._now + this.events[this._i].delay), this.events[this._i].loop === !0 ? (this.events[this._i].tick = this._newTick, this.events[this._i].callback.apply(this.events[this._i].callbackContext, this.events[this._i].args)) : this.events[this._i].repeatCount > 0 ? (this.events[this._i].repeatCount--, this.events[this._i].tick = this._newTick, this.events[this._i].callback.apply(this.events[this._i].callbackContext, this.events[this._i].args)) : (this._marked++, this.events[this._i].pendingDelete = !0, this.events[this._i].callback.apply(this.events[this._i].callbackContext, this.events[this._i].args)), this._i++;
                    this.events.length > this._marked ? this.order() : (this.expired = !0, this.onComplete.dispatch(this))
                }
                return this.expired && this.autoDestroy ? !1 : !0
            },
            pause: function() {
                this.running && (this._codePaused = !0, this.paused || (this._pauseStarted = this.game.time.time, this.paused = !0))
            },
            _pause: function() {
                !this.paused && this.running && (this._pauseStarted = this.game.time.time, this.paused = !0)
            },
            adjustEvents: function(baseTime) {
                for (var i = 0; i < this.events.length; i++)
                    if (!this.events[i].pendingDelete) {
                        var t = this.events[i].tick - baseTime;
                        0 > t && (t = 0), this.events[i].tick = this._now + t
                    }
                var d = this.nextTick - baseTime;
                0 > d ? this.nextTick = this._now : this.nextTick = this._now + d
            },
            resume: function() {
                if (this.paused) {
                    var now = this.game.time.time;
                    this._pauseTotal += now - this._now, this._now = now, this.adjustEvents(this._pauseStarted), this.paused = !1, this._codePaused = !1
                }
            },
            _resume: function() {
                this._codePaused || this.resume()
            },
            removeAll: function() {
                this.onComplete.removeAll(), this.events.length = 0, this._len = 0, this._i = 0
            },
            destroy: function() {
                this.onComplete.removeAll(), this.running = !1, this.events = [], this._len = 0, this._i = 0
            }
        }, Object.defineProperty(Phaser.Timer.prototype, "next", {
            get: function() {
                return this.nextTick
            }
        }), Object.defineProperty(Phaser.Timer.prototype, "duration", {
            get: function() {
                return this.running && this.nextTick > this._now ? this.nextTick - this._now : 0
            }
        }), Object.defineProperty(Phaser.Timer.prototype, "length", {
            get: function() {
                return this.events.length
            }
        }), Object.defineProperty(Phaser.Timer.prototype, "ms", {
            get: function() {
                return this.running ? this._now - this._started - this._pauseTotal : 0
            }
        }), Object.defineProperty(Phaser.Timer.prototype, "seconds", {
            get: function() {
                return this.running ? .001 * this.ms : 0
            }
        }), Phaser.Timer.prototype.constructor = Phaser.Timer, Phaser.TimerEvent = function(timer, delay, tick, repeatCount, loop, callback, callbackContext, args) {
            this.timer = timer, this.delay = delay, this.tick = tick, this.repeatCount = repeatCount - 1, this.loop = loop, this.callback = callback, this.callbackContext = callbackContext, this.args = args, this.pendingDelete = !1
        }, Phaser.TimerEvent.prototype.constructor = Phaser.TimerEvent, Phaser.AnimationManager = function(sprite) {
            this.sprite = sprite, this.game = sprite.game, this.currentFrame = null, this.currentAnim = null, this.updateIfVisible = !0, this.isLoaded = !1, this._frameData = null, this._anims = {}, this._outputFrames = []
        }, Phaser.AnimationManager.prototype = {
            loadFrameData: function(frameData, frame) {
                if (void 0 === frameData) return !1;
                if (this.isLoaded)
                    for (var anim in this._anims) this._anims[anim].updateFrameData(frameData);
                return this._frameData = frameData, void 0 === frame || null === frame ? this.frame = 0 : "string" == typeof frame ? this.frameName = frame : this.frame = frame, this.isLoaded = !0, !0
            },
            copyFrameData: function(frameData, frame) {
                if (this._frameData = frameData.clone(), this.isLoaded)
                    for (var anim in this._anims) this._anims[anim].updateFrameData(this._frameData);
                return void 0 === frame || null === frame ? this.frame = 0 : "string" == typeof frame ? this.frameName = frame : this.frame = frame, this.isLoaded = !0, !0
            },
            add: function(name, frames, frameRate, loop, useNumericIndex) {
                return frames = frames || [], frameRate = frameRate || 60, void 0 === loop && (loop = !1), void 0 === useNumericIndex && (useNumericIndex = frames && "number" == typeof frames[0] ? !0 : !1), this._outputFrames = [], this._frameData.getFrameIndexes(frames, useNumericIndex, this._outputFrames), this._anims[name] = new Phaser.Animation(this.game, this.sprite, name, this._frameData, this._outputFrames, frameRate, loop), this.currentAnim = this._anims[name], this.sprite.tilingTexture && (this.sprite.refreshTexture = !0), this._anims[name]
            },
            validateFrames: function(frames, useNumericIndex) {
                void 0 === useNumericIndex && (useNumericIndex = !0);
                for (var i = 0; i < frames.length; i++)
                    if (useNumericIndex === !0) {
                        if (frames[i] > this._frameData.total) return !1
                    } else if (this._frameData.checkFrameName(frames[i]) === !1) return !1;
                return !0
            },
            play: function(name, frameRate, loop, killOnComplete) {
                return this._anims[name] ? this.currentAnim === this._anims[name] ? this.currentAnim.isPlaying === !1 ? (this.currentAnim.paused = !1, this.currentAnim.play(frameRate, loop, killOnComplete)) : this.currentAnim : (this.currentAnim && this.currentAnim.isPlaying && this.currentAnim.stop(), this.currentAnim = this._anims[name], this.currentAnim.paused = !1, this.currentFrame = this.currentAnim.currentFrame, this.currentAnim.play(frameRate, loop, killOnComplete)) : void 0
            },
            stop: function(name, resetFrame) {
                void 0 === resetFrame && (resetFrame = !1), "string" == typeof name ? this._anims[name] && (this.currentAnim = this._anims[name], this.currentAnim.stop(resetFrame)) : this.currentAnim && this.currentAnim.stop(resetFrame)
            },
            update: function() {
                return this.updateIfVisible && !this.sprite.visible ? !1 : this.currentAnim && this.currentAnim.update() ? (this.currentFrame = this.currentAnim.currentFrame, !0) : !1
            },
            next: function(quantity) {
                this.currentAnim && (this.currentAnim.next(quantity), this.currentFrame = this.currentAnim.currentFrame)
            },
            previous: function(quantity) {
                this.currentAnim && (this.currentAnim.previous(quantity), this.currentFrame = this.currentAnim.currentFrame)
            },
            getAnimation: function(name) {
                return "string" == typeof name && this._anims[name] ? this._anims[name] : null
            },
            refreshFrame: function() {
                this.sprite.setTexture(PIXI.TextureCache[this.currentFrame.uuid])
            },
            destroy: function() {
                var anim = null;
                for (var anim in this._anims) this._anims.hasOwnProperty(anim) && this._anims[anim].destroy();
                this._anims = {}, this._outputFrames = [], this._frameData = null, this.currentAnim = null, this.currentFrame = null, this.sprite = null, this.game = null
            }
        }, Phaser.AnimationManager.prototype.constructor = Phaser.AnimationManager, Object.defineProperty(Phaser.AnimationManager.prototype, "frameData", {
            get: function() {
                return this._frameData
            }
        }), Object.defineProperty(Phaser.AnimationManager.prototype, "frameTotal", {
            get: function() {
                return this._frameData.total
            }
        }), Object.defineProperty(Phaser.AnimationManager.prototype, "paused", {
            get: function() {
                return this.currentAnim.isPaused
            },
            set: function(value) {
                this.currentAnim.paused = value
            }
        }), Object.defineProperty(Phaser.AnimationManager.prototype, "name", {
            get: function() {
                return this.currentAnim ? this.currentAnim.name : void 0
            }
        }), Object.defineProperty(Phaser.AnimationManager.prototype, "frame", {
            get: function() {
                return this.currentFrame ? this.currentFrame.index : void 0
            },
            set: function(value) {
                "number" == typeof value && this._frameData && null !== this._frameData.getFrame(value) && (this.currentFrame = this._frameData.getFrame(value), this.currentFrame && this.sprite.setFrame(this.currentFrame))
            }
        }), Object.defineProperty(Phaser.AnimationManager.prototype, "frameName", {
            get: function() {
                return this.currentFrame ? this.currentFrame.name : void 0
            },
            set: function(value) {
                "string" == typeof value && this._frameData && null !== this._frameData.getFrameByName(value) ? (this.currentFrame = this._frameData.getFrameByName(value), this.currentFrame && (this._frameIndex = this.currentFrame.index, this.sprite.setFrame(this.currentFrame))) : console.warn("Cannot set frameName: " + value)
            }
        }), Phaser.Animation = function(game, parent, name, frameData, frames, frameRate, loop) {
            void 0 === loop && (loop = !1), this.game = game, this._parent = parent, this._frameData = frameData, this.name = name, this._frames = [], this._frames = this._frames.concat(frames), this.delay = 1e3 / frameRate, this.loop = loop, this.loopCount = 0, this.killOnComplete = !1, this.isFinished = !1, this.isPlaying = !1, this.isPaused = !1, this._pauseStartTime = 0, this._frameIndex = 0, this._frameDiff = 0, this._frameSkip = 1, this.currentFrame = this._frameData.getFrame(this._frames[this._frameIndex]), this.onStart = new Phaser.Signal, this.onUpdate = null, this.onComplete = new Phaser.Signal, this.onLoop = new Phaser.Signal, this.game.onPause.add(this.onPause, this), this.game.onResume.add(this.onResume, this)
        }, Phaser.Animation.prototype = {
            play: function(frameRate, loop, killOnComplete) {
                return "number" == typeof frameRate && (this.delay = 1e3 / frameRate), "boolean" == typeof loop && (this.loop = loop), "undefined" != typeof killOnComplete && (this.killOnComplete = killOnComplete), this.isPlaying = !0, this.isFinished = !1, this.paused = !1, this.loopCount = 0, this._timeLastFrame = this.game.time.time, this._timeNextFrame = this.game.time.time + this.delay, this._frameIndex = 0, this.updateCurrentFrame(!1, !0), this._parent.events.onAnimationStart$dispatch(this._parent, this), this.onStart.dispatch(this._parent, this), this._parent.animations.currentAnim = this, this._parent.animations.currentFrame = this.currentFrame, this
            },
            restart: function() {
                this.isPlaying = !0, this.isFinished = !1, this.paused = !1, this.loopCount = 0, this._timeLastFrame = this.game.time.time, this._timeNextFrame = this.game.time.time + this.delay, this._frameIndex = 0, this.currentFrame = this._frameData.getFrame(this._frames[this._frameIndex]), this._parent.setFrame(this.currentFrame), this._parent.animations.currentAnim = this, this._parent.animations.currentFrame = this.currentFrame, this.onStart.dispatch(this._parent, this)
            },
            setFrame: function(frameId, useLocalFrameIndex) {
                var frameIndex;
                if (void 0 === useLocalFrameIndex && (useLocalFrameIndex = !1), "string" == typeof frameId)
                    for (var i = 0; i < this._frames.length; i++) this._frameData.getFrame(this._frames[i]).name === frameId && (frameIndex = i);
                else if ("number" == typeof frameId)
                    if (useLocalFrameIndex) frameIndex = frameId;
                    else
                        for (var i = 0; i < this._frames.length; i++) this._frames[i] === frameIndex && (frameIndex = i);
                frameIndex && (this._frameIndex = frameIndex - 1, this._timeNextFrame = this.game.time.time, this.update())
            },
            stop: function(resetFrame, dispatchComplete) {
                void 0 === resetFrame && (resetFrame = !1), void 0 === dispatchComplete && (dispatchComplete = !1), this.isPlaying = !1, this.isFinished = !0, this.paused = !1, resetFrame && (this.currentFrame = this._frameData.getFrame(this._frames[0]), this._parent.setFrame(this.currentFrame)), dispatchComplete && (this._parent.events.onAnimationComplete$dispatch(this._parent, this), this.onComplete.dispatch(this._parent, this))
            },
            onPause: function() {
                this.isPlaying && (this._frameDiff = this._timeNextFrame - this.game.time.time)
            },
            onResume: function() {
                this.isPlaying && (this._timeNextFrame = this.game.time.time + this._frameDiff)
            },
            update: function() {
                return this.isPaused ? !1 : this.isPlaying && this.game.time.time >= this._timeNextFrame ? (this._frameSkip = 1, this._frameDiff = this.game.time.time - this._timeNextFrame, this._timeLastFrame = this.game.time.time, this._frameDiff > this.delay && (this._frameSkip = Math.floor(this._frameDiff / this.delay), this._frameDiff -= this._frameSkip * this.delay), this._timeNextFrame = this.game.time.time + (this.delay - this._frameDiff), this._frameIndex += this._frameSkip, this._frameIndex >= this._frames.length ? this.loop ? (this._frameIndex %= this._frames.length, this.currentFrame = this._frameData.getFrame(this._frames[this._frameIndex]), this.currentFrame && this._parent.setFrame(this.currentFrame), this.loopCount++, this._parent.events.onAnimationLoop$dispatch(this._parent, this), this.onLoop.dispatch(this._parent, this), this.onUpdate ? (this.onUpdate.dispatch(this, this.currentFrame), !!this._frameData) : !0) : (this.complete(), !1) : this.updateCurrentFrame(!0)) : !1
            },
            updateCurrentFrame: function(signalUpdate, fromPlay) {
                if (void 0 === fromPlay && (fromPlay = !1), !this._frameData) return !1;
                var idx = this.currentFrame.index;
                return this.currentFrame = this._frameData.getFrame(this._frames[this._frameIndex]), this.currentFrame && (fromPlay || !fromPlay && idx !== this.currentFrame.index) && this._parent.setFrame(this.currentFrame), this.onUpdate && signalUpdate ? (this.onUpdate.dispatch(this, this.currentFrame), !!this._frameData) : !0
            },
            next: function(quantity) {
                void 0 === quantity && (quantity = 1);
                var frame = this._frameIndex + quantity;
                frame >= this._frames.length && (this.loop ? frame %= this._frames.length : frame = this._frames.length - 1), frame !== this._frameIndex && (this._frameIndex = frame, this.updateCurrentFrame(!0))
            },
            previous: function(quantity) {
                void 0 === quantity && (quantity = 1);
                var frame = this._frameIndex - quantity;
                0 > frame && (this.loop ? frame = this._frames.length + frame : frame++), frame !== this._frameIndex && (this._frameIndex = frame, this.updateCurrentFrame(!0))
            },
            updateFrameData: function(frameData) {
                this._frameData = frameData, this.currentFrame = this._frameData ? this._frameData.getFrame(this._frames[this._frameIndex % this._frames.length]) : null
            },
            destroy: function() {
                this._frameData && (this.game.onPause.remove(this.onPause, this), this.game.onResume.remove(this.onResume, this), this.game = null, this._parent = null, this._frames = null, this._frameData = null, this.currentFrame = null, this.isPlaying = !1, this.onStart.dispose(), this.onLoop.dispose(), this.onComplete.dispose(), this.onUpdate && this.onUpdate.dispose())
            },
            complete: function() {
                this._frameIndex = this._frames.length - 1, this.currentFrame = this._frameData.getFrame(this._frames[this._frameIndex]), this.isPlaying = !1, this.isFinished = !0, this.paused = !1, this._parent.events.onAnimationComplete$dispatch(this._parent, this), this.onComplete.dispatch(this._parent, this), this.killOnComplete && this._parent.kill()
            }
        }, Phaser.Animation.prototype.constructor = Phaser.Animation, Object.defineProperty(Phaser.Animation.prototype, "paused", {
            get: function() {
                return this.isPaused
            },
            set: function(value) {
                this.isPaused = value, value ? this._pauseStartTime = this.game.time.time : this.isPlaying && (this._timeNextFrame = this.game.time.time + this.delay)
            }
        }), Object.defineProperty(Phaser.Animation.prototype, "frameTotal", {
            get: function() {
                return this._frames.length
            }
        }), Object.defineProperty(Phaser.Animation.prototype, "frame", {
            get: function() {
                return null !== this.currentFrame ? this.currentFrame.index : this._frameIndex
            },
            set: function(value) {
                this.currentFrame = this._frameData.getFrame(this._frames[value]), null !== this.currentFrame && (this._frameIndex = value, this._parent.setFrame(this.currentFrame), this.onUpdate && this.onUpdate.dispatch(this, this.currentFrame))
            }
        }), Object.defineProperty(Phaser.Animation.prototype, "speed", {
            get: function() {
                return Math.round(1e3 / this.delay)
            },
            set: function(value) {
                value >= 1 && (this.delay = 1e3 / value)
            }
        }), Object.defineProperty(Phaser.Animation.prototype, "enableUpdate", {
            get: function() {
                return null !== this.onUpdate
            },
            set: function(value) {
                value && null === this.onUpdate ? this.onUpdate = new Phaser.Signal : value || null === this.onUpdate || (this.onUpdate.dispose(), this.onUpdate = null)
            }
        }), Phaser.Animation.generateFrameNames = function(prefix, start, stop, suffix, zeroPad) {
            void 0 === suffix && (suffix = "");
            var output = [],
                frame = "";
            if (stop > start)
                for (var i = start; stop >= i; i++) frame = "number" == typeof zeroPad ? Phaser.Utils.pad(i.toString(), zeroPad, "0", 1) : i.toString(), frame = prefix + frame + suffix, output.push(frame);
            else
                for (var i = start; i >= stop; i--) frame = "number" == typeof zeroPad ? Phaser.Utils.pad(i.toString(), zeroPad, "0", 1) : i.toString(), frame = prefix + frame + suffix, output.push(frame);
            return output
        }, Phaser.Frame = function(index, x, y, width, height, name) {
            this.index = index, this.x = x, this.y = y, this.width = width, this.height = height, this.name = name, this.centerX = Math.floor(width / 2), this.centerY = Math.floor(height / 2), this.distance = Phaser.Math.distance(0, 0, width, height), this.rotated = !1, this.rotationDirection = "cw", this.trimmed = !1, this.sourceSizeW = width, this.sourceSizeH = height, this.spriteSourceSizeX = 0, this.spriteSourceSizeY = 0, this.spriteSourceSizeW = 0, this.spriteSourceSizeH = 0, this.right = this.x + this.width, this.bottom = this.y + this.height
        }, Phaser.Frame.prototype = {
            resize: function(width, height) {
                this.width = width, this.height = height, this.centerX = Math.floor(width / 2), this.centerY = Math.floor(height / 2), this.distance = Phaser.Math.distance(0, 0, width, height), this.sourceSizeW = width, this.sourceSizeH = height, this.right = this.x + width, this.bottom = this.y + height
            },
            setTrim: function(trimmed, actualWidth, actualHeight, destX, destY, destWidth, destHeight) {
                this.trimmed = trimmed, trimmed && (this.sourceSizeW = actualWidth, this.sourceSizeH = actualHeight, this.centerX = Math.floor(actualWidth / 2), this.centerY = Math.floor(actualHeight / 2), this.spriteSourceSizeX = destX, this.spriteSourceSizeY = destY, this.spriteSourceSizeW = destWidth, this.spriteSourceSizeH = destHeight)
            },
            clone: function() {
                var output = new Phaser.Frame(this.index, this.x, this.y, this.width, this.height, this.name);
                for (var prop in this) this.hasOwnProperty(prop) && (output[prop] = this[prop]);
                return output
            },
            getRect: function(out) {
                return void 0 === out ? out = new Phaser.Rectangle(this.x, this.y, this.width, this.height) : out.setTo(this.x, this.y, this.width, this.height), out
            }
        }, Phaser.Frame.prototype.constructor = Phaser.Frame, Phaser.FrameData = function() {
            this._frames = [], this._frameNames = []
        }, Phaser.FrameData.prototype = {
            addFrame: function(frame) {
                return frame.index = this._frames.length, this._frames.push(frame), "" !== frame.name && (this._frameNames[frame.name] = frame.index), frame
            },
            getFrame: function(index) {
                return index >= this._frames.length && (index = 0), this._frames[index]
            },
            getFrameByName: function(name) {
                return "number" == typeof this._frameNames[name] ? this._frames[this._frameNames[name]] : null
            },
            checkFrameName: function(name) {
                return null == this._frameNames[name] ? !1 : !0
            },
            clone: function() {
                for (var output = new Phaser.FrameData, i = 0; i < this._frames.length; i++) output._frames.push(this._frames[i].clone());
                for (var p in this._frameNames) this._frameNames.hasOwnProperty(p) && output._frameNames.push(this._frameNames[p]);
                return output
            },
            getFrameRange: function(start, end, output) {
                void 0 === output && (output = []);
                for (var i = start; end >= i; i++) output.push(this._frames[i]);
                return output
            },
            getFrames: function(frames, useNumericIndex, output) {
                if (void 0 === useNumericIndex && (useNumericIndex = !0), void 0 === output && (output = []), void 0 === frames || 0 === frames.length)
                    for (var i = 0; i < this._frames.length; i++) output.push(this._frames[i]);
                else
                    for (var i = 0; i < frames.length; i++) useNumericIndex ? output.push(this.getFrame(frames[i])) : output.push(this.getFrameByName(frames[i]));
                return output
            },
            getFrameIndexes: function(frames, useNumericIndex, output) {
                if (void 0 === useNumericIndex && (useNumericIndex = !0), void 0 === output && (output = []), void 0 === frames || 0 === frames.length)
                    for (var i = 0; i < this._frames.length; i++) output.push(this._frames[i].index);
                else
                    for (var i = 0; i < frames.length; i++) useNumericIndex ? output.push(this._frames[frames[i]].index) : this.getFrameByName(frames[i]) && output.push(this.getFrameByName(frames[i]).index);
                return output
            }
        }, Phaser.FrameData.prototype.constructor = Phaser.FrameData, Object.defineProperty(Phaser.FrameData.prototype, "total", {
            get: function() {
                return this._frames.length
            }
        }), Phaser.AnimationParser = {
            spriteSheet: function(game, key, frameWidth, frameHeight, frameMax, margin, spacing) {
                var img = key;
                if ("string" == typeof key && (img = game.cache.getImage(key)), null === img) return null;
                var width = img.width,
                    height = img.height;
                0 >= frameWidth && (frameWidth = Math.floor(-width / Math.min(-1, frameWidth))), 0 >= frameHeight && (frameHeight = Math.floor(-height / Math.min(-1, frameHeight)));
                var row = Math.floor((width - margin) / (frameWidth + spacing)),
                    column = Math.floor((height - margin) / (frameHeight + spacing)),
                    total = row * column;
                if (-1 !== frameMax && (total = frameMax), 0 === width || 0 === height || frameWidth > width || frameHeight > height || 0 === total) return console.warn("Phaser.AnimationParser.spriteSheet: '" + key + "'s width/height zero or width/height < given frameWidth/frameHeight"), null;
                for (var data = new Phaser.FrameData, x = margin, y = margin, i = 0; total > i; i++) data.addFrame(new Phaser.Frame(i, x, y, frameWidth, frameHeight, "")), x += frameWidth + spacing, x + frameWidth > width && (x = margin, y += frameHeight + spacing);
                return data
            },
            JSONData: function(game, json) {
                if (!json.frames) return console.warn("Phaser.AnimationParser.JSONData: Invalid Texture Atlas JSON given, missing 'frames' array"), void console.log(json);
                for (var newFrame, data = new Phaser.FrameData, frames = json.frames, i = 0; i < frames.length; i++) newFrame = data.addFrame(new Phaser.Frame(i, frames[i].frame.x, frames[i].frame.y, frames[i].frame.w, frames[i].frame.h, frames[i].filename)), frames[i].trimmed && newFrame.setTrim(frames[i].trimmed, frames[i].sourceSize.w, frames[i].sourceSize.h, frames[i].spriteSourceSize.x, frames[i].spriteSourceSize.y, frames[i].spriteSourceSize.w, frames[i].spriteSourceSize.h);
                return data
            },
            JSONDataPyxel: function(game, json) {
                var signature = ["layers", "tilewidth", "tileheight", "tileswide", "tileshigh"];
                if (signature.forEach(function(key) {
                        return json[key] ? void 0 : (console.warn("Phaser.AnimationParser.JSONDataPyxel: Invalid Pyxel Tilemap JSON given, missing '" + key + "' key."), void console.log(json))
                    }), 1 != json.layers.length) return console.warn("Phaser.AnimationParser.JSONDataPyxel: Too many layers, this parser only supports flat Tilemaps."), void console.log(json);
                for (var newFrame, data = new Phaser.FrameData, tileheight = json.tileheight, tilewidth = json.tilewidth, frames = json.layers[0].tiles, i = 0; i < frames.length; i++) newFrame = data.addFrame(new Phaser.Frame(i, frames[i].x, frames[i].y, tilewidth, tileheight, "frame_" + i)), newFrame.setTrim(!1);
                return data
            },
            JSONDataHash: function(game, json) {
                if (!json.frames) return console.warn("Phaser.AnimationParser.JSONDataHash: Invalid Texture Atlas JSON given, missing 'frames' object"), void console.log(json);
                var newFrame, data = new Phaser.FrameData,
                    frames = json.frames,
                    i = 0;
                for (var key in frames) newFrame = data.addFrame(new Phaser.Frame(i, frames[key].frame.x, frames[key].frame.y, frames[key].frame.w, frames[key].frame.h, key)), frames[key].trimmed && newFrame.setTrim(frames[key].trimmed, frames[key].sourceSize.w, frames[key].sourceSize.h, frames[key].spriteSourceSize.x, frames[key].spriteSourceSize.y, frames[key].spriteSourceSize.w, frames[key].spriteSourceSize.h), i++;
                return data
            },
            XMLData: function(game, xml) {
                if (!xml.getElementsByTagName("TextureAtlas")) return void console.warn("Phaser.AnimationParser.XMLData: Invalid Texture Atlas XML given, missing <TextureAtlas> tag");
                for (var newFrame, name, frame, x, y, width, height, frameX, frameY, frameWidth, frameHeight, data = new Phaser.FrameData, frames = xml.getElementsByTagName("SubTexture"), i = 0; i < frames.length; i++) frame = frames[i].attributes, name = frame.name.value, x = parseInt(frame.x.value, 10), y = parseInt(frame.y.value, 10), width = parseInt(frame.width.value, 10), height = parseInt(frame.height.value, 10), frameX = null, frameY = null, frame.frameX && (frameX = Math.abs(parseInt(frame.frameX.value, 10)), frameY = Math.abs(parseInt(frame.frameY.value, 10)), frameWidth = parseInt(frame.frameWidth.value, 10), frameHeight = parseInt(frame.frameHeight.value, 10)), newFrame = data.addFrame(new Phaser.Frame(i, x, y, width, height, name)),
                    (null !== frameX || null !== frameY) && newFrame.setTrim(!0, width, height, frameX, frameY, frameWidth, frameHeight);
                return data
            }
        }, Phaser.Cache = function(game) {
            this.game = game, this.autoResolveURL = !1, this._cache = {
                canvas: {},
                image: {},
                texture: {},
                sound: {},
                video: {},
                text: {},
                json: {},
                xml: {},
                physics: {},
                tilemap: {},
                binary: {},
                bitmapData: {},
                bitmapFont: {},
                shader: {},
                renderTexture: {}
            }, this._urlMap = {}, this._urlResolver = new Image, this._urlTemp = null, this.onSoundUnlock = new Phaser.Signal, this._cacheMap = [], this._cacheMap[Phaser.Cache.CANVAS] = this._cache.canvas, this._cacheMap[Phaser.Cache.IMAGE] = this._cache.image, this._cacheMap[Phaser.Cache.TEXTURE] = this._cache.texture, this._cacheMap[Phaser.Cache.SOUND] = this._cache.sound, this._cacheMap[Phaser.Cache.TEXT] = this._cache.text, this._cacheMap[Phaser.Cache.PHYSICS] = this._cache.physics, this._cacheMap[Phaser.Cache.TILEMAP] = this._cache.tilemap, this._cacheMap[Phaser.Cache.BINARY] = this._cache.binary, this._cacheMap[Phaser.Cache.BITMAPDATA] = this._cache.bitmapData, this._cacheMap[Phaser.Cache.BITMAPFONT] = this._cache.bitmapFont, this._cacheMap[Phaser.Cache.JSON] = this._cache.json, this._cacheMap[Phaser.Cache.XML] = this._cache.xml, this._cacheMap[Phaser.Cache.VIDEO] = this._cache.video, this._cacheMap[Phaser.Cache.SHADER] = this._cache.shader, this._cacheMap[Phaser.Cache.RENDER_TEXTURE] = this._cache.renderTexture, this.addDefaultImage(), this.addMissingImage()
        }, Phaser.Cache.CANVAS = 1, Phaser.Cache.IMAGE = 2, Phaser.Cache.TEXTURE = 3, Phaser.Cache.SOUND = 4, Phaser.Cache.TEXT = 5, Phaser.Cache.PHYSICS = 6, Phaser.Cache.TILEMAP = 7, Phaser.Cache.BINARY = 8, Phaser.Cache.BITMAPDATA = 9, Phaser.Cache.BITMAPFONT = 10, Phaser.Cache.JSON = 11, Phaser.Cache.XML = 12, Phaser.Cache.VIDEO = 13, Phaser.Cache.SHADER = 14, Phaser.Cache.RENDER_TEXTURE = 15, Phaser.Cache.prototype = {
            addCanvas: function(key, canvas, context) {
                void 0 === context && (context = canvas.getContext("2d")), this._cache.canvas[key] = {
                    canvas: canvas,
                    context: context
                }
            },
            addImage: function(key, url, data) {
                this.checkImageKey(key) && this.removeImage(key);
                var img = {
                    key: key,
                    url: url,
                    data: data,
                    base: new PIXI.BaseTexture(data),
                    frame: new Phaser.Frame(0, 0, 0, data.width, data.height, key),
                    frameData: new Phaser.FrameData
                };
                return img.frameData.addFrame(new Phaser.Frame(0, 0, 0, data.width, data.height, url)), this._cache.image[key] = img, this._resolveURL(url, img), img
            },
            addDefaultImage: function() {
                var img = new Image;
                img.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgAQMAAABJtOi3AAAAA1BMVEX///+nxBvIAAAAAXRSTlMAQObYZgAAABVJREFUeF7NwIEAAAAAgKD9qdeocAMAoAABm3DkcAAAAABJRU5ErkJggg==";
                var obj = this.addImage("__default", null, img);
                obj.base.skipRender = !0, PIXI.TextureCache.__default = new PIXI.Texture(obj.base)
            },
            addMissingImage: function() {
                var img = new Image;
                img.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAJ9JREFUeNq01ssOwyAMRFG46v//Mt1ESmgh+DFmE2GPOBARKb2NVjo+17PXLD8a1+pl5+A+wSgFygymWYHBb0FtsKhJDdZlncG2IzJ4ayoMDv20wTmSMzClEgbWYNTAkQ0Z+OJ+A/eWnAaR9+oxCF4Os0H8htsMUp+pwcgBBiMNnAwF8GqIgL2hAzaGFFgZauDPKABmowZ4GL369/0rwACp2yA/ttmvsQAAAABJRU5ErkJggg==";
                var obj = this.addImage("__missing", null, img);
                PIXI.TextureCache.__missing = new PIXI.Texture(obj.base)
            },
            addSound: function(key, url, data, webAudio, audioTag) {
                void 0 === webAudio && (webAudio = !0, audioTag = !1), void 0 === audioTag && (webAudio = !1, audioTag = !0);
                var decoded = !1;
                audioTag && (decoded = !0), this._cache.sound[key] = {
                    url: url,
                    data: data,
                    isDecoding: !1,
                    decoded: decoded,
                    webAudio: webAudio,
                    audioTag: audioTag,
                    locked: this.game.sound.touchLocked
                }, this._resolveURL(url, this._cache.sound[key])
            },
            addText: function(key, url, data) {
                this._cache.text[key] = {
                    url: url,
                    data: data
                }, this._resolveURL(url, this._cache.text[key])
            },
            addPhysicsData: function(key, url, JSONData, format) {
                this._cache.physics[key] = {
                    url: url,
                    data: JSONData,
                    format: format
                }, this._resolveURL(url, this._cache.physics[key])
            },
            addTilemap: function(key, url, mapData, format) {
                this._cache.tilemap[key] = {
                    url: url,
                    data: mapData,
                    format: format
                }, this._resolveURL(url, this._cache.tilemap[key])
            },
            addBinary: function(key, binaryData) {
                this._cache.binary[key] = binaryData
            },
            addBitmapData: function(key, bitmapData, frameData) {
                return bitmapData.key = key, void 0 === frameData && (frameData = new Phaser.FrameData, frameData.addFrame(bitmapData.textureFrame)), this._cache.bitmapData[key] = {
                    data: bitmapData,
                    frameData: frameData
                }, bitmapData
            },
            addBitmapFont: function(key, url, data, atlasData, atlasType, xSpacing, ySpacing) {
                var obj = {
                    url: url,
                    data: data,
                    font: null,
                    base: new PIXI.BaseTexture(data)
                };
                void 0 === xSpacing && (xSpacing = 0), void 0 === ySpacing && (ySpacing = 0), "json" === atlasType ? obj.font = Phaser.LoaderParser.jsonBitmapFont(atlasData, obj.base, xSpacing, ySpacing) : obj.font = Phaser.LoaderParser.xmlBitmapFont(atlasData, obj.base, xSpacing, ySpacing), this._cache.bitmapFont[key] = obj, this._resolveURL(url, obj)
            },
            addJSON: function(key, url, data) {
                this._cache.json[key] = {
                    url: url,
                    data: data
                }, this._resolveURL(url, this._cache.json[key])
            },
            addXML: function(key, url, data) {
                this._cache.xml[key] = {
                    url: url,
                    data: data
                }, this._resolveURL(url, this._cache.xml[key])
            },
            addVideo: function(key, url, data, isBlob) {
                this._cache.video[key] = {
                    url: url,
                    data: data,
                    isBlob: isBlob,
                    locked: !0
                }, this._resolveURL(url, this._cache.video[key])
            },
            addShader: function(key, url, data) {
                this._cache.shader[key] = {
                    url: url,
                    data: data
                }, this._resolveURL(url, this._cache.shader[key])
            },
            addRenderTexture: function(key, texture) {
                this._cache.renderTexture[key] = {
                    texture: texture,
                    frame: new Phaser.Frame(0, 0, 0, texture.width, texture.height, "", "")
                }
            },
            addSpriteSheet: function(key, url, data, frameWidth, frameHeight, frameMax, margin, spacing) {
                void 0 === frameMax && (frameMax = -1), void 0 === margin && (margin = 0), void 0 === spacing && (spacing = 0);
                var obj = {
                    key: key,
                    url: url,
                    data: data,
                    frameWidth: frameWidth,
                    frameHeight: frameHeight,
                    margin: margin,
                    spacing: spacing,
                    base: new PIXI.BaseTexture(data),
                    frameData: Phaser.AnimationParser.spriteSheet(this.game, data, frameWidth, frameHeight, frameMax, margin, spacing)
                };
                this._cache.image[key] = obj, this._resolveURL(url, obj)
            },
            addTextureAtlas: function(key, url, data, atlasData, format) {
                var obj = {
                    key: key,
                    url: url,
                    data: data,
                    base: new PIXI.BaseTexture(data)
                };
                format === Phaser.Loader.TEXTURE_ATLAS_XML_STARLING ? obj.frameData = Phaser.AnimationParser.XMLData(this.game, atlasData, key) : format === Phaser.Loader.TEXTURE_ATLAS_JSON_PYXEL ? obj.frameData = Phaser.AnimationParser.JSONDataPyxel(this.game, atlasData, key) : Array.isArray(atlasData.frames) ? obj.frameData = Phaser.AnimationParser.JSONData(this.game, atlasData, key) : obj.frameData = Phaser.AnimationParser.JSONDataHash(this.game, atlasData, key), this._cache.image[key] = obj, this._resolveURL(url, obj)
            },
            reloadSound: function(key) {
                var _this = this,
                    sound = this.getSound(key);
                sound && (sound.data.src = sound.url, sound.data.addEventListener("canplaythrough", function() {
                    return _this.reloadSoundComplete(key)
                }, !1), sound.data.load())
            },
            reloadSoundComplete: function(key) {
                var sound = this.getSound(key);
                sound && (sound.locked = !1, this.onSoundUnlock.dispatch(key))
            },
            updateSound: function(key, property, value) {
                var sound = this.getSound(key);
                sound && (sound[property] = value)
            },
            decodedSound: function(key, data) {
                var sound = this.getSound(key);
                sound.data = data, sound.decoded = !0, sound.isDecoding = !1
            },
            isSoundDecoded: function(key) {
                var sound = this.getItem(key, Phaser.Cache.SOUND, "isSoundDecoded");
                return sound ? sound.decoded : void 0
            },
            isSoundReady: function(key) {
                var sound = this.getItem(key, Phaser.Cache.SOUND, "isSoundDecoded");
                return sound ? sound.decoded && !this.game.sound.touchLocked : void 0
            },
            checkKey: function(cache, key) {
                return this._cacheMap[cache][key] ? !0 : !1
            },
            checkURL: function(url) {
                return this._urlMap[this._resolveURL(url)] ? !0 : !1
            },
            checkCanvasKey: function(key) {
                return this.checkKey(Phaser.Cache.CANVAS, key)
            },
            checkImageKey: function(key) {
                return this.checkKey(Phaser.Cache.IMAGE, key)
            },
            checkTextureKey: function(key) {
                return this.checkKey(Phaser.Cache.TEXTURE, key)
            },
            checkSoundKey: function(key) {
                return this.checkKey(Phaser.Cache.SOUND, key)
            },
            checkTextKey: function(key) {
                return this.checkKey(Phaser.Cache.TEXT, key)
            },
            checkPhysicsKey: function(key) {
                return this.checkKey(Phaser.Cache.PHYSICS, key)
            },
            checkTilemapKey: function(key) {
                return this.checkKey(Phaser.Cache.TILEMAP, key)
            },
            checkBinaryKey: function(key) {
                return this.checkKey(Phaser.Cache.BINARY, key)
            },
            checkBitmapDataKey: function(key) {
                return this.checkKey(Phaser.Cache.BITMAPDATA, key)
            },
            checkBitmapFontKey: function(key) {
                return this.checkKey(Phaser.Cache.BITMAPFONT, key)
            },
            checkJSONKey: function(key) {
                return this.checkKey(Phaser.Cache.JSON, key)
            },
            checkXMLKey: function(key) {
                return this.checkKey(Phaser.Cache.XML, key)
            },
            checkVideoKey: function(key) {
                return this.checkKey(Phaser.Cache.VIDEO, key)
            },
            checkShaderKey: function(key) {
                return this.checkKey(Phaser.Cache.SHADER, key)
            },
            checkRenderTextureKey: function(key) {
                return this.checkKey(Phaser.Cache.RENDER_TEXTURE, key)
            },
            getItem: function(key, cache, method, property) {
                return this.checkKey(cache, key) ? void 0 === property ? this._cacheMap[cache][key] : this._cacheMap[cache][key][property] : (method && console.warn("Phaser.Cache." + method + ': Key "' + key + '" not found in Cache.'), null)
            },
            getCanvas: function(key) {
                return this.getItem(key, Phaser.Cache.CANVAS, "getCanvas", "canvas")
            },
            getImage: function(key, full) {
                (void 0 === key || null === key) && (key = "__default"), void 0 === full && (full = !1);
                var img = this.getItem(key, Phaser.Cache.IMAGE, "getImage");
                return null === img && (img = this.getItem("__missing", Phaser.Cache.IMAGE, "getImage")), full ? img : img.data
            },
            getTextureFrame: function(key) {
                return this.getItem(key, Phaser.Cache.TEXTURE, "getTextureFrame", "frame")
            },
            getSound: function(key) {
                return this.getItem(key, Phaser.Cache.SOUND, "getSound")
            },
            getSoundData: function(key) {
                return this.getItem(key, Phaser.Cache.SOUND, "getSoundData", "data")
            },
            getText: function(key) {
                return this.getItem(key, Phaser.Cache.TEXT, "getText", "data")
            },
            getPhysicsData: function(key, object, fixtureKey) {
                var data = this.getItem(key, Phaser.Cache.PHYSICS, "getPhysicsData", "data");
                if (null === data || void 0 === object || null === object) return data;
                if (data[object]) {
                    var fixtures = data[object];
                    if (!fixtures || !fixtureKey) return fixtures;
                    for (var fixture in fixtures)
                        if (fixture = fixtures[fixture], fixture.fixtureKey === fixtureKey) return fixture;
                    console.warn('Phaser.Cache.getPhysicsData: Could not find given fixtureKey: "' + fixtureKey + " in " + key + '"')
                } else console.warn('Phaser.Cache.getPhysicsData: Invalid key/object: "' + key + " / " + object + '"');
                return null
            },
            getTilemapData: function(key) {
                return this.getItem(key, Phaser.Cache.TILEMAP, "getTilemapData")
            },
            getBinary: function(key) {
                return this.getItem(key, Phaser.Cache.BINARY, "getBinary")
            },
            getBitmapData: function(key) {
                return this.getItem(key, Phaser.Cache.BITMAPDATA, "getBitmapData", "data")
            },
            getBitmapFont: function(key) {
                return this.getItem(key, Phaser.Cache.BITMAPFONT, "getBitmapFont")
            },
            getJSON: function(key, clone) {
                var data = this.getItem(key, Phaser.Cache.JSON, "getJSON", "data");
                return data ? clone ? Phaser.Utils.extend(!0, data) : data : null
            },
            getXML: function(key) {
                return this.getItem(key, Phaser.Cache.XML, "getXML", "data")
            },
            getVideo: function(key) {
                return this.getItem(key, Phaser.Cache.VIDEO, "getVideo")
            },
            getShader: function(key) {
                return this.getItem(key, Phaser.Cache.SHADER, "getShader", "data")
            },
            getRenderTexture: function(key) {
                return this.getItem(key, Phaser.Cache.RENDER_TEXTURE, "getRenderTexture")
            },
            getBaseTexture: function(key, cache) {
                return void 0 === cache && (cache = Phaser.Cache.IMAGE), this.getItem(key, cache, "getBaseTexture", "base")
            },
            getFrame: function(key, cache) {
                return void 0 === cache && (cache = Phaser.Cache.IMAGE), this.getItem(key, cache, "getFrame", "frame")
            },
            getFrameCount: function(key, cache) {
                var data = this.getFrameData(key, cache);
                return data ? data.total : 0
            },
            getFrameData: function(key, cache) {
                return void 0 === cache && (cache = Phaser.Cache.IMAGE), this.getItem(key, cache, "getFrameData", "frameData")
            },
            hasFrameData: function(key, cache) {
                return void 0 === cache && (cache = Phaser.Cache.IMAGE), null !== this.getItem(key, cache, "", "frameData")
            },
            updateFrameData: function(key, frameData, cache) {
                void 0 === cache && (cache = Phaser.Cache.IMAGE), this._cacheMap[cache][key] && (this._cacheMap[cache][key].frameData = frameData)
            },
            getFrameByIndex: function(key, index, cache) {
                var data = this.getFrameData(key, cache);
                return data ? data.getFrame(index) : null
            },
            getFrameByName: function(key, name, cache) {
                var data = this.getFrameData(key, cache);
                return data ? data.getFrameByName(name) : null
            },
            getPixiTexture: function(key) {
                if (PIXI.TextureCache[key]) return PIXI.TextureCache[key];
                var base = this.getPixiBaseTexture(key);
                return base ? new PIXI.Texture(base) : null
            },
            getPixiBaseTexture: function(key) {
                if (PIXI.BaseTextureCache[key]) return PIXI.BaseTextureCache[key];
                var img = this.getItem(key, Phaser.Cache.IMAGE, "getPixiBaseTexture");
                return null !== img ? img.base : null
            },
            getURL: function(url) {
                var url = this._resolveURL(url);
                return url ? this._urlMap[url] : (console.warn('Phaser.Cache.getUrl: Invalid url: "' + url + '" or Cache.autoResolveURL was false'), null)
            },
            getKeys: function(cache) {
                void 0 === cache && (cache = Phaser.Cache.IMAGE);
                var out = [];
                if (this._cacheMap[cache])
                    for (var key in this._cacheMap[cache]) "__default" !== key && "__missing" !== key && out.push(key);
                return out
            },
            removeCanvas: function(key) {
                delete this._cache.canvas[key]
            },
            removeImage: function(key, removeFromPixi) {
                void 0 === removeFromPixi && (removeFromPixi = !0);
                var img = this.getImage(key, !0);
                removeFromPixi && img.base && img.base.destroy(), delete this._cache.image[key]
            },
            removeSound: function(key) {
                delete this._cache.sound[key]
            },
            removeText: function(key) {
                delete this._cache.text[key]
            },
            removePhysics: function(key) {
                delete this._cache.physics[key]
            },
            removeTilemap: function(key) {
                delete this._cache.tilemap[key]
            },
            removeBinary: function(key) {
                delete this._cache.binary[key]
            },
            removeBitmapData: function(key) {
                delete this._cache.bitmapData[key]
            },
            removeBitmapFont: function(key) {
                delete this._cache.bitmapFont[key]
            },
            removeJSON: function(key) {
                delete this._cache.json[key]
            },
            removeXML: function(key) {
                delete this._cache.xml[key]
            },
            removeVideo: function(key) {
                delete this._cache.video[key]
            },
            removeShader: function(key) {
                delete this._cache.shader[key]
            },
            removeRenderTexture: function(key) {
                delete this._cache.renderTexture[key]
            },
            removeSpriteSheet: function(key) {
                delete this._cache.spriteSheet[key]
            },
            removeTextureAtlas: function(key) {
                delete this._cache.atlas[key]
            },
            clearGLTextures: function() {
                for (var key in this.cache.image) this.cache.image[key].base._glTextures = []
            },
            _resolveURL: function(url, data) {
                return this.autoResolveURL ? (this._urlResolver.src = this.game.load.baseURL + url, this._urlTemp = this._urlResolver.src, this._urlResolver.src = "", data && (this._urlMap[this._urlTemp] = data), this._urlTemp) : null
            },
            destroy: function() {
                for (var i = 0; i < this._cacheMap.length; i++) {
                    var cache = this._cacheMap[i];
                    for (var key in cache) "__default" !== key && "__missing" !== key && (cache[key].destroy && cache[key].destroy(), delete cache[key])
                }
                this._urlMap = null, this._urlResolver = null, this._urlTemp = null
            }
        }, Phaser.Cache.prototype.constructor = Phaser.Cache, Phaser.Loader = function(game) {
            this.game = game, this.cache = game.cache, this.resetLocked = !1, this.isLoading = !1, this.hasLoaded = !1, this.preloadSprite = null, this.crossOrigin = !1, this.baseURL = "", this.path = "", this.onLoadStart = new Phaser.Signal, this.onLoadComplete = new Phaser.Signal, this.onPackComplete = new Phaser.Signal, this.onFileStart = new Phaser.Signal, this.onFileComplete = new Phaser.Signal, this.onFileError = new Phaser.Signal, this.useXDomainRequest = !1, this._warnedAboutXDomainRequest = !1, this.enableParallel = !0, this.maxParallelDownloads = 4, this._withSyncPointDepth = 0, this._fileList = [], this._flightQueue = [], this._processingHead = 0, this._fileLoadStarted = !1, this._totalPackCount = 0, this._totalFileCount = 0, this._loadedPackCount = 0, this._loadedFileCount = 0
        }, Phaser.Loader.TEXTURE_ATLAS_JSON_ARRAY = 0, Phaser.Loader.TEXTURE_ATLAS_JSON_HASH = 1, Phaser.Loader.TEXTURE_ATLAS_XML_STARLING = 2, Phaser.Loader.PHYSICS_LIME_CORONA_JSON = 3, Phaser.Loader.PHYSICS_PHASER_JSON = 4, Phaser.Loader.TEXTURE_ATLAS_JSON_PYXEL = 5, Phaser.Loader.prototype = {
            setPreloadSprite: function(sprite, direction) {
                direction = direction || 0, this.preloadSprite = {
                    sprite: sprite,
                    direction: direction,
                    width: sprite.width,
                    height: sprite.height,
                    rect: null
                }, 0 === direction ? this.preloadSprite.rect = new Phaser.Rectangle(0, 0, 1, sprite.height) : this.preloadSprite.rect = new Phaser.Rectangle(0, 0, sprite.width, 1), sprite.crop(this.preloadSprite.rect), sprite.visible = !0
            },
            resize: function() {
                this.preloadSprite && this.preloadSprite.height !== this.preloadSprite.sprite.height && (this.preloadSprite.rect.height = this.preloadSprite.sprite.height)
            },
            checkKeyExists: function(type, key) {
                return this.getAssetIndex(type, key) > -1
            },
            getAssetIndex: function(type, key) {
                for (var bestFound = -1, i = 0; i < this._fileList.length; i++) {
                    var file = this._fileList[i];
                    if (file.type === type && file.key === key && (bestFound = i, !file.loaded && !file.loading)) break
                }
                return bestFound
            },
            getAsset: function(type, key) {
                var fileIndex = this.getAssetIndex(type, key);
                return fileIndex > -1 ? {
                    index: fileIndex,
                    file: this._fileList[fileIndex]
                } : !1
            },
            reset: function(hard, clearEvents) {
                void 0 === clearEvents && (clearEvents = !1), this.resetLocked || (hard && (this.preloadSprite = null), this.isLoading = !1, this._processingHead = 0, this._fileList.length = 0, this._flightQueue.length = 0, this._fileLoadStarted = !1, this._totalFileCount = 0, this._totalPackCount = 0, this._loadedPackCount = 0, this._loadedFileCount = 0, clearEvents && (this.onLoadStart.removeAll(), this.onLoadComplete.removeAll(), this.onPackComplete.removeAll(), this.onFileStart.removeAll(), this.onFileComplete.removeAll(), this.onFileError.removeAll()))
            },
            addToFileList: function(type, key, url, properties, overwrite, extension) {
                if (void 0 === overwrite && (overwrite = !1), void 0 === key || "" === key) return console.warn("Phaser.Loader: Invalid or no key given of type " + type), this;
                if (void 0 === url || null === url) {
                    if (!extension) return console.warn("Phaser.Loader: No URL given for file type: " + type + " key: " + key), this;
                    url = key + extension
                }
                var file = {
                    type: type,
                    key: key,
                    path: this.path,
                    url: url,
                    syncPoint: this._withSyncPointDepth > 0,
                    data: null,
                    loading: !1,
                    loaded: !1,
                    error: !1
                };
                if (properties)
                    for (var prop in properties) file[prop] = properties[prop];
                var fileIndex = this.getAssetIndex(type, key);
                if (overwrite && fileIndex > -1) {
                    var currentFile = this._fileList[fileIndex];
                    currentFile.loading || currentFile.loaded ? (this._fileList.push(file), this._totalFileCount++) : this._fileList[fileIndex] = file
                } else -1 === fileIndex && (this._fileList.push(file), this._totalFileCount++);
                return this
            },
            replaceInFileList: function(type, key, url, properties) {
                return this.addToFileList(type, key, url, properties, !0)
            },
            pack: function(key, url, data, callbackContext) {
                if (void 0 === url && (url = null), void 0 === data && (data = null), void 0 === callbackContext && (callbackContext = null), !url && !data) return console.warn("Phaser.Loader.pack - Both url and data are null. One must be set."), this;
                var pack = {
                    type: "packfile",
                    key: key,
                    url: url,
                    path: this.path,
                    syncPoint: !0,
                    data: null,
                    loading: !1,
                    loaded: !1,
                    error: !1,
                    callbackContext: callbackContext
                };
                data && ("string" == typeof data && (data = JSON.parse(data)), pack.data = data || {}, pack.loaded = !0);
                for (var i = 0; i < this._fileList.length + 1; i++) {
                    var file = this._fileList[i];
                    if (!file || !file.loaded && !file.loading && "packfile" !== file.type) {
                        this._fileList.splice(i, 1, pack), this._totalPackCount++;
                        break
                    }
                }
                return this
            },
            image: function(key, url, overwrite) {
                return this.addToFileList("image", key, url, void 0, overwrite, ".png")
            },
            images: function(keys, urls) {
                if (Array.isArray(urls))
                    for (var i = 0; i < keys.length; i++) this.image(keys[i], urls[i]);
                else
                    for (var i = 0; i < keys.length; i++) this.image(keys[i]);
                return this
            },
            text: function(key, url, overwrite) {
                return this.addToFileList("text", key, url, void 0, overwrite, ".txt")
            },
            json: function(key, url, overwrite) {
                return this.addToFileList("json", key, url, void 0, overwrite, ".json")
            },
            shader: function(key, url, overwrite) {
                return this.addToFileList("shader", key, url, void 0, overwrite, ".frag")
            },
            xml: function(key, url, overwrite) {
                return this.addToFileList("xml", key, url, void 0, overwrite, ".xml")
            },
            script: function(key, url, callback, callbackContext) {
                return void 0 === callback && (callback = !1), callback !== !1 && void 0 === callbackContext && (callbackContext = this), this.addToFileList("script", key, url, {
                    syncPoint: !0,
                    callback: callback,
                    callbackContext: callbackContext
                }, !1, ".js")
            },
            binary: function(key, url, callback, callbackContext) {
                return void 0 === callback && (callback = !1), callback !== !1 && void 0 === callbackContext && (callbackContext = callback), this.addToFileList("binary", key, url, {
                    callback: callback,
                    callbackContext: callbackContext
                }, !1, ".bin")
            },
            spritesheet: function(key, url, frameWidth, frameHeight, frameMax, margin, spacing) {
                return void 0 === frameMax && (frameMax = -1), void 0 === margin && (margin = 0), void 0 === spacing && (spacing = 0), this.addToFileList("spritesheet", key, url, {
                    frameWidth: frameWidth,
                    frameHeight: frameHeight,
                    frameMax: frameMax,
                    margin: margin,
                    spacing: spacing
                }, !1, ".png")
            },
            audio: function(key, urls, autoDecode) {
                return this.game.sound.noAudio ? this : (void 0 === autoDecode && (autoDecode = !0), "string" == typeof urls && (urls = [urls]), this.addToFileList("audio", key, urls, {
                    buffer: null,
                    autoDecode: autoDecode
                }))
            },
            audiosprite: function(key, urls, jsonURL, jsonData, autoDecode) {
                return this.game.sound.noAudio ? this : (void 0 === jsonURL && (jsonURL = null), void 0 === jsonData && (jsonData = null), void 0 === autoDecode && (autoDecode = !0), this.audio(key, urls, autoDecode), jsonURL ? this.json(key + "-audioatlas", jsonURL) : jsonData ? ("string" == typeof jsonData && (jsonData = JSON.parse(jsonData)), this.cache.addJSON(key + "-audioatlas", "", jsonData)) : console.warn("Phaser.Loader.audiosprite - You must specify either a jsonURL or provide a jsonData object"), this)
            },
            video: function(key, urls, loadEvent, asBlob) {
                return void 0 === loadEvent && (loadEvent = this.game.device.firefox ? "loadeddata" : "canplaythrough"), void 0 === asBlob && (asBlob = !1), "string" == typeof urls && (urls = [urls]), this.addToFileList("video", key, urls, {
                    buffer: null,
                    asBlob: asBlob,
                    loadEvent: loadEvent
                })
            },
            tilemap: function(key, url, data, format) {
                if (void 0 === url && (url = null), void 0 === data && (data = null), void 0 === format && (format = Phaser.Tilemap.CSV), url || data || (url = format === Phaser.Tilemap.CSV ? key + ".csv" : key + ".json"), data) {
                    switch (format) {
                        case Phaser.Tilemap.CSV:
                            break;
                        case Phaser.Tilemap.TILED_JSON:
                            "string" == typeof data && (data = JSON.parse(data))
                    }
                    this.cache.addTilemap(key, null, data, format)
                } else this.addToFileList("tilemap", key, url, {
                    format: format
                });
                return this
            },
            physics: function(key, url, data, format) {
                return void 0 === url && (url = null), void 0 === data && (data = null), void 0 === format && (format = Phaser.Physics.LIME_CORONA_JSON), url || data || (url = key + ".json"), data ? ("string" == typeof data && (data = JSON.parse(data)), this.cache.addPhysicsData(key, null, data, format)) : this.addToFileList("physics", key, url, {
                    format: format
                }), this
            },
            bitmapFont: function(key, textureURL, atlasURL, atlasData, xSpacing, ySpacing) {
                if ((void 0 === textureURL || null === textureURL) && (textureURL = key + ".png"), void 0 === atlasURL && (atlasURL = null), void 0 === atlasData && (atlasData = null), null === atlasURL && null === atlasData && (atlasURL = key + ".xml"), void 0 === xSpacing && (xSpacing = 0), void 0 === ySpacing && (ySpacing = 0), atlasURL) this.addToFileList("bitmapfont", key, textureURL, {
                    atlasURL: atlasURL,
                    xSpacing: xSpacing,
                    ySpacing: ySpacing
                });
                else if ("string" == typeof atlasData) {
                    var json, xml;
                    try {
                        json = JSON.parse(atlasData)
                    } catch (e) {
                        xml = this.parseXml(atlasData)
                    }
                    if (!xml && !json) throw new Error("Phaser.Loader. Invalid Bitmap Font atlas given");
                    this.addToFileList("bitmapfont", key, textureURL, {
                        atlasURL: null,
                        atlasData: json || xml,
                        atlasType: json ? "json" : "xml",
                        xSpacing: xSpacing,
                        ySpacing: ySpacing
                    })
                }
                return this
            },
            atlasJSONArray: function(key, textureURL, atlasURL, atlasData) {
                return this.atlas(key, textureURL, atlasURL, atlasData, Phaser.Loader.TEXTURE_ATLAS_JSON_ARRAY)
            },
            atlasJSONHash: function(key, textureURL, atlasURL, atlasData) {
                return this.atlas(key, textureURL, atlasURL, atlasData, Phaser.Loader.TEXTURE_ATLAS_JSON_HASH)
            },
            atlasXML: function(key, textureURL, atlasURL, atlasData) {
                return void 0 === atlasURL && (atlasURL = null), void 0 === atlasData && (atlasData = null), atlasURL || atlasData || (atlasURL = key + ".xml"), this.atlas(key, textureURL, atlasURL, atlasData, Phaser.Loader.TEXTURE_ATLAS_XML_STARLING)
            },
            atlas: function(key, textureURL, atlasURL, atlasData, format) {
                if ((void 0 === textureURL || null === textureURL) && (textureURL = key + ".png"), void 0 === atlasURL && (atlasURL = null), void 0 === atlasData && (atlasData = null), void 0 === format && (format = Phaser.Loader.TEXTURE_ATLAS_JSON_ARRAY), atlasURL || atlasData || (atlasURL = format === Phaser.Loader.TEXTURE_ATLAS_XML_STARLING ? key + ".xml" : key + ".json"), atlasURL) this.addToFileList("textureatlas", key, textureURL, {
                    atlasURL: atlasURL,
                    format: format
                });
                else {
                    switch (format) {
                        case Phaser.Loader.TEXTURE_ATLAS_JSON_ARRAY:
                            "string" == typeof atlasData && (atlasData = JSON.parse(atlasData));
                            break;
                        case Phaser.Loader.TEXTURE_ATLAS_XML_STARLING:
                            if ("string" == typeof atlasData) {
                                var xml = this.parseXml(atlasData);
                                if (!xml) throw new Error("Phaser.Loader. Invalid Texture Atlas XML given");
                                atlasData = xml
                            }
                    }
                    this.addToFileList("textureatlas", key, textureURL, {
                        atlasURL: null,
                        atlasData: atlasData,
                        format: format
                    })
                }
                return this
            },
            withSyncPoint: function(callback, callbackContext) {
                this._withSyncPointDepth++;
                try {
                    callback.call(callbackContext || this, this)
                } finally {
                    this._withSyncPointDepth--
                }
                return this
            },
            addSyncPoint: function(type, key) {
                var asset = this.getAsset(type, key);
                return asset && (asset.file.syncPoint = !0), this
            },
            removeFile: function(type, key) {
                var asset = this.getAsset(type, key);
                asset && (asset.loaded || asset.loading || this._fileList.splice(asset.index, 1))
            },
            removeAll: function() {
                this._fileList.length = 0, this._flightQueue.length = 0
            },
            start: function() {
                this.isLoading || (this.hasLoaded = !1, this.isLoading = !0, this.updateProgress(), this.processLoadQueue())
            },
            processLoadQueue: function() {
                if (!this.isLoading) return console.warn("Phaser.Loader - active loading canceled / reset"), void this.finishedLoading(!0);
                for (var i = 0; i < this._flightQueue.length; i++) {
                    var file = this._flightQueue[i];
                    (file.loaded || file.error) && (this._flightQueue.splice(i, 1), i--, file.loading = !1, file.requestUrl = null, file.requestObject = null, file.error && this.onFileError.dispatch(file.key, file), "packfile" !== file.type ? (this._loadedFileCount++, this.onFileComplete.dispatch(this.progress, file.key, !file.error, this._loadedFileCount, this._totalFileCount)) : "packfile" === file.type && file.error && (this._loadedPackCount++, this.onPackComplete.dispatch(file.key, !file.error, this._loadedPackCount, this._totalPackCount)))
                }
                for (var syncblock = !1, inflightLimit = this.enableParallel ? Phaser.Math.clamp(this.maxParallelDownloads, 1, 12) : 1, i = this._processingHead; i < this._fileList.length; i++) {
                    var file = this._fileList[i];
                    if ("packfile" === file.type && !file.error && file.loaded && i === this._processingHead && (this.processPack(file), this._loadedPackCount++, this.onPackComplete.dispatch(file.key, !file.error, this._loadedPackCount, this._totalPackCount)), file.loaded || file.error ? i === this._processingHead && (this._processingHead = i + 1) : !file.loading && this._flightQueue.length < inflightLimit && ("packfile" !== file.type || file.data ? syncblock || (this._fileLoadStarted || (this._fileLoadStarted = !0, this.onLoadStart.dispatch()), this._flightQueue.push(file), file.loading = !0, this.onFileStart.dispatch(this.progress, file.key, file.url), this.loadFile(file)) : (this._flightQueue.push(file), file.loading = !0, this.loadFile(file))), !file.loaded && file.syncPoint && (syncblock = !0), this._flightQueue.length >= inflightLimit || syncblock && this._loadedPackCount === this._totalPackCount) break
                }
                if (this.updateProgress(), this._processingHead >= this._fileList.length) this.finishedLoading();
                else if (!this._flightQueue.length) {
                    console.warn("Phaser.Loader - aborting: processing queue empty, loading may have stalled");
                    var _this = this;
                    setTimeout(function() {
                        _this.finishedLoading(!0)
                    }, 2e3)
                }
            },
            finishedLoading: function(abnormal) {
                this.hasLoaded || (this.hasLoaded = !0, this.isLoading = !1, abnormal || this._fileLoadStarted || (this._fileLoadStarted = !0, this.onLoadStart.dispatch()), this.onLoadComplete.dispatch(), this.reset(), this.game.state.loadComplete())
            },
            asyncComplete: function(file, errorMessage) {
                void 0 === errorMessage && (errorMessage = ""), file.loaded = !0, file.error = !!errorMessage, errorMessage && (file.errorMessage = errorMessage, console.warn("Phaser.Loader - " + file.type + "[" + file.key + "]: " + errorMessage)), this.processLoadQueue()
            },
            processPack: function(pack) {
                var packData = pack.data[pack.key];
                if (!packData) return void console.warn("Phaser.Loader - " + pack.key + ": pack has data, but not for pack key");
                for (var i = 0; i < packData.length; i++) {
                    var file = packData[i];
                    switch (file.type) {
                        case "image":
                            this.image(file.key, file.url, file.overwrite);
                            break;
                        case "text":
                            this.text(file.key, file.url, file.overwrite);
                            break;
                        case "json":
                            this.json(file.key, file.url, file.overwrite);
                            break;
                        case "xml":
                            this.xml(file.key, file.url, file.overwrite);
                            break;
                        case "script":
                            this.script(file.key, file.url, file.callback, pack.callbackContext || this);
                            break;
                        case "binary":
                            this.binary(file.key, file.url, file.callback, pack.callbackContext || this);
                            break;
                        case "spritesheet":
                            this.spritesheet(file.key, file.url, file.frameWidth, file.frameHeight, file.frameMax, file.margin, file.spacing);
                            break;
                        case "video":
                            this.video(file.key, file.urls);
                            break;
                        case "audio":
                            this.audio(file.key, file.urls, file.autoDecode);
                            break;
                        case "audiosprite":
                            this.audiosprite(file.key, file.urls, file.jsonURL, file.jsonData, file.autoDecode);
                            break;
                        case "tilemap":
                            this.tilemap(file.key, file.url, file.data, Phaser.Tilemap[file.format]);
                            break;
                        case "physics":
                            this.physics(file.key, file.url, file.data, Phaser.Loader[file.format]);
                            break;
                        case "bitmapFont":
                            this.bitmapFont(file.key, file.textureURL, file.atlasURL, file.atlasData, file.xSpacing, file.ySpacing);
                            break;
                        case "atlasJSONArray":
                            this.atlasJSONArray(file.key, file.textureURL, file.atlasURL, file.atlasData);
                            break;
                        case "atlasJSONHash":
                            this.atlasJSONHash(file.key, file.textureURL, file.atlasURL, file.atlasData);
                            break;
                        case "atlasXML":
                            this.atlasXML(file.key, file.textureURL, file.atlasURL, file.atlasData);
                            break;
                        case "atlas":
                            this.atlas(file.key, file.textureURL, file.atlasURL, file.atlasData, Phaser.Loader[file.format]);
                            break;
                        case "shader":
                            this.shader(file.key, file.url, file.overwrite)
                    }
                }
            },
            transformUrl: function(url, file) {
                return url ? url.match(/^(?:blob:|data:|http:\/\/|https:\/\/|\/\/)/) ? url : this.baseURL + file.path + url : !1
            },
            loadFile: function(file) {
                switch (file.type) {
                    case "packfile":
                        this.xhrLoad(file, this.transformUrl(file.url, file), "text", this.fileComplete);
                        break;
                    case "image":
                    case "spritesheet":
                    case "textureatlas":
                    case "bitmapfont":
                        this.loadImageTag(file);
                        break;
                    case "audio":
                        file.url = this.getAudioURL(file.url), file.url ? this.game.sound.usingWebAudio ? this.xhrLoad(file, this.transformUrl(file.url, file), "arraybuffer", this.fileComplete) : this.game.sound.usingAudioTag && this.loadAudioTag(file) : this.fileError(file, null, "No supported audio URL specified or device does not have audio playback support");
                        break;
                    case "video":
                        file.url = this.getVideoURL(file.url), file.url ? file.asBlob ? this.xhrLoad(file, this.transformUrl(file.url, file), "arraybuffer", this.fileComplete) : this.loadVideoTag(file) : this.fileError(file, null, "No supported video URL specified or device does not have video playback support");
                        break;
                    case "json":
                        this.xhrLoad(file, this.transformUrl(file.url, file), "text", this.jsonLoadComplete);
                        break;
                    case "xml":
                        this.xhrLoad(file, this.transformUrl(file.url, file), "text", this.xmlLoadComplete);
                        break;
                    case "tilemap":
                        file.format === Phaser.Tilemap.TILED_JSON ? this.xhrLoad(file, this.transformUrl(file.url, file), "text", this.jsonLoadComplete) : file.format === Phaser.Tilemap.CSV ? this.xhrLoad(file, this.transformUrl(file.url, file), "text", this.csvLoadComplete) : this.asyncComplete(file, "invalid Tilemap format: " + file.format);
                        break;
                    case "text":
                    case "script":
                    case "shader":
                    case "physics":
                        this.xhrLoad(file, this.transformUrl(file.url, file), "text", this.fileComplete);
                        break;
                    case "binary":
                        this.xhrLoad(file, this.transformUrl(file.url, file), "arraybuffer", this.fileComplete)
                }
            },
            loadImageTag: function(file) {
                var _this = this;
                file.data = new Image, file.data.name = file.key, this.crossOrigin && (file.data.crossOrigin = this.crossOrigin), file.data.onload = function() {
                    file.data.onload && (file.data.onload = null, file.data.onerror = null, _this.fileComplete(file))
                }, file.data.onerror = function() {
                    file.data.onload && (file.data.onload = null, file.data.onerror = null, _this.fileError(file))
                }, file.data.src = this.transformUrl(file.url, file), file.data.complete && file.data.width && file.data.height && (file.data.onload = null, file.data.onerror = null, this.fileComplete(file))
            },
            loadVideoTag: function(file) {
                var _this = this;
                file.data = document.createElement("video"), file.data.name = file.key, file.data.controls = !1, file.data.autoplay = !1;
                var videoLoadEvent = function() {
                    file.data.removeEventListener(file.loadEvent, videoLoadEvent, !1), file.data.onerror = null, file.data.canplay = !0, Phaser.GAMES[_this.game.id].load.fileComplete(file)
                };
                file.data.onerror = function() {
                    file.data.removeEventListener(file.loadEvent, videoLoadEvent, !1), file.data.onerror = null,
                        file.data.canplay = !1, _this.fileError(file)
                }, file.data.addEventListener(file.loadEvent, videoLoadEvent, !1), file.data.src = this.transformUrl(file.url, file), file.data.load()
            },
            loadAudioTag: function(file) {
                var _this = this;
                if (this.game.sound.touchLocked) file.data = new Audio, file.data.name = file.key, file.data.preload = "auto", file.data.src = this.transformUrl(file.url, file), this.fileComplete(file);
                else {
                    file.data = new Audio, file.data.name = file.key;
                    var playThroughEvent = function() {
                        file.data.removeEventListener("canplaythrough", playThroughEvent, !1), file.data.onerror = null, Phaser.GAMES[_this.game.id].load.fileComplete(file)
                    };
                    file.data.onerror = function() {
                        file.data.removeEventListener("canplaythrough", playThroughEvent, !1), file.data.onerror = null, _this.fileError(file)
                    }, file.data.preload = "auto", file.data.src = this.transformUrl(file.url, file), file.data.addEventListener("canplaythrough", playThroughEvent, !1), file.data.load()
                }
            },
            xhrLoad: function(file, url, type, onload, onerror) {
                if (this.useXDomainRequest && window.XDomainRequest) return void this.xhrLoadWithXDR(file, url, type, onload, onerror);
                var xhr = new XMLHttpRequest;
                xhr.open("GET", url, !0), xhr.responseType = type, onerror = onerror || this.fileError;
                var _this = this;
                xhr.onload = function() {
                    try {
                        return onload.call(_this, file, xhr)
                    } catch (e) {
                        _this.hasLoaded ? window.console && console.error(e) : _this.asyncComplete(file, e.message || "Exception")
                    }
                }, xhr.onerror = function() {
                    try {
                        return onerror.call(_this, file, xhr)
                    } catch (e) {
                        _this.hasLoaded ? window.console && console.error(e) : _this.asyncComplete(file, e.message || "Exception")
                    }
                }, file.requestObject = xhr, file.requestUrl = url, xhr.send()
            },
            xhrLoadWithXDR: function(file, url, type, onload, onerror) {
                this._warnedAboutXDomainRequest || this.game.device.ie && !(this.game.device.ieVersion >= 10) || (this._warnedAboutXDomainRequest = !0, console.warn("Phaser.Loader - using XDomainRequest outside of IE 9"));
                var xhr = new window.XDomainRequest;
                xhr.open("GET", url, !0), xhr.responseType = type, xhr.timeout = 3e3, onerror = onerror || this.fileError;
                var _this = this;
                xhr.onerror = function() {
                    try {
                        return onerror.call(_this, file, xhr)
                    } catch (e) {
                        _this.asyncComplete(file, e.message || "Exception")
                    }
                }, xhr.ontimeout = function() {
                    try {
                        return onerror.call(_this, file, xhr)
                    } catch (e) {
                        _this.asyncComplete(file, e.message || "Exception")
                    }
                }, xhr.onprogress = function() {}, xhr.onload = function() {
                    try {
                        return onload.call(_this, file, xhr)
                    } catch (e) {
                        _this.asyncComplete(file, e.message || "Exception")
                    }
                }, file.requestObject = xhr, file.requestUrl = url, setTimeout(function() {
                    xhr.send()
                }, 0)
            },
            getVideoURL: function(urls) {
                for (var i = 0; i < urls.length; i++) {
                    var videoType, url = urls[i];
                    if (url.uri) url = url.uri, videoType = url.type;
                    else {
                        if (0 === url.indexOf("blob:") || 0 === url.indexOf("data:")) return url;
                        url.indexOf("?") >= 0 && (url = url.substr(0, url.indexOf("?")));
                        var extension = url.substr((Math.max(0, url.lastIndexOf(".")) || 1 / 0) + 1);
                        videoType = extension.toLowerCase()
                    }
                    if (this.game.device.canPlayVideo(videoType)) return urls[i]
                }
                return null
            },
            getAudioURL: function(urls) {
                if (this.game.sound.noAudio) return null;
                for (var i = 0; i < urls.length; i++) {
                    var audioType, url = urls[i];
                    if (url.uri) url = url.uri, audioType = url.type;
                    else {
                        if (0 === url.indexOf("blob:") || 0 === url.indexOf("data:")) return url;
                        url.indexOf("?") >= 0 && (url = url.substr(0, url.indexOf("?")));
                        var extension = url.substr((Math.max(0, url.lastIndexOf(".")) || 1 / 0) + 1);
                        audioType = extension.toLowerCase()
                    }
                    if (this.game.device.canPlayAudio(audioType)) return urls[i]
                }
                return null
            },
            fileError: function(file, xhr, reason) {
                var url = file.requestUrl || this.transformUrl(file.url, file),
                    message = "error loading asset from URL " + url;
                !reason && xhr && (reason = xhr.status), reason && (message = message + " (" + reason + ")"), this.asyncComplete(file, message)
            },
            fileComplete: function(file, xhr) {
                var loadNext = !0;
                switch (file.type) {
                    case "packfile":
                        var data = JSON.parse(xhr.responseText);
                        file.data = data || {};
                        break;
                    case "image":
                        this.cache.addImage(file.key, file.url, file.data);
                        break;
                    case "spritesheet":
                        this.cache.addSpriteSheet(file.key, file.url, file.data, file.frameWidth, file.frameHeight, file.frameMax, file.margin, file.spacing);
                        break;
                    case "textureatlas":
                        if (null == file.atlasURL) this.cache.addTextureAtlas(file.key, file.url, file.data, file.atlasData, file.format);
                        else if (loadNext = !1, file.format == Phaser.Loader.TEXTURE_ATLAS_JSON_ARRAY || file.format == Phaser.Loader.TEXTURE_ATLAS_JSON_HASH || file.format == Phaser.Loader.TEXTURE_ATLAS_JSON_PYXEL) this.xhrLoad(file, this.transformUrl(file.atlasURL, file), "text", this.jsonLoadComplete);
                        else {
                            if (file.format != Phaser.Loader.TEXTURE_ATLAS_XML_STARLING) throw new Error("Phaser.Loader. Invalid Texture Atlas format: " + file.format);
                            this.xhrLoad(file, this.transformUrl(file.atlasURL, file), "text", this.xmlLoadComplete)
                        }
                        break;
                    case "bitmapfont":
                        file.atlasURL ? (loadNext = !1, this.xhrLoad(file, this.transformUrl(file.atlasURL, file), "text", function(file, xhr) {
                            var json;
                            try {
                                json = JSON.parse(xhr.responseText)
                            } catch (e) {}
                            json ? (file.atlasType = "json", this.jsonLoadComplete(file, xhr)) : (file.atlasType = "xml", this.xmlLoadComplete(file, xhr))
                        })) : this.cache.addBitmapFont(file.key, file.url, file.data, file.atlasData, file.atlasType, file.xSpacing, file.ySpacing);
                        break;
                    case "video":
                        if (file.asBlob) try {
                            file.data = new Blob([new Uint8Array(xhr.response)])
                        } catch (e) {
                            throw new Error("Phaser.Loader. Unable to parse video file as Blob: " + file.key)
                        }
                        this.cache.addVideo(file.key, file.url, file.data, file.asBlob);
                        break;
                    case "audio":
                        this.game.sound.usingWebAudio ? (file.data = xhr.response, this.cache.addSound(file.key, file.url, file.data, !0, !1), file.autoDecode && this.game.sound.decode(file.key)) : this.cache.addSound(file.key, file.url, file.data, !1, !0);
                        break;
                    case "text":
                        file.data = xhr.responseText, this.cache.addText(file.key, file.url, file.data);
                        break;
                    case "shader":
                        file.data = xhr.responseText, this.cache.addShader(file.key, file.url, file.data);
                        break;
                    case "physics":
                        var data = JSON.parse(xhr.responseText);
                        this.cache.addPhysicsData(file.key, file.url, data, file.format);
                        break;
                    case "script":
                        file.data = document.createElement("script"), file.data.language = "javascript", file.data.type = "text/javascript", file.data.defer = !1, file.data.text = xhr.responseText, document.head.appendChild(file.data), file.callback && (file.data = file.callback.call(file.callbackContext, file.key, xhr.responseText));
                        break;
                    case "binary":
                        file.callback ? file.data = file.callback.call(file.callbackContext, file.key, xhr.response) : file.data = xhr.response, this.cache.addBinary(file.key, file.data)
                }
                loadNext && this.asyncComplete(file)
            },
            jsonLoadComplete: function(file, xhr) {
                var data = JSON.parse(xhr.responseText);
                "tilemap" === file.type ? this.cache.addTilemap(file.key, file.url, data, file.format) : "bitmapfont" === file.type ? this.cache.addBitmapFont(file.key, file.url, file.data, data, file.atlasType, file.xSpacing, file.ySpacing) : "json" === file.type ? this.cache.addJSON(file.key, file.url, data) : this.cache.addTextureAtlas(file.key, file.url, file.data, data, file.format), this.asyncComplete(file)
            },
            csvLoadComplete: function(file, xhr) {
                var data = xhr.responseText;
                this.cache.addTilemap(file.key, file.url, data, file.format), this.asyncComplete(file)
            },
            xmlLoadComplete: function(file, xhr) {
                var data = xhr.responseText,
                    xml = this.parseXml(data);
                if (!xml) {
                    var responseType = xhr.responseType || xhr.contentType;
                    return console.warn("Phaser.Loader - " + file.key + ": invalid XML (" + responseType + ")"), void this.asyncComplete(file, "invalid XML")
                }
                "bitmapfont" === file.type ? this.cache.addBitmapFont(file.key, file.url, file.data, xml, file.atlasType, file.xSpacing, file.ySpacing) : "textureatlas" === file.type ? this.cache.addTextureAtlas(file.key, file.url, file.data, xml, file.format) : "xml" === file.type && this.cache.addXML(file.key, file.url, xml), this.asyncComplete(file)
            },
            parseXml: function(data) {
                var xml;
                try {
                    if (window.DOMParser) {
                        var domparser = new DOMParser;
                        xml = domparser.parseFromString(data, "text/xml")
                    } else xml = new ActiveXObject("Microsoft.XMLDOM"), xml.async = "false", xml.loadXML(data)
                } catch (e) {
                    xml = null
                }
                return xml && xml.documentElement && !xml.getElementsByTagName("parsererror").length ? xml : null
            },
            updateProgress: function() {
                this.preloadSprite && (0 === this.preloadSprite.direction ? this.preloadSprite.rect.width = Math.floor(this.preloadSprite.width / 100 * this.progress) : this.preloadSprite.rect.height = Math.floor(this.preloadSprite.height / 100 * this.progress), this.preloadSprite.sprite ? this.preloadSprite.sprite.updateCrop() : this.preloadSprite = null)
            },
            totalLoadedFiles: function() {
                return this._loadedFileCount
            },
            totalQueuedFiles: function() {
                return this._totalFileCount - this._loadedFileCount
            },
            totalLoadedPacks: function() {
                return this._totalPackCount
            },
            totalQueuedPacks: function() {
                return this._totalPackCount - this._loadedPackCount
            }
        }, Object.defineProperty(Phaser.Loader.prototype, "progressFloat", {
            get: function() {
                var progress = this._loadedFileCount / this._totalFileCount * 100;
                return Phaser.Math.clamp(progress || 0, 0, 100)
            }
        }), Object.defineProperty(Phaser.Loader.prototype, "progress", {
            get: function() {
                return Math.round(this.progressFloat)
            }
        }), Phaser.Loader.prototype.constructor = Phaser.Loader, Phaser.LoaderParser = {
            bitmapFont: function(xml, baseTexture, xSpacing, ySpacing) {
                return this.xmlBitmapFont(xml, baseTexture, xSpacing, ySpacing)
            },
            xmlBitmapFont: function(xml, baseTexture, xSpacing, ySpacing) {
                var data = {},
                    info = xml.getElementsByTagName("info")[0],
                    common = xml.getElementsByTagName("common")[0];
                data.font = info.getAttribute("face"), data.size = parseInt(info.getAttribute("size"), 10), data.lineHeight = parseInt(common.getAttribute("lineHeight"), 10) + ySpacing, data.chars = {};
                for (var letters = xml.getElementsByTagName("char"), i = 0; i < letters.length; i++) {
                    var charCode = parseInt(letters[i].getAttribute("id"), 10);
                    data.chars[charCode] = {
                        x: parseInt(letters[i].getAttribute("x"), 10),
                        y: parseInt(letters[i].getAttribute("y"), 10),
                        width: parseInt(letters[i].getAttribute("width"), 10),
                        height: parseInt(letters[i].getAttribute("height"), 10),
                        xOffset: parseInt(letters[i].getAttribute("xoffset"), 10),
                        yOffset: parseInt(letters[i].getAttribute("yoffset"), 10),
                        xAdvance: parseInt(letters[i].getAttribute("xadvance"), 10) + xSpacing,
                        kerning: {}
                    }
                }
                var kernings = xml.getElementsByTagName("kerning");
                for (i = 0; i < kernings.length; i++) {
                    var first = parseInt(kernings[i].getAttribute("first"), 10),
                        second = parseInt(kernings[i].getAttribute("second"), 10),
                        amount = parseInt(kernings[i].getAttribute("amount"), 10);
                    data.chars[second].kerning[first] = amount
                }
                return this.finalizeBitmapFont(baseTexture, data)
            },
            jsonBitmapFont: function(json, baseTexture, xSpacing, ySpacing) {
                var data = {
                    font: json.font.info._face,
                    size: parseInt(json.font.info._size, 10),
                    lineHeight: parseInt(json.font.common._lineHeight, 10) + ySpacing,
                    chars: {}
                };
                return json.font.chars["char"].forEach(function(letter) {
                    var charCode = parseInt(letter._id, 10);
                    data.chars[charCode] = {
                        x: parseInt(letter._x, 10),
                        y: parseInt(letter._y, 10),
                        width: parseInt(letter._width, 10),
                        height: parseInt(letter._height, 10),
                        xOffset: parseInt(letter._xoffset, 10),
                        yOffset: parseInt(letter._yoffset, 10),
                        xAdvance: parseInt(letter._xadvance, 10) + xSpacing,
                        kerning: {}
                    }
                }), json.font.kernings && json.font.kernings.kerning && json.font.kernings.kerning.forEach(function(kerning) {
                    data.chars[kerning._second].kerning[kerning._first] = parseInt(kerning._amount, 10)
                }), this.finalizeBitmapFont(baseTexture, data)
            },
            finalizeBitmapFont: function(baseTexture, bitmapFontData) {
                return Object.keys(bitmapFontData.chars).forEach(function(charCode) {
                    var letter = bitmapFontData.chars[charCode];
                    letter.texture = new PIXI.Texture(baseTexture, new Phaser.Rectangle(letter.x, letter.y, letter.width, letter.height))
                }), bitmapFontData
            }
        }, Phaser.AudioSprite = function(game, key) {
            this.game = game, this.key = key, this.config = this.game.cache.getJSON(key + "-audioatlas"), this.autoplayKey = null, this.autoplay = !1, this.sounds = {};
            for (var k in this.config.spritemap) {
                var marker = this.config.spritemap[k],
                    sound = this.game.add.sound(this.key);
                sound.addMarker(k, marker.start, marker.end - marker.start, null, marker.loop), this.sounds[k] = sound
            }
            this.config.autoplay && (this.autoplayKey = this.config.autoplay, this.play(this.autoplayKey), this.autoplay = this.sounds[this.autoplayKey])
        }, Phaser.AudioSprite.prototype = {
            play: function(marker, volume) {
                return void 0 === volume && (volume = 1), this.sounds[marker].play(marker, null, volume)
            },
            stop: function(marker) {
                if (marker) this.sounds[marker].stop();
                else
                    for (var key in this.sounds) this.sounds[key].stop()
            },
            get: function(marker) {
                return this.sounds[marker]
            }
        }, Phaser.AudioSprite.prototype.constructor = Phaser.AudioSprite, Phaser.Sound = function(game, key, volume, loop, connect) {
            void 0 === volume && (volume = 1), void 0 === loop && (loop = !1), void 0 === connect && (connect = game.sound.connectToMaster), this.game = game, this.name = key, this.key = key, this.loop = loop, this.volume = volume, this.markers = {}, this.context = null, this.autoplay = !1, this.totalDuration = 0, this.startTime = 0, this.currentTime = 0, this.duration = 0, this.durationMS = 0, this.position = 0, this.stopTime = 0, this.paused = !1, this.pausedPosition = 0, this.pausedTime = 0, this.isPlaying = !1, this.currentMarker = "", this.fadeTween = null, this.pendingPlayback = !1, this.override = !1, this.allowMultiple = !1, this.usingWebAudio = this.game.sound.usingWebAudio, this.usingAudioTag = this.game.sound.usingAudioTag, this.externalNode = null, this.masterGainNode = null, this.gainNode = null, this._sound = null, this.usingWebAudio ? (this.context = this.game.sound.context, this.masterGainNode = this.game.sound.masterGain, void 0 === this.context.createGain ? this.gainNode = this.context.createGainNode() : this.gainNode = this.context.createGain(), this.gainNode.gain.value = volume * this.game.sound.volume, connect && this.gainNode.connect(this.masterGainNode)) : this.usingAudioTag && (this.game.cache.getSound(key) && this.game.cache.isSoundReady(key) ? (this._sound = this.game.cache.getSoundData(key), this.totalDuration = 0, this._sound.duration && (this.totalDuration = this._sound.duration)) : this.game.cache.onSoundUnlock.add(this.soundHasUnlocked, this)), this.onDecoded = new Phaser.Signal, this.onPlay = new Phaser.Signal, this.onPause = new Phaser.Signal, this.onResume = new Phaser.Signal, this.onLoop = new Phaser.Signal, this.onStop = new Phaser.Signal, this.onMute = new Phaser.Signal, this.onMarkerComplete = new Phaser.Signal, this.onFadeComplete = new Phaser.Signal, this._volume = volume, this._buffer = null, this._muted = !1, this._tempMarker = 0, this._tempPosition = 0, this._tempVolume = 0, this._muteVolume = 0, this._tempLoop = 0, this._paused = !1, this._onDecodedEventDispatched = !1
        }, Phaser.Sound.prototype = {
            soundHasUnlocked: function(key) {
                key === this.key && (this._sound = this.game.cache.getSoundData(this.key), this.totalDuration = this._sound.duration)
            },
            addMarker: function(name, start, duration, volume, loop) {
                (void 0 === volume || null === volume) && (volume = 1), void 0 === loop && (loop = !1), this.markers[name] = {
                    name: name,
                    start: start,
                    stop: start + duration,
                    volume: volume,
                    duration: duration,
                    durationMS: 1e3 * duration,
                    loop: loop
                }
            },
            removeMarker: function(name) {
                delete this.markers[name]
            },
            onEndedHandler: function() {
                this._sound.onended = null, this.isPlaying = !1, this.stop()
            },
            update: function() {
                return this.game.cache.checkSoundKey(this.key) ? (this.isDecoded && !this._onDecodedEventDispatched && (this.onDecoded.dispatch(this), this._onDecodedEventDispatched = !0), this.pendingPlayback && this.game.cache.isSoundReady(this.key) && (this.pendingPlayback = !1, this.play(this._tempMarker, this._tempPosition, this._tempVolume, this._tempLoop)), void(this.isPlaying && (this.currentTime = this.game.time.time - this.startTime, this.currentTime >= this.durationMS && (this.usingWebAudio ? this.loop ? (this.onLoop.dispatch(this), "" === this.currentMarker ? (this.currentTime = 0, this.startTime = this.game.time.time) : (this.onMarkerComplete.dispatch(this.currentMarker, this), this.play(this.currentMarker, 0, this.volume, !0, !0))) : "" !== this.currentMarker && this.stop() : this.loop ? (this.onLoop.dispatch(this), this.play(this.currentMarker, 0, this.volume, !0, !0)) : this.stop())))) : void this.destroy()
            },
            loopFull: function(volume) {
                this.play(null, 0, volume, !0)
            },
            play: function(marker, position, volume, loop, forceRestart) {
                if ((void 0 === marker || marker === !1 || null === marker) && (marker = ""), void 0 === forceRestart && (forceRestart = !0), this.isPlaying && !this.allowMultiple && !forceRestart && !this.override) return this;
                if (this._sound && this.isPlaying && !this.allowMultiple && (this.override || forceRestart))
                    if (this.usingWebAudio)
                        if (this.externalNode ? this._sound.disconnect(this.externalNode) : this._sound.disconnect(this.gainNode), void 0 === this._sound.stop) this._sound.noteOff(0);
                        else try {
                            this._sound.stop(0)
                        } catch (e) {} else this.usingAudioTag && (this._sound.pause(), this._sound.currentTime = 0);
                if ("" === marker && Object.keys(this.markers).length > 0) return this;
                if ("" !== marker) {
                    if (this.currentMarker = marker, !this.markers[marker]) return this;
                    this.position = this.markers[marker].start, this.volume = this.markers[marker].volume, this.loop = this.markers[marker].loop, this.duration = this.markers[marker].duration, this.durationMS = this.markers[marker].durationMS, "undefined" != typeof volume && (this.volume = volume), "undefined" != typeof loop && (this.loop = loop), this._tempMarker = marker, this._tempPosition = this.position, this._tempVolume = this.volume, this._tempLoop = this.loop
                } else position = position || 0, void 0 === volume && (volume = this._volume), void 0 === loop && (loop = this.loop), this.position = position, this.volume = volume, this.loop = loop, this.duration = 0, this.durationMS = 0, this._tempMarker = marker, this._tempPosition = position, this._tempVolume = volume, this._tempLoop = loop;
                return this.usingWebAudio ? this.game.cache.isSoundDecoded(this.key) ? (this._sound = this.context.createBufferSource(), this.externalNode ? this._sound.connect(this.externalNode) : this._sound.connect(this.gainNode), this._buffer = this.game.cache.getSoundData(this.key), this._sound.buffer = this._buffer, this.loop && "" === marker && (this._sound.loop = !0), this.loop || "" !== marker || (this._sound.onended = this.onEndedHandler.bind(this)), this.totalDuration = this._sound.buffer.duration, 0 === this.duration && (this.duration = this.totalDuration, this.durationMS = Math.ceil(1e3 * this.totalDuration)), void 0 === this._sound.start ? this._sound.noteGrainOn(0, this.position, this.duration) : this.loop && "" === marker ? this._sound.start(0, 0) : this._sound.start(0, this.position, this.duration), this.isPlaying = !0, this.startTime = this.game.time.time, this.currentTime = 0, this.stopTime = this.startTime + this.durationMS, this.onPlay.dispatch(this)) : (this.pendingPlayback = !0, this.game.cache.getSound(this.key) && this.game.cache.getSound(this.key).isDecoding === !1 && this.game.sound.decode(this.key, this)) : this.game.cache.getSound(this.key) && this.game.cache.getSound(this.key).locked ? (this.game.cache.reloadSound(this.key), this.pendingPlayback = !0) : this._sound && (this.game.device.cocoonJS || 4 === this._sound.readyState) ? (this._sound.play(), this.totalDuration = this._sound.duration, 0 === this.duration && (this.duration = this.totalDuration, this.durationMS = 1e3 * this.totalDuration), this._sound.currentTime = this.position, this._sound.muted = this._muted, this._muted ? this._sound.volume = 0 : this._sound.volume = this._volume, this.isPlaying = !0, this.startTime = this.game.time.time, this.currentTime = 0, this.stopTime = this.startTime + this.durationMS, this.onPlay.dispatch(this)) : this.pendingPlayback = !0, this
            },
            restart: function(marker, position, volume, loop) {
                marker = marker || "", position = position || 0, volume = volume || 1, void 0 === loop && (loop = !1), this.play(marker, position, volume, loop, !0)
            },
            pause: function() {
                this.isPlaying && this._sound && (this.paused = !0, this.pausedPosition = this.currentTime, this.pausedTime = this.game.time.time, this.onPause.dispatch(this), this.stop())
            },
            resume: function() {
                if (this.paused && this._sound) {
                    if (this.usingWebAudio) {
                        var p = this.position + this.pausedPosition / 1e3;
                        this._sound = this.context.createBufferSource(), this._sound.buffer = this._buffer, this.externalNode ? this._sound.connect(this.externalNode) : this._sound.connect(this.gainNode), this.loop && (this._sound.loop = !0), this.loop || "" !== this.currentMarker || (this._sound.onended = this.onEndedHandler.bind(this));
                        var duration = this.duration - this.pausedPosition / 1e3;
                        void 0 === this._sound.start ? this._sound.noteGrainOn(0, p, duration) : this.loop && this.game.device.chrome ? 42 === this.game.device.chromeVersion ? this._sound.start(0) : this._sound.start(0, p) : this._sound.start(0, p, duration)
                    } else this._sound.play();
                    this.isPlaying = !0, this.paused = !1, this.startTime += this.game.time.time - this.pausedTime, this.onResume.dispatch(this)
                }
            },
            stop: function() {
                if (this.isPlaying && this._sound)
                    if (this.usingWebAudio)
                        if (this.externalNode ? this._sound.disconnect(this.externalNode) : this._sound.disconnect(this.gainNode), void 0 === this._sound.stop) this._sound.noteOff(0);
                        else try {
                            this._sound.stop(0)
                        } catch (e) {} else this.usingAudioTag && (this._sound.pause(), this._sound.currentTime = 0);
                this.pendingPlayback = !1, this.isPlaying = !1;
                var prevMarker = this.currentMarker;
                "" !== this.currentMarker && this.onMarkerComplete.dispatch(this.currentMarker, this), this.currentMarker = "", null !== this.fadeTween && this.fadeTween.stop(), this.paused || this.onStop.dispatch(this, prevMarker)
            },
            fadeIn: function(duration, loop, marker) {
                void 0 === loop && (loop = !1), void 0 === marker && (marker = this.currentMarker), this.paused || (this.play(marker, 0, 0, loop), this.fadeTo(duration, 1))
            },
            fadeOut: function(duration) {
                this.fadeTo(duration, 0)
            },
            fadeTo: function(duration, volume) {
                if (this.isPlaying && !this.paused && volume !== this.volume) {
                    if (void 0 === duration && (duration = 1e3), void 0 === volume) return void console.warn("Phaser.Sound.fadeTo: No Volume Specified.");
                    this.fadeTween = this.game.add.tween(this).to({
                        volume: volume
                    }, duration, Phaser.Easing.Linear.None, !0), this.fadeTween.onComplete.add(this.fadeComplete, this)
                }
            },
            fadeComplete: function() {
                this.onFadeComplete.dispatch(this, this.volume), 0 === this.volume && this.stop()
            },
            destroy: function(remove) {
                void 0 === remove && (remove = !0), this.stop(), remove ? this.game.sound.remove(this) : (this.markers = {}, this.context = null, this._buffer = null, this.externalNode = null, this.onDecoded.dispose(), this.onPlay.dispose(), this.onPause.dispose(), this.onResume.dispose(), this.onLoop.dispose(), this.onStop.dispose(), this.onMute.dispose(), this.onMarkerComplete.dispose())
            }
        }, Phaser.Sound.prototype.constructor = Phaser.Sound, Object.defineProperty(Phaser.Sound.prototype, "isDecoding", {
            get: function() {
                return this.game.cache.getSound(this.key).isDecoding
            }
        }), Object.defineProperty(Phaser.Sound.prototype, "isDecoded", {
            get: function() {
                return this.game.cache.isSoundDecoded(this.key)
            }
        }), Object.defineProperty(Phaser.Sound.prototype, "mute", {
            get: function() {
                return this._muted || this.game.sound.mute
            },
            set: function(value) {
                value = value || !1, value !== this._muted && (value ? (this._muted = !0, this._muteVolume = this._tempVolume, this.usingWebAudio ? this.gainNode.gain.value = 0 : this.usingAudioTag && this._sound && (this._sound.volume = 0)) : (this._muted = !1, this.usingWebAudio ? this.gainNode.gain.value = this._muteVolume : this.usingAudioTag && this._sound && (this._sound.volume = this._muteVolume)), this.onMute.dispatch(this))
            }
        }), Object.defineProperty(Phaser.Sound.prototype, "volume", {
            get: function() {
                return this._volume
            },
            set: function(value) {
                return this.game.device.firefox && this.usingAudioTag && (value = this.game.math.clamp(value, 0, 1)), this._muted ? void(this._muteVolume = value) : (this._tempVolume = value, this._volume = value, void(this.usingWebAudio ? this.gainNode.gain.value = value : this.usingAudioTag && this._sound && (this._sound.volume = value)))
            }
        }), Phaser.SoundManager = function(game) {
            this.game = game, this.onSoundDecode = new Phaser.Signal, this.onVolumeChange = new Phaser.Signal, this.onMute = new Phaser.Signal, this.onUnMute = new Phaser.Signal, this.context = null, this.usingWebAudio = !1, this.usingAudioTag = !1, this.noAudio = !1, this.connectToMaster = !0, this.touchLocked = !1, this.channels = 32, this._codeMuted = !1, this._muted = !1, this._unlockSource = null, this._volume = 1, this._sounds = [], this._watchList = new Phaser.ArraySet, this._watching = !1, this._watchCallback = null, this._watchContext = null
        }, Phaser.SoundManager.prototype = {
            boot: function() {
                if (this.game.device.iOS && this.game.device.webAudio === !1 && (this.channels = 1), window.PhaserGlobal) {
                    if (window.PhaserGlobal.disableAudio === !0) return this.noAudio = !0, void(this.touchLocked = !1);
                    if (window.PhaserGlobal.disableWebAudio === !0) return this.usingAudioTag = !0, void(this.touchLocked = !1)
                }
                if (window.PhaserGlobal && window.PhaserGlobal.audioContext) this.context = window.PhaserGlobal.audioContext;
                else if (window.AudioContext) try {
                        this.context = new window.AudioContext
                    } catch (error) {
                        this.context = null, this.usingWebAudio = !1, this.touchLocked = !1
                    } else if (window.webkitAudioContext) try {
                        this.context = new window.webkitAudioContext
                    } catch (error) {
                        this.context = null, this.usingWebAudio = !1, this.touchLocked = !1
                    }
                    if (null === this.context) {
                        if (void 0 === window.Audio) return void(this.noAudio = !0);
                        this.usingAudioTag = !0
                    } else this.usingWebAudio = !0, void 0 === this.context.createGain ? this.masterGain = this.context.createGainNode() : this.masterGain = this.context.createGain(), this.masterGain.gain.value = 1, this.masterGain.connect(this.context.destination);
                this.noAudio || (!this.game.device.cocoonJS && this.game.device.iOS || window.PhaserGlobal && window.PhaserGlobal.fakeiOSTouchLock) && this.setTouchLock()
            },
            setTouchLock: function() {
                this.game.device.iOSVersion > 8 ? this.game.input.touch.addTouchLockCallback(this.unlock, this, !0) : this.game.input.touch.addTouchLockCallback(this.unlock, this), this.touchLocked = !0
            },
            unlock: function() {
                if (this.noAudio || !this.touchLocked || null !== this._unlockSource) return !0;
                if (this.usingAudioTag) this.touchLocked = !1, this._unlockSource = null;
                else if (this.usingWebAudio) {
                    var buffer = this.context.createBuffer(1, 1, 22050);
                    this._unlockSource = this.context.createBufferSource(), this._unlockSource.buffer = buffer, this._unlockSource.connect(this.context.destination), void 0 === this._unlockSource.start ? this._unlockSource.noteOn(0) : this._unlockSource.start(0)
                }
                return !0
            },
            stopAll: function() {
                if (!this.noAudio)
                    for (var i = 0; i < this._sounds.length; i++) this._sounds[i] && this._sounds[i].stop()
            },
            pauseAll: function() {
                if (!this.noAudio)
                    for (var i = 0; i < this._sounds.length; i++) this._sounds[i] && this._sounds[i].pause()
            },
            resumeAll: function() {
                if (!this.noAudio)
                    for (var i = 0; i < this._sounds.length; i++) this._sounds[i] && this._sounds[i].resume()
            },
            decode: function(key, sound) {
                sound = sound || null;
                var soundData = this.game.cache.getSoundData(key);
                if (soundData && this.game.cache.isSoundDecoded(key) === !1) {
                    this.game.cache.updateSound(key, "isDecoding", !0);
                    var _this = this;
                    try {
                        this.context.decodeAudioData(soundData, function(buffer) {
                            buffer && (_this.game.cache.decodedSound(key, buffer), _this.onSoundDecode.dispatch(key, sound))
                        })
                    } catch (e) {}
                }
            },
            setDecodedCallback: function(files, callback, callbackContext) {
                "string" == typeof files && (files = [files]), this._watchList.reset();
                for (var i = 0; i < files.length; i++) files[i] instanceof Phaser.Sound ? this.game.cache.isSoundDecoded(files[i].key) || this._watchList.add(files[i].key) : this.game.cache.isSoundDecoded(files[i]) || this._watchList.add(files[i]);
                0 === this._watchList.total ? (this._watching = !1, callback.call(callbackContext)) : (this._watching = !0, this._watchCallback = callback, this._watchContext = callbackContext)
            },
            update: function() {
                if (!this.noAudio) {
                    !this.touchLocked || null === this._unlockSource || this._unlockSource.playbackState !== this._unlockSource.PLAYING_STATE && this._unlockSource.playbackState !== this._unlockSource.FINISHED_STATE || (this.touchLocked = !1, this._unlockSource = null);
                    for (var i = 0; i < this._sounds.length; i++) this._sounds[i].update();
                    if (this._watching) {
                        for (var key = this._watchList.first; key;) this.game.cache.isSoundDecoded(key) && this._watchList.remove(key), key = this._watchList.next;
                        0 === this._watchList.total && (this._watching = !1, this._watchCallback.call(this._watchContext))
                    }
                }
            },
            add: function(key, volume, loop, connect) {
                void 0 === volume && (volume = 1), void 0 === loop && (loop = !1), void 0 === connect && (connect = this.connectToMaster);
                var sound = new Phaser.Sound(this.game, key, volume, loop, connect);
                return this._sounds.push(sound), sound
            },
            addSprite: function(key) {
                var audioSprite = new Phaser.AudioSprite(this.game, key);
                return audioSprite
            },
            remove: function(sound) {
                for (var i = this._sounds.length; i--;)
                    if (this._sounds[i] === sound) return this._sounds[i].destroy(!1), this._sounds.splice(i, 1), !0;
                return !1
            },
            removeByKey: function(key) {
                for (var i = this._sounds.length, removed = 0; i--;) this._sounds[i].key === key && (this._sounds[i].destroy(!1), this._sounds.splice(i, 1), removed++);
                return removed
            },
            play: function(key, volume, loop) {
                if (!this.noAudio) {
                    var sound = this.add(key, volume, loop);
                    return sound.play(), sound
                }
            },
            setMute: function() {
                if (!this._muted) {
                    this._muted = !0, this.usingWebAudio && (this._muteVolume = this.masterGain.gain.value, this.masterGain.gain.value = 0);
                    for (var i = 0; i < this._sounds.length; i++) this._sounds[i].usingAudioTag && (this._sounds[i].mute = !0);
                    this.onMute.dispatch()
                }
            },
            unsetMute: function() {
                if (this._muted && !this._codeMuted) {
                    this._muted = !1, this.usingWebAudio && (this.masterGain.gain.value = this._muteVolume);
                    for (var i = 0; i < this._sounds.length; i++) this._sounds[i].usingAudioTag && (this._sounds[i].mute = !1);
                    this.onUnMute.dispatch()
                }
            },
            destroy: function() {
                this.stopAll();
                for (var i = 0; i < this._sounds.length; i++) this._sounds[i] && this._sounds[i].destroy();
                this._sounds = [], this.onSoundDecode.dispose(), this.context && window.PhaserGlobal && (window.PhaserGlobal.audioContext = this.context)
            }
        }, Phaser.SoundManager.prototype.constructor = Phaser.SoundManager, Object.defineProperty(Phaser.SoundManager.prototype, "mute", {
            get: function() {
                return this._muted
            },
            set: function(value) {
                if (value = value || !1) {
                    if (this._muted) return;
                    this._codeMuted = !0, this.setMute()
                } else {
                    if (!this._muted) return;
                    this._codeMuted = !1, this.unsetMute()
                }
            }
        }), Object.defineProperty(Phaser.SoundManager.prototype, "volume", {
            get: function() {
                return this._volume
            },
            set: function(value) {
                if (0 > value ? value = 0 : value > 1 && (value = 1), this._volume !== value) {
                    if (this._volume = value, this.usingWebAudio) this.masterGain.gain.value = value;
                    else
                        for (var i = 0; i < this._sounds.length; i++) this._sounds[i].usingAudioTag && (this._sounds[i].volume = this._sounds[i].volume * value);
                    this.onVolumeChange.dispatch(value)
                }
            }
        }), Phaser.ScaleManager = function(game, width, height) {
            this.game = game, this.dom = Phaser.DOM, this.grid = null, this.width = 0, this.height = 0, this.minWidth = null, this.maxWidth = null, this.minHeight = null, this.maxHeight = null, this.offset = new Phaser.Point, this.forceLandscape = !1, this.forcePortrait = !1, this.incorrectOrientation = !1, this._pageAlignHorizontally = !1, this._pageAlignVertically = !1, this.onOrientationChange = new Phaser.Signal, this.enterIncorrectOrientation = new Phaser.Signal, this.leaveIncorrectOrientation = new Phaser.Signal, this.fullScreenTarget = null, this._createdFullScreenTarget = null, this.onFullScreenInit = new Phaser.Signal, this.onFullScreenChange = new Phaser.Signal, this.onFullScreenError = new Phaser.Signal, this.screenOrientation = this.dom.getScreenOrientation(), this.scaleFactor = new Phaser.Point(1, 1), this.scaleFactorInversed = new Phaser.Point(1, 1), this.margin = {
                left: 0,
                top: 0,
                right: 0,
                bottom: 0,
                x: 0,
                y: 0
            }, this.bounds = new Phaser.Rectangle, this.aspectRatio = 0, this.sourceAspectRatio = 0, this.event = null, this.windowConstraints = {
                right: "layout",
                bottom: ""
            }, this.compatibility = {
                supportsFullScreen: !1,
                orientationFallback: null,
                noMargins: !1,
                scrollTo: null,
                forceMinimumDocumentHeight: !1,
                canExpandParent: !0,
                clickTrampoline: ""
            }, this._scaleMode = Phaser.ScaleManager.NO_SCALE, this._fullScreenScaleMode = Phaser.ScaleManager.NO_SCALE, this.parentIsWindow = !1, this.parentNode = null, this.parentScaleFactor = new Phaser.Point(1, 1), this.trackParentInterval = 2e3, this.onSizeChange = new Phaser.Signal, this.onResize = null, this.onResizeContext = null, this._pendingScaleMode = null, this._fullScreenRestore = null, this._gameSize = new Phaser.Rectangle, this._userScaleFactor = new Phaser.Point(1, 1), this._userScaleTrim = new Phaser.Point(0, 0), this._lastUpdate = 0, this._updateThrottle = 0, this._updateThrottleReset = 100, this._parentBounds = new Phaser.Rectangle, this._tempBounds = new Phaser.Rectangle, this._lastReportedCanvasSize = new Phaser.Rectangle, this._lastReportedGameSize = new Phaser.Rectangle, this._booted = !1, game.config && this.parseConfig(game.config), this.setupScale(width, height)
        }, Phaser.ScaleManager.EXACT_FIT = 0, Phaser.ScaleManager.NO_SCALE = 1, Phaser.ScaleManager.SHOW_ALL = 2, Phaser.ScaleManager.RESIZE = 3, Phaser.ScaleManager.USER_SCALE = 4, Phaser.ScaleManager.prototype = {
            boot: function() {
                var compat = this.compatibility;
                compat.supportsFullScreen = this.game.device.fullscreen && !this.game.device.cocoonJS, this.game.device.iPad || this.game.device.webApp || this.game.device.desktop || (this.game.device.android && !this.game.device.chrome ? compat.scrollTo = new Phaser.Point(0, 1) : compat.scrollTo = new Phaser.Point(0, 0)), this.game.device.desktop ? (compat.orientationFallback = "screen", compat.clickTrampoline = "when-not-mouse") : (compat.orientationFallback = "", compat.clickTrampoline = "");
                var _this = this;
                this._orientationChange = function(event) {
                        return _this.orientationChange(event)
                    }, this._windowResize = function(event) {
                        return _this.windowResize(event)
                    }, window.addEventListener("orientationchange", this._orientationChange, !1),
                    window.addEventListener("resize", this._windowResize, !1), this.compatibility.supportsFullScreen && (this._fullScreenChange = function(event) {
                        return _this.fullScreenChange(event)
                    }, this._fullScreenError = function(event) {
                        return _this.fullScreenError(event)
                    }, document.addEventListener("webkitfullscreenchange", this._fullScreenChange, !1), document.addEventListener("mozfullscreenchange", this._fullScreenChange, !1), document.addEventListener("MSFullscreenChange", this._fullScreenChange, !1), document.addEventListener("fullscreenchange", this._fullScreenChange, !1), document.addEventListener("webkitfullscreenerror", this._fullScreenError, !1), document.addEventListener("mozfullscreenerror", this._fullScreenError, !1), document.addEventListener("MSFullscreenError", this._fullScreenError, !1), document.addEventListener("fullscreenerror", this._fullScreenError, !1)), this.game.onResume.add(this._gameResumed, this), this.dom.getOffset(this.game.canvas, this.offset), this.bounds.setTo(this.offset.x, this.offset.y, this.width, this.height), this.setGameSize(this.game.width, this.game.height), this.screenOrientation = this.dom.getScreenOrientation(this.compatibility.orientationFallback), Phaser.FlexGrid && (this.grid = new Phaser.FlexGrid(this, this.width, this.height)), this._booted = !0, this._pendingScaleMode && (this.scaleMode = this._pendingScaleMode, this._pendingScaleMode = null)
            },
            parseConfig: function(config) {
                config.scaleMode && (this._booted ? this.scaleMode = config.scaleMode : this._pendingScaleMode = config.scaleMode), config.fullScreenScaleMode && (this.fullScreenScaleMode = config.fullScreenScaleMode), config.fullScreenTarget && (this.fullScreenTarget = config.fullScreenTarget)
            },
            setupScale: function(width, height) {
                var target, rect = new Phaser.Rectangle;
                "" !== this.game.parent && ("string" == typeof this.game.parent ? target = document.getElementById(this.game.parent) : this.game.parent && 1 === this.game.parent.nodeType && (target = this.game.parent)), target ? (this.parentNode = target, this.parentIsWindow = !1, this.getParentBounds(this._parentBounds), rect.width = this._parentBounds.width, rect.height = this._parentBounds.height, this.offset.set(this._parentBounds.x, this._parentBounds.y)) : (this.parentNode = null, this.parentIsWindow = !0, rect.width = this.dom.visualBounds.width, rect.height = this.dom.visualBounds.height, this.offset.set(0, 0));
                var newWidth = 0,
                    newHeight = 0;
                "number" == typeof width ? newWidth = width : (this.parentScaleFactor.x = parseInt(width, 10) / 100, newWidth = rect.width * this.parentScaleFactor.x), "number" == typeof height ? newHeight = height : (this.parentScaleFactor.y = parseInt(height, 10) / 100, newHeight = rect.height * this.parentScaleFactor.y), this._gameSize.setTo(0, 0, newWidth, newHeight), this.updateDimensions(newWidth, newHeight, !1)
            },
            _gameResumed: function() {
                this.queueUpdate(!0)
            },
            setGameSize: function(width, height) {
                this._gameSize.setTo(0, 0, width, height), this.currentScaleMode !== Phaser.ScaleManager.RESIZE && this.updateDimensions(width, height, !0), this.queueUpdate(!0)
            },
            setUserScale: function(hScale, vScale, hTrim, vTrim) {
                this._userScaleFactor.setTo(hScale, vScale), this._userScaleTrim.setTo(0 | hTrim, 0 | vTrim), this.queueUpdate(!0)
            },
            setResizeCallback: function(callback, context) {
                this.onResize = callback, this.onResizeContext = context
            },
            signalSizeChange: function() {
                if (!Phaser.Rectangle.sameDimensions(this, this._lastReportedCanvasSize) || !Phaser.Rectangle.sameDimensions(this.game, this._lastReportedGameSize)) {
                    var width = this.width,
                        height = this.height;
                    this._lastReportedCanvasSize.setTo(0, 0, width, height), this._lastReportedGameSize.setTo(0, 0, this.game.width, this.game.height), this.grid && this.grid.onResize(width, height), this.onSizeChange.dispatch(this, width, height), this.currentScaleMode === Phaser.ScaleManager.RESIZE && (this.game.state.resize(width, height), this.game.load.resize(width, height))
                }
            },
            setMinMax: function(minWidth, minHeight, maxWidth, maxHeight) {
                this.minWidth = minWidth, this.minHeight = minHeight, "undefined" != typeof maxWidth && (this.maxWidth = maxWidth), "undefined" != typeof maxHeight && (this.maxHeight = maxHeight)
            },
            preUpdate: function() {
                if (!(this.game.time.time < this._lastUpdate + this._updateThrottle)) {
                    var prevThrottle = this._updateThrottle;
                    this._updateThrottleReset = prevThrottle >= 400 ? 0 : 100, this.dom.getOffset(this.game.canvas, this.offset);
                    var prevWidth = this._parentBounds.width,
                        prevHeight = this._parentBounds.height,
                        bounds = this.getParentBounds(this._parentBounds),
                        boundsChanged = bounds.width !== prevWidth || bounds.height !== prevHeight,
                        orientationChanged = this.updateOrientationState();
                    (boundsChanged || orientationChanged) && (this.onResize && this.onResize.call(this.onResizeContext, this, bounds), this.updateLayout(), this.signalSizeChange());
                    var throttle = 2 * this._updateThrottle;
                    this._updateThrottle < prevThrottle && (throttle = Math.min(prevThrottle, this._updateThrottleReset)), this._updateThrottle = Phaser.Math.clamp(throttle, 25, this.trackParentInterval), this._lastUpdate = this.game.time.time
                }
            },
            pauseUpdate: function() {
                this.preUpdate(), this._updateThrottle = this.trackParentInterval
            },
            updateDimensions: function(width, height, resize) {
                this.width = width * this.parentScaleFactor.x, this.height = height * this.parentScaleFactor.y, this.game.width = this.width, this.game.height = this.height, this.sourceAspectRatio = this.width / this.height, this.updateScalingAndBounds(), resize && (this.game.renderer.resize(this.width, this.height), this.game.camera.setSize(this.width, this.height), this.game.world.resize(this.width, this.height))
            },
            updateScalingAndBounds: function() {
                this.scaleFactor.x = this.game.width / this.width, this.scaleFactor.y = this.game.height / this.height, this.scaleFactorInversed.x = this.width / this.game.width, this.scaleFactorInversed.y = this.height / this.game.height, this.aspectRatio = this.width / this.height, this.game.canvas && this.dom.getOffset(this.game.canvas, this.offset), this.bounds.setTo(this.offset.x, this.offset.y, this.width, this.height), this.game.input && this.game.input.scale && this.game.input.scale.setTo(this.scaleFactor.x, this.scaleFactor.y)
            },
            forceOrientation: function(forceLandscape, forcePortrait) {
                void 0 === forcePortrait && (forcePortrait = !1), this.forceLandscape = forceLandscape, this.forcePortrait = forcePortrait, this.queueUpdate(!0)
            },
            classifyOrientation: function(orientation) {
                return "portrait-primary" === orientation || "portrait-secondary" === orientation ? "portrait" : "landscape-primary" === orientation || "landscape-secondary" === orientation ? "landscape" : null
            },
            updateOrientationState: function() {
                var previousOrientation = this.screenOrientation,
                    previouslyIncorrect = this.incorrectOrientation;
                this.screenOrientation = this.dom.getScreenOrientation(this.compatibility.orientationFallback), this.incorrectOrientation = this.forceLandscape && !this.isLandscape || this.forcePortrait && !this.isPortrait;
                var changed = previousOrientation !== this.screenOrientation,
                    correctnessChanged = previouslyIncorrect !== this.incorrectOrientation;
                return correctnessChanged && (this.incorrectOrientation ? this.enterIncorrectOrientation.dispatch() : this.leaveIncorrectOrientation.dispatch()), (changed || correctnessChanged) && this.onOrientationChange.dispatch(this, previousOrientation, previouslyIncorrect), changed || correctnessChanged
            },
            orientationChange: function(event) {
                this.event = event, this.queueUpdate(!0)
            },
            windowResize: function(event) {
                this.event = event, this.queueUpdate(!0)
            },
            scrollTop: function() {
                var scrollTo = this.compatibility.scrollTo;
                scrollTo && window.scrollTo(scrollTo.x, scrollTo.y)
            },
            refresh: function() {
                this.scrollTop(), this.queueUpdate(!0)
            },
            updateLayout: function() {
                var scaleMode = this.currentScaleMode;
                if (scaleMode === Phaser.ScaleManager.RESIZE) return void this.reflowGame();
                if (this.scrollTop(), this.compatibility.forceMinimumDocumentHeight && (document.documentElement.style.minHeight = window.innerHeight + "px"), this.incorrectOrientation ? this.setMaximum() : scaleMode === Phaser.ScaleManager.EXACT_FIT ? this.setExactFit() : scaleMode === Phaser.ScaleManager.SHOW_ALL ? !this.isFullScreen && this.boundingParent && this.compatibility.canExpandParent ? (this.setShowAll(!0), this.resetCanvas(), this.setShowAll()) : this.setShowAll() : scaleMode === Phaser.ScaleManager.NO_SCALE ? (this.width = this.game.width, this.height = this.game.height) : scaleMode === Phaser.ScaleManager.USER_SCALE && (this.width = this.game.width * this._userScaleFactor.x - this._userScaleTrim.x, this.height = this.game.height * this._userScaleFactor.y - this._userScaleTrim.y), !this.compatibility.canExpandParent && (scaleMode === Phaser.ScaleManager.SHOW_ALL || scaleMode === Phaser.ScaleManager.USER_SCALE)) {
                    var bounds = this.getParentBounds(this._tempBounds);
                    this.width = Math.min(this.width, bounds.width), this.height = Math.min(this.height, bounds.height)
                }
                this.width = 0 | this.width, this.height = 0 | this.height, this.reflowCanvas()
            },
            getParentBounds: function(target) {
                var bounds = target || new Phaser.Rectangle,
                    parentNode = this.boundingParent,
                    visualBounds = this.dom.visualBounds,
                    layoutBounds = this.dom.layoutBounds;
                if (parentNode) {
                    var clientRect = parentNode.getBoundingClientRect(),
                        parentRect = parentNode.offsetParent ? parentNode.offsetParent.getBoundingClientRect() : parentNode.getBoundingClientRect();
                    bounds.setTo(clientRect.left - parentRect.left, clientRect.top - parentRect.top, clientRect.width, clientRect.height);
                    var wc = this.windowConstraints;
                    if (wc.right) {
                        var windowBounds = "layout" === wc.right ? layoutBounds : visualBounds;
                        bounds.right = Math.min(bounds.right, windowBounds.width)
                    }
                    if (wc.bottom) {
                        var windowBounds = "layout" === wc.bottom ? layoutBounds : visualBounds;
                        bounds.bottom = Math.min(bounds.bottom, windowBounds.height)
                    }
                } else bounds.setTo(0, 0, visualBounds.width, visualBounds.height);
                return bounds.setTo(Math.round(bounds.x), Math.round(bounds.y), Math.round(bounds.width), Math.round(bounds.height)), bounds
            },
            alignCanvas: function(horizontal, vertical) {
                var parentBounds = this.getParentBounds(this._tempBounds),
                    canvas = this.game.canvas,
                    margin = this.margin;
                if (horizontal) {
                    margin.left = margin.right = 0;
                    var canvasBounds = canvas.getBoundingClientRect();
                    if (this.width < parentBounds.width && !this.incorrectOrientation) {
                        var currentEdge = canvasBounds.left - parentBounds.x,
                            targetEdge = parentBounds.width / 2 - this.width / 2;
                        targetEdge = Math.max(targetEdge, 0);
                        var offset = targetEdge - currentEdge;
                        margin.left = Math.round(offset)
                    }
                    canvas.style.marginLeft = margin.left + "px", 0 !== margin.left && (margin.right = -(parentBounds.width - canvasBounds.width - margin.left), canvas.style.marginRight = margin.right + "px")
                }
                if (vertical) {
                    margin.top = margin.bottom = 0;
                    var canvasBounds = canvas.getBoundingClientRect();
                    if (this.height < parentBounds.height && !this.incorrectOrientation) {
                        var currentEdge = canvasBounds.top - parentBounds.y,
                            targetEdge = parentBounds.height / 2 - this.height / 2;
                        targetEdge = Math.max(targetEdge, 0);
                        var offset = targetEdge - currentEdge;
                        margin.top = Math.round(offset)
                    }
                    canvas.style.marginTop = margin.top + "px", 0 !== margin.top && (margin.bottom = -(parentBounds.height - canvasBounds.height - margin.top), canvas.style.marginBottom = margin.bottom + "px")
                }
                margin.x = margin.left, margin.y = margin.top
            },
            reflowGame: function() {
                this.resetCanvas("", "");
                var bounds = this.getParentBounds(this._tempBounds);
                this.updateDimensions(bounds.width, bounds.height, !0)
            },
            reflowCanvas: function() {
                this.incorrectOrientation || (this.width = Phaser.Math.clamp(this.width, this.minWidth || 0, this.maxWidth || this.width), this.height = Phaser.Math.clamp(this.height, this.minHeight || 0, this.maxHeight || this.height)), this.resetCanvas(), this.compatibility.noMargins || (this.isFullScreen && this._createdFullScreenTarget ? this.alignCanvas(!0, !0) : this.alignCanvas(this.pageAlignHorizontally, this.pageAlignVertically)), this.updateScalingAndBounds()
            },
            resetCanvas: function(cssWidth, cssHeight) {
                void 0 === cssWidth && (cssWidth = this.width + "px"), void 0 === cssHeight && (cssHeight = this.height + "px");
                var canvas = this.game.canvas;
                this.compatibility.noMargins || (canvas.style.marginLeft = "", canvas.style.marginTop = "", canvas.style.marginRight = "", canvas.style.marginBottom = ""), canvas.style.width = cssWidth, canvas.style.height = cssHeight
            },
            queueUpdate: function(force) {
                force && (this._parentBounds.width = 0, this._parentBounds.height = 0), this._updateThrottle = this._updateThrottleReset
            },
            reset: function(clearWorld) {
                clearWorld && this.grid && this.grid.reset()
            },
            setMaximum: function() {
                this.width = this.dom.visualBounds.width, this.height = this.dom.visualBounds.height
            },
            setShowAll: function(expanding) {
                var multiplier, bounds = this.getParentBounds(this._tempBounds),
                    width = bounds.width,
                    height = bounds.height;
                multiplier = expanding ? Math.max(height / this.game.height, width / this.game.width) : Math.min(height / this.game.height, width / this.game.width), this.width = Math.round(this.game.width * multiplier), this.height = Math.round(this.game.height * multiplier)
            },
            setExactFit: function() {
                var bounds = this.getParentBounds(this._tempBounds);
                this.width = bounds.width, this.height = bounds.height, this.isFullScreen || (this.maxWidth && (this.width = Math.min(this.width, this.maxWidth)), this.maxHeight && (this.height = Math.min(this.height, this.maxHeight)))
            },
            createFullScreenTarget: function() {
                var fsTarget = document.createElement("div");
                return fsTarget.style.margin = "0", fsTarget.style.padding = "0", fsTarget.style.background = "#000", fsTarget
            },
            startFullScreen: function(antialias, allowTrampoline) {
                if (this.isFullScreen) return !1;
                if (!this.compatibility.supportsFullScreen) {
                    var _this = this;
                    return void setTimeout(function() {
                        _this.fullScreenError()
                    }, 10)
                }
                if ("when-not-mouse" === this.compatibility.clickTrampoline) {
                    var input = this.game.input;
                    if (input.activePointer && input.activePointer !== input.mousePointer && (allowTrampoline || allowTrampoline !== !1)) return void input.activePointer.addClickTrampoline("startFullScreen", this.startFullScreen, this, [antialias, !1])
                }
                "undefined" != typeof antialias && this.game.renderType === Phaser.CANVAS && (this.game.stage.smoothed = antialias);
                var fsTarget = this.fullScreenTarget;
                fsTarget || (this.cleanupCreatedTarget(), this._createdFullScreenTarget = this.createFullScreenTarget(), fsTarget = this._createdFullScreenTarget);
                var initData = {
                    targetElement: fsTarget
                };
                if (this.onFullScreenInit.dispatch(this, initData), this._createdFullScreenTarget) {
                    var canvas = this.game.canvas,
                        parent = canvas.parentNode;
                    parent.insertBefore(fsTarget, canvas), fsTarget.appendChild(canvas)
                }
                return this.game.device.fullscreenKeyboard ? fsTarget[this.game.device.requestFullscreen](Element.ALLOW_KEYBOARD_INPUT) : fsTarget[this.game.device.requestFullscreen](), !0
            },
            stopFullScreen: function() {
                return this.isFullScreen && this.compatibility.supportsFullScreen ? (document[this.game.device.cancelFullscreen](), !0) : !1
            },
            cleanupCreatedTarget: function() {
                var fsTarget = this._createdFullScreenTarget;
                if (fsTarget && fsTarget.parentNode) {
                    var parent = fsTarget.parentNode;
                    parent.insertBefore(this.game.canvas, fsTarget), parent.removeChild(fsTarget)
                }
                this._createdFullScreenTarget = null
            },
            prepScreenMode: function(enteringFullscreen) {
                var createdTarget = !!this._createdFullScreenTarget,
                    fsTarget = this._createdFullScreenTarget || this.fullScreenTarget;
                enteringFullscreen ? (createdTarget || this.fullScreenScaleMode === Phaser.ScaleManager.EXACT_FIT) && fsTarget !== this.game.canvas && (this._fullScreenRestore = {
                    targetWidth: fsTarget.style.width,
                    targetHeight: fsTarget.style.height
                }, fsTarget.style.width = "100%", fsTarget.style.height = "100%") : (this._fullScreenRestore && (fsTarget.style.width = this._fullScreenRestore.targetWidth, fsTarget.style.height = this._fullScreenRestore.targetHeight, this._fullScreenRestore = null), this.updateDimensions(this._gameSize.width, this._gameSize.height, !0), this.resetCanvas())
            },
            fullScreenChange: function(event) {
                this.event = event, this.isFullScreen ? (this.prepScreenMode(!0), this.updateLayout(), this.queueUpdate(!0)) : (this.prepScreenMode(!1), this.cleanupCreatedTarget(), this.updateLayout(), this.queueUpdate(!0)), this.onFullScreenChange.dispatch(this, this.width, this.height)
            },
            fullScreenError: function(event) {
                this.event = event, this.cleanupCreatedTarget(), console.warn("Phaser.ScaleManager: requestFullscreen failed or device does not support the Fullscreen API"), this.onFullScreenError.dispatch(this)
            },
            scaleSprite: function(sprite, width, height, letterBox) {
                if (void 0 === width && (width = this.width), void 0 === height && (height = this.height), void 0 === letterBox && (letterBox = !1), !sprite || !sprite.scale) return sprite;
                if (sprite.scale.x = 1, sprite.scale.y = 1, sprite.width <= 0 || sprite.height <= 0 || 0 >= width || 0 >= height) return sprite;
                var scaleX1 = width,
                    scaleY1 = sprite.height * width / sprite.width,
                    scaleX2 = sprite.width * height / sprite.height,
                    scaleY2 = height,
                    scaleOnWidth = scaleX2 > width;
                return scaleOnWidth = scaleOnWidth ? letterBox : !letterBox, scaleOnWidth ? (sprite.width = Math.floor(scaleX1), sprite.height = Math.floor(scaleY1)) : (sprite.width = Math.floor(scaleX2), sprite.height = Math.floor(scaleY2)), sprite
            },
            destroy: function() {
                this.game.onResume.remove(this._gameResumed, this), window.removeEventListener("orientationchange", this._orientationChange, !1), window.removeEventListener("resize", this._windowResize, !1), this.compatibility.supportsFullScreen && (document.removeEventListener("webkitfullscreenchange", this._fullScreenChange, !1), document.removeEventListener("mozfullscreenchange", this._fullScreenChange, !1), document.removeEventListener("MSFullscreenChange", this._fullScreenChange, !1), document.removeEventListener("fullscreenchange", this._fullScreenChange, !1), document.removeEventListener("webkitfullscreenerror", this._fullScreenError, !1), document.removeEventListener("mozfullscreenerror", this._fullScreenError, !1), document.removeEventListener("MSFullscreenError", this._fullScreenError, !1), document.removeEventListener("fullscreenerror", this._fullScreenError, !1))
            }
        }, Phaser.ScaleManager.prototype.constructor = Phaser.ScaleManager, Object.defineProperty(Phaser.ScaleManager.prototype, "boundingParent", {
            get: function() {
                if (this.parentIsWindow || this.isFullScreen && !this._createdFullScreenTarget) return null;
                var parentNode = this.game.canvas && this.game.canvas.parentNode;
                return parentNode || null
            }
        }), Object.defineProperty(Phaser.ScaleManager.prototype, "scaleMode", {
            get: function() {
                return this._scaleMode
            },
            set: function(value) {
                return value !== this._scaleMode && (this.isFullScreen || (this.updateDimensions(this._gameSize.width, this._gameSize.height, !0), this.queueUpdate(!0)), this._scaleMode = value), this._scaleMode
            }
        }), Object.defineProperty(Phaser.ScaleManager.prototype, "fullScreenScaleMode", {
            get: function() {
                return this._fullScreenScaleMode
            },
            set: function(value) {
                return value !== this._fullScreenScaleMode && (this.isFullScreen ? (this.prepScreenMode(!1), this._fullScreenScaleMode = value, this.prepScreenMode(!0), this.queueUpdate(!0)) : this._fullScreenScaleMode = value), this._fullScreenScaleMode
            }
        }), Object.defineProperty(Phaser.ScaleManager.prototype, "currentScaleMode", {
            get: function() {
                return this.isFullScreen ? this._fullScreenScaleMode : this._scaleMode
            }
        }), Object.defineProperty(Phaser.ScaleManager.prototype, "pageAlignHorizontally", {
            get: function() {
                return this._pageAlignHorizontally
            },
            set: function(value) {
                value !== this._pageAlignHorizontally && (this._pageAlignHorizontally = value, this.queueUpdate(!0))
            }
        }), Object.defineProperty(Phaser.ScaleManager.prototype, "pageAlignVertically", {
            get: function() {
                return this._pageAlignVertically
            },
            set: function(value) {
                value !== this._pageAlignVertically && (this._pageAlignVertically = value, this.queueUpdate(!0))
            }
        }), Object.defineProperty(Phaser.ScaleManager.prototype, "isFullScreen", {
            get: function() {
                return !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement)
            }
        }), Object.defineProperty(Phaser.ScaleManager.prototype, "isPortrait", {
            get: function() {
                return "portrait" === this.classifyOrientation(this.screenOrientation)
            }
        }), Object.defineProperty(Phaser.ScaleManager.prototype, "isLandscape", {
            get: function() {
                return "landscape" === this.classifyOrientation(this.screenOrientation)
            }
        }), Object.defineProperty(Phaser.ScaleManager.prototype, "isGamePortrait", {
            get: function() {
                return this.height > this.width
            }
        }), Object.defineProperty(Phaser.ScaleManager.prototype, "isGameLandscape", {
            get: function() {
                return this.width > this.height
            }
        }), Phaser.Utils.Debug = function(game) {
            this.game = game, this.sprite = null, this.bmd = null, this.canvas = null, this.context = null, this.font = "14px Courier", this.columnWidth = 100, this.lineHeight = 16, this.renderShadow = !0, this.currentX = 0, this.currentY = 0, this.currentAlpha = 1, this.dirty = !1
        }, Phaser.Utils.Debug.prototype = {
            boot: function() {
                this.game.renderType === Phaser.CANVAS ? this.context = this.game.context : (this.bmd = this.game.make.bitmapData(this.game.width, this.game.height), this.sprite = this.game.make.image(0, 0, this.bmd), this.game.stage.addChild(this.sprite), this.canvas = PIXI.CanvasPool.create(this, this.game.width, this.game.height), this.context = this.canvas.getContext("2d"))
            },
            preUpdate: function() {
                this.dirty && this.sprite && (this.bmd.clear(), this.bmd.draw(this.canvas, 0, 0), this.context.clearRect(0, 0, this.game.width, this.game.height), this.dirty = !1)
            },
            reset: function() {
                this.context && this.context.clearRect(0, 0, this.game.width, this.game.height), this.sprite && this.bmd.clear()
            },
            start: function(x, y, color, columnWidth) {
                "number" != typeof x && (x = 0), "number" != typeof y && (y = 0), color = color || "rgb(255,255,255)", void 0 === columnWidth && (columnWidth = 0), this.currentX = x, this.currentY = y, this.currentColor = color, this.columnWidth = columnWidth, this.dirty = !0, this.context.save(), this.context.setTransform(1, 0, 0, 1, 0, 0), this.context.strokeStyle = color, this.context.fillStyle = color, this.context.font = this.font, this.context.globalAlpha = this.currentAlpha
            },
            stop: function() {
                this.context.restore()
            },
            line: function() {
                for (var x = this.currentX, i = 0; i < arguments.length; i++) this.renderShadow && (this.context.fillStyle = "rgb(0,0,0)", this.context.fillText(arguments[i], x + 1, this.currentY + 1), this.context.fillStyle = this.currentColor), this.context.fillText(arguments[i], x, this.currentY), x += this.columnWidth;
                this.currentY += this.lineHeight
            },
            soundInfo: function(sound, x, y, color) {
                this.start(x, y, color), this.line("Sound: " + sound.key + " Locked: " + sound.game.sound.touchLocked), this.line("Is Ready?: " + this.game.cache.isSoundReady(sound.key) + " Pending Playback: " + sound.pendingPlayback), this.line("Decoded: " + sound.isDecoded + " Decoding: " + sound.isDecoding), this.line("Total Duration: " + sound.totalDuration + " Playing: " + sound.isPlaying), this.line("Time: " + sound.currentTime), this.line("Volume: " + sound.volume + " Muted: " + sound.mute), this.line("WebAudio: " + sound.usingWebAudio + " Audio: " + sound.usingAudioTag), "" !== sound.currentMarker && (this.line("Marker: " + sound.currentMarker + " Duration: " + sound.duration + " (ms: " + sound.durationMS + ")"), this.line("Start: " + sound.markers[sound.currentMarker].start + " Stop: " + sound.markers[sound.currentMarker].stop), this.line("Position: " + sound.position)), this.stop()
            },
            cameraInfo: function(camera, x, y, color) {
                this.start(x, y, color), this.line("Camera (" + camera.width + " x " + camera.height + ")"), this.line("X: " + camera.x + " Y: " + camera.y), camera.bounds && this.line("Bounds x: " + camera.bounds.x + " Y: " + camera.bounds.y + " w: " + camera.bounds.width + " h: " + camera.bounds.height), this.line("View x: " + camera.view.x + " Y: " + camera.view.y + " w: " + camera.view.width + " h: " + camera.view.height), this.line("Total in view: " + camera.totalInView), this.stop()
            },
            timer: function(timer, x, y, color) {
                this.start(x, y, color), this.line("Timer (running: " + timer.running + " expired: " + timer.expired + ")"), this.line("Next Tick: " + timer.next + " Duration: " + timer.duration), this.line("Paused: " + timer.paused + " Length: " + timer.length), this.stop()
            },
            pointer: function(pointer, hideIfUp, downColor, upColor, color) {
                null != pointer && (void 0 === hideIfUp && (hideIfUp = !1), downColor = downColor || "rgba(0,255,0,0.5)", upColor = upColor || "rgba(255,0,0,0.5)", (hideIfUp !== !0 || pointer.isUp !== !0) && (this.start(pointer.x, pointer.y - 100, color), this.context.beginPath(), this.context.arc(pointer.x, pointer.y, pointer.circle.radius, 0, 2 * Math.PI), pointer.active ? this.context.fillStyle = downColor : this.context.fillStyle = upColor, this.context.fill(), this.context.closePath(), this.context.beginPath(), this.context.moveTo(pointer.positionDown.x, pointer.positionDown.y), this.context.lineTo(pointer.position.x, pointer.position.y), this.context.lineWidth = 2, this.context.stroke(), this.context.closePath(), this.line("ID: " + pointer.id + " Active: " + pointer.active), this.line("World X: " + pointer.worldX + " World Y: " + pointer.worldY), this.line("Screen X: " + pointer.x + " Screen Y: " + pointer.y + " In: " + pointer.withinGame), this.line("Duration: " + pointer.duration + " ms"), this.line("is Down: " + pointer.isDown + " is Up: " + pointer.isUp), this.stop()))
            },
            spriteInputInfo: function(sprite, x, y, color) {
                this.start(x, y, color), this.line("Sprite Input: (" + sprite.width + " x " + sprite.height + ")"), this.line("x: " + sprite.input.pointerX().toFixed(1) + " y: " + sprite.input.pointerY().toFixed(1)), this.line("over: " + sprite.input.pointerOver() + " duration: " + sprite.input.overDuration().toFixed(0)), this.line("down: " + sprite.input.pointerDown() + " duration: " + sprite.input.downDuration().toFixed(0)), this.line("just over: " + sprite.input.justOver() + " just out: " + sprite.input.justOut()), this.stop()
            },
            key: function(key, x, y, color) {
                this.start(x, y, color, 150), this.line("Key:", key.keyCode, "isDown:", key.isDown), this.line("justDown:", key.justDown, "justUp:", key.justUp), this.line("Time Down:", key.timeDown.toFixed(0), "duration:", key.duration.toFixed(0)), this.stop()
            },
            inputInfo: function(x, y, color) {
                this.start(x, y, color), this.line("Input"), this.line("X: " + this.game.input.x + " Y: " + this.game.input.y), this.line("World X: " + this.game.input.worldX + " World Y: " + this.game.input.worldY), this.line("Scale X: " + this.game.input.scale.x.toFixed(1) + " Scale Y: " + this.game.input.scale.x.toFixed(1)), this.line("Screen X: " + this.game.input.activePointer.screenX + " Screen Y: " + this.game.input.activePointer.screenY), this.stop()
            },
            spriteBounds: function(sprite, color, filled) {
                var bounds = sprite.getBounds();
                bounds.x += this.game.camera.x, bounds.y += this.game.camera.y, this.rectangle(bounds, color, filled)
            },
            ropeSegments: function(rope, color, filled) {
                var segments = rope.segments,
                    self = this;
                segments.forEach(function(segment) {
                    self.rectangle(segment, color, filled)
                }, this)
            },
            spriteInfo: function(sprite, x, y, color) {
                this.start(x, y, color), this.line("Sprite:  (" + sprite.width + " x " + sprite.height + ") anchor: " + sprite.anchor.x + " x " + sprite.anchor.y), this.line("x: " + sprite.x.toFixed(1) + " y: " + sprite.y.toFixed(1)), this.line("angle: " + sprite.angle.toFixed(1) + " rotation: " + sprite.rotation.toFixed(1)), this.line("visible: " + sprite.visible + " in camera: " + sprite.inCamera), this.line("bounds x: " + sprite._bounds.x.toFixed(1) + " y: " + sprite._bounds.y.toFixed(1) + " w: " + sprite._bounds.width.toFixed(1) + " h: " + sprite._bounds.height.toFixed(1)), this.stop()
            },
            spriteCoords: function(sprite, x, y, color) {
                this.start(x, y, color, 100), sprite.name && this.line(sprite.name), this.line("x:", sprite.x.toFixed(2), "y:", sprite.y.toFixed(2)), this.line("pos x:", sprite.position.x.toFixed(2), "pos y:", sprite.position.y.toFixed(2)), this.line("world x:", sprite.world.x.toFixed(2), "world y:", sprite.world.y.toFixed(2)), this.stop()
            },
            lineInfo: function(line, x, y, color) {
                this.start(x, y, color, 80), this.line("start.x:", line.start.x.toFixed(2), "start.y:", line.start.y.toFixed(2)), this.line("end.x:", line.end.x.toFixed(2), "end.y:", line.end.y.toFixed(2)), this.line("length:", line.length.toFixed(2), "angle:", line.angle), this.stop()
            },
            pixel: function(x, y, color, size) {
                size = size || 2, this.start(), this.context.fillStyle = color, this.context.fillRect(x, y, size, size), this.stop()
            },
            geom: function(object, color, filled, forceType) {
                void 0 === filled && (filled = !0), void 0 === forceType && (forceType = 0), color = color || "rgba(0,255,0,0.4)", this.start(), this.context.fillStyle = color, this.context.strokeStyle = color, object instanceof Phaser.Rectangle || 1 === forceType ? filled ? this.context.fillRect(object.x - this.game.camera.x, object.y - this.game.camera.y, object.width, object.height) : this.context.strokeRect(object.x - this.game.camera.x, object.y - this.game.camera.y, object.width, object.height) : object instanceof Phaser.Circle || 2 === forceType ? (this.context.beginPath(), this.context.arc(object.x - this.game.camera.x, object.y - this.game.camera.y, object.radius, 0, 2 * Math.PI, !1), this.context.closePath(), filled ? this.context.fill() : this.context.stroke()) : object instanceof Phaser.Point || 3 === forceType ? this.context.fillRect(object.x - this.game.camera.x, object.y - this.game.camera.y, 4, 4) : (object instanceof Phaser.Line || 4 === forceType) && (this.context.lineWidth = 1, this.context.beginPath(), this.context.moveTo(object.start.x + .5 - this.game.camera.x, object.start.y + .5 - this.game.camera.y), this.context.lineTo(object.end.x + .5 - this.game.camera.x, object.end.y + .5 - this.game.camera.y), this.context.closePath(), this.context.stroke()), this.stop()
            },
            rectangle: function(object, color, filled) {
                void 0 === filled && (filled = !0), color = color || "rgba(0, 255, 0, 0.4)", this.start(), filled ? (this.context.fillStyle = color, this.context.fillRect(object.x - this.game.camera.x, object.y - this.game.camera.y, object.width, object.height)) : (this.context.strokeStyle = color, this.context.strokeRect(object.x - this.game.camera.x, object.y - this.game.camera.y, object.width, object.height)), this.stop()
            },
            text: function(text, x, y, color, font) {
                color = color || "rgb(255,255,255)", font = font || "16px Courier", this.start(), this.context.font = font, this.renderShadow && (this.context.fillStyle = "rgb(0,0,0)", this.context.fillText(text, x + 1, y + 1)), this.context.fillStyle = color, this.context.fillText(text, x, y), this.stop()
            },
            quadTree: function(quadtree, color) {
                color = color || "rgba(255,0,0,0.3)", this.start();
                var bounds = quadtree.bounds;
                if (0 === quadtree.nodes.length) {
                    this.context.strokeStyle = color, this.context.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height), this.text("size: " + quadtree.objects.length, bounds.x + 4, bounds.y + 16, "rgb(0,200,0)", "12px Courier"), this.context.strokeStyle = "rgb(0,255,0)";
                    for (var i = 0; i < quadtree.objects.length; i++) this.context.strokeRect(quadtree.objects[i].x, quadtree.objects[i].y, quadtree.objects[i].width, quadtree.objects[i].height)
                } else
                    for (var i = 0; i < quadtree.nodes.length; i++) this.quadTree(quadtree.nodes[i]);
                this.stop()
            },
            body: function(sprite, color, filled) {
                sprite.body && (this.start(), sprite.body.type === Phaser.Physics.ARCADE ? Phaser.Physics.Arcade.Body.render(this.context, sprite.body, color, filled) : sprite.body.type === Phaser.Physics.NINJA ? Phaser.Physics.Ninja.Body.render(this.context, sprite.body, color, filled) : sprite.body.type === Phaser.Physics.BOX2D && Phaser.Physics.Box2D.renderBody(this.context, sprite.body, color), this.stop())
            },
            bodyInfo: function(sprite, x, y, color) {
                sprite.body && (this.start(x, y, color, 210), sprite.body.type === Phaser.Physics.ARCADE ? Phaser.Physics.Arcade.Body.renderBodyInfo(this, sprite.body) : sprite.body.type === Phaser.Physics.BOX2D && this.game.physics.box2d.renderBodyInfo(this, sprite.body), this.stop())
            },
            box2dWorld: function() {
                this.start(), this.context.translate(-this.game.camera.view.x, -this.game.camera.view.y, 0), this.game.physics.box2d.renderDebugDraw(this.context), this.stop()
            },
            box2dBody: function(body, color) {
                this.start(), Phaser.Physics.Box2D.renderBody(this.context, body, color), this.stop()
            },
            destroy: function() {
                PIXI.CanvasPool.remove(this)
            }
        }, Phaser.Utils.Debug.prototype.constructor = Phaser.Utils.Debug, Phaser.DOM = {
            getOffset: function(element, point) {
                point = point || new Phaser.Point;
                var box = element.getBoundingClientRect(),
                    scrollTop = Phaser.DOM.scrollY,
                    scrollLeft = Phaser.DOM.scrollX,
                    clientTop = document.documentElement.clientTop,
                    clientLeft = document.documentElement.clientLeft;
                return point.x = box.left + scrollLeft - clientLeft, point.y = box.top + scrollTop - clientTop, point
            },
            getBounds: function(element, cushion) {
                return void 0 === cushion && (cushion = 0), element = element && !element.nodeType ? element[0] : element, element && 1 === element.nodeType ? this.calibrate(element.getBoundingClientRect(), cushion) : !1
            },
            calibrate: function(coords, cushion) {
                cushion = +cushion || 0;
                var output = {
                    width: 0,
                    height: 0,
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0
                };
                return output.width = (output.right = coords.right + cushion) - (output.left = coords.left - cushion), output.height = (output.bottom = coords.bottom + cushion) - (output.top = coords.top - cushion), output
            },
            getAspectRatio: function(object) {
                object = null == object ? this.visualBounds : 1 === object.nodeType ? this.getBounds(object) : object;
                var w = object.width,
                    h = object.height;
                return "function" == typeof w && (w = w.call(object)), "function" == typeof h && (h = h.call(object)), w / h
            },
            inLayoutViewport: function(element, cushion) {
                var r = this.getBounds(element, cushion);
                return !!r && r.bottom >= 0 && r.right >= 0 && r.top <= this.layoutBounds.width && r.left <= this.layoutBounds.height
            },
            getScreenOrientation: function(primaryFallback) {
                var screen = window.screen,
                    orientation = screen.orientation || screen.mozOrientation || screen.msOrientation;
                if (orientation && "string" == typeof orientation.type) return orientation.type;
                if ("string" == typeof orientation) return orientation;
                var PORTRAIT = "portrait-primary",
                    LANDSCAPE = "landscape-primary";
                if ("screen" === primaryFallback) return screen.height > screen.width ? PORTRAIT : LANDSCAPE;
                if ("viewport" === primaryFallback) return this.visualBounds.height > this.visualBounds.width ? PORTRAIT : LANDSCAPE;
                if ("window.orientation" === primaryFallback && "number" == typeof window.orientation) return 0 === window.orientation || 180 === window.orientation ? PORTRAIT : LANDSCAPE;
                if (window.matchMedia) {
                    if (window.matchMedia("(orientation: portrait)").matches) return PORTRAIT;
                    if (window.matchMedia("(orientation: landscape)").matches) return LANDSCAPE
                }
                return this.visualBounds.height > this.visualBounds.width ? PORTRAIT : LANDSCAPE
            },
            visualBounds: new Phaser.Rectangle,
            layoutBounds: new Phaser.Rectangle,
            documentBounds: new Phaser.Rectangle
        }, Phaser.Device.whenReady(function(device) {
            var scrollX = window && "pageXOffset" in window ? function() {
                    return window.pageXOffset
                } : function() {
                    return document.documentElement.scrollLeft
                },
                scrollY = window && "pageYOffset" in window ? function() {
                    return window.pageYOffset
                } : function() {
                    return document.documentElement.scrollTop
                };
            Object.defineProperty(Phaser.DOM, "scrollX", {
                get: scrollX
            }), Object.defineProperty(Phaser.DOM, "scrollY", {
                get: scrollY
            }), Object.defineProperty(Phaser.DOM.visualBounds, "x", {
                get: scrollX
            }), Object.defineProperty(Phaser.DOM.visualBounds, "y", {
                get: scrollY
            }), Object.defineProperty(Phaser.DOM.layoutBounds, "x", {
                value: 0
            }), Object.defineProperty(Phaser.DOM.layoutBounds, "y", {
                value: 0
            });
            var treatAsDesktop = device.desktop && document.documentElement.clientWidth <= window.innerWidth && document.documentElement.clientHeight <= window.innerHeight;
            if (treatAsDesktop) {
                var clientWidth = function() {
                        return Math.max(window.innerWidth, document.documentElement.clientWidth)
                    },
                    clientHeight = function() {
                        return Math.max(window.innerHeight, document.documentElement.clientHeight)
                    };
                Object.defineProperty(Phaser.DOM.visualBounds, "width", {
                    get: clientWidth
                }), Object.defineProperty(Phaser.DOM.visualBounds, "height", {
                    get: clientHeight
                }), Object.defineProperty(Phaser.DOM.layoutBounds, "width", {
                    get: clientWidth
                }), Object.defineProperty(Phaser.DOM.layoutBounds, "height", {
                    get: clientHeight
                })
            } else Object.defineProperty(Phaser.DOM.visualBounds, "width", {
                get: function() {
                    return window.innerWidth
                }
            }), Object.defineProperty(Phaser.DOM.visualBounds, "height", {
                get: function() {
                    return window.innerHeight
                }
            }), Object.defineProperty(Phaser.DOM.layoutBounds, "width", {
                get: function() {
                    var a = document.documentElement.clientWidth,
                        b = window.innerWidth;
                    return b > a ? b : a
                }
            }), Object.defineProperty(Phaser.DOM.layoutBounds, "height", {
                get: function() {
                    var a = document.documentElement.clientHeight,
                        b = window.innerHeight;
                    return b > a ? b : a
                }
            });
            Object.defineProperty(Phaser.DOM.documentBounds, "x", {
                value: 0
            }), Object.defineProperty(Phaser.DOM.documentBounds, "y", {
                value: 0
            }), Object.defineProperty(Phaser.DOM.documentBounds, "width", {
                get: function() {
                    var d = document.documentElement;
                    return Math.max(d.clientWidth, d.offsetWidth, d.scrollWidth)
                }
            }), Object.defineProperty(Phaser.DOM.documentBounds, "height", {
                get: function() {
                    var d = document.documentElement;
                    return Math.max(d.clientHeight, d.offsetHeight, d.scrollHeight)
                }
            })
        }, null, !0), Phaser.ArraySet = function(list) {
            this.position = 0, this.list = list || []
        }, Phaser.ArraySet.prototype = {
            add: function(item) {
                return this.exists(item) || this.list.push(item), item
            },
            getIndex: function(item) {
                return this.list.indexOf(item)
            },
            getByKey: function(property, value) {
                for (var i = this.list.length; i--;)
                    if (this.list[i][property] === value) return this.list[i];
                return null
            },
            exists: function(item) {
                return this.list.indexOf(item) > -1
            },
            reset: function() {
                this.list.length = 0
            },
            remove: function(item) {
                var idx = this.list.indexOf(item);
                return idx > -1 ? (this.list.splice(idx, 1), item) : void 0
            },
            setAll: function(key, value) {
                for (var i = this.list.length; i--;) this.list[i] && (this.list[i][key] = value)
            },
            callAll: function(key) {
                for (var args = Array.prototype.slice.call(arguments, 1), i = this.list.length; i--;) this.list[i] && this.list[i][key] && this.list[i][key].apply(this.list[i], args)
            },
            removeAll: function(destroy) {
                void 0 === destroy && (destroy = !1);
                for (var i = this.list.length; i--;)
                    if (this.list[i]) {
                        var item = this.remove(this.list[i]);
                        destroy && item.destroy()
                    }
                this.position = 0, this.list = []
            }
        }, Object.defineProperty(Phaser.ArraySet.prototype, "total", {
            get: function() {
                return this.list.length
            }
        }), Object.defineProperty(Phaser.ArraySet.prototype, "first", {
            get: function() {
                return this.position = 0, this.list.length > 0 ? this.list[0] : null
            }
        }), Object.defineProperty(Phaser.ArraySet.prototype, "next", {
            get: function() {
                return this.position < this.list.length ? (this.position++, this.list[this.position]) : null
            }
        }), Phaser.ArraySet.prototype.constructor = Phaser.ArraySet, Phaser.ArrayUtils = {
            getRandomItem: function(objects, startIndex, length) {
                if (null === objects) return null;
                void 0 === startIndex && (startIndex = 0), void 0 === length && (length = objects.length);
                var randomIndex = startIndex + Math.floor(Math.random() * length);
                return void 0 === objects[randomIndex] ? null : objects[randomIndex]
            },
            removeRandomItem: function(objects, startIndex, length) {
                if (null == objects) return null;
                void 0 === startIndex && (startIndex = 0), void 0 === length && (length = objects.length);
                var randomIndex = startIndex + Math.floor(Math.random() * length);
                if (randomIndex < objects.length) {
                    var removed = objects.splice(randomIndex, 1);
                    return void 0 === removed[0] ? null : removed[0]
                }
                return null
            },
            shuffle: function(array) {
                for (var i = array.length - 1; i > 0; i--) {
                    var j = Math.floor(Math.random() * (i + 1)),
                        temp = array[i];
                    array[i] = array[j], array[j] = temp
                }
                return array
            },
            transposeMatrix: function(array) {
                for (var sourceRowCount = array.length, sourceColCount = array[0].length, result = new Array(sourceColCount), i = 0; sourceColCount > i; i++) {
                    result[i] = new Array(sourceRowCount);
                    for (var j = sourceRowCount - 1; j > -1; j--) result[i][j] = array[j][i]
                }
                return result
            },
            rotateMatrix: function(matrix, direction) {
                if ("string" != typeof direction && (direction = (direction % 360 + 360) % 360), 90 === direction || -270 === direction || "rotateLeft" === direction) matrix = Phaser.ArrayUtils.transposeMatrix(matrix), matrix = matrix.reverse();
                else if (-90 === direction || 270 === direction || "rotateRight" === direction) matrix = matrix.reverse(), matrix = Phaser.ArrayUtils.transposeMatrix(matrix);
                else if (180 === Math.abs(direction) || "rotate180" === direction) {
                    for (var i = 0; i < matrix.length; i++) matrix[i].reverse();
                    matrix = matrix.reverse()
                }
                return matrix
            },
            findClosest: function(value, arr) {
                if (!arr.length) return NaN;
                if (1 === arr.length || value < arr[0]) return arr[0];
                for (var i = 1; arr[i] < value;) i++;
                var low = arr[i - 1],
                    high = i < arr.length ? arr[i] : Number.POSITIVE_INFINITY;
                return value - low >= high - value ? high : low
            },
            rotate: function(array) {
                var s = array.shift();
                return array.push(s), s
            },
            numberArray: function(start, end) {
                for (var result = [], i = start; end >= i; i++) result.push(i);
                return result
            },
            numberArrayStep: function(start, end, step) {
                (void 0 === start || null === start) && (start = 0), (void 0 === end || null === end) && (end = start, start = 0), void 0 === step && (step = 1);
                for (var result = [], total = Math.max(Phaser.Math.roundAwayFromZero((end - start) / (step || 1)), 0), i = 0; total > i; i++) result.push(start), start += step;
                return result
            }
        }, Phaser.LinkedList = function() {
            this.next = null, this.prev = null, this.first = null, this.last = null, this.total = 0
        }, Phaser.LinkedList.prototype = {
            add: function(item) {
                return 0 === this.total && null === this.first && null === this.last ? (this.first = item, this.last = item, this.next = item, item.prev = this, this.total++, item) : (this.last.next = item, item.prev = this.last, this.last = item, this.total++, item)
            },
            reset: function() {
                this.first = null, this.last = null, this.next = null, this.prev = null, this.total = 0
            },
            remove: function(item) {
                return 1 === this.total ? (this.reset(), void(item.next = item.prev = null)) : (item === this.first ? this.first = this.first.next : item === this.last && (this.last = this.last.prev), item.prev && (item.prev.next = item.next), item.next && (item.next.prev = item.prev), item.next = item.prev = null, null === this.first && (this.last = null), void this.total--)
            },
            callAll: function(callback) {
                if (this.first && this.last) {
                    var entity = this.first;
                    do entity && entity[callback] && entity[callback].call(entity), entity = entity.next; while (entity != this.last.next)
                }
            }
        }, Phaser.LinkedList.prototype.constructor = Phaser.LinkedList, Phaser.Create = function(game) {
            this.game = game, this.bmd = null, this.canvas = null, this.ctx = null, this.palettes = [{
                0: "#000",
                1: "#9D9D9D",
                2: "#FFF",
                3: "#BE2633",
                4: "#E06F8B",
                5: "#493C2B",
                6: "#A46422",
                7: "#EB8931",
                8: "#F7E26B",
                9: "#2F484E",
                A: "#44891A",
                B: "#A3CE27",
                C: "#1B2632",
                D: "#005784",
                E: "#31A2F2",
                F: "#B2DCEF"
            }, {
                0: "#000",
                1: "#191028",
                2: "#46af45",
                3: "#a1d685",
                4: "#453e78",
                5: "#7664fe",
                6: "#833129",
                7: "#9ec2e8",
                8: "#dc534b",
                9: "#e18d79",
                A: "#d6b97b",
                B: "#e9d8a1",
                C: "#216c4b",
                D: "#d365c8",
                E: "#afaab9",
                F: "#f5f4eb"
            }, {
                0: "#000",
                1: "#2234d1",
                2: "#0c7e45",
                3: "#44aacc",
                4: "#8a3622",
                5: "#5c2e78",
                6: "#aa5c3d",
                7: "#b5b5b5",
                8: "#5e606e",
                9: "#4c81fb",
                A: "#6cd947",
                B: "#7be2f9",
                C: "#eb8a60",
                D: "#e23d69",
                E: "#ffd93f",
                F: "#fff"
            }, {
                0: "#000",
                1: "#fff",
                2: "#8b4131",
                3: "#7bbdc5",
                4: "#8b41ac",
                5: "#6aac41",
                6: "#3931a4",
                7: "#d5de73",
                8: "#945a20",
                9: "#5a4100",
                A: "#bd736a",
                B: "#525252",
                C: "#838383",
                D: "#acee8b",
                E: "#7b73de",
                F: "#acacac"
            }, {
                0: "#000",
                1: "#191028",
                2: "#46af45",
                3: "#a1d685",
                4: "#453e78",
                5: "#7664fe",
                6: "#833129",
                7: "#9ec2e8",
                8: "#dc534b",
                9: "#e18d79",
                A: "#d6b97b",
                B: "#e9d8a1",
                C: "#216c4b",
                D: "#d365c8",
                E: "#afaab9",
                F: "#fff"
            }]
        }, Phaser.Create.PALETTE_ARNE = 0, Phaser.Create.PALETTE_JMP = 1, Phaser.Create.PALETTE_CGA = 2, Phaser.Create.PALETTE_C64 = 3, Phaser.Create.PALETTE_JAPANESE_MACHINE = 4, Phaser.Create.prototype = {
            texture: function(key, data, pixelWidth, pixelHeight, palette) {
                void 0 === pixelWidth && (pixelWidth = 8), void 0 === pixelHeight && (pixelHeight = pixelWidth), void 0 === palette && (palette = 0);
                var w = data[0].length * pixelWidth,
                    h = data.length * pixelHeight;
                null === this.bmd && (this.bmd = this.game.make.bitmapData(), this.canvas = this.bmd.canvas, this.ctx = this.bmd.context), this.bmd.resize(w, h), this.bmd.clear();
                for (var y = 0; y < data.length; y++)
                    for (var row = data[y], x = 0; x < row.length; x++) {
                        var d = row[x];
                        "." !== d && " " !== d && (this.ctx.fillStyle = this.palettes[palette][d], this.ctx.fillRect(x * pixelWidth, y * pixelHeight, pixelWidth, pixelHeight))
                    }
                return this.bmd.generateTexture(key)
            },
            grid: function(key, width, height, cellWidth, cellHeight, color) {
                null === this.bmd && (this.bmd = this.game.make.bitmapData(), this.canvas = this.bmd.canvas, this.ctx = this.bmd.context), this.bmd.resize(width, height), this.ctx.fillStyle = color;
                for (var y = 0; height > y; y += cellHeight) this.ctx.fillRect(0, y, width, 1);
                for (var x = 0; width > x; x += cellWidth) this.ctx.fillRect(x, 0, 1, height);
                return this.bmd.generateTexture(key)
            }
        }, Phaser.Create.prototype.constructor = Phaser.Create, Phaser.FlexGrid = function(manager, width, height) {
            this.game = manager.game, this.manager = manager, this.width = width, this.height = height, this.boundsCustom = new Phaser.Rectangle(0, 0, width, height), this.boundsFluid = new Phaser.Rectangle(0, 0, width, height), this.boundsFull = new Phaser.Rectangle(0, 0, width, height), this.boundsNone = new Phaser.Rectangle(0, 0, width, height), this.positionCustom = new Phaser.Point(0, 0), this.positionFluid = new Phaser.Point(0, 0), this.positionFull = new Phaser.Point(0, 0), this.positionNone = new Phaser.Point(0, 0), this.scaleCustom = new Phaser.Point(1, 1), this.scaleFluid = new Phaser.Point(1, 1), this.scaleFluidInversed = new Phaser.Point(1, 1), this.scaleFull = new Phaser.Point(1, 1), this.scaleNone = new Phaser.Point(1, 1), this.customWidth = 0, this.customHeight = 0, this.customOffsetX = 0, this.customOffsetY = 0, this.ratioH = width / height, this.ratioV = height / width, this.multiplier = 0, this.layers = []
        }, Phaser.FlexGrid.prototype = {
            setSize: function(width, height) {
                this.width = width, this.height = height, this.ratioH = width / height, this.ratioV = height / width, this.scaleNone = new Phaser.Point(1, 1), this.boundsNone.width = this.width, this.boundsNone.height = this.height, this.refresh()
            },
            createCustomLayer: function(width, height, children, addToWorld) {
                void 0 === addToWorld && (addToWorld = !0), this.customWidth = width, this.customHeight = height, this.boundsCustom.width = width, this.boundsCustom.height = height;
                var layer = new Phaser.FlexLayer(this, this.positionCustom, this.boundsCustom, this.scaleCustom);
                return addToWorld && this.game.world.add(layer), this.layers.push(layer), "undefined" != typeof children && null !== typeof children && layer.addMultiple(children), layer
            },
            createFluidLayer: function(children, addToWorld) {
                void 0 === addToWorld && (addToWorld = !0);
                var layer = new Phaser.FlexLayer(this, this.positionFluid, this.boundsFluid, this.scaleFluid);
                return addToWorld && this.game.world.add(layer), this.layers.push(layer), "undefined" != typeof children && null !== typeof children && layer.addMultiple(children), layer
            },
            createFullLayer: function(children) {
                var layer = new Phaser.FlexLayer(this, this.positionFull, this.boundsFull, this.scaleFluid);
                return this.game.world.add(layer), this.layers.push(layer), "undefined" != typeof children && layer.addMultiple(children), layer
            },
            createFixedLayer: function(children) {
                var layer = new Phaser.FlexLayer(this, this.positionNone, this.boundsNone, this.scaleNone);
                return this.game.world.add(layer), this.layers.push(layer), "undefined" != typeof children && layer.addMultiple(children), layer
            },
            reset: function() {
                for (var i = this.layers.length; i--;) this.layers[i].persist || (this.layers[i].position = null, this.layers[i].scale = null, this.layers.slice(i, 1))
            },
            onResize: function(width, height) {
                this.ratioH = width / height, this.ratioV = height / width, this.refresh(width, height)
            },
            refresh: function() {
                this.multiplier = Math.min(this.manager.height / this.height, this.manager.width / this.width), this.boundsFluid.width = Math.round(this.width * this.multiplier), this.boundsFluid.height = Math.round(this.height * this.multiplier), this.scaleFluid.set(this.boundsFluid.width / this.width, this.boundsFluid.height / this.height), this.scaleFluidInversed.set(this.width / this.boundsFluid.width, this.height / this.boundsFluid.height), this.scaleFull.set(this.boundsFull.width / this.width, this.boundsFull.height / this.height), this.boundsFull.width = Math.round(this.manager.width * this.scaleFluidInversed.x), this.boundsFull.height = Math.round(this.manager.height * this.scaleFluidInversed.y), this.boundsFluid.centerOn(this.manager.bounds.centerX, this.manager.bounds.centerY), this.boundsNone.centerOn(this.manager.bounds.centerX, this.manager.bounds.centerY), this.positionFluid.set(this.boundsFluid.x, this.boundsFluid.y), this.positionNone.set(this.boundsNone.x, this.boundsNone.y)
            },
            fitSprite: function(sprite) {
                this.manager.scaleSprite(sprite), sprite.x = this.manager.bounds.centerX, sprite.y = this.manager.bounds.centerY
            },
            debug: function() {
                this.game.debug.text(this.boundsFluid.width + " x " + this.boundsFluid.height, this.boundsFluid.x + 4, this.boundsFluid.y + 16), this.game.debug.geom(this.boundsFluid, "rgba(255,0,0,0.9", !1)
            }
        }, Phaser.FlexGrid.prototype.constructor = Phaser.FlexGrid, Phaser.FlexLayer = function(manager, position, bounds, scale) {
            Phaser.Group.call(this, manager.game, null, "__flexLayer" + manager.game.rnd.uuid(), !1), this.manager = manager.manager, this.grid = manager, this.persist = !1, this.position = position, this.bounds = bounds, this.scale = scale, this.topLeft = bounds.topLeft, this.topMiddle = new Phaser.Point(bounds.halfWidth, 0), this.topRight = bounds.topRight, this.bottomLeft = bounds.bottomLeft, this.bottomMiddle = new Phaser.Point(bounds.halfWidth, bounds.bottom), this.bottomRight = bounds.bottomRight
        }, Phaser.FlexLayer.prototype = Object.create(Phaser.Group.prototype), Phaser.FlexLayer.prototype.constructor = Phaser.FlexLayer, Phaser.FlexLayer.prototype.resize = function() {}, Phaser.FlexLayer.prototype.debug = function() {
            this.game.debug.text(this.bounds.width + " x " + this.bounds.height, this.bounds.x + 4, this.bounds.y + 16), this.game.debug.geom(this.bounds, "rgba(0,0,255,0.9", !1), this.game.debug.geom(this.topLeft, "rgba(255,255,255,0.9"), this.game.debug.geom(this.topMiddle, "rgba(255,255,255,0.9"), this.game.debug.geom(this.topRight, "rgba(255,255,255,0.9")
        }, Phaser.Color = {
            packPixel: function(r, g, b, a) {
                return Phaser.Device.LITTLE_ENDIAN ? (a << 24 | b << 16 | g << 8 | r) >>> 0 : (r << 24 | g << 16 | b << 8 | a) >>> 0
            },
            unpackPixel: function(rgba, out, hsl, hsv) {
                return (void 0 === out || null === out) && (out = Phaser.Color.createColor()), (void 0 === hsl || null === hsl) && (hsl = !1), (void 0 === hsv || null === hsv) && (hsv = !1), Phaser.Device.LITTLE_ENDIAN ? (out.a = (4278190080 & rgba) >>> 24, out.b = (16711680 & rgba) >>> 16, out.g = (65280 & rgba) >>> 8, out.r = 255 & rgba) : (out.r = (4278190080 & rgba) >>> 24, out.g = (16711680 & rgba) >>> 16, out.b = (65280 & rgba) >>> 8, out.a = 255 & rgba), out.color = rgba, out.rgba = "rgba(" + out.r + "," + out.g + "," + out.b + "," + out.a / 255 + ")", hsl && Phaser.Color.RGBtoHSL(out.r, out.g, out.b, out), hsv && Phaser.Color.RGBtoHSV(out.r, out.g, out.b, out), out
            },
            fromRGBA: function(rgba, out) {
                return out || (out = Phaser.Color.createColor()), out.r = (4278190080 & rgba) >>> 24, out.g = (16711680 & rgba) >>> 16, out.b = (65280 & rgba) >>> 8, out.a = 255 & rgba, out.rgba = "rgba(" + out.r + "," + out.g + "," + out.b + "," + out.a + ")", out
            },
            toRGBA: function(r, g, b, a) {
                return r << 24 | g << 16 | b << 8 | a
            },
            RGBtoHSL: function(r, g, b, out) {
                out || (out = Phaser.Color.createColor(r, g, b, 1)), r /= 255, g /= 255, b /= 255;
                var min = Math.min(r, g, b),
                    max = Math.max(r, g, b);
                if (out.h = 0, out.s = 0, out.l = (max + min) / 2, max !== min) {
                    var d = max - min;
                    out.s = out.l > .5 ? d / (2 - max - min) : d / (max + min), max === r ? out.h = (g - b) / d + (b > g ? 6 : 0) : max === g ? out.h = (b - r) / d + 2 : max === b && (out.h = (r - g) / d + 4), out.h /= 6
                }
                return out
            },
            HSLtoRGB: function(h, s, l, out) {
                if (out ? (out.r = l, out.g = l, out.b = l) : out = Phaser.Color.createColor(l, l, l), 0 !== s) {
                    var q = .5 > l ? l * (1 + s) : l + s - l * s,
                        p = 2 * l - q;
                    out.r = Phaser.Color.hueToColor(p, q, h + 1 / 3), out.g = Phaser.Color.hueToColor(p, q, h), out.b = Phaser.Color.hueToColor(p, q, h - 1 / 3)
                }
                return out.r = Math.floor(255 * out.r | 0), out.g = Math.floor(255 * out.g | 0), out.b = Math.floor(255 * out.b | 0), Phaser.Color.updateColor(out), out
            },
            RGBtoHSV: function(r, g, b, out) {
                out || (out = Phaser.Color.createColor(r, g, b, 255)), r /= 255, g /= 255, b /= 255;
                var min = Math.min(r, g, b),
                    max = Math.max(r, g, b),
                    d = max - min;
                return out.h = 0, out.s = 0 === max ? 0 : d / max, out.v = max, max !== min && (max === r ? out.h = (g - b) / d + (b > g ? 6 : 0) : max === g ? out.h = (b - r) / d + 2 : max === b && (out.h = (r - g) / d + 4), out.h /= 6), out
            },
            HSVtoRGB: function(h, s, v, out) {
                void 0 === out && (out = Phaser.Color.createColor(0, 0, 0, 1, h, s, 0, v));
                var r, g, b, i = Math.floor(6 * h),
                    f = 6 * h - i,
                    p = v * (1 - s),
                    q = v * (1 - f * s),
                    t = v * (1 - (1 - f) * s);
                switch (i % 6) {
                    case 0:
                        r = v, g = t, b = p;
                        break;
                    case 1:
                        r = q, g = v, b = p;
                        break;
                    case 2:
                        r = p, g = v, b = t;
                        break;
                    case 3:
                        r = p, g = q, b = v;
                        break;
                    case 4:
                        r = t, g = p, b = v;
                        break;
                    case 5:
                        r = v, g = p, b = q
                }
                return out.r = Math.floor(255 * r), out.g = Math.floor(255 * g), out.b = Math.floor(255 * b), Phaser.Color.updateColor(out), out
            },
            hueToColor: function(p, q, t) {
                return 0 > t && (t += 1), t > 1 && (t -= 1), 1 / 6 > t ? p + 6 * (q - p) * t : .5 > t ? q : 2 / 3 > t ? p + (q - p) * (2 / 3 - t) * 6 : p
            },
            createColor: function(r, g, b, a, h, s, l, v) {
                var out = {
                    r: r || 0,
                    g: g || 0,
                    b: b || 0,
                    a: a || 1,
                    h: h || 0,
                    s: s || 0,
                    l: l || 0,
                    v: v || 0,
                    color: 0,
                    color32: 0,
                    rgba: ""
                };
                return Phaser.Color.updateColor(out)
            },
            updateColor: function(out) {
                return out.rgba = "rgba(" + out.r.toString() + "," + out.g.toString() + "," + out.b.toString() + "," + out.a.toString() + ")", out.color = Phaser.Color.getColor(out.r, out.g, out.b), out.color32 = Phaser.Color.getColor32(out.a, out.r, out.g, out.b), out
            },
            getColor32: function(a, r, g, b) {
                return a << 24 | r << 16 | g << 8 | b
            },
            getColor: function(r, g, b) {
                return r << 16 | g << 8 | b
            },
            RGBtoString: function(r, g, b, a, prefix) {
                return void 0 === a && (a = 255), void 0 === prefix && (prefix = "#"), "#" === prefix ? "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1) : "0x" + Phaser.Color.componentToHex(a) + Phaser.Color.componentToHex(r) + Phaser.Color.componentToHex(g) + Phaser.Color.componentToHex(b)
            },
            hexToRGB: function(hex) {
                var rgb = Phaser.Color.hexToColor(hex);
                return rgb ? Phaser.Color.getColor32(rgb.a, rgb.r, rgb.g, rgb.b) : void 0
            },
            hexToColor: function(hex, out) {
                hex = hex.replace(/^(?:#|0x)?([a-f\d])([a-f\d])([a-f\d])$/i, function(m, r, g, b) {
                    return r + r + g + g + b + b
                });
                var result = /^(?:#|0x)?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                if (result) {
                    var r = parseInt(result[1], 16),
                        g = parseInt(result[2], 16),
                        b = parseInt(result[3], 16);
                    out ? (out.r = r, out.g = g, out.b = b) : out = Phaser.Color.createColor(r, g, b)
                }
                return out
            },
            webToColor: function(web, out) {
                out || (out = Phaser.Color.createColor());
                var result = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d+(?:\.\d+)?))?\s*\)$/.exec(web);
                return result && (out.r = parseInt(result[1], 10), out.g = parseInt(result[2], 10), out.b = parseInt(result[3], 10), out.a = void 0 !== result[4] ? parseFloat(result[4]) : 1, Phaser.Color.updateColor(out)), out
            },
            valueToColor: function(value, out) {
                if (out || (out = Phaser.Color.createColor()), "string" == typeof value) return 0 === value.indexOf("rgb") ? Phaser.Color.webToColor(value, out) : (out.a = 1, Phaser.Color.hexToColor(value, out));
                if ("number" == typeof value) {
                    var tempColor = Phaser.Color.getRGB(value);
                    return out.r = tempColor.r, out.g = tempColor.g, out.b = tempColor.b, out.a = tempColor.a / 255, out
                }
                return out
            },
            componentToHex: function(color) {
                var hex = color.toString(16);
                return 1 == hex.length ? "0" + hex : hex
            },
            HSVColorWheel: function(s, v) {
                void 0 === s && (s = 1), void 0 === v && (v = 1);
                for (var colors = [], c = 0; 359 >= c; c++) colors.push(Phaser.Color.HSVtoRGB(c / 359, s, v));
                return colors
            },
            HSLColorWheel: function(s, l) {
                void 0 === s && (s = .5), void 0 === l && (l = .5);
                for (var colors = [], c = 0; 359 >= c; c++) colors.push(Phaser.Color.HSLtoRGB(c / 359, s, l));
                return colors
            },
            interpolateColor: function(color1, color2, steps, currentStep, alpha) {
                void 0 === alpha && (alpha = 255);
                var src1 = Phaser.Color.getRGB(color1),
                    src2 = Phaser.Color.getRGB(color2),
                    r = (src2.red - src1.red) * currentStep / steps + src1.red,
                    g = (src2.green - src1.green) * currentStep / steps + src1.green,
                    b = (src2.blue - src1.blue) * currentStep / steps + src1.blue;
                return Phaser.Color.getColor32(alpha, r, g, b)
            },
            interpolateColorWithRGB: function(color, r, g, b, steps, currentStep) {
                var src = Phaser.Color.getRGB(color),
                    or = (r - src.red) * currentStep / steps + src.red,
                    og = (g - src.green) * currentStep / steps + src.green,
                    ob = (b - src.blue) * currentStep / steps + src.blue;
                return Phaser.Color.getColor(or, og, ob)
            },
            interpolateRGB: function(r1, g1, b1, r2, g2, b2, steps, currentStep) {
                var r = (r2 - r1) * currentStep / steps + r1,
                    g = (g2 - g1) * currentStep / steps + g1,
                    b = (b2 - b1) * currentStep / steps + b1;
                return Phaser.Color.getColor(r, g, b)
            },
            getRandomColor: function(min, max, alpha) {
                if (void 0 === min && (min = 0), void 0 === max && (max = 255), void 0 === alpha && (alpha = 255), max > 255 || min > max) return Phaser.Color.getColor(255, 255, 255);
                var red = min + Math.round(Math.random() * (max - min)),
                    green = min + Math.round(Math.random() * (max - min)),
                    blue = min + Math.round(Math.random() * (max - min));
                return Phaser.Color.getColor32(alpha, red, green, blue)
            },
            getRGB: function(color) {
                return color > 16777215 ? {
                    alpha: color >>> 24,
                    red: color >> 16 & 255,
                    green: color >> 8 & 255,
                    blue: 255 & color,
                    a: color >>> 24,
                    r: color >> 16 & 255,
                    g: color >> 8 & 255,
                    b: 255 & color
                } : {
                    alpha: 255,
                    red: color >> 16 & 255,
                    green: color >> 8 & 255,
                    blue: 255 & color,
                    a: 255,
                    r: color >> 16 & 255,
                    g: color >> 8 & 255,
                    b: 255 & color
                }
            },
            getWebRGB: function(color) {
                if ("object" == typeof color) return "rgba(" + color.r.toString() + "," + color.g.toString() + "," + color.b.toString() + "," + (color.a / 255).toString() + ")";
                var rgb = Phaser.Color.getRGB(color);
                return "rgba(" + rgb.r.toString() + "," + rgb.g.toString() + "," + rgb.b.toString() + "," + (rgb.a / 255).toString() + ")"
            },
            getAlpha: function(color) {
                return color >>> 24
            },
            getAlphaFloat: function(color) {
                return (color >>> 24) / 255
            },
            getRed: function(color) {
                return color >> 16 & 255
            },
            getGreen: function(color) {
                return color >> 8 & 255
            },
            getBlue: function(color) {
                return 255 & color
            },
            blendNormal: function(a) {
                return a
            },
            blendLighten: function(a, b) {
                return b > a ? b : a
            },
            blendDarken: function(a, b) {
                return b > a ? a : b
            },
            blendMultiply: function(a, b) {
                return a * b / 255
            },
            blendAverage: function(a, b) {
                return (a + b) / 2
            },
            blendAdd: function(a, b) {
                return Math.min(255, a + b)
            },
            blendSubtract: function(a, b) {
                return Math.max(0, a + b - 255)
            },
            blendDifference: function(a, b) {
                return Math.abs(a - b)
            },
            blendNegation: function(a, b) {
                return 255 - Math.abs(255 - a - b)
            },
            blendScreen: function(a, b) {
                return 255 - ((255 - a) * (255 - b) >> 8)
            },
            blendExclusion: function(a, b) {
                return a + b - 2 * a * b / 255
            },
            blendOverlay: function(a, b) {
                return 128 > b ? 2 * a * b / 255 : 255 - 2 * (255 - a) * (255 - b) / 255
            },
            blendSoftLight: function(a, b) {
                return 128 > b ? 2 * ((a >> 1) + 64) * (b / 255) : 255 - 2 * (255 - ((a >> 1) + 64)) * (255 - b) / 255
            },
            blendHardLight: function(a, b) {
                return Phaser.Color.blendOverlay(b, a)
            },
            blendColorDodge: function(a, b) {
                return 255 === b ? b : Math.min(255, (a << 8) / (255 - b))
            },
            blendColorBurn: function(a, b) {
                return 0 === b ? b : Math.max(0, 255 - (255 - a << 8) / b)
            },
            blendLinearDodge: function(a, b) {
                return Phaser.Color.blendAdd(a, b)
            },
            blendLinearBurn: function(a, b) {
                return Phaser.Color.blendSubtract(a, b)
            },
            blendLinearLight: function(a, b) {
                return 128 > b ? Phaser.Color.blendLinearBurn(a, 2 * b) : Phaser.Color.blendLinearDodge(a, 2 * (b - 128))
            },
            blendVividLight: function(a, b) {
                return 128 > b ? Phaser.Color.blendColorBurn(a, 2 * b) : Phaser.Color.blendColorDodge(a, 2 * (b - 128))
            },
            blendPinLight: function(a, b) {
                return 128 > b ? Phaser.Color.blendDarken(a, 2 * b) : Phaser.Color.blendLighten(a, 2 * (b - 128))
            },
            blendHardMix: function(a, b) {
                return Phaser.Color.blendVividLight(a, b) < 128 ? 0 : 255
            },
            blendReflect: function(a, b) {
                return 255 === b ? b : Math.min(255, a * a / (255 - b))
            },
            blendGlow: function(a, b) {
                return Phaser.Color.blendReflect(b, a)
            },
            blendPhoenix: function(a, b) {
                return Math.min(a, b) - Math.max(a, b) + 255
            }
        }, Phaser.Physics = function(game, config) {
            config = config || {}, this.game = game, this.config = config, this.arcade = null, this.p2 = null, this.ninja = null, this.box2d = null, this.chipmunk = null, this.matter = null, this.parseConfig()
        }, Phaser.Physics.ARCADE = 0, Phaser.Physics.P2JS = 1, Phaser.Physics.NINJA = 2, Phaser.Physics.BOX2D = 3, Phaser.Physics.CHIPMUNK = 4, Phaser.Physics.MATTERJS = 5, Phaser.Physics.prototype = {
            parseConfig: function() {
                this.config.hasOwnProperty("arcade") && this.config.arcade !== !0 || !Phaser.Physics.hasOwnProperty("Arcade") || (this.arcade = new Phaser.Physics.Arcade(this.game)), this.config.hasOwnProperty("ninja") && this.config.ninja === !0 && Phaser.Physics.hasOwnProperty("Ninja") && (this.ninja = new Phaser.Physics.Ninja(this.game)), this.config.hasOwnProperty("p2") && this.config.p2 === !0 && Phaser.Physics.hasOwnProperty("P2") && (this.p2 = new Phaser.Physics.P2(this.game, this.config)), this.config.hasOwnProperty("box2d") && this.config.box2d === !0 && Phaser.Physics.hasOwnProperty("BOX2D") && (this.box2d = new Phaser.Physics.BOX2D(this.game, this.config)), this.config.hasOwnProperty("matter") && this.config.matter === !0 && Phaser.Physics.hasOwnProperty("Matter") && (this.matter = new Phaser.Physics.Matter(this.game, this.config))
            },
            startSystem: function(system) {
                system === Phaser.Physics.ARCADE ? this.arcade = new Phaser.Physics.Arcade(this.game) : system === Phaser.Physics.P2JS ? null === this.p2 ? this.p2 = new Phaser.Physics.P2(this.game, this.config) : this.p2.reset() : system === Phaser.Physics.NINJA ? this.ninja = new Phaser.Physics.Ninja(this.game) : system === Phaser.Physics.BOX2D ? null === this.box2d ? this.box2d = new Phaser.Physics.Box2D(this.game, this.config) : this.box2d.reset() : system === Phaser.Physics.MATTERJS && (null === this.matter ? this.matter = new Phaser.Physics.Matter(this.game, this.config) : this.matter.reset())
            },
            enable: function(object, system, debug) {
                void 0 === system && (system = Phaser.Physics.ARCADE), void 0 === debug && (debug = !1), system === Phaser.Physics.ARCADE ? this.arcade.enable(object) : system === Phaser.Physics.P2JS && this.p2 ? this.p2.enable(object, debug) : system === Phaser.Physics.NINJA && this.ninja ? this.ninja.enableAABB(object) : system === Phaser.Physics.BOX2D && this.box2d ? this.box2d.enable(object) : system === Phaser.Physics.MATTERJS && this.matter && this.matter.enable(object)
            },
            preUpdate: function() {
                this.p2 && this.p2.preUpdate(), this.box2d && this.box2d.preUpdate(), this.matter && this.matter.preUpdate()
            },
            update: function() {
                this.p2 && this.p2.update(), this.box2d && this.box2d.update(), this.matter && this.matter.update()
            },
            setBoundsToWorld: function() {
                this.arcade && this.arcade.setBoundsToWorld(), this.ninja && this.ninja.setBoundsToWorld(), this.p2 && this.p2.setBoundsToWorld(), this.box2d && this.box2d.setBoundsToWorld(), this.matter && this.matter.setBoundsToWorld()
            },
            clear: function() {
                this.p2 && this.p2.clear(), this.box2d && this.box2d.clear(), this.matter && this.matter.clear()
            },
            reset: function() {
                this.p2 && this.p2.reset(), this.box2d && this.box2d.reset(), this.matter && this.matter.reset()
            },
            destroy: function() {
                this.p2 && this.p2.destroy(), this.box2d && this.box2d.destroy(), this.matter && this.matter.destroy(), this.arcade = null, this.ninja = null, this.p2 = null, this.box2d = null, this.matter = null
            }
        }, Phaser.Physics.prototype.constructor = Phaser.Physics, Phaser.Particles = function(game) {
            this.game = game, this.emitters = {}, this.ID = 0
        }, Phaser.Particles.prototype = {
            add: function(emitter) {
                return this.emitters[emitter.name] = emitter, emitter
            },
            remove: function(emitter) {
                delete this.emitters[emitter.name]
            },
            update: function() {
                for (var key in this.emitters) this.emitters[key].exists && this.emitters[key].update()
            }
        }, Phaser.Particles.prototype.constructor = Phaser.Particles, Phaser.Video = function(game, key, url) {
            if (void 0 === key && (key = null), void 0 === url && (url = null), this.game = game, this.key = key, this.width = 0, this.height = 0, this.type = Phaser.VIDEO, this.disableTextureUpload = !1, this.touchLocked = !1, this.onPlay = new Phaser.Signal, this.onChangeSource = new Phaser.Signal, this.onComplete = new Phaser.Signal, this.onAccess = new Phaser.Signal, this.onError = new Phaser.Signal, this.onTimeout = new Phaser.Signal, this.timeout = 15e3, this._timeOutID = null, this.video = null, this.videoStream = null, this.isStreaming = !1, this.retryLimit = 20, this.retry = 0, this.retryInterval = 500, this._retryID = null, this._codeMuted = !1, this._muted = !1, this._codePaused = !1, this._paused = !1, this._pending = !1, this._autoplay = !1, key && this.game.cache.checkVideoKey(key)) {
                var _video = this.game.cache.getVideo(key);
                _video.isBlob ? this.createVideoFromBlob(_video.data) : this.video = _video.data, this.width = this.video.videoWidth, this.height = this.video.videoHeight
            } else url && this.createVideoFromURL(url, !1);
            this.video && !url ? (this.baseTexture = new PIXI.BaseTexture(this.video), this.baseTexture.forceLoaded(this.width, this.height)) : (this.baseTexture = new PIXI.BaseTexture(PIXI.TextureCache.__default.baseTexture.source), this.baseTexture.forceLoaded(this.width, this.height)), this.texture = new PIXI.Texture(this.baseTexture), this.textureFrame = new Phaser.Frame(0, 0, 0, this.width, this.height, "video"), this.texture.setFrame(this.textureFrame), this.texture.valid = !1, null !== key && this.video && (this.texture.valid = this.video.canplay), this.snapshot = null, Phaser.BitmapData && (this.snapshot = new Phaser.BitmapData(this.game, "", this.width, this.height)), !this.game.device.cocoonJS && (this.game.device.iOS || this.game.device.android) || window.PhaserGlobal && window.PhaserGlobal.fakeiOSTouchLock ? this.setTouchLock() : _video && (_video.locked = !1)
        }, Phaser.Video.prototype = {
            connectToMediaStream: function(video, stream) {
                return video && stream && (this.video = video, this.videoStream = stream, this.isStreaming = !0, this.baseTexture.source = this.video, this.updateTexture(null, this.video.videoWidth, this.video.videoHeight), this.onAccess.dispatch(this)), this
            },
            startMediaStream: function(captureAudio, width, height) {
                if (void 0 === captureAudio && (captureAudio = !1), void 0 === width && (width = null), void 0 === height && (height = null), !this.game.device.getUserMedia) return this.onError.dispatch(this, "No getUserMedia"), !1;
                null !== this.videoStream && (this.videoStream.active ? this.videoStream.active = !1 : this.videoStream.stop()), this.removeVideoElement(), this.video = document.createElement("video"), this.video.setAttribute("autoplay", "autoplay"), null !== width && (this.video.width = width), null !== height && (this.video.height = height), this._timeOutID = window.setTimeout(this.getUserMediaTimeout.bind(this), this.timeout);
                try {
                    navigator.getUserMedia({
                        audio: captureAudio,
                        video: !0
                    }, this.getUserMediaSuccess.bind(this), this.getUserMediaError.bind(this))
                } catch (error) {
                    this.getUserMediaError(error)
                }
                return this
            },
            getUserMediaTimeout: function() {
                clearTimeout(this._timeOutID), this.onTimeout.dispatch(this)
            },
            getUserMediaError: function(event) {
                clearTimeout(this._timeOutID), this.onError.dispatch(this, event)
            },
            getUserMediaSuccess: function(stream) {
                clearTimeout(this._timeOutID), this.videoStream = stream, void 0 !== this.video.mozSrcObject ? this.video.mozSrcObject = stream : this.video.src = window.URL && window.URL.createObjectURL(stream) || stream;
                var self = this;
                this.video.onloadeddata = function() {
                    function checkStream() {
                        if (retry > 0)
                            if (self.video.videoWidth > 0) {
                                var width = self.video.videoWidth,
                                    height = self.video.videoHeight;
                                isNaN(self.video.videoHeight) && (height = width / (4 / 3)), self.video.play(), self.isStreaming = !0, self.baseTexture.source = self.video, self.updateTexture(null, width, height), self.onAccess.dispatch(self)
                            } else window.setTimeout(checkStream, 500);
                        else console.warn("Unable to connect to video stream. Webcam error?");
                        retry--
                    }
                    var retry = 10;
                    checkStream()
                }
            },
            createVideoFromBlob: function(blob) {
                var _this = this;
                return this.video = document.createElement("video"), this.video.controls = !1, this.video.setAttribute("autoplay", "autoplay"), this.video.addEventListener("loadeddata", function(event) {
                    _this.updateTexture(event)
                }, !0), this.video.src = window.URL.createObjectURL(blob), this.video.canplay = !0, this
            },
            createVideoFromURL: function(url, autoplay) {
                return void 0 === autoplay && (autoplay = !1), this.texture && (this.texture.valid = !1), this.video = document.createElement("video"), this.video.controls = !1, autoplay && this.video.setAttribute("autoplay", "autoplay"), this.video.src = url, this.video.canplay = !0, this.video.load(), this.retry = this.retryLimit, this._retryID = window.setTimeout(this.checkVideoProgress.bind(this), this.retryInterval), this.key = url, this
            },
            updateTexture: function(event, width, height) {
                var change = !1;
                (void 0 === width || null === width) && (width = this.video.videoWidth, change = !0), (void 0 === height || null === height) && (height = this.video.videoHeight), this.width = width, this.height = height, this.baseTexture.source !== this.video && (this.baseTexture.source = this.video), this.baseTexture.forceLoaded(width, height), this.texture.frame.resize(width, height), this.texture.width = width, this.texture.height = height, this.texture.valid = !0, this.snapshot && this.snapshot.resize(width, height), change && null !== this.key && (this.onChangeSource.dispatch(this, width, height), this._autoplay && (this.video.play(), this.onPlay.dispatch(this, this.loop, this.playbackRate)))
            },
            complete: function() {
                this.onComplete.dispatch(this)
            },
            play: function(loop, playbackRate) {
                return void 0 === loop && (loop = !1), void 0 === playbackRate && (playbackRate = 1), this.game.sound.onMute && (this.game.sound.onMute.add(this.setMute, this), this.game.sound.onUnMute.add(this.unsetMute, this), this.game.sound.mute && this.setMute()), this.game.onPause.add(this.setPause, this), this.game.onResume.add(this.setResume, this), this.video.addEventListener("ended", this.complete.bind(this), !0), loop ? this.video.loop = "loop" : this.video.loop = "", this.video.playbackRate = playbackRate, this.touchLocked ? this._pending = !0 : (this._pending = !1, null !== this.key && (4 !== this.video.readyState ? (this.retry = this.retryLimit, this._retryID = window.setTimeout(this.checkVideoProgress.bind(this), this.retryInterval)) : this.video.addEventListener("playing", this.playHandler.bind(this), !0)), this.video.play(), this.onPlay.dispatch(this, loop, playbackRate)), this
            },
            playHandler: function() {
                this.video.removeEventListener("playing", this.playHandler.bind(this)), this.updateTexture()
            },
            stop: function() {
                return this.game.sound.onMute && (this.game.sound.onMute.remove(this.setMute, this), this.game.sound.onUnMute.remove(this.unsetMute, this)), this.game.onPause.remove(this.setPause, this), this.game.onResume.remove(this.setResume, this), this.isStreaming ? (this.video.mozSrcObject ? (this.video.mozSrcObject.stop(), this.video.src = null) : (this.video.src = "", this.videoStream.active ? this.videoStream.active = !1 : this.videoStream.stop()), this.videoStream = null, this.isStreaming = !1) : (this.video.removeEventListener("ended", this.complete.bind(this), !0), this.video.removeEventListener("playing", this.playHandler.bind(this), !0), this.touchLocked ? this._pending = !1 : this.video.pause()), this
            },
            add: function(object) {
                if (Array.isArray(object))
                    for (var i = 0; i < object.length; i++) object[i].loadTexture && object[i].loadTexture(this);
                else object.loadTexture(this);
                return this
            },
            addToWorld: function(x, y, anchorX, anchorY, scaleX, scaleY) {
                scaleX = scaleX || 1, scaleY = scaleY || 1;
                var image = this.game.add.image(x, y, this);
                return image.anchor.set(anchorX, anchorY), image.scale.set(scaleX, scaleY), image
            },
            render: function() {
                !this.disableTextureUpload && this.playing && this.baseTexture.dirty()
            },
            setMute: function() {
                this._muted || (this._muted = !0, this.video.muted = !0)
            },
            unsetMute: function() {
                this._muted && !this._codeMuted && (this._muted = !1, this.video.muted = !1)
            },
            setPause: function() {
                this._paused || this.touchLocked || (this._paused = !0, this.video.pause())
            },
            setResume: function() {
                !this._paused || this._codePaused || this.touchLocked || (this._paused = !1, this.video.ended || this.video.play())
            },
            changeSource: function(src, autoplay) {
                return void 0 === autoplay && (autoplay = !0), this.texture.valid = !1, this.video.pause(), this.retry = this.retryLimit, this._retryID = window.setTimeout(this.checkVideoProgress.bind(this), this.retryInterval), this.video.src = src, this.video.load(), this._autoplay = autoplay, autoplay || (this.paused = !0), this
            },
            checkVideoProgress: function() {
                4 === this.video.readyState ? this.updateTexture() : (this.retry--, this.retry > 0 ? this._retryID = window.setTimeout(this.checkVideoProgress.bind(this), this.retryInterval) : console.warn("Phaser.Video: Unable to start downloading video in time", this.isStreaming))
            },
            setTouchLock: function() {
                this.game.input.touch.addTouchLockCallback(this.unlock, this), this.touchLocked = !0
            },
            unlock: function() {
                if (this.touchLocked = !1, this.video.play(), this.onPlay.dispatch(this, this.loop, this.playbackRate), this.key) {
                    var _video = this.game.cache.getVideo(this.key);
                    _video && !_video.isBlob && (_video.locked = !1)
                }
                return !0
            },
            grab: function(clear, alpha, blendMode) {
                return void 0 === clear && (clear = !1), void 0 === alpha && (alpha = 1), void 0 === blendMode && (blendMode = null), null === this.snapshot ? void console.warn("Video.grab cannot run because Phaser.BitmapData is unavailable") : (clear && this.snapshot.cls(), this.snapshot.copy(this.video, 0, 0, this.width, this.height, 0, 0, this.width, this.height, 0, 0, 0, 1, 1, alpha, blendMode), this.snapshot)
            },
            removeVideoElement: function() {
                if (this.video) {
                    for (this.video.parentNode && this.video.parentNode.removeChild(this.video); this.video.hasChildNodes();) this.video.removeChild(this.video.firstChild);
                    this.video.removeAttribute("autoplay"), this.video.removeAttribute("src"), this.video = null
                }
            },
            destroy: function() {
                this.stop(), this.removeVideoElement(), this.touchLocked && this.game.input.touch.removeTouchLockCallback(this.unlock, this), this._retryID && window.clearTimeout(this._retryID)
            }
        }, Object.defineProperty(Phaser.Video.prototype, "currentTime", {
            get: function() {
                return this.video ? this.video.currentTime : 0
            },
            set: function(value) {
                this.video.currentTime = value
            }
        }), Object.defineProperty(Phaser.Video.prototype, "duration", {
            get: function() {
                return this.video ? this.video.duration : 0
            }
        }), Object.defineProperty(Phaser.Video.prototype, "progress", {
            get: function() {
                return this.video ? this.video.currentTime / this.video.duration : 0
            }
        }), Object.defineProperty(Phaser.Video.prototype, "mute", {
            get: function() {
                return this._muted
            },
            set: function(value) {
                if (value = value || null) {
                    if (this._muted) return;
                    this._codeMuted = !0, this.setMute()
                } else {
                    if (!this._muted) return;
                    this._codeMuted = !1, this.unsetMute()
                }
            }
        }), Object.defineProperty(Phaser.Video.prototype, "paused", {
            get: function() {
                return this._paused
            },
            set: function(value) {
                if (value = value || null, !this.touchLocked)
                    if (value) {
                        if (this._paused) return;
                        this._codePaused = !0, this.setPause()
                    } else {
                        if (!this._paused) return;
                        this._codePaused = !1, this.setResume()
                    }
            }
        }), Object.defineProperty(Phaser.Video.prototype, "volume", {
            get: function() {
                return this.video ? this.video.volume : 1
            },
            set: function(value) {
                0 > value ? value = 0 : value > 1 && (value = 1), this.video && (this.video.volume = value)
            }
        }), Object.defineProperty(Phaser.Video.prototype, "playbackRate", {
            get: function() {
                return this.video ? this.video.playbackRate : 1
            },
            set: function(value) {
                this.video && (this.video.playbackRate = value)
            }
        }), Object.defineProperty(Phaser.Video.prototype, "loop", {
            get: function() {
                return this.video ? this.video.loop : !1
            },
            set: function(value) {
                value && this.video ? this.video.loop = "loop" : this.video && (this.video.loop = "")
            }
        }), Object.defineProperty(Phaser.Video.prototype, "playing", {
            get: function() {
                return !(this.video.paused && this.video.ended)
            }
        }), Phaser.Video.prototype.constructor = Phaser.Video, void 0 === PIXI.blendModes && (PIXI.blendModes = Phaser.blendModes), void 0 === PIXI.scaleModes && (PIXI.scaleModes = Phaser.scaleModes), void 0 === PIXI.Texture.emptyTexture && (PIXI.Texture.emptyTexture = new PIXI.Texture(new PIXI.BaseTexture)), void 0 === PIXI.DisplayObject._tempMatrix && (PIXI.DisplayObject._tempMatrix = new PIXI.Matrix), void 0 === PIXI.RenderTexture.tempMatrix && (PIXI.RenderTexture.tempMatrix = new PIXI.Matrix), PIXI.Graphics && void 0 === PIXI.Graphics.POLY && (PIXI.Graphics.POLY = Phaser.POLYGON, PIXI.Graphics.RECT = Phaser.RECTANGLE, PIXI.Graphics.CIRC = Phaser.CIRCLE, PIXI.Graphics.ELIP = Phaser.ELLIPSE, PIXI.Graphics.RREC = Phaser.ROUNDEDRECTANGLE), PIXI.TextureSilentFail = !0, "undefined" != typeof exports ? ("undefined" != typeof module && module.exports && (exports = module.exports = Phaser), exports.Phaser = Phaser) : "undefined" != typeof define && define.amd ? define("Phaser", function() {
            return root.Phaser = Phaser
        }()) : root.Phaser = Phaser, Phaser
    }.call(this);