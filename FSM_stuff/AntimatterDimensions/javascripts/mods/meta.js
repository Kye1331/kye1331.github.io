//meta dimensions
function metaDimsUpdating(diff){
	if (!hasDilationStudy(6)) return

	// Meta
	var step = inNGM(5) ? 2 : 1
	var max = inNGM(5) ? 6 : 8
	for (var tier = max - step; tier >= 1; tier--) player.meta[tier].amount = player.meta[tier].amount.plus(getMDProduction(tier + step).times(diff / 10))

	player.meta.antimatter = player.meta.antimatter.plus(getMDProduction(1).times(diff))
	player.meta.bestAntimatter = player.meta.bestAntimatter.max(player.meta.antimatter)
	if (tmp.ngp3) {
		player.meta.bestOverQuantums = player.meta.bestOverQuantums.max(player.meta.antimatter)
		player.meta.bestOverGhostifies = player.meta.bestOverGhostifies.max(player.meta.antimatter)
	}
}

function getMetaAntimatterStart(bigRip) {
	let x = 10
	if (hasAch("ngpp12") || (moreEMsUnlocked() && (pH.did("quantum") || getEternitied() >= tmp.ngp3_em[3]))) x = 100
	if (hasAch("ng3p16")) x = 1e10

	return E(x)
}

function getDilationMDMultiplier() {
	let pow = 0.1
	let div = 1e40
	if (enB.active("glu", 8)) pow = enB_tmp.eff.glu8
	if (aarMod.nguspV !== undefined) div = 1e50

	if (aarMod.ngudpV && !aarMod.nguepV) {
		let l = qu_save.colorPowers.b.plus(10).log10()
		let x = 3 - Math.log10(l + 1)
		if (aarMod.ngumuV) {
			if (x < 2) x = 2 - 2 * (2 - x) / (5 - x)
		} else {
			x = Math.max(x, 2)
			if (l > 5000) x -= Math.min(Math.log10(l - 4900) - 2, 2) / 3
		}
		pow /= x
	}
	let ret = player.dilation.dilatedTime.div(div).pow(pow).plus(1)
	return ret
}

function getMDMultiplier(tier) {
	if (player.currentEternityChall === "eterc11") return E(1)
	let ret = Decimal.pow(getPerTenMetaPower(), Math.floor(player.meta[tier].bought / 10))
	ret = ret.times(Decimal.pow(getMetaBoostPower(), Math.max(player.meta.resets + 1 - tier - (pos.on() ? pos_tmp.sac.mdb : 0), 0)))
	ret = ret.times(tmp.mdGlobalMult) //Global multiplier of all Meta Dimensions

	//Achievements:
	if (tier <= 3 && hasAch("ng3p17")) ret = ret.times(Math.sqrt(player.totalmoney.max(1).log10() / 1e10 + 1, 0.5))
	if (tier == 1 && hasAch("ng3p21")) ret = ret.times(player.meta.bestAntimatter.max(1).log10() / 5 + 1)
	if (tier % 2 == 1 && hasAch("ng3p24")) ret = ret.times(player.meta[tier + 1].amount.max(1).log10() / 10 + 1)

	//Positronic Boosts:
	if (tier == 1 && enB.active("pos", 2)) ret = ret.times(enB_tmp.eff.pos2.mult)

	//Dilation Upgrades:
	if (hasDilationUpg("ngmm8")) ret = ret.pow(getDil71Mult())

	//Quantum Challenges:
	if (QCs.in(7) || (PCs.in() && !(tmp.bgMode || tmp.ngp3_mul || tmp.ngp3_exp))) ret = ret.pow(0.95)

	return ret
}

function getMDGlobalMult() {
	let ret = getDilationMDMultiplier()
	if (hasDilationUpg("ngpp3")) ret = ret.times(getDil14Bonus())
	if (hasAch("ngpp12")) ret = ret.times(1.1)
	if (tmp.ngp3) {
		//Achievement Rewards
		if (hasAch("ng3p11")) ret = ret.times(Math.min(Math.max(Math.log10(player.eternityPoints.max(1).log10()) / 2, 1), 2.5))
		if (hasAch("ng3p13")) ret = ret.times(Decimal.plus(quantumWorth, 1).log10() * 5 + 1)
		if (hasAch("ng3p57")) ret = ret.times(1 + player.timeShards.plus(1).log10())

		//Quantum Challenges
		if (QCs.perkActive(3)) ret = ret.times(Math.log10(player.eternityPoints.max(1).e + 1) + 1)
	}
	return ret
}

