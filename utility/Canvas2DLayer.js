/**
 * 2D canvas stand-in for Layer (utility/WebGL.js), used when the browser
 * has no WebGL, like Garry's Mod's built-in browser. Same API as Layer.
 * Quads are projected on the CPU and drawn with affine transforms. Big
 * perspective quads (the stage floor) are cut into strips so they still
 * look tilted.
 */
function Canvas2DLayer(canvas) {
  this.canvas = canvas;
  this.ctx = canvas.getContext('2d');
  this.width = canvas.width;
  this.height = canvas.height;
  this.mvMatrix = mat4.create();
  this.pMatrix = mat4.create();
  this.mvpMatrix = mat4.create();

  // used by drawOneTexture, same as Layer.
  this.vArray = this.createFloatArray(12);
  this.cArray = this.createFloatArray(8);
  this.iArray = this.createUintArray(6);
  this.aArray = this.createFloatArray(16);
  this.vBuffer = this.createBuffer();
  this.cBuffer = this.createBuffer();
  this.iBuffer = this.createBuffer();
  this.aBuffer = this.createBuffer();

  this._clipPoints = [[0, 0, 0, 1], [0, 0, 0, 1], [0, 0, 0, 1], [0, 0, 0, 1]];
  this._screenPoints = [[0, 0], [0, 0], [0, 0], [0, 0]];
  this._texPoints = [[0, 0], [0, 0], [0, 0], [0, 0]];
  this._stripVertices = [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]];
  this._stripCoords = [[0, 0], [0, 0], [0, 0], [0, 0]];
  this._vec = [0, 0, 0, 1];
  this._edgePoint = [0, 0, 0, 1];
}

Canvas2DLayer.prototype.mat4 = mat4;

Canvas2DLayer.prototype._BLEND_ALPHA     = 0;
Canvas2DLayer.prototype._BLEND_ALPHA2    = 1;
Canvas2DLayer.prototype._BLEND_ADD_ALPHA = 2;

Canvas2DLayer.prototype._STRIP_PIXELS = 6;
Canvas2DLayer.prototype._NEAR_W = 0.1;


/**
 * Static. Returns a WebGL Layer when the browser can do WebGL, otherwise a
 * Canvas2DLayer. Adding ?canvas2d to the page URL forces the 2D one.
 */
Canvas2DLayer.pickLayer = function(canvas) {
  var force2D = window.location.search.indexOf('canvas2d') >= 0;
  if(! force2D) {
    var names = Layer.prototype._NAMES;
    for(var i = 0; i < names.length; i++) {
      var context = null;
      try {
        context = canvas.getContext(names[i]);
      } catch(e) {
        context = null;
      }
      if(context)
        return new Layer(canvas);
    }
  }
  return new Canvas2DLayer(canvas);
};


Canvas2DLayer.prototype.viewport = function() {
};


Canvas2DLayer.prototype.clear = function() {
  var ctx = this.ctx;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1.0;
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = 'rgb(0, 0, 0)';
  ctx.fillRect(0, 0, this.width, this.height);
};


Canvas2DLayer.prototype.perspective = function(theta, near, far) {
  this.mat4.perspective(theta, this.width / this.height, near, far,
                        this.pMatrix);
};


Canvas2DLayer.prototype.ortho = function(near, far) {
  this.mat4.ortho(0, this.width, -this.height, 0, near, far, this.pMatrix);
};


Canvas2DLayer.prototype.lookAt = function(eye, center, up) {
  this.mat4.lookAt(eye, center, up, this.mvMatrix);
};


Canvas2DLayer.prototype.identity = function() {
  this.mat4.identity(this.mvMatrix);
};


Canvas2DLayer.prototype.generateTexture = function(image) {
  return {image: image, imageWidth: image.width, imageHeight: image.height,
          pattern: null};
};


Canvas2DLayer.prototype.createBuffer = function() {
  return {data: null, itemSize: 0, numItems: 0};
};


Canvas2DLayer.prototype.pourArrayBuffer = function(buffer, array, itemSize,
                                                   numItems) {
  buffer.data = array;
  buffer.itemSize = itemSize;
  buffer.numItems = numItems;
};


Canvas2DLayer.prototype.pourElementArrayBuffer =
  Canvas2DLayer.prototype.pourArrayBuffer;


Canvas2DLayer.prototype.createFloatArray = function(num) {
  return new Float32Array(num);
};


Canvas2DLayer.prototype.createUintArray = function(num) {
  return new Uint16Array(num);
};


Canvas2DLayer.prototype.drawOneTexture = Layer.prototype.drawOneTexture;
Canvas2DLayer.prototype.calculateSquareValue =
  Layer.prototype.calculateSquareValue;


Canvas2DLayer.prototype._project = function(x, y, z, out) {
  var v = this._vec;
  v[0] = x;
  v[1] = y;
  v[2] = z;
  v[3] = 1.0;
  this.mat4.multiplyVec4(this.mvpMatrix, v, out);
  return out;
};


