import { Mesh } from 'three';

export interface IDrawable {
  mesh: Mesh;

  draw(data?): void;
}
