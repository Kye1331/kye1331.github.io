function cantHoldInfinitiesCheck(){
	if (getDimensionFinalMultiplier(1).gte(E("1e308")) &&
	getDimensionFinalMultiplier(2).gte(E("1e308")) &&
	getDimensionFinalMultiplier(3).gte(E("1e308")) &&
	getDimensionFinalMultiplier(4).gte(E("1e308")) &&
	getDimensionFinalMultiplier(5).gte(E("1e308")) &&
	getDimensionFinalMultiplier(6).gte(E("1e308")) &&
	getDimensionFinalMultiplier(7).gte(E("1e308")) &&
	getDimensionFinalMultiplier(8).gte(E("1e308"))) giveAchievement("Can't hold all these infinities")
}

function antitablesHaveTurnedCheck(){
	if (getDimensionFinalMultiplier(1).lt(getDimensionFinalMultiplier(2)) &&
	getDimensionFinalMultiplier(2).lt(getDimensionFinalMultiplier(3)) &&
	getDimensionFinalMultiplier(3).lt(getDimensionFinalMultiplier(4)) &&
	getDimensionFinalMultiplier(4).lt(getDimensionFinalMultiplier(5)) &&
	getDimensionFinalMultiplier(5).lt(getDimensionFinalMultiplier(6)) &&
	getDimensionFinalMultiplier(6).lt(getDimensionFinalMultiplier(7)) &&
	getDimensionFinalMultiplier(7).lt(getDimensionFinalMultiplier(8))) giveAchievement("How the antitables have turned")
}

function bendTimeCheck(){
	if (tmp.tsReduce < 0.001) giveAchievement("Do you even bend time bro?")
}

function getOldAgeRequirement() {
	let sec = Math.floor(new Date().getTime() / 1000 * 3) / 3
	sec += 1970 * 365.24 * 24 * 3600
	return Decimal.pow(10, 3 * sec)
}

function checkMarathon(){
	if (getDimensionProductionPerSecond(1).gt(player.money) && !hasAch("r44")) {
		Marathon += player.options.updateRate/1000;
		if (Marathon >= 30) giveAchievement("Over in 30 seconds");
	} else {
		Marathon = 0;
	}
}

function checkMarathon2(){
	if (infDimensionProduction(1).gt(player.infinityPower) && player.currentEternityChall != "eterc7" && !hasAch("r113")) {
		Marathon2+=player.options.updateRate/1000;
		if (Marathon2 >= 60) giveAchievement("Long lasting relationship");
	} else {
		Marathon2 = 0;
	}
}

function checkPain(){
	if (player.eternities >= 1 && (player.options.notation == "Standard" || player.options.notation == "Emojis" || player.options.notation == "Brackets")) {
		painTimer += player.options.updateRate/1000;
		if (painTimer >= 600) giveAchievement("Do you enjoy pain?");
	}
}

function checkSupersanic(){
	if (player.money.gt(Math.pow(10,63))) giveAchievement("Supersanic");
}

function checkForEndMe() {
	var temp = 0
	for (var i=0; i < getTotalNormalChallenges(); i++) {
		temp += player.challengeTimes[i]
	}
	if (temp <= 1800) giveAchievement("Not-so-challenging")
	if (temp <= 20 || (temp <= 50 && tmp.ngmX >= 4)) giveAchievement("End me")
	var temp2 = 0
	for (var i = 0; i < order.length; i++) temp2 += player.infchallengeTimes[i]
	infchallengeTimes = temp2
	if (temp2 <= 66.6) giveAchievement("Yes. This is hell.")
}

function checkYoDawg(){
	if (!hasAch("r111") && player.lastTenRuns[9][1].neq(0)) {
		let n = 0;
		for (i = 0; i < 9; i++) {
			if (player.lastTenRuns[i][1].gte(player.lastTenRuns[i+1][1].times(Number.MAX_VALUE))) n++
		}
		if (n == 9) giveAchievement("Yo dawg, I heard you liked infinities...")
	}
}

