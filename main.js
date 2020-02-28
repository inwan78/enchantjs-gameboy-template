var FPS_RATE = 2;//1:60fps, 2:30fps, 3:20fps,以下略
var FPS = 60 / FPS_RATE;//基本的には使わないが、稀に使うときがある
//画面サイズ関係
var SCREEN_WIDTH = 640; //画面幅
var SCREEN_HEIGHT = 900;//画面高さ
var DISPLAY_SCREEN_HEIGHT = 600;//ゲームディスプレイ画面
var DISPLAY_SCREEN_WIDTH = 640;//ゲームディスプレイ画面
var GAME_SCREEN_HEIGHT = 240;//ゲーム画面
var GAME_SCREEN_WIDTH = 256;//ゲーム画面
var GAME_AREA_LEFT = -100;//ゲームエリア(画面外含む)左端
var GAME_AREA_RIGHT = GAME_SCREEN_WIDTH + 100;//ゲームエリア(画面外含む)右端
var GAME_AREA_TOP = -100;//ゲームエリア(画面外含む)上端
var GAME_AREA_BOTTOM = GAME_SCREEN_HEIGHT + 100;//ゲームエリア(画面外含む)下端
var GAME_AREA_WIDTH = GAME_AREA_RIGHT - GAME_AREA_LEFT;//ゲームエリアの幅
var GAME_AREA_HEIGHT = GAME_AREA_BOTTOM - GAME_AREA_TOP;//ゲームエリアの高さ

//ゲーム場面用予約語
var SCENE_TITLE = 1;
var SCENE_OPENING = 2; 
var SCENE_MAINGAME = 3;
var SCENE_GAMEOVER = 99;
var SCENE_ENDING = 10;
var SCENE_STAFFROLL = 11;
//データはここへ
var ASSETS = {
    img_freeway:'img/freeway.png',
    img_8way:'img/8way.png',
    img_4way:'img/4way.png',
    img_buttons:'img/input_btns.png',
    img_keypad_bg:'img/keypad_bg.png',
    img_gameover:'img/gameover.png',
    img_title:'img/title.png',
    img_player:'img/player.png',
    /*
    se_start:'sound/start.mp3',
    se_ok:'sound/ok.mp3',
    se_cancel:'sound/cancel.mp3',
    se_select:'sound/cursor7.mp3',
    bgm_main:'sound/arasuji_06.mp3',
    bgm_gameover:'sound/gameover.mp3',
    */
};

//システムクラス（ゲーム全体で必要な要素を保持する）---------------------------
var System = enchant.Class.create({
    initialize: function(){
        this.score = 0;
        this.rootScene;
        /*ローカルストレージを使うときに
        var data　= get_storage('slide_puzzle');
        if(data){
            this.storage = data;
            for(var i = 0; i < this.storage.length; i++){
                console.log(this.storage[i] + ',');//確認用
            }
        }
        */    
    },
    //シーン切り替え
    changeScene: function(sceneNumber){
        switch(sceneNumber){
            case SCENE_TITLE:
                new TitleScene();
                break;
            case SCENE_MAINGAME:
                new MainGameScene();
                break;
            case SCENE_GAMEOVER:
                new GameoverScene();
                break;
        }
    },
});
//プレイヤー
var Player = enchant.Class.create(enchant.Sprite, {
    initialize: function(w, h){//w, hは幅と高さ
        enchant.Sprite.call(this, w, h);
        
        this.image = core.assets['img_player'];
        this.frame = 0;
        this.status = "ok";
        this.speed = 2;//移動スピード
        this.oblique = this.speed / Math.sqrt(2);//斜めの移動値を算出
    },
    move: function(key){
        switch(key){//入力された方向
            case KEY_UP:
                this.y -= this.speed;
                break;
            case KEY_UP_RIGHT:
                this.y -= this.oblique;
                this.x += this.oblique;
                break;
            case KEY_RIGHT:
                this.x += this.speed;
                break;
            case KEY_DOWN_RIGHT:
                this.y += this.oblique
                this.x += this.oblique;
                break;
            case KEY_DOWN:
                this.y += this.speed;
                break;
            case KEY_DOWN_LEFT:
                this.y += this.oblique;
                this.x -= this.oblique;
                break;
            case KEY_LEFT:
                this.x -= this.speed;
                break;
            case KEY_UP_LEFT:
                this.y -= this.oblique;
                this.x -= this.oblique;
                break;
        }
        ////////////全方向キーパッド用///////////
        this.x += core.input.vx * this.speed;
        this.y += core.input.vy * this.speed;
        //////////////////////////////////
        //移動域チェック
        if(this.y < 0){
            this.y = 0;
        }
        if(this.y > GAME_SCREEN_HEIGHT - this.height){
            this.y = GAME_SCREEN_HEIGHT - this.height;
        }
        if(this.x < 0){
            this.x = 0;
        }
        if(this.x > GAME_SCREEN_WIDTH - this.width){
            this.x = GAME_SCREEN_WIDTH - this.width;
        }
    },
});
    
