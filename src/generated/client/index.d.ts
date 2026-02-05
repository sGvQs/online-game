
/**
 * Client
**/

import * as runtime from './runtime/client.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model Room
 * 
 */
export type Room = $Result.DefaultSelection<Prisma.$RoomPayload>
/**
 * Model RoomUser
 * 
 */
export type RoomUser = $Result.DefaultSelection<Prisma.$RoomUserPayload>
/**
 * Model UserIDP
 * 
 */
export type UserIDP = $Result.DefaultSelection<Prisma.$UserIDPPayload>
/**
 * Model error_events
 * This model contains row level security and requires additional setup for migrations. Visit https://pris.ly/d/row-level-security for more info.
 */
export type error_events = $Result.DefaultSelection<Prisma.$error_eventsPayload>
/**
 * Model matches
 * This model contains row level security and requires additional setup for migrations. Visit https://pris.ly/d/row-level-security for more info.
 */
export type matches = $Result.DefaultSelection<Prisma.$matchesPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const RoomStatus: {
  LOBBY: 'LOBBY',
  PLAYING: 'PLAYING',
  FINISHED: 'FINISHED'
};

export type RoomStatus = (typeof RoomStatus)[keyof typeof RoomStatus]

}

export type RoomStatus = $Enums.RoomStatus

