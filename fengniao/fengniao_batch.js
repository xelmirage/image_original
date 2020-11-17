// ==UserScript==
// @name         my蜂鸟网添加图片下载按钮
// @namespace    https://greasyfork.org/zh-CN/users/193133-pana
// @version      1.1.0
// @description  添加图片下载按钮
// @author       xelmirage
// @include      http*://bbs.fengniao.com/forum/*
// @include      http*://photo.fengniao.com/pic*
// @include      http*://sai.fengniao.com/album*
// @include      http*://pp.fengniao.com/*
// @exclude      http*://bbs.fengniao.com/forum/forum*
// @require      https://cdn.bootcss.com/FileSaver.js/1.3.8/FileSaver.min.js
// @require      https://greasyfork.org/scripts/376157-downloadpic-js/code/downloadPicjs.js?version=658364
// @grant        GM_download
// ==/UserScript==

(function() {
	'use strict';
	const old_url = location.href;
	const groupReg = /^[a-z:\-\/.]+\/[0-9a-z\/\-_]+\.(jpg|jpeg|png|bmp|gif)/i;

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
    function sleep(milliSeconds) {
        var startTime = new Date().getTime();
        while (new Date().getTime() < startTime + milliSeconds);
    }

	function bbsPicUpdateProgress(imgNum, percentComplete) {
		if ($("progress#progressId" + imgNum.toString()).length === 0) {
			let download_progress = '<progress max="100" class="downloadProgress" id="progressId' + imgNum.toString() + '" style="position: absolute; bottom: 0; left: 0; width: 80px; height: 6px;"></progress>';
			$('ul.minPicList li').eq(imgNum - 1).append(download_progress)
		}
		$("progress#progressId" + imgNum.toString()).attr('value', percentComplete)
	}
	function bbsPicTransferComplete(imgNum, allStatus) {
		if ($("progress#progressId" + imgNum.toString()).length === 0) {
			let download_progress = '<progress max="100" class="downloadProgress" id="progressId' + imgNum.toString() + '" style="position: absolute; bottom: 0; left: 0; width: 80px; height: 6px;"></progress>';
			$('ul.minPicList li').eq(imgNum - 1).append(download_progress)
		}
		$("progress#progressId" + imgNum.toString()).attr('value', 100);
		downloadPic.numberOfDownload.downloadCurrentNum++;
		$("p#progressBtn").text(downloadPic.numberOfDownload.downloadCurrentNum + downloadPic.textProgress.divideStr + downloadPic.numberOfDownload.downloadTotalNum);
		if (allStatus === 1) {
			downloadPic.numberOfDownload.currentNum++;
			$(downloadPic.downloadAllBtn.jQuerySelector).text(downloadPic.downloadAllBtn.text + downloadPic.textDownload.startStr + downloadPic.numberOfDownload.currentNum + downloadPic.textDownload.divideStr + downloadPic.numberOfDownload.totalNum + downloadPic.textDownload.endStr);
			if (downloadPic.numberOfDownload.currentNum === downloadPic.numberOfDownload.totalNum) {
				$(downloadPic.downloadAllBtn.jQuerySelector).attr("title", downloadPic.downloadAllBtn.finishTitle)
			}
		}
	}
	function bbsPicReadFile(imgSrc) {
		let imgNum = Number($('span#viewNum').eq(0).text());
		if ($("progress#progressId" + imgNum.toString()).length === 0) {
			let download_progress = '<progress max="100" class="downloadProgress" id="progressId' + imgNum.toString() + '" style="position: absolute; bottom: 0; left: 0; width: 80px; height: 6px;"></progress>';
			$('ul.minPicList li').eq(imgNum - 1).append(download_progress)
		}
		downloadPic.numberOfDownload.downloadTotalNum++;
		$("p#progressBtn").text(downloadPic.numberOfDownload.downloadCurrentNum + downloadPic.textProgress.divideStr + downloadPic.numberOfDownload.downloadTotalNum);
		downloadPic.downloadFile(imgSrc, imgNum, 0, bbsPicUpdateProgress, bbsPicTransferComplete, saveAs)
	}
	function changeDownloadBtn(container) {
		let imgSrc = container.attr('href');
		container.attr('target', '_self').attr('href', 'javascript:;').off('click').on('click', function() {
			bbsPicReadFile(imgSrc)
		})
	}
	function bbsPicReadAllFile() {
		let imgGroup = $(".minPicList img");
		downloadPic.numberOfDownload.currentNum = 0;
		downloadPic.numberOfDownload.totalNum = imgGroup.length;
		$(downloadPic.downloadAllBtn.jQuerySelector).text(downloadPic.downloadAllBtn.text + downloadPic.textDownload.startStr + downloadPic.numberOfDownload.currentNum + downloadPic.textDownload.divideStr + downloadPic.numberOfDownload.totalNum + downloadPic.textDownload.endStr);
		let eachSrc;
		for (let i = 0; i < imgGroup.length; i++) {
			eachSrc = imgGroup.eq(i).attr('src');
			eachSrc = groupReg.exec(eachSrc)[0];
			if ($("progress#progressId" + (i + 1).toString()).length === 0) {
				let download_progress = '<progress max="100" class="downloadProgress" id="progressId' + (i + 1).toString() + '" style="position: absolute; bottom: 0; left: 0; width: 80px; height: 6px;"></progress>';
				$('ul.minPicList li').eq(i).append(download_progress)
			}
			downloadPic.numberOfDownload.downloadTotalNum++;
			$("p#progressBtn").text(downloadPic.numberOfDownload.downloadCurrentNum + downloadPic.textProgress.divideStr + downloadPic.numberOfDownload.downloadTotalNum);

            sleep(100);

            var l=eachSrc.split("/");
            var file_name="fengniao_"+$(".title.bBg").text()+"_"+l[l.length-1];
            download(eachSrc,file_name);
			//downloadPic.downloadFile(eachSrc, i + 1, 1, bbsPicUpdateProgress, bbsPicTransferComplete, saveAs)
		}
	}
	function addBbsPicDownloadAllBtn(container) {
		container.before('<li>' + downloadPic.downloadAllBtn.tag + '</li><br/>');
		$(downloadPic.downloadAllBtn.jQuerySelector).text(downloadPic.downloadAllBtn.text).css({
			'font-size': '15px'
		}).on('click', function() {
			bbsPicReadAllFile()
		})
	}
	function bbsForumUpdateProgress(countNum, percentComplete) {
		$(downloadPic.downloadBtn.jQuerySelector).eq(countNum).text(downloadPic.downloadBtn.text + downloadPic.textDownload.startStr + percentComplete + downloadPic.textDownload.percentEndStr)
	}
	function bbsForumTransferComplete(countNum, allStatus) {
		$(downloadPic.downloadBtn.jQuerySelector).eq(countNum).text(downloadPic.downloadBtn.text + downloadPic.textDownload.finishStr).attr('title', downloadPic.downloadBtn.finishTitle);
		downloadPic.numberOfDownload.downloadCurrentNum++;
		$('b#progressBtn').text(downloadPic.numberOfDownload.downloadCurrentNum + downloadPic.textProgress.divideStr + downloadPic.numberOfDownload.downloadTotalNum);
		if (allStatus === 1) {
			downloadPic.numberOfDownload.currentNum++;
			$(downloadPic.downloadAllBtn.jQuerySelector).text(downloadPic.downloadAllBtn.text + downloadPic.textDownload.startStr + downloadPic.numberOfDownload.currentNum + downloadPic.textDownload.divideStr + downloadPic.numberOfDownload.totalNum + downloadPic.textDownload.endStr);
			if (downloadPic.numberOfDownload.currentNum === downloadPic.numberOfDownload.totalNum) {
				$(downloadPic.downloadAllBtn.jQuerySelector).attr("title", downloadPic.downloadAllBtn.finishTitle)
			}
		}
	}
	function bbsForumReadFile(imgSrc, countNum, allStatus) {
		$(downloadPic.downloadBtn.jQuerySelector).eq(countNum).text(downloadPic.downloadBtn.text + downloadPic.textDownload.dotStr);
		downloadPic.numberOfDownload.downloadTotalNum++;
		$("b#progressBtn").text(downloadPic.numberOfDownload.downloadCurrentNum + downloadPic.textProgress.divideStr + downloadPic.numberOfDownload.downloadTotalNum);
        //console.log(imgSrc);
        //console.log(saveAs);
        var l=imgSrc.split("/");
        var file_name="fengniao_"+$(".title.bBg").text()+"_"+l[l.length-1];
        file_name=file_name.replace(/\s*/g,"");
        download(imgSrc,file_name);

		//downloadPic.downloadFile(imgSrc, countNum, allStatus, bbsForumUpdateProgress, bbsForumTransferComplete, saveAs)
	}
	function addBbsForumDownloadBtn(container, countNum) {
		let forumImgSrc = container.attr('src');
		forumImgSrc = groupReg.exec(forumImgSrc)[0];
		container.parent().after(downloadPic.downloadBtn.tag);
		$(downloadPic.downloadBtn.jQuerySelector).eq(countNum).text(downloadPic.downloadBtn.text).css({
			'position': 'absolute',
			'top': '30px',
			'left': '30px',
			'display': 'block',
			'border-radius': '4px',
			'text-align': 'center',
			'vertical-align': 'middle',
			'zoom': '1',
			'padding-left': '12px',
			'padding-right': '12px',
			'height': '28px',
			'color': '#fff',
			'font-size': '12px',
			'line-height': '28px',
			'background-color': 'rgba(0, 0, 0, 0.5)'
		}).hover(function() {
			$(this).css({
				'background-color': 'rgba(0, 0, 0, 0.8)'
			})
		}, function() {
			$(this).css({
				'background-color': 'rgba(0, 0, 0, 0.5)'
			})
		}).on('click', function() {
			bbsForumReadFile(forumImgSrc, countNum, 0)
		})
	}
	function changeBbsForumPImg(container) {
		container.wrap('<div style="position: relative;"></div>')
	}
	function addBbsForumDownloadAllBtn(container) {
		container.before(downloadPic.downloadAllBtn.tag);
		$(downloadPic.downloadAllBtn.jQuerySelector).text(downloadPic.downloadAllBtn.text).css({
			'border': '1px solid rgb(208, 238, 241)',
			'display': 'inline-block'
		}).hover(function() {
			$(this).css({
				'border-color': '#28b8c5'
			})
		}, function() {
			$(this).css({
				'border-color': 'rgb(208, 238, 241)'
			})
		}).on('click', function() {
			let totalForumImgGroup = $('.aMain > .cont > .img > a > img, div.cont p img');
			downloadPic.numberOfDownload.currentNum = 0;
			downloadPic.numberOfDownload.totalNum = totalForumImgGroup.length;
			$(downloadPic.downloadAllBtn.jQuerySelector).text(downloadPic.downloadAllBtn.text + downloadPic.textDownload.startStr + downloadPic.numberOfDownload.currentNum + downloadPic.textDownload.divideStr + downloadPic.numberOfDownload.totalNum + downloadPic.textDownload.endStr);
			let eachForumImgSrc;
			for (let j = 0; j < totalForumImgGroup.length; j++) {
				eachForumImgSrc = totalForumImgGroup.eq(j).attr('src');
				eachForumImgSrc = groupReg.exec(eachForumImgSrc)[0];
				bbsForumReadFile(eachForumImgSrc, j, 1)
			}
		})
	}
	function addProgressBtn(container) {
		let progress_btn = '<div id="divProgress">[下载进度:<b id="progressBtn">' + downloadPic.numberOfDownload.downloadCurrentNum + downloadPic.textProgress.divideStr + downloadPic.numberOfDownload.downloadTotalNum + '</b>]</div>';
		container.after(progress_btn);
		$("div#divProgress").css({
			'position': 'relative',
			'display': 'inline-block',
			'float': 'left',
			'height': '44px',
			'margin-left': '20px',
			'zoom': '1',
			'color': '#ccc',
			'font-size': '14px',
			'line-height': '44px'
		})
	}
	function photoPicUpdateProgress(countNum, percentComplete) {
		$('.downPic').eq(countNum).text(downloadPic.downloadBtn.text + downloadPic.textDownload.startStr + percentComplete + downloadPic.textDownload.percentEndStr)
	}
	function photoPicTransferComplete(countNum) {
		$('.downPic').eq(countNum).attr('title', downloadPic.downloadBtn.finishTitle)
	}
	function changePhotoPicDownloadBtn(container) {
		let picImgSrc = container.attr('href');
		container.attr('target', '_self').attr('href', 'javascript:;').on('click', function() {
			downloadPic.downloadFile(picImgSrc, 0, 0, photoPicUpdateProgress, photoPicTransferComplete, saveAs)
		})
	}
	function addSaiAlbumDownloadBtn(container, countNum) {
		let imgSrc = container.attr('src');
		imgSrc = groupReg.exec(imgSrc)[0];
		container.after(downloadPic.downloadBtn.tag);
		$(downloadPic.downloadBtn.jQuerySelector).eq(countNum).text(downloadPic.downloadBtn.text).css({
			'position': 'absolute',
			'top': '12px',
			'left': '10px',
			'background-color': 'rgba(0, 0, 0, 0.7)',
			'color': '#fefefe',
			'font-size': '14px',
			'padding': '4px 12px',
			'border-radius': '3px'
		}).on('click', function() {
			bbsForumReadFile(imgSrc, countNum, 0)
		})
	}
	function addSaiAlbumDownloadAllBtn(container) {
		container.after(downloadPic.downloadAllBtn.tag);
		$(downloadPic.downloadAllBtn.jQuerySelector).text(downloadPic.downloadAllBtn.text).css({
			'font-size': '16px',
			'margin-left': '40px'
		}).on('click', function() {
			let totalSaiImgGroup = $("img.img");
			downloadPic.numberOfDownload.currentNum = 0;
			downloadPic.numberOfDownload.totalNum = totalSaiImgGroup.length;
			$(downloadPic.downloadAllBtn.jQuerySelector).text(downloadPic.downloadAllBtn.text + downloadPic.textDownload.startStr + downloadPic.numberOfDownload.currentNum + downloadPic.textDownload.divideStr + downloadPic.numberOfDownload.totalNum + downloadPic.textDownload.endStr);
			let eachSaiImgSrc;
			for (let i = 0; i < totalSaiImgGroup.length; i++) {
				eachSaiImgSrc = totalSaiImgGroup.eq(i).attr('src');
				eachSaiImgSrc = groupReg.exec(eachSaiImgSrc)[0];
				bbsForumReadFile(eachSaiImgSrc, i, 1)
			}
		})
	}
	function addPpComDownloadAllBtn(container) {
		container.after(downloadPic.downloadAllBtn.tag);
		$(downloadPic.downloadAllBtn.jQuerySelector).text(downloadPic.downloadAllBtn.text).css({
			'font-size': '16px',
			'margin-left': '40px',
			'line-height': '34px'
		}).on('click', function() {
			let totalPpImgGroup = $("div.img > img");
			downloadPic.numberOfDownload.currentNum = 0;
			downloadPic.numberOfDownload.totalNum = totalPpImgGroup.length;
			$(downloadPic.downloadAllBtn.jQuerySelector).text(downloadPic.downloadAllBtn.text + downloadPic.textDownload.startStr + downloadPic.numberOfDownload.currentNum + downloadPic.textDownload.divideStr + downloadPic.numberOfDownload.totalNum + downloadPic.textDownload.endStr);
			let eachPpImgSrc;
			for (let i = 0; i < totalPpImgGroup.length; i++) {
				eachPpImgSrc = totalPpImgGroup.eq(i).attr('src');
				eachPpImgSrc = groupReg.exec(eachPpImgSrc)[0];
				bbsForumReadFile(eachPpImgSrc, i, 1)
			}
		})
	}
	if (old_url.indexOf("bbs.fengniao.com/forum/pic/") !== -1) {
		addBbsPicDownloadAllBtn($(".parameter"));
		let progress_list = '<li class="list progress"><p id="progressText" style="font-size: 14px;">下载进度：</p><p id="progressBtn" style="font-size: 14px;">' + downloadPic.numberOfDownload.downloadCurrentNum + downloadPic.textProgress.divideStr + downloadPic.numberOfDownload.downloadTotalNum + '</p></li>';
		$(".share").after(progress_list);
		let downBtn = $(".downPic");
		changeDownloadBtn(downBtn);
		window.addEventListener('hashchange', function() {
			changeDownloadBtn(downBtn)
		})
	} else if (old_url.indexOf("bbs.fengniao.com/forum/") !== -1) {
		let someForumImgGroup = $("div.cont p img");
		for (let j = 0; j < someForumImgGroup.length; j++) {
			changeBbsForumPImg(someForumImgGroup.eq(j))
		}
		let forumImgGroup = $('.aMain > .cont > .img > a > img, div.cont p img');
		for (let i = 0; i < forumImgGroup.length; i++) {
			addBbsForumDownloadBtn(forumImgGroup.eq(i), i)
		}
		addBbsForumDownloadAllBtn($(".changeScreenBtn"));
		addProgressBtn($("ul#globaSiteNav"))
	}
	if (old_url.indexOf("photo.fengniao.com/pic") !== -1) {
		changePhotoPicDownloadBtn($(".downPic"))
	}
	if (old_url.indexOf("sai.fengniao.com/album") !== -1) {
		let saiImgGroup = $("img.img");
		for (let k = 0; k < saiImgGroup.length; k++) {
			addSaiAlbumDownloadBtn(saiImgGroup.eq(k), k)
		}
		addSaiAlbumDownloadAllBtn($(".picNum"));
		addProgressBtn($("ul#globaSiteNav"))
	}
	const ppReg = /pp\.fengniao\.com\/[0-9]+/i;
	if (ppReg.test(old_url)) {
		let ppImgGroup = $("div.img > img");
		for (let m = 0; m < ppImgGroup.length; m++) {
			addSaiAlbumDownloadBtn(ppImgGroup.eq(m), m)
		}
		addPpComDownloadAllBtn($("h3.tit"));
		addProgressBtn($("ul#globaSiteNav"))
	}
})();