//メインゲームシーン---------------------------------------------------------------
var MainGameScene = enchant.Class.create(enchant.Scene, {
    initialize: function(){
        enchant.Scene.call(this);
        //画面初期処理-----------------
        core.replaceScene(this);//シーンを入れ替える
        this.backgroundColor = 'rgba(0, 0, 0, 1)';//背景色 
        var screen = new Group();//ゲーム用スクリーン作成
        screen.scaleX = screen.scaleY = 2.5;
        this.addChild(screen);
        var keypad = new Keypad('Free8way');//キーパッド生成
        this.addChild(keypad);//バーチャルパッドをシーンに追加
        system.rootScene = this;
        
        //BGMセット
        //bgm.set(core.assets['bgm_main']);
        //bgm.play();
        
        //自機クラス生成
        var player = new Player(16, 16);
        player.moveTo(120, 200);
        screen.addChild(player);
            
        //得点表示
        var label_score = new MyLabel(10, "sans-serif");
        label_score.moveTo(106, 5);
        screen.addChild(label_score);
               
        //メインゲームシーンのループ処理------------------------------------
        this.addEventListener('enterframe', function(){
            //bgm.loop();//BGMループ再生
            if(keypad.checkBtn("A") == true){
            }
            if(keypad.checkBtn("B") == true){
            }
            if(keypad.checkBtn("start", "start_prev") == KEY_RELEASE){//リリース時にしないとボタンが光るのが見えない
                //bgm.pause();//音楽をポーズ
                //se_ok.play();
                var pauseScene = new PuaseScene();
            }
            //プレイヤー移動
            player.move(keypad.checkDir());
            
            label_score.text = ('00000000' + system.score).slice(-8);//得点表示
        });
    },
});
//ポーズ画面関数（これはpushSceneで画面に表示）------------------------------------------------
var PuaseScene = enchant.Class.create(enchant.Scene, {
    initialize: function(){
        enchant.Scene.call(this);
        //画面初期処理-----------------
        core.pushScene(this);//プッシュで上に出す
        var screen = new Group();//ゲーム用スクリーン作成
        this.addChild(screen);
        var keypad = new Keypad();//キーパッド生成
        this.addChild(keypad);
        
        this.backgroundColor = 'rgba(0, 0, 0, 0.5)';//背景色 (少し暗くする)
        
        //RESUME
        var label_resume = new MyLabel(60, "sans-serif");   
        label_resume.text = "RESUME";
        label_resume.color = "gold";
        label_resume.moveTo(110, 200); 
        screen.addChild(label_resume);
        //TITLE
        var label_title = new MyLabel(60, "sans-serif");   
        label_title.text = "TITLE";//8ケタの0詰め表示
        label_title.color = "gray";
        label_title.moveTo(370, 200); 
        screen.addChild(label_title);
        
        var fade_out = new FadeOut(DISPLAY_SCREEN_WIDTH, DISPLAY_SCREEN_HEIGHT, "black");
        var select = 1;
        var isResume = false;
        //ポーズ画面シーンのループ処理-----------------------------------------
        this.addEventListener('enterframe', function(){
            switch(keypad.checkDir()){
                case KEY_RIGHT:
                    if(select != 0){
                        label_resume.color = "gray";
                        label_title.color = "gold";
                        select = 0;
                        //se_select.play();
                    }
                    break;
                case KEY_LEFT:
                    if(select != 1){
                        label_resume.color = "gold";
                        label_title.color = "gray";
                        select = 1;
                        //se_select.play();
                    }
                    break;
            }
            if(keypad.checkBtn("A") == true){
                if(select == 0){//タイトル画面へ戻る
                    //se_ok.play();
                    fade_out.start(this); 
                }else{//ゲーム再開
                    isResume = true;
                    core.input.A = core.input.A_prev = true;//押した状態にしておかないと解除後にAボタンの処理が動いてしまう
                }
            }
            keypad.checkBtn("B");
            if(keypad.checkBtn("start") == KEY_RELEASE){//スタートボタンリリース時
                keypad.reset();
                isResume = true;
            }
            if(isResume){//再開処理
                //se_cancel.play();
                removeChildren(this);//このシーンの要素を削除
                core.popScene();
            }
            if(fade_out.do(0.05)){//trueが帰ってきたらフェードアウト後の処理へ
                system.score = 0;
                //bgm.stop();
                keypad.reset();
                removeChildren(this);//子要素を削除
                core.popScene();
                removeChildren(system.rootScene);//子要素を削除
                system.changeScene(SCENE_TITLE);//シーンの切り替え
            }
        });
    }
}); 
//タイトル画面シーン-------------------------------------------------------------
var TitleScene = enchant.Class.create(enchant.Scene, {
    initialize: function(){
        enchant.Scene.call(this);
        //画面初期処理-----------------
        core.replaceScene(this);//シーンを入れ替える
        this.backgroundColor = 'rgba(0, 0, 0, 1)';
        var screen = new Group();//ゲーム用スクリーン作成
        this.addChild(screen);
        var keypad = new Keypad();//キーパッド生成
        this.addChild(keypad);
        //var se_start = new SoundEffect();
        //se_start.set(core.assets['se_start'], 1);
        
        //タイトルロゴ画像表示
        var logo_title = new Sprite(640, 300);
        logo_title.image = core.assets['img_title'];
        logo_title.moveTo(0, 50);
        screen.addChild(logo_title);
        
        //PUSH START
        var label_start = new MyLabel(35, "sans-serif");   
        label_start.text = "PUSH START BUTTON";
        label_start.moveTo(180, 430); 
        screen.addChild(label_start);

        //フェードアウト用オブジェクト
        var fade_out = new FadeOut(DISPLAY_SCREEN_WIDTH, DISPLAY_SCREEN_HEIGHT, "black");
        var isStartPushed = false;//スタートボタンチェックフラグ
        //タイトル画面シーンのループ--------------------------------------------------
        this.addEventListener('enterframe', function(){
            keypad.checkDir();
            keypad.checkBtn("A");
            keypad.checkBtn("B");
            if(keypad.checkBtn("start") == true){
                if(isStartPushed == false){//一度しか押させない
                    //se_start.play();
                    isStartPushed = true;//押したよフラグ
                    this.from = this.age;//現在のフレーム時間を保存
                }
            }
            if(isStartPushed == true){//スタートボタンが押された
                if(label_start.visible == true){//スタートボタン点滅処理
                    label_start.visible = false;
                }else{
                    label_start.visible = true;
                }
                if(this.age - this.from > 20){//20フレーム後にフェードアウト
                    fade_out.start(screen);
                }
            }
            if(fade_out.do(0.1)){//trueが帰ってきたらフェードアウト後の処理へ
                removeChildren(this);//子要素を削除
                system.changeScene(SCENE_MAINGAME);//シーンの切り替え
            }
        });
    },
});
//ゲームオーバーシーン（ツイッターや得点の表示）-------------------------------------------------------------
var GameoverScene = enchant.Class.create(enchant.Scene, {
    initialize: function(){
        enchant.Scene.call(this);//シーンクラス呼び出し
        //画面初期処理-----------------
        core.replaceScene(this);//シーンを入れ替える
        this.backgroundColor = 'rgba(0, 0, 0, 1)';//背景色 
        var screen = new Group();//ゲーム用スクリーン作成
        this.addChild(screen);
        var keypad = new Keypad();//キーパッド生成
        this.addChild(keypad);//バーチャルパッドを追加
        //var se_gameover = core.assets['bgm_gameover'];
        //se_gameover.play();
        
        var logo_gameover = new Sprite(500, 200);
        logo_gameover.image = core.assets['img_gameover'];
        logo_gameover.moveTo(60, 50);
        screen.addChild(logo_gameover);
    
        //得点表示
        var label = new MyLabel(50, "sans-serif");   
        label.text = "score : " + ('00000000' + system.score).slice(-8);//8ケタの0詰め表示
        label.x = 100; 
        label.y = 300; 
        label.width = GAME_SCREEN_WIDTH;
        screen.addChild(label);
    
        //TWEET
        var label_tweet = new MyLabel(50, "sans-serif");   
        label_tweet.text = "TWEET";
        label_tweet.color = "gray";
        label_tweet.moveTo(150, 520); 
        //TITLE
        var label_title = new MyLabel(50, "sans-serif");   
        label_title.text = "TITLE";
        label_title.moveTo(370, 520); 
        label_title.color = "gold";
        
        var fade_out = new FadeOut(DISPLAY_SCREEN_WIDTH, DISPLAY_SCREEN_HEIGHT, "black");
    
        this.from = this.age;//経過フレーム計測用
        var isCreateBtn = false;//ボタンを追加したか
        var select = 0;//選択ボタン保持用
        var isEndPushed = false;//一度だけ処理するためのフラグ
        //ゲームオーバーシーンのループ処理------------------------------
        this.addEventListener('enterframe', function(){
            if(this.age - this.from < 40){//一定時間操作できない
                keypad.checkDir();
                keypad.checkBtn("A");
                keypad.checkBtn("B");
                keypad.checkBtn("start");
                return;
            }
            //ボタンを表示させる
            if(isCreateBtn == false){
                screen.addChild(label_tweet);  
                screen.addChild(label_title);
                isCreateBtn = true;
            }
            switch(keypad.checkDir()){
                case KEY_RIGHT://終了
                    label_tweet.color = "gray";
                    label_title.color = "gold";
                    if(select != 0){//一度押したら反応しないように
                        select = 0;
                        //se_select.play();
                    }
                    break;
                case KEY_LEFT://ツイート
                    label_tweet.color = "gold";
                    label_title.color = "gray";
                    if(select != 1){//一度押したら反応しないように
                        select = 1;
                        //se_select.play();
                    }
                    break;
            }
            if(keypad.checkBtn("A") == KEY_RELEASE && isEndPushed == false){
                if(select == 0){
                    isEndPushed = true;
                    //se_ok.play();
                    fade_out.start(screen);
                }else{
                    //se_ok.play();
                    core.input.left = false;//別ウィンドウが開くと反応がおかしくなるのでfalseにしておく
                    core.input.a = false;//別ウィンドウが開くと反応がおかしくなるのでfalseにしておく
                    var text = "aaaaaaaaaaaaaaaaaa";
                    twitter(text);
                }
            }
            keypad.checkBtn("B");
            keypad.checkBtn("start");
            if(fade_out.do(0.05)){//trueが帰ってきたらフェードアウト後の処理へ
                removeChildren(this);//このシーンの要素を削除
                system.changeScene(SCENE_TITLE);//シーン切り替え
            }
        });
    }
});

