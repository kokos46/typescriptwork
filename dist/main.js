"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trimAndFormat = exports.capitalizeFirstLetter = void 0;
exports.createUser = createUser;
exports.createBook = createBook;
exports.calculateArea = calculateArea;
exports.getStatusColor = getStatusColor;
exports.getFirstElement = getFirstElement;
exports.findById = findById;
exports.csvToJSON = csvToJSON;
function createUser(id, name, email, isActive) {
    return {
        id: id,
        name: name,
        email: email,
        isActive: isActive,
    };
}
function createBook(book) {
    return book;
}
const someBook = createBook({
    title: "Метро 2033",
    author: "Дмитрий Глуховский",
    year: 2005,
    genre: "non-fiction",
});
const someBookWithoutYear = createBook({
    title: "Власлелин Колец",
    author: "Дж. Р. Р. Толкин",
    genre: "fiction",
});
console.log("Книга с годом: ", someBook, "\n");
console.log("Книга без года: ", someBookWithoutYear);
function calculateArea(shape, value) {
    return shape === "square" ? Math.pow(value, 2) : Math.PI * Math.pow(value, 2);
}
const circleArea = calculateArea("circle", 6);
const squareArea = calculateArea("square", 6);
console.log(circleArea);
console.log(squareArea);
function getStatusColor(status) {
    switch (status) {
        case "active":
            return "green";
        case "inactive":
            return "grey";
        case "new":
            return "yellow";
    }
}
const capitalizeFirstLetter = (str) => {
    if (!str)
        return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
};
exports.capitalizeFirstLetter = capitalizeFirstLetter;
const trimAndFormat = (str, uppercase = false) => {
    const trimmed = str.trim();
    return uppercase ? trimmed.toUpperCase() : trimmed;
};
exports.trimAndFormat = trimAndFormat;
console.log((0, exports.capitalizeFirstLetter)("     привет", true));
function getFirstElement(arr) {
    return arr ? arr[0] : undefined;
}
const testMassiveInt = getFirstElement([1, 2, 4]);
const testMassiveEmpty = getFirstElement([]);
const testMassiveStr = getFirstElement(["1", "2", "4"]);
console.log(testMassiveEmpty, testMassiveInt, testMassiveStr);
function findById(items, id) {
    const sortedItems = [...items].sort((a, b) => a.id - b.id);
    let L = 0;
    let R = sortedItems.length - 1;
    while (L <= R) {
        const mid = Math.floor(L + (R - L) / 2);
        const current = sortedItems[mid];
        if (current && current.id === id) {
            return current;
        }
        if (current && current.id < id) {
            L = mid + 1;
        }
        else {
            R = mid - 1;
        }
    }
    return undefined;
}
const items = [
    {
        id: 5,
    },
    {
        id: 1,
    },
    {
        id: 3,
    },
    {
        id: 8,
    },
];
console.log(findById(items, 3));
function csvToJSON(input, delimiter) {
    if (!input || input.length === 0) {
        return [];
    }
    const headers = input[0]?.split(delimiter) || [];
    if (headers.length === 0) {
        return [];
    }
    let res = [];
    for (let i = 1; i < input.length; i++) {
        const currentLine = input[i];
        if (!currentLine) {
            continue;
        }
        const values = currentLine.split(delimiter);
        let temp = {};
        for (let j = 0; j < headers.length; j++) {
            const header = headers[j];
            const value = values[j];
            if (header) {
                temp[header] = value || '';
            }
        }
        res.push(temp);
    }
    return res;
}
let res = csvToJSON(["p1;p2;p3;p4", "1;A;b;c", "2;B;v;d"], ';');
console.log(res);
//# sourceMappingURL=main.js.map