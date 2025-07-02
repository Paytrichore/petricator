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

  private getCssVar(name: string): string {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  private loadColorSetsFromCss() {
    this.colorSets = [
      [
        this.getCssVar('--palette-morning-1'),
        this.getCssVar('--palette-morning-2'),
        this.getCssVar('--palette-morning-3'),
        this.getCssVar('--palette-morning-4'),
        this.getCssVar('--palette-morning-5'),
        this.getCssVar('--palette-morning-6'),
        this.getCssVar('--palette-morning-7'),
        this.getCssVar('--palette-morning-8'),
      ],
      [
        this.getCssVar('--palette-noon-1'),
        this.getCssVar('--palette-noon-2'),
        this.getCssVar('--palette-noon-3'),
        this.getCssVar('--palette-noon-4'),
        this.getCssVar('--palette-noon-5'),
        this.getCssVar('--palette-noon-6'),
        this.getCssVar('--palette-noon-7'),
        this.getCssVar('--palette-noon-8'),
      ],
      [
        this.getCssVar('--palette-evening-1'),
        this.getCssVar('--palette-evening-2'),
        this.getCssVar('--palette-evening-3'),
        this.getCssVar('--palette-evening-4'),
        this.getCssVar('--palette-evening-5'),
        this.getCssVar('--palette-evening-6'),
        this.getCssVar('--palette-evening-7'),
        this.getCssVar('--palette-evening-8'),
      ],
      [
        this.getCssVar('--palette-night-1'),
        this.getCssVar('--palette-night-2'),
        this.getCssVar('--palette-night-3'),
        this.getCssVar('--palette-night-4'),
        this.getCssVar('--palette-night-5'),
        this.getCssVar('--palette-night-6'),
        this.getCssVar('--palette-night-7'),
        this.getCssVar('--palette-night-8'),
      ]
    ];
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.loadColorSetsFromCss();
      this.setColorsForCurrentTime();
      this.initCanvas();
      this.animate();
      window.addEventListener('resize', this.resizeCanvas);
      this.colorSetInterval = setInterval(() => {
        this.setColorsForCurrentTime();
      }, 15 * 60 * 1000);
    });
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.animationId);
    window.removeEventListener('resize', this.resizeCanvas);
    if (this.colorSetInterval) clearInterval(this.colorSetInterval);
  }

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
    this.width = canvas.width = window.innerWidth;
    this.height = canvas.height = window.innerHeight;
    // Utilise willReadFrequently pour optimiser les accès getImageData
    this.ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    this.points = [];
    for (let i = 0; i < 8; i++) {
      const color = this.colors[Math.floor(Math.random() * this.colors.length)];
      this.points.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        r: 450 + Math.random() * 250,
        color,
        dx: (Math.random() - 0.5) * 1.5,
        dy: (Math.random() - 0.5) * 1.5,
        dr: (Math.random() - 0.5) * 0.5,
        tx: Math.random() * this.width,
        ty: Math.random() * this.height,
        tr: 450 + Math.random() * 250,
        tColor: this.colors[Math.floor(Math.random() * this.colors.length)],
        morphTime: Date.now(),
        morphProgress: 0
      });
    }
  };

  private lerp(a: number, b: number, t: number) {
    return a + (b - a) * t;
  }

  private lerpColor(a: string, b: string, t: number) {
    // Supporte rgba(r, g, b, a) ou #rrggbb
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
      // fallback noir
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

  private resizeCanvas = () => {
    this.initCanvas();
  };

  private animate = () => {
    this.ctx.clearRect(0, 0, this.width, this.height);
    const now = Date.now();
    this.ctx.save();
    this.ctx.globalAlpha = 0.7;
    this.ctx.globalCompositeOperation = 'lighter';
    for (const p of this.points) {
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
      this.ctx.filter = 'blur(64px)';
      this.ctx.fill();
      this.ctx.filter = 'none';
      if (t >= 1) {
        p.x = p.tx;
        p.y = p.ty;
        p.r = p.tr;
        p.color = p.tColor;
        p.tx = Math.random() * this.width;
        p.ty = Math.random() * this.height;
        p.tr = 450 + Math.random() * 250;
        p.tColor = this.colors[Math.floor(Math.random() * this.colors.length)];
        p.morphTime = now;
        p.morphProgress = 0;
      }
    }
    this.ctx.globalAlpha = 1;
    this.ctx.globalCompositeOperation = 'source-over';
    this.ctx.restore();
    this.animationId = requestAnimationFrame(this.animate);
  };
}
