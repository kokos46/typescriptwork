// -----------------------------------------------------------------------------
// Типы-метки (бренды) для различения стадий пайплайна
// -----------------------------------------------------------------------------
type WhereBrand = { __brand: 'where' };
type GroupByBrand = { __brand: 'groupBy' };
type HavingBrand = { __brand: 'having' };
type SortBrand = { __brand: 'sort' };

// -----------------------------------------------------------------------------
// Типы трансформеров на разных стадиях
// -----------------------------------------------------------------------------
type DataAfterWhere<T> = T[];
type DataAfterGroupBy<T, K extends keyof T> = Group<T, K>[];
type FinalData<T> = T[] | Group<any, any>[]; // что вернёт итоговая функция

// Группа после groupBy
interface Group<T, K extends keyof T> {
  key: T[K];
  items: T[];
}

// -----------------------------------------------------------------------------
// Функции-строители шагов (с брендами)
// -----------------------------------------------------------------------------
export const where = <T>() =>
  <K extends keyof T>(key: K, value: T[K]): ((data: T[]) => T[]) & WhereBrand =>
    Object.assign(
      (data: T[]) => data.filter(item => item[key] === value),
      { __brand: 'where' as const }
    );

export const groupBy = <T>() =>
  <K extends keyof T>(key: K): ((data: T[]) => Group<T, K>[]) & GroupByBrand =>
    Object.assign(
      (data: T[]) => {
        const map = new Map<T[K], Group<T, K>>();

        for (const item of data) {
          const k = item[key];
          let group = map.get(k);
          if (!group) {
            group = { key: k, items: [] };
            map.set(k, group);
          }
          group.items.push(item);
        }

        return Array.from(map.values());
      },
      { __brand: 'groupBy' as const }
    );

export const having = <T, K extends keyof T>() =>
  (predicate: (group: Group<T, K>) => boolean): ((groups: Group<T, K>[]) => Group<T, K>[]) & HavingBrand =>
    Object.assign(
      (groups: Group<T, K>[]) => groups.filter(predicate),
      { __brand: 'having' as const }
    );

export const sort = <T>() =>
  <K extends keyof T>(key: K): ((data: T[]) => T[]) & SortBrand =>
    Object.assign(
      (data: T[]) =>
        [...data].sort((a, b) => {
          const va = a[key];
          const vb = b[key];
          if (va < vb) return -1;
          if (va > vb) return 1;
          return 0;
        }),
      { __brand: 'sort' as const }
    );

// -----------------------------------------------------------------------------
// Перечисление допустимых стадий (используем union + conditional types)
// -----------------------------------------------------------------------------
type Stage = 'start' | 'after-where' | 'after-group' | 'after-having' | 'after-sort';

type AllowedStep<
  CurrentStage extends Stage,
  Step
> = CurrentStage extends 'start'
  ? Step & WhereBrand
  : CurrentStage extends 'after-where'
  ? Step & (WhereBrand | GroupByBrand)
  : CurrentStage extends 'after-group'
  ? Step & (HavingBrand | SortBrand)
  : CurrentStage extends 'after-having'
  ? Step & SortBrand
  : CurrentStage extends 'after-sort'
  ? never // после sort ничего нельзя
  : never;

// -----------------------------------------------------------------------------
// Рекурсивный tuple-тип с контролем порядка
// -----------------------------------------------------------------------------
type QuerySteps<T, Steps extends any[], Stage extends Stage = 'start'> =
  Steps extends [infer First, ...infer Rest]
    ? First extends AllowedStep<Stage, First>
      ? [
          First,
          ...QuerySteps<
            T,
            Rest,
            Stage extends 'start'
              ? 'after-where'
              : Stage extends 'after-where'
              ? First extends GroupByBrand
                ? 'after-group'
                : 'after-where'
              : Stage extends 'after-group'
              ? First extends HavingBrand
                ? 'after-having'
                : 'after-group'
              : Stage extends 'after-having'
              ? 'after-sort'
              : Stage
          >
        ]
      : never[] // ошибка — неверный тип шага на этой стадии
    : [];

// -----------------------------------------------------------------------------
// Главная функция query
// -----------------------------------------------------------------------------
export function query<T, const Steps extends any[]>(
  ...steps: QuerySteps<T, Steps>
): (data: T[]) => any {
  return (data: T[]) => {
    let result: any = data;

    for (const step of steps) {
      result = step(result);
    }

    return result;
  };
}

// -----------------------------------------------------------------------------
// Пример использования
// -----------------------------------------------------------------------------
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

// ✅ Должны компилироваться
const q1 = query<User>(
  where<User>()("surname", "Doe"),
  where<User>()("name", "John"),
  sort<User>()("age")
);

const q2 = query<User>(
  where<User>()("city", "NY"),
  groupBy<User>()("name"),
  having<User, "name">((g) => g.items.length > 1),
  sort<User>()("age") // ← сортировка групп по ключу name
);

const q3 = query<User>(
  groupBy<User>()("city"),
  having<User, "city">((g) => g.items.some(u => u.age >= 35))
);

// ❌ НЕ должны компилироваться (TypeScript должен ругаться)
// const bad1 = query<User>(sort<User>()("id"), where<User>()("age", 35));
// const bad2 = query<User>(having<User, any>(() => true));
// const bad3 = query<User>(groupBy<User>()("city"), where<User>()("name", "John"));
// const bad4 = query<User>(groupBy<User>()("city"), sort<User>()("age"), having<User,any>(...));

// Примеры вызова
const result1 = q1(users);
console.log("q1:", result1);

const result2 = q2(users);
console.log("q2:", result2);

const result3 = q3(users);
console.dir(result3, { depth: null });