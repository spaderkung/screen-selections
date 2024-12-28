# Documentation

# `class BoxRegionSelector`

Mouse selection of a box region.

Add event listeners for an BoxRegionSelectorEvent or read the event_info, which is either null or contains an event.

If a callback for event listeners is within a class instance, it must be defined as:

on_box_dragged = (e) => { ... }

Or else the "this" context is lost when processing the callback.

 * **Author:** Jon Bolmstedt

## `usage`
Call update(...) with mouse info continuously.

## `get drags()`

 * **Returns:** `boolean` — True for the first drag

## `get dragging()`

 * **Returns:** `boolean` — True during dragging

## `get dragged()`

 * **Returns:** `boolean` — True at the end of drag

## `get event_info()`

The returned BoxRegionSelectorEvent

## `add_event_callback(f, type)`

Add event callback

 * **Parameters:**
   * `f` — `object` — Your callback method
   * `type` — `string` — The BoxRegion.EVENT_TYPE

## `remove_event_callback(f, type)`

Remove event callback

 * **Parameters:**
   * `f` — `object` — Your callback method
   * `[type]` — `string` — Optional: The BoxRegion.EVENT_TYPE

## `update(mouse_coord, mouse_pressed, key_shift, key_alt, key_ctrl)`

Update - call continuously.

 * **Parameters:**
   * `{array<number,` — mouse_coord
   * `mouse_pressed` — `boolean` — 
   * `[key_shift]` — `boolean` — 
   * `[key_alt]` — `boolean` — 
   * `[key_ctrl]` — `boolean` — 

# `class BoxRegionSpriteSelector`

A box region sprite selector for p5.play.

Shift - Add single sprite or a region Alt - Remove single sprite or a region

Once an area is selected the sprites from the sprite pool Group that are within the area are added to the selected Group. If no pool group is specified then the allSprites Group is used.

Read selected

 * **Parameters:**
   * `selected` — `object` — Group with selected Sprites.
   * `pool` — `object` — Group of Sprites that are evaluated for selection.
   * `debug_colorize` — `boolean` — Colorize the selected sprites.
   * `debug_color_selected` — `string` — Color for the selected sprites in debug mode
 * **Author:** Jon Bolmstedt

## `usage`
Call update() without parameters in the game loop.

# `class Snapper`

Various possibilities for snapping.

snap_to_grid(pos, grid_size) can be used as a static method.

Configurations (used only in the user program):

snap_screen: Snap to screen coordinates (default)

snap_relative: Snap to relative movement

Usage: Snap to screen:

snapped_pos = snap_to_grid(pos, grid_size)

Usage: Snap relative:

First calculate the mouse (or object) relative movement: pos_relative = current_pos - pos_start

Then call snap_to_grid, but then add the snapped relative position: object_pos = snapped_pos + pos_start

 * **Author:** Jon Bolmstedt


# `class KeyMoves`

Blender-like key controls for moving.

Provide a collection of objects to have their .x, .y affected by mouse movement or keyboard input (e.g., 123.45).

g: Start moving

x: Constrain to x-direction

y: Constrain to y-direction

esc, rmb: cancel

 * **Parameters:** `selected` — `Object[]` — A collection of Objects with .x, .y to be affected by the move.
 * **Author:** Jon Bolmstedt

## `usage`
Call update() in main loop.

## `selected = []`

Provide a collection of objects to have their .x, .y affected by mouse movement


## `snapper =`

(optional) Provide a snapper configuration


## `get move_started()`

True once when movement starts.

## `get move_completed()`

True once when movement completes.
