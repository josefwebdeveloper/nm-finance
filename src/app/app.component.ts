import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {MainNavComponent} from "./components/main-nav/main-nav.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MainNavComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'nm-finance';
}