function checkUniversalHarmony() {
	if (hasAch("ngpp18")) return
	if (player.meta != undefined) {
		if (player.galaxies < 700 || getTotalRGs() < 700 || player.dilation.freeGalaxies < 700) return
	} else if (player.exdilation != undefined) {
		if (player.galaxies != player.replicanti.galaxies || player.galaxies != player.dilation.freeGalaxies || player.galaxies < 300) return
	} else return
	giveAchievement("Universal harmony")
}

function checkEPReqAchieve(){
	if (player.eternityPoints.gte(Number.MAX_VALUE)) giveAchievement("But I wanted another prestige layer...")
	if (player.eternityPoints.gte("1e40000")) giveAchievement("In the grim darkness of the far endgame")
	if (player.eternityPoints.gte("9e99999999")) giveAchievement("This achievement doesn't exist 3")
}

function checkIPReqAchieve(){
	var checkEmpty = player.timestudy.studies.length < 1
	if (tmp.ngp3) for (id=0;id<player.masterystudies.length;id++) {
		if (player.masterystudies[id].split("t")[1]) checkEmpty = false
	}
	var ableToGetRid2 = checkEmpty && player.dilation.active 
	
	if (player.infinityPoints.gte(E("1e22000")) && checkEmpty) giveAchievement("What do I have to do to get rid of you")
	if (player.infinityPoints.gte(1e100) && player.firstAmount.equals(0) && player.infinitied == 0 && player.resets <= 4 && player.galaxies <= 1 && player.replicanti.galaxies == 0) giveAchievement("Like feasting on a behind")
	if (player.infinityPoints.gte('9.99999e999')) giveAchievement("This achievement doesn't exist II");
	if (player.infinityPoints.gte('1e30008')) giveAchievement("Can you get infinite IP?");
	if (player.infinityDimension1.baseAmount == 0 &&
		player.infinityDimension2.baseAmount == 0 &&
		player.infinityDimension3.baseAmount == 0 &&
		player.infinityDimension4.baseAmount == 0 &&
		player.infinityDimension5.baseAmount == 0 &&
		player.infinityDimension6.baseAmount == 0 &&
		player.infinityDimension7.baseAmount == 0 &&
		player.infinityDimension8.baseAmount == 0 &&
		player.infMultCost.equals(10) &&
		player.infinityPoints.gt(E("1e140000"))) giveAchievement("I never liked this infinity stuff anyway")
	if (ableToGetRid2 && player.infinityPoints.log10() >= 20000) giveAchievement("This is what I have to do to get rid of you.")
}

function checkReplicantiBasedReqAchieve(){
	if (player.replicanti.amount.gte(Number.MAX_VALUE) && player.thisInfinityTime < 600*30) giveAchievement("Is this safe?");
	if (player.replicanti.galaxies >= 10 && player.thisInfinityTime < 150) giveAchievement("The swarm");
	if (player.replicanti.galaxies >= 180 * player.galaxies && player.galaxies >= 1) giveAchievement("Popular music")
	if (player.replicanti.amount.gt(E("1e20000"))) giveAchievement("When will it be enough?")
	if (player.boughtDims && player.replicanti.amount.gt("1e1000000")) giveAchievement("Do you really need a guide for this?");
	if (player.replicanti.amount.gt(tmp.ngp3 ? "1e60000" : "1e100000")) giveAchievement("It will never be enough")
}

function checkResetCountReqAchieve(){
	if (getEternitied() >= 1e12) giveAchievement("The cap is a million, not a trillion")
	if (player.infinitied >= 2e6) giveAchievement("2 Million Infinities")
}

function checkMatterAMNDReqAchieve(){
	if (player.money.gte("9.9999e9999")) giveAchievement("This achievement doesn't exist")
	if (player.money.gte("1e35000")) giveAchievement("I got a few to spare")
	if (player.money.gt(Decimal.pow(10, 80))) giveAchievement("Antimatter Apocalypse")
	if (player.seventhAmount.gt(Decimal.pow(10, 12))) giveAchievement("Multidimensional");
	if ((player.matter.gte(2.586e15) && player.currentChallenge == "postc6") || player.matter.gte(Number.MAX_VALUE)) giveAchievement("It's not called matter dimensions is it?")
	if (getDimensionFinalMultiplier(1).gt(1e31)) giveAchievement("I forgot to nerf that")
}

