import { describe, it, expect, expectTypeOf } from 'vitest';
import { query, User } from './pipeline.ts';

describe('Query Pipeline Types', () => {
  it('должен ограничивать методы на начальном этапе', () => {
    const q = query<User>();

    // На начальном этапе доступен только where
    expectTypeOf(q).toHaveProperty('where');
    q.groupBy('city');
    q.run();
  });

  it('должен позволять цепочку where и переход к groupBy', () => {
    const q = query<User>().where('name', 'John');

    expectTypeOf(q).toHaveProperty('where');
    expectTypeOf(q).toHaveProperty('groupBy');
    // @ts-expect-error: having еще недоступен
    q.having(g => g.items.length > 0);
  });

  it('должен строго соблюдать порядок после groupBy', () => {
    const q = query<User>().where('name', 'John').groupBy('city');

    expectTypeOf(q).toHaveProperty('having');
    q.where('age', 25);
    q.sort('age');
  });

  it('должен возвращать исполняемую функцию после run', () => {
    const search = query<User>()
        .where('name', 'John')
        .groupBy('city')
        .having(g => g.items.length > 0)
        .sort('age')
        .run();

    expectTypeOf(search).toBeFunction();
    expectTypeOf(search).returns.not.toBeAny();
  });
});

describe('Query Pipeline Functional Logic', () => {
  const testUsers: User[] = [
    { id: 1, name: "John", surname: "Doe", age: 30, city: "NY" },
    { id: 2, name: "Jane", surname: "Smith", age: 25, city: "LA" },
    { id: 3, name: "John", surname: "Doe", age: 20, city: "NY" },
  ];


  it('должен возвращать пустой массив, если условие having не выполнено', () => {
    const search = query<User>()
        .where('name', 'John')
        .groupBy('city')
        .having(g => g.items.length > 5) // Никто не пройдет
        .sort('id')
        .run();

    expect(search(testUsers)).toEqual([]);
  });
});