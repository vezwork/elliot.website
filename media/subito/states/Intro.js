var Intro = function() {
    
    var panel_1_2,
        panel_3,
        panel_4;
        
    var current_panel = 0,
        panels = [
            { x1: 0, y1: 0, x2: 300, y2: 300 },
            { x1: 130, y1: 0, x2: 740, y2: 300 },
            { x1: 10, y1: 270, x2: 560, y2: 700 },
            { x1: 0, y1: 300, x2: 230, y2: 640 },
            { x1: 0, y1: 640, x2: 500, y2: 1000 },
            { x1: 0, y1: 640, x2: 500, y2: 1090 },
            { x1: 0, y1: 1150, x2: 100, y2: 1530 },
            { x1: 0, y1: 1150, x2: 102, y2: 1532 },
            { x1: 2000, y1: 2000, x2: 3000, y2: 3000 },
        ];
    
    this.create = function() {
        game.stage.backgroundColor = 0x002020;
        
        panel_1_2 = game.add.sprite(10,10, 'panel_1_2');
        panel_3 = game.add.sprite(260,310, 'panel_3');
        panel_4 = game.add.sprite(0,660, 'panel_4');
        panel_5 = game.add.sprite(100,1160, 'panel_5');
        
        panel_1_2.scale.set(2,2);
        panel_3.scale.set(2,2);
        panel_4.scale.set(2,2);
        panel_5.scale.set(2,2);
        
        p12_text = game.add.sprite(670, 150, 'panel_1_2_text');
        p12_text.anchor.set(1, 0);
        p12_text.scale.set(0,0);
        
        p3_text = game.add.sprite(140, 480, 'panel_3_text');
        p3_text.anchor.set(0.5, 0.5);
        p3_text.scale.set(0,0);
        
        p4_text = game.add.sprite(216, 846, 'panel_4_text'); 
        p4_text.anchor.set(0, 0.5);
        p4_text.scale.set(0,0);
        
        p5_text = game.add.sprite(86, 1480, 'panel_5_text'); 
        p5_text.anchor.set(0, 0);
        p5_text.scale.set(0,0);
        
        game.world.setBounds(0, 0, 2820, 2000);
        
        game.camera.x = 700;
        game.camera.y = 0;
        
        
        game.input.onDown.add(function() {
            current_panel = (current_panel+1)%panels.length;
        }, this);
    }
    
    this.update = function() {
        //game.camera.y++;
        //game.camera.scale.set(game.camera.scale.x+0.001,game.camera.scale.y+0.001);
        
        //camera box -> panels[current_panel] box
        
        var verticalDiffRatio = game.height / (panels[current_panel].y2 - panels[current_panel].y1);
        var horizontalDiffRatio = game.width / (panels[current_panel].x2 - panels[current_panel].x1);
        
        var targetRatio = Math.abs(Math.min(verticalDiffRatio, horizontalDiffRatio));
        var calcRatio = game.camera.scale.x + (targetRatio - game.camera.scale.x) * 0.1;
        
        game.camera.scale.set(calcRatio, calcRatio);
        
        //camera -> panels[current_panel].x1 / y1
        game.camera.x -= Math.round(1 - (panels[current_panel].x1 * horizontalDiffRatio - game.camera.x) * 0.05);
        game.camera.y -= Math.round(1 - (panels[current_panel].y1 * verticalDiffRatio - game.camera.y) * 0.05);
        //var -= 1 - (target - var) * modifier
        
        
       
        
        
        
        //text box expansions
        if (current_panel > 0) {
            var temp = p12_text.scale.x + (2 - p12_text.scale.x) * 0.14;
            p12_text.scale.set(temp, temp);
        }
        
        if (current_panel > 2) {
            var temp = p3_text.scale.x + (2 - p3_text.scale.x) * 0.14;
            p3_text.scale.set(temp, temp);
            p3_text.angle = (0.5 - Math.random()) * 10;
            panel_3.angle = (0.5 - Math.random());
        }
        
        if (current_panel > 4) {
            var temp = p4_text.scale.x + (2 - p4_text.scale.x) * 0.14;
            p4_text.scale.set(temp, temp);
            panel_4.frame = 1;
        }
        if (current_panel == 6) {
            panel_5.x = 86 + (0.5 - Math.random()) * 2.5;
        }
        if (current_panel > 6) {
            p5_text.scale.set(2,2);
            
        }
        if (current_panel > 7) {
            setTimeout(function() {
                game.camera.scale.set(1, 1);
                game.state.start('Gameplay');
            }, 200);
        }
        
    }
}