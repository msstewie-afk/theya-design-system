# Чек-лист для скринридера

Ручной проход настоящим скринридером. Он закрывает два критерия WCAG, которые не проверить ни ревью кода, ни axe: **1.3.2 Meaningful sequence** (порядок чтения осмысленный) и **4.1.3 Status messages** (сообщения произносятся без переноса фокуса). В матрице доступности оба остаются «untested», пока для компонента не записан проход.

English version: [screen-reader-checklist.md](./screen-reader-checklist.md).

## Подготовка

- **VoiceOver + Safari** на Mac (первый проход). NVDA + Firefox на Windows — позже, или VoiceOver на iPhone как замена.
- Storybook из основного checkout: `pnpm --filter @theya/shadcn storybook` (порт 6008).
- Каждую сторис открывай **отдельной страницей**, не внутри интерфейса Storybook, чтобы VoiceOver читал только компонент:
  `http://localhost:6008/iframe.html?id=<story-id>&viewMode=story`
- Клавиши VoiceOver (VO = Control + Option):
  - VO + Вправо / Влево: следующий / предыдущий элемент (порядок чтения).
  - VO + A: читать отсюда до конца.
  - Tab / Shift + Tab: переносить фокус, как это делает пользователь клавиатуры.
  - VO + U: ротор (заголовки, ссылки, поля).
  - VO + Пробел: нажать текущий элемент.
- Включи панель субтитров (Утилита VoiceOver → Визуальные эффекты → Панель субтитров), чтобы видеть, что было сказано.

## Как записывать

Отметь пункт и после стрелки напиши, что произошло:

```
- [x] **Button** … → pass
- [x] **Countdown** … → fail: на нуле ничего не сказал
- [x] **Kanban** … → pass, но имя колонки читается дважды
```

Когда раздел готов, отдай файл агенту. Он превратит каждую строку в запись `screenReader` в `a11y/manual.json` (`{ "at": "VoiceOver", "browser": "Safari <версия>", "date": "…", "result": "pass" | "fail", "notes": "…" }`), запустит `pnpm a11y` и заведёт исправление на каждый fail.

Что считается pass:
- **4.1.3:** сообщение произносится **один раз**, фокус **не** переезжает, и звучит вскоре после действия (примерно в пределах секунды). Формулировка может отличаться от строки «Ожидаю»; смысл должен совпадать. Текст в Theya английский — VoiceOver прочтёт его по-английски.
- **1.3.2:** если читать сторис сверху вниз через VO + Вправо, содержимое идёт в осмысленном порядке: подпись перед значением, заголовок перед своим разделом, у диалога заголовок перед текстом. Декоративное (точки, кольца, «призрак» при перетаскивании) не читается.

---

## Часть A — Сообщения о состоянии (4.1.3) · 43 пункта · около 60 мин

Каждый пункт проверяет одно сообщение. Фокус не трогай — слушай.

### Компоненты

