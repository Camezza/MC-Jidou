let radius = 1;
let square_area = (1 + (radius * 2))**2;
let previous_square_area = (1+((radius-1) * 2))**2;
let checks = square_area - previous_square_area; // gets the points on the radius of the circle
let point_history = {};

let specific_angle = 45;
let specific_angle_offset = 360 / checks;

for (let min = specific_angle - specific_angle_offset, max = specific_angle + specific_angle_offset; min <= max; min += specific_angle_offset) {
    console.log(min);
}


// method required for reducing duplicates
for (let i = 0, il = checks; i < il; i++) {

let y = (radius * Math.sin(2 * Math.PI * (i/il)));
y = Math.sign(y) * Math.abs(y)**(1/100); // wtf?

let x = (radius * Math.cos(2 * Math.PI * (i/il)));
x = Math.sign(x) * Math.abs(x)**(1/100);


// point_history[`X=${x}_Y=${y}`] = (i/il)*360;


console.log(`At ${(i/il)*360}: (${x}, ${y})`);
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