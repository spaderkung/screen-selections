// jest tests.

// Test Case: Adding Callbacks
const selector = new BoxRegionSelector()
const callback = jest.fn()

selector.add_event_callback(callback, BoxRegionSelector.EVENT_TYPES.drags)
expect(selector.#drags_event_callbacks).toContain(callback)

selector.add_event_callback(callback, BoxRegionSelector.EVENT_TYPES.dragging)
expect(selector.#dragging_event_callbacks).toContain(callback)

// Adding the same callback again should not duplicate
selector.add_event_callback(callback, BoxRegionSelector.EVENT_TYPES.drags)
expect(selector.#drags_event_callbacks.length).toBe(1)



// Test Case: Removing Callbacks
const selector = new BoxRegionSelector()
const callback = jest.fn()

selector.add_event_callback(callback, BoxRegionSelector.EVENT_TYPES.drags)
selector.add_event_callback(callback, BoxRegionSelector.EVENT_TYPES.dragging)

selector.remove_event_callback(callback, BoxRegionSelector.EVENT_TYPES.drags)
expect(selector.#drags_event_callbacks).not.toContain(callback)
expect(selector.#dragging_event_callbacks).toContain(callback)

// Remove from all lists
selector.remove_event_callback(callback)
expect(selector.#dragging_event_callbacks).not.toContain(callback)



// Test Case: Dragging Events
const selector = new BoxRegionSelector()
const callback = jest.fn()

selector.add_event_callback(callback, BoxRegionSelector.EVENT_TYPES.drags)

// Start dragging
selector.update([10, 10], true, false, false, false)
expect(selector.drags).toBe(true)
expect(selector.dragging).toBe(true)
expect(callback).toHaveBeenCalled()

// Dragging motion
selector.update([15, 15], true, false, false, false)
expect(selector.dragging).toBe(true)

// Stop dragging
selector.update([20, 20], false, false, false, false)
expect(selector.dragged).toBe(true)