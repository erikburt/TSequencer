import React from "react";
import { Component } from "react";
import SequencerContainer from "./components/sequencerContainer";
import "./css/App.css";

export interface AppProps {}

export interface AppState {
  audioContext: AudioContext;
}

class App extends React.Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);

    this.state = {
      audioContext: new AudioContext()
    };
  }

  render() {
    return (
      <SequencerContainer
        key="SequencerContainer"
        bpm={120}
        numSequencers={15}
        audioContext={this.state.audioContext}
      />
    );
  }
}

export default App;
