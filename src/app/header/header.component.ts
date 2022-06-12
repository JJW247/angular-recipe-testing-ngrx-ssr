import {Component} from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  // responsive display for tiny viewport
  collapsed: boolean = true;
}
