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

window.onblur = function () {};
$('#eryaPlayer').prepend('<div class="erya abp" id="player" style="position:absolute;top:0;width:841px;height:480px;">'
        + '<div id="c-region" style="display:none;">640x480</div>'
        + '<div id="commentCanvas" class="container"></div>'
        + '</div>');

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

function defer(a) {
  ((window.$) && CommentManager) ? a(): setTimeout(function() {
    defer(a)
  }, 50)
}

//player.getPlaySecond();
//player.playMovie();

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

  var cm = new CommentManager($('#commentCanvas')[0]);
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

//defer(EryaDanmaku);
function initDanmaku() {
  var danmaku = new EryaDanmaku();
  danmaku.load('http://comment.bilibili.com/1971287.xml');

  var elplayer = $('#eryaPlayer');
  //var player = elplayer.getPlayer();
  function checkPlayState() {
    var playState = elplayer.getPlayState();
    if (playState == 2) {
      danmaku.stop();
    } else if (playState == 1) {
      danmaku.time(elplayer.getPlaySecond());
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
