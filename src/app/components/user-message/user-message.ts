import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { Resposta } from '../../common/types';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-user-message',
  imports: [
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './user-message.html',
  styleUrl: './user-message.scss',
  standalone: true
})
export class UserMessage {
  @Input() logoUsuario?: string;
  @Input() messageObj?: Resposta;
  @Input() index?: number;
}
