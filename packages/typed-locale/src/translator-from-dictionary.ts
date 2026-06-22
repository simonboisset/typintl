import {InferTranslationVariables} from './infer';
import {getSafePhrase, getTranslationGenerator, Translator} from './translator';

type CreateTranslatorFromDictionaryParams<
  Dictionary extends Record<string, any>,
  Locale extends keyof Dictionary,
  DefaultLocale extends keyof Dictionary,
  DefaultVariables extends object = {},
> = {
  dictionary: Dictionary;
  defaultLocale: DefaultLocale;
  defaultVariables?: DefaultVariables;
  locale: Locale;
};

export const createTranslatorFromDictionary =
  <
    Dictionary extends Record<string, any>,
    Locale extends keyof Dictionary,
    DefaultLocale extends keyof Dictionary,
    DefaultVariables extends Partial<InferTranslationVariables<Dictionary[DefaultLocale]>> = {},
  >({
    dictionary,
    defaultLocale,
    defaultVariables,
    locale,
  }: CreateTranslatorFromDictionaryParams<Dictionary, Locale, DefaultLocale, DefaultVariables>): Translator<
    Dictionary[DefaultLocale],
    DefaultVariables
  > =>
  getPhrase => {
    const defaultGenerator = getTranslationGenerator(dictionary[defaultLocale], defaultVariables);
    const localeGenerator = getTranslationGenerator(dictionary[locale], defaultVariables);

    return getSafePhrase(getPhrase, localeGenerator) || getSafePhrase(getPhrase, defaultGenerator);
  };
