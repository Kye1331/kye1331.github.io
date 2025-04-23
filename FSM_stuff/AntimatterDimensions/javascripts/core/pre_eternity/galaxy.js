function galaxyReset(bulk) {
	if (tmp.ri) return

	if (autoS) auto = false
	autoS = true

	player.tickBoughtThisInf = updateTBTIonGalaxy()

	if (player.sacrificed == 0 && bulk > 0) giveAchievement("I don't believe in Gods");

	player.galaxies += bulk

	doGalaxyResetStuff()

	if (player.options.notation == "Emojis") player.spreadingCancer += bulk

	if (player.infinitied < 1 && player.eternities == 0 && !quantumed) {
		el("sacrifice").style.display = "none"
		el("confirmation").style.display = "none"
		if (inNGM(2) && (player.galaxies > 0 || (inNGM(2) ? player.galacticSacrifice.times > 0 : false))) {
			el("gSacrifice").style.display = "inline-block"
			el("gConfirmation").style.display = "inline-block"
		}
	}
	if (!hasAch("r111")) setInitialMoney()
	if (hasAch("r66")) player.tickspeed = player.tickspeed.times(0.98);
	if (tmp.quActive && qu_save.bigRip.active) qu_save.bigRip.bestGals = Math.max(qu_save.bigRip.bestGals, player.galaxies)
	if (pH.did("ghostify") && player.ghostify.neutrinos.boosts) gainNeutrinos(bulk, "gen")
	hideDimensions()
	tmp.tickUpdate = true;
}

el("secondSoftReset").onclick = function() {
	var ngm4 = tmp.ngmX ? tmp.ngmX >= 4 : false
	var bool1 = !inNC(11) || ngm4
	var bool2 = player.currentChallenge != "postc1"
	var bool3 = player.currentChallenge != "postc5" || player.tickspeedBoosts == undefined
	var bool4 = player.currentChallenge != "postc7"
	var bool5 = (player.currentEternityChall == "eterc6") && !tmp.be
	var bool = bool1 && bool2  && bool3 && bool4 && !bool5 && !tmp.ri && !cantReset()
	if (getAmount(inNC(4) || inNGM(5) ? 6 : 8) >= getGalaxyRequirement() && bool) {
		if ((getEternitied() >= 7 || player.autobuyers[10].bulkBought) && !shiftDown && (!inNC(14) || tmp.ngmX <= 3)) maxBuyGalaxies(true);
		else galaxyReset(1)
	}
}

function getGalaxyRequirement(offset = 0, display) {
	tmp.grd = {} //Galaxy requirement data
	tmp.grd.gals = player.galaxies + offset

	var scaling = 0
	var mult = getGalaxyReqMultiplier()
	var exp = 1
	var isNum = true

	var base = 80
	if (inNGM(2)) base -= (hasGalUpg(22) && tmp.grd.gals >= 1) ? 80 : 60
	if (inNGM(4)) base -= 10
	if (inNC(4) || inNGM(5)) base = inNGM(3) ? base + (inNGM(4) ? 20 : -30) : 99

	var amt = base
	if (tmp.grd.gals * mult > 0) {
		if (exp == 1) amt += tmp.grd.gals * mult
		else {
			isNum = false
			amt = Decimal.pow(amt / mult, 1 / exp).add(tmp.grd.gals).pow(exp).times(mult)
			scaling--
		}
	}

	if (!player.boughtDims) {
		//Distant
		var old1 = amt
		var distantStart = getDistantStart()
		var add = 0
		if (tmp.grd.gals >= distantStart) {
			var speed = 1

			add += getDistantAdd(tmp.grd.gals - distantStart + 1) * speed
			if (tmp.grd.gals >= distantStart * 2.5 && inNGM(2)) {
				// 5 times worse scaling
				add += 4 * speed * getDistantAdd(tmp.grd.gals - distantStart * 2.5 + 1)
				scaling = Math.max(scaling, 2)
			} else scaling = Math.max(scaling, 1)
		}
		if (isNum) amt += add
		else amt = amt.add(add)

		//Remote
		var old2 = amt
		var remoteStart = getRemoteStart()
		if (tmp.grd.gals >= remoteStart) {
			var speed2 = 1
			if (tmp.ngp3) speed2 *= getRemotePower(remoteStart)

			var mul = Decimal.pow(getRemoteBase(), (tmp.grd.gals - remoteStart + 1) * speed2)
			if (display) isNum = false
			if (isNum) amt *= mul.toNumber()
			else amt = mul.times(amt)

			scaling = Math.max(scaling, 3)
		}
	}
	if (!display || isNum) amt = Math.ceil(amt - getGalaxyReqSub())
	else amt = amt.sub(getGalaxyReqSub()).ceil()

	if (display) return {amt: amt, scaling: scaling}
	return amt
}

