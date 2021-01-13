function expand() {
    if (document.getElementsByTagName("right")[0].style.width == "100%") {
        document.getElementsByTagName("right")[0].style.animationDirection = "reverse";
    } else {
        document.getElementsByTagName("right")[0].style.animationDirection = "normal";
    }
    document.getElementsByTagName("right")[0].style.webkitAnimationName = "horizontal-expand";
    document.getElementsByTagName("right")[0].style.animationName = "horizontal-expand";
}
window.onload = function() {
    document.getElementsByTagName("right")[0].addEventListener("animationend", function() {
        document.getElementsByTagName("right")[0].style.webkitAnimationName = "";
        document.getElementsByTagName("right")[0].style.animationName = "";
        
        
        if (document.getElementsByTagName("right")[0].style.animationDirection == "reverse") {
            document.getElementsByTagName("right")[0].style.width = "60px";
        } else {
            document.getElementsByTagName("right")[0].style.width = "100%";
        }
    });
}