import React from "react";
import { Component } from "react";
import SequencerContainer from "./sequencerContainer";
import "../css/root.css";

export interface RootProps {}

export interface RootState {
  audioContext: AudioContext;
  bpm: number;
}

class Root extends React.Component<RootProps, RootState> {
  static readonly DEFAULT_BPM = 120;
  static readonly NUM_SEQUENCERS = 15;

  constructor(props: RootProps) {
    super(props);

    this.state = {
      bpm: Root.DEFAULT_BPM,
      audioContext: new AudioContext()
    };

    this.bpmChange = this.bpmChange.bind(this);
  }

  bpmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const bpm = parseInt(e.currentTarget.value) || 120;
    this.setState({ bpm });
  };

  render() {
    return (
      <div>
        <div>
          {this.state.bpm + "bpm"}
          <input
            className="bpmslider"
            type="range"
            min="30"
            max="600"
            defaultValue="120"
            onChange={this.bpmChange}
          />
        </div>

        <SequencerContainer
          key="SequencerContainer"
          bpm={this.state.bpm}
          numSequencers={Root.NUM_SEQUENCERS}
          audioContext={this.state.audioContext}
        />
      </div>
    );
  }
}

export default Root;
