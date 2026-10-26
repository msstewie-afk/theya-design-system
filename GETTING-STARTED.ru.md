[English](GETTING-STARTED.md) · **Русский**

# Начало работы

Как подключить Theya в React-приложение. Самый маленький рабочий пример — [`apps/sandbox`](apps/sandbox): одна строка CSS, несколько импортов, больше ничего.

## Что нужно

- React 18.3 или 19 (peer-зависимость: его даёт приложение).
- Tailwind CSS v4. Стили Theya сами импортируют Tailwind и указывают ему, где искать классы компонентов (`@source`), поэтому настраивать Tailwind под Theya в приложении не нужно.
- Сборщик, который понимает `exports` пакета: Vite, Next.js или любой современный. У компонентов есть `'use client'`, поэтому в Next.js App Router они работают как клиентские.
- Для самого репозитория — Node 22 и pnpm.

В npm пакетов пока нет. Приложение внутри репозитория (`apps/*`) подключает их через workspace:

```json
{ "dependencies": { "@theya/shadcn": "workspace:*" } }
```

## 1. Стили

Одна строка в CSS приложения:

```css
@import '@theya/shadcn/styles/globals.css';
```

Она подключает Tailwind, токены (светлая и тёмная темы, продуктовые темы, плотность), шрифты (Geologica, Fira Code; Onest и Manrope загружаются, только когда активна их тема) и стили компонентов. Без неё компоненты будут без стилей.

С Vite добавьте `@tailwindcss/vite` и оставьте одну копию React:

```ts
// vite.config.ts
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default {
  plugins: [react(), tailwindcss()],
  resolve: { dedupe: ['react', 'react-dom'] },
};
```

## 2. Компоненты

У каждого компонента свой путь импорта:

```tsx
import { Button } from '@theya/shadcn/ui/button';
import { TextField } from '@theya/shadcn/ui/text-field';
import { Toaster, toast } from '@theya/shadcn/ui/sonner';
import { WorkspaceLayout } from '@theya/shadcn/blocks/workspace-layout';
```

- `ui/*` — компоненты (Button, TextField, DataTable…);
- `blocks/*` — паттерны страниц (лейауты, настройки, коммерция, каталог…);
- `lib/*` — вспомогательное: словари (`lib/i18n`, `lib/locale-ru`…), `cn`.

Какой компонент выбрать и как им пользоваться — на его странице Docs в Storybook: когда использовать, что взять вместо него, анатомия, доступность, do / don't, пропсы. То же в виде JSON — в `packages/theya-shadcn/spec/` (см. [AI.ru.md](AI.ru.md)).

```tsx
import { useState } from 'react';

export function AddSite() {
  const [domain, setDomain] = useState('');
  return (
    <>
      <TextField label="Domain" placeholder="example.com" value={domain} onChange={(e) => setDomain(e.target.value)} />
      <Button onClick={() => toast.success(`${domain} added`)}>Add site</Button>
      <Toaster />
    </>
  );
}
```

`<Toaster />` монтируется один раз, ближе к корню; после этого `toast()` работает откуда угодно.

## 3. Фон страницы и текст

Задайте странице базовую поверхность и цвет текста, чтобы тёмная тема переключала всё:

```tsx
<body className="bg-[var(--color-bg-surface-bg-surface-base)] font-body text-[var(--color-text-text)]">
```

В своей вёрстке тоже используйте токены: `var(--color-…)`, `var(--size-…)`. Hex-цвет в коде приложения за темой не следует. Все токены — на страницах Design System / Foundations в Storybook.

## 4. Светлая и тёмная тема

Тема — атрибут на `<html>`:

```html
<html data-theme="dark">
```

- `ThemeToggle` (`ui/theme-toggle`) — готовый переключатель.
- `useTheme()` (`ui/use-theme`) читает и меняет тему из вашего кода: `const { resolvedTheme, setTheme } = useTheme()`.
- Theya выбор не запоминает. Храните его в продукте (настройка пользователя, cookie) и ставьте атрибут снова при загрузке, до первой отрисовки, чтобы страница не мигала светлой.

## 5. Продуктовая тема и плотность

Ещё два атрибута, их можно сочетать между собой и с `data-theme`:

```html
<html data-brand="iris" data-density="compact">
```

- `data-brand`: `iris` или `lime` вместо собственного вида Theya, либо ваша тема ([PROFILES.ru.md](PROFILES.ru.md)). Ставится на `<html>`.
- `data-density`: `compact`, `default` (без атрибута) или `comfortable` — на `<html>` или на одну область, например плотную таблицу ([DENSITY.ru.md](DENSITY.ru.md)). `DensityToggle` и `useDensity()` работают так же, как их аналоги для темы.

## 6. Язык

У компонентов есть встроенные строки (подписи для скринридера, плейсхолдеры, объявления). Без провайдера — английский; для другого языка оберните приложение один раз:

```tsx
import { TheyaLocaleProvider } from '@theya/shadcn/lib/i18n';
import { ruLocale } from '@theya/shadcn/lib/locale-ru';

<TheyaLocaleProvider {...ruLocale} syncDocument>
  <App />
</TheyaLocaleProvider>
```

Готовы: английский, русский, немецкий, арабский (справа налево), китайский. Подробности и как добавить строку — [LOCALIZATION.ru.md](LOCALIZATION.ru.md).

## 7. TypeScript

Приложение проверяет типы и в исходниках Theya. Добавьте `@types/node` и `"types": ["node"]`: компоненты прячут предупреждения для разработки за `process.env.NODE_ENV`, который любой сборщик подставляет при сборке.

## Чек-лист

- [ ] `@import '@theya/shadcn/styles/globals.css'` в CSS приложения
- [ ] плагин Tailwind v4 в сборщике; одна копия React
- [ ] фон страницы и текст из токенов
- [ ] `<Toaster />` один раз, ближе к корню (если нужны тосты)
- [ ] `data-theme` ставится из сохранённого выбора до первой отрисовки
- [ ] `TheyaLocaleProvider` с `syncDocument` для языка, отличного от английского
- [ ] тексты по [WRITING.ru.md](WRITING.ru.md)

## Что дальше

| | |
|---|---|
| Storybook (`cd packages/theya-shadcn && pnpm storybook`) | все компоненты, их правила, пропсы и статус доступности |
| [WRITING.ru.md](WRITING.ru.md) | как писать подписи, ошибки и пустые состояния |
| [PROFILES.ru.md](PROFILES.ru.md) | продуктовые темы и как сделать свою |
| [DENSITY.ru.md](DENSITY.ru.md), [LOCALIZATION.ru.md](LOCALIZATION.ru.md) | режимы плотности; языки |
| [CONTRIBUTING.ru.md](CONTRIBUTING.ru.md) | как менять саму Theya |
