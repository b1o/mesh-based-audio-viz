import { IDrawable } from './IDrawable';
import {
  Material,
  MeshPhongMaterial,
  SphereGeometry,
  FaceColors,
  VertexColors,
  Object3D,
  Mesh,
  Color
} from 'three';
import { Utils } from '../Utils';
import { IInteractable } from './IInterctable';
import { Visualizer, IVIzConfig } from './AbstractVizualizer';

export interface ISphereConfig {
  minRadius?: IVIzConfig;
  maxRadius?: IVIzConfig;
  heightSegments?: IVIzConfig;
  widthSegments?: IVIzConfig;
  radius?: IVIzConfig;
  material?: IVIzConfig;
}

export const DefaultConfig: ISphereConfig = {
  minRadius: { type: 'number', value: 10, canChange: true },
  maxRadius: { type: 'number', value: 30, canChange: true },
  widthSegments: { type: 'number', value: 32, canChange: false },
  heightSegments: { type: 'number', value: 320, canChange: false },
  radius: { type: 'number', value: 10, canChange: false },
  material: { type: 'number', value: new MeshPhongMaterial({ vertexColors: VertexColors }), canChange: false }
};

export class Sphere extends Visualizer {
  public mesh: Mesh;
  public config: ISphereConfig = DefaultConfig;
  private geometry: SphereGeometry;

  constructor(config?: ISphereConfig) {
    super();
    if (config) {
      Object.keys(config).forEach(key => {
        this.config[key].value = config[key];
      })
      console.log(this.config);
    }
    this.createMesh();
  }

  get id() {
    return this.mesh.id;
  }

  get ringCount() {
    return this.config.heightSegments.value - 1;
  }

  public draw(data) {
    let height = (this.config.heightSegments.value / 2) - 1;

    this.geometry.vertices[0].copy(
      this.geometry.vertices[0]
        .normalize()
        .multiplyScalar(Utils.convertRange(data[height], [0, 255], [this.config.minRadius.value, this.config.maxRadius.value]))
    );

    this.geometry.vertices[0]['color'].forEach(c =>
      c.setHSL(
        Utils.convertRange(data[height], [0, 255], [0.3, 0]),
        1,
        0.5// this.convertRange(data[height], [0, 255], [0, 1])

      )
    );

    this.geometry.vertices[this.geometry.vertices.length - 1].copy(
      this.geometry.vertices[this.geometry.vertices.length - 1]
        .normalize()
        .multiplyScalar(Utils.convertRange(data[height], [0, 255], [this.config.minRadius.value, this.config.maxRadius.value]))
    );

    this.geometry.vertices[this.geometry.vertices.length - 1][
      'color'
    ].forEach(c =>
      c.setHSL(
        Utils.convertRange(data[height], [0, 255], [0.3, 0]),
        1,
        0.5// this.convertRange(data[height], [0, 255], [0, 1])
      )
    );

    let currentRing = 1;
    for (let i = 1; i < this.geometry.vertices.length - 1; i += this.config.widthSegments.value) {
      for (let j = i; j < i + this.config.widthSegments.value; j++) {
        if (j === this.geometry.vertices.length - 1) {
          continue;
        }

        this.geometry.vertices[j].copy(
          this.geometry.vertices[j]
            .normalize()
            .multiplyScalar(Utils.convertRange(data[height], [0, 255], [this.config.minRadius.value, this.config.maxRadius.value]))
        );

        for (const color of this.geometry.vertices[j]['color']) {
          color.setHSL(
            Utils.convertRange(data[height], [0, 255], [0.3, 0]),
            1,
            0.5// this.convertRange(data[height], [0, 255], [0, 1])
          );
        }
      }
      currentRing++;
      if (currentRing >= this.ringCount / 2) {
        height++;
      } else {
        height--;
      }
    }
    this.geometry.verticesNeedUpdate = true;
    this.geometry.colorsNeedUpdate = true;
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

  private createMesh() {
    this.geometry = new SphereGeometry(30, 32, 320);
    this.mesh = new Mesh(this.geometry, this.config.material.value);
    this.addColorsToVertices();
  }
}
