import { expect, test } from 'vitest';
import { InferPartialTranslation, InferTranslation } from './infer';
import { createTranslatorFromDictionary } from './translator-from-dictionary';

const en = {
  hello: 'Hello',
  helloName: 'Hello, {{name}}',
  goodbye: 'Goodbye',
  youHaveOneMessage: 'You have 1 message',
  youHaveManyMessages: 'You have {{count}} messages',
  nested: {
    key: 'Deep nested key',
    keyWithName: 'Deep nested key with name {{name}}',
  },
  missingKeys: {
    missingKey: 'Missing key',
    missingKeyVariable: 'Missing key with variable {{name}}',
  },
} as const;

type Translation = InferTranslation<typeof en>;

const fr: InferPartialTranslation<Translation> = {
  hello: 'Bonjour',
  helloName: 'Bonjour, {{name}}',
  goodbye: 'Au revoir',
  youHaveOneMessage: 'Vous avez 1 message',
  youHaveManyMessages: 'Vous avez {{count}} messages',
  nested: {
    key: 'Clé profonde',
    keyWithName: 'Clé profonde avec nom {{name}}',
  },
};

const dictionary = { en, fr };

const translateEn = createTranslatorFromDictionary({ dictionary, locale: 'en', defaultLocale: 'en' });
const translateFr = createTranslatorFromDictionary({ dictionary, locale: 'fr', defaultLocale: 'en' });

test('Should translate correctly', () => {
  expect(translateEn((l) => l.hello)).toBe('Hello');
  expect(translateFr((l) => l.hello)).toBe('Bonjour');
});

test('Should translate correctly with variables', () => {
  expect(translateEn((l) => l.helloName, { name: 'John' })).toBe('Hello, John');
  expect(translateFr((l) => l.helloName, { name: 'John' })).toBe('Bonjour, John');
});

test('Should translate correctly with variables', () => {
  expect(translateEn((l) => l.youHaveOneMessage)).toBe('You have 1 message');
  expect(translateEn((l) => l.youHaveManyMessages, { count: 2 })).toBe('You have 2 messages');
  expect(translateFr((l) => l.youHaveOneMessage)).toBe('Vous avez 1 message');
  expect(translateFr((l) => l.youHaveManyMessages, { count: 2 })).toBe('Vous avez 2 messages');
});

test('Should translate correctly with nested keys', () => {
  expect(translateEn((l) => l.nested.key)).toBe('Deep nested key');
  expect(translateEn((l) => l.nested.keyWithName, { name: 'John' })).toBe('Deep nested key with name John');
  expect(translateFr((l) => l.nested.key)).toBe('Clé profonde');
});

test('Should throw an error if the key does not exist', () => {
  // @ts-expect-error
  expect(translateEn((l) => l.nonExistentKey.blabla)).toBe('');
  // @ts-expect-error
  expect(translateEn((l) => l.nonExistentKey)).toBe('');
});

test('Should keep initial value when warning is not provided', () => {
  expect(translateFr((l) => l.helloName)).toBe('Bonjour, {{name}}');
});

test('Should ignore unknown variables', () => {
  // @ts-expect-error
  expect(translateEn((l) => l.helloName, { name: 'John', age: 30 })).toBe('Hello, John');
});

test('Should return default locale if the key does not exist', () => {
  expect(translateFr((l) => l.missingKeys.missingKey)).toBe('Missing key');
});

test('Should return default locale with variables if the key does not exist', () => {
  expect(translateFr((l) => l.missingKeys.missingKeyVariable, { name: 'John' })).toBe('Missing key with variable John');
});