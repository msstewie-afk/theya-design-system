**English** · [Русский](WRITING.ru.md)

# Writing interface text

Rules for the words in a Theya interface: buttons, fields, errors, dialogs, toasts, empty states. Each component's Docs page in Storybook has do / don't pairs with real examples; this page collects the rules in one place.

The rules are written for English. For Russian, see the notes at the end; the components' built-in strings are covered in [LOCALIZATION.md](LOCALIZATION.md).

## Basics

- **Sentence case** everywhere: buttons, titles, menu items, tabs, column headers. “Add domain”, not “Add Domain”. Proper names keep their capitals: “Connect to GitHub”.
- **Short.** A label is two or three words, a badge one or two, a tooltip a few. If it needs a sentence, it belongs in a description under the label.
- **Plain words** the person would use themselves: “site”, not “resource instance”. One name for one thing across the product.
- **No “Please”**, no exclamation marks, no blaming (“You entered an invalid…”). Say what to do.
- **No periods** in labels, titles, buttons, menu items, badges and tooltips. Periods go in full sentences: descriptions, field messages, dialog text.
- **Typography:** curly quotes (“ ” ‘ ’) and the apostrophe (’), the ellipsis character (…), the en dash (–) in ranges (10–20) and the multiplication sign (×). Numbers are digits: “3 sites”.

## Buttons and actions

- **A verb, plus the object if it isn’t obvious:** “Save changes”, “Delete domain”, “Issue certificate”.
- Not “OK”, “Yes”, “Submit”, “Confirm”: they make people re-read the question to know what they agree to.
- **One primary action** per view or dialog; the alternatives are quieter (tonal, outlined, ghost).
- An ellipsis (“Rename…”) means the action needs more input before it happens: a dialog or a form opens.
- A disabled action says why next to it — or use `softDisabled`, which stays focusable.
- Links in running text name the destination: “Read about DNS records”, not “click here”.

## Fields

- **The label is always visible** and names the value: “Domain”, “Admin email”. A placeholder is not a label: it disappears as soon as people type.
- **A placeholder shows an example** of the format, not an instruction: `example.com`, not “Enter your domain”.
- **The description** under the field gives the rules people need before typing: format, limits. Not in a tooltip.
- **Optional fields** say “(optional)” (the `optional` prop); required ones get the asterisk.
- **Checkboxes and switches** are worded positively, so checked means yes: “Send weekly report”, not “Don’t send weekly report”.

## Errors

- **Say what’s wrong and how to fix it:** “Add the domain ending, like .com.” Not “Invalid input.”, not “Error 422”.
- **Put the error where the problem is:** under the field it’s about, not only in a banner on top and never in a toast.
- **Don’t blame or alarm:** “Couldn’t reach the server. Check your connection and try again.” Not “Fatal error!”.
- When something failed in the background, say what didn’t happen: “Couldn’t reissue certificate”, with the reason and a Retry.

## Dialogs

- **The title names the task or asks the question with the object:** “Add domain”, “Delete shop.seashell.dev?”. Not “Are you sure?”.
- **The primary button repeats the verb** of the title: title “Delete domain?” → button “Delete domain”. Cancel is “Cancel”.
- **The description says what will happen**, especially what can’t be undone: “The site and its backups will be removed. This can’t be undone.”
- Destructive actions use the danger tone.

## Toasts and notifications

- **The title says what happened, in the past tense:** “Certificate issued”, “Domain removed”. Not “Success!”.
- **The description names the object or detail:** “shop.seashell.dev · valid 90 days”.
- **One action at most:** “Undo”, “Retry”, “View”.
- Field errors don’t go in toasts.

## Empty states

- **The title says what’s empty:** “No sites yet”. Not “No data”: is it broken, loading or empty?
- **The description says what will show up here** or why it matters.
- **One next step:** “Add site”, “Import”, “Clear filters”.
- For a search with no results, show the query and a way out: “Nothing found for ‘wrdpress’” and “Clear search”.

## Status and labels

- Badges: one or two words, and the word says the status too, not only the color: “Expired”, “Active”.
- Status messages say the state and, if needed, the next step: “Backup is 3 days old. Run a backup.”
- Times and dates: relative for the recent past (“5 minutes ago”), absolute beyond a week (“12 Oct 2026”). Formatting follows the locale.

## Russian

- **Sentence case** too: «Добавить домен».
- **Buttons are verbs in the infinitive:** «Сохранить изменения», «Удалить домен». Not «Сохранение», not «ОК».
- **«Вы»** with a lowercase letter, and only when it’s needed: usually a sentence works without it. No «Пожалуйста».
- **Quotes:** «ёлочки» outside, „лапки“ inside. The em dash (—) with spaces in sentences, the en dash (–) without spaces in ranges (10–20).
- **«Ё»** where it’s spelled: «ещё», «удалён».
- **Toasts in the past tense, matching gender:** «Сертификат выпущен», «Копия создана».
- Russian text is about 20–30% longer than English: leave room in buttons, tabs and table headers. The Pseudo language in Storybook (Language → Pseudo) shows where text gets cut off.

## Checklist

- [ ] Sentence case, no periods in labels and buttons
- [ ] Every button is a verb that says what happens
- [ ] Every field has a visible label; the placeholder is only an example
- [ ] Every error says what’s wrong and how to fix it, next to the field
- [ ] Dialog title names the task; the primary button repeats the verb
- [ ] Toasts say what happened, in the past tense
- [ ] Empty states say what’s empty and give the next step
- [ ] Curly quotes, the ellipsis character, no “Please”
