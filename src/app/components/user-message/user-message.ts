import { Component, Input } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { BackendService } from '../../services/backend.service';

@Component({
  selector: 'app-user-message',
  imports: [],
  templateUrl: './user-message.html',
  styleUrl: './user-message.scss',
  standalone: true
})
export class UserMessage {
  @Input() public mensagemUser?: { message: string | number, time: string };

  constructor (
    protected authService: AuthService,
    protected backend: BackendService
  ) {
  }
}