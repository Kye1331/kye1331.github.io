function dimShiftDisplay(){
	var shiftRequirement = getShiftRequirement();
	var isShift = getMaxUnlockableDimensions() < (haveSixDimensions() ? 6 : 8)
	el("resetLabel").innerHTML = 'Dimension ' + (isShift ? "Shift" : player.resets < getSupersonicStart() ? "Boost" : "Supersonic") + ' (' + getFullExpansion(Math.ceil(player.resets)) + (getTotalDBs() > player.resets ? " + " + getFullExpansion(Math.ceil(getExtraDBs())) : "") +'): requires ' + getFullExpansion(Math.ceil(shiftRequirement.amount)) + " " + DISPLAY_NAMES[shiftRequirement.tier] + " Dimensions" +
		(hasDilationStudy(6) && shiftDown ? "<br>Power: " + shorten(getDimensionBoostPower()) + "x, Multiplier: " + shorten(getDimensionBoostPower().pow(getTotalDBs())) + "x" : "")
	el("softReset").textContent = "Reset the game for a " + (isShift ? "new Dimension" : "Boost")
}

function tickspeedBoostDisplay(){
	if (isTickspeedBoostPossible()) {
		var tickReq = getTickspeedBoostRequirement()
		el("tickReset").style.display = ""
		el("tickResetLabel").textContent = "Tickspeed Boost (" + getFullExpansion(player.tickspeedBoosts) + "): requires " + getFullExpansion(tickReq.amount) + " " + DISPLAY_NAMES[tickReq.tier] + " Dimensions"
		el("tickResetBtn").className = getAmount(tickReq.tier) < tickReq.amount ? "unavailablebtn" : "storebtn"
	} else el("tickReset").style.display = "none"
}

function galaxyReqDisplay(){
	var nextGal = getGalaxyRequirement(0, true)
	var totalReplGalaxies = getTotalRGs()
	var totalTypes = player.dilation.freeGalaxies ? 3 : totalReplGalaxies ? 2 : 1
	el("secondResetLabel").innerHTML = getGalaxyScaleName(nextGal.scaling) + 'Antimatter Galaxies' +
		' (' +
			getFullExpansion(player.galaxies) +
			(totalTypes >= 2 ? ' + ' + getFullExpansion(totalReplGalaxies) : '') +
			(totalTypes >= 3 ? ' + ' + getFullExpansion(Math.round(player.dilation.freeGalaxies)) : '')
		+ ')' +
		': requires ' + getFullExpansion(nextGal.amt) + ' '+DISPLAY_NAMES[inNC(4) || player.pSac != undefined ? 6 : 8]+' Dimensions'

	var sing = hasTS(232) && hasMTS(311)
	el("theSingularity").style.display = shiftDown && sing ? "" : "none"
	if (sing) {
		var ts311 = mTs_tmp[311]
		var singEff = 10 / (1 - 10 * ts311.exp / 15)
		el("theSingularityLabel").textContent = "<- THE SINGULARITY: ^" + singEff.toFixed(2) + " GALAXY POWER" + " > " + formatPercentage(Math.pow(tsMults[232](), ts311.eff + 1)) + "% EFFICENCY ->"

		el("theSingularityBtn").style.display = singEff > 90 ? "" : "none"
		el("theSingularityBtn").className = player.money.e >= 1e180 && singEff > 100 ? "storebtn" : "unavailablebtn"
	}
}

var galaxyScalings = ["", "Distant ", "Farther ", "Remote ", "Obscure "]
var negGalaxyScalings = ["", "Dense "]
function getGalaxyScaleName(x) {
	return (x < 0 ? negGalaxyScalings : galaxyScalings)[Math.abs(x)]
}

function dimensionTabDisplay(){
	var shown
	for (let tier = 8; tier > 0; tier--) {
		shown = shown || canBuyDimension(tier)
		var name = TIER_NAMES[tier];
		if (shown) {
			el(tier + "Row").style.display = ""
			el("D" + tier).childNodes[0].nodeValue = DISPLAY_NAMES[tier] + " Dimension x" + formatValue(player.options.notation, getDimensionFinalMultiplier(tier), 2, 1)
			el("A" + tier).textContent = getDimensionDescription(tier)
		}
	}

	setAndMaybeShow("mp10d", aarMod.newGameMult || (shiftDown && pos.unl()), function() {
		let pow = getDimensionPowerMultiplier("non-random")
		return 'Multiplier per 10 Dimensions: ' + shorten(pow) + 'x' +
			(shiftDown ? ", " + shortenCosts(pow.pow(player.firstBought / 10)) + "x to First Dimensions" : "")
	})

	dimShiftDisplay()
	tickspeedBoostDisplay()
	galaxyReqDisplay()
}

function tickspeedDisplay(){
	if (canBuyDimension(3) || player.currentEternityChall == "eterc9") {
		let mult = tmp.tsReduce
		let multNum = mult.toNumber()
		let labels = []
		let e = Math.floor(Math.log10(Math.round(1/multNum)))

		var label
		if (isNaN(multNum)) label = 'break the tick interval by Infinite';
		else if (e >= 9) label = "divide the tick interval by " + shortenDimensions(Decimal.recip(mult))
		else if (multNum > .9) label = 'reduce the tick interval by ' + shorten((1 - multNum) * 100) + '%'
		else label = 'reduce the tick interval by ' + ((1 - multNum) * 100).toFixed(e) + '%'
		labels.push(label)

		if (isIC3Trapped()) labels.push("multiply all Dimensions by " + formatValue(player.options.notation, getIC3Mult(), 2, 4) + "x")

		el("tickLabel").innerHTML = wordizeList(labels, true) + "."

		el("tickSpeed").style.visibility = "visible";
		el("tickSpeedMax").style.visibility = "visible";
		el("tickLabel").style.visibility = "visible";
		el("tickSpeedAmount").style.visibility = "visible";
	} else {
		el("tickSpeed").style.visibility = "hidden";
		el("tickSpeedMax").style.visibility = "hidden";
		el("tickLabel").style.visibility = "hidden";
		el("tickSpeedAmount").style.visibility = "hidden";
	}
}

function paradoxDimDisplay(){
	el("pPow").textContent = shortenMoney(player.pSac.dims.power)
	el("pPowProduction").textContent = "You are getting " + shortenDimensions(getPDProduction(1).div(getEC12Mult()).times(getPDAcceleration())) + " Paradox Power per real-life second."
	el("pPowEffect").textContent = shorten(getPDAcceleration())
	var shown
	for (let t = 8; t > 0; t--) {
		shown = shown || isDimUnlocked(t)
		el("pR"+t).style.display = shown ? "" : "none"
		if (shown) {
			el("pD"+t).textContent = DISPLAY_NAMES[t] + " Paradox Dimension x" + shortenMoney(getPDPower(t))
			el("pB"+t).textContent = "Cost: " + shortenDimensions(player.pSac.dims[t].cost) + " Px"
			el("pB"+t).className = (player.pSac.px.gte(player.pSac.dims[t].cost) ? "stor" : "unavailabl") + "ebtn"
			el("pA"+t).textContent = getPDDesc(t)
		}
	}
}

function mainStatsDisplay(){
	el("totalmoney").textContent = 'You have made a total of ' + shortenMoney(player.totalmoney) + ' antimatter.'
	el("totalresets").textContent = 'You have performed ' + getFullExpansion(player.resets) + ' Dimension Boosts/Shifts.'
	setAndMaybeShow("lostResets", player.pSac && player.pSac.lostResets, '"You have lost a total of " + getFullExpansion(player.pSac.lostResets) + " Dimension Boosts/Shifts after matter resets."')
	el("tdboosts").textContent = tmp.ngmX > 3 ? 'You have performed ' + getFullExpansion(player.tdBoosts) + ' Time Dimension Boosts/Shifts.':""
	var showBoosts=isTickspeedBoostPossible()
	el("boosts").style.display = showBoosts ? '' : 'none'
	if (showBoosts) el("boosts").textContent = 'You have performed '+getFullExpansion(player.tickspeedBoosts)+' Tickspeed Boosts.'
	el("galaxies").textContent = 'You have ' + getFullExpansion(player.galaxies) + ' Antimatter Galaxies.'
	var showCancer = player.spreadingCancer > 0 && inNGM(2)
	el("spreadingCancer").style.display = showCancer ? '' : 'none'
	if (showCancer) el("spreadingCancer").textContent = 'You have made '+getFullExpansion(player.spreadingCancer)+' total galaxies while using Cancer notation.'
	el("totalTime").textContent = "You have played for " + timeDisplay(player.totalTimePlayed) + "."
}

function paradoxSacDisplay(){
	if (player.pSac && player.pSac.times) {
		el("psStatistics").style.display = ""
		el("pSacrificedNormal").textContent = "You have Paradox Sacrificed " + getFullExpansion(player.pSac.normalTimes) + " times."
		el("pSacrificedForced").textContent = "You have been forced to do a Paradox Sacrifice " + getFullExpansion(player.pSac.forcedTimes) + " times."
		el("pSacrificed").textContent = "You have Paradox Sacrificed a total of " + getFullExpansion(player.pSac.times) + " times."
		el("thisPSac").textContent = "You have spent " + timeDisplay(player.pSac.time) + " in this Paradox Sacrifice."
	} else el("psStatistics").style.display = "none"
}

function galaxySacDisplay(){
	if (inNGM(2) ? player.galacticSacrifice.times < 1 : true) el("gsStatistics").style.display = "none"
	else {
		el("gsStatistics").style.display = ""
		el("sacrificed").textContent = "You have Galactic Sacrificed "+getFullExpansion(player.galacticSacrifice.times) + " times."
		el("thisSacrifice").textContent = "You have spent " + timeDisplay(player.galacticSacrifice.time) + " in this Galactic Sacrifice."
	}
}

function bestInfinityDisplay(){
	el("infinityStatistics").style.display = "none"
	if (!pH.shown("infinity")) {
		el("bestInfinity").textContent = ""
		el("thisInfinity").textContent = ""
		el("infinitied").textContent = ""
	} else {
		el("infinityStatistics").style.display = ""
		el("bestInfinity").textContent = "Your fastest Infinity is in " + timeDisplay(player.bestInfinityTime) + "."
		el("thisInfinity").textContent = "You have spent " + timeDisplay(player.thisInfinityTime) + " in this Infinity."
		el("infinitied").textContent = "You have Infinitied " + getFullExpansion(player.infinitied) + " time" + (player.infinitied == 1 ? "" : "s") + (pH.did("eternity") ? " this Eternity." : ".")
	}
	if (pH.shown("infinity") && player.infinitiedBank > 0) el("infinityStatistics").style.display = ""
}

