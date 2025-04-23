function getTickspeedMultiplier() {
	if (isTickDisabled()) return E(1)
	let x = E(getGalaxyTickSpeedMultiplier())
	if (tmp.be && qu_save.breakEternity.upgrades.includes(5)) x = x.div(getBreakUpgMult(5))
	if (tmp.ngC && player.timestudy.studies.includes(25)) x = x.div(tsMults[25]())
	if (inNC(6, 3)) x = x.add(getTotalDBs() * 1e-3)
	return x.min(1)
}

function initialGalaxies() {
	let g = player.galaxies

	if (pos.on()) g -= pos_save.gals.ng.sac
	if (QCs.in(4) && QCs_save.qc4[QCs_tmp.qc4.type] == "ng") g = 0
	if (tmp.ngC) g *= 2
	if ((inNC(15) || player.currentChallenge == "postc1") && tmp.ngmX == 3) g = 0

	return g
}

function getGalaxyPower(ng, bi, noDil) {
	let x = ng
	if (!tmp.be) x = Math.max(ng - (bi ? 2 : 0), 0) + getExtraGalaxyPower(noDil)
	if (inNC(7) && inNGM(2)) x *= x
	if (hasTimeStudy(173) && tmp.ngC) x *= 3
	if (player.currentEternityChall == "eterc13") x = Math.sqrt(x * Math.sqrt(getTotalDBs()))
	return x
}

function getGalaxyEff(bi) {
	let eff = 1
	if (inNC(6, 3)) eff *= 1.5
	if (inNGM(2)) if (hasGalUpg(22)) eff *= tmp.ngmX>3?2:5;
	if (player.infinityUpgrades.includes("galaxyBoost")) eff *= tmp.ngC ? 4 : 2;
	if (player.infinityUpgrades.includes("postGalaxy")) eff *= getPostGalaxyEff();
	if (player.challenges.includes("postc5")) eff *= inNGM(2) ? 1.15 : 1.1;
	if (hasAch("r86")) eff *= inNGM(2) ? 1.05 : 1.01
	if (inNGM(2)) {
		if (hasAch("r83")) eff *= 1.05
		if (hasAch("r45")) eff *= 1.02
		if (player.infinityUpgrades.includes("postinfi51")) eff *= player.tickspeedBoosts != undefined ? 1.15 : 1.2
		if (tmp.cp && hasAch("r67")) {
			let x = tmp.cp
			if (x < 0) x = 1
			if (x > 4 && player.tickspeedBoosts != undefined) x = Math.sqrt(x - 1) + 2
			eff += .07 * x
		}
		if (tmp.ngmX >= 4) eff *= getNGM4GalaxyEff()
	}
	if (tmp.ngmR) eff *= 1.2
	if (inNGM(3) && (inNC(5) || player.currentChallenge == "postcngm3_3")) eff *= 0.75
	if (hasAch("ngpp8") && player.meta != undefined) eff *= 1.001;
	if (hasTimeStudy(212)) eff *= tsMults[212]()
	if (hasTimeStudy(232) && bi) eff *= tsMults[232]()
	if (tmp.ngC) eff *= getECReward(11) || 1 // yeah this'll be issues

	if (aarMod.nguspV !== undefined && player.dilation.active) eff *= exDilationBenefit() + 1
	if (tmp.quActive) eff *= colorBoosts.r
	if (QCs.in(4)) eff *= QCs_tmp.qc4.boost
	if (hasBosonicUpg(34)) eff *= tmp.blu[34]
	return eff
}

function getPostGalaxyEff() {
	let ret = player.tickspeedBoosts != undefined ? 1.1 : inNGM(2) ? 1.7 : 1.5
	return ret
}

function getExtraGalaxyPower(noDil) {
	let x = 0

	//Replicated
	let replPower = getFullEffRGs()
	let replGalEff = getReplGalaxyEff()

	if (hasMTS(301)) replPower *= replGalEff
	else {
		let tsReplEff = getTSReplEff()
		let extraReplGalPower = 0
		extraReplGalPower += replPower * (tsReplEff - 1) + getEffectiveRGs("eg")
		replPower += Math.min(replPower, player.replicanti.gal) * (replGalEff - 1) + extraReplGalPower
	}

	x += replPower

	//Dilation
	if (hasDilationStudy(1) && !noDil) x += Math.floor(getEffectiveTGs()) * getDilGalaxyEff()
	return x
}

