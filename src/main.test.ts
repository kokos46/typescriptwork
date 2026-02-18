import { it, describe, expect } from "vitest";
import {
  createUser,
  User,
  Book,
  createBook,
  calculateArea,
  getStatusColor,
  capitalizeFirstLetter,
  trimAndFormat,
  getFirstElement,
  HasId,
  findById
} from "./main";

describe("test lab 1", () => {
  it("creating user", () => {
    const expectingUser: User = {
      id: 1,
      name: "username",
      email: "test@user.com",
      isActive: true,
    };

    expect(createUser(1, "username", "test@user.com", true)).toStrictEqual(
      expectingUser,
    );
  });
  
  it("creating book", () => {
    const expectingBook: Book = {
      title: "testbook",
      author: "testwriter",
      year: 2002,
      genre: "fiction"
    }
    
    expect(createBook({title: "testbook", author: "testwriter", year: 2002, genre: "fiction"})).toStrictEqual(expectingBook)
  })
  
  it("calculate square area", () => {
    expect(calculateArea("square", 5)).toBe(25)
  })
  
  it("calculate circle area", () => {
    expect(calculateArea("circle", 1)).toBe(Math.PI)
  })
  
  it("get status color", () => {
    expect(getStatusColor("active")).toBe("green")
  })
  
  it("capitalizing first letter", () => {
    expect(capitalizeFirstLetter("string", false)).toBe("String")
  })
  
  it("trim and format", () => {
    expect(trimAndFormat("  string   ", true)).toBe("STRING")
  })
  
  it("returns first letter", () => {
    expect(getFirstElement<number>([1, 2, 3])).toBe(1);
  })
  
  it("returns undefined", () => {
    expect(getFirstElement<number>([])).toBeUndefined()
  })
  
  it("find by ID", () => {
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
    
    expect(findById<HasId>(items, 8)).toStrictEqual({id: 8})
  })
});
