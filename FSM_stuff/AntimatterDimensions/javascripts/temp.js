let tmp = {
	nrm: E(1),
	rm: E(1),
	extraRG: 0,
	it: 1,
	rg4: false,
	pct: "",
	ns: 1,
	bru: {},
	be: false,
	beu: {},
	bm: [200,175,150,100,50,40,30,25,20,15,10,5,4,3,2,1],
	nu: {},
	nuc: [null,1e6,1e7,1e8,2e8,5e8,2e9,5e9,75e8,1e10,7e12,1e18,1e55,1e125,1e160,1e280,"1e9001","1e18002","1e27003"],
	lt: [12800,16e4,48e4,16e5,6e6,5e7,24e7,125e7],
	lti: [2,4,1.5,10,4,1e3,2.5,3],
	effL: [0,0,0,0,0,0,0],
	ls: [0,0,0,0,0,0,0],
	le: [0,0,0,0,0,0,0],
	leBonus: {}
}

function updateTmp(init) {
	if (typeof player != "undefined") {
		if (player.money) tmp.ri = player.money.gte(getLimit()) && ((player.currentChallenge != "" && player.money.gte(player.challengeTarget)) || !onPostBreak())
		else tmp.ri = false
	} else {
		tmp.ri = false
		return
	}

	if (init) {
		tmp.extraRG = 0
		colorBoosts.r = 1
		colorBoosts.g = 1
		colorBoosts.b = 1
	}

	tmp.nrm = 1
	if (hasTimeStudy(101)) tmp.nrm = (tmp.rmPseudo || getReplBaseEff()).max(1)

	updateGhostifyTempStuff()
	updateNGP3TempStuff(init)

	tmp.sacPow = calcTotalSacrificeBoost()

	if (player.meta !== undefined) {
		//Update global multiplier of all Meta Dimensions
		tmp.mdGlobalMult = getMDGlobalMult()
	}
	tmp.mptb = getMPTBase()
	tmp.mpte = getMPTExp()

	updateInfiniteTimeTemp()
	if (hasBosonicUpg(41)) {
		tmp.blu[41] = bu.effects[41]()
		tmp.it = tmp.it.times(tmp.blu[41].it)
	}

	if (tmp.ngC) ngC.updateTmp()

	tmp.rm = getReplMult()
	tmp.rmPseudo = getReplBaseEff().max(hasMTS(303) ? tmp.rm.pow(1 / 0.032) : 1)

	updateExtraReplMult()
	updateExtraReplBase()
	tmp.extraRG = Math.floor(extraReplBase * extraReplMulti)

	tmp.ts = {}
	if (!isTickDisabled()) {
		tmp.ts.pre1 = getTickspeedBeforeSoftcap()
		tmp.ts.pre2 = getTickspeedBeforePostMults()
		tmp.ts.faster = getFasterTickspeed()
	}

	tmp.tsReduce = getTickspeedMultiplier()

	updateMatterSpeed()
	updateInfinityPowerEffects()
	if (player.replicanti.unl) updateReplicantiTemp()

	tmp.inEC12 = isEC12Active()
	tmp.ec12Mult = tmp.inEC12 ? getEC12Mult() / getPDAcceleration() : 1

	let totalSpeed = gameSpeed * ls.mult("game")
	if (tmp.gameSpeed != totalSpeed) {
		tmp.gameSpeed = totalSpeed
		tmp.tickUpdate = true
	}
	dev.boosts.update()
}

function updateRedLightBoostTemp(){
	tmp.le[0] = 1
}

function updateOrangeLightBoostTemp() {
	tmp.le[1] = 1
}

function updateYellowLightBoostTemp(){
	tmp.le[2] = 1
}

function updateGreenLightBoostTemp(){
	tmp.le[3] = 1
}

function updateBlueLightBoostTemp(){
	tmp.le[4] = 1
}

function updateIndigoLightBoostTemp(){
	let log = tmp.effL[5]
	log *= tmp.ngp3_exp ? 20 : 10

	if (log > 250) log = Math.sqrt(log + 375) * 10
	if (log > 729) log = Math.pow(log * 27, 2 / 3)

	tmp.le[5] = Decimal.pow(10, log)
}

function updateVioletLightBoostTemp(){
	tmp.le[6] = 1
}

