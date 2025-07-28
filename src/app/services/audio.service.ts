import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private chunks: any[] = [];
  private mediaRecorder: MediaRecorder | null = null;
  private audioContext: AudioContext | null = null;
  private audioBlobSubject: Subject<Blob> = new Subject<Blob>();
  public audioBlob$: Observable<Blob> = this.audioBlobSubject.asObservable();
  private readonly isBrowser: boolean = false;
  private stream: MediaStream | null = null;

  constructor (@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  /**
   * Inicia a gravação de áudio se estiver no ambiente do navegador.
   * @returns {Promise<void>} - Promessa que resolve quando a gravação é iniciada.
   */
  public async startRecording (): Promise<void> {
    if ( !this.isBrowser ) return;

    if ( !this.audioContext ) {
      this.audioContext = new AudioContext();
    }

    if ( this.audioContext.state === 'suspended' ) {
      await this.audioContext.resume();
    }

    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.mediaRecorder = new MediaRecorder(this.stream);
    this.chunks = [];

    this.mediaRecorder.ondataavailable = (event: BlobEvent) => this.chunks.push(event.data);
    this.mediaRecorder.start();
  }

  /**
   * Para a gravação de áudio e processa os dados gravados.
   * @returns {Promise<void>} - Promessa que resolve quando a gravação é parada.
   */
  public async stopRecording (): Promise<void> {
    if ( !this.isBrowser || !this.mediaRecorder || !this.audioContext ) return;

    this.mediaRecorder.onstop = async (): Promise<void> => {
      const audioData: ArrayBuffer = await new Blob(this.chunks).arrayBuffer();
      const audioBuffer = await this.audioContext!.decodeAudioData(audioData);
      const wavBlob: Blob = this.bufferToWave(audioBuffer, audioBuffer.length);
      this.audioBlobSubject.next(wavBlob);
      this.chunks = [];

      this.stream?.getTracks().forEach((track: MediaStreamTrack): any => track.stop());
      this.stream = null;
      this.mediaRecorder = null;
    };

    this.mediaRecorder.stop();
  }

  /**
   * Converte um AudioBuffer em um Blob de áudio WAV.
   * @param {any} abuffer - Buffer de áudio contendo os dados de som.
   * @param {number} len - Comprimento do áudio em amostras.
   * @returns {Blob} - Blob representando o arquivo de áudio WAV.
   */
  protected bufferToWave (abuffer: any, len: number): Blob {
    let numOfChan: any = abuffer.numberOfChannels,
      length: number = len * numOfChan * 2 + 44,
      buffer: ArrayBuffer = new ArrayBuffer(length),
      view: DataView<ArrayBuffer> = new DataView(buffer),
      channels: any = [],
      i, sample,
      offset: number = 0,
      pos: number = 0;

    setUint32(0x46464952);
    setUint32(length - 8);
    setUint32(0x45564157);
    setUint32(0x20746d66);
    setUint32(16);
    setUint16(1);
    setUint16(numOfChan);
    setUint32(abuffer.sampleRate);
    setUint32(abuffer.sampleRate * 2 * numOfChan);
    setUint16(numOfChan * 2);
    setUint16(16);
    setUint32(0x61746164);
    setUint32(length - pos - 8);
    for ( i = 0; i < abuffer.numberOfChannels; i++ )
      channels.push(abuffer.getChannelData(i));

    while ( pos < length ) {
      for ( i = 0; i < numOfChan; i++ ) {
        sample = Math.max(-1, Math.min(1, channels[i][offset]));
        sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
        view.setInt16(pos, sample, true);
        pos += 2;
      }
      offset++;
    }

    return new Blob([ buffer ], { type: 'audio/wav' });

    function setUint16 (data: any): void {
      view.setUint16(pos, data, true);
      pos += 2;
    }

    function setUint32 (data: any): void {
      view.setUint32(pos, data, true);
      pos += 4;
    }
  }
}