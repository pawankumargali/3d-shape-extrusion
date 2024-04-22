import { useEffect, useState, useRef } from 'react';
import * as BABYLON from 'babylonjs';
import { defaultGeometryMaterial, dragBoxMaterial, selectedGeometryMaterial } from './material.js';
import earcut from "earcut";

export const useShapeLib = (canvasRef: React.RefObject<HTMLCanvasElement>) => {
  
  //scene 
  const engineRef = useRef<BABYLON.Engine | null>(null);
  const sceneRef = useRef<BABYLON.Scene | null>(null);
  const groundRef = useRef<BABYLON.GroundMesh | null>(null);
  const [camera, setCamera] = useState<BABYLON.ArcRotateCamera | null>(null);

  //shapes
  const [isSketchMode, setIsSketchMode] = useState<Boolean>(false);
  const [isMoveMode, setIsMoveMode] = useState<Boolean>(false);
  const [points, setPoints] = useState<BABYLON.Vector3[]>([]);
  const [isCloseShape, setIsCloseShape] = useState<Boolean>(false);
  const [linesMesh, setLinesMesh] = useState<BABYLON.LinesMesh[]>([]);
  const [geometries, setGeometries] = useState<BABYLON.Mesh[]>([]);
  const targetGeometryIdxRef = useRef<number>(-1);
  const [selectedGeometry, setSelectedGeometry]=useState<BABYLON.Mesh | null>(null);
  const initialOffsetRef = useRef<BABYLON.Vector3 | null>(null);
  const [isVertexEditMode, setIsVertexEditMode] = useState(false);
  const dragBoxRef = useRef<BABYLON.Mesh | null>(null);
  const faceIdRef = useRef<number>(-1);
  const [isDragging, setIsDragging] = useState<Boolean>(false);

  //setup scene
  useEffect(() => {
    if (canvasRef.current) {
      const engine = new BABYLON.Engine(canvasRef.current, true);
      engineRef.current = engine;

      const scene = new BABYLON.Scene(engine);
      sceneRef.current = scene;

      const lighting=new BABYLON.HemisphericLight('light', new BABYLON.Vector3(1,1,1), scene);
      lighting.intensity=0.8;
      
      const camera = new BABYLON.ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 3, 10, BABYLON.Vector3.Zero(), scene);
      camera.attachControl(canvasRef.current, true);
      setCamera(camera);

      const ground = BABYLON.MeshBuilder.CreateGround('groundPlane', { width: 10, height: 10})
      groundRef.current=ground; 

      engine.runRenderLoop(() => {
        scene.render();
      });

      window.addEventListener('resize', () => {
        engine.resize();
      });

      return () => {
        window.removeEventListener('resize', () => engine.resize());
        engine.dispose();
      };
    }
  }, [canvasRef?.current?.id]);
  
  //adjust camera view on toggle of sketch mode
  const adjustViewOnSketchModeToggle = () => {
    if(isSketchMode) {
      setCamera(prevCamera => {
        if(!prevCamera) return null;
        prevCamera.alpha = -Math.PI /2 ; // Or any other adjustments to position it correctly
        prevCamera.beta = -Math.PI/2;
        prevCamera.radius = 10; // Adjust based on the size of your scene
        return prevCamera;
      });
      camera?.detachControl();
    }
    else  {
      setCamera(prevCamera => {
        if(!prevCamera) return null;
        prevCamera.alpha = -Math.PI / 2; // Or any other adjustments to position it correctly
        prevCamera.beta = Math.PI / 3;
        prevCamera.radius = 15; // Adjust based on the size of your scene
        return prevCamera;
      });
      camera?.attachControl(canvasRef.current, false);
    }
  }
  
  //adjust camera view on toggle of sketch mode
  const adjustViewOnMoveModeToggle = () => {
    if(isMoveMode) {

      camera?.detachControl();
    }
    else  {
      camera?.attachControl(canvasRef.current, false);
    }
  }
  
  
  const adjustViewOnVertexDrag = () => {
    if(isDragging) {
      camera?.detachControl();
    }
    else {
      camera?.attachControl(canvasRef.current, false);
    }
  }
  
  const toggleSketchMode = () => setIsSketchMode(prevValue => !prevValue);
  useEffect(() => {
    adjustViewOnSketchModeToggle();
  }, [isSketchMode])

  const toggleMoveMode = () => setIsMoveMode(prevValue => !prevValue);
  useEffect(() => {
    if(isMoveMode==false) {
      geometries.forEach(geom => {
        if(!sceneRef.current) return;
          geom.material=defaultGeometryMaterial(sceneRef.current);
      });
    }
    adjustViewOnMoveModeToggle();
  }, [isMoveMode]);

  const toggleVertexEditMode = () => setIsVertexEditMode(prevValue => !prevValue);
  useEffect(() => {
    if(isVertexEditMode) {
      if(targetGeometryIdxRef.current==-1) {
        alert("Please select an object first to edit vertex");
        toggleVertexEditMode();
        return;
      }
    }
    else {
    }
  }, [isVertexEditMode]);

