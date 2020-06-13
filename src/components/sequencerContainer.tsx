import * as React from "react";
import Sequencer from "./Sequencer";
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
  "tom03.wav",
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

const SequencerContainer = (props: SequencerContainerProps) => {
  const { bpm, audioContext, numSequencers } = props;
  const interval = Math.ceil((60 * 1000) / bpm);
  const audioRefs = AUDIO_ARRAY.map(
    (filename) => new AudioBufferWrapper(audioContext, `/audio/${filename}`)
  );
  const [step, setStep] = React.useState(0);
  const NUM_STEPS = 64;

  const tick = () => {
    const newStep = (step + 1) % NUM_STEPS;
    setStep(newStep);
  };

  React.useEffect(() => {
    const timer = window.setInterval(function () {
      console.log("step", step);
      tick();
    }, interval);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      {new Array(numSequencers).fill(0).map((elem, i) => {
        const audio = audioRefs[i % audioRefs.length];
        return (
          <Sequencer
            key={i}
            id={i}
            numSteps={NUM_STEPS}
            step={step}
            audio={audio}
          />
        );
      })}
    </>
  );
};

export default SequencerContainer;
