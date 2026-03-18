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

export function query<T, W extends any[], G extends any[], H extends any[], S extends any[]>(
  ...steps: [
    ...W,           // where (сколько угодно)
    ...G,           // groupBy (сколько угодно) 
    ...H,              // having (один, опционально)
    ...S            // sort (сколько угодно)
  ] & 
  // Проверяем, что W - это массив Where
  (W extends Where<T>[] ? unknown : never) &
  // Проверяем, что G - это массив GroupBy
  (G extends GroupBy<T>[] ? unknown : never) &
  // Проверяем, что H - это Having или undefined
  (H extends Having<T>[] | undefined ? unknown : never) &
  // Проверяем, что S - это массив Sort
  (S extends Sort<T>[] ? unknown : never)
): Transform<T> {
  return (data: T[]) => {
    let result: any = data;
    for (const step of steps) {
      result = step(result);
    }
    return result;
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
  (key, value) => {
    const fn = (data: User[]) =>
      data.filter((item) => item[key] === value) as User[];
    return Object.assign(fn, { _brand: 'where' as const });
  };

export const sort: Sort<User> =
  (key) => {
    const fn = (data: User[]) =>
      [...data].sort((a, b) => {
        const av = a[key];
        const bv = b[key];
        if (av < bv) return -1;
        if (av > bv) return 1;
        return 0;
      });
    return Object.assign(fn, { _brand: 'sort' as const });
  }

const groupBy =
  <K extends keyof User>(key: K) => {
    const fn = (data: User[]): Group<User, K>[] =>
    Object.values(
      data.reduce((acc, item) => {
        const k = String(item[key]);

        (acc[k] ??= {
          key: item[key],
          items: [],
        }).items.push(item);

        return acc;
      }, {} as Record<string, Group<User, K>>),
      );
    return Object.assign(fn, { _brand: 'groupBy' as const });
  }
  
const having: Having<User> =
  (predicate) => {
    const fn = (groups: any[]) =>
      groups.filter(predicate);
    return Object.assign(fn, { _brand: 'having' as const });
  }

// ✅ Правильные варианты - компилируются
const groupAndFilter = query<User>(
  groupBy("city"),
  having<User>((group) => group.items.length > 1),
);

const search = query<User>(
  where("name", "John"),
  where("surname", "Doe"),
  sort("age")
);

const pipeline = query<User>(
  where("surname", "Doe"),
  groupBy("city"),
  having<User>(
    (group) => group.items.some((u) => u.age > 34)
  ),
);

// ❌ Неправильный порядок - НЕ КОМПИЛИРУЕТСЯ!
const wrongPipeline = query<User>(
  sort("id"),     // sort не может быть первым, если дальше есть where
  where("surname", "Doe")
);

// ❌ Еще неправильные варианты:
// const wrong1 = query<User>(
//   having((group) => group.items.length > 1) // having без groupBy
// );

// const wrong2 = query<User>(
//   groupBy("city"),
//   where("name", "John") // where после groupBy
// );

// const wrong3 = query<User>(
//   groupBy("city"),
//   sort("age"),
//   having((group) => group.items.length > 1) // sort до having
// );

const result = search(users);
console.log(result);

const grouped = groupAndFilter(users);
console.dir(grouped, {depth: null});

const res = pipeline(users);
console.dir(res, { depth: null });

const wrong = wrongPipeline(users);
console.log(result);

// Этот вызов теперь не скомпилируется, поэтому закомментируем
// const res1 = wrongPipeline(users);
// console.log(res1);