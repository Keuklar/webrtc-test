import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'

// const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
const configuration = undefined;

function onAddIceCandidateSuccess() {
  console.info('AddIceCandidate success.');
}

function onAddIceCandidateError(error: { toString: () => any; }) {
  console.info(`Failed to add Ice Candidate: ${error.toString()}`);
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  imports: [CommonModule, FormsModule],
  standalone: true
})
export class ChatComponent implements OnInit {
  chatMessages: string[] = [];
  newMessage: string = '';
  sendChannel!: RTCDataChannel;
  remoteConnection!: RTCPeerConnection;
  localConnection!: RTCPeerConnection;
  receiveChannel!: RTCDataChannel;

  ngOnInit(): void {
    this.createConnections();
  }

  createConnections() {
    const servers = undefined;
    this.localConnection = this.createLocalConnection(servers);
    this.sendChannel = this.createSendChannel(this.localConnection);
    this.remoteConnection = this.createRemoteConnection(servers);
    this.localConnection.createOffer().then(
      this.gotDescription1(this.remoteConnection),
      this.onCreateSessionDescriptionError
    );
    // resetUI();
  }

  sendMessage() {
    const message = this.newMessage.trim();
    if (message) {
      this.chatMessages.push(message);
      this.sendData(message);
      this.newMessage = '';
    }
  }

  sendData(message: string) {
    console.info('dataChannel.readyState:', this.sendChannel.readyState);
    if (this.sendChannel.readyState === 'open') {
      this.sendChannel.send(message);
      console.info('Sent Data: ' + message);
    }
  }

  getOtherPc(pc: RTCPeerConnection) {
    return (pc === this.localConnection) ? this.remoteConnection : this.localConnection;
  }

  onIceCandidate(pc: RTCPeerConnection, event: RTCPeerConnectionIceEvent) {
    this.getOtherPc(pc)
      .addIceCandidate(<RTCIceCandidate>event.candidate) // hum hum
      .then(
        onAddIceCandidateSuccess,
        onAddIceCandidateError
      );
    console.info(`${this.getName(pc)} ICE candidate: ${event.candidate ? event.candidate.candidate : '(null)'}`);
  }

  gotDescription1(remoteConnection: RTCPeerConnection) {
    return (desc: RTCSessionDescriptionInit) => {
      this.localConnection.setLocalDescription(desc);
      console.info(`Offer from localConnection\n${desc.sdp}`);
      remoteConnection.setRemoteDescription(desc);
      remoteConnection.createAnswer().then(
        this.gotDescription2(remoteConnection),
        this.onCreateSessionDescriptionError
      );
    }
  }

  gotDescription2(remoteConnection: RTCPeerConnection) {
    return (desc: RTCSessionDescriptionInit) => {
      remoteConnection.setLocalDescription(desc);
      console.info(`Answer from remoteConnection\n${desc.sdp}`);
      this.localConnection.setRemoteDescription(desc);
    }
  }

  getName(pc: RTCPeerConnection) {
    return (pc === this.localConnection) ? 'localPeerConnection' : 'remotePeerConnection';
  }

  createRemoteConnection(rtcConfiguration: RTCConfiguration | undefined) {
    const remoteConnection = new RTCPeerConnection(rtcConfiguration);
    console.info('Created remote peer connection object remoteConnection');
    remoteConnection.onicecandidate = e => {
      this.onIceCandidate(remoteConnection, e);
    };
    remoteConnection.ondatachannel = this.receiveChannelCallback;
    return remoteConnection;
  }

  createSendChannel(localConnection: RTCPeerConnection) {
    const sendChannel = localConnection.createDataChannel('sendDataChannel');
    console.info('Created send data channel');
    sendChannel.onopen = () => this.onSendChannelStateChange(sendChannel);
    sendChannel.onclose = () => this.onSendChannelStateChange(sendChannel);
    return sendChannel;
  }

  onSendChannelStateChange(sendChannel: RTCDataChannel) {
    console.info(`Send channel state is: ${sendChannel.readyState}`);
  }

  createLocalConnection(servers: RTCConfiguration | undefined) {
    const localConnection = new RTCPeerConnection(servers);
    localConnection.onicecandidate = e => {
      this.onIceCandidate(localConnection, e);
    };
    console.info('Created local peer connection object localConnection');
    return localConnection;
  }

  receiveChannelCallback(event: RTCDataChannelEvent) {
    console.info('Receive Channel Callback');
    this.receiveChannel = event.channel;
    this.receiveChannel.onmessage = (event: MessageEvent) => {
      console.info('Received Message');
      console.info(event.data);
    }
    this.receiveChannel.onopen = (e) => console.info(`type: ${e}`);
    this.receiveChannel.onclose = (e) => console.info(`type: ${e}`);


/*     this.receiveChannel.onmessage = this.onReceiveMessageCallback;
    this.receiveChannel.onopen = this.onReceiveChannelStateChange;
    this.receiveChannel.onclose = this.onReceiveChannelStateChange;
 */  }

  onReceiveMessageCallback = (event: MessageEvent) => {
    console.info('Received Message');
    console.info(event.data);
  }

  onReceiveChannelStateChange(event: Event) {
    console.info(`event: ${event}`)
    console.info(`Receive channel state is: ${this.receiveChannel.readyState}`);
  }

  onCreateSessionDescriptionError(error: { toString: () => string; }) {
    console.info('Failed to create session description: ' + error.toString());
  }

}

