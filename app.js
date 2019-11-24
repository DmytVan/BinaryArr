const RandomBinaryArray = require('./src/RandomBinaryArray');
const fetch = require('node-fetch');
var fs = require('fs');


const getApiForRandom = (index) => {
    //each key can receive up to 250k bits every day.
    const apiKeys = [
        '8b7ab641-9310-4b0e-8ec4-fa763d0f61ee',
        '7c81ea94-44f8-4856-a750-737fe5b6d871',
        '804c2c8c-28d2-45d1-bf62-dad6902bd940',
        '13b8d24c-2ace-4b9f-8cd6-de91124fe597',
        'c7b83c02-fe80-4191-a1a2-2714a29ae9aa',
        '980813fb-0565-492d-8880-ee3fb2ffaebb',
        '89ed9f3a-6fa4-41ed-9c2a-2e71d7276e46',
        'dd8f7082-bae7-415c-90f2-15663e06c4aa',
        '7dbdef45-9958-4c65-8f07-f19548ad7c65',
        'cdf4e9ad-d6db-4d6a-822d-0f1175ce70a9'
    ];
    return apiKeys[index];
};


async function getBinaryArr(countValues) {
    const arr = new RandomBinaryArray();
    let needValues = countValues;
    let indexApi = 0;
    let api = getApiForRandom(indexApi);
    const getRes = async (countValues) => {
        const res = await fetch('https://api.random.org/json-rpc/2/invoke', {
            method: 'POST',
            body: JSON.stringify({
                "jsonrpc": "2.0",
                "method": "generateIntegers",
                "params": {
                    "apiKey": api,
                    "n": countValues,
                    "min": 0,
                    "max": 1,
                    "replacement": true
                },
                "id": 1
            }),
            headers: {
                'Content-Type': 'application/json',
            }
        });
        return await res.json();
    };

    const validateData = (data) => {
        if (data.result) {
            return true;
        }
        if (/The operation requires \d* bits, but the API key only has \d* left/.test(data.error.message)) {
            return false;
        } else {
            throw new Error(data.error.message)
        }
    };

    const setDataInArr = (data, curCount) => {
        if (validateData(data)) {
            arr.push(...data.result.random.data);
            needValues -= curCount;
        } else {
            indexApi++;
            api = getApiForRandom(indexApi);
            if (!api) {
                throw new Error(data.error.message)
            }
        }
    };

    while (needValues > 0) {
        try {
            console.log(`${needValues} more values needed`)
            if (needValues > 10000) {
                const data = await getRes(10000);
                setDataInArr(data, 10000);
                continue;
            }
            const data = await getRes(needValues);
            setDataInArr(data, needValues);
        } catch (e) {
            console.log(e);
            console.log('values loaded: ' + arr.length);
            return arr;
        }
    }


    return arr;
}



async function init() {
    console.time('fetch');
    const arr = await getBinaryArr(1000000);
    console.timeEnd('fetch');
    console.log('_______________________');
    console.time('calc');
    arr.getCountValues();
    arr.getValueInRow(2, true);
    arr.getValueInRow(3, true);
    arr.getValueInRow(2);
    arr.getValueInRow(3);
    printResult(arr.info);
    console.timeEnd('calc');
}

const printResult = info => {
    console.log('Count of values: ');
    console.log(info.countValues);
    console.log('_______________________');
    console.log('values in a row. With repeats: ');
    console.log(info.valueInRow.withRepeat);
    console.log('_______________________');
    console.log('values in a row. Without repeats: ');
    console.log(info.valueInRow.withoutRepeat);
    console.log('_______________________');
    fs.writeFile("lastLog.json", JSON.stringify(info), function (err) {
        if (err) {
            console.log(err);
        };
    })
};

init();
