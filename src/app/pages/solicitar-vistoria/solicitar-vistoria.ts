import { Component, ViewChild } from '@angular/core';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { CidadeOperacao, Imobiliaria } from '../../common/types';
import { cidadesOperacao, imobiliaria } from '../../../assets/mocks';
import { CidadeOperacaoCard } from '../../components/cidade-operacao-card/cidade-operacao-card';

@Component({
  selector: 'app-solicitar-vistoria',
  imports: [
    MatStepper,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    CommonModule,
    CidadeOperacaoCard
  ],
  templateUrl: './solicitar-vistoria.html',
  styleUrl: './solicitar-vistoria.scss'
})
export class SolicitarVistoria {
  @ViewChild('stepper', { static: false }) stepper!: MatStepper;
  protected cidadesOperacao!: CidadeOperacao[];
  protected selectedCidadeOperacao!: CidadeOperacao;
  protected empresa!: Imobiliaria;

  constructor () {
    this.cidadesOperacao = cidadesOperacao;
    this.empresa = imobiliaria;
  }

  /**
   * Avança para o próximo passo no stepper e define a cidade de operação selecionada.
   * @param cidade - Cidade de operação a ser selecionada.
   */
  protected selecionaCidadeOperacao (cidade: CidadeOperacao): void {
    this.stepper.next();
    this.selectedCidadeOperacao = cidade;
  }
}
