import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';

interface MorphPoint {
  x: number;
  y: number;
  r: number;
  color: string;
  dx: number;
  dy: number;
  dr: number;
  tx: number;
  ty: number;
  tr: number;
  tColor: string;
  morphTime: number;
  morphProgress: number;
}

@Component({
  selector: 'app-animated-bg',
  templateUrl: './animated-bg.component.html',
  styleUrls: ['./animated-bg.component.scss']
})
export class AnimatedBgComponent implements AfterViewInit, OnDestroy {
  @ViewChild('gradientCanvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private animationId: number = 0;
  private width = 0;
  private height = 0;
  private points: MorphPoint[] = [];
  private colorSets: string[][] = [];
  private colors: string[] = [];
  private morphDuration = 12000;
  private colorSetInterval: any;
  private lastFrameTime = 0;
  private resolutionScale = 0.5;

  private getCssVar(name: string): string {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  private loadColorSetsFromCss() {
    const palettes = ['morning', 'noon', 'evening', 'night'];
    this.colorSets = palettes.map(palette =>
      Array.from({ length: 8 }, (_, i) => this.getCssVar(`--palette-${palette}-${i + 1}`))
    );
  }

  ngAfterViewInit() {
    requestAnimationFrame(() => {
      this.loadColorSetsFromCss();
      this.setColorsForCurrentTime();
      this.initCanvas();
      this.animate();
      window.addEventListener('resize', this.handleResize);
      this.colorSetInterval = setInterval(() => {
        this.setColorsForCurrentTime();
      }, 15 * 60 * 1000);
    });
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.animationId);
    window.removeEventListener('resize', this.handleResize);
    if (this.colorSetInterval) clearInterval(this.colorSetInterval);
  }

  private handleResize = () => {
    const newWidth = Math.round(window.innerWidth * this.resolutionScale);
    const newHeight = Math.round(window.innerHeight * this.resolutionScale);
    if (newWidth > this.width || newHeight > this.height) {
      const canvas = this.canvasRef.nativeElement;
      // 1. Copier l'ancien contenu
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = this.width;
      tempCanvas.height = this.height;
      const tempCtx = tempCanvas.getContext('2d');
      tempCtx?.drawImage(canvas, 0, 0);
      // 2. Redimensionner le canvas principal
      this.width = Math.max(this.width, newWidth);
      this.height = Math.max(this.height, newHeight);
      canvas.width = this.width;
      canvas.height = this.height;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      // 3. Redessiner l'ancien contenu
      this.ctx = canvas.getContext('2d', { willReadFrequently: true })!;
      this.ctx.drawImage(tempCanvas, 0, 0);
    }
  };

  private setColorsForCurrentTime = () => {
    const hour = new Date().getHours();
    let idx = 0;
    if (hour >= 6 && hour < 12) idx = 0;
    else if (hour >= 12 && hour < 18) idx = 1;
    else if (hour >= 18 && hour < 22) idx = 2;
    else idx = 3;
    this.colors = this.colorSets[idx];
  };

  private initCanvas = () => {
    const canvas = this.canvasRef.nativeElement;
    this.width = Math.round(window.innerWidth * this.resolutionScale);
    this.height = Math.round(window.innerHeight * this.resolutionScale);
    canvas.width = this.width;
    canvas.height = this.height;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    this.ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    this.points = [];
    for (let i = 0; i < 4; i++) {
      const color = this.colors[Math.floor(Math.random() * this.colors.length)];
      const morphTime = Date.now();
      this.points.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        r: 450 * this.resolutionScale + Math.random() * 250 * this.resolutionScale,
        color,
        dx: (Math.random() - 0.5) * 1.5 * this.resolutionScale,
        dy: (Math.random() - 0.5) * 1.5 * this.resolutionScale,
        dr: (Math.random() - 0.5) * 0.5 * this.resolutionScale,
        tx: Math.random() * this.width,
        ty: Math.random() * this.height,
        tr: 450 * this.resolutionScale + Math.random() * 250 * this.resolutionScale,
        tColor: this.colors[Math.floor(Math.random() * this.colors.length)],
        morphTime,
        morphProgress: 0
      });
    }
  };

  private lerp(a: number, b: number, t: number) {
    return a + (b - a) * t;
  }

  private lerpColor(a: string, b: string, t: number) {
    const parse = (c: string) => {
      if (c.startsWith('rgba')) {
        const [r, g, b, a] = c.match(/\d+\.?\d*/g)!.map(Number);
        return { r, g, b, a };
      } else if (c.startsWith('rgb')) {
        const [r, g, b] = c.match(/\d+/g)!.map(Number);
        return { r, g, b, a: 1 };
      } else if (c.startsWith('#')) {
        const n = parseInt(c.replace('#', ''), 16);
        return {
          r: (n >> 16) & 0xff,
          g: (n >> 8) & 0xff,
          b: n & 0xff,
          a: 1
        };
      }
      return { r: 0, g: 0, b: 0, a: 1 };
    };
    const ca = parse(a);
    const cb = parse(b);
    const rr = Math.round(this.lerp(ca.r, cb.r, t));
    const rg = Math.round(this.lerp(ca.g, cb.g, t));
    const rb = Math.round(this.lerp(ca.b, cb.b, t));
    const ra = this.lerp(ca.a, cb.a, t);
    return `rgba(${rr},${rg},${rb},${ra})`;
  }

  private drawMorphPoint(p: MorphPoint, now: number) {
    const t = Math.min((now - p.morphTime) / this.morphDuration, 1);
    p.morphProgress = t;
    const x = this.lerp(p.x, p.tx, t);
    const y = this.lerp(p.y, p.ty, t);
    const r = this.lerp(p.r, p.tr, t);
    const color = this.lerpColor(p.color, p.tColor, t);
    const grad = this.ctx.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, color);
    grad.addColorStop(1, 'transparent');
    this.ctx.beginPath();
    this.ctx.arc(x, y, r, 0, 2 * Math.PI);
    this.ctx.closePath();
    this.ctx.fillStyle = grad;
    this.ctx.filter = `blur(${64 * this.resolutionScale}px)`;
    this.ctx.fill();
    this.ctx.filter = 'none';
    if (t >= 1) {
      p.x = p.tx;
      p.y = p.ty;
      p.r = p.tr;
      p.color = p.tColor;
      p.tx = Math.random() * this.width;
      p.ty = Math.random() * this.height;
      p.tr = 450 * this.resolutionScale + Math.random() * 250 * this.resolutionScale;
      p.tColor = this.colors[Math.floor(Math.random() * this.colors.length)];
      p.morphTime = now;
      p.morphProgress = 0;
    }
  }

  private animate = () => {
    const now = Date.now();
    if (now - this.lastFrameTime < 33) {
      this.animationId = requestAnimationFrame(this.animate);
      return;
    }
    this.lastFrameTime = now;
    if (typeof (this.ctx as any).reset === 'function') {
      (this.ctx as any).reset();
    } else {
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.clearRect(0, 0, this.width, this.height);
    }
    this.ctx.save();
    this.ctx.globalAlpha = 0.7;
    this.ctx.globalCompositeOperation = 'lighter';
    for (const p of this.points) {
      this.drawMorphPoint(p, now);
    }
    this.ctx.globalAlpha = 1;
    this.ctx.globalCompositeOperation = 'source-over';
    this.ctx.restore();
    this.animationId = requestAnimationFrame(this.animate);
  };
}
