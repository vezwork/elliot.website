(()=>{
    //https://stackoverflow.com/questions/123999/how-to-tell-if-a-dom-element-is-visible-in-the-current-viewport/7557433#7557433
    function isElementInViewport (el) {
        var rect = el.getBoundingClientRect();

        return (
            rect.top >= -200 &&
            rect.left >= -200 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + 450 &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth) + 450
        );
    }

    const c = document.getElementById('c-mandelbrot');
    const ctx = c.getContext('2d');
    
    function * subdivideSquares(width, height, size=64) {
      while (size >= 1) {
        for (let x = 0; x < c.width+size; x += size) {
          for (let y = 0; y < c.height+size; y += size) {
            yield { x, y, size };
          }
        }
        size /= 2;
      }
    }
    
    function swatchGradient(c1, c2, percent) {
      c1 >>>= 0;
      var b1 = c1 & 0xFF,
          g1 = (c1 & 0xFF00) >>> 8,
          r1 = (c1 & 0xFF0000) >>> 16;
      c2 >>>= 0;
      var b2 = c2 & 0xFF,
          g2 = (c2 & 0xFF00) >>> 8,
          r2 = (c2 & 0xFF0000) >>> 16;
      var b3 = Math.round(b1 + percent * (b2 - b1));
      var g3 = Math.round(g1 + percent * (g2 - g1));
      var r3 = Math.round(r1 + percent * (r2 - r1));
      return "rgb(" + [r3, g3, b3].join(",") + ")";
    }
    
    function getMandelbrotColor(z0, c1, c2, blowout, maxi) {
      let z = new Complex(0,0);
      let i = 0;
      while (z.abs() <= 2 && i < maxi) {
        z = z.pow(2).add(z0);
        i++;
      }
      return swatchGradient(c1, c2, i*blowout/maxi);
    }
    const mouse = {
      x: 0,
      y: 0
    }
    c.addEventListener("mousemove", e=> {
      mouse.x = e.offsetX;
      mouse.y = e.offsetY;
      
      //reset();
    });
    
    let bound = {
      left: -2,
      right: 2,
      top: -2,
      bottom: 2
    };
    c.addEventListener("click", e=> {
      const newCenter = {
        x: mouse.x/c.width * (bound.right-bound.left) + bound.left,
        y: mouse.y/c.height * (bound.bottom-bound.top) + bound.top
      }
      
      const newSize = {
        width: (bound.right-bound.left)/4,
        height: (bound.bottom-bound.top)/4
      }
      if (isElementInViewport(c)) {
        bound = {
            left: newCenter.x - newSize.width,
            right: newCenter.x + newSize.width,
            top: newCenter.y - newSize.height,
            bottom: newCenter.y + newSize.height
        }
      }
      
      reset();
    });
    
    let squareGenerator;
    function reset() {
      squareGenerator = subdivideSquares(c.width, c.height);
    }
    reset();
    
    function draw() {
        if (isElementInViewport(c)) {
            for (let i = 0; i < 700; i++) {
                let { done, value } = squareGenerator.next();
                if (done) {
                    break;
                } else {
                    let { x, y, size } = value;
                
                    ctx.fillStyle = getMandelbrotColor(new Complex(
                        (x/c.width)*(bound.right-bound.left) + bound.left,
                        (y/c.height)*(bound.bottom-bound.top) + bound.top
                    ), 0x00A8C5, 0xFFFF7E, 1,70);
                    ctx.fillRect(x,y,size,size);
                }
                
            }
        }
        requestAnimationFrame(draw);
    }
    
    draw();
})();