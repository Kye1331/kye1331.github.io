//LAYERS
function doDimBoostResetStuff(layer = 1) {
	if (layer >= 3 || !hasAch("r111")) setInitialMoney()
	skipResets()
	setInitialResetPower()
	if (layer >= 3 || !moreEMsUnlocked() || getEternitied() < tmp.ngp3_em[0]) resetDimensions()

	player.totalBoughtDims = resetTotalBought()
	player.sacrificed = E(0)
	player.chall3Pow = E(0.01)
	player.matter = E(0)
	player.chall11Pow = E(1)
	player.postC4Tier = 1
	player.postC8Mult = E(1)

	if (player.currentChallenge == "postc2") {
		player.eightAmount = E(1)
		player.eightBought = 1
	}
}

function doGalaxyResetStuff(layer = 2) {
	if (layer >= 3 || !moreEMsUnlocked() || getEternitied() < tmp.ngp3_em[4]) {
		player.resets = 0
		if (player.dbPower) player.dbPower = E(1)
	}
	if (tmp.ngmX >= 3) player.tickspeedBoosts = 0
	player.tdBoosts = resetTDBoosts()

	doDimBoostResetStuff(layer)
}

function doCrunchResetStuff(layer = 3, chall) {
	player.totalBoughtDims = resetTotalBought()
	player.tickBoughtThisInf = resetTickBoughtThisInf()
	player.galaxies = 0

	if (tmp.ngmX >= 2) player.galacticSacrifice = newGalacticDataOnInfinity(layer, chall)
	if (tmp.ngmX >= 5) resetPSac()

	player.thisInfinityTime = 0
	IPminpeak = E(0)

	doGalaxyResetStuff(layer)
}

function doEternityResetStuff(layer = 4, chall) {
	player.infinityPoints = E(hasAch("r104") ? 2e25 : 0)
	player.infinitied = 0
	player.infMult = E(1)
	player.infMultCost = E(10)
	if (hasAch("r85")) player.infMult = player.infMult.times(4)
	if (hasAch("r93")) player.infMult = player.infMult.times(4)
	playerInfinityUpgradesOnEternity()

	player.currentChallenge = ""
	player.challengeTarget = 0
	player.challenges = challengesCompletedOnEternity()

	if (!canBreakInfinity()) player.break = false
	if (!player.challenges.includes("postc2") && getEternitied() < 7) player.autoSacrifice = 1

	player.partInfinityPoint = 0
	player.partInfinitied = 0
	player.autoIP = E(0)
	player.autoTime = 1e300

	player.thisEternity = QCs.perkActive(6) ? 5 : 0
	player.bestInfinityTime = 9999999999
	player.lastTenRuns = [[600*60*24*31, E(0)], [600*60*24*31, E(0)], [600*60*24*31, E(0)], [600*60*24*31, E(0)], [600*60*24*31, E(0)], [600*60*24*31, E(0)], [600*60*24*31, E(0)], [600*60*24*31, E(0)], [600*60*24*31, E(0)], [600*60*24*31, E(0)]]

	player.tickSpeedMultDecrease = getEternitied() >= 20 ? player.tickSpeedMultDecrease : 10
	player.tickSpeedMultDecreaseCost = getEternitied() >= 20 ? player.tickSpeedMultDecreaseCost : 3e6
	player.dimensionMultDecrease = getEternitied() >= 20 ? player.dimensionMultDecrease : 10
	player.dimensionMultDecreaseCost = getEternitied() >= 20 ? player.dimensionMultDecreaseCost : 1e8
	player.offlineProd = getEternitied() >= 20 ? player.offlineProd : 0
	player.offlineProdCost = getEternitied() >= 20 ? player.offlineProdCost : 1e7
	if (tmp.ngmX >= 2) {
		player.extraDimPowerIncrease = getEternitied() >= 20 ? player.extraDimPowerIncrease : 0
		player.dimPowerIncreaseCost = getEternitied() >= 20 ? player.dimPowerIncreaseCost : 1e3
	}

	player.replicanti.unl = getEternitied() >= 50
	resetReplicantiUpgrades()
	player.replicanti.galaxybuyer = (getEternitied() > 2) ? player.replicanti.galaxybuyer : undefined

	if (chall == 14) player.replicanti.kept = player.replicanti.amount
	player.replicanti.amount = layer >= 5 ? (
		E(getEternitied() >= 50 ? 1 : 0)
	) : (
		moreEMsUnlocked() && getEternitied() >= tmp.ngp3_em[2] && (chall == 0 || chall == "dil") && !QCs.in(5) ? Decimal.pow(player.replicanti.kept || player.replicanti.amount, 0.995).floor().max(1) :
		E(getEternitied() >= 50 ? 1 : 0)
	)
	if (chall != 14) delete player.replicanti.kept

	player.dilation.active = chall == "dil"

	delete tmp.rmPseudo
	tmp.rm = E(1)

	player.eterc8ids = 50
	player.eterc8repl = 40

	player.dimlife = true
	player.dead = true
	if (tmp.ngp3) player.dontWant = true

	resetInfDimensions(true)
	resetTimeDimensions()

	doCrunchResetStuff(layer, chall)
}

