var canvas = document.getElementById("fieldCanvas");
var c = canvas.getContext("2d");
var table = document.getElementById("fieldTable");
var marginTop = window.getComputedStyle(table).marginTop;
marginTop = parseInt(marginTop.slice(0, marginTop.length - 2));
var marginLeft = window.getComputedStyle(table).marginLeft;
marginLeft = parseInt(marginLeft.slice(0, marginLeft.length - 2));
const CELL_SIZE = 20;
const TOP_COLOR = "rgba(0,255,0,0.50)";
const BOTTOM_COLOR = "rgba(0,0,255,0.50)";
const ERROR_COLOR = "rgba(255,0,0,0.50)";
topScore = 0;
bottomScore = 0;

var dicesIsRolling = true;
var field = {
    width: 20,
    height: 20
};
makeGameField(field.height, field.width);
canvas.top = table.top;
canvas.width = table.parentElement.offsetWidth;
canvas.height = table.parentElement.offsetHeight + 1;

var mouse = {
    x: canvas.width,
    y: canvas.height
};
var rectSticked = false;

function GetMousePos(event) {
    mouse.x = event.clientX - canvas.offsetLeft;
    mouse.y = event.clientY - canvas.offsetTop;
}

window.addEventListener("mouseup", function (e) {
    GetMousePos(e);

    if (rectSticked && !dicesIsRolling && checkAvaileable()) {
        rectangles.push(rectangle);
        calculateScore(rectangle);
        box.start_throw(notation_getter, before_roll, after_roll);
        rectSticked = false;

        updateScore();
        // changeColorIfError();
    }
    animate();
});

function calculateScore(rect) {
    if (rect.side == "bottom") {
        bottomScore += rect.a * rect.b / CELL_SIZE / CELL_SIZE;
    }
    if (rect.side == "top") {
        topScore += rect.a * rect.b / CELL_SIZE / CELL_SIZE;
    }
}

function updateScore() {
    $("#top-score").css('background-color', TOP_COLOR);
    $("#top-score").text(topScore);
    $("#bottom-score").css('background-color', BOTTOM_COLOR);
    $("#bottom-score").text(bottomScore);
}

function checkAvaileable() {
    var pixels = Array.prototype.slice.call(
        c.getImageData(
            rectangle.x + CELL_SIZE / 2,
            rectangle.y - CELL_SIZE / 2,
            rectangle.a - CELL_SIZE / 2,
            1
        ).data
    );
    pixels = pixels.concat(
        Array.prototype.slice.call(
            c.getImageData(
                rectangle.x + CELL_SIZE / 2,
                rectangle.y + rectangle.b + CELL_SIZE / 2,
                rectangle.a - CELL_SIZE / 2,
                1
            ).data
        )
    );
    pixels = pixels.concat(
        Array.prototype.slice.call(
            c.getImageData(
                rectangle.x - CELL_SIZE / 2,
                rectangle.y + CELL_SIZE / 2,
                1,
                rectangle.b - CELL_SIZE / 2
            ).data
        )
    );
    pixels = pixels.concat(
        Array.prototype.slice.call(
            c.getImageData(
                rectangle.x + rectangle.a + CELL_SIZE / 2,
                rectangle.y + CELL_SIZE / 2,
                1,
                rectangle.b - CELL_SIZE / 2
            ).data
        )
    );
    var isOk = false;
    var color = colorValues(getSideColor(rectangle.side));
    for (var i = 0; i < pixels.length; i += 4) {
        if (
            pixels[i] == color[0] &&
            pixels[i + 1] == color[1] &&
            pixels[i + 2] == color[2] /* &&
      pixels[i + 3] == color[3] */
        ) {
            isOk = true;
        }
    }
    return isOk;
}