function getPerTenMetaPower() {
	let r = 2
	let exp = 1
	if (hasDilationUpg("ngpp4")) r = getDil15Bonus()
	return Math.pow(r, exp)
}

function getMetaBoostPower() {
	let r = 2
	if (hasDilationUpg("ngpp4")) r = getDil15Bonus()
	if (!tmp.ngp3 && hasAch("ngpp14")) r *= 1.01

	let exp = 1
	if (tmp.ngp3 && hasAch("ngpp14")) exp = 1.05
	if (enB.active("glu", 6) && pos.on()) exp *= enB_tmp.eff.glu6
	return Math.pow(r, exp)
}

function getMDDescription(tier) {
	var boughtEnd = player.meta.antimatter.e >= 1e3 ? "" : ' (' + dimMetaBought(tier) + ')'
	if (tier == Math.min(8, player.meta.resets + 4)) return getFullExpansion(player.meta[tier].bought) + boughtEnd;
	else {
		let a = shortenDimensions(player.meta[tier].amount)
		if (aarMod.logRateChange === 2 || player.meta.antimatter.e >= 1e6) return a
		let b = boughtEnd + ' (+' + formatValue(player.options.notation, getMDRateOfChange(tier), 2, 2) + dimDescEnd
		return a+b
	}
}

function getMDRateOfChange(tier) {
	let toGain = getMDProduction(tier + 1);

	var current = player.meta[tier].amount.max(1);
	if (aarMod.logRateChange) {
		var change = current.add(toGain.div(10)).log10() - current.log10()
		if (change < 0 || isNaN(change)) change = 0
	} else var change  = toGain.times(10).dividedBy(current);

	return change;
}

function canBuyMetaDimension(tier) {
    if (tier > player.meta.resets + 4) return false;
    if (qMs.tmp.amt < 15 && tier > 1 && player.meta[tier - 1].amount.eq(0)) return false;
    return true;
}

function clearMetaDimensions () { //Resets costs and amounts
	for (var i = 1; i <= 8; i++) {
		player.meta[i].amount = E(0);
		player.meta[i].bought = 0;
		player.meta[i].cost = getMetaCost(i, 0);
	}
}

function getMetaShiftRequirement() { 
	var mdb = player.meta.resets
	var data = {tier: Math.min(8, mdb + 4), amount: 20, mult: 15}

	if (tmp.ngp3_mul) data.mult--

	data.amount += data.mult * Math.max(mdb - 4, 0)
	if (hasNU(1)) data.amount -= tmp.nu[1]
	
	return data
}

function getMDBoostRequirement(){
	return getMetaShiftRequirement()
}

function metaBoost() {
	let req = getMetaShiftRequirement()

	if (!(player.meta[req.tier].bought >= req.amount)) return

	let isNU1ReductionActive = hasNU(1) ? !qu_save.bigRip.active : false
	if (req.tier == 8 && qMs.tmp.amt >= 19) {
		if (isNU1ReductionActive && player.meta.resets < 110) {
			player.meta.resets = Math.min(player.meta.resets + Math.floor((player.meta[8].bought - req.amount) / (req.mult + 1)) + 1, 110)
			req = getMetaShiftRequirement()
		}
		player.meta.resets += Math.floor((player.meta[8].bought - req.amount) / req.mult) + 1

		if (player.meta[8].bought >= getMetaShiftRequirement().amount) player.meta.resets++
	} else player.meta.resets++

	if (qMs.tmp.amt >= 25) return

	player.meta.antimatter = getMetaAntimatterStart()
	if (qMs.tmp.amt < 19) clearMetaDimensions()
}


function dimMetaCostMult(tier) {
	return costMults[tier]
}

function dimMetaBought(tier) {
	return player.meta[tier].bought % 10;
}

