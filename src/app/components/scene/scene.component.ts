import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  HostListener,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';

import { MeshText2D, textAlign, SpriteText2D } from 'three-text2d';
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
  MeshBasicMaterial,
  Vector2,
  HemisphereLight,
  PointLight,
  FaceColors,
  Loader,
  FontLoader,
  Font,
  TextGeometry,
  Blending,
  NormalBlending,
  SpotLight,
  SpotLightHelper,
  MeshStandardMaterial,
  DoubleSide,
  RingGeometry,
  RingBufferGeometry,
  PlaneGeometry,
  SphereGeometry,
  VertexNormalsHelper
} from 'three';
import { AnalyzerService } from '../../analyzer.service';
import { TextCreator } from '../../text-creator';
import { IDrawable } from '../../visualizers/IDrawable';
import { Sphere } from '../../visualizers/sphere.viz';
import { Utils } from '../../Utils';
import { Visualizer } from '../../visualizers/AbstractVizualizer';
import { Rings } from '../../visualizers/rings.viz';

@Component({
  selector: 'app-scene',
  templateUrl: './scene.component.html',
  styleUrls: ['./scene.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SceneComponent implements AfterViewInit {
  @ViewChild('canvas') canvasRef: ElementRef;

  private renderer: WebGLRenderer;
  private camera: PerspectiveCamera;
  private scene: Scene;
  private controls: OrbitControls;
  private FOV = 60;

  public wireframe = false;
  public shading = false;

  public nearClippingPane = 1;
  public farClippingPane = 5000;

  public planeGeom = new Geometry();
  public cellSize = 1;
  public planeMesh: Mesh;
  public pivot: Group;
  public loader: FontLoader;
  public gridSize = 240;

  public gridVertices = new Array<Array<Vector3>>();
  public font: Font;
  public texts = [];

  public smootheness = 0.9;
  public currentRow = 0;

  private dataHistory = [];
  private previousCameraPos;

  public view = 'sphere';
  public material = new MeshBasicMaterial({ color: new Color(0, 0, 100) });

  public hues = true;
  public currentVisualiser: Visualizer;

  constructor(
    private analyzer: AnalyzerService,
    private cd: ChangeDetectorRef
  ) {
    this.render = this.render.bind(this);
    this.analyzer.changeSmoothValue(this.smootheness);
    for (let x = 0; x <= this.gridSize; x++) {
      const tempArr = [];
      for (let y = 0; y <= this.gridSize; y++) {
        tempArr.push(new Vector3(0, 0, 0));
      }
      this.gridVertices.push(tempArr);
    }

    this.loader = new FontLoader();
  }

  public handleConfigChanged(configs) {

    this.currentVisualiser.updateConfigs(configs);
  }

  public onSmoothenessChange(value) {
    this.analyzer.changeSmoothValue(value);
  }

  public updateSphere() {
    const data = this.analyzer.getAnalyzerData();
  }

  public fuckMeUp() {
    this.changeView('circle');
    this.wireframe = true;
    this.camera.position.copy(this.pivot.position);
    this.camera.position.y = -50;
    this.camera.lookAt(this.pivot.position);
  }

  private setupPlane() {
    this.planeGeom = new PlaneGeometry(
      this.gridSize,
      this.gridSize,
      this.gridSize / this.cellSize,
      this.gridSize / this.cellSize
    );

    for (let i = 0; i < this.planeGeom.faces.length; i++) {
      const f = this.planeGeom.faces[i];
      f.vertexColors[0] = new Color(0, 255, 0);
      f.vertexColors[1] = new Color(0, 255, 0);
      f.vertexColors[2] = new Color(0, 255, 0);

      if (this.planeGeom.vertices[f.a]['color']) {
        this.planeGeom.vertices[f.a]['color'].push(f.vertexColors[0]);
      } else {
        this.planeGeom.vertices[f.a]['color'] = [f.vertexColors[0]];
      }

      if (this.planeGeom.vertices[f.b]['color']) {
        this.planeGeom.vertices[f.b]['color'].push(f.vertexColors[1]);
      } else {
        this.planeGeom.vertices[f.b]['color'] = [f.vertexColors[1]];
      }

      if (this.planeGeom.vertices[f.c]['color']) {
        this.planeGeom.vertices[f.c]['color'].push(f.vertexColors[2]);
      } else {
        this.planeGeom.vertices[f.c]['color'] = [f.vertexColors[2]];
      }
    }

    let vertexIndex = 0;
    for (let x = 0; x <= this.gridSize; x++) {
      for (let y = 0; y <= this.gridSize; y++) {
        this.gridVertices[x][y] = this.planeGeom.vertices[vertexIndex];
        this.planeGeom.colors.push(new Color(0, 0, 255));
        vertexIndex++;
      }
    }
    // this.planeGeom.vertices[0]['color'][0].r = 255;
    // this.planeGeom.vertices[1]['color'][0].r = 255;
    this.planeGeom.vertices[1]['color'][2].r = 255;

    this.planeGeom.computeVertexNormals();

    this.planeGeom.computeFaceNormals();

    this.planeMesh = new Mesh(
      this.planeGeom,
      new MeshPhongMaterial({
        vertexColors: FaceColors,
        flatShading: false,
        side: DoubleSide
      })
    );
    // this.planeMesh.lookAt(new Vector3(0, 1, 0));
    this.planeMesh.castShadow = true;
    this.planeMesh.receiveShadow = true;
    this.planeMesh.lookAt(new Vector3(0, 1, 0));

    this.pivot = new Group();
    this.scene.add(this.pivot);
    this.pivot.add(this.planeMesh);
    this.pivot.position.copy(this.planeGeom.center());
  }


  toggleWireframe() {
    this.currentVisualiser.toggleWireframe();
  }

  toggleShading() {
    this.currentVisualiser.toggleShading();
  }

  private updatePlane() {
    const data = this.analyzer.getAnalyzerData();
    // const colorIndex = this.gridSize / 2;

    let height = this.gridSize / 2;
    for (
      let squareIndex = 10;
      squareIndex <= this.gridSize / 2;
      squareIndex++
    ) {
      this.gridVertices
        .map(x => x[squareIndex])
        .slice(squareIndex, this.gridSize - squareIndex)
        .map(x => {
          x.z = data[height];
          return x;
        });

      this.gridVertices
        .map(x => x[this.gridSize - squareIndex])
        .slice(squareIndex, this.gridSize - squareIndex)
        .map(x => {
          x.z = data[height];
          return x;
        });

      this.gridVertices[squareIndex]
        .slice(squareIndex, this.gridSize - squareIndex)
        .map(x => {
          x.z = data[height];
          return x;
        });

      this.gridVertices[this.gridSize - squareIndex]
        .slice(squareIndex, this.gridSize - squareIndex + 1)
        .map(x => {
          x.z = data[height];
          x['color'].forEach(c => (c.r = data[height]));
        });

      height--;
    }

    this.planeGeom.verticesNeedUpdate = true;
    this.planeGeom.colorsNeedUpdate = true;
  }

  private getSquaresIndicies(i: number, verticesPerRow: number) {
    const all = [];
    all.push.apply(
      all,
      this.planeGeom.vertices.slice(
        i * verticesPerRow + i,
        verticesPerRow * i + verticesPerRow - i
      )
    );
    all.push.apply(
      all,
      this.planeGeom.vertices.slice(
        this.planeGeom.vertices.length - verticesPerRow * (i + 1) + i,
        this.planeGeom.vertices.length - i * verticesPerRow - i
      )
    );
    for (let j = i; j < verticesPerRow - i; j++) {
      all.push(this.planeGeom.vertices[j * verticesPerRow + i]);
      all.push(
        this.planeGeom.vertices[j * verticesPerRow - i + (verticesPerRow - 1)]
      );
    }
    return all;
  }

  public changeView(view) {
    if (this.currentVisualiser) {
      this.scene.remove(this.currentVisualiser.mesh);
    }
    switch (view) {
      case 'sphere': {
        this.currentVisualiser = new Sphere({maxRadius: 40, minRadius: 30});
        break;
      }

      case 'rings': {
        this.currentVisualiser = new Rings();
        break;
      }
    }
    this.cd.detectChanges();
    this.scene.add(this.currentVisualiser.mesh);
    this.view = view;
  }

  private spectogram() {
    const data = this.analyzer.getAnalyzerData();
    this.dataHistory.push([...data]);

    if (this.dataHistory.length > this.gridSize + 1) {
      this.dataHistory.shift();
    }

    for (let i = 0; i < this.dataHistory.length; i++) {
      const vertices = this.gridVertices[i];
      const currentData = this.dataHistory[i];
      for (let v = 0; v <= this.gridSize; v++) {
        vertices[v].y = currentData[v];
        for (const color of vertices[v]['color']) {
          color.setHSL(
            Utils.convertRange(currentData[v], [0, 255], [0.3, 0]),
            1,
            Utils.convertRange(currentData[v], [0, 255], [0, 0.5])
          );
        }
      }
    }

    this.planeGeom.verticesNeedUpdate = true;
    this.planeGeom.colorsNeedUpdate = true;
  }

  private get canvas(): HTMLCanvasElement {
    return this.canvasRef.nativeElement;
  }

  private addLights() {
    const light = new HemisphereLight(0xffffff, 0x0f0f0f, 1);
    // light.castShadow = true;
    // light.position.copy(this.pivot.position);
    // light.position.y = 300;
    // light.target = this.pivot;

    // this.scene.add(new HemisphereLight(0xffffbb, 0x080820, 1));
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
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = PCFSoftShadowMap;
    this.renderer.setClearColor(0x000000, 1);
    this.renderer.autoClear = true;

    const component: SceneComponent = this;

    (function render() {
      requestAnimationFrame(render);
      if (component.planeMesh) {
        // component.camera.lookAt(component.pivot.position);
      }

      // const material = component.planeMesh.material as MeshPhongMaterial;
      // material.wireframe = component.wireframe;
      // material.flatShading = component.shading;

      component.currentVisualiser.draw(component.analyzer.getAnalyzerData());

      component.render();
    })();
  }

  @HostListener('window:resize', ['$event'])
  public onResize(event: Event) {
    this.canvas.style.width = window.innerWidth + 'px';
    this.canvas.style.height = window.innerHeight + 'px';
    console.log('onResize: ' + window.innerWidth + ', ' + window.innerHeight);

    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);

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
    this.camera.position.set(0, 200, 0);
    // this.camera.position.z = 150;
    // this.camera.position.y = 60;
    // this.camera.lookAt(this.pivot.position);
  }

  private createScene() {
    this.scene = new Scene();
    this.scene.add(new AxesHelper(100));
    const size = 10;
    const divisions = 10;
  }

  ngAfterViewInit() {
    this.createScene();
    // this.setupPlane(true);
    // this.changeView('sphere');
    this.changeView('sphere');
    // this.setupRing();
    this.addLights();
    this.createCamera();
    this.startRendering();
    this.addControls();
  }
}