export const RoomStatus: typeof $Enums.RoomStatus

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://pris.ly/d/client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Users
   * const users = await prisma.user.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://pris.ly/d/client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>

  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.room`: Exposes CRUD operations for the **Room** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Rooms
    * const rooms = await prisma.room.findMany()
    * ```
    */
  get room(): Prisma.RoomDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.roomUser`: Exposes CRUD operations for the **RoomUser** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more RoomUsers
    * const roomUsers = await prisma.roomUser.findMany()
    * ```
    */
  get roomUser(): Prisma.RoomUserDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.userIDP`: Exposes CRUD operations for the **UserIDP** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more UserIDPS
    * const userIDPS = await prisma.userIDP.findMany()
    * ```
    */
  get userIDP(): Prisma.UserIDPDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.error_events`: Exposes CRUD operations for the **error_events** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Error_events
    * const error_events = await prisma.error_events.findMany()
    * ```
    */
  get error_events(): Prisma.error_eventsDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.matches`: Exposes CRUD operations for the **matches** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Matches
    * const matches = await prisma.matches.findMany()
    * ```
    */
  get matches(): Prisma.matchesDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 7.3.0
   * Query Engine version: 9d6ad21cbbceab97458517b147a6a09ff43aa735
   */
  export type PrismaVersion = {
    client: string
    engine: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    User: 'User',
    Room: 'Room',
    RoomUser: 'RoomUser',
    UserIDP: 'UserIDP',
    error_events: 'error_events',
    matches: 'matches'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]



  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "user" | "room" | "roomUser" | "userIDP" | "error_events" | "matches"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      Room: {
        payload: Prisma.$RoomPayload<ExtArgs>
        fields: Prisma.RoomFieldRefs
        operations: {
          findUnique: {
            args: Prisma.RoomFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RoomPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.RoomFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RoomPayload>
          }
          findFirst: {
            args: Prisma.RoomFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RoomPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.RoomFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RoomPayload>
          }
          findMany: {
            args: Prisma.RoomFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RoomPayload>[]
          }
          create: {
            args: Prisma.RoomCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RoomPayload>
          }
          createMany: {
            args: Prisma.RoomCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.RoomCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RoomPayload>[]
          }
          delete: {
            args: Prisma.RoomDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RoomPayload>
          }
          update: {
            args: Prisma.RoomUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RoomPayload>
          }
          deleteMany: {
            args: Prisma.RoomDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.RoomUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.RoomUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RoomPayload>[]
          }
          upsert: {
            args: Prisma.RoomUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RoomPayload>
          }
          aggregate: {
            args: Prisma.RoomAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateRoom>
          }
          groupBy: {
            args: Prisma.RoomGroupByArgs<ExtArgs>
            result: $Utils.Optional<RoomGroupByOutputType>[]
          }
          count: {
            args: Prisma.RoomCountArgs<ExtArgs>
            result: $Utils.Optional<RoomCountAggregateOutputType> | number
          }
        }
      }
      RoomUser: {
        payload: Prisma.$RoomUserPayload<ExtArgs>
        fields: Prisma.RoomUserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.RoomUserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RoomUserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.RoomUserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RoomUserPayload>
          }
          findFirst: {
            args: Prisma.RoomUserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RoomUserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.RoomUserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RoomUserPayload>
          }
          findMany: {
            args: Prisma.RoomUserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RoomUserPayload>[]
          }
          create: {
            args: Prisma.RoomUserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RoomUserPayload>
          }
          createMany: {
            args: Prisma.RoomUserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.RoomUserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RoomUserPayload>[]
          }
          delete: {
            args: Prisma.RoomUserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RoomUserPayload>
          }
          update: {
            args: Prisma.RoomUserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RoomUserPayload>
          }
          deleteMany: {
            args: Prisma.RoomUserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.RoomUserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.RoomUserUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RoomUserPayload>[]
          }
          upsert: {
            args: Prisma.RoomUserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RoomUserPayload>
          }
          aggregate: {
            args: Prisma.RoomUserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateRoomUser>
          }
          groupBy: {
            args: Prisma.RoomUserGroupByArgs<ExtArgs>
            result: $Utils.Optional<RoomUserGroupByOutputType>[]
          }
          count: {
            args: Prisma.RoomUserCountArgs<ExtArgs>
            result: $Utils.Optional<RoomUserCountAggregateOutputType> | number
          }
        }
      }
      UserIDP: {
        payload: Prisma.$UserIDPPayload<ExtArgs>
        fields: Prisma.UserIDPFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserIDPFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserIDPPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserIDPFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserIDPPayload>
          }
          findFirst: {
            args: Prisma.UserIDPFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserIDPPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserIDPFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserIDPPayload>
          }
          findMany: {
            args: Prisma.UserIDPFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserIDPPayload>[]
          }
          create: {
            args: Prisma.UserIDPCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserIDPPayload>
          }
          createMany: {
            args: Prisma.UserIDPCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserIDPCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserIDPPayload>[]
          }
          delete: {
            args: Prisma.UserIDPDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserIDPPayload>
          }
          update: {
            args: Prisma.UserIDPUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserIDPPayload>
          }
          deleteMany: {
            args: Prisma.UserIDPDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserIDPUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserIDPUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserIDPPayload>[]
          }
          upsert: {
            args: Prisma.UserIDPUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserIDPPayload>
          }
          aggregate: {
            args: Prisma.UserIDPAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUserIDP>
          }
          groupBy: {
            args: Prisma.UserIDPGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserIDPGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserIDPCountArgs<ExtArgs>
            result: $Utils.Optional<UserIDPCountAggregateOutputType> | number
          }
        }
      }
      error_events: {
        payload: Prisma.$error_eventsPayload<ExtArgs>
        fields: Prisma.error_eventsFieldRefs
        operations: {
          findUnique: {
            args: Prisma.error_eventsFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$error_eventsPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.error_eventsFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$error_eventsPayload>
          }
          findFirst: {
            args: Prisma.error_eventsFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$error_eventsPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.error_eventsFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$error_eventsPayload>
          }
          findMany: {
            args: Prisma.error_eventsFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$error_eventsPayload>[]
          }
          create: {
            args: Prisma.error_eventsCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$error_eventsPayload>
          }
          createMany: {
            args: Prisma.error_eventsCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.error_eventsCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$error_eventsPayload>[]
          }
          delete: {
            args: Prisma.error_eventsDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$error_eventsPayload>
          }
          update: {
            args: Prisma.error_eventsUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$error_eventsPayload>
          }
          deleteMany: {
            args: Prisma.error_eventsDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.error_eventsUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.error_eventsUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$error_eventsPayload>[]
          }
          upsert: {
            args: Prisma.error_eventsUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$error_eventsPayload>
          }
          aggregate: {
            args: Prisma.Error_eventsAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateError_events>
          }
          groupBy: {
            args: Prisma.error_eventsGroupByArgs<ExtArgs>
            result: $Utils.Optional<Error_eventsGroupByOutputType>[]
          }
          count: {
            args: Prisma.error_eventsCountArgs<ExtArgs>
            result: $Utils.Optional<Error_eventsCountAggregateOutputType> | number
          }
        }
      }
      matches: {
        payload: Prisma.$matchesPayload<ExtArgs>
        fields: Prisma.matchesFieldRefs
        operations: {
          findUnique: {
            args: Prisma.matchesFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$matchesPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.matchesFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$matchesPayload>
          }
          findFirst: {
            args: Prisma.matchesFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$matchesPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.matchesFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$matchesPayload>
          }
          findMany: {
            args: Prisma.matchesFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$matchesPayload>[]
          }
          create: {
            args: Prisma.matchesCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$matchesPayload>
          }
          createMany: {
            args: Prisma.matchesCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.matchesCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$matchesPayload>[]
          }
          delete: {
            args: Prisma.matchesDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$matchesPayload>
          }
          update: {
            args: Prisma.matchesUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$matchesPayload>
          }
          deleteMany: {
            args: Prisma.matchesDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.matchesUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.matchesUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$matchesPayload>[]
          }
          upsert: {
            args: Prisma.matchesUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$matchesPayload>
          }
          aggregate: {
            args: Prisma.MatchesAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateMatches>
          }
          groupBy: {
            args: Prisma.matchesGroupByArgs<ExtArgs>
            result: $Utils.Optional<MatchesGroupByOutputType>[]
          }
          count: {
            args: Prisma.matchesCountArgs<ExtArgs>
            result: $Utils.Optional<MatchesCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://pris.ly/d/logging).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory
    /**
     * Prisma Accelerate URL allowing the client to connect through Accelerate instead of a direct database.
     */
    accelerateUrl?: string
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
    /**
     * SQL commenter plugins that add metadata to SQL queries as comments.
     * Comments follow the sqlcommenter format: https://google.github.io/sqlcommenter/
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   adapter,
     *   comments: [
     *     traceContext(),
     *     queryInsights(),
     *   ],
     * })
     * ```
     */
    comments?: runtime.SqlCommenterPlugin[]
  }
  export type GlobalOmitConfig = {
    user?: UserOmit
    room?: RoomOmit
    roomUser?: RoomUserOmit
    userIDP?: UserIDPOmit
    error_events?: error_eventsOmit
    matches?: matchesOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    error_events: number
    matches: number
    joinedRooms: number
    createdRooms: number
    userIDPs: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    error_events?: boolean | UserCountOutputTypeCountError_eventsArgs
    matches?: boolean | UserCountOutputTypeCountMatchesArgs
    joinedRooms?: boolean | UserCountOutputTypeCountJoinedRoomsArgs
    createdRooms?: boolean | UserCountOutputTypeCountCreatedRoomsArgs
    userIDPs?: boolean | UserCountOutputTypeCountUserIDPsArgs
  }

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountError_eventsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: error_eventsWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountMatchesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: matchesWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountJoinedRoomsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RoomUserWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountCreatedRoomsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RoomWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountUserIDPsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserIDPWhereInput
  }


  /**
   * Count Type RoomCountOutputType
   */

  export type RoomCountOutputType = {
    matches: number
    users: number
  }

  export type RoomCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    matches?: boolean | RoomCountOutputTypeCountMatchesArgs
    users?: boolean | RoomCountOutputTypeCountUsersArgs
  }

  // Custom InputTypes
  /**
   * RoomCountOutputType without action
   */
  export type RoomCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RoomCountOutputType
     */
    select?: RoomCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * RoomCountOutputType without action
   */
  export type RoomCountOutputTypeCountMatchesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: matchesWhereInput
  }

  /**
   * RoomCountOutputType without action
   */
  export type RoomCountOutputTypeCountUsersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RoomUserWhereInput
  }


  /**
   * Count Type MatchesCountOutputType
   */

  export type MatchesCountOutputType = {
    error_events: number
  }

  export type MatchesCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    error_events?: boolean | MatchesCountOutputTypeCountError_eventsArgs
  }

  // Custom InputTypes
  /**
   * MatchesCountOutputType without action
   */
  export type MatchesCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MatchesCountOutputType
     */
    select?: MatchesCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * MatchesCountOutputType without action
   */
  export type MatchesCountOutputTypeCountError_eventsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: error_eventsWhereInput
  }


  /**
   * Models
   */

  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserMinAggregateOutputType = {
    id: string | null
    name: string | null
    email: string | null
    createdAt: Date | null
  }

  export type UserMaxAggregateOutputType = {
    id: string | null
    name: string | null
    email: string | null
    createdAt: Date | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    name: number
    email: number
    createdAt: number
    _all: number
  }


  export type UserMinAggregateInputType = {
    id?: true
    name?: true
    email?: true
    createdAt?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    name?: true
    email?: true
    createdAt?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    name?: true
    email?: true
    createdAt?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: string
    name: string
    email: string
    createdAt: Date
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    email?: boolean
    createdAt?: boolean
    error_events?: boolean | User$error_eventsArgs<ExtArgs>
    matches?: boolean | User$matchesArgs<ExtArgs>
    joinedRooms?: boolean | User$joinedRoomsArgs<ExtArgs>
    createdRooms?: boolean | User$createdRoomsArgs<ExtArgs>
    userIDPs?: boolean | User$userIDPsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    email?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    email?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    name?: boolean
    email?: boolean
    createdAt?: boolean
  }

  export type UserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "email" | "createdAt", ExtArgs["result"]["user"]>
  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    error_events?: boolean | User$error_eventsArgs<ExtArgs>
    matches?: boolean | User$matchesArgs<ExtArgs>
    joinedRooms?: boolean | User$joinedRoomsArgs<ExtArgs>
    createdRooms?: boolean | User$createdRoomsArgs<ExtArgs>
    userIDPs?: boolean | User$userIDPsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type UserIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      error_events: Prisma.$error_eventsPayload<ExtArgs>[]
      matches: Prisma.$matchesPayload<ExtArgs>[]
      joinedRooms: Prisma.$RoomUserPayload<ExtArgs>[]
      createdRooms: Prisma.$RoomPayload<ExtArgs>[]
      userIDPs: Prisma.$UserIDPPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      email: string
      createdAt: Date
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users and returns the data updated in the database.
     * @param {UserUpdateManyAndReturnArgs} args - Arguments to update many Users.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Users and only return the `id`
     * const userWithIdOnly = await prisma.user.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserUpdateManyAndReturnArgs>(args: SelectSubset<T, UserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    error_events<T extends User$error_eventsArgs<ExtArgs> = {}>(args?: Subset<T, User$error_eventsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$error_eventsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    matches<T extends User$matchesArgs<ExtArgs> = {}>(args?: Subset<T, User$matchesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$matchesPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    joinedRooms<T extends User$joinedRoomsArgs<ExtArgs> = {}>(args?: Subset<T, User$joinedRoomsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RoomUserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    createdRooms<T extends User$createdRoomsArgs<ExtArgs> = {}>(args?: Subset<T, User$createdRoomsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RoomPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    userIDPs<T extends User$userIDPsArgs<ExtArgs> = {}>(args?: Subset<T, User$userIDPsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserIDPPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'String'>
    readonly name: FieldRef<"User", 'String'>
    readonly email: FieldRef<"User", 'String'>
    readonly createdAt: FieldRef<"User", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User updateManyAndReturn
   */
  export type UserUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to delete.
     */
    limit?: number
  }

  /**
   * User.error_events
   */
  export type User$error_eventsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the error_events
     */
    select?: error_eventsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the error_events
     */
    omit?: error_eventsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: error_eventsInclude<ExtArgs> | null
    where?: error_eventsWhereInput
    orderBy?: error_eventsOrderByWithRelationInput | error_eventsOrderByWithRelationInput[]
    cursor?: error_eventsWhereUniqueInput
    take?: number
    skip?: number
    distinct?: Error_eventsScalarFieldEnum | Error_eventsScalarFieldEnum[]
  }

  /**
   * User.matches
   */
  export type User$matchesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the matches
     */
    select?: matchesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the matches
     */
    omit?: matchesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: matchesInclude<ExtArgs> | null
    where?: matchesWhereInput
    orderBy?: matchesOrderByWithRelationInput | matchesOrderByWithRelationInput[]
    cursor?: matchesWhereUniqueInput
    take?: number
    skip?: number
    distinct?: MatchesScalarFieldEnum | MatchesScalarFieldEnum[]
  }

  /**
   * User.joinedRooms
   */
  export type User$joinedRoomsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RoomUser
     */
    select?: RoomUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RoomUser
     */
    omit?: RoomUserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoomUserInclude<ExtArgs> | null
    where?: RoomUserWhereInput
    orderBy?: RoomUserOrderByWithRelationInput | RoomUserOrderByWithRelationInput[]
    cursor?: RoomUserWhereUniqueInput
    take?: number
    skip?: number
    distinct?: RoomUserScalarFieldEnum | RoomUserScalarFieldEnum[]
  }

  /**
   * User.createdRooms
   */
  export type User$createdRoomsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Room
     */
    select?: RoomSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Room
     */
    omit?: RoomOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoomInclude<ExtArgs> | null
    where?: RoomWhereInput
    orderBy?: RoomOrderByWithRelationInput | RoomOrderByWithRelationInput[]
    cursor?: RoomWhereUniqueInput
    take?: number
    skip?: number
    distinct?: RoomScalarFieldEnum | RoomScalarFieldEnum[]
  }

  /**
   * User.userIDPs
   */
  export type User$userIDPsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserIDP
     */
    select?: UserIDPSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserIDP
     */
    omit?: UserIDPOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserIDPInclude<ExtArgs> | null
    where?: UserIDPWhereInput
    orderBy?: UserIDPOrderByWithRelationInput | UserIDPOrderByWithRelationInput[]
    cursor?: UserIDPWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UserIDPScalarFieldEnum | UserIDPScalarFieldEnum[]
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
  }


  /**
   * Model Room
   */

  export type AggregateRoom = {
    _count: RoomCountAggregateOutputType | null
    _min: RoomMinAggregateOutputType | null
    _max: RoomMaxAggregateOutputType | null
  }

  export type RoomMinAggregateOutputType = {
    id: string | null
    name: string | null
    createdAt: Date | null
    createdBy: string | null
    current_match_id: string | null
    activeGameType: string | null
    status: $Enums.RoomStatus | null
  }

  export type RoomMaxAggregateOutputType = {
    id: string | null
    name: string | null
    createdAt: Date | null
    createdBy: string | null
    current_match_id: string | null
    activeGameType: string | null
    status: $Enums.RoomStatus | null
  }

  export type RoomCountAggregateOutputType = {
    id: number
    name: number
    createdAt: number
    createdBy: number
    current_match_id: number
    activeGameType: number
    status: number
    _all: number
  }


  export type RoomMinAggregateInputType = {
    id?: true
    name?: true
    createdAt?: true
    createdBy?: true
    current_match_id?: true
    activeGameType?: true
    status?: true
  }

  export type RoomMaxAggregateInputType = {
    id?: true
    name?: true
    createdAt?: true
    createdBy?: true
    current_match_id?: true
    activeGameType?: true
    status?: true
  }

  export type RoomCountAggregateInputType = {
    id?: true
    name?: true
    createdAt?: true
    createdBy?: true
    current_match_id?: true
    activeGameType?: true
    status?: true
    _all?: true
  }

  export type RoomAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Room to aggregate.
     */
    where?: RoomWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Rooms to fetch.
     */
    orderBy?: RoomOrderByWithRelationInput | RoomOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: RoomWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Rooms from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Rooms.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Rooms
    **/
    _count?: true | RoomCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: RoomMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: RoomMaxAggregateInputType
  }

  export type GetRoomAggregateType<T extends RoomAggregateArgs> = {
        [P in keyof T & keyof AggregateRoom]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateRoom[P]>
      : GetScalarType<T[P], AggregateRoom[P]>
  }




  export type RoomGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RoomWhereInput
    orderBy?: RoomOrderByWithAggregationInput | RoomOrderByWithAggregationInput[]
    by: RoomScalarFieldEnum[] | RoomScalarFieldEnum
    having?: RoomScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: RoomCountAggregateInputType | true
    _min?: RoomMinAggregateInputType
    _max?: RoomMaxAggregateInputType
  }

  export type RoomGroupByOutputType = {
    id: string
    name: string
    createdAt: Date
    createdBy: string
    current_match_id: string | null
    activeGameType: string | null
    status: $Enums.RoomStatus
    _count: RoomCountAggregateOutputType | null
    _min: RoomMinAggregateOutputType | null
    _max: RoomMaxAggregateOutputType | null
  }

  type GetRoomGroupByPayload<T extends RoomGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<RoomGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof RoomGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], RoomGroupByOutputType[P]>
            : GetScalarType<T[P], RoomGroupByOutputType[P]>
        }
      >
    >


  export type RoomSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    createdAt?: boolean
    createdBy?: boolean
    current_match_id?: boolean
    activeGameType?: boolean
    status?: boolean
    matches?: boolean | Room$matchesArgs<ExtArgs>
    users?: boolean | Room$usersArgs<ExtArgs>
    creator?: boolean | UserDefaultArgs<ExtArgs>
    _count?: boolean | RoomCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["room"]>

  export type RoomSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    createdAt?: boolean
    createdBy?: boolean
    current_match_id?: boolean
    activeGameType?: boolean
    status?: boolean
    creator?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["room"]>

  export type RoomSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    createdAt?: boolean
    createdBy?: boolean
    current_match_id?: boolean
    activeGameType?: boolean
    status?: boolean
    creator?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["room"]>

  export type RoomSelectScalar = {
    id?: boolean
    name?: boolean
    createdAt?: boolean
    createdBy?: boolean
    current_match_id?: boolean
    activeGameType?: boolean
    status?: boolean
  }

  export type RoomOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "createdAt" | "createdBy" | "current_match_id" | "activeGameType" | "status", ExtArgs["result"]["room"]>
  export type RoomInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    matches?: boolean | Room$matchesArgs<ExtArgs>
    users?: boolean | Room$usersArgs<ExtArgs>
    creator?: boolean | UserDefaultArgs<ExtArgs>
    _count?: boolean | RoomCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type RoomIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    creator?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type RoomIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    creator?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $RoomPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Room"
    objects: {
      matches: Prisma.$matchesPayload<ExtArgs>[]
      users: Prisma.$RoomUserPayload<ExtArgs>[]
      creator: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      createdAt: Date
      createdBy: string
      current_match_id: string | null
      activeGameType: string | null
      status: $Enums.RoomStatus
    }, ExtArgs["result"]["room"]>
    composites: {}
  }

  type RoomGetPayload<S extends boolean | null | undefined | RoomDefaultArgs> = $Result.GetResult<Prisma.$RoomPayload, S>

  type RoomCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<RoomFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: RoomCountAggregateInputType | true
    }

  export interface RoomDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Room'], meta: { name: 'Room' } }
    /**
     * Find zero or one Room that matches the filter.
     * @param {RoomFindUniqueArgs} args - Arguments to find a Room
     * @example
     * // Get one Room
     * const room = await prisma.room.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends RoomFindUniqueArgs>(args: SelectSubset<T, RoomFindUniqueArgs<ExtArgs>>): Prisma__RoomClient<$Result.GetResult<Prisma.$RoomPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Room that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {RoomFindUniqueOrThrowArgs} args - Arguments to find a Room
     * @example
     * // Get one Room
     * const room = await prisma.room.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends RoomFindUniqueOrThrowArgs>(args: SelectSubset<T, RoomFindUniqueOrThrowArgs<ExtArgs>>): Prisma__RoomClient<$Result.GetResult<Prisma.$RoomPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Room that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoomFindFirstArgs} args - Arguments to find a Room
     * @example
     * // Get one Room
     * const room = await prisma.room.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends RoomFindFirstArgs>(args?: SelectSubset<T, RoomFindFirstArgs<ExtArgs>>): Prisma__RoomClient<$Result.GetResult<Prisma.$RoomPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Room that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoomFindFirstOrThrowArgs} args - Arguments to find a Room
     * @example
     * // Get one Room
     * const room = await prisma.room.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends RoomFindFirstOrThrowArgs>(args?: SelectSubset<T, RoomFindFirstOrThrowArgs<ExtArgs>>): Prisma__RoomClient<$Result.GetResult<Prisma.$RoomPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Rooms that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoomFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Rooms
     * const rooms = await prisma.room.findMany()
     * 
     * // Get first 10 Rooms
     * const rooms = await prisma.room.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const roomWithIdOnly = await prisma.room.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends RoomFindManyArgs>(args?: SelectSubset<T, RoomFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RoomPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Room.
     * @param {RoomCreateArgs} args - Arguments to create a Room.
     * @example
     * // Create one Room
     * const Room = await prisma.room.create({
     *   data: {
     *     // ... data to create a Room
     *   }
     * })
     * 
     */
    create<T extends RoomCreateArgs>(args: SelectSubset<T, RoomCreateArgs<ExtArgs>>): Prisma__RoomClient<$Result.GetResult<Prisma.$RoomPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Rooms.
     * @param {RoomCreateManyArgs} args - Arguments to create many Rooms.
     * @example
     * // Create many Rooms
     * const room = await prisma.room.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends RoomCreateManyArgs>(args?: SelectSubset<T, RoomCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Rooms and returns the data saved in the database.
     * @param {RoomCreateManyAndReturnArgs} args - Arguments to create many Rooms.
     * @example
     * // Create many Rooms
     * const room = await prisma.room.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Rooms and only return the `id`
     * const roomWithIdOnly = await prisma.room.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends RoomCreateManyAndReturnArgs>(args?: SelectSubset<T, RoomCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RoomPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Room.
     * @param {RoomDeleteArgs} args - Arguments to delete one Room.
     * @example
     * // Delete one Room
     * const Room = await prisma.room.delete({
     *   where: {
     *     // ... filter to delete one Room
     *   }
     * })
     * 
     */
    delete<T extends RoomDeleteArgs>(args: SelectSubset<T, RoomDeleteArgs<ExtArgs>>): Prisma__RoomClient<$Result.GetResult<Prisma.$RoomPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Room.
     * @param {RoomUpdateArgs} args - Arguments to update one Room.
     * @example
     * // Update one Room
     * const room = await prisma.room.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends RoomUpdateArgs>(args: SelectSubset<T, RoomUpdateArgs<ExtArgs>>): Prisma__RoomClient<$Result.GetResult<Prisma.$RoomPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Rooms.
     * @param {RoomDeleteManyArgs} args - Arguments to filter Rooms to delete.
     * @example
     * // Delete a few Rooms
     * const { count } = await prisma.room.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends RoomDeleteManyArgs>(args?: SelectSubset<T, RoomDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Rooms.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoomUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Rooms
     * const room = await prisma.room.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends RoomUpdateManyArgs>(args: SelectSubset<T, RoomUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Rooms and returns the data updated in the database.
     * @param {RoomUpdateManyAndReturnArgs} args - Arguments to update many Rooms.
     * @example
     * // Update many Rooms
     * const room = await prisma.room.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Rooms and only return the `id`
     * const roomWithIdOnly = await prisma.room.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends RoomUpdateManyAndReturnArgs>(args: SelectSubset<T, RoomUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RoomPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Room.
     * @param {RoomUpsertArgs} args - Arguments to update or create a Room.
     * @example
     * // Update or create a Room
     * const room = await prisma.room.upsert({
     *   create: {
     *     // ... data to create a Room
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Room we want to update
     *   }
     * })
     */
    upsert<T extends RoomUpsertArgs>(args: SelectSubset<T, RoomUpsertArgs<ExtArgs>>): Prisma__RoomClient<$Result.GetResult<Prisma.$RoomPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Rooms.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoomCountArgs} args - Arguments to filter Rooms to count.
     * @example
     * // Count the number of Rooms
     * const count = await prisma.room.count({
     *   where: {
     *     // ... the filter for the Rooms we want to count
     *   }
     * })
    **/
    count<T extends RoomCountArgs>(
      args?: Subset<T, RoomCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], RoomCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Room.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoomAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends RoomAggregateArgs>(args: Subset<T, RoomAggregateArgs>): Prisma.PrismaPromise<GetRoomAggregateType<T>>

    /**
     * Group by Room.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoomGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends RoomGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: RoomGroupByArgs['orderBy'] }
        : { orderBy?: RoomGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, RoomGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRoomGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Room model
   */
  readonly fields: RoomFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Room.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__RoomClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    matches<T extends Room$matchesArgs<ExtArgs> = {}>(args?: Subset<T, Room$matchesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$matchesPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    users<T extends Room$usersArgs<ExtArgs> = {}>(args?: Subset<T, Room$usersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RoomUserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    creator<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Room model
   */
  interface RoomFieldRefs {
    readonly id: FieldRef<"Room", 'String'>
    readonly name: FieldRef<"Room", 'String'>
    readonly createdAt: FieldRef<"Room", 'DateTime'>
    readonly createdBy: FieldRef<"Room", 'String'>
    readonly current_match_id: FieldRef<"Room", 'String'>
    readonly activeGameType: FieldRef<"Room", 'String'>
    readonly status: FieldRef<"Room", 'RoomStatus'>
  }
    

  // Custom InputTypes
  /**
   * Room findUnique
   */
  export type RoomFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Room
     */
    select?: RoomSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Room
     */
    omit?: RoomOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoomInclude<ExtArgs> | null
    /**
     * Filter, which Room to fetch.
     */
    where: RoomWhereUniqueInput
  }

  /**
   * Room findUniqueOrThrow
   */
  export type RoomFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Room
     */
    select?: RoomSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Room
     */
    omit?: RoomOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoomInclude<ExtArgs> | null
    /**
     * Filter, which Room to fetch.
     */
    where: RoomWhereUniqueInput
  }

  /**
   * Room findFirst
   */
  export type RoomFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Room
     */
    select?: RoomSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Room
     */
    omit?: RoomOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoomInclude<ExtArgs> | null
    /**
     * Filter, which Room to fetch.
     */
    where?: RoomWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Rooms to fetch.
     */
    orderBy?: RoomOrderByWithRelationInput | RoomOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Rooms.
     */
    cursor?: RoomWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Rooms from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Rooms.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Rooms.
     */
    distinct?: RoomScalarFieldEnum | RoomScalarFieldEnum[]
  }

  /**
   * Room findFirstOrThrow
   */
  export type RoomFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Room
     */
    select?: RoomSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Room
     */
    omit?: RoomOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoomInclude<ExtArgs> | null
    /**
     * Filter, which Room to fetch.
     */
    where?: RoomWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Rooms to fetch.
     */
    orderBy?: RoomOrderByWithRelationInput | RoomOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Rooms.
     */
    cursor?: RoomWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Rooms from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Rooms.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Rooms.
     */
    distinct?: RoomScalarFieldEnum | RoomScalarFieldEnum[]
  }

  /**
   * Room findMany
   */
  export type RoomFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Room
     */
    select?: RoomSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Room
     */
    omit?: RoomOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoomInclude<ExtArgs> | null
    /**
     * Filter, which Rooms to fetch.
     */
    where?: RoomWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Rooms to fetch.
     */
    orderBy?: RoomOrderByWithRelationInput | RoomOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Rooms.
     */
    cursor?: RoomWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Rooms from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Rooms.
     */
    skip?: number
    distinct?: RoomScalarFieldEnum | RoomScalarFieldEnum[]
  }

  /**
   * Room create
   */
  export type RoomCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Room
     */
    select?: RoomSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Room
     */
    omit?: RoomOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoomInclude<ExtArgs> | null
    /**
     * The data needed to create a Room.
     */
    data: XOR<RoomCreateInput, RoomUncheckedCreateInput>
  }

  /**
   * Room createMany
   */
  export type RoomCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Rooms.
     */
    data: RoomCreateManyInput | RoomCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Room createManyAndReturn
   */
  export type RoomCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Room
     */
    select?: RoomSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Room
     */
    omit?: RoomOmit<ExtArgs> | null
    /**
     * The data used to create many Rooms.
     */
    data: RoomCreateManyInput | RoomCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoomIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Room update
   */
  export type RoomUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Room
     */
    select?: RoomSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Room
     */
    omit?: RoomOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoomInclude<ExtArgs> | null
    /**
     * The data needed to update a Room.
     */
    data: XOR<RoomUpdateInput, RoomUncheckedUpdateInput>
    /**
     * Choose, which Room to update.
     */
    where: RoomWhereUniqueInput
  }

  /**
   * Room updateMany
   */
  export type RoomUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Rooms.
     */
    data: XOR<RoomUpdateManyMutationInput, RoomUncheckedUpdateManyInput>
    /**
     * Filter which Rooms to update
     */
    where?: RoomWhereInput
    /**
     * Limit how many Rooms to update.
     */
    limit?: number
  }

  /**
   * Room updateManyAndReturn
   */
  export type RoomUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Room
     */
    select?: RoomSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Room
     */
    omit?: RoomOmit<ExtArgs> | null
    /**
     * The data used to update Rooms.
     */
    data: XOR<RoomUpdateManyMutationInput, RoomUncheckedUpdateManyInput>
    /**
     * Filter which Rooms to update
     */
    where?: RoomWhereInput
    /**
     * Limit how many Rooms to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoomIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Room upsert
   */
  export type RoomUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Room
     */
    select?: RoomSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Room
     */
    omit?: RoomOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoomInclude<ExtArgs> | null
    /**
     * The filter to search for the Room to update in case it exists.
     */
    where: RoomWhereUniqueInput
    /**
     * In case the Room found by the `where` argument doesn't exist, create a new Room with this data.
     */
    create: XOR<RoomCreateInput, RoomUncheckedCreateInput>
    /**
     * In case the Room was found with the provided `where` argument, update it with this data.
     */
    update: XOR<RoomUpdateInput, RoomUncheckedUpdateInput>
  }

  /**
   * Room delete
   */
  export type RoomDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Room
     */
    select?: RoomSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Room
     */
    omit?: RoomOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoomInclude<ExtArgs> | null
    /**
     * Filter which Room to delete.
     */
    where: RoomWhereUniqueInput
  }

  /**
   * Room deleteMany
   */
  export type RoomDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Rooms to delete
     */
    where?: RoomWhereInput
    /**
     * Limit how many Rooms to delete.
     */
    limit?: number
  }

  /**
   * Room.matches
   */
  export type Room$matchesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the matches
     */
    select?: matchesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the matches
     */
    omit?: matchesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: matchesInclude<ExtArgs> | null
    where?: matchesWhereInput
    orderBy?: matchesOrderByWithRelationInput | matchesOrderByWithRelationInput[]
    cursor?: matchesWhereUniqueInput
    take?: number
    skip?: number
    distinct?: MatchesScalarFieldEnum | MatchesScalarFieldEnum[]
  }

  /**
   * Room.users
   */
  export type Room$usersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RoomUser
     */
    select?: RoomUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RoomUser
     */
    omit?: RoomUserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoomUserInclude<ExtArgs> | null
    where?: RoomUserWhereInput
    orderBy?: RoomUserOrderByWithRelationInput | RoomUserOrderByWithRelationInput[]
    cursor?: RoomUserWhereUniqueInput
    take?: number
    skip?: number
    distinct?: RoomUserScalarFieldEnum | RoomUserScalarFieldEnum[]
  }

  /**
   * Room without action
   */
  export type RoomDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Room
     */
    select?: RoomSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Room
     */
    omit?: RoomOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoomInclude<ExtArgs> | null
  }


  /**
   * Model RoomUser
   */

  export type AggregateRoomUser = {
    _count: RoomUserCountAggregateOutputType | null
    _min: RoomUserMinAggregateOutputType | null
    _max: RoomUserMaxAggregateOutputType | null
  }

  export type RoomUserMinAggregateOutputType = {
    id: string | null
    roomId: string | null
    userId: string | null
    createdAt: Date | null
  }

  export type RoomUserMaxAggregateOutputType = {
    id: string | null
    roomId: string | null
    userId: string | null
    createdAt: Date | null
  }

  export type RoomUserCountAggregateOutputType = {
    id: number
    roomId: number
    userId: number
    createdAt: number
    _all: number
  }


  export type RoomUserMinAggregateInputType = {
    id?: true
    roomId?: true
    userId?: true
    createdAt?: true
  }

  export type RoomUserMaxAggregateInputType = {
    id?: true
    roomId?: true
    userId?: true
    createdAt?: true
  }

  export type RoomUserCountAggregateInputType = {
    id?: true
    roomId?: true
    userId?: true
    createdAt?: true
    _all?: true
  }

  export type RoomUserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RoomUser to aggregate.
     */
    where?: RoomUserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RoomUsers to fetch.
     */
    orderBy?: RoomUserOrderByWithRelationInput | RoomUserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: RoomUserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RoomUsers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RoomUsers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned RoomUsers
    **/
    _count?: true | RoomUserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: RoomUserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: RoomUserMaxAggregateInputType
  }

  export type GetRoomUserAggregateType<T extends RoomUserAggregateArgs> = {
        [P in keyof T & keyof AggregateRoomUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateRoomUser[P]>
      : GetScalarType<T[P], AggregateRoomUser[P]>
  }




  export type RoomUserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RoomUserWhereInput
    orderBy?: RoomUserOrderByWithAggregationInput | RoomUserOrderByWithAggregationInput[]
    by: RoomUserScalarFieldEnum[] | RoomUserScalarFieldEnum
    having?: RoomUserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: RoomUserCountAggregateInputType | true
    _min?: RoomUserMinAggregateInputType
    _max?: RoomUserMaxAggregateInputType
  }

  export type RoomUserGroupByOutputType = {
    id: string
    roomId: string
    userId: string
    createdAt: Date
    _count: RoomUserCountAggregateOutputType | null
    _min: RoomUserMinAggregateOutputType | null
    _max: RoomUserMaxAggregateOutputType | null
  }

  type GetRoomUserGroupByPayload<T extends RoomUserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<RoomUserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof RoomUserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], RoomUserGroupByOutputType[P]>
            : GetScalarType<T[P], RoomUserGroupByOutputType[P]>
        }
      >
    >


  export type RoomUserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    roomId?: boolean
    userId?: boolean
    createdAt?: boolean
    room?: boolean | RoomDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["roomUser"]>

  export type RoomUserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    roomId?: boolean
    userId?: boolean
    createdAt?: boolean
    room?: boolean | RoomDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["roomUser"]>

  export type RoomUserSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    roomId?: boolean
    userId?: boolean
    createdAt?: boolean
    room?: boolean | RoomDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["roomUser"]>

  export type RoomUserSelectScalar = {
    id?: boolean
    roomId?: boolean
    userId?: boolean
    createdAt?: boolean
  }

  export type RoomUserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "roomId" | "userId" | "createdAt", ExtArgs["result"]["roomUser"]>
  export type RoomUserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    room?: boolean | RoomDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type RoomUserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    room?: boolean | RoomDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type RoomUserIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    room?: boolean | RoomDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $RoomUserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "RoomUser"
    objects: {
      room: Prisma.$RoomPayload<ExtArgs>
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      roomId: string
      userId: string
      createdAt: Date
    }, ExtArgs["result"]["roomUser"]>
    composites: {}
  }

  type RoomUserGetPayload<S extends boolean | null | undefined | RoomUserDefaultArgs> = $Result.GetResult<Prisma.$RoomUserPayload, S>

  type RoomUserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<RoomUserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: RoomUserCountAggregateInputType | true
    }

  export interface RoomUserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['RoomUser'], meta: { name: 'RoomUser' } }
    /**
     * Find zero or one RoomUser that matches the filter.
     * @param {RoomUserFindUniqueArgs} args - Arguments to find a RoomUser
     * @example
     * // Get one RoomUser
     * const roomUser = await prisma.roomUser.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends RoomUserFindUniqueArgs>(args: SelectSubset<T, RoomUserFindUniqueArgs<ExtArgs>>): Prisma__RoomUserClient<$Result.GetResult<Prisma.$RoomUserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one RoomUser that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {RoomUserFindUniqueOrThrowArgs} args - Arguments to find a RoomUser
     * @example
     * // Get one RoomUser
     * const roomUser = await prisma.roomUser.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends RoomUserFindUniqueOrThrowArgs>(args: SelectSubset<T, RoomUserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__RoomUserClient<$Result.GetResult<Prisma.$RoomUserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first RoomUser that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoomUserFindFirstArgs} args - Arguments to find a RoomUser
     * @example
     * // Get one RoomUser
     * const roomUser = await prisma.roomUser.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends RoomUserFindFirstArgs>(args?: SelectSubset<T, RoomUserFindFirstArgs<ExtArgs>>): Prisma__RoomUserClient<$Result.GetResult<Prisma.$RoomUserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first RoomUser that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoomUserFindFirstOrThrowArgs} args - Arguments to find a RoomUser
     * @example
     * // Get one RoomUser
     * const roomUser = await prisma.roomUser.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends RoomUserFindFirstOrThrowArgs>(args?: SelectSubset<T, RoomUserFindFirstOrThrowArgs<ExtArgs>>): Prisma__RoomUserClient<$Result.GetResult<Prisma.$RoomUserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more RoomUsers that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoomUserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all RoomUsers
     * const roomUsers = await prisma.roomUser.findMany()
     * 
     * // Get first 10 RoomUsers
     * const roomUsers = await prisma.roomUser.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const roomUserWithIdOnly = await prisma.roomUser.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends RoomUserFindManyArgs>(args?: SelectSubset<T, RoomUserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RoomUserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a RoomUser.
     * @param {RoomUserCreateArgs} args - Arguments to create a RoomUser.
     * @example
     * // Create one RoomUser
     * const RoomUser = await prisma.roomUser.create({
     *   data: {
     *     // ... data to create a RoomUser
     *   }
     * })
     * 
     */
    create<T extends RoomUserCreateArgs>(args: SelectSubset<T, RoomUserCreateArgs<ExtArgs>>): Prisma__RoomUserClient<$Result.GetResult<Prisma.$RoomUserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many RoomUsers.
     * @param {RoomUserCreateManyArgs} args - Arguments to create many RoomUsers.
     * @example
     * // Create many RoomUsers
     * const roomUser = await prisma.roomUser.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends RoomUserCreateManyArgs>(args?: SelectSubset<T, RoomUserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many RoomUsers and returns the data saved in the database.
     * @param {RoomUserCreateManyAndReturnArgs} args - Arguments to create many RoomUsers.
     * @example
     * // Create many RoomUsers
     * const roomUser = await prisma.roomUser.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many RoomUsers and only return the `id`
     * const roomUserWithIdOnly = await prisma.roomUser.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends RoomUserCreateManyAndReturnArgs>(args?: SelectSubset<T, RoomUserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RoomUserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a RoomUser.
     * @param {RoomUserDeleteArgs} args - Arguments to delete one RoomUser.
     * @example
     * // Delete one RoomUser
     * const RoomUser = await prisma.roomUser.delete({
     *   where: {
     *     // ... filter to delete one RoomUser
     *   }
     * })
     * 
     */
    delete<T extends RoomUserDeleteArgs>(args: SelectSubset<T, RoomUserDeleteArgs<ExtArgs>>): Prisma__RoomUserClient<$Result.GetResult<Prisma.$RoomUserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one RoomUser.
     * @param {RoomUserUpdateArgs} args - Arguments to update one RoomUser.
     * @example
     * // Update one RoomUser
     * const roomUser = await prisma.roomUser.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends RoomUserUpdateArgs>(args: SelectSubset<T, RoomUserUpdateArgs<ExtArgs>>): Prisma__RoomUserClient<$Result.GetResult<Prisma.$RoomUserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more RoomUsers.
     * @param {RoomUserDeleteManyArgs} args - Arguments to filter RoomUsers to delete.
     * @example
     * // Delete a few RoomUsers
     * const { count } = await prisma.roomUser.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends RoomUserDeleteManyArgs>(args?: SelectSubset<T, RoomUserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more RoomUsers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoomUserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many RoomUsers
     * const roomUser = await prisma.roomUser.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends RoomUserUpdateManyArgs>(args: SelectSubset<T, RoomUserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more RoomUsers and returns the data updated in the database.
     * @param {RoomUserUpdateManyAndReturnArgs} args - Arguments to update many RoomUsers.
     * @example
     * // Update many RoomUsers
     * const roomUser = await prisma.roomUser.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more RoomUsers and only return the `id`
     * const roomUserWithIdOnly = await prisma.roomUser.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends RoomUserUpdateManyAndReturnArgs>(args: SelectSubset<T, RoomUserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RoomUserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one RoomUser.
     * @param {RoomUserUpsertArgs} args - Arguments to update or create a RoomUser.
     * @example
     * // Update or create a RoomUser
     * const roomUser = await prisma.roomUser.upsert({
     *   create: {
     *     // ... data to create a RoomUser
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the RoomUser we want to update
     *   }
     * })
     */
    upsert<T extends RoomUserUpsertArgs>(args: SelectSubset<T, RoomUserUpsertArgs<ExtArgs>>): Prisma__RoomUserClient<$Result.GetResult<Prisma.$RoomUserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of RoomUsers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoomUserCountArgs} args - Arguments to filter RoomUsers to count.
     * @example
     * // Count the number of RoomUsers
     * const count = await prisma.roomUser.count({
     *   where: {
     *     // ... the filter for the RoomUsers we want to count
     *   }
     * })
    **/
    count<T extends RoomUserCountArgs>(
      args?: Subset<T, RoomUserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], RoomUserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a RoomUser.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoomUserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends RoomUserAggregateArgs>(args: Subset<T, RoomUserAggregateArgs>): Prisma.PrismaPromise<GetRoomUserAggregateType<T>>

    /**
     * Group by RoomUser.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoomUserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends RoomUserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: RoomUserGroupByArgs['orderBy'] }
        : { orderBy?: RoomUserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, RoomUserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRoomUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the RoomUser model
   */
  readonly fields: RoomUserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for RoomUser.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__RoomUserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    room<T extends RoomDefaultArgs<ExtArgs> = {}>(args?: Subset<T, RoomDefaultArgs<ExtArgs>>): Prisma__RoomClient<$Result.GetResult<Prisma.$RoomPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the RoomUser model
   */
  interface RoomUserFieldRefs {
    readonly id: FieldRef<"RoomUser", 'String'>
    readonly roomId: FieldRef<"RoomUser", 'String'>
    readonly userId: FieldRef<"RoomUser", 'String'>
    readonly createdAt: FieldRef<"RoomUser", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * RoomUser findUnique
   */
  export type RoomUserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RoomUser
     */
    select?: RoomUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RoomUser
     */
    omit?: RoomUserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoomUserInclude<ExtArgs> | null
    /**
     * Filter, which RoomUser to fetch.
     */
    where: RoomUserWhereUniqueInput
  }

  /**
   * RoomUser findUniqueOrThrow
   */
  export type RoomUserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RoomUser
     */
    select?: RoomUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RoomUser
     */
    omit?: RoomUserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoomUserInclude<ExtArgs> | null
    /**
     * Filter, which RoomUser to fetch.
     */
    where: RoomUserWhereUniqueInput
  }

  /**
   * RoomUser findFirst
   */
  export type RoomUserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RoomUser
     */
    select?: RoomUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RoomUser
     */
    omit?: RoomUserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoomUserInclude<ExtArgs> | null
    /**
     * Filter, which RoomUser to fetch.
     */
    where?: RoomUserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RoomUsers to fetch.
     */
    orderBy?: RoomUserOrderByWithRelationInput | RoomUserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RoomUsers.
     */
    cursor?: RoomUserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RoomUsers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RoomUsers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RoomUsers.
     */
    distinct?: RoomUserScalarFieldEnum | RoomUserScalarFieldEnum[]
  }

  /**
   * RoomUser findFirstOrThrow
   */
  export type RoomUserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RoomUser
     */
    select?: RoomUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RoomUser
     */
    omit?: RoomUserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoomUserInclude<ExtArgs> | null
    /**
     * Filter, which RoomUser to fetch.
     */
    where?: RoomUserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RoomUsers to fetch.
     */
    orderBy?: RoomUserOrderByWithRelationInput | RoomUserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RoomUsers.
     */
    cursor?: RoomUserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RoomUsers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RoomUsers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RoomUsers.
     */
    distinct?: RoomUserScalarFieldEnum | RoomUserScalarFieldEnum[]
  }

  /**
   * RoomUser findMany
   */
  export type RoomUserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RoomUser
     */
    select?: RoomUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RoomUser
     */
    omit?: RoomUserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoomUserInclude<ExtArgs> | null
    /**
     * Filter, which RoomUsers to fetch.
     */
    where?: RoomUserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RoomUsers to fetch.
     */
    orderBy?: RoomUserOrderByWithRelationInput | RoomUserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing RoomUsers.
     */
    cursor?: RoomUserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RoomUsers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RoomUsers.
     */
    skip?: number
    distinct?: RoomUserScalarFieldEnum | RoomUserScalarFieldEnum[]
  }

  /**
   * RoomUser create
   */
  export type RoomUserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RoomUser
     */
    select?: RoomUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RoomUser
     */
    omit?: RoomUserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoomUserInclude<ExtArgs> | null
    /**
     * The data needed to create a RoomUser.
     */
    data: XOR<RoomUserCreateInput, RoomUserUncheckedCreateInput>
  }

  /**
   * RoomUser createMany
   */
  export type RoomUserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many RoomUsers.
     */
    data: RoomUserCreateManyInput | RoomUserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * RoomUser createManyAndReturn
   */
  export type RoomUserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RoomUser
     */
    select?: RoomUserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the RoomUser
     */
    omit?: RoomUserOmit<ExtArgs> | null
    /**
     * The data used to create many RoomUsers.
     */
    data: RoomUserCreateManyInput | RoomUserCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoomUserIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * RoomUser update
   */
  export type RoomUserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RoomUser
     */
    select?: RoomUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RoomUser
     */
    omit?: RoomUserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoomUserInclude<ExtArgs> | null
    /**
     * The data needed to update a RoomUser.
     */
    data: XOR<RoomUserUpdateInput, RoomUserUncheckedUpdateInput>
    /**
     * Choose, which RoomUser to update.
     */
    where: RoomUserWhereUniqueInput
  }

  /**
   * RoomUser updateMany
   */
  export type RoomUserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update RoomUsers.
     */
    data: XOR<RoomUserUpdateManyMutationInput, RoomUserUncheckedUpdateManyInput>
    /**
     * Filter which RoomUsers to update
     */
    where?: RoomUserWhereInput
    /**
     * Limit how many RoomUsers to update.
     */
    limit?: number
  }

  /**
   * RoomUser updateManyAndReturn
   */
  export type RoomUserUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RoomUser
     */
    select?: RoomUserSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the RoomUser
     */
    omit?: RoomUserOmit<ExtArgs> | null
    /**
     * The data used to update RoomUsers.
     */
    data: XOR<RoomUserUpdateManyMutationInput, RoomUserUncheckedUpdateManyInput>
    /**
     * Filter which RoomUsers to update
     */
    where?: RoomUserWhereInput
    /**
     * Limit how many RoomUsers to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoomUserIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * RoomUser upsert
   */
  export type RoomUserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RoomUser
     */
    select?: RoomUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RoomUser
     */
    omit?: RoomUserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoomUserInclude<ExtArgs> | null
    /**
     * The filter to search for the RoomUser to update in case it exists.
     */
    where: RoomUserWhereUniqueInput
    /**
     * In case the RoomUser found by the `where` argument doesn't exist, create a new RoomUser with this data.
     */
    create: XOR<RoomUserCreateInput, RoomUserUncheckedCreateInput>
    /**
     * In case the RoomUser was found with the provided `where` argument, update it with this data.
     */
    update: XOR<RoomUserUpdateInput, RoomUserUncheckedUpdateInput>
  }

  /**
   * RoomUser delete
   */
  export type RoomUserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RoomUser
     */
    select?: RoomUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RoomUser
     */
    omit?: RoomUserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoomUserInclude<ExtArgs> | null
    /**
     * Filter which RoomUser to delete.
     */
    where: RoomUserWhereUniqueInput
  }

  /**
   * RoomUser deleteMany
   */
  export type RoomUserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RoomUsers to delete
     */
    where?: RoomUserWhereInput
    /**
     * Limit how many RoomUsers to delete.
     */
    limit?: number
  }

  /**
   * RoomUser without action
   */
  export type RoomUserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RoomUser
     */
    select?: RoomUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RoomUser
     */
    omit?: RoomUserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoomUserInclude<ExtArgs> | null
  }


  /**
   * Model UserIDP
   */

  export type AggregateUserIDP = {
    _count: UserIDPCountAggregateOutputType | null
    _min: UserIDPMinAggregateOutputType | null
    _max: UserIDPMaxAggregateOutputType | null
  }

  export type UserIDPMinAggregateOutputType = {
    id: string | null
    supabaseUid: string | null
    userId: string | null
  }

  export type UserIDPMaxAggregateOutputType = {
    id: string | null
    supabaseUid: string | null
    userId: string | null
  }

  export type UserIDPCountAggregateOutputType = {
    id: number
    supabaseUid: number
    userId: number
    _all: number
  }


  export type UserIDPMinAggregateInputType = {
    id?: true
    supabaseUid?: true
    userId?: true
  }

  export type UserIDPMaxAggregateInputType = {
    id?: true
    supabaseUid?: true
    userId?: true
  }

  export type UserIDPCountAggregateInputType = {
    id?: true
    supabaseUid?: true
    userId?: true
    _all?: true
  }

  export type UserIDPAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserIDP to aggregate.
     */
    where?: UserIDPWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserIDPS to fetch.
     */
    orderBy?: UserIDPOrderByWithRelationInput | UserIDPOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserIDPWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserIDPS from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserIDPS.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned UserIDPS
    **/
    _count?: true | UserIDPCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserIDPMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserIDPMaxAggregateInputType
  }

  export type GetUserIDPAggregateType<T extends UserIDPAggregateArgs> = {
        [P in keyof T & keyof AggregateUserIDP]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUserIDP[P]>
      : GetScalarType<T[P], AggregateUserIDP[P]>
  }




  export type UserIDPGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserIDPWhereInput
    orderBy?: UserIDPOrderByWithAggregationInput | UserIDPOrderByWithAggregationInput[]
    by: UserIDPScalarFieldEnum[] | UserIDPScalarFieldEnum
    having?: UserIDPScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserIDPCountAggregateInputType | true
    _min?: UserIDPMinAggregateInputType
    _max?: UserIDPMaxAggregateInputType
  }

  export type UserIDPGroupByOutputType = {
    id: string
    supabaseUid: string
    userId: string
    _count: UserIDPCountAggregateOutputType | null
    _min: UserIDPMinAggregateOutputType | null
    _max: UserIDPMaxAggregateOutputType | null
  }

  type GetUserIDPGroupByPayload<T extends UserIDPGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserIDPGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserIDPGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserIDPGroupByOutputType[P]>
            : GetScalarType<T[P], UserIDPGroupByOutputType[P]>
        }
      >
    >


  export type UserIDPSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    supabaseUid?: boolean
    userId?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userIDP"]>

  export type UserIDPSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    supabaseUid?: boolean
    userId?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userIDP"]>

  export type UserIDPSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    supabaseUid?: boolean
    userId?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userIDP"]>

  export type UserIDPSelectScalar = {
    id?: boolean
    supabaseUid?: boolean
    userId?: boolean
  }

  export type UserIDPOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "supabaseUid" | "userId", ExtArgs["result"]["userIDP"]>
  export type UserIDPInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type UserIDPIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type UserIDPIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $UserIDPPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "UserIDP"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      supabaseUid: string
      userId: string
    }, ExtArgs["result"]["userIDP"]>
    composites: {}
  }

  type UserIDPGetPayload<S extends boolean | null | undefined | UserIDPDefaultArgs> = $Result.GetResult<Prisma.$UserIDPPayload, S>

  type UserIDPCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserIDPFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserIDPCountAggregateInputType | true
    }

  export interface UserIDPDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['UserIDP'], meta: { name: 'UserIDP' } }
    /**
     * Find zero or one UserIDP that matches the filter.
     * @param {UserIDPFindUniqueArgs} args - Arguments to find a UserIDP
     * @example
     * // Get one UserIDP
     * const userIDP = await prisma.userIDP.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserIDPFindUniqueArgs>(args: SelectSubset<T, UserIDPFindUniqueArgs<ExtArgs>>): Prisma__UserIDPClient<$Result.GetResult<Prisma.$UserIDPPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one UserIDP that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserIDPFindUniqueOrThrowArgs} args - Arguments to find a UserIDP
     * @example
     * // Get one UserIDP
     * const userIDP = await prisma.userIDP.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserIDPFindUniqueOrThrowArgs>(args: SelectSubset<T, UserIDPFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserIDPClient<$Result.GetResult<Prisma.$UserIDPPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first UserIDP that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserIDPFindFirstArgs} args - Arguments to find a UserIDP
     * @example
     * // Get one UserIDP
     * const userIDP = await prisma.userIDP.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserIDPFindFirstArgs>(args?: SelectSubset<T, UserIDPFindFirstArgs<ExtArgs>>): Prisma__UserIDPClient<$Result.GetResult<Prisma.$UserIDPPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first UserIDP that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserIDPFindFirstOrThrowArgs} args - Arguments to find a UserIDP
     * @example
     * // Get one UserIDP
     * const userIDP = await prisma.userIDP.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserIDPFindFirstOrThrowArgs>(args?: SelectSubset<T, UserIDPFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserIDPClient<$Result.GetResult<Prisma.$UserIDPPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more UserIDPS that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserIDPFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all UserIDPS
     * const userIDPS = await prisma.userIDP.findMany()
     * 
     * // Get first 10 UserIDPS
     * const userIDPS = await prisma.userIDP.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userIDPWithIdOnly = await prisma.userIDP.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserIDPFindManyArgs>(args?: SelectSubset<T, UserIDPFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserIDPPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a UserIDP.
     * @param {UserIDPCreateArgs} args - Arguments to create a UserIDP.
     * @example
     * // Create one UserIDP
     * const UserIDP = await prisma.userIDP.create({
     *   data: {
     *     // ... data to create a UserIDP
     *   }
     * })
     * 
     */
    create<T extends UserIDPCreateArgs>(args: SelectSubset<T, UserIDPCreateArgs<ExtArgs>>): Prisma__UserIDPClient<$Result.GetResult<Prisma.$UserIDPPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many UserIDPS.
     * @param {UserIDPCreateManyArgs} args - Arguments to create many UserIDPS.
     * @example
     * // Create many UserIDPS
     * const userIDP = await prisma.userIDP.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserIDPCreateManyArgs>(args?: SelectSubset<T, UserIDPCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many UserIDPS and returns the data saved in the database.
     * @param {UserIDPCreateManyAndReturnArgs} args - Arguments to create many UserIDPS.
     * @example
     * // Create many UserIDPS
     * const userIDP = await prisma.userIDP.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many UserIDPS and only return the `id`
     * const userIDPWithIdOnly = await prisma.userIDP.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserIDPCreateManyAndReturnArgs>(args?: SelectSubset<T, UserIDPCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserIDPPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a UserIDP.
     * @param {UserIDPDeleteArgs} args - Arguments to delete one UserIDP.
     * @example
     * // Delete one UserIDP
     * const UserIDP = await prisma.userIDP.delete({
     *   where: {
     *     // ... filter to delete one UserIDP
     *   }
     * })
     * 
     */
    delete<T extends UserIDPDeleteArgs>(args: SelectSubset<T, UserIDPDeleteArgs<ExtArgs>>): Prisma__UserIDPClient<$Result.GetResult<Prisma.$UserIDPPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one UserIDP.
     * @param {UserIDPUpdateArgs} args - Arguments to update one UserIDP.
     * @example
     * // Update one UserIDP
     * const userIDP = await prisma.userIDP.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserIDPUpdateArgs>(args: SelectSubset<T, UserIDPUpdateArgs<ExtArgs>>): Prisma__UserIDPClient<$Result.GetResult<Prisma.$UserIDPPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more UserIDPS.
     * @param {UserIDPDeleteManyArgs} args - Arguments to filter UserIDPS to delete.
     * @example
     * // Delete a few UserIDPS
     * const { count } = await prisma.userIDP.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserIDPDeleteManyArgs>(args?: SelectSubset<T, UserIDPDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserIDPS.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserIDPUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many UserIDPS
     * const userIDP = await prisma.userIDP.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserIDPUpdateManyArgs>(args: SelectSubset<T, UserIDPUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserIDPS and returns the data updated in the database.
     * @param {UserIDPUpdateManyAndReturnArgs} args - Arguments to update many UserIDPS.
     * @example
     * // Update many UserIDPS
     * const userIDP = await prisma.userIDP.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more UserIDPS and only return the `id`
     * const userIDPWithIdOnly = await prisma.userIDP.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserIDPUpdateManyAndReturnArgs>(args: SelectSubset<T, UserIDPUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserIDPPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one UserIDP.
     * @param {UserIDPUpsertArgs} args - Arguments to update or create a UserIDP.
     * @example
     * // Update or create a UserIDP
     * const userIDP = await prisma.userIDP.upsert({
     *   create: {
     *     // ... data to create a UserIDP
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the UserIDP we want to update
     *   }
     * })
     */
    upsert<T extends UserIDPUpsertArgs>(args: SelectSubset<T, UserIDPUpsertArgs<ExtArgs>>): Prisma__UserIDPClient<$Result.GetResult<Prisma.$UserIDPPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of UserIDPS.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserIDPCountArgs} args - Arguments to filter UserIDPS to count.
     * @example
     * // Count the number of UserIDPS
     * const count = await prisma.userIDP.count({
     *   where: {
     *     // ... the filter for the UserIDPS we want to count
     *   }
     * })
    **/
    count<T extends UserIDPCountArgs>(
      args?: Subset<T, UserIDPCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserIDPCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a UserIDP.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserIDPAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserIDPAggregateArgs>(args: Subset<T, UserIDPAggregateArgs>): Prisma.PrismaPromise<GetUserIDPAggregateType<T>>

    /**
     * Group by UserIDP.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserIDPGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserIDPGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserIDPGroupByArgs['orderBy'] }
        : { orderBy?: UserIDPGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserIDPGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserIDPGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the UserIDP model
   */
  readonly fields: UserIDPFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for UserIDP.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserIDPClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the UserIDP model
   */
  interface UserIDPFieldRefs {
    readonly id: FieldRef<"UserIDP", 'String'>
    readonly supabaseUid: FieldRef<"UserIDP", 'String'>
    readonly userId: FieldRef<"UserIDP", 'String'>
  }
    

  // Custom InputTypes
  /**
   * UserIDP findUnique
   */
  export type UserIDPFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserIDP
     */
    select?: UserIDPSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserIDP
     */
    omit?: UserIDPOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserIDPInclude<ExtArgs> | null
    /**
     * Filter, which UserIDP to fetch.
     */
    where: UserIDPWhereUniqueInput
  }

  /**
   * UserIDP findUniqueOrThrow
   */
  export type UserIDPFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserIDP
     */
    select?: UserIDPSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserIDP
     */
    omit?: UserIDPOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserIDPInclude<ExtArgs> | null
    /**
     * Filter, which UserIDP to fetch.
     */
    where: UserIDPWhereUniqueInput
  }

  /**
   * UserIDP findFirst
   */
  export type UserIDPFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserIDP
     */
    select?: UserIDPSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserIDP
     */
    omit?: UserIDPOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserIDPInclude<ExtArgs> | null
    /**
     * Filter, which UserIDP to fetch.
     */
    where?: UserIDPWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserIDPS to fetch.
     */
    orderBy?: UserIDPOrderByWithRelationInput | UserIDPOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserIDPS.
     */
    cursor?: UserIDPWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserIDPS from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserIDPS.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserIDPS.
     */
    distinct?: UserIDPScalarFieldEnum | UserIDPScalarFieldEnum[]
  }

  /**
   * UserIDP findFirstOrThrow
   */
  export type UserIDPFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserIDP
     */
    select?: UserIDPSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserIDP
     */
    omit?: UserIDPOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserIDPInclude<ExtArgs> | null
    /**
     * Filter, which UserIDP to fetch.
     */
    where?: UserIDPWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserIDPS to fetch.
     */
    orderBy?: UserIDPOrderByWithRelationInput | UserIDPOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserIDPS.
     */
    cursor?: UserIDPWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserIDPS from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserIDPS.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserIDPS.
     */
    distinct?: UserIDPScalarFieldEnum | UserIDPScalarFieldEnum[]
  }

  /**
   * UserIDP findMany
   */
  export type UserIDPFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserIDP
     */
    select?: UserIDPSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserIDP
     */
    omit?: UserIDPOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserIDPInclude<ExtArgs> | null
    /**
     * Filter, which UserIDPS to fetch.
     */
    where?: UserIDPWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserIDPS to fetch.
     */
    orderBy?: UserIDPOrderByWithRelationInput | UserIDPOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing UserIDPS.
     */
    cursor?: UserIDPWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserIDPS from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserIDPS.
     */
    skip?: number
    distinct?: UserIDPScalarFieldEnum | UserIDPScalarFieldEnum[]
  }

  /**
   * UserIDP create
   */
  export type UserIDPCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserIDP
     */
    select?: UserIDPSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserIDP
     */
    omit?: UserIDPOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserIDPInclude<ExtArgs> | null
    /**
     * The data needed to create a UserIDP.
     */
    data: XOR<UserIDPCreateInput, UserIDPUncheckedCreateInput>
  }

  /**
   * UserIDP createMany
   */
  export type UserIDPCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many UserIDPS.
     */
    data: UserIDPCreateManyInput | UserIDPCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * UserIDP createManyAndReturn
   */
  export type UserIDPCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserIDP
     */
    select?: UserIDPSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the UserIDP
     */
    omit?: UserIDPOmit<ExtArgs> | null
    /**
     * The data used to create many UserIDPS.
     */
    data: UserIDPCreateManyInput | UserIDPCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserIDPIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * UserIDP update
   */
  export type UserIDPUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserIDP
     */
    select?: UserIDPSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserIDP
     */
    omit?: UserIDPOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserIDPInclude<ExtArgs> | null
    /**
     * The data needed to update a UserIDP.
     */
    data: XOR<UserIDPUpdateInput, UserIDPUncheckedUpdateInput>
    /**
     * Choose, which UserIDP to update.
     */
    where: UserIDPWhereUniqueInput
  }

  /**
   * UserIDP updateMany
   */
  export type UserIDPUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update UserIDPS.
     */
    data: XOR<UserIDPUpdateManyMutationInput, UserIDPUncheckedUpdateManyInput>
    /**
     * Filter which UserIDPS to update
     */
    where?: UserIDPWhereInput
    /**
     * Limit how many UserIDPS to update.
     */
    limit?: number
  }

  /**
   * UserIDP updateManyAndReturn
   */
  export type UserIDPUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserIDP
     */
    select?: UserIDPSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the UserIDP
     */
    omit?: UserIDPOmit<ExtArgs> | null
    /**
     * The data used to update UserIDPS.
     */
    data: XOR<UserIDPUpdateManyMutationInput, UserIDPUncheckedUpdateManyInput>
    /**
     * Filter which UserIDPS to update
     */
    where?: UserIDPWhereInput
    /**
     * Limit how many UserIDPS to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserIDPIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * UserIDP upsert
   */
  export type UserIDPUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserIDP
     */
    select?: UserIDPSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserIDP
     */
    omit?: UserIDPOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserIDPInclude<ExtArgs> | null
    /**
     * The filter to search for the UserIDP to update in case it exists.
     */
    where: UserIDPWhereUniqueInput
    /**
     * In case the UserIDP found by the `where` argument doesn't exist, create a new UserIDP with this data.
     */
    create: XOR<UserIDPCreateInput, UserIDPUncheckedCreateInput>
    /**
     * In case the UserIDP was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserIDPUpdateInput, UserIDPUncheckedUpdateInput>
  }

  /**
   * UserIDP delete
   */
  export type UserIDPDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserIDP
     */
    select?: UserIDPSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserIDP
     */
    omit?: UserIDPOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserIDPInclude<ExtArgs> | null
    /**
     * Filter which UserIDP to delete.
     */
    where: UserIDPWhereUniqueInput
  }

  /**
   * UserIDP deleteMany
   */
  export type UserIDPDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserIDPS to delete
     */
    where?: UserIDPWhereInput
    /**
     * Limit how many UserIDPS to delete.
     */
    limit?: number
  }

  /**
   * UserIDP without action
   */
  export type UserIDPDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserIDP
     */
    select?: UserIDPSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserIDP
     */
    omit?: UserIDPOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserIDPInclude<ExtArgs> | null
  }


  /**
   * Model error_events
   */

  export type AggregateError_events = {
    _count: Error_eventsCountAggregateOutputType | null
    _min: Error_eventsMinAggregateOutputType | null
    _max: Error_eventsMaxAggregateOutputType | null
  }

  export type Error_eventsMinAggregateOutputType = {
    id: string | null
    match_id: string | null
    appearance_at: Date | null
    closed_at: Date | null
    closed_by: string | null
  }

  export type Error_eventsMaxAggregateOutputType = {
    id: string | null
    match_id: string | null
    appearance_at: Date | null
    closed_at: Date | null
    closed_by: string | null
  }

  export type Error_eventsCountAggregateOutputType = {
    id: number
    match_id: number
    appearance_at: number
    closed_at: number
    closed_by: number
    _all: number
  }


  export type Error_eventsMinAggregateInputType = {
    id?: true
    match_id?: true
    appearance_at?: true
    closed_at?: true
    closed_by?: true
  }

  export type Error_eventsMaxAggregateInputType = {
    id?: true
    match_id?: true
    appearance_at?: true
    closed_at?: true
    closed_by?: true
  }

  export type Error_eventsCountAggregateInputType = {
    id?: true
    match_id?: true
    appearance_at?: true
    closed_at?: true
    closed_by?: true
    _all?: true
  }

  export type Error_eventsAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which error_events to aggregate.
     */
    where?: error_eventsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of error_events to fetch.
     */
    orderBy?: error_eventsOrderByWithRelationInput | error_eventsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: error_eventsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` error_events from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` error_events.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned error_events
    **/
    _count?: true | Error_eventsCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Error_eventsMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Error_eventsMaxAggregateInputType
  }

  export type GetError_eventsAggregateType<T extends Error_eventsAggregateArgs> = {
        [P in keyof T & keyof AggregateError_events]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateError_events[P]>
      : GetScalarType<T[P], AggregateError_events[P]>
  }




  export type error_eventsGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: error_eventsWhereInput
    orderBy?: error_eventsOrderByWithAggregationInput | error_eventsOrderByWithAggregationInput[]
    by: Error_eventsScalarFieldEnum[] | Error_eventsScalarFieldEnum
    having?: error_eventsScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Error_eventsCountAggregateInputType | true
    _min?: Error_eventsMinAggregateInputType
    _max?: Error_eventsMaxAggregateInputType
  }

  export type Error_eventsGroupByOutputType = {
    id: string
    match_id: string
    appearance_at: Date
    closed_at: Date | null
    closed_by: string | null
    _count: Error_eventsCountAggregateOutputType | null
    _min: Error_eventsMinAggregateOutputType | null
    _max: Error_eventsMaxAggregateOutputType | null
  }

  type GetError_eventsGroupByPayload<T extends error_eventsGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Error_eventsGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Error_eventsGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Error_eventsGroupByOutputType[P]>
            : GetScalarType<T[P], Error_eventsGroupByOutputType[P]>
        }
      >
    >


  export type error_eventsSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    match_id?: boolean
    appearance_at?: boolean
    closed_at?: boolean
    closed_by?: boolean
    users?: boolean | error_events$usersArgs<ExtArgs>
    matches?: boolean | matchesDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["error_events"]>

  export type error_eventsSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    match_id?: boolean
    appearance_at?: boolean
    closed_at?: boolean
    closed_by?: boolean
    users?: boolean | error_events$usersArgs<ExtArgs>
    matches?: boolean | matchesDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["error_events"]>

  export type error_eventsSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    match_id?: boolean
    appearance_at?: boolean
    closed_at?: boolean
    closed_by?: boolean
    users?: boolean | error_events$usersArgs<ExtArgs>
    matches?: boolean | matchesDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["error_events"]>

  export type error_eventsSelectScalar = {
    id?: boolean
    match_id?: boolean
    appearance_at?: boolean
    closed_at?: boolean
    closed_by?: boolean
  }

  export type error_eventsOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "match_id" | "appearance_at" | "closed_at" | "closed_by", ExtArgs["result"]["error_events"]>
  export type error_eventsInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    users?: boolean | error_events$usersArgs<ExtArgs>
    matches?: boolean | matchesDefaultArgs<ExtArgs>
  }
  export type error_eventsIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    users?: boolean | error_events$usersArgs<ExtArgs>
    matches?: boolean | matchesDefaultArgs<ExtArgs>
  }
  export type error_eventsIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    users?: boolean | error_events$usersArgs<ExtArgs>
    matches?: boolean | matchesDefaultArgs<ExtArgs>
  }

  export type $error_eventsPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "error_events"
    objects: {
      users: Prisma.$UserPayload<ExtArgs> | null
      matches: Prisma.$matchesPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      match_id: string
      appearance_at: Date
      closed_at: Date | null
      closed_by: string | null
    }, ExtArgs["result"]["error_events"]>
    composites: {}
  }

  type error_eventsGetPayload<S extends boolean | null | undefined | error_eventsDefaultArgs> = $Result.GetResult<Prisma.$error_eventsPayload, S>

  type error_eventsCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<error_eventsFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Error_eventsCountAggregateInputType | true
    }

  export interface error_eventsDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['error_events'], meta: { name: 'error_events' } }
    /**
     * Find zero or one Error_events that matches the filter.
     * @param {error_eventsFindUniqueArgs} args - Arguments to find a Error_events
     * @example
     * // Get one Error_events
     * const error_events = await prisma.error_events.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends error_eventsFindUniqueArgs>(args: SelectSubset<T, error_eventsFindUniqueArgs<ExtArgs>>): Prisma__error_eventsClient<$Result.GetResult<Prisma.$error_eventsPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Error_events that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {error_eventsFindUniqueOrThrowArgs} args - Arguments to find a Error_events
     * @example
     * // Get one Error_events
     * const error_events = await prisma.error_events.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends error_eventsFindUniqueOrThrowArgs>(args: SelectSubset<T, error_eventsFindUniqueOrThrowArgs<ExtArgs>>): Prisma__error_eventsClient<$Result.GetResult<Prisma.$error_eventsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Error_events that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {error_eventsFindFirstArgs} args - Arguments to find a Error_events
     * @example
     * // Get one Error_events
     * const error_events = await prisma.error_events.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends error_eventsFindFirstArgs>(args?: SelectSubset<T, error_eventsFindFirstArgs<ExtArgs>>): Prisma__error_eventsClient<$Result.GetResult<Prisma.$error_eventsPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Error_events that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {error_eventsFindFirstOrThrowArgs} args - Arguments to find a Error_events
     * @example
     * // Get one Error_events
     * const error_events = await prisma.error_events.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends error_eventsFindFirstOrThrowArgs>(args?: SelectSubset<T, error_eventsFindFirstOrThrowArgs<ExtArgs>>): Prisma__error_eventsClient<$Result.GetResult<Prisma.$error_eventsPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Error_events that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {error_eventsFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Error_events
     * const error_events = await prisma.error_events.findMany()
     * 
     * // Get first 10 Error_events
     * const error_events = await prisma.error_events.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const error_eventsWithIdOnly = await prisma.error_events.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends error_eventsFindManyArgs>(args?: SelectSubset<T, error_eventsFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$error_eventsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Error_events.
     * @param {error_eventsCreateArgs} args - Arguments to create a Error_events.
     * @example
     * // Create one Error_events
     * const Error_events = await prisma.error_events.create({
     *   data: {
     *     // ... data to create a Error_events
     *   }
     * })
     * 
     */
    create<T extends error_eventsCreateArgs>(args: SelectSubset<T, error_eventsCreateArgs<ExtArgs>>): Prisma__error_eventsClient<$Result.GetResult<Prisma.$error_eventsPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Error_events.
     * @param {error_eventsCreateManyArgs} args - Arguments to create many Error_events.
     * @example
     * // Create many Error_events
     * const error_events = await prisma.error_events.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends error_eventsCreateManyArgs>(args?: SelectSubset<T, error_eventsCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Error_events and returns the data saved in the database.
     * @param {error_eventsCreateManyAndReturnArgs} args - Arguments to create many Error_events.
     * @example
     * // Create many Error_events
     * const error_events = await prisma.error_events.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Error_events and only return the `id`
     * const error_eventsWithIdOnly = await prisma.error_events.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends error_eventsCreateManyAndReturnArgs>(args?: SelectSubset<T, error_eventsCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$error_eventsPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Error_events.
     * @param {error_eventsDeleteArgs} args - Arguments to delete one Error_events.
     * @example
     * // Delete one Error_events
     * const Error_events = await prisma.error_events.delete({
     *   where: {
     *     // ... filter to delete one Error_events
     *   }
     * })
     * 
     */
    delete<T extends error_eventsDeleteArgs>(args: SelectSubset<T, error_eventsDeleteArgs<ExtArgs>>): Prisma__error_eventsClient<$Result.GetResult<Prisma.$error_eventsPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Error_events.
     * @param {error_eventsUpdateArgs} args - Arguments to update one Error_events.
     * @example
     * // Update one Error_events
     * const error_events = await prisma.error_events.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends error_eventsUpdateArgs>(args: SelectSubset<T, error_eventsUpdateArgs<ExtArgs>>): Prisma__error_eventsClient<$Result.GetResult<Prisma.$error_eventsPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Error_events.
     * @param {error_eventsDeleteManyArgs} args - Arguments to filter Error_events to delete.
     * @example
     * // Delete a few Error_events
     * const { count } = await prisma.error_events.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends error_eventsDeleteManyArgs>(args?: SelectSubset<T, error_eventsDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Error_events.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {error_eventsUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Error_events
     * const error_events = await prisma.error_events.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends error_eventsUpdateManyArgs>(args: SelectSubset<T, error_eventsUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Error_events and returns the data updated in the database.
     * @param {error_eventsUpdateManyAndReturnArgs} args - Arguments to update many Error_events.
     * @example
     * // Update many Error_events
     * const error_events = await prisma.error_events.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Error_events and only return the `id`
     * const error_eventsWithIdOnly = await prisma.error_events.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends error_eventsUpdateManyAndReturnArgs>(args: SelectSubset<T, error_eventsUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$error_eventsPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Error_events.
     * @param {error_eventsUpsertArgs} args - Arguments to update or create a Error_events.
     * @example
     * // Update or create a Error_events
     * const error_events = await prisma.error_events.upsert({
     *   create: {
     *     // ... data to create a Error_events
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Error_events we want to update
     *   }
     * })
     */
    upsert<T extends error_eventsUpsertArgs>(args: SelectSubset<T, error_eventsUpsertArgs<ExtArgs>>): Prisma__error_eventsClient<$Result.GetResult<Prisma.$error_eventsPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Error_events.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {error_eventsCountArgs} args - Arguments to filter Error_events to count.
     * @example
     * // Count the number of Error_events
     * const count = await prisma.error_events.count({
     *   where: {
     *     // ... the filter for the Error_events we want to count
     *   }
     * })
    **/
    count<T extends error_eventsCountArgs>(
      args?: Subset<T, error_eventsCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Error_eventsCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Error_events.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Error_eventsAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends Error_eventsAggregateArgs>(args: Subset<T, Error_eventsAggregateArgs>): Prisma.PrismaPromise<GetError_eventsAggregateType<T>>

    /**
     * Group by Error_events.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {error_eventsGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends error_eventsGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: error_eventsGroupByArgs['orderBy'] }
        : { orderBy?: error_eventsGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, error_eventsGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetError_eventsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the error_events model
   */
  readonly fields: error_eventsFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for error_events.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__error_eventsClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    users<T extends error_events$usersArgs<ExtArgs> = {}>(args?: Subset<T, error_events$usersArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    matches<T extends matchesDefaultArgs<ExtArgs> = {}>(args?: Subset<T, matchesDefaultArgs<ExtArgs>>): Prisma__matchesClient<$Result.GetResult<Prisma.$matchesPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the error_events model
   */
  interface error_eventsFieldRefs {
    readonly id: FieldRef<"error_events", 'String'>
    readonly match_id: FieldRef<"error_events", 'String'>
    readonly appearance_at: FieldRef<"error_events", 'DateTime'>
    readonly closed_at: FieldRef<"error_events", 'DateTime'>
    readonly closed_by: FieldRef<"error_events", 'String'>
  }
    

  // Custom InputTypes
  /**
   * error_events findUnique
   */
  export type error_eventsFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the error_events
     */
    select?: error_eventsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the error_events
     */
    omit?: error_eventsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: error_eventsInclude<ExtArgs> | null
    /**
     * Filter, which error_events to fetch.
     */
    where: error_eventsWhereUniqueInput
  }

  /**
   * error_events findUniqueOrThrow
   */
  export type error_eventsFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the error_events
     */
    select?: error_eventsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the error_events
     */
    omit?: error_eventsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: error_eventsInclude<ExtArgs> | null
    /**
     * Filter, which error_events to fetch.
     */
    where: error_eventsWhereUniqueInput
  }

  /**
   * error_events findFirst
   */
  export type error_eventsFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the error_events
     */
    select?: error_eventsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the error_events
     */
    omit?: error_eventsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: error_eventsInclude<ExtArgs> | null
    /**
     * Filter, which error_events to fetch.
     */
    where?: error_eventsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of error_events to fetch.
     */
    orderBy?: error_eventsOrderByWithRelationInput | error_eventsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for error_events.
     */
    cursor?: error_eventsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` error_events from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` error_events.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of error_events.
     */
    distinct?: Error_eventsScalarFieldEnum | Error_eventsScalarFieldEnum[]
  }

  /**
   * error_events findFirstOrThrow
   */
  export type error_eventsFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the error_events
     */
    select?: error_eventsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the error_events
     */
    omit?: error_eventsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: error_eventsInclude<ExtArgs> | null
    /**
     * Filter, which error_events to fetch.
     */
    where?: error_eventsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of error_events to fetch.
     */
    orderBy?: error_eventsOrderByWithRelationInput | error_eventsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for error_events.
     */
    cursor?: error_eventsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` error_events from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` error_events.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of error_events.
     */
    distinct?: Error_eventsScalarFieldEnum | Error_eventsScalarFieldEnum[]
  }

  /**
   * error_events findMany
   */
  export type error_eventsFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the error_events
     */
    select?: error_eventsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the error_events
     */
    omit?: error_eventsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: error_eventsInclude<ExtArgs> | null
    /**
     * Filter, which error_events to fetch.
     */
    where?: error_eventsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of error_events to fetch.
     */
    orderBy?: error_eventsOrderByWithRelationInput | error_eventsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing error_events.
     */
    cursor?: error_eventsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` error_events from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` error_events.
     */
    skip?: number
    distinct?: Error_eventsScalarFieldEnum | Error_eventsScalarFieldEnum[]
  }

  /**
   * error_events create
   */
  export type error_eventsCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the error_events
     */
    select?: error_eventsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the error_events
     */
    omit?: error_eventsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: error_eventsInclude<ExtArgs> | null
    /**
     * The data needed to create a error_events.
     */
    data: XOR<error_eventsCreateInput, error_eventsUncheckedCreateInput>
  }

  /**
   * error_events createMany
   */
  export type error_eventsCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many error_events.
     */
    data: error_eventsCreateManyInput | error_eventsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * error_events createManyAndReturn
   */
  export type error_eventsCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the error_events
     */
    select?: error_eventsSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the error_events
     */
    omit?: error_eventsOmit<ExtArgs> | null
    /**
     * The data used to create many error_events.
     */
    data: error_eventsCreateManyInput | error_eventsCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: error_eventsIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * error_events update
   */
  export type error_eventsUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the error_events
     */
    select?: error_eventsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the error_events
     */
    omit?: error_eventsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: error_eventsInclude<ExtArgs> | null
    /**
     * The data needed to update a error_events.
     */
    data: XOR<error_eventsUpdateInput, error_eventsUncheckedUpdateInput>
    /**
     * Choose, which error_events to update.
     */
    where: error_eventsWhereUniqueInput
  }

  /**
   * error_events updateMany
   */
  export type error_eventsUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update error_events.
     */
    data: XOR<error_eventsUpdateManyMutationInput, error_eventsUncheckedUpdateManyInput>
    /**
     * Filter which error_events to update
     */
    where?: error_eventsWhereInput
    /**
     * Limit how many error_events to update.
     */
    limit?: number
  }

  /**
   * error_events updateManyAndReturn
   */
  export type error_eventsUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the error_events
     */
    select?: error_eventsSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the error_events
     */
    omit?: error_eventsOmit<ExtArgs> | null
    /**
     * The data used to update error_events.
     */
    data: XOR<error_eventsUpdateManyMutationInput, error_eventsUncheckedUpdateManyInput>
    /**
     * Filter which error_events to update
     */
    where?: error_eventsWhereInput
    /**
     * Limit how many error_events to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: error_eventsIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * error_events upsert
   */
  export type error_eventsUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the error_events
     */
    select?: error_eventsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the error_events
     */
    omit?: error_eventsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: error_eventsInclude<ExtArgs> | null
    /**
     * The filter to search for the error_events to update in case it exists.
     */
    where: error_eventsWhereUniqueInput
    /**
     * In case the error_events found by the `where` argument doesn't exist, create a new error_events with this data.
     */
    create: XOR<error_eventsCreateInput, error_eventsUncheckedCreateInput>
    /**
     * In case the error_events was found with the provided `where` argument, update it with this data.
     */
    update: XOR<error_eventsUpdateInput, error_eventsUncheckedUpdateInput>
  }

  /**
   * error_events delete
   */
  export type error_eventsDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the error_events
     */
    select?: error_eventsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the error_events
     */
    omit?: error_eventsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: error_eventsInclude<ExtArgs> | null
    /**
     * Filter which error_events to delete.
     */
    where: error_eventsWhereUniqueInput
  }

  /**
   * error_events deleteMany
   */
  export type error_eventsDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which error_events to delete
     */
    where?: error_eventsWhereInput
    /**
     * Limit how many error_events to delete.
     */
    limit?: number
  }

  /**
   * error_events.users
   */
  export type error_events$usersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    where?: UserWhereInput
  }

  /**
   * error_events without action
   */
  export type error_eventsDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the error_events
     */
    select?: error_eventsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the error_events
     */
    omit?: error_eventsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: error_eventsInclude<ExtArgs> | null
  }


  /**
   * Model matches
   */

  export type AggregateMatches = {
    _count: MatchesCountAggregateOutputType | null
    _min: MatchesMinAggregateOutputType | null
    _max: MatchesMaxAggregateOutputType | null
  }

  export type MatchesMinAggregateOutputType = {
    id: string | null
    room_id: string | null
    game_type: string | null
    status: string | null
    winner_id: string | null
    created_at: Date | null
  }

  export type MatchesMaxAggregateOutputType = {
    id: string | null
    room_id: string | null
    game_type: string | null
    status: string | null
    winner_id: string | null
    created_at: Date | null
  }

  export type MatchesCountAggregateOutputType = {
    id: number
    room_id: number
    game_type: number
    status: number
    winner_id: number
    created_at: number
    _all: number
  }


  export type MatchesMinAggregateInputType = {
    id?: true
    room_id?: true
    game_type?: true
    status?: true
    winner_id?: true
    created_at?: true
  }

  export type MatchesMaxAggregateInputType = {
    id?: true
    room_id?: true
    game_type?: true
    status?: true
    winner_id?: true
    created_at?: true
  }

  export type MatchesCountAggregateInputType = {
    id?: true
    room_id?: true
    game_type?: true
    status?: true
    winner_id?: true
    created_at?: true
    _all?: true
  }

  export type MatchesAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which matches to aggregate.
     */
    where?: matchesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of matches to fetch.
     */
    orderBy?: matchesOrderByWithRelationInput | matchesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: matchesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` matches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` matches.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned matches
    **/
    _count?: true | MatchesCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: MatchesMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: MatchesMaxAggregateInputType
  }

  export type GetMatchesAggregateType<T extends MatchesAggregateArgs> = {
        [P in keyof T & keyof AggregateMatches]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMatches[P]>
      : GetScalarType<T[P], AggregateMatches[P]>
  }




  export type matchesGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: matchesWhereInput
    orderBy?: matchesOrderByWithAggregationInput | matchesOrderByWithAggregationInput[]
    by: MatchesScalarFieldEnum[] | MatchesScalarFieldEnum
    having?: matchesScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: MatchesCountAggregateInputType | true
    _min?: MatchesMinAggregateInputType
    _max?: MatchesMaxAggregateInputType
  }

  export type MatchesGroupByOutputType = {
    id: string
    room_id: string
    game_type: string
    status: string
    winner_id: string | null
    created_at: Date
    _count: MatchesCountAggregateOutputType | null
    _min: MatchesMinAggregateOutputType | null
    _max: MatchesMaxAggregateOutputType | null
  }

  type GetMatchesGroupByPayload<T extends matchesGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<MatchesGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof MatchesGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], MatchesGroupByOutputType[P]>
            : GetScalarType<T[P], MatchesGroupByOutputType[P]>
        }
      >
    >


  export type matchesSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    room_id?: boolean
    game_type?: boolean
    status?: boolean
    winner_id?: boolean
    created_at?: boolean
    error_events?: boolean | matches$error_eventsArgs<ExtArgs>
    rooms?: boolean | RoomDefaultArgs<ExtArgs>
    users?: boolean | matches$usersArgs<ExtArgs>
    _count?: boolean | MatchesCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["matches"]>

  export type matchesSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    room_id?: boolean
    game_type?: boolean
    status?: boolean
    winner_id?: boolean
    created_at?: boolean
    rooms?: boolean | RoomDefaultArgs<ExtArgs>
    users?: boolean | matches$usersArgs<ExtArgs>
  }, ExtArgs["result"]["matches"]>

  export type matchesSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    room_id?: boolean
    game_type?: boolean
    status?: boolean
    winner_id?: boolean
    created_at?: boolean
    rooms?: boolean | RoomDefaultArgs<ExtArgs>
    users?: boolean | matches$usersArgs<ExtArgs>
  }, ExtArgs["result"]["matches"]>

  export type matchesSelectScalar = {
    id?: boolean
    room_id?: boolean
    game_type?: boolean
    status?: boolean
    winner_id?: boolean
    created_at?: boolean
  }

  export type matchesOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "room_id" | "game_type" | "status" | "winner_id" | "created_at", ExtArgs["result"]["matches"]>
  export type matchesInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    error_events?: boolean | matches$error_eventsArgs<ExtArgs>
    rooms?: boolean | RoomDefaultArgs<ExtArgs>
    users?: boolean | matches$usersArgs<ExtArgs>
    _count?: boolean | MatchesCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type matchesIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    rooms?: boolean | RoomDefaultArgs<ExtArgs>
    users?: boolean | matches$usersArgs<ExtArgs>
  }
  export type matchesIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    rooms?: boolean | RoomDefaultArgs<ExtArgs>
    users?: boolean | matches$usersArgs<ExtArgs>
  }

  export type $matchesPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "matches"
    objects: {
      error_events: Prisma.$error_eventsPayload<ExtArgs>[]
      rooms: Prisma.$RoomPayload<ExtArgs>
      users: Prisma.$UserPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      room_id: string
      game_type: string
      status: string
      winner_id: string | null
      created_at: Date
    }, ExtArgs["result"]["matches"]>
    composites: {}
  }

  type matchesGetPayload<S extends boolean | null | undefined | matchesDefaultArgs> = $Result.GetResult<Prisma.$matchesPayload, S>

  type matchesCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<matchesFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: MatchesCountAggregateInputType | true
    }

  export interface matchesDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['matches'], meta: { name: 'matches' } }
    /**
     * Find zero or one Matches that matches the filter.
     * @param {matchesFindUniqueArgs} args - Arguments to find a Matches
     * @example
     * // Get one Matches
     * const matches = await prisma.matches.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends matchesFindUniqueArgs>(args: SelectSubset<T, matchesFindUniqueArgs<ExtArgs>>): Prisma__matchesClient<$Result.GetResult<Prisma.$matchesPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Matches that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {matchesFindUniqueOrThrowArgs} args - Arguments to find a Matches
     * @example
     * // Get one Matches
     * const matches = await prisma.matches.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends matchesFindUniqueOrThrowArgs>(args: SelectSubset<T, matchesFindUniqueOrThrowArgs<ExtArgs>>): Prisma__matchesClient<$Result.GetResult<Prisma.$matchesPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Matches that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {matchesFindFirstArgs} args - Arguments to find a Matches
     * @example
     * // Get one Matches
     * const matches = await prisma.matches.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends matchesFindFirstArgs>(args?: SelectSubset<T, matchesFindFirstArgs<ExtArgs>>): Prisma__matchesClient<$Result.GetResult<Prisma.$matchesPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Matches that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {matchesFindFirstOrThrowArgs} args - Arguments to find a Matches
     * @example
     * // Get one Matches
     * const matches = await prisma.matches.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends matchesFindFirstOrThrowArgs>(args?: SelectSubset<T, matchesFindFirstOrThrowArgs<ExtArgs>>): Prisma__matchesClient<$Result.GetResult<Prisma.$matchesPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Matches that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {matchesFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Matches
     * const matches = await prisma.matches.findMany()
     * 
     * // Get first 10 Matches
     * const matches = await prisma.matches.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const matchesWithIdOnly = await prisma.matches.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends matchesFindManyArgs>(args?: SelectSubset<T, matchesFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$matchesPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Matches.
     * @param {matchesCreateArgs} args - Arguments to create a Matches.
     * @example
     * // Create one Matches
     * const Matches = await prisma.matches.create({
     *   data: {
     *     // ... data to create a Matches
     *   }
     * })
     * 
     */
    create<T extends matchesCreateArgs>(args: SelectSubset<T, matchesCreateArgs<ExtArgs>>): Prisma__matchesClient<$Result.GetResult<Prisma.$matchesPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Matches.
     * @param {matchesCreateManyArgs} args - Arguments to create many Matches.
     * @example
     * // Create many Matches
     * const matches = await prisma.matches.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends matchesCreateManyArgs>(args?: SelectSubset<T, matchesCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Matches and returns the data saved in the database.
     * @param {matchesCreateManyAndReturnArgs} args - Arguments to create many Matches.
     * @example
     * // Create many Matches
     * const matches = await prisma.matches.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Matches and only return the `id`
     * const matchesWithIdOnly = await prisma.matches.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends matchesCreateManyAndReturnArgs>(args?: SelectSubset<T, matchesCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$matchesPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Matches.
     * @param {matchesDeleteArgs} args - Arguments to delete one Matches.
     * @example
     * // Delete one Matches
     * const Matches = await prisma.matches.delete({
     *   where: {
     *     // ... filter to delete one Matches
     *   }
     * })
     * 
     */
    delete<T extends matchesDeleteArgs>(args: SelectSubset<T, matchesDeleteArgs<ExtArgs>>): Prisma__matchesClient<$Result.GetResult<Prisma.$matchesPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Matches.
     * @param {matchesUpdateArgs} args - Arguments to update one Matches.
     * @example
     * // Update one Matches
     * const matches = await prisma.matches.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends matchesUpdateArgs>(args: SelectSubset<T, matchesUpdateArgs<ExtArgs>>): Prisma__matchesClient<$Result.GetResult<Prisma.$matchesPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Matches.
     * @param {matchesDeleteManyArgs} args - Arguments to filter Matches to delete.
     * @example
     * // Delete a few Matches
     * const { count } = await prisma.matches.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends matchesDeleteManyArgs>(args?: SelectSubset<T, matchesDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Matches.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {matchesUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Matches
     * const matches = await prisma.matches.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends matchesUpdateManyArgs>(args: SelectSubset<T, matchesUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Matches and returns the data updated in the database.
     * @param {matchesUpdateManyAndReturnArgs} args - Arguments to update many Matches.
     * @example
     * // Update many Matches
     * const matches = await prisma.matches.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Matches and only return the `id`
     * const matchesWithIdOnly = await prisma.matches.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends matchesUpdateManyAndReturnArgs>(args: SelectSubset<T, matchesUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$matchesPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Matches.
     * @param {matchesUpsertArgs} args - Arguments to update or create a Matches.
     * @example
     * // Update or create a Matches
     * const matches = await prisma.matches.upsert({
     *   create: {
     *     // ... data to create a Matches
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Matches we want to update
     *   }
     * })
     */
    upsert<T extends matchesUpsertArgs>(args: SelectSubset<T, matchesUpsertArgs<ExtArgs>>): Prisma__matchesClient<$Result.GetResult<Prisma.$matchesPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Matches.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {matchesCountArgs} args - Arguments to filter Matches to count.
     * @example
     * // Count the number of Matches
     * const count = await prisma.matches.count({
     *   where: {
     *     // ... the filter for the Matches we want to count
     *   }
     * })
    **/
    count<T extends matchesCountArgs>(
      args?: Subset<T, matchesCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], MatchesCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Matches.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MatchesAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends MatchesAggregateArgs>(args: Subset<T, MatchesAggregateArgs>): Prisma.PrismaPromise<GetMatchesAggregateType<T>>

    /**
     * Group by Matches.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {matchesGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends matchesGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: matchesGroupByArgs['orderBy'] }
        : { orderBy?: matchesGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, matchesGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMatchesGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the matches model
   */
  readonly fields: matchesFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for matches.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__matchesClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    error_events<T extends matches$error_eventsArgs<ExtArgs> = {}>(args?: Subset<T, matches$error_eventsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$error_eventsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    rooms<T extends RoomDefaultArgs<ExtArgs> = {}>(args?: Subset<T, RoomDefaultArgs<ExtArgs>>): Prisma__RoomClient<$Result.GetResult<Prisma.$RoomPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    users<T extends matches$usersArgs<ExtArgs> = {}>(args?: Subset<T, matches$usersArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the matches model
   */
  interface matchesFieldRefs {
    readonly id: FieldRef<"matches", 'String'>
    readonly room_id: FieldRef<"matches", 'String'>
    readonly game_type: FieldRef<"matches", 'String'>
    readonly status: FieldRef<"matches", 'String'>
    readonly winner_id: FieldRef<"matches", 'String'>
    readonly created_at: FieldRef<"matches", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * matches findUnique
   */
  export type matchesFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the matches
     */
    select?: matchesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the matches
     */
    omit?: matchesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: matchesInclude<ExtArgs> | null
    /**
     * Filter, which matches to fetch.
     */
    where: matchesWhereUniqueInput
  }

  /**
   * matches findUniqueOrThrow
   */
  export type matchesFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the matches
     */
    select?: matchesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the matches
     */
    omit?: matchesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: matchesInclude<ExtArgs> | null
    /**
     * Filter, which matches to fetch.
     */
    where: matchesWhereUniqueInput
  }

  /**
   * matches findFirst
   */
  export type matchesFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the matches
     */
    select?: matchesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the matches
     */
    omit?: matchesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: matchesInclude<ExtArgs> | null
    /**
     * Filter, which matches to fetch.
     */
    where?: matchesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of matches to fetch.
     */
    orderBy?: matchesOrderByWithRelationInput | matchesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for matches.
     */
    cursor?: matchesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` matches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` matches.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of matches.
     */
    distinct?: MatchesScalarFieldEnum | MatchesScalarFieldEnum[]
  }

  /**
   * matches findFirstOrThrow
   */
  export type matchesFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the matches
     */
    select?: matchesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the matches
     */
    omit?: matchesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: matchesInclude<ExtArgs> | null
    /**
     * Filter, which matches to fetch.
     */
    where?: matchesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of matches to fetch.
     */
    orderBy?: matchesOrderByWithRelationInput | matchesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for matches.
     */
    cursor?: matchesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` matches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` matches.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of matches.
     */
    distinct?: MatchesScalarFieldEnum | MatchesScalarFieldEnum[]
  }

  /**
   * matches findMany
   */
  export type matchesFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the matches
     */
    select?: matchesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the matches
     */
    omit?: matchesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: matchesInclude<ExtArgs> | null
    /**
     * Filter, which matches to fetch.
     */
    where?: matchesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of matches to fetch.
     */
    orderBy?: matchesOrderByWithRelationInput | matchesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing matches.
     */
    cursor?: matchesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` matches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` matches.
     */
    skip?: number
    distinct?: MatchesScalarFieldEnum | MatchesScalarFieldEnum[]
  }

  /**
   * matches create
   */
  export type matchesCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the matches
     */
    select?: matchesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the matches
     */
    omit?: matchesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: matchesInclude<ExtArgs> | null
    /**
     * The data needed to create a matches.
     */
    data: XOR<matchesCreateInput, matchesUncheckedCreateInput>
  }

  /**
   * matches createMany
   */
  export type matchesCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many matches.
     */
    data: matchesCreateManyInput | matchesCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * matches createManyAndReturn
   */
  export type matchesCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the matches
     */
    select?: matchesSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the matches
     */
    omit?: matchesOmit<ExtArgs> | null
    /**
     * The data used to create many matches.
     */
    data: matchesCreateManyInput | matchesCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: matchesIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * matches update
   */
  export type matchesUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the matches
     */
    select?: matchesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the matches
     */
    omit?: matchesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: matchesInclude<ExtArgs> | null
    /**
     * The data needed to update a matches.
     */
    data: XOR<matchesUpdateInput, matchesUncheckedUpdateInput>
    /**
     * Choose, which matches to update.
     */
    where: matchesWhereUniqueInput
  }

  /**
   * matches updateMany
   */
  export type matchesUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update matches.
     */
    data: XOR<matchesUpdateManyMutationInput, matchesUncheckedUpdateManyInput>
    /**
     * Filter which matches to update
     */
    where?: matchesWhereInput
    /**
     * Limit how many matches to update.
     */
    limit?: number
  }

  /**
   * matches updateManyAndReturn
   */
  export type matchesUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the matches
     */
    select?: matchesSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the matches
     */
    omit?: matchesOmit<ExtArgs> | null
    /**
     * The data used to update matches.
     */
    data: XOR<matchesUpdateManyMutationInput, matchesUncheckedUpdateManyInput>
    /**
     * Filter which matches to update
     */
    where?: matchesWhereInput
    /**
     * Limit how many matches to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: matchesIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * matches upsert
   */
  export type matchesUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the matches
     */
    select?: matchesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the matches
     */
    omit?: matchesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: matchesInclude<ExtArgs> | null
    /**
     * The filter to search for the matches to update in case it exists.
     */
    where: matchesWhereUniqueInput
    /**
     * In case the matches found by the `where` argument doesn't exist, create a new matches with this data.
     */
    create: XOR<matchesCreateInput, matchesUncheckedCreateInput>
    /**
     * In case the matches was found with the provided `where` argument, update it with this data.
     */
    update: XOR<matchesUpdateInput, matchesUncheckedUpdateInput>
  }

  /**
   * matches delete
   */
  export type matchesDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the matches
     */
    select?: matchesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the matches
     */
    omit?: matchesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: matchesInclude<ExtArgs> | null
    /**
     * Filter which matches to delete.
     */
    where: matchesWhereUniqueInput
  }

  /**
   * matches deleteMany
   */
  export type matchesDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which matches to delete
     */
    where?: matchesWhereInput
    /**
     * Limit how many matches to delete.
     */
    limit?: number
  }

  /**
   * matches.error_events
   */
  export type matches$error_eventsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the error_events
     */
    select?: error_eventsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the error_events
     */
    omit?: error_eventsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: error_eventsInclude<ExtArgs> | null
    where?: error_eventsWhereInput
    orderBy?: error_eventsOrderByWithRelationInput | error_eventsOrderByWithRelationInput[]
    cursor?: error_eventsWhereUniqueInput
    take?: number
    skip?: number
    distinct?: Error_eventsScalarFieldEnum | Error_eventsScalarFieldEnum[]
  }

  /**
   * matches.users
   */
  export type matches$usersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    where?: UserWhereInput
  }

  /**
   * matches without action
   */
  export type matchesDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the matches
     */
    select?: matchesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the matches
     */
    omit?: matchesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: matchesInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const UserScalarFieldEnum: {
    id: 'id',
    name: 'name',
    email: 'email',
    createdAt: 'createdAt'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const RoomScalarFieldEnum: {
    id: 'id',
    name: 'name',
    createdAt: 'createdAt',
    createdBy: 'createdBy',
    current_match_id: 'current_match_id',
    activeGameType: 'activeGameType',
    status: 'status'
  };

  export type RoomScalarFieldEnum = (typeof RoomScalarFieldEnum)[keyof typeof RoomScalarFieldEnum]


  export const RoomUserScalarFieldEnum: {
    id: 'id',
    roomId: 'roomId',
    userId: 'userId',
    createdAt: 'createdAt'
  };

  export type RoomUserScalarFieldEnum = (typeof RoomUserScalarFieldEnum)[keyof typeof RoomUserScalarFieldEnum]


  export const UserIDPScalarFieldEnum: {
    id: 'id',
    supabaseUid: 'supabaseUid',
    userId: 'userId'
  };

  export type UserIDPScalarFieldEnum = (typeof UserIDPScalarFieldEnum)[keyof typeof UserIDPScalarFieldEnum]


  export const Error_eventsScalarFieldEnum: {
    id: 'id',
    match_id: 'match_id',
    appearance_at: 'appearance_at',
    closed_at: 'closed_at',
    closed_by: 'closed_by'
  };

  export type Error_eventsScalarFieldEnum = (typeof Error_eventsScalarFieldEnum)[keyof typeof Error_eventsScalarFieldEnum]


  export const MatchesScalarFieldEnum: {
    id: 'id',
    room_id: 'room_id',
    game_type: 'game_type',
    status: 'status',
    winner_id: 'winner_id',
    created_at: 'created_at'
  };

  export type MatchesScalarFieldEnum = (typeof MatchesScalarFieldEnum)[keyof typeof MatchesScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'RoomStatus'
   */
  export type EnumRoomStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'RoomStatus'>
    


  /**
   * Reference to a field of type 'RoomStatus[]'
   */
  export type ListEnumRoomStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'RoomStatus[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    
  /**
   * Deep Input Types
   */


  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: UuidFilter<"User"> | string
    name?: StringFilter<"User"> | string
    email?: StringFilter<"User"> | string
    createdAt?: DateTimeFilter<"User"> | Date | string
    error_events?: Error_eventsListRelationFilter
    matches?: MatchesListRelationFilter
    joinedRooms?: RoomUserListRelationFilter
    createdRooms?: RoomListRelationFilter
    userIDPs?: UserIDPListRelationFilter
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    createdAt?: SortOrder
    error_events?: error_eventsOrderByRelationAggregateInput
    matches?: matchesOrderByRelationAggregateInput
    joinedRooms?: RoomUserOrderByRelationAggregateInput
    createdRooms?: RoomOrderByRelationAggregateInput
    userIDPs?: UserIDPOrderByRelationAggregateInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    name?: StringFilter<"User"> | string
    createdAt?: DateTimeFilter<"User"> | Date | string
    error_events?: Error_eventsListRelationFilter
    matches?: MatchesListRelationFilter
    joinedRooms?: RoomUserListRelationFilter
    createdRooms?: RoomListRelationFilter
    userIDPs?: UserIDPListRelationFilter
  }, "id" | "email">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    createdAt?: SortOrder
    _count?: UserCountOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"User"> | string
    name?: StringWithAggregatesFilter<"User"> | string
    email?: StringWithAggregatesFilter<"User"> | string
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
  }

  export type RoomWhereInput = {
    AND?: RoomWhereInput | RoomWhereInput[]
    OR?: RoomWhereInput[]
    NOT?: RoomWhereInput | RoomWhereInput[]
    id?: UuidFilter<"Room"> | string
    name?: StringFilter<"Room"> | string
    createdAt?: DateTimeFilter<"Room"> | Date | string
    createdBy?: UuidFilter<"Room"> | string
    current_match_id?: UuidNullableFilter<"Room"> | string | null
    activeGameType?: StringNullableFilter<"Room"> | string | null
    status?: EnumRoomStatusFilter<"Room"> | $Enums.RoomStatus
    matches?: MatchesListRelationFilter
    users?: RoomUserListRelationFilter
    creator?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type RoomOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    createdBy?: SortOrder
    current_match_id?: SortOrderInput | SortOrder
    activeGameType?: SortOrderInput | SortOrder
    status?: SortOrder
    matches?: matchesOrderByRelationAggregateInput
    users?: RoomUserOrderByRelationAggregateInput
    creator?: UserOrderByWithRelationInput
  }

  export type RoomWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: RoomWhereInput | RoomWhereInput[]
    OR?: RoomWhereInput[]
    NOT?: RoomWhereInput | RoomWhereInput[]
    name?: StringFilter<"Room"> | string
    createdAt?: DateTimeFilter<"Room"> | Date | string
    createdBy?: UuidFilter<"Room"> | string
    current_match_id?: UuidNullableFilter<"Room"> | string | null
    activeGameType?: StringNullableFilter<"Room"> | string | null
    status?: EnumRoomStatusFilter<"Room"> | $Enums.RoomStatus
    matches?: MatchesListRelationFilter
    users?: RoomUserListRelationFilter
    creator?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id">

  export type RoomOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    createdBy?: SortOrder
    current_match_id?: SortOrderInput | SortOrder
    activeGameType?: SortOrderInput | SortOrder
    status?: SortOrder
    _count?: RoomCountOrderByAggregateInput
    _max?: RoomMaxOrderByAggregateInput
    _min?: RoomMinOrderByAggregateInput
  }

  export type RoomScalarWhereWithAggregatesInput = {
    AND?: RoomScalarWhereWithAggregatesInput | RoomScalarWhereWithAggregatesInput[]
    OR?: RoomScalarWhereWithAggregatesInput[]
    NOT?: RoomScalarWhereWithAggregatesInput | RoomScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"Room"> | string
    name?: StringWithAggregatesFilter<"Room"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Room"> | Date | string
    createdBy?: UuidWithAggregatesFilter<"Room"> | string
    current_match_id?: UuidNullableWithAggregatesFilter<"Room"> | string | null
    activeGameType?: StringNullableWithAggregatesFilter<"Room"> | string | null
    status?: EnumRoomStatusWithAggregatesFilter<"Room"> | $Enums.RoomStatus
  }

  export type RoomUserWhereInput = {
    AND?: RoomUserWhereInput | RoomUserWhereInput[]
    OR?: RoomUserWhereInput[]
    NOT?: RoomUserWhereInput | RoomUserWhereInput[]
    id?: UuidFilter<"RoomUser"> | string
    roomId?: UuidFilter<"RoomUser"> | string
    userId?: UuidFilter<"RoomUser"> | string
    createdAt?: DateTimeFilter<"RoomUser"> | Date | string
    room?: XOR<RoomScalarRelationFilter, RoomWhereInput>
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type RoomUserOrderByWithRelationInput = {
    id?: SortOrder
    roomId?: SortOrder
    userId?: SortOrder
    createdAt?: SortOrder
    room?: RoomOrderByWithRelationInput
    user?: UserOrderByWithRelationInput
  }

  export type RoomUserWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    roomId_userId?: RoomUserRoomIdUserIdCompoundUniqueInput
    AND?: RoomUserWhereInput | RoomUserWhereInput[]
    OR?: RoomUserWhereInput[]
    NOT?: RoomUserWhereInput | RoomUserWhereInput[]
    roomId?: UuidFilter<"RoomUser"> | string
    userId?: UuidFilter<"RoomUser"> | string
    createdAt?: DateTimeFilter<"RoomUser"> | Date | string
    room?: XOR<RoomScalarRelationFilter, RoomWhereInput>
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id" | "roomId_userId">

  export type RoomUserOrderByWithAggregationInput = {
    id?: SortOrder
    roomId?: SortOrder
    userId?: SortOrder
    createdAt?: SortOrder
    _count?: RoomUserCountOrderByAggregateInput
    _max?: RoomUserMaxOrderByAggregateInput
    _min?: RoomUserMinOrderByAggregateInput
  }

  export type RoomUserScalarWhereWithAggregatesInput = {
    AND?: RoomUserScalarWhereWithAggregatesInput | RoomUserScalarWhereWithAggregatesInput[]
    OR?: RoomUserScalarWhereWithAggregatesInput[]
    NOT?: RoomUserScalarWhereWithAggregatesInput | RoomUserScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"RoomUser"> | string
    roomId?: UuidWithAggregatesFilter<"RoomUser"> | string
    userId?: UuidWithAggregatesFilter<"RoomUser"> | string
    createdAt?: DateTimeWithAggregatesFilter<"RoomUser"> | Date | string
  }

  export type UserIDPWhereInput = {
    AND?: UserIDPWhereInput | UserIDPWhereInput[]
    OR?: UserIDPWhereInput[]
    NOT?: UserIDPWhereInput | UserIDPWhereInput[]
    id?: UuidFilter<"UserIDP"> | string
    supabaseUid?: UuidFilter<"UserIDP"> | string
    userId?: UuidFilter<"UserIDP"> | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type UserIDPOrderByWithRelationInput = {
    id?: SortOrder
    supabaseUid?: SortOrder
    userId?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type UserIDPWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    supabaseUid?: string
    AND?: UserIDPWhereInput | UserIDPWhereInput[]
    OR?: UserIDPWhereInput[]
    NOT?: UserIDPWhereInput | UserIDPWhereInput[]
    userId?: UuidFilter<"UserIDP"> | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id" | "supabaseUid">

  export type UserIDPOrderByWithAggregationInput = {
    id?: SortOrder
    supabaseUid?: SortOrder
    userId?: SortOrder
    _count?: UserIDPCountOrderByAggregateInput
    _max?: UserIDPMaxOrderByAggregateInput
    _min?: UserIDPMinOrderByAggregateInput
  }

  export type UserIDPScalarWhereWithAggregatesInput = {
    AND?: UserIDPScalarWhereWithAggregatesInput | UserIDPScalarWhereWithAggregatesInput[]
    OR?: UserIDPScalarWhereWithAggregatesInput[]
    NOT?: UserIDPScalarWhereWithAggregatesInput | UserIDPScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"UserIDP"> | string
    supabaseUid?: UuidWithAggregatesFilter<"UserIDP"> | string
    userId?: UuidWithAggregatesFilter<"UserIDP"> | string
  }

  export type error_eventsWhereInput = {
    AND?: error_eventsWhereInput | error_eventsWhereInput[]
    OR?: error_eventsWhereInput[]
    NOT?: error_eventsWhereInput | error_eventsWhereInput[]
    id?: UuidFilter<"error_events"> | string
    match_id?: UuidFilter<"error_events"> | string
    appearance_at?: DateTimeFilter<"error_events"> | Date | string
    closed_at?: DateTimeNullableFilter<"error_events"> | Date | string | null
    closed_by?: UuidNullableFilter<"error_events"> | string | null
    users?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null
    matches?: XOR<MatchesScalarRelationFilter, matchesWhereInput>
  }

  export type error_eventsOrderByWithRelationInput = {
    id?: SortOrder
    match_id?: SortOrder
    appearance_at?: SortOrder
    closed_at?: SortOrderInput | SortOrder
    closed_by?: SortOrderInput | SortOrder
    users?: UserOrderByWithRelationInput
    matches?: matchesOrderByWithRelationInput
  }

  export type error_eventsWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: error_eventsWhereInput | error_eventsWhereInput[]
    OR?: error_eventsWhereInput[]
    NOT?: error_eventsWhereInput | error_eventsWhereInput[]
    match_id?: UuidFilter<"error_events"> | string
    appearance_at?: DateTimeFilter<"error_events"> | Date | string
    closed_at?: DateTimeNullableFilter<"error_events"> | Date | string | null
    closed_by?: UuidNullableFilter<"error_events"> | string | null
    users?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null
    matches?: XOR<MatchesScalarRelationFilter, matchesWhereInput>
  }, "id">

  export type error_eventsOrderByWithAggregationInput = {
    id?: SortOrder
    match_id?: SortOrder
    appearance_at?: SortOrder
    closed_at?: SortOrderInput | SortOrder
    closed_by?: SortOrderInput | SortOrder
    _count?: error_eventsCountOrderByAggregateInput
    _max?: error_eventsMaxOrderByAggregateInput
    _min?: error_eventsMinOrderByAggregateInput
  }

  export type error_eventsScalarWhereWithAggregatesInput = {
    AND?: error_eventsScalarWhereWithAggregatesInput | error_eventsScalarWhereWithAggregatesInput[]
    OR?: error_eventsScalarWhereWithAggregatesInput[]
    NOT?: error_eventsScalarWhereWithAggregatesInput | error_eventsScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"error_events"> | string
    match_id?: UuidWithAggregatesFilter<"error_events"> | string
    appearance_at?: DateTimeWithAggregatesFilter<"error_events"> | Date | string
    closed_at?: DateTimeNullableWithAggregatesFilter<"error_events"> | Date | string | null
    closed_by?: UuidNullableWithAggregatesFilter<"error_events"> | string | null
  }

  export type matchesWhereInput = {
    AND?: matchesWhereInput | matchesWhereInput[]
    OR?: matchesWhereInput[]
    NOT?: matchesWhereInput | matchesWhereInput[]
    id?: UuidFilter<"matches"> | string
    room_id?: UuidFilter<"matches"> | string
    game_type?: StringFilter<"matches"> | string
    status?: StringFilter<"matches"> | string
    winner_id?: UuidNullableFilter<"matches"> | string | null
    created_at?: DateTimeFilter<"matches"> | Date | string
    error_events?: Error_eventsListRelationFilter
    rooms?: XOR<RoomScalarRelationFilter, RoomWhereInput>
    users?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null
  }

  export type matchesOrderByWithRelationInput = {
    id?: SortOrder
    room_id?: SortOrder
    game_type?: SortOrder
    status?: SortOrder
    winner_id?: SortOrderInput | SortOrder
    created_at?: SortOrder
    error_events?: error_eventsOrderByRelationAggregateInput
    rooms?: RoomOrderByWithRelationInput
    users?: UserOrderByWithRelationInput
  }

  export type matchesWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: matchesWhereInput | matchesWhereInput[]
    OR?: matchesWhereInput[]
    NOT?: matchesWhereInput | matchesWhereInput[]
    room_id?: UuidFilter<"matches"> | string
    game_type?: StringFilter<"matches"> | string
    status?: StringFilter<"matches"> | string
    winner_id?: UuidNullableFilter<"matches"> | string | null
    created_at?: DateTimeFilter<"matches"> | Date | string
    error_events?: Error_eventsListRelationFilter
    rooms?: XOR<RoomScalarRelationFilter, RoomWhereInput>
    users?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null
  }, "id">

  export type matchesOrderByWithAggregationInput = {
    id?: SortOrder
    room_id?: SortOrder
    game_type?: SortOrder
    status?: SortOrder
    winner_id?: SortOrderInput | SortOrder
    created_at?: SortOrder
    _count?: matchesCountOrderByAggregateInput
    _max?: matchesMaxOrderByAggregateInput
    _min?: matchesMinOrderByAggregateInput
  }

  export type matchesScalarWhereWithAggregatesInput = {
    AND?: matchesScalarWhereWithAggregatesInput | matchesScalarWhereWithAggregatesInput[]
    OR?: matchesScalarWhereWithAggregatesInput[]
    NOT?: matchesScalarWhereWithAggregatesInput | matchesScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"matches"> | string
    room_id?: UuidWithAggregatesFilter<"matches"> | string
    game_type?: StringWithAggregatesFilter<"matches"> | string
    status?: StringWithAggregatesFilter<"matches"> | string
    winner_id?: UuidNullableWithAggregatesFilter<"matches"> | string | null
    created_at?: DateTimeWithAggregatesFilter<"matches"> | Date | string
  }

  export type UserCreateInput = {
    id?: string
    name: string
    email: string
    createdAt?: Date | string
    error_events?: error_eventsCreateNestedManyWithoutUsersInput
    matches?: matchesCreateNestedManyWithoutUsersInput
    joinedRooms?: RoomUserCreateNestedManyWithoutUserInput
    createdRooms?: RoomCreateNestedManyWithoutCreatorInput
    userIDPs?: UserIDPCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateInput = {
    id?: string
    name: string
    email: string
    createdAt?: Date | string
    error_events?: error_eventsUncheckedCreateNestedManyWithoutUsersInput
    matches?: matchesUncheckedCreateNestedManyWithoutUsersInput
    joinedRooms?: RoomUserUncheckedCreateNestedManyWithoutUserInput
    createdRooms?: RoomUncheckedCreateNestedManyWithoutCreatorInput
    userIDPs?: UserIDPUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    error_events?: error_eventsUpdateManyWithoutUsersNestedInput
    matches?: matchesUpdateManyWithoutUsersNestedInput
    joinedRooms?: RoomUserUpdateManyWithoutUserNestedInput
    createdRooms?: RoomUpdateManyWithoutCreatorNestedInput
    userIDPs?: UserIDPUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    error_events?: error_eventsUncheckedUpdateManyWithoutUsersNestedInput
    matches?: matchesUncheckedUpdateManyWithoutUsersNestedInput
    joinedRooms?: RoomUserUncheckedUpdateManyWithoutUserNestedInput
    createdRooms?: RoomUncheckedUpdateManyWithoutCreatorNestedInput
    userIDPs?: UserIDPUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateManyInput = {
    id?: string
    name: string
    email: string
    createdAt?: Date | string
  }

  export type UserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RoomCreateInput = {
    id?: string
    name: string
    createdAt?: Date | string
    current_match_id?: string | null
    activeGameType?: string | null
    status?: $Enums.RoomStatus
    matches?: matchesCreateNestedManyWithoutRoomsInput
    users?: RoomUserCreateNestedManyWithoutRoomInput
    creator: UserCreateNestedOneWithoutCreatedRoomsInput
  }

  export type RoomUncheckedCreateInput = {
    id?: string
    name: string
    createdAt?: Date | string
    createdBy: string
    current_match_id?: string | null
    activeGameType?: string | null
    status?: $Enums.RoomStatus
    matches?: matchesUncheckedCreateNestedManyWithoutRoomsInput
    users?: RoomUserUncheckedCreateNestedManyWithoutRoomInput
  }

  export type RoomUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    current_match_id?: NullableStringFieldUpdateOperationsInput | string | null
    activeGameType?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumRoomStatusFieldUpdateOperationsInput | $Enums.RoomStatus
    matches?: matchesUpdateManyWithoutRoomsNestedInput
    users?: RoomUserUpdateManyWithoutRoomNestedInput
    creator?: UserUpdateOneRequiredWithoutCreatedRoomsNestedInput
  }

  export type RoomUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: StringFieldUpdateOperationsInput | string
    current_match_id?: NullableStringFieldUpdateOperationsInput | string | null
    activeGameType?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumRoomStatusFieldUpdateOperationsInput | $Enums.RoomStatus
    matches?: matchesUncheckedUpdateManyWithoutRoomsNestedInput
    users?: RoomUserUncheckedUpdateManyWithoutRoomNestedInput
  }

  export type RoomCreateManyInput = {
    id?: string
    name: string
    createdAt?: Date | string
    createdBy: string
    current_match_id?: string | null
    activeGameType?: string | null
    status?: $Enums.RoomStatus
  }

  export type RoomUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    current_match_id?: NullableStringFieldUpdateOperationsInput | string | null
    activeGameType?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumRoomStatusFieldUpdateOperationsInput | $Enums.RoomStatus
  }

  export type RoomUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: StringFieldUpdateOperationsInput | string
    current_match_id?: NullableStringFieldUpdateOperationsInput | string | null
    activeGameType?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumRoomStatusFieldUpdateOperationsInput | $Enums.RoomStatus
  }

  export type RoomUserCreateInput = {
    id?: string
    createdAt?: Date | string
    room: RoomCreateNestedOneWithoutUsersInput
    user: UserCreateNestedOneWithoutJoinedRoomsInput
  }

  export type RoomUserUncheckedCreateInput = {
    id?: string
    roomId: string
    userId: string
    createdAt?: Date | string
  }

  export type RoomUserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    room?: RoomUpdateOneRequiredWithoutUsersNestedInput
    user?: UserUpdateOneRequiredWithoutJoinedRoomsNestedInput
  }

  export type RoomUserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    roomId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RoomUserCreateManyInput = {
    id?: string
    roomId: string
    userId: string
    createdAt?: Date | string
  }

  export type RoomUserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RoomUserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    roomId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserIDPCreateInput = {
    id?: string
    supabaseUid: string
    user: UserCreateNestedOneWithoutUserIDPsInput
  }

  export type UserIDPUncheckedCreateInput = {
    id?: string
    supabaseUid: string
    userId: string
  }

  export type UserIDPUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    supabaseUid?: StringFieldUpdateOperationsInput | string
    user?: UserUpdateOneRequiredWithoutUserIDPsNestedInput
  }

  export type UserIDPUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    supabaseUid?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
  }

  export type UserIDPCreateManyInput = {
    id?: string
    supabaseUid: string
    userId: string
  }

  export type UserIDPUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    supabaseUid?: StringFieldUpdateOperationsInput | string
  }

  export type UserIDPUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    supabaseUid?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
  }

  export type error_eventsCreateInput = {
    id?: string
    appearance_at: Date | string
    closed_at?: Date | string | null
    users?: UserCreateNestedOneWithoutError_eventsInput
    matches: matchesCreateNestedOneWithoutError_eventsInput
  }

  export type error_eventsUncheckedCreateInput = {
    id?: string
    match_id: string
    appearance_at: Date | string
    closed_at?: Date | string | null
    closed_by?: string | null
  }

  export type error_eventsUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    appearance_at?: DateTimeFieldUpdateOperationsInput | Date | string
    closed_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    users?: UserUpdateOneWithoutError_eventsNestedInput
    matches?: matchesUpdateOneRequiredWithoutError_eventsNestedInput
  }

  export type error_eventsUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    match_id?: StringFieldUpdateOperationsInput | string
    appearance_at?: DateTimeFieldUpdateOperationsInput | Date | string
    closed_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    closed_by?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type error_eventsCreateManyInput = {
    id?: string
    match_id: string
    appearance_at: Date | string
    closed_at?: Date | string | null
    closed_by?: string | null
  }

  export type error_eventsUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    appearance_at?: DateTimeFieldUpdateOperationsInput | Date | string
    closed_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type error_eventsUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    match_id?: StringFieldUpdateOperationsInput | string
    appearance_at?: DateTimeFieldUpdateOperationsInput | Date | string
    closed_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    closed_by?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type matchesCreateInput = {
    id?: string
    game_type: string
    status?: string
    created_at?: Date | string
    error_events?: error_eventsCreateNestedManyWithoutMatchesInput
    rooms: RoomCreateNestedOneWithoutMatchesInput
    users?: UserCreateNestedOneWithoutMatchesInput
  }

  export type matchesUncheckedCreateInput = {
    id?: string
    room_id: string
    game_type: string
    status?: string
    winner_id?: string | null
    created_at?: Date | string
    error_events?: error_eventsUncheckedCreateNestedManyWithoutMatchesInput
  }

  export type matchesUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    game_type?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    error_events?: error_eventsUpdateManyWithoutMatchesNestedInput
    rooms?: RoomUpdateOneRequiredWithoutMatchesNestedInput
    users?: UserUpdateOneWithoutMatchesNestedInput
  }

  export type matchesUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    room_id?: StringFieldUpdateOperationsInput | string
    game_type?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    winner_id?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    error_events?: error_eventsUncheckedUpdateManyWithoutMatchesNestedInput
  }

  export type matchesCreateManyInput = {
    id?: string
    room_id: string
    game_type: string
    status?: string
    winner_id?: string | null
    created_at?: Date | string
  }

  export type matchesUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    game_type?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type matchesUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    room_id?: StringFieldUpdateOperationsInput | string
    game_type?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    winner_id?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UuidFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedUuidFilter<$PrismaModel> | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type Error_eventsListRelationFilter = {
    every?: error_eventsWhereInput
    some?: error_eventsWhereInput
    none?: error_eventsWhereInput
  }

  export type MatchesListRelationFilter = {
    every?: matchesWhereInput
    some?: matchesWhereInput
    none?: matchesWhereInput
  }

  export type RoomUserListRelationFilter = {
    every?: RoomUserWhereInput
    some?: RoomUserWhereInput
    none?: RoomUserWhereInput
  }

  export type RoomListRelationFilter = {
    every?: RoomWhereInput
    some?: RoomWhereInput
    none?: RoomWhereInput
  }

  export type UserIDPListRelationFilter = {
    every?: UserIDPWhereInput
    some?: UserIDPWhereInput
    none?: UserIDPWhereInput
  }

  export type error_eventsOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type matchesOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type RoomUserOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type RoomOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserIDPOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    createdAt?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    createdAt?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    createdAt?: SortOrder
  }

  export type UuidWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedUuidWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type UuidNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedUuidNullableFilter<$PrismaModel> | string | null
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type EnumRoomStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.RoomStatus | EnumRoomStatusFieldRefInput<$PrismaModel>
    in?: $Enums.RoomStatus[] | ListEnumRoomStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.RoomStatus[] | ListEnumRoomStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumRoomStatusFilter<$PrismaModel> | $Enums.RoomStatus
  }

  export type UserScalarRelationFilter = {
    is?: UserWhereInput
    isNot?: UserWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type RoomCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    createdBy?: SortOrder
    current_match_id?: SortOrder
    activeGameType?: SortOrder
    status?: SortOrder
  }

  export type RoomMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    createdBy?: SortOrder
    current_match_id?: SortOrder
    activeGameType?: SortOrder
    status?: SortOrder
  }

  export type RoomMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    createdBy?: SortOrder
    current_match_id?: SortOrder
    activeGameType?: SortOrder
    status?: SortOrder
  }

  export type UuidNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedUuidNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type EnumRoomStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.RoomStatus | EnumRoomStatusFieldRefInput<$PrismaModel>
    in?: $Enums.RoomStatus[] | ListEnumRoomStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.RoomStatus[] | ListEnumRoomStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumRoomStatusWithAggregatesFilter<$PrismaModel> | $Enums.RoomStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumRoomStatusFilter<$PrismaModel>
    _max?: NestedEnumRoomStatusFilter<$PrismaModel>
  }

  export type RoomScalarRelationFilter = {
    is?: RoomWhereInput
    isNot?: RoomWhereInput
  }

  export type RoomUserRoomIdUserIdCompoundUniqueInput = {
    roomId: string
    userId: string
  }

  export type RoomUserCountOrderByAggregateInput = {
    id?: SortOrder
    roomId?: SortOrder
    userId?: SortOrder
    createdAt?: SortOrder
  }

  export type RoomUserMaxOrderByAggregateInput = {
    id?: SortOrder
    roomId?: SortOrder
    userId?: SortOrder
    createdAt?: SortOrder
  }

  export type RoomUserMinOrderByAggregateInput = {
    id?: SortOrder
    roomId?: SortOrder
    userId?: SortOrder
    createdAt?: SortOrder
  }

  export type UserIDPCountOrderByAggregateInput = {
    id?: SortOrder
    supabaseUid?: SortOrder
    userId?: SortOrder
  }

  export type UserIDPMaxOrderByAggregateInput = {
    id?: SortOrder
    supabaseUid?: SortOrder
    userId?: SortOrder
  }

  export type UserIDPMinOrderByAggregateInput = {
    id?: SortOrder
    supabaseUid?: SortOrder
    userId?: SortOrder
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type UserNullableScalarRelationFilter = {
    is?: UserWhereInput | null
    isNot?: UserWhereInput | null
  }

  export type MatchesScalarRelationFilter = {
    is?: matchesWhereInput
    isNot?: matchesWhereInput
  }

  export type error_eventsCountOrderByAggregateInput = {
    id?: SortOrder
    match_id?: SortOrder
    appearance_at?: SortOrder
    closed_at?: SortOrder
    closed_by?: SortOrder
  }

  export type error_eventsMaxOrderByAggregateInput = {
    id?: SortOrder
    match_id?: SortOrder
    appearance_at?: SortOrder
    closed_at?: SortOrder
    closed_by?: SortOrder
  }

  export type error_eventsMinOrderByAggregateInput = {
    id?: SortOrder
    match_id?: SortOrder
    appearance_at?: SortOrder
    closed_at?: SortOrder
    closed_by?: SortOrder
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type matchesCountOrderByAggregateInput = {
    id?: SortOrder
    room_id?: SortOrder
    game_type?: SortOrder
    status?: SortOrder
    winner_id?: SortOrder
    created_at?: SortOrder
  }

  export type matchesMaxOrderByAggregateInput = {
    id?: SortOrder
    room_id?: SortOrder
    game_type?: SortOrder
    status?: SortOrder
    winner_id?: SortOrder
    created_at?: SortOrder
  }

  export type matchesMinOrderByAggregateInput = {
    id?: SortOrder
    room_id?: SortOrder
    game_type?: SortOrder
    status?: SortOrder
    winner_id?: SortOrder
    created_at?: SortOrder
  }

  export type error_eventsCreateNestedManyWithoutUsersInput = {
    create?: XOR<error_eventsCreateWithoutUsersInput, error_eventsUncheckedCreateWithoutUsersInput> | error_eventsCreateWithoutUsersInput[] | error_eventsUncheckedCreateWithoutUsersInput[]
    connectOrCreate?: error_eventsCreateOrConnectWithoutUsersInput | error_eventsCreateOrConnectWithoutUsersInput[]
    createMany?: error_eventsCreateManyUsersInputEnvelope
    connect?: error_eventsWhereUniqueInput | error_eventsWhereUniqueInput[]
  }

  export type matchesCreateNestedManyWithoutUsersInput = {
    create?: XOR<matchesCreateWithoutUsersInput, matchesUncheckedCreateWithoutUsersInput> | matchesCreateWithoutUsersInput[] | matchesUncheckedCreateWithoutUsersInput[]
    connectOrCreate?: matchesCreateOrConnectWithoutUsersInput | matchesCreateOrConnectWithoutUsersInput[]
    createMany?: matchesCreateManyUsersInputEnvelope
    connect?: matchesWhereUniqueInput | matchesWhereUniqueInput[]
  }

  export type RoomUserCreateNestedManyWithoutUserInput = {
    create?: XOR<RoomUserCreateWithoutUserInput, RoomUserUncheckedCreateWithoutUserInput> | RoomUserCreateWithoutUserInput[] | RoomUserUncheckedCreateWithoutUserInput[]
    connectOrCreate?: RoomUserCreateOrConnectWithoutUserInput | RoomUserCreateOrConnectWithoutUserInput[]
    createMany?: RoomUserCreateManyUserInputEnvelope
    connect?: RoomUserWhereUniqueInput | RoomUserWhereUniqueInput[]
  }

  export type RoomCreateNestedManyWithoutCreatorInput = {
    create?: XOR<RoomCreateWithoutCreatorInput, RoomUncheckedCreateWithoutCreatorInput> | RoomCreateWithoutCreatorInput[] | RoomUncheckedCreateWithoutCreatorInput[]
    connectOrCreate?: RoomCreateOrConnectWithoutCreatorInput | RoomCreateOrConnectWithoutCreatorInput[]
    createMany?: RoomCreateManyCreatorInputEnvelope
    connect?: RoomWhereUniqueInput | RoomWhereUniqueInput[]
  }

  export type UserIDPCreateNestedManyWithoutUserInput = {
    create?: XOR<UserIDPCreateWithoutUserInput, UserIDPUncheckedCreateWithoutUserInput> | UserIDPCreateWithoutUserInput[] | UserIDPUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserIDPCreateOrConnectWithoutUserInput | UserIDPCreateOrConnectWithoutUserInput[]
    createMany?: UserIDPCreateManyUserInputEnvelope
    connect?: UserIDPWhereUniqueInput | UserIDPWhereUniqueInput[]
  }

  export type error_eventsUncheckedCreateNestedManyWithoutUsersInput = {
    create?: XOR<error_eventsCreateWithoutUsersInput, error_eventsUncheckedCreateWithoutUsersInput> | error_eventsCreateWithoutUsersInput[] | error_eventsUncheckedCreateWithoutUsersInput[]
    connectOrCreate?: error_eventsCreateOrConnectWithoutUsersInput | error_eventsCreateOrConnectWithoutUsersInput[]
    createMany?: error_eventsCreateManyUsersInputEnvelope
    connect?: error_eventsWhereUniqueInput | error_eventsWhereUniqueInput[]
  }

  export type matchesUncheckedCreateNestedManyWithoutUsersInput = {
    create?: XOR<matchesCreateWithoutUsersInput, matchesUncheckedCreateWithoutUsersInput> | matchesCreateWithoutUsersInput[] | matchesUncheckedCreateWithoutUsersInput[]
    connectOrCreate?: matchesCreateOrConnectWithoutUsersInput | matchesCreateOrConnectWithoutUsersInput[]
    createMany?: matchesCreateManyUsersInputEnvelope
    connect?: matchesWhereUniqueInput | matchesWhereUniqueInput[]
  }

  export type RoomUserUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<RoomUserCreateWithoutUserInput, RoomUserUncheckedCreateWithoutUserInput> | RoomUserCreateWithoutUserInput[] | RoomUserUncheckedCreateWithoutUserInput[]
    connectOrCreate?: RoomUserCreateOrConnectWithoutUserInput | RoomUserCreateOrConnectWithoutUserInput[]
    createMany?: RoomUserCreateManyUserInputEnvelope
    connect?: RoomUserWhereUniqueInput | RoomUserWhereUniqueInput[]
  }

  export type RoomUncheckedCreateNestedManyWithoutCreatorInput = {
    create?: XOR<RoomCreateWithoutCreatorInput, RoomUncheckedCreateWithoutCreatorInput> | RoomCreateWithoutCreatorInput[] | RoomUncheckedCreateWithoutCreatorInput[]
    connectOrCreate?: RoomCreateOrConnectWithoutCreatorInput | RoomCreateOrConnectWithoutCreatorInput[]
    createMany?: RoomCreateManyCreatorInputEnvelope
    connect?: RoomWhereUniqueInput | RoomWhereUniqueInput[]
  }

  export type UserIDPUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<UserIDPCreateWithoutUserInput, UserIDPUncheckedCreateWithoutUserInput> | UserIDPCreateWithoutUserInput[] | UserIDPUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserIDPCreateOrConnectWithoutUserInput | UserIDPCreateOrConnectWithoutUserInput[]
    createMany?: UserIDPCreateManyUserInputEnvelope
    connect?: UserIDPWhereUniqueInput | UserIDPWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type error_eventsUpdateManyWithoutUsersNestedInput = {
    create?: XOR<error_eventsCreateWithoutUsersInput, error_eventsUncheckedCreateWithoutUsersInput> | error_eventsCreateWithoutUsersInput[] | error_eventsUncheckedCreateWithoutUsersInput[]
    connectOrCreate?: error_eventsCreateOrConnectWithoutUsersInput | error_eventsCreateOrConnectWithoutUsersInput[]
    upsert?: error_eventsUpsertWithWhereUniqueWithoutUsersInput | error_eventsUpsertWithWhereUniqueWithoutUsersInput[]
    createMany?: error_eventsCreateManyUsersInputEnvelope
    set?: error_eventsWhereUniqueInput | error_eventsWhereUniqueInput[]
    disconnect?: error_eventsWhereUniqueInput | error_eventsWhereUniqueInput[]
    delete?: error_eventsWhereUniqueInput | error_eventsWhereUniqueInput[]
    connect?: error_eventsWhereUniqueInput | error_eventsWhereUniqueInput[]
    update?: error_eventsUpdateWithWhereUniqueWithoutUsersInput | error_eventsUpdateWithWhereUniqueWithoutUsersInput[]
    updateMany?: error_eventsUpdateManyWithWhereWithoutUsersInput | error_eventsUpdateManyWithWhereWithoutUsersInput[]
    deleteMany?: error_eventsScalarWhereInput | error_eventsScalarWhereInput[]
  }

  export type matchesUpdateManyWithoutUsersNestedInput = {
    create?: XOR<matchesCreateWithoutUsersInput, matchesUncheckedCreateWithoutUsersInput> | matchesCreateWithoutUsersInput[] | matchesUncheckedCreateWithoutUsersInput[]
    connectOrCreate?: matchesCreateOrConnectWithoutUsersInput | matchesCreateOrConnectWithoutUsersInput[]
    upsert?: matchesUpsertWithWhereUniqueWithoutUsersInput | matchesUpsertWithWhereUniqueWithoutUsersInput[]
    createMany?: matchesCreateManyUsersInputEnvelope
    set?: matchesWhereUniqueInput | matchesWhereUniqueInput[]
    disconnect?: matchesWhereUniqueInput | matchesWhereUniqueInput[]
    delete?: matchesWhereUniqueInput | matchesWhereUniqueInput[]
    connect?: matchesWhereUniqueInput | matchesWhereUniqueInput[]
    update?: matchesUpdateWithWhereUniqueWithoutUsersInput | matchesUpdateWithWhereUniqueWithoutUsersInput[]
    updateMany?: matchesUpdateManyWithWhereWithoutUsersInput | matchesUpdateManyWithWhereWithoutUsersInput[]
    deleteMany?: matchesScalarWhereInput | matchesScalarWhereInput[]
  }

  export type RoomUserUpdateManyWithoutUserNestedInput = {
    create?: XOR<RoomUserCreateWithoutUserInput, RoomUserUncheckedCreateWithoutUserInput> | RoomUserCreateWithoutUserInput[] | RoomUserUncheckedCreateWithoutUserInput[]
    connectOrCreate?: RoomUserCreateOrConnectWithoutUserInput | RoomUserCreateOrConnectWithoutUserInput[]
    upsert?: RoomUserUpsertWithWhereUniqueWithoutUserInput | RoomUserUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: RoomUserCreateManyUserInputEnvelope
    set?: RoomUserWhereUniqueInput | RoomUserWhereUniqueInput[]
    disconnect?: RoomUserWhereUniqueInput | RoomUserWhereUniqueInput[]
    delete?: RoomUserWhereUniqueInput | RoomUserWhereUniqueInput[]
    connect?: RoomUserWhereUniqueInput | RoomUserWhereUniqueInput[]
    update?: RoomUserUpdateWithWhereUniqueWithoutUserInput | RoomUserUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: RoomUserUpdateManyWithWhereWithoutUserInput | RoomUserUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: RoomUserScalarWhereInput | RoomUserScalarWhereInput[]
  }

  export type RoomUpdateManyWithoutCreatorNestedInput = {
    create?: XOR<RoomCreateWithoutCreatorInput, RoomUncheckedCreateWithoutCreatorInput> | RoomCreateWithoutCreatorInput[] | RoomUncheckedCreateWithoutCreatorInput[]
    connectOrCreate?: RoomCreateOrConnectWithoutCreatorInput | RoomCreateOrConnectWithoutCreatorInput[]
    upsert?: RoomUpsertWithWhereUniqueWithoutCreatorInput | RoomUpsertWithWhereUniqueWithoutCreatorInput[]
    createMany?: RoomCreateManyCreatorInputEnvelope
    set?: RoomWhereUniqueInput | RoomWhereUniqueInput[]
    disconnect?: RoomWhereUniqueInput | RoomWhereUniqueInput[]
    delete?: RoomWhereUniqueInput | RoomWhereUniqueInput[]
    connect?: RoomWhereUniqueInput | RoomWhereUniqueInput[]
    update?: RoomUpdateWithWhereUniqueWithoutCreatorInput | RoomUpdateWithWhereUniqueWithoutCreatorInput[]
    updateMany?: RoomUpdateManyWithWhereWithoutCreatorInput | RoomUpdateManyWithWhereWithoutCreatorInput[]
    deleteMany?: RoomScalarWhereInput | RoomScalarWhereInput[]
  }

  export type UserIDPUpdateManyWithoutUserNestedInput = {
    create?: XOR<UserIDPCreateWithoutUserInput, UserIDPUncheckedCreateWithoutUserInput> | UserIDPCreateWithoutUserInput[] | UserIDPUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserIDPCreateOrConnectWithoutUserInput | UserIDPCreateOrConnectWithoutUserInput[]
    upsert?: UserIDPUpsertWithWhereUniqueWithoutUserInput | UserIDPUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: UserIDPCreateManyUserInputEnvelope
    set?: UserIDPWhereUniqueInput | UserIDPWhereUniqueInput[]
    disconnect?: UserIDPWhereUniqueInput | UserIDPWhereUniqueInput[]
    delete?: UserIDPWhereUniqueInput | UserIDPWhereUniqueInput[]
    connect?: UserIDPWhereUniqueInput | UserIDPWhereUniqueInput[]
    update?: UserIDPUpdateWithWhereUniqueWithoutUserInput | UserIDPUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: UserIDPUpdateManyWithWhereWithoutUserInput | UserIDPUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: UserIDPScalarWhereInput | UserIDPScalarWhereInput[]
  }

  export type error_eventsUncheckedUpdateManyWithoutUsersNestedInput = {
    create?: XOR<error_eventsCreateWithoutUsersInput, error_eventsUncheckedCreateWithoutUsersInput> | error_eventsCreateWithoutUsersInput[] | error_eventsUncheckedCreateWithoutUsersInput[]
    connectOrCreate?: error_eventsCreateOrConnectWithoutUsersInput | error_eventsCreateOrConnectWithoutUsersInput[]
    upsert?: error_eventsUpsertWithWhereUniqueWithoutUsersInput | error_eventsUpsertWithWhereUniqueWithoutUsersInput[]
    createMany?: error_eventsCreateManyUsersInputEnvelope
    set?: error_eventsWhereUniqueInput | error_eventsWhereUniqueInput[]
    disconnect?: error_eventsWhereUniqueInput | error_eventsWhereUniqueInput[]
    delete?: error_eventsWhereUniqueInput | error_eventsWhereUniqueInput[]
    connect?: error_eventsWhereUniqueInput | error_eventsWhereUniqueInput[]
    update?: error_eventsUpdateWithWhereUniqueWithoutUsersInput | error_eventsUpdateWithWhereUniqueWithoutUsersInput[]
    updateMany?: error_eventsUpdateManyWithWhereWithoutUsersInput | error_eventsUpdateManyWithWhereWithoutUsersInput[]
    deleteMany?: error_eventsScalarWhereInput | error_eventsScalarWhereInput[]
  }

  export type matchesUncheckedUpdateManyWithoutUsersNestedInput = {
    create?: XOR<matchesCreateWithoutUsersInput, matchesUncheckedCreateWithoutUsersInput> | matchesCreateWithoutUsersInput[] | matchesUncheckedCreateWithoutUsersInput[]
    connectOrCreate?: matchesCreateOrConnectWithoutUsersInput | matchesCreateOrConnectWithoutUsersInput[]
    upsert?: matchesUpsertWithWhereUniqueWithoutUsersInput | matchesUpsertWithWhereUniqueWithoutUsersInput[]
    createMany?: matchesCreateManyUsersInputEnvelope
    set?: matchesWhereUniqueInput | matchesWhereUniqueInput[]
    disconnect?: matchesWhereUniqueInput | matchesWhereUniqueInput[]
    delete?: matchesWhereUniqueInput | matchesWhereUniqueInput[]
    connect?: matchesWhereUniqueInput | matchesWhereUniqueInput[]
    update?: matchesUpdateWithWhereUniqueWithoutUsersInput | matchesUpdateWithWhereUniqueWithoutUsersInput[]
    updateMany?: matchesUpdateManyWithWhereWithoutUsersInput | matchesUpdateManyWithWhereWithoutUsersInput[]
    deleteMany?: matchesScalarWhereInput | matchesScalarWhereInput[]
  }

  export type RoomUserUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<RoomUserCreateWithoutUserInput, RoomUserUncheckedCreateWithoutUserInput> | RoomUserCreateWithoutUserInput[] | RoomUserUncheckedCreateWithoutUserInput[]
    connectOrCreate?: RoomUserCreateOrConnectWithoutUserInput | RoomUserCreateOrConnectWithoutUserInput[]
    upsert?: RoomUserUpsertWithWhereUniqueWithoutUserInput | RoomUserUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: RoomUserCreateManyUserInputEnvelope
    set?: RoomUserWhereUniqueInput | RoomUserWhereUniqueInput[]
    disconnect?: RoomUserWhereUniqueInput | RoomUserWhereUniqueInput[]
    delete?: RoomUserWhereUniqueInput | RoomUserWhereUniqueInput[]
    connect?: RoomUserWhereUniqueInput | RoomUserWhereUniqueInput[]
    update?: RoomUserUpdateWithWhereUniqueWithoutUserInput | RoomUserUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: RoomUserUpdateManyWithWhereWithoutUserInput | RoomUserUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: RoomUserScalarWhereInput | RoomUserScalarWhereInput[]
  }

  export type RoomUncheckedUpdateManyWithoutCreatorNestedInput = {
    create?: XOR<RoomCreateWithoutCreatorInput, RoomUncheckedCreateWithoutCreatorInput> | RoomCreateWithoutCreatorInput[] | RoomUncheckedCreateWithoutCreatorInput[]
    connectOrCreate?: RoomCreateOrConnectWithoutCreatorInput | RoomCreateOrConnectWithoutCreatorInput[]
    upsert?: RoomUpsertWithWhereUniqueWithoutCreatorInput | RoomUpsertWithWhereUniqueWithoutCreatorInput[]
    createMany?: RoomCreateManyCreatorInputEnvelope
    set?: RoomWhereUniqueInput | RoomWhereUniqueInput[]
    disconnect?: RoomWhereUniqueInput | RoomWhereUniqueInput[]
    delete?: RoomWhereUniqueInput | RoomWhereUniqueInput[]
    connect?: RoomWhereUniqueInput | RoomWhereUniqueInput[]
    update?: RoomUpdateWithWhereUniqueWithoutCreatorInput | RoomUpdateWithWhereUniqueWithoutCreatorInput[]
    updateMany?: RoomUpdateManyWithWhereWithoutCreatorInput | RoomUpdateManyWithWhereWithoutCreatorInput[]
    deleteMany?: RoomScalarWhereInput | RoomScalarWhereInput[]
  }

  export type UserIDPUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<UserIDPCreateWithoutUserInput, UserIDPUncheckedCreateWithoutUserInput> | UserIDPCreateWithoutUserInput[] | UserIDPUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserIDPCreateOrConnectWithoutUserInput | UserIDPCreateOrConnectWithoutUserInput[]
    upsert?: UserIDPUpsertWithWhereUniqueWithoutUserInput | UserIDPUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: UserIDPCreateManyUserInputEnvelope
    set?: UserIDPWhereUniqueInput | UserIDPWhereUniqueInput[]
    disconnect?: UserIDPWhereUniqueInput | UserIDPWhereUniqueInput[]
    delete?: UserIDPWhereUniqueInput | UserIDPWhereUniqueInput[]
    connect?: UserIDPWhereUniqueInput | UserIDPWhereUniqueInput[]
    update?: UserIDPUpdateWithWhereUniqueWithoutUserInput | UserIDPUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: UserIDPUpdateManyWithWhereWithoutUserInput | UserIDPUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: UserIDPScalarWhereInput | UserIDPScalarWhereInput[]
  }

  export type matchesCreateNestedManyWithoutRoomsInput = {
    create?: XOR<matchesCreateWithoutRoomsInput, matchesUncheckedCreateWithoutRoomsInput> | matchesCreateWithoutRoomsInput[] | matchesUncheckedCreateWithoutRoomsInput[]
    connectOrCreate?: matchesCreateOrConnectWithoutRoomsInput | matchesCreateOrConnectWithoutRoomsInput[]
    createMany?: matchesCreateManyRoomsInputEnvelope
    connect?: matchesWhereUniqueInput | matchesWhereUniqueInput[]
  }

  export type RoomUserCreateNestedManyWithoutRoomInput = {
    create?: XOR<RoomUserCreateWithoutRoomInput, RoomUserUncheckedCreateWithoutRoomInput> | RoomUserCreateWithoutRoomInput[] | RoomUserUncheckedCreateWithoutRoomInput[]
    connectOrCreate?: RoomUserCreateOrConnectWithoutRoomInput | RoomUserCreateOrConnectWithoutRoomInput[]
    createMany?: RoomUserCreateManyRoomInputEnvelope
    connect?: RoomUserWhereUniqueInput | RoomUserWhereUniqueInput[]
  }

  export type UserCreateNestedOneWithoutCreatedRoomsInput = {
    create?: XOR<UserCreateWithoutCreatedRoomsInput, UserUncheckedCreateWithoutCreatedRoomsInput>
    connectOrCreate?: UserCreateOrConnectWithoutCreatedRoomsInput
    connect?: UserWhereUniqueInput
  }

  export type matchesUncheckedCreateNestedManyWithoutRoomsInput = {
    create?: XOR<matchesCreateWithoutRoomsInput, matchesUncheckedCreateWithoutRoomsInput> | matchesCreateWithoutRoomsInput[] | matchesUncheckedCreateWithoutRoomsInput[]
    connectOrCreate?: matchesCreateOrConnectWithoutRoomsInput | matchesCreateOrConnectWithoutRoomsInput[]
    createMany?: matchesCreateManyRoomsInputEnvelope
    connect?: matchesWhereUniqueInput | matchesWhereUniqueInput[]
  }

  export type RoomUserUncheckedCreateNestedManyWithoutRoomInput = {
    create?: XOR<RoomUserCreateWithoutRoomInput, RoomUserUncheckedCreateWithoutRoomInput> | RoomUserCreateWithoutRoomInput[] | RoomUserUncheckedCreateWithoutRoomInput[]
    connectOrCreate?: RoomUserCreateOrConnectWithoutRoomInput | RoomUserCreateOrConnectWithoutRoomInput[]
    createMany?: RoomUserCreateManyRoomInputEnvelope
    connect?: RoomUserWhereUniqueInput | RoomUserWhereUniqueInput[]
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type EnumRoomStatusFieldUpdateOperationsInput = {
    set?: $Enums.RoomStatus
  }

  export type matchesUpdateManyWithoutRoomsNestedInput = {
    create?: XOR<matchesCreateWithoutRoomsInput, matchesUncheckedCreateWithoutRoomsInput> | matchesCreateWithoutRoomsInput[] | matchesUncheckedCreateWithoutRoomsInput[]
    connectOrCreate?: matchesCreateOrConnectWithoutRoomsInput | matchesCreateOrConnectWithoutRoomsInput[]
    upsert?: matchesUpsertWithWhereUniqueWithoutRoomsInput | matchesUpsertWithWhereUniqueWithoutRoomsInput[]
    createMany?: matchesCreateManyRoomsInputEnvelope
    set?: matchesWhereUniqueInput | matchesWhereUniqueInput[]
    disconnect?: matchesWhereUniqueInput | matchesWhereUniqueInput[]
    delete?: matchesWhereUniqueInput | matchesWhereUniqueInput[]
    connect?: matchesWhereUniqueInput | matchesWhereUniqueInput[]
    update?: matchesUpdateWithWhereUniqueWithoutRoomsInput | matchesUpdateWithWhereUniqueWithoutRoomsInput[]
    updateMany?: matchesUpdateManyWithWhereWithoutRoomsInput | matchesUpdateManyWithWhereWithoutRoomsInput[]
    deleteMany?: matchesScalarWhereInput | matchesScalarWhereInput[]
  }

  export type RoomUserUpdateManyWithoutRoomNestedInput = {
    create?: XOR<RoomUserCreateWithoutRoomInput, RoomUserUncheckedCreateWithoutRoomInput> | RoomUserCreateWithoutRoomInput[] | RoomUserUncheckedCreateWithoutRoomInput[]
    connectOrCreate?: RoomUserCreateOrConnectWithoutRoomInput | RoomUserCreateOrConnectWithoutRoomInput[]
    upsert?: RoomUserUpsertWithWhereUniqueWithoutRoomInput | RoomUserUpsertWithWhereUniqueWithoutRoomInput[]
    createMany?: RoomUserCreateManyRoomInputEnvelope
    set?: RoomUserWhereUniqueInput | RoomUserWhereUniqueInput[]
    disconnect?: RoomUserWhereUniqueInput | RoomUserWhereUniqueInput[]
    delete?: RoomUserWhereUniqueInput | RoomUserWhereUniqueInput[]
    connect?: RoomUserWhereUniqueInput | RoomUserWhereUniqueInput[]
    update?: RoomUserUpdateWithWhereUniqueWithoutRoomInput | RoomUserUpdateWithWhereUniqueWithoutRoomInput[]
    updateMany?: RoomUserUpdateManyWithWhereWithoutRoomInput | RoomUserUpdateManyWithWhereWithoutRoomInput[]
    deleteMany?: RoomUserScalarWhereInput | RoomUserScalarWhereInput[]
  }

  export type UserUpdateOneRequiredWithoutCreatedRoomsNestedInput = {
    create?: XOR<UserCreateWithoutCreatedRoomsInput, UserUncheckedCreateWithoutCreatedRoomsInput>
    connectOrCreate?: UserCreateOrConnectWithoutCreatedRoomsInput
    upsert?: UserUpsertWithoutCreatedRoomsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutCreatedRoomsInput, UserUpdateWithoutCreatedRoomsInput>, UserUncheckedUpdateWithoutCreatedRoomsInput>
  }

  export type matchesUncheckedUpdateManyWithoutRoomsNestedInput = {
    create?: XOR<matchesCreateWithoutRoomsInput, matchesUncheckedCreateWithoutRoomsInput> | matchesCreateWithoutRoomsInput[] | matchesUncheckedCreateWithoutRoomsInput[]
    connectOrCreate?: matchesCreateOrConnectWithoutRoomsInput | matchesCreateOrConnectWithoutRoomsInput[]
    upsert?: matchesUpsertWithWhereUniqueWithoutRoomsInput | matchesUpsertWithWhereUniqueWithoutRoomsInput[]
    createMany?: matchesCreateManyRoomsInputEnvelope
    set?: matchesWhereUniqueInput | matchesWhereUniqueInput[]
    disconnect?: matchesWhereUniqueInput | matchesWhereUniqueInput[]
    delete?: matchesWhereUniqueInput | matchesWhereUniqueInput[]
    connect?: matchesWhereUniqueInput | matchesWhereUniqueInput[]
    update?: matchesUpdateWithWhereUniqueWithoutRoomsInput | matchesUpdateWithWhereUniqueWithoutRoomsInput[]
    updateMany?: matchesUpdateManyWithWhereWithoutRoomsInput | matchesUpdateManyWithWhereWithoutRoomsInput[]
    deleteMany?: matchesScalarWhereInput | matchesScalarWhereInput[]
  }

  export type RoomUserUncheckedUpdateManyWithoutRoomNestedInput = {
    create?: XOR<RoomUserCreateWithoutRoomInput, RoomUserUncheckedCreateWithoutRoomInput> | RoomUserCreateWithoutRoomInput[] | RoomUserUncheckedCreateWithoutRoomInput[]
    connectOrCreate?: RoomUserCreateOrConnectWithoutRoomInput | RoomUserCreateOrConnectWithoutRoomInput[]
    upsert?: RoomUserUpsertWithWhereUniqueWithoutRoomInput | RoomUserUpsertWithWhereUniqueWithoutRoomInput[]
    createMany?: RoomUserCreateManyRoomInputEnvelope
    set?: RoomUserWhereUniqueInput | RoomUserWhereUniqueInput[]
    disconnect?: RoomUserWhereUniqueInput | RoomUserWhereUniqueInput[]
    delete?: RoomUserWhereUniqueInput | RoomUserWhereUniqueInput[]
    connect?: RoomUserWhereUniqueInput | RoomUserWhereUniqueInput[]
    update?: RoomUserUpdateWithWhereUniqueWithoutRoomInput | RoomUserUpdateWithWhereUniqueWithoutRoomInput[]
    updateMany?: RoomUserUpdateManyWithWhereWithoutRoomInput | RoomUserUpdateManyWithWhereWithoutRoomInput[]
    deleteMany?: RoomUserScalarWhereInput | RoomUserScalarWhereInput[]
  }

  export type RoomCreateNestedOneWithoutUsersInput = {
    create?: XOR<RoomCreateWithoutUsersInput, RoomUncheckedCreateWithoutUsersInput>
    connectOrCreate?: RoomCreateOrConnectWithoutUsersInput
    connect?: RoomWhereUniqueInput
  }

  export type UserCreateNestedOneWithoutJoinedRoomsInput = {
    create?: XOR<UserCreateWithoutJoinedRoomsInput, UserUncheckedCreateWithoutJoinedRoomsInput>
    connectOrCreate?: UserCreateOrConnectWithoutJoinedRoomsInput
    connect?: UserWhereUniqueInput
  }

  export type RoomUpdateOneRequiredWithoutUsersNestedInput = {
    create?: XOR<RoomCreateWithoutUsersInput, RoomUncheckedCreateWithoutUsersInput>
    connectOrCreate?: RoomCreateOrConnectWithoutUsersInput
    upsert?: RoomUpsertWithoutUsersInput
    connect?: RoomWhereUniqueInput
    update?: XOR<XOR<RoomUpdateToOneWithWhereWithoutUsersInput, RoomUpdateWithoutUsersInput>, RoomUncheckedUpdateWithoutUsersInput>
  }

  export type UserUpdateOneRequiredWithoutJoinedRoomsNestedInput = {
    create?: XOR<UserCreateWithoutJoinedRoomsInput, UserUncheckedCreateWithoutJoinedRoomsInput>
    connectOrCreate?: UserCreateOrConnectWithoutJoinedRoomsInput
    upsert?: UserUpsertWithoutJoinedRoomsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutJoinedRoomsInput, UserUpdateWithoutJoinedRoomsInput>, UserUncheckedUpdateWithoutJoinedRoomsInput>
  }

  export type UserCreateNestedOneWithoutUserIDPsInput = {
    create?: XOR<UserCreateWithoutUserIDPsInput, UserUncheckedCreateWithoutUserIDPsInput>
    connectOrCreate?: UserCreateOrConnectWithoutUserIDPsInput
    connect?: UserWhereUniqueInput
  }

  export type UserUpdateOneRequiredWithoutUserIDPsNestedInput = {
    create?: XOR<UserCreateWithoutUserIDPsInput, UserUncheckedCreateWithoutUserIDPsInput>
    connectOrCreate?: UserCreateOrConnectWithoutUserIDPsInput
    upsert?: UserUpsertWithoutUserIDPsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutUserIDPsInput, UserUpdateWithoutUserIDPsInput>, UserUncheckedUpdateWithoutUserIDPsInput>
  }

  export type UserCreateNestedOneWithoutError_eventsInput = {
    create?: XOR<UserCreateWithoutError_eventsInput, UserUncheckedCreateWithoutError_eventsInput>
    connectOrCreate?: UserCreateOrConnectWithoutError_eventsInput
    connect?: UserWhereUniqueInput
  }

  export type matchesCreateNestedOneWithoutError_eventsInput = {
    create?: XOR<matchesCreateWithoutError_eventsInput, matchesUncheckedCreateWithoutError_eventsInput>
    connectOrCreate?: matchesCreateOrConnectWithoutError_eventsInput
    connect?: matchesWhereUniqueInput
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type UserUpdateOneWithoutError_eventsNestedInput = {
    create?: XOR<UserCreateWithoutError_eventsInput, UserUncheckedCreateWithoutError_eventsInput>
    connectOrCreate?: UserCreateOrConnectWithoutError_eventsInput
    upsert?: UserUpsertWithoutError_eventsInput
    disconnect?: UserWhereInput | boolean
    delete?: UserWhereInput | boolean
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutError_eventsInput, UserUpdateWithoutError_eventsInput>, UserUncheckedUpdateWithoutError_eventsInput>
  }

  export type matchesUpdateOneRequiredWithoutError_eventsNestedInput = {
    create?: XOR<matchesCreateWithoutError_eventsInput, matchesUncheckedCreateWithoutError_eventsInput>
    connectOrCreate?: matchesCreateOrConnectWithoutError_eventsInput
    upsert?: matchesUpsertWithoutError_eventsInput
    connect?: matchesWhereUniqueInput
    update?: XOR<XOR<matchesUpdateToOneWithWhereWithoutError_eventsInput, matchesUpdateWithoutError_eventsInput>, matchesUncheckedUpdateWithoutError_eventsInput>
  }

  export type error_eventsCreateNestedManyWithoutMatchesInput = {
    create?: XOR<error_eventsCreateWithoutMatchesInput, error_eventsUncheckedCreateWithoutMatchesInput> | error_eventsCreateWithoutMatchesInput[] | error_eventsUncheckedCreateWithoutMatchesInput[]
    connectOrCreate?: error_eventsCreateOrConnectWithoutMatchesInput | error_eventsCreateOrConnectWithoutMatchesInput[]
    createMany?: error_eventsCreateManyMatchesInputEnvelope
    connect?: error_eventsWhereUniqueInput | error_eventsWhereUniqueInput[]
  }

  export type RoomCreateNestedOneWithoutMatchesInput = {
    create?: XOR<RoomCreateWithoutMatchesInput, RoomUncheckedCreateWithoutMatchesInput>
    connectOrCreate?: RoomCreateOrConnectWithoutMatchesInput
    connect?: RoomWhereUniqueInput
  }

  export type UserCreateNestedOneWithoutMatchesInput = {
    create?: XOR<UserCreateWithoutMatchesInput, UserUncheckedCreateWithoutMatchesInput>
    connectOrCreate?: UserCreateOrConnectWithoutMatchesInput
    connect?: UserWhereUniqueInput
  }

  export type error_eventsUncheckedCreateNestedManyWithoutMatchesInput = {
    create?: XOR<error_eventsCreateWithoutMatchesInput, error_eventsUncheckedCreateWithoutMatchesInput> | error_eventsCreateWithoutMatchesInput[] | error_eventsUncheckedCreateWithoutMatchesInput[]
    connectOrCreate?: error_eventsCreateOrConnectWithoutMatchesInput | error_eventsCreateOrConnectWithoutMatchesInput[]
    createMany?: error_eventsCreateManyMatchesInputEnvelope
    connect?: error_eventsWhereUniqueInput | error_eventsWhereUniqueInput[]
  }

  export type error_eventsUpdateManyWithoutMatchesNestedInput = {
    create?: XOR<error_eventsCreateWithoutMatchesInput, error_eventsUncheckedCreateWithoutMatchesInput> | error_eventsCreateWithoutMatchesInput[] | error_eventsUncheckedCreateWithoutMatchesInput[]
    connectOrCreate?: error_eventsCreateOrConnectWithoutMatchesInput | error_eventsCreateOrConnectWithoutMatchesInput[]
    upsert?: error_eventsUpsertWithWhereUniqueWithoutMatchesInput | error_eventsUpsertWithWhereUniqueWithoutMatchesInput[]
    createMany?: error_eventsCreateManyMatchesInputEnvelope
    set?: error_eventsWhereUniqueInput | error_eventsWhereUniqueInput[]
    disconnect?: error_eventsWhereUniqueInput | error_eventsWhereUniqueInput[]
    delete?: error_eventsWhereUniqueInput | error_eventsWhereUniqueInput[]
    connect?: error_eventsWhereUniqueInput | error_eventsWhereUniqueInput[]
    update?: error_eventsUpdateWithWhereUniqueWithoutMatchesInput | error_eventsUpdateWithWhereUniqueWithoutMatchesInput[]
    updateMany?: error_eventsUpdateManyWithWhereWithoutMatchesInput | error_eventsUpdateManyWithWhereWithoutMatchesInput[]
    deleteMany?: error_eventsScalarWhereInput | error_eventsScalarWhereInput[]
  }

  export type RoomUpdateOneRequiredWithoutMatchesNestedInput = {
    create?: XOR<RoomCreateWithoutMatchesInput, RoomUncheckedCreateWithoutMatchesInput>
    connectOrCreate?: RoomCreateOrConnectWithoutMatchesInput
    upsert?: RoomUpsertWithoutMatchesInput
    connect?: RoomWhereUniqueInput
    update?: XOR<XOR<RoomUpdateToOneWithWhereWithoutMatchesInput, RoomUpdateWithoutMatchesInput>, RoomUncheckedUpdateWithoutMatchesInput>
  }

  export type UserUpdateOneWithoutMatchesNestedInput = {
    create?: XOR<UserCreateWithoutMatchesInput, UserUncheckedCreateWithoutMatchesInput>
    connectOrCreate?: UserCreateOrConnectWithoutMatchesInput
    upsert?: UserUpsertWithoutMatchesInput
    disconnect?: UserWhereInput | boolean
    delete?: UserWhereInput | boolean
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutMatchesInput, UserUpdateWithoutMatchesInput>, UserUncheckedUpdateWithoutMatchesInput>
  }

  export type error_eventsUncheckedUpdateManyWithoutMatchesNestedInput = {
    create?: XOR<error_eventsCreateWithoutMatchesInput, error_eventsUncheckedCreateWithoutMatchesInput> | error_eventsCreateWithoutMatchesInput[] | error_eventsUncheckedCreateWithoutMatchesInput[]
    connectOrCreate?: error_eventsCreateOrConnectWithoutMatchesInput | error_eventsCreateOrConnectWithoutMatchesInput[]
    upsert?: error_eventsUpsertWithWhereUniqueWithoutMatchesInput | error_eventsUpsertWithWhereUniqueWithoutMatchesInput[]
    createMany?: error_eventsCreateManyMatchesInputEnvelope
    set?: error_eventsWhereUniqueInput | error_eventsWhereUniqueInput[]
    disconnect?: error_eventsWhereUniqueInput | error_eventsWhereUniqueInput[]
    delete?: error_eventsWhereUniqueInput | error_eventsWhereUniqueInput[]
    connect?: error_eventsWhereUniqueInput | error_eventsWhereUniqueInput[]
    update?: error_eventsUpdateWithWhereUniqueWithoutMatchesInput | error_eventsUpdateWithWhereUniqueWithoutMatchesInput[]
    updateMany?: error_eventsUpdateManyWithWhereWithoutMatchesInput | error_eventsUpdateManyWithWhereWithoutMatchesInput[]
    deleteMany?: error_eventsScalarWhereInput | error_eventsScalarWhereInput[]
  }

  export type NestedUuidFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedUuidFilter<$PrismaModel> | string
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedUuidWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedUuidWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedUuidNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedUuidNullableFilter<$PrismaModel> | string | null
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedEnumRoomStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.RoomStatus | EnumRoomStatusFieldRefInput<$PrismaModel>
    in?: $Enums.RoomStatus[] | ListEnumRoomStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.RoomStatus[] | ListEnumRoomStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumRoomStatusFilter<$PrismaModel> | $Enums.RoomStatus
  }

  export type NestedUuidNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedUuidNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedEnumRoomStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.RoomStatus | EnumRoomStatusFieldRefInput<$PrismaModel>
    in?: $Enums.RoomStatus[] | ListEnumRoomStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.RoomStatus[] | ListEnumRoomStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumRoomStatusWithAggregatesFilter<$PrismaModel> | $Enums.RoomStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumRoomStatusFilter<$PrismaModel>
    _max?: NestedEnumRoomStatusFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type error_eventsCreateWithoutUsersInput = {
    id?: string
    appearance_at: Date | string
    closed_at?: Date | string | null
    matches: matchesCreateNestedOneWithoutError_eventsInput
  }

  export type error_eventsUncheckedCreateWithoutUsersInput = {
    id?: string
    match_id: string
    appearance_at: Date | string
    closed_at?: Date | string | null
  }

  export type error_eventsCreateOrConnectWithoutUsersInput = {
    where: error_eventsWhereUniqueInput
    create: XOR<error_eventsCreateWithoutUsersInput, error_eventsUncheckedCreateWithoutUsersInput>
  }

  export type error_eventsCreateManyUsersInputEnvelope = {
    data: error_eventsCreateManyUsersInput | error_eventsCreateManyUsersInput[]
    skipDuplicates?: boolean
  }

  export type matchesCreateWithoutUsersInput = {
    id?: string
    game_type: string
    status?: string
    created_at?: Date | string
    error_events?: error_eventsCreateNestedManyWithoutMatchesInput
    rooms: RoomCreateNestedOneWithoutMatchesInput
  }

  export type matchesUncheckedCreateWithoutUsersInput = {
    id?: string
    room_id: string
    game_type: string
    status?: string
    created_at?: Date | string
    error_events?: error_eventsUncheckedCreateNestedManyWithoutMatchesInput
  }

  export type matchesCreateOrConnectWithoutUsersInput = {
    where: matchesWhereUniqueInput
    create: XOR<matchesCreateWithoutUsersInput, matchesUncheckedCreateWithoutUsersInput>
  }

  export type matchesCreateManyUsersInputEnvelope = {
    data: matchesCreateManyUsersInput | matchesCreateManyUsersInput[]
    skipDuplicates?: boolean
  }

  export type RoomUserCreateWithoutUserInput = {
    id?: string
    createdAt?: Date | string
    room: RoomCreateNestedOneWithoutUsersInput
  }

  export type RoomUserUncheckedCreateWithoutUserInput = {
    id?: string
    roomId: string
    createdAt?: Date | string
  }

  export type RoomUserCreateOrConnectWithoutUserInput = {
    where: RoomUserWhereUniqueInput
    create: XOR<RoomUserCreateWithoutUserInput, RoomUserUncheckedCreateWithoutUserInput>
  }

  export type RoomUserCreateManyUserInputEnvelope = {
    data: RoomUserCreateManyUserInput | RoomUserCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type RoomCreateWithoutCreatorInput = {
    id?: string
    name: string
    createdAt?: Date | string
    current_match_id?: string | null
    activeGameType?: string | null
    status?: $Enums.RoomStatus
    matches?: matchesCreateNestedManyWithoutRoomsInput
    users?: RoomUserCreateNestedManyWithoutRoomInput
  }

  export type RoomUncheckedCreateWithoutCreatorInput = {
    id?: string
    name: string
    createdAt?: Date | string
    current_match_id?: string | null
    activeGameType?: string | null
    status?: $Enums.RoomStatus
    matches?: matchesUncheckedCreateNestedManyWithoutRoomsInput
    users?: RoomUserUncheckedCreateNestedManyWithoutRoomInput
  }

  export type RoomCreateOrConnectWithoutCreatorInput = {
    where: RoomWhereUniqueInput
    create: XOR<RoomCreateWithoutCreatorInput, RoomUncheckedCreateWithoutCreatorInput>
  }

  export type RoomCreateManyCreatorInputEnvelope = {
    data: RoomCreateManyCreatorInput | RoomCreateManyCreatorInput[]
    skipDuplicates?: boolean
  }

  export type UserIDPCreateWithoutUserInput = {
    id?: string
    supabaseUid: string
  }

  export type UserIDPUncheckedCreateWithoutUserInput = {
    id?: string
    supabaseUid: string
  }

  export type UserIDPCreateOrConnectWithoutUserInput = {
    where: UserIDPWhereUniqueInput
    create: XOR<UserIDPCreateWithoutUserInput, UserIDPUncheckedCreateWithoutUserInput>
  }

  export type UserIDPCreateManyUserInputEnvelope = {
    data: UserIDPCreateManyUserInput | UserIDPCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type error_eventsUpsertWithWhereUniqueWithoutUsersInput = {
    where: error_eventsWhereUniqueInput
    update: XOR<error_eventsUpdateWithoutUsersInput, error_eventsUncheckedUpdateWithoutUsersInput>
    create: XOR<error_eventsCreateWithoutUsersInput, error_eventsUncheckedCreateWithoutUsersInput>
  }

  export type error_eventsUpdateWithWhereUniqueWithoutUsersInput = {
    where: error_eventsWhereUniqueInput
    data: XOR<error_eventsUpdateWithoutUsersInput, error_eventsUncheckedUpdateWithoutUsersInput>
  }

  export type error_eventsUpdateManyWithWhereWithoutUsersInput = {
    where: error_eventsScalarWhereInput
    data: XOR<error_eventsUpdateManyMutationInput, error_eventsUncheckedUpdateManyWithoutUsersInput>
  }

  export type error_eventsScalarWhereInput = {
    AND?: error_eventsScalarWhereInput | error_eventsScalarWhereInput[]
    OR?: error_eventsScalarWhereInput[]
    NOT?: error_eventsScalarWhereInput | error_eventsScalarWhereInput[]
    id?: UuidFilter<"error_events"> | string
    match_id?: UuidFilter<"error_events"> | string
    appearance_at?: DateTimeFilter<"error_events"> | Date | string
    closed_at?: DateTimeNullableFilter<"error_events"> | Date | string | null
    closed_by?: UuidNullableFilter<"error_events"> | string | null
  }

  export type matchesUpsertWithWhereUniqueWithoutUsersInput = {
    where: matchesWhereUniqueInput
    update: XOR<matchesUpdateWithoutUsersInput, matchesUncheckedUpdateWithoutUsersInput>
    create: XOR<matchesCreateWithoutUsersInput, matchesUncheckedCreateWithoutUsersInput>
  }

  export type matchesUpdateWithWhereUniqueWithoutUsersInput = {
    where: matchesWhereUniqueInput
    data: XOR<matchesUpdateWithoutUsersInput, matchesUncheckedUpdateWithoutUsersInput>
  }

  export type matchesUpdateManyWithWhereWithoutUsersInput = {
    where: matchesScalarWhereInput
    data: XOR<matchesUpdateManyMutationInput, matchesUncheckedUpdateManyWithoutUsersInput>
  }

  export type matchesScalarWhereInput = {
    AND?: matchesScalarWhereInput | matchesScalarWhereInput[]
    OR?: matchesScalarWhereInput[]
    NOT?: matchesScalarWhereInput | matchesScalarWhereInput[]
    id?: UuidFilter<"matches"> | string
    room_id?: UuidFilter<"matches"> | string
    game_type?: StringFilter<"matches"> | string
    status?: StringFilter<"matches"> | string
    winner_id?: UuidNullableFilter<"matches"> | string | null
    created_at?: DateTimeFilter<"matches"> | Date | string
  }

  export type RoomUserUpsertWithWhereUniqueWithoutUserInput = {
    where: RoomUserWhereUniqueInput
    update: XOR<RoomUserUpdateWithoutUserInput, RoomUserUncheckedUpdateWithoutUserInput>
    create: XOR<RoomUserCreateWithoutUserInput, RoomUserUncheckedCreateWithoutUserInput>
  }

  export type RoomUserUpdateWithWhereUniqueWithoutUserInput = {
    where: RoomUserWhereUniqueInput
    data: XOR<RoomUserUpdateWithoutUserInput, RoomUserUncheckedUpdateWithoutUserInput>
  }

  export type RoomUserUpdateManyWithWhereWithoutUserInput = {
    where: RoomUserScalarWhereInput
    data: XOR<RoomUserUpdateManyMutationInput, RoomUserUncheckedUpdateManyWithoutUserInput>
  }

  export type RoomUserScalarWhereInput = {
    AND?: RoomUserScalarWhereInput | RoomUserScalarWhereInput[]
    OR?: RoomUserScalarWhereInput[]
    NOT?: RoomUserScalarWhereInput | RoomUserScalarWhereInput[]
    id?: UuidFilter<"RoomUser"> | string
    roomId?: UuidFilter<"RoomUser"> | string
    userId?: UuidFilter<"RoomUser"> | string
    createdAt?: DateTimeFilter<"RoomUser"> | Date | string
  }

  export type RoomUpsertWithWhereUniqueWithoutCreatorInput = {
    where: RoomWhereUniqueInput
    update: XOR<RoomUpdateWithoutCreatorInput, RoomUncheckedUpdateWithoutCreatorInput>
    create: XOR<RoomCreateWithoutCreatorInput, RoomUncheckedCreateWithoutCreatorInput>
  }

  export type RoomUpdateWithWhereUniqueWithoutCreatorInput = {
    where: RoomWhereUniqueInput
    data: XOR<RoomUpdateWithoutCreatorInput, RoomUncheckedUpdateWithoutCreatorInput>
  }

  export type RoomUpdateManyWithWhereWithoutCreatorInput = {
    where: RoomScalarWhereInput
    data: XOR<RoomUpdateManyMutationInput, RoomUncheckedUpdateManyWithoutCreatorInput>
  }

  export type RoomScalarWhereInput = {
    AND?: RoomScalarWhereInput | RoomScalarWhereInput[]
    OR?: RoomScalarWhereInput[]
    NOT?: RoomScalarWhereInput | RoomScalarWhereInput[]
    id?: UuidFilter<"Room"> | string
    name?: StringFilter<"Room"> | string
    createdAt?: DateTimeFilter<"Room"> | Date | string
    createdBy?: UuidFilter<"Room"> | string
    current_match_id?: UuidNullableFilter<"Room"> | string | null
    activeGameType?: StringNullableFilter<"Room"> | string | null
    status?: EnumRoomStatusFilter<"Room"> | $Enums.RoomStatus
  }

  export type UserIDPUpsertWithWhereUniqueWithoutUserInput = {
    where: UserIDPWhereUniqueInput
    update: XOR<UserIDPUpdateWithoutUserInput, UserIDPUncheckedUpdateWithoutUserInput>
    create: XOR<UserIDPCreateWithoutUserInput, UserIDPUncheckedCreateWithoutUserInput>
  }

  export type UserIDPUpdateWithWhereUniqueWithoutUserInput = {
    where: UserIDPWhereUniqueInput
    data: XOR<UserIDPUpdateWithoutUserInput, UserIDPUncheckedUpdateWithoutUserInput>
  }

  export type UserIDPUpdateManyWithWhereWithoutUserInput = {
    where: UserIDPScalarWhereInput
    data: XOR<UserIDPUpdateManyMutationInput, UserIDPUncheckedUpdateManyWithoutUserInput>
  }

  export type UserIDPScalarWhereInput = {
    AND?: UserIDPScalarWhereInput | UserIDPScalarWhereInput[]
    OR?: UserIDPScalarWhereInput[]
    NOT?: UserIDPScalarWhereInput | UserIDPScalarWhereInput[]
    id?: UuidFilter<"UserIDP"> | string
    supabaseUid?: UuidFilter<"UserIDP"> | string
    userId?: UuidFilter<"UserIDP"> | string
  }

  export type matchesCreateWithoutRoomsInput = {
    id?: string
    game_type: string
    status?: string
    created_at?: Date | string
    error_events?: error_eventsCreateNestedManyWithoutMatchesInput
    users?: UserCreateNestedOneWithoutMatchesInput
  }

  export type matchesUncheckedCreateWithoutRoomsInput = {
    id?: string
    game_type: string
    status?: string
    winner_id?: string | null
    created_at?: Date | string
    error_events?: error_eventsUncheckedCreateNestedManyWithoutMatchesInput
  }

  export type matchesCreateOrConnectWithoutRoomsInput = {
    where: matchesWhereUniqueInput
    create: XOR<matchesCreateWithoutRoomsInput, matchesUncheckedCreateWithoutRoomsInput>
  }

  export type matchesCreateManyRoomsInputEnvelope = {
    data: matchesCreateManyRoomsInput | matchesCreateManyRoomsInput[]
    skipDuplicates?: boolean
  }

  export type RoomUserCreateWithoutRoomInput = {
    id?: string
    createdAt?: Date | string
    user: UserCreateNestedOneWithoutJoinedRoomsInput
  }

  export type RoomUserUncheckedCreateWithoutRoomInput = {
    id?: string
    userId: string
    createdAt?: Date | string
  }

  export type RoomUserCreateOrConnectWithoutRoomInput = {
    where: RoomUserWhereUniqueInput
    create: XOR<RoomUserCreateWithoutRoomInput, RoomUserUncheckedCreateWithoutRoomInput>
  }

  export type RoomUserCreateManyRoomInputEnvelope = {
    data: RoomUserCreateManyRoomInput | RoomUserCreateManyRoomInput[]
    skipDuplicates?: boolean
  }

  export type UserCreateWithoutCreatedRoomsInput = {
    id?: string
    name: string
    email: string
    createdAt?: Date | string
    error_events?: error_eventsCreateNestedManyWithoutUsersInput
    matches?: matchesCreateNestedManyWithoutUsersInput
    joinedRooms?: RoomUserCreateNestedManyWithoutUserInput
    userIDPs?: UserIDPCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutCreatedRoomsInput = {
    id?: string
    name: string
    email: string
    createdAt?: Date | string
    error_events?: error_eventsUncheckedCreateNestedManyWithoutUsersInput
    matches?: matchesUncheckedCreateNestedManyWithoutUsersInput
    joinedRooms?: RoomUserUncheckedCreateNestedManyWithoutUserInput
    userIDPs?: UserIDPUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutCreatedRoomsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutCreatedRoomsInput, UserUncheckedCreateWithoutCreatedRoomsInput>
  }

  export type matchesUpsertWithWhereUniqueWithoutRoomsInput = {
    where: matchesWhereUniqueInput
    update: XOR<matchesUpdateWithoutRoomsInput, matchesUncheckedUpdateWithoutRoomsInput>
    create: XOR<matchesCreateWithoutRoomsInput, matchesUncheckedCreateWithoutRoomsInput>
  }

  export type matchesUpdateWithWhereUniqueWithoutRoomsInput = {
    where: matchesWhereUniqueInput
    data: XOR<matchesUpdateWithoutRoomsInput, matchesUncheckedUpdateWithoutRoomsInput>
  }

  export type matchesUpdateManyWithWhereWithoutRoomsInput = {
    where: matchesScalarWhereInput
    data: XOR<matchesUpdateManyMutationInput, matchesUncheckedUpdateManyWithoutRoomsInput>
  }

  export type RoomUserUpsertWithWhereUniqueWithoutRoomInput = {
    where: RoomUserWhereUniqueInput
    update: XOR<RoomUserUpdateWithoutRoomInput, RoomUserUncheckedUpdateWithoutRoomInput>
    create: XOR<RoomUserCreateWithoutRoomInput, RoomUserUncheckedCreateWithoutRoomInput>
  }

  export type RoomUserUpdateWithWhereUniqueWithoutRoomInput = {
    where: RoomUserWhereUniqueInput
    data: XOR<RoomUserUpdateWithoutRoomInput, RoomUserUncheckedUpdateWithoutRoomInput>
  }

  export type RoomUserUpdateManyWithWhereWithoutRoomInput = {
    where: RoomUserScalarWhereInput
    data: XOR<RoomUserUpdateManyMutationInput, RoomUserUncheckedUpdateManyWithoutRoomInput>
  }

  export type UserUpsertWithoutCreatedRoomsInput = {
    update: XOR<UserUpdateWithoutCreatedRoomsInput, UserUncheckedUpdateWithoutCreatedRoomsInput>
    create: XOR<UserCreateWithoutCreatedRoomsInput, UserUncheckedCreateWithoutCreatedRoomsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutCreatedRoomsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutCreatedRoomsInput, UserUncheckedUpdateWithoutCreatedRoomsInput>
  }

  export type UserUpdateWithoutCreatedRoomsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    error_events?: error_eventsUpdateManyWithoutUsersNestedInput
    matches?: matchesUpdateManyWithoutUsersNestedInput
    joinedRooms?: RoomUserUpdateManyWithoutUserNestedInput
    userIDPs?: UserIDPUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutCreatedRoomsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    error_events?: error_eventsUncheckedUpdateManyWithoutUsersNestedInput
    matches?: matchesUncheckedUpdateManyWithoutUsersNestedInput
    joinedRooms?: RoomUserUncheckedUpdateManyWithoutUserNestedInput
    userIDPs?: UserIDPUncheckedUpdateManyWithoutUserNestedInput
  }

  export type RoomCreateWithoutUsersInput = {
    id?: string
    name: string
    createdAt?: Date | string
    current_match_id?: string | null
    activeGameType?: string | null
    status?: $Enums.RoomStatus
    matches?: matchesCreateNestedManyWithoutRoomsInput
    creator: UserCreateNestedOneWithoutCreatedRoomsInput
  }

  export type RoomUncheckedCreateWithoutUsersInput = {
    id?: string
    name: string
    createdAt?: Date | string
    createdBy: string
    current_match_id?: string | null
    activeGameType?: string | null
    status?: $Enums.RoomStatus
    matches?: matchesUncheckedCreateNestedManyWithoutRoomsInput
  }

  export type RoomCreateOrConnectWithoutUsersInput = {
    where: RoomWhereUniqueInput
    create: XOR<RoomCreateWithoutUsersInput, RoomUncheckedCreateWithoutUsersInput>
  }

  export type UserCreateWithoutJoinedRoomsInput = {
    id?: string
    name: string
    email: string
    createdAt?: Date | string
    error_events?: error_eventsCreateNestedManyWithoutUsersInput
    matches?: matchesCreateNestedManyWithoutUsersInput
    createdRooms?: RoomCreateNestedManyWithoutCreatorInput
    userIDPs?: UserIDPCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutJoinedRoomsInput = {
    id?: string
    name: string
    email: string
    createdAt?: Date | string
    error_events?: error_eventsUncheckedCreateNestedManyWithoutUsersInput
    matches?: matchesUncheckedCreateNestedManyWithoutUsersInput
    createdRooms?: RoomUncheckedCreateNestedManyWithoutCreatorInput
    userIDPs?: UserIDPUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutJoinedRoomsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutJoinedRoomsInput, UserUncheckedCreateWithoutJoinedRoomsInput>
  }

  export type RoomUpsertWithoutUsersInput = {
    update: XOR<RoomUpdateWithoutUsersInput, RoomUncheckedUpdateWithoutUsersInput>
    create: XOR<RoomCreateWithoutUsersInput, RoomUncheckedCreateWithoutUsersInput>
    where?: RoomWhereInput
  }

  export type RoomUpdateToOneWithWhereWithoutUsersInput = {
    where?: RoomWhereInput
    data: XOR<RoomUpdateWithoutUsersInput, RoomUncheckedUpdateWithoutUsersInput>
  }

  export type RoomUpdateWithoutUsersInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    current_match_id?: NullableStringFieldUpdateOperationsInput | string | null
    activeGameType?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumRoomStatusFieldUpdateOperationsInput | $Enums.RoomStatus
    matches?: matchesUpdateManyWithoutRoomsNestedInput
    creator?: UserUpdateOneRequiredWithoutCreatedRoomsNestedInput
  }

  export type RoomUncheckedUpdateWithoutUsersInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: StringFieldUpdateOperationsInput | string
    current_match_id?: NullableStringFieldUpdateOperationsInput | string | null
    activeGameType?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumRoomStatusFieldUpdateOperationsInput | $Enums.RoomStatus
    matches?: matchesUncheckedUpdateManyWithoutRoomsNestedInput
  }

  export type UserUpsertWithoutJoinedRoomsInput = {
    update: XOR<UserUpdateWithoutJoinedRoomsInput, UserUncheckedUpdateWithoutJoinedRoomsInput>
    create: XOR<UserCreateWithoutJoinedRoomsInput, UserUncheckedCreateWithoutJoinedRoomsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutJoinedRoomsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutJoinedRoomsInput, UserUncheckedUpdateWithoutJoinedRoomsInput>
  }

  export type UserUpdateWithoutJoinedRoomsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    error_events?: error_eventsUpdateManyWithoutUsersNestedInput
    matches?: matchesUpdateManyWithoutUsersNestedInput
    createdRooms?: RoomUpdateManyWithoutCreatorNestedInput
    userIDPs?: UserIDPUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutJoinedRoomsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    error_events?: error_eventsUncheckedUpdateManyWithoutUsersNestedInput
    matches?: matchesUncheckedUpdateManyWithoutUsersNestedInput
    createdRooms?: RoomUncheckedUpdateManyWithoutCreatorNestedInput
    userIDPs?: UserIDPUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateWithoutUserIDPsInput = {
    id?: string
    name: string
    email: string
    createdAt?: Date | string
    error_events?: error_eventsCreateNestedManyWithoutUsersInput
    matches?: matchesCreateNestedManyWithoutUsersInput
    joinedRooms?: RoomUserCreateNestedManyWithoutUserInput
    createdRooms?: RoomCreateNestedManyWithoutCreatorInput
  }

  export type UserUncheckedCreateWithoutUserIDPsInput = {
    id?: string
    name: string
    email: string
    createdAt?: Date | string
    error_events?: error_eventsUncheckedCreateNestedManyWithoutUsersInput
    matches?: matchesUncheckedCreateNestedManyWithoutUsersInput
    joinedRooms?: RoomUserUncheckedCreateNestedManyWithoutUserInput
    createdRooms?: RoomUncheckedCreateNestedManyWithoutCreatorInput
  }

  export type UserCreateOrConnectWithoutUserIDPsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutUserIDPsInput, UserUncheckedCreateWithoutUserIDPsInput>
  }

  export type UserUpsertWithoutUserIDPsInput = {
    update: XOR<UserUpdateWithoutUserIDPsInput, UserUncheckedUpdateWithoutUserIDPsInput>
    create: XOR<UserCreateWithoutUserIDPsInput, UserUncheckedCreateWithoutUserIDPsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutUserIDPsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutUserIDPsInput, UserUncheckedUpdateWithoutUserIDPsInput>
  }

  export type UserUpdateWithoutUserIDPsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    error_events?: error_eventsUpdateManyWithoutUsersNestedInput
    matches?: matchesUpdateManyWithoutUsersNestedInput
    joinedRooms?: RoomUserUpdateManyWithoutUserNestedInput
    createdRooms?: RoomUpdateManyWithoutCreatorNestedInput
  }

  export type UserUncheckedUpdateWithoutUserIDPsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    error_events?: error_eventsUncheckedUpdateManyWithoutUsersNestedInput
    matches?: matchesUncheckedUpdateManyWithoutUsersNestedInput
    joinedRooms?: RoomUserUncheckedUpdateManyWithoutUserNestedInput
    createdRooms?: RoomUncheckedUpdateManyWithoutCreatorNestedInput
  }

  export type UserCreateWithoutError_eventsInput = {
    id?: string
    name: string
    email: string
    createdAt?: Date | string
    matches?: matchesCreateNestedManyWithoutUsersInput
    joinedRooms?: RoomUserCreateNestedManyWithoutUserInput
    createdRooms?: RoomCreateNestedManyWithoutCreatorInput
    userIDPs?: UserIDPCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutError_eventsInput = {
    id?: string
    name: string
    email: string
    createdAt?: Date | string
    matches?: matchesUncheckedCreateNestedManyWithoutUsersInput
    joinedRooms?: RoomUserUncheckedCreateNestedManyWithoutUserInput
    createdRooms?: RoomUncheckedCreateNestedManyWithoutCreatorInput
    userIDPs?: UserIDPUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutError_eventsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutError_eventsInput, UserUncheckedCreateWithoutError_eventsInput>
  }

  export type matchesCreateWithoutError_eventsInput = {
    id?: string
    game_type: string
    status?: string
    created_at?: Date | string
    rooms: RoomCreateNestedOneWithoutMatchesInput
    users?: UserCreateNestedOneWithoutMatchesInput
  }

  export type matchesUncheckedCreateWithoutError_eventsInput = {
    id?: string
    room_id: string
    game_type: string
    status?: string
    winner_id?: string | null
    created_at?: Date | string
  }

  export type matchesCreateOrConnectWithoutError_eventsInput = {
    where: matchesWhereUniqueInput
    create: XOR<matchesCreateWithoutError_eventsInput, matchesUncheckedCreateWithoutError_eventsInput>
  }

  export type UserUpsertWithoutError_eventsInput = {
    update: XOR<UserUpdateWithoutError_eventsInput, UserUncheckedUpdateWithoutError_eventsInput>
    create: XOR<UserCreateWithoutError_eventsInput, UserUncheckedCreateWithoutError_eventsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutError_eventsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutError_eventsInput, UserUncheckedUpdateWithoutError_eventsInput>
  }

  export type UserUpdateWithoutError_eventsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    matches?: matchesUpdateManyWithoutUsersNestedInput
    joinedRooms?: RoomUserUpdateManyWithoutUserNestedInput
    createdRooms?: RoomUpdateManyWithoutCreatorNestedInput
    userIDPs?: UserIDPUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutError_eventsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    matches?: matchesUncheckedUpdateManyWithoutUsersNestedInput
    joinedRooms?: RoomUserUncheckedUpdateManyWithoutUserNestedInput
    createdRooms?: RoomUncheckedUpdateManyWithoutCreatorNestedInput
    userIDPs?: UserIDPUncheckedUpdateManyWithoutUserNestedInput
  }

  export type matchesUpsertWithoutError_eventsInput = {
    update: XOR<matchesUpdateWithoutError_eventsInput, matchesUncheckedUpdateWithoutError_eventsInput>
    create: XOR<matchesCreateWithoutError_eventsInput, matchesUncheckedCreateWithoutError_eventsInput>
    where?: matchesWhereInput
  }

  export type matchesUpdateToOneWithWhereWithoutError_eventsInput = {
    where?: matchesWhereInput
    data: XOR<matchesUpdateWithoutError_eventsInput, matchesUncheckedUpdateWithoutError_eventsInput>
  }

  export type matchesUpdateWithoutError_eventsInput = {
    id?: StringFieldUpdateOperationsInput | string
    game_type?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    rooms?: RoomUpdateOneRequiredWithoutMatchesNestedInput
    users?: UserUpdateOneWithoutMatchesNestedInput
  }

  export type matchesUncheckedUpdateWithoutError_eventsInput = {
    id?: StringFieldUpdateOperationsInput | string
    room_id?: StringFieldUpdateOperationsInput | string
    game_type?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    winner_id?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type error_eventsCreateWithoutMatchesInput = {
    id?: string
    appearance_at: Date | string
    closed_at?: Date | string | null
    users?: UserCreateNestedOneWithoutError_eventsInput
  }

  export type error_eventsUncheckedCreateWithoutMatchesInput = {
    id?: string
    appearance_at: Date | string
    closed_at?: Date | string | null
    closed_by?: string | null
  }

  export type error_eventsCreateOrConnectWithoutMatchesInput = {
    where: error_eventsWhereUniqueInput
    create: XOR<error_eventsCreateWithoutMatchesInput, error_eventsUncheckedCreateWithoutMatchesInput>
  }

  export type error_eventsCreateManyMatchesInputEnvelope = {
    data: error_eventsCreateManyMatchesInput | error_eventsCreateManyMatchesInput[]
    skipDuplicates?: boolean
  }

  export type RoomCreateWithoutMatchesInput = {
    id?: string
    name: string
    createdAt?: Date | string
    current_match_id?: string | null
    activeGameType?: string | null
    status?: $Enums.RoomStatus
    users?: RoomUserCreateNestedManyWithoutRoomInput
    creator: UserCreateNestedOneWithoutCreatedRoomsInput
  }

  export type RoomUncheckedCreateWithoutMatchesInput = {
    id?: string
    name: string
    createdAt?: Date | string
    createdBy: string
    current_match_id?: string | null
    activeGameType?: string | null
    status?: $Enums.RoomStatus
    users?: RoomUserUncheckedCreateNestedManyWithoutRoomInput
  }

  export type RoomCreateOrConnectWithoutMatchesInput = {
    where: RoomWhereUniqueInput
    create: XOR<RoomCreateWithoutMatchesInput, RoomUncheckedCreateWithoutMatchesInput>
  }

  export type UserCreateWithoutMatchesInput = {
    id?: string
    name: string
    email: string
    createdAt?: Date | string
    error_events?: error_eventsCreateNestedManyWithoutUsersInput
    joinedRooms?: RoomUserCreateNestedManyWithoutUserInput
    createdRooms?: RoomCreateNestedManyWithoutCreatorInput
    userIDPs?: UserIDPCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutMatchesInput = {
    id?: string
    name: string
    email: string
    createdAt?: Date | string
    error_events?: error_eventsUncheckedCreateNestedManyWithoutUsersInput
    joinedRooms?: RoomUserUncheckedCreateNestedManyWithoutUserInput
    createdRooms?: RoomUncheckedCreateNestedManyWithoutCreatorInput
    userIDPs?: UserIDPUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutMatchesInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutMatchesInput, UserUncheckedCreateWithoutMatchesInput>
  }

  export type error_eventsUpsertWithWhereUniqueWithoutMatchesInput = {
    where: error_eventsWhereUniqueInput
    update: XOR<error_eventsUpdateWithoutMatchesInput, error_eventsUncheckedUpdateWithoutMatchesInput>
    create: XOR<error_eventsCreateWithoutMatchesInput, error_eventsUncheckedCreateWithoutMatchesInput>
  }

  export type error_eventsUpdateWithWhereUniqueWithoutMatchesInput = {
    where: error_eventsWhereUniqueInput
    data: XOR<error_eventsUpdateWithoutMatchesInput, error_eventsUncheckedUpdateWithoutMatchesInput>
  }

  export type error_eventsUpdateManyWithWhereWithoutMatchesInput = {
    where: error_eventsScalarWhereInput
    data: XOR<error_eventsUpdateManyMutationInput, error_eventsUncheckedUpdateManyWithoutMatchesInput>
  }

  export type RoomUpsertWithoutMatchesInput = {
    update: XOR<RoomUpdateWithoutMatchesInput, RoomUncheckedUpdateWithoutMatchesInput>
    create: XOR<RoomCreateWithoutMatchesInput, RoomUncheckedCreateWithoutMatchesInput>
    where?: RoomWhereInput
  }

  export type RoomUpdateToOneWithWhereWithoutMatchesInput = {
    where?: RoomWhereInput
    data: XOR<RoomUpdateWithoutMatchesInput, RoomUncheckedUpdateWithoutMatchesInput>
  }

  export type RoomUpdateWithoutMatchesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    current_match_id?: NullableStringFieldUpdateOperationsInput | string | null
    activeGameType?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumRoomStatusFieldUpdateOperationsInput | $Enums.RoomStatus
    users?: RoomUserUpdateManyWithoutRoomNestedInput
    creator?: UserUpdateOneRequiredWithoutCreatedRoomsNestedInput
  }

  export type RoomUncheckedUpdateWithoutMatchesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: StringFieldUpdateOperationsInput | string
    current_match_id?: NullableStringFieldUpdateOperationsInput | string | null
    activeGameType?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumRoomStatusFieldUpdateOperationsInput | $Enums.RoomStatus
    users?: RoomUserUncheckedUpdateManyWithoutRoomNestedInput
  }

  export type UserUpsertWithoutMatchesInput = {
    update: XOR<UserUpdateWithoutMatchesInput, UserUncheckedUpdateWithoutMatchesInput>
    create: XOR<UserCreateWithoutMatchesInput, UserUncheckedCreateWithoutMatchesInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutMatchesInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutMatchesInput, UserUncheckedUpdateWithoutMatchesInput>
  }

  export type UserUpdateWithoutMatchesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    error_events?: error_eventsUpdateManyWithoutUsersNestedInput
    joinedRooms?: RoomUserUpdateManyWithoutUserNestedInput
    createdRooms?: RoomUpdateManyWithoutCreatorNestedInput
    userIDPs?: UserIDPUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutMatchesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    error_events?: error_eventsUncheckedUpdateManyWithoutUsersNestedInput
    joinedRooms?: RoomUserUncheckedUpdateManyWithoutUserNestedInput
    createdRooms?: RoomUncheckedUpdateManyWithoutCreatorNestedInput
    userIDPs?: UserIDPUncheckedUpdateManyWithoutUserNestedInput
  }

  export type error_eventsCreateManyUsersInput = {
    id?: string
    match_id: string
    appearance_at: Date | string
    closed_at?: Date | string | null
  }

  export type matchesCreateManyUsersInput = {
    id?: string
    room_id: string
    game_type: string
    status?: string
    created_at?: Date | string
  }

  export type RoomUserCreateManyUserInput = {
    id?: string
    roomId: string
    createdAt?: Date | string
  }

  export type RoomCreateManyCreatorInput = {
    id?: string
    name: string
    createdAt?: Date | string
    current_match_id?: string | null
    activeGameType?: string | null
    status?: $Enums.RoomStatus
  }

  export type UserIDPCreateManyUserInput = {
    id?: string
    supabaseUid: string
  }

  export type error_eventsUpdateWithoutUsersInput = {
    id?: StringFieldUpdateOperationsInput | string
    appearance_at?: DateTimeFieldUpdateOperationsInput | Date | string
    closed_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    matches?: matchesUpdateOneRequiredWithoutError_eventsNestedInput
  }

  export type error_eventsUncheckedUpdateWithoutUsersInput = {
    id?: StringFieldUpdateOperationsInput | string
    match_id?: StringFieldUpdateOperationsInput | string
    appearance_at?: DateTimeFieldUpdateOperationsInput | Date | string
    closed_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type error_eventsUncheckedUpdateManyWithoutUsersInput = {
    id?: StringFieldUpdateOperationsInput | string
    match_id?: StringFieldUpdateOperationsInput | string
    appearance_at?: DateTimeFieldUpdateOperationsInput | Date | string
    closed_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type matchesUpdateWithoutUsersInput = {
    id?: StringFieldUpdateOperationsInput | string
    game_type?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    error_events?: error_eventsUpdateManyWithoutMatchesNestedInput
    rooms?: RoomUpdateOneRequiredWithoutMatchesNestedInput
  }

  export type matchesUncheckedUpdateWithoutUsersInput = {
    id?: StringFieldUpdateOperationsInput | string
    room_id?: StringFieldUpdateOperationsInput | string
    game_type?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    error_events?: error_eventsUncheckedUpdateManyWithoutMatchesNestedInput
  }

  export type matchesUncheckedUpdateManyWithoutUsersInput = {
    id?: StringFieldUpdateOperationsInput | string
    room_id?: StringFieldUpdateOperationsInput | string
    game_type?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RoomUserUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    room?: RoomUpdateOneRequiredWithoutUsersNestedInput
  }

  export type RoomUserUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    roomId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RoomUserUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    roomId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RoomUpdateWithoutCreatorInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    current_match_id?: NullableStringFieldUpdateOperationsInput | string | null
    activeGameType?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumRoomStatusFieldUpdateOperationsInput | $Enums.RoomStatus
    matches?: matchesUpdateManyWithoutRoomsNestedInput
    users?: RoomUserUpdateManyWithoutRoomNestedInput
  }

  export type RoomUncheckedUpdateWithoutCreatorInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    current_match_id?: NullableStringFieldUpdateOperationsInput | string | null
    activeGameType?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumRoomStatusFieldUpdateOperationsInput | $Enums.RoomStatus
    matches?: matchesUncheckedUpdateManyWithoutRoomsNestedInput
    users?: RoomUserUncheckedUpdateManyWithoutRoomNestedInput
  }

  export type RoomUncheckedUpdateManyWithoutCreatorInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    current_match_id?: NullableStringFieldUpdateOperationsInput | string | null
    activeGameType?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumRoomStatusFieldUpdateOperationsInput | $Enums.RoomStatus
  }

  export type UserIDPUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    supabaseUid?: StringFieldUpdateOperationsInput | string
  }

  export type UserIDPUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    supabaseUid?: StringFieldUpdateOperationsInput | string
  }

  export type UserIDPUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    supabaseUid?: StringFieldUpdateOperationsInput | string
  }

  export type matchesCreateManyRoomsInput = {
    id?: string
    game_type: string
    status?: string
    winner_id?: string | null
    created_at?: Date | string
  }

  export type RoomUserCreateManyRoomInput = {
    id?: string
    userId: string
    createdAt?: Date | string
  }

  export type matchesUpdateWithoutRoomsInput = {
    id?: StringFieldUpdateOperationsInput | string
    game_type?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    error_events?: error_eventsUpdateManyWithoutMatchesNestedInput
    users?: UserUpdateOneWithoutMatchesNestedInput
  }

  export type matchesUncheckedUpdateWithoutRoomsInput = {
    id?: StringFieldUpdateOperationsInput | string
    game_type?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    winner_id?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    error_events?: error_eventsUncheckedUpdateManyWithoutMatchesNestedInput
  }

  export type matchesUncheckedUpdateManyWithoutRoomsInput = {
    id?: StringFieldUpdateOperationsInput | string
    game_type?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    winner_id?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RoomUserUpdateWithoutRoomInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutJoinedRoomsNestedInput
  }

  export type RoomUserUncheckedUpdateWithoutRoomInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RoomUserUncheckedUpdateManyWithoutRoomInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type error_eventsCreateManyMatchesInput = {
    id?: string
    appearance_at: Date | string
    closed_at?: Date | string | null
    closed_by?: string | null
  }

  export type error_eventsUpdateWithoutMatchesInput = {
    id?: StringFieldUpdateOperationsInput | string
    appearance_at?: DateTimeFieldUpdateOperationsInput | Date | string
    closed_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    users?: UserUpdateOneWithoutError_eventsNestedInput
  }

  export type error_eventsUncheckedUpdateWithoutMatchesInput = {
    id?: StringFieldUpdateOperationsInput | string
    appearance_at?: DateTimeFieldUpdateOperationsInput | Date | string
    closed_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    closed_by?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type error_eventsUncheckedUpdateManyWithoutMatchesInput = {
    id?: StringFieldUpdateOperationsInput | string
    appearance_at?: DateTimeFieldUpdateOperationsInput | Date | string
    closed_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    closed_by?: NullableStringFieldUpdateOperationsInput | string | null
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}