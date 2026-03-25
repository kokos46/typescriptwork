import { describe, it, expectTypeOf } from 'vitest';
import type { DeepReadonly, PickedByType, EventHandlers } from './utilitytypes.ts';

describe('Utility Types Tests', () => {

  it('DeepReadonly should make nested properties readonly', () => {
    interface Config {
      db: {
        port: number;
        settings: {
          active: boolean;
        };
      };
    }

    type Result = DeepReadonly<Config>;

    expectTypeOf<Result['db']>().toEqualTypeOf<{
      readonly port: number;
      readonly settings: {
        readonly active: boolean;
      };
    }>();
    
    expectTypeOf<Result['db']['settings']>().toEqualTypeOf<{
      readonly active: boolean;
    }>();
  });

  it('PickedByType should filter keys by their value type', () => {
    interface User {
      id: number;
      name: string;
      age: number;
      isAdmin: boolean;
    }

    type OnlyNumbers = PickedByType<User, number>;
    type OnlyStrings = PickedByType<User, string>;

    expectTypeOf<OnlyNumbers>().toEqualTypeOf<{ id: number; age: number }>();
    expectTypeOf<OnlyStrings>().toEqualTypeOf<{ name: string }>();
  });

  it('EventHandlers should transform event names to handler names', () => {
    interface MyEvents {
      click: { x: number; y: number };
      scroll: { top: number };
    }

    type Handlers = EventHandlers<MyEvents>;

    expectTypeOf<Handlers>().toEqualTypeOf<{
      onClick: (event: { x: number; y: number }) => void;
      onScroll: (event: { top: number }) => void;
    }>();
  });
});