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

function versionCompare(v1, v2, options) {
  var lexicographical = (options && options.lexicographical) || false,
    zeroExtend = (options && options.zeroExtend) || true,
    v1parts = (v1 || "0").split('.'),
    v2parts = (v2 || "0").split('.');

  function isValidPart(x) {
    return (lexicographical ? /^\d+[A-Za-zαß]*$/ : /^\d+[A-Za-zαß]?$/).test(x);
  }

  if (!v1parts.every(isValidPart) || !v2parts.every(isValidPart)) {
    return NaN;
  }

  if (zeroExtend) {
    while (v1parts.length < v2parts.length) v1parts.push("0");
    while (v2parts.length < v1parts.length) v2parts.push("0");
  }

  if (!lexicographical) {
    v1parts = v1parts.map(function (x) {
      var match = (/[A-Za-zαß]/).exec(x);
      return Number(match ? x.replace(match[0], "." + x.charCodeAt(match.index)) : x);
    });
    v2parts = v2parts.map(function (x) {
      var match = (/[A-Za-zαß]/).exec(x);
      return Number(match ? x.replace(match[0], "." + x.charCodeAt(match.index)) : x);
    });
  }

  for (var i = 0; i < v1parts.length; ++i) {
    if (v2parts.length == i) {
      return 1;
    }

    if (v1parts[i] == v2parts[i]) {
      continue;
    }
    else if (v1parts[i] > v2parts[i]) {
      return 1;
    }
    else {
      return -1;
    }
  }

  if (v1parts.length != v2parts.length) {
    return -1;
  }

  return 0;
}

export function versionIsValid(serverVersion, limitMin, limitMax){
  return versionCompare(serverVersion, limitMin) >= 0 && versionCompare(serverVersion, limitMax) <= 0;
}

export function parseErrors(response){ 
  return response.typeReports.reduce((reports,typeReport)=>
      reports.concat(
        typeReport.objectReports.map(objectReport => 
          objectReport.errorReports.map(err => 
            `<p>${err.message}</p>`
          )
        )
      ),[]
    )
    .flat()
    .join("") 
}