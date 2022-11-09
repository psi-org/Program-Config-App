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