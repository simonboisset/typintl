// Double braces syntax: {{variable}}

import {InferTranslatorPhrase, TranslationVariables} from './infer';

// Replace {{variable}} with value
export const buildDoubleBracePhrase = (
  phrase: string,
  variables?: TranslationVariables,
  defaultVariables?: Partial<TranslationVariables>,
) => {
  const mergedVariables = defaultVariables ? {...defaultVariables, ...variables} : variables;
  if (!mergedVariables) return phrase;
  return phrase.replace(/{{(\w+)}}/g, (_, key) => mergedVariables[key]?.toString() || `{{${key}}}`);
};

export const getPhraseBuilder = <Phrase extends string, DefaultVariables extends object = {}>(
  phrase: Phrase,
  defaultVariables?: DefaultVariables,
): InferTranslatorPhrase<Phrase, DefaultVariables> => {
  const hasVariables = /{{(.*?)}}/g.test(phrase);
  if (!hasVariables) {
    // @ts-expect-error
    return phrase;
  }
  // @ts-expect-error
  return (variables?: TranslationVariables) =>
    buildDoubleBracePhrase(phrase, variables, defaultVariables as Partial<TranslationVariables> | undefined);
};