function rotateRect() {
    if (!dicesIsRolling) {
        if (rectangle.side == "bottom") {
            var aMinusB = rectangle.a - rectangle.b;
            var bMinusA = rectangle.b - rectangle.a;
            rectangle.x += aMinusB;
            rectangle.y += bMinusA;
        }
        var buf = rectangle.a;
        rectangle.a = rectangle.b;
        rectangle.b = buf;

        IfError();
    }
}
window.addEventListener("keypress", function (e) {
    if (e.code == "KeyR") {
        rotateRect();
    }
});

window.addEventListener("mousemove", function (e) {
    GetMousePos(e);
    changeColorIfError();
});

function IfError() {
    var i = Math.floor((mouse.y - marginTop) / CELL_SIZE);
    var j = Math.floor((mouse.x - marginLeft) / CELL_SIZE);
    stick(i, j);
    changeColorIfError();
}

function getSideColor(side) {
    if (side == "bottom") {
        return BOTTOM_COLOR;
    }
    if (side == "top") {
        return TOP_COLOR;
    }
}

function changeColorIfError() {
    drawAll();
    if (!dicesIsRolling) {
        if (checkAvaileable() && !intersectAny()) {
            rectangle.color = getSideColor(rectangle.side);
        } else {
            rectangle.color = ERROR_COLOR;
        }
    }
}

function intersect(rect1, rect2) {
    return (
        rect1.x < rect2.x + rect2.a &&
        rect1.x + rect1.a > rect2.x &&
        rect1.y < rect2.y + rect2.b &&
        rect1.y + rect1.b > rect2.y
    );
}

function intersectAny() {
    var isIntersect = false;
    for (var i = 0; i < rectangles.length; i++) {
        if (intersect(rectangle, rectangles[i])) {
            isIntersect = true;
            break;
        }
    }
    return isIntersect;
}

function stick(i, j) {
    if (!dicesIsRolling) {
        var position = $("#" + i + "-" + j).position();
        var isOK = true;
        var newposRect = {
            x: rectangle.x,
            y: rectangle.y,
            a: rectangle.a,
            b: rectangle.b,
            side: rectangle.side
        };
        if (newposRect.side == "bottom") {
            if (
                position.left >= newposRect.a - CELL_SIZE &&
                position.top >= newposRect.b - CELL_SIZE
            ) {
                newposRect.x = position.left - newposRect.a + 3 * CELL_SIZE / 2;
                newposRect.y = position.top - newposRect.b + 3 * CELL_SIZE / 2;
            } else {
                isOK = false;
            }
        }
        if (newposRect.side == "top") {
            if (
                position.left <= field.width * CELL_SIZE - newposRect.a &&
                position.top <= field.height * CELL_SIZE - newposRect.b
            ) {
                newposRect.x = position.left + CELL_SIZE / 2;
                newposRect.y = position.top + CELL_SIZE / 2;
            } else {
                isOK = false;
            }
        }

        if (isOK) {
            for (var i = 0; i < rectangles.length; i++) {
                if (intersect(newposRect, rectangles[i])) {
                    isOK = false;
                    break;
                }
            }
        }
        if (isOK) {
            rectangle.x = newposRect.x;
            rectangle.y = newposRect.y;
            rectSticked = true;
        } else {
            rectSticked = false;
        }
    }
}
function unstick() {
    rectSticked = false;
}

function makeGameField(n, m) {
    for (var i = 0; i < n; i++) {
        $("#fieldTable").append("<tr class='line' id='" + i + "'></tr>");
        for (var j = 0; j < m; j++) {
            $(".line#" + i).append(
                "<td class='cell' id='" +
                i +
                "-" +
                j +
                "' onmouseover='stick(" +
                i +
                "," +
                j +
                ")' onmouseout='unstick()'></td>"
            );
        }
    }
}

var rectangle;
var rectangles = [];

function init() {
    rectangles = [];
    rectangle = new Rectangle(
        mouse.x,
        mouse.y,
        3 * CELL_SIZE,
        2 * CELL_SIZE,
        "rgba(0,200,0,0.50)",
        "bottom"
    );
    updateScore();
}

