function format(timeMs: number): {minutes: string, seconds: string, ms:number} {
    const minutes = Math.floor(timeMs / 60000);
    const seconds = Math.floor((timeMs % 60000) / 1000);
    const ms = Math.floor((timeMs % 1000) / 100);

    return { 
      minutes: String(minutes).padStart(2, '0'),
      seconds: String(seconds).padStart(2, '0'),
      ms, 
    };
}

export default function Clock({timeMs} : {timeMs: number}) {
    const {minutes, seconds, ms} = format(timeMs);

  return (
    <div className="text-xl">
        {minutes} : {seconds}
    </div>
  )
}
