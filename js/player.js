// AJAX方法封装 start；
(function (globle) {
    function get(option, callBack) {
        if (option.data) {
            option.url += '?' + option.data;
        }
        var xhr = new XMLHttpRequest();
        xhr.open('get', option.url);
        xhr.addEventListener('load', function () {
            // console.log(xhr.getResponseHeader('Content-type'));
            callBack(JSON.parse(xhr.responseText))
        })
        xhr.send(null);
    }

    function post(option, callBack) {
        var xhr = new XMLHttpRequest();
        xhr.open('post', option.url)
        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
        xhr.addEventListener('load', function () {
            callBack(JSON.parse(xhr.responseText))
        })
        option.data ? xhr.send(option.data) : xhr.send();
    }
    globle['ajax'] = {
        'get': get,
        'post': post
    }
}(window));
// AJAX封装 end

// 发送获取歌曲的ajax请求  start
ajax.get({
    url: './musicList.php'
}, function (xhr) {
    player(xhr, 0);
    console.log('Plyer Code by - Jsung')
    console.log('代码用来学习和交流使用,代码中有更好的方法欢迎指教')
})
// ajax请求 end

function player(info, index) {

    /*       ↓↓↓↓↓↓↓变量定义区域↓↓↓↓↓↓↓↓↓       */
    var musicPrev = document.querySelector(".p-bottom-prev");
    var musicNext = document.querySelector(".p-bottom-next");
    var ad = document.querySelector(".audio");
    var poused = document.querySelector(".p-bottom-play");
    var progressOne = document.querySelector(".progress-one");
    var progress = document.querySelector(".progress")
    var progressTow = document.querySelector(".progress-tow")
    var currTime = document.querySelector('.curr-time');
    var totalTime = document.querySelector('.total-time');
    var vol1 = document.querySelector(".p-body-vol")
    var vol2 = document.querySelector(".p-body-vol1")
    var vol3 = document.querySelector(".p-body-vol2")
    var musicName = document.querySelector(".p-top-info-name");
    var author = document.querySelector(".p-top-info-author");

    /*       ↑↑↑↑↑↑↑↑↑↑↑变量定义区域↑↑↑↑↑↑↑↑↑↑↑↑       */

    // 调用方法区域 start

    // 生成歌曲列表
    curentMusicList()
    //  播放音乐
    playMusic()
    // 控制播放进度
    playLine(progress, progressOne, progressTow, ad);

    // 调用方法  end

    /*
        播放器各功能按钮注册事件的功能实现 start
     */

    // 上一曲按钮
    musicPrev.addEventListener("click", function () {
        prevMusic();
    })
    // 下一曲按钮
    musicNext.addEventListener("click", function () {
        nextMusic();
    })
    // 播放暂停按钮
    poused.addEventListener("click", function () {
        if (ad.paused) {
            ad.play();
        } else {
            ad.pause();
        }
    })

    // 音量按钮 Start
    var volTimer = null;
    var volBtn = document.querySelector('.p-body-yinliang');
    // 点击显示音量条
    volBtn.addEventListener('click', function () {
        vol1.style.opacity = '1';
        volTimer = setTimeout(function () {
            vol1.style.opacity = '0';
        }, 3000)
    })
    // 调节音量清空隐藏计时
    vol3.addEventListener('touchstart', function () {
        clearTimeout(volTimer);
    })
    // 松开音量按钮后1秒隐藏
    vol3.addEventListener('touchend', function () {
        volTimer = setTimeout(function () {
            vol1.style.opacity = '0';
        }, 1000)
    })
    // 音量按钮 End

    //  控制播放列表的显示和隐藏 start
    var playList = document.querySelector('.p-list');
    document.querySelector('.p-bottom-lis').addEventListener('click', function () {
        playList.style.transform = 'none';
    });
    // 关闭按钮的事件
    document.querySelector('.p-list-close').addEventListener('click', function () {
        playList.style.transform = 'translateY(100%)';
    })
    // 播放列表显示隐藏 end

    /*       ↓↓↓↓↓↓↓↓↓↓媒体事件↓↓↓↓↓↓↓↓         */

    //  音乐播放结束执行的事件
    ad.addEventListener("ended", function () {
        progressOne.style.width = "0";
        nextMusic();
    })

    //  播放暂停执行的函数
    ad.addEventListener('pause', function () {
        poused.classList.add('icon-bofangzanting02');
        poused.classList.remove("icon-bofang");
        document.querySelector('.p-body-img').style.animationPlayState = 'paused';
        document.querySelector('.p-body-ping img').style.transform = 'rotate(-45deg)';
    })

    // 播放开始执行的函数
    ad.addEventListener('play', function () {
        poused.classList.add("icon-bofang");
        poused.classList.remove("icon-bofangzanting02");
        document.querySelector('.p-body-img').style.animationPlayState = 'running';
        document.querySelector('.p-body-ping img').style.transform = 'rotate(-17deg)';
    })

    // 播放进度改变执行的函数 实时更新进度条
    ad.addEventListener('timeupdate', function () {
        progressOne.style.width = ad.currentTime / ad.duration * 100 + "%";
        upDataTime(currTime, ad.currentTime)
        upDataTime(totalTime, ad.duration)
    })

    // 列表循环 start
    var loopStep = 0;
    document.querySelector('.p-bottom-loop').addEventListener('click', function () {
        switch (loopStep) {
            case 0:
                this.className = "p-bottom-loop iconfont icon-liebiaoxunhuan";
                loopStep = 1
                break;
            case 1:
                this.className = "p-bottom-loop iconfont icon-danquxunhuan";
                loopStep = 2
                break;
            default:
                this.className = "p-bottom-loop iconfont icon-bofangqi_suijibofang_";
                loopStep = 0
                break;
        }
    })
    //  列表循环 end

    /*
        播放器各功能按钮注册事件的功能实现 end
     */

    /*          ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓功能函数↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓       */

    //  控制音乐播放进度的函数 start
    function playLine(boxOne, boxTow, boxThree, musicObj) {
        var boxW = boxOne.offsetWidth;
        var startX = 0;
        var startCurr = 0
        boxThree.addEventListener("touchstart", function (e) {
            musicObj.pause();
            startX = e.touches[0].clientX;
            startCurr = musicObj.currentTime / musicObj.duration * 100;
        })
        boxThree.addEventListener("touchend", function () {
            musicObj.play();
        })
        boxThree.addEventListener("touchmove", function (e) {
            var step = (e.touches[0].clientX - startX) / boxW * 100;
            step = startCurr + step;
            if (step > 100) {
                return;
            } else if (step < 0) {
                return
            }
            boxTow.style.width = step + "%";
            musicObj.currentTime = (step / 100) * musicObj.duration;
        })
    }
    //  控制音乐播放进度的函数 end

    volLine(vol1, vol2, vol3, ad);
    // 控制音量条和音量的函数 start
    function volLine(boxOne, boxTow, boxThree, musicObj) {
        var boxW = boxOne.offsetWidth;
        var startY = 0;
        var startCurr = 0
        musicObj.volume = 0.5;
        boxTow.style.width = musicObj.volume * 100 + "%"
        boxThree.addEventListener("touchstart", function (e) {
            startY = e.touches[0].clientY;
            startCurr = musicObj.volume * 100;
        })
        boxThree.addEventListener("touchmove", function (e) {
            var step = (e.touches[0].clientY - startY) / boxW * 100;
            step = startCurr + -step;
            if (step > 100) {
                return;
            } else if (step < 0) {
                return
            }
            boxTow.style.width = step + "%";
            musicObj.volume = step / 100;
        })
    }
    // 控制音量条和音量的函数 end

    // 播放音乐的函数
    function playMusic() {
        upDataInfo()
        ad.play();
    }
    //  播放下一首音乐的函数
    function nextMusic() {
        loopMod('next')
        upDataInfo()
        ad.play();

    }
    //  播放上一首音乐的函数
    function prevMusic() {
        loopMod()
        upDataInfo()
        ad.play();
    }

    //  播放模式变更的函数 start
    function loopMod(next) {
        switch (loopStep) {
            case 0:
                if (next) {
                    index++
                    index == info.length ? index = 0 : index;
                } else {
                    index == 0 ? index = info.length - 1 : index--;
                }
                break;
            case 1:
                break;
            default:
                index = Math.floor(Math.random() * info.length);
                break;
        }
    }
    // 播放模式变更 end

    //  切换歌曲信息的函数 start
    function upDataInfo() {
        ad.src = info[index].src;
        musicName.innerText = info[index].name;
        author.innerText = info[index].author;
        document.querySelector('.p-body-img img').src = info[index].imgSrc;
        document.querySelector('.player').style.background = 'url(' + info[index].imgSrc + ')no-repeat center/100% 100%'
        var playListLi = document.querySelectorAll('.p-list-body li');
        for (var i = 0; i < playListLi.length; i++) {
            playListLi[i].className = '';
        };
        playListLi[index].className = 'iconfont icon-yinliang';
    }
    // 切换歌曲信息的函数 end

    //  设置歌曲播放时间的函数 start
    function upDataTime(ele, obj) {
        var cut = String(obj / 60);
        cut = cut.split(".");
        if (cut[0] < 10) {
            cut = '0' + cut[0] + ':' + String(cut[1]).substring(0, 2);
        } else {
            cut = cut[0] + ':' + String(cut[1]).substring(0, 2);
        }
        ele.innerText = cut;
    }
    //  设置播放时间 end

    // 生成歌曲列表的函数 start
    function curentMusicList() {
        var listArr = [];
        for (var i = 0; i < info.length; i++) {
            listArr.push('<li data-index="' + i + '"><a>' + info[i].name + '</a>&nbsp;-&nbsp;<span>' + info[i].author + '</span></li>')
        }
        document.querySelector('.p-list-body').innerHTML = listArr.join("");
        var playListLi = document.querySelectorAll('.p-list-body li');

        for (var i = 0; i < playListLi.length; i++) {
            playListLi[i].addEventListener('click', function () {
                index = this.dataset.index;
                playMusic()
            })
        }
    }
    //  生成歌曲列表 end

    /*       功能函数 end         */

};