function Rectangle(x, y, a, b, color, side) {
    this.x = x;
    this.y = y;
    this.a = a;
    this.b = b;
    this.color = color;
    this.text = a * b / (CELL_SIZE * CELL_SIZE);
    this.side = side;

    this.draw = function () {
        c.beginPath();
        c.fillStyle = this.color;
        c.fillRect(this.x, this.y, this.a, this.b);

        c.font = "20px Georgia";
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.fillStyle = "#000000";
        c.fillText(this.text, this.x + this.a / 2, this.y + this.b / 2);
    };

    this.update = function () {
        if (!rectSticked) {
            if (this.side == "top") {
                this.x = mouse.x - CELL_SIZE / 2;
                this.y = mouse.y - CELL_SIZE / 2;
            }
            if (this.side == "bottom") {
                this.x = mouse.x - this.a + CELL_SIZE / 2;
                this.y = mouse.y - this.b + CELL_SIZE / 2;
            }
        }
        this.draw();
    };
}

function makeRectFromDices(a, b) {
    var side;
    var color;
    if (rectangle.side == "top") {
        side = "bottom";
        color = BOTTOM_COLOR;
    }
    if (rectangle.side == "bottom") {
        side = "top";
        color = TOP_COLOR;
    }

    return new Rectangle(
        mouse.x,
        mouse.y,
        a * CELL_SIZE,
        b * CELL_SIZE,
        color,
        side
    );
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function animate() {
    requestAnimationFrame(animate);
    drawAll();
}

function drawAll() {
    c.clearRect(0, 0, canvas.width, canvas.height);
    c.beginPath();
    c.fillStyle = `rgba(0,255,0,${1 / 255})`;
    c.fillRect(marginLeft + CELL_SIZE / 2, 0, 1, 1);
    c.fillStyle = `rgba(0,0,255,${1 / 255})`;
    c.fillRect(
        marginLeft + field.width * CELL_SIZE - CELL_SIZE / 2,
        marginTop + field.height * CELL_SIZE + CELL_SIZE / 2,
        1,
        1
    );

    for (var i = 0; i < rectangles.length; i++) {
        rectangles[i].draw();
    }
    if (!dicesIsRolling) {
        rectangle.update();
    }
}

// return array of [r,g,b,a] from any valid color. if failed returns undefined
function colorValues(color) {
    if (!color) return;
    if (color.toLowerCase() === "transparent") return [0, 0, 0, 0];
    if (color[0] === "#") {
        if (color.length < 7) {
            // convert #RGB and #RGBA to #RRGGBB and #RRGGBBAA
            color =
                "#" +
                color[1] +
                color[1] +
                color[2] +
                color[2] +
                color[3] +
                color[3] +
                (color.length > 4 ? color[4] + color[4] : "");
        }
        return [
            parseInt(color.substr(1, 2), 16),
            parseInt(color.substr(3, 2), 16),
            parseInt(color.substr(5, 2), 16),
            color.length > 7 ? parseInt(color.substr(7, 2), 16) / 255 : 1
        ];
    }
    if (color.indexOf("rgb") === -1) {
        // convert named colors
        var temp_elem = document.body.appendChild(document.createElement("fictum")); // intentionally use unknown tag to lower chances of css rule override with !important
        var flag = "rgb(1, 2, 3)"; // this flag tested on chrome 59, ff 53, ie9, ie10, ie11, edge 14
        temp_elem.style.color = flag;
        if (temp_elem.style.color !== flag) return; // color set failed - some monstrous css rule is probably taking over the color of our object
        temp_elem.style.color = color;
        if (temp_elem.style.color === flag || temp_elem.style.color === "") return; // color parse failed
        color = getComputedStyle(temp_elem).color;
        document.body.removeChild(temp_elem);
    }
    if (color.indexOf("rgb") === 0) {
        if (color.indexOf("rgba") === -1) color += ",1"; // convert 'rgb(R,G,B)' to 'rgb(R,G,B)A' which looks awful but will pass the regxep below
        return color.match(/[\.\d]+/g).map(function (a) {
            return +a;
        });
    }
}

init();
animate();
