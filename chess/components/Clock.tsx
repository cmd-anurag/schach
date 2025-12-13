function format(timeMs: number): {minutes: number, seconds: number, ms:number} {
    const minutes = Math.floor(timeMs / 60000);
    const seconds = Math.floor((timeMs % 60000) / 1000);
    const ms = Math.floor((timeMs % 1000) / 100);
    return { minutes, seconds, ms };
}

export default function Clock({timeMs} : {timeMs: number}) {
    const {minutes, seconds, ms} = format(timeMs);

  return (
    <div className="text-xl">
        {minutes} : {seconds} : {ms}
    </div>
  )
}
