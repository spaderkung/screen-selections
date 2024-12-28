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
      let sprite = BoxRegionSpriteSelector.get_sprite_at_mouse_pos(this.pool, this.single_selection_radius)

      // Disable box region selection if a sprite was clicked and dragged. A box region selection
      // starts only if the drag started from a blank space.
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
    // Must use screen coordinates if the built-in debug draw is used.
    // Uses screen coordinates, and this is compensated for in the callback on_box_dragged.
    if (this.#perform_box_update) {
      this.#box_selector.update(
        [mouse.canvasPos.x, mouse.canvasPos.y],
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
   * If a sprite has a physics body: the world position is used.
   * 
   * If not: screen position closer than .single_selection_radius
   * 
   * @param {Sprite[]} sprite_pool 
   * @param {number} [d] Allowed screen distance to sprite. Used only if no physics body.
   */
  static get_sprite_at_mouse_pos(sprite_pool, d = 5) {
    let sprite = world.getSpriteAt(mouse)
    if (sprite === undefined) {
      // No physics body - use distance to anchor point.
      for (let i = 0; i < sprite_pool.length; i += 1) {
        if (dist(
          sprite_pool[i].canvasPos.x, sprite_pool[i].canvasPos.y, 
          mouse.canvasPos.x, mouse.canvasPos.y
        ) <= d) {
          sprite = sprite_pool[i]
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
   * @param {BoxRegionSelectorEvent} e
   */
  #on_box_dragged = (e) => {
    for (let sprite of this.pool) {
      // Convert to world coordinates since the region selector uses screen coordinates.
      if (BoxRegionSpriteSelector.point_within_box([sprite.canvasPos.x, sprite.canvasPos.y], e.region)) {
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
  static point_within_box(p, box) {
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

/**
 * Various possibilities for snapping.
 * 
 * snap_to_grid(pos, grid_size) can be used as a static method.
 *  
 * Configurations (used only in the user program):
 * 
 * snap_screen: Snap to screen coordinates (default)
 * 
 * snap_relative: Snap to relative movement
 * 
 * Usage:
 * Snap to screen: 
 * 
 * snapped_pos = snap_to_grid(pos, grid_size)
 * 
 * Usage:
 * Snap relative:
 * 
 * First calculate the mouse (or object) relative movement: 
 * pos_relative = current_pos - pos_start
 * 
 * Then call snap_to_grid, but then add the snapped relative position: 
 * object_pos = snapped_pos + pos_start
 * 
 * @author Jon Bolmstedt
 */
class Snapper {
  #snap_screen = true
  #snap_relative = false
  GRID_SIZE = [20, 20]

  // Getter, setter for snap_screen
  get snap_screen() {
    return this.#snap_screen
  }

  set snap_screen(value) {
    this.#reset_options()
    this.#snap_screen = value
  }

  // Getter, setter for snap_relative
  get snap_relative() {
    return this.#snap_relative
  }

  set snap_relative(value) {
    this.#reset_options()
    this.#snap_relative = value
  }

  /** Snaps to grid
   * Snaps to grid
   * @param {number[]} pos
   * @param {number[]} [grid_size]
   */
  static snap_to_grid(pos, grid_size) {
    if (!grid_size) {
      throw new TypeError("The grid size must be provided.")
    }

    // Round to discrete coordinates.
    let gs = this.#make_grid(pos, grid_size)

    let snapped_pos = []
    for (let i = 0; i < pos.length; i += 1) {
      snapped_pos.push(Math.floor(pos[i] / gs[i]) * gs[i])
    }
    return snapped_pos
  }
  
  /** Returns a grid array with the same dimension as the coordinates.
   * Returns a grid array with the same dimension as the coordinates.
   * @param {*} pos
   * @param {*} grid_zize
   * @returns
   */
  static #make_grid(pos, grid_zize) {
    if (Array.isArray(pos) === false) {
      throw new TypeError("The coordinate must be Number[]")
    }

    let wrong_dimension = false
    if (Array.isArray(grid_zize) == false) {
      wrong_dimension = true
      grid_zize = [grid_zize]
    }
    else if (grid_zize.length !== pos.length) {
      wrong_dimension = true
    }

    let gs = []
    if (wrong_dimension) {
      for (let i = 0; i < pos.length; i += 1) {
        gs.push(grid_zize[0])
      }
    } 
    else {
      for (let i = 0; i < pos.length; i += 1) {
        gs.push(grid_zize[i])
      }
    }
    return gs
  }

  #reset_options() {
    this.#snap_relative = false
    this.#snap_screen = false
  }
}

/** Blender-like key controls for moving.
 * Blender-like key controls for moving.
 * 
 * Provide a collection of objects to have their .x, .y affected by mouse movement or
 * keyboard input (e.g., 123.45).
 * 
 * Call update() in main loop.
 * 
 * g: Start moving
 * 
 * x: Constrain to x-direction
 * 
 * y: Constrain to y-direction
 * 
 * esc, rmb: cancel
 * 
 * @param {Object[]} selected A collection of Objects with .x, .y to be affected by the move.
 * @author Jon Bolmstedt
 */
class KeyMoves {
  #moving = false
  #moving_start_mem = false
  #moving_started = false
  #moving_completed = false
  #moving_start_mouse_coords = false
  #collect_input_distance_x = false
  #collect_input_distance_y = false
  #input = ""
  

  /** Provide a collection of objects to have their .x, .y affected by mouse movement
   * Provide a collection of objects to have their .x, .y affected by mouse movement
   * @type {Sprite[]}
   */
  selected = []

  /** (optional) Provide a snapper configuration
   * (optional) Provide a snapper configuration or a default grid size is used.
   * @type {Snapper}
   */
  snapper = {GRID_SIZE: [20, 20]}

  /** True once when movement starts.
   * True once when movement starts.
   */
  get move_started() {
    return this.#moving_started
  }

  /** True once when movement completes.
   * True once when movement completes.
   */
  get move_completed() {
    return this.#moving_completed
  }

  /** Call in the main loop. Detects keys and mouse.
   * Call in the main loop. Detects keys and mouse.
   *
   * Provide a list of objects to be moved in .selected.
   *
   */
  update() {
    // Reset events
    this.#moving_started = false
    this.#moving_completed = false

    // Select move
    if (kb.presses("g")) {
      this.#moving = true
    } else if (kb.presses("x") && this.#moving) {
      // Input x-offset
      // Constrain to x
      // console.info("Constrain to x")
      this.#collect_input_distance_x = true
      this.#collect_input_distance_y = false
      this.#input = ""
    } else if (kb.presses("y") && this.#moving) {
      // console.info("Constrain to y")
      // Input y-offset
      // Constrain to y
      this.#collect_input_distance_y = true
      this.#collect_input_distance_x = false
      this.#input = ""
    }

    // Collect offset
    if (this.#collect_input_distance_x || this.#collect_input_distance_y) {
      this.#collect()
    }

    // Move it
    if (this.#moving) {
      // Edge in start coords
      if (this.#moving_start_mem === false) {
        // console.info("edge")
        this.#moving_start_mem = true
        this.#moving_started = true
        this.#moving_start_mouse_coords = createVector(mouseX, mouseY)

        for (let sprite of this.selected) {
          sprite.key_moves_start_coords = createVector(sprite.x, sprite.y)
        }
      }

      // Offset selections while moving
      let mouse_diff = p5.Vector.sub(createVector(mouseX, mouseY), this.#moving_start_mouse_coords)
      for (let sprite of this.selected) {
        if (this.#collect_input_distance_y) {
          mouse_diff.x = 0
        }
        if (this.#collect_input_distance_x) {
          mouse_diff.y = 0
        }
        sprite.x = sprite.key_moves_start_coords.x + mouse_diff.x
        sprite.y = sprite.key_moves_start_coords.y + mouse_diff.y

        // Snap to screen grid
        // Positions the next movement at the same screen spacing.
        // Will not maintain the relative coordinates of several objects moved together.
        if (kb.pressing("ctrl") || this.snapper.snap_screen) {
          // Snap to screen grid
          let snapped = Snapper.snap_to_grid([sprite.x, sprite.y], this.snapper.GRID_SIZE)
          sprite.x = snapped[0]
          sprite.y = snapped[1]
        } 
        else if (this.snapper.snap_relative) {
          // Snap to movement grid
          // Equates to calculating and snapping the mouse movement, and adding
          // that offset to the original object coordinates.
          let snapped = Snapper.snap_to_grid([mouse_diff.x, mouse_diff.y], this.snapper.GRID_SIZE)
          sprite.x = sprite.key_moves_start_coords.x + snapped[0]
          sprite.y = sprite.key_moves_start_coords.y + snapped[1]
        }
      }

      // Moving completed
      if (mouse.presses()) {
        this.#moving = false
      } 
      else if (kb.presses("enter") && (this.#collect_input_distance_x || this.#collect_input_distance_y)) {
        this.#moving = false

        // Use the input offset that was entered by keyboard.
        let n
        try {
          n = Number(this.#input)
        } catch (e) {}

        if (n !== undefined) {
          if (this.#collect_input_distance_x) {
            for (let sprite of this.selected) {
              sprite.x += n
            }
          } else if (this.#collect_input_distance_y) {
            for (let sprite of this.selected) {
              sprite.y += n
            }
          }
        }
      } 
      else if (kb.presses("escape") || mouse.right) {
        this.#moving = false

        // Abort and reset coords
        for (let sprite of this.selected) {
          sprite.x = sprite.key_moves_start_coords.x
          sprite.y = sprite.key_moves_start_coords.y
        }
      }
    } else {
      this.#moving_start_mem = false
      this.#collect_input_distance_x = false
      this.#collect_input_distance_y = false
    }
  }

  /** Collects offset info
   * Collects offset info
   */
  #collect() {
    if (kb.presses("0")) {
      this.#input += "0"
    } else if (kb.presses("1")) {
      this.#input += "1"
    } else if (kb.presses("2")) {
      this.#input += "2"
    } else if (kb.presses("3")) {
      this.#input += "3"
    } else if (kb.presses("4")) {
      this.#input += "4"
    } else if (kb.presses("5")) {
      this.#input += "5"
    } else if (kb.presses("6")) {
      this.#input += "6"
    } else if (kb.presses("7")) {
      this.#input += "7"
    } else if (kb.presses("8")) {
      this.#input += "8"
    } else if (kb.presses("9")) {
      this.#input += "9"
    } else if (kb.presses(".")) {
      this.#input += "."
    } else if (kb.presses(",")) {
      this.#input += ","
    } else if (kb.presses("-")) {
      this.#input += "-"
    }
  }
}


/** Drags the canvas by moving the p5.play camera.
 * Drags the canvas by moving the p5.play camera.
 * 
 * Usage:
 * Call update(...) in the game loop.
 * 
 * @param {*} camera
 * @param {boolean} dragging E.g., mouse.pressing("middle")
 * @param {object} pos E.g., {x: mouseX, y:mouseY}
 * 
 * @author Jon Bolmstedt
 */
class CanvasDragger {
  /** True once
   * @type {boolean}
   */
  drag_complete

  /** True once
   * @type {boolean}
   */
  drag_started

  #drag_start_mem = false
  #drag_start_pos = { x: 0, y: 0 }
  #camera_start_pos = { x: 0, y: 0 }
  #mouse_diff = {}

  /** Call in the game loop.
   * Call in the game loop.
   *
   * @param {*} camera
   * @param {boolean} dragging E.g., mouse.pressing("middle")
   * @param {object} pos E.g., {x: mouseX, y:mouseY}
   */
  update(camera, dragging, pos) {
    // Reset events
    this.drag_complete = false
    this.drag_started = false

    if (dragging) {
      if (this.#drag_start_mem === false) {
        this.#drag_start_mem = true

        this.#drag_start_pos.x = pos.x
        this.#drag_start_pos.y = pos.y

        this.#camera_start_pos.x = camera.x
        this.#camera_start_pos.y = camera.y
      }
      if (camera) {
        // Reposition camera with x, y. NOT Using pos.x, pos.y messes everything up.

        // Accumulated movement during the drag.
        this.#mouse_diff.x = pos.x - this.#drag_start_pos.x
        this.#mouse_diff.y = pos.y - this.#drag_start_pos.y

        camera.x = this.#camera_start_pos.x - this.#mouse_diff.x
        camera.y = this.#camera_start_pos.y - this.#mouse_diff.y
      }
    } 
    else {
      if (this.#drag_start_mem) {
        this.#drag_start_mem = false
        this.drag_complete = true
      }
    }
  }
}