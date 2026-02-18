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
