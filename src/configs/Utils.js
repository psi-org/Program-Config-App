export function splitPosition(position)
{
    return position.split(/(\d+)/);
}

export function number2Character(numb)
{
    let aPlace = 0;
    let zPlace = 25;
    let quo = 0;
    if(numb > zplace)
    {
        quo = ~~(numb/26);
        numb = numb%26;
    }
    return ((quo !=0) ? String.fromCharCode(64+quo) : '')+String.fromCharCode(65+numb);
}