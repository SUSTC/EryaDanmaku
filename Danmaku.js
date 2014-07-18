
function Danmaku(stageObject, toolObject, getPlayhead) {
    this.stage = stageObject.find('#commentCanvas');
    this.toolbar = toolObject;

    this.cm = new CommentManager(this.stage[0]);

    this.tmr = 0;
    this.start = 0;
    this.getPlayhead = getPlayhead;
    this.playhead = 0;

    this.colorpicker = new ColorPicker(this, this.toolbar.find(".color_select"));

    this.run = function () {
        this.playhead = this.getPlayhead();
        this.cm.time(this.playhead);
    };

    this.init();
}

Danmaku.prototype.init = function () {

    this.cm.init();

    //filter
    //this.cm.filter.setRuntimeFilter(fefx.center_dim);
    //cm.filter.setRuntimeFilter(fefx.center_speedup);

    this.colorpicker.init();
};

Danmaku.prototype.isshow = function () {
    return (this.stage.css('display') != 'none');
};

Danmaku.prototype.show = function () {
    this.stage.css('display', 'block');
    this.toolbar.find('#danmaku-hide').val('隐藏弹幕');
}

Danmaku.prototype.hide = function () {
    this.stage.css('display', 'none');
    this.toolbar.find('#danmaku-hide').val('显示弹幕');
};

Danmaku.prototype.dohide = function () {
    this.isshow() ? this.hide() : this.show();
};

Danmaku.prototype.postdata = function (cmsenddata) {
    $.ajax({
        type: 'POST',
        url: '/comment.php?mod=danmaku&do=add&ssid=' + this.ssid,
        dataType: 'json',
        data: cmsenddata,
        success: function (msg) {
            if (msg == '0') {
                danmaku.posttips(true);
            } else {
                danmaku.posttips(false);
            }
        },
        error: function () {
            danmaku.posttips(false);
        }
    });
};

Danmaku.prototype.posttips = function (succeed) {
    if (succeed) {
        this.toolbar.find("#danmaku-tips").css('color', '#7BCA1C').fadeIn().text('发送弹幕成功').delay(2000).fadeOut();
    } else {
        this.toolbar.find("#danmaku-tips").css('color', 'red').fadeIn().text('发送弹幕失败').delay(2000).fadeOut();
    }
};

Danmaku.prototype.post = function () {
    var text = this.toolbar.find("#id_danmaku").val();
    if (text != '') {
        this.toolbar.find("#id_danmaku").val('');
        var stime = this.playhead;
        var size = Number(this.toolbar.find("#danmaku-fontsize").val());
        var color = this.toolbar.find(".color_select").css("background-color");
        var mode = Number(this.toolbar.find("#danmaku-mode").val());
        //'alphaFrom':1,'shadow':false,'font':'微软雅黑'
        var cmdata = { 'text': text, 'mode': mode, 'stime': stime, 'size': size, 'color': color, 'border': true };
        this.cm.sendComment(cmdata);

        color = this.colorpicker.color2int(color);
        var cmsenddata = { 'text': text, 'mode': mode, 'stime': stime, 'size': size, 'color': color };
        this.postdata(cmsenddata);
    }
};

Danmaku.prototype.loader = function (ssid, callback) {
    CommentLoader('/comment.php?mod=danmaku&do=get&ssid=' + ssid, this.cm, false, callback);
};

Danmaku.prototype.load = function (ssid, callback) {
    this.ssid = ssid;

    this.cm.clear();
    this.start = 0;

    this.loader(ssid, callback);
};

Danmaku.prototype.play = function () {
    try {
        clearInterval(this.tmr);
    } catch (e) { }

    this.cm.startTimer();
    this.start = new Date().getTime();
    this.tmr = setInterval(function () {
        danmaku.run();
    }, 100);
};

Danmaku.prototype.stop = function () {
    this.cm.stopTimer();
    clearInterval(this.tmr);
};

Danmaku.prototype.resume = function () {
    this.cm.startTimer();
    this.tmr = setInterval(function () {
        danmaku.run();
    }, 100);
};