//プログラム開始初期化処理--------------------------------------
enchant();
var core;//ゲーム基幹
//メインで使う音関係はグローバル（ローカルでは困ることがあった。BGMだけだけど）
var se_ok, se_cancel, se_select, bgm;

window.onload = function(){
    core = new Game(SCREEN_WIDTH, SCREEN_HEIGHT);    
    core.preload(ASSETS);
    core.fps = FPS;
    core.fpsRate = FPS_RATE;
    core.onload = function(){
        //基本効果音・BGMの設定
        /*
        se_ok = new SoundEffect();
        se_ok.set(core.assets['se_ok'], 2);
        se_cancel = new SoundEffect();
        se_cancel.set(core.assets['se_cancel'], 2);
        se_select = new SoundEffect();
        se_select.set(core.assets['se_select'], 2);
        bgm = new Bgm();
        */
        trig = new Trigonometry(0.01);//三角関数クラス
        system = new System();
        //system.changeScene(SCENE_TITLE);
        system.changeScene(SCENE_TITLE);
    }; 
    core.start();
} 
//twitter
function twitter(text){
    var title = "title";
    var url = "https://abcdefg.com/";//ゲームのURLを入れる
    var hashtag = "ミニゲーム";//カンマ区切りで複数可能
    var text = "score:" + system.score;
    window.open("https://twitter.com/intent/tweet?text=【"+title+"】"+text+"&url=" + url+"&hashtags="+hashtag);	
}