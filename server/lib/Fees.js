/**
 * Creates Fees object
 * @param {Int} giftPriceTotal price in pennies ($1 would be 100)
 * @param {Number} appFee percent of app takes of gift price (10% would be 10)
 * @param {Boolean} accountFeeDue Is the $2.00 account fee due?
 * @param {Boolean} internationalPresentment Is was the currency presented by stripe in a currency other than US?
 * @param {Boolean} internationalDestination Is the wisher an account outside the US?
 * @param {Object} usToPresRate exchange rate US to presentment
 *
 * @returns {Object} fees object, fees in pennies most
 * important: this.stripeTotalFee & this.appFee
 */
function Fees(
  giftPriceTotal,
  appFee,
  accountFeeDue = false,
  internationalPresentment = false,
  internationalDestination = false,
  usToPresRate
) {
  const roundToInt = (num) => parseInt(num.toFixed(), 10);
  this.accountFeeDue = accountFeeDue ? roundToInt(usToPresRate * 200) : 0;
  this.currencyConversionPrct = internationalPresentment ? 0.01 : 0;
  this.internationalTransferPrct = internationalDestination ? 0.01 : 0;
  this.appFee = roundToInt(giftPriceTotal * appFee);
  this.charge = roundToInt(
    (giftPriceTotal + this.accountFeeDue + this.appFee + usToPresRate * 55) /
      (1 - (0.0315 + this.currencyConversionPrct + this.internationalTransferPrct))
  );
  this.stripeTotalFee = roundToInt(
    // 0.0315 = .029 (stripe fee) + .0025 (connected account fee)
    this.charge * (0.0315 + this.internationalTransferPrct + this.currencyConversionPrct) +
    usToPresRate * 55 + // 55 = $0.30 (stripe fee) cents +$0.25 (connected accountfee)
      this.accountFeeDue
  );
  this.stripeFee = roundToInt(this.charge * 0.029 + usToPresRate * 30);
  this.stripeConnectedFee = roundToInt(this.charge * 0.0025 + usToPresRate * 25);
  this.internationalTransferFee = roundToInt(this.charge * this.internationalTransferPrct);
  this.currencyConversionFee = roundToInt(this.charge * this.currencyConversionPrct);
  this.stripeFeesBalanced =
    this.stripeConnectedFee +
      this.accountFeeDue +
      this.currencyConversionFee +
      this.internationalTransferFee -
      this.stripeTotalFee <
    Math.abs(1);
  this.wishersTender = giftPriceTotal;
  this.total = this.wishersTender + this.stripeTotalFee + this.appFee;
  this.balanced = this.total - this.charge < Math.abs(1);
  if (!this.balanced || !this.stripeFeesBalanced)
    throw new Error(`fees aren't balanced, refactor this function`);
  return this;
}

module.exports = Fees;
