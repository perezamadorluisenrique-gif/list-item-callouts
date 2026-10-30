# Changelog

The release workflow uses the section named after the version being released
as the release description, so every version needs one. `npm version <x.y.z>`
renames the `Unreleased` heading below to that version.

## 0.4.0

- Items nested under a callout now take its colour in the editor (Live Preview and source mode), as they already did in Reading view; a nested callout keeps its own colour. The new **Colour nested items** setting turns it off.
- Each callout can have a text colour besides its background, with a warning when the contrast is low in the light or dark theme.
- A child item whose callout is far above the viewport in a long note is now coloured.

## 0.3.2

- On a phone, **Open the callout overview** now shows the overview. The sidebar drawer used to open on whichever tab it showed last, such as Backlinks.

## 0.3.1

- The callout overview no longer misses the callouts that come after a `$$` written in inline code, or after a `$$` that nothing closes.

## 0.3.0

- Interface available in 8 more languages (Simplified Chinese, Japanese, Korean, Spanish, German, French, Brazilian Portuguese and Russian), following Obsidian's language setting.

## 0.2.0

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
