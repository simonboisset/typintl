import {describe, expect, test} from 'vitest';
import {createDeferredTranslator, createOptionDeferrer} from './deferred-translation';
import {InferPartialTranslation, InferTranslation} from './infer';
import {plural} from './plural';
import {select} from './select';
import {createTranslator} from './translator';
import {createTranslatorFromDictionary} from './translator-from-dictionary';

const en = {
  welcome: 'Welcome to {{appName}}',
  hello: 'Hello {{name}} from {{appName}}',
  support: 'Need help? Contact {{supportEmail}}',
  nested: {
    title: 'Manage {{appName}}',
  },
} as const;

const defaultVariables = {
  appName: 'Acme App',
  supportEmail: 'support@example.com',
} as const;

describe('defaultVariables', () => {
  test('Should use default variables with createTranslator', () => {
    const translate = createTranslator(en, {defaultVariables});

    expect(translate(l => l.welcome)).toBe('Welcome to Acme App');
    expect(translate(l => l.hello({name: 'Simon'}))).toBe('Hello Simon from Acme App');
    expect(translate(l => l.hello({name: 'Simon', appName: 'Custom App'}))).toBe('Hello Simon from Custom App');
    expect(translate(l => l.support)).toBe('Need help? Contact support@example.com');
    expect(translate(l => l.nested.title)).toBe('Manage Acme App');
  });

  test('Should use default variables with dictionary translators and fallback phrases', () => {
    type Translation = InferTranslation<typeof en>;

    const fr: InferPartialTranslation<Translation> = {
      welcome: 'Bienvenue sur {{appName}}',
      hello: 'Bonjour {{name}} depuis {{appName}}',
      nested: {
        title: 'Gérer {{appName}}',
      },
    };

    const translate = createTranslatorFromDictionary({
      dictionary: {en, fr},
      locale: 'fr',
      defaultLocale: 'en',
      defaultVariables,
    });

    expect(translate(l => l.welcome)).toBe('Bienvenue sur Acme App');
    expect(translate(l => l.hello({name: 'Simon'}))).toBe('Bonjour Simon depuis Acme App');
    expect(translate(l => l.hello({name: 'Simon', appName: 'Custom App'}))).toBe('Bonjour Simon depuis Custom App');
    expect(translate(l => l.support)).toBe('Need help? Contact support@example.com');
  });

  test('Should resolve deferred translations with translator default variables', () => {
    const defer = createOptionDeferrer<typeof en, typeof defaultVariables>();
    const translate = createTranslator(en, {defaultVariables});
    const deferredTranslator = createDeferredTranslator(translate);

    const welcomeToken = defer(l => l.welcome);
    const overrideToken = defer(l => l.hello({name: 'Simon', appName: 'Custom App'}));

    expect(deferredTranslator(welcomeToken)).toBe('Welcome to Acme App');
    expect(deferredTranslator(overrideToken)).toBe('Hello Simon from Custom App');
  });

  test('Should use default variables in select and plural translations', () => {
    const messages = {
      origin: select('appName', {
        'Acme App': 'From default app {{appName}}',
        other: 'From {{appName}}',
      }),
      inbox: plural({
        1: '{{appName}} has 1 message',
        other: '{{appName}} has {{count}} messages',
      }),
    } as const;

    const translate = createTranslator(messages, {
      defaultVariables: {
        appName: 'Acme App',
      },
    });

    expect(translate(l => l.origin)).toBe('From default app Acme App');
    expect(translate(l => l.origin({appName: 'Custom App'}))).toBe('From Custom App');
    expect(translate(l => l.inbox({count: 1}))).toBe('Acme App has 1 message');
    expect(translate(l => l.inbox({count: 3, appName: 'Custom App'}))).toBe('Custom App has 3 messages');
  });
});

const assertDefaultVariableTypes = () => {
  const translate = createTranslator(en, {defaultVariables});

  translate(l => l.welcome);
  translate(l => l.welcome({appName: 'Custom App'}));
  translate(l => l.hello({name: 'Simon'}));
  translate(l => l.hello({name: 'Simon', appName: 'Custom App'}));

  // @ts-expect-error name is still required because it is not provided by defaultVariables.
  translate(l => l.hello);

  // @ts-expect-error unknown is not a variable in the translation tree.
  createTranslator(en, {defaultVariables: {unknown: 'value'}});
};

void assertDefaultVariableTypes;
