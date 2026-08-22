export function calculateShippingCost(pkg, rateCard, paymentMethod) {
  const volumetricWeight = (pkg.length * pkg.width * pkg.height) / 5000
  const billableWeight = Math.max(pkg.actualWeight, volumetricWeight)
  
  const baseRate = Number(rateCard.base_rate || rateCard.baseRate || 0)
  const perKgRate = Number(rateCard.per_kg_rate || rateCard.perKgRate || 0)
  const codSurchargePercent = Number(rateCard.cod_surcharge_percent || rateCard.codSurchargePercent || 0)
  
  const basePrice = baseRate
  const weightCharge = Number((billableWeight * perKgRate).toFixed(2))
  let subtotal = basePrice + weightCharge
  
  let codSurcharge = 0
  if (paymentMethod === 'COD' && codSurchargePercent > 0) {
    codSurcharge = Number((subtotal * (codSurchargePercent / 100)).toFixed(2))
  }
  
  const finalPrice = Number((subtotal + codSurcharge).toFixed(2))
  
  return {
    volumetricWeight: Number(volumetricWeight.toFixed(2)),
    billableWeight: Number(billableWeight.toFixed(2)),
    basePrice: Number(basePrice.toFixed(2)),
    weightCharge: Number(weightCharge.toFixed(2)),
    codSurcharge: Number(codSurcharge.toFixed(2)),
    finalPrice
  }
}
