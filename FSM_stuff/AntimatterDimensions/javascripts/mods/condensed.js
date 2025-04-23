let CONDENSED = {
	setup() {
		aarMod.ngp3c = 1
		player.condensed = {}
	},
	compile() {
		if (player.condensed !== undefined) {
			alert("This mode is temporaily closed due to the conflicts of NG+3R. You will now exit NG+3C because of this.")
			delete player.condensed
		}
		delete ngC.tmp

		tmp.ngC = player.condensed !== undefined
		ngC.save = player.condensed
		ngC.resetHTML()

		if (!tmp.ngC) return
		if (ngC.save.normal === undefined) ngC.resetNDs()
		if (ngC.save.inf === undefined) ngC.resetIDs()
		if (ngC.save.repl === undefined) ngC.resetRepl()
		if (ngC.save.time === undefined) ngC.resetTDs()
	},
	updateTmp() {
		let data = {}
		ngC.tmp = data

		data.rep = {}
		if (player.replicanti.unl) {
			let data2 = data.rep
			data2.pow = ngC.condense.rep.pow()
			let rep = player.replicanti.amount
			rep = softcap(rep, "rep_ngC")
			
			data2.eff1 = Decimal.pow(rep.max(1).log10() / 3 + 1, Math.sqrt(ngC.save.repl * data2.pow) / 4)

			let c2 = ngC.save.repl
			if (c2 > 2) c2 = Math.cbrt(c2 * 4)
			if (c2 > 9) c2 = Math.pow(c2 / 9, 3) * 9

			let mult = hasTimeStudy(197) ? (rep.plus(1).log10() + 2) : 2
			data2.eff2 = E(rep.max(1).log10())
					.div(3)
					.times(Math.pow(c2 * data2.pow, 0.95) / 2.5)
					.times(hasTimeStudy(24) ? mult : 1)
					.plus(1)

			if (hasTimeStudy(23)) data2.eff1 = data2.eff1.plus(data2.eff2.sub(1).max(0))
		}

		data.tds = {
			pow: ngC.condense.tds.pow(),
			free: ngC.condense.tds.free()
		}

		data.ids = {
			pow: ngC.condense.ids.pow(),
			free: ngC.condense.ids.free()
		}

		data.nds = {
			pow: ngC.condense.nds.pow(),
			free: ngC.condense.nds.free()
		}
	},
	resetDims(type) {
		let data = [0]
		for (var d = 1; d <= 8; d++) data.push(0)
		ngC.save[type] = data
	},
	resetNDs(type) {
		ngC.resetDims("normal")
	},
	resetIDs(type) {
		ngC.resetDims("inf")
	},
	resetTDs(type) {
		ngC.resetDims("time")
	},
	resetRepl(type) {
		ngC.save.repl = 0
	},
	resetHTML() {
		for (var d = 1; d <= 8; d++) {
			el("CondenseDiv" + d).style.display = tmp.ngC ? "" : "none"
			el("infCndCont" + d).style.display = tmp.ngC ? "" : "none"
			el("timeCndCont" + d).style.display = tmp.ngC ? "" : "none"
		}
		el("postinfir7").style.display = tmp.ngC ? "" : "none"
		el("postinfir8").style.display = tmp.ngC ? "" : "none"
		el("replNGC").style.display = tmp.ngC ? "" : "none"
	},
	condense: {
		costStart: {
			1: 100,
			2: 1e4,
			3: 1e8,
			4: 1e16,
			5: 1e32,
			6: 1e45,
			7: 1e65,
			8: 1e80,
		},
		costBaseMult: {
			1: 10,
			2: 25,
			3: 100,
			4: 1e4,
			5: 1e8,
			6: 1e10,
			7: 1e15,
			8: 1e20,
		},
		nds: {
			cost(x) {
				let bought = ngC.save.normal[x]
				return Decimal.pow(ngC.condense.costBaseMult[x], Math.pow(bought, this.costScale()))
					.times(ngC.condense.costStart[x])
					.div(this.costDiv())
			},
			costScale() {
				let x = 1
				if (player.infinityUpgrades.includes("postinfi70")) x *= 0.6
				if (ETER_UPGS.has(12)) x *= 2/3 
				//uh wtf is this supposed to be s
				//so i changed it cause im almost certain its wrong but feel free to change back
				return Math.pow(1.5, x) + 1
			},
			costDiv() {
				let div = 1
				if (hasTimeStudy(202)) div = tsMults[202]()
				return div
			},
			target(x) {
				let res = getOrSubResource(x)
				return Math.floor(Math.pow(
					res.times(this.costDiv())
						.div(ngC.condense.costStart[x])
						.log(ngC.condense.costBaseMult[x])
				, 1 / this.costScale()) + 1)
			},
			free() {
				return 0
			},
			pow() {
				let pow = 1
				if (player.galaxies >= 2) pow *= (Math.sqrt(player.galaxies * 2) * 2) / 3
				if (player.infinityUpgrades.includes("postinfi70")) pow *= ngC.breakInfUpgs[70]()
				if (player.infinityUpgrades.includes("postinfi72")) pow *= ngC.breakInfUpgs[72]()
				if (player.challenges.includes("postc4")) pow *= 1.25
				if (player.challenges.includes("postcngc_2")) pow *= 1.15
				return pow
			},
			eff(x) {
				if (!ngC.tmp) return E(1)
				let amt = ngC.save.normal[x] + ngC.tmp.nds.free
				return Decimal.pow(player.money.plus(1).log10() + 1, amt * ngC.tmp.nds.pow)
			},
			update(x) {
				let costPart = pH.did("quantum") ? '' : 'Condense: '
				let cost = this.cost(x)
				let resource = getOrSubResource(x)
				el("Condense" + x).textContent = costPart + shortenPreInfCosts(cost)
				el("Condense" + x).className = resource.gte(cost) ? 'storebtn' : 'unavailablebtn'
			},
			buy(x) {
				let res = getOrSubResource(x)
				let cost = this.cost(x)
				if (res.lt(cost)) return
				if (getAmount(1) == 0) {
					alert("You need to buy at least 1 of Normal Dimensions to condense Normal Dimensions.")
					return
				}

				getOrSubResource(x, cost)
				ngC.save.normal[x]++
			},
			max(x) {
				let res = getOrSubResource(x)
				let cost = this.cost(x)
				if (res.lt(cost) || getAmount(1) == 0) return

				ngC.save.normal[x] = Math.max(ngC.save.normal[x], this.target(x))
				getOrSubResource(x, cost)
			}
		},
		ids: {
			cost(x) {
				let bought = ngC.save.inf[x]
				return Decimal.pow(ngC.condense.costBaseMult[x], Math.pow(bought, 3.5) * this.costScale())
					.times(Math.pow(ngC.condense.costStart[x], 2.5))
					.div(this.costDiv())
			},
			costScale() {
				let x = 1
				if (ETER_UPGS.has(12)) x *= 2/3
				return x
			},
			costDiv() {
				let div = E(1)
				if (player.infinityUpgrades.includes("postinfi81")) div = div.times(ngC.breakInfUpgs[81]())
				return div
			},
			target(x) {
				let res = player.infinityPoints
				return Math.floor(Math.pow(
					res.times(this.costDiv())
						.div(Math.pow(ngC.condense.costStart[x], 2.5))
						.log(ngC.condense.costBaseMult[x])
					/ this.costScale()
				, 1 / 3.5) + 1)
			},
			free() {
				return 0
			},
			pow() {
				let ret = 1
				if (player.challenges.includes("postcngc_1")) ret *= ngC.ic9Eff()
				if (player.challenges.includes("postcngc_2")) ret *= 1.15
				if (hasTimeStudy(13)) ret *= tsMults[13]()
				if (hasDilationUpg("ngp3c2")) ret *= 3
				return ret
			},
			eff(x) {
				if (!ngC.tmp) return E(1)
				let amt = ngC.save.inf[x] + ngC.tmp.ids.free
				return Decimal.pow(player.infinityPower.plus(1).log10() + 1, amt * ngC.tmp.ids.pow)
			},
			update(x) {
				if (!pH.did("infinity")) {
					el("infCnd" + x).textContent = "Condense: LOCKED"
					return
				}

				let costPart = pH.did("quantum") ? '' : 'Condense: '
				let cost = this.cost(x)
				let resource = player.infinityPoints
				el("infCnd" + x).textContent = costPart + shortenPreInfCosts(cost) + (inNGM(5) ? " IP" : "")
				el("infCnd" + x).className = resource.gte(cost) ? 'storebtn' : 'unavailablebtn'
			},
			buy(x) {
				let res = player.infinityPoints
				let cost = this.cost(x)
				if (res.lt(cost)) return

				ngC.save.inf[x]++
				player.infinityPoints = player.infinityPoints.sub(cost)
			},
			max(x) {
				let res = player.infinityPoints
				let cost = this.cost(x)
				if (res.lt(cost)) return

				ngC.save.inf[x] = Math.max(ngC.save.inf[x], this.target(x))
				player.infinityPoints = player.infinityPoints.sub(cost)
			},
		},
		rep: {
			cost() {
				let c = ngC.save.repl
				let cost = Decimal.pow(10, 2 + Math.pow(2, c))
				return cost
			},
			update() {
				el("replCond").textContent = getFullExpansion(ngC.save.repl)
				el("replCond1").textContent = shorten(ngC.tmp.rep.eff1)
				el("replCond2").textContent = shorten(ngC.tmp.rep.eff2)

				let cost = this.cost()
				el("replCondenseReq").textContent = shortenCosts(cost)
				el("replCondense").className = player.replicanti.amount.gte(cost) ? "storebtn" : "unavailablebtn"
			},
			buy() {
				let cost = this.cost()
				if (player.replicanti.amount.lt(cost)) return;
				player.replicanti.amount = E(1)
				ngC.save.repl++
			},
			pow() {
				return 1 //this is incorrect and needs ot be changed
			},
		},
		tds: {
			cost(x) {
				let bought = ngC.save.time[x]
				return Decimal.pow(ngC.condense.costBaseMult[x], Math.pow(bought, 4) * this.costScale())
					.times(ngC.condense.costStart[x] / 10)
					.div(this.costDiv())
			},
			costScale() {
				let x = 1
				if (ETER_UPGS.has(12)) x *= 2/3
				return x
			},
			costDiv() {
				let div = E(1)
				if (hasTimeStudy(203)) div = tsMults[203]()
				return div
			},
			target(x) {
				let res = player.eternityPoints
				return Math.floor(Math.pow(
					res.times(this.costDiv())
						.div(ngC.condense.costStart[x] / 10)
						.log(ngC.condense.costBaseMult[x])
					/ this.costScale()
				, 1 / 4) + 1)
			},
			free() {
				return 0
			},
			pow() {
				let ret = 1
				return ret
			},
			eff(x) {
				if (!ngC.tmp) return E(1)
				let amt = ngC.save.time[x] + ngC.tmp.tds.free
				return Decimal.pow(player.timeShards.plus(1).log10() + 1, amt * ngC.tmp.tds.pow)
			},
			update(x) {
				if (!pH.did("eternity")) {
					el("timeCnd" + x).textContent = "Condense: LOCKED"
					return
				}

				let costPart = pH.did("quantum") ? '' : 'Condense: '
				let cost = this.cost(x)
				let resource = player.eternityPoints
				el("timeCnd" + x).textContent = costPart + shortenPreInfCosts(cost) + (inNGM(4) ? " EP" : "")
				el("timeCnd" + x).className = resource.gte(cost) ? 'storebtn' : 'unavailablebtn'
			},
			buy(x) {
				let res = player.eternityPoints
				let cost = this.cost(x)
				if (res.lt(cost)) return

				ngC.save.time[x]++
				player.eternityPoints = player.eternityPoints.sub(cost)
			},
			max(x) {
				let res = player.eternityPoints
				let cost = this.cost(x)
				if (res.lt(cost)) return

				ngC.save.time[x] = Math.max(ngC.save.time[x], this.target(x))
				player.eternityPoints = player.eternityPoints.sub(cost)
			}
		},
	},
	getSacrificeExpBoost() {
		let x = 1
		if (player.resets >= 6) x *= 1.5
		if (player.galaxies >= 1) x *= 1.75
		return x
	},
	breakInfUpgs: {
		display() {
			if (player.infinityUpgrades.includes("postinfi70")) el("postinfi70").className = "infinistorebtnbought"
			else if (player.infinityPoints.gte(1e6)) el("postinfi70").className = "infinistorebtn1"
			else el("postinfi70").className = "infinistorebtnlocked"
			if (player.infinityUpgrades.includes("postinfi71")) el("postinfi71").className = "infinistorebtnbought"
			else if (player.infinityPoints.gte(5e7)) el("postinfi71").className = "infinistorebtn1"
			else el("postinfi71").className = "infinistorebtnlocked"
			if (player.infinityUpgrades.includes("postinfi72")) el("postinfi72").className = "infinistorebtnbought"
			else if (player.infinityPoints.gte(1e17)) el("postinfi72").className = "infinistorebtn1"
			else el("postinfi72").className = "infinistorebtnlocked"

			if (player.infinityUpgrades.includes("postinfi80")) el("postinfi80").className = "infinistorebtnbought"
			else if (player.infinityPoints.gte(1e24)) el("postinfi80").className = "infinistorebtn1"
			else el("postinfi80").className = "infinistorebtnlocked"
			if (player.infinityUpgrades.includes("postinfi81")) el("postinfi81").className = "infinistorebtnbought"
			else if (player.infinityPoints.gte(1e33)) el("postinfi81").className = "infinistorebtn1"
			else el("postinfi81").className = "infinistorebtnlocked"
			if (player.infinityUpgrades.includes("postinfi82")) el("postinfi82").className = "infinistorebtnbought"
			else if (player.infinityPoints.gte(1e36)) el("postinfi82").className = "infinistorebtn1"
			else el("postinfi82").className = "infinistorebtnlocked"


			el("postinfi70").innerHTML = "Normal Condensers are stronger based on your Dimension Boosts<br>Currently: "+shorten(this[70]())+"x<br>Cost: "+shortenCosts(1e6)+" IP"
			el("postinfi71").innerHTML = "Normal Condensers cost scale 40% slower<br>Cost: "+shortenCosts(5e7)+" IP"
			el("postinfi72").innerHTML = "Normal Condensers are stronger based on your Infinity Condensers<br>Currently: "+shorten(this[72]())+"x<br>Cost: "+shortenCosts(1e17)+" IP"

			el("postinfi80").innerHTML = "Infinity Power boosts Infinity Point gain<br>Currently: "+shorten(this[80]())+"x<br>Cost: "+shortenCosts(1e24)+" IP"
			el("postinfi81").innerHTML = "Infinity Condensers are cheaper based on your Infinity Points<br>Currently: /"+shorten(this[81]())+"<br>Cost: "+shortenCosts(1e33)+" IP"
			el("postinfi82").innerHTML = "Dimensional Sacrifice also divides tickspeed, and both other upgrades in this row use better formulas<br>Cost: "+shortenCosts(1e36)+" IP"
		},
		70() {
			let r = Math.sqrt(getTotalDBs())
			//if (r > 1e3) r = Math.log10(r * 100) * 200
			let mult = Math.pow(1.02, r)
			return mult;
		},
		72() {
			let totalInf = player.condensed.inf.reduce((a,c) => (a||0)+(c||0))
			if (totalInf >= 21) totalInf = 20 + Math.log10(totalInf) / Math.log10(21)
			let mult = Math.pow(totalInf, 1.5) / 10 + 1
			return mult;
		},
		80() {
			let mult = Decimal.pow(player.infinityPower.plus(1).log10()+1, 2)
			if (player.infinityUpgrades.includes("postinfi82")) mult = mult.pow(Math.cbrt(mult.plus(1).log10()+1))
			return mult;
		},
		81() {
			let div = player.infinityPoints.plus(1).pow(.75)
			if (player.infinityUpgrades.includes("postinfi82")) div = div.pow(2.5)
			return div
		},
	},
	ic9Eff() {
		let total = player.condensed.normal.reduce((a,c) => (a||0)+(c||0))
		if (total>=25) total = 24+Math.log10(total)/Math.log10(24)
		let mult = Math.log10(total+1)*2+1
		return mult;
	},
	eterUpgs: {
		display() {
			el("eter10").className = (player.eternityUpgrades.includes(10)) ? "eternityupbtnbought" : (player.eternityPoints.gte("1e625")) ? "eternityupbtn" : "eternityupbtnlocked"
			el("eter11").className = (player.eternityUpgrades.includes(11)) ? "eternityupbtnbought" : (player.eternityPoints.gte("1e875")) ? "eternityupbtn" : "eternityupbtnlocked"
			el("eter12").className = (player.eternityUpgrades.includes(12)) ? "eternityupbtnbought" : (player.eternityPoints.gte("1e1350")) ? "eternityupbtn" : "eternityupbtnlocked"
		}
	}
}
let ngC = CONDENSED

el("postinfi70").onclick = function() {
    buyInfinityUpgrade("postinfi70", 1e6);
}

el("postinfi71").onclick = function() {
    buyInfinityUpgrade("postinfi71", 5e7);
}

el("postinfi72").onclick = function() {
    buyInfinityUpgrade("postinfi72", 1e17);
}

el("postinfi80").onclick = function() {
    buyInfinityUpgrade("postinfi80", 1e24);
}

el("postinfi81").onclick = function() {
    buyInfinityUpgrade("postinfi81", 1e33);
}

el("postinfi82").onclick = function() {
    buyInfinityUpgrade("postinfi82", 1e36);
}

//Restructured
function getDil6Base() {
	if (!tmp.ngC) return 1;
	let base = Math.sqrt(player.dilation.dilatedTime.plus(1).log10()+1)
	return base;
}