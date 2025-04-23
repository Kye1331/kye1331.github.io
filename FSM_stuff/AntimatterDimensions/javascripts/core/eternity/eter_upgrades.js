let ETER_UPGS = {
	has(x) {	
		return tmp.eterUnl && player.eternityUpgrades.includes(x)
	},

	total: 15,
	1: {
		unl: () => true,
		cost: 5,
		mult: () => player.eternityPoints.plus(1),
		desc: () => "Infinity Dimension multiplier based on unspent EP." + (shiftDown ? " (x+1)" : "")
	},
	2: {
		unl: () => true,
		cost: 10,
		eternities(){
			let e = c_max(getEternitied(), 0)
			if (typeof(e) == "number" && isNaN(e)) e = 0
			return e
		},
		mult() {
			let e = this.eternities()

			if (player.boughtDims) return Decimal.pow(e, Decimal.times(e, 2).add(1).log(4))

			let cap = c_min(e, 1e5)
			let soft = 0
			if (e > 1e5) soft = c_sub(e, cap)

			let achReward = 1
			if (hasAch("ngpp15")) {
				if (tmp.ngC || tmp.ngp3) {
					achReward = Decimal.pow(10, Math.pow(Decimal.log10(Decimal.add(e, 10)), tmp.ngC ? 3 : 5))
					if (tmp.ngp3) achReward = softcap(achReward, "eu2")
				} else return Decimal.pow(e, Math.min(1e4, Math.pow(e, .3)))
			}

			let div1 = tmp.ngC ? 100 : 200
			let div2 = tmp.ngC ? 2 : 4
			let tim1 = tmp.ngC ? 4 : 2
			return Decimal.pow(cap / div1 + 1, Math.log(cap * tim1 + 1) / Math.log(div2)).times(Decimal.div(soft, div1).add(1).times(Decimal.times(soft, div2).add(1).log(div2)).max(1)).max(achReward)
		},
		desc() {
			let eu2formula = "(x/200)^log4(2x)"
			if (tmp.ngC) eu2formula = "(x/100)^log2(4x)"
			if (player.boughtDims !== undefined) eu2formula = "x^log4(2x)"
			else if (hasAch("ngpp15")) eu2formula = tmp.ngC ? "x^log10(x)^2" : "10^log(x)^5"

			return "Infinity Dimension multiplier based on Eternities." + (shiftDown ? " (" + eu2formula + ")" : "")
		}
	},
	3: {
		unl: () => true,
		cost: 5e4,
		mult() {
			if (player.boughtDims) return player.timeShards.div(1e12).plus(1)
			if (tmp.ngC) return Decimal.pow(6250 / Math.max(Math.min(infchallengeTimes, 6250), 6.1), 500 / Math.max(infchallengeTimes, 6.1))
			return Decimal.pow(2, 300 / Math.max(infchallengeTimes, 6.1))
		},
		desc: () => "Infinity Dimension multiplier based on " + (player.boughtDims ? "Time Shards. (x/"+shortenCosts(1e12) + " + 1)" : "sum of Infinity Challenge times.")
	},
	4: {
		unl: () => true,
		cost: 1e16,
		mult: () => player.achPow,
		desc: () => "Your achievement bonus affects Time Dimensions."
	},
	5: {
		unl: () => true,
		cost: 1e40,
		mult: () => Math.max(player.timestudy.theorem, 1),
		desc: () => "Time Dimensions gain a multiplier based on your unspent Time Theorems."
	},
	6: {
		unl: () => true,
		cost: 1e60,
		mult() {
			let ngPlus = (aarMod.newGamePlusVersion ? 10368000 : 0)
			return (player.totalTimePlayed / 10 + ngPlus) / 86400
		},
		desc: () => "Time Dimensions gain a multiplier based on days played" + (tmp.ngC ? " and you can buy max RGs." : ".")
	},

	// NG Update
	7: {
		unl: () => player.exdilation !== undefined && hasDilationStudy(1),
		cost: "1e1500",
		mult: () => 1 + Math.log10(Math.max(1, player.money.log10())) / 40,
		desc: () => "Dilated time gain is boosted by antimatter."
	},
	8: {
		unl: () => player.exdilation !== undefined && hasDilationStudy(1),
		cost: "1e2000",
		mult: () => 1 + Math.log10(Math.max(1, player.infinityPoints.log10())) / 20,
		desc: () => "Dilated time gain is boosted by Infinity Points."
	},
	9: {
		unl: () => player.exdilation !== undefined && hasDilationStudy(1),
		cost: "1e3000",
		mult: () => 1 + Math.log10(Math.max(1, player.eternityPoints.log10())) / 10,
		desc: () => "Dilated time gain is boosted by Eternity Points."
	},

	// NG Condensed
	10: {
		unl: () => tmp.ngC,
		cost: "1e625",
		desc: () => "You can buy all studies in all three-way splits."
	},
	11: {
		unl: () => tmp.ngC,
		cost: "1e870",
		desc: () => "You can buy all black & white studies, and TS35 has no requirement."
	},
	12: {
		unl: () => tmp.ngC,
		cost: "1e1350",
		desc: () => "The Normal, Infinity, Replicated, & Time Condenser cost formulas are weaker."
	},

	// NG+3: Post-Mastery Studies
	13: {
		unl: () => tmp.ngp3,
		cost: "1e3000",
		desc: () => "You can buy all row-23 time studies."
	},
	14: {
		unl: () => tmp.ngp3,
		cost: "1e1500000",
		desc: () => "You can buy all row-22 time studies."
	},
	15: {
		unl: () => tmp.ngp3,
		cost: "1e2400000",
		desc: () => tmp.ngp3_mul ? "You can buy all possible time studies." : "You can buy up to 2 paths from second split."
	},

	updateDisplayOnTick() {
		for (let i = 1; i <= this.total; i++) {
			if (this[i].unl()) {
				let cost = E(this[i].cost)
				let mult = this[i].mult && this[i].mult()

				el("eter" + i).innerHTML = this[i].desc() + (mult ? "<br>Currently: " + shorten(mult) + "x" : "") + "<br>Cost: " + shortenCosts(cost) + " EP" 
			}
		}

		el("epmult").innerHTML = "You gain 5 times more EP<p>Currently: "+shortenDimensions(player.epmult)+"x<p>Cost: "+shortenDimensions(player.epmultCost)+" EP"
		el("epmult").className = player.eternityPoints.gte(player.epmultCost) ? "eternityupbtn" : "eternityupbtnlocked"
	},
	updateDisplayOnSecond() {
		for (let i = 1; i <= this.total; i++) {
			let unl = this[i].unl()

			el("eter" + i).parentElement.style.display = unl ? "" : "none"
			if (unl) el("eter" + i).className = ETER_UPGS.has(i) ? "eternityupbtnbought" : player.eternityPoints.gte(this[i].cost) ? "eternityupbtn" : "eternityupbtnlocked"
		}
	}
}