function doQuantumResetStuff(layer = 5, bigRip, isQC, qcData){
	var headstart = !tmp.ngp3
	var oheHeadstart = tmp.ngp3
	var keepABnICs = oheHeadstart || hasAch("ng3p12")
	var turnSomeOn = !bigRip || tmp.bruActive[1]
	var bigRipChanged = false

	if (qMs.tmp.amt < 1) {
		if (player.dimensionMultDecrease <= 3) player.dimensionMultDecrease = 3
		if (player.tickSpeedMultDecrease <= 2) player.tickSpeedMultDecrease = 2
	}

	player.bestEternity = 9999999999
	player.lastTenEternities = [[600*60*24*31, E(0)], [600*60*24*31, E(0)], [600*60*24*31, E(0)], [600*60*24*31, E(0)], [600*60*24*31, E(0)], [600*60*24*31, E(0)], [600*60*24*31, E(0)], [600*60*24*31, E(0)], [600*60*24*31, E(0)], [600*60*24*31, E(0)]]

	player.infinitiedBank = 0
	if (!headstart) player.eternities = qMs.tmp.amt >= 2 ? 100 * Math.pow(3, qMs.tmp.amt) : oheHeadstart ? 100 : 0
	player.eternityPoints = E(0)

	var keepTS = bigRip ? tmp.bruActive[12] : qMs.isOn(3)
	if (keepTS) respecTimeStudies()
	else player.timestudy = {
		theorem: 0,
		amcost: E("1e20000"),
		ipcost: E(1),
		epcost: E(1),
		studies: [],
		auto: player.timestudy.auto
	}
	if (isQC) player.timestudy.theorem = 0
	player.respec = false
	player.respecMastery = false

	if (!qMs.isOn(3)) player.eternityUpgrades = []
	player.epmult = E(1)
	player.epmultCost = E(500)

	player.etercreq = 0
	player.eternityChallUnlocked = 0
	player.currentEternityChall = ""
	player.eternityChallGoal = E(Number.MAX_VALUE)

	player.autoIP = E(0)
	player.autoTime = 1e300
	player.infMultBuyer = bigRipChanged ? turnSomeOn : oheHeadstart ? player.infMultBuyer : false
	player.autoCrunchMode = keepABnICs ? player.autoCrunchMode : "amount"
	player.autoEterMode = keepABnICs ? player.autoEterMode : "amount"
	player.eternityBuyer = keepABnICs ? player.eternityBuyer : {
		limit: E(0),
		isOn: false
	}
	if (tmp.ngp3) {
		player.eternityBuyer.alwaysDilCond = player.eternityBuyer.isOn && qMs.isOn(5)
		player.eternityBuyer.statBeforeDilation = player.eternityBuyer.dilationPerAmount || 0
	}

	player.eterc8ids = 50
	player.eterc8repl = 40
	player.dimlife = true
	player.dead = true

	let oldUpgs = player.dilation.upgrades
	let upgs = !qMs.isOn(5) || !qMs.isOn(7) ? [] : qMs.tmp.amt >= 9 ? oldUpgs : [4, 5, 6, 7, 8, 9, 10, "ngpp1", "ngpp2"]
	let newUpgs = []
	let multUpgs = !qMs.isOn(8) ? 0 : tmp.exMode ? 10 : tmp.bgMode ? 1/0 : 25
	for (var i = 0; i < oldUpgs.length; i++) if (upgs.includes(oldUpgs[i])) newUpgs.push(oldUpgs[i])

	if (!player.dilation.bestTP) player.dilation.bestTP = player.dilation.tachyonParticles
	player.dilation = {
		studies:
			!qMs.isOn(5) ? [] :
			qMs.tmp.amt >= 9 ? [1, 2, 3, 4, 5, 6] : qMs.tmp.amt >= 6 ? [1, 2, 3, 4, 5] : [1],
		active: false,
		tachyonParticles: E(QCs.perkActive(3) ? 1 : 0),
		dilatedTime: E(0),
		bestTP: Decimal.max(player.dilation.bestTP || 0, player.dilation.tachyonParticles),
		nextThreshold: E(1000),
		freeGalaxies: 0,
		upgrades: newUpgs,
		autoUpgrades: [],
		rebuyables: {
			1: 0,
			2: 0,
			3: Math.min(player.dilation.rebuyables[3], multUpgs),
			4: Math.min(player.dilation.rebuyables[4], multUpgs),
		}
	}
	player.dilation.totalTachyonParticles = player.dilation.tachyonParticles

	resetTimeDimensions(true)
	resetEternityChallenges(bigRip, !tmp.ngp3)
	resetNGUdData(true)
	doMetaDimensionsReset(bigRip, headstart, isQC)
	resetMasteryStudies()

	doEternityResetStuff(layer, player.eternityBuyer.alwaysDilCond ? "dil" : "")
	player.old = tmp.ngp3 ? !QCs.inAny() : undefined
	player.dontWant = tmp.ngp3 || undefined
}

