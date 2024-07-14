# typed-locale

Make multi languages application easy with type safety internationalization library.

## Introduction

`typed-locale` is a type-safe internationalization library for TypeScript.

The main reason I created this library is to make it easy to create multi-language applications with type safety without any framework constraints.

Each translation experience I had was not satisfying beacuse of the following reasons.

- Not type-safe
- Framework constraints
- Mutating global state

`typed-locale` is designed to be type-safe, framework-agnostic, and pure function.

## Contribution

This library is still in the early stage, so any contribution is welcome.
Any kind of contribution is welcome, such as bug reports, feature requests, documentation improvements, and so on.

## Installation

```bash
npm install typed-locale
yarn add typed-locale
pnpm i typed-locale
```

## Usage

### Create a translation object

First you need to create a translation object.

```javascript
export const en = {
  helloWordl: 'Hello, World!',
} as const;
```

### Type the translation object

Define the type of the translation object.

```typescript
import { InferTranslation } from 'typed-locale';

type Translation = InferTranslation<typeof en>;
```

### Create other translation objects

Create other translation objects with the same type.

```typescript
export const fr: Translation = {
  helloWordl: 'Bonjour, le monde!',
};
```

### Create a dictionary

Create a dictionary with the translation objects.

```typescript
const dictionary = { en, fr };
```

### Create a translator

Create a translator with the typed-locale.

```typescript
import { createTranslatorFromDictionary } from 'typed-locale';

const translator = createTranslatorFromDictionary({ dictionary, locale: 'en' });
```

You can create simple translator with only one translation object.

```typescript
import { createTranslator } from 'typed-locale';

const translator = createTranslator(en);
```

Be careful that the translator created with `createTranslator` does not support default translation for missing keys.

### Translate a text

Translate a text with the translator.

```typescript
const text = translator((t) => t.helloWordl);
```

### Change the locale

Translator is pure function, so you need to create a new translator for changing the locale.

```typescript
const translatorFr = createTranslatorFromDictionary({ dictionary, locale: 'fr', defaultLocale: 'en' });
const textFr = translatorFr((t) => t.helloWordl);
```

## React example

Here is an example of using typed-locale with React by creating a custom hook.

```typescript
const useTranslator = (locale: string) => {
  const translator = createTranslatorFromDictionary({ dictionary, locale, defaultLocale: 'en' });

  return translator;
};
```

In this way, you can use the translator in your components.

```typescript
const MyComponent = () => {
  const translator = useTranslator('en');
  const text = translator((t) => t.helloWordl);

  return <div>{text}</div>;
};
```

## Use variable in translation

You can use variables in translation.

```javascript
export const en = {
  hello: 'Hello, {{name}}!',
} as const;
```

The variable will be automatically typed by the translator.

```typescript
const text = translator((t) => t.hello, { name: 'World' });
```

## Default translation

If you have some translations that are not ready for all languages, you can use InferPartialTranslation type to define the other translations.

```typescript
export const en = {
  hello: 'Hello, {{name}}!',
  anotherKey: 'Another',
} as const;

type Translation = InferTranslation<typeof en>;

const fr: InferPartialTranslation<Translation> = {
  hello: 'Bonjour, {{name}}!',
};

const dictionary = { en, fr };

const translator = createTranslatorFromDictionary({ dictionary, locale: 'fr', defaultLocale: 'en' });

console.log(translator((t) => t.anotherKey)); // 'Another'
```

## Pluralization

You can use pluralization by using the `plural` in your translation object.

```javascript
export const en = {
   helloNameYouHaveMessages: plural({
    none: 'Hello, {{name}}. You have no messages',
    one: 'Hello, {{name}}. You have 1 message',
    other: 'Hello, {{name}}. You have {{count}} messages',
  }),
} as const;

const translator = createTranslator(en);

const text = translator((t) => t.helloNameYouHaveMessages, { name: 'World', count: 3 });
console.log(text); // 'Hello, World. You have 3 messages'
```

## Roadmap

Here is the roadmap for the library.

- [x] Type-safe declaration
- [x] Basic translation
- [x] Variable in translation
- [x] Strict type checking for variables
- [x] Default translation for missing key
- [x] Pluralization
- [ ] Improved type inference and auto-completion for variables

Feel free to open an issue or pull request if you have any idea or suggestion.

```

```
