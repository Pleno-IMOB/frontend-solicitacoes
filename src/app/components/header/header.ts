import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-header',
  imports: [
    MatIconModule,
    MatButton
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header implements OnInit {
  constructor () {
  }

  ngOnInit () {
  }
}