function bestEternityDisplay(){
	if (pH.shown("eternity")) {
		el("eternityStatistics").style.display = ""
		if (player.bestEternity >= 9999999999) {
			el("besteternity").textContent = ""
		} else el("besteternity").textContent = "Your fastest Eternity is in " + timeDisplay(player.bestEternity) + "."
		el("thiseternity").textContent = "You have spent " + timeDisplay(player.thisEternity) + " in this Eternity."
		el("eternitied").textContent = "You have Eternitied " + getFullExpansion(Decimal.floor(player.eternities)) + " time" + (player.eternities == 1 ? "" : "s") + (pH.did("quantum") ? " this Quantum." : ".")
	} else el("eternityStatistics").style.display = "none"
}

function quantumStatDisplay(){
	if (!pH.shown("quantum")) el("quantumStatistics").style.display = "none"
	else {
		el("quantumStatistics").style.display = ""
		el("quantumed").textContent = "You have gone Quantum " + getFullExpansion(qu_save.times) + " times."
		el("thisQuantum").textContent = "You have spent " + timeDisplay(qu_save.time) + " in this Quantum."
		el("bestQuantum").textContent = "Your fastest Quantum is in " + timeDisplay(qu_save.best) + "."
		el("bestPCs").textContent = PCs_save.lvl > 1 ? "You have a best of " + getFullExpansion(PCs_save.best) + " Paired Challenge completions." : ""
	}

	if ((!pH.shown("quantum") || !QCs.done(1)) && !pH.did("fluctuate")) el("compressorStatistics").style.display = "none"
	else {
		el("compressorStatistics").style.display = ""

		var qc1 = QCs_save.qc1
		el("thisCompressor").textContent = "You have spent " + timeDisplay(qc1.time) + " in Replicanti Compressor #" + getFullExpansion(qc1.boosts) + "."
		el("bestCompressors").textContent = "You have a best of " + getFullExpansion(qc1.best) + " Replicanti Compressors."
		el("thisLastCompressor").textContent = qc1.last.length ? "It's been " + timeDisplay(qc1.timeLast) + " since you got " + getFullExpansion(qc1.best) + " Replicanti Compressors." : ""
	}
}

function dilationStatsDisplay(){
	if (player.dilation.times) el("dilated").textContent = "You have succesfully dilated "+getFullExpansion(player.dilation.times)+" times."
	else el("dilated").textContent = ""

	if (player.exdilation == undefined ? false : player.exdilation.times > 1) el("exdilated").textContent = "You have reversed Dilation " + getFullExpansion(player.exdilation.times) + " times."
	else el("exdilated").textContent = ""
}

function scienceNumberDisplay(){
	var scale1 = [2.82e-45,1e-42,7.23e-30,5e-21,9e-17,6.2e-11,5e-8,3.555e-6,7.5e-4,1,2.5e3,2.6006e6,3.3e8,5e12,4.5e17,1.08e21,1.53e24,1.41e27,5e32,8e36,1.7e45,1.7e48,3.3e55,3.3e61,5e68,1e73,3.4e80,1e113,Number.MAX_VALUE,E("1e65000")];
	var scale2 = [" protons."," nucleui."," Hydrogen atoms."," viruses."," red blood cells."," grains of sand."," grains of rice."," teaspoons."," wine bottles."," fridge-freezers."," Olympic-sized swimming pools."," Great Pyramids of Giza."," Great Walls of China."," large asteroids.",
		      " dwarf planets."," Earths."," Jupiters."," Suns."," red giants."," hypergiant stars."," nebulas."," Oort clouds."," Local Bubbles."," galaxies."," Local Groups."," Sculptor Voids."," observable universes."," Dimensions.", " Infinity Dimensions.", " Time Dimensions."];
	var id = 0;
	if (player.money.times(4.22419).gt(2.82e60)) {
		if (player.money.times(4.22419e-105).gt(scale1[scale1.length - 1])) id = scale1.length - 1;
		else {
			while (player.money.times(4.22419e-105).gt(scale1[id])) id++;
			if (id > 0) id--;
		}
		if (id >= 7 && id < 11) el("infoScale").textContent = "If every antimatter were a planck volume, you would have enough to fill " + formatValue(player.options.notation, player.money * 4.22419e-105 / scale1[id], 2, 1) + scale2[id];
		else el("infoScale").textContent = "If every antimatter were a planck volume, you would have enough to make " + formatValue(player.options.notation, player.money.times(4.22419e-105).dividedBy(scale1[id]), 2, 1) + scale2[id];
	} else { //does this part work correctly? i doubt it does
		if (player.money.lt(2.82e9)) el("infoScale").textContent = "If every antimatter were " + formatValue(player.options.notation, 2.82e9 / player.money, 2, 1) + " attometers cubed, you would have enough to make a proton."
		else if (player.money.lt(2.82e18)) el("infoScale").textContent = "If every antimatter were " + formatValue(player.options.notation, 2.82e18 / player.money, 2, 1) + " zeptometers cubed, you would have enough to make a proton."
		else if (player.money.lt(2.82e27)) el("infoScale").textContent = "If every antimatter were " + formatValue(player.options.notation, 2.82e27 / player.money, 2, 1) + " yoctometers cubed, you would have enough to make a proton."
		else el("infoScale").textContent = "If every antimatter were " + formatValue(player.options.notation, (2.82e-45 / 4.22419e-105 / player.money), 2, 1) + " planck volumes, you would have enough to make a proton."
	}
}

function infinityRespecedInfinityDisplay(){
	if (setUnlocks.length > player.setsUnlocked) el("nextset").textContent = "Next set unlocks at " + formatValue(player.options.notation, setUnlocks[player.setsUnlocked], 2, 0, true) + "."
	el("infi1pow").textContent = getFullExpansion(player.infinityUpgradesRespecced[1] * 10)
	el("infi1cost").textContent = shortenCosts(Decimal.pow(10, player.infinityUpgradesRespecced[1]))
	el("infi1").className = player.infinityPoints.lt(Decimal.pow(10, player.infinityUpgradesRespecced[1])) ? "infinistorebtnlocked" : "infinimultbtn"
	el("infi3pow").textContent = formatValue(player.options.notation, getLimit(), 2, 0, true)
	el("infi3cost").textContent = shortenCosts(Decimal.pow(10, player.infinityUpgradesRespecced[3]))
	el("infi3").className = player.infinityPoints.lt(Decimal.pow(10, player.infinityUpgradesRespecced[3])) ? "infinistorebtnlocked" : "infinimultbtn"
}

function infinityUpgradesDisplay(){
	for (let x = 1; x <= 4; x++) {
		for (let y = 1; y <= 4; y++) {
			let id = x * 10 + y
			let upgId = INF_UPGS.normal.ids[id]
			el("infi" + id).className = "infinistorebtn" + (player.infinityUpgrades.includes(upgId) ? "bought" : INF_UPGS.normal.can(id) ? y : "locked")
		}
	}
	
	let infiCol1And2Middle = tmp.ngC ? " and Tickspeed " : ""

	el("infi11desc").innerHTML = "Normal Dimensions gain a multiplier based on time played" + (tmp.ngC ? " and antimatter" : "") + "<br>Currently: " + shorten(infUpg11Pow()) + "x"
	el("infi12desc").innerHTML = "First and Eighth Dimensions" + infiCol1And2Middle + " gain a multiplier based on your Infinities<br>Currently: " + formatValue(player.options.notation, dimMults(), 1, 1) + "x"
	el("infi13desc").innerHTML = "Third and Sixth Dimensions" + infiCol1And2Middle + " gain a multiplier based on your Infinities<br>Currently: " + formatValue(player.options.notation, dimMults(), 1, 1) + "x"
	el("infi22desc").innerHTML = "Second and Seventh Dimensions" + infiCol1And2Middle + " gain a multiplier based on your Infinities<br>Currently: " + formatValue(player.options.notation, dimMults(), 1, 1) + "x"
	el("infi23desc").innerHTML = "Fourth and Fifth Dimensions" + infiCol1And2Middle + " gain a multiplier based on your Infinities<br>Currently: " + formatValue(player.options.notation, dimMults(), 1, 1) + "x"
	el("infi31desc").innerHTML = "Normal Dimensions gain a multiplier based on time spent in this Infinity" + (tmp.ngC ? " and total antimatter" : "") + "<br>Currently: " + shorten(infUpg13Pow()) + "x"
	var infi32middle = player.infinityPoints.lt(Decimal.pow(10, 1e10)) ? " <br> Currently: " + formatValue(player.options.notation, getUnspentBonus(), 2, 2) + "x" : ""
	el("infi32desc").innerHTML = "1st Dimension gets a multiplier based on unspent IP " + infi32middle
}