function updateEternityUpgrades() {
	ETER_UPGS.updateDisplayOnSecond()
}

function buyEternityUpgrade(name) {
	let cost = ETER_UPGS[name].cost
	if (player.eternityPoints.gte(cost) && !player.eternityUpgrades.includes(name)) {
		player.eternityUpgrades.push(name)
		if (player.eternityPoints.lt(Decimal.pow(10, 1e10))) player.eternityPoints = player.eternityPoints.minus(cost)
		updateEternityUpgrades();
		if (name == 4) {
			achMultLabelUpdate(); // Eternity Upgrade 4 applies achievement multiplier to Time Dimensions
		}
	}
}

function getEPMultCost(bought) {
	let base = 50
	let expAdd = 0
	if (tmp.ngmX < 2) {
		if (bought > 1334 && !ETER_UPGS.has(14)) expAdd += Math.pow(Math.max(bought - 1334, 0), 1.2)

		if (bought >= 482) base = 1e3
		else if (bought >= 154) base = 500
		else if (bought >= 59) base = 100
	}
	return Decimal.pow(base, bought + expAdd).times(500)	
}

function buyEPMult() {
	if (player.eternityPoints.gte(player.epmultCost)) {
		player.epmult = player.epmult.times(5)
		if (player.autoEterMode === undefined || player.autoEterMode === 'amount') {
			player.eternityBuyer.limit = Decimal.times(player.eternityBuyer.limit, 5);
			el("priority13").value = formatValue("Scientific", player.eternityBuyer.limit, 2, 0);
		}
		if (player.eternityPoints.lt(Decimal.pow(10, 1e10))) player.eternityPoints = player.eternityPoints.minus(player.epmultCost)
		player.epmultCost = getEPMultCost(Math.round(player.epmult.log(5)))
		updateEternityUpgrades()
	}
}

function buyMaxEPMult() {
	if (player.eternityPoints.lt(player.epmultCost)) return
	let bought = Math.round(player.epmult.ln() / Math.log(5))
	let data = doBulkSpent(player.eternityPoints, getEPMultCost, bought)

	if (player.eternityPoints.lt(Decimal.pow(10, 1e10))) player.eternityPoints = data.res
	let toBuy = data.toBuy

	player.epmult = player.epmult.times(Decimal.pow(5, toBuy))
	player.epmultCost = getEPMultCost(bought + toBuy)
	updateEternityUpgrades()
}