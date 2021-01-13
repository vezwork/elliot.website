var Gameplay = function(){

    var state = "game",
        xspeed = 1,
        yspeed = 0,
        distance = 0,
        money = 110,
        run_money = 0,
        turbo = 1000,
        shake = 0,
        top_speed = 0,
        start_time = 0,
        total_time = 0,
        top_depth = -3000;

    var hull_co = 1,
        start_co = 1,
        boost_co = 1,
        depth_co = 1,
        speed_co = 1,
        weight_co = 1;

    var coin_dists = [[0,0,1,0,0,
                       0,1,0,1,0,
                       1,0,0,0,1,
                       0,1,0,1,0,
                       0,0,1,0,0],
                      [1,0,0,0,1,
                       0,1,0,1,0,
                       0,0,1,0,0,
                       0,1,0,1,0,
                       1,0,0,0,1],
                      [1,1,1,1,1,
                       0,0,0,0,0,
                       1,1,1,1,1,
                       0,0,0,0,0,
                       1,1,1,1,1],
                      [1,1,1,1,1,
                       1,0,0,0,1,
                       1,0,0,0,1,
                       1,0,0,0,1,
                       1,1,1,1,1]];
    var dist_mark = 0,
        health = 0,
        sub_count = 4;

    var achievement_ani = 0;

    var coin_achievement = false,
        die_achievement = false,
        speed_achievement = 0;
                       
    this.preload = function() {
        
    }

    this.create = function() {
        game.physics.startSystem(Phaser.Physics.ARCADE);

        music = game.add.audio('day44');
        music2 = game.add.audio('sub_ambient');
        over_sound = game.add.audio('over');
        select_sound = game.add.audio('select');
        upgrade_sound = game.add.audio('upgrade');
        
        fx = game.add.audio('explosion_sound');
        
        game.world.setBounds(0, 0, game.width, 3000);
        game.stage.backgroundColor = 0x35358a;
        
        water3 = game.add.tileSprite(0, 434, 800, 320, 'water3');
        background2 = game.add.tileSprite(0, 2400, 800, 124, 'ground');
        background = game.add.tileSprite(0, 2600, 800, 124, 'ground');
        ground = game.add.tileSprite(0, 2800, 800, 124, 'ground');
        shadow = game.add.sprite(205, 505, 'torpedo1');
        rightEmitter = game.add.emitter(0, 0);
        sky = game.add.tileSprite(0,0,game.width,434,'sky');
        water2 = game.add.tileSprite(0, 400, 800, 41, 'water2');
        torpedo = game.add.sprite(200, 500, 'torpedo1');
        submarine = game.add.sprite(-800,500, 'submarine');
        water1 = game.add.tileSprite(0, 405, 800, 31, 'water1');
        
        collect = game.add.group();
        collect.enableBody = true;
        game.physics.arcade.enable(torpedo);
        torpedo.body.setSize(10, 10, 0, 0);
        
        
        water3.scale.set(2,2);
        submarine.scale.set(2,2);
        
        water2.scale.set(2,2);
        
        background2.alpha = 0.10;
        background2.scale.set(2,2);
        
        background.alpha = 0.25;
        background.scale.set(2,2);
        
        ground.scale.set(2,2);
        
        shadow.anchor.set(0.5);
        shadow.scale.set(2,2);
        shadow.tint = 0x000000;
        shadow.alpha = 0.6;
        
        
        rightEmitter.setXSpeed(-100, -200);
        rightEmitter.setYSpeed(-50, 50);
        rightEmitter.gravity = -100;
        rightEmitter.minParticleScale = 2;
        rightEmitter.maxParticleScale = 4;    
        rightEmitter.makeParticles('bubbles', [0,1], 40, 1, false);
        rightEmitter.height = 30;

        rightEmitter.start(false, 600, 400);
        
        
        torpedo.anchor.set(0.5);
        torpedo.scale.set(2,2);
        water1.scale.set(2,2);
        
        cursors = game.input.keyboard.createCursorKeys();
        
        spin = torpedo.animations.add('spin');
        torpedo.animations.play('spin', 30, true);
        
        
        HUD = game.add.group();
        {
        distance_text = game.add.bitmapText(10, 10, '8bitwonder','0m',27);
        HUD.add(distance_text);
        
        run_money_text = game.add.bitmapText(10, 35, '8bitwonder','money 0',18);
        HUD.add(run_money_text);
        
        speed_title = game.add.bitmapText(28, game.height - 75, '8bitwonder','speed',18)
        speed_text = game.add.bitmapText(6, game.height - 55, '8bitwonder','0',54);
        HUD.add(speed_title); HUD.add(speed_text); 
        
        thrust_title = game.add.bitmapText(250, game.height - 50, '8bitwonder','thrust',27)
        turbo_bar = game.add.tileSprite(250, game.height - 23, 200, 15, 'white_bar');
        HUD.add(thrust_title); HUD.add(turbo_bar);
        
        hud_image = game.add.sprite(0, game.height - 132, 'hud');
        hud_image.scale.set(2,2);
        HUD.add(hud_image);
        
        HUD.fixedToCamera = true;
        }
        
        game_end = game.add.group();
        {
        var game_endLM = game.width / 2 - 400
        
        progress_bar_back = game.add.tileSprite(game_endLM + 162, 292, 520, 30, 'orange_bar');
        game_end.add(progress_bar_back);
        
        progress_bar = game.add.tileSprite(game_endLM + 162, 292, 2, 30, 'white_bar');
        progress_bar.alpha = 0.5;
        game_end.add(progress_bar);
        
        endgame = game.add.image(game_endLM,0, "endgame");
        endgame.scale.set(2,2);
        game_end.add(endgame);
        
        button1 = game.add.button(game_endLM + 10, 430, 'button', function(){ if (state != "game_transition") {select_sound.play(); } }, this, 1, 0, 2);
        button1.scale.set(2,2);
        button1.input.useHandCursor = true;
        game_end.add(button1);
        button1.events.onInputOver.add(function() {
                over_sound.play();
        }, this);
        //disable for now
        button1.inputEnabled = false;
        button1.alpha = 0.5;
        
        menu_text = game.add.image(game_endLM + 70,478,'menu_text');
        menu_text.scale.set(2,2);
        game_end.add(menu_text);
        
        button2 = game.add.button(game_endLM + 276, 430, 'button', function(){ 
            fx.pause();
            if (state == "end") {
                state="shop"; 
                shake = 0; 
                game_end.x = 0; 
                game_end.y = 0;
                music2.loopFull(0.6);
            } else if (state == "shop"){
                state="end"; 
                music2.pause();
                select_sound.play();
            } 
        }, this, 1, 0, 2);

        button2.scale.set(2,2);
        button2.input.useHandCursor = true;
        game_end.add(button2);
        button2.events.onInputOver.add(function() {
                over_sound.play();
        }, this);
        
        shop_text = game.add.image(game_endLM + 346,478,'shop_text');
        shop_text.scale.set(2,2);
        game_end.add(shop_text);
        
        button3 = game.add.button(game_endLM + 542, 430, 'button', function(){ 
            if (state != "game_transition" && state != "game") {
                state = "game_transition"; 
                select_sound.play(); 
                music.play();
                music2.pause();
            }
        }, this, 1, 0, 2);
        button3.scale.set(2,2);
        button3.input.useHandCursor = true;
        game_end.add(button3);
        button3.events.onInputOver.add(function() {
                over_sound.play();
        }, this);
        
        launch_text = game.add.image(game_endLM + 582,478,'launch_text');
        launch_text.scale.set(2,2);
        game_end.add(launch_text);
        
        
        //stat text
        {
        stattext1 = game.add.bitmapText(game_endLM + 120, 70, '8bitwonder_black','distance     '+ distance, 18);
        stattext2 = game.add.bitmapText(game_endLM + 120, 100, '8bitwonder_black','top speed   '+ 0, 18);
        stattext3 = game.add.bitmapText(game_endLM + 120, 130, '8bitwonder_black','time alive  '+ 0, 18);
        stattext4 = game.add.bitmapText(game_endLM + 120, 160, '8bitwonder_black','money         '+ 0, 18);
        game_end.add(stattext1); game_end.add(stattext2); game_end.add(stattext3); game_end.add(stattext4);
        stattext5 = game.add.bitmapText(game_endLM + 450, 70, '8bitwonder_black','best depth  '+ 0, 18);
        stattext6 = game.add.bitmapText(game_endLM + 450, 100, '8bitwonder_black','subs hit       '+sub_count, 18);
        stattext7 = game.add.bitmapText(game_endLM + 450, 130, '8bitwonder_black','fill       '+ 0, 18);
        stattext8 = game.add.bitmapText(game_endLM + 450, 160, '8bitwonder_black','fill       '+ 0, 18);
        game_end.add(stattext5); game_end.add(stattext6); game_end.add(stattext7); game_end.add(stattext8);
        }
        
        //shop
        {
        //shop icons
        {
        shop_button1 = game.add.button(game_endLM + 50, 2140, 'shop_icons', function(){ 
            if (state == "shop") {
                select_sound.play();
                shop_title.text= "hull\npower"; 
                shop_price.text= (hull_co==10)?"ful":""+150*hull_co;
                unSelectShop();
                shop_button1.setFrames(1,1,1);
            }
        }, this, 1, 1, 1);
        shop_button1.scale.set(2,2);
        shop_button1.input.useHandCursor = true;
        game_end.add(shop_button1);
        shop_button2 = game.add.button(game_endLM + 260, 2140, 'shop_icons', function(){ 
            if (state == "shop") {
                select_sound.play(); 
                shop_title.text = "start\nspeed"; 
                shop_price.text= (start_co==10)?"ful":""+140*start_co;
                unSelectShop();
                shop_button2.setFrames(3,3,3);
            }
        }, this, 3, 2, 3);
        shop_button2.scale.set(2,2);
        shop_button2.input.useHandCursor = true;
        game_end.add(shop_button2);
        shop_button3 = game.add.button(game_endLM + 460, 2140, 'shop_icons', function(){ 
            if (state == "shop") {
                select_sound.play(); 
                shop_title.text = "boost\nsize"; 
                shop_price.text= (boost_co==10)?"ful":""+130*boost_co;
                unSelectShop();
                shop_button3.setFrames(5,5,5);
            }
        }, this, 5, 4, 5);
        shop_button3.scale.set(2,2);
        shop_button3.input.useHandCursor = true;
        game_end.add(shop_button3);
        shop_button4 = game.add.button(game_endLM + 50, 2350, 'shop_icons', function(){ 
            if (state == "shop") {
                select_sound.play(); 
                shop_title.text = "start\ndepth"; 
                shop_price.text= (depth_co==10)?"ful":""+120*depth_co;
                unSelectShop();
                shop_button4.setFrames(7,7,7);
            }
        }, this, 7, 6, 7);
        shop_button4.scale.set(2,2);
        shop_button4.input.useHandCursor = true;
        game_end.add(shop_button4);
        shop_button5 = game.add.button(game_endLM + 260, 2350, 'shop_icons', function(){ 
            if (state == "shop") {
                select_sound.play(); 
                shop_title.text = "speed"; 
                shop_price.text= (speed_co==10)?"ful":""+110*speed_co;
                unSelectShop();
                shop_button5.setFrames(9,9,9);
            }
        }, this, 9, 8, 9);
        shop_button5.scale.set(2,2);
        shop_button5.input.useHandCursor = true;
        game_end.add(shop_button5);
        shop_button6 = game.add.button(game_endLM + 460, 2350, 'shop_icons', function(){ 
            if (state == "shop") {
                select_sound.play(); 
                shop_title.text = "lower\nweight"; 
                shop_price.text= (weight_co==10)?"ful":""+100*weight_co;
                unSelectShop();
                shop_button6.setFrames(11,11,11);
            }
        }, this, 11, 10, 11);
        shop_button6.scale.set(2,2);
        shop_button6.input.useHandCursor = true;
        game_end.add(shop_button6);
        }
        
        
        shop = game.add.image(game_endLM,2100, "shop");
        shop.scale.set(2,2);
        game_end.add(shop);
        
        shop_title = game.add.bitmapText(game_endLM + 642, 2202, '8bitwonder',"hull\npower", 27);
        game_end.add(shop_title);
        shop_price = game.add.bitmapText(game_endLM + 642, 2262, '8bitwonder',""+hull_co*150, 45);
        game_end.add(shop_price);
        money_text = game.add.bitmapText(game_endLM + 642, 2102, '8bitwonder',"money:\n"+money, 18);
        game_end.add(money_text);
        
        //lights
        {
        lights1 = game.add.image(game_endLM + 6,2102,'lights');
        lights1.scale.set(2,2);
        game_end.add(lights1);
        lights2 = game.add.image(game_endLM + 216,2102,'lights');
        lights2.scale.set(2,2);
        game_end.add(lights2);
        lights3 = game.add.image(game_endLM + 426,2102,'lights');
        lights3.scale.set(2,2);
        game_end.add(lights3);
        lights4 = game.add.image(game_endLM + 6,2308,'lights');
        lights4.scale.set(2,2);
        game_end.add(lights4);
        lights5 = game.add.image(game_endLM + 216,2308,'lights');
        lights5.scale.set(2,2);
        game_end.add(lights5);
        lights6 = game.add.image(game_endLM + 426,2308,'lights');
        lights6.scale.set(2,2);
        game_end.add(lights6);

        }
        
        buy_button = game.add.button(game_endLM + 635, 2310, 'buy', function(){ 
            
            if (state == "shop") {
                if (money >= parseInt(shop_price.text)) {
                    if (shop_title.text == "hull\npower" && hull_co < 10) {
                        hull_co += 1;
                        shopPurchase();
                        shop_price.text= (hull_co==10)?"ful":""+150*hull_co;
                        lights1.frame = hull_co-1;
                    } else if (shop_title.text == "start\nspeed" && start_co < 10) {
                        start_co += 1;
                        shopPurchase();
                        shop_price.text= (start_co==10)?"ful":""+140*start_co;
                        lights2.frame = start_co-1;
                    } else if (shop_title.text == "boost\nsize" && boost_co < 10) {
                        boost_co += 1;
                        shopPurchase();
                        shop_price.text= (boost_co==10)?"ful":""+130*boost_co;
                        lights3.frame = boost_co-1;
                    } else if (shop_title.text == "start\ndepth" && depth_co < 10) {
                        depth_co += 1;
                        shopPurchase();
                        shop_price.text= (depth_co==10)?"ful":""+120*depth_co;
                        lights4.frame = depth_co-1;
                    } else if (shop_title.text == "speed" && speed_co < 10) {
                        speed_co += 1;
                        shopPurchase();
                        shop_price.text= (speed_co==10)?"ful":""+110*speed_co;
                        lights5.frame = speed_co-1;
                    } else if (shop_title.text == "lower\nweight" && weight_co < 10) {
                        weight_co += 1;
                        shopPurchase();
                        shop_price.text= (weight_co==10)?"ful":""+100*weight_co;
                        lights6.frame = weight_co-1;
                    } else {
                        over_sound.play(); 
                    }
                } else {
                    over_sound.play(); 
                }
            }
        }, this, 1, 0, 2);
        buy_button.scale.set(2,2);
        buy_button.input.useHandCursor = true;
        game_end.add(buy_button);
        }
        game_end.y = -5000;
        }
        
        music_button = game.add.button(game.width - 30, 5, 'music_button', function(){ 
            if (game.sound.mute) {
                game.sound.mute = false;
                music_button.setFrames(1,0,2);
            } else {
                game.sound.mute = true;
                music_button.setFrames(1,1,2);
            }
        }, this, 1, 0, 2);
        music_button.scale.set(2,2);
        music_button.input.useHandCursor = true;
        music_button.fixedToCamera = true;
        
        white = game.add.image(0,0, "white");
        white.alpha = 0;
        white.height = game.height;
        white.width = game.width;
        white.fixedToCamera = true;
        whiteFade = game.add.tween(white);
        whiteFade.to({ alpha: 0 }, 3000, Phaser.Easing.Linear.None);

        dark = game.add.image(0,0, "dark");
        dark.alpha = 1;
        dark.height = game.height;
        dark.width = game.width;
        dark.fixedToCamera = true;
        darkFade = game.add.tween(dark);
        darkFade.to({ alpha: 0 }, 3000, Phaser.Easing.Linear.None);
        darkFade.start();

        achievement_group = game.add.group();
        {
        var achievementLM = game.width / 2 - 135
        
        achievement_image = game.add.sprite(achievementLM, -100, 'achievement');
        achievement_image.scale.set(2,2);
        achievement_group.add(achievement_image);
        
        achievement_title = game.add.bitmapText(achievementLM + 45, -90, '8bitwonder','achievement',18); 
        achievement_group.add(achievement_title);
        
        achievement_text = game.add.bitmapText(achievementLM + 30, -65, '8bitwonder','explode for the first time',9);
        achievement_group.add(achievement_text);
        
        achievement_group.fixedToCamera = true;
        }
        
        stateToEnd();
    }

    this.update = function() {
        //background parallax
        sky.tilePosition.x -= 0.01*xspeed;
        water1.tilePosition.x -= 1*xspeed;
        water2.tilePosition.x -= 0.5*xspeed;
        ground.tilePosition.x -= 0.62*xspeed;
        background.tilePosition.x -= 0.5*xspeed;
        background2.tilePosition.x -= 0.25*xspeed;
            
        torpedo.alpha = HUD.alpha;
        
        if (state == "game") {
            //visual rotation of torpedo
            torpedo.angle = Math.atan(yspeed/xspeed)*57.2957795;
            shadow.angle = Math.atan(yspeed/xspeed)*57.2957795;
            
            //torpedo trail bubbles
            rightEmitter.x = torpedo.x - Math.cos(torpedo.angle/57.2957795)*66; 
            rightEmitter.y = torpedo.y - Math.sin(torpedo.angle/57.2957795)*66;
            
            //torpedo collision box rotation & bubble direction
            torpedo.body.setSize(10, 10, Math.cos(torpedo.angle/57.2957795)*66, Math.sin(torpedo.angle/57.2957795)*66);
            rightEmitter.setXSpeed(-100-xspeed*70, -200-xspeed*70);
            
            //recording run stats
            top_speed = Math.max(top_speed,xspeed);
            top_depth = Math.max(434-torpedo.y,top_depth);
            
            //x movement
            if (Math.round(xspeed*10) > 0) submarine.x -= xspeed *1.2;
            
            //y movement
            torpedo.y += yspeed;
            shadow.y = torpedo.y +5;
            shadow.x = torpedo.x +5;
            
            if (torpedo.y < 434) {	//above water
                yspeed += 0.2;
                xspeed -= (xspeed > 0.1)?0.01:0;
            } else if (torpedo.y > 2800) {	//dead
                white.alpha = 1;
                whiteFade.start();
                if (!die_achievement){
                        achievement("you died!");
                        die_achievement = true;
                        run_money += 100;
                }
                stateToEnd();
                music.pause();
                fx.play();
                shake = 400;
            } else {				//in water
                yspeed += 0.07;
                xspeed -= (xspeed > 0.05)?xspeed*0.01-Math.min((speed_co-1)*0.01, xspeed*0.01-0.01):0; 
                if (game.input.activePointer.isDown && turbo > 0)
                {
                
                    torpedo.x = 202;
                    shadow.x = 207;
                    yspeed -= Math.sin(Math.atan((450-game.input.y)/(300)))*0.09*(1+weight_co*1);	
                    xspeed += Math.cos(Math.atan((450-game.input.y)/(300)))*0.02+(speed_co-1)*0.005;
                    spin.speed = 30;
                    turbo -= 0.6;
                    rightEmitter.frequency = 50;
                } else {
                    torpedo.x = 200;
                    shadow.x = 205;
                    spin.speed = 5;
                    rightEmitter.frequency = 400;				
                }
            }
            
            //yspeed limit
            if (yspeed < -15) {
                yspeed = -15;
            }
            
            
            shadow.frame = torpedo.frame;
            distance += Math.pow(xspeed,2);
            game.camera.y = torpedo.y - 300; 
            
            distance_text.setText(Math.round(distance/100)+"m");
            run_money_text.setText("money "+run_money);
            
            speed_text.setText(""+Math.round(xspeed*10));

            turbo_bar.width = turbo/6.1;
            
            //collectable collisions
            game.physics.arcade.overlap(torpedo, collect, function(torpedo, collect) {
                if (collect.frame == 2) { //mine
                    if (health == 0) {
                        stateToEnd();
                        music.pause();
                    } else {
                        health -= 1;
                    }
                    
                    white.alpha = 1;
                    whiteFade.start();
                    shake = 300;
                    fx.play();
                    
                    collect.kill();
                }
                if (collect.frame == 1) { //coin
                    select_sound.play();
                    collect.kill();
                    run_money += 15;
                    turbo += 15;
                    if (!coin_achievement){
                        achievement("you got a coin");
                        coin_achievement = true;
                        run_money + 100;
                    }
                    
                }
                if (collect.frame == 0) { //chest
                    upgrade_sound.play();
                    collect.kill();
                    run_money += 100;
                    turbo += 100;
                }
                if (collect.frame == 3) { //boost ring
                    yspeed -= 1.5;
                    xspeed += 2.5;
                }
                
            }, null, this);
            
            //creating collectables
            if (Math.round(distance/100)%10 == 0 && dist_mark != Math.round(distance/100)) {
                create_collectable(2);
                dist_mark = Math.round(distance/100);
                run_money += 5;
                if (Math.round(distance/100)%50 == 0) {
                    var pattern = Math.round(Math.random()*3);
                    var rand_y = Math.random()*2300+ 430;
                    for (var i = 0; i < 25; i++) {
                        if (coin_dists[pattern][i] == 1) {
                            create_collectable(1, (i%5)*52, rand_y - Math.floor(i/5)*52);
                        }
                    }
                    
                }
                if (Math.round(distance/100)%100 == 0) {
                    if (Math.random()*3<1) {
                        create_collectable(0,799,2710);
                    }
                    create_collectable(3,799,50+(Math.random()*250));
                }

            }
            collect.setAll('body.velocity.x', xspeed*-75);
            
            if (Math.round(distance/100) < start_co ) {
                yspeed = 0;
            }

        } else {
            rightEmitter.y = -1000;
            torpedo.y = -1000;
            shadow.y = -1000;
            xspeed = 0.1;
        }
        
        if (state == "end") {
            if (game.camera.y > 0) {
                game.camera.y -= 1 + game.camera.y*0.1;
            } 
            menu_text.y = (button1.frame == 2)?486:478;
            shop_text.y = (button2.frame == 2)?486:478;
            launch_text.y = (button3.frame == 2)?486:478;
            button1.y = 430;
            button2.y = 430;
            shop_text.frame = 0;
            button3.y = 430;
            
            progress_bar.width = Math.min(distance/80,478); // for first submarine
            progress_bar.alpha = (Math.sin(this.game.time.totalElapsedSeconds()*2)+1.5)/2.7;
        }
        
        if (state =="shop") {
            if (game.camera.y < 2090) {
                game.camera.y += 1 + (2090 - game.camera.y)*0.1;
            } else { game.camera.y = 2090; }
            if (game.camera.y > 600) {
                xspeed = 3;
                button1.y = 2530;
                button2.y = 2530;
                button3.y = 2530;
                //button1.x = 10;
                //button2.x = 276;
                shop_text.frame = 1;
                //button3.x = 542;
                menu_text.y = (button1.frame == 2)?2586:2578;
                shop_text.y = (button2.frame == 2)?2586:2578;
                launch_text.y = (button3.frame == 2)?2586:2578;
            }
        }
        if (state =="game_transition") {
            
            if (2200 - 200*depth_co < game.camera.y) {
                game.camera.y -= 1 - ((2200 - 200*depth_co) - game.camera.y)*0.1;
            } else {
                game.camera.y += 1 + ((2200 - 200*depth_co) - game.camera.y)*0.1;
            }
            if ( ((2200 - 200*depth_co) - game.camera.y)*0.1 < 0.1 && ((2200 - 200*depth_co) - game.camera.y)*0.1 > -0.1 ) { stateToGame();}
            HUD.alpha += 0.02;
            if (game_end.alpha > 0) {
                game_end.alpha -= game_end.alpha*0.2;
            } 
            submarine.y = 2380 - 200*depth_co;
            submarine.x = -180;
            turbo = 100+boost_co*120;
            turbo_bar.width = turbo/6.1;
            distance_text.setText("0m");
        }
        
        if (shake > 0 && state != "shop" && state != "game_transition") {
            game.camera.y += Math.floor((Math.random() * 10)*shake*0.01);
            if (state == "end") {
                game_end.y = game.camera.y + Math.floor((Math.random() * 10)*shake*0.01);
                game_end.x = game.camera.x + Math.floor((Math.random() * 10)*shake*0.01);
            }
            shake -= 2;
        }
        
        if (achievement_ani > 0) {
            achievement_image.y -= (achievement_image.y)*0.1;
            achievement_text.y = achievement_image.y + 35;
            achievement_title.y = achievement_image.y + 10;	
            achievement_ani -= 1;
        } else {
            achievement_image.y += (-100 - achievement_image.y)*0.1;
            achievement_text.y = achievement_image.y + 35;
            achievement_title.y = achievement_image.y + 10;	
        }

        
    }

    this.stateToEnd = function() { 
        game_end.alpha = 1;
        HUD.alpha = 0;
        game_end.y = 0;
        state = "end";
        xspeed = 1;
        yspeed = 0;
        turbo = 0;
        submarine.x = -800;
        total_time = this.game.time.totalElapsedSeconds() - start_time;
        collect.callAll('kill');
        
        //testing
        sub_count = Math.max(4 - Math.floor(distance/10000), 0);

        stattext1.text = 'distance     '+Math.round(distance/100);
        stattext2.text = 'top speed   '+Math.round(top_speed*10); 
        stattext3.text = 'time alive  '+Math.round(total_time); 
        stattext4.text = 'money         '+run_money;
        stattext6.text = 'subs hit       '+sub_count;
        money += run_money;
        run_money = 0;
        stattext5.text = 'best depth  '+(-Math.round(top_depth));
        
        money_text.text = "money:\n"+money;
        
    }
    this.stateToGame = function() {

        HUD.alpha = 1;
        game_end.y = -5000;
        state = "game";
        xspeed = 3*start_co - 2;
        yspeed = 0;
        dist_mark = 0;
        distance = 0;
        turbo = 100+boost_co*120;
        torpedo.y = 2500 - 200*depth_co;
        submarine.y = 2380 - 200*depth_co;
        submarine.x = -180;
        health = Math.round(hull_co/6);
        shake = 0;
        sub_count = 4;
        
        start_time = this.game.time.totalElapsedSeconds();
        top_depth = -3000;
    }

    this.unSelectShop = function() {
        shop_button1.setFrames(1,0,1);
        shop_button2.setFrames(3,2,3);
        shop_button3.setFrames(5,4,5);
        shop_button4.setFrames(7,6,7);
        shop_button5.setFrames(9,8,9);
        shop_button6.setFrames(11,10,11);
    }

    this.achievement = function(text, image) {
        achievement_ani = 300;
        achievement_text.text = text;
    } 

    this.shopPurchase = function() {
        upgrade_sound.play(); 
        money -= parseInt(shop_price.text);
        money_text.text = "money:\n"+money;
    }

    this.create_collectable = function(frame,x,y) {
        
        x = game.width + 199 + (x || 0);
        y = y || Math.random()*2300+ 430;
        var coll = collect.getFirstExists(false);
                
        if (coll)
        {
            coll.revive();
            coll.body.velocity.x = -150;
            coll.frame = frame;
            coll.x = x;
            coll.y = y;
            if (coll.frame == 0) { coll.body.setSize(46,40,3,21); };
            if (coll.frame == 1) { coll.body.setSize(20,20,35,35); };
            if (coll.frame == 2) { coll.body.setSize(22,22,28,27); };
            if (coll.frame == 3) { coll.body.setSize(15,52,40,0); };
        } else {
             var temp_collect = collect.create(x, y, 'collectables');
             temp_collect.body.velocity.x = -150;
             temp_collect.scale.set(2,2);
             temp_collect.checkWorldBounds = true;
             temp_collect.events.onOutOfBounds.add(function(me) { if (me.x < 0) me.kill(); }, this); //risky code !!!
             temp_collect.frame = frame;
             if (temp_collect.frame == 0) { temp_collect.body.setSize(46,40,3,21); };
             if (temp_collect.frame == 1) { temp_collect.body.setSize(20,20,35,35); };
             if (temp_collect.frame == 2) { temp_collect.body.setSize(22,22,28,27); };
             if (temp_collect.frame == 3) { temp_collect.body.setSize(15,52,40,0); };
             temp_collect.enableBody = true;	 
        }
    }
    
    var stateToEnd = this.stateToEnd,
        stateToGame = this.stateToGame,
        unSelectShop = this.unSelectShop,
        achievement = this.achievement,
        shopPurchase = this.shopPurchase,
        create_collectable = this.create_collectable;
}