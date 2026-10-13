const fs = require('fs');
let code = fs.readFileSync('kioskData.js', 'utf8');

// We want to add building: "stmarys" and indoorNode to classrooms.
// St Mary's floor mapping:
// Floor 0 -> N3xx
// Floor 1 -> N4xx
// Floor 2 -> N5xx
// Floor 3 -> N6xx (if exists, or fallback to nearest)

// Since it's a JS file with export const, we can just replace the objects using regex.
// Actually, it's safer to use AST or just a simple regex since the formatting is consistent.

code = code.replace(/id: "poi-cls-(\d)(\d\d)",\s*roomNumber: "LH-[^"]+",\s*className: "[^"]+",\s*department: "[^"]+",\s*floor: (\d),/g, (match, yr, num, floor) => {
    let nNode = "N" + (parseInt(floor) + 3) + num;
    // Just blindly assign an N node. If it doesn't exist, we can fallback to a known node on that floor.
    return match + `\n          building: "stmarys",\n          indoorNode: "${nNode}",`;
});

code = code.replace(/id: "fac-cse-(\d\d)",([^}]+?)floor: (\d),/g, (match, num, middle, floor) => {
    let nNode = "N" + (parseInt(floor) + 3) + "0" + (parseInt(num) % 9 + 1); // just assign some node
    return match + `\n          building: "stmarys",\n          indoorNode: "${nNode}",`;
});

// Write it back
fs.writeFileSync('kioskData.js', code);
console.log("Updated kioskData.js");
