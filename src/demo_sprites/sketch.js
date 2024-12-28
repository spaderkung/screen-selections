
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

const palette_vs_code_dark = [
  "#1F1F1F", //  0 Very Dark Gray
  "#808080", //  1 Medium Gray:    A neutral medium gray, used for subdued elements like inactive UI components.
  "#C8C8C8", //  2 Pale Gray:      A softer, slightly muted gray, used for background or inactive text.
  "#D4D4D4", //  3 Light Gray:     A neutral, slightly soft light gray, commonly used for default text or UI elements.
  "#F44747", //  4 Bright Red:     A bold, attention-grabbing red, often used for errors or warnings.
  "#D16969", //  5 Muted Red:      A soft, muted red, possibly for deprecated or inactive code.
  "#CE9178", //  6 Rusty Orange:   A warm reddish-orange, typically for strings or text literals.
  "#CD9731", //  7 Amber Brown:    A rich amber, suitable for indicating numbers or constants.
  "#D7BA7D", //  8 Gold Sand:      A warm, sandy gold, often used for parameter hints or special code elements.
  "#DCDCAA", //  9 Goldenrod Yellow: A muted yellow, often for highlighting constants or important variables.
  "#B5CEA8", // 10 Pale Green:     A pastel green, often used for strings or interpolated text.
  "#6A9955", // 11 Olive Green:    A muted green, likely used for highlighting comments or code annotations.
  "#4EC9B0", // 12 Turquoise Green: A fresh, cool greenish-blue, associated with special keywords or symbols.
  "#9CDCFE", // 13 Aqua Blue:      A vibrant, icy blue, usually for highlighting important syntax like class names.
  "#4FC1FF", // 14 Light Cyan:     A vibrant light cyan, typically for dynamic elements or active syntax.
  "#569CD6", // 15 Sky Blue:       A bright blue with a slightly muted tone, typically for syntax like function names or variables.
  "#6796E6", // 16 Azure Blue:     A medium-light blue, good for indicating functions or operators.
  "#646695", // 17 Slate Blue:     A cool, dark bluish-purple, sometimes seen in less emphasized syntax like constants.
  "#000080", // 18 Navy Blue:      A deep, dark blue, often associated with keywords or emphasis in code editors.
  "#B267E6", // 19 Amethyst Purple: A vivid purple, often used for highlights or user-defined elements.
  "#C586C0", // 20 Lavender Pink:  A soft pinkish-purple, likely used for special syntax like decorators or attributes.
]


const sprite_selector = new BoxRegionSpriteSelector()
const snapper = new Snapper()
const key_moves = new KeyMoves()
key_moves.snapper = snapper
snapper.snap_relative = true
snapper.GRID_SIZE = [10, 10]
key_moves.selected = sprite_selector.selected
const canvas_dragger = new CanvasDragger()

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
    let x = random(width*0.15, width*0.85)
    let y = random(height*0.15, height*0.85)
    let s = new Sprite(x, y, 15, "k")
    s.strokeWeight = 0
    s.fill = random(palette_vs_code_dark)
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
  canvas_dragger.update(camera, mouse.pressing("middle"), {x: mouseX, y:mouseY})
}


