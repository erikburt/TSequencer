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
  bpm: number;
}

class SequencerContainer extends React.Component<
  SequencerContainerProps,
  SequencerContainerState
> {
  static readonly NUM_STEPS = 64;

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
      audioRefs,
      bpm
    };
  }

  tick() {
    const step = (this.state.step + 1) % SequencerContainer.NUM_STEPS;

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

  updateBPM = () => {
    const { bpm } = this.props;
    this.setState({ bpm, interval: Math.ceil((60 * 1000) / bpm) });

    clearInterval(this.timer);

    this.timer = window.setInterval(() => {
      this.tick();
    }, this.state.interval);
  };

  render() {
    if (this.props.bpm !== this.state.bpm) {
      this.updateBPM();
    }

    let sequencers: JSX.Element[] = [];

    for (let i = 0; i < this.props.numSequencers; i++) {
      const audio = this.state.audioRefs[i % this.state.audioRefs.length];

      sequencers.push(
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

    return sequencers;
  }
}

export default SequencerContainer;