function preBreakUpgradeDisplay(){
	if (canBuyIPMult()) el("infiMult").className = "infinimultbtn"
	else el("infiMult").className = "infinistorebtnlocked"
	var infiMultEnding = player.infinityPoints.lt(Decimal.pow(10, 1e10)) ? "<br>Currently: " + shorten(getIPMult()) + "x<br>Cost: " + shortenCosts(player.infMultCost) + " IP" : ""
	el("infiMult").innerHTML = "You get " + (Math.round(getIPMultPower() * 100) / 100) + "x more IP." + infiMultEnding
	el("nextset").textContent = ""
	if (player.infinityUpgradesRespecced != undefined) {
		infinityRespecedInfinityDisplay()
	} else {
		infinityUpgradesDisplay()
		let based = []
		if (inNGM(2)) based.push("Infinities")
		if (tmp.ngC) based.push("your antimatter")
		if (based.length > 0) {
			var base = getMPTPreInfBase()
			el("infi21desc").innerHTML = "Increase the multiplier for buying 10 Dimensions based on " + wordizeList(based) + "<br>" + base + "x -> "+(infUpg12Pow() * base).toPrecision(4) + "x"
		}

		if (inNGM(2)) el("infi33desc").innerHTML = "Dimension Boosts are stronger based on Infinity Points<br>Currently: " + (1.2 + 0.05 * player.infinityPoints.max(1).log(10)).toFixed(2) + "x"

		var infi34Middle = player.infinityPoints.lt(Decimal.pow(10, 1e10)) ? "<br>Currently: " + shortenDimensions(getIPMult()) + " every " + timeDisplay(player.bestInfinityTime * 10) : ""
		el("infi34desc").innerHTML = "Generate IP based on your fastest Infinity " + infi34Middle
	}
	el("lockedset1").style.display = "none"
	if (player.setsUnlocked > 0) {
		el("lockedset1").style.display = ""
		for (let u = 4; u < 7; u++) {
			el("infi" + u + "pow").textContent = u == 5 ? getInfUpgPow(5).toFixed(2) : getFullExpansion(getInfUpgPow(u))
			el("infi" + u + "cost").textContent = shortenCosts(Decimal.pow(10, player.infinityUpgradesRespecced[u] + powAdds[u]))
			el("infi" + u).className = player.infinityPoints.lt(Decimal.pow(10, player.infinityUpgradesRespecced[u] + powAdds[u])) ? "infinistorebtnlocked" : "infinimultbtn"
		}	
	}
}

function eventsTimeDisplay(years, thisYear){
	var bc = years - thisYear + 1
	var since
	var sinceYears
	var dates = [5.332e6, 3.5e6,  2.58e6, 7.81e5, 3.15e5, 
		     2.5e5,   1.95e5, 1.6e5,  1.25e5, 7e4, 
		     6.7e4,   5e4,   4.5e4,  4e4,   3.5e4, 
		     3.3e4,   3.1e4,  2.9e4,  2.8e4,  2e4, 
		     1.6e4,   1.5e4,  1.4e4,  11600, 1e4,
		     8e3,    6e3,   5e3,   4e3,   3200,
		     3000,   2600,  2500,  2300,  1800,
		     1400,   1175,  800,   753,   653,
		     539,    356,   200,   4,     0]
	var events = ["start of Pliocene epoch", "birthdate of Lucy (typical Australopithicus afarensis female)", "Quaternary period", "Calabrian age", "Homo sapiens",
		      "Homo neanderthalensis", "emergence of anatomically modern humans", "Homo sapiens idaltu", "peak of Eemian interglacial period", "earliest abstract/symbolic art",
		      "Upper Paleolithic", "Late Stone Age", "European early modern humans", "first human settlement", "oldest known figurative art",
		      "oldest known domesticated dog", "Last Glacial Maximum", "oldest ovens", "oldest known twisted rope", "oldest human permanent settlement (hamlet considering built of rocks and of mammoth bones)",
		      "rise of Kerberan culture", "colonization of North America", "domestication of the pig", "prehistoric warfare", "Holocene",
		      "death of other human breeds", "agricultural revolution", "farmers arrived in Europe", "first metal tools", "first horse",
		      "Sumerian cuneiform writing system", "union of Egypt", "rise of Maya", "extinct of mammoths", "rise of Akkadian Empire",
		      "first alphabetic writing", "rise of Olmec civilization", "end of bronze age", "rise of Greek city-states", "rise of Rome",
		      "rise of Persian Empire", "fall of Babylonian Empire", "birth of Alexander the Great", "first paper", "birth of Jesus Christ"]
	/*
	"the homo sapiens" is weird, as is "the homo neanderthaliensis" and "the homo sapiens idaltu"
	*/
	var index = 0
	for (var i = 0; i < dates.length; i++){
		if (bc > dates[i]) {
			index = i
			break
		}
	} // dates[index] < bc <= dates[index-1] 
	if (index > 0) { //bc is less than or equal to 5.332e6 (5332e3)
		since = events[index - 1]
		sinceYears = bc - dates[index]
	}
	var message = "<br>If you wanted to finish writing out your full antimatter amount at a rate of 3 digits per second, you would need to start it in " 
	message += getFullExpansion(Math.floor(bc)) + " BC." + (since ? "<br>This is around " + getFullExpansion(Math.ceil(sinceYears)) + " years before the " + since + "." : "")
	el("infoScale").innerHTML = message
}

function universesTimeDisplay(years){
	var message = "<br>The time needed to finish writing your full antimatter amount at a rate of 3 digits per second would span "
	let unis = years / 13.78e9 
	// 13.78 Billion years as measured by the CMB (cosmic microwave background) and various models, feel free to change if more accurate data comes along
	let timebit 
	let end = "% of another."
	if (unis < 1) timebit = (unis * 100).toFixed(3) + "% of a universe."
	else if (unis < 2) timebit = "1 universe and " + (unis * 100 - 100).toFixed(3) + end
	else timebit = getFullExpansion(Math.floor(unis)) + " universes and " + (unis * 100 - 100 * Math.floor(unis)).toFixed(3) + end
	el("infoScale").innerHTML = message + timebit
}

function lifetimeTimeDisplay(years){
	var message = "<br>If you wrote 3 digits of your full antimatter amount every second since you were born as an American,<br> you would "
	if (years > 79.3) message += "be a ghost for " + ((years - 79.3) / years * 100).toFixed(3) + "% of the session."
	else message += "waste " + (years / 0.793).toFixed(3) + "% of your projected average lifespan."
	el("infoScale").innerHTML = message
}

function infoScaleDisplay(){
	if (aarMod.hideRepresentation) el("infoScale").textContent=""
	else if (player.money.gt(Decimal.pow(10, 3 * 86400 * 365.2425 * 79.3 / 10))) {
		var years = player.money.log10() / 3 / 86400 / 365.2425
		var thisYear = new Date().getFullYear() || 2020
		if (years >= 1e13){
			el("infoScale").innerHTML = "<br>The time needed to finish writing your full antimatter amount at a rate of 3 digits per second would span " + Decimal.div(years, 1e12).toFixed(2) + " trillion years."
		} else if (years >= 1e9) {
			universesTimeDisplay(years)
		} else if (years > 1e7) {
			el("infoScale").innerHTML = "<br>The time needed to finish writing your full antimatter amount at a rate of 3 digits per second would span " + Decimal.div(years, 1e6).toFixed(2) + " million years."
		} else if (years >= thisYear) { 
			eventsTimeDisplay(years, thisYear)
		} else {
			lifetimeTimeDisplay(years)
		}
	}
	else if (player.money.log10() > 1e5) el("infoScale").innerHTML = "<br>If you wrote 3 numbers a second, it would take you <br>" + timeDisplay(player.money.log10() * 10 / 3) + "<br> to write down your antimatter amount."
	else scienceNumberDisplay()
}

function STATSDisplay(){
	mainStatsDisplay()
	paradoxSacDisplay()
	galaxySacDisplay()
	bestInfinityDisplay()
	bestEternityDisplay()
	quantumStatDisplay()
	dilationStatsDisplay()
	infoScaleDisplay()
}