function metaBuyOneDimension(tier) {
	var cost = player.meta[tier].cost;
	if (!canBuyMetaDimension(tier)) return false;
	if (!canAffordMetaDimension(cost)) return false;
	player.meta.antimatter = player.meta.antimatter.minus(cost);
	player.meta[tier].amount = player.meta[tier].amount.plus(1);
	player.meta[tier].bought++;
	if (player.meta[tier].bought % 10 < 1) {
		player.meta[tier].cost = getMetaCost(tier, player.meta[tier].bought / 10)
	}
	if (tier > 7) giveAchievement("And still no ninth dimension...")
	return true;
}

function getMetaCost(tier, boughtTen) {
	let cost = Decimal.pow(dimMetaCostMult(tier), boughtTen).times(initCost[tier])
	return cost
}

function getMetaMaxCost(tier) {
	return player.meta[tier].cost.times(10 - dimMetaBought(tier));
}

function metaBuyManyDimension(tier) {
	var cost = getMetaMaxCost(tier)
	if (!canBuyMetaDimension(tier)) return false
	if (!canAffordMetaDimension(cost)) return false

	player.meta.antimatter = player.meta.antimatter.minus(cost)
	player.meta[tier].amount = player.meta[tier].amount.plus(10 - dimMetaBought(tier))
	player.meta[tier].bought += 10 - dimMetaBought(tier)
	player.meta[tier].cost = getMetaCost(tier, player.meta[tier].bought / 10)

	if (tier > 7) giveAchievement("And still no ninth dimension...")
	return true;
}

function buyMaxMetaDimension(tier, bulk) {
	if (!canBuyMetaDimension(tier)) return
	if (getMetaMaxCost(tier).gt(player.meta.antimatter)) return

	var tempMA = player.meta.antimatter
	var cost = getMetaMaxCost(tier)
	var bought = 0
	if (!bulk) bulk = 1/0

	if (dimMetaBought(tier) > 0) {
		tempMA = tempMA.sub(cost)
		bought = 10 - dimMetaBought(tier)
		cost = getMetaCost(tier, Math.floor(player.meta[tier].bought / 10) + 1).times(10)
		bulk--
	}

	//To-do: Max
	var mult = dimMetaCostMult(tier)
	var add = Math.min(
		Math.floor(tempMA.div(cost).times(mult - 1).add(1).log(mult))
	, bulk || 1/0)
	tempMA = tempMA.sub(Decimal.pow(mult, add).sub(1).div(mult - 1).times(cost).min(tempMA))
	bought += add * 10

	if (player.meta.antimatter.lte(Decimal.pow(10, 1e12))) player.meta.antimatter = tempMA
	player.meta[tier].amount = player.meta[tier].amount.plus(bought)
	player.meta[tier].bought += bought
	player.meta[tier].cost = getMetaCost(tier, player.meta[tier].bought / 10)
}

function canAffordMetaDimension(cost) {
	return cost.lte(player.meta.antimatter);
}

for (let i = 1; i <= 8; i++) {
	el("meta" + i).onclick = function () {
		if (moreEMsUnlocked() && (pH.did("quantum") || getEternitied() >= tmp.ngp3_em[3])) player.autoEterOptions["md" + i] = !player.autoEterOptions["md" + i]
		else metaBuyOneDimension(i)
	}
	el("metaMax" + i).onclick = function () {
		if (shiftDown && moreEMsUnlocked() && (pH.did("quantum") || getEternitied() >= tmp.ngp3_em[3])) metaBuyOneDimension(i)
		else metaBuyManyDimension(i);
	}
}

el("metaMaxAll").onclick = function () {
	for (let i = 1; i <= 8; i++) buyMaxMetaDimension(i)
}

el("metaSoftReset").onclick = function () {
	metaBoost();
}

function getMDProduction(tier) {
	let ret = player.meta[tier].amount.floor()
	if (tier < 8 && hasAch("ng3p22")) ret = ret.add(player.meta[1].amount.floor().pow(0.1 * (8 - tier)))
	return ret.times(getMDMultiplier(tier));
}

