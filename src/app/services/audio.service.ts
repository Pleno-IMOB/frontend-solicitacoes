import {Inject, Injectable, PLATFORM_ID} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {bufferToWave} from '../common/utils';
import {isPlatformBrowser} from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private chunks: any[] = [];
  private mediaRecorder: MediaRecorder | null = null;
  private audioContext: AudioContext | null = null;
  private audioBlobSubject: Subject<Blob> = new Subject<Blob>();
  private readonly isBrowser: boolean = false;

  public audioBlob$: Observable<Blob> = this.audioBlobSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  async startRecording(): Promise<void> {
    if (!this.isBrowser) return;

    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }

    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.mediaRecorder = new MediaRecorder(stream);
    this.chunks = [];

    this.mediaRecorder.ondataavailable = (event: BlobEvent) => this.chunks.push(event.data);
    this.mediaRecorder.start();
  }

  async stopRecording(): Promise<void> {
    if (!this.isBrowser || !this.mediaRecorder || !this.audioContext) return;

    this.mediaRecorder.onstop = async () => {
      const audioData = await new Blob(this.chunks).arrayBuffer();
      const audioBuffer = await this.audioContext!.decodeAudioData(audioData);
      const wavBlob = bufferToWave(audioBuffer, audioBuffer.length);
      this.audioBlobSubject.next(wavBlob);
      this.chunks = [];
    };

    this.mediaRecorder.stop();
  }
}