function breakInfinityUpgradeDisplay(){
	if (player.infinityUpgrades.includes("totalMult")) el("postinfi11").className = "infinistorebtnbought"
	else if (player.infinityPoints.gte(1e4)) el("postinfi11").className = "infinistorebtn1"
	else el("postinfi11").className = "infinistorebtnlocked"
	if (player.infinityUpgrades.includes("currentMult")) el("postinfi21").className = "infinistorebtnbought"
	else if (player.infinityPoints.gte(5e4)) el("postinfi21").className = "infinistorebtn1"
	else el("postinfi21").className = "infinistorebtnlocked"
	if (player.tickSpeedMultDecrease <= 2) el("postinfi31").className = "infinistorebtnbought"
	else if (player.infinityPoints.gte(player.tickSpeedMultDecreaseCost)) el("postinfi31").className = "infinimultbtn"
	else el("postinfi31").className = "infinistorebtnlocked"
	if (player.infinityUpgrades.includes("achievementMult")) el("postinfi22").className = "infinistorebtnbought"
	else if (player.infinityPoints.gte(1e6)) el("postinfi22").className = "infinistorebtn1"
	else el("postinfi22").className = "infinistorebtnlocked"
	if (player.infinityUpgrades.includes("infinitiedMult")) el("postinfi12").className = "infinistorebtnbought"
	else if (player.infinityPoints.gte(1e5)) el("postinfi12").className = "infinistorebtn1"
	else el("postinfi12").className = "infinistorebtnlocked"
	if (player.infinityUpgrades.includes("postGalaxy")) el("postinfi41").className = "infinistorebtnbought"
	else if (player.infinityPoints.gte(5e11)) el("postinfi41").className = "infinistorebtn1"
	else el("postinfi41").className = "infinistorebtnlocked"
	if (player.infinityUpgrades.includes("challengeMult")) el("postinfi32").className = "infinistorebtnbought"
	else if (player.infinityPoints.gte(1e7)) el("postinfi32").className = "infinistorebtn1"
	else el("postinfi32").className = "infinistorebtnlocked"
	if (player.dimensionMultDecrease <= 3) el("postinfi42").className = "infinistorebtnbought"
	else if (player.infinityPoints.gte(player.dimensionMultDecreaseCost)) el("postinfi42").className = "infinimultbtn"
	else el("postinfi42").className = "infinistorebtnlocked"
	if (player.offlineProd == 50) el("offlineProd").className = "infinistorebtnbought"
	else if (player.infinityPoints.gte(player.offlineProdCost)) el("offlineProd").className = "infinimultbtn"
	else el("offlineProd").className = "infinistorebtnlocked"
	if (player.infinityUpgrades.includes("infinitiedGeneration")) el("postinfi13").className = "infinistorebtnbought"
	else if (player.infinityPoints.gte(20e6)) el("postinfi13").className = "infinistorebtn1"
	else el("postinfi13").className = "infinistorebtnlocked"
	if (player.infinityUpgrades.includes("bulkBoost")) el("postinfi23").className = "infinistorebtnbought"
	else if (player.infinityPoints.gte(player.tickspeedBoosts!=undefined?2e4:inNGM(2)?5e6:5e9)) el("postinfi23").className = "infinistorebtn1"
	else el("postinfi23").className = "infinistorebtnlocked"
	if (player.infinityUpgrades.includes("autoBuyerUpgrade")) el("postinfi33").className = "infinistorebtnbought"
	else if (player.infinityPoints.gte(1e15)) el("postinfi33").className = "infinistorebtn1"
	else el("postinfi33").className = "infinistorebtnlocked"
	el("postinfi11").innerHTML = "Normal Dimensions gain a multiplier based on total antimatter produced<br>Currently: " + shorten(tmp.postinfi11) + "x<br>Cost: "+shortenCosts(1e4)+" IP"
	el("postinfi21").innerHTML = "Normal Dimensions gain a multiplier based on current antimatter<br>Currently: " + shorten(tmp.postinfi21) + "x<br>Cost: "+shortenCosts(5e4)+" IP"
	if (player.tickSpeedMultDecrease > 2) el("postinfi31").innerHTML = "Reduce the tickspeed cost multiplier increase post-" + shorten(Number.MAX_VALUE) + ".<br>" + player.tickSpeedMultDecrease+"x -> "+(player.tickSpeedMultDecrease-1)+"x<br>Cost: "+shortenDimensions(player.tickSpeedMultDecreaseCost) +" IP"
	else el("postinfi31").innerHTML = "Reduce the tickspeed cost multiplier increase post-" + shorten(Number.MAX_VALUE) + ".<br>" + player.tickSpeedMultDecrease.toFixed(player.tickSpeedMultDecrease < 2 ? 2 : 0)+"x"
	el("postinfi22").innerHTML = "Normal Dimensions gain a multiplier based on achievements " + (tmp.ngmX >= 4 ? "and purchased GP upgrades " : "") + "<br>Currently: " + shorten(achievementMult) + "x<br>Cost: " + shortenCosts(1e6) + " IP"
	el("postinfi12").innerHTML = "Normal Dimensions gain a multiplier based on your Infinities <br>Currently: "+shorten(getInfinitiedMult())+"x<br>Cost: " + shortenCosts(1e5) + " IP"
	el("postinfi41").innerHTML = "Galaxies are " + Math.round(getPostGalaxyEff() * 100 - 100) + "% stronger <br>Cost: "+shortenCosts(5e11)+" IP"
	el("postinfi32").innerHTML = "Normal Dimensions gain a multiplier based on your slowest Normal Challenge time<br>Currently: "+shorten(worstChallengeBonus)+"x<br>Cost: " + shortenCosts(1e7) + " IP"
	el("postinfi13").innerHTML = "You generate Infinities based on your fastest Infinity.<br>1 Infinity every " + timeDisplay(player.bestInfinityTime * 5) + " <br>Cost: " + shortenCosts(2e7) + " IP"
	el("postinfi23").innerHTML = "Unlock the option to bulk buy Dimension" + (player.tickspeedBoosts == undefined ? "" : " and Tickspeed") + " Boosts <br>Cost: " + shortenCosts(player.tickspeedBoosts != undefined ? 2e4 : inNGM(2) ? 5e6 : 5e9) + " IP"
	el("postinfi33").innerHTML = "Autobuyers work twice as fast <br>Cost: " + shortenCosts(1e15) + " IP"
	if (player.dimensionMultDecrease > 3) el("postinfi42").innerHTML = "Reduce the Dimension  cost multiplier increase post-" + shorten(Number.MAX_VALUE) + ".<br>" + player.dimensionMultDecrease + "x -> " + (player.dimensionMultDecrease - 1) + "x<br>Cost: " + shorten(player.dimensionMultDecreaseCost) +" IP"
	else el("postinfi42").innerHTML = "Reduce the Dimension cost multiplier increase post-" + shorten(Number.MAX_VALUE) + ".<br>"+player.dimensionMultDecrease.toFixed(ECComps("eterc6") % 5 > 0 ? 1 : 0) + "x"
	el("offlineProd").innerHTML = "Generate " + player.offlineProd + "% > " + Math.max(Math.max(5, player.offlineProd + 5), Math.min(50, player.offlineProd + 5)) + "% of your best IP/min from the last 10 Infinities, works offline<br>Currently: " + shortenMoney(bestRunIppm.times(player.offlineProd / 100)) + "IP/min<br> Cost: " + shortenCosts(player.offlineProdCost) + " IP"
	if (player.offlineProd == 50) el("offlineProd").innerHTML = "Generate " + player.offlineProd + "% of your best IP/min from the last 10 Infinities, works offline<br>Currently: " + shortenMoney(bestRunIppm.times(player.offlineProd / 100)) + " IP/min"
}

function roundedDBCostIncrease(a){
	return shorten(getDimboostCostIncrease() + a)
}

function breakNGm2UpgradeColumnDisplay(){
	if (player.infinityUpgrades.includes("galPointMult")) el("postinfi01").className = "infinistorebtnbought"
	else if (player.infinityPoints.gte(player.tickspeedBoosts == undefined ? 1e3 : 1e4)) el("postinfi01").className = "infinistorebtn1"
	else el("postinfi01").className = "infinistorebtnlocked"
	if (player.infinityUpgrades.includes("dimboostCost")) el("postinfi02").className = "infinistorebtnbought"
	else if (player.infinityPoints.gte(player.tickspeedBoosts == undefined ? 2e4 : 1e5)) el("postinfi02").className = "infinistorebtn1"
	else el("postinfi02").className = "infinistorebtnlocked"
	if (player.infinityUpgrades.includes("galCost")) el("postinfi03").className = "infinistorebtnbought"
	else if (player.infinityPoints.gte(5e5)) el("postinfi03").className = "infinistorebtn1"
	else el("postinfi03").className = "infinistorebtnlocked"
	if (player.extraDimPowerIncrease >= 40) el("postinfi04").className = "infinistorebtnbought"
	else if (player.infinityPoints.gte(player.dimPowerIncreaseCost)) el("postinfi04").className = "infinimultbtn"
	else el("postinfi04").className = "infinistorebtnlocked"
	el("postinfi01").innerHTML = "Multiplier to Galaxy points based on infinities<br>Currently: "+shorten(getPost01Mult())+"x<br>Cost: "+shortenCosts(player.tickspeedBoosts==undefined?1e3:1e4)+" IP"
	el("postinfi02").innerHTML = "Dimension Boost cost increases by 1 less<br>Currently: " + roundedDBCostIncrease(0) + (player.infinityUpgrades.includes("dimboostCost") ? "" : " -> " + (roundedDBCostIncrease(-1))) + "<br>Cost: " + shortenCosts(player.tickspeedBoosts == undefined ? 2e4 : 1e5) + " IP"
	el("postinfi03").innerHTML = "Galaxy cost increases by 5 less<br>Currently: " + Math.round(getGalaxyReqMultiplier() * 10) / 10 + (player.infinityUpgrades.includes("galCost") ? "" : " -> " + Math.round(getGalaxyReqMultiplier() * 10 - 50) / 10 + "<br>Cost: " + shortenCosts(5e5) + " IP")
	el("postinfi04").innerHTML = "Further increase all dimension multipliers<br>x^" + galMults.u31().toFixed(2) + (player.extraDimPowerIncrease < 40 ? " -> x^" + ((galMults.u31() + 0.02).toFixed(2)) + "<br>Cost: " + shorten(player.dimPowerIncreaseCost) + " IP" : "")
}

function breakNGm2UpgradeRow5Display(){
	el("postinfir5").style.display = ""
	if (player.infinityUpgrades.includes("postinfi50")) el("postinfi50").className = "infinistorebtnbought"
	else if (player.infinityPoints.gte(player.tickspeedBoosts == undefined ? 1e25 : 1e18)) el("postinfi50").className = "infinistorebtn1"
	else el("postinfi50").className = "infinistorebtnlocked"
	if (player.infinityUpgrades.includes("postinfi51")) el("postinfi51").className = "infinistorebtnbought"
	else if (player.infinityPoints.gte(player.tickspeedBoosts == undefined ? 1e29 : 1e20)) el("postinfi51").className = "infinistorebtn1"
	else el("postinfi51").className = "infinistorebtnlocked"
	if (player.infinityUpgrades.includes("postinfi52")) el("postinfi52").className = "infinistorebtnbought"
	else if (player.infinityPoints.gte(player.tickspeedBoosts == undefined ? 1e33 : 1e25)) el("postinfi52").className = "infinistorebtn1"
	else el("postinfi52").className = "infinistorebtnlocked"
	if (player.infinityUpgrades.includes("postinfi53")) el("postinfi53").className = "infinistorebtnbought"
	else if (player.infinityPoints.gte(player.tickspeedBoosts == undefined ? 1e37 : 1e29)) el("postinfi53").className = "infinistorebtn1"
	else el("postinfi53").className = "infinistorebtnlocked"
	el("postinfi50").innerHTML = "Dimension Boost cost increases by 0.5 less.<br>Currently: " + E(getDimboostCostIncrease()).toFixed(2) + (player.infinityUpgrades.includes("postinfi50") ? "" : " -> " + (E(getDimboostCostIncrease() - .5).toFixed(2))) + "<br>Cost: " + shortenCosts(player.tickspeedBoosts==undefined ? 1e25 : 1e18) + " IP"
	el("postinfi51").innerHTML = "Galaxies are " + (player.tickspeedBoosts ? 15 : 20) + "% more stronger.<br>Cost: " + shortenCosts(player.tickspeedBoosts == undefined ? 1e29 : 1e20) + " IP"
	let inf52text = ''
	if (player.tickspeedBoosts == undefined){
		inf52text = "Galaxy cost increases by 3 less.<br>Currently: " + Math.round(getGalaxyReqMultiplier() * 10) / 10 + (player.infinityUpgrades.includes("postinfi52") ? "" : " -> " + Math.round(getGalaxyReqMultiplier() * 10 - 30) / 10) + "<br>Cost: " + shortenCosts(1e33) + " IP"
	} else inf52text = "Decrease tickspeed boost cost multiplier to 3.<br>Cost: " + shortenCosts(1e25) + " IP"
	el("postinfi52").innerHTML = inf52text
	el("postinfi53").innerHTML = "Divide all Infinity Dimension cost multipliers by 50" + (tmp.ngmX >= 4 ? ", free tickspeed upgrades multiply GP gain and IC completions boost Time Dimension Cost limit" : "") + ".<br>Cost: "+shortenCosts(player.tickspeedBoosts == undefined ? 1e37 : 1e29) + " IP"
}

