import { Component, ViewChild } from '@angular/core';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { CidadeOperacao, Imobiliaria, TipoVistoria } from '../../common/types';
import { cidadesOperacao, imobiliaria, tiposDeVistoria } from '../../../assets/mocks';
import { MainCard } from '../../components/main-card/main-card';

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
    MainCard
  ],
  templateUrl: './solicitar-vistoria.html',
  styleUrl: './solicitar-vistoria.scss'
})
export class SolicitarVistoria {
  @ViewChild('stepper', { static: false }) stepper!: MatStepper;
  protected empresa!: Imobiliaria;
  protected cidadesOperacao!: CidadeOperacao[];
  protected tiposDeVistoria!: TipoVistoria[];
  protected selectedCidadeOperacao!: CidadeOperacao;
  protected selectedTipoVistoria!: TipoVistoria;

  constructor () {
    this.cidadesOperacao = cidadesOperacao;
    this.empresa = imobiliaria;
    this.tiposDeVistoria = tiposDeVistoria;
  }

  /**
   * Avança para o próximo passo no stepper e define a cidade de operação selecionada.
   * @param cidade - Cidade de operação a ser selecionada.
   */
  protected selecionaCidadeOperacao (cidade: CidadeOperacao): void {
    this.stepper.next();
    this.selectedCidadeOperacao = cidade;
  }

  /**
   * Avança para o próximo passo no stepper e define o tipo de vistoria selecionado.
   * @param tipoVistoria - Tipo de vistoria a ser selecionado.
   */
  protected selecionaTipoVistoria (tipoVistoria: TipoVistoria): void {
    this.stepper.next();
    this.selectedTipoVistoria = tipoVistoria;
  }
}