const addPoint = (point: BABYLON.Vector3) => {
  if(!sceneRef.current) return;
  if(!isSketchMode) return;
    setPoints(prevPoints => [...prevPoints, point]);
};
  
const handleSketch = () => {
    if (!sceneRef.current) return;
    if(!isSketchMode) return;
    const groundPlaneName= groundRef.current?.name ?? '';
    const pickResult = sceneRef.current.pick(sceneRef.current.pointerX, sceneRef.current.pointerY, mesh => mesh.name==groundPlaneName);
    if (!pickResult?.hit) return;
    if(!pickResult.pickedPoint) return;
    addPoint(pickResult.pickedPoint);
};
  
const connectRecentTwoPointsWithLine= () => {
  const line = BABYLON.MeshBuilder.CreateLines(
    `line${points.length}`, {
      points: [points[points.length - 2], points[points.length - 1]],
      updatable: true
    }, sceneRef.current
  );
  line.color = BABYLON.Color3.FromHexString("#00008B");
  linesMesh.push(line);
  setLinesMesh(prevLines => [...prevLines, line]);
}
useEffect(() => {
  if(!sceneRef.current) return;
  if(points.length<=1) return;
  if(!isSketchMode) return;
  connectRecentTwoPointsWithLine();
}, [points.length]);


const toggleCloseShape = () => setIsCloseShape(prevVal => !prevVal);

const completeSketch=() => {
  const line = BABYLON.MeshBuilder.CreateLines(
    `line${points.length+1}`, // Unique name for each line
    {
        points: [
            points[points.length - 1], // last point
            points[0], // first point
        ],
    },
    sceneRef.current
  );
  line.color = BABYLON.Color3.FromHexString("#00008B"); // Dark blue color
  setLinesMesh(prevLines => [...prevLines, line]);
  toggleCloseShape();
  toggleSketchMode();
}
useEffect(() => {
  if(!sceneRef.current) return;
  if(points.length<3) return;
  if(!isCloseShape) return;
    completeSketch();
}, [isCloseShape, points.length]);
  
  
const clearSketch = () => {  
  linesMesh.forEach(line => {
    line.parent=null;
    line.getChildren().forEach(mesh => mesh.dispose());
    line.dispose();

  });
  setPoints([]);
  setLinesMesh([]);

}

