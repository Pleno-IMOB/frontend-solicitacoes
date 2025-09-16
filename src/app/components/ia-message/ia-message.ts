import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Nl2BrPipe } from '../../directives/Nl2BrPipe';
import { BackendService } from '../../services/backend.service';

@Component({
  selector: 'app-ia-message',
  imports: [
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    Nl2BrPipe
  ],
  templateUrl: './ia-message.html',
  styleUrl: './ia-message.scss',
  standalone: true
})
export class IaMessage {
  @Input() public mensagemIa?: { message: string, time: string };

  constructor (
    protected backend: BackendService
  ) {
  }
}