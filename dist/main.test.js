"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const main_1 = require("./main");
(0, vitest_1.describe)("test lab 1", () => {
    (0, vitest_1.it)("creating user", () => {
        const expectingUser = {
            id: 1,
            name: "username",
            email: "test@user.com",
            isActive: true,
        };
        (0, vitest_1.expect)((0, main_1.createUser)(1, "username", "test@user.com", true)).toStrictEqual(expectingUser);
    });
    (0, vitest_1.it)("creating book", () => {
        const expectingBook = {
            title: "testbook",
            author: "testwriter",
            year: 2002,
            genre: "fiction"
        };
        (0, vitest_1.expect)((0, main_1.createBook)({ title: "testbook", author: "testwriter", year: 2002, genre: "fiction" })).toStrictEqual(expectingBook);
    });
    (0, vitest_1.it)("calculate square area", () => {
        (0, vitest_1.expect)((0, main_1.calculateArea)("square", 5)).toBe(25);
    });
    (0, vitest_1.it)("calculate circle area", () => {
        (0, vitest_1.expect)((0, main_1.calculateArea)("circle", 1)).toBe(Math.PI);
    });
    (0, vitest_1.it)("get status color", () => {
        (0, vitest_1.expect)((0, main_1.getStatusColor)("active")).toBe("green");
    });
    (0, vitest_1.it)("capitalizing first letter", () => {
        (0, vitest_1.expect)((0, main_1.capitalizeFirstLetter)("string", false)).toBe("String");
    });
    (0, vitest_1.it)("trim and format", () => {
        (0, vitest_1.expect)((0, main_1.trimAndFormat)("  string   ", true)).toBe("STRING");
    });
    (0, vitest_1.it)("returns first letter", () => {
        (0, vitest_1.expect)((0, main_1.getFirstElement)([1, 2, 3])).toBe(1);
    });
    (0, vitest_1.it)("returns undefined", () => {
        (0, vitest_1.expect)((0, main_1.getFirstElement)([])).toBeUndefined();
    });
    (0, vitest_1.it)("find by ID", () => {
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
        (0, vitest_1.expect)((0, main_1.findById)(items, 8)).toStrictEqual({ id: 8 });
    });
});
//# sourceMappingURL=main.test.js.map