function getExtraDimensionBoostPower(ma) {
	if (!ma) ma = getExtraDimensionBoostPowerUse()

	let maFinal = tmp.ngp3 ? softcap(ma, "ma") : ma
	maFinal = Decimal.pow(maFinal, getMADimBoostPowerExp(ma)).max(1)

	let l2 = maFinal.log(2)
	if (l2 > 1024) {
		if (aarMod.nguspV) l2 = Math.pow(l2 * 32, 2/3)
		maFinal = Decimal.pow(2, l2)
	}
	return maFinal
}

function getExtraDimensionBoostPowerUse() {
	let r = player.meta.bestAntimatter
	//if (hasAch("ng3p71")) r = player.meta.bestOverQuantums
	return r
}

function getExtraDimensionBoostPowerExponent(ma = player.meta.antimatter){
	return getMADimBoostPowerExp(ma)
}

function getMADimBoostPowerExp(ma) {
	ma = E(ma)

	let power = 8
	if (hasDilationUpg("ngpp5")) power++
	if (hasMTS(262)) power += doubleMSMult(0.5)
	if (hasAch("ng3p27")) {
		power *= Math.sqrt(Math.max(ma.max(1).log10() / 1e3 - 0.75, 1))
	}
	return power
}

function getRelativeMADimBoostPowerExp(ma) {
	let exp = getMADimBoostPowerExp(ma)
	let eff = Decimal.pow(ma, exp)
	let effSC = getExtraDimensionBoostPower(ma)

	return exp * effSC.log10() / eff.log10()
}

function getDil14Bonus() {
	return 1 + Math.log10(1 - Math.min(0, player.tickspeed.log(10)));
}

function getDil17Bonus() {
	let r = player.meta.bestAntimatter.max(1)
	if (tmp.ngp3) r = r.pow(getDil17Exp())
	else r = Math.sqrt(r.log10())
	return r
}

function getDil17Exp() {
	if (enB.active("glu", 4)) return enB_tmp.eff.glu4
	return 0.003
}

function updateOverallMetaDimensionsStuff(){
	el("metaAntimatterAmount").textContent = shortenMoney(player.meta.antimatter)
	el("metaAntimatterBest").textContent = shortenMoney(player.meta.bestAntimatter)
	el("bestAntimatterQuantum").textContent = player.masterystudies && pH.did("quantum") ? "Your best" + (pH.did("ghostify") ? "" : "-ever") + " meta-antimatter" + (pH.did("ghostify") ? " in this Ghostify" : "") + " was " + shortenMoney(player.meta.bestOverQuantums) + "." : ""
	setAndMaybeShow("bestMAOverGhostifies", pH.did("ghostify"), '"Your best-ever meta-antimatter was " + shortenMoney(player.meta.bestOverGhostifies) + "."')

	el("metaAntimatterTranslation").style.display = tmp.ngp3 ? "" : "none"
	el("metaAntimatterPower").textContent = "^" + shorten(getRelativeMADimBoostPowerExp(getExtraDimensionBoostPowerUse()))
	el("metaAntimatterEffect").textContent = shortenMoney(getExtraDimensionBoostPower())
	el("metaAntimatterPerSec").textContent = 'You are getting ' + shortenDimensions(getMDProduction(1)) + ' meta-antimatter per second.'
}

