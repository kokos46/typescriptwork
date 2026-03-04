type Transform<T> = (data: T[]) => T[];
type Where<T> = <K extends keyof T>(key: K, value: T[K]) => Transform<T>;
type Sort<T> = <K extends keyof T>(key: K) => Transform<T>;
type Group<T, K extends keyof T> = {
  key: T[K],
  items: T[];
};
type GroupBy<T> = <K extends keyof T>(key: K) => Transform<Group<T, K>[]>;
type GroupTransform<T, K extends keyof T> = (groups: Group<T, K>[]) => Group<T, K>[];
type Having<T> = <K extends keyof T>(predicate: (group: Group<T, K>) => boolean) => GroupTransform<T, K>;

export function query<T>(...steps: Array<(data: any) => any>): Transform<T> {
  return (initialData: T[]) => {
    let data: any = initialData;

    for (const step of steps) {
      data = step(data);
    }

    return data;
  };
}

type User = {
  id: number,
  name: string,
  surname: string,
  age: number,
  city: string
};

const users: User[] = [
  { id: 1, name: "John", surname: "Doe", age: 34, city: "NY" },
  { id: 2, name: "John", surname: "Doe", age: 33, city: "NY" },
  { id: 3, name: "John", surname: "Doe", age: 35, city: "LA" },
  { id: 4, name: "Mike", surname: "Doe", age: 35, city: "LA" },
];

export const where: Where<User> =
  (key, value) =>
    (data) =>
      data.filter((item) => item[key] === value);

export const sort: Sort<User> =
  (key) =>
    (data) =>
      [...data].sort((a, b) => {
        const av = a[key];
        const bv = b[key];
        if (av < bv) return -1;
        if (av > bv) return 1;
        return 0;
      });

const search = query<User>(
  where("name", "John"),
  where("surname", "Doe"),
  sort("age")
);

const result = search(users);
console.log(result);