function checkInfPowerReqAchieve(){
	if (player.infinityPower.gt(1)) giveAchievement("A new beginning.");
	if (player.infinityPower.gt(1e6)) giveAchievement("1 million is a lot"); 
	if (player.infinityPower.gt(1e260)) giveAchievement("Minute of infinity"); 
}

function checkTickspeedReqAchieve(){
	if (player.tickspeed.lt(1e-26)) giveAchievement("Faster than a potato");
	if (player.tickspeed.lt(1e-55)) giveAchievement("Faster than a squared potato");
	if (player.tickspeed.log10() < -8296262) giveAchievement("Faster than a potato^286078")
	if (player.totalTickGained >= 308) giveAchievement("Infinite time");
	if (player.totalTickGained>=1e6) giveAchievement("GAS GAS GAS")
}

function newDimension() {
	let req = getNewInfReq()
	if (player.money.lt(req.money)) return
	player.infDimensionsUnlocked[req.tier-1] = true
	if (req.tier == 4) giveAchievement("NEW DIMENSIONS???")
	if (req.tier == 8) giveAchievement("0 degrees from infinity")
}

function checkOtherPreNGp3Achieve() {
	var ableToGetRid2 = player.timestudy.studies.length < 1 && player.dilation.active 
	if (tmp.ngp3) for (id = 0; id < player.masterystudies.length; id++) {
		if (player.masterystudies[id].split("t")[1]) ableToGetRid2 = false
	}
	if (tmp.ngp3_boost && getAmount(8) >= 100) giveAchievement("Fake News")
	if (tmp.ngp3_boost && player.challenges.includes("challenge5")) giveAchievement("Spreading Cancer")
	if (player.why >= 1e6) giveAchievement("Should we tell them about buy max...")
	if (infchallengeTimes < 7.5) giveAchievement("Never again")
	if (player.totalTimePlayed >= 10 * 60 * 60 * 24 * 8) giveAchievement("One for each dimension")
	if (Math.random() < 0.00001) giveAchievement("Do you feel lucky? Well do ya punk?")
	//starting here i need to move checks into the correct function:
	if (player.galaxies >= 50) giveAchievement("YOU CAN GET 50 GALAXIES!??")
	if (player.galaxies >= 2) giveAchievement("Double Galaxy");
	if (player.galaxies >= 1) giveAchievement("You got past The Big Wall");
	if (player.galaxies >= 540 && player.replicanti.galaxies == 0) giveAchievement("Unique snowflakes")
	if (player.dilation.active) giveAchievement("I told you already, time is relative")
	if (player.resets >= 10) giveAchievement("Boosting to the max")
	if (!tmp.ngp3_boost && player.spreadingCancer >= 10) giveAchievement("Spreading Cancer")
	if (player.spreadingCancer >= 1000000) giveAchievement("Cancer = Spread")
	if (player.infinitied >= 10) giveAchievement("That's a lot of infinites");
	if (player.break) giveAchievement("Limit Break")
	if (tmp.sacPow >= 600) giveAchievement("The Gods are pleased");
	if (tmp.sacPow.gte(Number.MAX_VALUE)) giveAchievement("Yet another infinity reference")
	if (tmp.sacPow.gte(Decimal.pow(10, 9000)) && !inNC(11)) giveAchievement("IT'S OVER 9000")
	if (player.currentChallenge.includes("post")) giveAchievement("Infinitely Challenging")
	if (tmp.ec >= 50) giveAchievement("5 more eternities until the update")
	if (player.infinitiedBank >= 5000000000) giveAchievement("No ethical consumption");
	if (getEternitied() >= 100) giveAchievement("This mile took an Eternity")
	if (player.bestEternity < 300) giveAchievement("That wasn't an eternity");
	if (player.bestEternity <= 0.01) giveAchievement("Less than or equal to 0.001");
}

