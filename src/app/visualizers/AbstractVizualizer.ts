import { IDrawable } from './IDrawable';
import { Mesh, MeshPhongMaterial } from 'three';


export interface IVIzConfig {
    type: 'text' | 'number';
    value: any;
    canChange: boolean;
}

export abstract class Visualizer implements IDrawable {
    mesh: Mesh;
    public config;

    public updateConfigs(config) {
        this.config = {...this.config, ...config};
    }

    public toggleWireframe() {
        const material = this.mesh.material as MeshPhongMaterial;
        material.wireframe = !material.wireframe;
        material.needsUpdate = true;

    }

    public toggleShading() {
        const material = this.mesh.material as MeshPhongMaterial;
        material.flatShading = !material.flatShading;
        material.needsUpdate = true;
    }

    public abstract draw(data?: any): void;
}
