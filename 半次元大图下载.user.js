// ==UserScript==
// @name         半次元大图下载
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       Xelmirage
// @match        https://bcy.net/*/detail/*
// @grant       unsafeWindow
// @run-at		  document-end
// ==/UserScript==

//inspired by:

/*
 *@作者：雪见仙尊
 *@博客：https://saber.love
 *@转载重用请保留此信息
 *@QQ群：562729095
 */

/*
*@名称         下载微博图片和视频
*@名称   Download Weibo Images and Video
*@作者       Flao
*@地址    https://greasyfork.org/zh-CN/users/127123-flao
*/



document.body.insertAdjacentHTML(
    'beforeend',
    `<div id="downUrl" style="position: fixed; right: 0px; top: 300px; padding: 15px 20px; background: rgb(46, 178, 234); color: rgb(255, 255, 255); border-radius: 5px; text-align: center; line-height: 24px; font-size: 16px; cursor: pointer;">下载大图</div>`
)

document.querySelector('#downUrl').addEventListener('click', () => {
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

    const data = unsafeWindow.__ssr_data;
    var inputBoxDict = new Map();
    let buttonData = inputBoxDict.get(this); // path
    var selfUrl = window.location.href;
    var postID=selfUrl.split("/")[5].split("?")[0];
    var fileID="";
    var fileName="";
    console.log( selfUrl.split("/")[5].split("?")[0])
    if (data) {
        let i=0;

        let urlsArray = data.detail.post_data.multi
        for (const item of urlsArray) {
            console.log( item.original_path);
            //console.log(item.original_path.split("/"));
            fileID=item.original_path.split("/")[5];
            fileName="bcy_"+postID+"_"+fileID+".jpg";
            console.log(fileName);
            download( item.original_path,fileName)
        }
    }




})