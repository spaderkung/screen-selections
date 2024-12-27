/**
 * Event type for the box region selector.
 *
 */
class BoxRegionSelectorEvent {
  type = BoxRegionSelector.EVENT_TYPES
  region = [0, 0, 0, 0]
  shift = false
  alt = false
  ctrl = false
}

/**
 * Mouse selection of a box region.
 *
 * Add event listeners for an BoxRegionSelectorEvent or read the event_info, which is either
 * null or contains an event.
 *
 * Call update(...) with mouse info continuously.
 *
 * If a callback for event listeners is within a class instance, it must be defined as:
 *
 * on_box_dragged = (e) => { ... }
 *
 * Or else the "this" context is lost when processing the callback.
 * @author Jon Bolmstedt
 */
class BoxRegionSelector {
  static EVENT_TYPES = {
    drags: "drags", // Once at start
    dragging: "dragging", // While dragging
    dragged: "dragged", // Once at end
  }

  debug = false

  #event_info = null
  #drags = false
  #dragging = false
  #dragged = false
  #drag_start_mem = false
  #mouse_old = [0, 0]
  #drags_event_callbacks = []
  #dragging_event_callbacks = []
  #dragged_event_callbacks = []

  /**
   * @return {boolean} True for the first drag
   */
  get drags() {
    return this.#drags
  }

  /**
   * @return {boolean} True during dragging
   */
  get dragging() {
    return this.#dragging
  }

  /**
   * @return {boolean} True at the end of drag
   */
  get dragged() {
    return this.#dragged
  }

  /**
   * The returned BoxRegionSelectorEvent
   *
   */
  get event_info() {
    return this.#event_info
  }

  /**
   * Add event callback
   *
   * @param {object} f Your callback method
   * @param {string} type The BoxRegion.EVENT_TYPE
   */
  add_event_callback(f, type) {
    let added = false
    if (type === undefined) {
      throw new TypeError("Event type must be specified. add_event_callback(f, type)")
    }

    if (type === BoxRegionSelector.EVENT_TYPES.drags) {
      added = this.#add_callback(this.#drags_event_callbacks, f)
    } else if (type === BoxRegionSelector.EVENT_TYPES.dragging) {
      added = this.#add_callback(this.#dragging_event_callbacks, f)
    } else if (type === BoxRegionSelector.EVENT_TYPES.dragged) {
      added = this.#add_callback(this.#dragged_event_callbacks, f)
    } else {
      throw new TypeError("Invalid event type.")
    }
    return added
  }

  /**
   * Remove event callback
   *
   * @param {object} f Your callback method
   * @param {string} [type] Optional: The BoxRegion.EVENT_TYPE
   */
  remove_event_callback(f, type) {
    let removed = false
    if (type !== undefined) {
      // Remove the callback from a specific list.
      if (type === BoxRegionSelector.EVENT_TYPES.drags) {
        removed = this.#remove_callback(this.#drags_event_callbacks, f)
      } else if (type === BoxRegionSelector.EVENT_TYPES.dragging) {
        removed = this.#remove_callback(this.#dragging_event_callbacks, f)
      } else if (type === BoxRegionSelector.EVENT_TYPES.dragged) {
        removed = this.#remove_callback(this.#dragged_event_callbacks, f)
      } else {
        throw new TypeError("Invalid event type.")
      }
    } else {
      // Remove the callback from all lists.
      if (this.#remove_callback(this.#drags_event_callbacks, f)) {
        removed = true
      }

      if (this.#remove_callback(this.#dragging_event_callbacks, f)) {
        removed = true
      }

      if (this.#remove_callback(this.#dragged_event_callbacks, f)) {
        removed = true
      }
    }
    return removed
  }

