function getDimensionBoostPower(next, focusOn) {
	if (inNC(11) || inNC(15) || player.currentChallenge == "postc1" || player.currentChallenge == "postcngm3_1") return E(1);

	var ret = 2
	if (!inNGM(2)) {
		if (player.infinityUpgrades.includes("resetMult")) ret = 2.5
		if (player.challenges.includes("postc7")) ret = 4
		if (player.currentChallenge == "postc7" || hasTimeStudy(81)) ret = 10
	}
	if (player.boughtDims) ret += player.timestudy.ers_studies[4] + (next ? 1 : 0)
	if (hasGalUpg(23) && ((!inNC(14) && player.currentChallenge != "postcngm3_3") || player.tickspeedBoosts == undefined || inNGM(4)) && player.currentChallenge != "postcngm3_4") ret *= galMults.u23()
	if (hasPU(31)) ret *= puMults[31]()
	if (player.infinityUpgrades.includes("resetMult") && inNGM(2)) ret *= 1.2 + 0.05 * player.infinityPoints.max(1).log(10)
	if (!player.boughtDims && hasAch("r101")) ret = ret * 1.01
	if (hasTimeStudy(83)) ret = tsMults[83]().times(ret);
	if (hasTimeStudy(231)) ret = tsMults[231]().times(ret)
	if (inNGM(2)) {
		if (player.currentChallenge == "postc7" || hasTimeStudy(81)) ret = Decimal.pow(ret, 3)
		else if (player.challenges.includes("postc7")) ret = Decimal.pow(ret, 2)
	}
	if (hasTS(152) && tmp.ngC) ret = Decimal.mul(ret, tsMults[152]())
	if (ECComps("eterc13") > 0) ret = Decimal.pow(ret, getECReward(13))
	if (hasDilationStudy(6)) ret = getExtraDimensionBoostPower().times(ret)

	if (player.currentEternityChall == "eterc13") ret = Decimal.pow(10, Math.sqrt(ret.log10() * (player.galaxies + getTotalRGs() + getEffectiveTGs())))

	return E(ret)
}

function softReset(bulk, tier = 1) {
	if (tmp.ri) return;

	var oldResets = player.resets
	player.resets += bulk

	if (tmp.ngp3 && player.resets > 4) player.old = false

	if (inNC(14) && player.tickspeedBoosts == undefined) player.tickBoughtThisInf.pastResets.push({resets: player.resets, bought: player.tickBoughtThisInf.current})

	if (moreEMsUnlocked() && getEternitied() >= tmp.ngp3_em[0] && tier == 1) {
		skipResets()
		player.matter = E(0)
		player.postC8Mult = E(1)
		player.dbPower = getDimensionBoostPower()
		return
	}

	doDimBoostResetStuff()

	if (player.resets > 4 && tmp.ngmX < 5) {
		el("confirmation").style.display = "inline-block";
		el("sacrifice").style.display = "inline-block";
		el("confirmations").style.display = "inline-block";
		el("sacConfirmBtn").style.display = "inline-block";
	}

	if (inNGM(2) && player.galaxies > 0 && player.resets > (inNGM(5) ? 3 : 4)) {
		el("gSacrifice").style.display = "inline-block"
		el("gConfirmation").style.display = "inline-block"
	}

	hideDimensions()
	tmp.tickUpdate = true;
	if (!hasAch("r111")) setInitialMoney()
}

function setInitialMoney() {
	var x = 10
	if (hasAch("r21")) x = 100
	if (inNGM(4)) x = 200
	if (hasAch("ngm5p12")) x = 250
	if (hasAch("r37")) x = 1000
	if (hasAch("r54")) x = 2e5
	if (hasAch("r55")) x = 1e10
	if (hasAch("r78")) x = 2e25
	player.money = E(x)
}

function setInitialResetPower() {
	var dimensionBoostPower = getDimensionBoostPower()
	if (tmp.ngp3 && getEternitied() >= 1e9 && player.dilation.upgrades.includes("ngpp6")) player.dbPower = dimensionBoostPower

	resetTickspeed()
	resetIC3Mult()
}

function maxBuyDimBoosts(manual) {
	let tier = player.pSac != undefined ? 6 : 8
	let maxamount = Math.min(getAmount(getShiftRequirement().tier), (player.galaxies >= player.overXGalaxies || manual) ? 1/0 : player.autobuyers[9].priority)

	if (player.autobuyers[9].priority >= getAmount(tier) || player.galaxies >= player.overXGalaxies || manual) {
		let r = doBulkSpent(maxamount, getFixedShiftReq, player.resets, true).toBuy

		if (r >= 750) giveAchievement("Costco sells dimboosts now")
		if (r >= 1) softReset(r)
	} else if (getShiftRequirement().tier < tier) {
		if (getShiftRequirement().amount <= maxamount) softReset(1)
	}
}

