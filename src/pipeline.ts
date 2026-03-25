export type Group<T, K extends keyof T> = {
    key: T[K];
    items: T[];
};

// =============================================
// Интерфейсы стадий (строгие)
// =============================================
export interface InitialQuery<T> {
    where<K extends keyof T>(key: K, value: T[K]): AfterWhereQuery<T>;
}

export interface AfterWhereQuery<T> {
    where<K extends keyof T>(key: K, value: T[K]): AfterWhereQuery<T>;
    groupBy<K extends keyof T>(key: K): AfterGroupByQuery<T>;
}

export interface AfterGroupByQuery<T> {
    having(predicate: (group: Group<T, any>) => boolean): AfterHavingQuery<T>;
}

export interface AfterHavingQuery<T> {
    sort<K extends keyof T>(key: K): AfterSortQuery<T>;
}

export interface AfterSortQuery<T> {
    run(): (data: T[]) => any;
}

// =============================================
// Реализация без `as any` — через private класс + casting только в фабрике
// =============================================
export class QueryImpl<T> implements
    InitialQuery<T>,
    AfterWhereQuery<T>,
    AfterGroupByQuery<T>,
    AfterHavingQuery<T>,
    AfterSortQuery<T>
{
    private readonly steps: Array<(data: any) => any> = [];

    where<K extends keyof T>(key: K, value: T[K]): AfterWhereQuery<T> {
        this.steps.push((data: T[]) => data.filter(item => item[key] === value));
        return this;
    }

    groupBy<K extends keyof T>(key: K): AfterGroupByQuery<T> {
        this.steps.push((data: T[]) => {
            const map = new Map<T[K], T[]>();
            for (const item of data) {
                const k = item[key];
                if (!map.has(k)) map.set(k, []);
                map.get(k)!.push(item);
            }
            return Array.from(map.entries()).map(([keyValue, items]) => ({ key: keyValue, items }));
        });
        return this;
    }

    having(predicate: (group: Group<T, any>) => boolean): AfterHavingQuery<T> {
        this.steps.push((groups: Group<T, any>[]) => groups.filter(predicate));
        return this;
    }

    sort<K extends keyof T>(key: K): AfterSortQuery<T> {
        this.steps.push((data: any[]) => [...data].sort((a, b) => {
            const va = a[key as any] ?? a.items?.[0]?.[key as any];
            const vb = b[key as any] ?? b.items?.[0]?.[key as any];
            return va < vb ? -1 : va > vb ? 1 : 0;
        }));
        return this;
    }

    run(): (data: T[]) => any {
        return (initialData: T[]) => {
            let data: any = initialData;
            for (const step of this.steps) {
                data = step(data);
            }
            return data;
        };
    }
}

// =============================================
// Публичный вход
// =============================================
export function query<T>(): InitialQuery<T> {
    return new QueryImpl<T>();
}

// =============================================
// Пример
// =============================================
export type User = {
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

// Правильный порядок
const search = query<User>()
    .where("name", "John")
    .where("surname", "Doe")
    .groupBy("city")
    .having(g => g.items.length > 1)
    .sort("age")
    .run();

const result = search(users);
console.log(result);