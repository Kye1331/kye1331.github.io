function getTDBoostReq() {
	let amount = player.tdBoosts > 2 || player.pSac !== undefined ? 10 : 2
	let maxTier = inNC(4) || player.pSac !== undefined ? 6 : 8
	let mult = inNC(4) || player.pSac !== undefined ? (hasPU(33) ? 1.5 : 3) : 2
	return {
		amount: Math.ceil(amount + Math.max(player.tdBoosts + (player.pSac ? 0 : 1 - maxTier), 0) * mult), 
		mult: mult, 
		tier: Math.min(player.tdBoosts + 1, maxTier)
	}
}

function buyMaxTDB(){
	let r = getTDBoostReq()
	if (r.tier < 8) {
		tdBoost(1)
		return
	}
	let b = 0
	if (r.amount <= player.timeDimension8.bought) b = 1 + Math.floor((player.timeDimension8.bought - r.amount)/r.mult)
	if (!hasAch("r73")) b = Math.min(1, b)
	b = Math.max(0,b)
	tdBoost(b)
}

function tdBoost(bulk) {
	let req = getTDBoostReq()
	if (player["timeDimension" + req.tier].bought < req.amount) return
	if (cantReset()) return
	player.tdBoosts += bulk
	if (!hasAch("r36")) softReset(hasAch("r26") && player.resets >= player.tdBoosts ? 0 : -player.resets)
	player.tickBoughtThisInf = updateTBTIonGalaxy()
	if (inNGM(5)) giveAchievement("Accelerated")
}

function resetTDBoosts() {
	if (tmp.ngmX > 3) return hasAch("r27") && player.currentChallenge == "" ? 3 : 0
}

function resetTDsOnNGM4() {
	if (tmp.ngmX >= 4) resetTimeDimensions()
}

//v2.1
el("challenge16").onclick = function () {
	startNormalChallenge(16)
}

function autoTDBoostBoolean() {
	var req = getTDBoostReq()
	var amount = player["timeDimension" + req.tier].bought
	if (!player.autobuyers[14].isOn) return false
	if (player.autobuyers[14].ticks * 100 < player.autobuyers[14].interval) return false
	if (amount < req.amount) return false
	if (tmp.ngmX > 3 && inNC(14)) return false
	if (player.autobuyers[14].overXGals <= player.galaxies) return true
	if (player.autobuyers[14].priority < req.amount) return false
	return true
}

//v2.11
function cantReset() {
	return inNGM(4) && inNC(14) && getTotalResets() >= 10
}

el("buyerBtnTDBoost").onclick = function () {
	buyAutobuyer(14)
}

function maxHighestTD() {
	aarMod.maxHighestTD=!aarMod.maxHighestTD
	el("maxHighestTD").textContent = "Buy Max the highest tier of Time Dimensions: O"+(aarMod.maxHighestTD?"N":"FF")
}

function getMaxTDCost() {
	if (!hasAch("r36")) return Number.MAX_VALUE
	let x = Decimal.pow(Number.MAX_VALUE, 10)

	if (player.currentChallenge == "postcngm3_1") x = E(1e60)
	else if (player.currentChallenge != "") x = Decimal.pow(10, 1000)

	if (player.infinityUpgrades.includes("postinfi53")) x = x.pow(1 + tmp.cp / 3)

	return x
}

function getNGM4GalaxyEff() {
	let e = E(1)
	if (hasAch("r66")) {
		e = e.times(Math.log10(player.galacticSacrifice.galaxyPoints.max(1e86).log10() + 14) / 2)
		if (player.galacticSacrifice.galaxyPoints.gt(1e86)) e = e.add(player.galacticSacrifice.galaxyPoints.div(1e86).minus(1).min(10).div(100))
	}

	if (e.gt(1.5)) e = Decimal.add(e.times(6).add(1).log10(), .5)
	return e.toNumber()
}