Canvas2DLayer.prototype.draw = function(texture, vBuffer, cBuffer, iBuffer,
                                        aBuffer, blend) {
  if(! texture || ! texture.image || ! vBuffer.data)
    return;

  this.mat4.multiply(this.pMatrix, this.mvMatrix, this.mvpMatrix);

  var ctx = this.ctx;
  ctx.save();
  ctx.globalCompositeOperation =
    (blend == this._BLEND_ADD_ALPHA) ? 'lighter' : 'source-over';

  var vData = vBuffer.data;
  var cData = cBuffer.data;
  var aData = aBuffer.data;
  var quads = Math.floor(vBuffer.numItems / 4);
  var clip = this._clipPoints;

  for(var q = 0; q < quads; q++) {
    var vb = q * 12;
    var cb = q * 8;
    var ab = q * 16;
    var alpha = aData[ab + 3];
    if(alpha <= 0.0)
      continue;
    var dark = aData[ab];

    var behind = false;
    for(var k = 0; k < 4; k++) {
      this._project(vData[vb + k * 3], vData[vb + k * 3 + 1],
                    vData[vb + k * 3 + 2], clip[k]);
      if(clip[k][3] <= 0.0001)
        behind = true;
    }
    var wSpread = Math.abs(clip[0][3] - clip[3][3]) +
                  Math.abs(clip[1][3] - clip[2][3]);
    // a quad partly behind the camera (the floor) is drawn as strips and
    // only the strips in front of the camera are kept
    if(behind || wSpread > Math.abs(clip[0][3]) * 0.02) {
      this._drawStrips(texture, vData, cData, vb, cb, alpha, dark);
    } else {
      this._fillScreenPoints(clip);
      this._fillTexPoints(texture, cData, cb);
      this._drawPiece(texture, this._screenPoints, this._texPoints,
                      alpha, dark);
    }
  }

  ctx.restore();
};


/**
 * cuts a perspective quad along its 0-3 and 1-2 edges so each strip is
 * close enough to flat for an affine transform. the part closer than the
 * near plane is cut off, and strips are spaced evenly on screen rather than
 * in the world, so the close end doesn't smear.
 */
Canvas2DLayer.prototype._drawStrips = function(texture, vData, cData, vb, cb,
                                               alpha, dark) {
  var sv = this._stripVertices;
  var sc = this._stripCoords;
  var clip = this._clipPoints;
  var near = this._NEAR_W;

  // w changes linearly along each edge, so find the t range in front of
  // the near plane on both edges
  var wA0 = clip[0][3];
  var wA3 = clip[3][3];
  var wB1 = clip[1][3];
  var wB2 = clip[2][3];
  var tLo = 0.0;
  var tHi = 1.0;
  var edges = [[wA0, wA3], [wB1, wB2]];
  for(var e = 0; e < 2; e++) {
    var w0 = edges[e][0];
    var w1 = edges[e][1];
    if(w0 < near && w1 < near)
      return;
    if(w0 < near)
      tLo = Math.max(tLo, (near - w0) / (w1 - w0));
    if(w1 < near)
      tHi = Math.min(tHi, (near - w0) / (w1 - w0));
  }
  if(tHi <= tLo)
    return;

  // walk the edge with an adaptive step so each strip is a few screen
  // pixels tall, skipping the parts off the top or bottom of the screen
  var pixels = this._STRIP_PIXELS;
  var stepT = (tHi - tLo) / 64;
  var lastT = tLo;
  var lastY = this._edgeScreenY(vData, vb, lastT);
  var guard = 0;
  while(lastT < tHi && guard < 4000) {
    guard++;
    var t = Math.min(tHi, lastT + stepT);
    var y = this._edgeScreenY(vData, vb, t);
    var offScreen = (y < 0 && lastY < 0) ||
                    (y > this.height && lastY > this.height);
    var dy = Math.abs(y - lastY);
    if(! offScreen && dy > pixels * 2 && stepT > 0.0000001) {
      stepT = stepT / 2;
      continue;
    }
    if(dy < pixels / 2)
      stepT = stepT * 2;

    var ta = lastT;
    // overlap the next strip by about 1.5 pixels to hide seams
    var tb = Math.min(tHi, t + (t - lastT) * Math.min(1.0, 1.5 / Math.max(dy, 0.5)));
    lastT = t;
    lastY = y;
    if(offScreen)
      continue;

    this._lerpCorner(vData, cData, vb, cb, 0, 3, ta, sv[0], sc[0]);
    this._lerpCorner(vData, cData, vb, cb, 1, 2, ta, sv[1], sc[1]);
    this._lerpCorner(vData, cData, vb, cb, 1, 2, tb, sv[2], sc[2]);
    this._lerpCorner(vData, cData, vb, cb, 0, 3, tb, sv[3], sc[3]);

    var behind = false;
    for(var k = 0; k < 4; k++) {
      this._project(sv[k][0], sv[k][1], sv[k][2], clip[k]);
      if(clip[k][3] <= 0.0001)
        behind = true;
    }
    if(behind)
      continue;

    this._fillScreenPoints(clip);
    for(var j = 0; j < 4; j++) {
      this._texPoints[j][0] = sc[j][0] * texture.imageWidth;
      this._texPoints[j][1] = sc[j][1] * texture.imageHeight;
    }
    this._drawPiece(texture, this._screenPoints, this._texPoints, alpha, dark);
  }
};