function updateEffectiveLightAmountsTemp(){
	let leBonus5Unl = isLEBoostUnlocked(5)
	for (var c = 7; c >= 0; c--) {
		var x = player.ghostify.ghostlyPhotons.lights[c]
		var y = tmp.leBoost
		if ((c == 6 && !isLEBoostUnlocked(4)) || c == 7) y += 1
		else if (leBonus5Unl) y += Math.pow(tmp.effL[c + 1] * tmp.leBonus[5].mult + 1, tmp.leBonus[5].exp)
		else y += Math.sqrt(tmp.effL[c + 1] + 1)
		tmp.ls[c] = y
		if (c == 0) {
			tmp.effL[0] = {
				normal: x * y, // Without best red Light
				best: (player.ghostify.ghostlyPhotons.maxRed + x * 2) / 3 * y 
				//With best red Light
			}
		} else tmp.effL[c] = x * y
	}
	tmp.leBonus[4] = tmp.ls[6]
}

function updateFixedLightTemp() {
	if (isLEBoostUnlocked(5)) tmp.leBonus[5] = leBoosts[5].eff()
	updateLightEmpowermentReq()
	updateEffectiveLightAmountsTemp()
	updateRedLightBoostTemp()
	updateOrangeLightBoostTemp()
	updateYellowLightBoostTemp()
	updateGreenLightBoostTemp()
	updateBlueLightBoostTemp()
	updateVioletLightBoostTemp()
	for (var b = 1; b <= leBoosts.max; b++) {
		if (!isLEBoostUnlocked(b)) break
		if (b != 4 && b != 5) tmp.leBonus[b] = leBoosts[b].eff()
	}
}

function updateTS431ExtraGalTemp() {
	tmp.eg431 = 0
	if (isLEBoostUnlocked(1)) {
		tmp.leBonus[1].total = (colorBoosts.g - 1) * tmp.leBonus[1].effect
		tmp.eg431 += tmp.leBonus[1].total
	}
}

function updateMatterSpeed(){
	//mv: Matter speed
	tmp.mv = 1.03 + player.resets / 200 + player.galaxies / 100
	if (inNGM(4)) tmp.mv += player.money.log10() / 1000
}

function updatePPTITemp() {
	if (!player.ghostify.ghostlyPhotons.unl) {
		tmp.ppti = 1
		return
	}
	let x = 1
	x /= tmp.le[1] || 1
	tmp.ppti = x
}

function updateNGP3TempStuff(init) {
	if (pH.did("fluctuate")) fluc.updateTmpOnTick()
	if (tmp.quActive) {
		if (qu_save.breakEternity.unlocked) updateBreakEternityUpgradesTemp()
		if (player.masterystudies.includes("d14")) updateBigRipUpgradesTemp()
		if (tmp.nrm !== 1 && inBigRip()) {
			if (!player.dilation.active && qu_save.bigRip.upgrades.includes(14)) tmp.nrm = tmp.nrm.pow(tmp.bru[14])
			if (tmp.nrm.log10() > 1e9) tmp.nrm = Decimal.pow(10, 1e9 * Math.pow(tmp.nrm.log10() / 1e9, 2/3))
		}
	}
	if (tmp.quActive || init) {
		//Quantum
		str.updateTmpOnTick() //Strings
		QCs.updateTmpOnTick() //Quantum Challenges
		pos.updateTmpOnTick() //Positrons
		updateQEGainTmp() //Quantum Energy + Quantum efficiency
		updateGluonicBoosts() //Entangled + Positronic Boosts
		updateColorPowers() //Color Powers

		updateQuarkEnergyEffects()
	}
	if (mTs.unl() || init) {
		mTs.updateTmp()
	}
	tmp.be = tmp.quActive && inBigRip() && qu_save.breakEternity.break
}

function updateGhostifyTempStuff() {
	updateBosonicLabTemp()
	if (tmp.quActive) updatePPTITemp() //preon power threshold increase
	if (pH.did("ghostify") && player.ghostify.ghostlyPhotons.unl) {
		tmp.phF = getPhotonicFlow()

		var x = getLightEmpowermentBoost()
		var y = hasBosonicUpg(32)
		if (tmp.leBoost !== x || tmp.hasBU32 !== y || tmp.updateLights) {
			tmp.leBoost = x
			tmp.hasBU32 = y
			tmp.updateLights = false
			updateFixedLightTemp()
		}
		updateIndigoLightBoostTemp()
		updateVioletLightBoostTemp()
		updatePhotonsUnlockedBRUpgrades()
	}
	updateNeutrinoBoostsTemp()
	updateNeutrinoUpgradesTemp()
}

