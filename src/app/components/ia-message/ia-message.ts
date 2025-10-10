import { Component, Input } from '@angular/core';
import { Nl2BrPipe } from '../../directives/Nl2BrPipe';
import { BackendService } from '../../services/backend.service';
import { ConversaMessageInterface } from '../../common/types';

@Component({
  selector: 'app-ia-message',
  imports: [
    Nl2BrPipe
  ],
  templateUrl: './ia-message.html',
  styleUrl: './ia-message.scss',
  standalone: true
})
export class IaMessage {
  @Input() public mensagemIa?: ConversaMessageInterface;
  @Input() public logoEmpresa?: string;
  protected defaultImage = 'assets/images/lazy.gif';

  constructor (protected backend: BackendService) {
  }
}