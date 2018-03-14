export class Drawer {
  private canvas: HTMLCanvasElement;
  private canvasCtx: CanvasRenderingContext2D;

  public barGap = 1;
  public smoothing;
  public freqRange = 2.5;
  public color = '#eeeeee';

  private width;
  private height;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.canvasCtx = this.canvas.getContext('2d');

    this.width = this.canvas.width;
    this.height = this.canvas.height;
  }


  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

  normalize(min, max) {
    const delta = max - min;
    return function(val) {
      return (val - min) / delta;
    };
  }

  public draw(array) {
    this.canvasCtx.fillStyle = 'rgb(0,0,0)';
    this.canvasCtx.fillRect(0, 0, this.width, this.height);

    const barWidth = this.width / array.length * this.freqRange;
    let barHeight = 0;
    let x = 0;

    for (let i = 0; i < array.length; i++) {
      barHeight = array[i] / 2;
      
      this.canvasCtx.fillStyle = `rgba(200, 0, 0, ${this.normalize(0, 128)(array[i])})`;
      this.canvasCtx.fillRect(
        x,
        this.height - barHeight / 2,
        barWidth,
        barHeight
      );

      x += barWidth + this.barGap;
    }
  }
}
