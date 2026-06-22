# typed-locale

Make multi-language applications easy with type-safe internationalization library.

## Introduction

`typed-locale` is a type-safe internationalization library for TypeScript.

The main reason for creating this library is to make it easy to create multi-language applications with type safety without any framework constraints.

Each translation experience I had was not satisfying because of the following reasons:

- Not type-safe
- Framework constraints
- Mutating global state

`typed-locale` is designed to be type-safe, framework-agnostic, and use pure functions.

## Installation

```bash
npm install typed-locale
yarn add typed-locale
pnpm add typed-locale
```

## Usage

### Create a translation object

First, you need to create a translation object.

```typescript
export const en = {
  hello: 'Hello',
  helloName: 'Hello, {{name}}',
  youHaveMessages: plural({
    0: 'You have no messages',
    1: 'You have 1 message',
    other: 'You have {{count}} messages',
  }),
} as const;
```

### Type the translation object

Define the type of the translation object.

```typescript
import {InferTranslation} from 'typed-locale';

type Translation = InferTranslation<typeof en>;
```

### Create other translation objects

Create other translation objects with the same type.

```typescript
export const fr: Translation = {
  hello: 'Bonjour',
  helloName: 'Bonjour, {{name}}',
  youHaveMessages: plural({
    0: 'Vous n'avez aucun message',
    1: 'Vous avez 1 message',
    other: 'Vous avez {{count}} messages',
  }),
};
```

### Create a dictionary

Create a dictionary with the translation objects.

```typescript
const dictionary = {en, fr};
```

### Create a translator

Create a translator with typed-locale.

```typescript
import {createTranslatorFromDictionary} from 'typed-locale';

const translator = createTranslatorFromDictionary({dictionary, locale: 'en', defaultLocale: 'en'});
```

You can create a simple translator with only one translation object.

```typescript
import {createTranslator} from 'typed-locale';

const translator = createTranslator(en);
```

> Be careful that the translator created with `createTranslator` does not support default translation for missing keys.

### Translate a text

Translate a text with the translator.

```typescript
const text = translator(t => t.hello);
const textWithName = translator(t => t.helloName({name: 'World'}));
const textWithPlural = translator(t => t.youHaveMessages({count: 2}));
```

### Change the locale

Translator is a pure function, so you need to create a new translator for changing the locale.

```typescript
const translatorFr = createTranslatorFromDictionary({dictionary, locale: 'fr', defaultLocale: 'en'});
const textFr = translatorFr(t => t.hello);
```

## React example

Here's an example of using typed-locale with React by creating a custom hook.

```typescript
const useTranslator = (locale: string) => {
  const translator = createTranslatorFromDictionary({dictionary, locale, defaultLocale: 'en'});
  return translator;
};
```

In this way, you can use the translator in your components.

```typescript
const MyComponent = () => {
  const translator = useTranslator('en');
  const text = translator((t) => t.helloName({ name: 'World' }));

  return <div>{text}</div>;
};
```

## Use variable in translation

You can use variable in translation by using the `{{variable}}` syntax.

```typescript
export const en = {
  helloName: 'Hello, {{name}}',
} as const;
```

```typescript
const translator = createTranslator(en);

const text = translator(t => t.helloName({name: 'World'}));
console.log(text); // 'Hello, World!'
```

### Default variables

Use `defaultVariables` when some interpolation values come from app-level context and should not be passed at
every call site.

```typescript
export const en = {
  welcome: 'Welcome to {{appName}}',
  hello: 'Hello {{name}} from {{appName}}',
} as const;

const translator = createTranslator(en, {
  defaultVariables: {
    appName: 'Acme App',
  },
});

translator(t => t.welcome); // 'Welcome to Acme App'
translator(t => t.hello({name: 'Simon'})); // 'Hello Simon from Acme App'
translator(t => t.hello({name: 'Simon', appName: 'Custom App'})); // 'Hello Simon from Custom App'
```

Default variables also work with `createTranslatorFromDictionary` and deferred translations. Phrase-level variables
override defaults.

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

const dictionary = {en, fr};

const translator = createTranslatorFromDictionary({dictionary, locale: 'fr', defaultLocale: 'en'});

console.log(translator(t => t.anotherKey)); // 'Another'
```

## Pluralization and Conditional Selection

`typed-locale` provides two functions for handling dynamic text selection: `plural` for numeric-based pluralization and `select` for general conditional text selection.

### Pluralization with `plural`

The `plural` function is specifically designed for handling pluralization based on numeric values.

#### Basic Syntax

```typescript
import {plural} from 'typed-locale';

