// ==UserScript==
// @name         下载微博图片和视频-新版微博
// @name:en   Download newWeibo Images and Video
// @namespace    xelmirage
// @version      20240226
// @description  一键下载一条微博中的图片，文件名包含该微博的路径．xxx_wb_uid_wid，可恢复为 https://weibo.com/uid/wid
// @description:en Download images from weibo with user-id and weibo-id in its filename. filname format xxx_wb_uid_wid
// @author       xelmirage
// @updateURL    https://raw.githubusercontent.com/xelmirage/image_original/main/Download_newWeibo_Images_and_Video.js
// @match        https://weibo.com/*
// @match        https://www.weibo.com/*
// @grant        none
// @license      MIT License
// @run-at       document-end
// @connect      *://*.sinaimg.cn

// ==/UserScript==


(function() {

   var doDownload = function(blob, filename) {
       var a = document.createElement('a');
       a.download = filename;
       a.href = blob;
       a.click();
  }

// Current blob size limit is around 500MB for browsers
  var download = function (url, filename) {
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
  function sleep(delay) {
      for(var t = Date.now(); Date.now() - t <= delay;);
  }
  var toast = function(text, duration) {
     if(isNaN(duration)) duration = 1500;
      let _toast = document.createElement('div');
      _toast.innerText = text;
      _toast.style.cssText = 'width: 60%; height:50px; line-height: 50px; min-width:100px;text-align: center; font-size: 15px;' +
      'position: fixed; top: 60%; left: 40%; background: rgb(0,0,0); color:rgb(255,255,255); opacity:0.75; z-index: 999';
      document.body.children[0].appendChild(_toast);

      _toast.style.transition = 'all 0.7s';
      _toast.style.webkitTransition = 'all 0.7s';

      setTimeout(function() {
          _toast.style.opacity = 0;
          setTimeout(()=> { document.body.children[0].removeChild(_toast);},700);

      }, duration);
  }

  // global variables
  var globalValue = "";
  var inputBoxDict = new Map();
  var proceedList = new WeakSet();
  var imgPathReg = new RegExp("(https://[\\S]+/)([\\S]+)(/[\\S]+)");

  var buttonOnClick = function(e) {
      let buttonData = inputBoxDict.get(this); // path
      console.log("buttondata",buttonData);
      let inputName = this.previousSibling.value && this.previousSibling.value.split('@')[0];
      console.log("inputName",inputName);
      let fileName = 'wb_' + buttonData[0] + '_' + buttonData[1];
      console.log("fileName",fileName);
      //let fileName = (inputName && inputName + '_') + 'wb_' + buttonData[0] + '_' + buttonData[1];

      //var imgList = this.parentNode.children[1].children[0].children; // media_box > ul >li
      var imgList=this.parentNode.children[1].children[0].getElementsByTagName('img');
      console.log(imgList);
      //  set the page mask
      //let pages = this.previousSibling.value.split('@')[1];
      //let temp = /[0-9]*/.exec(pages);
      /*
      pages = temp && temp[0];
      let mask = new Uint8Array(imgList.length);
      if(!pages){
         mask.fill(1);
      }
      else {
        console.log(pages, '_', pages.length);
        for(var i = 0; i < pages.length; i++) {
          let num = pages[i] - 1;
          if(num > mask.length || num < 0) continue;
          mask[num] = 1;
        }
      }
      console.log(mask);
      // check if the media is video
      let firstMediaClass = imgList[0].classList[0];
      if(firstMediaClass === 'WB_video') {
          let videoElem = imgList[0].getElementsByTagName('video')[0];
          let result = download(videoElem.src, fileName);
          if(result === false) {toast('下载出错，详见控制台');}
          else {toast('下载开始');}
          return;
      }

      */
       // else download images
      var failedList = [];
      for(var j = 0; j < imgList.length; j++) {

          //if(mask[j] === 0) continue;
          let result = true;
          let child = imgList[j];
          var imgsrc = '';
          // check whether picture or gif
          if(child.tagName === 'IMG') {
              imgsrc = child.src.replace(imgPathReg,'$1large$3'); // replace ....sinaming.cn/XXX/YYY.jpg' with '...sinaimg.cn/large/YYY.jpg'
              result = download(imgsrc, fileName + '_' + j);
          }
          else {
              imgsrc = child.children[0].src.replace(imgPathReg, '$1large$3');
              result = download(imgsrc, fileName + '_' + j + '.gif');
          }
          sleep(1);
          console.log(j,imgsrc);
          if(result === false) failedList.push(j+1);
      }
      if(failedList.length !== 0) {
         toast('第 ' + failedList + ' 下失败，详见控制台');
      }
      else {
         toast('全部下载开始');
      }
  }

  var getWeiboPath = function(media_box) {//得到用户编号和帖子id
      var path = "";
      if(media_box.parentNode.nextElementSibling &&
           media_box.parentNode.nextElementSibling.classList.contains('WB_func')) {
         path = media_box.parentNode.nextElementSibling.children[0].children[0].children[0].children[0].children[0].href;
         // let date = media_box.parentNode.nextElementSibling.children[0].children[0].children[0].children[0].children[0].title;
         path = path.split("?")[0].split("/").slice(3,5);
      }
      else {
         path = media_box.parentNode.parentNode.children[1].children[0].href; // in an independent weibo page
         //let date = media_box.parentNode.parentNode.children[1].children[0].title;
         path = path.split("?")[0].split("/").slice(3,5);

      }
      return path;

  }
  var url2UseridPostid=function(url){
      var path = "";
      path =url.split("?")[0].split("/").slice(3,5);//
      return path;
  }
  var addFunction = function(){
        sleep(10);
        var lists = document.getElementsByClassName('wbpro-feed-content');
        console.log('media_box wbpro-feed-content list.length = ' + lists.length);
        for( var i = 0; i < lists.length; i++) {
            var txt='';
            //txt=lists[i].children[0].children[0].children[0].children[0].children[1].children[0].children[0].children[0].children[0].text;
            //txt=lists[i].children[1].children[0].children[0].children[0];
            //console.log(txt)
            //var list = lists[i].parentNode.parentNode.children[1];//
            var list =lists[i];
            if(proceedList.has(list)) {
               continue;
            }
            proceedList.add(list);
            var inputBox = document.createElement('input');
            inputBox.style.width = '20%';
            inputBox.style.height = '70%';
            inputBox.style.float = "right";
            inputBox.style.marginLeft = '5px';
            inputBox.style.opacity = "0.2";

            var button = document.createElement('a');
            button.setAttribute('class','S_txt2');
            button.innerText = '下载图片';
            button.href = 'javascript:void(0)';
            button.input = inputBox;

            //var path = getWeiboPath(lists[i]);
            var path = "aaa"
            button.onclick = buttonOnClick;
            button.style.float = "right";

            //inputBoxDict.set(button,path);
            //var rt_list=list.parentNode.children[2];
            console.log(list)
            console.log(list.parentNode.children)
            console.log("list.parentNode.children.length=",list.parentNode.children.length);
            console.log("post_link:",list.parentNode.children[0].children[1].children[0].children[1].children[0].href)
            //console.log(rt_list.className);
            var post_link;

            if (list.parentNode.children.length==3)
            {//假如是转发
                console.log("class name:",list.parentNode.children[2].className)
                if (list.parentNode.children[2].className.includes("Feed_placebox"))
                {
                    post_link=list.parentNode.children[0].children[1].children[0].children[1].children[0].href;
                    console.log("original post link",post_link);
                    path=url2UseridPostid(post_link);
                    console.log(path);
                    console.log(list.parentNode.children[0].children[1].children[0].children[1].children[0]);
                    inputBoxDict.set(button,path);
                    list.appendChild(inputBox);
                    list.appendChild(button);
                }
                else{
                    var retweet=list.parentNode.children[2];
                    post_link=retweet.children[2].children[0].children[0].href;
                    console.log("retweet post link",post_link);
                    path=url2UseridPostid(post_link);
                    console.log(path);
                    inputBoxDict.set(button,path);
                    retweet.appendChild(inputBox);
                    retweet.appendChild(button);
                }
            }
            else{//原创
                post_link=list.parentNode.children[0].children[1].children[0].children[1].children[0].href;
                console.log("original post link",post_link);
                path=url2UseridPostid(post_link);
                console.log(path);
                console.log(list.parentNode.children[0].children[1].children[0].children[1].children[0]);
                inputBoxDict.set(button,path);
                list.appendChild(inputBox);
                list.appendChild(button);
            }
            //list.appendChild(inputBox);
            //list.appendChild(button);

            
        }
    }
    window.addEventListener ("load", ()=>{
                             setTimeout(addFunction,1000);
    });

   (function () {
    var DOMObserverTimer = false;
    var DOMObserverConfig = {
      attributes: true,
      childList: true,
      subtree: true
    };
    var DOMObserver = new MutationObserver(function () {
      if (DOMObserverTimer !== 'false') {
        clearTimeout(DOMObserverTimer);
      }
      DOMObserverTimer = setTimeout(function () {
        DOMObserver.disconnect();
        addFunction();
        DOMObserver.observe(document.body, DOMObserverConfig);
      }, 1000);
    });
    DOMObserver.observe(document.body, DOMObserverConfig);
  }) ();

})();