- [ ] **Button** · `actions-button--interactive-loading` · Tab до кнопки, нажми. Ожидаю: «Saving…», затем «Saved» (или текст успеха из сторис), фокус остаётся на кнопке. →
- [ ] **CopyButton** · `actions-copybutton--icon-only` · Tab до неё, нажми. Ожидаю: «Copied». Нажми ещё раз — снова «Copied». →
- [ ] **StickyActionBar** · `actions-stickyactionbar--bulk-selection` · Выбери строку, потом ещё одну. Ожидаю: сообщение панели («1 selected», «2 selected») каждый раз. →
- [ ] **Alert** · `status-feedback-alert--default` · Загрузи страницу. Ожидаю: «живой» alert читается сам; статичный баннер — только когда до него дойдёшь. (Если в сторис нет live-варианта, запиши «только статичный».) →
- [ ] **Toaster** · `status-feedback-toaster--success` · Вызови тост. Ожидаю: заголовок и описание тоста, фокус на месте. Ещё `status-feedback-toaster--error-with-retry`. →
- [ ] **UndoToast** · `status-feedback-undotoast--default` · Нажми «Delete site». Ожидаю: «Site deleted…», кнопка Undo доступна по Tab. →
- [ ] **FeedbackWidget** · `status-feedback-feedbackwidget--default` · Голос «No», выбери причину, отправь. Ожидаю: благодарность. →
- [ ] **Field** · `form-structure-field--invalid` · Введи неверное значение и уйди с поля. Ожидаю: текст ошибки. →
- [ ] **TimeField** · `date-time-timefield--min-max` · Введи время вне диапазона. Ожидаю: сообщение об ошибке, сразу (assertive). →
- [ ] **PasswordStrengthMeter** · `text-input-passwordstrengthmeter--playground` · Введи слабый пароль, потом сильный. Ожидаю: «Weak» … «Strong» при смене уровня, а не на каждую клавишу. →
- [ ] **TagInput** · `text-input-taginput--default` · Добавь тег (Enter), удали (Backspace). Ожидаю: «… added», «… removed». →
- [ ] **SecretField** · `text-input-secretfield--playground` · Нажми Copy. Ожидаю: тост «Copied». →
- [ ] **PromptArea** · `ai-chat-promptarea--default` · Отправь сообщение. Ожидаю: сообщение «занято», потом «готово». Ещё `ai-chat-promptarea--with-character-limit`: введи больше лимита → ошибка. →
- [ ] **HoldToTalk** · `ai-chat-holdtotalk--default` · Зажми кнопку (VO + Пробел с удержанием или мышью). Ожидаю: «Release to send». →
- [ ] **Chat** · `ai-chat-chat--typing` · Дождись ответа. Ожидаю: индикатор набора, потом новое сообщение. →
- [ ] **Command** · `search-filter-command--inline` · Введи текст, которому ничего не соответствует. Ожидаю: «No results found.» →
- [ ] **FilterField** · `search-filter-filterfield--default` · Примени фильтр, выбери опции. Ожидаю: число применённых / выбранных. Введи несуществующий атрибут: «No matching attributes». →
- [ ] **DataTableToolbar** · `data-datatabletoolbar--default` · Выбери строку, потом ещё одну. Ожидаю: «1 selected», «2 selected». →
- [ ] **Countdown** · `data-countdown--inline` · Дождись нуля (или возьми сторис с самым коротким временем). Ожидаю: текст завершения или «Time's up», один раз. →
- [ ] **Kanban** · `data-kanban--default` · Фокус на карточку, Пробел — взять, стрелки — двигать, Пробел — положить. Ожидаю: взята / перемещена в колонку X, позиция N / положена. Escape во время перетаскивания: отменено. →
- [ ] **Scheduler** · `data-scheduler--week` · Нажми Next, Previous, Today; смени вид. Ожидаю: новый диапазон дат каждый раз. →
- [ ] **ChartRangeSelection** · `charts-chartrangeselection--area` · Фокус на график, несколько раз Shift + Вправо, потом Escape. Ожидаю: значение курсора, выбранный диапазон, «cleared». →
- [ ] **Dropzone** · `files-dropzone--playground` · Выбери файл. Ожидаю: «Uploading…», потом сообщение о готовности с именем файла. →
- [ ] **Lightbox** · `overlays-lightbox--gallery` · Открой, нажми Вправо. Ожидаю: «Image 2 of N: …». →
- [ ] **SwipeDeck** · `motion-swipedeck--default` · Нажми Keep. Ожидаю: «Keep. N left». →
- [ ] **Terminal** · `code-terminal--connection-states` · Переключи состояние соединения. Ожидаю: новый статус («Connecting…», «Connected»). →

### Паттерны

- [ ] **AccessTokens** · `patterns-accesstokens--default` · Отзови токен. Ожидаю: тост с Undo. →
- [ ] **AuditLog** · `patterns-auditlog--default` · Смени фильтр. Ожидаю: новое число результатов. →
- [ ] **Cart** · `patterns-commerce-cart--default` · Примени пустой промокод, потом неверный. Ожидаю: «Enter a promo code.», потом ошибка; фокус остаётся на Apply. →
- [ ] **Comparison** · `patterns-catalog-comparison--default` · Добавь товары к сравнению. Ожидаю: «N of M selected for comparison». →
- [ ] **FacetedList** · `patterns-catalog-facetedlist--default` · Отметь фасет. Ожидаю: число результатов. Сними всё, что совпадает: «No matches.» →
- [ ] **ItemPage** · `patterns-catalog-itempage--default` · Следующее фото в галерее. Ожидаю: позицию нового фото. →
- [ ] **Reviews** · `patterns-catalog-reviews--default` · Отфильтруй по звёздам. Ожидаю: число после фильтра. →
- [ ] **ListView** · `patterns-listview--with-bulk-and-row-actions` · Поиск, потом действие над строкой. Ожидаю: число результатов, потом тост с Undo. →
- [ ] **NotificationsInbox** · `patterns-notificationsinbox--default` · Смени фильтр. Ожидаю: текст результата. →
- [ ] **OnboardingWizard** · `patterns-onboardingwizard--default` · Перейди к следующему шагу. Ожидаю: название шага. Оставь обязательное поле пустым и продолжи: фокус переходит на поле. →
- [ ] **OrderHistory** · `patterns-account-orderhistory--default` · Нажми Show more. Ожидаю: «Showing X of Y». →
- [ ] **PasswordReset** · `patterns-account-passwordreset--request` · Отправь ссылку, потом Resend. Ожидаю: «Link sent again to …». →
- [ ] **Preferences** · `patterns-preferences--default` · Переключи свитч уведомлений. Ожидаю: «Saved». →
- [ ] **SavedItems** · `patterns-account-saveditems--default` · Удали элемент. Ожидаю: тост с Undo. →
- [ ] **SearchBox** · `patterns-search-searchbox--default` · Введи запрос. Ожидаю: число подсказок. →
- [ ] **StatusTracker** · `patterns-account-statustracker--live` · Подожди. Ожидаю: каждую смену шага, потом итог. →
- [ ] **TeamMembers** · `patterns-teammembers--default` · Пригласи с неверным email, потом с верным. Ожидаю: ошибку email, потом тост успеха. →

---

## Часть B — Порядок чтения там, где DOM и экран расходятся (1.3.2) · 17 пунктов · около 30 мин