plural({
  0: 'zero form',
  1: 'one form', 
  other: 'other form'
});
```

#### Numeric Keys

The `plural` function uses numeric keys and a required `other` key for default cases:

```typescript
const messages = {
  youHaveMessages: plural({
    0: 'You have no messages',
    1: 'You have 1 message', 
    other: 'You have {{count}} messages',
  } as const),
} as const;

const translator = createTranslator(messages);

translator(t => t.youHaveMessages({count: 0})); // "You have no messages"
translator(t => t.youHaveMessages({count: 1})); // "You have 1 message"
translator(t => t.youHaveMessages({count: 5})); // "You have 5 messages"
```

#### Using `none` as Alternative to `0`

You can use `none` as an alternative to the `0` key for better readability:

```typescript
const messages = {
  youHaveMessages: plural({
    none: 'You have no messages',
    1: 'You have 1 message',
    other: 'You have {{count}} messages',
  } as const),
} as const;

const translator = createTranslator(messages);

translator(t => t.youHaveMessages({count: 0})); // "You have no messages"
// The 'none' key is used when count is 0
```

#### Combining with Other Variables

You can combine pluralization with other template variables:

```typescript
const messages = {
  helloNameYouHaveMessages: plural({
    0: 'Hello, {{name}}. You have no messages',
    1: 'Hello, {{name}}. You have 1 message',
    other: 'Hello, {{name}}. You have {{count}} messages',
  } as const),
} as const;

const translator = createTranslator(messages);

translator(t => t.helloNameYouHaveMessages({count: 1, name: 'Jo'})); 
// "Hello, Jo. You have 1 message"
```

### Conditional Selection with `select`

The `select` function provides general-purpose conditional text selection based on any variable value.

#### Basic Syntax

```typescript
import {select} from 'typed-locale';

select(variableName, {
  specificValue: 'text for specific value',
  anotherValue: 'text for another value', 
  other: 'default text for other values'
});
```

#### Non-numeric Selection

The `select` function is ideal for non-numeric conditional text:

```typescript
const messages = {
  fruitPreference: select('fruit', {
    apple: 'I like apples',
    banana: 'I enjoy bananas', 
    orange: 'I love oranges',
    other: 'I prefer {{fruit}}',
  } as const),
  
  statusMessage: select('status', {
    loading: 'Please wait...',
    success: 'Operation completed successfully',
    error: 'An error occurred', 
    other: 'Unknown status: {{status}}',
  } as const),
} as const;

const translator = createTranslator(messages);

translator(t => t.fruitPreference({fruit: 'apple'})); // "I like apples"
translator(t => t.fruitPreference({fruit: 'mango'})); // "I prefer mango"

translator(t => t.statusMessage({status: 'loading'})); // "Please wait..."
translator(t => t.statusMessage({status: 'timeout'})); // "Unknown status: timeout"
```

#### Numeric Selection with `select`

You can also use `select` for numeric values when you need more control than `plural` provides:

```typescript
const messages = {
  scoreMessage: select('score', {
    0: 'No score yet',
    1: 'You scored one point!',
    100: 'Perfect score!',
    other: 'You scored {{score}} points',
  } as const),
} as const;

const translator = createTranslator(messages);

translator(t => t.scoreMessage({score: 0})); // "No score yet"
translator(t => t.scoreMessage({score: 100})); // "Perfect score!" 
translator(t => t.scoreMessage({score: 85})); // "You scored 85 points"
```

### When to Use Which Function

- **Use `plural`** for standard pluralization based on count/quantity
  - Handles 0, 1, and other numeric values
  - Automatically works with `count` parameter
  - Supports `none` as alias for 0

- **Use `select`** for conditional text based on any variable value
  - Works with string, numeric, or other values
  - More flexible for complex conditional logic
  - Requires specifying the variable name

### Usage with Different Translators

Both functions work seamlessly with all translator types:

```typescript
// With createTranslator
const translator = createTranslator(messages);
translator(t => t.youHaveMessages({count: 5}));

// With createTranslatorFromDictionary  
const translator = createTranslatorFromDictionary({
  dictionary: {en: messages}, 
  locale: 'en',
  defaultLocale: 'en'
});
translator(t => t.youHaveMessages({count: 5}));

