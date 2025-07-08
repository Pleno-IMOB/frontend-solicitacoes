import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { Resposta } from '../../common/types';
import { MatButtonModule } from '@angular/material/button';
import { AudioRecorder } from '../audio-recorder/audio-recorder';

@Component({
  selector: 'app-user-audio',
  imports: [
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    MatButtonModule,
    AudioRecorder
  ],
  templateUrl: './user-audio.html',
  styleUrl: './user-audio.scss',
  standalone: true
})
export class UserAudio   {
  @Input() logoUsuario?: string;
  @Input() messageObj!: Resposta;
  @Input() index?: number;
}
