import * as React from "react";
import { Component } from "react";
import Step from "./step";
import "../css/sequencer.css";
import AudioBufferWrapper from "../tools/audioBufferWrapper";

export interface SequencerProps {
  id: number;
  stepHeight: number;
  stepWidth: number;
  step: number;
  audio: AudioBufferWrapper;
}

export interface SequencerState {
  numSteps: number;
  steps: boolean[];
  toPlay: boolean;
  prevStep: number;

  /*
  audioFile: ...
  pan
   */
}

class Sequencer extends React.Component<SequencerProps, SequencerState> {
  constructor(props: SequencerProps) {
    super(props);

    const { stepHeight, stepWidth } = props;
    const numSteps = stepHeight * stepWidth;
    const steps = new Array(numSteps).fill(false);

    this.state = {
      numSteps,
      steps,
      toPlay: false,
      prevStep: this.props.step
    };

    this.toggle = this.toggle.bind(this);
  }

  toggle = (id: number, activated: boolean) => {
    let { steps } = this.state;
    steps[id] = activated;
    this.setState({ steps });
  };

  render() {
    let className = "sequencer";

    if (
      this.state.steps[this.props.step] &&
      this.props.step !== this.state.prevStep
    ) {
      className = "seqActive";
      this.setState({ prevStep: this.props.step });
      this.props.audio.play();
    }

    return (
      <div className={className}>
        {this.state.steps.map((step, index) => (
          <Step
            key={`${this.props.id}${index}`}
            id={index}
            step={this.props.step}
            toggleFunc={this.toggle}
          />
        ))}
        {/* <h1>{this.props.audio.title}</h1> */}
        <span>{this.props.audio.filename}</span>
      </div>
    );
  }
}

export default Sequencer;
