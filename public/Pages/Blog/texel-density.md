# Texel Density

Texel density is the number of texture pixels covering a given area of world space. It is measured in pixels per metre (px/m) or pixels per centimetre (px/cm). A 1024px texture stretched across a 1m surface gives you 1024 px/m. That is the number you are managing when you lay out UVs.

Inconsistency is immediately visible. Two adjacent walls with mismatched texel density will read as wrong even if nobody can name why. Consistency is not a stylistic preference, it is a production standard.

## The formula

Texel Density = Texture Resolution / World Size

A 2048 texture on a 2m object: 2048 / 2 = 1024 px/m.

To find the UV scale required for a target density: UV Scale = (Target TD x World Size) / Texture Resolution.

## Picking a target

Camera proximity drives the number. Top-down or strategy games typically sit around 256 px/m. Third-person is around 512 px/m. First-person is around 1024 px/m. These are reference points, not hard rules.

Hero assets and high-frequency detail areas like hands or faces can justify a higher budget. Background geometry can take less. What matters is that assets at the same viewing depth share a consistent value. Variation should be a deliberate decision, not an accident.

## UV types

Unique UVs give you full control. Each island can be scaled independently to hit the target, and you get full use of the texture sheet for that asset.

Tiling textures handle density differently. The repeat frequency effectively sets it, so you are trading unique detail for scalability. That works well on large flat surfaces and poorly anywhere that needs variation.

Trim sheets sit between the two. Islands are placed deliberately across a shared atlas with each strip designed to tile along one axis. Density management becomes about placement rather than free scaling.

## In a pipeline

Define the target before artists start UVing. Correcting it across a finished asset library takes a long time and is easy to get wrong. Most DCC tools have a texel density checker. Use it at review as a pass/fail gate, not as a cleanup step at the end.

For modular environments, set density per module tier (hero, mid, background) and hold to it. If artists are making judgment calls about whether something is close enough, the spec is not clear enough.

Texel density problems compound. One outlier is a minor note. Thirty outliers is a visible quality issue across the whole level. Fixing it at the UV stage takes minutes. Fixing it during engine polish takes days.
