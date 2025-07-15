import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AnimatedBgComponent } from '../../../shared/components/animated-bg/animated-bg.component';
import { HeaderComponent } from '../../../shared/components/header/header.component';

@Component({
  selector: 'app-auth-layout',
  imports: [
    RouterOutlet,
    AnimatedBgComponent,
    HeaderComponent
  ],
  templateUrl: './auth-layout.component.html',
  styleUrl: './auth-layout.component.scss',
})
export class AuthLayoutComponent {}
