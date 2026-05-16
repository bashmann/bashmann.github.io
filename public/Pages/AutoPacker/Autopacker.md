## Overview

While simplifying and streamlining my games art pipeline I noticed that the process of packing textures was an obvious hold up. Using python I created an Auto-Packer which takes in 3 different textures and gives you control over how you want to channel pack them.

Channel packing is the process of using a textures channels as separate grey-scale maps, such as to reduce the memory cost associated with textures.

## Usage

The first option allows you to specify the export path for the packed texture, after which you select the textures that you want to pack. The program will attempt to grab the suffixes from the textures and construct a combined suffix for the output texture, The user can change this afterwards using the input box next to the name.

## Options

There are then a few options about how you may want to effect the maps before they are output. These include:

- The ability to make the texture be a power of 2, with rounding either to lower, higher or nearest. This is calculated from the smallest measurements of any texture to avoid stretching issues for small textures. These options are blanked out if every channel is already a power of 2 and the same.
- Remap any or all of the source textures, so that the values are 0 -> 1. Which I personally use in order to have greater control over the appearance in engine.
- The format that you want to export the texture in, currently supporting .jpg, .png and .tga. Finally the user can enter an output name. If there are any issues, such as no path, then a warning appears notifying the user of the error.

## Preview

The size of the texture can be seen under the texture output preview. All setting changes are updated in real time and will be displayed in the preview. Finally an output log can be found at the bottom, showing the relevant information for the export.

I plan to add more bits to this tool when I need them but at the moment this handles my everyday use case for textures.