function doFluctuateResetStuff(layer = 6) {
	qu_save.time = 0
	qu_save.times = 0
	qu_save.best = 999999999
	qu_save.last10 = [[600*60*24*31, E(0)], [600*60*24*31, E(0)], [600*60*24*31, E(0)], [600*60*24*31, E(0)], [600*60*24*31, E(0)], [600*60*24*31, E(0)], [600*60*24*31, E(0)], [600*60*24*31, E(0)], [600*60*24*31, E(0)], [600*60*24*31, E(0)]]

	player.timestudy.theorem = 0

	player.dilation.tachyonParticles = E(0)
	player.dilation.totalTachyonParticles = E(0)
	player.dilation.bestTP = E(0)

	quantumWorth = E(0)
	qu_save.quarks = E(0)
	qu_save.usedQuarks = {
		r: E(0),
		g: E(0),
		b: E(0),
	}
	qu_save.colorPowers = {
		r: E(0),
		g: E(0),
		b: E(0),
	}

	qu_save.bestEnergy = E(0)
	qu_save.quarkEnergy = E(0)

	qu_save.gluons = {
		rg: E(0),
		gb: E(0),
		br: E(0),
	}
	if (!qMs.isObtained(27)) qu_save.entLvl = 0

	if (!qMs.isObtained(29)) str.reset()
	if (!qMs.isObtained(28)) PCs.reset()
	QCs.reset(!qMs.isObtained(27))
	if (!qMs.isObtained(28)) pos.reset()

	fluc_save.bestAM = E(0)
	fluc_save.time = 0
	FDs_save.meta = E(0)
	for (var i = 1; i <= 8; i++) FDs_save[i].amt = E(FDs_save[i].bgt)

	updateQEGainTmp()
	qMs.update()
	doQuantumResetStuff(layer)
}

//FUNCTIONS
function resetDimensions() {
	resetNormalDimensions()
	if (inNGM(5)) resetInfDimensions()
	resetTDsOnNGM4()

	reduceDimCosts()
}

function NC10NDCostsOnReset() {
	if (inNC(10) || player.currentChallenge == "postc1") {
		player.thirdCost = E(100)
		player.fourthCost = E(500)
		player.fifthCost = E(2500)
		player.sixthCost = E(2e4)
		player.seventhCost = E(2e5)
		player.eightCost = E(4e6)
	}
}

