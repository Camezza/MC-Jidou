function retreivePossibleVec2(x_radius, y_radius) {
    let coordinates = [];
    let x_sign = Math.sign(x_radius);
    let y_sign = Math.sign(y_radius);
    let x_iterations = Math.abs(x_radius);
    let y_iterations = Math.abs(y_radius);

    for (let x = 1; x <= x_iterations; x++) {
        coordinates.push([x_sign * x, y_radius]);

        if (x === x_iterations) {
            for (let y = 1; y < y_iterations; y++) {
                coordinates.push([x_radius, y_sign * y]);
            }
        }
    }
    return coordinates;
}

let cardinal_sign = [
    [1, 0],
    [0, 1],
    [-1, 0],
    [0, -1],
];

let diagonal_sign = [
    [1, 1],
    [-1, 1],
    [-1, -1],
    [1, -1],
]

let radius = 2;

console.time();
let points = [];
for (let i = 0, il = cardinal_sign.length; i < il; i++) {
    let cardinal = cardinal_sign[i];
    let diagonal = diagonal_sign[i];
    points.push([cardinal[0] * radius, cardinal[1] * radius]);
    points = points.concat(retreivePossibleVec2(diagonal[0] * radius, diagonal[1] * radius));
}
console.timeEnd();
console.log(points);
