

window.onload = init0;
//window.onerror = catchError;
//window.onresize = resize;
var resolution = 2, quality = 3, res;
var shade;
var renderCanvas, renderContext;
var editor, fps, error;
var pixelSize, timeStart, frameId, fpsT, alpha, px;
var r,g,b,a,t,f;
var iframeCode;
var iframeShader;
var fragment;
var compileTimer;
var uniforms=[];
var glslHeader;
var uniformDIV;
var paramsDIV;

function init0() {
  glslHeader=getFileSynch("header.glsl");
  boxys.init();
  iframeShader = document.getElementById("shader");
  iframeCode = document.getElementById("code");
  iframeCode.onload = init;
  var udiv = document.querySelector("#params .uniform");
  uniformDIV = udiv.cloneNode(true);
  paramsDIV = udiv.parentElement;
  loadParams("params1.json");
}


function init() {
  r = g = b = t = f = fpsT = 0;
  a = 1;
  timeStart = new Date().getTime();
  var code = iframeCode.contentDocument.getElementById("codemirror");
  error = document.getElementById("error");
  fps = document.getElementById("fps");
  editor = CodeMirror(code, {mode: "javascript", lineNumbers: true, viewPortMargin: Infinity, pollInterval: 1000, workTime: 500, workDelay: 500});
  editor.on("change", updateCode);
  loadShader("star_a.glsl");
  updateCode();
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
  fragment = shaderHeader();
  fragment += editor.getValue();
  clearTimeout(compileTimer);
  compileTimer = setTimeout(function() {
    iframeShader.contentWindow.location.reload(true);
  }, 1000);
}

function loadShader(url) {
  var glsl = getFileSynch(url);
  editor.setValue(glsl);
}

function getFileSynch(url) {
  var req = new XMLHttpRequest();
  req.open("GET", url+'?_time=' + (new Date()).getTime(), false);
  req.send(null);
  return req.responseText;
};

function shaderHeader(){
  var header=glslHeader;
  uniforms.forEach(function(u) {
    header+="uniform "+u.type+" "+u.name+";\r\n";
  });
  return header;
}

function loadParams(file) {
  uniforms=JSON.parse(getFileSynch(file));
  renderParams();
}

function renderParams() {
  paramsDIV.innerHTML = "";
  uniforms.forEach(function(u) {
    var newUniformDIV = uniformDIV.cloneNode(true);
    newUniformDIV.querySelector(".name").innerHTML = u.name;
    newUniformDIV.querySelector(".type").innerHTML = u.type;
    newUniformDIV.querySelectorAll(".slider").forEach(function(e){
      e.oninput = sliderListener;
    });
    newUniformDIV.querySelector(".lo").oninput = rangeListener;
    newUniformDIV.querySelector(".hi").oninput = rangeListener;
    newUniformDIV.querySelector(".lo").value = u.range[0];
    newUniformDIV.querySelector(".hi").value = u.range[1];
    newUniformDIV.querySelectorAll(".value.big").forEach(function(e){
        e.oninput = valueListener;
    });

    var hideValues = function(dim) {
      newUniformDIV.querySelector(".value."+dim).style.display = "none";
      newUniformDIV.querySelector(".slider."+dim).style.display = "none";
    }
    var setValue = function(dim, value) {
      newUniformDIV.querySelector(".value."+dim).value = value;
    }
    switch (u.type) {
      case "int":
      case "float":
        setValue("x", u.value.x);
        hideValues("y");
        hideValues("z");
        hideValues("w");
        break;
      case "vec2":
        setValue("x", u.value.x);
        setValue("y", u.value.y);
        hideValues("z");
        hideValues("w");
        break;
      case "vec3":
        setValue("x", u.value.x);
        setValue("y", u.value.y);
        setValue("z", u.value.z);
        hideValues("w");
        break;
      case "vec4":
        setValue("x", u.value.x);
        setValue("y", u.value.y);
        setValue("z", u.value.z);
        setValue("w", u.value.w);
        break;
    }
    fireEvent(newUniformDIV.querySelector(".lo"),"input");
    fireEvent(newUniformDIV.querySelector(".hi"),"input");
    newUniformDIV.querySelectorAll(".value.big").forEach(function(e){fireEvent(e, "input");});
    paramsDIV.appendChild(newUniformDIV);
  });
}

function sliderListener(e) {
  var parDIV = e.target.parentElement;
  var cla = e.target.className[e.target.className.length-1];
  parDIV.querySelector(".value."+cla).value = e.target.value;
  updateUniform(parDIV);
}

function rangeListener(e) {
  var parDIV = e.target.parentElement;
  var min = parDIV.querySelector(".lo").value;
  var max = parDIV.querySelector(".hi").value;
  var step = (max-min)/1000.;
  parDIV.querySelectorAll(".slider").forEach(function(e){
    e.min = min;
    e.max = max;
    e.step = step;
  });
  updateUniform(parDIV);
}


function valueListener(e) {
  var parDIV = e.target.parentElement;
  var cla = e.target.className[e.target.className.length-1];
  parDIV.querySelector(".slider."+cla).value=e.target.value;
  updateUniform(parDIV);
}

function updateUniform(parDIV) {
  var uni = uniforms.find(function(u){return u.name == parDIV.querySelector(".name").innerHTML;});
  uni.value.x = parDIV.querySelector(".value.x").value;
  uni.value.y = parDIV.querySelector(".value.y").value;
  uni.value.z = parDIV.querySelector(".value.z").value;
  uni.value.w = parDIV.querySelector(".value.w").value;
}



function fireEvent(node, eventName) {
    // Make sure we use the ownerDocument from the provided node to avoid cross-window problems
    var doc;
    if (node.ownerDocument) {
        doc = node.ownerDocument;
    } else if (node.nodeType == 9) {
        // the node may be the document itself, nodeType 9 = DOCUMENT_NODE
        doc = node;
    } else {
        throw new Error("Invalid node passed to fireEvent: " + node.id);
    }

    if (node.dispatchEvent) {
        // Gecko-style approach (now the standard) takes more work
        var eventClass = "";

        // Different events have different event classes.
        // If this switch statement can't map an eventName to an eventClass,
        // the event firing is going to fail.
        switch (eventName) {
        case "click": // Dispatching of 'click' appears to not work correctly in Safari. Use 'mousedown' or 'mouseup' instead.
        case "mousedown":
        case "mouseup":
            eventClass = "MouseEvents";
            break;

        case "focus":
        case "change":
        case "blur":
        case "select":
        case "input":
            eventClass = "HTMLEvents";
            break;

        default:
            throw "fireEvent: Couldn't find an event class for event '" + eventName + "'.";
            break;
        }
        var event = doc.createEvent(eventClass);

        var bubbles = eventName == "change" || eventName == "input" ? false : true;
        event.initEvent(eventName, bubbles, true); // All events created as bubbling and cancelable.

        event.synthetic = true; // allow detection of synthetic events
        // The second parameter says go ahead with the default action
        node.dispatchEvent(event, true);
    } else if (node.fireEvent) {
        // IE-old school style
        var event = doc.createEventObject();
        event.synthetic = true; // allow detection of synthetic events
        node.fireEvent("on" + eventName, event);
    }
};