function breakNGm2UpgradeRow6Display(){
	el("postinfir6").style.display = ""
	if (player.infinityUpgrades.includes("postinfi60")) el("postinfi60").className = "infinistorebtnbought"
	else if (player.infinityPoints.gte(1e50)) el("postinfi60").className = "infinistorebtn1"
	else el("postinfi60").className = "infinistorebtnlocked"
	if (player.infinityUpgrades.includes("postinfi61")) el("postinfi61").className = "infinistorebtnbought"
	else if (player.infinityPoints.gte("1e450")) el("postinfi61").className = "infinistorebtn1"
	else el("postinfi61").className = "infinistorebtnlocked"
	if (player.infinityUpgrades.includes("postinfi62")) el("postinfi62").className = "infinistorebtnbought"
	else if (player.infinityPoints.gte("1e700")) el("postinfi62").className = "infinistorebtn1"
	else el("postinfi62").className = "infinistorebtnlocked"
	if (player.infinityUpgrades.includes("postinfi63")) el("postinfi63").className = "infinistorebtnbought"
	else if (player.infinityPoints.gte("1e2000")) el("postinfi63").className = "infinistorebtn1"
	else el("postinfi63").className = "infinistorebtnlocked"
	el("postinfi60").innerHTML = "You gain more " + (player.tickspeedBoosts ? "Galaxy Points" : "antimatter") + " based on your galaxies." + (player.tickspeedBoosts ? "" : "<br>Currently: " + shorten(getNewB60Mult()) + "x") + "<br>Cost: " + shortenCosts(1e50) + " IP"
	el("postinfi61").innerHTML = "g11 formula is better.<br>Cost: " + shortenCosts(E("1e450")) + " IP"
	el("postinfi62").innerHTML = "Dimension Boosts make g13 stronger.<br>Cost: " + shortenCosts(E("1e700")) + " IP"
	el("postinfi63").innerHTML = "Unlock 2 new rows of Galaxy Point upgrades.<br>Cost: " + shortenCosts(E("1e2000")) + " IP"
}

function INFINITYUPGRADESDisplay(){
	if (el("preinf").style.display == "block") {
		preBreakUpgradeDisplay()
	} else if (el("postinf").style.display == "block" && el("breaktable").style.display == "inline-block") {
		breakInfinityUpgradeDisplay()
		if (inNGM(2)) breakNGm2UpgradeColumnDisplay()
		if (inNGM(2) && (player.infinityDimension3.amount.gt(0) || player.eternities > (aarMod.newGameMinusVersion? -20 : 0) || pH.did("quantum"))) {
			breakNGm2UpgradeRow5Display()
		} else el("postinfir5").style.display = "none"
		if (inNGM(2) && (player.infinityDimension4.amount.gt(0) || player.eternities > (aarMod.newGameMinusVersion ? -20 : 0) || pH.did("quantum"))) {
			breakNGm2UpgradeRow6Display()
		} else el("postinfir6").style.display = "none"
		if (tmp.ngC) ngC.breakInfUpgs.display()
	} else if (el("singularity").style.display == "block" && el("singularitydiv").style.display == "") {
		el("darkMatter").textContent = shortenMoney(player.singularity.darkMatter)
		el("darkMatterMult").textContent = shortenMoney(getDarkMatterMult())
	} else if (el("dimtechs").style.display == "block" && el("dimtechsdiv").style.display == "") {
		el("darkMatterDT").textContent = shortenMoney(player.singularity.darkMatter)
		el("nextDiscounts").textContent = shortenMoney(getNextDiscounts())
		el("discounts").textContent = "You have gained a total of " + getFullExpansion(player.dimtechs.discounts) + " discount upgrades."
	}
}

function getEU2FormulaText(){
	let eu2formula = "(x/200) ^ log4(2x)"
	if (tmp.ngC) eu2formula = "(x/100) ^ log2(4x)"
	if (player.boughtDims !== undefined) eu2formula = "x ^ log4(2x)"
	else if (hasAch("ngpp15")) eu2formula = tmp.ngC ? "x ^ log10(x) ^ 2" : "x ^ log10(x) ^ 3.75"
	return eu2formula
}

function eternityUpgradesDisplay(){
	ETER_UPGS.updateDisplayOnTick()
}

function uponDilationDisplay(){
	let gain = getTPGain()
	let msg = "Disable dilation."
	if (player.infinityPoints.lt(Number.MAX_VALUE)) {}
	else if (player.dilation.totalTachyonParticles.gt(gain)) msg += "<br>" + getReqForTPGainDisp()
	else msg += " (+" + shortenMoney(gain.sub(player.dilation.totalTachyonParticles)) + " TP)"
	el("enabledilation").innerHTML = msg
}

function exdilationDisplay(){
	el("reversedilationdiv").style.display = ""
	if (canReverseDilation()) {
		el("reversedilation").className = "dilationbtn"
		el("reversedilation").innerHTML = "Reverse dilation."+(player.exdilation.times>0||pH.did("quantum")?"<br>Gain "+shortenDimensions(getExDilationGain())+" ex-dilation":"")
	} else {
		let req = getExdilationReq()
		el("reversedilation").className = "eternityupbtnlocked"
		el("reversedilation").textContent = "Get "+(player.eternityPoints.lt(req.ep)?shortenCosts(E(req.ep))+" EP and ":"")+shortenCosts(req.dt)+" dilated time to reverse dilation."
	}
}

function mainDilationDisplay(){
	if (player.dilation.active) uponDilationDisplay()
	else el("enabledilation").textContent = "Dilate time." + (player.eternityBuyer.dilationMode ? " (" + player.eternityBuyer.statBeforeDilation + " Eternity runs left)" : "")
	if (player.exdilation==undefined||aarMod.ngudpV?false:player.blackhole.unl) {
		exdilationDisplay()
	} else el("reversedilationdiv").style.display = "none"

	var fgm = getFreeGalaxyGainMult()
	el('freeGalaxyMult').textContent = fgm == 1 ? "Tachyonic Galaxy" : Math.round(fgm * 10) / 10 + " Tachyonic Galaxies"
}

function breakEternityDisplay(){
	el("eternalMatter").textContent = shortenDimensions(qu_save.breakEternity.eternalMatter)
	for (var u = 1; u <= (hasAch("ng3p101") ? 13 : player.ghostify.ghostlyPhotons.unl ? 10 : 7); u++) {
		el("breakUpg" + u).className = (qu_save.breakEternity.upgrades.includes(u) && u != 7) ? "eternityupbtnbought" : qu_save.breakEternity.eternalMatter.gte(getBreakUpgCost(u)) ? "eternityupbtn" : "eternityupbtnlocked"
		if (u == 8) el("breakUpg" + u + "Mult").textContent = (getBreakUpgMult(u) * 100 - 100).toFixed(1)
		else if (u != 7 && u <= 10) el("breakUpg" + u + "Mult").textContent = shortenMoney(getBreakUpgMult(u))
		else if (u == 12) el("breakUpg" + u + "Mult").textContent = shorten(getBreakUpgMult(u))
	}
	if (qu_save.bigRip.active) {
		el("eterShortcutEM").textContent=shortenDimensions(qu_save.breakEternity.eternalMatter)
		el("eterShortcutEP").textContent=shortenDimensions(player.eternityPoints)
		el("eterShortcutTP").textContent=shortenMoney(player.dilation.tachyonParticles)
	}
}

function ETERNITYSTOREDisplay(){
	if (el("TTbuttons").style.display == "block") updateTheoremButtons()
	if (el("timestudies").style.display == "block" || el("ers_timestudies").style.display == "block") updateTimeStudyButtons()
	if (el("masterystudies").style.display == "block") updateMasteryStudyButtons()
	if (el("eternityupgrades").style.display == "block") eternityUpgradesDisplay()
	if (el("dilation").style.display == "block") mainDilationDisplay()
	if (el("blackhole").style.display == "block") {
		if (el("blackholediv").style.display == "inline-block") updateBlackhole()
		if (el("blackholeunlock").style.display == "inline-block") {
			el("blackholeunlock").innerHTML = "Unlock the black hole<br>Cost: " + shortenCosts(E('1e4000')) + " EP"
			el("blackholeunlock").className = (player.eternityPoints.gte("1e4000")) ? "storebtn" : "unavailablebtn"
		}
	}
}

function updateDimensionsDisplay() {
	if (el("dimensions").style.display == "block") {
		if (el("antimatterdimensions").style.display == "block") dimensionTabDisplay()
		if (el("infinitydimensions").style.display == "block") updateInfinityDimensions()
		if (el("timedimensions").style.display == "block") updateTimeDimensions()
		if (el("pdims").style.display == "block") paradoxDimDisplay()
		if (el("metadimensions").style.display == "block") updateMetaDimensions()
		if (el("fdims").style.display == "block") FDs.updateDisp()
	}
	tickspeedDisplay()
	if (el("stats").style.display == "block" && el("statistics").style.display == "block") STATSDisplay()
   	if (el("infinity").style.display == "block") INFINITYUPGRADESDisplay()
	if (el("eternitystore").style.display == "block") ETERNITYSTOREDisplay()
   	if (el("quantumtab").style.display == "block") updateQuantumTabs()
   	if (el("flucTab").style.display == "block") fluc.updateTab()
   	if (el("ghostify").style.display == "block") updateGhostifyTabs()
}

function replicantiDisplay() {
	if (player.replicanti.unl) {
		let limit = getReplicantiLimit(true)
		let time = hasDilationUpg(6)
		let dil = hasAch("r137") && tmp.ngp3_boost
		let fluc = hasAch("ng3p36")
		el("replicantiamount").textContent = shortenDimensions(player.replicanti.amount) + (limit.lt(1/0) ? (" / ") + shortenDimensions(limit) : "")
		el("replicantieff").textContent = shiftDown ? "Effective Replicantis: " + shorten(getReplEff()) : ""
		el("replicantimult").textContent = (fluc ? "~" : "") + shorten(fluc ? FDs.repMult(1) : dil ? getReplDilBonus() : time ? tmp.rm.pow(0.1) :getIDReplMult()) + "x"
		el("replDesc").textContent = (shiftDown ? "more " : "") +
			(fluc ? "Fluctuant Dimensions (FD1 shown)" : dil ? "dilated time" : time ? "Time Dimensions" : tmp.ngC ? "IP gain (after softcaps) & all Normal Dimensions" : " Infinity Dimensions")
		el("replStr").textContent = tmp.rep.str > 1 && shiftDown ? "Replicanti Stealth: " + formatPercentage(tmp.rep.str) + "%" : ""

		repApproxDisplay()
		repChanceDisplay()
		repIntervalDisplay()
		repGalDisplay()
		repModDisplay()
	} else {
		let cost = getReplUnlCost()
		el("replicantiunlock").innerHTML = "Unlock Replicantis<br>Cost: " + shortenCosts(cost) + " IP"
		el("replicantiunlock").className = player.infinityPoints.gte(cost) ? "storebtn" : "unavailablebtn"
	}
}

