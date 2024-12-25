
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
 * Call update() in the loop or add an event listener.
 * Read .region
 *   [x0, y0, x1, x1] - corners if a selection was made
 *   null - otherwise
 * 
 * set_event_callback(function)
 * 
 * remove_event_callback(function)
 * 
 * debug(bool) - Draw debug box
 * 
 * update() - Call continuously
 * 
 * drags : bool - True for the first drag
 * 
 * dragging : bool - True during dragging
 * 
 * dragged : bool - True at the end of drag
 * 
 * Requires p5.play for mouse events.
 */

/** Event type for the box region selector.
 * 
 */
class BoxRegionSelectorEvent {
  type = BoxRegionSelector.EVENT_TYPES
  region = [0, 0, 0, 0]
  shift = false
  alt = false
  ctrl = false
}

/** Mouse selection of a box region.
 * 
 * Add event listeners for an BoxRegionSelectorEvent or read the event_info, which is either 
 * null or contains an event.
 * 
 * Call update(...) with parameters continuously.
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

  get drags() {
    return this.#drags
  }

  get dragging() {
    return this.#dragging
  }

  get dragged() {
    return this.#dragged
  }

  get event_info() {
    return this.#event_info
  }

  /** Add event callback
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

  /** Remove event callback
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

  /** Update - call continuously.
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

  /** Private method for adding a callback from a set of callbacks.
   *
   * @param {*} arr
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

  /** Private method for removing a callback from a set of callbacks.
   *
   * @param {*} arr
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


/*


4. Private Helper Methods
#add_callback
Test that the method adds callbacks to a given list and prevents duplicates.
#remove_callback
Test that the method removes callbacks from a given list and handles cases where the callback does not exist.

5. Invalid Input Handling
add_event_callback
Pass an invalid type and verify that a TypeError is thrown.
Pass undefined as the type and verify that a TypeError is thrown.
remove_event_callback
Pass an invalid type and ensure a TypeError is thrown.
update
Pass invalid values for mouse_coord and verify that it fails gracefully.
Test update with missing or invalid modifier key parameters to ensure default values are applied correctly.

6. Debug Mode
Enable debug and test that the debug box is drawn using rect in the p5 context.
Verify that disabling debug prevents any debug rendering.

*/

class BoxRegionSelectorTester {
  box_selector

  /** Constructor Initialization
   *Verify that the drags_event_callbacks, dragging_event_callbacks, and dragged_event_callbacks arrays are initialized as empty.
   *Check that private fields (#event_info, #drags, #dragging, etc.) are initialized correctly.
   *Confirm that debug is set to false.
   */
  test_1() {
    this.box_selector = new BoxRegionSelector()
    console.assert(this.box_selector.debug == false)

    console.assert(this.box_selector.drags == false)
    console.assert(this.box_selector.dragging == false)
    console.assert(this.box_selector.dragged == false)

    console.assert(this.box_selector.event_info == null)

    // this.box_selector.add_event_callback(this.callback_1, BoxRegionSelector.EVENT_TYPES.drags)
    // this.box_selector.add_event_callback(this.callback_2, BoxRegionSelector.EVENT_TYPES.dragging)
    // this.box_selector.add_event_callback(this.callback_3, BoxRegionSelector.EVENT_TYPES.dragged)

    // // Use the same callback for two events.
    // this.box_selector.add_event_callback(this.callback_2, BoxRegionSelector.EVENT_TYPES.drags)

    // // Remove a callback from any and all of the event types.
    // this.box_selector.remove_event_callback(this.callback_2)
  }

  /** 2. Event Callback Management
   *Adding Callbacks
   *Test adding a callback to each event type (drags, dragging, dragged).
   *Ensure that duplicate callbacks are not added.
   *
   *Removing Callbacks
   *Test removing a callback from a specific event type.
   *Verify that removing a non-existent callback does not affect the event lists.
   *Test removing callbacks without specifying the event type (should remove from all lists).
   *Ensure callbacks are only removed from the intended lists when the type parameter is provided.
   */
  test_2() {
    this.box_selector = new BoxRegionSelector()
    this.box_selector.add_event_callback(this.callback_1, BoxRegionSelector.EVENT_TYPES.drags)
    this.box_selector.add_event_callback(this.callback_2, BoxRegionSelector.EVENT_TYPES.dragging)
    this.box_selector.add_event_callback(this.callback_3, BoxRegionSelector.EVENT_TYPES.dragged)
    this.box_selector.add_event_callback(this.callback_3, BoxRegionSelector.EVENT_TYPES.dragged)  // Should not be added.

    this.box_selector.update([10, 0], true) // Drags - obs första loop så kommer inte dragging även om flyttat...
    console.assert(this.box_selector.event_info.region[0] == 10)
    console.assert(this.box_selector.event_info.region[1] == 0)

    this.box_selector.update([20, 0], true) // Dragging
    console.assert(this.box_selector.event_info.region[0] == 10)
    console.assert(this.box_selector.event_info.region[1] == 0)
    console.assert(this.box_selector.event_info.region[2] == 20)
    console.assert(this.box_selector.event_info.region[3] == 0)
    // this.box_selector.update([20, 0], false) // Dragged

    // this.box_selector.update([0, 0], true) // Drags - obs första loop så kommer inte dragging.

    // Remove wrong callback
    this.box_selector.remove_event_callback(this.callback_1, BoxRegionSelector.EVENT_TYPES.dragged)

    // Remove correct callback (one at a time)
    // this.box_selector.remove_event_callback(this.callback_1, BoxRegionSelector.EVENT_TYPES.drags)
    // this.box_selector.remove_event_callback(this.callback_2, BoxRegionSelector.EVENT_TYPES.dragging)
    // this.box_selector.remove_event_callback(this.callback_3, BoxRegionSelector.EVENT_TYPES.dragged)
    
    // Remove without specifying wher form
    this.box_selector.remove_event_callback(this.callback_2)
  }