const extrudeShape = () => {
  if (!sceneRef.current) return;
  if(points.length < 3) {
    alert('Minimum 3 points are required');
    clearSketch();
    return;
  }

  const shape = points.map(p => new BABYLON.Vector3(p.x, 0, p.z));
  const extrudedMesh = BABYLON.MeshBuilder.ExtrudePolygon(
      `geometry${geometries.length}`,
      {
        shape,
        depth: 1,
        sideOrientation: BABYLON.Mesh.DOUBLESIDE,
        updatable: true,
        wrap: true,
      },
      sceneRef.current,
      earcut
  );

  extrudedMesh.position.y = 1;
  extrudedMesh.convertToFlatShadedMesh();
  extrudedMesh.material = selectedGeometryMaterial(sceneRef.current);
  if(!extrudedMesh.metadata) extrudedMesh.metadata={};
    extrudedMesh.metadata={ geomIndex: geometries.length };
  setGeometries(prevItems => {
    const newItems = [...prevItems, extrudedMesh];
    prevItems.forEach(geom => {
      
      if(sceneRef.current) 
        geom.material=defaultGeometryMaterial(sceneRef.current);
      
    });
    return newItems;
  });
  targetGeometryIdxRef.current=extrudedMesh.metadata.geomIndex;
  setSelectedGeometry(extrudedMesh);
  clearSketch();
}
  

const handleSelectGeometry = (pickInfo: BABYLON.PickingInfo) => {
    if (!sceneRef.current) return;
    const { hit, pickedMesh } = pickInfo;
    if (!hit || !pickedMesh) return;
  
    const selection = geometries.find(geom => geom === pickedMesh) ?? null;
    for(const geom of geometries) {
        if(!sceneRef.current) return;
        geom.material=defaultGeometryMaterial(sceneRef.current);
    }
    let selectionIdx=-1;
    if(selection) {
      selection.material=selectedGeometryMaterial(sceneRef.current);
      selectionIdx=selection.metadata.geomIndex;
    }
    targetGeometryIdxRef.current=selectionIdx;
    setSelectedGeometry(selection);
    // console.log('selectedGeom', '\n',selection);   
    // console.log('REACHED_HERE_AFTER_SETTING_THE_SELECTED_GEOMETRY');
};
  
const getGroundPosition = () => {
    if(!sceneRef.current) return null;
    const groundPlaneName=groundRef?.current?.name ?? "";
    if(!groundPlaneName) return null;
    const pickinfo = sceneRef.current.pick(sceneRef.current.pointerX, sceneRef.current.pointerY, function (mesh) { return mesh.name == groundPlaneName });
    if (!pickinfo.hit) return null;
    return pickinfo.pickedPoint;
};

const pointerDownMoveMode = (pickInfo: BABYLON.PickingInfo) => {
    if (!isMoveMode || !sceneRef.current || !pickInfo.hit || pickInfo.pickedMesh === groundRef.current) return;
    geometries.forEach(geom => {
        if(!sceneRef.current) return;
        geom.material=defaultGeometryMaterial(sceneRef.current);
    });
    const selection = geometries.find(geom => geom.name === pickInfo.pickedMesh?.name);
    let selectionIdx=-1;
    if (selection) {
      selection.material=selectedGeometryMaterial(sceneRef.current);
      const currentPos = getGroundPosition();
      if (currentPos) {
          const offset = selection.position.subtract(currentPos);
          initialOffsetRef.current=offset;
      }
      selectionIdx=selection.metadata.geomIndex;
    }
    targetGeometryIdxRef.current=selectionIdx;
    // setSelectedGeometry(selection ?? null)
};

const pointerMoveMoveMode = () => {
  if (!sceneRef.current || targetGeometryIdxRef.current==-1 || !initialOffsetRef.current) return;

  const currentPos = getGroundPosition();
  
  if (!currentPos) {
    console.error('cannot get ground position');
    return;
  }
  const newPos = currentPos.add(initialOffsetRef.current);
  const selection = geometries.find(geom => geom.metadata.geomIndex==targetGeometryIdxRef.current) ?? null;
  if(!selection) {
    console.error('no geometry selected to move');
    return;
  }
  selection.position=newPos.clone();
  // selection.position.z = newPos.z;
  setSelectedGeometry(selection);
  
};

const pointerUpMoveMode = () => {
    geometries.forEach(geom => {
        if(!sceneRef.current) return;
        if(geom.metadata.geomIndex!=targetGeometryIdxRef.current)
          geom.material=defaultGeometryMaterial(sceneRef.current);
    });
    targetGeometryIdxRef.current=-1;
    setSelectedGeometry(null);
    initialOffsetRef.current=null;
};


