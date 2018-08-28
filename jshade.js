

window.onload = init;
//window.onerror = catchError;
//window.onresize = resize;
var resolution = 2, quality = 3, res;
var shade;
var renderCanvas, renderContext;
var editor, fps, error;
var pixelSize, timeStart, frameId, fpsT, alpha, px;
var r,g,b,a,t,f;

function init() {
  r = g = b = t = f = fpsT = 0;
  a = 1;
  boxys.init();
  timeStart = new Date().getTime();
  var code = document.getElementById("code");
  error = document.getElementById("error");
  fps = document.getElementById("fps");
  editor = CodeMirror(code, {mode: "javascript", lineNumbers: true, viewPortMargin: Infinity, pollInterval: 1000, workTime: 500, workDelay: 500});
  editor.on("change", updateCode);
  resize();
  newJShader();
  updateCode();
  render();
}

function resize() {
    var renderSize = document.getElementById("render").clientHeight / quality;
    res = renderSize / resolution;
    renderCanvas = document.getElementById("canvas");
    renderCanvas.width = renderSize+1;
    renderCanvas.height = renderSize+1;
    renderCanvas.style.transformOrigin = "top left";
    renderCanvas.style.transform = "scale("+quality+")";
    renderContext = renderCanvas.getContext("2d", {antialias: false});
    renderContext.imageSmoothingEnabled = false;
    pixelSize = renderSize / res;
    px = ~~pixelSize;
}


function newJShader() {
  var demo = "// You have x, y, t. Set r, g, b, a.\nr = 0.5 + 0.5 * Math.cos(x + t);\ng = 0.5 + 0.5 * Math.cos(y + t + 2);\nb = 0.5 + 0.5 * Math.cos(x + t + 4);a=0.5;";
  demo=shade2.toString();
  demo = demo.slice(demo.indexOf("{") + 1, demo.lastIndexOf("}"));
  editor.setValue(demo);
}

function getErrors() {
  JSHINT("/* globals x:true, y:true, t:true, r:true, g:true, b:true, a:true */" + editor.getValue(), {undef: true, globals: true});
  return JSHINT.errors;
}

function catchErrors(e)
{
  console.clear();
  console.log(e);
  error.innerHTML += "<div class='errorMessage'>" + e.stack + "</div>";
  r = g = b = t = f = 0;
  a = 1;
  cancelAnimationFrame(frameId);
  shade = function(){a=.5;r=1;g=b=0;};
  render();
}

function updateCode() {
  var newCode = editor.getValue();
  error.innerHTML = "";
  var noErrors = true;
  try {
    eval("var x,y,t,r,g,b,a;"+newCode);
  } catch (e) {
    noErrors = false;
    catchErrors(e);
  }
  if (noErrors) {
    shade = new Function("x", "y", "t", newCode);
  }
}

function render() {
  renderContext.clearRect(0, 0, renderCanvas.width, renderCanvas.height);
  t = (new Date().getTime() - timeStart) / 1000;
  for (var y = 0; y < res; y++) {
    var y1 = y / res;
    var y2 = ~~(y * pixelSize);
    for (var x = 0; x < res; x++) {
      shade(x/res, y1, t);
      r *= 255; g *= 255; b *= 255;
      //renderContext.fillStyle = "rgba(" + r + "," + g + "," + b + "," + a + ")";
      renderContext.fillStyle = "rgba(" + ~~r + "," + ~~g + "," + ~~b + "," + a + ")";
      renderContext.fillRect(~~(x*pixelSize), y2, px, px);
    }
  }
  f++;
  if (f%30==0) {
    fps.innerHTML = (1 / (t-fpsT) * 30).toFixed(1);
    fpsT = t;
  }
  frameId = requestAnimationFrame(render);
}




function shade2(x , y, t) {
  // You have x, y, t. Set r, g, b. Good luck.
  // You have x, y, t. Set r, g, b.
  t *= 4;
  x -= 0.5;
  y -= 0.5;
  var m = Math.sqrt(x*x+y*y);
  rotate(t);
  var cc1 = loader(x,y,0.45);
  var cc3 = loader(y,x,0.25);
  rotate(-t*2);
  var cc2 = loader(x,y,0.35);
  var cc4 = loader(y,x,0.15);
  var cc2 = Math.max(cc2,cc4);
  r = Math.max(cc3, Math.max(cc1,cc2));
  g = cc2;
  b = cc2;
  a = r;

  function rotate(a) {
      var cos = Math.cos(a);
      var sin = Math.sin(a);
      var x2 = x * cos - y * sin;
      y = y * cos + x * sin;
      x = x2;
  }

  function loader(x, y, rad) {
      var m1 = m-rad;
      var m2 = m1+0.05;
      var c1 = Math.max(0, 0.01 - m1)/0.01;
      var c2 = Math.max(0, 0.01 - m2)/0.01;
      var l = Math.max(0, 0.01 - Math.abs(x) + Math.abs(y*0.5)) / 0.01;
      var c = 1-Math.max(1-c1,c2);
      c = 1-Math.max(1-c1,l+c2);
      return c;
  }
}