function checkOnCrunchAchievements(){
	if (player.thisInfinityTime <= 72000) giveAchievement("That's fast!");
	if (player.thisInfinityTime <= 6000) giveAchievement("That's faster!")
	if (player.thisInfinityTime <= 600) giveAchievement("Forever isn't that long")
	if (player.thisInfinityTime <= 2) giveAchievement("Blink of an eye")
	if (player.eightAmount == 0) giveAchievement("You didn't need it anyway");
	if (player.galaxies == 1) giveAchievement("Claustrophobic");
	if (player.galaxies == 0 && player.resets == 0) giveAchievement("Zero Deaths")
	if (inNC(2) && player.thisInfinityTime <= 1800) giveAchievement("Many Deaths")
	if (inNC(11) && player.thisInfinityTime <= 1800) giveAchievement("Gift from the Gods")
	if (inNC(5) && player.thisInfinityTime <= 1800) giveAchievement("Is this hell?")
	if (inNC(3) && player.thisInfinityTime <= 100) giveAchievement("You did this again just for the achievement right?");
	if (player.firstAmount == 1 && player.resets == 0 && player.galaxies == 0 && inNC(12)) giveAchievement("ERROR 909: Dimension not found")
	if (gainedInfinityPoints().gte(1e150)) giveAchievement("All your IP are belong to us")
	if (gainedInfinityPoints().gte(1e200) && player.thisInfinityTime <= 20) giveAchievement("Ludicrous Speed")
	if (gainedInfinityPoints().gte(1e250) && player.thisInfinityTime <= 200) giveAchievement("I brake for nobody")
}

function checkSecondSetOnCrunchAchievements(){
	checkForEndMe()
	giveAchievement("To infinity!");
	if (player.infinitied >= 10) giveAchievement("That's a lot of infinites");
	if (player.infinitied >= 1 && !player.challenges.includes("challenge1")) player.challenges.push("challenge1");
	if (player.bestInfinityTime <= 0.01) giveAchievement("Less than or equal to 0.001");
	if (player.challenges.length >= 2) giveAchievement("Daredevil")
	if (player.challenges.length >= getTotalNormalChallenges() + 1) giveAchievement("AntiChallenged")
	if (player.challenges.length >= getTotalNormalChallenges() + order.length + 1) giveAchievement("Anti-antichallenged")
}

function doNormalChallengeResetStuff() {
	doCrunchResetStuff()
}

function resetInfDimensions(full) {
	player.infinityPower = E(1)
	for (var t = 1; t < 9; t++) {
		let dim = player["infinityDimension" + t]
		if (full) {
			dim.cost = E(infBaseCost[t])
			dim.power = E(1)
			dim.bought = 0
			dim.baseAmount = 0
		} else d.power = Decimal.pow(getInfBuy10Mult(t), d.baseAmount)
		if (player.pSac !== undefined) {
			dim.costAM = E(idBaseCosts[t])
			dim.boughtAM = 0	
		}
		if (player.infDimensionsUnlocked[t - 1]) dim.amount = E(dim.baseAmount)
	}
	if (full) {
		player.infDimensionsUnlocked = resetInfDimUnlocked()
		if (tmp.ngC) {
			ngC.resetIDs()
			ngC.resetRepl()
		}
	}
}

function resetTimeDimensions(full) {
	let boostPower = getDimensionBoostPower()
	let ngm4 = tmp.ngmX >= 4
	player.timeShards = E(0)
	player.tickThreshold = E(ngm4 ? 0.01 : 1)
	player.totalTickGained = 0
	for (var t = 1; t <= 8; t++) {
		let dim = player["timeDimension" + t]
		if (full || ngm4) {
			dim.cost = TIME_DIM_COSTS[t].cost()
			dim.power = ngm4 ? Decimal.pow(boostPower, player.tdBoosts - t + 1) : E(1)
			dim.bought = 0
		}
		dim.amount = E(dim.bought)
	}
	el("totaltickgained").textContent = "You've gained " + getFullExpansion(player.totalTickGained) + " tickspeed upgrades."
}