const moveOrCreateDragBox = (position: BABYLON.Vector3) => {
  if (!sceneRef.current) return;
  if (!dragBoxRef.current) {
    // Create a drag box if it doesn't exist
    dragBoxRef.current = BABYLON.MeshBuilder.CreateSphere("dragBox", {diameter: 0.2}, sceneRef.current);
    dragBoxRef.current.material = dragBoxMaterial(sceneRef.current);
  }
  // Move the drag box to the position
  dragBoxRef.current.position = position.clone();
};

function findCornerVerticesFromFaceHit(
  pickedMesh: BABYLON.AbstractMesh, // The mesh that was clicked or otherwise interacted with.
  faceId: number // The ID of the face that was hit.
): BABYLON.Vector3[] {
  // Retrieve the index data for the mesh. Indices are integers that reference the vertices array, determining which vertices make up each face of the mesh.
  const indices = pickedMesh.getIndices();
  
  // Retrieve the positions of all vertices in the mesh. This is a flat array where every three values represent the x, y, z coordinates of a vertex.
  const positions = pickedMesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);

  // Check for completeness of the mesh data. If any of these arrays are null or undefined, the mesh is considered incomplete for this operation.
  if (!indices || !positions) {
    console.error('Mesh data is incomplete');
    return []; // Return an empty array as we cannot proceed without complete data.
  }

  // Calculate the indices of the vertices that make up the hit face. Since each face of a mesh is typically formed by three vertices (forming a triangle), and 'faceId' gives us the specific face, we find the corresponding vertex indices by multiplying 'faceId' by 3 and accessing the 'indices' array.
  const faceVertexIndices = [
    indices[faceId * 3],     // Index of the first vertex of the face
    indices[faceId * 3 + 1], // Index of the second vertex
    indices[faceId * 3 + 2], // Index of the third vertex
  ];

  // Convert the vertex indices to their actual Vector3 positions. This involves mapping each index to its corresponding position in the 'positions' array. Since 'positions' is a flat array, each group of three values (x, y, z) represents one vertex. We access these groups using the indices we found earlier.
  const faceVertexPositions = faceVertexIndices.map(index => {
    const posIndex = index * 3; // Calculate the starting index in the 'positions' array for this vertex.
    return new BABYLON.Vector3(
      positions[posIndex],     // x value of the vertex
      positions[posIndex + 1], // y value of the vertex
      positions[posIndex + 2]  // z value of the vertex
    );
  });

  // Return the positions of the vertices that make up the hit face. This array of Vector3 objects represents the corners of the face in 3D space, allowing further operations (such as finding the closest vertex to a point) to be performed on this specific face.
  return faceVertexPositions;
}

const getClosestVertexToPickedPoint: (geometry: BABYLON.Mesh | BABYLON.AbstractMesh, point: BABYLON.Vector3, faceId: number) => BABYLON.Vector3 | null = (
  geometry: BABYLON.Mesh | BABYLON.AbstractMesh, // The geometry/mesh being examined.
  point: BABYLON.Vector3, // The world space point that was picked/clicked.
  hitFaceId: number // The ID of the face that was initially hit, used to limit the search to vertices of this face.
) => {
  const THRESHOLD_DISTANCE=5;
  // First, get the positions of the vertices that make up the hit face.
  const vertices = findCornerVerticesFromFaceHit(geometry, hitFaceId);

  let minDistVx: BABYLON.Vector3 | null = null; // This will hold the closest vertex position in world space.
  let minDist = Infinity; // Initialize with infinity to ensure any real distance is smaller.

  // Compute the inverse of the world matrix to transform the picked point to the local space of the geometry.
  const inverseWorldMatrix = geometry.computeWorldMatrix(true).invert();
  const localPointPos = BABYLON.Vector3.TransformCoordinates(point, inverseWorldMatrix);

  // Loop through each vertex of the hit face.
  vertices.forEach(vertex => {
    // Calculate the distance from the current vertex to the picked point, both in local space.
    const distance = BABYLON.Vector3.Distance(vertex, localPointPos);
    // console.log(distance);
    // If this distance is the smallest so far, update minDist and minDistVx.
    if (distance < minDist && THRESHOLD_DISTANCE<=5) {
      minDist = distance;
      // Transform the closest vertex position back to world space before storing.
      minDistVx = BABYLON.Vector3.TransformCoordinates(vertex, geometry.computeWorldMatrix(true));
    }
  });

  // Return the position of the closest vertex in world space.
  return minDistVx;
}

