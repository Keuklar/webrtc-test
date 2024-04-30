import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {CommonModule} from '@angular/common'

const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

/*
async function handleSignalingMessage(message: any) {
  const offer = new RTCSessionDescription(message);
  await peerConnection.setRemoteDescription(offer);
  // Create an answer and send it to the remote peer
}
*/

const peerConnection = new RTCPeerConnection(configuration);

// Signaling process
peerConnection.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
  if (event.candidate) {
    // Send the candidate to the remote peer
  }
};


// Create a data channel
const dataChannel = peerConnection.createDataChannel('myDataChannel');

// Set up event listeners for data channel events
dataChannel.onopen = () => {
  console.log('Data channel opened');
};

dataChannel.onmessage = (event: MessageEvent) => {
  const message = event.data;
  console.log('Received message:', message);
};


@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  imports: [CommonModule, FormsModule],
  standalone: true
//   styleUrls: ['./chat.component.css']
})
export class ChatComponent {
  chatMessages: string[] = [];
  newMessage: string = '';

  constructor() {
    // Set up the data channel event listeners
    dataChannel.onmessage = (event: MessageEvent) => {
      const message = event.data;
      this.chatMessages.push(message);
    };
  }

  sendMessage() {
    const message = this.newMessage.trim();
    if (message) {
      this.chatMessages.push(message);
      sendData(message);
      this.newMessage = '';
    }
  }
}

// Send data through the data channel
const sendData = (message: string) => {
  if (dataChannel.readyState === 'open') {
    dataChannel.send(message);
    console.log('Sent message:', message);
  }
};


navigator.mediaDevices.getUserMedia({ audio: true, video: true })
  .then((stream) => {
    // Add the stream to the local video element
    const localVideo = document.getElementById('local-video') as HTMLVideoElement;
    localVideo.srcObject = stream;

    // Add the stream to the peer connection
    stream.getTracks().forEach((track) => peerConnection.addTrack(track, stream));
  })
  .catch((error) => console.error('Error accessing media devices: ', error));