  callback_1 = () => {
    console.log("callback_1")
  }

  callback_2 = () => {
    console.log("callback_2")
  }

  callback_3 = () => {
    console.log("callback_3")
  }

  callback_4 = () => {
    console.log("callback_4")
  }

  callback_5 = () => {
    console.log("callback_4")
  }

  callback_6 = () => {
    console.log("callback_4")
  }
}








/**
 * A box region sprite selector for p5.play.
 * 
 * Once an area is selected the sprites from the sprite pool Group that 
 * are within the area are added to the selected Group.
 * 
 * If no pool group is specified then the allSprites Group is used.
 * 
 * @param {object} selected Group with selected Sprites.
 * @param {object} pool Group of Sprites that are evaluated for selection.
 * @author Jon Bolmstedt
 */
class BoxRegionSpriteSelector {
  constructor() {
    this.debug_colorize = true
    this.debug_colorize_on = "red"
    this.debug_colorize_off = "white"

    this.selected
    this.pool
    this.pending_clear = false
    this.box_selector = new BoxRegionSelector()
    this.box_selector.debug = true
    this.box_selector.add_event_callback(this.on_box_dragged, BoxRegionSelector.EVENT_TYPES.dragged)
  }

  /**
   * Call continuously.
   */
  update() {
    if (this.selected === undefined) {
      this.selected = new Group()
    }

    if (this.pool === undefined) {
      this.pool = allSprites
    }

    // Clicking without modifiers clears the selections.
    if (mouse.presses() && kb.pressing("shift") <= 0 && kb.pressing("alt") <= 0) {
      this.clear_selection()
    }

    this.box_selector.update(
      [mouse.x, mouse.y],
      mouse.pressing(),
      kb.pressing("shift") > 0,
      kb.pressing("alt") > 0,
      kb.pressing("ctrl") > 0
    )
  }

  /** Callback for completed drag.
   *
   * Define callback method as a class property using an arrow function.
   * This ensures that the "this" context is bound to the class instance.
   * @param {*} e
   */
  on_box_dragged = (e) => {
    for (let sprite of this.pool) {
      if (this.point_within_box([sprite.x, sprite.y], e.region)) {
        if (e.alt) {
          this.selected.remove(sprite)
          if (this.debug_colorize) {
            sprite.fill = this.debug_colorize_off
          }
        } else {
          this.selected.add(sprite)
        }
      }
    }

    // Mark selected
    if (this.selected.length > 0 && this.debug_colorize) {
      this.selected.fill = this.debug_colorize_on
    }
  }

  /** Clears the selected Group.
   *
   * If debug: sets the Sprites colors to the "off" color.
   */
  clear_selection() {
    if (this.selected.length > 0) {
      if (this.debug_colorize) {
        this.selected.fill = this.debug_colorize_off
      }
    }
    this.selected = new Group()
  }

  /** Determines if a point is within a box region.
   *
   *
   * @param {number[2]} p Point to check.
   * @param {number[4]} box Region with any two opposing corners.
   * @returns {boolean} True: within, False: Outside or on border.
   */
  point_within_box(p, box) {
    // Assume that region is not always top-left to bottom-right.
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
}

let sprite_selector = new BoxRegionSpriteSelector()

let bs = new BoxRegionSelector()

let bst = new BoxRegionSelectorTester()

// Reserved name for P5 library. This function will be called once.
function setup() 
{
  frameRate(50)
  createCanvas(600, 600);
  console.log("ok");

  // Test sprites
  for (let i = 0; i < 20; i++) {
    let x = random(width*0.25, width*0.75)
    let y = random(height*0.25, height*0.75)
    let s = new Sprite(x, y, 10, "k")
    s.fill = "white"
    s.strokeWeight = 0
  }

  bs.debug = true

  bst.test_2()

}


// p5 play method called before draw()
function update() {

}




// Reserved name for P5 library. This function will be called repeatedly.
function draw() {
  background("#131516");
  
  // sprite_selector.update()
  bs.update([mouse.x, mouse.y], mouse.pressing() > 0)

  // Poll result from BoxSelector
  // if (box_selector.drags) {
  //   console.log("drags")
  // }

  // if (box_selector.dragging) {
  //   console.log("dragging")
  // }

  // if (box_selector.dragged) {
  //   console.log("dragged")
  // }

  // if (box_selector.region != null) {
  //   console.log(box_selector.region)
  // }

  // box_selector.debug = true
  // box_selector.update()

  // Try the p5 mouse events.
  // if (mouse.drags()) {
  //   console.log("Drag started at: " + mouse.pos)
  // }

  // if (mouse.dragging()) {
  //   console.log("Dragging: " + mouse.dragging())
  // }

  // if (mouse.dragged()) {
  //   console.log("Drag complete at: " + mouse.pos)
    
  //   if (kb.pressing("shift")) {
  //     console.log("Dragged while shift.")
  //   }

  //   if (kb.pressing("alt")) {
  //     console.log("Dragged while alt.")
  //   }

  //   if (kb.pressing("ctrl")) {
  //     console.log("Dragged while ctrl.")
  //   }
  // }

}


