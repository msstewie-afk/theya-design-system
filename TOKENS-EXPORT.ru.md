[English](TOKENS-EXPORT.md) · **Русский**

# Экспорт токенов (DTCG и Tokens Studio)

`pnpm build:tokens` вместе с CSS собирает токены в формате W3C Design Tokens — для Figma Variables, Tokens Studio и других платформ. Источник один: `packages/tokens/src`.

| Папка | Формат | Для чего |
|---|---|---|
| `packages/tokens/build/dtcg/` | DTCG 2025.10: цвет `{ colorSpace, components, alpha, hex }`, размеры `{ value, unit }` | инструменты, которые читают актуальный стандарт; `manifest.json` описывает наборы |
| `packages/tokens/build/tokens-studio/` | те же наборы, значения строками (`#0068de`, `16px`) + `$metadata.json`, `$themes.json` | Tokens Studio (и через него — Figma Variables) |

## Наборы

Ссылки остаются ссылками (`{color.blue.blue-500}`), поэтому цепочка primitive → semantic сохраняется.

| Набор | Что внутри |
|---|---|
| `primitive` | палитра, шкала размеров, шрифты и начертания |
| `base` | semantic-размеры и типографика, тени, motion, слои |
| `color-shared` | цвета, одинаковые в обеих темах (на primary-заливке, графики) |
| `color-light`, `color-dark` | semantic-цвета темы |
| `brand-iris`, `brand-lime` | тема: перекрашенные шкалы, шрифт, начертания, радиусы |
| `brand-iris-light`, `-dark` и т.д. | цвета темы, которые отличаются от того, что дают ссылки (заливка primary, текст на ней, поверхности, ссылки…) |
| `density-default` | токены плотности |
| `density-compact`, `density-comfortable` | контролы, строки, пункты меню **и отступы** (padding, gap, margin) |

## Темы в Tokens Studio

`$themes.json` — три группы, в каждой выбирается один вариант:

- **foundation** — всегда;
- **theme** — `light`, `dark`, `iris-light`, `iris-dark`, `lime-light`, `lime-dark`;
- **density** — `default`, `compact`, `comfortable`.

В Figma это три коллекции переменных; у «theme» шесть режимов, у «density» три.

Как подключить: соберите токены (`pnpm build:tokens`) и загрузите папку `packages/tokens/build/tokens-studio` в Tokens Studio через Tools → Load from file/folder. Наборы и темы подхватятся из `$metadata.json` и `$themes.json`.

`build/` не коммитится, поэтому синхронизация Tokens Studio с GitHub эту папку не увидит. Если нужна синхронизация, папку нужно публиковать отдельно (например, артефактом CI или в отдельную ветку).

## Проверки при сборке

- каждая ссылка разрешается во всех 18 комбинациях (foundation × theme × density), тип ссылки совпадает, циклов нет;
- `check-dtcg.mjs` сверяет экспорт с CSS: для каждой темы и плотности значение каждого токена, вычисленное через наборы, совпадает с тем, что даёт CSS-сборка. Любое расхождение роняет сборку.

## Чего нет в экспорте

- курсивные начертания (`typography.italic.*`) — это имена стилей Figma, в DTCG нет такого типа;
- один радиус на все кнопки и поля у темы (`--theme-radius-button`, `--theme-radius-field`, у Lime — кнопки-пилюли) — это настройка компонентов, а не токен. Шкала радиусов темы экспортируется;
- масштабирование числовых Tailwind-утилит (`p-4`, `gap-6`) плотностью — только CSS; соответствующие токены отступов экспортируются.
