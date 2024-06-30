export function youtubeTimeFormatToSecond(duration:string) {
    const time = duration.match(/(\d+)(H|M|S)/g)
    let second = 0
    time?.forEach((t) => {
        const unit = t[t.length - 1]
        const value = parseInt(t.slice(0, t.length - 1))
        switch(unit) {
            case 'H':
                second += value * 3600
                break
            case 'M':
                second += value * 60
                break
            case 'S':
                second += value
                break
        }
    })
    return second
}