  /**
   * Update - call continuously.
   *
   * @param {array<number, number>} mouse_coord
   * @param {boolean} mouse_pressed
   * @param {boolean} [key_shift]
   * @param {boolean} [key_alt]
   * @param {boolean} [key_ctrl]
   */
  update(mouse_coord, mouse_pressed, key_shift, key_alt, key_ctrl) {
    this.#event_info = null
    this.#drags = false
    this.#dragged = false

    if (key_shift === undefined) {
      key_shift = false
    }

    if (key_alt === undefined) {
      key_alt = false
    }

    if (key_ctrl === undefined) {
      key_ctrl = false
    }

    // When drag is started:
    if (mouse_pressed && this.#drag_start_mem == false) {
      this.#drag_start_mem = true
      this.#dragging = true
      this.#drags = true

      this.x0 = mouse_coord[0]
      this.y0 = mouse_coord[1]

      this.#mouse_old[0] = mouse_coord[0]
      this.#mouse_old[1] = mouse_coord[1]

      // Respond to all event listeners.
      const e = new BoxRegionSelectorEvent()
      e.alt = key_alt
      e.shift = key_shift
      e.ctrl = key_ctrl
      e.region = [this.x0, this.y0]
      e.type = BoxRegionSelector.EVENT_TYPES.drags

      let arr = this.#drags_event_callbacks
      if (arr.length > 0) {
        for (let f of arr) {
          f(e)
        }
      }

      // Present the event for reading also.
      this.#event_info = e
    }

    if (mouse_pressed == false) {
      this.#drag_start_mem = false
    }

    // While dragging:
    if (this.dragging) {
      // Draw a debug box if p5.
      if (this.debug && p5 !== undefined) {
        rectMode(CORNERS)
        fill(255, 0)
        strokeWeight(1)
        stroke(0, 255, 0)
        rect(this.x0 + 0.5, this.y0 + 0.5, mouse_coord[0] + 0.5, mouse_coord[1] + 0.5)
      }

      // Respond to all event listeners if movement
      if (mouse_coord[0] !== this.#mouse_old[0] || mouse_coord[1] !== this.#mouse_old[1]) {
        // Respond to all event listeners.
        const e = new BoxRegionSelectorEvent()
        e.alt = key_alt
        e.shift = key_shift
        e.ctrl = key_ctrl
        e.region = [this.x0, this.y0, mouse_coord[0], mouse_coord[1]]
        e.type = BoxRegionSelector.EVENT_TYPES.dragging

        let arr = this.#dragging_event_callbacks
        if (arr.length > 0) {
          for (let f of arr) {
            f(e)
          }
        }

        this.#mouse_old[0] = mouse_coord[0]
        this.#mouse_old[1] = mouse_coord[1]

        // Present the event for reading also.
        this.#event_info = e
      }
    }

    // When drag is complete:
    if (mouse_pressed == false) {
      if (this.dragging) {
        this.#dragging = false
        this.#dragged = true

        const e = new BoxRegionSelectorEvent()
        e.alt = key_alt
        e.shift = key_shift
        e.ctrl = key_ctrl
        e.region = [this.x0, this.y0, mouse_coord[0], mouse_coord[1]]
        e.type = BoxRegionSelector.EVENT_TYPES.dragged

        // Respond to all event listeners.
        let arr = this.#dragged_event_callbacks
        if (arr.length > 0) {
          for (let f of arr) {
            // f(this.region)
            f(e)
          }
        }

        // Present the event for reading also.
        this.#event_info = e
      }
    }
  }

  /**
   * Private method for adding a callback from a set of callbacks.
   *
   * @param {*} list
   * @param {*} f
   * @return {boolean} True if success
   */
  #add_callback(list, f) {
    const index = list.indexOf(f)
    if (index === -1) {
      list.push(f)
      return true
    }
    return false
  }

  /**
   * Private method for removing a callback from a set of callbacks.
   *
   * @param {*} list
   * @param {*} f
   * @return {boolean} True if success
   */
  #remove_callback(list, f) {
    const index = list.indexOf(f)
    if (index !== -1) {
      list.splice(index, 1) // Remove the callback
      return true // Indicate removal was successful
    }
    return false // Callback not found in this list
  }
}

/**
 * A box region sprite selector for p5.play.
 * 
 * Shift - Add single sprite or a region 
 * Alt   - Remove single sprite or a region
 *
 * Once an area is selected the sprites from the sprite pool Group that
 * are within the area are added to the selected Group.
 * If no pool group is specified then the allSprites Group is used.
 * 
 * Usage:
 * Call update() without parameters in the game loop.
 * 
 * Read selected
 *
 * @param {object} selected Group with selected Sprites.
 * @param {object} pool Group of Sprites that are evaluated for selection.
 * @param {boolean} debug_colorize Colorize the selected sprites.
 * @param {string} debug_color_selected Color for the selected sprites in debug mode
 * @author Jon Bolmstedt
 */
