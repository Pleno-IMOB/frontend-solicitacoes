import { Component, Input } from '@angular/core';
import { RespostaInterface } from '../../common/types';
import { AudioRecorder } from '../audio-recorder/audio-recorder';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-user-audio',
  imports: [
    AudioRecorder
  ],
  templateUrl: './user-audio.html',
  styleUrl: './user-audio.scss',
  standalone: true
})
export class UserAudio {
  @Input() messageObj!: RespostaInterface;
  @Input() index?: number;

  constructor (
    protected authService: AuthService
  ) {
  }
}