function repApproxDisplay() {
	//ESTIMATE
	el("replicantiapprox").innerHTML = 
		hasTS(192) ? 
			"Replicanti increases by " + (tmp.rep.est < Math.log10(2) ? "x2.00 per " + timeDisplayShort(Math.log10(2) / tmp.rep.est * 10) : (tmp.rep.est.gte(1e4) ? shorten(tmp.rep.est) + " OoMs" : "x" + shorten(Decimal.pow(10, tmp.rep.est.toNumber()))) + " per second") + ".<br>" +
			"Replicate interval slows down by " + tmp.rep.speeds.inc.toFixed(3) + "x per " + getFullExpansion(Math.floor(tmp.rep.speeds.exp)) + " OoMs.<br>" +
			(shiftDown && hasDilationUpg("ngpp2") ? "(2x slower per " + getFullExpansion(Math.floor(getRepSlowdownBase2(tmp.rep.speeds.exp))) + " OoMs)" : "") :
		"Approximately "+ timeDisplay(Math.max((Math.log(Number.MAX_VALUE) - tmp.rep.ln) / tmp.rep.est.toNumber(), 0) * 10 * tmp.ec12Mult) + " until " + shorten(Number.MAX_VALUE) + " Replicantis."
	el("replicantibaseinterval").innerHTML = ECComps("eterc14") && shiftDown ? "<br>The base interval was " + timeDisplayShort(Decimal.div(10, tmp.rep.baseBaseEst), true, 2) + (tmp.rep.intBoost.neq(1) ? ", which is slowed down by " + shorten(tmp.rep.intBoost.pow(-1)) + "x to " + timeDisplayShort(Decimal.div(10, tmp.rep.baseEst), true, 2) + "." : "") : ""
}

function repChanceDisplay() {
	//CHANCE
	let chance = tmp.rep.chance
	let chanceDisplayEnding = (isChanceAffordable() && player.infinityPoints.lt(Decimal.pow(10, 1e10)) ? "<br>+1% Cost: " + shortenCosts(getRepChanceCost()) + " IP" : "")
	el("replicantichance").innerHTML = "Replicate " + (tmp.rep.freq ? "amount: " + shorten(tmp.rep.freq) + "x" : "chance: " + formatPercentage(chance, 0) + "%") + chanceDisplayEnding
	el("replicantichance").className = (player.infinityPoints.gte(getRepChanceCost()) && isChanceAffordable()) ? "storebtn" : "unavailablebtn"
}

function repIntervalDisplay() {
	//INTERVAL
	let baseInt = player.replicanti.interval
	let interval = Decimal.div(tmp.rep.interval, 1e3).times(10)
	el("replicantiinterval").innerHTML = "Interval: " + timeDisplayShort(interval, true, 3) +
		(isIntervalAffordable() && player.infinityPoints.lt(Decimal.pow(10, 1e10)) ?
			"<br> -> " + timeDisplayShort(interval.times(getReplicantiBaseInterval(baseInt, 1).div(getReplicantiBaseInterval(baseInt))), true, 3) + 
			" Cost: " + shortenCosts(replicantiIntervalCost(baseInt)) + " IP"
		: "")
	el("replicantiinterval").className = (player.infinityPoints.gte(player.replicanti.intervalCost) && isIntervalAffordable()) ? "storebtn" : "unavailablebtn"
}

function repGalDisplay() {
	//GALAXIES
	let replGal = player.replicanti.gal
	let replGalOver = getMaxRG() - replGal
	let replGalScale = replGal >= (tmp.ngC ? 250 : 400) ? 2 : replGal >= 100 ? 1 : 0
	let replGalName = (replGalScale ? getGalaxyScaleName(replGalScale) : "Max ") + "Replicated Galaxies"
	let replGalCostPortion = player.infinityPoints.lt(Decimal.pow(10, 1e10)) && player.replicanti.galCost.lt(1/0) ? "<br>+1 Cost: " + shortenCosts(getRGCost()) + " IP" : ""
	el("replicantimax").innerHTML = replGalName + ": " + getFullExpansion(replGal) + (replGalOver > 0 ? "+" + getFullExpansion(replGalOver) : "") + replGalCostPortion
	el("replicantireset").innerHTML = (
		hasAch("ngpp16") ? "Get "
		: (aarMod.ngp3c && ETER_UPGS.has(6)) ? "Divide replicanti amount by " + shorten(Number.MAX_VALUE) + ", but get "
		: "Reset replicanti amount, but get "
	) + "1 free galaxy.<br>" +
		getFullExpansion(player.replicanti.galaxies) +
		(tmp.extraRG > 0 ? " + " + getFullExpansion(tmp.extraRG) : "") +
		" replicated galax" + (getTotalRGs() == 1 ? "y" : "ies") + " created."
	el("replicantimax").className = (player.infinityPoints.gte(getRGCost())) ? "storebtn" : "unavailablebtn"
	el("replicantireset").className = (canGetReplicatedGalaxy()) ? "storebtn" : "unavailablebtn"
}

function repModDisplay() {
	//NG+3
	if (QCs_tmp.qc1) QCs.data[1].updateDispOnTick()
	if (QCs_tmp.qc5) QCs.data[5].updateDispOnTick()

	//CONDENSED
	if (tmp.ngC) ngC.condense.rep.update()
}

function initialTimeStudyDisplay(){
	let dbExp = ECComps("eterc13") ? getECReward(13) : 1

	el("11desc").textContent = "Currently: " + shortenMoney(tsMults[11]()) + "x"
	el("32desc").textContent = "You gain " + getFullExpansion(Math.ceil(tsMults[32]())) + "x more Infinities (based on Dimension Boosts)"
	el("51desc").textContent = "You gain " + shortenCosts(aarMod.newGameExpVersion ? 1e30 : 1e15) + "x more IP"
	el("71desc").textContent = "Currently: " + shortenMoney(tmp.sacPow.pow(0.25).max(1).min("1e210000")) + "x"
	el("72desc").textContent = "Currently: " + shortenMoney(tmp.sacPow.pow(0.04).max(1).min("1e30000")) + "x"
	el("73desc").textContent = "Currently: " + shortenMoney(tmp.sacPow.pow(0.005).max(1).min("1e1300")) + "x"
	el("82desc").textContent = "Currently: " + shortenMoney(Decimal.pow(1.0000109, Decimal.pow(getTotalDBs(), 2)).min(player.meta==undefined?1/0:'1e80000')) + "x"
	el("83desc").textContent = "Currently: " + shorten(tsMults[83]().pow(dbExp)) + "x"
	el("91desc").textContent = "Currently: " + shortenMoney(Decimal.pow(10, Math.min(player.thisEternity, 18000)/60)) + "x"
	el("92desc").textContent = "Currently: " + shortenMoney(Decimal.pow(2, 600/Math.max(player.bestEternity, 20))) + "x"
	el("93desc").textContent = "Currently: " +  shortenMoney(Decimal.pow(player.totalTickGained, 0.25).max(1)) + "x"
	el("121desc").textContent = "Currently: " + (tmp.ngp3_boost && hasAch("ngpp11") ? 50 : (253 - averageEp.dividedBy(player.epmult).dividedBy(10).min(248).max(3))/5).toFixed(1) + "x"
	el("123desc").textContent = "Currently: " + Math.sqrt(1.39*player.thisEternity/10).toFixed(1) + "x"
	el("141desc").textContent = "Currently: " + shorten(tsMults[141]()) + "x"
	el("142desc").textContent = "You gain " + shortenCosts(1e25) + "x more IP"
	el("143desc").textContent = "Currently: " + shortenMoney(Decimal.pow(15, Math.log(player.thisInfinityTime)*Math.pow(player.thisInfinityTime, 0.125))) + "x"
	el("151desc").textContent = shortenCosts(1e4) + "x multiplier on all Time Dimensions"
	el("161desc").textContent = shortenCosts(Decimal.pow(10, (inNGM(2) ? 6660 : 616) *  ( aarMod.newGameExpVersion ? 5 : 1))) + "x multiplier on all normal dimensions"
	el("162desc").textContent = shortenCosts(Decimal.pow(10, (inNGM(2) ? 234 : 11) * (aarMod.newGameExpVersion ? 5 : 1))) + "x multiplier on all Infinity dimensions"
	el("192desc").textContent = aarMod.ngp3c ? "The Replicanti limit is multiplied by your Time Shards." : "You can get beyond " + shortenMoney(Number.MAX_VALUE) + " replicantis, but the interval is increased the more you have"
	el("193desc").textContent = "Currently: " + shortenMoney(Decimal.pow(1.03, Decimal.min(1e7, Decimal.div(getEternitied(), tmp.ngC ? 1e6 : 1))).min("1e13000")) + "x"
	el("212desc").textContent = "Currently: " + ((tsMults[212]() - 1) * 100).toFixed(2) + "%"
	el("214desc").textContent = "Currently: " + shortenMoney(((tmp.sacPow.pow(8)).min("1e46000").times(tmp.sacPow.pow(1.1)).div(tmp.sacPow)).max(1).min(E("1e125000"))) + "x"
	el("221desc").textContent = "Currently: " + shorten(tsMults[221]()) + "x"
	el("224desc").textContent = "Currently: +" + getFullExpansion(tsMults[224]())
	el("225desc").textContent = "Currently: +" + getFullExpansion(Math.floor(tsMults[225]() * extraReplMulti)) + " extra RGs" 
	el("226desc").textContent = "Currently: +" + getFullExpansion(Math.floor(tsMults[226]() * extraReplMulti)) + " extra RGs"
	el("227desc").textContent = "Currently: " + shorten(tsMults[227]()) + "x"
	el("231desc").textContent = "Currently: " + shorten(tsMults[231]().pow(dbExp)) + "x power"
	el("232desc").textContent = "Currently: " + formatPercentage(tsMults[232]() - 1) + "%"
	el("233desc").textContent = "Currently: " + shorten(tsMults[233]()) + "x"

	el("metaCost").textContent = shortenCosts(getMetaUnlCost())
}

