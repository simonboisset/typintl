export type {DeferredTranslationPayload} from './deferred-translation';
export type {InferPartialTranslation, InferTranslation, TranslationVariable, TranslationVariables} from './infer';
export type {OptionsGenerator, TranslationOption} from './options';
export type {Translator, TranslatorOptions} from './translator';

export {createDeferredTranslator, createOptionDeferrer, isDeferredTranslation} from './deferred-translation';
export {createLazyTranslator} from './lazy-translator';
export {buildDoubleBracePhrase} from './phrase-builder';
export {plural} from './plural';
export {select} from './select';
export {createTranslator} from './translator';
export {createTranslatorFromDictionary} from './translator-from-dictionary';
export {getTranslatorScope} from './translator-scope';
