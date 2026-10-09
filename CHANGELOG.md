# Changelog

The release workflow uses the section named after the version being released
as the release description, so every version needs one. `npm version <x.y.z>`
renames the `Unreleased` heading below to that version.

## Unreleased

- New **Open the callout overview** command: a sidebar that lists every callout item in the current note or the whole vault, grouped by callout with counts, with a filter per callout and click to jump to the line.

## 0.1.1

- Settings now show up in Obsidian's settings search (1.13 and later), with native add, delete and reorder for callouts. Fixes the directory review: the minimum Obsidian version is now 1.0.0, which the colour picker needs. Rounded corners no longer use the slow CSS :has() selector.

## 0.1.0

- First release: list items that start with a character and a space (`& ? !
  ~ @ $ %` by default, the same as List Callouts) are coloured in Live
  Preview, Source mode and Reading view. Wrapped lines take the item's colour.
  Commands to toggle, cycle, pick and remove a callout. Settings for each
  callout's character, name, colour and icon, and an import of List Callouts'
  settings.