class BoxRegionSpriteSelector {
  /**
   * Collection of the selected Sprites.
   * @type {Sprite[]}
   * @public
   */
  selected

  /**
   * Group of Sprites that are evaluated for selection.
   * @type {Sprite[]}
   * @public
   */
  pool

  /**
   * Colorize the selected sprites.
   * @type {boolean}
   * @public
   */
  debug_colorize

  /**
   * Color for the selected sprites in debug mode
   * @type {string}
   * @public
   */
  debug_color_selected

  /**
   * Distance from Sprite center for selection.
   * @type {number}
   */
  single_selection_radius

  /**
   * Mouse movement allowed during a click
   * @type {number}
   */
  single_click_move_threshold

  /**
   * Automatically clear removed sprites. Default: true
   * @type {boolean}
   */
  auto_clear_removed

  /**
   * Disables the box selection if a sprite was initially clicked.
   * For a box selection a blank space must be clicked and dragged.
   * @type {boolean}
   */
  disable_region_on_sprite_click

  /**
   * Box selector.
   * @private
   */
  #box_selector

  /**
   * Whether to do a box region update.
   */
  #perform_box_update

  /**
   * For single click detection
   */
  #single_mem = false

  /**
   * For single click detection
   * @type {object} Object with x, y
   */
  #single_pos = { x: 0, y: 0 }

  constructor() {
    this.debug_colorize = true
    this.debug_color_selected = "red"

    this.single_selection_radius = 5
    this.single_click_move_threshold = 3

    this.selected = []
    this.pool

    this.auto_clear_removed = true
    this.disable_region_on_sprite_click = true
    this.#perform_box_update = true

    this.#box_selector = new BoxRegionSelector()
    this.#box_selector.debug = true
    this.#box_selector.add_event_callback(this.#on_box_dragged, BoxRegionSelector.EVENT_TYPES.dragged)
  }

  /**
   * Clears the selected Group.
   */
  clear_all() {
    // Iteration on the array being reduced must start from the end.
    for (let i = this.selected.length - 1; i >= 0; i -= 1) {
      this.remove_sprite_from_selection(this.selected[i])
    }
  }

  /**
   * Clear removed sprites from the selected collection.
   */
  clear_removed() {
    for (let i = this.selected.length - 1; i >= 0; i -= 1) {
      if (this.selected[i].removed) {
        this.remove_sprite_from_selection(this.selected[i])
      }
    }
  }

  /**
   * Adds sprites to the selected group.
   * Colorizes the sprite in debug mode.
   * @param {Sprite[]} sprites
   */
  add_group_to_selection(sprites) {
    for (let sprite of sprites) {
      this.add_sprite_to_selection(sprite)
    }
  }

  /**
   * Adds sprites to the selected group.
   * Colorizes the sprite in debug mode.
   * @param {Sprite} sprite
   */
  add_sprite_to_selection(sprite) {
    if (!sprite || sprite.removed) {
      return false
    }

    if (this.selected.indexOf(sprite) === -1) {
      if (this.debug_colorize) {
        // Add a custom property to the sprite
        sprite.selection_original_color = sprite.fill
        sprite.fill = this.debug_color_selected
      }

      this.selected.push(sprite)
    }
  }

  /**
   * Removes sprites from the selected group.
   * Returns the sprite's original color in debug mode.
   * @param {Sprite[]} sprites An array or a group.
   */
  remove_group_from_selection(sprites) {
    if (sprites.length > 0) {
      for (let sprite of sprites) {
        this.remove_sprite_from_selection(sprite)
      }
    } else {
      throw new TypeError("Use remove_sprite_from_selection for single sprites.")
    }
  }

  /**
   * Removes a sprite from the selected group.
   * Returns the sprite's original color in debug mode.
   * @param {Sprite} sprite A sprite
   */
  remove_sprite_from_selection(sprite) {
    let i = this.selected.indexOf(sprite)
    if (i !== -1) {
      if (this.debug_colorize) {
        // Remove custom property from the sprite
        sprite.fill = sprite.selection_original_color
        delete sprite.selection_original_color
      }

      this.selected.splice(i, 1)
    }
  }