function resetEternityChallenges(bigRip, ngpp) {
	let ecUpTo = ngpp ? 12 : 14
	let data = {}

	let kept = ngpp || qMs.tmp.amt >= 2
	if (kept) for (let ec = 1; ec <= ecUpTo; ec++) data['eterc' + ec] = player.eternityChalls['eterc' + ec]
	player.eternityChalls = data


	resetEternityChallUnlocks()
	updateEternityChallenges()
}

function doMetaDimensionsReset(bigRip, headstart, isQC) {
	player.meta.antimatter = getMetaAntimatterStart(bigRip)
	if (!headstart) player.meta.bestAntimatter = false ? Decimal.max(player.meta.antimatter, player.meta.bestOverQuantums) : player.meta.antimatter
	player.meta.resets = qMs.tmp.amt >= 14 ? 4 : 0
	clearMetaDimensions()
}

function resetMasteryStudies() {
	if (!qMs.isOn(10)) mTs.respec(false, true)
}

//Old
function getBigRipOnGhostifyData(nBRU){
	var bm = player.ghostify.milestones
	return {
		active: false,
		conf: qu_save.bigRip.conf,
		times: 0,	
		bestThisRun: E(0),
		totalAntimatter: qu_save.bigRip.totalAntimatter,
		bestGals: qu_save.bigRip.bestGals,
		savedAutobuyersNoBR: qu_save.bigRip.savedAutobuyersNoBR,
		savedAutobuyersBR: qu_save.bigRip.savedAutobuyersBR,
		spaceShards: E(hasAch("ng3p105") ? 1e25 : 0),
		upgrades: bm ? nBRU : []
	}
}

function getBreakEternityDataOnGhostify(nBEU, bm){
	return {
		unlocked: bm > 14,
		break: bm > 14 ? qu_save.breakEternity.break : false,
		eternalMatter: E(hasAch("ng3p105") ? 1e25 : 0),
		upgrades: bm > 14 ? nBEU : [],
		epMultPower: 0
	}
}

function getQuantumOnGhostifyData(bm, nBRU, nBEU){
	return {
		reached: true,
		times: 0,
		time: 0,
		best: 9999999999,
		last10: [[600*60*24*31, E(0)], [600*60*24*31, E(0)], [600*60*24*31, E(0)], [600*60*24*31, E(0)], [600*60*24*31, E(0)], [600*60*24*31, E(0)], [600*60*24*31, E(0)], [600*60*24*31, E(0)], [600*60*24*31, E(0)], [600*60*24*31, E(0)]],
		disabledRewards: qu_save.disabledRewards,
		metaAutobuyerWait: 0,
		autobuyer: {
			enabled: false,
			limit: E(0),
			mode: "amount",
			peakTime: 0
		},
		autoOptions: {
			assignQK: qu_save.autoOptions.assignQK,
			assignQKRotate: qu_save.autoOptions.assignQKRotate,
			sacrifice: bm ? qu_save.autoOptions.sacrifice : false,
			replicantiReset: qu_save.autoOptions.replicantiReset
		},
		assortPercentage: qu_save.assortPercentage,
		assignAllRatios: qu_save.assignAllRatios,
		quarks: E(0),
		usedQuarks: {
			r: E(0),
			g: E(0),
			b: E(0)
		},
		colorPowers: {
			r: 0,
			g: 0,
			b: 0
		},
		gluons: {
			rg: E(0),
			gb: E(0),
			br: E(0)
		},
		pos: pos.setup(),
		qc: QCs.setup(),
		multPower: {
			rg: 0,
			gb: 0,
			br: 0,
			total: 0
		},
		reachedInfQK: bm,
		bigRip: getBigRipOnGhostifyData(nBRU),
		breakEternity: getBreakEternityDataOnGhostify(nBEU, bm),
		notrelative: true,
		wasted: true,
		producedGluons: 0,
		realGluons: 0,
		bosons: {
			'w+': 0,
			'w-': 0,
			'z0': 0
		},
		neutronstar: {
			quarks: 0,
			metaAntimatter: 0,
			dilatedTime: 0
		},
		rebuyables: {
			1: 0,
			2: 0
		},
		upgrades: bm > 1 ? qu_save.upgrades : [],
		rg4: false
	}
}

