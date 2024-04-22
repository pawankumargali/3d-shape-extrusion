
## Babylon.js 2D Shape Extrusion and Manipulation

  

A **React + babylon.js** application that allows the user to

- draw arbitrary 2D shapes on the ground plane in **Draw Mode**

- extrude them into 3D objects with a fixed height and via **Extrude Shape**

- Move the objects on the ground plane in **Move Mode**

- Edit the object vertices using buttons for mode selection **Edit Vertex Mode**

  

## Demo
[](https://www.loom.com/share/18abf4f0b6224b9b97a7a14d50066f3c)

Babylon 2D Shape Extrusion and Manipulation - Watch Video

[![](https://cdn.loom.com/sessions/thumbnails/18abf4f0b6224b9b97a7a14d50066f3c-with-play.gif)](https://www.loom.com/share/18abf4f0b6224b9b97a7a14d50066f3c)

## Running the application

Please make sure to have **node.js v18** and **npm v10** installed before proceeding with the steps.

### Prerequisites

Please ensure you have [Node.js v18](https://nodejs.org/) installed on your machine. This project uses yarn as its package manager which you can install using the following command.

```bash

npm i -g yarn

```

### Next Steps

```bash

cd babylon-demo

yarn install

yarn run dev

```

  

## Implementation Details

### Draw Mode

In **Draw Mode**, users can draw arbitrary 2D shapes directly on a ground plane using mouse interactions. This mode is activated by toggling the `isSketchMode` state to `true`.

  

-  **Entering Draw Mode**: The user enters Draw Mode by clicking the "Draw Mode" button, which triggers `toggleSketchMode`. This sets `isSketchMode` to `true`, enabling the drawing functionality.

-  **Drawing Shapes**: While in Draw Mode, clicking on the ground plane creates vertices of a 2D shape. These vertices are captured as `BABYLON.Vector3` points, storing only the `x` and `z` coordinates (with `y` set to 0 to keep them on the ground plane). The points are added to the `points` array state.

-  **Completing Shapes**: The shape is completed by pressing a Shift + clicking on the ground plane, which triggers `completeSketch` via a `useEffect`. This connects the last point to the first, closing the shape and exits sketch mode. The line connections between points are represented by `BABYLON.LinesMesh`, stored in `linesMesh`.  

### Extrude Shape
The **Extrude Shape** functionality allows users to extrude the drawn 2D shape into a 3D object with a fixed height.

-  **Activating Extrude Shape**: After completing a 2D shape in Draw Mode and exiting Draw mode, the user can extrude it into a 3D object by clicking an "Extrude" button. This button triggers the `extrudeShape` function.

-  **Extrusion Process**: The `extrudeShape` function takes the collected points from the `points` array, maps them to a 2D shape on the ground plane, and then extrudes this shape along the `y`-axis to create a 3D object. The height of the extrusion is fixed within the function. The resulting 3D object is added to the `geometries` array and is set as `selectedGeometry` by default and it's index in `geomtries` array is stored as a reference in `targetGeometryIdxRef`

### Move Mode
**Move Mode** enables users to select and move the extruded objects along the ground plane.
-  **Activating Move Mode**: The user enters Move Mode by clicking the "Move Mode" button, which sets `isMoveMode` to `true` through `toggleMoveMode`.

-  **Selecting Objects**: In Move Mode, clicking on an extruded object selects it for movement. This is managed by `pointerDownMoveMode`, which sets the  `targetGeometryIdx`  to track the index of the geometry that has been & `initialOffset` between the mouse pointer's ground position and the object's position for use while moving objects.

-  **Moving Objects**: With an object selected, dragging the mouse moves the object across the ground plane. The `pointerMoveMoveMode` finds the selection via `targetGeometryIdxRef` and updates the position of  selection based on the current ground position plus the `initialOffset`. This allows the object to follow the mouse cursor across the ground plane. The object's new position is continuously updated until the mouse button is released, triggering `pointerUpMoveMode`, which can finalise the position and clears selection and resets the `initialOffset`.

  

### Edit Vertex Mode
**Edit Vertex Mode** allows users to select and move individual vertices of an extruded object, offering fine-grained control over its shape.

-  **Entering Edit Vertex Mode**: Users enter this mode by clicking an "Edit Vertex Mode" button, triggering `toggleVertexEditMode`. This sets `isVertexEditMode` to `true`. A `useEffect` then ensures that a geometry has been selected as target for editing vertices before entering the Edit vertex mode

-  **Editing Vertices**: In Edit Vertex Mode, clicking and dragging a vertex helper(`dragBox`)  allows the user to move the corresponding vertex of the 3D object. This is managed by `pointerDownVertexEditMode` to select the vertex, `pointerMoveVertexEditMode` to drag and update the vertex position, and `pointerUpVertexEditMode` to finalize the position and clear the vertex helper.

 
### General Implementation Notes

  

-  **State Management**: The `useShapeLib` hook manages application state related to drawing, extrusion, movement, and vertex editing. It uses React's `useState` and `useEffect`  and `useRef` for reactive updates.

-  **Interaction Handling**: Mouse interactions are central to the functionality of each mode. The `onPointerObservable` from Babylon.js is used extensively to handle mouse clicks, movements, and selections on the 3D canvas.

-  **Performance Considerations**: The application efficiently manages WebGL resources by disposing of unnecessary meshes and reusing geometries when possible, thanks to careful state management and cleanup logic in functions.

This implementation approach leverages the capabilities of Babylon.js for 3D rendering and React for UI and state management, creating a seamless user experience for editing 3D shapes in the browser.

## Known Issues

-  **Unable to Edit Vertex of Moved Extruded Shapes on First Time Drag Vertex**: After an extruded shape is moved in Move Mode, entering Edit Vertex Mode does not allow for dragging a vertex on the first attempt. However, from the second attempt on, dragging a vertex updates the geometry of the extruded objects. This issue is related state management in React and affects the usability of Edit Vertex Mode for objects that have been previously positioned using Move Mode on the first attempt.