Эти компоненты расставляют части через CSS, поэтому порядок на слух может отличаться от видимого. Прочитай каждую сторис через VO + A, потом пройди по шагам VO + Вправо.

- [ ] **Dialog** · `overlays-dialog--default` (открой кнопкой: диалог, открытый уже при загрузке, VoiceOver не объявляет) · Заголовок, потом текст, потом кнопки. Если VO + стрелки не двигаются из первого поля, нажми один раз Tab (баг WebKit 311125). Close (вверху справа) читается последним и называется «Close». →
- [ ] **AlertDialog** · `overlays-alertdialog--default` (открой кнопкой) · Заголовок, описание, потом Cancel и действие. И на ширине телефона (там кнопки визуально меняются местами). →
- [ ] **ConfirmDialog** · `overlays-confirmdialog--with-consequences` (открой кнопкой) · Заголовок, список последствий, поле подтверждения, кнопки. →
- [ ] **Drawer** · `overlays-drawer--default` (открой) · Сначала содержимое, Close последним; «ручка» не читается. →
- [ ] **ProductTour** · `overlays-producttour--on-step` · Счётчик шага, заголовок, текст, действия, потом Close. →
- [ ] **Message** · `ai-chat-chat--default` · В отправленных сообщениях (аватар с другой стороны): автор, время, текст — в этом порядке. →
- [ ] **Countdown** · `data-countdown--blocks` · Сначала одна фраза («2 days 4 hours…»), плитки не читаются по цифрам. →
- [ ] **TextEffect** · `motion-texteffect--scramble` · Текст читается один раз, обычным текстом. →
- [ ] **CardStack** · `motion-cardstack--default` · Читается только верхняя карточка, потом кнопки. →
- [ ] **SwipeDeck** · `motion-swipedeck--default` · Верхняя карточка, потом Skip / Keep, потом статус. →
- [ ] **Marquee** · `motion-marquee--default` · Каждый элемент читается один раз (дубликат пропускается). →
- [ ] **Calendar** · `date-time-calendar--single` · Предыдущий / следующий месяц, название месяца, потом сетка. →
- [ ] **Scheduler** · `data-scheduler--week` на ширине телефона · Заголовок диапазона, кнопки и список дней в разумном порядке. →
- [ ] **Table** · `data-table--default` на ширине телефона (строки стопкой) · Каждая строка читается парами «подпись: значение»; действие строки — вместе со своей строкой. →
- [ ] **DataTable** · `data-datatable--basic` · У заголовков, выровненных вправо, читается название (иконка сортировки визуально стоит перед ним). →
- [ ] **AuditLog** · `patterns-auditlog--default` на ширине телефона · Время и событие в каждой строке остаются вместе. →
- [ ] **LoginFormSplit** · `patterns-loginformsplit--default` · Сторона с картинкой (если читается) идёт до формы и не разрывает её. →

Ширина телефона: Safari → Разработка → Режим адаптивного дизайна, размер iPhone.

---

## Часть C — Ключевые сценарии целиком · около 30 мин

Те же проверки в реальных последовательностях. Записывай каждый сценарий и компоненты, которые он покрывает.

- [ ] **Вход** · `patterns-loginform--sign-in-error` · Пройди Tab'ом: подписи вместе с полями, ошибка произносится и связана со своим полем (VO читает её, когда возвращаешься в поле). Покрывает LoginForm, TextField, Field, Button. →
- [ ] **Создание ресурса с ошибками** · `patterns-resourceform--create-database` · Отправь пустую форму: фокус на первой ошибке, каждое поле читает свою ошибку. Покрывает ResourceForm, Select, Switch, NumberField. →
- [ ] **Подтверждение опасного действия** · `overlays-confirmdialog--typed-confirm` · Открой, введи имя, подтверди; фокус возвращается на кнопку, которая открыла диалог. Покрывает ConfirmDialog, AlertDialog. →
- [ ] **Выбор из списка** · `selection-combobox--keyboard-navigation` и `selection-select--playground` · Активная опция произносится, пока ходишь стрелками; на закрытом контроле читается выбранное значение. Покрывает Combobox, Select. →
- [ ] **Работа с таблицей** · `patterns-listview--with-bulk-and-row-actions` · Выбери строки (число произносится), отсортируй колонку (состояние произносится), действие над строкой (тост). Покрывает ListView, DataTable, DataTableToolbar, Toaster. →
- [ ] **Вкладки** · `navigation-tabs--default` · «Tab, 1 of 3, selected»; стрелки переключают вкладки; Tab уводит в панель. Покрывает Tabs. →

---

## Часть D — Всё остальное

Остальные компоненты простые: их порядок чтения подтверждён в ревью кода (заметка 1.3.2 на Docs-странице каждого компонента), и сообщений о состоянии у них нет. Их можно записать позже, отдельным проходом: VO + A на любой одной сторис каждого; достаточно короткой строки вроде «Accordion → pass».

Не нужно: критерии уровня страницы (заголовки страниц, ориентиры по всей странице, skip-ссылки в настоящем приложении) — это задача продукта, а не библиотеки.
