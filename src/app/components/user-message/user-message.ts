import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-user-message',
  imports: [
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './user-message.html',
  styleUrl: './user-message.scss',
  standalone: true
})
export class UserMessage {
  @Input() public mensagemUser?: { message: string | number, time: string };

  constructor (
    protected authService: AuthService
  ) {
  }
}