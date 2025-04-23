var QCs = {
	setup() {
		QCs_save = {
			in: [],
			comps: 0,
			best: {},
			cloud_disable: 1,
			auto: false
		}
		this.reset()
		qu_save.qc = QCs_save
		return QCs_save
	},
	compile() {
		if (!tmp.ngp3 || qu_save === undefined) {
			this.updateTmp()
			this.updateDisp()
			return
		}

		let data = QCs_save || this.setup()

		let qc1 = data.qc1
		if (qc1 === undefined) this.reset()
		if (qc1.best === undefined) qc1.best = qc1.boosts
		if (qc1.expands === undefined) qc1.expands = 0
		if (qc1.time === undefined) {
			qc1.time = qu_save.time
			qc1.timeLast = player.totalTimePlayed

			qc1.perkBoosts = 0
			qc1.dilaters = 0
		}
		if (qc1.last === undefined) qc1.last = []
		if (qc1.autoExpand === undefined) qc1.autoExpand = {
			value: 0,
			percentage: 0
		}
		el("setAutoExpand_value").value = qc1.autoExpand.value
		el("setAutoExpand_percentage").value = qc1.autoExpand.percentage

		if (typeof(data.qc2) !== "number") data.qc2 = data.cloud_disable || 1
		delete QCs_save.qc3
		if (data.qc4 === undefined || data.qc4.normal === undefined) data.qc4 = { normal: data.qc4 || "ng", dil: "ng" }
		data.qc5 = E(data.qc5)
		if (data.qc8 === undefined) {
			data.qc8 = {
				index: 0,
				order: []
			}
		} else if (data.qc8.time === undefined) data.qc8.time = 0

		if (data.disable_swaps === undefined) data.disable_swaps = {}
		if (data.disable_perks === undefined) data.disable_perks = {}

		this.updateTmp()
		this.updateDisp()
	},
	reset(hard) {
		QCs_save.qc1 = {
			boosts: 0,
			max: 0,
			time: 0,
			best: QCs_save.qc1 && QCs_save.qc1.best,
			last: QCs_save.qc1 && QCs_save.qc1.last,
			timeLast: QCs_save.qc1 && QCs_save.qc1.timeLast,

			perkBoosts: 0,
			expands: 0,
			dilaters: 0,
			autoExpand: QCs_save.qc1 && QCs_save.qc1.autoExpand
		}
		if (!QCs_save.qc2) QCs_save.qc2 = 1
		QCs_save.qc5 = E(0)
		QCs_save.qc6 = 0
		QCs_save.qc7 = QCs.perkActive(7) ? Math.sqrt(player.replicanti.galaxies) : 0 //QC7 perk
		if (QCs_save.qc8) QCs_save.qc8.time = 0

		if (hard) {
			QCs_save.comps = 0
			this.updateTmp()
			this.updateDisp()
		}
	},
	data: {
		max: 8,
		1: {
			unl: () => QCs.unl(),
			desc: "TT cost multipliers are multiplied by 3.5x.",
			goal: () => mTs.bought >= 10,
			goalDisp: () => getFullExpansion(10) + " bought mastery studies",
			goalMA: Decimal.pow(Number.MAX_VALUE, 2.1),
			hint: "",

			rewardDesc: (x) => "Unlock Replicanti Compressors, but there is a limit on Replicantis. Compressors greatly speed up Replicanti Slowdown!",
			rewardEff: () => true,

			perkDesc: (x) => "You gain 0.2 extra Compressors on compressing in at least 5 seconds, or for the first time. (+" + shortenMoney(x) + ")",
			perkEff() {
				return QCs_save.qc1.perkBoosts / 5
			},

			overlapReqs: [1/0, 1/0],

			//QC1 Effects
			ttScaling() {
				return tmp.dtMode ? 2 : tmp.exMode ? 1.75 : 1.5
			},

			//Replicanti Compressors
			boost() {
				let qc1 = QCs_save.qc1
				let p15 = PCs.milestoneDone(51) && player.dilation.active
				if (!QCs_tmp.qc1) return false

				if (QCs.perkActive(1) && (qc1.boosts == 0 || qc1.time <= 50)) qc1.perkBoosts++
				if (PCs.milestoneDone(12) && (player.dilation.active || qc1.time <= 50 || qc1.dilaters / qc1.boosts < 0.75)) {
					updateReplicantiTemp()
					qc1.dilaters++
				}

				QCs.data[1].fix = true
				qc1.boosts++
				qc1.time = 0
				if (!QCs.inAny() && qc1.boosts > qc1.best) this.recordBest()

				if (hasAch("ng3p33")) {
					player.replicanti.amount = player.replicanti.amount.pow(0.9)
				} else {
					tmp.rm = E(1)
					tmp.rmPseudo = E(1)
					player.replicanti.amount = E(1)

					eternity(false, true, false, p15)
				}

				QCs.data[1].fix = false
				return true
			},
			scalings: [5],

			eff(eff, pc11 = 0) {
				var eff = Math.min(eff * (1 + 2 * pc11) / 15 + 1, 3)
				return eff
			},
			extra() {
				var x = 0
				if (QCs.perkActive(1)) x += QCs_tmp.perks[1]
				if (str.unl() && str_tmp.effs) x += str_tmp.effs.b3
				if (ff.unl()) x += ff_tmp.eff.f7
				return x
			},
			total: () => QCs_save.qc1.boosts + QCs.data[1].extra(),
			updateTmp() {
				let qc1 = QCs_save.qc1
				delete QCs_tmp.qc1
				if (!QCs.done(1)) return

				//Boosts
				let boosts = qc1.boosts
				let distantBoosts = Math.max(boosts - this.scalings[0], 0)
				let eff = this.total()

				//Setup
				let data = {
					lim: Decimal.pow(10, 6e6),

					speedMult: Decimal.pow(2, -boosts),
					scalingMult: 1,
					scalingExp: 1 / (1 + boosts / 20),

					effMult: this.eff(eff),
					effExp: 1 + eff / 20,
				}
				if (QCs.in(1)) data.lim = data.lim.pow((tmp.exMode ? 0.2 : tmp.bgMode ? 0.4 : 0.3) * 5 / 6)
				QCs_tmp.qc1 = data

				//Quantum - Paired Challenges
				if (PCs.milestoneDone(11)) {
					let pc11 = 0.2 + (PCs_save.lvl - 1) / 35
					data.lim = data.lim.pow(Math.pow(2, -pc11))
					data.speedMult = data.speedMult.pow(1 - pc11)
					data.scalingExp = 1 / (1 + boosts / (20 + pc11 * 5))
					data.effMult = this.eff(eff, pc11)
				}
				if (PCs.milestoneDone(12)) data.dilaterEff = 1 - 1 / (qc1.dilaters / 3 + 1)
				if (QCs.perkActive(1)) data.effMult = Math.pow(data.effMult, data.effExp / 2 + 0.5)

				//Replicanti Limit
				if (PCs.milestoneDone(13)) data.lim = data.lim.pow(Math.log2(qc1.expands + 1) / 10 + 1)
				data.lim = data.lim.max(Decimal.pow(10, 1.5e6 * distantBoosts))

				//Replicanti Release
				var release = 1
				if (fluc.unl()) release *= FDs_tmp.eff_rep
				if (release > 1) {
					data.lim = data.lim.pow(release)
					data.scalingMult *= release
				}

				//Penalties
				var limLog = QCs_tmp.qc1.lim.log10()
				if (limLog >= 1e8) {
					var div = limLog / 1e8
					data.lim = Decimal.pow(10, 1e8)
					data.scalingMult /= div
				}
			},

			//Conversion
			convert(x) {
				if (!QCs_tmp.qc1) return x

				var dilMult = Math.log10(getReplSpeedLimit()) / 1024
				var log = x.log10() * dilMult
				if (log > 1) log = Math.pow(log, QCs_tmp.qc1.effExp)
				log *= QCs_tmp.qc1.effMult / dilMult

				x = Decimal.pow(10, log)
				return x
			},

			updateDisp() {		
				el("replCompressDiv").style.display = QCs_tmp.qc1 ? "" : "none"
				el("repExpand").style.display = PCs.milestoneDone(13) ? "" : "none"
				el("replDilaterDiv").style.display = PCs.milestoneDone(12) ? "" : "none"

				if (!tmp.ngp3) return
				if (!QCs_save) return
				if (!QCs_save.qc1) return
				if (!QCs_save.qc1.last) return

				var last = QCs_save.qc1.last
				var html = "<br><br>"
				for (var i = last.length; i > 0; i--) {
					var first = last[i - 2] !== undefined ? last[i - 2][0] : 0
					var fin = last[i - 1][0]

					html += (first == fin - 1 ? "" : first + " - ") + getFullExpansion(fin) + " Replicanti Compressors: " +
					timeDisplay(last[i - 1][1]) + "<br>"
				}
				el("lasttencompressors").innerHTML = html
			},
			updateDispOnTick() {
				let qc1 = QCs_save.qc1
				let data = QCs.data[1]
				if (QCs_tmp.qc1) {
					el("replCompress").textContent = getFullExpansion(qc1.boosts) + (data.extra() > 0 ? " + " + shorten(data.extra()) : "")
					el("replCompressEff").textContent = "^" + shorten(QCs_tmp.qc1.effExp) + ", x" + shorten(QCs_tmp.qc1.effMult)
				}
				if (PCs.milestoneDone(13)) {
					el("repExpand").innerHTML = "Energize the Replicantis and expand their space." +
						"<br>Cost: " + shorten(data.expandCost()) + " Replicanti Energy" +
						"<br>(" + getFullExpansion(qc1.expands) + " Expansions)"
					el("repExpand").className = data.canExpand() ? "storebtn" : "unavailablebtn"
				}
				if (PCs.milestoneDone(12)) {
					el("replDilater").textContent = getFullExpansion(qc1.dilaters)
					el("replDilaterEff").textContent = "^" + QCs_tmp.qc1.dilaterEff.toFixed(3)
				}
			},

			//PC1x2 Milestone: Replicanti Expanders
			expandCost: () => Decimal.pow(4, QCs_save.qc1.expands).times(1e7),
			canExpand: () => QCs_tmp.qc5 && QCs_save.qc5.gte(QCs.data[1].expandCost()),
			expandGain: () => Math.floor(QCs_save.qc5.div(QCs.data[1].expandCost()).times(3).add(1).log(4)),
			expandTarget: () => QCs.data[1].expandGain() + QCs_save.qc1.expands,
			expand(auto) {
				if (!this.canExpand()) return

				var cost = QCs.data[1].expandCost()
				var bulk = auto ? Math.floor(QCs.data[1].expandTarget() * QCs_save.qc1.autoExpand.percentage / 100) - QCs_save.qc1.expands : 1
				if (bulk < 0) return

				QCs_save.qc5 = QCs_save.qc5.sub(Decimal.pow(4, bulk).sub(1).div(3).times(cost))
				QCs_save.qc1.expands += bulk
				this.updateDisp()
			},
			autoExpand() {
				var save = QCs_save.qc1
				if (!QCs_tmp.qc5) return
				if (save.boosts < save.autoExpand.value) return
				if (this.expandGain() < Math.floor(this.expandTarget() * save.autoExpand.percentage / 100) - save.expands) return
				if (!this.canExpand()) return
				this.expand(true)
			},
			setAutoExpand(x) {
				QCs_save.qc1.autoExpand[x] = parseInt(el("setAutoExpand_" + x).value)
			},

			//Stats
			recordBest() {
				let qc1 = QCs_save.qc1
				qc1.best = qc1.boosts
				qc1.last.push([qc1.best, qc1.timeLast])
				if (qc1.last.length >= 30) {
					var list = []
					for (var i = 1; i < qc1.last.length; i++) list.push(qc1.last[i])
					list[0] += qc1.last[0]
					qc1.last = list
				}

				qc1.timeLast = 0
			}
		},
		2: {
			unl: () => true,
			desc: "You must disable a tier from Positronic Cloud, but some Quantum content are changed/disabled.",
			goal: () => pos_save.eng.gte(7),
			goalDisp: () => shortenCosts(7) + " Positronic Charge",
			goalMA: Decimal.pow(Number.MAX_VALUE, 2.4),
			hint: "",

			rewardDesc: (x) => "Quantum Power boosts color charge by " + shorten(x) + "x.",
			rewardEff(str) {
				str = str || colorCharge.normal.charge || E(0)
				return str.div(3).add(1).pow((enB.glu.boosterExp() || 1) / 6)
			},

			perkDesc: (x) => "Mastered Entangled Boosts are 50% stronger, but mastery requires " + shortenCosts(500) + " Quantum Power. Also, they are always active.",
			perkEff() {
				return 1
			},
			perkToggle: true,

			overlapReqs: [1/0, 1/0],

			updateCloudDisp() {
				if (!pos_tmp.cloud) return

				let unl = futureBoost("exclude_any_qc") ? QCs.inAny() : QCs.in(2)
				for (let t = 1; t <= 3; t++) {
					el("pos_cloud" + t + "_toggle").parentElement.style.display = unl && pos_tmp.cloud[t] ? "" : "none"
					el("pos_cloud" + t + "_cell").colspan = unl && pos_tmp.cloud[t] ? 1 : 2
					if (unl) el("pos_cloud" + t + "_toggle").className = (QCs_save.qc2 == t ? "chosenbtn" : "storebtn") + " longbtn"
				}
			},
			switch(x) {
				if (QCs_save.qc2 == x) return
				if (!confirm("This will restart your run. Are you sure?")) return
				QCs_save.qc2 = x
				restartQuantum()
			}
		},
		3: {
			unl: () => true,
			desc: "Meta Dimensions only work, but they produce antimatter and Infinity Points instead. Dilating sucessfully reduces the production, and Meta Accelerator boosts are disabled.",
			goal: () => player.dilation.tachyonParticles.gte(3e4),
			goalDisp: () => shortenCosts(3e4) + " Tachyon Particles",
			goalMA: Decimal.pow(Number.MAX_VALUE, 0.2),
			hint: "Try not to automate dilation, and also not to dilate time frequently.",

			rewardDesc: (x) => "You sacrifice 30% of Meta Dimension Boosts instead of 25%.",
			rewardEff(str) {
				return 1
			},

			perkDesc: (x) => "Start at 1 TP, and Eternity Points boost Meta Dimensions.",
			perkEff() {
				return 1
			},

			overlapReqs: [1/0, 1/0],

			amProd() {
				return getMDProduction(1).max(1).pow(this.amExp())
			},
			amExp() {
				return 20 / Math.sqrt((player.dilation.times || 0) / 4 + 1)
			}
		},
		4: {
			unl: () => true,
			desc: "You must disable one type of Galaxies. Changing it performs a forced Eternity reset.",
			goal: () => player.dilation.freeGalaxies >= 2800,
			goalDisp: () => getFullExpansion(2800) + " Tachyonic Galaxies",
			goalMA: Decimal.pow(Number.MAX_VALUE, 2.4),
			hint: "Test every single combination of this exclusion, and try to minimize galaxies.",

			rewardDesc: (x) => "Replicated Galaxies contribute to Positronic Charge.",
			rewardEff(str) {
				return
			},

			perkDesc: (x) => "You can disable separately in dilation runs.",
			perkEff() {
				return 1
			},

			overlapReqs: [1/0, 1/0],

			updateTmp() {
				delete QCs_tmp.qc4
				if (!QCs.in(4)) return

				var type = QCs.perkActive(4) && player.dilation.active ? "dil" : "normal"
				var gals = {
					ng: player.galaxies,
					rg: player.replicanti.galaxies,
					eg: tmp.extraRG || 0,
					tg: player.dilation.freeGalaxies,
				}
				var galType = QCs_save.qc4[type]
				var sum = gals.ng + gals.rg + gals.eg + gals.tg
				
				QCs_tmp.qc4 = {
					diff: Math.abs(gals[galType] - (sum - gals[galType]) / 3),
					type: type
				}
				QCs_tmp.qc4.boost = Math.log2(QCs_tmp.qc4.diff / 500 + 1) / 5 + 1
			},

			updateDisp() {		
				el("qc4_div").style.display = QCs.in(4) ? "" : "none"
				el("qc4_select").style.display = "Select one to disable:" + (!QCs.perkActive(4) ? "" : " (" + player.dilation.active ? "Dilation" : "Normal" + ")")
				el("coinsPerSec").style.display = QCs.in(4) ? "none" : ""
				el("tickSpeedRow").style.display = QCs.in(4) ? "none" : ""

				if (!QCs.in(4)) return
				var types = ["ng", "rg", "eg", "tg"]
				for (var t = 0; t < types.length; t++) {
					var type = types[t]
					el("qc4_" + type).className = (QCs_save.qc4[QCs_tmp.qc4.type] == type ? "chosenbtn" : "storebtn")
				}
			},
			switch(x) {
				QCs_save.qc4[QCs_tmp.qc4.type] = x

				if (QCs_tmp.qc4.type == "dil" && !confirm("This exits your dilation run! Are you sure?")) return
				eternity(true)
				this.updateDisp()
			}
		},
		5: {
			unl: () => true,
			desc: "Replicanti effects are disabled, but they generate energy. Replicate interval gets stronger over time since Eternity.",
			goal: () => player.eternityPoints.gte(Decimal.pow(10, 2.8e6)),
			goalDisp: () => shortenCosts(Decimal.pow(10, 2.8e6)) + " Eternity Points",
			goalMA: Decimal.pow(Number.MAX_VALUE, 1.7),
			hint: "Adjust your auto-Eternity time to maximize your production.",

			rewardDesc: (x) => "Sacrificed things are stronger for Positrons, but you sacrifice less galaxies.",
			rewardEff(str) {
				return 1
			},

			perkDesc: (x) => "Replicanti Energy effects are doubled.",
			perkEff() {
				return 1
			},

			overlapReqs: [1/0, 1/0],

			exp() {
				var x = 1
				if (PCs.milestoneDone(52)) {
					var b = QCs.data[1].total()
					x *= Math.pow(b / 20 + 1, b / 40 + 1)
				}
				return x
			},
			updateTmp() {
				delete QCs_tmp.qc5
				if (!QCs.in(5) && !QCs.done(6)) return

				QCs_tmp.qc5 = {
					mult: E(QCs_save.qc1.boosts + 1),
					eff: Math.log10(QCs_save.qc5.div(2e6).add(1).log(2) + 1) / 5 + 1
				}
				if (QCs.isRewardOn(6)) QCs_tmp.qc5.mult = QCs_tmp.qc5.mult.times(QCs_tmp.rewards[6])
				if (QCs.perkActive(5)) QCs_tmp.qc5.eff = QCs_tmp.qc5.eff * 2 - 1
			},

			updateDisp() {		
				el("qc5_div").style.display = QCs_tmp.qc5 ? "" : "none"
			},
			updateDispOnTick() {		
				let exp = QCs.data[5].exp()
				el("qc5_eng").textContent = shorten(QCs_save.qc5)
				el("qc5_eng_mult").textContent = shiftDown ? " (+" + shorten(Math.max(QCs_tmp.qc5.mult, 1)) + " per " + shorten(Decimal.pow(10, 1 / Math.min(QCs_tmp.qc5.mult, 1))) + "x)" : ""
				el("qc5_eng_exp").textContent = exp > 1 ? shorten(exp) : ""
				el("qc5_eff").textContent = shorten(QCs_tmp.qc5.eff)
			},
		},
		6: {
			unl: () => true,
			desc: "There are Nullons that speed up Replicanti Slowdown. (less as you have more) Eternitying loses some Nullons, and dilating reduces the production.",
			goal: () => QCs_save.qc1.boosts >= 3 || (player.replicanti.amount.e >= 4.5e6 && QCs_save.qc1.boosts == 2),
			goalDisp: () => shortenCosts(Decimal.pow(10, 4.5e6)) + " Replicantis + " + getFullExpansion(2) + " Compressors",
			goalMA: Decimal.pow(Number.MAX_VALUE, 2.45),
			hint: "Do long Eternity runs.",

			rewardDesc: (x) => "Replicantis also produce Replicanti Energy; but also boosted by time since Eternity. (" + shorten(QCs_tmp.rewards[6]) + "x)",
			rewardEff(str) {
				let t = player.thisEternity / 10
				if (PCs.milestoneDone(63)) t = t / 5 + 5

				let x = Math.log2(t + 2)
				if (PCs.milestoneDone(61)) x *= x
				x *= (9 / (Math.abs(5 - t) + 1) + 1) //Hindrance... >_<
				return x
			},

			perkDesc: (x) => "Eternity time is 5x slower.",
			perkEff() {
				return 1
			},

			overlapReqs: [1/0, 1/0],

			updateTmp() {
				delete QCs_tmp.qc6
				if (!QCs.in(6)) return

				QCs_tmp.qc6 = Math.log2(Math.max(-QCs_save.qc6, 0) / 100 + 1) + 2
			}
		},
		7: {
			unl: () => true,
			desc: "You can’t fill the rows in Mastery Studies except singles. MD and TT productions are reduced by ^0.95.",
			goal: () => player.timestudy.theorem >= 5e85,
			goalDisp: () => shortenDimensions(5e85) + " Time Theorems",
			goalMA: Decimal.pow(Number.MAX_VALUE, 2.3),
			hint: "Do not buy MS22 and MS53/54.",

			rewardDesc: (x) => "Meta Accelerator accelerates 20% faster, and unlock Paired Challenges.",
			rewardEff(str) {
				return 1
			},

			perkDesc: (x) => "Temporaily convert base RGs into extra base RGs.",
			perkEff() {
				return 1
			},

			overlapReqs: [1/0, 1/0],
		},
		8: {
			unl: () => hasAch("ng3p25"),
			desc: "All Entangled Boosts are anti'd. You have to setup a cycle of 2 entanglements, and there's a 5-second timer that constantly switches your gluon kind.",
			goal: () => enB.glu.boosterEff() >= 220,
			goalDisp: "220 Quantum Power",
			goalMA: Decimal.pow(Number.MAX_VALUE, 2.1),
			hint: "Avoid the GB gluon kind.",

			rewardDesc: (x) => "Unlock the fourth column of Paired Challenges.",
			rewardEff(str) {
				return 1
			},

			perkDesc: (x) => "Master the Entangled Boosts that are matched.",
			perkEff() {
				return 1
			},

			overlapReqs: [1/0, 1/0],

			switch() {
				var qc8 = QCs_save.qc8
				if (qc8.order.length < 2) return

				var eb12 = enB.active("glu", 12)
				qc8.index++
				if (qc8.index >= qc8.order.length) qc8.index = 0
				QCs.data[8].updateDisp()
				if (eb12 != enB.active("glu", 12)) updateColorCharge(true)
			},
			updateDisp() {
				if (!tmp.quUnl) return

				var qc8 = QCs_save.qc8
				var qc8_in = QCs.in(8)
				el("qc8_note").innerHTML = qc8_in ? "You have to Big Crunch to switch your gluon kind!<br>Used kinds: " + qc8.order.length + " / 2" : ""
				el("qc8_clear").style.display = qc8_in ? "" : "none"

				if (qc8_in) {
					updateGluonsTabOnUpdate()

					var kinds = ["rg", "gb", "br"]
					for (var k = 0; k < kinds.length; k++) {
						var kind = kinds[k]
						el("entangle_" + kind).className = qc8.order[qc8.index] == kind ? "chosenbtn2" : qc8.order.includes(kind) ? "chosenbtn" : qc8.order.length == 2 ? "unavailablebtn" : "gluonupgrade " + kind
					}
				}
			},
			clear() {
				if (!confirm("Are you sure?")) return
				QCs_save.qc8.index = 0
				QCs_save.qc8.order = []
				QCs.restart()
			}
		},
	},

	updateTmp() {
		let data = {
			unl: QCs_tmp.unl,
			unl_challs: [],
			in: [],
			rewards: {},
			nerfed: 0,
			perks: {},
			show_perks: QCs_tmp.show_perks
		}
		QCs_tmp = data
		if (!data.unl) return

		for (let x = 1; x <= this.data.max; x++) {
			if (QCs_save.in.includes(x)) data.in.push(x)
			if (this.data[x].unl()) {
				data.unl_challs.push(x)
				if (!this.done(x)) break
			}
		}

		this.updateTmpOnTick()
	},
	updateTmpOnTick() {
		if (!this.unl()) return
		
		let data = QCs_tmp
		for (let x = this.data.max; x; x--) {
			if (data.unl_challs.includes(x)) {
				data.rewards[x] = this.data[x].rewardEff()
				if (PCs.unl()) data.perks[x] = this.data[x].perkEff(1)
			}
			if (this.data[x].updateTmp) this.data[x].updateTmp()
		}
	},

	unl: (force) => force ? (tmp.ngp3 && player.masterystudies.includes("d8")) : QCs_save !== undefined && QCs_tmp.unl,
	started(x) {
		return QCs_tmp.in.includes(x)
	},
	in(x) {
		return QCs_tmp.in.includes(x)
	},
	inAny() {
		return QCs_tmp.in.length >= 1
	},
	isntCatched() {
		return QCs_tmp.in.length == 2 ? tmp.bgMode : QCs_tmp.in.length != 1
	},
	done(x) {
		return this.unl() && QCs_save.comps >= x
	},
	hasSecondaryGoal() {
		return !PCs.in()
	},
	getGoal() {
		return player.meta.bestAntimatter.gte(this.getGoalMA()) && (!this.hasSecondaryGoal() || this.data[QCs_tmp.in[0]].goal())
	},
	getGoalDisp() {
		return this.hasSecondaryGoal() ? " and " + this.data[QCs_tmp.in[0]].goalDisp() : ""
	},
	getGoalMA(x, mod) {
		if (!x) {
			if (PCs.in()) return PCs.goal()
			x = QCs_save.in[0]
		}
		if (x) r = this.data[x].goalMA
		return r
	},
	isRewardOn(x) {
		return this.done(x) && QCs_tmp.rewards[x]
	},

	tp() {
		showTab("challenges")
		showChallengesTab("quantumchallenges")
	},
	start(x) {
		if (QCs_tmp.show_perks && !QCs.done(x)) return
		quantum(false, true, { qc: x }, "qc")
	},
	restart(x) {
		if (!QCs.inAny()) return
		restartQuantum()
	},

	perkUnl(x) {
		return hasAch("ng3pr12") && PCs.milestoneDone(x * 10 + 4)
	},
	perkActive(x) {
		return QCs_tmp.perks[x] !== undefined && this.perkUnl(x) && this.inAny() && !(QCs_save.disable_perks && QCs_save.disable_perks[x])
	},
	disablePerk(x) {
		if (!QCs.perkUnl(x)) return
		if (QCs.inAny() && !confirm("This will restart this challenge! Are you sure?")) return
		QCs_save.disable_perks[x] = !QCs_save.disable_perks[x]
		el("disable_qc" + x + "_perk").textContent = (QCs_save.disable_perks[x] ? "Enable" : "Disable") + " QC" + x + " Perk"
		el("pc_perk_" + x).className = "qMs_toggle_" + (!QCs_save.disable_perks[x] ? "on" : "off")

		if (QCs.inAny()) restartQuantum()
	},
	viewPerks() {
		QCs_tmp.show_perks = !QCs_tmp.show_perks
		QCs.updateDisp()
	},

	toggle_auto() {
		QCs_save.auto = !QCs_save.auto
		el("auto_qc").textContent = "Auto-completions: " + (QCs_save.auto ? "ON" : "OFF")
	},
	disable_swaps() {
		QCs_save.disable_swaps.on = !QCs_save.disable_swaps.on
		el("swaps_toggle").textContent = (QCs_save.disable_swaps.on ? "Enable" : "Disable") + " swaps in challenge"
	},

	setupDiv() {
		if (this.divInserted) return

		let html = ""
		for (let x = 1; x <= this.data.max; x++) html += (x % 2 == 1 ? "<tr>" : "") + this.divTemp(x) + ((x + 1) % 2 == 1 ? "</tr>" : "")
		el("qcs_div").innerHTML = html

		this.divInserted = true
	},
	divTemp: (x) =>
		'<td><div class="quantumchallengediv" id="qc_' + x + '_div">' +
		'<span id="qc_' + x + '_desc"></span><br><br>' +
		'<div class="outer"><button id="qc_' + x + '_btn" class="challengesbtn" onclick="QCs.start(' + x + ')">Start</button><br>' +
		'<span id="qc_' + x + '_goal"></span><br>' +
		'<span id="qc_' + x + '_reward"></span>' +
		'</div></div></td>',
	divInserted: false,
	updateDisp() {
		let unl = this.divInserted && this.unl() && pH.shown("quantum")

		//In Quantum Challenges
		this.data[1].updateDisp()
		this.data[2].updateCloudDisp()
		this.data[4].updateDisp()
		this.data[5].updateDisp()
		this.data[8].updateDisp()

		//Quantum Challenges
		if (!unl) return

		el("qc_effects").innerHTML = "All quantum mechanics will change, when entering a Quantum Challenge:<br>" +
			(tmp.bgMode ? "No" : (tmp.exMode ? "No" : "Reduced") + " global Quantum Energy bonus, no") + " gluon nerfs, and mastered boosts only work."
		for (let qc = 1; qc <= this.data.max; qc++) {
			var cUnl = QCs_tmp.unl_challs.includes(qc)
			el("qc_" + qc + "_div").style.display = cUnl ? "" : "none"

			el("qc_" + qc + "_desc").textContent = evalData(this.data[qc].desc)
			el("qc_" + qc + "_goal").textContent = "Goal: " + shorten(this.data[qc].goalMA) + " meta-antimatter and " + evalData(this.data[qc].goalDisp)
			el("qc_" + qc + "_btn").textContent = this.started(qc) ? "Running" : this.done(qc) ? "Completed" : "Start"
			el("qc_" + qc + "_btn").className = this.started(qc) ? "onchallengebtn" : this.done(qc) ? "completedchallengesbtn" : "challengesbtn"
		}
		el("restart_qc").style.display = QCs.inAny() ? "" : "none"
		el("auto_qc").style.display = hasAch("ng3p25") ? "" : "none"
		el("auto_qc").textContent = "Auto-completions: " + (QCs_save.auto ? "ON" : "OFF")
	},
	updateDispOnTick() {
		if (!this.divInserted) return

		for (let qc = 1; qc <= this.data.max; qc++) {
			if (QCs_tmp.unl_challs.includes(qc)) {
				var hint = evalData(this.data[qc].hint)
				el("qc_" + qc + "_reward").innerHTML = 
				QCs_tmp.show_perks ? "" :
				(shiftDown || QCs.in(qc)) && hint ? "Hint: " + hint :
				"Reward: " + evalData(this.data[qc].rewardDesc, [QCs_tmp.rewards[qc]])
			}
		}
	}
}
var QCs_save = undefined
var QCs_tmp = { unl_challs: [], in: [], rewards: {}, perks: {}, show_perks: false }

let QUANTUM_CHALLENGES = QCs
