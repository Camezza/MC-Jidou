let radius = 1;
let square_area = (1 + (radius * 2))**2;
let previous_square_area = (1+((radius-1) * 2))**2;
let checks = square_area - previous_square_area; // gets the points on the radius of the circle

let point_history = {};


// method required for reducing duplicates
for (let i = 0, il = checks; i < il; i++) {

let y = radius * Math.sin(2 * Math.PI * (i/il));
y = y.toFixed(1) % 1 !== 0 ? Math.sign(y) * Math.ceil(Math.abs(y)) : y; // wtf?

let x = radius * Math.cos(2 * Math.PI * (i/il));
x = x.toFixed(1) % 1 !== 0 ? Math.sign(x) * Math.ceil(Math.abs(x)) : x;


point_history[`x${x}_y${y}`] = (i/il)*360;


console.log(`At ${(i/il)*360}: (${x.toFixed(1)}, ${y.toFixed(1)})`);
}
console.log(point_history);


/*
At 0: (2.0, 0.0)
At 22.5: (2.0, 1.0)
At 45: (2.0, 2.0)
At 67.5: (1.0, 2.0)

At 90: (0.0, 2.0)
At 112.5: (-1.0, 2.0)
At 135: (-2.0, 2.0)
At 157.5: (-2.0, 1.0)

At 180: (-2.0, 0.0)
At 202.5: (-2.0, -1.0)
At 225: (-2.0, -2.0)
At 247.5: (-1.0, -2.0)

At 270: (-0.0, -2.0)
At 292.5: (1.0, -2.0)
At 315: (2.0, -2.0)
At 337.5: (2.0, -1.0)
*/