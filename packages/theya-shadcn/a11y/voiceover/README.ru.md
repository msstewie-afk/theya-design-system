# Прогон VoiceOver (чек-лист скринридера, часть A)

Проходит часть A [чек-листа](../screen-reader-checklist.ru.md) (WCAG 4.1.3, сообщения о состоянии) настоящим VoiceOver на Mac через [Guidepup](https://www.guidepup.dev/). Каждый сценарий открывает сторис, делает действие из чек-листа и слушает, что сказал VoiceOver. Сценарии — в `scenarios.ts`.

English: [README.md](./README.md).

## Один раз на Mac

1. VoiceOver Utility → General → поставь галочку **Allow VoiceOver to be controlled with AppleScript**.
2. System Settings → Privacy & Security → Accessibility → включи **Terminal** (или приложение терминала, из которого запускаешь команды).
3. System Settings → Privacy & Security → Full Disk Access → включи **Terminal**, потом закрой и снова открой Терминал. Guidepup кладёт свои настройки VoiceOver в `~/Library/Group Containers/group.com.apple.VoiceOver`, а без этого разрешения macOS не даёт (`EPERM`). Между прогонами можно выключать.
4. Из корня репозитория, один раз на Mac:

```sh
npx @guidepup/setup setup --macos-ignore-tcc-db
```

5. В `packages/theya-shadcn`, один раз на версию Guidepup (иначе «Failed to mount Guidepup preferences»):

```sh
npx @guidepup/setup install voiceover
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

Результаты: `a11y/voiceover/results/<браузер>-<прогон>.json` (в git не попадают), один файл на прогон. В каждой записи две ленты в мс от действия: `heard` (что сказал VoiceOver) и `published` (что страница положила в живые области и куда уходил фокус), плюс `diagnosis` для каждого не услышанного текста:

- `never published` — компонент этого не сказал: баг компонента, чинить.
- `published, not spoken` — страница сказала, VoiceOver не произнёс. **Перед тем как считать это багом, проверь руками.** В прогонах 28–29.10.2026 все такие случаи при ручной проверке в Safari произносились: после скриптового ввода (даже с настоящими нажатиями через систему) VoiceOver выбрасывает объявление, пришедшее, пока он озвучивает изменение самого контрола («ticked» у чекбокса, «off» у переключателя, переход фокуса). В матрицу пишется ручная проверка, а не автоматический промах.

Pass-ы переносятся в `a11y/manual.json` → `screenReader` с `"at": "VoiceOver (Guidepup)"`.

Как устроен прогон: VoiceOver и одно окно браузера живут весь прогон (родная фикстура Guidepup перезапускает VoiceOver на каждый тест, и он заговаривает первые секунды); последнюю фразу VoiceOver читает один постоянный `osascript` (`VO_POLL_MS`, по умолчанию 50); подсказки отодвинуты ключом `SCRContextualHelpDelayInSeconds` в собственном наборе настроек Guidepup (не в настройках пользователя); перед каждой клавишей тест ждёт, пока VoiceOver озвучит переход фокуса, клавиши — настоящие нажатия через систему и отправляются, только если впереди окно браузера теста. Текст набирает Playwright: системные нажатия зависят от активной раскладки.

## Без VoiceOver

`pnpm --filter @theya/shadcn a11y:voiceover:dry` делает те же действия в Chromium и показывает, что попадает в живые области, — чтобы проверить сценарий на любой машине.

## Заметки

- У сторис при загрузке выполняется свой play-тест; прогон ждёт его и только потом действует.
- Сценарии с пометкой `manual` пропускаются, причина указана (например, сторис ничего не меняет сама).
- WebKit из Playwright — это движок Safari, а не сам Safari; в Safari результат может отличаться. Fail-ы стоит перепроверить руками.
