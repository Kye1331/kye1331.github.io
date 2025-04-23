//New: v3.0 / Old: v1.79
let qMs = {
	tmp: {},
	data: {
		types: ["sr", "en", "rl", "ch", "fl", "ach"],
		sr: {
			name: "Speedrun",
			targ: () => qu_save.best,
			targDisp: timeDisplay,
			targKind: "quantum",
			daysStart: () => tmp.dtMode ? 0.25 : tmp.exMode ? 0.375 : tmp.bgMode ? 0.75 : 0.5,
			gain: (x) => Math.log10(86400 * qMs.data.sr.daysStart() / x) / Math.log10(2) * 2 + 1,
			nextAt: (x) => Math.pow(2, (1 - x) / 2) * 86400 * qMs.data.sr.daysStart()
		},
		en: {
			name: "Energetic",
			targ: () => qu_save.bestEnergy || 0,
			targDisp: shorten,
			targKind: "energy",
			gain(x) {
				x = Math.sqrt(Math.max(x - 0.5, 0)) * 3
				if (x > 20) x = Math.log10(x / 2) * 20
				return x
			},
			nextAt(x) {
				if (x > 20) x = Math.pow(10, x / 20) * 2
				x = Math.pow(x / 3, 2) + 0.5
				return x
			}
		},
		rl: {
			name: "Relativistic",
			unl: () => pos.unl(),
			targ: () => E(player.dilation.bestTP || 0),
			targDisp: shorten,
			targKind: "TP",
			gain(x) {
				x = (x.max(1).log10() - 90) / 3 + 1
				if (x > 20) x = Math.log10(x / 2) * 20
				return x
			},
			nextAt(x) {
				if (x > 20) x = Math.pow(10, x / 20) * 2
				x = Decimal.pow(10, (x - 1) * 3 + 90)
				return x
			}
		},
		ch: {
			name: "Challenging",
			unl: () => QCs.unl(),
			targ: () => (PCs_save && PCs_save.comps.length) || 0,
			targDisp: getFullExpansion,
			targKind: "completions",
			gain: (x) => x * 2,
			nextAt: (x) => Math.ceil(x / 2)
		},
		fl: {
			name: "Fluctuant",
			unl: () => pH.did("fluctuate"),
			targ: () => (fluc_save && fluc_save.energy) || 0,
			targDisp: getFullExpansion,
			targKind: "Fluctuant Energy",
			gain: (x) => x == 0 ? 0 : x * 5 + 2,
			nextAt: (x) => x == 0 ? 1 : Math.ceil((x - 2) / 5)
		},
		ach: {
			name: "Achievement",
			unl: () => qMs.data.ach.gain() > 0,
			gain() {
				let x = 0
				if (hasAch("ng3p33")) x += 3
				return x
			}
		}
	},
	update() {
		let data = {}
		qMs.tmp = data

		data.amt = 0
		data.points = 0
		data.metaSpeed = 10
		if (!tmp.quUnl) return

		//Milestone Points
		let types = qMs.data.types
		for (var i = 0; i < types.length; i++) {
			var type = types[i]
			var typeData = qMs.data[type]
			var unl = typeData.unl ? typeData.unl() : true

			data["targ_" + type] = evalData(typeData.targ)
			data["amt_" + type] = Math.min(Math.max(Math.floor(typeData.gain(data["targ_" + type])), 0), 1e3)
			data.points += data["amt_" + type]
		}
		qu_save.bestMP = Math.max(qu_save.bestMP || 0, data.points)

		//Milestones
		for (var i = 1; i <= qMs.max; i++) {
			if (data.points >= qMs[i].req || evalData(qMs[i].forceGot)) data.amt++
		}

		if (qMs.tmp.amt >= 12) data.metaSpeed *= Math.pow(0.9, Math.pow(qMs.tmp.amt - 12 + 1, 1 + Math.max(qMs.tmp.amt - 15, 0) / 15))
	},
	updateDisplay() {
		if (tmp.quUnl) {
			let types = qMs.data.types
			for (var i = 0; i < types.length; i++) {
				var type = types[i]
				var typeData = qMs.data[type]
				var unl = typeData.unl ? typeData.unl() : true

				el("qMs_" + type + "_cell").style.display = unl ? "" : "none"
			}

			for (var i = 1; i <= qMs.max; i++) {
				var shown = fluc.unl() || qMs.tmp.amt >= i - 1
				el("qMs_reward_" + i).style.display = shown ? "" : "none"

				if (shown) {
					var got = qMs.isObtained(i)
					el("qMs_reward_" + i).className = !got || qMs.forceOff(i) ? "qMs_locked" :
						!evalData(this[i].disablable) ? "qMs_reward" :
						"qMs_toggle_" + (!qu_save.disabledRewards[i] ? "on" : "off")
					el("qMs_reward_" + i).innerHTML = qMs[i].eff() + (got ? "" : "<br>(requires " + getFullExpansion(qMs[i].req) + (this[i].best ? " best" : "") + " MP)")
				}
			}
			el("qMs_next").textContent = qMs.tmp.amt >= qMs.max ? "" : "Next milestone unlocks at " + getFullExpansion(qMs[qMs.tmp.amt + 1].req) + " Milestone Points."
		}

		el('dilationmode').style.display = qMs.tmp.amt >= 4 ? "block" : "none"
		el('rebuyupgauto').style.display = qMs.tmp.amt >= 11 || pH.did("fluctuate") ? "" : "none"
		el('metaboostauto').style.display = qMs.tmp.amt >= 14 ? "" : "none"
		el("autoBuyerQuantum").style.display = qMs.tmp.amt >= 17 ? "block" : "none"
		el('toggleautoquantummode').style.display = qMs.tmp.amt >= 17 ? "" : "none"
		el('rebuyupgmax').style.display = qMs.tmp.amt < 20 ? "" : "none"
		el('repExpandAuto').style.display = PCs.milestoneDone(13) ? "" : "none"

        var autoAssignUnl = qMs.tmp.amt >= 23
		el('respec_quarks').style.display = autoAssignUnl ? "" : "none"
        el('autoAssign').style.display = autoAssignUnl ? "" : "none"
        el('autoAssignRotate').style.display = autoAssignUnl ? "" : "none"

		if (QCs.unl()) {
			el("swaps_toggle").style.display = qMs.tmp.amt >= 26 ? "" : "none"
			el("swaps_toggle").textContent = (QCs_save.disable_swaps.on ? "Enable" : "Disable") + " swaps in challenge"
		}
	},
	updateDisplayOnTick() {
		let types = qMs.data.types
		for (var i = 0; i < types.length; i++) {
			var type = types[i]
			var typeData = qMs.data[type]
			var unl = typeData.unl ? typeData.unl() : true

			if (unl) {
				el("qMs_" + type + "_points").textContent = "+" + getFullExpansion(qMs.tmp["amt_" + type]) + " MP"
				if (typeData.targ) {
					el("qMs_" + type + "_target").textContent = typeData.targDisp(qMs.tmp["targ_" + type])
					el("qMs_" + type + "_next").textContent = qMs.tmp["amt_" + type] > 50 ? "" : "(Next at: " + typeData.targDisp(typeData.nextAt(qMs.tmp["amt_" + type] + 1)) + " " + typeData.targKind + ")"
				}
			}
		}

		el("qMs_points").textContent = getFullExpansion(qMs.tmp.points)
	},
	isObtained(id) {
		var d = qMs[id]
		return (d.best ? qu_save.bestMP >= d.req : qMs.tmp.amt >= id) || evalData(d.forceGot)
	},
	isOn(id) {
		return qMs.isObtained(id) && !qu_save.disabledRewards[id] && !qMs.forceOff(id)
	},
	forceOff(id) {
		return evalData(qMs[id].forceDisable)
	},
	toggle(id) {
		if (!qMs.isObtained(id)) return
		if (qMs.forceOff(id)) return
		if (!evalData(qMs[id].disablable)) return

		let on = !qu_save.disabledRewards[id]
		qu_save.disabledRewards[id] = on
		el("qMs_reward_" + id).className = "qMs_toggle_" + (!on ? "on" : "off")
	},

	max: 29,
	1: {
		req: 1,
		eff: () => "Completing an EC only exits your challenge, and unlock automation for TT and study presets.",
		effGot: () => "Completing an EC now only exits your challenge, and you now can automate TT and study presets."
	},
	2: {
		req: 2,
		eff: () => "Start with 3x more Eternities per milestone (" + shortenDimensions(Math.pow(3, qMs.tmp.amt >= 2 ? qMs.tmp.amt : 0) * 100) + "), and keep Eternity Challenges",
		effGot: () => "You now start with 3x more Eternities per milestone, and keep Eternity Challenges."
	},
	3: {
		req: 3,
		disablable: true,
		eff: () => "Keep all your Eternity Upgrades and Time Studies",
		effGot: () => "You now can keep all your Eternity Upgrades and Time Studies."
	},
	4: {
		req: 4,
		eff: () => "Unlock auto-Dilation and new modes for auto-Eternity",
		effGot: () => "You have unlocked the 'X times eternitied' mode for auto-Eternity... And you can now automatically dilate time!"
	},
	5: {
		req: 5,
		disablable: true,
		eff: () => "Start with Time Dilation unlocked" + (tmp.dtMode ? "" : " and '3x TP' upgrade is retroactive"),
		effGot: () => "You now start with Time Dilation unlocked" + (tmp.dtMode ? "." : " and '3x TP' upgrade is now retroactive.")
	},
	6: {
		req: 6,
		eff: () => "Start with all 8 Time Dimensions",
		effGot: () => "You now start with all 8 Time Dimensions."
	},
	7: {
		req: 7,
		disablable: true,
		eff: () => "Keep all your dilation upgrades except the repeatables",
		effGot: () => "You now can keep all your dilation upgrades except the repeatables."
	},
	8: {
		req: 8,
		forceDisable: () => tmp.dtMode || QCs.inAny(),
		disablable: true,
		eff: () => tmp.dtMode ? "N/A" : "Keep " + (tmp.exMode ? "10 levels of " : tmp.bgMode ? "" : "25 levels of ") + "your dilation upgrades that boost TP gain",
		effGot: () => tmp.dtMode ? "" : "You now can keep your dilation upgrades that boost TP gain."
	},
	9: {
		req: 9,
		eff: () => "Start with Meta Dimensions unlocked",
		effGot: () => "You now start with Meta Dimensions unlocked."
	},
	10: {
		req: 10,
		forceDisable: () => hasAch("ng3pr11") ? QCs.in(1) || QCs.in(7) : !QCs.isntCatched(),
		eff: () => "Keep all your mastery studies",
		effGot: () => "You now can keep all your mastery studies."
	},
	11: {
		req: 12,
		eff: () => "Unlock the autobuyer for repeatable dilation upgrades",
		effGot: () => "You now can automatically buy repeatable dilation upgrades."
	},
	12: {
		req: 13,
		eff: () => "Reduce the interval of auto-dilation upgrades and MDs by 10% per milestone" + (qMs.tmp.amt >= 12 && qMs.tmp.amt < 25 ? " (" + shorten(1 / qMs.tmp.metaSpeed) + "/s)" : ""),
		effGot: () => "The interval of auto-dilation upgrades and MDs is now reduced by 10% per milestone."
	},
	13: {
		req: 15,
		eff: () => "Reduce the interval of auto-slow MDs by 1 tick per milestone",
		effGot: () => "The interval of auto-slow MDs is now reduced by 1 tick per milestone."
	},
	14: {
		req: 16,
		eff: () => "Unlock the autobuyer for meta-Dimension Boosts, and start with 4 MDBs",
		effGot: () => "You now can automatically buy meta-Dimension Boosts, and you now start with 4 MDBs."
	},
	15: {
		req: 18,
		eff: () => "All Meta Dimensions are available for purchase on Quantum",
		effGot: () => "All Meta Dimensions are now available for purchase on Quantum."
	},
	16: {
		req: 19,
		eff: () => "Each milestone greatly reduces the interval of auto-dilation upgrades and MDBs",
		effGot: () => "Each milestone now greatly reduces the interval of auto-dilation upgrades and MDBs."
	},
	17: {
		req: 20,
		eff: () => "Unlock the autobuyer for Quantum runs",
		effGot: () => "You can now automatically go Quantum."
	},
	18: {
		req: 21,
		eff: () => "'2 Million Infinities' effect is always applied",
		effGot: () => "'2 Million Infinities' effect is now always applied."
	},
	19: {
		req: 22,
		eff: () => "Meta-Dimension Boosts no longer reset Meta Dimensions",
		effGot: () => "Meta-Dimension Boosts no longer reset Meta Dimensions anymore."
	},
	20: {
		req: 24,
		eff: () => "All Infinity-related autobuyers fire for each tick",
		effGot: () => "All Infinity-related autobuyers now fire for each tick"
	},
	21: {
		req: 25,
		forceGot: () => hasAch("ng3p25"),
		forceDisable: () => QCs.in(3) && !hasAch("ng3p25"),
		eff: () => "Every second, you gain Tachyon Particles, if you dilate",
		effGot: () => "Every second, you now gain Tachyon Particles, if you dilate."
	},
	22: {
		req: 35,
		eff: () => "Gain banked infinities based on your post-crunch infinitied stat",
		effGot: () => "Gain banked infinities based on your post-crunch infinitied stat."
	},
	23: {
		req: 40,
		eff: () => "Unlock QoL features for quark assortion, like automation and respec.",
		effGot: () => "You have unlocked QoL features for quark assortion!"
	},
	24: {
		req: 50,
		eff: () => "Able to max Meta-Dimension Boosts",
		effGot: () => "You now can max Meta-Dimension Boosts."
	},
	25: {
		req: 60,
		eff: () => "Meta Dimension autobuyer is unlimited",
		effGot: () => "Meta Dimension autobuyer is now unlimited."
	},
	26: {
		req: 70,
		eff: () => "You can disable swaps in any Quantum Challenge",
		effGot: () => "You now can disable swaps in any Quantum Challenge."
	},
	27: {
		req: 130,
		best: true,
		eff: () => "Keep Quantum Challenges and Entangled Boosts.",
		effGot: () => "You now keep Quantum Challenges and Entangled Boosts."
	},
	28: {
		req: 140,
		best: true,
		eff: () => "Keep Paired Challenges and Positrons.",
		effGot: () => "You now keep Paired Challenges and Positrons."
	},
	29: {
		req: 150,
		best: true,
		eff: () => "Keep your Vibration Energy.",
		effGot: () => "You now keep your Vibration Energy."
	},
}