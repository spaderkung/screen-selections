
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

  /**
   * Demo
   */
  demo() {
    this.box_selector = new BoxRegionSelector()
    this.box_selector.debug = true
    this.box_selector.add_event_callback(this.callback_1, BoxRegionSelector.EVENT_TYPES.drags)
    this.box_selector.add_event_callback(this.callback_2, BoxRegionSelector.EVENT_TYPES.dragging)
    this.box_selector.add_event_callback(this.callback_3, BoxRegionSelector.EVENT_TYPES.dragged)
  }

  callback_1 = (e) => {
    console.log("callback_1")
    console.log(e)
  }

  callback_2 = (e) => {
    console.log("callback_2")
    console.log(e)
  }

  callback_3 = (e) => {
    console.log("callback_3")
    console.log(e)
  }

  callback_4 = (e) => {
    console.log("callback_4")
  }

  callback_5 = (e) => {
    console.log("callback_4")
  }

  callback_6 = (e) => {
    console.log("callback_4")
  }
}


let bst = new BoxRegionSelectorTester()

// Reserved name for P5 library. This function will be called once.
function setup() 
{
  frameRate(50)
  createCanvas(600, 600);
  console.log("start dragging");

  bst.demo()
}


// Reserved name for P5 library. This function will be called repeatedly.
function draw() {
  background("#131516");
  
  // sprite_selector.update()
  bst.box_selector.update([mouse.x, mouse.y], mouse.pressing() > 0)

}