function getGalaxyReqMultiplier() {
	if (player.currentChallenge == "postcngmm_1") return 60
	var ret = 60
	if (inNGM(2)) {
		if (hasGalUpg(22)) ret -= 30
	} else if (hasTimeStudy(42)) ret *= tsMults[42]()
	if (inNC(4)) ret = 90
	if (tmp.ngC) ret -= 35
	if (player.infinityUpgrades.includes("galCost")) ret -= 5
	if (player.infinityUpgrades.includes("postinfi52") && player.tickspeedBoosts == undefined) ret -= 3
	if (hasDilationUpg("ngmm12")) ret -= 10
	if (inNGM(2) && hasTimeStudy(42)) ret *= tsMults[42]()
	return ret
}

function getGalaxyReqSub() {
	var sub = 0
	if (player.infinityUpgrades.includes("resetBoost")) sub += 9
	if (player.challenges.includes("postc5")) sub += 1
	if (player.infinityUpgradesRespecced != undefined) sub += getInfUpgPow(6)
	return sub
}

function getDistantStart() {
	if (player.currentEternityChall == "eterc5") return 0
	var n = tmp.ngC ? 1 : 100
	n += getECReward(5)
	if (hasTimeStudy(223)) n += 7
	if (hasTimeStudy(224)) n += tsMults[224]()
	if (hasDilationUpg("ngmm11")) n += 25
	return n
}

function getDistantPowerNGC() {
	var power = 1
	if (hasTS(194) && tmp.ngC) power = .5
	return power;
}

function getDistantAdd(x) {
	x *= getDistantPowerNGC()

	if (inNGM(2) && player.tickspeedBoosts == undefined) return Math.pow(x, 1.5) + x
	if (tmp.ngp3) {
		var exp = 2
		if (exp < 2) x = Math.pow(x, exp / 2) * Math.pow(getGalaxyReqMultiplier(), 2 - exp)
	}

	return (x + 1) * x
}

function getRemoteStart(galaxies) {
	var n = 0
	if (inNGM(4)) {
		n = 6
		if (player.challenges.includes("postcngm3_1")) n += tmp.cp / 2
	} else if (inNGM(2)) n = 1e7
	else if (tmp.ngC) n = 150
	else n = 800

	if (hasDilationUpg(5) && tmp.ngC) n += 25
	if (tmp.ngp3) for (var t = 251; t <= 253; t++) if (hasMTS(t)) n += getMTSMult(t)
	return n
}

function getRemoteBase() {
	return 1 + 2 / (tmp.ngmX > 3 ? 10 : 1e3)
}

function getRemotePower(remoteStart) {
	var speed = 1
	if (PCs.milestoneDone(82)) {
		var pc82 = (PCs_save.lvl - 1) / 8e3 / 28
		speed /= remoteStart * pc82 + 1
	}
	return speed
}

function maxBuyGalaxies(manual) {
	var max = (manual || (getEternitied() >= 10 && tmp.ngp3_boost && player.autobuyers[10].priority == 0)) ? 1/0 : player.autobuyers[10].priority
	if ((inNC(11) || player.currentEternityChall == "eterc6" || player.currentChallenge == "postc1" || (player.currentChallenge == "postc5" && inNGM(3)) || player.currentChallenge == "postc7") && !tmp.be) return
	if (max > player.galaxies) galaxyReset(doBulkSpent(getAmount(inNC(4) || inNGM(5) ? 6 : 8), getGalaxyRequirement, 0, true, undefined, player.galaxies).toBuy) //Offset function
}