enchant();

var core;
var inputYourLife = 10;
var inputYourAttack = 1;
var inputEnemyLife = 10000;
var inputEnemyAttack = 2;

window.onload = function() {

    core = new Core(320, 320);
    core.fps = 15;
    core.preload("avatarBg1.png", "avatarBg2.png", "avatarBg3.png", "monster/bigmonster1.gif");
    core.preload("start.png", "gameover.png", "clear.png");

    core.onload = function() {
        core.replaceScene(createStartScene());
    };

    core.start();
};

/**
 * パラメータ編集
 */
function editData(){
    try {
        inputYourLife = getIntValue("your-life");
        inputYourAttack = getIntValue("your-attack");
        inputEnemyLife = getIntValue("enemy-life");
        inputEnemyAttack = getIntValue("enemy-attack");
        core.replaceScene(createStartScene());
    } catch(e) {
        alert("うまく動かなかった。\r\nやり直してね。");
    }
}

/**
 * int型の値を取得
 */
function getIntValue(id) {
    var value = document.getElementById(id).value;
    if (!isFinite(value)) {
        throw "Invalid data";
    }
    return parseInt(value);
}

/**
 * タイトルシーン
 */
function createStartScene() {
    var scene = new Scene();
    scene.backgroundColor = '#3cb371';
    var startImage = new Sprite(236, 48);
    startImage.image = core.assets['start.png'];
    startImage.x = 42;
    startImage.y = 136;
    scene.addChild(startImage);

    var title = new Label('敵を倒そう！');
    title.textAlign = 'center';
    title.color = '#ffffff';
    title.x = 20;
    title.y = 96;
    title.font = '28px sans-serif';
    scene.addChild(title);

    startImage.addEventListener(Event.TOUCH_START, function(e) {
        core.replaceScene(createGameScene());
    });

    return scene;
};

/**
 * ゲームシーン
 */
function createGameScene() {
    var scene = new Scene();

    /* 背景:砂漠 */
    var bg = new AvatarBG(0);
    scene.addChild(bg);
    scene.backgroundColor = "#303030";

    /*
     * キー割り当て
     *
     * [space]キー：b
      */
    core.keybind(' '.charCodeAt(0), 'b');

    /*
     * アバター
     *
     * 以下のアバターエディタで性別・武器・服などを組み合わせて生成されたコードをAvatarのコンストラクタに設定する.
     * http://9leap.net/games/1383/
     * Chromeだと動かなかった.
     */
    var avatar = new Avatar("2:6:1:2009:21013:22480");
    avatar.moveTo(30, 100);
    avatar.action = "run";
    avatar.life = parseInt(inputYourLife);
    avatar.attack = parseInt(inputYourAttack);
    scene.addChild(avatar);

    /* エネミー */
    var enemy = new AvatarMonster(core.assets["monster/bigmonster1.gif"]);
    enemy.moveTo(210, 80);
    enemy.action = "walk";
    enemy.life = parseInt(inputEnemyLife);
    enemy.attack = parseInt(inputEnemyAttack);
    scene.addChild(enemy);

    /* アバター動作 */
    avatar.addEventListener('enterframe', function() {
        /* 左右のみ移動可 */
        if (core.input.left) this.x -= 5;
        if (core.input.right) this.x += 5;

        if (this.x <= 0) this.x = 0;
        if (this.x > 260) this.x = 260;

        /** 攻撃 */
        if (core.input.b) {
            avatar.action = "attack";
            if (this.intersect(enemy) && enemy.life > 0) {
                enemy.life -= avatar.attack;
            }
        }

        if (avatar.life <= 0) avatar.action = "dead";

        avatarLifeBar.width = avatar.life * (200 / inputYourLife);

        if (avatar.life == 0) {
            core.replaceScene(createGameoverScene());
        }
    });

    /* エネミー動作 */
    enemy.addEventListener('enterframe', function() {
        /** 攻撃 */
        if (core.frame % 100 == 0) {
            enemy.action = "attack";
            if (this.intersect(avatar) && avatar.life > 0) {
                avatar.action = "damage";
                avatar.life -= enemy.attack;
            }
        }

        enemyLifeBar.width = enemy.life * (200 / inputEnemyLife);

        if (enemy.life <= 0) {
            enemy.action = "dead";
            core.replaceScene(createGameclearScene());
        }
    });

    /* 操作説明 */
    var label = new Label('移動： ←→<br>攻撃：スペース');
    label.color = '#ffffff';
    label.font = '20px sans-serif';
    label.x = 10;
    label.y = 220;
    scene.addChild(label);

    /* アバターライフゲージ */
    var avatarLife = new Label('Your Life');
    avatarLife.color = '#ffffff';
    avatarLife.font = '20px sans-serif';
    avatarLife.x = 10;
    avatarLife.y = 180;
    scene.addChild(avatarLife);

    var avatarLifeBar = new Entity();
    avatarLifeBar.width = 200;
    avatarLifeBar.height = 15;
    avatarLifeBar.backgroundColor = '#00ff00';
    avatarLifeBar.x = 110;
    avatarLifeBar.y = 180;
    scene.addChild(avatarLifeBar);

    /* エネミーライフゲージ */
    var enemyLife = new Label('Enemy Life');
    enemyLife.color = '#ffffff';
    enemyLife.font = '20px sans-serif';
    enemyLife.x = 10;
    enemyLife.y = 200;
    scene.addChild(enemyLife);

    var enemyLifeBar = new Entity();
    enemyLifeBar.width = 200;
    enemyLifeBar.height = 15;
    enemyLifeBar.backgroundColor = '#ff0000';
    enemyLifeBar.x = 110;
    enemyLifeBar.y = 200;
    scene.addChild(enemyLifeBar);

    return scene;
};

/**
 * ゲームクリアシーン
 */
function createGameclearScene() {
    var scene = new Scene();
    scene.backgroundColor = '#303030';

    var gameclearImage = new Sprite(189, 97);
    gameclearImage.image = core.assets['clear.png'];
    gameclearImage.x = 65;
    gameclearImage.y = 112;
    scene.addChild(gameclearImage);

    var retryButton = new Button("もう一度遊ぶ", "light");
    retryButton.moveTo(110,230);
    scene.addChild(retryButton);
    retryButton.ontouchstart = function(){
        core.replaceScene(createStartScene());
    }

    return scene;
};

/**
 * ゲームオーバーシーン
 */
function createGameoverScene() {
    var scene = new Scene();
    scene.backgroundColor = '#303030';

    var gameoverImage = new Sprite(189, 97);
    gameoverImage.image = core.assets['gameover.png'];
    gameoverImage.x = 65;
    gameoverImage.y = 112;
    scene.addChild(gameoverImage);

    var retryButton = new Button("もう一度遊ぶ", "light");
    retryButton.moveTo(110,230);
    scene.addChild(retryButton);
    retryButton.ontouchstart = function(){
        core.replaceScene(createStartScene());
    }

    return scene;
};
