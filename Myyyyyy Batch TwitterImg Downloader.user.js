// ==UserScript==
// @name         Myyyyyy Batch TwitterImg Downloader
// @namespace    xelmirage
// @version      0.11
// @description  Add download button to Twitter image, and click to download the original image named by format.
// @author       xelmirage
// @match        https://twitter.com/
// @include      https://twitter.com/*
// @require      http://code.jquery.com/jquery-3.3.1.min.js
// @grant        none
// @connect      *://*.twimg.com
// @grant        GM_download
// ==/UserScript==

(function () {
    /** Edit defaultFileName to change the file name format
     *
     *  <%Userid>  Twitter user ID.        eg: shiratamacaron
     *  <%Tid>     Tweet ID.              eg: 1095705491429158912
     *  <%Time>    Current timestamp.     eg: 1550557810891
     *  <%PicName> Original pic name.     eg: DzS6RkJUUAA_0LX
     *  <%PicNo>   Ordinal number of pic. eg: 0
     *
     *  default: "<%Userid> <%Tid>_p<%PicNo>"
     *    result: "shiratamacaron 1095705491429158912_p0.jpg"
     *
     *  example1: "<%Userid> <%Tid> <%PicName>”
     *    result: "shiratamacaron 1095705491429158912 DzS6RkJUUAA_0LX.jpg"
     *
     *  example2: "<%Tid>_p<%PicNo>”
     *    result: "1095705491429158912_p0.jpg"
     */
    let defaultFileName = "twimg-<%Userid> <%Tid>_p<%PicNo>";


    /** Edit following value to change download shortcut key in gallery mode
     *  KeyCode value can be found at https://keycode.info/
     *
     *  default: shift + s (s->83)
     */
    let shortCut_Shift = true; //true - Yes , false - No
    let shortCut_Ctrl = false;
    let shortCut_Alt = false;
    let shortCut_KeyCode = 83 //KeyCode value


    var doDownload = function(blob, filename) {
        var a = document.createElement('a');
        a.download = filename;
        a.href = blob;
        a.click();
    }
    // Current blob size limit is around 500MB for browsers
    var mydownload = function (url, filename) {
        if (!filename) filename = url.split('\\').pop().split('/').pop();
        fetch(url, {
            headers: new Headers({
                'Origin': location.origin
            }),
            mode: 'cors'
        })
            .then(response => response.blob())
            .then(blob => {
            let blobUrl = window.URL.createObjectURL(blob);
            doDownload(blobUrl, filename);
        })
            .catch(e => {console.error(e); return false;});

        return true;
    }
    function sleep(milliSeconds) {
        var startTime = new Date().getTime();
        while (new Date().getTime() < startTime + milliSeconds);
    }





    function download(url, name, view) {
        //通过fetch获取blob
        fetch(url).then(response => {
            if (response.status == 200)
                return response.blob();
            throw new Error(`status: ${response.status}.`)
        }).then(blob => {
            downloadFile(name, blob, view)
        }).catch(error => {
            console.log("failed. cause:", error)
        })
    }

    function downloadFile(fileName, blob, view) {
        //通过a标签的download属性来下载指定文件名的文件
        let anchor = view;
        let src = URL.createObjectURL(blob);
        anchor.download = fileName;
        anchor.href = src;
        view.click();
    }

    const addDownloadButton = function (v) {
        if (newVersionFlag) {
            newVer(v);
        } else {
            oldVer(v)
        }
        return false;
    }

    function addDlBtn(){
        let btnDownloadImg;
        if(document.getElementsByClassName("img-link").length==0){
            btnDownloadImg = document.createElement('A');
            btnDownloadImg.className = 'img-link';
            document.getElementById("react-root").appendChild(btnDownloadImg);
        }else{
            btnDownloadImg = document.getElementsByClassName("img-link")[0];
        }
        return btnDownloadImg;
    }

    function newVer(v) {
        if (v == null || v.length == 0) return;
        let target = v[0];
        if (target == null || target.src == null) return;
        if (target.alt == null || target.alt == "") return;
        if (target.parentElement.getAttribute("aria-label") == null || target.parentElement.getAttribute("aria-label") == "") return;
        let dlbtn = document.createElement('DIV');
        target.parentElement.parentElement.appendChild(dlbtn);
        dlbtn.outerHTML = '<div class="dl_btn_div" style="cursor: pointer;z-index: 999;display: table;font-size: 15px;color: white;position: absolute;right: 5px;bottom: 5px;background: #0000007f;height: 30px;width: 30px;border-radius: 15px;text-align: center;"><svg class="icon" style="width: 15px;height: 15px;vertical-align: top;display: inline-block;margin-top: 7px;fill: currentColor;overflow: hidden;" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3658"><path d="M925.248 356.928l-258.176-258.176a64 64 0 0 0-45.248-18.752H144a64 64 0 0 0-64 64v736a64 64 0 0 0 64 64h736a64 64 0 0 0 64-64V402.176a64 64 0 0 0-18.752-45.248zM288 144h192V256H288V144z m448 736H288V736h448v144z m144 0H800V704a32 32 0 0 0-32-32H256a32 32 0 0 0-32 32v176H144v-736H224V288a32 32 0 0 0 32 32h256a32 32 0 0 0 32-32V144h77.824l258.176 258.176V880z" p-id="3659"></path></svg></div>';
        dlbtn = target.parentElement.parentElement.getElementsByClassName("dl_btn_div")[0];

        let btnDownloadImg = addDlBtn();

        if (!document.location.href.includes("photo")) {
            //信息流模式

            let firstA = findFirstA(target);
            //获取文件名
            // https://pbs.twimg.com/media/D_mR-WEUYAAZJVH?format=jpg&amp;name=360x360
            let fooName = target.src.split("?")[0];
            let barName = fooName.split("/");
            let dl_picname = barName[barName.length - 1];
            let dl_time = new Date().getTime();

            //获取图片编号
            // ameto_y/status/1151067160078274561/photo/1
            let array = firstA.href.replace("https://twitter.com/", "").split("/");
            let dl_userid = array[0];
            let dl_tid = array[2];
            let dl_picno = array[4];
            //替换内容，拼接文件名
            let dl_filename = defaultFileName
                .replace("<%Userid>", dl_userid)
                .replace("<%Tid>", dl_tid)
                .replace("<%Time>", dl_time)
                .replace("<%PicName>", dl_picname)
                .replace("<%PicNo>", dl_picno - 1);
            //获取拓展名，推特只存在.jpg和.png格式的图片，故偷个懒不做正则判断
            let dl_ext = "jpg";
            if (target.src.includes("format=png")) {
                dl_ext = "png";
            }
            dlbtn.addEventListener('touchstart', function (e) {
                dlbtn.onclick = function (e) {
                    return false;
                }
                return false;
            });
            dlbtn.addEventListener('mousedown', function (e) {
                dlbtn.onclick = function (e) {
                    return false;
                }
                return false;
            });
            dlbtn.addEventListener('click', function (e) {
                //调用下载方法
                cancelBubble(e);
                download("https://pbs.twimg.com/media/" + dl_picname + "?format=" + dl_ext + "&name=orig", dl_filename + "." + dl_ext, btnDownloadImg);
                return false;
            });
        } else {
            //大图画廊模式

            //获取文件名
            // https://pbs.twimg.com/media/D_mR-WEUYAAZJVH?format=jpg&amp;name=360x360
            let fooName = target.src.split("?")[0];
            let barName = fooName.split("/");
            let dl_picname = barName[barName.length - 1];

            //获取拓展名，推特只存在.jpg和.png格式的图片，故偷个懒不做正则判断
            let dl_ext = "jpg";
            if (target.src.includes("format=png")) {
                dl_ext = "png";
            }
            dlbtn.addEventListener('click', function (e) {
                //调用下载方法
                cancelBubble(e);

                //获取图片编号
                // ameto_y/status/1151067160078274561/photo/1
                let array = document.location.href.replace("https://twitter.com/", "").split("/");
                let dl_userid = array[0];
                let dl_tid = array[2];
                let dl_picno = array[4];
                let dl_time = new Date().getTime();
                let dl_filename = defaultFileName
                    .replace("<%Userid>", dl_userid)
                    .replace("<%Tid>", dl_tid)
                    .replace("<%Time>", dl_time)
                    .replace("<%PicName>", dl_picname)
                    .replace("<%PicNo>", dl_picno - 1);
                download("https://pbs.twimg.com/media/" + dl_picname + "?format=" + dl_ext + "&name=orig", dl_filename + "." + dl_ext, btnDownloadImg);
                return false;
            });
        }

        //下载所有图片
        var tgt_parent=target.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement;
        //检测是不是已经存在下载按钮，如果存在的话就不再重复添加
        var existing_downbtns=tgt_parent.parentElement.parentElement.getElementsByClassName('S_txt2');
        console.log("existing_downbtns",existing_downbtns.length);

        if (existing_downbtns.length>0){

            return;
        }
        else{
            var button = document.createElement('a');
            button.setAttribute('class','S_txt2');
            button.innerText = 'Download All';
            button.href = 'javascript:void(0)';
            button.style.textAlign= "right";
            //button.style.margin-right="20px";
            button.onclick = DwonloadAllbuttonOnClick;
            tgt_parent.appendChild(button);

            //console.log("find bottom bar",);
            var divs=tgt_parent.parentElement.getElementsByTagName('div');
            for (var div_i=0;div_i<divs.length;div_i++){
                var div_now=divs[div_i]
                if( div_now.getAttribute("role")=="group"){
                    console.log("div_now",div_now.getAttribute("role"));

                    //div_now.appendChild(button);

                }
            }
        }

    }
    var DwonloadAllbuttonOnClick = function(e) {
        console.log(e);

        var tgt_parent=this.parentElement;
        var download_btns=tgt_parent.getElementsByTagName("img");
        console.log(download_btns);




        for(var i=0;i<download_btns.length;i++){
            //orig
            var img_block=download_btns[i];
            var img_url=img_block.getAttribute("src")
            img_url=img_url.slice(0,-5)+"orig";

            console.log(img_url);
            //组装文件名
            var fooName = img_url.split("?")[0];
            var barName = fooName.split("/");
            var dl_picname = barName[barName.length - 1];
            var dl_time = new Date().getTime();

            var firstA = findFirstA(img_block);
            var array = firstA.href.replace("https://twitter.com/", "").split("/");
            var dl_userid = array[0];
            var dl_tid = array[2];
            var dl_picno = array[4];
            var dl_filename = defaultFileName
                .replace("<%Userid>", dl_userid)
                .replace("<%Tid>", dl_tid)
                .replace("<%Time>", dl_time)
                .replace("<%PicName>", dl_picname)
                .replace("<%PicNo>", dl_picno - 1);
            console.log(dl_filename);
            //获取拓展名，推特只存在.jpg和.png格式的图片，故偷个懒不做正则判断
            var dl_ext = "jpg";
            if (img_url.includes("format=png")) {
                dl_ext = "png";
            }
            //排除emoji干扰
            if (img_url.includes("emoji")) {
                return;
            }
            else{

                mydownload("https://pbs.twimg.com/media/" + dl_picname + "?format=" + dl_ext + "&name=orig", dl_filename + "." + dl_ext);
                sleep(100);
            }


        }


    }

    //画廊模式下的快捷键功能
    function onShortCut() {
        let locationArr = document.location.href.split("/");
        let targetArr = $('ul[role="list"]');

        let imgNo = null;
        let imgArr = null;
        let target = null;
        //判断是否找到了画廊的ul标签
        if (targetArr.length == 0 ) {
            //如果找不到ul标签，并且不是画廊模式（那么网址内没有“photo”）， 则不进行进一步的处理
            if(locationArr.length < 2 || locationArr[locationArr.length - 2] != "photo") return;
            //否则进行搜索单张图画廊的情况
            var arr = $('img[src^="https://pbs.twimg.com/media/');
            for(var i=0;i< arr.length;i++){
                var imgUrl = arr[i].src.split("?")[i]
                //判断是否是推特附带的图片img，并且判断是不是信息流的图片（信息流图片的所有母层中必定带有一个a标签）
                if(arr[i].parentElement.firstElementChild!="" && arr[i].parentElement.firstElementChild.style.backgroundImage.includes(imgUrl) && findFirstA(arr[i])==null){
                    //单图模式的赋值
                    let imgNo = 0;
                    target = arr[i];
                    break;
                }
            }
            //如果找不到任何目标，则不进行进一步的处理
            if(target == null) return;
        } else {
            //多图模式的赋值
            imgNo = locationArr[locationArr.length - 1] - 1;
            imgArr = targetArr[0].getElementsByTagName("img");
            target = imgArr[imgNo];
        }

        //获取文件名
        // https://pbs.twimg.com/media/D_mR-WEUYAAZJVH?format=jpg&amp;name=360x360
        let fooName = target.src.split("?")[0];
        let barName = fooName.split("/");
        let dl_picname = barName[barName.length - 1];

        //获取拓展名，推特只存在.jpg和.png格式的图片，故偷个懒不做正则判断
        let dl_ext = "jpg";
        if (target.src.includes("format=png")) {
            dl_ext = "png";
        }
        //获取图片编号
        // ameto_y/status/1151067160078274561/photo/1
        let array = document.location.href.replace("https://twitter.com/", "").split("/");
        let dl_userid = array[0];
        let dl_tid = array[2];
        let dl_picno = array[4];
        let dl_time = new Date().getTime();
        let dl_filename = defaultFileName
            .replace("<%Userid>", dl_userid)
            .replace("<%Tid>", dl_tid)
            .replace("<%Time>", dl_time)
            .replace("<%PicName>", dl_picname)
            .replace("<%PicNo>", dl_picno - 1);

        let btnDownloadImg = addDlBtn();
        download("https://pbs.twimg.com/media/" + dl_picname + "?format=" + dl_ext + "&name=orig", dl_filename + "." + dl_ext, btnDownloadImg);
    }

    function oldVer(v) {
        let tweets = document.querySelectorAll('.tweet');
        tweets.forEach((t) => {
            //忽略视频信息
            if (t.getElementsByClassName("PlayableMedia").length > 0) return;
            //文件名信息
            let dl_userid = t.getAttribute("data-screen-name");
            let dl_name = t.getAttribute("data-name");
            let dl_tid = t.getAttribute("data-tweet-id");
            //尝试获取发推时间，但是部分情况无法获取，故采用保存文件时间
            //let dl_time = t.getElementsByClassName("_timestamp")[0].getAttribute("data-time");
            let dl_time = new Date().getTime();
            /* 画廊 */
            if (t.parentElement.className.includes("GalleryTweet")) {
                //获取画廊容器
                let imgContent = t.parentElement.parentElement.getElementsByClassName("Gallery-media")[0];
                //防止按钮重复叠加
                if (imgContent.parentElement.parentElement.getElementsByClassName("dl_btn_div").length != 0) return;
                //创建下载按钮
                let dlbtn = document.createElement('div');
                imgContent.parentElement.appendChild(dlbtn);
                dlbtn.outerHTML = '<div class="dl_btn_div" style="z-index: 999;display: table;font-size: 15px;color: white;position: absolute;right: 5px;top: 5px;background: #0000007f;height: 30px;width: 30px;border-radius: 15px;text-align: center;"><a style="display: table-cell;height: 30px;width: 30px;vertical-align: middle;color:white;font-family:edgeicons;text-decoration: none;user-select: none;" id="a_dl">&#xf088</a></div>';
                dlbtn = imgContent.parentElement.getElementsByClassName("dl_btn_div")[0];
                //创建不可见的下载用标签
                let btnDownloadImg = document.createElement('A');
                btnDownloadImg.className = 'img-link';
                imgContent.parentElement.parentElement.appendChild(btnDownloadImg);
                //添加点击事件
                dlbtn.addEventListener('click', function () {
                    //去掉图片链接尾部的 ":large"
                    let ImgUrl = imgContent.getElementsByClassName("media-image")[0].src.replace(":large", "");
                    //获取文件名
                    let dl_picname = ImgUrl.replace('https://pbs.twimg.com/media/', '').replace('.png', '').replace('.jpg', '');
                    //设置默认图片编号0
                    let dl_picno = 0;
                    //个人页面class
                    let Images = imgContent.parentElement.querySelectorAll('.AdaptiveMedia-container img');
                    if (Images.length <= 0) {
                        //信息流class
                        Images = imgContent.parentElement.querySelectorAll('.AdaptiveMedia-photoContainer img');
                    }
                    //通过循环比较获取图片序号
                    for (var imgNo = 0; imgNo < Images.length; imgNo++) {
                        if (ImgUrl == Images[imgNo].src) {
                            dl_picno = imgNo;
                            break;
                        }
                    }
                    //获取拓展名，推特只存在.jpg和.png格式的图片，故偷个懒不做正则判断
                    let dl_ext = ".jpg";
                    if (ImgUrl.includes(".png")) {
                        dl_ext = ".png";
                    }
                    //替换内容，拼接文件名
                    let dl_filename = defaultFileName
                        .replace("<%Userid>", dl_userid)
                        .replace("<%Name>", dl_name)
                        .replace("<%Tid>", dl_tid)
                        .replace("<%Time>", dl_time)
                        .replace("<%PicName>", dl_picname)
                        .replace("<%PicNo>", dl_picno);
                    //调用下载方法
                    download(ImgUrl + ":orig", dl_filename + dl_ext, btnDownloadImg);
                });
                return;
            }
            /* 信息流 */
            //防止按钮重复叠加
            if (t.getElementsByClassName("dl_btn_div").length != 0) return;
            //获取全部图片标签
            let Images = t.querySelectorAll('.AdaptiveMedia-container img');
            for (var i = 0; i < Images.length; i++) {
                let Img = Images[i];
                if (Img) {
                    //获取图片链接
                    let ImgUrl = Img.src;
                    //如果为blob对象则跳过
                    if (Img.src.includes('blob')) break;
                    //创建下载按钮
                    let dlbtn = document.createElement('div');
                    Img.parentElement.parentElement.appendChild(dlbtn);
                    dlbtn.outerHTML = '<div class="dl_btn_div" style="display: table;font-size: 15px;color: white;position: absolute;right: 5px;bottom: 5px;background: #0000007f;height: 30px;width: 30px;border-radius: 15px;text-align: center;"><a style="display: table-cell;height: 30px;width: 30px;vertical-align: middle;color:white;font-family:edgeicons;text-decoration: none;user-select: none;" id="a_dl">&#xf088</a></div>';
                    dlbtn = Img.parentElement.parentElement.getElementsByClassName("dl_btn_div")[0];
                    //创建不可见的下载用标签
                    let btnDownloadImg = document.createElement('A');
                    btnDownloadImg.className = 'img-link';
                    t.appendChild(btnDownloadImg);
                    //获取文件名
                    let dl_picname = Img.src.replace('https://pbs.twimg.com/media/', '').replace('.png', '').replace('.jpg', '');
                    //获取图片编号
                    let dl_picno = i;
                    //替换内容，拼接文件名
                    let dl_filename = defaultFileName
                        .replace("<%Userid>", dl_userid)
                        .replace("<%Name>", dl_name)
                        .replace("<%Tid>", dl_tid)
                        .replace("<%Time>", dl_time)
                        .replace("<%PicName>", dl_picname)
                        .replace("<%PicNo>", dl_picno);
                    //获取拓展名，推特只存在.jpg和.png格式的图片，故偷个懒不做正则判断
                    let dl_ext = ".jpg";
                    if (ImgUrl.includes(".png")) {
                        dl_ext = ".png";
                    }
                    //添加点击事件
                    dlbtn.addEventListener('click', function () {
                        //调用下载方法
                        download(ImgUrl + ":orig", dl_filename + dl_ext, btnDownloadImg);
                    });
                }
            };
        });
    }

    let newVersionFlag = (document.getElementById("react-root") != null);
    if (newVersionFlag) {
        waitForKeyElements(
            'img[src^="https://pbs.twimg.com/media/"]',
            addDownloadButton
        );
    } else {
        waitForKeyElements(
            '.AdaptiveMedia-container img',
            addDownloadButton
        );
    }
    $(document).keyup(function (e) {
        let shiftFlag = true
        let ctrlFlag = true
        let altFlag = true
        if (shortCut_Shift) {
            shiftFlag = e.shiftKey
        }
        if (shortCut_Ctrl) {
            ctrlFlag = e.ctrlKey
        }
        if (shortCut_Alt) {
            altFlag = e.altKey
        }
        if (e.keyCode == shortCut_KeyCode && shiftFlag && ctrlFlag && altFlag) {
            onShortCut()
        }
    })

    function waitForKeyElements(
        selectorTxt,
        actionFunction,
        bWaitOnce,
        iframeSelector
    ) {
        var targetNodes, btargetsFound;

        if (typeof iframeSelector == "undefined") {
            targetNodes = $(selectorTxt);
        } else {
            targetNodes = $(iframeSelector).contents().find(selectorTxt);
        }

        if (targetNodes && targetNodes.length > 0) {
            btargetsFound = true;
            targetNodes.each(function () {
                var jThis = $(this);
                var alreadyFound = jThis.data('alreadyFound') || false;

                if (!alreadyFound) {
                    var cancelFound = actionFunction(jThis);
                    if (cancelFound) {
                        btargetsFound = false;
                    } else {
                        jThis.data('alreadyFound', true);
                    }
                }
            });
        } else {
            btargetsFound = false;
        }

        var controlObj = waitForKeyElements.controlObj || {};
        var controlKey = selectorTxt.replace(/[^\w]/g, "_");
        var timeControl = controlObj[controlKey];

        if (btargetsFound && bWaitOnce && timeControl) {
            clearInterval(timeControl);
            delete controlObj[controlKey]
        } else {
            if (!timeControl) {
                timeControl = setInterval(function () {
                    waitForKeyElements(selectorTxt,
                        actionFunction,
                        bWaitOnce,
                        iframeSelector
                    );
                }, 300);
                controlObj[controlKey] = timeControl;
            }
        }
        waitForKeyElements.controlObj = controlObj;
    }

    function findFirstA(node) {
        var tmp = node;
        for (var i = 0; i < 20; i++) {
            tmp = tmp.parentElement
            if (tmp == null) return null;
            if (tmp.nodeName == "a" || tmp.nodeName == "A") {
                return tmp
            }
        }
    }
    function findFirstLi(node) {
        var tmp = node;
        for (var i = 0; i < 20; i++) {
            tmp = tmp.parentElement
            if (tmp == null) return null;
            if (tmp.nodeName == "li" || tmp.nodeName == "LI") {
                return tmp
            }
        }
    }
    function cancelBubble(e) {
        var evt = e ? e : window.event;
        if (evt.stopPropagation) {
            evt.stopPropagation();
        } else {
            evt.cancelBubble = true;
        }
    }
})();