// With lazy translator
const lazyTranslator = createLazyTranslator(loadFunction);
await lazyTranslator(t => t.youHaveMessages({count: 5}));
```

## Scoped translation

You can use scoped translation by using the `getTranslatorScope` function.

```typescript
import {getTranslatorScope} from 'typed-locale';

export const en = {
  hello: 'Hello, {{name}}!',
  nested: {
    hello: 'Nested Hello, {{name}}!',
  },
} as const;

const translator = createTranslator(en);
const nestedTranslator = getTranslatorScope(translator, t => t.nested);

const text = nestedTranslator(t => t.hello({name: 'World'}));
console.log(text); // 'Nested Hello, World!'
```

## Lazy Loading

`typed-locale` supports lazy loading of translations, which can be useful for large applications or when you want to load translations on-demand.

### Create a lazy translator

To use lazy loading, you need to create a lazy translator using the `createLazyTranslator` function.

```typescript
import {createLazyTranslator} from 'typed-locale';

const lazyLoadFn = async (paths: string[]) => {
  // Implement your lazy loading logic here
  const translation = await fetchTranslation(paths);
  return translation;
};

const initialTranslations = {
  // Optional
  // Add any initial translations you want to have available immediately
};

const lazyTranslator = createLazyTranslator(lazyLoadFn, initialTranslations);
```

### Use the lazy translator

You can use the lazy translator similarly to the regular translator, but it returns a Promise that resolves to the translated string.

```typescript
const translatedText = await lazyTranslator(t => t.hello);
console.log(translatedText); // 'Hello'

const translatedTextWithName = await lazyTranslator(t => t.helloName({name: 'World'}));
console.log(translatedTextWithName); // 'Hello, World'
```

### Caching

The lazy translator automatically caches loaded translations, so subsequent requests for the same key will not trigger additional lazy loading.

## Zod Integration

`typed-locale` provides seamless integration with [Zod](https://zod.dev) for form validation with type-safe, internationalized error messages. This integration allows you to define validation schemas once and render errors in multiple languages.

### Basic Zod Integration

To use typed-locale with Zod, you need to create deferred translation options and error renderers.

```typescript
import {z} from 'zod';
import {createTranslator, createOptionDeferrer, createZodTranslator} from 'typed-locale';

// Define your validation messages
const validationMessages = {
  required: 'This field is required',
  invalidEmail: 'Please enter a valid email address',
  passwordTooShort: 'Password must be at least {{min}} characters long',
  passwordTooLong: 'Password must be no more than {{max}} characters long',
} as const;

const validationMessagesFr = {
  required: 'Ce champ est obligatoire',
  invalidEmail: 'Veuillez saisir une adresse e-mail valide',
  passwordTooShort: 'Le mot de passe doit contenir au moins {{min}} caractères',
  passwordTooLong: 'Le mot de passe ne doit pas dépasser {{max}} caractères',
} as const;

// Create translators for each language
const translateEn = createTranslator(validationMessages);
const translateFr = createTranslator(validationMessagesFr);

// Create option deferrer (used once for schema definition)
const options = createOptionDeferrer<typeof validationMessages>();
```

### Creating Validation Schema

Define your Zod schema using the deferred translation options:

```typescript
const userSchema = z.object({
  email: z
    .string()
    .min(1, options(t => t.required))
    .email(options(t => t.invalidEmail)),
  password: z
    .string()
    .min(8, options(t => t.passwordTooShort({min: 8})))
    .max(50, options(t => t.passwordTooLong({max: 50}))),
});
```

### Rendering Validation Errors

Create error renderers for each language and use them to translate validation errors:

```typescript
// Create error renderers
const renderEnglishErrors = createZodTranslator(translateEn);
const renderFrenchErrors = createZodTranslator(translateFr);

// Validate data
const result = userSchema.safeParse({
  email: 'invalid-email',
  password: '123'
});

if (!result.success) {
  // Render errors in English
  const englishErrors = renderEnglishErrors(result.error);
  console.log(englishErrors[0].message); // "Please enter a valid email address"
  
  // Render the same errors in French
  const frenchErrors = renderFrenchErrors(result.error);
  console.log(frenchErrors[0].message); // "Veuillez saisir une adresse e-mail valide"
}
```

### Best Practices for Zod Integration

#### Single Schema, Multiple Renderers (Recommended)

The recommended pattern is to define your schema once and create multiple error renderers:

```typescript
// 1. Define schema once with deferred options
const registrationSchema = z.object({
  username: z
    .string()
    .min(1, options(t => t.required))
    .regex(/^[a-zA-Z0-9_]+$/, options(t => t.invalidUsername)),
  email: z
    .string()
    .min(1, options(t => t.required))
    .email(options(t => t.invalidEmail)),
  password: z
    .string()
    .min(8, options(t => t.passwordTooShort({min: 8}))),
});