function updateNeutrinoBoostsTemp() {
	tmp.nb = {}
	if (!pH.did("ghostify")) return

	var nt = []
	var exp = 1
	for (var g = 0; g < 3; g++) nt[g] = player.ghostify.neutrinos[(["electron","mu","tau"])[g]].pow(exp)
	for (var nb = 1; nb <= player.ghostify.neutrinos.boosts; nb++) tmp.nb[nb] = neutrinoBoosts[nb].eff(nt)
}

function updateNeutrinoUpgradesTemp() {
	tmp.nu = {}
	if (!pH.did("ghostify")) return

	for (var nu = 1; nu <= neutrinoUpgrades.max; nu++) if (neutrinoUpgrades[nu] !== undefined) tmp.nu[nu] = neutrinoUpgrades[nu].eff()
}

function updateBreakEternityUpgrade1Temp(){
	let ep = player.eternityPoints
	let em = qu_save.breakEternity.eternalMatter
	let log1 = ep.div("1e1280").add(1).log10()
	let log2 = em.times(10).max(1).log10()
	tmp.beu[1] = Decimal.pow(10, Math.pow(log1, 1/3) * 0.5 + Math.pow(log2, 1/3)).max(1)
}

function updateBreakEternityUpgrade2Temp(){
	let ep = player.eternityPoints
	let log = ep.div("1e1290").add(1).log10()
	tmp.beu[2] = Math.pow(Math.log10(log + 1) * 1.6 + 1, player.currentEternityChall == "eterc10" ? 1 : 2)
}

function updateBreakEternityUpgrade3Temp(){
	let ep = player.eternityPoints
	let nerfUpgs = !tmp.be && hasBosonicUpg(24)
	let log = ep.div("1e1370").add(1).log10()
	if (nerfUpgs) log /= 2e6
	let exp = Math.pow(log, 1/3) * 0.5
	tmp.beu[3] = Decimal.pow(10, exp)
}

function updateBreakEternityUpgrade4Temp(){
	let ep = player.eternityPoints
	let ss = qu_save.bigRip.spaceShards
	let log1 = ep.div("1e1860").add(1).log10()
	let log2 = ss.div("7e19").add(1).log10()
	let exp = Math.pow(log1, 1/3) + Math.pow(log2, 1/3) * 8
	if (exp > 333) exp = 111 * Math.log10(3 * exp + 1)
	tmp.beu[4] = Decimal.pow(10, exp)
}

function updateBreakEternityUpgrade5Temp(){
	let ep = player.eternityPoints
	let ts = player.timeShards
	let log1 = ep.div("1e2230").add(1).log10()
	let log2 = ts.div(1e90).add(1).log10()
	let exp = Math.pow(log1, 1/3) + Math.pow(log2, 1/3)
	if (aarMod.ngudpV && exp > 100) exp = Math.log10(exp) * 50
	if (exp > 999) exp = 333 * Math.log10(exp + 1)
	exp *= 4
	tmp.beu[5] = Decimal.pow(10, exp)
}

function updateBreakEternityUpgrade6Temp(){
	let ep = player.eternityPoints
	let em = qu_save.breakEternity.eternalMatter
	let nerfUpgs = !tmp.be && hasBosonicUpg(24)
	let hasU12 = qu_save.breakEternity.upgrades.includes(13)

	let log1 = ep.div("1e4900").add(1).log10()
	let log2 = em.div(1e45).add(1).log10()
	if (nerfUpgs) log1 /= 2e6

	let exp = Math.pow(log1, 1/3) / 1.7
	if (!hasU12) exp += Math.pow(log2, 1/3) * 2
	if (exp > 200) exp = 50 * Math.log10(50 * exp)
	if (hasU12) exp += Math.pow(log2, 0.8)

	tmp.beu[6] = Decimal.pow(10, exp)
}

function updateBreakEternityUpgrade8Temp(){
	let x = Math.log10(player.dilation.tachyonParticles.div(1e200).add(1).log10() / 100 + 1) * 3 + 1
	if (aarMod.ngudpV && x > 2.2) x = 1.2 + Math.log10(x + 7.8)
	if (x > 3) x = 1 + Math.log2(x + 1)
	if (x > 10/3) x = 7/3 + Math.log10(3 * x)
	tmp.beu[8] = x
}

