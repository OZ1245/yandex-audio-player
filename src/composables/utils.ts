export function useUtils () {
  const millisecondsToTime = (millis: number): string => {
    const minutes: number = Math.floor(millis / 60000);
    const seconds: string = ((millis % 60000) / 1000).toFixed(0);
    
    return `${minutes}:${(+seconds < 10 ? '0' : '')}${seconds}`;
  }
  
  return {
    millisecondsToTime
  }
}