export type InferPhrase<T extends string> = T extends `${string}{{${infer Param}}}${infer Rest}`
  ? `${string}{{${Param}}}${InferPhrase<Rest>}`
  : string;

export type InferTranslation<T> = {
  [K in keyof T]: T[K] extends string
    ? InferPhrase<T[K]>
    : T[K] extends Record<string, unknown>
      ? InferTranslation<T[K]>
      : never;
};

export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

export type InferPartialTranslation<T> = DeepPartial<T>;

export type TranslationVariable = string | number;
export type TranslationVariables = Record<string, TranslationVariable>;

export type InferParams<T extends string> = T extends `${string}{{${infer Param}}}${infer Rest}`
  ? {[K in Param | keyof InferParams<Rest>]: TranslationVariable}
  : {};

type Simplify<T> = {[K in keyof T]: T[K]} & {};

type OptionalDefaults<Params extends TranslationVariables, DefaultVariables extends object> = Partial<
  Pick<Params, Extract<keyof Params, keyof DefaultVariables>>
>;

type RequiredParams<Params extends TranslationVariables, DefaultVariables extends object> = Pick<
  Params,
  Exclude<keyof Params, keyof DefaultVariables>
>;

type PhraseProps<Params extends TranslationVariables, DefaultVariables extends object> = Simplify<
  RequiredParams<Params, DefaultVariables> & OptionalDefaults<Params, DefaultVariables>
>;

type HasRequiredParams<Params extends TranslationVariables, DefaultVariables extends object> =
  Exclude<keyof Params, keyof DefaultVariables> extends never ? false : true;

export type InferTranslationVariables<T> = T extends string
  ? InferParams<T>
  : T extends Record<string, unknown>
    ? UnionToIntersection<
        {
          [K in keyof T]: InferTranslationVariables<T[K]>;
        }[keyof T]
      >
    : {};

type UnionToIntersection<T> = (T extends unknown ? (value: T) => void : never) extends (value: infer R) => void
  ? R
  : never;

export type InferTranslatorPhrase<
  T extends string,
  DefaultVariables extends object = {},
> = T extends `${string}{{${infer _Param}}}${infer _Rest}`
  ? HasRequiredParams<InferParams<T>, DefaultVariables> extends true
    ? (props: PhraseProps<InferParams<T>, DefaultVariables>) => string
    : string & ((props?: PhraseProps<InferParams<T>, DefaultVariables>) => string)
  : string;

export type InferTranslationGenerator<T, DefaultVariables extends object = {}> = {
  [K in keyof T]: T[K] extends string
    ? InferTranslatorPhrase<T[K], DefaultVariables>
    : T[K] extends Record<string, unknown>
      ? InferTranslationGenerator<T[K], DefaultVariables>
      : never;
};