function updateBreakEternityUpgrade9Temp(){
	let em = qu_save.breakEternity.eternalMatter
	let x = em.div("1e335").add(1).pow(0.05 * Math.log10(4))
	if (x.gte(Decimal.pow(10,18))) x = Decimal.pow(x.log10() * 5 + 10, 9)
	if (x.gte(Decimal.pow(10,100))) x = Decimal.pow(x.log10(), 50)
	tmp.beu[9] = x.toNumber()
}

function updateBreakEternityUpgrade10Temp() {
	let ep = player.eternityPoints
	tmp.beu[10] = Math.max(Math.log10(ep.add(1).log10() + 1) - 1, 1)
}

function updateBreakEternityUpgrade12Temp() {
	let em = qu_save.breakEternity.eternalMatter
	let r = Math.sqrt(em.max(1).log10()) / 20
	tmp.beu[12] = Math.max(r, 1)
}

function updateBreakEternityUpgradesTemp() {
	//Setup
	updateBreakEternityUpgrade1Temp()
	updateBreakEternityUpgrade2Temp()
	updateBreakEternityUpgrade3Temp()
	updateBreakEternityUpgrade4Temp()
	updateBreakEternityUpgrade5Temp()
	updateBreakEternityUpgrade6Temp()

	//Upgrade 7: EP Mult
	tmp.beu[7] = Decimal.pow(1e9, qu_save.breakEternity.epMultPower)

	if (player.ghostify.ghostlyPhotons.unl) {
		updateBreakEternityUpgrade8Temp()
		updateBreakEternityUpgrade9Temp()
		updateBreakEternityUpgrade10Temp()
	}
	if (hasAch("ng3p101")) updateBreakEternityUpgrade12Temp()
}

function updateBRU1Temp() {
	tmp.bru[1] = E(1)
	if (!inBigRip()) return

	let exp = 1
	if (qu_save.bigRip.upgrades.includes(17)) exp = tmp.bru[17]
	if (ghostified && player.ghostify.neutrinos.boosts > 7) exp *= tmp.nb[8]
	exp *= player.infinityPoints.max(1).log10()
	tmp.bru[1] = Decimal.pow(10, exp) // BRU1
}

function updateBRU8Temp() {
	tmp.bru[8] = E(1)
	if (!inBigRip()) return

	tmp.bru[8] = Decimal.pow(2, getTotalRGs()) // BRU8
	if (!hasNU(11)) tmp.bru[8] = tmp.bru[8].min(Number.MAX_VALUE)
}

function updateBRU14Temp() {
	if (!inBigRip()) {
		tmp.bru[14] = 1
		return
	}
	let ret = Math.min(qu_save.bigRip.spaceShards.div(3e18).add(1).log10() / 3, 0.4)
	let val = Math.sqrt(qu_save.bigRip.spaceShards.div(3e15).add(1).log10() * ret + 1)
	if (val > 12) val = 10 + Math.log10(4 + 8 * val)
	tmp.bru[14] = val //BRU14
}

function updateBRU15Temp() {
	let r = Math.sqrt(player.eternityPoints.add(1).log10()) * 3.55
	if (r > 1e4) r = Math.sqrt(r * 1e4)
	if (!qu_save.bigRip.active) r = 0
	tmp.bru[15] = r
}

function updateBRU16Temp() {
	if (!inBigRip()) {
		tmp.bru[16] = E(1)
		return
	}
	tmp.bru[16] = player.dilation.dilatedTime.div(1e100).pow(0.155).max(1)
}

function updateBRU17Temp() {
	tmp.bru[17] = pH.did("ghostify") ? 3 : 2.9
}

function updateBigRipUpgradesTemp(){
	updateBRU17Temp()
	updateBRU1Temp()
	updateBRU8Temp()
	updateBRU14Temp()
	updateBRU15Temp()
	updateBRU16Temp()
}

function updatePhotonsUnlockedBRUpgrades(){
	if (!inBigRip()) {
		tmp.bru[18] = E(1)
		tmp.bru[19] = E(1)
		return
	}
	var bigRipUpg18base = 1 + qu_save.bigRip.spaceShards.div(1e140).add(1).log10()
	var bigRipUpg18exp = Math.max(qu_save.bigRip.spaceShards.div(1e140).add(1).log10() / 10, 1)
	if (bigRipUpg18base > 10 && tmp.ngp3_exp) bigRipUpg18base *= Math.log10(bigRipUpg18base)
	tmp.bru[18] = Decimal.pow(bigRipUpg18base, bigRipUpg18exp) // BRU18
	
	var bigRipUpg19exp = Math.sqrt(player.timeShards.add(1).log10()) / (tmp.ngp3_exp ? 60 : 80)
	tmp.bru[19] = Decimal.pow(10, bigRipUpg19exp) // BRU19
}

