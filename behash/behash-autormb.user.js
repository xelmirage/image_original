// ==UserScript==
// @name         behash-autormb
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       xelmirage
// @match        http://*.behash.com/user
// @match        http://*.hxbao.com/user
// @grant        none
// @updateURL    https://github.com/xelmirage/image_original/raw/main/behash/behash-autormb.user.js
// ==/UserScript==

(function() {
    'use strict';

    var rmbPerHash = $('body > div.container.mt-5 > div > div.col-sm-9 > ul:nth-child(3) > li:nth-child(2) > div > div:nth-child(3)');
    var hashPrice=Number(rmbPerHash.text().split('元')[0]);
    console.log("rmb",hashPrice);
    var numHash = $('body > div.container.mt-5 > div > div.col-sm-9 > ul:nth-child(3) > li:nth-child(3) > div > div:nth-child(3)');
    var hashCount=Number(numHash.text().split(' ')[0]);
    console.log("hash",hashCount);
    console.log("total rmb",hashCount*hashPrice);
    var strHash = $('body > div.container.mt-5 > div > div.col-sm-9 > ul:nth-child(3) > li:nth-child(3) > div');
    //strHash.innerText=strHash.text()+" "+String(hashCount*hashPrice);

    let triple=document.createElement("li");
    triple.innerHTML='<li class="list-group-item">\
                        <div class="row">\
                            <div class="col-sm-3">可提现人民币</div>\
                            <div class="col-sm-6"></div>\
                            <div class="col-sm-3">'+(hashCount*hashPrice).toFixed(2) +' <span>元人民币</span></div>\
                        </div>\
                    </li>';
    let share=document.querySelector("body > div.container.mt-5 > div > div.col-sm-9 > ul:nth-child(3) > li:nth-child(4)");
    share.parentElement.insertBefore(triple,share);
    // Your code here...
})();
