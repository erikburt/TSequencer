import React from "react";
import SequencerContainer from "./SequencerContainer";
import "../css/root.css";

export interface RootProps {}

export interface RootState {
  audioContext: AudioContext;
  bpm: number;
}

const Root = (props: RootProps) => {
  const DEFAULT_BPM = 120;
  const NUM_SEQUENCERS = 15;
  const [bpm, setBpm] = React.useState(DEFAULT_BPM);

  const audioContext = new AudioContext();

  const bpmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBpm(parseInt(e.currentTarget.value) || 120);
  };

  return (
    <div>
      <div>
        {`${bpm}bpm`}
        <input
          className='bpmslider'
          type='range'
          min='30'
          max='600'
          defaultValue='120'
          onChange={bpmChange}
        />
      </div>

      <SequencerContainer
        key='SequencerContainer'
        bpm={bpm}
        numSequencers={NUM_SEQUENCERS}
        audioContext={audioContext}
      />
    </div>
  );
};

export default Root;