function updateBosonicAMDimReturnsTemp() {
	var data = {}
	tmp.badm = data

	if (!pH.did("ghostify")) return
	if (!player.ghostify.wzb.unl) return

	data.start = E(1e100)
	data.base = E(1e100)
	data.offset = 1 / Math.log(data.base) - 1
	data.offset2 = 1 - Math.log10(data.offset + 1) / Math.log10(data.base)
	data.postDim = player.ghostify.bl.am.div(data.start)
	data.preDim = Decimal.pow(data.base,  Decimal.log(100, data.postDim) - data.offset2).add(-data.offset).max(1)
}

function updateBosonicEnchantsTemp(){
	tmp.bEn = {lvl: {}}
	for (var g2 = 2; g2 <= br.limit; g2++) for (var g1 = 1; g1 < g2; g1++) {
		var id = g1 * 10 + g2
		tmp.bEn.lvl[id] = player.ghostify.bl.enchants[id] || E(0)
		if (bEn.effects[id] !== undefined) tmp.bEn[id] = getEnchantEffect(id)
	}
}

function updateBosonicUpgradesTemp(){
	tmp.blu = {}
	for (var r = bu.rows; r >= 1; r--) for (var c = 5; c >= 1; c--) {
		var id = r * 10 + c
		if (bu.effects[id] !== undefined) tmp.blu[id] = bu.effects[id]()
	}
}

function updateWZBosonsTemp(){
	var data = tmp.wzb
	var wpl = player.ghostify.wzb.wpb.add(1).log10()
	var wnl = player.ghostify.wzb.wnb.add(1).log10()

	var bosonsExp = Math.max(wpl * (player.ghostify.wzb.wpb.sub(player.ghostify.wzb.wnb.min(player.ghostify.wzb.wpb))).div(player.ghostify.wzb.wpb.max(1)).toNumber(), 0)
	//if (bosonsExp > 200) bosonsExp = 200 * Math.sqrt(bosonsExp / 200) 
	//softcap it to remove inflation in WZB

	let secBase = tmp.ngp3_exp ? 2 : 1
	data.wbt = Decimal.pow(3, bosonsExp).times(Decimal.pow(secBase, Math.sqrt(bosonsExp))) 
	//W Bosons boost to extract time
	data.wbo = Decimal.pow(10, bosonsExp).times(Decimal.pow(secBase, Math.sqrt(bosonsExp))) 
	//W Bosons boost to Z Neutrino oscillation requirement
	let div1 = tmp.ngp3_exp ? 2 : 100
	data.wbp = player.ghostify.wzb.wpb.add(player.ghostify.wzb.wnb).div(div1).max(1).pow(1 / 3).sub(1) 
	//W Bosons boost to Bosonic Antimatter production

	let zLog = player.ghostify.wzb.zb.div(10).add(1).log10()
	let zLogMult = 0.5
	if (isEnchantUsed(25)) zLogMult = tmp.bEn[25]

	data.zbs = Decimal.pow(10, zLog * zLogMult) //Z Bosons boost to W Quark
}

//"Powers" tmp (100ms)
var updatePowerInt
function updatePowers() {
	totalMult = tmp.postinfi11
	currentMult = tmp.postinfi21
	infinitiedMult = getInfinitiedMult()
	achievementMult = getAchievementMult()
	unspentBonus = getUnspentBonus()

	if (player.boughtDims) mult18 = getDimensionFinalMultiplier(1).max(1).times(getDimensionFinalMultiplier(8).max(1)).pow(0.02)
	else mult18 = getDimensionFinalMultiplier(1).times(getDimensionFinalMultiplier(8)).pow(0.02)

	if (player.currentEternityChall == "eterc10") {
		ec10bonus = Decimal.pow(getInfBoostInput(), 1e3).max(1)
	} else {
		ec10bonus = E(1)
	}

	tmp.mptb = getMPTBase()
	tmp.mpte = getMPTExp()

	updatePostInfiTemp()
}

function resetPowers() {
	clearInterval(updatePowerInt)
	updatePowers()
	mult18 = 1
	updatePowerInt = setInterval(updatePowers, 100)
}

function resetUP() {
	updateTmp(true)
	resetPowers()
}