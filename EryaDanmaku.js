function addStyle(url) {
  var container = document.getElementsByTagName("head")[0];
  var style = document.createElement("link");
  style.rel = "stylesheet";
  style.type = "text/css";
  //style.media = "screen";
  style.href = url;
  container.appendChild(style);
}

function addScript(url) {
  var container = document.getElementsByTagName("head")[0];
  var script = document.createElement('script');
  script.src = url;
  script.type = "text/javascript";
  container.appendChild(script);
}

addScript("https://cn.avoscloud.com/scripts/lib/av-0.3.4.min.js");

/* CommentCoreLibrary (//github.com/jabbany/CommentCoreLibrary) - Licensed under the MIT License */
addScript("https://rawgit.com/jabbany/CommentCoreLibrary/master/build/CommentCoreLibrary.js");
addStyle("https://rawgit.com/jabbany/CommentCoreLibrary/master/build/style.css");

addScript("https://rawgit.com/SUSTC/EryaDanmaku/master/ColorPicker.js");
addScript("https://rawgit.com/SUSTC/EryaDanmaku/master/Danmaku.js");
addStyle("https://cdn.rawgit.com/SUSTC/EryaDanmaku/master/ui.css");

window.onblur = function () {};
$('#eryaPlayer').prepend('<div class="erya-danmaku abp" id="player">'
        + '<div id="c-region" style="display:none;">640x480</div>'
        + '<div id="commentCanvas" class="container"></div>'
        + '</div>');
$('#eryaPlayer').append(
'<div class="danmakubar">' +
'  <label>弹幕:</label>' +
'  <div class="lefttools"><div class="color_select" id="danmaku-fontcolor" title="文字颜色"></div></div>' +
'  <select id="danmaku-fontsize">' +
'      <option value="12">非常小</option>' +
'      <option value="16">特小</option>' +
'      <option value="18">小</option>' +
'      <option value="25" selected>中</option>' +
'      <option value="36">大</option>' +
'      <option value="45">很大</option>' +
'      <option value="64">特别大</option>' +
'  </select>' +
'  <select id="danmaku-mode">' +
'      <option value="1" selected>顶端滚动</option>' +
'      <option value="4">底端渐隐</option>' +
'      <option value="5">顶端渐隐</option>' +
'      <option value="6">逆向弹幕</option>' +
'  </select>' +
'  <input id="id_danmaku" type="text" onkeydown="if(event.keyCode==13) danmaku.post();" />' +
'  <input id="danmaku-post" type="button" class="btn btn-small" value="发送" onclick="danmaku.post()" />' +
'  <input id="danmaku-hide" type="button" class="btn btn-small" value="隐藏弹幕" onclick="danmaku.dohide()" />' +
'  <input id="gal-auto" type="button" class="btn btn-small" value="自动" onclick="gal.doauto(this)" />' +
'  <li id="danmaku-tips"></li>' +
'</div>');

/***********************
* XMLParser
* Licensed Under the MIT License
* Copyright (c) 2012 Jim Chen ( CQZ, Jabbany )
************************/
function CommentLoader(url,xcm,mode){
  if(mode == null)
    mode = 'bilibili';
  if (window.XMLHttpRequest){
    xmlhttp=new XMLHttpRequest();
  }
  else{
    xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
  }
  xmlhttp.open("GET",url,true);
  xmlhttp.send();
  var cm = xcm;
  xmlhttp.onreadystatechange = function(){
    if (xmlhttp.readyState==4 && xmlhttp.status==200){
      if(mode == 'bilibili'){
        if(navigator.appName == 'Microsoft Internet Explorer'){
          var f = new ActiveXObject("Microsoft.XMLDOM");
          f.async = false;
          f.loadXML(xmlhttp.responseText);
          cm.load(BilibiliParser(f, xmlhttp.responseText));
        }else{
          cm.load(BilibiliParser(xmlhttp.responseXML, xmlhttp.responseText));
        }
      }else if(mode == 'acfun'){
        cm.load(AcfunParser(xmlhttp.responseText));
      }
    }
  }
}