// 2. Create error renderers for each supported language
const englishRenderer = createZodTranslator(translateEn);
const frenchRenderer = createZodTranslator(translateFr);
const spanishRenderer = createZodTranslator(translateEs);

// 3. Use the same schema everywhere in your application
function validateUser(data: unknown, language: string) {
  const result = registrationSchema.safeParse(data);
  
  if (!result.success) {
    // Choose renderer based on user's language preference
    const renderer = language === 'fr' ? frenchRenderer : 
                     language === 'es' ? spanishRenderer : 
                     englishRenderer;
    
    return renderer(result.error);
  }
  
  return [];
}
```

#### Nested Validation

You can use nested translation keys for organized validation messages:

```typescript
const messages = {
  validation: {
    user: {
      nameRequired: 'Name is required',
      nameMinLength: 'Name must be at least {{min}} characters',
      emailInvalid: 'Please enter a valid email address',
    },
    password: {
      tooShort: 'Password must be at least {{min}} characters',
      missingUppercase: 'Password must contain at least one uppercase letter',
    }
  }
} as const;

const options = createOptionDeferrer<typeof messages>();

const schema = z.object({
  name: z
    .string()
    .min(1, options(t => t.validation.user.nameRequired))
    .min(2, options(t => t.validation.user.nameMinLength({min: 2}))),
  email: z
    .string()
    .email(options(t => t.validation.user.emailInvalid)),
  password: z
    .string()
    .min(8, options(t => t.validation.password.tooShort({min: 8})))
    .regex(/[A-Z]/, options(t => t.validation.password.missingUppercase)),
});
```

#### React Hook Example

Here's how to integrate Zod validation with typed-locale in a React application:

```typescript
function useValidatedForm(language: string) {
  const translator = language === 'fr' ? translateFr : translateEn;
  const errorRenderer = createZodTranslator(translator);
  
  const validateAndGetErrors = (data: unknown) => {
    const result = userSchema.safeParse(data);
    return result.success ? [] : errorRenderer(result.error);
  };
  
  return { validateAndGetErrors };
}

// In your component
function RegistrationForm() {
  const [language, setLanguage] = useState('en');
  const { validateAndGetErrors } = useValidatedForm(language);
  
  const handleSubmit = (formData: any) => {
    const errors = validateAndGetErrors(formData);
    if (errors.length > 0) {
      // Display errors in user's language
      errors.forEach(error => {
        console.log(`${error.path.join('.')}: ${error.message}`);
      });
    }
  };
  
  // ... rest of component
}
```

### Mixed Validation Messages

You can mix translated messages with regular Zod error messages in the same schema:

```typescript
const schema = z.object({
  // Translated message
  email: z.string().email(options(t => t.invalidEmail)),
  // Regular Zod message (not translated)
  confirmEmail: z.string().email('Please enter a valid email address'),
});

// The error renderer will handle both types appropriately
const errors = errorRenderer(validationResult.error);
// Translated messages will be localized, regular messages remain unchanged
```

## Deferred Translations

Deferred translations allow you to create translation "tokens" that can be resolved later with different translators. This is particularly useful for scenarios like form validation where you want to define validation rules once but render error messages in different languages.

### Basic Usage

```typescript
import {
  createTranslator, 
  createOptionDeferrer, 
  createDeferredTranslator, 
  isDeferredTranslation
} from 'typed-locale';

const messages = {
  welcome: 'Welcome, {{name}}!',
  error: 'Something went wrong',
  validation: {
    required: 'This field is required',
    tooShort: 'Must be at least {{min}} characters',
  }
} as const;

const messagesFr = {
  welcome: 'Bienvenue, {{name}}!',
  error: 'Quelque chose s\'est mal passé',
  validation: {
    required: 'Ce champ est obligatoire',
    tooShort: 'Doit contenir au moins {{min}} caractères',
  }
} as const;

// Create translators
const translateEn = createTranslator(messages);
const translateFr = createTranslator(messagesFr);

// Create option deferrer
const defer = createOptionDeferrer<typeof messages>();

