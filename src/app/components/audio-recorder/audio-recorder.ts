import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output, SimpleChanges,
  ViewChild
} from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Subject} from 'rxjs';
import {bufferToWave} from '../../common/utils';
import {AudioService} from '../../services/audio.service';
import {log} from 'node:util';
import {PerguntaResposta, Resposta} from '../../common/types';

@Component({
  selector: 'app-audio-recorder',
  imports: [
  ],
  templateUrl: './audio-recorder.html',
  styleUrl: './audio-recorder.scss',
  standalone: true
})
export class AudioRecorder {
  @Input() audioObj!: Resposta;
  @ViewChild('audioPlayer') audioPlayer!: ElementRef<HTMLAudioElement>;

  constructor() {
  }
}
