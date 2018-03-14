import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  HostListener,
  AfterViewInit
} from '@angular/core';

import './js/EnableThreeExamples';
import 'three/examples/js/controls/OrbitControls';
import {
  WebGLRenderer,
  PerspectiveCamera,
  Scene,
  OrbitControls,
  PCFSoftShadowMap,
  AxesHelper,
  BoxHelper,
  Geometry,
  Box3,
  Vector3,
  Face3,
  Mesh,
  ShapeUtils,
  MeshNormalMaterial,
  Color,
  GridHelper,
  Face4,
  EdgesGeometry,
  WireframeGeometry,
  LineBasicMaterial,
  LineSegments,
  Group,
  AmbientLight,
  MeshPhongMaterial,
  VertexColors,
  MeshBasicMaterial
} from 'three';
import { AnalyzerService } from '../../analyzer.service';

@Component({
  selector: 'app-scene',
  templateUrl: './scene.component.html',
  styleUrls: ['./scene.component.css']
})
export class SceneComponent implements AfterViewInit {
  @ViewChild('canvas') canvasRef: ElementRef;

  private renderer: WebGLRenderer;
  private camera: PerspectiveCamera;
  private scene: Scene;
  private controls: OrbitControls;
  private FOV = 60;

  public nearClippingPane = 1;
  public farClippingPane = 2000;

  public planeGeom = new Geometry();
  public cellSize = 50;
  public planeMesh: Mesh;
  public pivot: Group;
  public gridSize = 8;

  constructor(private analyzer: AnalyzerService) {
    this.render = this.render.bind(this);
  }

  private setupPlane(initial?) {
    this.planeGeom = new Geometry();
    const cellSize = this.cellSize;
    const triangleIndex = 0;
    console.log(initial);
    let vertexIndex = 0;
    const vretexOffset = cellSize * 0.5;

    for (let x = 0; x <= this.gridSize; x++) {
      for (let y = 0; y <= this.gridSize; y++) {
        const cellOffset = new Vector3(x * cellSize, 0, y * cellSize);

        this.planeGeom.vertices[vertexIndex] = new Vector3(
          x * cellSize - vretexOffset,
          0,
          y * cellSize - vretexOffset
        );
        vertexIndex++;
      }
    }

    vertexIndex = 0;

    for (let x = 0; x < this.gridSize; x++) {
      for (let y = 0; y < this.gridSize; y++) {
        const face = new Face3(
          vertexIndex,
          vertexIndex + 1,
          vertexIndex + (this.gridSize + 1),
          new Vector3(0, 1, 0),
          new Color(0x0000ff)
        );
        const face2 = new Face3(
          vertexIndex + (this.gridSize + 1),
          vertexIndex + 1,
          vertexIndex + (this.gridSize + 1) + 1,
          new Vector3(0, 1, 0),
          new Color(0x0000ff)
        );

        face.vertexColors[0] = new Color(1, 0, 0);
        face.vertexColors[1] = new Color(1, 0, 0);
        face.vertexColors[2] = new Color(1, 0, 0);

        face2.vertexColors[0] = new Color(1, 0, 0);
        face2.vertexColors[1] = new Color(1, 0, 0);
        face2.vertexColors[2] = new Color(1, 0, 0);
        this.planeGeom.faces.push(face);
        this.planeGeom.faces.push(face2);
        vertexIndex++;
      }
      vertexIndex++;
    }

    this.planeGeom.computeVertexNormals();
    this.planeGeom.computeFaceNormals();

    const object = new Mesh(
      this.planeGeom,
      new MeshBasicMaterial({ vertexColors: VertexColors, wireframe: true })
    );
    this.planeMesh = object;
    this.pivot = new Group();
    this.scene.add(this.pivot);
    this.pivot.add(this.planeMesh);

    this.pivot.position.copy(this.planeGeom.center());
  }

  private updatePlane() {
    const data = this.analyzer.getAnalyzerData();
    let vertexIndex = 0;
    const colors: Array<Color> = [];

    for (let x = 0; x < this.planeGeom.vertices.length; x++) {
      const value = data[vertexIndex];

      colors.push(new Color(data[vertexIndex], 0, 0));
      this.planeGeom.vertices[vertexIndex].y = value ? value : 0;

      vertexIndex++;
    }

    vertexIndex = 0;

    for (const face of this.planeGeom.faces) {
      face.vertexColors[0].r = data[vertexIndex] / 128;
      face.vertexColors[1].r = data[vertexIndex] / 128;
      face.vertexColors[2].r = data[vertexIndex] / 128;
      vertexIndex ++;
    }

    this.planeGeom.colors = colors;
    this.pivot.rotation.y += 0.01;

    this.planeGeom.computeFaceNormals();
    this.planeGeom.verticesNeedUpdate = true;
    this.planeGeom.colorsNeedUpdate = true;
    this.planeGeom.normalsNeedUpdate = true;
  }

  private get canvas(): HTMLCanvasElement {
    return this.canvasRef.nativeElement;
  }

  private addLights() {
    const light = new AmbientLight(0x404040);
    this.scene.add(light);
  }

  normalize(min, max) {
    const delta = max - min;
    return function(val) {
      return (val - min) / delta;
    };
  }

  private getAspectRatio() {
    const height = this.canvas.clientHeight;
    if (height === 0) {
      return 0;
    }
    return this.canvas.clientWidth / this.canvas.clientHeight;
  }

  public addControls() {
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.rotateSpeed = 1.0;
    this.controls.zoomSpeed = 1.2;
    this.controls.addEventListener('change', this.render);
  }

  public render() {
    this.renderer.render(this.scene, this.camera);
  }

  private startRendering() {
    this.renderer = new WebGLRenderer({
      canvas: this.canvas,
      antialias: true
    });
    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);

    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = PCFSoftShadowMap;
    this.renderer.setClearColor(0xffffff, 1);
    this.renderer.autoClear = true;

    const component: SceneComponent = this;

    (function render() {
      requestAnimationFrame(render);
      component.updatePlane();
      component.render();
    })();
  }

  @HostListener('window:resize', ['$event'])
  public onResize(event: Event) {
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    console.log(
      'onResize: ' + this.canvas.clientWidth + ', ' + this.canvas.clientHeight
    );

    this.camera.aspect = this.getAspectRatio();
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    this.render();
  }

  private createCamera() {
    const aspectRatio = this.getAspectRatio();
    this.camera = new PerspectiveCamera(
      this.FOV,
      aspectRatio,
      this.nearClippingPane,
      this.farClippingPane
    );
    this.camera.position.x = 10;
    this.camera.position.x = 10;
    this.camera.position.x = 100;
  }

  private createScene() {
    this.scene = new Scene();
    const size = 10;
    const divisions = 10;
  }

  ngAfterViewInit() {
    this.createScene();
    this.createCamera();
    this.addLights();
    this.setupPlane(true);
    this.startRendering();
    this.addControls();
  }
}
