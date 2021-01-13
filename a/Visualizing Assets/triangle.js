(()=>{
    const c = document.getElementById('c-triangle');
    const ctx = c.getContext('2d');
    
    const c2 = document.createElement('canvas');
    const ctx2 = c2.getContext('2d');
    
    c2.width = c.width;
    c2.height = c.height;
    
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      ctx2.drawImage(img, 0, 0, c.width, c.height);
      animate();
    }
    img.src = './Visualizing Assets/img.jpg';
    
    
    let leftTri = recursiveTriangles(0,0,c.width,c.height,c.width,0);
    let rightTri = recursiveTriangles(0,c.height,c.width,c.height,0,0);
    
    c.addEventListener('mousemove', e => {
      ctx2.drawImage(img, e.offsetX - c.width/2, e.offsetY - c.height/2, c.width, c.height);
      leftTri = recursiveTriangles(0,0,c.width,c.height,c.width,0);
      rightTri = recursiveTriangles(0,c.height,c.width,c.height,0,0);
    });
    
    //c.addEventListener('click', e => {
    //  drawSampledTri(leftTri);
    //  drawSampledTri(rightTri);
    //});
    
    function animate() {
        for (let i = 0; i < 100; i++) {
            drawSampledTri(leftTri);
            drawSampledTri(rightTri);
        }
      
      requestAnimationFrame(animate);
    }
    
    function drawSampledTri(triGen) {
      const val = triGen.next().value;
      if (val) {
        const x = (val[0] + val[2] + val[4]) / 3;
        const y = (val[1] + val[3] + val[5]) / 3;
        const imageSample = ctx2.getImageData(x,y,1,1).data;
        const renderSample = ctx.getImageData(x,y,1,1).data;
        ctx.fillStyle = `rgb(${ imageSample.join(',') })`;
        fillTriangle(...val);
      }
    }
    
    //x2,y2 is the right angle
    function * recursiveTriangles(x1,y1,x2,y2,x3,y3,depth=0) {
      
        yield [x1,y1,x2,y2,x3,y3]
        
        const x_ = (x3 + x1) / 2;
        const y_ = (y3 + y1) / 2;
        
        if (depth < 14) {
            const leftTriangles = recursiveTriangles(x1,y1,x_,y_,x2,y2,depth++)
            const rightTriangles = recursiveTriangles(x2,y2,x_,y_,x3,y3,depth++)
            
            while (true) {
                const left = leftTriangles.next()
                const right = rightTriangles.next()
                if (left.done || right.done) return;
    
                yield left.value;
                yield right.value;
            }
        }
    }
    
    function fillTriangle(x1, y1, x2, y2, x3, y3) {
      ctx.beginPath();
      ctx.moveTo(x1,y1);
      ctx.lineTo(x2,y2);
      ctx.lineTo(x3,y3);
      ctx.fill();
      ctx.closePath();
    }
})();
