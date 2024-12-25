# Screen selections
JS clases for mouse region selections and selection of p5.play sprites.

# Documentation

## `class BoxRegionSelectorEvent`

## `class BoxRegionSelector`

Add event listeners for an BoxRegionSelectorEvent or read the event_info, which is either null or contains an event.

Call update(...) with mouse info continuously.

If a callback for event listeners is within a class instance, it must be defined as:

on_box_dragged = (e) => { ... }

Or else the "this" context is lost when processing the callback.

 * **Author:** Jon Bolmstedt

## `get drags()`

 * **Returns:** `boolean` — True for the first drag

## `get dragging()`

 * **Returns:** `boolean` — True during dragging

## `get dragged()`

 * **Returns:** `boolean` — True at the end of drag

## `get event_info()`

## `add_event_callback(f, type)`

 * **Parameters:**
   * `f` — `object` — Your callback method
   * `type` — `string` — The BoxRegion.EVENT_TYPE

## `remove_event_callback(f, type)`

 * **Parameters:**
   * `f` — `object` — Your callback method
   * `[type]` — `string` — Optional: The BoxRegion.EVENT_TYPE

## `update(mouse_coord, mouse_pressed, key_shift, key_alt, key_ctrl)`

 * **Parameters:**
   * `{array<number,` — mouse_coord
   * `mouse_pressed` — `boolean` — 
   * `[key_shift]` — `boolean` — 
   * `[key_alt]` — `boolean` — 
   * `[key_ctrl]` — `boolean` — 

## `#add_callback(list, f)`

 * **Parameters:**
   * `list` — `*` — 
   * `f` — `*` — 
 * **Returns:** `boolean` — True if success

## `#remove_callback(list, f)`

 * **Parameters:**
   * `list` — `*` — 
   * `f` — `*` — 
 * **Returns:** `boolean` — True if success

## `class BoxRegionSpriteSelector`

Once an area is selected the sprites from the sprite pool Group that are within the area are added to the selected Group.

If no pool group is specified then the allSprites Group is used.

 * **Parameters:**
   * `selected` — `object` — Group with selected Sprites.
   * `pool` — `object` — Group of Sprites that are evaluated for selection.
 * **Author:** Jon Bolmstedt

## `update()`

Call continuously.

## `on_box_dragged = (e) =>`

Define callback method as a class property using an arrow function. This ensures that the "this" context is bound to the class instance.

 * **Parameters:** `e` — `*` — 

## `clear_selection()`

If debug: sets the Sprites colors to the "off" color.

## `point_within_box(p, box)`

 * **Parameters:**
   * `p` — `number[2]` — Point to check.
   * `box` — `number[4]` — Region with any two opposing corners.
 * **Returns:** `boolean` — True: within, False: Outside or on border.