function doGhostifyResetStuff(implode, gain, amount, force, bulk, nBRU, nBEU){
	var bm = player.ghostify.milestones
	player.galacticSacrifice = resetGalacticSacrifice()
	resetNormalDimensions()
	player.tickBoughtThisInf = resetTickBoughtThisInf()
	player.totalBoughtDims = resetTotalBought()
	player.sacrificed = E(0)
	player.currentChallenge = ""
	player.setsUnlocked = 0
	player.infinitied = 0
	player.infinitiedBank = 0
	player.bestInfinityTime = 9999999999
	player.thisInfinityTime = 0
	player.resets = 0
	player.tdBoosts = resetTDBoosts()
	if (inNGM(3)) player.tickspeedBoosts = 16
	player.galaxies = 0
	player.interval = null
	player.partInfinityPoint = 0
	player.partInfinitied = 0
	player.costMultipliers = [E(1e3), E(1e4), E(1e5), E(1e6), E(1e8), E(1e10), E(1e12), E(1e15)]
	player.chall2Pow = 1
	player.chall3Pow = E(0.01)
	player.matter = E(0)
	player.chall11Pow = E(1)
	player.lastTenRuns = [[600*60*24*31, E(0)], [600*60*24*31, E(0)], [600*60*24*31, E(0)], [600*60*24*31, E(0)], [600*60*24*31, E(0)], [600*60*24*31, E(0)], [600*60*24*31, E(0)], [600*60*24*31, E(0)], [600*60*24*31, E(0)], [600*60*24*31, E(0)]]
	player.lastTenEternities = [[600*60*24*31, E(0)], [600*60*24*31, E(0)], [600*60*24*31, E(0)], [600*60*24*31, E(0)], [600*60*24*31, E(0)], [600*60*24*31, E(0)], [600*60*24*31, E(0)], [600*60*24*31, E(0)], [600*60*24*31, E(0)], [600*60*24*31, E(0)]]
	player.infMult = E(1)
	player.infMultCost = E(10)
	player.tickSpeedMultDecrease = Math.max(player.tickSpeedMultDecrease, bm > 1 ? 1.25 : 2)
	player.postC4Tier = 1
	player.postC8Mult = E(1)
	player.overXGalaxiesTickspeedBoost = player.tickspeedBoosts == undefined ? player.overXGalaxiesTickspeedBoost : 0
	player.postChallUnlocked = hasAch("r133") ? order.length : 0
	player.postC4Tier = 0
	player.postC3Reward = E(1)
	player.eternityPoints = E(0)
	player.eternities = bm ? 1e13 : 1e10
	player.thisEternity = 0
	player.bestEternity = 9999999999
	player.eternityUpgrades = bm ? [1, 2, 3, 4, 5, 6] : []
	player.epmult = E(1)
	player.epmultCost = E(500)
	resetInfDimensions(true)
	resetTimeDimensions(true)
	player.infDimBuyers = bm ? player.infDimBuyers : [false, false, false, false, false, false, false, false]
	player.challengeTarget = 0
	player.replicanti = {
		amount: E(bm ? 1 : 0),
		unl: bm > 0,
		chance: 0.01,
		chanceCost: E(inNGM(2) ? 1e90 : 1e150),
		interval: 1000,
		intervalCost: E(inNGM(2) ? 1e80 : 1e140),
		gal: 0,
		galaxies: 0,
		galCost: E(inNGM(2) ? 1e110 : 1e170),
		galaxybuyer: player.replicanti.galaxybuyer,
		auto: bm ? player.replicanti.auto : [false, false, false]
	}
	player.timestudy = bm ? player.timestudy : {
		theorem: 0,
		amcost: E("1e20000"),
		ipcost: E(1),
		epcost: E(1),
		studies: [],
	}
	player.currentEternityChall = ""
	player.etercreq = 0
	player.autoIP = E(0)
	player.autoTime = 1e300
	player.infMultBuyer = bm ? player.infMultBuyer : false
	player.autoEterMode = bm ? player.autoEterMode : "amount"
	player.peakSpent = 0
	player.respec = false
	player.respecMastery = false
	player.eternityBuyer = bm ? player.eternityBuyer : {
		limit: E(0),
		isOn: false,
		dilationMode: false,
		dilationPerAmount: player.eternityBuyer.dilationPerAmount,
		dilMode: player.eternityBuyer.dilMode,
		tpUpgraded: player.eternityBuyer.tpUpgraded,
		slowStop: player.eternityBuyer.slowStop,
		slowStopped: player.eternityBuyer.slowStopped,
		ifAD: player.eternityBuyer.ifAD,
		presets: player.eternityBuyer.presets
	}
	player.eterc8ids = 50
	player.eterc8repl = 40
	player.dimlife = true
	player.dead = true
	player.dilation = {
		studies: bm ? player.dilation.studies : [],
		active: false,
		times: 0,
		tachyonParticles: E(0),
		dilatedTime: E(0),
		bestTP: E(0),
		nextThreshold: E(1000),
		freeGalaxies: 0,
		upgrades: bm ? player.dilation.upgrades : [],
		autoUpgrades: bm ? player.dilation.autoUpgrades : aarMod.nguspV ? [] : undefined,
		rebuyables: {
			1: 0,
			2: 0,
			3: bm ? player.dilation.rebuyables[3] : 0,
			4: bm ? player.dilation.rebuyables[4] : 0,
		}
	}
	resetNGUdData()
	qu_save = getQuantumOnGhostifyData(bm, nBRU, nBEU)
	player.old = false
	player.dontWant = true
	player.unstableThisGhostify = 0
}