function getFixedShiftReq(n) {
	return getShiftRequirement(n).amount
}

function getNextShiftReq(n) {
	return getShiftRequirement(player.resets + n).amount
}

function getShiftRequirement(num = 0) {
	if (!num) num = player.resets
	let minDim = 4
	let maxDim = getMaxGeneralDimensions()
	let dim = Math.min(num + minDim, maxDim)

	let amount = 20
	let mult = getDimboostCostIncrease()

	if (inNGM(4) && !inNGM(5)) amount = 10
	if (dim == maxDim) {
		amount += Math.max(num - (maxDim - minDim) - (inNGM(2) && !inNGM(3) && hasGalUpg(21) ? 2 : 0), 0) * mult
	}

	if (player.currentEternityChall == "eterc5") {
		amount += Math.pow(num, 3) + num
	} else {
		let ssStart = getSupersonicStart()
		if (num >= ssStart) {
			let multInc = getSupersonicMultIncrease()
			let increased = Math.ceil((num - ssStart + 1) / 4e4)
			let offset = (num - ssStart) % 4e4 + 1
			amount += (increased * (increased * 2e4 - 2e4 + offset)) * multInc
			mult += multInc * increased
		}
	}

	if (player.infinityUpgrades.includes("resetBoost")) amount -= 9
	if (player.challenges.includes("postc5")) amount -= 1
	if (player.infinityUpgradesRespecced != undefined) amount -= getInfUpgPow(4)

	return {tier: dim, amount: amount, mult: mult};
}

function getDimboostCostIncrease () {
	let ret = 15
	if (inNGM(4)) ret += 5
	if (player.currentChallenge=="postcngmm_1") return ret
	if (inNGM(2)) {
		if (hasGalUpg(21)) ret -= 10
		if (hasGalUpg(43) && tmp.ngmX >= 4) {
			e = hasGalUpg(46) ? galMults["u46"]() : 1
			if (hasAch("r75")) e *= 2
			ret -= e
		}
		if (player.infinityUpgrades.includes('dimboostCost')) ret -= 1
		if (player.infinityUpgrades.includes("postinfi50")) ret -= doubleMSMult(0.5)
	} else {
		if (hasMTS(261)) ret -= 0.5
		if (inNC(4)) ret += 5
		if (player.boughtDims && hasAch('r101')) ret -= Math.min(8, Math.pow(player.eternityPoints.max(1).log(10), .25))
	}
	if (hasTimeStudy(211)) ret -= tsMults[211]()
	if (hasTimeStudy(222)) ret -= tsMults[222]()
	return ret;
}

function getSupersonicStart() {
	return 1/0
}

function getSupersonicMultIncrease() {
	let r = 4
	if (hasTS(194) && tmp.ngC) r = 2
	return r
}

el("softReset").onclick = function () {
	if (cantReset()) return
	var req = getShiftRequirement()
	if (tmp.ri || getAmount(req.tier) < req.amount) return;
	auto = false;
	var pastResets = player.resets
	if ((player.infinityUpgrades.includes("bulkBoost") || (hasAch("r28") && player.tickspeedBoosts !== undefined) || player.autobuyers[9].bulkBought) && player.resets > (inNC(4) || player.pSac != undefined ? 1 : 3) && (!inNC(14) || !(inNGM(4)))) maxBuyDimBoosts(true);
	else softReset(1)
	if (player.resets <= pastResets) return

	let pow = getDimensionBoostPower()
	if (pow.eq(1)) return
	for (var tier = 1; tier <= 8; tier++) if (player.resets >= tier) floatText("D" + tier, "x" + shortenDimensions(pow.pow(player.resets + 1 - tier)))
};

function skipResets() {
	if (inNC(0) && player.currentChallenge == "") {
		var upToWhat = 0
		for (var s = 1; s < 4; s++) if (player.infinityUpgrades.includes("skipReset" + s)) upToWhat = s
		if (player.infinityUpgrades.includes("skipResetGalaxy")) {
			upToWhat = 4 
			if (player.galaxies < 1) player.galaxies = 1
		}
		if (player.resets < upToWhat) player.resets = upToWhat
		if (player.tickspeedBoosts<upToWhat * 4) player.tickspeedBoosts = upToWhat * 4
	}
}

function getTotalResets() {
	let r = player.resets + player.galaxies
	if (player.tickspeedBoosts) r += player.tickspeedBoosts
	if (inNGM(4)) r += player.tdBoosts
	return r
}

function getTotalDBs() {
	return player.resets + getExtraDBs()
}

function getExtraDBs() {
	let x = 0
	if (hasMTS(291)) x += player.resets * (getMTSMult(291) - 1)
	return x
}