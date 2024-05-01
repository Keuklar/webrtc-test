import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ChatComponent } from './chat.component';
import { ChatComponentSimplified } from './chat.component.simplified';



// const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };




@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ChatComponent, ChatComponentSimplified],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'webrtc-test';
}