function eternityChallengeUnlockDisplay(){
	var ec1Mult=aarMod.newGameExpVersion?1e3:2e4
	if (player.etercreq !== 1) el("ec1unl").innerHTML = "Eternity Challenge 1<span>Requirement: "+(ECComps("eterc1")+1)*ec1Mult+" Eternities<span>Cost: 30 Time Theorems"
	else el("ec1unl").innerHTML = "Eternity Challenge 1<span>Cost: 30 Time Theorems"
	if (player.etercreq !== 2) el("ec2unl").innerHTML = "Eternity Challenge 2<span>Requirement: "+(1300+(ECComps("eterc2")*150))+" Tickspeed upgrades gained from time dimensions<span>Cost: 35 Time Theorems"
	else el("ec2unl").innerHTML = "Eternity Challenge 2<span>Cost: 35 Time Theorems"
	if (player.etercreq !== 3) el("ec3unl").innerHTML = "Eternity Challenge 3<span>Requirement: "+(17300+(ECComps("eterc3")*1250))+" 8th dimensions<span>Cost: 40 Time Theorems"
	else el("ec3unl").innerHTML = "Eternity Challenge 3<span>Cost: 40 Time Theorems"
	if (player.etercreq !== 4) el("ec4unl").innerHTML = "Eternity Challenge 4<span>Requirement: "+(1e8 + (ECComps("eterc4")*5e7)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" infinities<span>Cost: 70 Time Theorems"
	else el("ec4unl").innerHTML = "Eternity Challenge 4<span>Cost: 70 Time Theorems"
	if (player.etercreq !== 5) el("ec5unl").innerHTML = "Eternity Challenge 5<span>Requirement: "+(160+(ECComps("eterc5")*14))+" galaxies<span>Cost: 130 Time Theorems"
	else el("ec5unl").innerHTML = "Eternity Challenge 5<span>Cost: 130 Time Theorems"
	if (player.etercreq !== 6) el("ec6unl").innerHTML = "Eternity Challenge 6<span>Requirement: "+(40+(ECComps("eterc6")*5))+" replicanti galaxies<span>Cost: 85 Time Theorems"
	else el("ec6unl").innerHTML = "Eternity Challenge 6<span>Cost: 85 Time Theorems"
	if (player.etercreq !== 7) el("ec7unl").innerHTML = "Eternity Challenge 7<span>Requirement: "+shortenCosts(E("1e500000").times(E("1e300000").pow(ECComps("eterc7"))))+" antimatter <span>Cost: 115 Time Theorems"
	else el("ec7unl").innerHTML = "Eternity Challenge 7<span>Cost: 115 Time Theorems"
	if (player.etercreq !== 8) el("ec8unl").innerHTML = "Eternity Challenge 8<span>Requirement: "+shortenCosts(E("1e4000").times(E("1e1000").pow(ECComps("eterc8"))))+" IP <span>Cost: 115 Time Theorems"
	else el("ec8unl").innerHTML = "Eternity Challenge 8<span>Cost: 115 Time Theorems"
	if (player.etercreq !== 9) el("ec9unl").innerHTML = "Eternity Challenge 9<span>Requirement: "+shortenCosts(E("1e17500").times(E("1e2000").pow(ECComps("eterc9"))))+" infinity power<span>Cost: 415 Time Theorems"
	else el("ec9unl").innerHTML = "Eternity Challenge 9<span>Cost: 415 Time Theorems"
	if (player.etercreq !== 10) el("ec10unl").innerHTML = "Eternity Challenge 10<span>Requirement: "+shortenCosts(E("1e100").times(E("1e20").pow(ECComps("eterc10"))))+" EP<span>Cost: 550 Time Theorems"
	else el("ec10unl").innerHTML = "Eternity Challenge 10<span>Cost: 550 Time Theorems"

	el("ec11unl").innerHTML = "Eternity Challenge 11<span>Requirement: Use only the Normal Dimension path<span>Cost: 1 Time Theorem"
	el("ec12unl").innerHTML = "Eternity Challenge 12<span>Requirement: Use only the Time Dimension path<span>Cost: 1 Time Theorem"
}

function mainTimeStudyDisplay(){
	initialTimeStudyDisplay()
	eternityChallengeUnlockDisplay()
	el("dilstudy1").innerHTML = "Unlock time dilation" +
		(player.dilation.studies.includes(1) || pH.did("quantum") ? "" :
		"<span>Requirement: 5 EC11 and EC12 completions" + (tmp.ngp3 ? "" : " and " + getFullExpansion(getDilationTotalTTReq()) + " total theorems")) +
		"<span>Cost: " + getFullExpansion(dsStudyCosts[1]()) + " Time Theorems"
}

function ABTypeDisplay(){
	if (getEternitied() > 4) el("togglecrunchmode").style.display = "inline-block"
	else el("togglecrunchmode").style.display = "none"
	if (getEternitied() > 8 || player.autobuyers[10].bulkBought) el("galaxybulk").style.display = "inline-block"
	else el("galaxybulk").style.display = "none"
	if (getEternitied() >= 100 && player.meta) el("toggleautoetermode").style.display = "inline-block"
	else el("toggleautoetermode").style.display = "none"
	el("maxAutobuyerUpgrades").style.display = tmp.ngp3_boost ? "" : "none"
}

function infPoints2Display(){
	if (pH.did("infinity")) el("infinityPoints2").style.display = "inline-block"
	else el("infinityPoints2").style.display = "none"
}

function updateChallTabDisplay(){
	if (player.postChallUnlocked > 0 || Object.keys(player.eternityChalls).length > 0 || player.eternityChallUnlocked !== 0 || pH.did("quantum")) el("challTabButtons").style.display = "table"
}

function eterPoints2Display(){
	el("eternityPoints2").innerHTML = "You have <span class=\"EPAmount2\">"+shortenDimensions(player.eternityPoints)+"</span> Eternity points."
}

function dimboostABTypeDisplay(){
	if (getEternitied() > 9 || player.autobuyers[9].bulkBought) el("bulklabel").textContent = "Buy max dimboosts every X seconds:"
	else el("bulklabel").textContent = "Bulk DimBoost Amount:"
}

function IDABDisplayCorrection(){
	if (getEternitied() > 10) {
		for (var i=1;i<getEternitied()-9 && i < 9; i++) {
			el("infauto"+i).style.visibility = "visible"
		}
		el("toggleallinfdims").style.visibility = "visible"
	} else {
		for (var i=1; i<9; i++) {
			el("infauto"+i).style.visibility = "hidden"
		}
		el("toggleallinfdims").style.visibility = "hidden"
	}
}

function replicantiShopABDisplay(){
	if (getEternitied() >= 40) el("replauto1").style.visibility = "visible"
	else el("replauto1").style.visibility = "hidden"
	if (getEternitied() >= 60) el("replauto2").style.visibility = "visible"
	else el("replauto2").style.visibility = "hidden"
	if (getEternitied() >= 80) el("replauto3").style.visibility = "visible"
	else el("replauto3").style.visibility = "hidden"
}

function setStatsDisplay(toggle) {
	if (toggle) aarMod.hideStats = !aarMod.hideStats
	el("showStats").textContent = (aarMod.hideStats ? "Show" : "Hide") + " statistics"
}

function setAchsDisplay(toggle) {
	if (toggle) aarMod.hideAchs = !aarMod.hideAchs
	el("showAchs").textContent = (aarMod.hideAchs ? "Show" : "Hide") + " achievements"
}

function primaryStatsDisplayResetLayers() {
	let showStats = false
	let statsIds = {
		infinity: "pastinfs",
		eternity: "pasteternities",
		quantum: "pastquantums",
		ghostify: "pastghostifies"
	}
	for (var i in statsIds) {
		var shown = pH.shown(i)
		showStats = showStats || shown
		el(statsIds[i]).style.display = shown ? "" : "none"
	}

	el("brfilter").style.display = showStats
	el("statstabs").style.display = showStats

	var display = aarMod.hideSecretAchs ? "none " : ""
	el("achTabButtons").style.display=display
	el("secretachsbtn").style.display=display
}

function ECCompletionsDisplay(){
	for (let x = 1; x <= mTs.ecsUpTo; x++) el("eterc" + x + "completed").textContent = "Completed " + ECComps("eterc" + x) + " times."
}

function ECchallengePortionDisplay(){
	let ec12TimeLimit = Math.round(getEC12TimeLimit() * 10) / 100
	for (var c=1;c<15;c++) el("eterc"+c+"goal").textContent = "Goal: "+shortenCosts(getECGoal("eterc"+c))+" IP"+(c==12?" in "+ec12TimeLimit+" second"+(ec12TimeLimit==1?"":"s")+" or less.":c==4?" in "+Math.max((16-(ECComps("eterc4")*4)),0)+" infinities or less.":"")
}

function EC8PurchasesDisplay(){
	if (player.currentEternityChall == "eterc8") {
		el("eterc8repl").style.display = "block"
		el("eterc8ids").style.display = "block"
		el("eterc8repl").textContent = "You have "+player.eterc8repl+" purchases left."
		el("eterc8ids").textContent = "You have "+player.eterc8ids+" purchases left."
	} else {
		el("eterc8repl").style.display = "none"
		el("eterc8ids").style.display = "none"
	}
}

function bankedInfinityDisplay(){
	el("infinitiedBank").style.display = (player.infinitiedBank > 0) ? "block" : "none"
	el("infinitiedBank").textContent = "You have " + getFullExpansion(player.infinitiedBank) + " banked infinities."
	var bankedInfGain=gainBankedInf()
	el("bankedInfGain").style.display = bankedInfGain>0 ? "block" : "none"
	el("bankedInfGain").textContent = "You will gain " + getFullExpansion(bankedInfGain) + " banked infinities on next Eternity."
}

function updateNGM2RewardDisplay(){
	el("postcngmm_1reward").innerHTML = "Reward: Infinity upgrades based on time " + (tmp.ngmX >= 4 ? "" : "or Infinities ") + "are applied post-dilation, and make the GP formula better based on galaxies."
	el("postcngm3_1description").innerHTML = "Multiplier per ten Dimensions is 1x, Dimension Boosts have no effect," + (tmp.ngmX >= 4 ? " have a much lower time dimension cost limit," : "") + " and Tickspeed Boost effect softcap starts immediately."
	el("postcngm3_1reward").innerHTML = "Reward: Tickspeed boost effect softcap is softer" + (tmp.ngmX >= 4 ? ", remote galaxy scaling starts .5 later and triple GP per IC completion" : "") + "."
}

function updateGalaxyUpgradesDisplay(){
	var text41 = tmp.ngmX >= 4 ? "Square g11, and tickspeed boosts multiply GP gain." : "Galaxy points boost per-10 bought Infinity Dimensions multiplier."
	el("galaxy41").innerHTML = text41 + "<br>Cost: <span id='galcost41'></span> GP"
	var text42 = tmp.ngmX >= 4 ? "Buff g12 and make it post dilation." : "Eternity points reduce Infinity Dimension cost multipliers."
	el("galaxy42").innerHTML = text42 + "<br>Cost: <span id='galcost42'></span> GP"
	var text43 = tmp.ngmX >= 4 ? "Reduce Dimension Boost cost multiplier by 1, and Dimension Boosts multiply GP gain." : "Galaxy points boost Time Dimensions."
	var curr43 = tmp.ngmX >= 4 ? "" : "<br>Currently: <span id='galspan43'>?</span>x"
	el("galaxy43").innerHTML = text43 + curr43 + "<br>Cost: <span id='galcost43'></span> GP"
}

//Automation Tabs
let autoTab

function showAutoTab(tabName) {
	if (el("automationbtn").style.display != "") {
		var autoPos = {
			autobuyers: showInfTab,
			automaticghosts: showGhostifyTab
		}
		autoPos[tabName](tabName)
		return
	}

	//iterate over all elements in div_tab class. Hide everything that's not tabName and show tabName
	var tabs = document.getElementsByClassName('autotab');
	var tab;
	var oldTab
	for (var i = 0; i < tabs.length; i++) {
		tab = tabs.item(i);
		if (tab.style.display == 'block') oldTab = tab.id
		if (tab.id === tabName) {
			tab.style.display = 'block';
		} else {
			tab.style.display = 'none';
		}
	}

	autoTab = tabName
	if (oldTab !== tabName) aarMod.tabsSave.tabAuto = tabName
}

function moveAutoTabs() {
	let autoUnl = pH.did(tmp.ngmX >= 4 ? "galaxy" : "infinity")
	let autoShown = autoUnl && (forceAutoTab() || aarMod.showAuto) && !isEmptiness

	el("showAuto").style.display = autoUnl && !forceAutoTab() ? "" : "none"
	el("showAuto").textContent = (aarMod.showAuto ? "Hide" : "Show") + " general automation tab"

	el("automationbtn").style.display = autoShown ? "" : "none"

	moveAutoTab("autobuyers", "ab", "autobuyersbtn", "inf", autoShown || tmp.ngmX >= 4, "preinf")

	moveAutoTab("automaticghosts", "ag", "agtabbtn", "ghostify", autoShown, "neutrinos")
	el("agbtn_pos_no_auto").style.display = autoShown ? "none" : ""
}

function forceAutoTab() {
	return (pH.did("infinity") && !pH.shown("infinity")) || tmp.ngmX >= 4
}

function toggleAutoTab() {
	aarMod.showAuto = !aarMod.showAuto
	moveAutoTabs()
}

function moveAutoTab(id, abb, btn, pos, autoShown, back) {
	let word = "_pos_" + (autoShown ? "yes" : "no") + "_auto"

	let elm = el(id)
	let rootId = elm.parentElement.id

	if (abb + word != rootId) el(abb + word).appendChild(elm)
	el(abb + "btn" + word).appendChild(el(btn))
	if (elm.className != "autotab" && autoShown) {
		var autoPos = {
			autobuyers: showInfTab,
			automaticghosts: showGhostifyTab
		}
		autoPos[id](back)

		if (autoTab == id) elm.style.display = ""
	}
	if (elm.className == "autotab" && !autoShown && autoTab == id) elm.style.display = "none"
	el(id).className = autoShown ? "autotab" : pos + "tab"
}

function setProgressBar(mode, id) {
	var type = aarMod.featureProgress === true ? 1 : aarMod.featureProgress || 0

	//OPTIONS
	if (mode == "toggle") {
		if (id == "featureProgress") {
			type = (type + 1) % 3
			aarMod[id] = type
			showHideFooter()
		} else aarMod[id] = !aarMod[id]
	}
	if (mode == "setup" || mode == "toggle") {
		el("progressBarBtn").textContent = (aarMod.progressBar ? "Hide" : "Show") + " progress bar"
		el("featureProgress").style.display = aarMod.progressBar && tmp.ngmX < 2 ? "" : "none"
		el("featureProgress").textContent = "Progress bar: " + ["Normal", "Feature", "Googological"][type]
	}
	if (mode == "setup") return

	//PROGRESS BAR DISPLAY
	el("progress").style.display = el("options").style.display == "block" ? "none" :
		!aarMod.progressBar ? "none" :
		aarMod.featureProgress ? "block" :
		el("dimensions").style.display != "block" ? "none" :
		el("antimatterdimensions").style.display == "block" ? "block" :
		el("metadimensions").style.display == "block" ? "block" :
		"none"
}

function doFeatureProgress() {
	let percentage
	let feature
	let res
	let resFormat = shorten
	let req
	let reqNum

	if (pH.did("fluctuate")) {
		if (fluc_save.energy < 11) {
			res = fluc_save.energy
			reqFormat = shortenDimensions(res)
			reqNum = 11
			req = shortenCosts(reqNum) + " Fluctuant Energy"
			percentage = res / reqNum
			feature = "???"
		}
	} else if (str.unl()) {
		res = player.money
		resFormat = shortenCosts
		reqNum = Decimal.pow(10, Math.pow(10, 13.5))
		req = shortenCosts(reqNum) + " antimatter"
		percentage = res.log(reqNum)
		feature = "Fluctuate"
	} else if (PCs.unl()) {
		res = PCs_save.comps.length
		reqNum = 8
		req = reqNum + " PC combinations"
		percentage = res / reqNum
		feature = "Strings"
	} else if (QCs.unl()) {
		res = QCs_save.comps
		reqNum = 7
		req = reqNum + " QC completions"
		percentage = res / reqNum
		feature = "Paired Challenges"
	} else if (pos.unl()) {
		res = pos_save.energy
		reqNum = 5
		req = reqNum + " Positronic Charge"
		percentage = res / reqNum
		feature = "Quantum Challenges"
	} else if (tmp.quUnl) {
		res = qu_save.quarkEnergy
		reqNum = tmp.exMode ? 5.3 : 3
		req = reqNum + " Quantum Energy"
		percentage = res / reqNum
		feature = "Positrons"
	} else if (hasDilationStudy(6)) {
		res = player.meta.antimatter
		reqNum = getQuantumReq()
		req = reqNum + " meta-antimatter"
		percentage = res.log(reqNum)
		feature = "Quantum"
	} else if (pH.did("eternity")) {
		res = getTotalTT(player)
		reqNum = 13000
		req = reqNum + " total TT"
		percentage = res / reqNum
		feature = "Dilation (approximately)"
	} else if (pH.did("infinity")) {
		res = player.infinityPoints
		reqNum = Number.MAX_VALUE
		req = reqNum + " Infinity points"
		percentage = res.log(reqNum)
		feature = "Eternity"
	} else {
		res = player.money
		reqNum = Number.MAX_VALUE
		req = reqNum + " antimatter"
		percentage = res.log(reqNum)
		feature = "Infinity"
	}

	percentage = percentage === undefined ? "100%" : Math.min(percentage * 100, 100).toFixed(1) + "%"
	el("progressbar").style.width = percentage
	el("progresspercent").textContent = percentage
	el("progresspercent").setAttribute('ach-tooltip', feature ? "Reach " + req + " to unlock " + feature + ". (" + resFormat(res) + " / " + resFormat(reqNum) + ")" : "All features unlocked!")
}

var googolMilestones = [
	//[Name, Exponent]
	["Googol (10^100)", 100],
	["Centillion (10^303)", 303],
	["Faxul (200!)", 374.8968886400403],
	["Googolchime (10^1,000)", 1e3],
	["Millillion (10^3,003)", 3003],
	["Googolbell (10^5,000)", 5e3],
	["Googoltoll (10^10,000)", 1e4],
	["Myrillion (10^30,003)", 30003],
	["Googolgong (10^100,000)", 1e5],
	["Maximusmillillion (10^1,000,003)", 1e6+3],
	["Micrillion (10^3,000,003)", 3e6+3],
	["Googolbong (10^100,000,000)", 1e8],
	["Nanillion (10^3,000,000,003)", 3e9+3],
	["Trialogue (10^10^10)", 1e10],
	["Googolthrong (10^10^11)", 1e11],
	["Picillion (10^(3*10^12+3))", 3e12+3],
	["Googolgandingan (10^10^14)", 1e14],
	["Femtillion (10^(3*10^15+3))", 3e15+3],
	["Attillion (10^(3*10^18+3))", 3e18+3],
	["Zeptillion (10^(3*10^21+3))", 3e21+3],
]

function doGoogologicalProgress() {
	var am = new Decimal(player.totalmoney)
	var req = googolMilestones[tmp.googol][1]
	while (googolMilestones.length - 1 >= tmp.googol && am.gte(Decimal.pow(10, req))) {
		tmp.googol++
		req = googolMilestones[tmp.googol][1]
	}

	var percentage = Math.min(am.log10() / req * 100, 100).toFixed(2) + "%"
	el("progressbar").style.width = percentage
	el("progresspercent").textContent = percentage
	el("progresspercent").setAttribute('ach-tooltip', "Percentage to " + googolMilestones[tmp.googol][0] + " antimatter")
}