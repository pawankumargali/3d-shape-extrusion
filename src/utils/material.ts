import * as BABYLON from 'babylonjs';

let selectedGeomMaterial: BABYLON.StandardMaterial | null = null;
let defaultGeomMaterial: BABYLON.StandardMaterial | null = null;
let pointVisualMaterial: BABYLON.StandardMaterial | null = null;
let selectedVxMaterial: BABYLON.StandardMaterial | null = null;


export const selectedGeometryMaterial = (scene: BABYLON.Scene) => {
    if(!selectedGeomMaterial) {
        selectedGeomMaterial = new BABYLON.StandardMaterial("selectedGeomMaterial", scene);
        selectedGeomMaterial.diffuseColor = BABYLON.Color3.FromHexString("#3985bf"); // Blue
    }
    return selectedGeomMaterial;
}


export const defaultGeometryMaterial = (scene: BABYLON.Scene) => {
    if(!defaultGeomMaterial) {
        defaultGeomMaterial = new BABYLON.StandardMaterial("geometryMaterial", scene);
        defaultGeomMaterial.diffuseColor = BABYLON.Color3.FromHexString("#878784"); // Grey
    }
    return defaultGeomMaterial;
}


export const pointVisualizationMaterial = (scene: BABYLON.Scene) => {
    if(!pointVisualMaterial) {
        pointVisualMaterial = new BABYLON.StandardMaterial("pointMaterial", scene);
        pointVisualMaterial.diffuseColor = BABYLON.Color3.FromHexString("#00008B"); // Dark Blue
    }
    return pointVisualMaterial;
}


export const dragBoxMaterial = (scene: BABYLON.Scene) => {
    if(!selectedVxMaterial) {
        selectedVxMaterial = new BABYLON.StandardMaterial("selectedGeomMaterial", scene);
        selectedVxMaterial.diffuseColor = BABYLON.Color3.Red(); // black
    }
    return selectedVxMaterial;
}