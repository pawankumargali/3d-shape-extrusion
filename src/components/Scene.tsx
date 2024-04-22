import React, { useEffect, useRef } from 'react';
import { useShapeLib } from '../utils/useShapeLib.js';
// import TwoDeeOriginIcon from '../assets/2DOriginIcon.png';


const Scene: React.FC<{}> = () => {

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { points, geometries, isSketchMode, toggleSketchMode, extrudeShape, isMoveMode, toggleMoveMode, isVertexEditMode, toggleVertexEditMode } = useShapeLib(canvasRef);

  // useEffect(() => {
  //   adjustViewOnMoveModeToggle(isMoveMode);
  // }, [isMoveMode])


  // useEffect(() => {
  //   adjustViewOnVertexEditToggle(isMoveMode);
  // }, [editVertex?.name])

  // useEffect(() => {
  //   adjustViewOnInitialOffsetChange(initialOffsetRef.current);
  // }, [initialOffsetRef.current]);



  return (
    <>
    <div style={{ zIndex: 999, width: '100%', position: 'absolute', top: '0px', left: '0px', display: 'flex', flexDirection: 'row', justifyContent: 'space-around' }}>
      <button onClick={toggleSketchMode}>{isSketchMode ? 'Exit Draw Mode' : 'Draw Mode'}</button>
      <button onClick={toggleMoveMode} disabled={geometries.length > 0  && !isSketchMode  && !isVertexEditMode ? false : true}>
          {isMoveMode ? 'Exit Move Mode':  'Move Mode' }
      </button>
      <button onClick={extrudeShape} disabled={points.length >= 3 && !isSketchMode && !isVertexEditMode ? false : true}> Extrude Shape </button>
      <button onClick={toggleVertexEditMode} disabled={geometries.length > 0 && !isSketchMode && !isMoveMode ? false : true}>{isVertexEditMode ?  'Exit Vertex Mode' : 'Edit Vertex Mode' } </button>
    </div>
    <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight} style={{position: 'absolute', top: '0px', left: '0px'}}></canvas>;
    </> );
};

export default Scene;
