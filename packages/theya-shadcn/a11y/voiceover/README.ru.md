# Прогон VoiceOver (чек-лист скринридера, часть A)

Проходит часть A [чек-листа](../screen-reader-checklist.ru.md) (WCAG 4.1.3, сообщения о состоянии) настоящим VoiceOver на Mac через [Guidepup](https://www.guidepup.dev/). Каждый сценарий открывает сторис, делает действие из чек-листа и слушает, что сказал VoiceOver. Сценарии — в `scenarios.ts`.

English: [README.md](./README.md).

## Один раз на Mac

1. VoiceOver Utility → General → поставь галочку **Allow VoiceOver to be controlled with AppleScript**.
2. System Settings → Privacy & Security → Accessibility → включи **Terminal** (или приложение терминала, из которого запускаешь команды).
3. Из корня репозитория:

```sh
npx @guidepup/setup setup --macos-ignore-tcc-db
```

```sh
pnpm --filter @theya/shadcn exec playwright install webkit chromium
```

Если macOS спросит, можно ли Терминалу управлять VoiceOver или System Events, — разреши. Отключать защиту SIP не нужно.

## Запуск

Storybook должен быть запущен (`pnpm --filter @theya/shadcn storybook`). Во время прогона не трогай клавиатуру и мышь: VoiceOver следит за активным окном. Это около 10 минут.

```sh
pnpm --filter @theya/shadcn a11y:voiceover
```

- `VO_BROWSER=chromium pnpm --filter @theya/shadcn a11y:voiceover` — движок Chrome вместо WebKit.
- `pnpm --filter @theya/shadcn a11y:voiceover -g kanban` — один сценарий.

Результаты: `a11y/voiceover/results/<браузер>-<дата>.json` (в git не попадают). В каждой записи — что сказал VoiceOver и каких ожидаемых текстов не было. Pass и fail переносятся в `a11y/manual.json` → `screenReader` с `"at": "VoiceOver (Guidepup)"`.

## Без VoiceOver

`pnpm --filter @theya/shadcn a11y:voiceover:dry` делает те же действия в Chromium и показывает, что попадает в живые области, — чтобы проверить сценарий на любой машине.

## Заметки

- У сторис при загрузке выполняется свой play-тест; прогон ждёт его и только потом действует.
- Сценарии с пометкой `manual` пропускаются, причина указана (например, сторис ничего не меняет сама).
- WebKit из Playwright — это движок Safari, а не сам Safari; в Safari результат может отличаться. Fail-ы стоит перепроверить руками.
