import { describe, it, expect } from "vitest";
import { query, where, sort } from "./pipeline.ts";

type User = {
  id: number;
  name: string;
  surname: string;
  age: number;
  city: string;
};

const users: User[] = [
  { id: 1, name: "John", surname: "Doe", age: 34, city: "NY" },
  { id: 2, name: "John", surname: "Doe", age: 33, city: "NY" },
  { id: 3, name: "John", surname: "Doe", age: 35, city: "LA" },
  { id: 4, name: "Mike", surname: "Doe", age: 35, city: "LA" },
];

describe("query builder", () => {

  it("filters by name", () => {
    const search = query<User>(
      where("name", "Mike")
    );

    const result = search(users);

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Mike");
  });

  it("filters by multiple conditions", () => {
    const search = query<User>(
      where("name", "John"),
      where("city", "NY")
    );

    const result = search(users);

    expect(result).toHaveLength(2);
    expect(result.every(u => u.city === "NY")).toBe(true);
  });

  it("sorts by age ascending", () => {
    const search = query<User>(
      where("name", "John"),
      sort("age")
    );

    const result = search(users);

    expect(result.map(u => u.age)).toEqual([33, 34, 35]);
  });

  it("returns empty array when no matches", () => {
    const search = query<User>(
      where("name", "NotExists")
    );

    const result = search(users);

    expect(result).toEqual([]);
  });

  it("does not mutate original array when sorting", () => {
    const original = [...users];

    const search = query<User>(
      sort("age")
    );

    search(users);

    expect(users).toEqual(original);
  });

});