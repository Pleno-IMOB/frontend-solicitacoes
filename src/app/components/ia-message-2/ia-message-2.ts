import { Component, Input, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Nl2BrPipe } from '../../directives/Nl2BrPipe';
import { BackendService } from '../../services/backend.service';

@Component({
  selector: 'app-ia-message-2',
  imports: [
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    Nl2BrPipe
  ],
  templateUrl: './ia-message-2.html',
  styleUrl: './ia-message-2.scss',
  standalone: true
})
export class IaMessage2 implements OnInit {
  @Input() public mensagemIa?: { message: string, time: string };

  constructor (
    protected backend: BackendService
  ) {
  }

  ngOnInit (): void {
  }
}