import * as React from "react";
import { Component } from "react";
import Sequencer from "./sequencer";
import AudioBufferWrapper from "../tools/audioBufferWrapper";

const AUDIO_ARRAY = [
  "clap01.wav",
  "clap02.wav",
  "closedhat01.wav",
  "closedhat02.wav",
  "drop.wav",
  "kick01.wav",
  "kick02.wav",
  "laser.wav",
  "openhat01.wav",
  "openhat02.wav",
  "snare01.wav",
  "snare02.wav",
  "tom01.wav",
  "tom02.wav",
  "tom03.wav"
];

export interface SequencerContainerProps {
  bpm: number;
  numSequencers: number;
  audioContext: AudioContext;
}

export interface SequencerContainerState {
  step: number;
  interval: number;
  audioRefs: AudioBufferWrapper[];
}

class SequencerContainer extends React.Component<
  SequencerContainerProps,
  SequencerContainerState
> {
  timer: number = 0;

  constructor(props: SequencerContainerProps) {
    super(props);

    const { bpm } = props;

    let audioRefs = AUDIO_ARRAY.map(
      filename =>
        new AudioBufferWrapper(this.props.audioContext, `/audio/${filename}`)
    );

    this.state = {
      step: 0,
      interval: Math.ceil((60 * 1000) / bpm),
      audioRefs
    };
  }

  tick() {
    const step = (this.state.step + 1) % 64;

    this.setState({
      step
    });
  }

  componentDidMount() {
    this.timer = window.setInterval(() => {
      this.tick();
    }, this.state.interval);
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  render() {
    let test: JSX.Element[] = [];

    for (let i = 0; i < this.props.numSequencers; i++) {
      const audio = this.state.audioRefs[i % this.state.audioRefs.length];

      test.push(
        <Sequencer
          key={i}
          id={i}
          stepHeight={8}
          stepWidth={8}
          step={this.state.step}
          audio={audio}
        />
      );
    }

    return test;
  }
}

export default SequencerContainer;
