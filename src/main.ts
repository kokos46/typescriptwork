import { readFile, writeFile } from "fs/promises";

export interface User {
  id: number;
  name: string;
  email?: string;
  isActive: boolean;
}

export interface Book {
  title: string;
  author: string;
  year?: number;
  genre: "fiction" | "non-fiction";
}

export function createUser(
  id: number,
  name: string,
  email: string,
  isActive: boolean,
): User {
  return {
    id: id,
    name: name,
    email: email,
    isActive: isActive,
  };
}

export function createBook(book: Book): Book {
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

type Shape = "circle" | "square";

export function calculateArea(shape: "circle", radius: number): number;
export function calculateArea(shape: "square", side: number): number;

export function calculateArea(shape: Shape, value: number): number {
  return shape === "square" ? Math.pow(value, 2) : Math.PI * Math.pow(value, 2);
}

const circleArea = calculateArea("circle", 6);
const squareArea = calculateArea("square", 6);

console.log(circleArea);
console.log(squareArea);

type Status = "active" | "inactive" | "new";
export function getStatusColor(status: Status) {
  switch (status) {
    case "active":
      return "green";
    case "inactive":
      return "grey";
    case "new":
      return "yellow";
  }
}

type StringFormatter = (string: string, uppercase: boolean) => string;

export const capitalizeFirstLetter: StringFormatter = (str) => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const trimAndFormat: StringFormatter = (str, uppercase = false) => {
  const trimmed = str.trim();
  return uppercase ? trimmed.toUpperCase() : trimmed;
};

console.log(capitalizeFirstLetter("     привет", true));

export function getFirstElement<T>(arr: T[]): T | undefined {
  return arr ? arr[0] : undefined;
}

const testMassiveInt = getFirstElement<number>([1, 2, 4]);
const testMassiveEmpty = getFirstElement<number>([]);
const testMassiveStr = getFirstElement<string>(["1", "2", "4"]);

console.log(testMassiveEmpty, testMassiveInt, testMassiveStr);

export interface HasId {
  id: number;
}

export function findById<T extends HasId>(
  items: T[],
  id: number,
): T | undefined {
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
    } else {
      R = mid - 1;
    }
  }

  return undefined;
}

const items: HasId[] = [
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

console.log(findById<HasId>(items, 3));

export interface CSVRow{
  [key: string]: string;
}

export function csvToJSON(input: string[], delimiter: string): CSVRow[] {
  if (!input || input.length === 0) {
    return [];
  }
  
  const headers: string[] = input[0]?.split(delimiter) || [];
  
  if (headers.length === 0) {
    return [];
  }
  
  const result: CSVRow[] = [];
  
  for (let i: number = 1; i < input.length; i++) {
    const currentLine: string | undefined = input[i];
    
    if (!currentLine || currentLine.trim() === '') {
      continue;
    }
    
    const values: string[] = currentLine.split(delimiter);
    const row: CSVRow = {};
    
    for (let j: number = 0; j < headers.length; j++) {
      const header: string | undefined = headers[j];
      const value: string | undefined = values[j];
      
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

export async function formatCSVFileToJSONFile(
  input: string, 
  output: string, 
  delimiter: string
): Promise<void> {
  try {
    const fileContent = await readFile(input, 'utf-8');
    
    const lines = fileContent
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    const jsonData = csvToJSON(lines, delimiter);
    
    await writeFile(output, JSON.stringify(jsonData, null, 2), 'utf-8');
  } catch (error: any) {
    throw new Error(`Failed to process CSV file: ${error.message}`);
  }
}