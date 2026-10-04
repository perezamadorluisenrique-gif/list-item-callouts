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
| [Folder Counts](https://obsidian.md/plugins?id=folder-counts) | See how many notes or files each folder holds, right in the file explorer, with a vault total and folder exclusions. | [folder-counts](https://github.com/perezamadorluisenrique-gif/folder-counts) |
| [Note Reading Time](https://obsidian.md/plugins?id=note-reading-time) | Reading time of the current note or your selection in the status bar, optionally saved to a property. | [note-reading-time](https://github.com/perezamadorluisenrique-gif/note-reading-time) |
| [Task Rollover](https://obsidian.md/plugins?id=task-rollover) | Roll unfinished tasks from your last daily note into today's when it is created, with a real undo. | [task-rollover](https://github.com/perezamadorluisenrique-gif/task-rollover) |
| [Zoom Into Section](https://obsidian.md/plugins?id=zoom-into-section) | Zoom into a heading or list item to see only it and its contents, with a breadcrumb bar to climb back out. | [zoom-into-section](https://github.com/perezamadorluisenrique-gif/zoom-into-section) |
| [Link Title on Paste](https://obsidian.md/plugins?id=link-title-on-paste) | Paste a web address and get a Markdown link with the page's title, fetched in the background and undone in one step. | [link-title-on-paste](https://github.com/perezamadorluisenrique-gif/link-title-on-paste) |
| [Update Radar](https://obsidian.md/plugins?id=update-radar) | Checks your installed community plugins for updates in the background, shows what changed, and flags the ones that look abandoned. | [community-update-checker](https://github.com/perezamadorluisenrique-gif/community-update-checker) |
| [Dataview to Bases](https://obsidian.md/plugins?id=dataview-to-bases) | Convert Dataview queries into Bases blocks, and see which queries in your vault can be converted. | [dataview-to-bases](https://github.com/perezamadorluisenrique-gif/dataview-to-bases) |

All of them are in the community directory: Settings -> Community plugins ->
Browse, then search for the name.

## License

MIT
