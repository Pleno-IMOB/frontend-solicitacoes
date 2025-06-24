import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AudioService } from '../../services/audio.service';
import moment from 'moment';

@Component({
  selector: 'app-footer',
  imports: [
    CommonModule,
    MatDividerModule,
    FontAwesomeModule,
    MatFormFieldModule,
    MatInputModule,
    MatButton,
    MatIconModule,
    ReactiveFormsModule,
  ],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
  standalone: true
})
export class Footer implements OnInit {
  protected formIa!: FormGroup;
  protected isRecording: boolean = false;
  protected audioURL: string | null = null;
  @Input() loading: boolean = false;
  @Output() enviaMensagemUsuario: EventEmitter<string> = new EventEmitter<string>();
  @Output() enviaAudioUsuario: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('audioPlayer') audioPlayer!: ElementRef<HTMLAudioElement>;

  constructor (
    private formBuilder: FormBuilder,
    private audioRecordingService: AudioService,
    private cd: ChangeDetectorRef
  ) {
    this.formIa = this.formBuilder.group({
      prompt: [ null, Validators.required ],
    });
  }

  ngOnInit () {
    this.audioRecordingService.audioBlob$.subscribe(blob => {
      this.audioURL = window.URL.createObjectURL(blob);
      this.cd.detectChanges();
      this.blobToBase64(blob).then((base64: string) => {
        this.enviaAudioUsuario.emit({
          blob,
          base64,
          url: this.audioURL,
          time: moment().format('HH:mm:ss DD/MM/YY')
        });
      });
    });
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
    });
  }

  protected enviarMensagem(event: Event): void {
    event?.preventDefault();
    if ( this.loading ) {
      return;
    }
    const control: AbstractControl<any, any> | null = this.formIa.get('prompt');
    this.enviaMensagemUsuario.emit(control?.value);
    control?.setValue('');
  }

  protected startRecording(): void {
    this.isRecording = true;
    this.audioRecordingService.startRecording().then();
  }

  protected stopRecording(): void {
    this.isRecording = false;
    this.audioRecordingService.stopRecording().then();
  }
}