const pointerDownVertexEditMode=() => {
  // console.log({
  //   isVertexEditMode,
  //   dragBoxRef: dragBoxRef.current,
  //   targetGeometryIdxRef: targetGeometryIdxRef.current,
  //   geometries,
  //   selectedGeometry,
  //   initialOffsetRef: initialOffsetRef.current,
  //   faceIdRef: faceIdRef.current
  // });
  if(!sceneRef.current) return;
  const pickingRay = sceneRef.current.createPickingRay(
    sceneRef.current.pointerX,
    sceneRef.current.pointerY,
    BABYLON.Matrix.Identity(),
    camera
  );
  // console.log(pickingRay);
  const pickInfo = sceneRef.current.pickWithRay(pickingRay);

  if(!pickInfo) return;
  const { hit, pickedMesh, pickedPoint, faceId } = pickInfo;
  // console.log({ hit, pickedMesh, pickedPoint, faceId });
  if(!hit || !pickedMesh || !pickedPoint || !faceId) return;
  if(pickedMesh==groundRef.current) return;
  pickedMesh.isPickable=true;
  
  if(!faceId) {
    console.error('can\'t find faceId of hit on pickedMesh');
    return;
  }
  
  faceIdRef.current=faceId;
  const closestVertex=getClosestVertexToPickedPoint(pickedMesh, pickedPoint, faceId);
  // console.log(closestVertex);
  if(!closestVertex) {
    console.error('couldn\'t locate closest vertex');
    return;
  }
  const positions=pickedMesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
  if(!positions) {
    console.log('unable to get vertices of pickedMesh');
    return;
  }
  moveOrCreateDragBox(closestVertex);
  if(!dragBoxRef.current) {
    console.error('couldn\'t move or create dragBox');
    return;
  }
  targetGeometryIdxRef.current=geometries.findIndex(geom => geom.name==pickedMesh.name);
  if(targetGeometryIdxRef.current==-1) {
    console.error('couldn\'t find targeted geometry');
    return; 
  }
  
  const currentPos = getGroundPosition();
  if(!currentPos) {
    console.error('couldn\'t get ground position');
    return;
  }
   
  // const offset = dragBoxRef.current.position.subtract(currentPos);
  const offset=BABYLON.Vector3.TransformCoordinates(pickedPoint, pickedMesh.computeWorldMatrix(true));
  initialOffsetRef.current=offset;
  setIsDragging(true);
};
useEffect(() => {
  adjustViewOnVertexDrag()
}, [isDragging])


const pointerMoveVertexEditMode = () => {
  console.log({
    isVertexEditMode,
    dragBoxRef: dragBoxRef.current,
    targetGeometryIdxRef: targetGeometryIdxRef.current,
    geometries,
    selectedGeometry,
    initialOffsetRef: initialOffsetRef.current,
    faceIdRef: faceIdRef.current
  });
  if (!isVertexEditMode || !dragBoxRef.current || !sceneRef.current || targetGeometryIdxRef.current === -1 || !initialOffsetRef.current || !faceIdRef.current) return;

  const currentPos = getGroundPosition();
  if (!currentPos) {
    console.error("couldn't get ground position");
    return;
  }

  const target = geometries.find(geom => geom.metadata.geomIndex === targetGeometryIdxRef.current);
  if (!target) {
    console.error("couldn't find target geometry");
    return;
  }

  // Calculate displacement in world coordinates.
  const displacement = currentPos.subtract(initialOffsetRef.current);

  const positions = target.getVerticesData(BABYLON.VertexBuffer.PositionKind);
  const indices = target.getIndices();
  if (!positions || !indices) return;


  for (let i = 0; i < positions.length; i += 3) {
    if (Math.abs(positions[i] - dragBoxRef.current.position.x) < BABYLON.Epsilon && Math.abs(positions[i + 2] - dragBoxRef.current.position.z) < BABYLON.Epsilon) {
        positions[i] += displacement.x; // Update x position based on displacement
        positions[i + 2] += displacement.z; // Update z position based on displacement
    }   
  }


  // Apply the updated positions back to the geometry.
  target.updateVerticesData(BABYLON.VertexBuffer.PositionKind, positions);
  target.bakeCurrentTransformIntoVertices();
  setSelectedGeometry(target);

  dragBoxRef.current.position.x+=displacement.x;
  dragBoxRef.current.position.z+=displacement.z;

  // Update the initial offset for the next movement calculation.
  initialOffsetRef.current = currentPos;
};


