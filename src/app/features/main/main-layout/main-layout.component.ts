import { Component, inject } from '@angular/core';
import { LogoutComponent } from '../../../shared/components/logout/logout.component';
import { NavComponent } from "../../../nav/nav.component";

@Component({
  selector: 'app-main-layout',
  imports: [NavComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent {}
