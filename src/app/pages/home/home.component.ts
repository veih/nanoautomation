import { Component } from '@angular/core';
import { NavbarComponent } from "../../components/navbar/navbar.component";
import { NavbarColunaComponent } from "../../components/navbar-coluna/navbar-coluna.component";
@Component({
    selector: 'app-home',
    standalone: true,
    templateUrl: './home.component.html',
    styleUrl: './home.component.css',
    imports: [NavbarComponent, NavbarColunaComponent, ]
})
export class HomeComponent {

}