// Create deferred translators
const deferredTranslatorEn = createDeferredTranslator(translateEn);
const deferredTranslatorFr = createDeferredTranslator(translateFr);
```

### Creating and Using Deferred Tokens

```typescript
// Create deferred translation tokens
const welcomeToken = defer(t => t.welcome({name: 'John'}));
const errorToken = defer(t => t.error);
const validationToken = defer(t => t.validation.required);

// Check if something is a deferred translation
console.log(isDeferredTranslation(welcomeToken)); // true
console.log(isDeferredTranslation('regular string')); // false

// Resolve tokens with different translators
console.log(deferredTranslatorEn(welcomeToken)); // "Welcome, John!"
console.log(deferredTranslatorFr(welcomeToken)); // "Bienvenue, John!"

console.log(deferredTranslatorEn(errorToken)); // "Something went wrong"
console.log(deferredTranslatorFr(errorToken)); // "Quelque chose s'est mal passé"
```

### Use Cases

Deferred translations are particularly useful for:

1. **Form Validation**: Define validation rules once, render errors in multiple languages
2. **API Error Messages**: Store error tokens that can be translated based on user preferences
3. **Configuration-driven UIs**: Define UI text tokens in configuration, resolve based on locale
4. **Library Development**: Allow library users to provide their own translators

### Example: Configuration-driven Validation

```typescript
interface ValidationRule {
  field: string;
  message: ReturnType<typeof defer>;
  validator: (value: any) => boolean;
}

// Define validation rules with deferred messages
const validationRules: ValidationRule[] = [
  {
    field: 'email',
    message: defer(t => t.validation.required),
    validator: (value) => value && value.length > 0
  },
  {
    field: 'password', 
    message: defer(t => t.validation.tooShort({min: 8})),
    validator: (value) => value && value.length >= 8
  }
];

// Validation function that works with any language
function validateForm(data: any, translator: ReturnType<typeof createDeferredTranslator>) {
  const errors: {field: string, message: string}[] = [];
  
  for (const rule of validationRules) {
    if (!rule.validator(data[rule.field])) {
      errors.push({
        field: rule.field,
        message: translator(rule.message)
      });
    }
  }
  
  return errors;
}

// Use with different languages
const englishErrors = validateForm(formData, deferredTranslatorEn);
const frenchErrors = validateForm(formData, deferredTranslatorFr);
```

## API Reference

### Core Functions

#### `createTranslator(translations, options?)`
Creates a translator function from a single translation object.

```typescript
const translator = createTranslator(translations, {
  defaultVariables: {
    appName: 'Acme App',
  },
});
const result = translator(t => t.hello);
```

#### `createTranslatorFromDictionary({dictionary, locale, defaultLocale, defaultVariables?})`
Creates a translator function from a dictionary of translations with fallback support.

```typescript
const translator = createTranslatorFromDictionary({
  dictionary: {en, fr}, 
  locale: 'fr',
  defaultLocale: 'en',
  defaultVariables: {
    appName: 'Acme App',
  },
});
```

#### `createLazyTranslator(lazyLoadFn, initialTranslations?)`
Creates an async translator that loads translations on demand.

```typescript
const translator = createLazyTranslator(async (paths) => {
  // Load translation for the given path
  return await fetchTranslation(paths);
}, {hello: 'Initial Hello'});
```

#### `getTranslatorScope(translator, scopeSelector)`
Creates a scoped translator for nested translation objects.

```typescript
const scopedTranslator = getTranslatorScope(translator, t => t.nested.section);
```

### Selection Functions

#### `plural(options)`
Creates a pluralization function based on numeric count values.

```typescript
const pluralMessage = plural({
  0: 'No items',
  1: 'One item',
  other: '{{count}} items'
});
```

#### `select(variableName, options)`
Creates a conditional selection function based on variable values.

```typescript
const selectMessage = select('status', {
  active: 'Currently active',
  inactive: 'Not active', 
  other: 'Status: {{status}}'
});
```

### Deferred Translation Functions

#### `createOptionDeferrer<T>()`
Creates a function for generating deferred translation tokens.

```typescript
const defer = createOptionDeferrer<typeof translations>();
const token = defer(t => t.welcome({name: 'John'}));
```

#### `createDeferredTranslator(translator)`
Creates a translator that can resolve deferred translation tokens.

```typescript
const deferredTranslator = createDeferredTranslator(translator);
const result = deferredTranslator(token);
```

#### `isDeferredTranslation(value)`
Type guard to check if a value is a deferred translation token.

```typescript
if (isDeferredTranslation(value)) {
  // Handle deferred translation
}
```

### Zod Integration Functions

#### `createZodTranslator(translator)`
Creates an error renderer for Zod validation errors with translated messages.

```typescript
const errorRenderer = createZodTranslator(translator);
const translatedErrors = errorRenderer(zodError);
```

### Utility Functions

#### `buildDoubleBracePhrase(template, variables)`
Low-level utility for replacing `{{variable}}` placeholders in strings.

```typescript
const result = buildDoubleBracePhrase('Hello, {{name}}!', {name: 'John'});
// Result: "Hello, John!"
```

### Type Utilities

#### `InferTranslation<T>`
Infers the complete translation type from a translation object.

```typescript
type Translation = InferTranslation<typeof en>;
```

#### `InferPartialTranslation<T>`
Creates a partial translation type for incomplete translations.

```typescript
const partialTranslation: InferPartialTranslation<Translation> = {
  hello: 'Bonjour'
  // Other keys are optional
};
```

#### `Translator<T>`
Type for translator functions.

```typescript
const myTranslator: Translator<Translation> = createTranslator(en);
```

#### `DeferredTranslationPayload`
Type representing deferred translation tokens.

#### `OptionsGenerator<T>`
Type for option deferrer functions.

#### `TranslationOption`
Type for individual translation options in Zod integration.

#### `TranslationIssue`
Type for translated Zod validation errors.

```typescript
interface TranslationIssue {
  path: (string | number)[];
  message: string;
}
```

### Usage Patterns

#### Complete Translation Setup

```typescript
import {
  createTranslator,
  createTranslatorFromDictionary, 
  InferTranslation,
  InferPartialTranslation,
  plural,
  select
} from 'typed-locale';

