
function ColorPicker(parent, btnObj) {
    this.parent = parent;
    this.button = btnObj;
  
    this.rgb2hex = function (rgb) {
        if (rgb.indexOf("rgb") > -1) {    //IE9,FF,chrome等浏览器的背景颜色值是rgb格式
            var rgbArray = rgb.replace("rgb(", "").replace(")", "").split(",");
            var hexValue = "#";
            for (var i = 0; i < rgbArray.length; i++) {
                hexValue += Math.floor(rgbArray[i] / 16).toString(16) + Math.floor(rgbArray[i] / 16).toString(16);
            }
            return hexValue.toUpperCase();
        } else {  //IE6,7,8中的背景颜色值是16进制值,不需要转换
            return rgb;
        }
    }

    this.color2int = function (rgb) {
        if (rgb.indexOf("rgba") > -1) {
            var rgbArray = rgb.replace("rgba(", "").replace(")", "").split(",");
            var hexValue = "";
            for (var i = 0; i < 3; i++) {
                hexValue += Math.floor(rgbArray[i] / 16).toString(16) + Math.floor(rgbArray[i] / 16).toString(16);
            }
            return parseInt(hexValue.toUpperCase(), 16);
        } else if (rgb.indexOf("rgb") > -1) {
            var rgbArray = rgb.replace("rgb(", "").replace(")", "").split(",");
            var hexValue = "";
            for (var i = 0; i < rgbArray.length; i++) {
                hexValue += Math.floor(rgbArray[i] / 16).toString(16) + Math.floor(rgbArray[i] / 16).toString(16);
            }
            return parseInt(hexValue.toUpperCase(), 16);
        } else {
            return parseInt(rgb, 16);
        }
    }

}


ColorPicker.prototype.init = function () {
    this.parent.toolbar.hover(function () { }, function () {
        $(this).find('.color_select').html('');
    });
    this.button.click(function () {
        danmaku.colorpicker.show();
    });
};

ColorPicker.prototype.setCurrentColor = function (color) {
    var hexcolor = this.rgb2hex(color);
    $("#colorValue").val(hexcolor);
    $("#current_color").css("background-color", hexcolor);
};

ColorPicker.prototype.setColor = function (color) {
    var hexcolor = this.rgb2hex(color);
    this.button.css("background-color", hexcolor);
};

ColorPicker.prototype.hide = function () {
    this.button.html('');
};

ColorPicker.prototype.show = function () {
    var cStart = 0;
    var shtml = "";
    shtml += '<div id="color_container"><input type="text" value="" id="current_color" /><input type="text" value="" id="colorValue" /><br/>';

    for (var r = cStart; r < 16; r += 3) {
        for (var g = cStart; g < 16; g += 3) {
            for (var n = cStart; n < 16; n += 3) {
                shtml += "<span class='color_picker' style='background-color:#" + r.toString(16) + r.toString(16) + g.toString(16)
                    + g.toString(16) + n.toString(16) + n.toString(16) + "'></span>";
            }
        }
        shtml += "<br />"
    }
    shtml += "</div>";

    //color_select dlg
    $.dialog({
        id: 'Color',
        //fixed: true,
        //lock: true,
        follow: this.button.get(0), //document.getElementById('danmaku-fontcolor'),
        content: '<div class="tips">请选择一种颜色</div>' + shtml,
        title: '请选择一种颜色',
        initialize: function () {
            var objcontainer = $('#color_container');
            var objspan = objcontainer.find('span');
            var dlg = this;
            objspan.hover(function () {
                danmaku.colorpicker.setCurrentColor(this.style.backgroundColor);
            }, function () { });
            objspan.click(function () {
                danmaku.colorpicker.setColor(this.style.backgroundColor);
                dlg.close();
            });
            objcontainer.find('#colorValue').select().focus();
        }
    });
};