  /**
   * Call continuously. Detects mouse, shift, alt.
   */
  update() {
    // Add all sprites to pool if undefined.
    if (this.pool === undefined) {
      this.pool = allSprites
    }

    // Clear removed sprites
    if (this.auto_clear_removed) {
      this.clear_removed()
    }

    // First press down deselects all, unless a sprite is under the mouse.
    if (mouse.presses() || this.#single_click_detection()) {
      // Get sprite under the mouse from physics body or coordinates.
      let sprite = this.#get_sprite_at_pos(mouse)

      // Disable box region selection if a sprite was clicked and dragged. A box region selection starts
      // only if the drag started from a blank space.
      if (
        mouse.presses() &&
        sprite !== undefined &&
        this.disable_region_on_sprite_click &&
        kb.pressing("alt") == 0 &&
        kb.pressing("shift") == 0
      ) {
        this.#perform_box_update = false
      }

      // Only de-select on first press, don't select. But if the sprite already was selected, keep it.
      if (mouse.presses() && this.#single_click_detection() == false) {
        if (this.selected.indexOf(sprite) === -1) {
          sprite = undefined
        }
      }

      if (kb.pressing("alt") > 0) {
        // Remove a single selection.
        this.remove_sprite_from_selection(sprite)
      } else if (kb.pressing("shift") > 0) {
        // Add to existing selection
        this.add_sprite_to_selection(sprite)
      } else {
        // Add to new selection
        this.clear_all()
        this.add_sprite_to_selection(sprite)
      }
    }

    // Region selection
    if (this.#perform_box_update) {
      this.#box_selector.update(
        [mouse.x, mouse.y],
        mouse.pressing(),
        kb.pressing("shift") > 0,
        kb.pressing("alt") > 0,
        kb.pressing("ctrl") > 0
      )
    }

    if (mouse.pressed()) {
      this.#perform_box_update = true
    }
  }

  /**
   * Gets a sprite at position.
   * @param {object} p
   */
  #get_sprite_at_pos(p) {
    let sprite = world.getSpriteAt(mouse)
    if (sprite === undefined) {
      // No physics body - use distance to anchor point.
      for (let i = 0; i < this.pool.length; i += 1) {
        if (this.pool[i].distanceTo(mouse) <= this.single_selection_radius) {
          sprite = this.pool[i]
          break
        }
      }
    }
    return sprite
  }

  /**
   * Callback for completed drag.
   *
   * Define callback method as a class property using an arrow function.
   * This ensures that the "this" context is bound to the class instance.
   * @param {*} e
   */
  #on_box_dragged = (e) => {
    for (let sprite of this.pool) {
      if (this.#point_within_box([sprite.x, sprite.y], e.region)) {
        if (e.alt) {
          this.remove_sprite_from_selection(sprite)
        } else {
          this.add_sprite_to_selection(sprite)
        }
      }
    }
  }

  /**
   * Determines if a point is within a box region.
   *
   *
   * @param {number[2]} p Point to check.
   * @param {number[4]} box Region with any two opposing corners.
   * @returns {boolean} True: within, False: Outside or on border.
   */
  #point_within_box(p, box) {
    // Flip region if it's not top-left to bottom-right.
    let b = [box[0], box[1], box[2], box[3]]
    if (box[0] > box[2]) {
      b[0] = box[2]
      b[2] = box[0]
    }

    if (box[1] > box[3]) {
      b[1] = box[3]
      b[3] = box[1]
    }

    // Check within top-left to bottom-right region.
    if (p[0] >= b[0] && p[0] <= b[2] && p[1] >= b[1] && p[1] <= b[3]) {
      return true
    } else {
      return false
    }
  }

  /**
   * Determines if there was a single click, no dragging.
   *
   * Call in update()
   */
  #single_click_detection() {
    if (mouse.presses()) {
      this.#single_mem = true
      this.#single_pos = { x: mouse.x, y: mouse.y }
    } else if (mouse.pressed() && this.#single_mem) {
      this.#single_mem = false
      return (
        Math.sqrt((this.#single_pos.x - mouse.x) ** 2 + (this.#single_pos.y - mouse.y) ** 2) <=
        this.single_click_move_threshold
      )
    }

    if (mouse.drags()) {
      this.#single_mem = false
    }
    return false
  }
}
