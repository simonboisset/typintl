import {InferTranslationGenerator} from './infer';
import {Translator} from './translator';

export const getTranslatorScope = <
  Translation extends Record<string, unknown>,
  Scope extends Record<string, unknown>,
  DefaultVariables extends object = {},
>(
  translator: Translator<Translation, DefaultVariables>,
  getScope: (
    translator: InferTranslationGenerator<Translation, DefaultVariables>,
  ) => InferTranslationGenerator<Scope, DefaultVariables>,
): Translator<Scope, DefaultVariables> => {
  return (getPhrase: (translation: InferTranslationGenerator<Scope, DefaultVariables>) => string) => {
    return translator(t => getPhrase(getScope(t)));
  };
};
