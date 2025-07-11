import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { Anexo } from '../../common/types';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-user-arquivo',
  imports: [
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './user-arquivo.html',
  styleUrl: './user-arquivo.scss',
  standalone: true
})
export class UserArquivo {
  @Input() anexo!: Anexo;
  @Input() index?: number;

  protected openArquivo (): void {
    if(this.anexo) {
      window.open(this.anexo.url, '_blank');
    }
  }
}