function getGalaxyTickSpeedMultiplier() {
	let g = initialGalaxies()
	if ((player.currentChallenge == "postc3" || isIC3Trapped()) && !tmp.be) {
		if (player.currentChallenge == "postcngmm_3" || player.challenges.includes("postcngmm_3")) {
			let base = player.tickspeedBoosts != undefined ? 0.9995 : 0.998
			if (tmp.ngmX >= 4 && player.challenges.includes("postcngmm_3")) base = .9998
			return Decimal.pow(base, getGalaxyPower(g) * getGalaxyEff(true))
		}
		return 1
	}
	let inRS = player.boughtDims != undefined || player.infinityUpgradesRespecced != undefined
	let galaxies = getGalaxyPower(g, !inRS) * getGalaxyEff(true)
	let baseMultiplier = 0.8
	let linearGalaxies = 2
	if (inNC(6, 1)) {
		baseMultiplier = 0.83
		linearGalaxies += 2
	}
	let useLinear = g + getEffectiveRGs("rg") + getEffectiveTGs() <= linearGalaxies
	if (inRS) {
		linearGalaxies = Math.min(galaxies, linearGalaxies + 3)
		useLinear = true
	}
	if (useLinear) {
		tmp.galRed = 1
		baseMultiplier = 0.9;
		if (inRS && galaxies == 0) baseMultiplier = 0.89
		else if (g == 0) baseMultiplier = 0.89
		if (inNC(6, 1)) baseMultiplier = 0.93
		if (inRS) {
			baseMultiplier -= linearGalaxies * 0.02
		} else {
			let perGalaxy = 0.02 * getGalaxyEff()
			return Math.max(baseMultiplier - (g * perGalaxy), 0.83)
		}
	}
	let perGalaxy = player.infinityUpgradesRespecced != undefined ? 0.98 : 0.965
	let x = Decimal.pow(perGalaxy, galaxies - linearGalaxies).times(baseMultiplier)
	return x
}

function canBuyTickSpeed() {
	if (player.currentEternityChall == "eterc9") return false
	if (inNGM(2) && player.tickspeedBoosts == undefined && inNC(14) && player.tickBoughtThisInf.current > 307) return false
	return canBuyDimension(3);
}

function buyTickSpeed() {
	if (!canBuyTickSpeed()) return false
	if (player.tickSpeedCost.gt(player.money)) return false
	if (!pH.did("quantum")) player.money = player.money.minus(player.tickSpeedCost)
	if ((!inNC(5) && player.currentChallenge != "postc5") || player.tickspeedBoosts != undefined) player.tickSpeedCost = player.tickSpeedCost.times(player.tickspeedMultiplier)
	else multiplySameCosts(player.tickSpeedCost)
	if (costIncreaseActive(player.tickSpeedCost)) player.tickspeedMultiplier = player.tickspeedMultiplier.times(getTickSpeedCostMultiplierIncrease())
	if (inNC(2) || player.currentChallenge == "postc1" || tmp.ngmR || (inNGM(5) && !hasPU(41))) player.chall2Pow = 0
	if (!tmp.be) {
		player.tickspeed = player.tickspeed.times(tmp.tsReduce)
		if (player.challenges.includes("postc3") || player.currentChallenge == "postc3" || isIC3Trapped()) player.postC3Reward = player.postC3Reward.times(getIC3Mult())
	}
	player.postC8Mult = E(1)
	if (inNC(14) && player.tickspeedBoosts == undefined) player.tickBoughtThisInf.current++
	player.why = player.why + 1
	tmp.tickUpdate = true
	return true
}

el("tickSpeed").onclick = function () {
	buyTickSpeed()
};

function resetTickspeed() {
	//Tickspeed
	let x = 1e3
	if (aarMod.newGameExpVersion) x /= 2
	if (hasAch("r36")) x *= 0.98
	if (hasAch("r45")) x *= 0.98
	if (hasAch("r66")) x *= 0.98
	if (hasAch("r83")) x = Decimal.pow(0.95, player.galaxies).times(x)
	if (tmp.ngmR) x = Decimal.pow(1.5, -player.galaxies).times(x)
	player.tickspeed = E(x)

	divideTickspeedIC5()

	let pow = player.totalTickGained
	if (player.infinityUpgradesRespecced != undefined) pow += player.infinityUpgradesRespecced[1] * 10
	player.tickspeed = Decimal.pow(getTickspeedMultiplier(), pow).times(player.tickspeed)

	//Tickspeed cost
	player.tickSpeedCost = E(1e3)

	//Tickspeed cost multiplier
	let y = 10
	if (tmp.ngmR) y = ngmR.adjustCostScale(y)
	player.tickspeedMultiplier = E(y)
}

