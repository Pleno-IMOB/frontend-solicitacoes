import { Component, OnInit } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-footer',
  imports: [
    CommonModule,
    MatDividerModule,
    FontAwesomeModule
  ],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
  standalone: true
})
export class Footer implements OnInit {

  constructor () {
  }

  ngOnInit () {
  }
}