var EryaDanmaku = function() {
  var danmaku = {};
  var flashVars = $("#eryaPlayer").getPlayer().children.namedItem("flashvars").value;
  var conf = JSON.parse(unescape(flashVars.split("&")[3]).substr(6));
  var videoId = conf.currVideoInfo.videoId;
  var episodeID = cur_video;
  danmaku.flashVars = conf;

  danmaku.setEpisode = function(id) {
    episodeID = id;
  };

  //Global Hook
  var goPlay_orig = goPlay;
  goPlay = function(seriNum) {
    goPlay_orig(seriNum);
    danmaku.setEpisode(cur_video);
  };

  var danmakuStage = $('#commentCanvas');
  
  danmaku.stage = danmakuStage;
  danmaku.toolbar = $('.danmakubar');
  danmaku.colorpicker = new ColorPicker(this, this.toolbar.find(".color_select"));

  var cm = new CommentManager(danmakuStage[0]);
  cm.init();

  var tmr=0;
  var start=0;
  var playhead = 0;

  function load(dmf,dmfmd){
    if(dmfmd == null)
      dmfmd = 'bilibili';
    cm.clear();
    start = 0;
    try{
      clearTimeout(tmr);
    }catch(e){}
    CommentLoader(dmf,cm,dmfmd);
    cm.startTimer();
    start = new Date().getTime();
    tmr = setInterval(function(){
      playhead = new Date().getTime() - start;
      cm.time(playhead);
    },10);
  }
  function stop(){
    cm.stopTimer();
    if(cm.scripting){
      cm.scripting.send("Update:TimeUpdate",{
        "state":"pause",
        "time":playhead
      });
    }
    clearTimeout(tmr);
  }
  function resume(){
    cm.startTimer();
    start = new Date().getTime() - playhead;
    var lasthead = playhead;
    tmr = setInterval(function(){
      playhead = new Date().getTime() - start;
      cm.time(playhead);
      if(cm.scripting && playhead - lasthead > 300 ){
        cm.scripting.send("Update:TimeUpdate",{
          "state":"pause",
          "time":playhead
        });
        lasthead = playhead;
      }
    },10);
  }

  danmaku.time = function (t) {
    stop();
    playhead = t * 1000;
    cm.time(playhead);
    resume();
  };

  danmaku.load = load;
  danmaku.stop = stop;
  danmaku.resume = resume;

  //Constructed
  return danmaku;
};


var danmaku = new Danmaku($('#eryaPlayer'), $('.danmakubar'));

//defer(EryaDanmaku);
function initDanmaku() {
  //初始化 AVOS Cloud
  AV.initialize("9bfuau87qmvf42xobes7vg7f16kikk1gpgisvb36225mfwld", "1ah2yr74jdwksdep2i4wq0gy18sg01lkqt40epeuqhkde3kv");
  var av_danmaku = AV.Object.extend("danmaku");
  var query = new AV.Query(av_danmaku);
  query.find({
    success: function (results) {
      console.log(results);
    },
    error: function (error) {
      alert("Error: " + error.code + " " + error.message);
    }
  });

  danmaku = new EryaDanmaku();
  danmaku.load('http://comment.bilibili.com/1971287.xml');

  var elplayer = $('#eryaPlayer');
  var player = elplayer.getPlayer();
  //player.getPlaySecond();
  //player.playMovie();

  function checkPlayState() {
    var playState = player.getPlayState();
    if (playState == 2) {
      danmaku.stop();
    } else if (playState == 1) {
      danmaku.time(player.getPlaySecond());
    }
  }
  checkPlayState();

  elplayer.bind('onPlay', function (e, proTime) {
    danmaku.time(proTime);
  });
  elplayer.bind('onPause', function (e, proTime) {
    danmaku.stop();
  });
  elplayer.bind('onMovieDrag', function (e, startTime, endTime, data) {
    danmaku.time(endTime);
    checkPlayState();
  });
  elplayer.bind('onStart', function (e, index, data) {
    danmaku.time(0);
    checkPlayState();
  });
}

setTimeout(initDanmaku, 5000);
