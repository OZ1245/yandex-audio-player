import { Player } from "@/@types";

export default {
  install(app: any) {
    const player: Player = {
      audioContext: new AudioContext(),
      playlist: [],
      nextTime: 0,
      // const audio = new Audio(),
    };

    app.provide("player", player);
  },
};
