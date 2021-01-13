var Splash = function(){
    this.preload = function(){
        game.load.script("states/Intro");
        game.load.script("states/Gameplay");
        //background images
        game.load.image('water1', 'assets/water1.png');
        game.load.image('water2', 'assets/water2.png');
        game.load.image('water3', 'assets/water3.png');
        game.load.image('ground', 'assets/ground.png');
        game.load.image('sky', 'assets/sky.png');
        //active images
        game.load.spritesheet('torpedo1', 'assets/torpedo1anim.png', 82, 19);
        game.load.spritesheet('bubbles', 'assets/bubbles.png', 5, 5);
        game.load.image('submarine', 'assets/submarine.png');
        game.load.spritesheet('collectables', 'assets/collectables.png',52,52);
        //fonts
        game.load.bitmapFont('8bitwonder', 'assets/fonts/font.png', 'assets/fonts/font.xml');
        game.load.bitmapFont('8bitwonder_black', 'assets/fonts/font_black.png', 'assets/fonts/font_black.xml');
        //ui
        game.load.image('white_bar', 'assets/white_bar.png');
        game.load.image('orange_bar', 'assets/orange_bar.png');
        game.load.image('white', 'assets/white.png');
        game.load.image('dark', 'assets/dark.png');
        game.load.image('endgame', 'assets/endgame.png');
        game.load.image('shop', 'assets/shop.png');
        game.load.spritesheet('button', 'assets/button.png', 123, 70);
        game.load.spritesheet('music_button', 'assets/music.png', 13, 13);
        game.load.image('launch_text', 'assets/launch_text.png');
        game.load.image('hud', 'assets/hud.png');
        game.load.spritesheet('shop_text', 'assets/shop_text.png', 57, 17);
        game.load.spritesheet('shop_icons', 'assets/shop_icons.png', 60, 60);
        game.load.spritesheet('buy', 'assets/button2.png', 123, 70);
        game.load.spritesheet('lights', 'assets/lights.png', 101, 99);
        game.load.image('menu_text', 'assets/menu_text.png');
        game.load.image('achievement', 'assets/achievement.png');
        //sounds
        game.load.audio('day44', 'assets/sound/inmusic.ogg');				//https://www.reddit.com/r/gamedev/comments/362c72/i_made_a_bunch_of_music_feel_free_to_use_it_in/
        game.load.audio('explosion_sound', 'assets/sound/explode.ogg'); // http://soundbible.com/1986-Bomb-Exploding.html (legal attribution 3.0)
        game.load.audio('sub_ambient', 'assets/sound/sub_ambient.ogg');
        game.load.audio('over', 'assets/sound/Hit_Hurt.ogg');
        game.load.audio('select', 'assets/sound/Pickup_Coin.ogg');
        game.load.audio('upgrade', 'assets/sound/Powerup.ogg');
        //intro #002020;
        game.load.image('panel_1_2', 'assets/intro/panel_1_2.png');
        game.load.image('panel_1_2_text', 'assets/intro/panel_1_2text.png');
        game.load.image('panel_3', 'assets/intro/panel3.png');
        game.load.image('panel_3_text', 'assets/intro/fireall_text.png');
        game.load.spritesheet('panel_4', 'assets/intro/panel4strip.png', 211, 154);
        game.load.image('panel_4_text', 'assets/intro/panel4text.png');
        game.load.image('panel_5', 'assets/intro/final.png');
        game.load.image('panel_5_text', 'assets/intro/final_text.png');
        
        this.status = game.add.bitmapText(game.world.centerX, game.world.centerY, '8bitwonder','0',81);
        this.status.anchor.set(0.5);
        this.load.onFileComplete.add(this.fileComplete, this);
        this.load.onLoadComplete.add(this.loadComplete, this);
        
    };
    this.fileComplete = function(){
        this.status.text = this.load.progress;
    };
    this.loadComplete = function(){
        game.state.add('Intro', Intro);
        game.state.add('Gameplay', Gameplay);
        game.state.start('Intro');
    }
};
