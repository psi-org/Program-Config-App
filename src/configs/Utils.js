export function splitPosition(position) {
  return position.split(/(\d+)/);
}
export function number2Character(numb) {
  let zPlace = 25;
  let quo = 0;

  if (numb > zPlace) {
    quo = ~~(numb / 26);
    numb = numb % 26;
  }

  return (quo !== 0 ? String.fromCharCode(64 + quo) : '') + String.fromCharCode(65 + numb);
}
export function character2Number(rangeString) {
  let pos = 0;
  const ranges = rangeString.split("");

  if (ranges.length > 1) {
    ranges.forEach(r => {
      pos = pos + (characterPos(r) - 65);
    });
    return pos;
  }

  return characterPos(ranges[0]) - 65;
}
export function columnCharacters(startCharacter, dataObj) {
  let columns = [];
  let posStartCharacter = character2Number(startCharacter);
  Object.keys(dataObj).forEach((key, index) => {
    columns.push(number2Character(posStartCharacter + index));
  });
  return columns;
}
export function arrayObjectToStringConverter(arrayOfObj, key) {
  let final = "";
  arrayOfObj.forEach(element => {
    final += element[key] + ",";
  });
  return final.slice(0, -1);
}

export function DeepCopy(obj) {
  return JSON.parse(JSON.stringify(obj));
}

export function ShallowCopy(obj) { return {...obj} }

function characterPos(chr) {
  return chr.charCodeAt(0);
}