function checkNGUdAchieve() {
	var ableToGetRid2 = player.timestudy.studies.length < 1 && player.dilation.active 
	if (tmp.ngp3) for (id = 0; id < player.masterystudies.length; id++) {
		if (player.masterystudies[id].split("t")[1]) ableToGetRid2 = false
	}
	let ableToGetRid3 = ableToGetRid2 && player.dilation.upgrades.length === 0 && player.dilation.rebuyables[1] === 0 && player.dilation.rebuyables[2] === 0 && player.dilation.rebuyables[3] === 0
	if (player.blackhole.power.gt(0)) giveAchievement("A newer beginning.")
	if (player.blackhole.power.gt(1e6)) giveAchievement("1 million is still a lot")
	if (player.exdilation.unspent.gt(1e5)) giveAchievement("Finally I'm out of that channel");
	if (ableToGetRid2 && player.infinityPoints.log10() >= 20000) giveAchievement("I already got rid of you.")
}

function checkNGp2Achieve() {
	if (hasDilationStudy(6)) giveAchievement("I'm so meta")
	if (player.meta.resets >= (tmp.ngp3 ? 7 : 10)) giveAchievement("Meta-boosting to the max")
}

function preHiggsNGp3AchieveCheck() {
	//Time Studies
	let checkEmpty = player.timestudy.studies.length < 1

	//Quantum
	let usedQuarks = qu_save.usedQuarks

	//Able to get "Rid of you"
	let ableToGetRid2 = checkEmpty && player.dilation.active
	let ableToGetRid3 = ableToGetRid2
	let ableToGetRid4 = pos.unl() && pos_tmp.cloud.exclude >= 5
	let ableToGetRid5 = ableToGetRid2 && QCs.in(2) && player.dontWant
	let ableToGetRid6 = ableToGetRid2 && QCs.in(6) && QCs.in(8)

	if (player.meta.bestAntimatter.gte(Number.MAX_VALUE)) giveAchievement("I don't have enough fuel!")
	if (tmp.quUnl) giveAchievement("Sub-atomic")
	if (usedQuarks.r.max(usedQuarks.g).max(usedQuarks.b).gt(0) && colorCharge.normal.chargeAmt.eq(0)) giveAchievement("Hadronization")
	if (player.galaxies >= 1100 && !player.dilation.studies.includes(1)) giveAchievement("No more tax fraud!")
	if (qu_save.best <= 300) giveAchievement("And the winner is...")
	if (player.money.gte(getOldAgeRequirement())) giveAchievement("Old age")
	if (player.infinityPoints.log10() >= 3e5 && ableToGetRid3) giveAchievement("I already got rid of you...")

	if (qMs.tmp.amt >= 21) giveAchievement("Special Relativity")
	if (QCs.done(3)) giveAchievement("We are not going squared.")
	if (
		player.meta.bestAntimatter.gte(Decimal.pow(Number.MAX_VALUE, 2)) &&
		player.meta[5].bought == 0 &&
		player.meta[6].bought == 0 &&
		player.meta[7].bought == 0 &&
		player.meta[8].bought == 0
	) giveAchievement("Old memories come true")
	if (player.timestudy.theorem >= 1e85 && !QCs.isntCatched()) giveAchievement("Infinity Morals")
	if (PCs_save.comps.length >= 3) giveAchievement("Twice in a row")
	if (player.eightBought >= 3e7 && (tmp.dtMode ? getTotalRG() : player.replicanti.galaxies) == 0) giveAchievement("Intergalactic")
	if (player.eternityPoints.e >= 2e7 && ableToGetRid4) giveAchievement("Seriously, I already got rid of you.")

	//ROW 16.5
	if (mTs.bought == mTs.timeStudies.length && QCs.in(1)) giveAchievement("Mastery Mayhem")
	if (str.unl()) giveAchievement("Completing the Quantum")
	if (!hasAch("ng3pr13")) {
		var cond = 0
		for (var i = 1; i <= 12; i++) {
			if (enB.pos.charged(i) && enB.pos.chargeEff(i) >= 8) cond++
			if (cond >= 6) break
		}
		if (cond >= 6) giveAchievement("Bursted Em All!")
	}
	if (qu_save.expEnergy >= 1) giveAchievement("The Power of Science!")
	if (!hasAch("ng3pr15") && str.unl()) {
		var cond = 0
		for (var i = 1; i <= 8; i++) if (PCs.milestoneDone(i * 10 + 3)) cond++
		if (cond >= 8) giveAchievement("The Challenging Day")
	}
	if (player.money.log10() >= Math.PI * 1e11 && player.currentEternityChall == "eterc11") giveAchievement("I can't get my multipliers higher!")
	if (!hasAch("ng3pr17") && PCs.milestoneDone(83)) {
		var cond = 0
		for (var i = 1; i <= 4; i++) {
			if (PCs.posDone(50 + i)) cond++
		}
		if (cond >= 1) giveAchievement("Stonking The Pairs")
	}
	if (QCs.inAny() && str_tmp.vibrated === 0 && player.meta.bestAntimatter.e >= 1.6e3) giveAchievement("Get rid of you by yourself...")

	return //WILL MOVE FOR UPCOMING UPDATES

	//ROW 17
	if (pH.can("quantum") && QCs.in(3) && player.meta[2].bought == 0 && player.meta[3].bought == 0 && player.meta[4].bought == 0 && player.meta[5].bought == 0 && player.meta[6].bought == 0 && player.meta[7].bought == 0 && player.meta[8].bought == 0) giveAchievement("ERROR 500: INTERNAL DIMENSION ERROR")
	if (pH.did("fluctuate")) giveAchievement("Feel the Momentum")
	if (str.unl() && (str_tmp.powers[1] * str_tmp.str < -1.5 || str_tmp.powers[2] * str_tmp.str < -1.5 || str_tmp.powers[3] * str_tmp.str < -1.5)) giveAchievement("Never make paradoxes!")
	if (str.unl() && !hasAch("ng3p44")) {
		var cond1 = 0
		var cond2 = 0
		for (var i = 1; i <= 3; i++) {
			if (str_tmp.powers[i] * str_tmp.str > 2.5) cond1++
			if (str_tmp.powers[i] > 0) cond2++
		}
		if (cond1 == 2 && cond2 == 2) giveAchievement("String Eversion")
	}
	if (str.unl() && !hasAch("ng3p45")) {
		for (var i = 1; i <= 3; i++) {
			if (str_tmp.powers[i] > -1 && str_tmp.powers[i] < -0.8) {
				giveAchievement("Bullseye!")
				break
			}
		}
	}
	if (FDs_save.meta.gte(1e15) && fluc_save.time <= 86400) giveAchievement("MAXIMUM OVERCHARGE")
	if (player.replicanti.amount.log10() >= 1/0 && player.dilation.tachyonParticles.eq(0)) giveAchievement("No dilation means no production.")
	if (player.infinityPoints.gte(Decimal.pow(Number.MAX_VALUE, 1000)) && ableToGetRid5) giveAchievement("I don't want you to live anymore.")

	if (player.dilation.dilatedTime.log10() >= 411 && qu_save.notrelative) giveAchievement("Time is not relative")
	if (!hasAch("ng3p42")) {
		for (var d = 2; d < 9; d++) {
			if (player[TIER_NAMES[d]+"Amount"].gt(0) || player["infinityDimension"+d].amount.gt(0) || player["timeDimension"+d].amount.gt(0) || player.meta[d].amount.gt(0)) break
			else if (player.money.log10() >= 1.6e12 && d == 8) giveAchievement("ERROR 404: DIMENSIONS NOT FOUND")
		}
	}
	if (player.timestudy.theorem >= 1.1e7 && qu_save.wasted) giveAchievement("Studies are wasted")
	if (player.infinityPoints.gte(Decimal.pow(10, 2.75e5)) && ableToGetRid6) giveAchievement("Are you currently dying?")
	if (player.replicanti.amount.log10() >= 1/0) giveAchievement("Will it be enough?")
	if (qu_save.bigRip.active) {
		let ableToGetRid7 = ableToGetRid2 && player.epmult.eq(1)
		let ableToGetRid8 = ableToGetRid7 && !qu_save.breakEternity.did
		let ableToGetRid9 = ableToGetRid8
		let ableToGetRid10 = ableToGetRid9
		if (player.currentEternityChall == "eterc7" && player.galaxies == 1 && player.money.log10() >= 8e7) giveAchievement("Time Immunity")
		if (!player.timestudy.studies.includes(11) && player.timeShards.log10() >= 215) giveAchievement("You're not really smart.")
		if (ableToGetRid7 && player.infinityPoints.log10() >= 3.5e5) giveAchievement("And so your life?")
		if (qu_save.breakEternity.eternalMatter.gte(9.999999e99)) giveAchievement("This achievement doesn't exist 4")
		if (ableToGetRid8 && player.infinityPoints.log10() >= 9.4e5) giveAchievement("Please answer me why you are dying.")
		if (ableToGetRid9 && player.infinityPoints.log10() >= 1.8e6) giveAchievement("Aren't you already dead?")
		if (player.matter.log10() >= 5000) giveAchievement("Really?")
	}
	if (qu_save.bigRip.spaceShards.log10() >= 33 && !qu_save.breakEternity.did) giveAchievement("Finite Time")
	if (Decimal.gte(getInfinitied(), 1/0)) giveAchievement("Meta-Infinity confirmed?")
	if (Decimal.gte(getEternitied(), 1/0)) giveAchievement("Everlasting Eternities")
	if (player.options.secrets && player.options.secrets.ghostlyNews && !player.options.newsHidden) giveAchievement("Two tickers")
	if (qu_save.breakEternity.did) giveAchievement("Time Breaker")
	if (mTs.bought >= 48) giveAchievement("The Theory of Ultimate Studies")
	if (qu_save.best <= 10) giveAchievement("Quantum doesn't take so long")
}

