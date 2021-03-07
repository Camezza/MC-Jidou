let radius = 6;
let square_area = (1 + (radius * 2))**2;
let previous_square_area = (1+((radius-1) * 2))**2;
let checks = square_area - previous_square_area; // gets the points on the radius of the circle
let point_history = [];

// https://math.stackexchange.com/questions/1880736/how-do-i-determine-the-point-on-a-square-inside-a-circle-depending-on-an-angle
console.time();
for (let i = 0, il = checks; i < il; i++) {

let cosine = Math.cos(2 * Math.PI * (i/il));
let sine = Math.sin(2 * Math.PI * (i/il));
let x = radius*(cosine)/(Math.max(Math.abs(cosine), Math.abs(sine)));
let y = radius*(sine)/(Math.max(Math.abs(cosine), Math.abs(sine)));

console.log(`At ${(i/il)*360}: (${Math.ceil(x)}, ${Math.ceil(y)})`);
}
console.timeEnd();
console.log(point_history);