const pointerUpVertexEditMode = () => {
  setIsDragging(false);
  initialOffsetRef.current=null;
  if(dragBoxRef.current) {
    dragBoxRef.current.parent=null;
    dragBoxRef.current.dispose();
  }
  dragBoxRef.current=null;
  
}


  // Setup event listeners for sketch, move and vertexEdit modes
  
  
  useEffect(() => {

    if(!sceneRef.current) return;
    const obs = sceneRef.current?.onPointerObservable.add((pointerInfo) => {
        // console.log(pointerInfo);

        //if in sketch mode, draw when mouse is clicked & complete sketch when mouse + shft is clicked
        if(isSketchMode && pointerInfo.event.button==0) {
            switch(pointerInfo.event.shiftKey) {

              case false:
                handleSketch();
                break;
                
                case true:
                  toggleCloseShape();
                  break;

                default:
                  break;
            }
        }
        //if in moveMode, select when mouse is clicked, move object on mouse movement and release at position of next mouse click
        else if(isMoveMode) {
            switch (pointerInfo.type) {
                case BABYLON.PointerEventTypes.POINTERDOWN:
                  if(!pointerInfo.pickInfo) break;
                  pointerDownMoveMode(pointerInfo.pickInfo)
                  break;
                case BABYLON.PointerEventTypes.POINTERMOVE:          
                  pointerMoveMoveMode();
                  break;
                case BABYLON.PointerEventTypes.POINTERUP:
                  pointerUpMoveMode();
                  break;

            }
        }
        //if in vertexEditMode, select vertex to drag when mouse is clicked, drag vertex on mouse movement and update object shape and release at position of next mouse click
        else if(isVertexEditMode) {
            switch(pointerInfo.type) {
              case BABYLON.PointerEventTypes.POINTERDOWN:
                pointerDownVertexEditMode();
                break;

              case BABYLON.PointerEventTypes.POINTERMOVE:          
                pointerMoveVertexEditMode();
                break;

              case BABYLON.PointerEventTypes.POINTERUP:
                pointerUpVertexEditMode();
                break;
            }
        }
        else if(pointerInfo.type==BABYLON.PointerEventTypes.POINTERDOWN && !isVertexEditMode) {
          if(!pointerInfo.pickInfo) return;
            handleSelectGeometry(pointerInfo.pickInfo);

        }
    });

    return () => {
      if (obs) 
        sceneRef.current?.onPointerObservable.remove(obs);
    };
  }, [
      sceneRef.current?.isReady(), 
      isSketchMode, 
      isMoveMode, 
      isVertexEditMode,
      groundRef.current,
      targetGeometryIdxRef.current, 
      faceIdRef.current,
      selectedGeometry,
      initialOffsetRef.current,
      dragBoxRef.current
    ]
  );

  return {
    points,
    linesMesh,
    isSketchMode,
    toggleSketchMode,
    isMoveMode,
    toggleMoveMode,
    extrudeShape,
    geometries,
    isVertexEditMode,
    toggleVertexEditMode
  };
};