function atHiggsAchCheck(){
	if (player.ghostify.ghostlyPhotons.enpowerments >= 25) giveAchievement("Bright as the Anti-Sun")
	if (qu_save.quarks.log10() >= 4e4) giveAchievement("Are these another...")
	if (player.ghostify.times >= Math.pow(Number.MAX_VALUE, 1/4)) giveAchievement("The Ghostliest Side")
	if (player.money.log10() >= 1e18) giveAchievement("Meta-Quintillion")
}

function atGravDimsAchCheck(){
	if (player.ghostify.ghostParticles.plus(1).log10() >= 5e3) giveAchievement("Einstein's Ghost")
	if (qu_save.bigRip.bestThisRun.plus(1).log10() >= Math.sqrt(2) * 1e12) giveAchievement("Do you even how to?")
	// Brutally Challenging is on quantum_challenges.js
	if (player.ghostify.time <= 100 && player.money.plus(1).log10() >= 1/0) giveAchievement("Auto-Ghost Speedrunning")
}

function beyondHiggsAchieveCheck(){
	atHiggsAchCheck()
	atGravDimsAchCheck()
}

function ALLACHIEVECHECK(){
	if (!hasAch("ng3p81")) {
		//PRE NG+3 ACHIEVEMENTS ONLY!!!
		checkIPReqAchieve() //IP Req
		checkEPReqAchieve() //EP Req
		checkReplicantiBasedReqAchieve() //Replicanti based Req
		checkResetCountReqAchieve() //Reset Count Req
		checkMatterAMNDReqAchieve() //AM/ND/Matter Req
		checkInfPowerReqAchieve() //IPo Req
		checkTickspeedReqAchieve() //Tickspeed/tick upgs based
		checkOtherPreNGp3Achieve() //Other

		if (player.exdilation) checkNGUdAchieve()
		if (player.meta) checkNGp2Achieve()
		if (player.exdilation || player.meta) checkUniversalHarmony()
	}
	if (!tmp.ngp3) return

	if (!hasAch("ng3p101")) preHiggsNGp3AchieveCheck()
	if (player.ghostify) beyondHiggsAchieveCheck()
}