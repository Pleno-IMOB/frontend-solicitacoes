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
  @Input() mostrarInput: boolean = true;
  @Output() enviaMensagemUsuario: EventEmitter<string> = new EventEmitter<string>();
  @Output() enviaAudioUsuario: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('audioPlayer') audioPlayer!: ElementRef<HTMLAudioElement>;

  constructor (
    private formBuilder: FormBuilder,
    private audioRecordingService: AudioService,
    private cd: ChangeDetectorRef
  ) {
    if(this.mostrarInput) {
      this.formIa = this.formBuilder.group({
        prompt: [ null, Validators.required ],
      });
    }
  }

  /**
   * Inicializa o componente e configura a assinatura para o serviço de gravação de áudio.
   * @property {boolean} mostrarInput - Indica se o input deve ser exibido.
   * @property {string | null} audioURL - URL do áudio gravado.
   */
  ngOnInit (): void {
    if(this.mostrarInput) {
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
  }

  /**
   * Abre um seletor de arquivos oculto e processa o arquivo selecionado.
   */
  protected selecionarArquivo(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.style.display = 'none';

    input.addEventListener('change', (event: Event) => {
      const target = event.target as HTMLInputElement;

      if (target.files && target.files.length > 0) {
        const arquivo = target.files[0];
        console.log('Arquivo selecionado:', arquivo);

        const formData = new FormData();
        formData.append('arquivo', arquivo);
      }
    });

    document.body.appendChild(input);
    input.click();

    setTimeout((): HTMLInputElement => document.body.removeChild(input), 0);
  }

  /**
   * Converte um Blob em uma string Base64.
   * @param blob - O Blob que será convertido.
   * @returns Uma Promise que resolve para a string Base64 do Blob.
   */
  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
    });
  }

  /**
   * Envia uma mensagem do usuário se não estiver carregando.
   * @param event - Evento de envio do formulário.
   */
  protected enviarMensagem(event: Event): void {
    event?.preventDefault();
    if ( this.loading ) {
      return;
    }
    const control: AbstractControl<any, any> | null = this.formIa.get('prompt');
    this.enviaMensagemUsuario.emit(control?.value);
    control?.setValue('');
  }

  /**
   * Inicia a gravação de áudio.
   * @property {boolean} isRecording - Indica se a gravação está em andamento.
   */
  protected startRecording(): void {
    this.isRecording = true;
    this.audioRecordingService.startRecording().then();
  }

  /**
   * Para a gravação de áudio.
   * @property {boolean} isRecording - Indica se a gravação está em andamento.
   */
  protected stopRecording(): void {
    this.isRecording = false;
    this.audioRecordingService.stopRecording().then();
  }
}
