import { Component } from '@angular/core';
import {Footer} from "../../../components/footer/footer";
import {Header} from "../../../components/header/header";
import {IaMessage} from "../../../components/ia-message/ia-message";
import {MatButton} from "@angular/material/button";
import {UserAudio} from "../../../components/user-audio/user-audio";
import {UserMessage} from "../../../components/user-message/user-message";

@Component({
  selector: 'app-minha-conta',
    imports: [
        Footer,
        Header,
    ],
  templateUrl: './minha-conta.html',
  styleUrl: './minha-conta.scss'
})
export class MinhaConta {

}
