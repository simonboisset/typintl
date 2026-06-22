# typed-locale

## 0.5.4

### Patch Changes

- Add translator-level default variables for interpolation with type-safe phrase-level overrides.

## 0.5.3

### Patch Changes

- 613d69b: Remove zod utils. Deferred options is more agnostic and can be used with zod too.

## 0.5.2

### Patch Changes

- Split Zod integration and `defer` option. Improves type safety and simplifies usage.

## 0.5.1

### Patch Changes

- refactor(zod-utils): remove global registry and counter, use stateless JSON-encoded tokens for translation options; improves purity and cross‑runtime safety without changing the public API

## 0.5.0

### Minor Changes

- Add options generator for language-agnostic translation keys

  Added support for generating Zod schema options from translation keys, enabling language-agnostic validation and type safety for internationalized applications.
