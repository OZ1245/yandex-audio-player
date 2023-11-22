export interface Player {
  audioContext: AudioContext
  playlist: BufferSource[],
  nextTime: number,
}