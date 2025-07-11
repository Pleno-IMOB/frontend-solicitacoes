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
import { base64ToBlob, fileToBase64 } from '../../common/common';
import Swal from 'sweetalert2';
import { Anexo } from '../../common/types';

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
  @Output() enviaArquivoUsuario: EventEmitter<any> = new EventEmitter<any>();

  constructor (
    private formBuilder: FormBuilder,
    private audioRecordingService: AudioService,
    private cd: ChangeDetectorRef
  ) {
    this.formIa = this.formBuilder.group({
      prompt: [ null, Validators.required ],
    });
  }

  /**
   * Inicializa o componente e configura a assinatura para o serviço de gravação de áudio.
   * @property {string | null} audioURL - URL do áudio gravado.
   */
  ngOnInit (): void {
    this.audioRecordingService.audioBlob$.subscribe((blob: Blob) => {
      this.audioURL = window.URL.createObjectURL(blob);
      this.cd.detectChanges();
      fileToBase64(blob).then((base64: string): void => {
        this.enviaAudioUsuario.emit({
          blob,
          base64,
          url: this.audioURL,
          time: moment().format('HH:mm:ss DD/MM/YY'),
          isAudio: true
        });
      });
    });
  }

  /**
   * Abre um seletor de arquivos oculto e processa o arquivo selecionado.
   */
  protected selecionarArquivo(): void {
    const listaAnexos: Anexo[] = [];
    const input: HTMLInputElement = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx,.xls,.xlsx,application/msword,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/pdf';
    input.multiple = true;
    input.style.display = 'none';

    input.addEventListener('change', async (event: Event): Promise<void> => {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        const tiposPermitidos: string[] = ['pdf', 'doc', 'docx', 'xls', 'xlsx'];

        for (const arquivo of Array.from(target.files)) {
          let index = 0;
          const extensao: string | undefined = arquivo.name.split('.').pop()?.toLowerCase();

          if (!extensao || !tiposPermitidos.includes(extensao)) {
            await Swal.fire({
              html: `<h3>Tipo de arquivo inválido</h3><br><h4>Permitidos (PDF, DOC e XLS).</h4>`,
              icon: 'error',
              focusCancel: true,
              customClass: { confirmButton: 'btn btn-warning' },
              allowOutsideClick: false,
              allowEscapeKey: false
            });
            continue;
          }

          const base64: string = await fileToBase64(arquivo);
          const blob: Blob = base64ToBlob(base64, `application/${extensao}`);
          const url: string = URL.createObjectURL(blob);
          const name: string = arquivo?.name;
          const time: string = moment().format('HH:mm:ss DD/MM/YY');

          listaAnexos.push({
            base64,
            blob,
            url,
            name,
            time,
            index
          });

          index++;
        }

        this.enviaArquivoUsuario.emit({
          time: moment().format('HH:mm:ss DD/MM/YY'),
          isAudio: false,
          anexos: listaAnexos
        });
      }
    });

    document.body.appendChild(input);
    input.click();
    setTimeout(() => document.body.removeChild(input), 0);
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
