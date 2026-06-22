import {InferTranslationGenerator} from './infer';

export type TranslationOption<Translation extends Record<string, unknown>, DefaultVariables extends object = {}> = (
  translation: InferTranslationGenerator<Translation, DefaultVariables>,
) => string;

export type OptionsGenerator<Translation extends Record<string, unknown>, DefaultVariables extends object = {}> = <
  T extends TranslationOption<Translation, DefaultVariables>,
>(
  option: T,
) => T;
