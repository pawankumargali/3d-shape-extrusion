import * as BABYLON from 'babylonjs';
import { pointVisualizationMaterial } from './material.js';

export const createPointVisual = (point: BABYLON.Vector3, scene: BABYLON.Scene | null, ground: BABYLON.GroundMesh | null) => {
    if(!scene) return;
    if(!ground) return;
    // const sphere = BABYLON.MeshBuilder.CreateSphere("pointSphere", { diameter: 0.1 }, scene);
    // sphere.material = pointVisualizationMaterial(scene);
    // sphere.position = point;
    // return sphere
    const decalMaterial = new BABYLON.StandardMaterial("decalMat", scene);
    decalMaterial.diffuseTexture = new BABYLON.Texture("https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Location_dot_black.svg/1024px-Location_dot_black.svg.png", scene);
    const normal = new BABYLON.Vector3(0,1,0);
    const pointDecal = BABYLON.MeshBuilder.CreateDecal("pointDecal", 
    ground, 
    {
        position: point,
        size: new BABYLON.Vector3(0.5, 0.5, 0.5),
        angle: 0,
        normal
    });
    pointDecal.material=decalMaterial;
    return pointDecal;
};