// 1. Define master translation
const en = {
  greeting: 'Hello, {{name}}!',
  messages: plural({
    0: 'No messages',
    1: 'One message', 
    other: '{{count}} messages'
  }),
  status: select('type', {
    success: 'Success!',
    error: 'Error occurred',
    other: 'Status: {{type}}'
  })
} as const;

// 2. Infer types  
type Translation = InferTranslation<typeof en>;

// 3. Create other translations
const fr: InferPartialTranslation<Translation> = {
  greeting: 'Bonjour, {{name}}!',
  // messages and status can be omitted - will fall back to English
};

// 4. Create translators
const translator = createTranslatorFromDictionary({
  dictionary: {en, fr},
  locale: 'fr', 
  defaultLocale: 'en'
});

// 5. Use translator
const result = translator(t => t.greeting({name: 'Marie'}));
```

#### Zod Validation Setup

```typescript
import {z} from 'zod';
import {
  createTranslator,
  createOptionDeferrer, 
  createZodTranslator
} from 'typed-locale';

// 1. Define validation messages
const validationMessages = {
  required: 'Required field',
  email: 'Invalid email'
} as const;

// 2. Setup translation tools
const translator = createTranslator(validationMessages);
const defer = createOptionDeferrer<typeof validationMessages>();
const errorRenderer = createZodTranslator(translator);

// 3. Create schema
const schema = z.object({
  email: z.string().min(1, defer(t => t.required)).email(defer(t => t.email))
});

// 4. Validate and render errors
const result = schema.safeParse({email: 'invalid'});
if (!result.success) {
  const errors = errorRenderer(result.error);
  errors.forEach(error => console.log(error.message));
}
```

## Contribution guide

This library is still in the early stage, so any contribution is welcome.
Here are some ways to contribute to this library.

In general, the contribution process is as follows:

1. Fork this repository and make changes
2. Create a pull request
3. Wait for the review
4. I will review the pull request
5. If everything is fine, I will merge the pull request and release a new version

### Setup the project locally

After forking this repository, you can set up the project locally by following the steps below.

```bash
pnpm install
```

As you can see, this project uses `pnpm` as a package manager. If you don't have `pnpm` installed, you can install it by running the following command.

```bash
npm install -g pnpm
```

### Run the test

You can run the test by running the following command.

```bash
pnpm test
```

### Write your update

After setting up the project locally, you can make changes to the code.

> For every change, you need to write tests to make sure that the changes work as expected.
> I will be attentive to the test coverage, so please write tests for every change.

Then you can commit your changes and create a pull request.

Thank you for reading this README.md file. I hope you enjoy using this library.