function updateMetaDimensions () {
	updateOverallMetaDimensionsStuff()
	let showDim = false
	let useTwo = player.options.notation == "Logarithm" ? 2 : 0
	let autod = moreEMsUnlocked() && (pH.did("quantum") || getEternitied() >= tmp.ngp3_em[3])
	for (let tier = 8; tier > 0; tier--) {
		showDim = showDim || canBuyMetaDimension(tier)
		el(tier + "MetaRow").style.display = showDim ? "" : "none"
		if (showDim) {
			el(tier + "MetaD").textContent = DISPLAY_NAMES[tier] + " Meta Dimension x" + formatValue(player.options.notation, getMDMultiplier(tier), 2, 1)
			el("meta" + tier + "Amount").textContent = getMDDescription(tier)
			el("meta" + tier).textContent = autod ? "Auto: " + (player.autoEterOptions["md" + tier] ? "ON" : "OFF") : "Cost: " + formatValue(player.options.notation, player.meta[tier].cost, useTwo, 0) + " MA"
			el('meta' + tier).className = autod ? "storebtn" : canAffordMetaDimension(player.meta[tier].cost) ? 'storebtn' : 'unavailablebtn'
			el("metaMax"+tier).textContent = (autod ? (shiftDown ? "Singles: " : pH.did("ghostify") ? "" : "Cost: ") : "Until 10: ") + formatValue(player.options.notation, ((shiftDown && autod) ? player.meta[tier].cost : getMetaMaxCost(tier)), useTwo, 0) + " MA"
			el('metaMax' + tier).className = canAffordMetaDimension((shiftDown && autod) ? player.meta[tier].cost : getMetaMaxCost(tier)) ? 'storebtn' : 'unavailablebtn'
		}
	}
	var isMetaShift = player.meta.resets < 4
	var metaShiftRequirement = getMetaShiftRequirement()
		el("metaResetLabel").textContent = 'Meta-Dimension ' + (isMetaShift ? "Shift" : "Boost") + ' ('+ getFullExpansion(player.meta.resets) +'): requires ' + getFullExpansion(Math.floor(metaShiftRequirement.amount)) + " " + DISPLAY_NAMES[metaShiftRequirement.tier] + " Meta Dimensions"
		el("metaSoftReset").textContent = "Reset meta-dimensions for a " + (isMetaShift ? "new dimension" : "boost")
	if (player.meta[metaShiftRequirement.tier].bought >= metaShiftRequirement.amount) {
		el("metaSoftReset").className = 'storebtn'
	} else {
		el("metaSoftReset").className = 'unavailablebtn'
	}
	var bigRipped = tmp.ngp3 && qu_save.bigRip.active
	var req = getQuantumReq()
	var reqGotten = isQuantumReached()
	var newClassName = reqGotten ? (bigRipped && player.options.theme == "Aarex's Modifications" ? "" : "storebtn ") + (bigRipped ? "aarexmodsghostifybtn" : "") : 'unavailablebtn'

	el("quantumResetLabel").textContent =
		'Quantum: requires ' + shorten(req) + (tmp.ngp3 ? " best" : "") + ' meta-antimatter'
		+ (QCs.inAny() ? QCs.getGoalDisp() : tmp.ngp3 && !tmp.ngp3_mul ? " and an EC14 completion" : "")
	el("quantum").innerHTML = tmp.quUnl ? "Gain " + shortenDimensions(quarkGain()) + " aQ." : 'Reset your progress for a new layer...'
	el("quantum").className = pH.can("quantum") ? 'quantumbtn' : 'unavailablebtn'

	el("metaAccelerator").innerHTML = enB.active("pos", 2) ?
		"Meta Accelerator: " + shorten(enB_tmp.eff.pos2.mult) + "x to MA, DT, and replicate interval" +
		(shiftDown ? "<br>(Base: " + shorten(enB_tmp.eff.pos2.base) + ", raised by ^" + shorten(enB_tmp.eff.pos2.exp) + ", exp speed: +" + enB_tmp.eff.pos2.speed.toFixed(3) + "/MDB" + ", accelerator: +^" + enB_tmp.eff.pos2.acc.toFixed(3) + " speed/MDB" + ", slowdown start: " + shorten(enB_tmp.eff.pos2.slowdown) + " MDBs)" : "")
	: ""
}

function getDil15Bonus() {
	let x = 1
	let max = 3

	if (aarMod.nguspV !== undefined) x = Math.min(Math.max(player.dilation.dilatedTime.max(1).log10() / 10 - 6.25, 2), max)
	else x = Math.min(Math.log10(player.dilation.dilatedTime.max(1e10).log(10)) + 1, max)

	return x
}

function getMetaUnlCost() {
	if (tmp.ngp3) return 1e20
	return 1e24
}

function getPataAccelerator() {
	var x = qu_save.time / 24000
	if (enB.pos.charged(2)) x *= enB.pos.chargeEff(2) / 2 + 1
	if (enB.active("pos", 7)) x *= enB_tmp.eff.pos7

	var cap = 1
	if (enB.active("pos", 12)) cap += enB_tmp.eff.pos12

	x = Math.min(x, cap)
	if (QCs.perkActive(3)) x = cap
	return x
}
