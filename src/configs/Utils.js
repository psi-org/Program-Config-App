import { coerce, gte, lte } from 'semver';

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
    return (typeof obj !== "undefined") ? JSON.parse(JSON.stringify(obj)) : null;
}

export function ShallowCopy(obj) { return { ...obj } }

function characterPos(chr) {
    return chr.charCodeAt(0);
}

export function versionIsValid(serverVersion, limitMin, limitMax) {
    let coercedVersion = coerce(serverVersion).version
    return gte(coercedVersion, coerce(limitMin)) && lte(coercedVersion, coerce(limitMax));
}

export function parseErrors(response) {
    let errorRes = response.response || response;
    let index = 0
    return errorRes.typeReports?.reduce((reports, typeReport) =>
        reports.concat(
            typeReport.objectReports.map(objectReport =>
                objectReport.errorReports.map(err => {
                    index += 1;
                    return (<p key={index}>{err.message}</p>)
                })
            )
        ), []
    ).flat() || <p>{response.httpStatus}: {response.message}.</p>
}

export function parseErrorsJoin(response,joinVal) {
    let errorRes = response.response || response;
    return errorRes.typeReports?.reduce((reports, typeReport) =>
        reports.concat(
            typeReport.objectReports.map(objectReport =>
                objectReport.errorReports.map(err => err.message)
            )
        ), []
    ).flat().join(joinVal) || (response.httpStatus+": "+response.message+".")
}


export function parseErrorsUL(response) {
    let errorRes = response.response || response;
    let index = 0
    return <ul>{
        errorRes.typeReports?.reduce((reports, typeReport) =>
            reports.concat(
                typeReport.objectReports.map(objectReport =>
                    objectReport.errorReports.map(err => {
                        index += 1;
                        return (<li key={index}>{err.message}</li>)
                    })
                )
            ), []
        ).flat() || <li>{response.httpStatus}: {response.message}.</li>
    }
    </ul>
}

export function truncateString(strVal, characters = 50,useEllipsis=true) {
    return (strVal.substring(0, characters) + ((strVal.length > characters && useEllipsis) ? '...' : ''))
}

export function formatAlert(text) {
    return text?.split('\\n').map((elem, index) => <p key={index}>{elem}</p>)
}

export function extractMetadataPermissions(permissions){
    return permissions.slice(0, 2) + '------';
}

export function getUniqueKeys(arrayOfObjects) {
    const uniqueKeys = new Set();

    for (const obj of arrayOfObjects) {
        const keys = Object.keys(obj);
        keys.forEach(key => uniqueKeys.add(key));
    }

    return Array.from(uniqueKeys).sort().map(key => ({key, selected: true}));
}

/*Returns an object with:
    * key = value -> Last value
    * value = object -> Object with more objects
    * value = array -> Object with array of objects (the array is a list of all the unique keys)
*/
export function getJSONKeyTree(obj, level=1, index=0) {
    let res = {}
    for (const key in obj) {
        if (!!obj[key] && obj[key].constructor !== Array && obj[key].constructor === Object && index<level) {
            let subRes = getJSONKeyTree(obj[key], level, index+1)
            res[key] = Object.keys(subRes).map(key => subRes[key][0])
        } else if (Array.isArray(obj[key])) {
            res[key] = getUniqueKeys(obj[key])
        } else {
            res[key] = [{ key, selected:true }]
        }
    }
    return res
}

export function changeAttributeValue(obj, attribute, newValue) {
    if (Array.isArray(obj)) {
        for (let i = 0; i < obj.length; i++) {
            changeAttributeValue(obj[i], attribute, newValue);
        }
    } else if (typeof obj === 'object') {
        for (let key in obj) {
            if (key === attribute) {
                obj[key] = newValue;
            } else {
                changeAttributeValue(obj[key], attribute, newValue);
            }
        }
    }
}

export function removeKey(obj, key) {
    if (typeof obj !== 'object' || obj === null) {
        return obj;
    }

    if (Array.isArray(obj)) {
        obj.forEach((item) => removeKey(item, key));
    } else {
        Object.keys(obj).forEach((k) => {
            if (k === key) {
                delete obj[k];
            } else {
                removeKey(obj[k], key);
            }
        });
    }

    return obj;
}