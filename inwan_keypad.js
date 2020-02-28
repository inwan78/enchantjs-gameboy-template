/////////////////////////////////////////////////////////////
//キーパッドライブラリ
////////////////////////////////////////////////////////
var KEYPAD_HEIGHT = 300;//キーパッドの高さ
//キー入力関係
var KEY_UP = 1;
var KEY_UP_RIGHT = 3;
var KEY_RIGHT = 2;
var KEY_DOWN_RIGHT = 6;
var KEY_DOWN = 4;
var KEY_DOWN_LEFT = 12;
var KEY_LEFT = 8;
var KEY_UP_LEFT = 9;
var KEY_HOLD = 2;
var KEY_RELEASE = -1;

//*************************************************************************
//バーチャルパッド入力関係
//ここではグローバル変数keypad_disp(Group)に要素を追加している。画面切り替えの際はkeypad_dispを各シーンに追加する
var Keypad = enchant.Class.create(enchant.Group,{
    initialize: function(way){//初期化(引数:4wayで4way、8wayで8way、Freeでフリーウェイに切り替える。デフォルトは4way)
        enchant.Group.call(this);//シーンクラス呼び出し
        
        this.y = SCREEN_HEIGHT - KEYPAD_HEIGHT;//画面下部へ
        
        this.way = way;//4way、8way切替用(0または値無しは4way、それ以外は8way)
        //バーチャルキーパッドの背景
        this.bg = new Sprite(SCREEN_WIDTH, KEYPAD_HEIGHT);
        this.bg.image = core.assets['img_keypad_bg'];
        this.addChild(this.bg);
        
        //Aボタン生成
        this.A_buttons = new A_Buttons();//キーの割り当て
        this.A = new Act_btn(150, 150, 'A');//ボタンクラス生成
        this.A.image = core.assets['img_buttons'];
        this.A.moveTo(480, 30);
        this.A.frame = 2;
        this.A.frame_base = 2;//基準フレーム(シーン切り替え時にずれることがあるので基準を作っておく)
        this.addChild(this.A);
        
        //Bボタン生成
        this.B_buttons = new B_Buttons();//キーの割り当て
        this.B = new Act_btn(150, 150, 'B');//ボタンクラス生成
        this.B.image = core.assets['img_buttons'];
        this.B.moveTo(320, 100);
        this.B.frame = 4;
        this.B.frame_base = 4;
        this.addChild(this.B);
        
        //スタートボタン生成
        this.start_buttons = new Start_Buttons();//キーの割り当て
        this.start = new Act_btn(150, 30, 'start');//ボタンクラス生成
        this.start.image = core.assets['img_buttons'];
        this.start.moveTo(320, 20);
        this.start.frame = 0;
        this.start.frame_base = 0;
        this.addChild(this.start);    
        
        //方向キーパッド生成
        switch(this.way){
            case 'Free':
                this.direction = new Dir_freeWay(300, 300);
                this.direction.image = core.assets['img_freeway'];
                break;
            case 'Free8way':
                this.direction = new Dir_free8Way(300, 300);
                this.direction.image = core.assets['img_freeway'];
                break;
            case '8way':
                this.direction = new Dir_8keys(300, 300);
                this.direction.image = core.assets['img_8way'];
                break;
            case '4way':
            default:
                this.direction = new Dir_4keys(300, 300);
                this.direction.image = core.assets['img_4way'];
                break;
        }
        this.direction.frame = 0;
        this.addChild(this.direction);
        
        //ゲームコントローラー用に割り当て
        core.keybind(87, 'w');//キーの割り当て(上)
        core.keybind(68, 'd');//キーの割り当て(右)
        core.keybind(83, 's');//キーの割り当て(下)
        core.keybind(65, 'a');//キーの割り当て(左)
        //FreeWay用変数用意
        core.input.vx = 0;
        core.input.vy = 0;
    },
    checkDir: function(){//方向キー入力チェックと画像の切り替え
        var direction = 0;//初期化
        this.direction.frame = 0;//初期化
        if(core.input.up || core.input.w){
            direction += KEY_UP;
        }
        if(core.input.right || core.input.d){
            direction += KEY_RIGHT;  
        }
        if(core.input.down || core.input.s){
            direction += KEY_DOWN;   
        }
        if(core.input.left || core.input.a){
            direction += KEY_LEFT;
        }
        switch(this.way){
            case 'Free':
                if(core.input.angle >= 0){
                    this.direction.rotation = core.input.angle + 90; 
                    this.direction.frame = 1;
                }
                return direction;//これだけ内容が違うので抜ける
            case 'Free8way':
                var angle = [-1, 0, 90, 45, 180, -1, 135, -1, 270, 315, -1, -1, 225, -1, -1, -1];//8wayボタンに対応した角度(押していない、または正しくないボタンの組み合わせはー1)
                break;
            case '8way':
                var angle = [-1, 0, 90, 45, 180, -1, 135, -1, 270, 315, -1, -1, 225, -1, -1, -1];//8wayボタンに対応した角度(押していない、または正しくないボタンの組み合わせはー1)
                break;
            case '4way':
            default:
                var angle = [-1, 0, 90, -1, 180, -1, -1, -1, 270, -1, -1, -1, -1, -1, -1, -1];//4wayボタンに対応した角度(押していない、または正しくないボタンの組み合わせはー1)
                break;
        }
        this.direction.rotation = angle[direction];
        if(angle[direction] >= 0){
            this.direction.frame = 1;
        }
        return direction;
    },
    //ボタンの入力チェック
    checkBtn: function(key){
        this[key+'_buttons'].check();
        if(core.input[key]){
            this[key].frame = this[key].frame_base + 1;//フレーム切替
            if(core.input[key+'_prev'] == false){
                core.input[key+'_prev'] = true;
                return true;//押されたとき
            }
            return KEY_HOLD;//押しっぱなし
        }else{
            this[key].frame = this[key].frame_base;//フレーム切替
            if(core.input[key+'_prev'] == true){
                core.input[key+'_prev'] = false;
                return KEY_RELEASE;//ボタンを離した時(重要でないならfalseでも良い)
            }
            return false;//押されていない
        }
    },
    //キーパッドの入力をリセットする（ボタンではなくタッチイベントで処理したときにおかしくなることがあるため）
    reset: function(){
        this.A.clearEventListener("touchstart");
        this.A.clearEventListener("touchmove");
        this.A.clearEventListener("touchend");
        this.B.clearEventListener("touchstart");
        this.B.clearEventListener("touchmove");
        this.B.clearEventListener("touchend");
        this.start.clearEventListener("touchstart");
        this.start.clearEventListener("touchmove");
        this.start.clearEventListener("touchend");
        this.direction.clearEventListener("touchstart");
        this.direction.clearEventListener("touchmove");
        this.direction.clearEventListener("touchend");
        core.input.up = core.input.right = core.input.down = core.input.left = false;
        core.input.A = core.input.A_prev = core.input.B = core.input.B_prev = false;
    }
});
//*************************************************************************
//内容:アクションボタン(Aボタン、Bボタンなど)
//説明:各ボタンスプライト作成と対応ボタンの設定
var Act_btn = enchant.Class.create(enchant.Sprite, {
    initialize: function(w, h, key){//w, hは幅と高さ、codeはアスキーコード、keyはボタン、prevはボタンの前フレーム状態保存用
        enchant.Sprite.call(this, w, h, key);
        
        core.input[key+'_prev'] = false;//全フレームのボタン状態の初期化(押されていない状態)
        //ボタン表示
        this.addEventListener("touchstart", function(){
            core.input[key] = true;
        });
        this.addEventListener("touchend", function(){
            core.input[key] = false;
        });
    }
}); 
//Aボタンの割り当て（コントローラー対応のため複数ある）
var A_Buttons = enchant.Class.create({
    initialize: function(){
        core.keybind(88, 'x');//x
        core.input.x_prev = false;
        core.keybind(51, 'no3');//3キーの割り当て
        core.input.no3_prev = false;
        core.keybind(97, 'T1');//テンキー1キーの割り当て
        core.input.T1_prev = false;
    },
    check: function(){//ボタンが押されたかのチェック
        subKeyCheck('A', 'x');
        subKeyCheck('A', 'no3');
        subKeyCheck('A', 'T1');
    }
});
//Bボタンの割り当て（コントローラー対応のため複数ある）
var B_Buttons = enchant.Class.create({
    initialize: function(){
        core.keybind(90, 'z');//z
        core.input.z_prev = false;
        core.keybind(50, 'no2');//2キーの割り当て
        core.input.no2_prev = false;
        core.keybind(96, 'T0');//テンキー0の割り当て
        core.input.T0_prev = false;
    },
    check: function(){//ボタンが押されたかのチェック
        subKeyCheck('B', 'z');
        subKeyCheck('B', 'no2');
        subKeyCheck('B', 'T0');
    }
});
//startボタンの割り当て（コントローラー対応のため複数ある）
var Start_Buttons = enchant.Class.create({
    initialize: function(){
        core.keybind(13, 'enter');//エンターキー
        core.input.enter_prev = false;
            },
    check: function(){//ボタンが押されたかのチェック
        subKeyCheck('start', 'enter');
    }
});
//サブキーが押されたかのチェック
function subKeyCheck(key, sub){
    if(core.input[sub]){//キー押した
        core.input[key] = true;
        core.input[sub+'_prev'] = true;
    }else if(core.input[sub+'_prev']){//キーアップの判定
        core.input[key] = false;
        core.input[sub+'_prev'] = false;
    }
}
//*************************************************************************
//内容:8方向キーパッド
//説明:8方向に対応したキーパッドの処理
var Dir_8keys = enchant.Class.create(enchant.Sprite, {
    initialize: function(w, h){//w, hは幅と高さ
        enchant.Sprite.call(this, w, h);
    
        this.center_x = this.width*0.5;//画像の半分の位置
        this.center_y = this.height*0.5 + SCREEN_HEIGHT - KEYPAD_HEIGHT;//画像の半分の位置＋画面内の位置
        this.addEventListener("touchstart", function(event){//タッチスタート
            this.check_8way(core.input, event);
        });
        this.addEventListener("touchmove",function(event){//タッチムーブ
            this.check_8way(core.input, event);
        });
        this.addEventListener("touchend",function(event){//タッチエンド
            core.input.up = core.input.down = core.input.left = core.input.right = false;//すべて初期化(押されていない状態)
        });
    },
    //８ウェイキーパッド
    check_8way: function(input, event){
        var x = event.x - (this.x + this.center_x);//キー画像の中心位置からの距離を出す
        var y = event.y - (this.y + this.center_y);//キー画像の中心位置からの距離を出す
    
        input.up = input.down = input.right = input.left = false;//ボタンを初期化(押されていない状態)
    
        if(circleCollision(event.x, event.y, 1, this.x+this.center_x, this.y+this.center_y, 10)){//キーパッドの真ん中の部分は反応しない
            return;
        }
    
        var abs_x = Math.abs(x);//絶対値を出しておく(何回か必要になることは先に計算しておく)
        var abs_y = Math.abs(y);
        if(abs_x > abs_y){//xの方が大きい場合左右移動となる
            if(x < 0){//マイナスであれば左
                input.left = true;
            }else{
                input.right = true;
            }
            if(abs_x <= abs_y * 2){//2yがxより大きい場合斜め入力と判断
                if(y < 0){//マイナスであれば上
                    input.up = true;
                }else{
                    input.down = true;
                }
            }
        }else{//yの方が大きい場合上下移動となる
            if(y < 0){//マイナスであれば上
                input.up = true;
            }
            if(y >= 0){
                input.down = true;
            }
            if(abs_y <= abs_x * 2){//2xがyより大きい場合斜め入力と判断
                if(x < 0){//マイナスであれば左
                    input.left = true;
                }else{
                    input.right = true;
                }
            }
        }    
    }
    
});
//*************************************************************************
//内容:４方向キーパッド
//説明:4方向に対応したキーパッドの処理
var Dir_4keys = enchant.Class.create(enchant.Sprite, {
    initialize: function(w, h){//w, hは幅と高さ
        enchant.Sprite.call(this, w, h);
    
        this.center_x = this.width*0.5;//画像の半分の位置
        this.center_y = this.height*0.5 + SCREEN_HEIGHT - KEYPAD_HEIGHT;//画像の半分の位置＋画面内の位置
        this.addEventListener("touchstart", function(event){//タッチスタート
            this.check_4way(core.input, event);
        });
        this.addEventListener("touchmove",function(event){//タッチムーブ
            this.check_4way(core.input, event);
        });
        this.addEventListener("touchend",function(event){//タッチエンド
            core.input.up = core.input.down = core.input.left = core.input.right = false;//すべて初期化(押されていない状態)
        });
    },
    //キー入力チェック
    check_4way: function(input, event){//引数はcore.input、event
        var x = event.x - (this.x + this.center_x);//キー画像の中心位置からの距離を出す
        var y = event.y - (this.y + this.center_y);//キー画像の中心位置からの距離を出す
        input.up = input.down = input.right = input.left = false;//ボタンを初期化(押されていない状態)
        if(circleCollision(event.x, event.y, 1, this.x+this.center_x, this.y+this.center_y, 10)){//キーパッドの真ん中の部分は反応しない
            return;
        }
        if(Math.abs(x) > Math.abs(y)){//xの方が大きい場合左右移動となる
            if(x < 0){//マイナスであれば左
                input.left = true;
            }else{
                input.right = true;
            }
        }else{//yの方が大きい場合上下移動となる
            if(y < 0){//マイナスであれば上
                input.up = true;
            }else{
                input.down = true;
            }
        }    
    }
});
//*************************************************************************
//内容:全方向キーパッド
//説明:全方向に対応したキーパッドの処理
//三角関数クラスtrigが別に必要
var Dir_freeWay = enchant.Class.create(enchant.Sprite, {
    initialize: function(w, h){//w, hは幅と高さ
        enchant.Sprite.call(this, w, h);
        core.input.vx = 0;
        core.input.vy = 0;
        this.sqrt = Math.sqrt;//数学関数は持っておいた方が処理が速いらしい
        this.addEventListener("touchstart", function(event){//タッチスタート
            this.center_x = event.x;
            this.center_y = event.y;
        });
        this.addEventListener("touchmove",function(event){//タッチムーブ
            var vecY = event.y - this.center_y;
            var vecX = event.x - this.center_x;
            var vec = this.sqrt(vecX * vecX + vecY * vecY);//移動量を計算
            if(vec < 20){//移動量が一定以下は動かさない
                core.input.vx = 0;
                core.input.vy = 0;
                core.input.angle = -1;//方向が無い場合はマイナスにしておく
                return;
            }
            var angle = trig.getAimAngle(event.x, event.y, this.center_x, this.center_y);
            var result = trig.getData(angle);
            if(vec > 60){//移動幅が大きいときは中心も移動させる
                this.center_x = event.x - result.cos * 60;
                this.center_y = event.y - result.sin * 60;
            }
            core.input.vx = result.cos;
            core.input.vy = result.sin;
            core.input.angle = result.deg;
        });
        this.addEventListener("touchend", function(event){//タッチエンド
            core.input.vx = 0;
            core.input.vy = 0;
            core.input.angle = -1;//押してない時はマイナスにしておく
        });
    },
});
//*************************************************************************
//内容:ボタン表示なし8方向キーパッド
//説明:8方向に対応したキーパッドの処理
//三角関数クラスtrigが別に必要
var Dir_free8Way = enchant.Class.create(enchant.Sprite, {
    initialize: function(w, h){//w, hは幅と高さ
        enchant.Sprite.call(this, w, h);
        core.input.vx = 0;
        core.input.vy = 0;
        this.sqrt = Math.sqrt;//数学関数は持っておいた方が処理が速いらしい
        this.addEventListener("touchstart", function(event){//タッチスタート
            this.center_x = event.x;
            this.center_y = event.y;
        });
        this.addEventListener("touchmove",function(event){//タッチムーブ
            core.input.up = core.input.down = core.input.left = core.input.right = false;//すべて初期化(押されていない状態)
            var vecY = event.y - this.center_y;
            var vecX = event.x - this.center_x;
            var vec = this.sqrt(vecX * vecX + vecY * vecY);//移動量を計算
            if(vec < 20){//移動量が一定以下は動かさない
                core.input.vx = 0;
                core.input.vy = 0;
                core.input.angle = -1;//方向が無い場合はマイナスにしておく
                return;
            }
            var x = event.x - (this.center_x);//キー画像の中心位置からの距離を出す
            var y = event.y - (this.center_y);//キー画像の中心位置からの距離を出す
            
            var abs_x = Math.abs(x);//絶対値を出しておく(何回か必要になることは先に計算しておく)
            var abs_y = Math.abs(y);
            if(abs_x > abs_y){//xの方が大きい場合左右移動となる
                if(x < 0){//マイナスであれば左
                    core.input.left = true;
                }else{
                    core.input.right = true;
                }
                if(abs_x <= abs_y * 2){//2yがxより大きい場合斜め入力と判断
                    if(y < 0){//マイナスであれば上
                        core.input.up = true;
                    }else{
                        core.input.down = true;
                    }
                }
            }else{//yの方が大きい場合上下移動となる
                if(y < 0){//マイナスであれば上
                    core.input.up = true;
                }
                if(y >= 0){
                    core.input.down = true;
                }
                if(abs_y <= abs_x * 2){//2xがyより大きい場合斜め入力と判断
                    if(x < 0){//マイナスであれば左
                        core.input.left = true;
                    }else{
                        core.input.right = true;
                    }
                }
            }    
            //中心から離れすぎていた場合に中心位置をずらす
            var angle = trig.getAimAngle(event.x, event.y, this.center_x, this.center_y);
            var result = trig.getData(angle);
            if(vec > 60){//移動幅が大きいときは中心も移動させる
                this.center_x = event.x - result.cos * 60;
                this.center_y = event.y - result.sin * 60;
            }
        });
        this.addEventListener("touchend", function(event){//タッチエンド
            core.input.up = core.input.down = core.input.left = core.input.right = false;//すべて初期化(押されていない状態)
            core.input.vx = 0;
            core.input.vy = 0;
            core.input.angle = -1;//押してない時はマイナスにしておく
        });
    },
});

    