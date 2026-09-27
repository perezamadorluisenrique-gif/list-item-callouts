# List Item Callouts

Highlight a single list item as a coloured callout by starting it with a
character and a space:

```markdown
- & Milk, and the good bread
- [ ] ! Pay the rent before Friday
1. ? Ask Ana about the tickets
- @ Meet Tom at the station
```

![A shopping list in Live Preview: the "&" item has a yellow background, the "!" task a red one and the "?" item an orange one; "$5 each" and a code block are left alone](https://raw.githubusercontent.com/perezamadorluisenrique-gif/list-item-callouts/main/docs/live-preview.png)

It works in Live Preview, in Source mode and in Reading view, on desktop and
on mobile, in bullet, numbered and task lists.

## Coming from List Callouts

This plugin reads the same syntax as
[List Callouts](https://github.com/mgmeyers/obsidian-list-callouts), which has
not had a release since 2024, with the same characters and colours by
default, so notes written for it look the same. **Settings → Import from List
Callouts** copies the characters, colours and icons you set up there.

What is different:

- **Long notes keep their colours.** List Callouts stops drawing callouts when
  Obsidian has not finished reading a long note
  ([#75](https://github.com/mgmeyers/obsidian-list-callouts/issues/75),
  [#80](https://github.com/mgmeyers/obsidian-list-callouts/issues/80)). This
  plugin reads the lines on screen itself, so it never gives up.
- **Wrapped lines are coloured** with the item they belong to
  ([#48](https://github.com/mgmeyers/obsidian-list-callouts/issues/48),
  [#18](https://github.com/mgmeyers/obsidian-list-callouts/issues/18)), and in
  Reading view a callout item's sub-list sits inside its colour.
- **Commands** to add, change and remove a callout
  ([#47](https://github.com/mgmeyers/obsidian-list-callouts/issues/47),
  [#57](https://github.com/mgmeyers/obsidian-list-callouts/issues/57),
  [#71](https://github.com/mgmeyers/obsidian-list-callouts/issues/71)), each
  with an icon for the mobile toolbar.
- **Names for callouts**, shown in the picker, so you remember what `~` was for.

## The callouts

| Character | Default meaning | Colour |
|---|---|---|
| `&` | Highlight | yellow |
| `?` | Question | orange |
| `!` | Important | red |
| `~` | Aside | purple |
| `@` | Person or place | cyan |
| `$` | Money | green |
| `%` | Low priority | grey |

The character needs a space after it, so `- $5 each` stays a plain item. In
**Settings** you can change any character (one to three characters, such as
`!!` or `★`), its name and colour, show a [Lucide](https://lucide.dev) icon in
its place, add your own callouts, and restore the defaults. Code blocks, maths
and properties are never coloured.

## Commands

| Command | What it does |
|---|---|
| Toggle callout on the list item | Adds the first callout to the item under the cursor, or takes its callout away. A line that is not a list item becomes one. |
| Cycle callout type on the list item | Moves to the next callout in the list, and after the last back to none. |
| Remove callout from the list item | Takes the callout away. |
| Make the list item a callout… | Picks a callout by name or character from a list. |

Each works on every line of the selection, in one step of the undo history.
None has a hotkey by default; assign them in **Settings → Hotkeys**.

## Styling

The background strength is a CSS variable, `--lic-bg-opacity` (0.12 in light
themes, 0.18 in dark ones), and the corners follow `--lic-radius`. Override
them in a CSS snippet. Every callout line carries `data-lic="&"` (the
character), for snippets that style one callout differently.

## Privacy

Everything happens in the editor. No network access, no telemetry.

## Installing

In Obsidian, open **Settings → Community plugins → Browse** and search for
"List Item Callouts".

## More plugins by Siulved54

| Plugin | What it does | Source |
| --- | --- | --- |
| [Shared Blocks](https://obsidian.md/plugins?id=shared-blocks) | Write a block of text once and reuse it in any note. Edit the source and every reference re-renders live. | [shared-blocks](https://github.com/perezamadorluisenrique-gif/shared-blocks) |
| [Text Case and Cleanup](https://obsidian.md/plugins?id=text-format) | Change case, make camelCase or slugs, sort lines and remove duplicates, and repair text pasted out of a PDF, without touching code or URLs. | [text-format](https://github.com/perezamadorluisenrique-gif/text-format) |
| [Typography as You Type](https://obsidian.md/plugins?id=typography-as-you-type) | Curly quotes, dashes and ellipses as you type, kept out of code and maths, with Backspace to take one back. | [smart-typography-plugin](https://github.com/perezamadorluisenrique-gif/smart-typography-plugin) |
| [Section Numbering](https://obsidian.md/plugins?id=section-numbering) | Number headings as an outline (1, 1.1, 1.2) and keep every link to them working when they renumber. | [section-numbering](https://github.com/perezamadorluisenrique-gif/section-numbering) |
| [Spreadsheet to Table](https://obsidian.md/plugins?id=spreadsheet-to-table) | Paste cells from Excel or Google Sheets as a Markdown table with a real header, insert CSV files, and copy tables back out. | [spreadsheet-to-table](https://github.com/perezamadorluisenrique-gif/spreadsheet-to-table) |
| [Hybrid Line Numbers](https://obsidian.md/plugins?id=hybrid-line-numbers) | Relative and hybrid line numbers for Vim-style jumps, where a folded section counts as one line. | [hybrid-line-numbers](https://github.com/perezamadorluisenrique-gif/hybrid-line-numbers) |

## License

MIT
