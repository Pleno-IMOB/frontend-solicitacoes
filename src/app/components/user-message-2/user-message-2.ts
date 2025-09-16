import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-user-message-2',
  imports: [
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './user-message-2.html',
  styleUrl: './user-message-2.scss',
  standalone: true
})
export class UserMessage2 {
  @Input() public mensagemUser?: { message: string, time: string };

  constructor (
    protected authService: AuthService
  ) {
  }
}