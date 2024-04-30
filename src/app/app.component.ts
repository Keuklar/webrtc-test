import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
// import { RTCPeerConnection, RTCSessionDescription } from 'wrtc';
import { ChatComponent } from './chat.component';



// const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };




@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ChatComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'webrtc-test';
}
