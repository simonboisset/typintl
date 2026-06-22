import {InferTranslatorPhrase, TranslationVariables} from './infer';
import {buildDoubleBracePhrase} from './phrase-builder';

type UnionToString<T extends string> = {
  [K in T]: Exclude<T, K> extends never ? K : `${K}${UnionToString<Exclude<T, K>>}`;
}[T];

type ValueOf<Config extends Record<string, string>> = Config[keyof Config];
type InferConfigPhrase<T extends string, Config extends SelectConfig> = `{{${T}}}${UnionToString<ValueOf<Config>>}`;

export const select = <T extends string, const Config extends SelectConfig>(
  variable: T,
  config: Config,
): InferConfigPhrase<T, Config> => {
  return {
    [SELECT_KEY]: {variable, config},
  } as unknown as InferConfigPhrase<T, Config>;
};

export const SELECT_KEY = 'select-key';
export type SelectConfig = {
  [key: string]: string;
  other: string;
};

export const getSelectPhraseBuilder = <
  T extends string,
  const Config extends SelectConfig,
  DefaultVariables extends object = {},
>(
  selectKey: {
    variable: T;
    config: Config;
  },
  defaultVariables?: DefaultVariables,
): InferTranslatorPhrase<InferConfigPhrase<T, Config>, DefaultVariables> => {
  // @ts-expect-error
  return (variables?: TranslationVariables) => {
    const mergedVariables = defaultVariables ? {...defaultVariables, ...variables} : variables;
    const value = mergedVariables?.[selectKey.variable];
    let selectedPhrase;
    if (value === 0 && 'none' in selectKey.config) {
      selectedPhrase = selectKey.config['none'];
    } else {
      selectedPhrase =
        value === undefined ? selectKey.config['other'] : selectKey.config[String(value)] || selectKey.config['other'];
    }
    return buildDoubleBracePhrase(
      selectedPhrase,
      variables,
      defaultVariables as Partial<TranslationVariables> | undefined,
    );
  };
};