Canvas2DLayer.prototype._edgeScreenY = function(vData, vb, t) {
  var out = this._edgePoint;
  var x = vData[vb] + (vData[vb + 9] - vData[vb]) * t;
  var y = vData[vb + 1] + (vData[vb + 10] - vData[vb + 1]) * t;
  var z = vData[vb + 2] + (vData[vb + 11] - vData[vb + 2]) * t;
  this._project(x, y, z, out);
  return (1.0 - out[1] / out[3]) * 0.5 * this.height;
};


Canvas2DLayer.prototype._lerpCorner = function(vData, cData, vb, cb, from, to,
                                               t, outVertex, outCoord) {
  for(var i = 0; i < 3; i++) {
    var a = vData[vb + from * 3 + i];
    outVertex[i] = a + (vData[vb + to * 3 + i] - a) * t;
  }
  for(var j = 0; j < 2; j++) {
    var b = cData[cb + from * 2 + j];
    outCoord[j] = b + (cData[cb + to * 2 + j] - b) * t;
  }
};


Canvas2DLayer.prototype._fillScreenPoints = function(clip) {
  for(var k = 0; k < 4; k++) {
    var w = clip[k][3];
    this._screenPoints[k][0] = (clip[k][0] / w + 1.0) * 0.5 * this.width;
    this._screenPoints[k][1] = (1.0 - clip[k][1] / w) * 0.5 * this.height;
  }
};


Canvas2DLayer.prototype._fillTexPoints = function(texture, cData, cb) {
  for(var k = 0; k < 4; k++) {
    this._texPoints[k][0] = cData[cb + k * 2] * texture.imageWidth;
    this._texPoints[k][1] = cData[cb + k * 2 + 1] * texture.imageHeight;
  }
};


/**
 * maps texture pixels onto the screen quad using corners 0, 1 and 3.
 */
Canvas2DLayer.prototype._drawPiece = function(texture, p, t, alpha, dark) {
  var du1 = t[1][0] - t[0][0];
  var dv1 = t[1][1] - t[0][1];
  var du3 = t[3][0] - t[0][0];
  var dv3 = t[3][1] - t[0][1];
  var det = du1 * dv3 - du3 * dv1;
  if(Math.abs(det) < 0.000001)
    return;

  var dx1 = p[1][0] - p[0][0];
  var dy1 = p[1][1] - p[0][1];
  var dx3 = p[3][0] - p[0][0];
  var dy3 = p[3][1] - p[0][1];

  var ma = (dx1 * dv3 - dx3 * dv1) / det;
  var mb = (dy1 * dv3 - dy3 * dv1) / det;
  var mc = (dx3 * du1 - dx1 * du3) / det;
  var md = (dy3 * du1 - dy1 * du3) / det;
  var me = p[0][0] - ma * t[0][0] - mc * t[0][1];
  var mf = p[0][1] - mb * t[0][0] - md * t[0][1];

  var uMin = Math.min(t[0][0], t[1][0], t[2][0], t[3][0]);
  var uMax = Math.max(t[0][0], t[1][0], t[2][0], t[3][0]);
  var vMin = Math.min(t[0][1], t[1][1], t[2][1], t[3][1]);
  var vMax = Math.max(t[0][1], t[1][1], t[2][1], t[3][1]);
  if(uMax - uMin < 0.01 || vMax - vMin < 0.01)
    return;

  var ctx = this.ctx;
  ctx.setTransform(ma, mb, mc, md, me, mf);
  ctx.globalAlpha = Math.min(1.0, alpha);

  var fitsImage = uMin >= -0.5 && vMin >= -0.5 &&
                  uMax <= texture.imageWidth + 0.5 &&
                  vMax <= texture.imageHeight + 0.5;
  if(fitsImage) {
    var sx = Math.max(0, uMin);
    var sy = Math.max(0, vMin);
    var sw = Math.min(texture.imageWidth, uMax) - sx;
    var sh = Math.min(texture.imageHeight, vMax) - sy;
    if(sw <= 0 || sh <= 0)
      return;
    ctx.drawImage(texture.image, sx, sy, sw, sh, sx, sy, sw, sh);
  } else {
    // uv outside the image means the texture repeats (scrolling floor)
    if(! texture.pattern)
      texture.pattern = ctx.createPattern(texture.image, 'repeat');
    ctx.fillStyle = texture.pattern;
    ctx.fillRect(uMin, vMin, uMax - uMin, vMax - vMin);
  }

  if(dark < 0.99 && ctx.globalCompositeOperation == 'source-over') {
    ctx.globalAlpha = Math.min(1.0, alpha) * (1.0 - Math.max(0.0, dark));
    ctx.fillStyle = 'rgb(0, 0, 0)';
    ctx.fillRect(uMin, vMin, uMax - uMin, vMax - vMin);
  }
};
