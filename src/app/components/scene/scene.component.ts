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
  RingBufferGeometry
} from 'three';
import { AnalyzerService } from '../../analyzer.service';
import { TextCreator } from '../../text-creator';

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
  public gridSize = 150;

  public gridVertices = new Array<Array<Vector3>>();
  public font: Font;
  public texts = [];

  public smootheness = 0.7;
  public currentRow = 0;

  private dataHistory = [];
  private previousCameraPos;

  public view = 'pyramid';

  public hues = true;

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
  }

  public onSmoothenessChange(value) {
    this.analyzer.changeSmoothValue(value);
  }

  public fuckMeUp() {
    this.changeView('circle');
    this.wireframe = true;
    this.camera.position.copy(this.pivot.position);
    this.camera.position.y = -50;
    this.camera.lookAt(this.pivot.position);
  }

  private setupPlane() {
    this.planeGeom = new Geometry();
    const cellSize = this.cellSize;
    const triangleIndex = 0;
    let vertexIndex = 0;
    const vretexOffset = cellSize * 1.2;

    for (let x = 0; x <= this.gridSize; x++) {
      for (let y = 0; y <= this.gridSize; y++) {
        const cellOffset = new Vector3(x * cellSize, 0, y * cellSize);

        const vertex = new Vector3(
          x * cellSize - vretexOffset,
          0,
          y * cellSize - vretexOffset
        );

        vertex['vertexIndex'] = vertexIndex;
        vertex['color'] = [];
        this.gridVertices[x][y] = vertex;
        this.planeGeom.vertices[vertexIndex] = vertex;
        this.planeGeom.colors.push(new Color(1, 1, 1));

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

        face.vertexColors[0] = new Color(0, 255, 0);
        face.vertexColors[1] = new Color(0, 255, 0);
        face.vertexColors[2] = new Color(0, 255, 0);

        face2.vertexColors[0] = new Color(0, 255, 0);
        face2.vertexColors[1] = new Color(0, 255, 0);
        face2.vertexColors[2] = new Color(0, 255, 0);

        this.planeGeom.vertices[vertexIndex]['color'].push(
          face.vertexColors[0]
        );
        this.planeGeom.vertices[vertexIndex + 1]['color'].push(
          face.vertexColors[1]
        );
        this.planeGeom.vertices[vertexIndex + (this.gridSize + 1)][
          'color'
        ].push(face.vertexColors[2]);

        this.planeGeom.vertices[vertexIndex + (this.gridSize + 1)][
          'color'
        ].push(face2.vertexColors[0]);
        this.planeGeom.vertices[vertexIndex + 1]['color'].push(
          face2.vertexColors[1]
        );
        this.planeGeom.vertices[vertexIndex + (this.gridSize + 1) + 1][
          'color'
        ].push(face2.vertexColors[2]);

        this.planeGeom.faces.push(face);
        this.planeGeom.faces.push(face2);
        vertexIndex++;
      }
      vertexIndex++;
    }

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
    this.planeMesh.castShadow = true;
    this.planeMesh.receiveShadow = true;

    this.pivot = new Group();
    this.scene.add(this.pivot);
    this.pivot.add(this.planeMesh);
    this.pivot.position.copy(this.planeGeom.center());
  }

  public setupRing() {
    const geometry = new RingGeometry(0, 100, 32, 200);
    const material = new MeshPhongMaterial({
      wireframe: true,
      vertexColors: FaceColors,
      side: DoubleSide
    });
    const mesh = new Mesh(geometry, material);
    mesh.lookAt(new Vector3(0, 1, 0));
    this.planeGeom = geometry;
    this.planeMesh = mesh;
    this.planeMesh.castShadow = true;
    this.planeMesh.receiveShadow = true;
    mesh.position.set(0, 0, 0);
    console.log(this.planeGeom.vertices);
    console.log(this.planeGeom.faces);

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

    console.log(this.planeGeom.colors.length);
    this.planeGeom.computeFaceNormals();
    this.planeGeom.computeVertexNormals();

    this.pivot = new Group();
    this.scene.add(this.pivot);
    this.pivot.add(this.planeMesh);

    this.pivot.position.copy(geometry.center());
  }

  public updateRing() {
    const data = this.analyzer.getAnalyzerData();

    let height = 0;
    for (let i = 0; i < this.planeGeom.vertices.length - 32; i += 32) {
      for (let vertexIndex = i; vertexIndex < i + 32; vertexIndex++) {
        this.planeGeom.vertices[vertexIndex].z = this.convertRange(
          data[height],
          [0, 255],
          [0, 60]
        );

        for (const color of this.planeGeom.vertices[vertexIndex]['color']) {
          color.setHSL(
            this.convertRange(data[height], [0, 255], [0.3, 0]),
            1,
            0.5
          );
        }
      }
      height++;
    }
    this.planeGeom.colorsNeedUpdate = true;
    this.planeGeom.verticesNeedUpdate = true;

    this.pivot.rotation.y +=
      data.reduce((a, b) => a + b, 0) / data.length / 255;
  }

  private convertRange(value, r1, r2) {
    return (value - r1[0]) * (r2[1] - r2[0]) / (r1[1] - r1[0]) + r2[0];
  }

  private updatePlane() {
    const data = this.analyzer.getAnalyzerData();
    let vertexIndex = 0;
    const colors: Array<Color> = [];

    const gridMiddleIndex = Math.floor(this.gridSize / 2);

    const centerVertex = this.gridVertices[Math.floor(this.gridSize / 2)][
      Math.floor(this.gridSize / 2)
    ];
    centerVertex.y = data[vertexIndex] / 5;

    let outerCircleIndex = this.gridSize / 2;
    vertexIndex = outerCircleIndex;
    while (outerCircleIndex > 0) {
      for (
        let x = gridMiddleIndex - outerCircleIndex;
        x <= gridMiddleIndex + outerCircleIndex;
        x++
      ) {
        for (
          let y = gridMiddleIndex - outerCircleIndex;
          y <= gridMiddleIndex + outerCircleIndex;
          y++
        ) {
          console.log(this.gridVertices[x][y]['color'].length);
          for (const color of this.gridVertices[x][y]['color']) {
            color.r = this.convertRange(
              data[outerCircleIndex],
              [0, 80],
              [0, 255]
            );
            color.g = this.convertRange(
              data[outerCircleIndex],
              [0, 80],
              [255, 0]
            );
          }
          if (this.gridVertices[x][y] === centerVertex) {
            continue;
          }
          this.gridVertices[x][y].y = data[outerCircleIndex] / 5;
        }
      }
      outerCircleIndex--;
    }

    this.planeGeom.verticesNeedUpdate = true;
    this.planeGeom.colorsNeedUpdate = true;
  }

  toggleWireframe() {
    this.wireframe = !this.wireframe;
    this.cd.detectChanges();
  }

  toggleShading() {
    this.shading = !this.shading;
    const material = this.planeMesh.material as MeshPhongMaterial;
    material.needsUpdate = true;
    this.cd.detectChanges();
  }

  private getMatrixSquares(circleOffset: number) {
    let row1 = this.gridVertices[circleOffset];
    let row2 = this.gridVertices[this.gridSize - circleOffset];

    row1 = row1.slice(circleOffset, this.gridSize - circleOffset + 1);
    row2 = row2.slice(circleOffset, this.gridSize - circleOffset + 1);

    let column1 = this.gridVertices.map(v => v[circleOffset]);
    column1 = column1.slice(circleOffset, this.gridSize - circleOffset + 1);

    let column2 = this.gridVertices.map(v => v[this.gridSize - circleOffset]);
    column2 = column2.slice(circleOffset, this.gridSize - circleOffset + 1);

    const all = column1.concat(column2, row1, row2);
    return all;
  }

  private test() {
    const data = this.analyzer.getAnalyzerData();
    let colorIndex = this.gridSize / 2;

    for (
      let circleOffset = 0;
      circleOffset <= this.gridSize / 2;
      circleOffset++
    ) {
      const all = this.getMatrixSquares(circleOffset);

      for (const vertex of all) {
        vertex.y = this.convertRange(data[colorIndex], [0, 255], [0, 40]);

        if (data[colorIndex] > 0) {
          for (let i = 0; i < vertex['color'].length; i++) {
            vertex['color'][i].setHSL(
              this.convertRange(data[colorIndex], [0, 255], [0.3, 0]),
              1,
              0.5
            );
          }
        }
      }

      colorIndex--;
    }

    this.pivot.rotation.y +=
      data.reduce((a, b) => a + b, 0) / data.length / 255;

    this.planeGeom.verticesNeedUpdate = true;
    this.planeGeom.colorsNeedUpdate = true;
  }

  public changeView(view) {
    console.log(view);
    this.dataHistory = [];
    this.scene.remove(this.pivot);
    this.pivot = null;
    this.planeMesh = null;
    this.planeGeom = null;
    this.gridVertices =  new Array<Array<Vector3>>();
    for (let x = 0; x <= this.gridSize; x++) {
      const tempArr = [];
      for (let y = 0; y <= this.gridSize; y++) {
        tempArr.push(new Vector3(0, 0, 0));
      }
      this.gridVertices.push(tempArr);
    }

    if (view === 'spectrogram') {
      this.setupPlane();
      this.previousCameraPos = this.camera.position;
      this.camera.position.copy(this.pivot.position);
      this.camera.position.y = 400;
      this.pivot.rotation.y = 0;
    } else if (view === 'pyramid') {
      this.setupPlane();
    } else {
      this.setupRing();
    }
    this.view = view;
    this.planeGeom.computeFaceNormals();
    this.planeGeom.computeMorphNormals();
    this.planeGeom.verticesNeedUpdate = true;
    this.planeGeom.colorsNeedUpdate = true;
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
            this.convertRange(currentData[v], [0, 255], [0.3, 0]),
            1,
            this.convertRange(currentData[v], [0, 255], [0, 0.5])
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
        component.camera.lookAt(component.pivot.position);
      }

      const material = component.planeMesh.material as MeshPhongMaterial;
      material.wireframe = component.wireframe;
      material.flatShading = component.shading;

      if (component.view === 'pyramid') {
        component.test();
      } else if (component.view === 'spectrogram') {
        component.spectogram();
      } else {
        component.updateRing();
      }
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
    this.camera.position.copy(this.pivot.position);
    this.camera.position.z = 150;
    this.camera.position.y = 60;
    this.camera.lookAt(this.pivot.position);
  }

  private createScene() {
    this.scene = new Scene();
    const size = 10;
    const divisions = 10;
  }

  ngAfterViewInit() {
    this.createScene();
    // this.setupPlane(true);
    this.setupPlane();
    this.addLights();
    this.createCamera();
    this.startRendering();
    this.addControls();
  }
}
