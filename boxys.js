var boxys = new Boxys();

function Boxys() {
  var self = this;
  self.isDown = false;
  self.offset = {};
  self.clickedBoxy = null;
  self.clickedTopBar = null;
  self.clickedBottomBar = null;
  self.lastZindex = 0;
  self.init = function() {
    window.addEventListener("mouseup", self.drop);
    var elements = document.body.querySelectorAll(".boxy");
    var newBoxys = [];
    for (var i = 0; i < elements.length; i++) {
      newBoxys.push(self.getBoxy(elements[i]));
    }
    newBoxys.forEach(function(e){
      e.childNodes[1].style.margin = "0";
      document.body.appendChild(e);
    });
    elements.forEach(function(e){
      e.parentNode.removeChild(e);
    });
  }
  self.getBoxy = function(element) {

    var boxyId = "boxy-" + element.id;
    var iconDiv = "<div class='boxy-icon' style='right:10px;top:-4px;'>"
    var title = element.getAttribute("title") || "";
    var status = element.getAttribute("status") || "";

    var topBar = document.createElement("div");
    topBar.className = "boxy-top-bar"
    topBar.style.width = element.offsetWidth + "px";
    topBar.style.height = "20px";
    topBar.setAttribute("boxy-id", boxyId);
    topBar.addEventListener("mousedown", self.drag);
    topBar.innerHTML = "<div class='boxy-title'>" + title + "</div>";
    topBar.innerHTML += iconDiv + "\u2194</div>"
    topBar.innerHTML += iconDiv + "\u2195</div>"

    var bottomBar = document.createElement("div");
    bottomBar.className = "boxy-bottom-bar";
    bottomBar.style.width = element.offsetWidth + "px";
    bottomBar.style.height = "20px";
    bottomBar.setAttribute("boxy-id", boxyId);
    bottomBar.addEventListener("mousedown", self.drag);
    bottomBar.innerHTML = "<div class='boxy-status'>" + status + "</div>";
    bottomBar.innerHTML += iconDiv + "\u2195</div>";

    var boxy = document.createElement("div");
    boxy.id = boxyId;
    boxy.style.position = "fixed";
    boxy.style.boxShadow = "0 0px 10px rgba(0,0,0,.5)";
    boxy.style.width = element.offsetWidth + "px";
    boxy.style.left = element.offsetLeft + "px";
    boxy.style.top = element.offsetTop + "px";
    boxy.style.overflow = "hidden";
    boxy.appendChild(topBar);
    boxy.appendChild(element.cloneNode(true));
    boxy.appendChild(bottomBar);
    return boxy;
  }
  self.title = function(title, id) {
    var boxy = document.getElementById("boxy-"+id);
    boxy.firstChild.firstChild.innerHTML = title;
  }
  self.status = function(status, id) {
    var boxy = document.getElementById("boxy-"+id);
    boxy.lastChild.firstChild.innerHTML = status;
  }
  self.drag = function(ev) {
    var move = ev.target.className == "boxy-top-bar";
    //move=1.;
    self.clickedBoxy = document.getElementById(ev.target.getAttribute("boxy-id"));
    self.lastZindex += 5;
    self.clickedBoxy.style.zIndex = self.lastZindex;
    self.isDown = true;
    offset = {
        x: self.clickedBoxy.offsetLeft - ev.clientX,
        y: move ? self.clickedBoxy.offsetTop - ev.clientY : ev.clientY,
        scale: self.clickedBoxy.getBoundingClientRect().width / self.clickedBoxy.offsetWidth
    };
    window.onmousemove = move ? self.move : self.scale;
    document.querySelectorAll("body").forEach(function(e){e.style.pointerEvents = "none";});
  }
  self.move = function(ev) {
    ev.preventDefault();
    if (self.isDown) {
        self.clickedBoxy.style.left = (ev.clientX + offset.x) + 'px';
        self.clickedBoxy.style.top  = (ev.clientY + offset.y) + 'px';
    }
  }
  self.scale = function(ev) {
    ev.preventDefault();
    if (self.isDown) {
      var newScale = Math.min(3,Math.max(.5, offset.scale + (ev.clientY - offset.y)/self.clickedBoxy.offsetHeight));
      self.clickedBoxy.style.transform = "scale(" + newScale + ")";
      self.clickedBoxy.style.borderRadius = 10/newScale + "px";
      var icons = self.clickedBoxy.querySelectorAll(".boxy-icon");
      for (var i = 0; i < icons.length; i++) {
        icons[i].style.fontSize = 20/newScale + "px";
        icons[i].style.top = -4/newScale + "px";
        icons[i].style.right = 10/newScale + "px";
      }
      var topBar = self.clickedBoxy.querySelector(".boxy-top-bar");
      var bottomBar = self.clickedBoxy.querySelector(".boxy-bottom-bar");
      topBar.style.height = 20 / newScale + "px";
      topBar.firstChild.style.fontSize = 17/newScale + "px";
      bottomBar.style.height = 20 / newScale + "px";
      bottomBar.firstChild.style.fontSize = 17/newScale + "px";
    }
  }
  self.drop = function (ev) {
    self.isDown = false;
    window.onmousemove = null;
    document.querySelectorAll("body").forEach(function(e){e.style.pointerEvents = "auto";});
  }
}
