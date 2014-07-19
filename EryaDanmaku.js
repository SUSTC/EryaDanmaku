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

if (!(Danmaku in window)) {

    addScript("https://cn.avoscloud.com/scripts/lib/av-0.3.4.min.js");

    /* CommentCoreLibrary (//github.com/jabbany/CommentCoreLibrary) - Licensed under the MIT License */
    addScript("https://rawgit.com/jabbany/CommentCoreLibrary/master/build/CommentCoreLibrary.js");
    addStyle("https://rawgit.com/jabbany/CommentCoreLibrary/master/build/style.css");

    /* artDialog */
    addScript("https://rawgit.com/SUSTC/EryaDanmaku/master/jquery.artDialog.min.js");
    addStyle("https://rawgit.com/SUSTC/EryaDanmaku/master/simple.css");

    addScript("https://rawgit.com/SUSTC/EryaDanmaku/master/ColorPicker.js");
    addScript("https://rawgit.com/SUSTC/EryaDanmaku/master/Danmaku.js");
    addStyle("https://rawgit.com/SUSTC/EryaDanmaku/master/ui.css");

    window.onblur = function() {};
    $('#eryaPlayer').prepend('<div class="erya-danmaku abp" id="player">' + '<div id="c-region" style="display:none;">640x480</div>' + '<div id="commentCanvas" class="container"></div>' + '</div>');
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
        '  <li id="danmaku-tips"></li>' +
        '</div>');

    var danmaku = null;

    var EryaDanmaku = function(danmaku) {
        //var flashVars = $("#eryaPlayer").getPlayer().children.namedItem("flashvars").value;
        //var conf = JSON.parse(unescape(flashVars.split("&")[3]).substr(6));
        //var videoId = conf.currVideoInfo.videoId;
        //var flashVars = conf;

        var episodeId = cur_video;

        var eryadanmaku = {
            episodeId: episodeId
        };

        eryadanmaku.setEpisode = function(id, callback) {
            danmaku.stop();

            var videoId = $("#videoId").val();
            this.videoId = videoId;
            this.episodeId = id;

            danmaku.load(videoId, callback);
        };

        //Constructed
        return eryadanmaku;
    };

    function AVOSParser(results) {
        var data = [];
        for (var i = 0; i < results.length; i++) {
            var object = results[i];
            var color = '#' + parseInt(object.get('color')).toString(16);
            data[i] = {
                'text': object.get('text'),
                'mode': object.get('mode'),
                'stime': object.get('stime'),
                'size': object.get('size'),
                'color': color
            };
        }
        return data;
    }

    //defer(EryaDanmaku);
    function initDanmaku() {
        //初始化 AVOS Cloud
        AV.initialize("9bfuau87qmvf42xobes7vg7f16kikk1gpgisvb36225mfwld", "1ah2yr74jdwksdep2i4wq0gy18sg01lkqt40epeuqhkde3kv");

        var elplayer = $('#eryaPlayer');
        var player = elplayer.getPlayer();
        //player.getPlaySecond();
        //player.playMovie();

        var avDanmaku = AV.Object.extend("danmaku");

        Danmaku.prototype.loader = function(videoId, callback) {
            //reload
            var that = this;
            var query = new AV.Query(avDanmaku);
            query.equalTo("videoId", videoId);
            console.log('videoId', videoId);
            query.find({
                success: function(results) {
                    that.cm.load(AVOSParser(results));
                    callback();
                },
                error: function(err) {
                    callback(err);
                }
            });
        };

        Danmaku.prototype.postdata = function(data) {
            var that = this;
            var av_danmaku = new avDanmaku();
            data.videoId = this.ssid;
            av_danmaku.save(data, {
                success: function(av_danmaku) {
                    that.posttips(true);
                },
                error: function(av_danmaku, err) {
                    that.posttips(false);
                }
            });
        };

        danmaku = new Danmaku($('#eryaPlayer'), $('.danmakubar'), function() {
            return player.getPlaySecond() * 1000;
        });

        var edanmaku = EryaDanmaku(danmaku);

        function checkPlayState(err) {
            if (err) {
                return;
            }
            var playState = player.getPlayState();
            if (playState == 2) {
                danmaku.stop();
            } else if (playState == 1) {
                danmaku.resume();
            }
        }

        elplayer.bind('onPlay', function(e, proTime) {
            danmaku.resume();
        });
        elplayer.bind('onPause', function(e, proTime) {
            danmaku.stop();
        });
        elplayer.bind('onMovieDrag', function(e, startTime, endTime, data) {
            checkPlayState();
        });
        elplayer.bind('onStart', function(e, index, data) {
            edanmaku.setEpisode(index, checkPlayState);
        });

        edanmaku.setEpisode(currIndex, checkPlayState);
    }

    setTimeout(initDanmaku, 5000);

}
