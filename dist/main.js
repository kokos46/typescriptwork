import { readFile, writeFile } from "fs/promises";
export function createUser(id, name, email, isActive) {
    return {
        id: id,
        name: name,
        email: email,
        isActive: isActive,
    };
}
export function createBook(book) {
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
export function calculateArea(shape, value) {
    return shape === "square" ? Math.pow(value, 2) : Math.PI * Math.pow(value, 2);
}
const circleArea = calculateArea("circle", 6);
const squareArea = calculateArea("square", 6);
console.log(circleArea);
console.log(squareArea);
export function getStatusColor(status) {
    switch (status) {
        case "active":
            return "green";
        case "inactive":
            return "grey";
        case "new":
            return "yellow";
    }
}
export const capitalizeFirstLetter = (str) => {
    if (!str)
        return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
};
export const trimAndFormat = (str, uppercase = false) => {
    const trimmed = str.trim();
    return uppercase ? trimmed.toUpperCase() : trimmed;
};
console.log(capitalizeFirstLetter("     привет", true));
export function getFirstElement(arr) {
    return arr ? arr[0] : undefined;
}
const testMassiveInt = getFirstElement([1, 2, 4]);
const testMassiveEmpty = getFirstElement([]);
const testMassiveStr = getFirstElement(["1", "2", "4"]);
console.log(testMassiveEmpty, testMassiveInt, testMassiveStr);
export function findById(items, id) {
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
export function csvToJSON(input, delimiter) {
    if (!input || input.length === 0) {
        return [];
    }
    const headers = input[0]?.split(delimiter) || [];
    if (headers.length === 0) {
        return [];
    }
    const result = [];
    for (let i = 1; i < input.length; i++) {
        const currentLine = input[i];
        if (!currentLine || currentLine.trim() === '') {
            continue;
        }
        const values = currentLine.split(delimiter);
        const row = {};
        for (let j = 0; j < headers.length; j++) {
            const header = headers[j];
            const value = values[j];
            if (header) {
                row[header] = value !== undefined ? value.trim() : '';
            }
        }
        result.push(row);
    }
    return result;
}
let res = csvToJSON(["p1;p2;p3;p4", "1;A;b;c", "2;B;v;d"], ';');
console.log(res);
export async function formatCSVFileToJSONFile(input, output, delimiter) {
    try {
        const fileContent = await readFile(input, 'utf-8');
        const lines = fileContent
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);
        const jsonData = csvToJSON(lines, delimiter);
        await writeFile(output, JSON.stringify(jsonData, null, 2), 'utf-8');
    }
    catch (error) {
        throw new Error(`Failed to process CSV file: ${error.message}`);
    }
}
//# sourceMappingURL=main.js.map