function getTickSpeedCostMultiplierIncrease() {
	let ret = player.tickSpeedMultDecrease;

	//NG--
	if (player.currentChallenge === 'postcngmm_2') ret = Math.pow(ret, .5)
	else if (player.challenges.includes('postcngmm_2')) {
		let exp = .9 - .02 * ECComps("eterc11")
		let galeff = (1 + Math.pow(player.galaxies, 0.7) / 10)
		if (tmp.ngmX >= 4) galeff = Math.pow(galeff, .2)

		ret = Math.pow(ret, exp / galeff)
	}
	return ret
}

function buyMaxPostInfTickSpeed(mult) {
	let mi = getTickSpeedCostMultiplierIncrease()
	let a = Math.log10(Math.sqrt(mi))
	let b = player.tickspeedMultiplier.dividedBy(Math.sqrt(mi)).log10()
	let c = player.tickSpeedCost.dividedBy(player.money).log10()
	let discriminant = Math.pow(b, 2) - (c * a * 4)
	if (discriminant < 0) return false

	let buying = Math.floor((Math.sqrt(discriminant) - b) / (2 * a)) + 1
	if (buying <= 0) return false
	if (inNC(2) || player.currentChallenge == "postc1" || tmp.ngmR || (inNGM(5) && !01)) player.chall2Pow = 0
	if (!tmp.be || player.currentEternityChall == "eterc10") {
		player.tickspeed = player.tickspeed.times(Decimal.pow(mult, buying));
		if (player.challenges.includes("postc3") || player.currentChallenge == "postc3" || isIC3Trapped()) player.postC3Reward = player.postC3Reward.times(Decimal.pow(getIC3Mult(), buying))
	}
	player.tickSpeedCost = player.tickSpeedCost.times(player.tickspeedMultiplier.pow(buying-1)).times(Decimal.pow(mi, (buying-1)*(buying-2)/2))
	player.tickspeedMultiplier = player.tickspeedMultiplier.times(Decimal.pow(mi, buying-1))
	if (!quantum){
		if (player.money.gte(player.tickSpeedCost)) player.money = player.money.minus(player.tickSpeedCost)
		else if (player.tickSpeedMultDecrease > 2) player.money = E(0)
	}
	player.tickSpeedCost = player.tickSpeedCost.times(player.tickspeedMultiplier)
	player.tickspeedMultiplier = player.tickspeedMultiplier.times(mi)
	player.postC8Mult = E(1)
}

function cannotUsePostInfTickSpeed() {
	return ((inNC(5) || player.currentChallenge == "postc5") && player.tickspeedBoosts == undefined) || !costIncreaseActive(player.tickSpeedCost) || (player.tickSpeedMultDecrease > 2 && player.tickspeedMultiplier.lt(Number.MAX_SAFE_INTEGER));
}

function buyMaxTickSpeed() {
	if (inNC(14) && player.tickspeedBoosts == undefined) return false
	if (!canBuyTickSpeed()) return false
	if (player.tickSpeedCost.gt(player.money)) return false
	let cost = player.tickSpeedCost
	if (((!inNC(5) && player.currentChallenge != "postc5") || player.tickspeedBoosts != undefined) && !inNC(9) && !costIncreaseActive(player.tickSpeedCost)) {
		let base = player.tickspeedMultiplier.toNumber()
		let max = Number.POSITIVE_INFINITY
		if (!inNC(10) && player.currentChallenge != "postc1" && player.infinityUpgradesRespecced == undefined) max = Math.ceil(Decimal.div(Number.MAX_VALUE, cost).log(base))
		let toBuy = Math.min(Math.floor(player.money.div(cost).times(base - 1).add(1).log(base)), max)
		getOrSubResource(1, Decimal.pow(base, toBuy).sub(1).div(base - 1).times(cost))
		if (!tmp.be || player.currentEternityChall == "eterc10") {
			player.tickspeed = Decimal.pow(tmp.tsReduce, toBuy).times(player.tickspeed)
			if (player.challenges.includes("postc3") || player.currentChallenge == "postc3" || isIC3Trapped()) player.postC3Reward = player.postC3Reward.times(Decimal.pow(getIC3Mult(), toBuy))
		}
		player.tickSpeedCost = player.tickSpeedCost.times(Decimal.pow(base, toBuy))
		player.postC8Mult = E(1)
		if (costIncreaseActive(player.tickSpeedCost)) player.tickspeedMultiplier = player.tickspeedMultiplier.times(getTickSpeedCostMultiplierIncrease())
	}
	let mult = tmp.tsReduce
	if (inNC(2) || player.currentChallenge == "postc1" || tmp.ngmR || (inNGM(5) && !hasPU(41))) player.chall2Pow = 0
	if (cannotUsePostInfTickSpeed()) {
		while (player.money.gt(player.tickSpeedCost) && (player.tickSpeedCost.lt(Number.MAX_VALUE) || player.tickSpeedMultDecrease > 2 || (player.currentChallenge == "postc5" && player.tickspeedBoosts == undefined))) {
			player.money = player.money.minus(player.tickSpeedCost);
			if (!inNC(5) && player.currentChallenge != "postc5") player.tickSpeedCost = player.tickSpeedCost.times(player.tickspeedMultiplier);
			else multiplySameCosts(player.tickSpeedCost)
			if (costIncreaseActive(player.tickSpeedCost)) player.tickspeedMultiplier = player.tickspeedMultiplier.times(getTickSpeedCostMultiplierIncrease())
			if (!tmp.be || player.currentEternityChall == "eterc10") {
				player.tickspeed = player.tickspeed.times(mult);
				if (player.challenges.includes("postc3") || player.currentChallenge == "postc3" || isIC3Trapped()) player.postC3Reward = player.postC3Reward.times(getIC3Mult())
			}
			player.postC8Mult = E(1)
			if (!cannotUsePostInfTickSpeed()) buyMaxPostInfTickSpeed(mult);
		}
	} else {
		buyMaxPostInfTickSpeed(mult);
	}

	tmp.tickUpdate = true
}

