import {type InferTranslationGenerator, type InferTranslationVariables} from './infer';
import {type TranslationOption} from './options';
import {Translator} from './translator';

export type DeferredTranslationPayload = {
  path: (string | number)[];
  variables?: Record<string, string | number>;
};

const TOKEN_PREFIX = '__TRANSLATION_MESSAGE__:';

const encodePayload = (payload: DeferredTranslationPayload): string => `${TOKEN_PREFIX}${JSON.stringify(payload)}`;
const decodePayload = (token: string): DeferredTranslationPayload => {
  if (!token.startsWith(TOKEN_PREFIX)) {
    throw new Error('[Typed Locale] Invalid token');
  }
  const json = token.slice(TOKEN_PREFIX.length);

  return JSON.parse(json);
};

export type RecordingGenerator<
  Translation extends Record<string, unknown>,
  DefaultVariables extends object = {},
> = InferTranslationGenerator<Translation, DefaultVariables>;

const createRecordingGenerator = <
  Translation extends Record<string, unknown>,
  DefaultVariables extends object = {},
>(): RecordingGenerator<Translation, DefaultVariables> => {
  const makeNode = (path: (string | number)[]): any => {
    const handler: ProxyHandler<any> = {
      get(_target, prop) {
        if (prop === Symbol.toPrimitive || prop === 'toString' || prop === 'valueOf') {
          return () => encodePayload({path});
        }
        if (prop === null || prop === undefined) {
          return () => encodePayload({path});
        }
        return makeNode([...path, prop as string]);
      },
      apply(_target, _thisArg, argArray) {
        const variables = (argArray && argArray[0]) as Record<string, string | number> | undefined;
        return encodePayload({path, variables});
      },
    };

    const fn = () => encodePayload({path});
    Object.defineProperty(fn, 'toString', {
      value: () => encodePayload({path}),
    });
    return new Proxy(fn, handler);
  };
  return makeNode([]) as RecordingGenerator<Translation, DefaultVariables>;
};

export const createOptionDeferrer =
  <
    Translation extends Record<string, unknown>,
    DefaultVariables extends Partial<InferTranslationVariables<Translation>> = {},
  >() =>
  (option: TranslationOption<Translation, DefaultVariables>): string => {
    const recorder = createRecordingGenerator<Translation, DefaultVariables>();
    const result = option(recorder);
    if (typeof result === 'string') return result;
    if (typeof result === 'function') return (result as any)();
    return String(result);
  };

export const isDeferredTranslation = (message: string): boolean => message.startsWith(TOKEN_PREFIX);

const toDeferredTranslationOption = (payload: DeferredTranslationPayload): TranslationOption<any, any> => {
  return generator => {
    if (payload.path.length === 0) {
      return '';
    }

    let current: any = generator;
    for (const key of payload.path) current = current?.[key as any];
    if (typeof current === 'function') {
      return current(payload.variables || ({} as any));
    }
    return current ?? '';
  };
};

export const createDeferredTranslator = <
  Translation extends Record<string, unknown>,
  DefaultVariables extends object = {},
>(
  translator: Translator<Translation, DefaultVariables>,
) => {
  return (token: string) => {
    const payload = decodePayload(token);
    const option = toDeferredTranslationOption(payload);
    return translator(option);
  };
};
