export const splitCurrencyParts = (
    amount: string,
  ) => {
  
    const symbol = amount[0];

    let mainAmount;

    if (amount.includes("₦")) {
        mainAmount = amount.split("₦")[1];
    } else if(amount.includes("£")) {
        mainAmount = amount.split("£")[1];
    }

    const Amount = mainAmount?.split('.')[0];
    let decimalPoint = mainAmount?.split('.')[1];
    decimalPoint = '.' + decimalPoint

  
    return [symbol, Amount, decimalPoint];
  };
  