function getTickspeedBeforeSoftcap() {
	let tick = player.tickspeed

	if (tmp.ngC) {
		for (let i = 1; i <= 4; i++) if (hasInfinityMult(i)) tick = tick.div(dimMults())
		if (player.infinityUpgrades.includes("postinfi82")) tick = tick.div(getTotalSacrificeBoost())
		if (player.timestudy.studies.includes(12)) tick = tick.div(Decimal.pow(getDimensionBoostPower(), getTotalDBs()))
	}
	return tick
}

function getTickspeedBeforePostMults() {
	let tick = (tmp.ts && tmp.ts.pre1) || E(1e3)

	if (player.infinityUpgradesRespecced != undefined) {
		var log = 3 - tick.log10()
		if (log > 25) tick = Decimal.pow(10, 3 - Math.sqrt(log) * 5)
	}
	if (tmp.ngC) tick = softcap(tick.pow(-1), "ts_ngC").pow(-1)
	return tick
}

function getTickspeed() {
	if (isTickDisabled() || !tmp.ts) return E(1e3)
	return Decimal.div(tmp.ts.pre2 || 1e3, tmp.ts.faster || 1)
}

function getFasterTickspeed() {
	let x = E(1)

	if (player.singularity != undefined) x = x.times(getDarkMatterMult())
	return x
}

function isTickDisabled() {
	return tmp.ngC && player.currentEternityChall == "eterc7"
}

function getTickspeedText(ts) {
	let exp = ts.e
	if (isNaN(exp)) return 'Infinite'
	if (exp > 1) return ts.toFixed(0)

	let precise = Math.max(Math.min(Math.ceil(9 - Math.log10(2 - exp)), 3), 0)
	if (precise == 0) return shortenCosts(Decimal.div(1000, ts)) + "/s"
	return Math.min(ts.m * Math.pow(10, precise - 1), Math.pow(10, precise) - 1).toFixed(0) + ' / ' + shortenCosts(Decimal.pow(10, 2 - exp))
}

function updateTickspeed() {
	let showTickspeed = player.tickspeed.lt(1e3) || (player.currentChallenge != "postc3" && !isIC3Trapped()) || player.currentChallenge == "postcngmm_3" || (player.challenges.includes("postcngmm_3") && player.tickspeedBoosts === undefined) || tmp.be
	let label = ""
	if (showTickspeed) {
		let tick = getTickspeed()
		label = "Tickspeed: " + getTickspeedText(tick)
	}
	if (isIC3Trapped()) label = (showTickspeed ? label + ", Tickspeed m" : "M") + "ultiplier: " + formatValue(player.options.notation, player.postC3Reward, 2, 3)
	let speeds = []
	let speedDescs = []
	if (gameSpeed != 1) {
		speeds.push(gameSpeed)
		speedDescs.push("Dev")
	}
	if (ls.mult("game") != 1) {
		speeds.push(ls.mult("game"))
		speedDescs.push("'Light Speed' mod")
	}
	if (speeds.length >= 1) label += ", Game speed: " + factorizeDescs(speeds, speedDescs) + (tmp.gameSpeed < 1 ? shorten(1 / tmp.gameSpeed) + "x slower" : shorten(tmp.gameSpeed) + "x faster")

	if (inNGM(2) && player.tickspeedBoosts == undefined && inNC(14)) {
		label += "<br>You have " + (308 - player.tickBoughtThisInf.current) + " tickspeed purchases left."
		el("tickSpeedAmount").innerHTML = label
	} else el("tickSpeedAmount").textContent = label
}
