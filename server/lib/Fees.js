/**
 * Creates Fees object
 * @param {Int} giftPriceTotal price in pennies ($1 would be 100)
 * @param {Number} appFee percent of app takes of gift price (10% would be 10)
 * @param {Boolean} accountFeeDue Is the $2.00 account fee due?
 * @param {Boolean} internationalPresentment Is was the currency presented by stripe in a currency other than US?
 * @param {Boolean} internationalDestination Is the wisher an account outside the US?
 *
 * @returns {Object} fees object,  fees in pennies
 */
function Fees(
  giftPriceTotal,
  appFee,
  accountFeeDue = false,
  internationalPresentment = false,
  internationalDestination = false
) {
  const roundToPenny = (pennies) => parseInt(pennies.toFixed());
  this.accountFeeDue = accountFeeDue ? 200 : 0;
  this.currencyConversionPrct = internationalPresentment ? 0.01 : 0;
  this.internationalTransferPrct = internationalDestination ? 0.01 : 0;
  this.appFee = roundToPenny(giftPriceTotal * appFee * 0.01);
  this.charge = roundToPenny(
    (giftPriceTotal + this.accountFeeDue + this.appFee + 55) /
      (1 - (0.0315 + this.currencyConversionPrct + this.internationalTransferPrct))
  );
  this.stripeTotalFee = roundToPenny(
    this.charge * (0.0315 + this.internationalTransferPrct + this.currencyConversionPrct) +
      55 +
      this.accountFeeDue
  );
  this.stripeFee = roundToPenny(this.charge * 0.029 + 30);
  this.stripeConnectedFee = roundToPenny(this.charge * 0.0025 + 25);
  this.internationalTransferFee = roundToPenny(this.charge * this.internationalTransferPrct);
  this.currencyConversionFee = roundToPenny(this.charge * this.currencyConversionPrct);
  this.stripeFeesBalanced =
    this.stripeFee +
      this.stripeConnectedFee +
      this.accountFeeDue +
      this.currencyConversionFee +
      this.internationalTransferFee ==
    this.stripeTotalFee;
  this.wishersTender = giftPriceTotal;
  this.total = this.wishersTender + this.stripeTotalFee + this.appFee;
  this.balanced = this.total == this.charge;
  if (!this.balanced || !this.stripeFeesBalanced)
    throw new Error(`fees aren't balanced, refactor this function`);
  return this;
}

module.exports = Fees;
