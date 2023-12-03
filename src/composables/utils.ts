export function useUtils() {
  const millisecondsToTime = (millis: number): string => {
    const minutes: number = Math.floor(millis / 60000);
    const seconds: string = ((millis % 60000) / 1000).toFixed(0);

    return `${minutes}:${+seconds < 10 ? "0" : ""}${seconds}`;
  };

  const millisecondsToDisplay = (millisec: number): string => {
    let seconds: number = parseInt((millisec / 1000).toFixed(0));
    let minutes: number = Math.floor(seconds / 60);
    let hours = 0;
    let hoursString = "";
    let minutesString = "";
    let secondsString = "";

    if (minutes > 59) {
      hours = Math.floor(minutes / 60);
      hoursString = hours >= 10 ? hours.toString() : `0${hours}`;
      minutes = minutes - hours * 60;
      minutesString = minutes >= 10 ? minutes.toString() : `0${minutes}`;
    }

    seconds = Math.floor(seconds % 60);
    secondsString = seconds >= 10 ? seconds.toString() : `0${seconds}`;

    if (hoursString.length) {
      return `${hoursString}:${minutesString}:${secondsString}`;
    }

    return minutes + ":" + seconds;
  };

  return {
    millisecondsToTime,
    millisecondsToDisplay,
  };
}