function doPreInfinityGhostifyResetStuff(implode){
	setInitialMoney()
	setInitialResetPower()
	GPminpeak = E(0)
	if (implode) showTab("dimensions")
	el("tickSpeed").style.visibility = "hidden"
	el("tickSpeedMax").style.visibility = "hidden"
	el("tickLabel").style.visibility = "hidden"
	el("tickSpeedAmount").style.visibility = "hidden"
	hideDimensions()
	tmp.tickUpdate = true
}

function doInfinityGhostifyResetStuff(implode, bm){
	if (hasAch("r85")) player.infMult = player.infMult.times(4)
	if (hasAch("r93")) player.infMult = player.infMult.times(4)
	player.infinityPoints = E(hasAch("r104") ? 2e25 : 0)
	player.challenges = challengesCompletedOnEternity()
	IPminpeak = E(0)
	if (isEmptiness) {
		showTab("dimensions")
		isEmptiness = false
		el("quantumtabbtn").style.display = "inline-block"
		el("ghostifytabbtn").style.display = "inline-block"
	}
	el("infinityPoints1").innerHTML = "You have <span class=\"IPAmount1\">" + shortenDimensions(player.infinityPoints) + "</span> Infinity points."
	el("infinityPoints2").innerHTML = "You have <span class=\"IPAmount2\">" + shortenDimensions(player.infinityPoints) + "</span> Infinity points."
	el("infmultbuyer").textContent = "Max buy IP mult"
	if (implode) showChallengesTab("normalchallenges")
	updateChallenges()
	updateNCVisuals()
	updateAutobuyers()
	hideMaxIDButton()
	doInitInfMultStuff()
	updateLastTenRuns()
	if ((el("metadimensions").style.display == "block" && !bm) || implode) showDimTab("antimatterdimensions")
	resetInfDimensions(true)
}

function doTOUSOnGhostify(bm){
	if (hasAch("ng3p77")) { // theory of ultimate studies
		player.timestudy.studies=[]
		player.masterystudies=[]
		for (var t = 0; t < all.length; t++) player.timestudy.studies.push(all[t])
		for (var c = 1; c <= mTs.ecsUpTo; c++) player.eternityChalls["eterc" + c] = 5
		for (var t = 0; t < mTs.timeStudies.length; t++) player.masterystudies.push("t" + mTs.timeStudies[t])
		for (var d = 1; d < 7; d++) player.dilation.studies.push(d)
		for (var d = 7; d < 15; d++) player.masterystudies.push("d" + d)
		if (bm < 2) {
			player.dimensionMultDecrease = 2
			player.tickSpeedMultDecrease = 1.65
		} else {
			player.dimensionMultDecrease = 3 - parseFloat((ECComps("eterc6") * 0.2).toFixed(2))
			player.tickSpeedMultDecrease = 2 - parseFloat((ECComps("eterc11") * 0.07).toFixed(2))
		}
	}
}

