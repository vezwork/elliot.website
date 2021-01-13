function * insertionSort(inputArray) {
    for (let i = 0; i < inputArray.length; i++) {
        const value = inputArray[i];

        let j = i -1;
        while (j >= 0 && value < inputArray[j]) {
            inputArray[j+1] = inputArray[j]
            j -= 1;
            yield inputArray;
        }
        inputArray[j+1] = value
    }
    return inputArray;
}

const c = document.getElementById('canvasEl');
const ctx = c.getContext('2d');
ctx.fillStyle = '#07AAC3';

function drawGraphFromArray(array) {
    ctx.clearRect(0,0,c.width,c.height);
    const barWidth = c.width / array.length;
    const barHeightScale = c.height / Math.max(...array);

    array.forEach((value, i) => ctx.fillRect(
                i*barWidth,
                0,
                barWidth,
                barHeightScale*value
    ));
}

let randomArr;
let sortGenerator;
function reset() {
    randomArr = Array(50).fill(0).map(Math.random);
    sortGenerator = insertionSort(randomArr);
}
reset();

function renderLoop() {
    const yieldedArr = sortGenerator.next().value;
    if (!yieldedArr) { 
        reset();
    } else {
        drawGraphFromArray(yieldedArr);
    }
    

    requestAnimationFrame(renderLoop);
}
renderLoop();