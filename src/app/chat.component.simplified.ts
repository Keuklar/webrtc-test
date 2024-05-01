import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'


@Component({
  selector: 'app-chat-simplified',
  templateUrl: './chat.component.simplified.html',
  imports: [CommonModule, FormsModule],
  standalone: true
})
export class ChatComponentSimplified {
  newMessage: string = '';
  private pc1 = new RTCPeerConnection();
  private pc2 = new RTCPeerConnection();

  dc1!: RTCDataChannel;
  readonly onicecandidate = (peerConnection: RTCPeerConnection) => (peerConnectionIceEvent: RTCPeerConnectionIceEvent) => {
    console.info('peerConnectionIceEvent event', peerConnectionIceEvent);
    peerConnection.addIceCandidate(peerConnectionIceEvent.candidate!!);
  };

  createConnections() {
    if (this.pc1.connectionState != 'new') {
      this.pc1 = new RTCPeerConnection();
    }
    if (this.pc2.connectionState != 'new') {
      this.pc2 = new RTCPeerConnection();
    }
    this.pc1.onicecandidate = this.onicecandidate(this.pc2);
    this.pc2.onicecandidate = this.onicecandidate(this.pc1);

    this.pc1.oniceconnectionstatechange = (event: Event) => {
      console.info('oniceconnectionstatechange event', event)
      console.info('this.pc1.iceConnectionState', this.pc1.iceConnectionState);
    }

    this.pc2.oniceconnectionstatechange = (event: Event) => {
      console.info('oniceconnectionstatechange event', event)
      console.info('this.pc2.iceConnectionState', this.pc2.iceConnectionState);
    }

    this.pc1.onnegotiationneeded = (event: Event) => {
      console.info('onnegotiationneeded event', event);
      this.pc1
        .createOffer()
        .then((desc: RTCSessionDescriptionInit) => this.pc1.setLocalDescription(desc))
        .then(() => this.pc2.setRemoteDescription(this.pc1.localDescription!!))
        .then(() => this.pc2.createAnswer())
        .then((desc: RTCSessionDescriptionInit) => this.pc2.setLocalDescription(desc))
        .then(() => this.pc1.setRemoteDescription(this.pc2.localDescription!!))
        .catch(err => console.error(err));
    }
    this.pc2.ondatachannel = (datachannelEvent: RTCDataChannelEvent) => {
      let dc2 = datachannelEvent.channel;
      dc2.onopen = (event: Event) => {
        console.info('onopen event', event);
        console.info('Chat!');
      }
      dc2.onmessage = (messageEvent: MessageEvent) => console.info('> ' + messageEvent.data);
      dc2.onclose = (event: Event) => console.info('onclose event', event);
    };
    this.dc1 = this.pc1.createDataChannel('chat');
    this.dc1.onclose = (event: Event) => console.info('onclose event', event);
    // dc1.onopen = () => (chat.disabled = false, chat.select()); // TODO 
  }

  sendMessage() {
    this.dc1?.send(this.newMessage);
  }

  closeDataChannels() {
    this.closeConnections();
    // resetUI();
  }

  closeConnections() {
    this.pc1.close();
    this.pc2.close();
    console.log('Closed peer connections');
  }

}
