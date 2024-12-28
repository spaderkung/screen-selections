
// Internet access required for P5 script reference in the index.html.

// If other files contains class definitions, then include them in the
//  html:
//    <script src="class_file.js"></script>
//    <script src="sketch.js"></script>

// To read files or images, a local web server must be used.
// https://simplewebserver.org/download.html//
//
// Instead of running index.html, surf to for instance http://127.0.0.1:8887
//   or whatever the web server was configured for. 

// Before an image can be loaded, the createCanvas must be done.

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
class xBoxRegionSpriteSelector {
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


let sprite_selector = new BoxRegionSpriteSelector()
let snapper = new Snapper()
let key_moves = new KeyMoves()
key_moves.snapper = snapper
snapper.snap_relative = true
snapper.GRID_SIZE = [10, 10]
key_moves.selected = sprite_selector.selected


// Reserved name for P5 library. This function will be called once.
function setup() 
{
  frameRate(50)
  createCanvas(600, 600);
  console.log("Drag canvas with MMB");
  console.log("Toggle snapping with s");
  console.log("Select sprites with mouse");
  console.log("Move with g");

  // Test sprites
  for (let i = 0; i < 20; i++) {
    let x = random(width*0.25, width*0.75)
    let y = random(height*0.25, height*0.75)
    let s = new Sprite(x, y, 10, "k")
    s.strokeWeight = 0
  }
}


// Reserved name for P5 library. This function will be called repeatedly.
function draw() {
  background("#131516")

  sprite_selector.update()
  key_moves.update()

  // Toggle snapping
  if (kb.presses("s")) {
    if (snapper.snap_relative) {
      snapper.snap_screen = true
    }
    else if (snapper.snap_screen) {
      snapper.snap_screen = false
    }
    else {
      snapper.snap_relative = true
    }
    console.log(`Snapper screen: ${snapper.snap_screen}, relative: ${snapper.snap_relative}`)
  }

  // Drag the canvas
  if (mouse.pressing("middle")) {
    if (camera) {
      // Reposition camera with x, y. Using pos.x, y messes everything up.
      camera.x -= movedX
      camera.y -= movedY
    }
  }
}


