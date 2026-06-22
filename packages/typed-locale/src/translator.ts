import {InferTranslationGenerator, InferTranslationVariables} from './infer';
import {getPhraseBuilder} from './phrase-builder';
import {getSelectPhraseBuilder, SELECT_KEY} from './select';

export type Translator<Translation extends Record<string, unknown>, DefaultVariables extends object = {}> = (
  getPhrase: (translation: InferTranslationGenerator<Translation, DefaultVariables>) => string,
) => string;

export type TranslatorOptions<DefaultVariables extends object = {}> = {
  defaultVariables?: DefaultVariables;
};

export const createTranslator =
  <
    Translation extends Record<string, unknown>,
    DefaultVariables extends Partial<InferTranslationVariables<Translation>> = {},
  >(
    translation: Translation,
    options?: TranslatorOptions<DefaultVariables>,
  ): Translator<Translation, DefaultVariables> =>
  getPhrase => {
    const generator = getTranslationGenerator(translation, options?.defaultVariables);
    return getSafePhrase(getPhrase, generator);
  };

export const getTranslationGenerator = <
  Translation extends Record<string, unknown>,
  DefaultVariables extends object = {},
>(
  translation: Translation,
  defaultVariables?: DefaultVariables,
): InferTranslationGenerator<Translation, DefaultVariables> => {
  const generator = {} as InferTranslationGenerator<Translation, DefaultVariables>;

  const keys = Object.keys(translation);
  for (const key of keys) {
    const value = translation[key];
    if (typeof value === 'string') {
      // @ts-expect-error
      generator[key] = getPhraseBuilder(value, defaultVariables);
    } else if (!!value && typeof value === 'object') {
      const nestedKeys = Object.keys(value);
      const nestedKey = nestedKeys[0];
      if (nestedKey === SELECT_KEY) {
        // @ts-expect-error
        generator[key] = getSelectPhraseBuilder(value[SELECT_KEY] as Translation, defaultVariables);
      } else {
        // @ts-expect-error
        generator[key] = getTranslationGenerator(value as Translation, defaultVariables);
      }
    }
  }
  return generator;
};

export const getSafePhrase = <Translation extends Record<string, unknown>, DefaultVariables extends object = {}>(
  getPhrase: (translation: InferTranslationGenerator<Translation, DefaultVariables>) => string,
  generator: InferTranslationGenerator<Translation, DefaultVariables>,
): string => {
  try {
    const phrase = getPhrase(generator);
    if (typeof phrase === 'function') {
      // @ts-expect-error
      return phrase();
    }
    return phrase || '';
  } catch (error) {
    return '';
  }
};
