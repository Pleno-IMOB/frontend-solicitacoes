import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { RespostaInterface } from '../../common/types';

@Component({
  selector: 'app-audio-recorder',
  imports: [],
  templateUrl: './audio-recorder.html',
  styleUrl: './audio-recorder.scss',
  standalone: true
})
export class AudioRecorder {
  @Input() audioObj!: RespostaInterface;
  @ViewChild('audioPlayer') audioPlayer!: ElementRef<HTMLAudioElement>;
}