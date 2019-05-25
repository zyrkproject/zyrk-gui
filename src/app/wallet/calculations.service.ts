export class CalculationsService {
    
    constructor() {
    }

    public getFee(fee, amount) {
        let fees = (fee / 400) * amount;
        return fees;
    }

    public getTotal(amount, fees) {
        let total = amount + fees;
        return total;
    }

    public getCovertedamount(amount, byconvertAmount) {
        let Convertedamount = amount*byconvertAmount;
        return Convertedamount;
    }
}