function doEternityGhostifyResetStuff(implode, bm){
	EPminpeakType = 'normal'
	EPminpeak = E(0)
	doTOUSOnGhostify(bm) // theory of ultimate studies
	if (!bm) {
		resetEternityChallenges()
		resetMasteryStudies()
	}
	player.dilation.bestTP = player.dilation.tachyonParticles
	player.dilation.totalTachyonParticles = player.dilation.bestTP
	player.meta.bestOverQuantums = getMetaAntimatterStart()
	doMetaDimensionsReset()
	el("eternitybtn").style.display = "none"
	el("eternityPoints2").innerHTML = "You have <span class=\"EPAmount2\">"+shortenDimensions(player.eternityPoints)+"</span> Eternity point"+((player.eternityPoints.eq(1)) ? "." : "s.")
	if (implode) showEternityTab("timestudies", el("eternitystore").style.display == "none")
	updateLastTenEternities()
	resetTimeDimensions(true)
	updateRespecButtons()
	updateMilestones()
	updateEternityUpgrades()
	updateTheoremButtons()
	updateTimeStudyButtons()
	if (!bm) updateAutoEterMode()
	updateDilationUpgradeCosts()

	updateMasteryStudyBoughts()
	updateMasteryStudyCosts()
	updateMasteryStudyButtons()
}

function doQuantumGhostifyResetStuff(implode, bm){
	qu_save.quarkEnergy = E(0)
	tmp.eds = qu_save.emperorDimensions
	QKminpeak = E(0)
	QKminpeakValue = E(0)
	if (implode) showQuantumTab("uquarks")
	var permUnlocks = [7,9,10,10,11,11,12,12]
	if (bm > 3) {
		for (var c = 0; c < 3; c++) qu_save.tod[colors[c]].upgrades[1] = 5
	}
	if (!bm) {
		el('rebuyupgauto').style.display = "none"
		el('toggleallmetadims').style.display = "none"
		el('metaboostauto').style.display = "none"
		el("autoBuyerQuantum").style.display = "none"
		el('toggleautoquantummode').style.display = "none"
	}

	el("quantumbtn").style.display = "none"
	updateColorCharge()
	updateGluonsTabOnUpdate("prestige")
	updateQuantumWorth("quick")
	QCs.updateTmp()
	QCs.updateDisp()
}

function doGhostifyGhostifyResetStuff(bm, force){
	GHPminpeak = E(0)
	GHPminpeakValue = E(0)
	el("ghostifybtn").style.display = "none"
	if (!ghostified) {
		ghostified = true
		el("ghostifytabbtn").style.display = "inline-block"
		el("ghostparticles").style.display = ""
		el("ghostifyAnimBtn").style.display = "inline-block"
		el("ghostifyConfirmBtn").style.display = "inline-block"
		giveAchievement("Kee-hee-hee!")
	} else if (player.ghostify.times > 2 && player.ghostify.times < 11) {
		$.notify("You unlocked " + (player.ghostify.times + 2) + "th Neutrino upgrade!", "success")
		updateNeutrinoUpgradeUnlock(player.ghostify.times + 2)
	}
	el("GHPAmount").textContent = shortenDimensions(player.ghostify.ghostParticles)
	if (bm < 7) {
		player.ghostify.neutrinos.electron = E(0)
		player.ghostify.neutrinos.mu = E(0)
		player.ghostify.neutrinos.tau = E(0)
		player.ghostify.neutrinos.generationGain = 1
	} else if (!force) player.ghostify.neutrinos.generationGain = player.ghostify.neutrinos.generationGain % 3 + 1
	player.ghostify.ghostlyPhotons.amount = E(0)
	player.ghostify.ghostlyPhotons.darkMatter = E(0)
	player.ghostify.ghostlyPhotons.ghostlyRays = E(0)
	tmp.bl.watt = 0
	player.ghostify.under = true
	updateLastTenGhostifies()
	updateBraveMilestones()
	player.ghostify.another = 10
	player.ghostify.reference = 10
}

