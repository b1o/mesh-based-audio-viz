import { IDrawable } from './IDrawable';
import { Mesh, RingGeometry, Color, Vector3, FaceColors, DoubleSide, MeshPhongMaterial } from 'three';
import { Visualizer, IVIzConfig } from './AbstractVizualizer';
import { Utils } from '../Utils';

export interface IRingsConfig {
    innerRadius?: IVIzConfig;
    outerRadius?: IVIzConfig;
    thetaSegments?: IVIzConfig;
    phiSegments?: IVIzConfig;
    minHeight?: IVIzConfig;
    maxHeight?: IVIzConfig;
}

export const DefaultConfig: IRingsConfig = {
    innerRadius: { type: 'number', value: 1, canChange: false },
    outerRadius: { type: 'number', value: 150, canChange: false },
    thetaSegments: { type: 'number', value: 32, canChange: false },
    phiSegments: { type: 'number', value: 450, canChange: false },
    minHeight: { type: 'number', value: 1, canChange: true },
    maxHeight: { type: 'number', value: 50, canChange: true }
};

export class Rings extends Visualizer {
    mesh: Mesh;

    private geometry: RingGeometry;
    public config: IRingsConfig = DefaultConfig;

    constructor(config?: IRingsConfig) {
        super();

        if (config) {
            Object.keys(config).forEach(key => {
                this.config[key].value = config[key];
            })
        }
        console.log(this.config);
        const geometry = new RingGeometry(
            this.config.innerRadius.value,
            this.config.outerRadius.value,
            this.config.thetaSegments.value,
            this.config.phiSegments.value);

        const material = new MeshPhongMaterial({
            wireframe: true,
            vertexColors: FaceColors,
            side: DoubleSide
        });

        const mesh = new Mesh(geometry, material);
        mesh.lookAt(new Vector3(0, 1, 0));
        this.geometry = geometry;
        this.mesh = mesh;

        this.addColorsToVertices();
    }

    draw(data?: any): void {

        let height = 0;
        for (let i = 0; i < this.geometry.vertices.length; i += this.config.thetaSegments.value) {
            for (let vertexIndex = i; vertexIndex < i + this.config.thetaSegments.value; vertexIndex++) {
                this.geometry.vertices[vertexIndex].z = Utils.convertRange(
                    data[height],
                    [0, 255],
                    [this.config.minHeight.value, this.config.maxHeight.value]
                );

                for (const color of this.geometry.vertices[vertexIndex]['color']) {
                    color.setHSL(
                        Utils.convertRange(data[height], [0, 255], [0, 1]),
                        1,
                        Utils.convertRange(data[height], [0, 255], [0.1, 1])
                    );
                }
            }
            height++;
        }
        this.geometry.colorsNeedUpdate = true;
        this.geometry.verticesNeedUpdate = true;

        // this.pivot.rotation.y +=
        //   data.reduce((a, b) => a + b, 0) / data.length / 255;
    }

    private addColorsToVertices() {
        for (let i = 0; i < this.geometry.faces.length; i++) {
            const f = this.geometry.faces[i];
            f.vertexColors[0] = new Color(0, 255, 0);
            f.vertexColors[1] = new Color(0, 255, 0);
            f.vertexColors[2] = new Color(0, 255, 0);

            if (this.geometry.vertices[f.a]['color']) {
                this.geometry.vertices[f.a]['color'].push(f.vertexColors[0]);
            } else {
                this.geometry.vertices[f.a]['color'] = [f.vertexColors[0]];
            }

            if (this.geometry.vertices[f.b]['color']) {
                this.geometry.vertices[f.b]['color'].push(f.vertexColors[1]);
            } else {
                this.geometry.vertices[f.b]['color'] = [f.vertexColors[1]];
            }

            if (this.geometry.vertices[f.c]['color']) {
                this.geometry.vertices[f.c]['color'].push(f.vertexColors[2]);
            } else {
                this.geometry.vertices[f.c]['color'] = [f.vertexColors[2]];
            }
        }
    }
}
