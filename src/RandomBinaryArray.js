
/*
    getCountValues() - counts the number of values and percentage
    getValueInRow(countValue, withRepeat) - counts the number of values in a row and percentage
    countValue - number of digits in a row (2 : 00, 01... 3 : 000, 001... 4 : 0000..., ...). countValue > 1!
    withRepeat - allow repeating values (true : [0, 0 , 1, 1] will be split on 00, 01, 11; false : [0, 0 , 1, 1] will be split on 00, 11)
 */

class RandomBinaryArray extends Array {
    constructor(...arr) {
        super(...arr);
        this._info = {
            countValues: {},
            valueInRow: {
                withRepeat: {},
                withoutRepeat: {}
            }
        };
    }

    get info() {
        return this._info
    }

    percentCalc (obj)  {
        let sum = 0;
        for (let key in obj) {
            sum += +obj[key];
        }
        obj.percent = {};
        for (let key in obj) {
            if (key === 'percent') {
                continue
            }
            obj.percent[key] = sum ? +obj[key] * 100 / sum : 0;
        }
    };


    getCountValues() {
        let sum = 0;
        for (let i = 0; i < this.length; i++) {
            sum += this[i];
        }

        this._info.countValues = {
            "0": this.length - sum,
            "1": sum
        };
        this.percentCalc(this._info.countValues);
        return this._info.countValues;
    }

    getValueInRow(countValue, withRepeat) {

        if (countValue <= 1) {
            throw new Error('countValue cannot be less then 2')
        }

        const getEmptyArr = () => {
            const arr = [];
            for (let i = 0; i < Math.pow(2, countValue); i++) {
                arr.push(0);
            }
            return arr;
        };

        const setInInfo = result => {
            const getKey = index => {
                let key = index.toString(2);
                while (key.length < countValue) {
                    key = 0 + key;
                }
                return key;
            };

            const setResult = (obj) => {
                obj[countValue] = {};
                result.forEach((res, index) => {
                    obj[countValue][getKey(index)] = res
                });
                this.percentCalc(obj[countValue]);
                return obj[countValue];
            };

            if (withRepeat) {
                return setResult(this._info.valueInRow.withRepeat);
            }

            return setResult(this._info.valueInRow.withoutRepeat);
        };


        let result = getEmptyArr();
        const step = withRepeat ? 1 : countValue;
        let index;
        for (let i = countValue - 1; i < this.length; i = i + step) {
            index = 0;
            for (let k = 0; k < countValue; k++) {
                if (this[i - k]) {
                    index += Math.pow(2, k);
                }
            }
            result[index] += 1;
        }

        return setInInfo(result);
    }
}

module.exports = RandomBinaryArray;