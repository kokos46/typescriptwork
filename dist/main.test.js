import { it, describe, expect, vi, beforeEach } from "vitest";
import { createUser, createBook, calculateArea, getStatusColor, capitalizeFirstLetter, trimAndFormat, getFirstElement, findById, csvToJSON, formatCSVFileToJSONFile } from "./main";
// } from "./main";
import { readFile, writeFile } from 'node:fs/promises';
vi.mock('node:fs/promises', () => ({
    readFile: vi.fn(),
    writeFile: vi.fn()
}));
describe("test lab 1", () => {
    it("creating user", () => {
        const expectingUser = {
            id: 1,
            name: "username",
            email: "test@user.com",
            isActive: true,
        };
        expect(createUser(1, "username", "test@user.com", true)).toStrictEqual(expectingUser);
    });
    it("creating book", () => {
        const expectingBook = {
            title: "testbook",
            author: "testwriter",
            year: 2002,
            genre: "fiction"
        };
        expect(createBook({ title: "testbook", author: "testwriter", year: 2002, genre: "fiction" })).toStrictEqual(expectingBook);
    });
    it("calculate square area", () => {
        expect(calculateArea("square", 5)).toBe(25);
    });
    it("calculate circle area", () => {
        expect(calculateArea("circle", 1)).toBe(Math.PI);
    });
    it("get status color", () => {
        expect(getStatusColor("active")).toBe("green");
    });
    it("capitalizing first letter", () => {
        expect(capitalizeFirstLetter("string", false)).toBe("String");
    });
    it("trim and format", () => {
        expect(trimAndFormat("  string   ", true)).toBe("STRING");
    });
    it("returns first element", () => {
        expect(getFirstElement([1, 2, 3])).toBe(1);
    });
    it("returns undefined for empty array", () => {
        expect(getFirstElement([])).toBeUndefined();
    });
    it("find by ID", () => {
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
        expect(findById(items, 8)).toStrictEqual({ id: 8 });
    });
});
describe('csvToJSON', () => {
    it('should convert valid CSV data to JSON', () => {
        const input = [
            'name,age,city',
            'John,25,New York',
            'Jane,30,Los Angeles'
        ];
        const delimiter = ',';
        const result = csvToJSON(input, delimiter);
        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(2);
    });
    it('should handle different delimiters', () => {
        const input = [
            'name;age;city',
            'John;25;New York',
            'Jane;30;Los Angeles'
        ];
        const delimiter = ';';
        const result = csvToJSON(input, delimiter);
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(2);
    });
    it('should handle empty input array', () => {
        expect(csvToJSON([], ',')).toEqual([]);
    });
    it('should handle null/undefined input', () => {
        expect(csvToJSON(null, ',')).toEqual([]);
        expect(csvToJSON(undefined, ',')).toEqual([]);
    });
    it('should handle empty lines in CSV', () => {
        const input = [
            'name,age,city',
            '',
            'John,25,New York',
            '   ',
            'Jane,30,Los Angeles'
        ];
        const delimiter = ',';
        const result = csvToJSON(input, delimiter);
        expect(result.length).toBe(2);
    });
    it('should handle missing values', () => {
        const input = [
            'name,age,city',
            'John,,New York',
            'Jane,30,'
        ];
        const delimiter = ',';
        const result = csvToJSON(input, delimiter);
        expect(result.length).toBe(2);
    });
    it('should handle file with only headers', () => {
        const input = ['name,age,city'];
        const delimiter = ',';
        expect(csvToJSON(input, delimiter)).toEqual([]);
    });
});
describe('formatCSVFileToJSONFile', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });
    it('should successfully convert CSV file to JSON file', async () => {
        const mockCSVContent = 'name,age,city\nJohn,25,New York\nJane,30,Los Angeles';
        vi.mocked(readFile).mockResolvedValue(mockCSVContent);
        vi.mocked(writeFile).mockResolvedValue(undefined);
        await formatCSVFileToJSONFile('input.csv', 'output.json', ',');
        expect(readFile).toHaveBeenCalledTimes(1);
        expect(readFile).toHaveBeenCalledWith('input.csv', 'utf-8');
        expect(writeFile).toHaveBeenCalledTimes(1);
        expect(writeFile).toHaveBeenCalledWith('output.json', expect.any(String), 'utf-8');
    });
    it('should handle empty CSV file', async () => {
        const mockCSVContent = '';
        vi.mocked(readFile).mockResolvedValue(mockCSVContent);
        vi.mocked(writeFile).mockResolvedValue(undefined);
        await formatCSVFileToJSONFile('input.csv', 'output.json', ',');
        expect(writeFile).toHaveBeenCalledWith('output.json', '[]', 'utf-8');
    });
});
//# sourceMappingURL=main.test.js.map